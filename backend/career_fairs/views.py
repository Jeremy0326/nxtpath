from rest_framework import viewsets, permissions, status, pagination
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Exists, OuterRef
from django.utils import timezone
from .models import CareerFair, Booth, StudentInterest
from .serializers import CareerFairSerializer, BoothSerializer, StudentInterestSerializer, BoothUpdateSerializer
from .permissions import IsHostUniversityOrReadOnly

class CustomPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class CareerFairViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows career fairs to be viewed or edited.
    """
    queryset = CareerFair.objects.all().order_by('-start_date')
    serializer_class = CareerFairSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsHostUniversityOrReadOnly]
    pagination_class = CustomPagination

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register(self, request, pk=None):
        fair = self.get_object()
        employer_profile = getattr(request.user, 'employer_profile', None)

        if not employer_profile or not employer_profile.company:
            return Response({"error": "User is not associated with a company."}, status=status.HTTP_400_BAD_REQUEST)

        company = employer_profile.company

        if Booth.objects.filter(fair=fair, company=company).exists():
            return Response({"error": "Company is already registered for this fair."}, status=status.HTTP_400_BAD_REQUEST)

        # Create a booth without assigning coordinates
        Booth.objects.create(fair=fair, company=company, label=company.name)
        return Response({"status": "registered"}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unregister(self, request, pk=None):
        fair = self.get_object()
        employer_profile = getattr(request.user, 'employer_profile', None)

        if not employer_profile or not employer_profile.company:
            return Response({"error": "User is not associated with a company."}, status=status.HTTP_400_BAD_REQUEST)

        company = employer_profile.company
        booth = Booth.objects.filter(fair=fair, company=company).first()
        if not booth:
            return Response({"error": "Company is not registered for this fair."}, status=status.HTTP_400_BAD_REQUEST)
        booth.delete()
        return Response({"status": "unregistered"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def create_booth(self, request, pk=None):
        fair = self.get_object()
        employer_profile = getattr(request.user, 'employer_profile', None)

        if not employer_profile or not employer_profile.company:
            return Response({"error": "User is not associated with a company."}, status=status.HTTP_400_BAD_REQUEST)

        company = employer_profile.company

        # Check if booth already exists
        if Booth.objects.filter(fair=fair, company=company).exists():
            booth = Booth.objects.get(fair=fair, company=company)
            return Response(BoothSerializer(booth).data, status=status.HTTP_200_OK)

        # Create a new booth
        booth = Booth.objects.create(fair=fair, company=company, label=company.name)
        return Response(BoothSerializer(booth).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def booths(self, request, pk=None):
        """
        Get all booths for a specific career fair.
        """
        fair = self.get_object()
        booths = fair.booths.select_related('company').prefetch_related('jobs').all()
        return Response(BoothSerializer(booths, many=True).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def registrations(self, request, pk=None):
        """
        Get all registrations for a specific career fair.
        """
        fair = self.get_object()
        
        # Check if user has permission to view registrations (university staff)
        university_staff = getattr(request.user, 'university_staff_profile', None)
        if not university_staff or university_staff.university != fair.host_university:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        
        # Get employer registrations (booths)
        employer_registrations = []
        for booth in fair.booths.select_related('company').all():
            employer_registrations.append({
                'id': str(booth.id),
                'type': 'employer',
                'name': booth.company.name,
                'email': booth.company.email if hasattr(booth.company, 'email') else 'N/A',
                'registrationDate': booth.created_at.isoformat(),
                'status': 'approved',  # Booths are auto-approved for now
                'company': booth.company.name,
                'boothNumber': booth.booth_number or 'Not assigned',
            })
        
        # Get student interests as student registrations
        student_registrations = []
        # Get unique students who have expressed interest in any booth for this fair
        students_with_interests = StudentInterest.objects.filter(
            booth__fair=fair
        ).select_related('student').values_list('student', flat=True).distinct()
        
        for student_id in students_with_interests:
            # Get the first interest record for this student to get basic info
            interest = StudentInterest.objects.filter(
                booth__fair=fair, student_id=student_id
            ).select_related('student').first()
            
            if interest:
                student_registrations.append({
                    'id': str(interest.student.id),  # Use student ID instead of interest ID
                    'type': 'student',
                    'name': f"{interest.student.first_name} {interest.student.last_name}",
                    'email': interest.student.email,
                    'registrationDate': interest.timestamp.isoformat(),
                    'status': 'approved',  # Student interests are auto-approved
                })
        
        return Response(employer_registrations + student_registrations, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def reports(self, request, pk=None):
        """
        Get comprehensive reports for a specific career fair.
        """
        fair = self.get_object()
        
        # Check if user has permission (university staff)
        university_staff = getattr(request.user, 'university_staff_profile', None)
        if not university_staff or university_staff.university != fair.host_university:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        
        # Generate report data
        from django.db.models import Count
        from jobs.models import Application
        
        booths_count = fair.booths.count()
        student_interests = StudentInterest.objects.filter(booth__fair=fair).count()
        applications = Application.objects.filter(job__booths__fair=fair).count()
        
        # Top companies by student interest
        top_companies = fair.booths.annotate(
            interest_count=Count('interested_students')
        ).order_by('-interest_count')[:10]
        
        report_data = {
            'overview': {
                'totalBooths': booths_count,
                'totalStudentInterests': student_interests,
                'totalApplications': applications,
                'fairTitle': fair.title,
                'fairDate': fair.start_date.isoformat(),
            },
            'topCompanies': [
                {
                    'name': booth.company.name,
                    'interests': booth.interest_count,
                    'boothNumber': booth.booth_number or 'Not assigned'
                }
                for booth in top_companies
            ],
            'dailyActivity': [
                # This would require more complex queries based on actual data
                # For now, return empty array
            ]
        }
        
        return Response(report_data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def analytics(self, request, pk=None):
        """
        Get analytics data for a specific career fair.
        """
        fair = self.get_object()
        
        # Check if user has permission (university staff)
        university_staff = getattr(request.user, 'university_staff_profile', None)
        if not university_staff or university_staff.university != fair.host_university:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        
        # Generate analytics data
        from django.db.models import Count, Avg
        from jobs.models import Application
        import json
        
        analytics_data = {
            'engagement': {
                'totalViews': fair.booths.count() * 50,  # Mock data
                'uniqueVisitors': StudentInterest.objects.filter(booth__fair=fair).values('student').distinct().count(),
                'averageTimeSpent': '5.2 minutes',  # Mock data
                'boothVisits': fair.booths.annotate(
                    visits=Count('interested_students')
                ).aggregate(total=Count('id'))['total'] or 0
            },
            'trends': [
                # Mock trend data - in production, this would be calculated from actual visit logs
                {'date': '2024-01-01', 'visitors': 45},
                {'date': '2024-01-02', 'visitors': 67},
                {'date': '2024-01-03', 'visitors': 89},
            ],
            'demographics': {
                'byMajor': [
                    {'major': 'Computer Science', 'count': 45},
                    {'major': 'Engineering', 'count': 32},
                    {'major': 'Business', 'count': 28},
                ],
                'byYear': [
                    {'year': 'Senior', 'count': 62},
                    {'year': 'Junior', 'count': 43},
                ]
            },
            'success': {
                'applicationConversion': 0.15,  # Mock data
                'interviewRate': 0.08,  # Mock data
                'offerRate': 0.03,  # Mock data
            }
        }
        
        return Response(analytics_data, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a single career fair with enhanced statistics
        """
        fair = self.get_object()
        serializer = self.get_serializer(fair)
        data = serializer.data
        
        # Add detailed statistics
        from django.db.models import Count
        from jobs.models import Application
        
        # Calculate statistics
        booths_count = fair.booths.count()
        student_interests_count = StudentInterest.objects.filter(booth__fair=fair).values('student').distinct().count()
        total_applications = Application.objects.filter(job__booths__fair=fair).count()
        
        # Enhanced data with statistics
        enhanced_data = {
            **data,
            'registeredEmployers': booths_count,
            'registeredStudents': student_interests_count,
            'totalApplications': total_applications,
            'description': data.get('description', 'Career fair organized by the university'),
            'location': data.get('location', 'University Main Campus'),
            'website': data.get('website', ''),
            'bannerImageUrl': data.get('banner_image_url', ''),
            'startDate': data.get('start_date'),
            'endDate': data.get('end_date'),
            'isActive': data.get('is_active', True),
            'status': 'completed' if fair.end_date and fair.end_date < timezone.now().date() else 'ongoing' if fair.start_date <= timezone.now().date() <= fair.end_date else 'upcoming'
        }
        
        return Response(enhanced_data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def express_interest(self, request, pk=None):
        """
        Allow students to express interest in a booth at a career fair.
        """
        import logging
        logger = logging.getLogger(__name__)
        
        fair = self.get_object()
        booth_id = request.data.get('booth_id')
        
        logger.info(f"Express interest request: fair={fair.id}, booth_id={booth_id}, user={request.user.id}")
        logger.info(f"User is authenticated: {request.user.is_authenticated}")
        logger.info(f"User email: {request.user.email}")
        logger.info(f"Request data: {request.data}")
        
        if not booth_id:
            logger.error("No booth_id provided in request")
            return Response({"error": "booth_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Debug: Log all available booths for this fair
        all_booths = Booth.objects.filter(fair=fair)
        logger.info(f"Available booths for fair {fair.id}: {[str(b.id) for b in all_booths]}")
        
        try:
            booth = Booth.objects.get(id=booth_id, fair=fair)
            logger.info(f"Found booth: {booth.id} for company {booth.company.name}")
        except Booth.DoesNotExist:
            logger.error(f"Booth {booth_id} not found for fair {fair.id}")
            return Response({
                "error": "Booth not found.",
                "debug_info": {
                    "requested_booth_id": booth_id,
                    "fair_id": str(fair.id),
                    "available_booth_ids": [str(b.id) for b in all_booths]
                }
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if student already expressed interest
        existing_interest = StudentInterest.objects.filter(
            booth=booth, student=request.user
        ).first()
        
        if existing_interest:
            logger.info(f"User {request.user.id} already expressed interest in booth {booth.id}")
            return Response({"error": "You have already expressed interest in this booth."}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create interest
        try:
            interest = StudentInterest.objects.create(
                booth=booth,
                student=request.user
            )
            logger.info(f"Created interest: {interest.id} for user {request.user.id} in booth {booth.id}")
            return Response(StudentInterestSerializer(interest).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Failed to create interest: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response({
                "error": f"Failed to create interest: {str(e)}",
                "debug_info": {
                    "user_id": str(request.user.id),
                    "booth_id": booth_id,
                    "fair_id": str(fair.id),
                    "error_details": str(e)
                }
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def remove_interest(self, request, pk=None):
        """
        Allow students to remove their interest in a booth.
        """
        fair = self.get_object()
        booth_id = request.data.get('booth_id')
        
        if not booth_id:
            return Response({"error": "booth_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            booth = Booth.objects.get(id=booth_id, fair=fair)
            interest = StudentInterest.objects.get(booth=booth, student=request.user)
            interest.delete()
            return Response({"message": "Interest removed successfully."}, status=status.HTTP_200_OK)
        except Booth.DoesNotExist:
            return Response({"error": "Booth not found."}, status=status.HTTP_404_NOT_FOUND)
        except StudentInterest.DoesNotExist:
            return Response({"error": "Interest not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_interests(self, request, pk=None):
        """
        Get all booths a student has expressed interest in for this career fair.
        """
        fair = self.get_object()
        interests = StudentInterest.objects.filter(
            booth__fair=fair, student=request.user
        ).select_related('booth__company').prefetch_related('booth__jobs')
        
        return Response(StudentInterestSerializer(interests, many=True).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def booth_interests(self, request, pk=None):
        """
        Get all students interested in booths for this career fair (for university staff).
        """
        fair = self.get_object()
        
        # Check if user has permission (university staff)
        university_staff = getattr(request.user, 'university_staff_profile', None)
        if not university_staff or university_staff.university != fair.host_university:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        
        interests = StudentInterest.objects.filter(
            booth__fair=fair
        ).select_related('student', 'booth__company').prefetch_related('booth__jobs')
        
        return Response(StudentInterestSerializer(interests, many=True).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def debug_booth_data(self, request, pk=None):
        """
        Debug endpoint to check booth data for this fair.
        """
        fair = self.get_object()
        booths = Booth.objects.filter(fair=fair).select_related('company')
        
        booth_data = []
        for booth in booths:
            booth_data.append({
                'id': str(booth.id),
                'company_name': booth.company.name,
                'booth_number': booth.booth_number,
                'position': f"({booth.x}, {booth.y})",
                'fair_id': str(fair.id)
            })
        
        return Response({
            'fair_id': str(fair.id),
            'fair_title': fair.title,
            'booth_count': len(booth_data),
            'booths': booth_data,
            'user_id': str(request.user.id),
            'user_email': request.user.email
        }, status=status.HTTP_200_OK)

class FairDiscoveryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides a list of active career fairs available for registration.
    Excludes fairs the employer's company is already registered for.
    """
    serializer_class = CareerFairSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        employer_profile = getattr(self.request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return CareerFair.objects.none()

        company = employer_profile.company

        # Subquery to check if a booth for the current company exists for a fair
        registered_fairs_subquery = Booth.objects.filter(
            fair=OuterRef('pk'),
            company=company
        )

        queryset = CareerFair.objects.filter(is_active=True).annotate(
            is_registered=Exists(registered_fairs_subquery)
        ).order_by('-start_date')

        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(host_university__name__icontains=search_query) |
                Q(location__icontains=search_query)
            )
        
        return queryset


class EmployerFairsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides a list of career fairs the employer's company is registered for.
    """
    serializer_class = CareerFairSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CustomPagination

    def get_queryset(self):
        employer_profile = getattr(self.request.user, 'employer_profile', None)
        if not employer_profile or not employer_profile.company:
            return CareerFair.objects.none()

        company = employer_profile.company
        queryset = CareerFair.objects.filter(booths__company=company).prefetch_related(
            'booths__jobs',
            'booths__company'
        ).distinct().order_by('-start_date')

        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(host_university__name__icontains=search_query) |
                Q(location__icontains=search_query)
            )

        return queryset


class BoothViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows booths to be viewed or edited.
    """
    queryset = Booth.objects.all()
    serializer_class = BoothSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return BoothUpdateSerializer
        return BoothSerializer

class StudentInterestViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows student interests to be viewed or created.
    """
    queryset = StudentInterest.objects.all()
    serializer_class = StudentInterestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
