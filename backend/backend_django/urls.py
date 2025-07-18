"""
URL configuration for backend_django project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from accounts.views import (
    RegisterView, UserDetailView, ProfileView, DeleteUserView, MyTokenObtainPairView,
    PasswordResetRequestView, PasswordResetConfirmView, PasswordChangeView, password_reset_validate_token,
    EmailVerificationRequestView, EmailVerificationConfirmView, EmailVerificationResendView, ProfilePictureUploadView,
    UniversityListView, CompanyListView, UniversityStaffListView
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('jobs.urls')),
    path('api/employer/', include('employer.urls')),
    path('api/career-fairs/', include('career_fairs.urls')),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/user/', UserDetailView.as_view(), name='user-detail'),
    path('api/profile/', ProfileView.as_view(), name='profile'),
    path('api/profile/upload-picture/', ProfilePictureUploadView.as_view(), name='profile_picture_upload'),
    path('api/delete-user/', DeleteUserView.as_view(), name='delete-user'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/reset-password/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('api/auth/reset-password/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/auth/change-password/', PasswordChangeView.as_view(), name='password_change'),
    path('api/auth/reset-password/validate/<str:uidb64>/<str:token>/', password_reset_validate_token, name='password_reset_validate'),
    path('api/auth/verify-email/', EmailVerificationRequestView.as_view(), name='email_verification_request'),
    path('api/auth/verify-email/confirm/', EmailVerificationConfirmView.as_view(), name='email_verification_confirm'),
    path('api/auth/verify-email/resend/', EmailVerificationResendView.as_view(), name='email_verification_resend'),
    path('api/universities/', UniversityListView.as_view(), name='university-list'),
    path('api/companies/', CompanyListView.as_view(), name='company-list'),
    path('api/accounts/university-staff/', UniversityStaffListView.as_view(), name='university-staff-list'),
]
# Serve uploaded files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

