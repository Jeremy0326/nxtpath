import logging
from typing import List, Dict, Any
from jobs.models import Job, Resume, AIInterview, Application
from django.utils import timezone
from django.conf import settings
import google.generativeai as genai
import json
from django.shortcuts import get_object_or_404
from .ai_analysis_service import AIAnalysisReport
from jobs.models import AIInterviewReport, AIInterview

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GEMINI_API_KEY)
llm_model = genai.GenerativeModel('gemini-2.5-flash')

class InterviewService:
    def start_interview(self, application: Application) -> AIInterview:
        """
        Starts an AI interview by generating the first question.
        """
        # Generate only the first question to start
        first_question = self._generate_initial_question(application.job, application.resume)
        
        interview, created = AIInterview.objects.update_or_create(
            application=application,
            defaults={
                'status': AIInterview.Status.IN_PROGRESS,
                'questions': [first_question],
                'answers': [],
                'started_at': timezone.now(),
                'completed_at': None,
            }
        )
        logger.info(f"Started AI Interview {interview.id} for application {application.id}")
        return interview

    def submit_answer_and_get_next_question(self, interview: AIInterview, answer: Dict[str, Any]) -> AIInterview:
        """
        Appends the current answer and generates the next dynamic question.
        Now always generates exactly 3 questions, one by one, for a conversational interview.
        """
        # 1. Save the current answer
        answers = interview.answers or []
        answers.append(answer)
        interview.answers = answers

        # 2. Check if the interview should end (after 3 questions)
        if len(interview.questions) >= 3:
            interview.status = AIInterview.Status.COMPLETED
            interview.completed_at = timezone.now()
            interview.save()
            logger.info(f"AI Interview {interview.id} completed after 3 questions.")
            # --- Enhancement: Automatically generate AIInterviewReport ---
            try:
                from .ai_interview_service import AIInterviewService
                ai_interview_service = AIInterviewService()
                ai_interview_service.generate_final_report(interview.id)
            except Exception as e:
                logger.error(f"Failed to auto-generate AIInterviewReport for interview {interview.id}: {e}")
            return interview

        # 3. Generate the next question based on the conversation history
        previous_qa = [{'question': q, 'answer': a} for q, a in zip(interview.questions, interview.answers)]
        next_question = self._generate_followup_question(interview.application.job, interview.application.resume, previous_qa)
        
        # 4. Add the new question to the list
        questions = interview.questions or []
        questions.append(next_question)
        interview.questions = questions
        
        interview.save()
        logger.info(f"Submitted answer and generated next question for AI Interview {interview.id}")
        return interview

    def _generate_initial_question(self, job: Job, resume: Resume) -> Dict[str, Any]:
        """Generates the first, high-impact question for the interview."""
        prompt = f"""
As an expert technical interviewer, generate a single, compelling opening question for an AI interview.
This question should be based on the provided job and resume, designed to immediately assess a key qualification.
Do not ask "Tell me about yourself". Instead, ask a specific question about a core requirement or a significant project on their resume.
Return a JSON object with "question_text" and "type" (e.g., 'deep-dive', 'technical').

JOB: {job.title} - {job.description}
RESUME: {resume.parsed_text or 'No resume text.'}

JSON Output:
"""
        try:
            response = llm_model.generate_content(prompt)
            question = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
            if 'question_text' not in question or 'type' not in question:
                raise ValueError("Initial question must have 'question_text' and 'type'.")
            return question
        except Exception as e:
            logger.error(f"Failed to generate initial question: {e}")
            return {"type": "deep-dive", "question_text": f"Based on your resume, walk me through your experience with a key technology required for the {job.title} role."}

    def _generate_followup_question(self, job: Job, resume: Resume, previous_qa: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generates an adaptive follow-up question."""
        qa_str = "\n".join([f"Q: {qa['question']['question_text']}\nA: {qa['answer']['text']}" for qa in previous_qa])
        prompt = f"""
You are an expert technical interviewer continuing a conversation. Based on the job, resume, and previous Q&A, generate the next logical and insightful question.
- The question should probe deeper into the candidate's last answer or explore a related area of the job's requirements.
- Do not repeat previous questions.
- Keep the conversation focused on assessing the candidate's fit for this specific role.
- Total interview length should be around 3 questions. This is question number {len(previous_qa) + 1}.

JOB: {job.title}
RESUME: CV highlights provided.
CONVERSATION HISTORY:
{qa_str}

Return a single JSON object with "question_text" and "type".

JSON Output:
        """
        try:
            response = llm_model.generate_content(prompt)
            question = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
            if 'question_text' not in question or 'type' not in question:
                raise ValueError("Follow-up question must have 'question_text' and 'type'.")
            return question
        except Exception as e:
            logger.error(f"Failed to generate follow-up question: {e}")
            return {"type": "deep-dive", "question_text": "Can you provide a specific example of how you've applied that skill in a professional project?"}
    
    def generate_final_report(self, application: Application) -> 'AIInterviewReport':
        from .ai_analysis_service import ai_analysis_service # Local import to avoid circular dependency
        """
        Generates and saves the final employer-facing interview report for a completed interview.
        """
        interview = get_object_or_404(AIInterview, application=application)
        if interview.status != AIInterview.Status.COMPLETED:
            raise ValueError("Interview must be completed to generate a report.")

        # Generate employer-facing report (idempotent)
        report = ai_analysis_service.generate_interview_report(interview)

        # Mark interview as report_generated (add this field if not present)
        if not hasattr(interview, 'report_generated') or not interview.report_generated:
            interview.report_generated = True
            interview.save(update_fields=['report_generated'])

        # Update application status to INTERVIEWED if not already
        if application.status != Application.Status.INTERVIEWED:
            application.status = Application.Status.INTERVIEWED
            application.save(update_fields=['status'])

        return report


interview_service = InterviewService() 

class AIInterviewService:
    def __init__(self):
        self.model = llm_model # Use the existing llm_model

    def generate_final_report(self, interview_id):
        interview = get_object_or_404(AIInterview, id=interview_id)
        if interview.status != AIInterview.Status.COMPLETED:
            raise ValueError("Interview must be completed to generate a report.")
        # Idempotency: check if report exists
        existing = AIInterviewReport.objects.filter(interview=interview).order_by('-created_at').first()
        if existing:
            return existing
        application = interview.application
        resume = application.resume
        job = application.job
        ai_match_report = AIAnalysisReport.objects.filter(resume=resume, job=job).order_by('-created_at').first()
        ai_match_data = ai_match_report.report_data if ai_match_report else {}
        resume_text = getattr(resume, 'parsed_text', '')
        job_description = job.description
        job_title = job.title
        job_requirements = job.requirements
        job_responsibilities = job.responsibilities
        job_company = job.company.name
        job_industry = getattr(job.company, 'industry', '')
        job_location = job.location
        interview_questions = interview.questions
        interview_answers = interview.answers
        interview_qa = [
            {'question': q.get('question_text', q) if isinstance(q, dict) else q, 'answer': a.get('text', a) if isinstance(a, dict) else a}
            for q, a in zip(interview_questions, interview_answers)
        ]
        prompt = f'''
You are an expert technical interviewer and AI hiring assistant. Generate a comprehensive, actionable employer-facing interview report for the following candidate and job application.
Context:
- Job Title: {job_title}
- Company: {job_company}
- Industry: {job_industry}
- Location: {job_location}
- Job Description: {job_description}
- Requirements: {job_requirements}
- Responsibilities: {job_responsibilities}
- Candidate Resume (parsed): {resume_text}
- AI Matching Report: {json.dumps(ai_match_data)}
- Interview Q&A:
{json.dumps(interview_qa, indent=2)}
Instructions:
- Analyze the candidate's strengths and weaknesses based on the interview and AI matching data.
- Assess fit against the job description and requirements.
- Provide AI-derived confidence scores for key skills and culture fit.
- Summarize the candidate's communication, problem-solving, and technical depth as demonstrated in the interview.
- Suggest next steps: Offer, Reject, or Further Interview, with rationale.
- Output a single JSON object with the following fields:
  - summary: string
  - strengths: list of strings
  - weaknesses: list of strings
  - fit_score: integer (0-100)
  - culture_fit_score: integer (0-100)
  - communication_score: integer (0-100)
  - technical_depth_score: integer (0-100)
  - suggested_next_step: string (Offer/Reject/Further Interview)
  - rationale: string
  - follow_up_questions: list of strings
  - version: string (e.g. '1.0')
- Never leave any field empty. If no data, provide a summary or explanation.
- Return only the JSON object, no commentary.
'''
        response = self.model.generate_content(prompt)
        try:
            report_data = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
        except Exception as e:
            logger.error(f"Failed to parse interview report LLM response: {e}")
            report_data = {"summary": "Error generating report.", "strengths": [], "weaknesses": [], "fit_score": 0, "culture_fit_score": 0, "communication_score": 0, "technical_depth_score": 0, "suggested_next_step": "Further Interview", "rationale": "LLM error.", "follow_up_questions": [], "version": "1.0"}
        report = AIInterviewReport.objects.create(
            interview=interview,
            report_data=report_data,
            created_at=timezone.now(),
            report_version=report_data.get('version', '1.0'),
            model_name='gemini-2.5-flash',
            overall_score=report_data.get('fit_score', 0)
        )
        interview.report_generated = True
        interview.save(update_fields=['report_generated'])
        
        # Update application status to INTERVIEWED
        application = interview.application
        if application.status != Application.Status.INTERVIEWED:
            application.status = Application.Status.INTERVIEWED
            application.save(update_fields=['status'])
        
        return report

ai_interview_service = AIInterviewService() 