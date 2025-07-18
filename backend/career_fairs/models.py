import uuid
from django.db import models
from django.utils import timezone
from accounts.models import Company, User, University

class CareerFair(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    host_university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='hosted_fairs')
    start_date = models.DateField()
    end_date = models.DateField()
    location = models.CharField(max_length=255, blank=True)
    website = models.URLField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    banner_image_url = models.URLField(max_length=500, blank=True, null=True)
    floor_plan_url = models.URLField(max_length=500, blank=True, null=True)
    grid_width = models.PositiveIntegerField(default=10)
    grid_height = models.PositiveIntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} at {self.host_university.name}"

class BoothJob(models.Model):
    """
    Custom intermediate model for Booth-Job relationship with UUID primary key
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booth = models.ForeignKey('Booth', on_delete=models.CASCADE, related_name='booth_job_relationships')
    job = models.ForeignKey('jobs.Job', on_delete=models.CASCADE, related_name='booth_job_relationships')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('booth', 'job')
        db_table = 'career_fairs_booth_jobs'
    
    def __str__(self):
        return f"{self.booth.company.name} - {self.job.title}"

class Booth(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fair = models.ForeignKey(CareerFair, on_delete=models.CASCADE, related_name='booths')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='career_fair_booths')
    jobs = models.ManyToManyField('jobs.Job', blank=True, related_name='booths', through=BoothJob)
    label = models.CharField(max_length=50, blank=True)
    booth_number = models.CharField(max_length=10, blank=True, null=True)  # Assigned by host university
    x = models.PositiveIntegerField(default=0)  # Location coordinates assigned by host university
    y = models.PositiveIntegerField(default=0)  # Location coordinates assigned by host university
    width = models.PositiveIntegerField(default=1)
    height = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('fair', 'company')

    def __str__(self):
        return f"{self.booth_number or self.company.name} Booth at {self.fair.title}"

class StudentInterest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booth = models.ForeignKey(Booth, on_delete=models.CASCADE, related_name='interested_students')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interests')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('booth', 'student')

    def __str__(self):
        return f"{self.student.email} interested in {self.booth.company.name}"
