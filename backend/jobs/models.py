import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


from accounts.models import Company, Resume # Correctly import from accounts


class Job(models.Model):
    class JobType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'Full-time'
        PART_TIME = 'PART_TIME', 'Part-time'
        CONTRACT = 'CONTRACT', 'Contract'
        INTERNSHIP = 'INTERNSHIP', 'Internship'
        TEMPORARY = 'TEMPORARY', 'Temporary'

    class RemoteOption(models.TextChoices):
        ON_SITE = 'ON_SITE', 'On-site'
        HYBRID = 'HYBRID', 'Hybrid'
        REMOTE = 'REMOTE', 'Remote'
        
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.JSONField(default=list, help_text="List of strings detailing job requirements.")
    responsibilities = models.JSONField(default=list, help_text="List of strings detailing job responsibilities.")
    skills = models.ManyToManyField(Skill, blank=True)
    location = models.CharField(max_length=255, blank=True)
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    remote_option = models.CharField(max_length=20, choices=RemoteOption.choices, default=RemoteOption.ON_SITE)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, default='MYR', blank=True)
    is_active = models.BooleanField(default=True)
    application_deadline = models.DateTimeField(null=True, blank=True)
    
    # AI Matching Weights - customizable by employer
    matching_weights = models.JSONField(
        default=dict, 
        blank=True,
        help_text='JSON object for AI matching weights. E.g., {"skills": 0.5, "experience": 0.3, "keywords": 0.2}'
    )

    embedding = models.JSONField(null=True, blank=True, help_text="Vector embedding for this job description.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # The embedding logic has been moved to a separate, offline process
        # or is handled by a different service upon creation.
        # This ensures that saving a job object doesn't trigger a potentially
        # long-running embedding process.
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} at {self.company.name}"


class SavedJob(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'job')
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.email} saved {self.job.title}"


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = 'APPLIED', 'Applied'
        INTERVIEWED = 'INTERVIEWED', 'Interviewed'
        OFFERED = 'OFFERED', 'Offered'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, help_text="The specific resume submitted for this application.")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job', 'applicant')
        ordering = ['-applied_at']

    def __str__(self):
        return f"Application for {self.job.title} by {self.applicant.email}"


class AIAnalysisReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='analysis_reports')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='analysis_reports')
    overall_score = models.IntegerField(help_text="Overall matching score from 0-100, generated by the AI.")
    report_data = models.JSONField(help_text="Full JSON output from the advanced analysis model.")
    report_version = models.CharField(max_length=50, default="1.0", help_text="The version of the analysis model and prompt used.")
    model_name = models.CharField(max_length=100, help_text="Version of the model used (e.g., 'gemini-1.5-pro').")
    is_stale = models.BooleanField(default=False, help_text="True if the resume or job has been updated since this report was generated.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('resume', 'job')
        ordering = ['-created_at']

    def __str__(self):
        return f"AI Report v{self.report_version} for {self.resume.student_profile.user.email} against {self.job.title}"


class AIInterviewReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interview = models.OneToOneField('AIInterview', on_delete=models.CASCADE)
    report_data = models.JSONField(help_text="Comprehensive employer-facing interview report data.")
    created_at = models.DateTimeField(auto_now_add=True)
    report_version = models.CharField(max_length=50, default='1.0', help_text='Version of the report format/LLM prompt.')
    model_name = models.CharField(max_length=100, help_text="Version of the model used (e.g., 'gemini-1.5-pro').")
    overall_score = models.IntegerField(null=True, blank=True, help_text="Overall performance score (0-100).")

    class Meta:
        db_table = 'jobs_aiinterviewreport'
        ordering = ['-created_at']

    def __str__(self):
        return f"AIInterviewReport v{self.report_version} for interview {self.interview.id}"


class AIInterview(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        ERROR = 'ERROR', 'Error'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='interview')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    questions = models.JSONField(default=list, blank=True, help_text="List of generated interview questions.")
    answers = models.JSONField(default=list, blank=True, help_text="List of candidate answers (text/audio reference).")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    report_generated = models.BooleanField(default=False, help_text="True if the employer-facing interview report has been generated.")

    def __str__(self):
        return f"AI Interview for application {self.application.id}"


class InterviewUtterance(models.Model):
    class Speaker(models.TextChoices):
        AI = 'AI', 'AI Interviewer'
        CANDIDATE = 'CANDIDATE', 'Candidate'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interview = models.ForeignKey(AIInterview, on_delete=models.CASCADE, related_name='utterances')
    sequence = models.PositiveIntegerField()
    speaker = models.CharField(max_length=10, choices=Speaker.choices)
    text = models.TextField()
    start_time = models.PositiveIntegerField(help_text="Start time of utterance in seconds from beginning of audio.")
    end_time = models.PositiveIntegerField(help_text="End time of utterance in seconds from beginning of audio.")
    audio_clip_url = models.URLField(max_length=500, blank=True, null=True, help_text="URL to the specific audio clip for this utterance.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['interview', 'sequence']
        unique_together = ('interview', 'sequence')

    def __str__(self):
        return f"{self.speaker} utterance #{self.sequence} in interview {self.interview.id}"


class InterviewReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interview = models.OneToOneField('AIInterview', on_delete=models.CASCADE, related_name='employer_report')
    application = models.ForeignKey('Application', on_delete=models.CASCADE, related_name='interview_reports')
    report_data = models.JSONField(help_text="Comprehensive employer-facing interview report data.")
    created_at = models.DateTimeField(auto_now_add=True)
    version = models.CharField(max_length=20, default='1.0', help_text="Version of the report format/LLM prompt.")

    class Meta:
        unique_together = ('interview', 'application')
        ordering = ['-created_at']

    def __str__(self):
        return f"InterviewReport v{self.version} for interview {self.interview.id} (application {self.application.id})"
