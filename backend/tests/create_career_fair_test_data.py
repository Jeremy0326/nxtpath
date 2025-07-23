#!/usr/bin/env python
"""
Script to create test data for career fair management system
This will create realistic data to show 8 registered companies and various applications
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import UniversityProfile, UniversityStaffProfile, CompanyProfile, StudentProfile
from career_fairs.models import CareerFair, Booth, StudentInterest
from jobs.models import Job, Application
from datetime import datetime, date, timedelta
from django.utils import timezone

def create_test_career_fair_data():
    """Create test data for career fair management"""
    
    print("Creating test data for career fair management...")
    
    # Get or create a university
    try:
        university = UniversityProfile.objects.first()
        if not university:
            # Create a test university
            uni_user = User.objects.create_user(
                username='university_test',
                email='university@test.com',
                password='testpass123'
            )
            university = UniversityProfile.objects.create(
                user=uni_user,
                name='Malaysia Tech University',
                description='Leading tech university',
                location='Kuala Lumpur, Malaysia'
            )
            print(f"Created university: {university.name}")
    except Exception as e:
        print(f"Error creating university: {e}")
        return
    
    # Get or create university staff
    try:
        staff = UniversityStaffProfile.objects.first()
        if not staff:
            staff_user = User.objects.create_user(
                username='staff_test',
                email='staff@university.com', 
                password='testpass123'
            )
            staff = UniversityStaffProfile.objects.create(
                user=staff_user,
                university=university,
                department='Career Services',
                position='Career Fair Coordinator'
            )
            print(f"Created staff member: {staff_user.get_full_name()}")
    except Exception as e:
        print(f"Error creating staff: {e}")
        return
    
    # Create or get career fair
    try:
        fair = CareerFair.objects.filter(title='Malaysia Tech & Industry Career Expo 2025').first()
        if not fair:
            fair = CareerFair.objects.create(
                title='Malaysia Tech & Industry Career Expo 2025',
                description='Premier career fair for tech and industry professionals',
                start_date=date(2025, 7, 17),
                end_date=date(2025, 7, 17),
                location='University Main Campus',
                host_university=university,
                is_active=True,
                created_by=staff.user
            )
            print(f"Created career fair: {fair.title}")
        else:
            print(f"Using existing career fair: {fair.title}")
    except Exception as e:
        print(f"Error creating career fair: {e}")
        return
    
    # Create 8 companies with booths
    companies_data = [
        {'name': 'TechCorp Malaysia', 'industry': 'Technology'},
        {'name': 'Global Solutions Sdn Bhd', 'industry': 'Consulting'},
        {'name': 'Innovation Labs', 'industry': 'Research & Development'},
        {'name': 'Digital Dynamics', 'industry': 'Software Development'},
        {'name': 'Future Systems', 'industry': 'IT Services'},
        {'name': 'Smart Industries', 'industry': 'Manufacturing'},
        {'name': 'Data Analytics Pro', 'industry': 'Data Science'},
        {'name': 'Cloud Solutions Ltd', 'industry': 'Cloud Computing'}
    ]
    
    created_companies = []
    for i, company_data in enumerate(companies_data, 1):
        try:
            # Create company user
            company_username = f"company_{i}_user"
            company_user = User.objects.filter(username=company_username).first()
            if not company_user:
                company_user = User.objects.create_user(
                    username=company_username,
                    email=f"hr@{company_data['name'].lower().replace(' ', '').replace('&', '')}.com",
                    password='testpass123',
                    first_name=company_data['name'],
                )
            
            # Create company profile
            company = CompanyProfile.objects.filter(user=company_user).first()
            if not company:
                company = CompanyProfile.objects.create(
                    user=company_user,
                    name=company_data['name'],
                    industry=company_data['industry'],
                    description=f"Leading company in {company_data['industry']}",
                    location='Kuala Lumpur, Malaysia',
                    website=f"https://{company_data['name'].lower().replace(' ', '').replace('&', '')}.com"
                )
            
            # Create booth for the company
            booth = Booth.objects.filter(fair=fair, company=company).first()
            if not booth:
                booth = Booth.objects.create(
                    fair=fair,
                    company=company,
                    booth_number=f"B-{i:02d}",
                    x=i % 5,  # Grid position
                    y=i // 5,
                    width=1,
                    height=1,
                    created_at=timezone.now() - timedelta(days=30-i)
                )
            
            created_companies.append((company, booth))
            print(f"Created company: {company.name} with booth {booth.booth_number}")
            
        except Exception as e:
            print(f"Error creating company {company_data['name']}: {e}")
            continue
    
    # Create some students
    students_data = [
        {'name': 'Ahmad Rahman', 'email': 'ahmad.rahman@student.edu.my', 'major': 'Computer Science'},
        {'name': 'Sarah Lee', 'email': 'sarah.lee@student.edu.my', 'major': 'Information Technology'},
        {'name': 'Kumar Patel', 'email': 'kumar.patel@student.edu.my', 'major': 'Software Engineering'},
        {'name': 'Fatimah Zahra', 'email': 'fatimah.zahra@student.edu.my', 'major': 'Data Science'},
        {'name': 'Wong Wei Ming', 'email': 'wong.weiming@student.edu.my', 'major': 'Computer Science'},
    ]
    
    created_students = []
    for i, student_data in enumerate(students_data, 1):
        try:
            student_username = f"student_{i}_user"
            student_user = User.objects.filter(username=student_username).first()
            if not student_user:
                student_user = User.objects.create_user(
                    username=student_username,
                    email=student_data['email'],
                    password='testpass123',
                    first_name=student_data['name'].split()[0],
                    last_name=' '.join(student_data['name'].split()[1:])
                )
            
            student = StudentProfile.objects.filter(user=student_user).first()
            if not student:
                student = StudentProfile.objects.create(
                    user=student_user,
                    university=university,
                    major=student_data['major'],
                    graduation_year='2025',
                    bio=f"Final year {student_data['major']} student looking for opportunities"
                )
            
            created_students.append(student)
            print(f"Created student: {student_data['name']}")
            
        except Exception as e:
            print(f"Error creating student {student_data['name']}: {e}")
            continue
    
    # Create student interests (registrations)
    print("Creating student interests...")
    for i, student in enumerate(created_students):
        # Each student shows interest in 2-3 booths
        interested_booths = created_companies[i:i+2] if i < len(created_companies)-1 else created_companies[:2]
        for company, booth in interested_booths:
            interest, created = StudentInterest.objects.get_or_create(
                student=student,
                booth=booth,
                defaults={'timestamp': timezone.now() - timedelta(days=20-i)}
            )
            if created:
                print(f"  {student.user.get_full_name()} interested in {company.name}")
    
    # Create jobs for some companies
    print("Creating jobs...")
    job_titles = [
        'Software Developer',
        'Data Analyst', 
        'IT Consultant',
        'Systems Administrator',
        'Product Manager',
        'Business Analyst',
        'DevOps Engineer',
        'UI/UX Designer'
    ]
    
    created_jobs = []
    for i, (company, booth) in enumerate(created_companies):
        if i < len(job_titles):
            try:
                job = Job.objects.filter(company=company, title=job_titles[i]).first()
                if not job:
                    job = Job.objects.create(
                        title=job_titles[i],
                        company=company,
                        description=f"Exciting {job_titles[i]} position at {company.name}",
                        requirements="Bachelor's degree, 2+ years experience",
                        location=company.location,
                        employment_type='Full-time',
                        salary_min=3500,
                        salary_max=8000,
                        created_at=timezone.now() - timedelta(days=25-i)
                    )
                    # Associate job with booth
                    job.booths.add(booth)
                    
                created_jobs.append(job)
                print(f"Created job: {job.title} at {company.name}")
                
            except Exception as e:
                print(f"Error creating job for {company.name}: {e}")
                continue
    
    # Create 3 applications (as requested)
    print("Creating applications...")
    if created_students and created_jobs:
        # Application 1: Ahmad applies to TechCorp
        if len(created_jobs) > 0 and len(created_students) > 0:
            app1, created = Application.objects.get_or_create(
                job=created_jobs[0],
                applicant=created_students[0],
                defaults={
                    'status': 'pending',
                    'applied_at': timezone.now() - timedelta(days=10)
                }
            )
            if created:
                print(f"  Application 1: {created_students[0].user.get_full_name()} -> {created_jobs[0].title}")
        
        # Application 2: Sarah applies to Global Solutions  
        if len(created_jobs) > 1 and len(created_students) > 1:
            app2, created = Application.objects.get_or_create(
                job=created_jobs[1],
                applicant=created_students[1],
                defaults={
                    'status': 'under_review',
                    'applied_at': timezone.now() - timedelta(days=8)
                }
            )
            if created:
                print(f"  Application 2: {created_students[1].user.get_full_name()} -> {created_jobs[1].title}")
        
        # Application 3: Kumar applies to Innovation Labs
        if len(created_jobs) > 2 and len(created_students) > 2:
            app3, created = Application.objects.get_or_create(
                job=created_jobs[2],
                applicant=created_students[2],
                defaults={
                    'status': 'pending',
                    'applied_at': timezone.now() - timedelta(days=5)
                }
            )
            if created:
                print(f"  Application 3: {created_students[2].user.get_full_name()} -> {created_jobs[2].title}")
    
    print("\n" + "="*50)
    print("TEST DATA SUMMARY:")
    print("="*50)
    print(f"Career Fair: {fair.title}")
    print(f"Total Companies: {len(created_companies)}")
    print(f"Total Students: {len(created_students)}")
    print(f"Total Jobs: {len(created_jobs)}")
    print(f"Total Student Interests: {StudentInterest.objects.filter(booth__fair=fair).count()}")
    print(f"Total Applications: {Application.objects.filter(job__booths__fair=fair).count()}")
    print("="*50)
    print("✅ Test data created successfully!")

if __name__ == "__main__":
    create_test_career_fair_data()
