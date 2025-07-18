from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CareerFairViewSet, 
    BoothViewSet, 
    StudentInterestViewSet, 
    EmployerFairsViewSet,
    FairDiscoveryViewSet
)

router = DefaultRouter()
router.register(r'fairs', CareerFairViewSet, basename='fairs')
router.register(r'booths', BoothViewSet)
router.register(r'interests', StudentInterestViewSet)
router.register(r'employer-fairs', EmployerFairsViewSet, basename='employer-fairs')
router.register(r'discover', FairDiscoveryViewSet, basename='discover-fairs')

urlpatterns = [
    path('', include(router.urls)),
] 