#!/usr/bin/env python3
"""
Debug script for job matcher
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from jobs.services.ai_job_matching.job_matcher import JobMatcher
from jobs.services.ai_job_matching.cv_parser import CVData

def debug_job_matcher():
    print("=== Job Matcher Debug ===")
    
    # Test job matcher initialization
    try:
        matcher = JobMatcher()
        print(f"✅ JobMatcher created")
        print(f"Model name: {matcher.model_name}")
        print(f"Has LLM: {bool(matcher.llm)}")
        print(f"Rate limiter: {matcher.rate_limiter}")
        
        # Check API key
        from backend_django.settings import GEMINI_API_KEY
        print(f"API key available: {bool(GEMINI_API_KEY)}")
        if GEMINI_API_KEY:
            print(f"API key length: {len(GEMINI_API_KEY)}")
        
    except Exception as e:
        print(f"❌ Error creating JobMatcher: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Create test CV data
    test_cv = CVData(
        name="John Doe",
        email="john@example.com",
        skills=["Python", "JavaScript", "React", "Django"],
        experience=[],
        education=[]
    )
    
    test_job_description = """
    We are looking for a Full Stack Developer with experience in Python and JavaScript.
    Requirements:
    - 3+ years experience with Python
    - Experience with React framework
    - Knowledge of Django is a plus
    """
    
    print(f"\n=== Testing Job Matching ===")
    print(f"Test CV: {test_cv.name}, {len(test_cv.skills)} skills")
    print(f"Job description length: {len(test_job_description)}")
    
    try:
        # Test job requirements extraction
        print("\n--- Testing Job Requirements Extraction ---")
        job_requirements = matcher._extract_job_requirements(test_job_description)
        print(f"Job requirements result: {job_requirements}")
        
        # Test full matching
        print("\n--- Testing Full Job Matching ---")
        match_result = matcher.match_cv_to_job(test_cv, test_job_description)
        
        print(f"Match result type: {type(match_result)}")
        print(f"Match score: {match_result.match_score}")
        print(f"Match reasons: {match_result.match_reasons}")
        print(f"Missing skills: {match_result.missing_skills}")
        print(f"Highlighted skills: {match_result.highlighted_skills}")
        print(f"Detailed report length: {len(match_result.detailed_report)}")
        print(f"Detailed report: {match_result.detailed_report[:200]}...")
        
    except Exception as e:
        print(f"❌ Error in job matching: {e}")
        import traceback
        traceback.print_exc()
        
        # Test fallback specifically
        print("\n--- Testing Fallback Matching ---")
        try:
            fallback_result = matcher._match_using_fallback(test_cv, test_job_description, {})
            print(f"Fallback result type: {type(fallback_result)}")
            print(f"Fallback score: {fallback_result.match_score}")
            print(f"Fallback reasons: {fallback_result.match_reasons}")
            print(f"Fallback report: {fallback_result.detailed_report}")
        except Exception as e2:
            print(f"❌ Error in fallback: {e2}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    debug_job_matcher() 