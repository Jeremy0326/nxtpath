from django.contrib import admin
from .models import User, StudentProfile, EmployerProfile, UniversityStaffProfile, Company, University, Resume, CompanyJoinRequest, Connection

# Register your models here.

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'user_type', 'is_staff', 'is_verified')
    list_filter = ('user_type', 'is_staff', 'is_verified')
    search_fields = ('email', 'full_name')
    ordering = ('email',)

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry', 'location', 'size')
    search_fields = ('name', 'industry')

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'location')
    search_fields = ('name',)

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'university', 'major', 'graduation_year')
    search_fields = ('user__email', 'university__name', 'major')

@admin.register(EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'role', 'is_company_admin')
    search_fields = ('user__email', 'company__name')

@admin.register(UniversityStaffProfile)
class UniversityStaffProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'university', 'role')
    search_fields = ('user__email', 'university__name')

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'file_name', 'is_primary', 'uploaded_at')
    list_filter = ('is_primary',)
    search_fields = ('student_profile__user__email', 'file_name')

@admin.register(CompanyJoinRequest)
class CompanyJoinRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'status', 'created_at')
    list_filter = ('status', 'company')
    search_fields = ('user__email', 'company__name')

@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ('employer', 'student', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('employer__email', 'student__email', 'employer__full_name', 'student__full_name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
