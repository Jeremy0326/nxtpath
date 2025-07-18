#!/usr/bin/env python3
"""
Check job descriptions
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from jobs.models import Job

def check_jobs():
    print("=== Job Descriptions Check ===")
    
    jobs = Job.objects.all()
    print(f"Total jobs: {jobs.count()}")
    
    for job in jobs:
        print(f"\n--- {job.title} ({job.company.name}) ---")
        print(f"Description length: {len(job.description)} characters")
        print(f"Description: {job.description}")
        print(f"Requirements: {job.requirements}")
        print(f"Responsibilities: {job.responsibilities}")

if __name__ == "__main__":
    check_jobs() 