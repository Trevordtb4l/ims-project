from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import (
    User, Company, Student, CompanyRepresentative,
    Internship, InternshipApplication, Logbook,
    Evaluation, Report, Notification, CompanyCoordinatorMessage,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Extra', {'fields': ('role', 'phone_number', 'profile_image', 'bio')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Extra', {'fields': ('role', 'phone_number', 'profile_image', 'bio')}),
    )
    list_display = ('username', 'email', 'role', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact', 'verified')
    list_filter = ('verified',)
    search_fields = ('name',)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'matricule', 'program', 'department')
    search_fields = ('user__first_name', 'user__last_name', 'matricule')


@admin.register(CompanyRepresentative)
class CompanyRepresentativeAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'position')


@admin.register(Internship)
class InternshipAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'student', 'status', 'start_date', 'end_date')
    list_filter = ('status',)
    search_fields = ('title', 'company__name')


@admin.register(InternshipApplication)
class InternshipApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'company', 'status', 'applied_at')
    list_filter = ('status',)


@admin.register(Logbook)
class LogbookAdmin(admin.ModelAdmin):
    list_display = ('internship', 'week_number', 'review_status', 'submitted_at')
    list_filter = ('review_status',)


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('internship', 'supervisor', 'score', 'submitted_at')


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('internship', 'student', 'grade')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'short_message', 'read', 'created_at')
    list_filter = ('read',)

    @admin.display(description='Message')
    def short_message(self, obj):
        return obj.message[:50] + ('...' if len(obj.message) > 50 else '')


@admin.register(CompanyCoordinatorMessage)
class CompanyCoordinatorMessageAdmin(admin.ModelAdmin):
    list_display = ('company', 'coordinator', 'sender', 'read', 'created_at')
    list_filter = ('read',)
