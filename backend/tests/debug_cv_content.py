#!/usr/bin/env python3
"""
Debug script to check CV content and parsing
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from accounts.models import User
from jobs.models import CV
from jobs.services.ai_job_matching.cv_parser import CVParser

def debug_cv_content():
    print("=== CV Content Debug ===")
    
    # Get the active CV
    cv = CV.objects.filter(is_active=True).first()
    if not cv:
        print("❌ No active CV found")
        return
    
    print(f"✅ CV: {cv.original_filename}")
    print(f"✅ User: {cv.user.email}")
    print(f"✅ File path: {cv.file.path if cv.file else 'No file'}")
    print(f"✅ Is parsed: {cv.is_parsed}")
    
    # Check file existence
    if cv.file and os.path.exists(cv.file.path):
        print("✅ File exists on disk")
        print(f"✅ File size: {os.path.getsize(cv.file.path)} bytes")
    else:
        print("❌ File does not exist on disk")
        return
    
    # Extract text from PDF
    parser = CVParser()
    try:
        cv_text = parser.extract_text_from_pdf(cv.file.path)
        print(f"\n=== Extracted Text (first 500 chars) ===")
        print(cv_text[:500])
        print(f"\n=== Text length: {len(cv_text)} characters ===")
        
        # Check for specific sections
        text_lower = cv_text.lower()
        print(f"\n=== Section Analysis ===")
        print(f"Contains 'education': {('education' in text_lower) or ('academic' in text_lower)}")
        print(f"Contains 'experience': {('experience' in text_lower) or ('employment' in text_lower) or ('work' in text_lower)}")
        print(f"Contains 'skills': {'skills' in text_lower}")
        print(f"Contains email pattern: {'@' in cv_text}")
        print(f"Contains phone pattern: {any(char.isdigit() for char in cv_text)}")
        
        # Try parsing with spaCy only
        print(f"\n=== SpaCy Parsing Test ===")
        cv_data = parser._parse_with_spacy(cv_text)
        
        print(f"Name: '{cv_data.name}'")
        print(f"Email: '{cv_data.email}'")
        print(f"Phone: '{cv_data.phone}'")
        print(f"Skills count: {len(cv_data.skills)}")
        print(f"Skills: {cv_data.skills}")
        print(f"Experience count: {len(cv_data.experience)}")
        for i, exp in enumerate(cv_data.experience):
            print(f"  Experience {i+1}: {exp.title} at {exp.company}")
        print(f"Education count: {len(cv_data.education)}")
        for i, edu in enumerate(cv_data.education):
            print(f"  Education {i+1}: {edu.degree} at {edu.institution}")
        
        # Show the current database parsed_data
        print(f"\n=== Database Parsed Data ===")
        if cv.parsed_data:
            import json
            print(json.dumps(cv.parsed_data, indent=2))
        else:
            print("No parsed data in database")
        
    except Exception as e:
        print(f"❌ Error parsing CV: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_cv_content() 