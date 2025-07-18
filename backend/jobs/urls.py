from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, ApplicationViewSet, SkillListAPIView, MyApplicationsAPIView, ActiveResumeAPIView, SavedJobViewSet, AnalyzeCVAPIView, ResumeUploadAPIView, ResumeDownloadAPIView

router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'saved-jobs', SavedJobViewSet, basename='saved-job')

urlpatterns = [
    path('', include(router.urls)),
    path('skills/', SkillListAPIView.as_view(), name='skill-list'),
    # Legacy endpoint aliases for frontend compatibility
    path('my-applications/', MyApplicationsAPIView.as_view(), name='my-applications'),
    path('cv/active/', ActiveResumeAPIView.as_view(), name='active-cv'),
    path('cv/analyze/', AnalyzeCVAPIView.as_view(), name='analyze-cv'), 
    path('cv/upload/', ResumeUploadAPIView.as_view(), name='upload-cv'),
    path('cv/<uuid:pk>/download/', ResumeDownloadAPIView.as_view(), name='download-cv'),
] 