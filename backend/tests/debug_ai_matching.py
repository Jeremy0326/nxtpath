#!/usr/bin/env python3
"""
Debug script to check AI job matching results
"""
import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from accounts.models import User
from jobs.models import CV, Job
from jobs.services.ai_job_matching.job_matcher import JobMatcher
from jobs.services.ai_job_matching.cv_parser import CVParser, CVData

def debug_ai_matching():
    print("=== AI Job Matching Debug ===")
    
    # Check what data we have
    print(f"\n=== Database Status ===")
    users = User.objects.all()
    print(f"Total users: {users.count()}")
    for user in users:
        print(f"  User: {user.email} (ID: {user.id})")
    
    cvs = CV.objects.all()
    print(f"Total CVs: {cvs.count()}")
    for cv in cvs:
        print(f"  CV: {cv.original_filename} (User: {cv.user.email}, Active: {cv.is_active}, Parsed: {cv.is_parsed})")
    
    jobs = Job.objects.all()
    print(f"Total jobs: {jobs.count()}")
    for job in jobs:
        print(f"  Job: {job.title} (Status: {job.status})")
    
    # Find a user with an active CV
    user_with_cv = None
    cv = None
    
    for user in users:
        user_cv = CV.objects.filter(user=user, is_active=True).first()
        if user_cv:
            user_with_cv = user
            cv = user_cv
            break
    
    if not user_with_cv:
        # Try to find any CV and activate it
        any_cv = CV.objects.first()
        if any_cv:
            any_cv.is_active = True
            any_cv.save()
            user_with_cv = any_cv.user
            cv = any_cv
            print(f"✅ Activated CV: {cv.original_filename} for user {user_with_cv.email}")
        else:
            print("❌ No CVs found at all")
            return
    
    active_job = Job.objects.filter(status='active').first()
    if not active_job:
        print("❌ No active jobs found")
        return
    
    print(f"\n=== Testing Data ===")
    print(f"✅ User: {user_with_cv.email}")
    print(f"✅ CV: {cv.original_filename}")
    print(f"✅ Job: {active_job.title}")
    
    # Check CV parsing
    print(f"\n=== CV Parsing Status ===")
    print(f"Is parsed: {cv.is_parsed}")
    print(f"Has parsed_data: {bool(cv.parsed_data)}")
    
    if cv.parsed_data:
        print(f"Parsed data keys: {list(cv.parsed_data.keys())}")
        if 'name' in cv.parsed_data:
            print(f"Name: {cv.parsed_data.get('name', 'N/A')}")
        if 'skills' in cv.parsed_data:
            skills = cv.parsed_data.get('skills', [])
            print(f"Skills count: {len(skills)}")
            print(f"Skills: {skills[:5] if skills else 'None'}")  # First 5
        if 'experience' in cv.parsed_data:
            print(f"Experience count: {len(cv.parsed_data.get('experience', []))}")
        if 'education' in cv.parsed_data:
            print(f"Education count: {len(cv.parsed_data.get('education', []))}")
    
    # Parse CV if needed
    cv_data = None
    if cv.is_parsed and cv.parsed_data:
        try:
            cv_data = CVData(**cv.parsed_data)
            print("✅ CV data loaded from cache")
        except Exception as e:
            print(f"❌ Error loading cached CV data: {e}")
            print("Will try to re-parse...")
    
    if not cv_data:
        print("Parsing CV from file...")
        try:
            parser = CVParser()
            if cv.file and os.path.exists(cv.file.path):
                cv_data = parser.parse_cv_from_file(cv.file.path)
                # Update the database
                cv.parsed_data = cv_data.model_dump()
                cv.is_parsed = True
                cv.save()
                print("✅ CV parsed successfully and saved to database")
            else:
                print(f"❌ CV file not found at: {cv.file.path if cv.file else 'No file path'}")
                return
        except Exception as e:
            print(f"❌ Error parsing CV: {e}")
            import traceback
            traceback.print_exc()
            return
    
    # Show parsed CV data
    print(f"\n=== Parsed CV Data ===")
    print(f"Name: {cv_data.name}")
    print(f"Email: {cv_data.email}")
    print(f"Phone: {cv_data.phone}")
    print(f"Skills: {cv_data.skills}")
    print(f"Experience items: {len(cv_data.experience)}")
    print(f"Education items: {len(cv_data.education)}")
    
    # Test job matching
    print(f"\n=== Job Matching Test ===")
    print(f"Job description length: {len(active_job.description)} chars")
    print(f"Job description preview: {active_job.description[:200]}...")
    
    try:
        matcher = JobMatcher()
        print(f"Matcher model: {matcher.model_name}")
        print(f"Matcher has LLM: {bool(matcher.llm)}")
        
        # Test the matching
        print("Running AI job matching...")
        match_result = matcher.match_cv_to_job(cv_data, active_job.description, active_job)
        
        print(f"\n=== Match Results ===")
        print(f"Match score: {match_result.match_score}")
        print(f"Match reasons count: {len(match_result.match_reasons)}")
        print(f"Match reasons: {match_result.match_reasons}")
        print(f"Missing skills count: {len(match_result.missing_skills)}")
        print(f"Missing skills: {match_result.missing_skills}")
        print(f"Highlighted skills count: {len(match_result.highlighted_skills)}")
        print(f"Highlighted skills: {match_result.highlighted_skills}")
        print(f"Experience match: {match_result.experience_match}")
        print(f"Education match: {match_result.education_match}")
        print(f"Improvement suggestions count: {len(match_result.improvement_suggestions)}")
        print(f"Improvement suggestions: {match_result.improvement_suggestions}")
        print(f"Detailed report length: {len(match_result.detailed_report)} chars")
        print(f"Detailed report: {match_result.detailed_report[:300]}...")
        
        # Check if this is a fallback result
        if "fallback analysis" in match_result.detailed_report.lower():
            print("⚠️  This appears to be a fallback result (not AI-powered)")
        else:
            print("✅ This appears to be an AI-powered analysis")
        
        # Convert to dict like the API does
        result_dict = {
            'matchScore': match_result.match_score,
            'matchReasons': match_result.match_reasons,
            'missingSkills': match_result.missing_skills,
            'highlightedSkills': match_result.highlighted_skills,
            'experienceMatch': match_result.experience_match,
            'educationMatch': match_result.education_match,
            'improvementSuggestions': match_result.improvement_suggestions,
            'detailedReport': match_result.detailed_report
        }
        
        print(f"\n=== API Response Format ===")
        print(json.dumps(result_dict, indent=2))
        
    except Exception as e:
        print(f"❌ Error in job matching: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_ai_matching() 