from django.urls import path
from .views import (
    RegisterView, UserDetailView, ProfileView, DeleteUserView, MyTokenObtainPairView,
    PasswordResetRequestView, PasswordResetConfirmView, PasswordChangeView,
    password_reset_validate_token, EmailVerificationRequestView, EmailVerificationConfirmView,
    EmailVerificationResendView, ProfilePictureUploadView, UniversityListView, CompanyListView,
    UniversityStaffListView, UniversityDashboardStatsView, UniversityCareerFairsView,
    UniversityAIInsightsView, UniversityStudentsView, UniversityStaffView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('delete/', DeleteUserView.as_view(), name='delete-user'),
    
    # Password management
    path('password-reset-request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('password-change/', PasswordChangeView.as_view(), name='password-change'),
    path('password-reset-validate/<str:uidb64>/<str:token>/', password_reset_validate_token, name='password-reset-validate'),
    
    # Email verification
    path('email-verification-request/', EmailVerificationRequestView.as_view(), name='email-verification-request'),
    path('email-verification-confirm/', EmailVerificationConfirmView.as_view(), name='email-verification-confirm'),
    path('email-verification-resend/', EmailVerificationResendView.as_view(), name='email-verification-resend'),
    
    # Profile picture upload
    path('profile-picture-upload/', ProfilePictureUploadView.as_view(), name='profile-picture-upload'),
    
    # Lists
    path('universities/', UniversityListView.as_view(), name='university-list'),
    path('companies/', CompanyListView.as_view(), name='company-list'),
    path('university-staff/', UniversityStaffListView.as_view(), name='university-staff-list'),
    
    # University specific endpoints
    path('university/dashboard-stats/', UniversityDashboardStatsView.as_view(), name='university-dashboard-stats'),
    path('university/career-fairs/', UniversityCareerFairsView.as_view(), name='university-career-fairs'),
    path('university/ai-insights/', UniversityAIInsightsView.as_view(), name='university-ai-insights'),
    path('university/students/', UniversityStudentsView.as_view(), name='university-students'),
    path('university/staff/', UniversityStaffView.as_view(), name='university-staff'),
] 