from rest_framework import serializers
from jobs.models import Job, Application
from jobs.serializers import SkillSerializer, CompanySummarySerializer
from accounts.serializers import UserSerializer
from django.utils import timezone
from jobs.services.embedding_service import embedding_service
from accounts.models import StudentProfile
from jobs.models import Application
from accounts.serializers import UniversitySerializer, ResumeSerializer

class EmployerJobSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    applicants_count = serializers.IntegerField(read_only=True)
    status = serializers.SerializerMethodField()
    skill_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'location', 'job_type', 'is_active', 'description',
            'requirements', 'responsibilities', 'salary_min', 'salary_max', 'currency',
            'created_at', 'application_deadline', 'skills', 
            'applicants_count', 'status', 'skill_ids'
        ]
        read_only_fields = ['id', 'created_at', 'applicants_count', 'status', 'skills']

    def get_status(self, obj):
        if obj.is_active:
            if obj.application_deadline and obj.application_deadline < timezone.now():
                return 'closed'
            return 'active'
        return 'draft'

    def create(self, validated_data):
        skill_ids = validated_data.pop('skill_ids', [])
        job = Job.objects.create(**validated_data)
        if skill_ids:
            job.skills.set(skill_ids)
        return job

    def update(self, instance, validated_data):
        skill_ids = validated_data.pop('skill_ids', None)
        # Check if any fields that affect embeddings have changed
        embedding_fields = ['title', 'description', 'requirements', 'responsibilities']
        has_changed = any(getattr(instance, field) != validated_data.get(field, getattr(instance, field)) for field in embedding_fields)

        instance = super().update(instance, validated_data)

        if skill_ids is not None:
            instance.skills.set(skill_ids)
            has_changed = True

        if has_changed:
            # Trigger re-embedding
            embedding_service.embed_job(instance)
            
        return instance

class CandidateSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    university = UniversitySerializer(read_only=True)
    latest_application = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = ('user', 'university', 'major', 'graduation_year', 'skills', 'latest_application')

    def get_skills(self, obj):
        skills = obj.skills or []
        if skills and isinstance(skills[0], dict) and 'name' in skills[0]:
            return skills
        return [{'name': s} for s in skills]

    def get_latest_application(self, obj):
        company = self.context.get('company')
        job_id = self.context.get('job_id')

        application_query = Application.objects.filter(
            applicant=obj.user,
            job__company=company
        )

        if job_id and job_id != 'all':
            application_query = application_query.filter(job_id=job_id)

        latest_app = application_query.order_by('-applied_at').first()
        
        if latest_app:
            # Annotate the resume used for this specific application
            resume_file_name = latest_app.resume.file_name if latest_app.resume else None
            
            return {
                'application_id': latest_app.id,
                'job_id': latest_app.job.id,
                'job_title': latest_app.job.title,
                'status': latest_app.status.lower() if latest_app.status else '',
                'applied_at': latest_app.applied_at,
                'match_score': getattr(latest_app, 'ai_match_score', None),
                'resume_file_name': resume_file_name
            }
        return None

class JobMatchingWeightageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ['matching_weights']

    def validate_matching_weights(self, value):
        weights = value or {}
        skills = weights.get('skills', 0)
        experience = weights.get('experience', 0)
        education = weights.get('education', 0)

        if not all(isinstance(v, (int, float)) for v in [skills, experience, education]):
            raise serializers.ValidationError("All weights must be numbers.")

        if sum([skills, experience, education]) != 100:
            raise serializers.ValidationError("The sum of all weights must be 100.")
            
        return value

class ApplicantJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ['id', 'title']

class ApplicationSerializer(serializers.ModelSerializer):
    applicant = UserSerializer(read_only=True)
    job = ApplicantJobSerializer(read_only=True)
    ai_match_score = serializers.IntegerField(read_only=True)
    major = serializers.SerializerMethodField()
    resume = ResumeSerializer(read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'applicant', 'job', 'status', 'applied_at', 'ai_match_score', 'resume', 'major'
        ]

    def get_major(self, obj):
        # Defensive: applicant may not have a student_profile
        student_profile = getattr(obj.applicant, 'student_profile', None)
        return getattr(student_profile, 'major', None) if student_profile else None 