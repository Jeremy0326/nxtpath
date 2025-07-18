#!/usr/bin/env python3
"""
Test the enhanced AI job matching system with detailed job descriptions
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from jobs.models import Job, CV
from jobs.services.ai_job_matching.job_matcher import JobMatcher
from jobs.services.ai_job_matching.cv_parser import CVParser, CVData

def test_enhanced_ai():
    print("=== Enhanced AI Job Matching Test ===")
    
    # Get a detailed job
    job = Job.objects.filter(title="Machine Learning Engineer").first()
    if not job:
        print("❌ No Machine Learning Engineer job found")
        return
    
    print(f"Testing with job: {job.title}")
    print(f"Description length: {len(job.description)} chars")
    print(f"Requirements length: {len(job.requirements or '')} chars")
    print(f"Responsibilities length: {len(job.responsibilities or '')} chars")
    
    # Get user's CV (use the working CV from previous tests)
    cv = CV.objects.get(id="f0b66768-71b6-4d6f-be52-34a8b2eafc77")
    print(f"Testing with CV: {cv.original_filename}")
    
    # Test with cached data first
    if cv.is_parsed and cv.parsed_data:
        print("Using cached CV data...")
        cv_data = CVData(**cv.parsed_data)
    else:
        # Parse CV if needed
        parser = CVParser()
        cv_data = parser.parse_cv_from_file(cv.file.path)
    
    print(f"\nCV Summary:")
    print(f"Name: {cv_data.name}")
    print(f"Skills: {len(cv_data.skills)} ({cv_data.skills[:5]}...)")
    print(f"Experience: {len(cv_data.experience)}")
    print(f"Education: {len(cv_data.education)}")
    
    # Test enhanced job matcher
    matcher = JobMatcher()
    
    print(f"\n=== Running Enhanced AI Analysis ===")
    print(f"LLM Available: {bool(matcher.llm)}")
    
    try:
        # Test job requirements extraction first
        print(f"\n=== Testing Job Requirements Extraction ===")
        job_reqs = matcher._extract_job_requirements(job.description, job.requirements or "", job.responsibilities or "")
        print(f"Required Skills: {job_reqs.get('required_skills', [])[:5]}")
        print(f"Preferred Skills: {job_reqs.get('preferred_skills', [])[:5]}")
        print(f"Experience Years: {job_reqs.get('required_experience_years')}")
        print(f"Education Level: {job_reqs.get('required_education_level')}")
        print(f"Key Responsibilities: {len(job_reqs.get('key_responsibilities', []))}")
        
        has_meaningful_requirements = (
            job_reqs and (
                job_reqs.get("required_skills") or 
                job_reqs.get("preferred_skills") or 
                job_reqs.get("key_responsibilities")
            )
        )
        
        if has_meaningful_requirements:
            print("✅ LLM job requirements extraction is working!")
        else:
            print("⚠️ LLM extraction returned empty - will use fallback")
        
        # Run the match
        print(f"\n=== Running Job Match Analysis ===")
        match_result = matcher.match_cv_to_job(
            cv_data, 
            job.description, 
            job.requirements or "",
            job.responsibilities or "",
            job
        )
        
        print(f"\n✅ AI Analysis Completed!")
        print(f"Match Score: {match_result.match_score}%")
        print(f"Match Reasons: {len(match_result.match_reasons)}")
        for i, reason in enumerate(match_result.match_reasons[:3], 1):
            print(f"  {i}. {reason}")
        
        print(f"\nHighlighted Skills: {match_result.highlighted_skills[:5]}")
        print(f"Missing Skills: {match_result.missing_skills[:5]}")
        
        print(f"\nExperience Match: {match_result.experience_match}")
        print(f"Education Match: {match_result.education_match}")
        
        print(f"\nImprovement Suggestions:")
        for i, suggestion in enumerate(match_result.improvement_suggestions[:3], 1):
            print(f"  {i}. {suggestion}")
        
        print(f"\n=== Detailed Report Preview ===")
        report_preview = match_result.detailed_report[:500] + "..." if len(match_result.detailed_report) > 500 else match_result.detailed_report
        print(report_preview)
        
        # Check quality of analysis
        if has_meaningful_requirements and match_result.match_score > 0:
            print(f"\n🎉 SUCCESS: Enhanced AI system is working!")
            print(f"   - Job requirements extracted: {len(job_reqs.get('required_skills', [])) + len(job_reqs.get('preferred_skills', []))} skills")
            print(f"   - Match score: {match_result.match_score}% (realistic range)")
            print(f"   - Detailed analysis: {len(match_result.detailed_report)} characters")
        else:
            print(f"\n⚠️ Using fallback algorithm (LLM not fully working)")
            
    except Exception as e:
        print(f"❌ Error during AI analysis: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_enhanced_ai() 