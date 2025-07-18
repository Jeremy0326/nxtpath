#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from career_fairs.models import CareerFair, Booth
from accounts.models import University, Company
from jobs.models import Job, Skill
from django.utils import timezone


def create_test_career_fairs():
    # Get universities
    universities = list(University.objects.all())
    if not universities:
        print('No universities found. Please create universities first.')
        return

    # Create a new career fair
    fair, _ = CareerFair.objects.get_or_create(
        title='Malaysia Tech & Industry Career Expo 2025',
        defaults={
            'description': 'Meet top Malaysian employers in tech, finance, logistics, and more. Explore real job opportunities and network with industry leaders.',
            'host_university': universities[0],
            'start_date': timezone.now().date(),
            'end_date': timezone.now().date(),
            'location': 'Kuala Lumpur Convention Centre',
            'is_active': True,
            'grid_width': 12,
            'grid_height': 8,
        }
    )

    # Add companies
    companies_data = [
        {"name": "Petronas", "description": "Malaysia's fully integrated oil and gas multinational.", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Petronas_logo.svg", "industry": "Oil & Gas", "location": "Kuala Lumpur"},
        {"name": "Maxis", "description": "Leading communications service provider in Malaysia.", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Maxis_logo.svg", "industry": "Telecommunications", "location": "Kuala Lumpur"},
        {"name": "Shopee Malaysia", "description": "SEA's leading e-commerce platform.", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/2/29/Shopee_logo.svg", "industry": "E-Commerce", "location": "Kuala Lumpur"},
        {"name": "Top Glove", "description": "World’s largest manufacturer of gloves.", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Top_Glove_logo.svg", "industry": "Manufacturing", "location": "Shah Alam"},
        {"name": "Sunway Group", "description": "Malaysian conglomerate with core interests in property, construction, education, and healthcare.", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Sunway_Group_logo.svg", "industry": "Conglomerate", "location": "Selangor"},
        {"name": "Grab Malaysia", "description": "SEA’s leading super app for ride-hailing, food delivery, and digital payments.", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Grab_logo.svg", "industry": "Technology", "location": "Kuala Lumpur"},
        {"name": "Maybank", "description": "Malaysia’s largest financial services group.", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Maybank_logo.svg", "industry": "Banking", "location": "Kuala Lumpur"},
    ]
    companies = {}
    for c in companies_data:
        company, _ = Company.objects.get_or_create(name=c["name"], defaults=c)
        companies[c["name"]] = company

    # Add jobs for each company
    skills = {s.name: s for s in Skill.objects.all()}
    jobs_data = [
        {"company": companies["Petronas"], "title": "Process Engineer", "description": "Design and optimize oil & gas processes.", "requirements": ["Degree in Chemical Engineering", "3+ years experience in oil & gas"], "responsibilities": ["Process simulation", "Safety analysis"], "job_type": "FULL_TIME", "location": "Kuala Lumpur", "salary_min": 7000, "salary_max": 12000, "skills": [skills.get("Python"), skills.get("System Design")], "application_deadline": timezone.now() + timezone.timedelta(days=30)},
        {"company": companies["Maxis"], "title": "Network Operations Engineer", "description": "Maintain and optimize mobile network infrastructure.", "requirements": ["Degree in Electrical Engineering", "Experience with 4G/5G networks"], "responsibilities": ["Network monitoring", "Incident response"], "job_type": "FULL_TIME", "location": "Kuala Lumpur", "salary_min": 6000, "salary_max": 10000, "skills": [skills.get("Networking"), skills.get("Python")], "application_deadline": timezone.now() + timezone.timedelta(days=30)},
        {"company": companies["Shopee Malaysia"], "title": "Frontend Developer", "description": "Build and maintain Shopee’s web platform.", "requirements": ["Degree in Computer Science", "Strong in React.js & TypeScript"], "responsibilities": ["UI development", "Performance optimization"], "job_type": "FULL_TIME", "location": "Kuala Lumpur", "salary_min": 8000, "salary_max": 14000, "skills": [skills.get("React"), skills.get("TypeScript")], "application_deadline": timezone.now() + timezone.timedelta(days=30)},
        {"company": companies["Top Glove"], "title": "Production Supervisor", "description": "Oversee glove production lines.", "requirements": ["Diploma/Degree in Engineering", "Manufacturing experience"], "responsibilities": ["Production planning", "Quality control"], "job_type": "FULL_TIME", "location": "Shah Alam", "salary_min": 5000, "salary_max": 9000, "skills": [skills.get("Project Management")], "application_deadline": timezone.now() + timezone.timedelta(days=30)},
        {"company": companies["Sunway Group"], "title": "Digital Marketing Executive", "description": "Plan and execute digital marketing campaigns.", "requirements": ["Degree in Marketing", "Experience with SEO/SEM"], "responsibilities": ["Content creation", "Campaign analysis"], "job_type": "FULL_TIME", "location": "Selangor", "salary_min": 4500, "salary_max": 8000, "skills": [skills.get("Data Analysis")], "application_deadline": timezone.now() + timezone.timedelta(days=30)},
        {"company": companies["Grab Malaysia"], "title": "Mobile App Developer (Android)", "description": "Develop and maintain Grab’s Android app.", "requirements": ["Degree in Computer Science", "Kotlin/Java experience"], "responsibilities": ["App development", "Code review"], "job_type": "FULL_TIME", "location": "Kuala Lumpur", "salary_min": 9000, "salary_max": 15000, "skills": [skills.get("JavaScript"), skills.get("Java")], "application_deadline": timezone.now() + timezone.timedelta(days=30)},
        {"company": companies["Maybank"], "title": "Data Analyst", "description": "Analyze banking data to support business decisions.", "requirements": ["Degree in Statistics/Math/CS", "Strong SQL & Excel"], "responsibilities": ["Data cleaning", "Reporting"], "job_type": "FULL_TIME", "location": "Kuala Lumpur", "salary_min": 7000, "salary_max": 12000, "skills": [skills.get("SQL"), skills.get("Data Analysis")], "application_deadline": timezone.now() + timezone.timedelta(days=30)},
    ]
    jobs = []
    for data in jobs_data:
        job_skills = [s for s in data.pop('skills') if s]
        job = Job.objects.create(**{k: v for k, v in data.items() if k != 'skills'})
        job.skills.set(job_skills)
        jobs.append(job)

    # Add booths for each company to the fair
    booth_positions = [
        (1, 1), (3, 2), (5, 2), (7, 3), (9, 2), (2, 5), (10, 6)
    ]
    for i, (company_name, company) in enumerate(companies.items()):
        booth_number = f"B{i+1}"
        booth, _ = Booth.objects.get_or_create(
            fair=fair,
            company=company,
            defaults={
                'label': company.name,
                'booth_number': booth_number,
                'x': booth_positions[i][0],
                'y': booth_positions[i][1],
                'width': 1,
                'height': 1,
            }
        )
        booth.booth_number = booth_number
        booth.label = company.name
        booth.save()
        # Assign jobs to booth
        booth_jobs = [job for job in jobs if job.company == company]
        booth.jobs.set(booth_jobs)

    print('Created Malaysia Tech & Industry Career Expo 2025 with realistic companies, jobs, and booths.')

if __name__ == '__main__':
    print('Creating test career fairs...')
    create_test_career_fairs()
    print('Done!') 