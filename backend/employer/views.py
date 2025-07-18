from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from jobs.models import Job, Application, AIInterview, AIAnalysisReport, Resume
from accounts.models import StudentProfile, EmployerProfile, Company, User
from django.db.models import Count, Q, Max, Avg, F, ExpressionWrapper, DurationField
from django.utils import timezone
from datetime import timedelta
from .serializers import EmployerJobSerializer, ApplicationSerializer, JobMatchingWeightageSerializer, CandidateSerializer
from accounts.serializers import StudentProfileSerializer, StudentProfileDetailSerializer, EmployerProfileSerializer, CompanySerializer, UserSerializer
from jobs.serializers import AIAnalysisReportSerializer, AIInterviewSerializer
import logging
logger = logging.getLogger(__name__)

# Create your views here.

class InterviewReportView(APIView):
    """
    Provides the interview report for a specific application.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, application_id, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response({"error": "User is not associated with a company."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            application = Application.objects.get(id=application_id, job__company=employer_profile.company)
        except Application.DoesNotExist:
            return Response({"error": "Application not found or you do not have permission to view it."}, status=status.HTTP_404_NOT_FOUND)

        try:
            interview = AIInterview.objects.get(application=application)
            if not interview.report_generated:
                 return Response({"error": "Interview report is not yet available."}, status=status.HTTP_202_ACCEPTED)
        except AIInterview.DoesNotExist:
            return Response({"error": "Interview not found for this application."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AIInterviewSerializer(interview)
        return Response(serializer.data)


class AnalysisReportView(APIView):
    """
    Provides the AI analysis report for a specific job and resume.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, job_id, resume_id, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response({"error": "User is not associated with a company."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            job = Job.objects.get(id=job_id, company=employer_profile.company)
            resume = Resume.objects.get(id=resume_id)
            # Security check: Ensure the resume belongs to an applicant for one of the company's jobs.
            if not Application.objects.filter(job__company=employer_profile.company, applicant=resume.student_profile.user).exists():
                 return Response({"error": "You do not have permission to view this resume's analysis."}, status=status.HTTP_403_FORBIDDEN)

        except (Job.DoesNotExist, Resume.DoesNotExist):
            return Response({"error": "Job or Resume not found."}, status=status.HTTP_404_NOT_FOUND)

        force_refresh = request.query_params.get('force_refresh', 'false').lower() == 'true'
        
        report = AIAnalysisReport.objects.filter(job=job, resume=resume).first()

        if not report or force_refresh:
            # This is a placeholder for celery task
            # generate_ai_analysis_report_task.delay(resume.id, job.id)
            return Response({
                "status": "processing", 
                "message": "AI analysis report is being generated. Please check back in a few moments."
            }, status=status.HTTP_202_ACCEPTED)

        serializer = AIAnalysisReportSerializer(report)
        return Response(serializer.data)


class DashboardStatsView(APIView):
    """
    Provides statistics for the employer dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            logger.error("User is not associated with a company.")
            return Response(
                {"error": "User is not associated with a company."},
                status=status.HTTP_400_BAD_REQUEST
            )

        company = employer_profile.company

        # Active Job Posts
        active_jobs = Job.objects.filter(company=company, is_active=True).count()

        # Total Applicants
        total_applicants = Application.objects.filter(job__company=company).count()

        # Interviews Scheduled (use only valid statuses)
        try:
            interviews_scheduled = AIInterview.objects.filter(
                application__job__company=company,
                status__in=[AIInterview.Status.PENDING, AIInterview.Status.IN_PROGRESS]
            ).count()
        except Exception as e:
            logger.error(f"Error counting interviews scheduled: {e}")
            interviews_scheduled = 0

        # New applicants in the last 7 days
        one_week_ago = timezone.now() - timedelta(days=7)
        new_applicants = Application.objects.filter(
            job__company=company,
            applied_at__gte=one_week_ago
        ).count()

        stats_data = {
            'active_job_posts': active_jobs,
            'total_applicants': total_applicants,
            'interviews_scheduled': interviews_scheduled,
            'new_applicants_weekly': new_applicants,
        }

        logger.info(f"Dashboard stats for company {company.id}: {stats_data}")
        return Response(stats_data, status=status.HTTP_200_OK)


class AllCandidatesView(APIView):
    """
    Provides a list of all candidates who have applied to the employer's jobs.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response(
                {"error": "User is not associated with a company."},
                status=status.HTTP_400_BAD_REQUEST
            )

        company = employer_profile.company
        job_id_filter = request.query_params.get('job_id')
        
        # Base query for applications within the company
        applications = Application.objects.filter(job__company=company).select_related('applicant', 'job')

        if job_id_filter and job_id_filter != 'all':
            applications = applications.filter(job_id=job_id_filter)
        
        # Get unique student profiles from the filtered applications
        applicant_ids = applications.values_list('applicant_id', flat=True).distinct()
        applicants_query = StudentProfile.objects.filter(user_id__in=applicant_ids).select_related('user', 'university').prefetch_related('resumes')
        
        search_query = request.query_params.get('search')
        if search_query:
            applicants_query = applicants_query.filter(
                Q(user__full_name__icontains=search_query) |
                Q(major__icontains=search_query) |
                Q(skills__icontains=search_query)
            ).distinct()

        status_filter = request.query_params.get('status')
        if status_filter:
            applicants_query = applicants_query.filter(
                user__applications__status=status_filter
            )

        serializer_context = {'company': company}
        if job_id_filter and job_id_filter != 'all':
            serializer_context['job_id'] = job_id_filter

        serializer = CandidateSerializer(applicants_query, many=True, context=serializer_context)
        print('DEBUG: Company:', company)
        print('DEBUG: Jobs:', list(Job.objects.filter(company=company)))
        print('DEBUG: Applications:', list(applications))
        print('DEBUG: Applicant IDs:', list(applicant_ids))
        print('DEBUG: Applicants:', list(applicants_query))
        return Response(serializer.data)

class ResumeBankView(APIView):
    """
    Provides a searchable and filterable list of student resumes.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        queryset = StudentProfile.objects.select_related('user').all().order_by('-user__date_joined')

        # Searching
        search_query = request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(user__full_name__icontains=search_query) |
                Q(major__icontains=search_query) |
                Q(skills__icontains=search_query) |
                Q(university__name__icontains=search_query)
            ).distinct()

        # Filtering
        major = request.query_params.get('major')
        if major:
            queryset = queryset.filter(major__icontains=major)
        
        university = request.query_params.get('university')
        if university:
            queryset = queryset.filter(university__name__icontains=university)

        serializer = StudentProfileDetailSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CandidateProfileView(APIView):
    """
    Provides the detailed profile of a single candidate (student).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, candidate_id, *args, **kwargs):
        try:
            student_profile = StudentProfile.objects.select_related('user').get(user_id=candidate_id)
            # Add a check here to ensure the employer has access to this candidate
            # For now, we'll allow any authenticated employer to view any student
            serializer = StudentProfileDetailSerializer(student_profile)
            return Response(serializer.data)
        except StudentProfile.DoesNotExist:
            return Response({"error": "Candidate profile not found."}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, candidate_id, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response({"error": "User is not associated with a company."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student_profile = StudentProfile.objects.get(user_id=candidate_id)
        except StudentProfile.DoesNotExist:
            return Response({"error": "Candidate not found."}, status=status.HTTP_404_NOT_FOUND)

        status_update = request.data.get('status')
        job_id = request.data.get('job_id')

        if not status_update:
            return Response({"error": "Status is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the latest application for this candidate within the company
        application_query = Application.objects.filter(
            applicant=student_profile.user, 
            job__company=employer_profile.company
        )

        if job_id:
            application_query = application_query.filter(job_id=job_id)

        application_to_update = application_query.order_by('-applied_at').first()

        if not application_to_update:
            return Response({"error": "No application found for this candidate to update."}, status=status.HTTP_404_NOT_FOUND)

        application_to_update.status = status_update
        application_to_update.save()

        return Response({"success": "Application status updated."}, status=status.HTTP_200_OK)


class JobMatchingWeightageView(APIView):
    """
    Update the matching weights for a specific job.
    """
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, job_id, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response({"error": "User is not associated with a company."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            job = Job.objects.get(id=job_id, company=employer_profile.company)
        except Job.DoesNotExist:
            return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = JobMatchingWeightageSerializer(job, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JobApplicantsView(APIView):
    """
    Provides a list of applicants for a specific job.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, job_id, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response(
                {"error": "User is not associated with a company."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            job = Job.objects.get(id=job_id, company=employer_profile.company)
        except Job.DoesNotExist:
            return Response(
                {"error": "Job not found or you do not have permission to view it."},
                status=status.HTTP_404_NOT_FOUND
            )

        applicants = Application.objects.filter(job=job).select_related(
            'applicant__student_profile', 'resume'
        ).annotate(
            ai_match_score=Max('job__analysis_reports__overall_score')
        ).order_by('-ai_match_score')

        serializer = ApplicationSerializer(applicants, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EmployerJobsView(APIView):
    """
    List, create, and manage jobs for the authenticated employer.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response(
                {"error": "User is not associated with a company."},
                status=status.HTTP_400_BAD_REQUEST
            )

        company = employer_profile.company
        queryset = Job.objects.filter(company=company).annotate(
            applicants_count=Count('applications')
        ).order_by('-created_at')

        # Filtering
        status_filter = request.query_params.get('status')
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True, application_deadline__gte=timezone.now())
        elif status_filter == 'draft':
            queryset = queryset.filter(is_active=False)
        elif status_filter == 'closed':
            queryset = queryset.filter(Q(is_active=False) | Q(application_deadline__lt=timezone.now()))
        
        search_query = request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(skills__name__icontains=search_query)
            ).distinct()

        serializer = EmployerJobSerializer(queryset, many=True)
        return Response({'results': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response(
                {"error": "User is not associated with a company."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = EmployerJobSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(company=employer_profile.company)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, job_id, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response({"error": "User is not associated with a company."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            job = Job.objects.get(id=job_id, company=employer_profile.company)
        except Job.DoesNotExist:
            return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = EmployerJobSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, job_id, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response({"error": "User is not associated with a company."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            job = Job.objects.get(id=job_id, company=employer_profile.company)
        except Job.DoesNotExist:
            return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)
            
        job.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RecentActivityView(APIView):
    """
    Provides a feed of recent activities for the employer.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response(
                {"error": "User is not associated with a company."},
                status=status.HTTP_400_BAD_REQUEST
            )

        company = employer_profile.company
        one_week_ago = timezone.now() - timedelta(days=7)

        # Get recent applications
        recent_apps = Application.objects.filter(
            job__company=company,
            applied_at__gte=one_week_ago
        ).order_by('-applied_at').select_related('applicant', 'job')[:5]

        # Get recent interview changes
        recent_interviews = AIInterview.objects.filter(
            application__job__company=company,
            updated_at__gte=one_week_ago
        ).exclude(
            status=AIInterview.Status.PENDING
        ).order_by('-updated_at').select_related('application__applicant')[:5]

        activity_feed = []

        for app in recent_apps:
            activity_feed.append({
                'id': f'app-{app.id}',
                'type': 'application',
                'content': f"New application from {app.applicant.full_name} for {app.job.title}",
                'timestamp': app.applied_at,
            })

        for interview in recent_interviews:
            activity_feed.append({
                'id': f'interview-{interview.id}',
                'type': 'interview',
                'content': f"Interview for {interview.application.applicant.full_name} is now {interview.get_status_display()}",
                'timestamp': interview.updated_at,
            })
        
        # Sort by timestamp descending and take the top 5
        activity_feed.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return Response(activity_feed[:5], status=status.HTTP_200_OK)


class TopCandidatesView(APIView):
    """
    Provides a list of top candidates for the employer's active jobs.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response(
                {"error": "User is not associated with a company."},
                status=status.HTTP_400_BAD_REQUEST
            )

        company = employer_profile.company
        active_jobs = Job.objects.filter(company=company, is_active=True)

        # Get applications for active jobs, ordered by AI match score
        top_applications = Application.objects.filter(
            job__in=active_jobs,
            job__analysis_reports__overall_score__isnull=False
        ).annotate(
            ai_match_score=Max('job__analysis_reports__overall_score')
        ).order_by(
            '-ai_match_score'
        ).select_related(
            'applicant', 'job', 'applicant__student_profile'
        )[:5] # Limit to top 5

        candidates_data = []
        for app in top_applications:
            student_profile = getattr(app.applicant, 'student_profile', None)
            candidates_data.append({
                'id': app.applicant.id,
                'name': app.applicant.full_name,
                'role': app.job.title,
                'matchScore': app.ai_match_score,
                'skills': student_profile.skills[:3] if student_profile and isinstance(student_profile.skills, list) else [],
                'status': app.status,
                'avatar_url': app.applicant.profile_picture_url,
            })

        return Response(candidates_data, status=status.HTTP_200_OK)


class HiringPipelineStatsView(APIView):
    """
    Provides a breakdown of the hiring pipeline and time to hire for the employer dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            logger.error("User is not associated with a company.")
            return Response(
                {"error": "User is not associated with a company."},
                status=status.HTTP_400_BAD_REQUEST
            )
        company = employer_profile.company
        try:
            # Pipeline breakdown
            pipeline = {}
            for app_status in Application.Status:
                count = Application.objects.filter(job__company=company, status=app_status).count()
                pipeline[app_status.label] = count
            # Time to hire (average days from APPLIED to OFFERED)
            offered_apps = Application.objects.filter(job__company=company, status=Application.Status.OFFERED)
            if offered_apps.exists():
                avg_duration = offered_apps.annotate(
                    duration=ExpressionWrapper(F('updated_at') - F('applied_at'), output_field=DurationField())
                ).aggregate(avg_days=Avg('duration'))['avg_days']
                avg_days = avg_duration.days if avg_duration else None
            else:
                avg_days = None
            return Response({
                'pipeline': pipeline,
                'time_to_hire': avg_days
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error in HiringPipelineStatsView: %s", e)
            return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TeamMembersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response({"error": "User is not associated with a company."}, status=status.HTTP_400_BAD_REQUEST)
        company = employer_profile.company
        team_members = EmployerProfile.objects.filter(company=company).select_related('user')
        data = [
            {
                'id': str(member.user.id),
                'name': member.user.full_name,
                'email': member.user.email,
                'role': member.role,
                'is_company_admin': member.is_company_admin,
                'status': 'active',
                'joined_date': member.created_at,
                'profile_picture_url': member.user.profile_picture_url,
            }
            for member in team_members
        ]
        return Response(data, status=status.HTTP_200_OK)

class CompanyProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return Response({"error": "User is not associated with a company."}, status=status.HTTP_400_BAD_REQUEST)
        company = employer_profile.company
        serializer = CompanySerializer(company)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        employer_profile = getattr(request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company or not employer_profile.is_company_admin:
            return Response({"error": "You do not have permission to update company profile."}, status=status.HTTP_403_FORBIDDEN)
        company = employer_profile.company
        serializer = CompanySerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
