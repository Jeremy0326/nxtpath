import random
import requests
from io import BytesIO
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.files.images import ImageFile
from django.utils import timezone
from faker import Faker
from jobs.models import Company, Job, Skill

User = get_user_model()
fake = Faker()

SAMPLE_COMPANIES = [
    {
        "name": "Grab",
        "description": "Grab is a Southeast Asian technology company that offers ride-hailing, food delivery, and digital payment services.",
        "website": "https://www.grab.com",
        "logo_url": "https://media.licdn.com/dms/image/D560BAQG7aNTRg42_Xg/company-logo_200_200/0/1715833190479/grab_logo?e=1730332800&v=beta&t=3DqvfEouBvH3bY8G3Yj-zCgD5P8nQjXgR4hYkFzWkXo",
        "industry": "Technology",
    },
    {
        "name": "AirAsia",
        "description": "AirAsia is a Malaysian multinational low-cost airline headquartered near Kuala Lumpur, Malaysia.",
        "website": "https://www.airasia.com",
        "logo_url": "https://media.licdn.com/dms/image/D560BAQEM9y-22T3z5w/company-logo_200_200/0/1709193710830/airasia_logo?e=1730332800&v=beta&t=sC9UuYXxL3j7sP6R7mC4fG8aYkHwV8rJ3tQkL5sN8zM",
        "industry": "Aviation",
    },
     {
        "name": "Maybank",
        "description": "Maybank is a Malaysian universal bank, with key operating home markets of Malaysia, Singapore, and Indonesia.",
        "website": "https://www.maybank.com",
        "logo_url": "https://media.licdn.com/dms/image/D560BAQGuG8j2gA4gGA/company-logo_200_200/0/1689139551408/maybank_logo?e=1730332800&v=beta&t=z9g9c8y7Xp6A4J1kH2oG5fRjW8nK3sV9cZ7lO1B2A3E",
        "industry": "Banking"
    },
    {
        "name": "Petronas",
        "description": "Petroliam Nasional Berhad, commonly known as Petronas, is a Malaysian oil and gas company.",
        "website": "https://www.petronas.com",
        "logo_url": "https://media.licdn.com/dms/image/D560BAQHTfbz5i5B6Rg/company-logo_200_200/0/1701331924639/petronas_logo?e=1730332800&v=beta&t=9x8Ff9d7C6B3jA2eG5hYkRzN5vL0cW3jG1sA7iP9oXk",
        "industry": "Oil & Gas"
    }
]

SAMPLE_SKILLS = ["Python", "JavaScript", "React", "Node.js", "Django", "Flask", "SQL", "NoSQL", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Machine Learning", "Data Analysis", "Project Management", "Agile Methodologies", "Communication", "Teamwork"]
SAMPLE_BENEFITS_LIST = ["Health Insurance", "Dental Insurance", "Vision Insurance", "401(k)", "Paid Time Off", "Flexible Schedule", "Remote Work Options", "Professional Development Assistance", "Gym Membership", "Stock Options"]

FULL_JOB_DESCRIPTIONS = [
    {
        "title": "Senior Backend Engineer (Python/Django)",
        "company": "Grab",
        "type": "Full-time",
        "location": "Kuala Lumpur, Malaysia",
        "description": """
Join Grab's core services team to build and scale the services that power our entire super-app ecosystem. We are looking for an experienced backend engineer who is passionate about building high-quality, scalable, and resilient systems. You will be working on critical projects that impact millions of users across Southeast Asia every day. This role requires deep technical expertise, a strong sense of ownership, and the ability to work in a fast-paced, collaborative environment.
        """,
        "requirements": """
- Bachelor's or Master's degree in Computer Science or a related field.
- 5+ years of professional software development experience.
- Strong proficiency in Python and extensive experience with Django or a similar web framework.
- Deep understanding of system design, data structures, and algorithms.
- Experience with designing, building, and maintaining RESTful APIs.
- Proficient with relational databases (e.g., PostgreSQL, MySQL) and database design.
- Experience with cloud platforms (AWS, GCP, or Azure) and containerization technologies (Docker, Kubernetes) is a strong plus.
- Excellent problem-solving and communication skills.
        """,
        "responsibilities": """
- Design, develop, and maintain high-performance, scalable, and reliable backend services and APIs.
- Write clean, maintainable, and well-tested code.
- Collaborate with product managers, designers, and other engineers to deliver new features and products.
- Own the entire lifecycle of your features, from design and implementation to testing, deployment, and monitoring.
- Mentor junior engineers and contribute to our team's engineering best practices.
- Participate in code reviews to ensure code quality and distribute knowledge.
- Troubleshoot and resolve production issues, and implement solutions to prevent them from recurring.
        """,
        "skills": ["Python", "Django", "SQL", "Docker", "AWS", "RESTful APIs", "System Design"],
        "benefits": ["Health Insurance", "Paid Time Off", "Stock Options", "Flexible Schedule"]
    },
    {
        "title": "Machine Learning Engineer",
        "company": "AirAsia",
        "type": "Full-time",
        "location": "RedQ, Sepang, Malaysia",
        "description": """
AirAsia is on a journey to become a data-driven, digital airline. Our AI/ML team is at the heart of this transformation. We are looking for a skilled Machine Learning Engineer to help us build and deploy machine learning models that solve real-world problems in areas like dynamic pricing, predictive maintenance, crew scheduling, and customer personalization. You will have the opportunity to work with massive datasets and cutting-edge technologies to make a significant impact on the aviation industry.
        """,
        "requirements": """
- Bachelor's, Master's, or PhD in Computer Science, Statistics, Mathematics, or a related quantitative field.
- 3+ years of hands-on experience in building and deploying machine learning models in a production environment.
- Strong programming skills in Python and proficiency with common ML libraries and frameworks (e.g., Scikit-learn, TensorFlow, PyTorch, Keras).
- Experience with the full ML lifecycle: data sourcing and cleaning, feature engineering, model training and evaluation, deployment, and monitoring.
- Solid understanding of ML algorithms, including regression, classification, clustering, and deep learning concepts.
- Experience with big data technologies like Spark, Hadoop, or Dask is highly desirable.
- Familiarity with cloud-based ML platforms (e.g., AWS SageMaker, Google AI Platform, Azure ML).
        """,
        "responsibilities": """
- Research, design, and implement machine learning models to address key business challenges.
- Process and analyze large, complex datasets to extract insights and prepare them for modeling.
- Collaborate with data scientists, data engineers, and business stakeholders to define problems and deliver solutions.
- Deploy, monitor, and maintain ML models in production, ensuring their performance and reliability.
- Stay up-to-date with the latest advancements in the field of machine learning and AI.
- Communicate complex technical concepts and results to both technical and non-technical audiences.
- Develop and maintain data pipelines for model training and inference.
        """,
        "skills": ["Machine Learning", "Python", "TensorFlow", "PyTorch", "SQL", "AWS", "Big Data"],
        "benefits": ["Health Insurance", "Dental Insurance", "Professional Development Assistance", "Remote Work Options"]
    },
    {
        "title": "DevOps Engineer",
        "company": "Maybank",
        "type": "Contract",
        "location": "Menara Maybank, Kuala Lumpur, Malaysia",
        "description": """
As a DevOps Engineer at Maybank, you will be instrumental in automating and streamlining our operations and processes. You will work to build and maintain the CI/CD pipelines for our digital banking applications, ensuring rapid, reliable, and secure delivery of software. This role is crucial for our digital transformation initiatives, enabling our development teams to move faster while maintaining the highest standards of quality and security.
        """,
        "requirements": """
- Proven experience as a DevOps Engineer or similar software engineering role.
- Strong experience with CI/CD tools such as Jenkins, GitLab CI, or Azure DevOps.
- Proficient in scripting languages like Bash, Python, or Groovy.
- Hands-on experience with containerization (Docker) and orchestration (Kubernetes).
- Strong knowledge of cloud infrastructure (AWS, Azure, or GCP), especially in networking, security, and monitoring.
- Experience with infrastructure as code (IaC) tools like Terraform or Ansible.
- Understanding of software development life cycles and agile methodologies.
        """,
        "responsibilities": """
- Design, build, and maintain our CI/CD pipelines to support automated testing and deployment.
- Manage and provision infrastructure through code on our cloud platforms.
- Implement and manage monitoring and alerting solutions to ensure system health and performance.
- Work closely with development teams to ensure new features are built with scalability, reliability, and security in mind.
- Champion DevOps best practices across the engineering organization.
- Automate manual processes to improve efficiency and reduce human error.
- Ensure the security of our infrastructure and applications by implementing security best practices.
        """,
        "skills": ["CI/CD", "Docker", "Kubernetes", "AWS", "Terraform", "Jenkins", "Python"],
        "benefits": ["Health Insurance", "Contract Completion Bonus", "Professional Development Assistance"]
    },
    {
        "title": "Data Analyst",
        "company": "Petronas",
        "type": "Full-time",
        "location": "Kuala Lumpur, Malaysia",
        "description": """
Join the downstream analytics team at Petronas and turn data into actionable insights that drive business decisions. As a Data Analyst, you will be responsible for collecting, analyzing, and interpreting large datasets to identify trends, patterns, and opportunities. You will work on projects ranging from market analysis to operational efficiency, presenting your findings to stakeholders across the organization.
        """,
        "requirements": """
- Bachelor's degree in a quantitative field like Statistics, Economics, Mathematics, or Computer Science.
- 2+ years of experience in a data analyst role.
- Strong proficiency in SQL and experience with large relational databases.
- Experience with data visualization tools like Tableau, Power BI, or Looker.
- Proficiency in at least one scripting language for data analysis (Python or R).
- Excellent analytical and problem-solving skills with a strong attention to detail.
- Strong communication and presentation skills.
        """,
        "responsibilities": """
- Collect and analyze data from various sources to identify key business insights.
- Develop and maintain dashboards and reports to track key performance indicators (KPIs).
- Present data-driven recommendations to business stakeholders in a clear and concise manner.
- Collaborate with business units to understand their data needs and provide analytical support.
- Perform ad-hoc analysis to answer critical business questions.
- Ensure data quality and integrity in all analyses and reports.
- Identify opportunities for process improvements and data-driven strategies.
        """,
        "skills": ["Data Analysis", "SQL", "Tableau", "Power BI", "Python", "Statistics"],
        "benefits": ["Health Insurance", "Vision Insurance", "401(k)", "Gym Membership"]
    }
]


class Command(BaseCommand):
    help = 'Seeds the database with sample data for companies, skills, and jobs.'

    def handle(self, *args, **options):
        self.stdout.write('Starting database seeding...')
        
        # Clean up existing data
        Job.objects.all().delete()
        Company.objects.all().delete()
        Skill.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Successfully cleared existing data.'))

        # Create Skills
        skills = {name: Skill.objects.create(name=name) for name in SAMPLE_SKILLS}
        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(SAMPLE_SKILLS)} skills.'))

        # Create Companies
        companies = {}
        for company_data in SAMPLE_COMPANIES:
            company = Company.objects.create(
                name=company_data['name'],
                description=company_data['description'],
                website=company_data['website'],
                industry=company_data['industry'],
                founded_year=fake.random_int(min=1950, max=2015),
            )

            # Download and save logo
            logo_url = company_data.get('logo_url')
            if logo_url:
                try:
                    response = requests.get(logo_url, timeout=10)
                    response.raise_for_status()
                    file_name = f"{company.name.lower().replace(' ', '_')}_logo.jpg"
                    company.logo.save(file_name, ImageFile(BytesIO(response.content)), save=True)
                    self.stdout.write(f"Successfully downloaded and saved logo for {company.name}")
                except requests.exceptions.RequestException as e:
                    self.stdout.write(self.style.WARNING(f"Could not download logo for {company.name}: {e}"))

            companies[company.name] = company
        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(SAMPLE_COMPANIES)} companies.'))

        # Create Jobs
        for job_data in FULL_JOB_DESCRIPTIONS:
            company_instance = companies.get(job_data['company'])
            if not company_instance:
                self.stdout.write(self.style.WARNING(f"Company '{job_data['company']}' not found. Skipping job '{job_data['title']}'."))
                continue

            # Join the list of benefits into a single string
            benefits_string = "\n".join([f"- {b}" for b in job_data['benefits']])

            job = Job.objects.create(
                title=job_data['title'],
                company=company_instance,
                description=job_data['description'].strip(),
                requirements=job_data['requirements'].strip(),
                responsibilities=job_data['responsibilities'].strip(),
                location=job_data['location'],
                type=job_data['type'],
                status='active',
                posted_at=timezone.now() - timezone.timedelta(days=random.randint(1, 60)),
                salary_min=random.randrange(50000, 80000, 5000),
                salary_max=random.randrange(90000, 150000, 5000),
                benefits=benefits_string
            )
            
            # Add skills
            job_skills = [skills[skill_name] for skill_name in job_data['skills'] if skill_name in skills]
            job.skills.set(job_skills)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(FULL_JOB_DESCRIPTIONS)} detailed jobs.'))
        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!')) 