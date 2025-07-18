from rest_framework import serializers
from .models import User, StudentProfile, EmployerProfile, UniversityStaffProfile, University, Company, Resume
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ('id', 'name', 'logo_url')

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ('university', 'major', 'gpa', 'graduation_year', 'skills', 'interests', 'career_preferences')
        extra_kwargs = {
            'university': {'required': False, 'allow_null': True},
            'major': {'required': False, 'allow_null': True},
            'gpa': {'required': False, 'allow_null': True},
            'graduation_year': {'required': False, 'allow_null': True},
            'skills': {'required': False, 'allow_null': True},
            'interests': {'required': False, 'allow_null': True},
            'career_preferences': {'required': False, 'allow_null': True},
        }

class EmployerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployerProfile
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    student_profile = serializers.SerializerMethodField()
    employer_profile = serializers.SerializerMethodField()
    university_staff_profile = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'user_type', 'full_name', 
            'profile_picture_url', 'is_verified',
            'student_profile', 'employer_profile', 'university_staff_profile', 'role'
        )

    def get_role(self, obj):
        return obj.user_type

    def get_student_profile(self, obj):
        return None
    def get_employer_profile(self, obj):
        try:
            profile = obj.employer_profile
            if profile:
                return {
                    'user': profile.user.id,
                    'company': profile.company.id,
                    'role': profile.role,
                    'is_company_admin': profile.is_company_admin
                }
        except:
            pass
        return None
    def get_university_staff_profile(self, obj):
        return None

class UniversityStaffProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    university = UniversitySerializer(read_only=True)
    
    class Meta:
        model = UniversityStaffProfile
        fields = ('user', 'university', 'role', 'created_at')

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ('id', 'file_name', 'file_url', 'is_primary')

class StudentProfileDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    university = UniversitySerializer(read_only=True)
    resumes = ResumeSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = ('user', 'university', 'major', 'gpa', 'graduation_year', 'skills', 'interests', 'career_preferences', 'resumes')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    user_type = serializers.ChoiceField(choices=User.UserType.choices)

    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'user_type', 'full_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            email=validated_data['email'],
            full_name=validated_data.get('full_name', ''),
            user_type=validated_data['user_type']
        )
        user.set_password(validated_data['password'])
        user.save()

        # Create the corresponding profile based on user_type
        if user.user_type == User.UserType.STUDENT:
            StudentProfile.objects.create(user=user)
        elif user.user_type == User.UserType.EMPLOYER:
            EmployerProfile.objects.create(user=user)
        elif user.user_type == User.UserType.UNIVERSITY:
            # Note: This requires a University instance to be assigned later
            UniversityStaffProfile.objects.create(user=user)

        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims if needed
        token['email'] = user.email
        token['role'] = user.role
        token['user_type'] = user.user_type
        token['full_name'] = user.full_name
        return token

    def validate(self, attrs):
        # Use default validation (relies on email as USERNAME_FIELD)
        data = super().validate(attrs)

        user = self.user  # Set by super().validate
        if not user.is_verified:
            raise serializers.ValidationError({"error": "Email not verified. Please check your inbox and verify your email before logging in."})
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'user_type': user.user_type,
            'full_name': user.full_name,
        }
        return data 

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        """
        Check that the email exists in the database.
        """
        if not User.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("No user found with this email address.")
        return value

    def save(self, **kwargs):
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Get current site
        request = self.context.get('request')
        if request:
            current_site = get_current_site(request)
            domain = current_site.domain
            site_name = current_site.name
        else:
            domain = 'localhost:5173'  # Fallback for development
            site_name = 'NxtPath'
        
        # Create reset URL
        reset_url = f"http://{domain}/reset-password/{uid}/{token}/"
        
        # Send email
        subject = f"Password Reset Request - {site_name}"
        message = f"""
        Hello {user.full_name or user.email},
        
        You requested a password reset for your {site_name} account.
        
        Please click the following link to reset your password:
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request this password reset, please ignore this email.
        
        Best regards,
        The {site_name} Team
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            return {'success': True, 'message': 'Password reset email sent successfully.'}
        except Exception as e:
            raise serializers.ValidationError(f"Failed to send email: {str(e)}")


class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        return attrs

    def validate_uidb64(self, value):
        try:
            uid = force_str(urlsafe_base64_decode(value))
            self.user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid reset link.")
        return value

    def validate_token(self, value):
        if not default_token_generator.check_token(self.user, value):
            raise serializers.ValidationError("Invalid or expired reset link.")
        return value

    def save(self, **kwargs):
        self.user.set_password(self.validated_data['new_password'])
        self.user.save()
        return {'success': True, 'message': 'Password reset successfully.'}


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return {'success': True, 'message': 'Password changed successfully.'} 

class EmailVerificationRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("No user found with this email address.")
        return value

    def save(self, **kwargs):
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        if user.is_verified:
            raise serializers.ValidationError("Email is already verified.")
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        request = self.context.get('request')
        if request:
            current_site = get_current_site(request)
            domain = current_site.domain
            site_name = current_site.name
        else:
            domain = 'localhost:5173'
            site_name = 'NxtPath'
        verify_url = f"http://{domain}/verify-email/{uid}/{token}/"
        subject = f"Verify your email - {site_name}"
        message = f"""
        Hello {user.full_name or user.email},

        Please verify your email address for your {site_name} account by clicking the link below:
        {verify_url}

        If you did not create an account, please ignore this email.

        Best regards,
        The {site_name} Team
        """
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            return {'success': True, 'message': 'Verification email sent successfully.'}
        except Exception as e:
            raise serializers.ValidationError(f"Failed to send email: {str(e)}")

class EmailVerificationConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uidb64']))
            self.user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid verification link.")
        if not default_token_generator.check_token(self.user, attrs['token']):
            raise serializers.ValidationError("Invalid or expired verification link.")
        return attrs

    def save(self, **kwargs):
        self.user.is_verified = True
        self.user.save()
        return {'success': True, 'message': 'Email verified successfully.'}

class EmailVerificationResendSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email address.")
        if user.is_verified:
            raise serializers.ValidationError("Email is already verified.")
        return value

    def save(self, **kwargs):
        # Reuse the request serializer logic
        serializer = EmailVerificationRequestSerializer(data=self.validated_data, context=self.context)
        serializer.is_valid(raise_exception=True)
        return serializer.save() 

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = (
            'id', 'name', 'logo_url', 'description', 'website', 'industry', 'location', 'size', 'social_links', 'gallery_urls'
        ) 