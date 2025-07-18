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
