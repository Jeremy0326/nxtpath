
import random
import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker

from accounts.models import (
    User, Company, University, 
    StudentProfile, EmployerProfile, UniversityStaffProfile, Resume,
    CompanyJoinRequest, UniversityJoinRequest
)
from jobs.models import Skill, Job, Application, SavedJob

class Command(BaseCommand):
    help = 'Seeds the database with a final, comprehensive, and realistic set of data.'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('--- Starting Final, Comprehensive Database Seeding ---'))
        fake = Faker()

        self.clear_data()
        
        self.create_admin_user()
        skills = self.create_skills()
        universities = self.create_universities()
        companies = self.create_companies(fake)
        
        student_users, employer_users, staff_users = self.create_users_and_profiles(fake, universities, companies)
        jobs = self.create_jobs(companies, skills)
        self.create_applications_and_saved_jobs(jobs, student_users)
        self.create_join_requests(fake, universities, companies)

        self.stdout.write(self.style.SUCCESS('--- Final Database Seeding Completed Successfully! ---'))

    def clear_data(self):
        self.stdout.write('Clearing old data...')
        Application.objects.all().delete()
        SavedJob.objects.all().delete()
        Job.objects.all().delete()
        Skill.objects.all().delete()
        Resume.objects.all().delete()
        CompanyJoinRequest.objects.all().delete()
        UniversityJoinRequest.objects.all().delete()
        StudentProfile.objects.all().delete()
        EmployerProfile.objects.all().delete()
        UniversityStaffProfile.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        Company.objects.all().delete()
        University.objects.all().delete()

    def create_admin_user(self):
        self.stdout.write('Creating admin user...')
        if not User.objects.filter(email='admin@nxtpath.com').exists():
            User.objects.create_superuser('admin@nxtpath.com', 'adminpassword', user_type='admin', full_name='System Admin')
            self.stdout.write(self.style.SUCCESS('Admin user created.'))

    def create_skills(self):
        self.stdout.write('Creating skills...')
        skills_list = ["Python", "Django", "JavaScript", "React", "Node.js", "SQL", "PostgreSQL", "Docker", "Kubernetes", "AWS", "CI/CD", "Git", "Agile", "Data Analysis", "Machine Learning", "Go", "System Design", "RESTful APIs", "Vue.js", "TypeScript", "Java", "Spring Boot", "Project Management"]
        skills = {name: Skill.objects.create(name=name) for name in skills_list}
        self.stdout.write(self.style.SUCCESS(f'Created {len(skills)} skills.'))
        return skills

    def create_universities(self):
        self.stdout.write('Creating universities...')
        universities_data = [
            {"name": "Asia Pacific University (APU)", "location": "Kuala Lumpur, Malaysia", "logo_url": "https://www.apu.edu.my/sites/all/themes/apu/logo.png", "website": "https://apu.edu.my"},
            {"name": "Universiti Malaya (UM)", "location": "Kuala Lumpur, Malaysia", "logo_url": "https://upload.wikimedia.org/wikipedia/en/6/6f/Universiti_Malaya_logo.svg", "website": "https://um.edu.my"},
        ]
        universities = {data['name']: University.objects.create(**data) for data in universities_data}
        self.stdout.write(self.style.SUCCESS(f'Created {len(universities)} universities.'))
        return universities

    def create_companies(self, fake):
        self.stdout.write('Creating companies...')
        companies_data = [
            { "name": "NxtLvL Solutions", "description": "A dynamic startup building next-generation web applications.", "logo_url": "https://i.picsum.photos/id/1/200/200.jpg", "website": "https://nxtlvl.io", "industry": "Software", "location": "Cyberjaya, Malaysia", "size": Company.CompanySize.STARTUP, "gallery_urls": ["https://i.picsum.photos/id/10/400/250.jpg", "https://i.picsum.photos/id/11/400/250.jpg"]},
            { "name": "QuantumLeap AI", "description": "Pioneering AI-driven solutions for the financial sector.", "logo_url": "https://i.picsum.photos/id/2/200/200.jpg", "website": "https://quantumleap.ai", "industry": "FinTech", "location": "Penang, Malaysia", "size": Company.CompanySize.SCALEUP, "gallery_urls": ["https://i.picsum.photos/id/20/400/250.jpg", "https://i.picsum.photos/id/21/400/250.jpg"]},
            { "name": "GreenHorizon Logistics", "description": "Sustainable and efficient supply chain management.", "logo_url": "https://i.picsum.photos/id/3/200/200.jpg", "website": "https://greenhorizon.log", "industry": "Logistics", "location": "Johor Bahru, Malaysia", "size": Company.CompanySize.MID_SIZE, "gallery_urls": ["https://i.picsum.photos/id/30/400/250.jpg"]},
        ]
        companies = {data['name']: Company.objects.create(**data) for data in companies_data}
        self.stdout.write(self.style.SUCCESS(f'Created {len(companies)} companies.'))
        return companies

    def create_users_and_profiles(self, fake, universities, companies):
        self.stdout.write('Creating users and profiles...')
        student1 = User.objects.create_user(email="ali.abu@apu.edu.my", password="password123", user_type='student', full_name="Ali Abu", profile_picture_url="https://i.pravatar.cc/150?u=aliabu")
        sp1 = StudentProfile.objects.create(user=student1, university=universities['Asia Pacific University (APU)'], major="Computer Science", graduation_year=2025, interests=['competitive programming', 'open source', 'hiking'], career_preferences={'roles': ['Backend Developer', 'DevOps Engineer'], 'industries': ['Technology', 'Gaming'], 'location': ['Kuala Lumpur', 'Remote']})
        Resume.objects.create(student_profile=sp1, file_url="/media/ali_resume_v1.pdf", file_name="ali_backend_resume.pdf", is_primary=True, parsed_text="Ali Abu is a skilled backend developer with 5 years of experience in Python, Django, and AWS. Proven track record of building scalable microservices.", is_parsed=True)

        student2 = User.objects.create_user(email="siti.aminah@um.edu.my", password="password123", user_type='student', full_name="Siti Aminah", profile_picture_url="https://i.pravatar.cc/150?u=siti")
        sp2 = StudentProfile.objects.create(user=student2, university=universities['Universiti Malaya (UM)'], major="Artificial Intelligence", graduation_year=2024, interests=['natural language processing', 'robotics'], career_preferences={'roles': ['Data Scientist', 'ML Engineer'], 'industries': ['FinTech', 'HealthTech']})
        Resume.objects.create(student_profile=sp2, file_url="/media/siti_resume.pdf", file_name="siti_datasci_cv.pdf", is_primary=True, parsed_text="Siti Aminah is a data scientist with a Master's degree. Strong background in machine learning, deep learning, TensorFlow, and Python.", is_parsed=True)
        
        employer1 = User.objects.create_user(email="hr@nxtlvl.io", password="password123", user_type='employer', full_name="John Doe", profile_picture_url="https://i.pravatar.cc/150?u=johndoe")
        EmployerProfile.objects.create(user=employer1, company=companies['NxtLvL Solutions'], role="Hiring Manager", is_company_admin=True)

        staff1 = User.objects.create_user(email="career.services@um.edu.my", password="password123", user_type='university', full_name="Dr. Azizan", profile_picture_url="https://i.pravatar.cc/150?u=drazizan")
        UniversityStaffProfile.objects.create(user=staff1, university=universities['Universiti Malaya (UM)'], role="Career Advisor")
        
        self.stdout.write(self.style.SUCCESS('Created users and profiles.'))
        return [student1, student2], [employer1], [staff1]

    def create_jobs(self, companies, skills):
        self.stdout.write('Creating jobs...')
        deadline = datetime.date.today() + datetime.timedelta(days=30)
        jobs_data = [
            { "company": companies["NxtLvL Solutions"], "title": "Senior Full-Stack Engineer (React/Django)", "description": "Join our core team to build and scale our flagship product. You will work across the entire stack.", "requirements": ["5+ years with React", "3+ years with Django", "Strong in system design", "Experience with CI/CD pipelines", "Excellent problem-solver"], "responsibilities": ["Develop features end-to-end", "Write clean, tested code", "Mentor junior developers", "Participate in code reviews"], "job_type": "FULL_TIME", "remote_option": "REMOTE", "salary_min": 12000, "salary_max": 18000, "skills": [skills["React"], skills["Django"], skills["System Design"], skills["CI/CD"]], "application_deadline": deadline, "matching_weights": {"skills": 0.6, "keywords": 0.4} },
            { "company": companies["QuantumLeap AI"], "title": "Machine Learning Engineer", "description": "Develop and deploy machine learning models for real-time fraud detection in the financial industry.", "requirements": ["MSc/PhD in CS/Stats/related", "Deep knowledge of ML algorithms", "Proficient in Python and ML frameworks (TensorFlow/PyTorch)"], "responsibilities": ["Train and validate models", "Build data pipelines", "Work with large-scale datasets", "Deploy models to production"], "job_type": "FULL_TIME", "remote_option": "HYBRID", "salary_min": 10000, "salary_max": 16000, "skills": [skills["Machine Learning"], skills["Python"], skills["SQL"], skills["Docker"]], "application_deadline": deadline, "matching_weights": {"skills": 0.5, "education": 0.3, "experience": 0.2} },
        ]
        created_jobs = []
        for data in jobs_data:
            job_skills = data.pop('skills')
            job = Job.objects.create(**data)
            job.skills.set(job_skills)
            created_jobs.append(job)
        self.stdout.write(self.style.SUCCESS(f'Created {len(created_jobs)} jobs.'))
        return created_jobs

    def create_applications_and_saved_jobs(self, jobs, students):
        self.stdout.write('Creating applications and saved jobs...')
        student1, student2 = students[0], students[1]
        resume1 = student1.student_profile.resumes.get(is_primary=True)
        resume2 = student2.student_profile.resumes.get(is_primary=True)

        Application.objects.create(applicant=student1, job=jobs[0], resume=resume1, status=Application.Status.UNDER_REVIEW)
        Application.objects.create(applicant=student2, job=jobs[1], resume=resume2, status=Application.Status.APPLIED)
        
        SavedJob.objects.create(user=student1, job=jobs[1])
        self.stdout.write(self.style.SUCCESS('Created sample applications and saved jobs.'))

    def create_join_requests(self, fake, universities, companies):
        self.stdout.write('Creating pending join requests...')
        
        # Company Join Request
        company_requester = User.objects.create_user(email=fake.email(), password="password123", user_type='employer', full_name=fake.name())
        EmployerProfile.objects.create(user=company_requester, company=None, role="Recruiter")
        CompanyJoinRequest.objects.create(user=company_requester, company=companies["GreenHorizon Logistics"], status='PENDING')

        # University Join Request
        uni_requester = User.objects.create_user(email=fake.email(), password="password123", user_type='university', full_name=fake.name())
        # The profile is created after the request is approved in a real scenario
        UniversityJoinRequest.objects.create(user=uni_requester, university=universities["Universiti Malaya (UM)"], status='PENDING')

        self.stdout.write(self.style.SUCCESS('Created pending join requests.'))
