from django.contrib import admin
from .models import CareerFair, Booth, StudentInterest, BoothJob

@admin.register(BoothJob)
class BoothJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'booth', 'job', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('booth__company__name', 'job__title')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)

@admin.register(Booth)
class BoothAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'fair', 'booth_number', 'label', 'x', 'y')
    list_filter = ('fair', 'company')
    search_fields = ('company__name', 'fair__title', 'label')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(CareerFair)
class CareerFairAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'host_university', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active', 'start_date', 'host_university')
    search_fields = ('title', 'host_university__name')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(StudentInterest)
class StudentInterestAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'booth', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('student__email', 'booth__company__name')
    readonly_fields = ('id', 'timestamp')
