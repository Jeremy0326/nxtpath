#!/usr/bin/env python3
"""
Debug LLM calls to understand why job requirements extraction is failing
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from jobs.models import Job
from jobs.services.ai_job_matching.job_matcher import JobMatcher, JobRequirements
import google.generativeai as genai
from backend_django.settings import GEMINI_API_KEY

def debug_llm_calls():
    print("=== Debugging LLM Calls ===")
    
    # Get a job description
    job = Job.objects.first()
    if not job:
        print("❌ No jobs found")
        return
    
    job_description = job.description
    print(f"Job: {job.title}")
    print(f"Description length: {len(job_description)}")
    print(f"Description preview: {job_description[:200]}...")
    
    # Test direct Gemini call
    print(f"\n=== Testing Direct Gemini Call ===")
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        
        model = genai.GenerativeModel(
            "gemini-2.0-flash-lite",
            generation_config={"response_mime_type": "application/json"},
            system_instruction="You are an expert in parsing job descriptions. Extract requirements into JSON format."
        )
        
        simple_prompt = f"""
Extract the key requirements from this job description into JSON format:

{{
  "required_skills": ["skill1", "skill2"],
  "preferred_skills": ["skill3", "skill4"],
  "required_experience_years": 3,
  "required_education_level": "Bachelor's",
  "key_responsibilities": ["responsibility1", "responsibility2"]
}}

Job Description:
{job_description}
"""
        
        print("Making direct Gemini call...")
        response = model.generate_content(simple_prompt)
        print(f"Response status: Success")
        print(f"Response text: {response.text[:500]}...")
        
        # Try to parse JSON
        import json
        try:
            parsed = json.loads(response.text)
            print(f"✅ JSON parsing successful!")
            print(f"Required skills: {parsed.get('required_skills', [])}")
            print(f"Preferred skills: {parsed.get('preferred_skills', [])}")
            print(f"Experience years: {parsed.get('required_experience_years')}")
            print(f"Education level: {parsed.get('required_education_level')}")
            print(f"Responsibilities: {len(parsed.get('key_responsibilities', []))}")
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing failed: {e}")
            
    except Exception as e:
        print(f"❌ Direct Gemini call failed: {e}")
        import traceback
        traceback.print_exc()
    
    # Test JobMatcher class
    print(f"\n=== Testing JobMatcher Class ===")
    try:
        matcher = JobMatcher()
        print(f"JobMatcher initialized: {bool(matcher.llm)}")
        
        job_requirements = matcher._extract_job_requirements(job_description)
        print(f"Job requirements result: {job_requirements}")
        print(f"Type: {type(job_requirements)}")
        
        if job_requirements:
            print(f"✅ Job requirements extraction worked!")
            for key, value in job_requirements.items():
                print(f"  {key}: {value}")
        else:
            print(f"❌ Job requirements extraction returned empty")
            
    except Exception as e:
        print(f"❌ JobMatcher test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_llm_calls() 