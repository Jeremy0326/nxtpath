import os
import django
from django.core.management.base import BaseCommand
from django.conf import settings
import json

# Set the Django settings module environment variable
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
# django.setup()

from accounts.models import User
from jobs.models import Job, Resume
from jobs.services.ai_analysis_service import ai_analysis_service

class Command(BaseCommand):
    help = 'Tests the AIAnalysisService by generating a report for a specific user and job.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting AI Analysis Service Test..."))

        try:
            # --- Configuration ---
            # For this test, we'll just grab the first student and first active job
            student_user = User.objects.filter(user_type='student').first()
            if not student_user:
                self.stdout.write(self.style.ERROR("No student user found in the database. Please seed the database."))
                return

            # Access student_profile correctly
            if not hasattr(student_user, 'student_profile'):
                 self.stdout.write(self.style.ERROR(f"No student profile found for user {student_user.email}."))
                 return

            primary_resume = Resume.objects.filter(student_profile=student_user.student_profile, is_primary=True).first()
            if not primary_resume:
                self.stdout.write(self.style.ERROR(f"No primary resume found for user {student_user.email}."))
                return
                
            job = Job.objects.filter(is_active=True).first()
            if not job:
                self.stdout.write(self.style.ERROR("No active job found in the database. Please seed the database."))
                return

            self.stdout.write(f"Found Student: {student_user.email}")
            self.stdout.write(f"Found Resume ID: {primary_resume.id}")
            self.stdout.write(f"Found Job: {job.title} at {job.company.name}")
            self.stdout.write(self.style.NOTICE("Calling AIAnalysisService.get_or_create_analysis... (This may take a moment)"))

            # --- Execute the Service ---
            report = ai_analysis_service.get_or_create_analysis(primary_resume, job)

            # --- Print Results ---
            if report and report.report_data:
                self.stdout.write(self.style.SUCCESS("Successfully generated or retrieved AI Analysis Report!"))
                self.stdout.write(f"  Report ID: {report.id}")
                self.stdout.write(f"  Report Version: {report.report_version}")
                self.stdout.write(f"  Overall Score: {report.overall_score}")
                
                # Pretty-print the JSON report data
                self.stdout.write(self.style.NOTICE("\n--- Full Report Data ---"))
                pretty_report_data = json.dumps(report.report_data, indent=2)
                self.stdout.write(pretty_report_data)
                
                if "error" in report.report_data:
                    self.stdout.write(self.style.WARNING("\nNote: The report was generated, but contains an error from the LLM service."))
                
            else:
                self.stdout.write(self.style.ERROR("Failed to generate or retrieve the report."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An unexpected error occurred: {e}"))
            import traceback
            traceback.print_exc() 