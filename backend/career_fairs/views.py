from rest_framework import viewsets, permissions, status, pagination
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Exists, OuterRef
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
