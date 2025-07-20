from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Count, Q, Avg, F, ExpressionWrapper, DurationField
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.core.cache import cache
from datetime import timedelta
from .models import User, StudentProfile, EmployerProfile, Company, University, UniversityStaffProfile
from .serializers import (
    UserSerializer, StudentProfileSerializer, StudentProfileDetailSerializer, 
    EmployerProfileSerializer, CompanySerializer, UniversitySerializer, 
    UniversityStaffProfileSerializer, RegisterSerializer, MyTokenObtainPairSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer, PasswordChangeSerializer,
    EmailVerificationRequestSerializer, EmailVerificationConfirmSerializer, EmailVerificationResendSerializer
)
from jobs.models import Job, Application, AIInterview, AIAnalysisReport, Resume
from career_fairs.models import CareerFair, Booth, StudentInterest
import logging
import json
from rapidfuzz import process, fuzz

# Canonical skills and career paths (replace with ESCO/O*NET for production)
CANONICAL_SKILLS = [
    'Python', 'Java', 'JavaScript', 'React', 'Django', 'Machine Learning', 'Data Analysis', 'SQL', 'AWS', 'Node.js', 'TypeScript',
    'Web Development', 'Frontend Development', 'Backend Development', 'Cloud Computing', 'DevOps', 'AI', 'ML', 'Android', 'iOS', 'Power BI',
    'Project Management', 'System Design', 'Database Design', 'Content Creation', 'Marketing', 'Statistics', 'Electrical Engineering', 'Chemical Engineering',
]
CANONICAL_PATHS = [
    'AI Engineer', 'Machine Learning Engineer', 'Data Scientist', 'Frontend Developer', 'Backend Developer', 'Full-Stack Developer',
    'DevOps Engineer', 'Cloud Engineer', 'Data Analyst', 'Business Intelligence Analyst', 'Android Developer', 'iOS Developer', 'Marketing Analyst',
    'Software Developer', 'Web Developer', 'IT Support', 'Project Manager', 'Product Manager', 'Electrical Engineer', 'Chemical Engineer',
]

logger = logging.getLogger(__name__)

class UniversityDashboardStatsView(APIView):
    """
    Provides comprehensive statistics for university dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            # Get the university staff profile
            university_staff = getattr(request.user, 'university_staff_profile', None)
            
            # If no university staff profile exists, return empty data
            # Frontend should handle this by prompting user to complete their profile
            if not university_staff:
                return Response({
                    'totalGraduates': 0,
                    'employmentRate': 0,
                    'averageSalary': 0,
                    'partnerCompanies': 0,
                    'employmentTrend': [],
                    'topEmployers': [],
                    'skillGaps': [],
                    'hasProfile': False,
                    'message': 'Please complete your university staff profile to view dashboard statistics.'
                }, status=status.HTTP_200_OK)
            
            university = university_staff.university

            # Calculate basic statistics with error handling
            try:
                total_students = StudentProfile.objects.filter(university=university).count()
            except Exception as e:
                logger.error(f"Error counting students: {e}")
                total_students = 0
            
            try:
                # Employment rate calculation (students with jobs)
                employed_students = Application.objects.filter(
                    applicant__student_profile__university=university,
                    status='OFFERED'
                ).values('applicant').distinct().count()
                
                employment_rate = (employed_students / total_students * 100) if total_students > 0 else 0
            except Exception as e:
                logger.error(f"Error calculating employment rate: {e}")
                employment_rate = 0
            
            try:
                # Partner companies (companies that have posted jobs)
                partner_companies = Company.objects.filter(
                    jobs__applications__applicant__student_profile__university=university
                ).distinct().count()
            except Exception as e:
                logger.error(f"Error counting partner companies: {e}")
                partner_companies = 0
            
            # Simplified employment trends (last 6 months)
            try:
                six_months_ago = timezone.now() - timedelta(days=180)
                employment_trend = []
                
                for i in range(6):
                    month_start = six_months_ago + timedelta(days=30*i)
                    month_end = month_start + timedelta(days=30)
                    
                    try:
                        month_applications = Application.objects.filter(
                            applicant__student_profile__university=university,
                            applied_at__gte=month_start,
                            applied_at__lt=month_end,
                            status='OFFERED'
                        ).count()
                        
                        month_total = Application.objects.filter(
                            applicant__student_profile__university=university,
                            applied_at__gte=month_start,
                            applied_at__lt=month_end
                        ).count()
                        
                        rate = (month_applications / month_total * 100) if month_total > 0 else 0
                    except Exception as e:
                        logger.error(f"Error calculating month {i} trend: {e}")
                        rate = 0
                    
                    employment_trend.append({
                        'month': month_start.strftime('%b'),
                        'rate': round(rate, 1)
                    })
            except Exception as e:
                logger.error(f"Error calculating employment trends: {e}")
                employment_trend = []
            
            # Application status breakdown
            try:
                total_applied = Application.objects.filter(
                    applicant__student_profile__university=university,
                    status='APPLIED'
                ).count()
                
                total_interviewed = Application.objects.filter(
                    applicant__student_profile__university=university,
                    status='INTERVIEWED'
                ).count()
                
                total_offered = Application.objects.filter(
                    applicant__student_profile__university=university,
                    status='OFFERED'
                ).count()
                
                total_rejected = Application.objects.filter(
                    applicant__student_profile__university=university,
                    status='REJECTED'
                ).count()
            except Exception as e:
                logger.error(f"Error calculating application status: {e}")
                total_applied = 0
                total_interviewed = 0
                total_offered = 0
                total_rejected = 0
            
            # Recent activity (last 30 days)
            try:
                thirty_days_ago = timezone.now() - timedelta(days=30)
                
                recent_applications = Application.objects.filter(
                    applicant__student_profile__university=university,
                    applied_at__gte=thirty_days_ago
                ).count()
                
                recent_companies = Company.objects.filter(
                    jobs__applications__applicant__student_profile__university=university,
                    jobs__applications__applied_at__gte=thirty_days_ago
                ).distinct().count()
                
                recent_career_fairs = CareerFair.objects.filter(
                    host_university=university,
                    start_date__gte=thirty_days_ago
                ).count()
            except Exception as e:
                logger.error(f"Error calculating recent activity: {e}")
                recent_applications = 0
                recent_companies = 0
                recent_career_fairs = 0
            
            # Calculate average salary from actual job offers
            try:
                # Get salary data from job offers (if available in job details)
                offered_applications = Application.objects.filter(
                    applicant__student_profile__university=university,
                    status='OFFERED'
                ).select_related('job')
                
                total_salary = 0
                salary_count = 0
                
                for app in offered_applications:
                    if hasattr(app.job, 'salary_min') and app.job.salary_min and hasattr(app.job, 'salary_max') and app.job.salary_max:
                        # Use average of min and max salary
                        avg_job_salary = (app.job.salary_min + app.job.salary_max) / 2
                        total_salary += avg_job_salary
                        salary_count += 1
                    elif hasattr(app.job, 'salary_min') and app.job.salary_min:
                        # Use minimum salary as estimate
                        total_salary += app.job.salary_min
                        salary_count += 1
                    elif hasattr(app.job, 'salary_max') and app.job.salary_max:
                        # Use maximum salary as estimate
                        total_salary += app.job.salary_max
                        salary_count += 1
                
                average_salary = (total_salary / salary_count) if salary_count > 0 else 0  # Return 0 if no offers
                
            except Exception as e:
                logger.error(f"Error calculating average salary: {e}")
                average_salary = 0  # Return 0 if error
            
            # Enhanced skill gaps analysis based on AI reports
            try:
                # Get all AI analysis reports for this university's students
                ai_reports = AIAnalysisReport.objects.filter(
                    resume__student_profile__university=university
                ).select_related('resume', 'resume__student_profile', 'job')
                
                logger.info(f"Found {ai_reports.count()} AI reports for university {university.name}")
                
                # Debug: Check if there are any AI reports at all in the database
                total_ai_reports = AIAnalysisReport.objects.count()
                logger.info(f"Total AI reports in database: {total_ai_reports}")
                
                if ai_reports.count() == 0:
                    logger.warning(f"No AI reports found for university {university.name}")
                    # Check if there are any students in this university
                    student_count = StudentProfile.objects.filter(university=university).count()
                    logger.info(f"Students in university {university.name}: {student_count}")
                    
                    # Check if there are any resumes for these students
                    resume_count = Resume.objects.filter(student_profile__university=university).count()
                    logger.info(f"Resumes for university {university.name}: {resume_count}")
                    
                    # Check if there are any AI reports for any university
                    any_ai_reports = AIAnalysisReport.objects.all()[:5]
                    logger.info(f"Sample AI reports: {list(any_ai_reports.values('id', 'resume__student_profile__university__name', 'job__title'))}")
                
                # Get the most recent report per student-job combination
                latest_reports = {}
                for report in ai_reports:
                    # Use user_id instead of id since StudentProfile uses user_id as primary key
                    key = (report.resume.student_profile.user_id, report.job.id)
                    if key not in latest_reports or report.created_at > latest_reports[key].created_at:
                        latest_reports[key] = report
                
                logger.info(f"After deduplication: {len(latest_reports)} unique student-job reports")
                
                # Collect all skills and track demand and student capabilities
                skill_demand = {}  # How many jobs require each skill
                student_skill_capabilities = {}  # Which students have which skills
                all_skills = set()  # All unique skills mentioned
                
                # Get total number of distinct students with reports
                distinct_students = set()
                
                for report in latest_reports.values():
                    try:
                        student_id = report.resume.student_profile.user_id
                        distinct_students.add(student_id)
                        
                        logger.info(f"Processing report {report.id} for student {student_id} and job {report.job.title}")
                        
                        # Parse AI analysis data
                        if report.report_data:
                            analysis_data = json.loads(report.report_data) if isinstance(report.report_data, str) else report.report_data
                            
                            logger.info(f"Analysis data keys: {list(analysis_data.keys())}")
                            
                            # Extract skills from the shared.skills_analysis section
                            if 'shared' in analysis_data and 'skills_analysis' in analysis_data['shared']:
                                skills_analysis = analysis_data['shared']['skills_analysis']
                                logger.info(f"Skills analysis keys: {list(skills_analysis.keys())}")
                                
                                # Extract matching skills (skills this student has)
                                if 'matching_skills' in skills_analysis:
                                    matching_skills = skills_analysis['matching_skills']
                                    logger.info(f"Matching skills found: {matching_skills}")
                                    for skill in matching_skills:
                                        skill_lower = skill.lower()
                                        all_skills.add(skill_lower)
                                        
                                        # Track that this student has this skill
                                        if student_id not in student_skill_capabilities:
                                            student_skill_capabilities[student_id] = set()
                                        student_skill_capabilities[student_id].add(skill_lower)
                                
                                # Extract missing skills (job requirements that this student doesn't have)
                                if 'missing_skills' in skills_analysis:
                                    missing_skills = skills_analysis['missing_skills']
                                    logger.info(f"Missing skills found: {missing_skills}")
                                    for skill in missing_skills:
                                        skill_lower = skill.lower()
                                        all_skills.add(skill_lower)
                                        
                                        # Track demand for this skill (how many jobs require it)
                                        skill_demand[skill_lower] = skill_demand.get(skill_lower, 0) + 1
                                        
                                        # Ensure this student is tracked (even if they don't have the skill)
                                        if student_id not in student_skill_capabilities:
                                            student_skill_capabilities[student_id] = set()
                            else:
                                logger.warning(f"No 'shared.skills_analysis' found in report {report.id}")
                                logger.info(f"Available keys in analysis_data: {list(analysis_data.keys())}")
                                if 'shared' in analysis_data:
                                    logger.info(f"Shared keys: {list(analysis_data['shared'].keys())}")
                                # Try alternative structure - maybe the data is directly in analysis_data
                                elif 'skills_analysis' in analysis_data:
                                    skills_analysis = analysis_data['skills_analysis']
                                    logger.info(f"Found skills_analysis directly in analysis_data: {list(skills_analysis.keys())}")
                                    
                                    if 'matching_skills' in skills_analysis:
                                        matching_skills = skills_analysis['matching_skills']
                                        logger.info(f"Matching skills found: {matching_skills}")
                                        for skill in matching_skills:
                                            skill_lower = skill.lower()
                                            all_skills.add(skill_lower)
                                            
                                            if student_id not in student_skill_capabilities:
                                                student_skill_capabilities[student_id] = set()
                                            student_skill_capabilities[student_id].add(skill_lower)
                                    
                                    if 'missing_skills' in skills_analysis:
                                        missing_skills = skills_analysis['missing_skills']
                                        logger.info(f"Missing skills found: {missing_skills}")
                                        for skill in missing_skills:
                                            skill_lower = skill.lower()
                                            all_skills.add(skill_lower)
                                            
                                            skill_demand[skill_lower] = skill_demand.get(skill_lower, 0) + 1
                                            
                                            if student_id not in student_skill_capabilities:
                                                student_skill_capabilities[student_id] = set()
                    
                    except (json.JSONDecodeError, KeyError, TypeError) as e:
                        logger.error(f"Error parsing AI report {report.id}: {e}")
                        continue
                
                logger.info(f"Total distinct students: {len(distinct_students)}")
                logger.info(f"Total unique skills: {len(all_skills)}")
                logger.info(f"Skill demand: {skill_demand}")
                logger.info(f"Student skill capabilities: {student_skill_capabilities}")
                
                # Calculate skill gap percentages
                skill_gaps_data = []
                total_distinct_students = len(distinct_students)
                
                logger.info(f"Total distinct students with reports: {total_distinct_students}")
                
                # Process skills based on demand (job requirements)
                for skill, demand_count in skill_demand.items():
                    if total_distinct_students > 0:
                        # Count how many distinct students have this skill
                        students_with_skill = 0
                        for student_id, skills in student_skill_capabilities.items():
                            if skill in skills:
                                students_with_skill += 1
                        
                        # Calculate percentage of students who have this skill
                        skill_percentage = (students_with_skill / total_distinct_students * 100)
                        gap_percentage = 100 - skill_percentage
                        
                        skill_gaps_data.append({
                            'skill': skill.title(),
                            'gap': round(gap_percentage, 1),
                            'demand': round(skill_percentage, 1),
                            'students_with_skill': students_with_skill,
                            'students_missing_skill': total_distinct_students - students_with_skill,
                            'total_students': total_distinct_students,
                            'job_demand': demand_count  # How many jobs require this skill
                        })
                        
                        logger.info(f"Skill '{skill}': {students_with_skill}/{total_distinct_students} students have it ({skill_percentage:.1f}%), gap: {gap_percentage:.1f}%, demand: {demand_count} jobs")
                
                # Sort by gap percentage (highest first) and take top 6
                skill_gaps_data.sort(key=lambda x: x['gap'], reverse=True)
                skill_gaps = skill_gaps_data[:6]
                
                logger.info(f"Final skill gaps data: {skill_gaps}")
                
            except Exception as e:
                logger.error(f"Error calculating skill gaps from AI reports: {e}", exc_info=True)
                skill_gaps = []
            
            # Performance metrics - only include if we have real data
            performance_metrics = {}
            
            try:
                # Interview success rate (offered / total interviews)
                total_interviews = Application.objects.filter(
                    applicant__student_profile__university=university,
                    status__in=['OFFERED', 'REJECTED']
                ).count()
                
                if total_interviews > 0:
                    interview_success_rate = (total_offered / total_interviews * 100)
                    performance_metrics['interviewSuccessRate'] = round(interview_success_rate, 1)
                
                # Average response time (average days between application and status change)
                response_times = []
                applications_with_response = Application.objects.filter(
                    applicant__student_profile__university=university,
                    status__in=['OFFERED', 'REJECTED'],
                    updated_at__isnull=False
                )
                
                for app in applications_with_response:
                    if app.applied_at and app.updated_at:
                        days = (app.updated_at - app.applied_at).days
                        if days >= 0:
                            response_times.append(days)
                
                if response_times:
                    avg_response_time = sum(response_times) / len(response_times)
                    performance_metrics['avgResponseTime'] = round(avg_response_time, 1)
                
            except Exception as e:
                logger.error(f"Error calculating performance metrics: {e}")
            
            # Top employers with correct status breakdown
            try:
                top_employers = Company.objects.filter(
                    jobs__applications__applicant__student_profile__university=university
                ).annotate(
                    hires=Count('jobs__applications', filter=Q(jobs__applications__status='OFFERED')),
                    rejected=Count('jobs__applications', filter=Q(jobs__applications__status='REJECTED')),
                    interviewed=Count('jobs__applications', filter=Q(jobs__applications__status='INTERVIEWED')),
                    applied=Count('jobs__applications', filter=Q(jobs__applications__status='APPLIED')),
                    total_applications=Count('jobs__applications')
                ).order_by('-hires')[:5]
                
                top_employers_data = []
                for company in top_employers:
                    top_employers_data.append({
                        'name': company.name,
                        'hires': company.hires,
                        'rejected': company.rejected,
                        'interviewed': company.interviewed,
                        'applied': company.applied,
                        'totalApplications': company.total_applications
                    })
            except Exception as e:
                logger.error(f"Error calculating top employers: {e}")
                top_employers_data = []
            
            stats_data = {
                'totalGraduates': total_students,
                'employmentRate': round(employment_rate, 1),
                'averageSalary': int(average_salary),
                'partnerCompanies': partner_companies,
                'employmentTrend': employment_trend,
                'topEmployers': top_employers_data,
                'skillGaps': skill_gaps,  # Top 6 skill gaps
                'hasProfile': True,
                'totalApplied': total_applied,
                'totalInterviewed': total_interviewed,
                'totalOffered': total_offered,
                'totalRejected': total_rejected,
                'recentApplications': recent_applications,
                'recentCompanies': recent_companies,
                'recentCareerFairs': recent_career_fairs,
                'performanceMetrics': performance_metrics,  # Only include if we have data
            }

            logger.info(f"University dashboard stats for {university.name}: {stats_data}")
            return Response(stats_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error generating university dashboard stats: {e}", exc_info=True)
            return Response({
                'totalGraduates': 0,
                'employmentRate': 0,
                'averageSalary': 0,
                'partnerCompanies': 0,
                'employmentTrend': [],
                'topEmployers': [],
                'skillGaps': [],
                'hasProfile': False,
                'message': 'Unable to load dashboard statistics. Please try again later.'
            }, status=status.HTTP_200_OK)  # Return 200 instead of 500 to avoid frontend errors

class UniversityCareerFairsView(APIView):
    """
    Provides career fair data for the university.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        university_staff = getattr(request.user, 'university_staff_profile', None)
        
        # If no university staff profile exists, return empty data
        if not university_staff:
            return Response([], status=status.HTTP_200_OK)
        
        university = university_staff.university

        try:
            career_fairs = CareerFair.objects.filter(host_university=university).order_by('-start_date')
            
            fairs_data = []
            for fair in career_fairs:
                # Count registered employers
                registered_employers = fair.booths.count()
                
                # Count registered students (students interested in any booth)
                registered_students = StudentInterest.objects.filter(
                    booth__fair=fair
                ).values('student').distinct().count()
                
                # Count total applications from this fair
                total_applications = Application.objects.filter(
                    job__booths__fair=fair
                ).count()
                
                # Determine fair status
                today = timezone.now().date()
                if fair.start_date > today:
                    fair_status = 'upcoming'
                elif fair.end_date < today:
                    fair_status = 'completed'
                else:
                    fair_status = 'ongoing'
                
                fairs_data.append({
                    'id': str(fair.id),
                    'name': fair.title,
                    'date': fair.start_date.isoformat(),
                    'status': fair_status,
                    'registeredEmployers': registered_employers,
                    'registeredStudents': registered_students,
                    'totalApplications': total_applications,
                })

            return Response(fairs_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching career fairs: {e}", exc_info=True)
            return Response(
                {"error": "Failed to fetch career fairs."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UniversityAIInsightsView(APIView):
    """
    Provides AI match report insights for the university.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        university_staff = getattr(request.user, 'university_staff_profile', None)
        if not university_staff:
            return Response({
                'totalReports': 0,
                'topSkills': [],
                'careerPaths': [],
                'salaryStats': {},
                'skillGaps': [],
            }, status=status.HTTP_200_OK)
        university = university_staff.university
        try:
            match_reports = AIAnalysisReport.objects.filter(
                resume__student_profile__university=university
            ).select_related('resume', 'resume__student_profile')

            # --- Skill Distribution & Gaps ---
            skill_supply = {}  # skill -> set(student_id)
            skill_demand = {}  # skill -> set(job_id)
            all_skills = set()
            student_ids = set()
            job_ids = set()
            # --- Career Paths ---
            career_paths = {}
            # --- Salary ---
            salary_distribution = []

            for report in match_reports:
                try:
                    student_id = report.resume.student_profile.user_id
                    job_id = report.job.id
                    student_ids.add(student_id)
                    job_ids.add(job_id)
                    analysis_data = json.loads(report.report_data) if isinstance(report.report_data, str) else report.report_data

                    # --- Skill Extraction ---
                    # Supply: skills student has
                    matching_skills = []
                    if 'shared' in analysis_data and 'skills_analysis' in analysis_data['shared']:
                        matching_skills = analysis_data['shared']['skills_analysis'].get('matching_skills', [])
                    for skill in matching_skills:
                        skill_lower = skill.lower().strip()
                        all_skills.add(skill_lower)
                        if skill_lower not in skill_supply:
                            skill_supply[skill_lower] = set()
                        skill_supply[skill_lower].add(student_id)
                    # Demand: skills job requires (from job requirements)
                    if hasattr(report.job, 'requirements') and report.job.requirements:
                        try:
                            job_skills = json.loads(report.job.requirements) if isinstance(report.job.requirements, str) else report.job.requirements
                            if isinstance(job_skills, list):
                                for skill in job_skills:
                                    skill_lower = str(skill).lower().strip()
                                    all_skills.add(skill_lower)
                                    if skill_lower not in skill_demand:
                                        skill_demand[skill_lower] = set()
                                    skill_demand[skill_lower].add(job_id)
                        except Exception as e:
                            pass
                    # --- Career Path Extraction ---
                    next_career_goal = ''
                    if 'student_view' in analysis_data:
                        next_career_goal = analysis_data['student_view'].get('next_career_goal', '').strip()
                    if next_career_goal and next_career_goal.lower() != 'general':
                        if next_career_goal not in career_paths:
                            career_paths[next_career_goal] = 0
                        career_paths[next_career_goal] += 1
                    # --- Salary ---
                    if 'salary_estimate' in analysis_data:
                        salary_distribution.append(analysis_data['salary_estimate'])
                except Exception as e:
                    continue

            # --- Skill Distribution ---
            top_skills = []
            for skill in sorted(all_skills):
                students = len(skill_supply.get(skill, set()))
                avg_score = 10  # Placeholder, as we don't have per-skill score in this aggregation
                top_skills.append({
                    'skill': skill.title(),
                    'students': students,
                    'averageScore': avg_score
                })
            top_skills.sort(key=lambda x: x['students'], reverse=True)

            # --- Skill Gaps ---
            skill_gaps = []
            for skill in sorted(all_skills):
                demand = len(skill_demand.get(skill, set()))
                supply = len(skill_supply.get(skill, set()))
                gap = max(0, demand - supply)
                skill_gaps.append({
                    'skill': skill.title(),
                    'demand': demand,
                    'supply': supply,
                    'gap': gap
                })
            skill_gaps.sort(key=lambda x: x['gap'], reverse=True)

            # --- Career Paths ---
            career_paths_data = [
                {'path': path, 'students': count}
                for path, count in career_paths.items()
            ]
            career_paths_data.sort(key=lambda x: x['students'], reverse=True)

            # --- Salary Statistics ---
            salary_stats = {}
            if salary_distribution:
                salary_stats = {
                    'average': int(sum(salary_distribution) / len(salary_distribution)),
                    'min': min(salary_distribution),
                    'max': max(salary_distribution),
                    'distribution': [
                        {'range': '30k-50k', 'count': len([s for s in salary_distribution if 30000 <= s < 50000])},
                        {'range': '50k-70k', 'count': len([s for s in salary_distribution if 50000 <= s < 70000])},
                        {'range': '70k-90k', 'count': len([s for s in salary_distribution if 70000 <= s < 90000])},
                        {'range': '90k+', 'count': len([s for s in salary_distribution if s >= 90000])}
                    ]
                }

            # --- Skill Normalization ---
            skill_variant_map = {}  # canonical_skill -> set(variants)
            for skill in all_skills:
                match, score, _ = process.extractOne(skill, CANONICAL_SKILLS, scorer=fuzz.token_sort_ratio)
                if score >= 80:
                    canonical = match
                else:
                    canonical = skill.title()
                if canonical not in skill_variant_map:
                    skill_variant_map[canonical] = set()
                skill_variant_map[canonical].add(skill)
            # --- Path Normalization ---
            path_variant_map = {}  # canonical_path -> set(variants)
            for path in career_paths:
                match, score, _ = process.extractOne(path, CANONICAL_PATHS, scorer=fuzz.token_sort_ratio)
                if score >= 80:
                    canonical = match
                else:
                    canonical = path.title()
                if canonical not in path_variant_map:
                    path_variant_map[canonical] = set()
                path_variant_map[canonical].add(path)
            # --- Grouped Skill Distribution ---
            grouped_skills = []
            for canonical, variants in skill_variant_map.items():
                students = sum(len(skill_supply.get(v, set())) for v in variants)
                grouped_skills.append({
                    'skill': canonical,
                    'students': students,
                    'variants': list(variants),
                    'averageScore': 10  # Placeholder
                })
            grouped_skills = [s for s in grouped_skills if s['students'] > 0]
            grouped_skills.sort(key=lambda x: x['students'], reverse=True)
            # --- Grouped Skill Gaps ---
            grouped_gaps = []
            for canonical, variants in skill_variant_map.items():
                demand = sum(len(skill_demand.get(v, set())) for v in variants)
                supply = sum(len(skill_supply.get(v, set())) for v in variants)
                gap = max(0, demand - supply)
                grouped_gaps.append({
                    'skill': canonical,
                    'demand': demand,
                    'supply': supply,
                    'gap': gap,
                    'variants': list(variants)
                })
            grouped_gaps = [g for g in grouped_gaps if g['demand'] > 0 or g['supply'] > 0]
            grouped_gaps.sort(key=lambda x: x['gap'], reverse=True)
            # --- Grouped Career Paths ---
            grouped_paths = []
            for canonical, variants in path_variant_map.items():
                students = sum(career_paths[v] for v in variants)
                grouped_paths.append({
                    'path': canonical,
                    'students': students,
                    'variants': list(variants)
                })
            grouped_paths = [p for p in grouped_paths if p['path'].lower() != 'no career goal suggested.']
            grouped_paths.sort(key=lambda x: x['students'], reverse=True)
            # --- Salary Statistics ---
            salary_stats = {}
            if salary_distribution:
                salary_stats = {
                    'average': int(sum(salary_distribution) / len(salary_distribution)),
                    'min': min(salary_distribution),
                    'max': max(salary_distribution),
                    'distribution': [
                        {'range': '30k-50k', 'count': len([s for s in salary_distribution if 30000 <= s < 50000])},
                        {'range': '50k-70k', 'count': len([s for s in salary_distribution if 50000 <= s < 70000])},
                        {'range': '70k-90k', 'count': len([s for s in salary_distribution if 70000 <= s < 90000])},
                        {'range': '90k+', 'count': len([s for s in salary_distribution if s >= 90000])}
                    ]
                }
            insights_data = {
                'totalReports': len(match_reports),
                'topSkills': grouped_skills,
                'careerPaths': grouped_paths,
                'salaryStats': salary_stats,
                'skillGaps': grouped_gaps,
            }
            logger.info(f"Canonical skills: {len(grouped_skills)}; Canonical gaps: {len(grouped_gaps)}; Canonical paths: {len(grouped_paths)}")
            return Response(insights_data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching AI insights: {e}", exc_info=True)
            return Response(
                {"error": "Failed to fetch AI insights."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UniversityStudentsView(APIView):
    """
    Provides student data for the university.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        university_staff = getattr(request.user, 'university_staff_profile', None)
        
        # If no university staff profile exists, return empty data
        if not university_staff:
            return Response([], status=status.HTTP_200_OK)
        
        university = university_staff.university

        try:
            students = StudentProfile.objects.filter(university=university).select_related('user')
            
            students_data = []
            for student in students:
                # Calculate profile completion
                profile_fields = [
                    student.user.first_name, student.user.last_name, student.user.email,
                    student.major, student.graduation_year, student.skills
                ]
                completed_fields = sum(1 for field in profile_fields if field)
                profile_completion = int((completed_fields / len(profile_fields)) * 100)
                
                # Count applications
                total_applications = Application.objects.filter(applicant=student.user).count()
                successful_applications = Application.objects.filter(
                    applicant=student.user, 
                    status='OFFERED'
                ).count()
                
                # Calculate AI match score (average of all AI match reports)
                ai_reports = AIAnalysisReport.objects.filter(resume__student_profile=student)
                ai_score = 0
                if ai_reports.exists():
                    total_score = 0
                    for report in ai_reports:
                        try:
                            report_data = json.loads(report.report_data) if isinstance(report.report_data, str) else report.report_data
                            if report_data and 'overall_score' in report_data:
                                total_score += report_data['overall_score']
                        except (json.JSONDecodeError, TypeError):
                            continue
                    ai_score = total_score / ai_reports.count() if ai_reports.count() > 0 else 0
                
                # Check if student has resume
                has_resume = student.resumes.exists()
                
                students_data.append({
                    'id': str(student.user.id),
                    'name': f"{student.user.first_name} {student.user.last_name}",
                    'email': student.user.email,
                    'major': student.major or 'Not specified',
                    'graduationYear': str(student.graduation_year) if student.graduation_year else 'Not specified',
                    'profileCompletion': profile_completion,
                    'totalApplications': total_applications,
                    'successfulApplications': successful_applications,
                    'aiMatchScore': round(ai_score, 1),
                    'lastActive': student.user.last_login.isoformat() if student.user.last_login else 'Never',
                    'hasResume': has_resume,
                })
            
            return Response(students_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching students: {e}", exc_info=True)
            return Response(
                {"error": "Failed to fetch students."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UniversityStaffView(APIView):
    """
    Provides staff data for the university.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        university_staff = getattr(request.user, 'university_staff_profile', None)
        
        # If no university staff profile exists, return empty data
        if not university_staff:
            return Response([], status=status.HTTP_200_OK)
        
        university = university_staff.university

        try:
            staff_members = UniversityStaffProfile.objects.filter(university=university).select_related('user')
            
            staff_data = []
            for staff in staff_members:
                staff_data.append({
                    'id': str(staff.user.id),
                    'name': f"{staff.user.first_name} {staff.user.last_name}",
                    'email': staff.user.email,
                    'role': staff.role or 'Staff Member',
                    'joinedAt': staff.created_at.isoformat(),
                    'lastActive': staff.user.last_login.isoformat() if staff.user.last_login else 'Never',
                })
            
            return Response(staff_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching staff: {e}", exc_info=True)
            return Response(
                {"error": "Failed to fetch staff."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

from django.shortcuts import render
from rest_framework import generics, permissions, status
from .models import User, StudentProfile, EmployerProfile, UniversityStaffProfile
from .serializers import (
    UserSerializer, RegisterSerializer, StudentProfileSerializer, 
    EmployerProfileSerializer, UniversityStaffProfileSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer, PasswordChangeSerializer,
    EmailVerificationRequestSerializer, EmailVerificationConfirmSerializer, EmailVerificationResendSerializer
)
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from rest_framework.decorators import api_view, permission_classes
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.core.cache import cache
import logging
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
import os, uuid
from django.conf import settings
from .serializers import UniversitySerializer, CompanySerializer
from .models import University, Company

logger = logging.getLogger(__name__)

# Create your views here.

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        return UserSerializer

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class DeleteUserView(generics.DestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def delete(self, request, *args, **kwargs):
        user = self.get_object()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class PasswordResetRequestView(generics.GenericAPIView):
    """
    Request password reset email
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetRequestSerializer

    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Rate limiting: max 3 requests per hour per email
        email = serializer.validated_data['email']
        cache_key = f"password_reset_{email}"
        request_count = cache.get(cache_key, 0)
        
        if request_count >= 3:
            return Response(
                {"error": "Too many password reset requests. Please try again later."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        try:
            result = serializer.save()
            # Increment request count
            cache.set(cache_key, request_count + 1, 3600)  # 1 hour cache
            
            # Log the password reset request
            logger.info(f"Password reset requested for email: {email}")
            
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Password reset failed for email {email}: {str(e)}")
            return Response(
                {"error": "Failed to send password reset email. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PasswordResetConfirmView(generics.GenericAPIView):
    """
    Confirm password reset with token
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetConfirmSerializer

    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = serializer.save()
            
            # Log the password reset
            user = serializer.user
            logger.info(f"Password reset completed for user: {user.email}")
            
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Password reset confirmation failed: {str(e)}")
            return Response(
                {"error": "Failed to reset password. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PasswordChangeView(generics.GenericAPIView):
    """
    Change password for authenticated user
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = PasswordChangeSerializer

    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        try:
            result = serializer.save()
            
            # Log the password change
            logger.info(f"Password changed for user: {request.user.email}")
            
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Password change failed for user {request.user.email}: {str(e)}")
            return Response(
                {"error": "Failed to change password. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def password_reset_validate_token(request, uidb64, token):
    """
    Validate password reset token without changing password
    """
    from django.utils.http import urlsafe_base64_decode
    from django.utils.encoding import force_str
    from django.contrib.auth.tokens import default_token_generator
    
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {"valid": False, "error": "Invalid reset link."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not default_token_generator.check_token(user, token):
        return Response(
            {"valid": False, "error": "Invalid or expired reset link."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({"valid": True, "email": user.email}, status=status.HTTP_200_OK)

class EmailVerificationRequestView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = EmailVerificationRequestSerializer

    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        try:
            result = serializer.save()
            logger.info(f"Verification email sent to: {serializer.validated_data['email']}")
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Email verification request failed: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class EmailVerificationConfirmView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = EmailVerificationConfirmSerializer

    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            result = serializer.save()
            logger.info(f"Email verified for user: {serializer.user.email}")
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Email verification confirmation failed: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class EmailVerificationResendView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = EmailVerificationResendSerializer

    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        try:
            result = serializer.save()
            logger.info(f"Verification email resent to: {serializer.validated_data['email']}")
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Email verification resend failed: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ProfilePictureUploadView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        upload_file = request.FILES.get('file')
        if not upload_file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        allowed_types = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp'
        ]
        content_type = upload_file.content_type
        if content_type not in allowed_types:
            return Response({'error': 'Unsupported file type. Only JPEG, PNG, GIF, and WEBP allowed.'},
                            status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

        file_bytes = upload_file.read()
        if not file_bytes:
            return Response({'error': 'Uploaded file is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        from django.core.files.uploadedfile import InMemoryUploadedFile
        import io
        file_stream = io.BytesIO(file_bytes)
        file_stream.seek(0)
        upload_file_for_storage = InMemoryUploadedFile(
            file_stream, None, upload_file.name, content_type, len(file_bytes), None
        )

        extension = os.path.splitext(upload_file.name)[1]
        filename = f"{uuid.uuid4()}{extension}"
        save_path = os.path.join('user_uploads', 'profile_pics', filename)
        full_path = default_storage.save(save_path, upload_file_for_storage)
        file_url = os.path.join(settings.MEDIA_URL, full_path)

        user = request.user
        user.profile_picture_url = file_url
        user.save()

        return Response({'profile_picture_url': file_url}, status=status.HTTP_200_OK)

class UniversityListView(generics.ListAPIView):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer

class CompanyListView(generics.ListAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

class UniversityStaffListView(generics.ListAPIView):
    queryset = UniversityStaffProfile.objects.select_related('user', 'university').all()
    serializer_class = UniversityStaffProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)
