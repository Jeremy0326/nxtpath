#!/usr/bin/env python3
"""
Test if LLM is being used for actual job matching
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from jobs.models import Job, CV
from jobs.services.ai_job_matching.job_matcher import JobMatcher
from jobs.services.ai_job_matching.cv_parser import CVData

def test_llm_matching():
    print("=== Testing LLM Job Matching ===")
    
    # Get a job
    job = Job.objects.filter(title="Senior Full Stack Developer").first()
    print(f"Job: {job.title}")
    
    # Create test CV data
    cv_data = CVData(
        name="Jeremy Lau Yi Quan",
        email="jeremy@example.com",
        skills=["Python", "JavaScript", "React", "Django", "SQL", "Git", "HTML", "CSS"],
        experience=[],
        education=[],
        projects=[]
    )
    
    matcher = JobMatcher()
    print(f"LLM available: {bool(matcher.llm)}")
    
    # Test job requirements extraction
    job_reqs = matcher._extract_job_requirements(
        job.description, 
        job.requirements or "", 
        job.responsibilities or ""
    )
    
    print(f"\nJob Requirements Extracted:")
    print(f"Required skills: {job_reqs.get('required_skills', [])}")
    print(f"Preferred skills: {job_reqs.get('preferred_skills', [])}")
    
    # Check if requirements are meaningful
    has_meaningful_requirements = (
        job_reqs and (
            job_reqs.get("required_skills") or 
            job_reqs.get("preferred_skills") or 
            job_reqs.get("key_responsibilities")
        )
    )
    
    print(f"Has meaningful requirements: {has_meaningful_requirements}")
    
    if has_meaningful_requirements:
        print("\n🟢 Should use LLM for matching...")
        
        # Test the LLM matching prompt directly
        prompt = f"""
        You are a Senior Technical Recruiter with expertise in talent assessment. Conduct a comprehensive analysis of this candidate's fit for the role.

        **CANDIDATE PROFILE:**
        Name: {cv_data.name}
        Skills: {', '.join(cv_data.skills)}
        
        **Experience:**
        No work experience listed
        
        **Education:**
        No education information provided
        
        **Projects:**
        No projects listed

        **JOB REQUIREMENTS:**
        {job_reqs}
        
        **FULL JOB CONTENT:**
        Description: {job.description[:200]}...
        Requirements: {job.requirements[:200] if job.requirements else 'None'}...
        Responsibilities: {job.responsibilities[:200] if job.responsibilities else 'None'}...
        
        **ANALYSIS INSTRUCTIONS:**
        Provide a thorough analysis that considers:
        1. Technical skill alignment and transferable skills
        2. Experience relevance and growth trajectory  
        3. Educational background fit
        4. Project experience applicability
        5. Potential for success and growth in this role
        6. Specific areas for improvement with actionable advice
        
        Be specific and reference actual details from the candidate's background. Provide insights that would be valuable for both the candidate and hiring managers.
        
        Return analysis in this JSON format:
        {{
            "match_score": <integer 0-100>,
            "match_reasons": ["reason1", "reason2", "reason3"],
            "missing_skills": ["skill1", "skill2"],
            "highlighted_skills": ["skill3", "skill4"],
            "experience_match": {{
                "score": "<X/100>",
                "notes": "<detailed assessment>"
            }},
            "education_match": {{
                "score": "<X/100>",
                "notes": "<assessment of education fit>"
            }},
            "improvement_suggestions": ["suggestion1", "suggestion2"],
            "detailed_report": "<comprehensive markdown analysis with specific examples>"
        }}
        """
        
        try:
            print("\n🤖 Testing LLM matching directly...")
            from jobs.services.ai_job_matching.job_matcher import MatchResult
            match_data = matcher._get_json_output_with_retry(prompt, MatchResult)
            print(f"✅ LLM matching successful!")
            print(f"   Match score: {match_data.get('match_score')}%")
            print(f"   Match reasons: {len(match_data.get('match_reasons', []))}")
            print(f"   Highlighted skills: {match_data.get('highlighted_skills', [])}")
            print(f"   Missing skills: {match_data.get('missing_skills', [])}")
            
        except Exception as e:
            print(f"❌ LLM matching failed: {e}")
            print("This explains why it's using fallback algorithm")
            
    else:
        print("\n🔴 No meaningful requirements - would use fallback")
    
    # Now test the full matching process
    print(f"\n=== Testing Full Matching Process ===")
    result = matcher.match_cv_to_job(
        cv_data,
        job.description,
        job.requirements or "",
        job.responsibilities or "",
        job
    )
    
    print(f"Final match score: {result.match_score}%")
    print(f"Final match reasons: {result.match_reasons}")
    
    # Check if this seems like LLM output or fallback
    if "Fallback" in result.detailed_report:
        print("🔴 Used fallback algorithm - LLM matching not working")
    else:
        print("🟢 Appears to be using LLM analysis")

if __name__ == "__main__":
    test_llm_matching() 