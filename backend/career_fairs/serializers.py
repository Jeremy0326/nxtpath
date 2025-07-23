from rest_framework import serializers
from .models import CareerFair, Booth, StudentInterest, BoothJob
from jobs.serializers import JobSerializer
from accounts.models import Company
from accounts.serializers import UserSerializer, CompanySerializer

class CompanySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ('id', 'name', 'logo_url')

class BoothJobSerializer(serializers.ModelSerializer):
    """
    Serializer for the intermediate BoothJob model
    """
    class Meta:
        model = BoothJob
        fields = ('id', 'booth', 'job', 'created_at')
        read_only_fields = ('id', 'created_at')

class BoothUpdateSerializer(serializers.ModelSerializer):
    job_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )

    class Meta:
        model = Booth
        fields = ('job_ids', 'label', 'x', 'y', 'width', 'height')

    def update(self, instance, validated_data):
        job_ids = validated_data.pop('job_ids', None)
        if job_ids is not None:
            # Clear existing relationships
            instance.jobs.clear()
            # Add new relationships through the intermediate model
            for job_id in job_ids:
                try:
                    from jobs.models import Job
                    job = Job.objects.get(id=job_id)
                    BoothJob.objects.get_or_create(booth=instance, job=job)
                except Job.DoesNotExist:
                    # Skip if job doesn't exist
                    continue
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class BoothFairSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerFair
        fields = ('id', 'title', 'floor_plan_url', 'start_date', 'end_date', 'location', 'banner_image_url')

class BoothSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    jobs = JobSerializer(many=True, read_only=True)
    fair = BoothFairSummarySerializer(read_only=True)

    class Meta:
        model = Booth
        fields = ('id', 'company', 'jobs', 'label', 'booth_number', 'x', 'y', 'width', 'height', 'created_at', 'updated_at', 'fair')

class CareerFairSerializer(serializers.ModelSerializer):
    booths = BoothSerializer(many=True, read_only=True)
    host_university = serializers.StringRelatedField()
    university_name = serializers.CharField(source='host_university.name', read_only=True)
    is_registered = serializers.BooleanField(read_only=True)

    class Meta:
        model = CareerFair
        fields = (
            'id', 'title', 'description', 'start_date', 'end_date', 'location', 
            'website', 'is_active', 'banner_image_url', 'floor_plan_url', 
            'grid_width', 'grid_height', 'host_university', 'university_name',
            'booths', 'is_registered'
        )
        read_only_fields = ('is_registered',)


class StudentInterestSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    booth_id = serializers.UUIDField(write_only=True)
    company_name = serializers.CharField(source='booth.company.name', read_only=True)
    booth_number = serializers.CharField(source='booth.booth_number', read_only=True)

    class Meta:
        model = StudentInterest
        fields = ('id', 'booth_id', 'student', 'company_name', 'booth_number', 'timestamp') 