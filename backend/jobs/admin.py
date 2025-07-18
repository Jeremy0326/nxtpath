from django.contrib import admin
from .models import Skill, Job, Application, AIAnalysisReport, AIInterview, InterviewUtterance, AIInterviewReport

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    search_fields = ('name',)

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'job_type', 'remote_option', 'is_active')
    list_filter = ('job_type', 'remote_option', 'is_active', 'company')
    search_fields = ('title', 'company__name', 'description')
    raw_id_fields = ('company',)

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('job', 'applicant', 'status', 'applied_at')
    list_filter = ('status',)
    search_fields = ('job__title', 'applicant__email')
    raw_id_fields = ('job', 'applicant', 'resume')

@admin.register(AIAnalysisReport)
class AIAnalysisReportAdmin(admin.ModelAdmin):
    list_display = ('resume', 'job', 'overall_score', 'report_version', 'model_name', 'is_stale', 'created_at')
    search_fields = ('resume__student_profile__user__email', 'job__title')
    raw_id_fields = ('resume', 'job')

@admin.register(AIInterview)
class AIInterviewAdmin(admin.ModelAdmin):
    list_display = ('application', 'status', 'completed_at')
    list_filter = ('status',)
    raw_id_fields = ('application',)

@admin.register(InterviewUtterance)
class InterviewUtteranceAdmin(admin.ModelAdmin):
    list_display = ('interview', 'sequence', 'speaker', 'text')
    list_filter = ('speaker',)
    raw_id_fields = ('interview',)

@admin.register(AIInterviewReport)
class AIInterviewReportAdmin(admin.ModelAdmin):
    list_display = ('interview', 'report_version', 'model_name', 'overall_score', 'created_at')
    search_fields = ('interview__id', 'report_version', 'model_name')
    raw_id_fields = ('interview',)
