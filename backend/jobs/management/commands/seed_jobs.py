import datetime
from django.core.management.base import BaseCommand
from jobs.models import Job, Company, Skill

class Command(BaseCommand):
    help = 'Seeds the database with initial job data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to seed the database...'))

        jobs_data = [
            {
                "id": "1",
                "title": "Software Engineer",
                "company_name": "Grab Malaysia",
                "location": "Kuala Lumpur",
                "type": "Full-time",
                "salary_min": 6000,
                "salary_max": 12000,
                "currency": "MYR",
                "description": "We are looking for a Software Engineer to join our team in Kuala Lumpur. You will be responsible for developing and maintaining our core platform services.",
                "requirements": [
                    "Bachelor's degree in Computer Science or related field",
                    "3+ years of experience in software development",
                    "Strong knowledge of JavaScript/TypeScript and Node.js",
                    "Experience with cloud platforms (AWS/GCP)",
                    "Good understanding of microservices architecture",
                ],
                "responsibilities": [
                    "Design and implement scalable backend services",
                    "Write clean, maintainable, and efficient code",
                    "Collaborate with cross-functional teams",
                ],
                "skills": ["JavaScript", "TypeScript", "Node.js", "AWS", "Microservices"],
                "posted_at": "2024-03-15T00:00:00Z",
            },
            {
                "id": "2",
                "title": "Data Scientist",
                "company_name": "AirAsia Digital",
                "location": "Selangor",
                "type": "Full-time",
                "salary_min": 8000,
                "salary_max": 15000,
                "currency": "MYR",
                "description": "Join our data science team to help transform AirAsia into a digital airline. You will work on exciting projects involving machine learning and predictive analytics.",
                "requirements": [
                    "Master's degree in Data Science, Statistics, or related field",
                    "2+ years of experience in data science",
                ],
                "responsibilities": [
                    "Develop and implement machine learning models",
                    "Analyze large datasets to extract insights",
                ],
                "skills": ["Python", "Machine Learning", "Data Analysis", "SQL", "Statistics"],
                "posted_at": "2024-03-14T00:00:00Z",
            }
            # Add more jobs as needed
        ]
        
        for job_data in jobs_data:
            company, _ = Company.objects.get_or_create(
                name=job_data['company_name'],
                defaults={'location': job_data['location']}
            )

            job, created = Job.objects.get_or_create(
                id=job_data['id'],
                defaults={
                    'title': job_data['title'],
                    'company': company,
                    'location': job_data['location'],
                    'type': job_data['type'],
                    'description': job_data['description'],
                    'requirements': "\n".join(job_data['requirements']),
                    'responsibilities': "\n".join(job_data['responsibilities']),
                    'salary_min': job_data['salary_min'],
                    'salary_max': job_data['salary_max'],
                    'currency': job_data['currency'],
                    'posted_at': datetime.datetime.fromisoformat(job_data['posted_at'].replace("Z", "+00:00")),
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'Created job: "{job.title}"'))
                skill_names = job_data.get('skills', [])
                for skill_name in skill_names:
                    skill, _ = Skill.objects.get_or_create(name=skill_name)
                    job.skills.add(skill)
                job.save()
            else:
                self.stdout.write(self.style.WARNING(f'Job "{job.title}" already exists.'))

        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!')) 