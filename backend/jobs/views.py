from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework import viewsets, permissions, status, generics, mixins, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import Job, Application, Skill, AIAnalysisReport, SavedJob, AIInterview, AIInterviewReport
from .serializers import JobSerializer, ApplicationSerializer, SkillSerializer, AIAnalysisReportSerializer, AIInterviewSerializer, AIInterviewReportSerializer
from .permissions import IsEmployerOrReadOnly
from .services.ai_analysis_service import ai_analysis_service
from accounts.models import Resume
from .services.embedding_service import embedding_service
from django.db import models
from django.db.models import Q
from django.conf import settings
from django.utils import timezone
from .services.vector_scoring_service import VectorScoringService
vector_scoring_service = VectorScoringService()
from django.db import transaction
from .services.ai_interview_service import interview_service
from .services.ai_interview_service import ai_interview_service

import os
import uuid
import logging
from django.conf import settings
from django.core.files.storage import default_storage
from django.http import HttpResponse
import tempfile
import subprocess
import json
from google.cloud import speech, texttospeech
from google.cloud import storage
import wave
import io

# Fallback STT for development
try:
    import speech_recognition as sr
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    SPEECH_RECOGNITION_AVAILABLE = False

logger = logging.getLogger(__name__)

# Basic API views for the new models

class SkillListAPIView(generics.ListAPIView):
    """
    Provides a read-only list of all available skills.
    """
    queryset = Skill.objects.all().order_by('name')
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]


class JobViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Jobs.
    - Provides list, retrieve, create, update, destroy actions.
    - Custom action analysis to get or create an AI match report.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['job_type', 'company__industry', 'location', 'remote_option']
    search_fields = ['title', 'description', 'skills__name']
    ordering_fields = ['created_at', 'salary_min', 'salary_max']
    queryset = Job.objects.filter(is_active=True).select_related('company').prefetch_related('skills')
    serializer_class = JobSerializer
    permission_classes = [IsEmployerOrReadOnly]

    def get_queryset(self):
        """
        Optionally restricts the returned jobs,
        by filtering against a search query parameter in the URL.
        """
        queryset = super().get_queryset()
        
        # Keyword search
        search = self.request.query_params.get('keyword') or self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(company__name__icontains=search) |
                Q(skills__name__icontains=search)
            ).distinct()

        # Multi-choice filters
        job_types = self.request.query_params.getlist('job_type[]')
        if job_types:
            queryset = queryset.filter(job_type__in=job_types)
        
        # Single-choice filters
        industry = self.request.query_params.get('industry')
        if industry:
            queryset = queryset.filter(company__industry__iexact=industry)
            
        company_size = self.request.query_params.get('company_size')
        if company_size:
            queryset = queryset.filter(company__size=company_size)

        remote_option = self.request.query_params.get('remote_option')
        if remote_option:
            queryset = queryset.filter(remote_option=remote_option)
            
        # Range filters
        salary_min = self.request.query_params.get('salary_min')
        if salary_min:
            queryset = queryset.filter(salary_min__gte=salary_min)
            
        salary_max = self.request.query_params.get('salary_max')
        if salary_max and int(salary_max) > 0:
            queryset = queryset.filter(salary_max__lte=salary_max)
            
        # Sorting
        sort_by = self.request.query_params.get('sort_by')
        if sort_by == 'salary-desc':
            queryset = queryset.order_by('-salary_max')
        elif sort_by == 'salary-asc':
            queryset = queryset.order_by('salary_min')
        elif sort_by == 'match':
            # Placeholder for AI match sorting
            queryset = queryset.order_by('-created_at')
        else:  # 'recent' or default
            queryset = queryset.order_by('-created_at')

        return queryset
    
    def perform_create(self, serializer):
        """Only employers can create jobs for their company."""
        if not hasattr(self.request.user, 'employer_profile'):
            raise permissions.PermissionDenied("You must be an employer to post a job.")
        serializer.save(company=self.request.user.employer_profile.company)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        user = request.user
        # Find active resume
        primary_resume = getattr(getattr(user, 'student_profile', None), 'resumes', None)
        primary_resume = primary_resume.filter(is_primary=True).first() if primary_resume else None
        resume_id = str(primary_resume.id) if primary_resume and primary_resume.embedding else None

        job_ids = [str(job.id) for job in page] if page is not None else [str(job.id) for job in queryset]
        vector_scores = vector_scoring_service.batch_score_jobs(resume_id, job_ids) if resume_id else {}

        serializer = self.get_serializer(page, many=True, context={'vector_scores': vector_scores, 'request': request}) if page is not None else self.get_serializer(queryset, many=True, context={'vector_scores': vector_scores, 'request': request})
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def analysis(self, request, pk=None):
        """
        Get or create an AI analysis report for the current user against this job.
        """
        job = self.get_object()
        user = request.user

        if not hasattr(user, 'student_profile'):
                return Response(
                {"error": "User does not have a student profile."},
                status=status.HTTP_400_BAD_REQUEST
                )
            
        primary_resume = user.student_profile.resumes.filter(is_primary=True).first()
        if not primary_resume:
                return Response(
                {"error": "No primary resume found for the user. Please upload a resume."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
        try:
            report = ai_analysis_service.get_or_create_analysis(primary_resume, job)
            serializer = AIAnalysisReportSerializer(report)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            # Log the exception
            return Response(
            {"error": "An unexpected error occurred while generating the analysis report.", "details": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    # ---------------- Saved job actions ----------------

    @action(detail=True, methods=['get', 'post', 'delete'], permission_classes=[permissions.IsAuthenticated])
    def save(self, request, pk=None):
        """GET: check if saved, POST: save job, DELETE: unsave job"""
        job = self.get_object()
        user = request.user

        if request.method.lower() == 'get':
            is_saved = SavedJob.objects.filter(user=user, job=job).exists()
            return Response({'isSaved': is_saved}, status=status.HTTP_200_OK)

        if request.method.lower() == 'post':
            SavedJob.objects.get_or_create(user=user, job=job)
            return Response({'detail': 'Job saved.'}, status=status.HTTP_201_CREATED)

        if request.method.lower() == 'delete':
            SavedJob.objects.filter(user=user, job=job).delete()
            return Response({'detail': 'Job unsaved.'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='saved')
    def list_saved(self, request):
        """Return list of saved jobs for the current user"""
        queryset = SavedJob.objects.filter(user=request.user).select_related('job').order_by('-saved_at')
        page = self.paginate_queryset(queryset)
        serializer = SavedJobSerializer(page, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    # ---------------- AI match aliases ----------------

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='ai-match')
    def ai_match(self, request, pk=None):
        """Alias for analysis endpoint expected by the legacy frontend"""
        return self.analysis(request, pk)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='ai-match')
    def list_ai_match(self, request):
        """Return a list of jobs ordered by AI match score (simplified placeholder)."""
        limit = int(request.query_params.get('limit', 10))
        force_reparse = request.query_params.get('force_reparse', 'false').lower() == 'true'
            
        # Placeholder implementation: return the most recent active jobs
        jobs_qs = Job.objects.filter(is_active=True).order_by('-created_at')[:limit]
        serializer = JobSerializer(jobs_qs, many=True, context={'request': request})
        return Response({'results': serializer.data})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='top-matches')
    def top_matches(self, request):
        limit = int(request.query_params.get('limit', 10))
        jobs_qs = Job.objects.filter(is_active=True).order_by('-created_at')[:limit]
        serializer = JobSerializer(jobs_qs, many=True, context={'request': request})
        return Response({'top_matches': serializer.data})

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='vector-score')
    def vector_score(self, request, pk=None):
        """
        Return the best available match score for this job and the given resume (cv_id):
        - If LLM analysis exists, return its score and source 'llm'.
        - Else, return vector score and source 'vector'.
        - If embeddings are missing, return {processing: true} with 202 status.
        """
        job = self.get_object()
        cv_id = request.query_params.get('cv_id') or request.query_params.get('resume_id')
        if not cv_id:
            return Response({'error': 'cv_id (resume_id) is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            resume = Resume.objects.get(id=cv_id, student_profile__user=request.user)
        except Resume.DoesNotExist:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
        # 1. Check for LLM analysis
        report = AIAnalysisReport.objects.filter(resume=resume, job=job).order_by('-created_at').first()
        if report and report.overall_score is not None:
            return Response({'score': report.overall_score, 'source': 'llm', 'processing': False}, status=status.HTTP_200_OK)
        # 2. Vector score fallback
        score = vector_scoring_service.get_job_score(str(resume.id), str(job.id))
        if score is not None:
            return Response({'score': round(score, 1), 'source': 'vector', 'processing': False}, status=status.HTTP_200_OK)
        # 3. Embeddings missing or not ready
        if not resume.embedding or not job.embedding:
            return Response({'processing': True}, status=status.HTTP_202_ACCEPTED)
        # 4. Should not reach here, but fallback
        return Response({'processing': True}, status=status.HTTP_202_ACCEPTED)


# ---------------- Additional API Views -------------------------------------------


# Simple serializer for Resume (placed here to avoid circular imports)
class ResumeSerializer(serializers.ModelSerializer):
    original_filename = serializers.CharField(source='file_name')
    file_url = serializers.SerializerMethodField()

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file_url and request:
            if obj.file_url.startswith("http"):
                return obj.file_url
            return request.build_absolute_uri(obj.file_url)
        return obj.file_url

    class Meta:
        model = Resume
        fields = ['id', 'original_filename', 'file_url', 'uploaded_at', 'is_primary', 'is_parsed']
# -----------------------------------------------------------------------------


class MyApplicationsAPIView(generics.ListAPIView):
    """List the authenticated user's applications (legacy /my-applications/ endpoint)."""

    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(applicant=self.request.user).select_related('job', 'resume').order_by('-applied_at')


class ActiveResumeAPIView(generics.RetrieveAPIView):
    """Return the authenticated user's current primary resume (legacy /cv/active/ endpoint)."""

    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        student_profile = getattr(self.request.user, 'student_profile', None)
        if not student_profile:
            raise Http404
        resume = student_profile.resumes.filter(is_primary=True).first()
        if resume:
            return resume
        raise Http404

class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Applications.
    """
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Users can only see their own applications."""
        return Application.objects.filter(applicant=self.request.user).select_related('job', 'resume', 'job__company', 'interview')

    def perform_create(self, serializer):
        """Assign the current user as the applicant and create the AI interview."""
        application = serializer.save(applicant=self.request.user)
        try:
            # Automatically start the AI interview creation process
            interview_service.start_interview(application)
            logger.info(f"Successfully triggered AI interview for application {application.id}")
        except Exception as e:
            # Log the error but don't fail the application process
            logger.error(f"Failed to automatically start AI interview for application {application.id}: {e}", exc_info=True)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='start-interview')
    def start_interview(self, request, pk=None):
        """Start an AI interview for this application (generate questions, create session)."""
        application = self.get_object()
        try:
            interview = interview_service.start_interview(application)
            return Response({
                'interview_id': str(interview.id),
                'questions': interview.questions,
                'status': interview.status,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='interview')
    def get_interview(self, request, pk=None):
        """
        Gets the current state of an interview for an application.
        """
        application = self.get_object()
        interview = get_object_or_404(AIInterview, application=application)
        serializer = AIInterviewSerializer(interview)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=True, 
        methods=['post'], 
        permission_classes=[permissions.IsAuthenticated], 
        parser_classes=[MultiPartParser, FormParser], # Add parsers for file upload
        url_path='submit-answer'
    )
    def submit_answer(self, request, pk=None):
        """
        Submits an answer (text and optional audio) and gets the next question.
        Accepts multipart/form-data.
        """
        application = self.get_object()
        interview = get_object_or_404(AIInterview, application=application)
        
        answer_text = request.data.get('text', '')
        if not answer_text:
            return Response({'error': 'Answer text is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare answer data with text and timestamp
        answer_data = {'text': answer_text, 'timestamp': timezone.now().isoformat()}

        # Handle optional audio file upload
        audio_file = request.FILES.get('audio')
        if audio_file:
            try:
                # Use a unique filename for the uploaded audio
                ext = os.path.splitext(audio_file.name)[-1] if '.' in audio_file.name else '.webm'
                file_name = f"interview_answers/{application.id}/{uuid.uuid4()}{ext}"
                
                # Save the file using Django's default storage
                file_path = default_storage.save(file_name, audio_file)
                audio_url = default_storage.url(file_path)
                
                # Add the audio URL to the answer data
                answer_data['audio_url'] = audio_url
                logger.info(f"Saved interview answer audio for application {pk} to {audio_url}")

            except Exception as e:
                logger.error(f"Failed to save interview answer audio for application {pk}: {e}", exc_info=True)
                # Decide if this should be a critical error or just a warning
                # For now, we'll log it and continue without the audio
        
        try:
            updated_interview = interview_service.submit_answer_and_get_next_question(interview, answer_data)
            serializer = AIInterviewSerializer(updated_interview)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error submitting answer for interview {interview.id}: {e}", exc_info=True)
            return Response({'error': 'Failed to process answer and get next question.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='generate-ai-interview-report')
    def generate_ai_interview_report(self, request, pk=None):
        """
        Finalizes the interview and generates the comprehensive AI interview report (employer-facing).
        """
        application = self.get_object()
        interview = get_object_or_404(AIInterview, application=application)
        try:
            report = ai_interview_service.generate_final_report(interview.id)
            serializer = AIInterviewReportSerializer(report)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error generating AI interview report for application {pk}: {e}", exc_info=True)
            return Response({'error': 'Failed to generate AI interview report.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='ai-interview-report')
    def get_ai_interview_report(self, request, pk=None):
        """
        Retrieves the final AI interview report for a completed interview.
        """
        application = self.get_object()
        interview = get_object_or_404(AIInterview, application=application)
        report = AIInterviewReport.objects.filter(interview=interview).order_by('-created_at').first()
        if not report:
            return Response({'error': 'No AI interview report found for this application.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AIInterviewReportSerializer(report)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated], parser_classes=[MultiPartParser], url_path='upload-audio')
    def upload_audio(self, request, pk=None):
        """
        Handles raw audio blob uploads from the frontend, saves it, and returns the URL.
        """
        if 'audio' not in request.FILES:
            return Response({'error': 'No audio file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        audio_file = request.FILES['audio']
        
        # Log content type for debugging
        logger.info(f"Received audio file with content type: {audio_file.content_type}")

        # Basic validation for audio content types
        allowed_content_types = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']
        if not any(audio_file.content_type.startswith(allowed) for allowed in allowed_content_types):
            logger.warning(f"Unsupported audio content type: {audio_file.content_type}")
            return Response(
                {'error': f'Unsupported audio format: {audio_file.content_type}. Please use one of: {", ".join(allowed_content_types)}'},
                status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
            )

        try:
            # Generate a unique filename
            ext = 'webm' # Default extension
            if audio_file.name:
                file_ext = audio_file.name.split('.')[-1]
                if file_ext in ['mp4', 'mp3', 'wav', 'ogg']:
                    ext = file_ext

            file_name = f"interview_audio/{uuid.uuid4()}.{ext}"
            
            # Save the file using Django's default storage
            file_path = default_storage.save(file_name, audio_file)
            audio_url = default_storage.url(file_path)

            return Response({'audio_url': audio_url}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error saving uploaded audio file: {e}", exc_info=True)
            return Response({'error': 'Failed to save audio file.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='stt')
    def stt(self, request, pk=None):
        """
        Speech-to-Text: Accept an audio file, return transcript.
        """
        logger.info(f"[STT] Application {pk}, FILES: {list(request.FILES.keys())}, DATA: {list(request.data.keys())}")
        audio_file = request.FILES.get('audio')
        if not audio_file:
            logger.error("[STT] No audio file found in request.")
            return Response({'error': 'No audio file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        logger.info(f"[STT] Received audio: name={getattr(audio_file, 'name', None)}, content_type={getattr(audio_file, 'content_type', None)}, size={getattr(audio_file, 'size', None)}")
        # Accept any file where the content_type contains a common audio substring
        content_type = (audio_file.content_type or '').lower()
        allowed = any(sub in content_type for sub in ['webm', 'ogg', 'opus', 'wav', 'mp3', 'mpeg', 'aac', 'm4a'])
        if not allowed:
            logger.error(f"[STT] Unsupported audio type: {content_type}")
            return Response({
                'error': f'Unsupported audio format: {audio_file.content_type}',
                'details': 'Supported audio: webm, ogg, opus, wav, mp3, mpeg, aac, m4a'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save a debug copy
        try:
            ext = (audio_file.name.split('.')[-1] if audio_file.name and '.' in audio_file.name else 'webm')
            debug_file = f"user_uploads/interview_audio/candidate_{pk}_{uuid.uuid4()}.{ext}"
            file_path = default_storage.save(debug_file, audio_file)
            logger.info(f"[STT] Saved uploaded audio for debugging: {file_path}")
            audio_file.seek(0)
        except Exception as e:
            logger.warning(f"[STT] Could not save candidate audio for debugging: {e}")

        # Use Google Cloud STT if available, else fallback
        try:
            google_credentials_available = (
                hasattr(settings, 'GOOGLE_APPLICATION_CREDENTIALS')
                and settings.GOOGLE_APPLICATION_CREDENTIALS
                and os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS)
            )
            audio_file.seek(0)
            if google_credentials_available:
                return self._google_stt(audio_file)
            else:
                return self._fallback_stt(audio_file)
        except Exception as e:
            logger.error(f"[STT] Speech-to-text failed: {e}", exc_info=True)
            return Response({'error': f'Speech-to-text failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _google_stt(self, audio_file):
        """Google Cloud Speech-to-Text implementation"""
        client = speech.SpeechClient()
        audio_content = audio_file.read()
        
        # Determine audio encoding based on file type
        content_type = audio_file.content_type.lower()
        if 'wav' in content_type:
            encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16
            sample_rate = 16000
        elif 'mp3' in content_type or 'mpeg' in content_type:
            encoding = speech.RecognitionConfig.AudioEncoding.MP3
            sample_rate = 16000
        elif 'm4a' in content_type or 'aac' in content_type:
            encoding = speech.RecognitionConfig.AudioEncoding.MP3
            sample_rate = 16000
        elif 'webm' in content_type or 'opus' in content_type:
            encoding = speech.RecognitionConfig.AudioEncoding.OGG_OPUS
            sample_rate = 48000
        else:
            encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16
            sample_rate = 16000
        
        audio = speech.RecognitionAudio(content=audio_content)
        config = speech.RecognitionConfig(
            encoding=encoding,
            sample_rate_hertz=sample_rate,
            language_code="en-US",
            enable_automatic_punctuation=True,
            enable_word_time_offsets=False,
            model="latest_long",
            use_enhanced=True,
        )
        
        response = client.recognize(config=config, audio=audio)
        
        if not response.results:
            return Response({'error': 'No speech detected in audio file.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        transcript = ""
        confidence = 0.0
        for result in response.results:
            transcript += result.alternatives[0].transcript + " "
            confidence = max(confidence, result.alternatives[0].confidence)
        
        transcript = transcript.strip()
        
        return Response({
            'transcript': transcript,
            'confidence': confidence,
            'language_code': 'en-US'
        }, status=status.HTTP_200_OK)

    def _fallback_stt(self, audio_file):
        """Fallback STT using local speech recognition"""
        if not SPEECH_RECOGNITION_AVAILABLE:
            logger.error("Speech recognition library not available")
            return Response({
                'error': 'Speech recognition not available. Please install speech_recognition library.',
                'details': 'You can still use text input for your answers.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        try:
            recognizer = sr.Recognizer()
            
            # Handle different audio formats
            content_type = audio_file.content_type.lower()
            logger.info(f"Fallback STT processing {content_type} file, size: {audio_file.size}")
            
            # Check if file is empty
            if audio_file.size == 0:
                return Response({
                    'error': 'Audio file is empty.',
                    'details': 'Please record some audio before submitting.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # For webm files, we need special handling
            if 'webm' in content_type:
                logger.info("Processing webm audio file")
                try:
                    # Save audio file temporarily
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_file:
                        temp_file.write(audio_file.read())
                        temp_file_path = temp_file.name
                    
                    # Try to recognize directly with webm
                    try:
                        with sr.AudioFile(temp_file_path) as source:
                            audio_data = recognizer.record(source)
                        
                        transcript = recognizer.recognize_google(audio_data)
                        os.unlink(temp_file_path)
                        
                        logger.info(f"Webm STT successful, transcript: {transcript[:50]}...")
                        return Response({
                            'transcript': transcript,
                            'confidence': 0.8,
                            'language_code': 'en-US',
                            'method': 'fallback_webm'
                        }, status=status.HTTP_200_OK)
                        
                    except Exception as webm_error:
                        logger.warning(f"Direct webm processing failed: {webm_error}")
                        # Try to convert webm to wav using ffmpeg if available
                        try:
                            import subprocess
                            wav_path = temp_file_path.replace('.webm', '.wav')
                            
                            # Use ffmpeg to convert webm to wav
                            result = subprocess.run([
                                'ffmpeg', '-i', temp_file_path, 
                                '-acodec', 'pcm_s16le', 
                                '-ar', '16000', 
                                '-ac', '1', 
                                wav_path, '-y'
                            ], capture_output=True, text=True, timeout=30)
                            
                            if result.returncode == 0 and os.path.exists(wav_path):
                                logger.info("Successfully converted webm to wav")
                                
                                with sr.AudioFile(wav_path) as source:
                                    audio_data = recognizer.record(source)
                                
                                transcript = recognizer.recognize_google(audio_data)
                                
                                # Clean up both files
                                os.unlink(temp_file_path)
                                os.unlink(wav_path)
                                
                                logger.info(f"Converted webm STT successful, transcript: {transcript[:50]}...")
                                return Response({
                                    'transcript': transcript,
                                    'confidence': 0.8,
                                    'language_code': 'en-US',
                                    'method': 'fallback_webm_converted'
                                }, status=status.HTTP_200_OK)
                            else:
                                logger.error(f"FFmpeg conversion failed: {result.stderr}")
                                raise Exception("FFmpeg conversion failed")
                                
                        except Exception as convert_error:
                            logger.error(f"Webm conversion failed: {convert_error}")
                            os.unlink(temp_file_path)
                            return Response({
                                'error': 'Webm audio format not supported in fallback mode.',
                                'details': 'Please use text input or ensure Google Cloud Speech is configured. You can also try recording in a different format.'
                            }, status=status.HTTP_400_BAD_REQUEST)
                
                except Exception as webm_error:
                    logger.error(f"Webm processing completely failed: {webm_error}")
                    return Response({
                        'error': 'Failed to process webm audio file.',
                        'details': 'Please use text input or try recording again.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # For other formats, try standard processing
            logger.info("Processing standard audio format")
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                temp_file.write(audio_file.read())
                temp_file_path = temp_file.name
            
            # Load audio file
            with sr.AudioFile(temp_file_path) as source:
                audio_data = recognizer.record(source)
            
            # Perform recognition
            transcript = recognizer.recognize_google(audio_data)
            
            # Clean up temp file
            os.unlink(temp_file_path)
            
            logger.info(f"Standard STT successful, transcript: {transcript[:50]}...")
            return Response({
                'transcript': transcript,
                'confidence': 0.8,  # Default confidence for fallback
                'language_code': 'en-US',
                'method': 'fallback_standard'
            }, status=status.HTTP_200_OK)
            
        except sr.UnknownValueError:
            logger.warning("No speech detected in audio file")
            return Response({
                'error': 'No speech detected in audio file.',
                'details': 'Please ensure you are speaking clearly and try again.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except sr.RequestError as e:
            logger.error(f"Speech recognition service error: {e}")
            return Response({
                'error': f'Speech recognition service error: {str(e)}',
                'details': 'Please try again or use text input.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Fallback STT failed: {e}", exc_info=True)
            return Response({
                'error': f'Fallback STT failed: {str(e)}',
                'details': 'Please use text input for your answers.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='tts')
    def tts(self, request, pk=None):
        """
        Text-to-Speech: Accept text, return audio file URL using Google Cloud Text-to-Speech.
        Request: JSON { 'text': ..., 'voice': ... (optional) }
        Response: { 'audio_url': ... }
        """
        text = request.data.get('text')
        # Use the most human-like neural voice by default
        voice_name = request.data.get('voice', 'en-US-Chirp3-HD-Charon')  # Default: male, informative
        if not text:
            return Response({'error': 'No text provided.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(text) > 5000:  # Limit text length
            return Response({'error': 'Text too long. Maximum 5000 characters.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        try:
            # Try Google Cloud TTS first
            if hasattr(settings, 'GOOGLE_APPLICATION_CREDENTIALS') and settings.GOOGLE_APPLICATION_CREDENTIALS:
                return self._google_tts(text, voice_name, pk)
            else:
                # Fallback to local TTS
                return self._fallback_tts(text, pk)
        except Exception as e:
            logging.error(f"TTS error: {str(e)}")
            return Response({'error': f'Text-to-speech failed: {str(e)}'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _google_tts(self, text, voice_name, pk):
        """Google Cloud Text-to-Speech implementation with validation and fallback to gTTS if invalid."""
        import shutil
        client = texttospeech.TextToSpeechClient()
        synthesis_input = texttospeech.SynthesisInput(text=text)
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name=voice_name,
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=0.9,
            pitch=0.0,
            volume_gain_db=0.0
        )
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
        filename = f"tts_{pk}_{uuid.uuid4()}.mp3"
        save_path = os.path.join('user_uploads', 'interview_audio', filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            temp_file.write(response.audio_content)
            temp_file.flush()
            temp_file_path = temp_file.name
            # Validate file size
            file_size = os.path.getsize(temp_file_path)
            if file_size < 2048:  # <2KB is likely invalid
                logger.error(f"Google TTS generated invalid/empty mp3 (size: {file_size} bytes). Falling back to gTTS.")
                os.unlink(temp_file_path)
                # Fallback to gTTS
                return self._fallback_tts(text, pk)
            with open(temp_file_path, 'rb') as f:
                full_path = default_storage.save(save_path, f)
        os.unlink(temp_file_path)
        audio_url = os.path.join(settings.MEDIA_URL, full_path)
        return Response({
            'audio_url': audio_url,
            'text_length': len(text),
            'voice_used': voice_name
        }, status=status.HTTP_200_OK)

    def _fallback_tts(self, text, pk):
        """Fallback TTS using gTTS (Google Text-to-Speech)"""
        try:
            from gtts import gTTS
            
            # Generate audio using gTTS
            tts = gTTS(text=text, lang='en', slow=False)
            
            filename = f"tts_{pk}_{uuid.uuid4()}.mp3"
            save_path = os.path.join('user_uploads', 'interview_audio', filename)
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                tts.save(temp_file.name)
                temp_file.flush()
                
                with open(temp_file.name, 'rb') as f:
                    full_path = default_storage.save(save_path, f)
            
            os.unlink(temp_file.name)
            audio_url = os.path.join(settings.MEDIA_URL, full_path)
            
            return Response({
                'audio_url': audio_url,
                'text_length': len(text),
                'voice_used': 'gTTS-fallback'
            }, status=status.HTTP_200_OK)
            
        except ImportError:
            return Response({'error': 'gTTS not available. Please install gtts library.'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Fallback TTS failed: {str(e)}'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='tts-voices')
    def get_tts_voices(self, request, pk=None):
        """
        Get available TTS voices for selection.
        Response: { 'voices': [...] }
        """
        try:
            client = texttospeech.TextToSpeechClient()
            
            # Get available voices
            response = client.list_voices(language_code="en-US")
            
            voices = []
            for voice in response.voices:
                voices.append({
                    'name': voice.name,
                    'language_code': voice.language_codes[0],
                    'ssml_gender': voice.ssml_gender.name,
                    'natural_sample_rate_hertz': voice.natural_sample_rate_hertz
                })
            
            return Response({'voices': voices}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logging.error(f"TTS voices error: {str(e)}")
            return Response({'error': f'Failed to get voices: {str(e)}'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- SavedJob ViewSet ---------------------------------------------


class SavedJobSerializer(serializers.ModelSerializer):
     """Serializer for SavedJob objects including nested job data."""
 
     job = JobSerializer(read_only=True)
     job_id = serializers.UUIDField(write_only=True, required=False)
 
     class Meta:
         model = SavedJob
         fields = ['id', 'job', 'job_id', 'saved_at']

     def create(self, validated_data):
         job_id = validated_data.pop('job_id', None) or self.context['request'].data.get('job')
         user = self.context['request'].user
         if not job_id:
             raise serializers.ValidationError({'job_id': 'This field is required.'})
         job = get_object_or_404(Job, pk=job_id)
         saved_job, _ = SavedJob.objects.get_or_create(user=user, job=job)
         return saved_job


class SavedJobViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin):
    """Minimal viewset to support /saved-jobs/ endpoints."""

    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Override list to return array (legacy)
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user).select_related('job').order_by('-saved_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ---------------- Resume Upload -----------------------------------------------


class ResumeUploadAPIView(generics.CreateAPIView):
    """
    Handle resume file uploads and create Resume objects.
    Supports PDF, DOC, DOCX. Ensures safe file handling and parsing.
    """

    serializer_class = ResumeSerializer  # Reuse minimal serializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        upload_file = request.FILES.get('file')
        if not upload_file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Allowed file types
        allowed_types = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        content_type = upload_file.content_type
        if content_type not in allowed_types:
            return Response({'error': 'Unsupported file type. Only PDF, DOC, and DOCX allowed.'},
                            status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

        # ---- Read file into memory so we can parse and save it safely ----
        file_bytes = upload_file.read()
        if not file_bytes:
            return Response({'error': 'Uploaded file is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        from django.core.files.uploadedfile import InMemoryUploadedFile
        import io
        # Prepare for saving (reset pointer, re-wrap in-memory file)
        file_stream = io.BytesIO(file_bytes)
        file_stream.seek(0)
        upload_file_for_storage = InMemoryUploadedFile(
            file_stream, None, upload_file.name, content_type, len(file_bytes), None
        )

        # ---- Save the file to storage ----
        extension = os.path.splitext(upload_file.name)[1]
        filename = f"{uuid.uuid4()}{extension}"
        save_path = os.path.join('user_uploads', 'resumes', filename)
        full_path = default_storage.save(save_path, upload_file_for_storage)
        # file_url should be relative to MEDIA_URL, not a full absolute path
        file_url = os.path.join(settings.MEDIA_URL, full_path)

        # ---- Get student profile ----
        student_profile = getattr(request.user, 'student_profile', None)
        if not student_profile:
            return Response({'error': 'Only students can upload resumes.'}, status=status.HTTP_400_BAD_REQUEST)

        # ---- Make this the primary resume ----
        try:
            with transaction.atomic():
                Resume.objects.filter(student_profile=student_profile, is_primary=True).update(is_primary=False)
        except Exception as e:
            logging.error(f"Failed to update is_primary for existing resume: {e}")
            return Response({'error': 'Failed to update primary resume status.'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # ---- Attempt text extraction ----
        parsed_text = ''
        if upload_file.content_type == 'application/pdf':
            try:
                from PyPDF2 import PdfReader
                reader = PdfReader(io.BytesIO(file_bytes))
                parsed_text = "\n".join([page.extract_text() or '' for page in reader.pages])
                if not parsed_text.strip():
                    return Response({'error': 'Failed to extract text from PDF. The file may be scanned or empty.'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                import logging
                logging.warning(f"PDF text extraction failed: {e}")
                return Response({'error': f'PDF text extraction failed: {e}'}, status=status.HTTP_400_BAD_REQUEST)
        elif upload_file.content_type in ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
            try:
                import docx
                doc = docx.Document(io.BytesIO(file_bytes))
                parsed_text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
                if not parsed_text.strip():
                    return Response({'error': 'Failed to extract text from DOCX. The file may be empty.'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                    import logging
                    logging.warning(f"DOCX text extraction failed: {e}")
                    return Response({'error': f'DOCX text extraction failed: {e}'}, status=status.HTTP_400_BAD_REQUEST)

        # ---- Generate Embedding ----
        embedding = []
        try:
            if parsed_text:
                from .services.embedding_service import embedding_service
                embedding = embedding_service.get_embedding(parsed_text)
            if not embedding:
                raise Exception("Empty embedding returned.")
        except Exception as e:
            logging.error(f"Embedding generation failed: {e}")
            return Response({'error': f'Failed to generate embedding: {e}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # ---- Create Resume object ----
        resume = Resume.objects.create(
            student_profile=student_profile,
            file_url=file_url,
            file_name=upload_file.name,
            parsed_text=parsed_text,
            is_parsed=True,
            embedding=embedding,
            is_primary=True,
        )

        serializer = self.get_serializer(resume, context={'request': request})
        return Response({'cv': serializer.data}, status=status.HTTP_201_CREATED)


# ---------------- CV Analysis stub ---------------------------------------------


class AnalyzeCVAPIView(generics.GenericAPIView):
    """Simple placeholder that acknowledges the request.
    In a full implementation, this would trigger resume re-parse / re-embedding.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        resume_id = request.data.get('resume_id')
        return Response({'detail': 'Resume analysis queued', 'resume_id': resume_id}, status=status.HTTP_202_ACCEPTED)

    def get(self, request, *args, **kwargs):
        resume_id = request.query_params.get('resume_id') or request.query_params.get('cv_id')
        if not resume_id:
            return Response({'error': 'resume_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            resume = Resume.objects.get(pk=resume_id, student_profile__user=request.user)
        except Resume.DoesNotExist:
            return Response({'error': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)
        if not resume.is_parsed:
            return Response({'processing': True}, status=status.HTTP_202_ACCEPTED)
        # Try to fetch AI analysis report
        report = AIAnalysisReport.objects.filter(resume=resume).order_by('-created_at').first()
        if report:
            return Response(report.report_data, status=status.HTTP_200_OK)
        # If no report, return default placeholder instead of error
        return Response({
            "overall_score": 0,
            "strengths": [],
            "improvements": [],
            "keywords_found": [],
            "keywords_missing": [],
            "sections_analysis": {}
        }, status=status.HTTP_200_OK)

# ---------------- Resume Download ---------------------------------------------

from django.http import FileResponse, Http404

class ResumeDownloadAPIView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        resume = get_object_or_404(Resume, pk=pk, student_profile__user=request.user)
        file_url = resume.file_url
        if file_url.startswith('http'):
            # External URL (optional, not used here)
            import requests
            r = requests.get(file_url)
            if r.status_code != 200:
                raise Http404
            response = HttpResponse(r.content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{resume.file_name}"'
            return response
        # Local file
        file_path = os.path.join(settings.MEDIA_ROOT, file_url.replace(settings.MEDIA_URL, ""))
        if not os.path.exists(file_path):
            raise Http404
        return FileResponse(open(file_path, 'rb'), content_type='application/pdf')
