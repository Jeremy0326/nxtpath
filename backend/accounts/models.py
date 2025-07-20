import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)


class University(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    location = models.CharField(max_length=255, blank=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    website = models.URLField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Universities"


class Company(models.Model):
    class CompanySize(models.TextChoices):
        SEED = 'SEED', 'Seed (1-10 employees)'
        STARTUP = 'STARTUP', 'Startup (11-50 employees)'
        SCALEUP = 'SCALEUP', 'Scale-up (51-250 employees)'
        MID_SIZE = 'MID_SIZE', 'Mid-size (251-1000 employees)'
        LARGE = 'LARGE', 'Large (1001-5000 employees)'
        ENTERPRISE = 'ENTERPRISE', 'Enterprise (5001+ employees)'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    website = models.URLField(max_length=255, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=255, blank=True)
    size = models.CharField(max_length=20, choices=CompanySize.choices, blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    gallery_urls = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Companies"


class User(AbstractUser):
    class UserType(models.TextChoices):
        STUDENT = 'student', 'Student'
        EMPLOYER = 'employer', 'Employer'
        UNIVERSITY = 'university', 'University Staff'
        ADMIN = 'admin', 'Admin'

    # Set username to None to use email as the primary identifier
    username = None
    email = models.EmailField('email address', unique=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] # No other fields required besides email and password
    
    objects = CustomUserManager()

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_type = models.CharField(max_length=10, choices=UserType.choices, default=UserType.STUDENT)
    full_name = models.CharField(max_length=255, blank=True)
    profile_picture_url = models.URLField(max_length=500, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email

    # For backward compatibility in code that expects `role`
    @property
    def role(self):
        return self.user_type


class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True, related_name='student_profile')
    university = models.ForeignKey(University, on_delete=models.SET_NULL, null=True, blank=True)
    major = models.CharField(max_length=100, blank=True)
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    skills = models.JSONField(default=list, blank=True) # Consider a many-to-many Skill model instead
    interests = models.JSONField(default=list, blank=True, help_text="A list of the student's personal interests or hobbies.")
    career_preferences = models.JSONField(default=dict, blank=True, help_text="Structured data on career goals, like desired roles, industries, etc.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}'s Student Profile"

class Resume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='resumes')
    file_url = models.URLField(max_length=500)
    file_name = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # AI-related fields
    parsed_text = models.TextField(blank=True, help_text="The full text extracted from the resume file.")
    is_parsed = models.BooleanField(default=False)
    embedding = models.JSONField(null=True, blank=True, help_text="Vector embedding for the resume's text.")

    class Meta:
        ordering = ['-uploaded_at']

    def save(self, *args, **kwargs):
        if self.is_primary:
            # Ensure only one resume is primary for a student
            Resume.objects.filter(student_profile=self.student_profile, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        
        # If there's parsed text and no embedding, generate one.
        if self.parsed_text and not self.embedding:
            from jobs.services.embedding_service import embedding_service # Local import to avoid circular dependency
            self.embedding = embedding_service.get_embedding(self.parsed_text)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Resume ({self.file_name or 'unnamed'}) for {self.student_profile.user.email}"


class EmployerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True, related_name='employer_profile')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True)
    role = models.CharField(max_length=100, blank=True) # e.g., 'Hiring Manager', 'Recruiter'
    is_company_admin = models.BooleanField(default=False) # Can manage company details and other employers
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}'s Employer Profile at {self.company.name if self.company else 'N/A'}"


class UniversityStaffProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True, related_name='university_staff_profile')
    university = models.ForeignKey(University, on_delete=models.CASCADE)
    role = models.CharField(max_length=100, blank=True) # e.g., 'Career Services Advisor'
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}'s Staff Profile at {self.university.name}"


class CompanyJoinRequest(models.Model):
    class RequestStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='join_requests')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='join_requests')
    status = models.CharField(max_length=10, choices=RequestStatus.choices, default=RequestStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Join request from {self.user.email} to {self.company.name}"


class UniversityJoinRequest(models.Model):
    class RequestStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='university_join_requests')
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='join_requests')
    status = models.CharField(max_length=10, choices=RequestStatus.choices, default=RequestStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Join request from {self.user.email} to {self.university.name}"


class Connection(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_connections')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_connections')
    message = models.TextField(blank=True, help_text="Optional message from employer to student")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('employer', 'student')
        ordering = ['-created_at']

    def __str__(self):
        return f"Connection from {self.employer.email} to {self.student.email} ({self.status})"
