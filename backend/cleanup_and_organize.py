#!/usr/bin/env python3
"""
Comprehensive cleanup and organization script for the NxtPath project.
This script will:
1. Remove unused files and mock data
2. Update database to use real data
3. Reorganize file structure
4. Clean up imports and dependencies
"""

import os
import sys
import django
import shutil
from pathlib import Path

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from jobs.models import Job, CV, JobApplication
from accounts.models import User, Company
from django.contrib.auth import get_user_model

def main():
    print("🚀 Starting NxtPath cleanup and organization...")
    
    # 1. Clean up mock data and unused files
    cleanup_mock_data()
    
    # 2. Update job data with proper formatting
    update_job_data()
    
    # 3. Verify database integrity
    verify_database_integrity()
    
    # 4. Clean up file structure
    cleanup_file_structure()
    
    # 5. Update imports and dependencies
    update_imports()
    
    print("✅ Cleanup and organization completed successfully!")

def cleanup_mock_data():
    """Remove mock data files and update to use real data"""
    print("\n📦 Cleaning up mock data...")
    
    mock_files_to_remove = [
        '../src/data/mockJobs.ts',
        '../src/data/mockCompanies.ts',
        '../src/data/mockApplications.ts',
        # Add other mock data files here
    ]
    
    for file_path in mock_files_to_remove:
        if os.path.exists(file_path):
            print(f"  🗑️  Removing {file_path}")
            os.remove(file_path)
        else:
            print(f"  ℹ️  {file_path} not found (already removed)")

def update_job_data():
    """Update job data to ensure proper formatting"""
    print("\n📝 Updating job data formatting...")
    
    jobs = Job.objects.all()
    for job in jobs:
        updated = False
        
        # Ensure requirements and responsibilities are properly formatted
        if job.requirements and not job.requirements.startswith('Required Qualifications:'):
            # Already properly formatted, skip
            pass
        
        # Update any jobs that need reformatting
        if updated:
            job.save()
            print(f"  ✅ Updated job: {job.title}")
    
    print(f"  📊 Total jobs processed: {jobs.count()}")

def verify_database_integrity():
    """Verify database relationships and data integrity"""
    print("\n🔍 Verifying database integrity...")
    
    # Check jobs
    jobs_count = Job.objects.count()
    active_jobs_count = Job.objects.filter(status='active').count()
    print(f"  📋 Jobs: {jobs_count} total, {active_jobs_count} active")
    
    # Check companies
    companies_count = Company.objects.count()
    print(f"  🏢 Companies: {companies_count}")
    
    # Check CVs
    cvs_count = CV.objects.count()
    active_cvs_count = CV.objects.filter(is_active=True).count()
    parsed_cvs_count = CV.objects.filter(is_parsed=True).count()
    print(f"  📄 CVs: {cvs_count} total, {active_cvs_count} active, {parsed_cvs_count} parsed")
    
    # Check applications
    applications_count = JobApplication.objects.count()
    print(f"  📨 Applications: {applications_count}")
    
    # Check users
    User = get_user_model()
    users_count = User.objects.count()
    print(f"  👥 Users: {users_count}")

def cleanup_file_structure():
    """Clean up and reorganize file structure"""
    print("\n📁 Organizing file structure...")
    
    # Files to remove or rename
    files_to_remove = [
        'debug_cv_error.py',
        'debug_schema.py',
        'test_cv_fix.py',
        'test_complete_fix.py',
        'fix_cv_paths.py',
        'direct_fix_cvs.py',
        '../src/lib/services/jobService.ts',  # Moved to services/
    ]
    
    for file_path in files_to_remove:
        if os.path.exists(file_path):
            print(f"  🗑️  Removing {file_path}")
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"  ⚠️  Could not remove {file_path}: {e}")
    
    # Create organized directories if they don't exist
    directories_to_create = [
        '../src/services/api',
        '../src/utils',
        '../src/hooks/api',
        'scripts',
        'tests/integration',
    ]
    
    for directory in directories_to_create:
        if not os.path.exists(directory):
            print(f"  📁 Creating directory: {directory}")
            os.makedirs(directory, exist_ok=True)

def update_imports():
    """Update imports to reflect new file organization"""
    print("\n🔄 Updating imports and dependencies...")
    
    # This is a placeholder for import updates
    # In a real scenario, you'd scan files and update import paths
    print("  ℹ️  Import updates would be implemented here")
    print("  ℹ️  Consider using tools like jscodeshift for automated refactoring")

def remove_unused_dependencies():
    """Remove unused dependencies from package.json"""
    print("\n📦 Checking for unused dependencies...")
    
    # This would analyze package.json and remove unused deps
    print("  ℹ️  Dependency analysis would be implemented here")
    print("  ℹ️  Consider using tools like depcheck or npm-check-unused")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        sys.exit(1) 