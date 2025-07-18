from rest_framework import serializers
from .models import Skill, Job, Application, AIAnalysisReport, AIInterview, AIInterviewReport
from accounts.models import Company

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class CompanySummarySerializer(serializers.ModelSerializer):
    """
    A lightweight serializer for embedding company info in other serializers.
    """
    class Meta:
        model = Company
        fields = ['id', 'name', 'logo_url', 'location']


class AIInterviewSerializer(serializers.ModelSerializer):
    """Serializer for AI Interview objects."""
    
    class Meta:
        model = AIInterview
        fields = ['id', 'status', 'questions', 'answers', 'started_at', 'completed_at']


class JobSerializer(serializers.ModelSerializer):
    company = CompanySummarySerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    vector_score = serializers.SerializerMethodField()
    ai_match_score = serializers.SerializerMethodField()

    def get_vector_score(self, obj):
        scores = self.context.get('vector_scores', {})
        score = scores.get(str(obj.id))
        return round(score, 1) if score is not None else None

    def get_ai_match_score(self, obj):
        # Get the current user and their primary resume
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not hasattr(user, 'student_profile'):
            return None
        primary_resume = user.student_profile.resumes.filter(is_primary=True).first()
        if not primary_resume:
            return None
        from .models import AIAnalysisReport
        report = AIAnalysisReport.objects.filter(resume=primary_resume, job=obj).order_by('-created_at').first()
        if report and report.overall_score is not None:
            return report.overall_score
        return None

    class Meta:
        model = Job
        fields = [
            'id', 'company', 'title', 'description', 'requirements', 
            'responsibilities', 'skills', 'location', 'job_type', 
            'remote_option', 'salary_min', 'salary_max', 'currency', 
            'is_active', 'application_deadline', 'created_at', 'vector_score',
            'ai_match_score',
        ]


class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    job_id = serializers.UUIDField(write_only=True, required=True)
    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)
    interview_status = serializers.SerializerMethodField()
    interview_id = serializers.SerializerMethodField()
    interview_answers = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = [
            'id', 'job', 'job_id', 'applicant', 'applicant_email', 'resume', 
            'status', 'applied_at', 'interview_status', 'interview_id', 'interview_answers'
        ]
        read_only_fields = ('applicant',)

    def get_interview_status(self, obj):
        # The related_name on the Application foreign key in AIInterview is 'interview'
        if hasattr(obj, 'interview') and obj.interview:
            return obj.interview.status
        return 'PENDING' # Default status if no interview object exists yet

    def get_interview_id(self, obj):
        if hasattr(obj, 'interview') and obj.interview:
            return obj.interview.id
        return None

    def get_interview_answers(self, obj):
        if hasattr(obj, 'interview') and obj.interview:
            return obj.interview.answers
        return []

    def get_canonical_status(self, obj):
        mapping = {
            'APPLIED': 'applied',
            'INTERVIEWED': 'interviewed',
            'OFFERED': 'offered',
            'REJECTED': 'rejected',
        }
        return mapping.get(obj.status, 'applied')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['status'] = self.get_canonical_status(instance)
        return data

    def create(self, validated_data):
        job_id = validated_data.pop('job_id')
        job = Job.objects.get(pk=job_id)
        validated_data['job'] = job
        return super().create(validated_data)


class AIAnalysisReportSerializer(serializers.ModelSerializer):
    """Serializer for AI Analysis Reports that transforms backend data to frontend format."""
    
    class Meta:
        model = AIAnalysisReport
        fields = ['id', 'overall_score', 'report_data', 'report_version', 'model_name', 'created_at']

    def to_representation(self, instance):
        """Output the new grouped JSON structure for the AI match report."""
        data = super().to_representation(instance)
        # The report_data is now already grouped as {shared, student_view, employer_view}
        grouped = data.get('report_data', {})
        
        # Move overall_score to top level for frontend compatibility
        if 'shared' in grouped and 'overall_score' in grouped['shared']:
            grouped['overall_score'] = grouped['shared']['overall_score']
        
        grouped['id'] = data['id']
        grouped['report_version'] = data['report_version']
        grouped['model_name'] = data['model_name']
        grouped['created_at'] = data['created_at']
        return grouped
    
    def _transform_insights(self, insights):
        """Transform career insights to frontend format."""
        transformed = []
        for insight in insights:
            transformed.append({
                'type': insight.get('type', 'strength'),
                'title': insight.get('title', ''),
                'description': insight.get('description', ''),
                'impact': insight.get('impact', 'medium')
            })
        return transformed
    
    def _transform_recommendations(self, recommendations):
        """Transform personalized recommendations to frontend format."""
        transformed = []
        for rec in recommendations:
            transformed.append({
                'category': rec.get('category', 'skill_development'),
                'title': rec.get('title', ''),
                'description': rec.get('description', ''),
                'priority': rec.get('priority', 'medium')
            })
        return transformed
    
    def _transform_preferences_insights(self, insights):
        """Transform career preferences insights to frontend format."""
        transformed = []
        for insight in insights:
            transformed.append({
                'preference_type': insight.get('preference_type', 'industry'),
                'match_level': insight.get('match_level', 'moderate'),
                'title': insight.get('title', ''),
                'description': insight.get('description', ''),
                'impact': insight.get('impact', 'medium')
            })
        return transformed

    def _transform_flags(self, flags):
        """Transform risk/opportunity flags to frontend format."""
        transformed = []
        for flag in flags:
            transformed.append({
                'type': flag.get('type', ''),
                'title': flag.get('title', ''),
                'description': flag.get('description', ''),
                'impact': flag.get('impact', 'medium')
            })
        return transformed 

class AIInterviewReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInterviewReport
        fields = ['id', 'interview', 'report_data', 'created_at', 'report_version', 'model_name', 'overall_score']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        report = data.get('report_data', {})
        # Flatten key fields for frontend
        data['overall_score'] = data.get('overall_score') or report.get('overall_score')
        data['report_version'] = data.get('report_version')
        data['model_name'] = data.get('model_name')
        data['created_at'] = data.get('created_at')
        # Optionally flatten more fields if needed
        return data 