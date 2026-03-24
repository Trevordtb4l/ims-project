from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    Student, Company, CompanyRepresentative, Internship,
    InternshipApplication, Logbook, Evaluation, Report, Notification,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get("username", "")
        if "@" in username:
            try:
                user = User.objects.get(email__iexact=username)
                attrs["username"] = user.username
            except User.DoesNotExist:
                pass

        data = super().validate(attrs)

        user = self.user
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "username": user.username,
        }

        if user.role == User.Role.COMPANY:
            company = getattr(user, "company_profile", None)
            if company:
                data["user"]["company_name"] = company.name
                data["user"]["company_id"] = company.id

        if user.role == User.Role.STUDENT:
            student = getattr(user, "student_profile", None)
            if student:
                data["user"]["matricule"] = student.matricule
                data["user"]["program"] = student.program
                data["user"]["department"] = student.department
                data["user"]["student_id"] = student.id

        return data


class RegisterSerializer(serializers.ModelSerializer):
    matricule = serializers.CharField(write_only=True, required=False)
    program = serializers.CharField(write_only=True, required=False)
    department = serializers.CharField(write_only=True, required=False)
    company_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "username", "email", "password", "first_name", "last_name",
            "role", "matricule", "program", "department", "company_name",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, attrs):
        email = attrs.get("email")
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})

        role = attrs.get("role")
        if role == User.Role.STUDENT:
            matricule = attrs.get("matricule")
            if not matricule:
                raise serializers.ValidationError({"matricule": "Matricule is required for students."})
            if Student.objects.filter(matricule=matricule).exists():
                raise serializers.ValidationError({"matricule": "This matricule is already registered."})

        if role == User.Role.COMPANY:
            if not attrs.get("company_name"):
                raise serializers.ValidationError({"company_name": "Company name is required."})

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        matricule = validated_data.pop("matricule", None)
        program = validated_data.pop("program", "")
        department = validated_data.pop("department", "")
        company_name = validated_data.pop("company_name", None)

        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)

        if user.role == User.Role.STUDENT:
            Student.objects.create(
                user=user,
                matricule=matricule,
                program=program,
                department=department,
            )

        if user.role == User.Role.COMPANY:
            company = Company.objects.create(name=company_name, user=user)
            CompanyRepresentative.objects.create(user=user, company=company)

        return user


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "role", "phone_number", "profile_image", "bio",
        ]
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Student
# ---------------------------------------------------------------------------

class StudentSerializer(serializers.ModelSerializer):
    user_first_name = serializers.SerializerMethodField()
    user_last_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_phone = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id", "user", "matricule", "program", "department",
            "date_of_birth", "address", "year_of_study", "gpa",
            "user_first_name", "user_last_name", "user_email", "user_phone",
            "company_name", "supervisor_name",
        ]

    def get_user_first_name(self, obj):
        return obj.user.first_name

    def get_user_last_name(self, obj):
        return obj.user.last_name

    def get_user_email(self, obj):
        return obj.user.email

    def get_user_phone(self, obj):
        return obj.user.phone_number

    def get_company_name(self, obj):
        active = obj.internships.filter(status__in=["ongoing", "pending"]).first()
        if active:
            return active.company.name
        return None

    def get_supervisor_name(self, obj):
        active = obj.internships.filter(status__in=["ongoing", "pending"]).first()
        if active and active.supervisor:
            return active.supervisor.get_full_name()
        return None


# ---------------------------------------------------------------------------
# Company
# ---------------------------------------------------------------------------

class CompanySerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            "id", "name", "address", "contact", "contact_email",
            "phone", "verified", "user", "email",
        ]

    def get_email(self, obj):
        if obj.user:
            return obj.user.email
        return None


# ---------------------------------------------------------------------------
# Internship
# ---------------------------------------------------------------------------

class InternshipSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()

    class Meta:
        model = Internship
        fields = [
            "id", "student", "company", "supervisor",
            "start_date", "end_date", "status",
            "title", "description", "work_type", "location",
            "application_deadline", "contact_email", "contact_phone",
            "tags", "created_at",
            "assigned_by", "assigned_at",
            "company_confirmed", "company_confirmed_at",
            "company_confirmation_comment",
            "student_name", "company_name", "supervisor_name",
        ]

    def get_student_name(self, obj):
        if obj.student:
            return obj.student.user.get_full_name()
        return None

    def get_company_name(self, obj):
        return obj.company.name

    def get_supervisor_name(self, obj):
        if obj.supervisor:
            return obj.supervisor.get_full_name()
        return None


# ---------------------------------------------------------------------------
# Internship Application
# ---------------------------------------------------------------------------

class InternshipApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    student_matricule = serializers.SerializerMethodField()
    student_program = serializers.SerializerMethodField()
    student_profile_image = serializers.SerializerMethodField()
    internship_title = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = InternshipApplication
        fields = [
            "id", "student", "company", "internship", "message",
            "status", "applied_at",
            "student_name", "student_email", "student_matricule",
            "student_program", "student_profile_image", "internship_title", "company_name",
        ]

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_student_email(self, obj):
        return obj.student.user.email

    def get_student_matricule(self, obj):
        return obj.student.matricule

    def get_student_program(self, obj):
        return obj.student.program

    def get_student_profile_image(self, obj):
        try:
            url = getattr(obj.student, "profile_image", None)
            return url or None
        except Exception:
            return None

    def get_internship_title(self, obj):
        if obj.internship:
            return obj.internship.title
        return None

    def get_company_name(self, obj):
        return obj.company.name


# ---------------------------------------------------------------------------
# Logbook
# ---------------------------------------------------------------------------

class LogbookSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = Logbook
        fields = [
            "id", "internship", "week_number", "activities",
            "file_upload", "submitted_at",
            "review_status", "reviewed_at", "supervisor_comment",
            "student_name", "company_name",
        ]

    def get_student_name(self, obj):
        if obj.internship and obj.internship.student:
            return obj.internship.student.user.get_full_name()
        return None

    def get_company_name(self, obj):
        if obj.internship:
            return obj.internship.company.name
        return None


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------

class EvaluationSerializer(serializers.ModelSerializer):
    supervisor_name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Evaluation
        fields = [
            "id", "internship", "supervisor", "score",
            "comments", "submitted_at",
            "supervisor_name", "student_name",
        ]

    def get_supervisor_name(self, obj):
        return obj.supervisor.get_full_name()

    def get_student_name(self, obj):
        if obj.internship and obj.internship.student:
            return obj.internship.student.user.get_full_name()
        return None


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

class ReportSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            "id", "internship", "student", "file_upload",
            "grade", "reviewed_by",
            "student_name", "supervisor_name",
        ]

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_supervisor_name(self, obj):
        if obj.reviewed_by:
            return obj.reviewed_by.get_full_name()
        return None


# ---------------------------------------------------------------------------
# Notification
# ---------------------------------------------------------------------------

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "user", "message", "read", "created_at"]
