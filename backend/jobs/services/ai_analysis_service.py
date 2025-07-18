import json
import logging
from typing import Dict, Any, Optional
from django.conf import settings
from ..models import AIAnalysisReport, Resume, Job
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

class AIAnalysisService:
    def __init__(self):
        self.model = model

    def get_or_create_analysis(self, resume: Resume, job: Job) -> AIAnalysisReport:
        """Get existing dual-audience analysis or create a new one."""
        existing_report = AIAnalysisReport.objects.filter(
            resume=resume, 
            job=job
        ).first()
        if existing_report and not existing_report.is_stale:
            return existing_report
        return self._create_analysis(resume, job)

    def _create_analysis(self, resume: Resume, job: Job) -> AIAnalysisReport:
        """Create a new AI analysis report, using employer weights if available."""
        try:
            student_profile = resume.student_profile
            career_preferences = student_profile.career_preferences or {}
            preferred_industries = career_preferences.get('industries', [])
            preferred_locations = career_preferences.get('locations', [])
            preferred_work_types = career_preferences.get('work_types', [])
            preferred_roles = career_preferences.get('preferred_roles', [])
            
            # Fetch employer weights from job if available
            employer_weights = None
            if hasattr(job, 'matching_weights') and job.matching_weights:
                raw_weights = {
                    'skills': float(job.matching_weights.get('skills', 0.4)),
                    'experience': float(job.matching_weights.get('experience', 0.3)),
                    'culture_fit': float(job.matching_weights.get('culture_fit', 0.15)),
                    'growth_potential': float(job.matching_weights.get('growth_potential', 0.1)),
                }
                total = sum(raw_weights.values())
                if total > 0:
                    employer_weights = {k: v / total for k, v in raw_weights.items()}
                else:
                    employer_weights = {'skills': 0.45, 'experience': 0.25, 'culture_fit': 0.15, 'growth_potential': 0.1}
            else:
                employer_weights = {'skills': 0.45, 'experience': 0.25, 'culture_fit': 0.15, 'growth_potential': 0.1}
            
            # Build the prompt with all context
            prompt = self._build_dual_analysis_prompt(
                resume_text=resume.parsed_text,
                job_data=job,
                career_preferences={
                    'industries': preferred_industries,
                    'locations': preferred_locations,
                    'work_types': preferred_work_types,
                    'preferred_roles': preferred_roles
                },
                employer_weights=employer_weights
            )
            
            response = self.model.generate_content(prompt)
            analysis_data = self._parse_llm_response(response.text)
            
            # Calculate overall score using employer weights from shared data
            overall_score = self._calculate_overall_score(analysis_data['shared'], employer_weights)
            analysis_data['shared']['overall_score'] = overall_score
            
            # Add metadata fields for frontend
            analysis_data['audience'] = 'dual'  # Indicates this report works for both audiences
            analysis_data['employer_weightage'] = employer_weights
            
            # Create or update the report
            report, created = AIAnalysisReport.objects.update_or_create(
                resume=resume,
                job=job,
                defaults={
                    'overall_score': overall_score,
                    'report_data': analysis_data,
                    'report_version': '4.0',
                    'model_name': 'gemini-2.5-flash',
                    'is_stale': False
                }
            )
            return report
        except Exception as e:
            logger.error(f"Error creating AI analysis: {e}")
            raise

    def _build_dual_analysis_prompt(self, resume_text: str, job_data: Job, career_preferences: Dict[str, Any], employer_weights: Optional[Dict[str, float]] = None) -> str:
        """Build the prompt for the LLM analysis, with new matrix and enhanced insight fields. Explicitly require no empty objects/arrays."""
        # Format career preferences for the prompt
        pref_industries = ', '.join(career_preferences.get('industries', [])) or 'None specified'
        pref_locations = ', '.join(career_preferences.get('locations', [])) or 'None specified'
        pref_work_types = ', '.join(career_preferences.get('work_types', [])) or 'None specified'
        pref_roles = ', '.join(career_preferences.get('preferred_roles', [])) or 'None specified'

        prompt = f"""
You are an expert AI job matching analyst. Analyze the resume and job description, and generate a single JSON report for both a STUDENT (candidate) and EMPLOYER (recruiter/hiring manager) view.

- The "shared" section contains all the axis-level scores and breakdowns (skills_score, experience_score, etc.) and is IDENTICAL for both audiences.
- The "student_view" section gives tailored feedback for the candidate, including:
    - career_insights (strengths, gaps, opportunities, warnings),
    - personalized_recommendations (actionable, practical steps),
    - encouragement (1-2 lines of positive summary or motivation),
    - next_career_goal (best-fit role the candidate should target next).
- The "employer_view" section gives tailored feedback for the employer, including:
    - risk_flags (hard filters, must-have gaps),
    - opportunity_flags (unique strengths, diversity signals, etc.),
    - recruiter_recommendations (practical suggestions: ai interview, reject, screen, etc.),
    - fit_summary (2-3 line high-level evaluation of the candidate's suitability),
    - follow_up_questions (3-5 specific questions an interviewer should ask to clarify the candidate’s fit, based on gaps, ambiguities, or strengths).

Never leave any field as an empty object or array—if no data, provide a summary or explanation.
Order all fields as shown.


RESUME TEXT:
{resume_text}

JOB DETAILS:
Title: {job_data.title}
Company: {job_data.company.name}
Industry: {job_data.company.industry or 'Not specified'}
Location: {job_data.location or 'Not specified'}
Job Type: {job_data.get_job_type_display()}
Remote Option: {job_data.get_remote_option_display()}
Salary Range: {job_data.salary_min or 'Not specified'} - {job_data.salary_max or 'Not specified'}
Description: {job_data.description}
Requirements: {', '.join(job_data.requirements) if job_data.requirements else 'Not specified'}
Responsibilities: {', '.join(job_data.responsibilities) if job_data.responsibilities else 'Not specified'}

CANDIDATE CAREER PREFERENCES:
Preferred Industries: {pref_industries}
Preferred Locations: {pref_locations}
Preferred Work Types: {pref_work_types}
Preferred Roles: {pref_roles}

Please provide a comprehensive analysis in the following JSON format:

{{
  "shared": {{
    "skills_score": <0-100>,
    "experience_score": <0-100>,
    "culture_fit_score": <0-100>,
    "growth_potential_score": <0-100>,
    "preferences_bonus": <0-5>,
    "overall_score": <0-100>,
    "skills_analysis": {{
      "matching_skills": ["skill1", "skill2"],
      "missing_skills": ["skill3", "skill4"],
      "summary": "Summary of skills match and gaps"
    }},
    "experience_analysis": {{
      "relevant_experience": ["exp1", "exp2"],
      "experience_gaps": ["gap1", "gap2"],
      "summary": "Summary of experience alignment"
    }},
    "culture_fit_analysis": {{
      "summary": "Summary of culture/team fit",
      "teamwork": <0-100>,
      "values_alignment": <0-100>,
      "communication": <0-100>
    }},
    "growth_potential_analysis": {{
      "summary": "Summary of growth potential",
      "learning_agility": <0-100>,
      "upskilling_history": <0-100>,
      "motivation": <0-100>
    }},
    "preferences_analysis": [
      {{
        "title": "Preference insight title",
        "description": "How this job aligns with career preferences",
        "impact": "high|medium|low",
        "match_level": "excellent|good|moderate|poor",
        "preference_type": "industry|location|work_type|role"
      }}
    ]
  }},
  "student_view": {{
    "career_insights": [
      {{
        "type": "strength|improvement|opportunity|warning|gap",
        "title": "Insight title",
        "description": "Detailed description",
        "impact": "high|medium|low"
      }}
    ],
    "personalized_recommendations": [
      {{
        "category": "skill_development|experience|networking|application",
        "title": "Recommendation title",
        "description": "Detailed recommendation",
        "priority": "high|medium|low"
      }}
    ],
    "encouragement": "Positive encouragement statement for the candidate",
    "next_career_goal": "Best-fit role suggestion (e.g., Junior Full-Stack Developer)"
  }},
  "employer_view": {{
    "risk_flags": [
      {{
        "type": "hard_filter|potential_risk|soft_risk",
        "title": "Risk title",
        "description": "Description of risk or disqualifier",
        "impact": "high|medium|low"
      }}
    ],
    "opportunity_flags": [
      {{
        "type": "unique_strength|growth_potential|diversity",
        "title": "Opportunity title",
        "description": "Description of unique value or potential",
        "impact": "high|medium|low"
      }}
    ],
    "recruiter_recommendations": [
      {{
        "title": "Recommendation title",
        "description": "Practical step for recruiter (e.g., 'Invite for phone screen after AI Interview')"
      }}
    ],
    "fit_summary": "2-3 sentence overview of the candidate's suitability for the role",
    "follow_up_questions": [
      "Ask about project X",
      "Clarify Django experience",
      "Other suggested question"
    ]
  }}
}}

Guidelines:
- All main axis scores must be integers 0-100.
- Never leave any field empty. If no content, provide a summary or placeholder.
- Use supportive and concise language for each audience.
- Only put scoring and factual axis breakdowns in 'shared'.
- Only put audience-specific feedback in the respective view.
- Return only the JSON object, no additional commentary.
        """
        return prompt

    def _parse_llm_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the LLM response and ensure it's valid JSON."""
        try:
            cleaned_text = response_text.strip()
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]
            data = json.loads(cleaned_text)
            return self._normalize_analysis_data(data)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Response text: {response_text}")
            return self._get_default_analysis_data()
        except Exception as e:
            logger.error(f"Error parsing LLM response: {e}")
            return self._get_default_analysis_data()

    def _normalize_analysis_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize and ensure all axis analyses and audience views are filled with at least a summary/placeholder."""
        # Defaults in case LLM returns missing fields
        def section_with_summary(section, default_summary):
            if not section or section == {} or section == []:
                return {"summary": default_summary}
            return section

        d = data.copy()
        
        # Ensure shared fields exist and validate scores
        shared = d.get('shared', {})
        for score_field in ['skills_score', 'experience_score', 'culture_fit_score', 'growth_potential_score', 'overall_score']:
            try:
                shared[score_field] = max(0, min(100, int(float(shared.get(score_field, 0)))))
            except (ValueError, TypeError):
                shared[score_field] = 0
        
        # Ensure preferences_bonus is valid
        try:
            shared['preferences_bonus'] = max(0, min(5, int(float(shared.get('preferences_bonus', 0)))))
        except (ValueError, TypeError):
            shared['preferences_bonus'] = 0
        
        # Ensure all axis analyses have summary fields
        shared['skills_analysis'] = section_with_summary(shared.get('skills_analysis'), 'No skills analysis provided.')
        shared['experience_analysis'] = section_with_summary(shared.get('experience_analysis'), 'No experience analysis provided.')
        shared['culture_fit_analysis'] = section_with_summary(shared.get('culture_fit_analysis'), 'No culture/team fit analysis provided.')
        shared['growth_potential_analysis'] = section_with_summary(shared.get('growth_potential_analysis'), 'No growth potential analysis provided.')
        shared['preferences_analysis'] = shared.get('preferences_analysis', [{
            "title": "No preferences analysis provided.",
            "impact": "low",
            "description": "",
            "match_level": "poor",
            "preference_type": "industry"
        }])

        # Student view with new fields
        student_view = d.get('student_view', {})
        if not student_view.get('career_insights'):
            student_view['career_insights'] = []
        if not student_view.get('personalized_recommendations'):
            student_view['personalized_recommendations'] = []
        if not student_view.get('encouragement'):
            student_view['encouragement'] = "No encouragement provided."
        if not student_view.get('next_career_goal'):
            student_view['next_career_goal'] = "No career goal suggested."

        # Employer view with new fields
        employer_view = d.get('employer_view', {})
        if not employer_view.get('risk_flags'):
            employer_view['risk_flags'] = []
        if not employer_view.get('opportunity_flags'):
            employer_view['opportunity_flags'] = []
        if not employer_view.get('recruiter_recommendations'):
            employer_view['recruiter_recommendations'] = []
        if not employer_view.get('fit_summary'):
            employer_view['fit_summary'] = "No fit summary provided."
        if not employer_view.get('follow_up_questions'):
            employer_view['follow_up_questions'] = []

        # Order output
        return {
            "shared": shared,
            "student_view": student_view,
            "employer_view": employer_view
        }

    def _get_default_analysis_data(self) -> Dict[str, Any]:
        """Get default analysis data structure for error fallback."""
        return {
            "shared": {
            "skills_score": 0,
            "experience_score": 0,
                "culture_fit_score": 0,
                "growth_potential_score": 0,
                "preferences_bonus": 0,
                "overall_score": 0,
                "skills_analysis": {"summary": "No skills analysis provided."},
                "experience_analysis": {"summary": "No experience analysis provided."},
                "culture_fit_analysis": {"summary": "No culture/team fit analysis provided."},
                "growth_potential_analysis": {"summary": "No growth potential analysis provided."},
                "preferences_analysis": [{
                    "title": "No preferences analysis provided.",
                    "impact": "low",
                    "description": "",
                    "match_level": "poor",
                    "preference_type": "industry"
                }]
            },
            "student_view": {
            "career_insights": [],
            "personalized_recommendations": [],
                "encouragement": "No encouragement provided.",
                "next_career_goal": "No career goal suggested."
            },
            "employer_view": {
                "risk_flags": [],
                "opportunity_flags": [],
                "recruiter_recommendations": [],
                "fit_summary": "No fit summary provided.",
                "follow_up_questions": []
            }
        }

    def _calculate_overall_score(self, shared_data: Dict[str, Any], weights: Optional[Dict[str, float]] = None) -> int:
        """Calculate overall score from individual scores and preferences bonus."""
        weights = weights or {'skills': 0.45, 'experience': 0.25, 'culture_fit': 0.15, 'growth_potential': 0.1}
        try:
            skills_score = max(0, min(100, int(float(shared_data.get('skills_score', 0)))))
            experience_score = max(0, min(100, int(float(shared_data.get('experience_score', 0)))))
            culture_fit_score = max(0, min(100, int(float(shared_data.get('culture_fit_score', 0)))))
            growth_potential_score = max(0, min(100, int(float(shared_data.get('growth_potential_score', 0)))))
            preferences_bonus = int(shared_data.get('preferences_bonus', 0))
            overall = (
                skills_score * weights.get('skills', 0.45) +
                experience_score * weights.get('experience', 0.25) +
                culture_fit_score * weights.get('culture_fit', 0.15) +
                growth_potential_score * weights.get('growth_potential', 0.1)
            ) + preferences_bonus
            return int(round(min(100, max(0, overall))))
        except Exception as e:
            logger.error(f"Error calculating overall score: {e}")
            return 0

# Global instance
ai_analysis_service = AIAnalysisService() 
