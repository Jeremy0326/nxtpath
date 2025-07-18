#!/usr/bin/env python3
"""
Force re-parse all CVs
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from jobs.models import CV
from jobs.services.ai_job_matching.cv_parser import CVParser

def force_reparse_cvs():
    print("=== Force Re-parsing CVs ===")
    
    # Get all CVs
    cvs = CV.objects.all()
    print(f"Found {cvs.count()} CVs")
    
    parser = CVParser()
    success_count = 0
    
    for cv in cvs:
        print(f"\n--- Processing: {cv.original_filename} (User: {cv.user.email}) ---")
        
        if not cv.file:
            print("❌ No file attached to CV")
            continue
        
        file_path = cv.file.path
        print(f"File path: {file_path}")
        
        if not os.path.exists(file_path):
            print("❌ File does not exist")
            continue
        
        try:
            # Force re-parse
            print("🔄 Parsing CV...")
            cv_data = parser.parse_cv_from_file(file_path)
            
            # Update database
            cv.parsed_data = cv_data.model_dump()
            cv.is_parsed = True
            cv.save()
            
            print(f"✅ Successfully parsed CV:")
            print(f"  Name: {cv_data.name}")
            print(f"  Email: {cv_data.email}")
            print(f"  Skills: {len(cv_data.skills)} skills")
            print(f"  Experience: {len(cv_data.experience)} entries")
            print(f"  Education: {len(cv_data.education)} entries")
            
            success_count += 1
            
        except Exception as e:
            print(f"❌ Error parsing CV: {e}")
            import traceback
            traceback.print_exc()
    
    print(f"\n=== Summary ===")
    print(f"Successfully parsed {success_count} of {cvs.count()} CVs")

if __name__ == "__main__":
    force_reparse_cvs() 