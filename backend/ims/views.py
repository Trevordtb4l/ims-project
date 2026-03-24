from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Student, Company, Internship, InternshipApplication,
    Logbook, Evaluation, Report, Notification,
)
from .serializers import (
    CustomTokenObtainPairSerializer, RegisterSerializer,
    StudentSerializer, CompanySerializer, InternshipSerializer,
    InternshipApplicationSerializer, LogbookSerializer,
    EvaluationSerializer, ReportSerializer, NotificationSerializer,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        }

        if user.role == User.Role.STUDENT:
            student = getattr(user, "student_profile", None)
            if student:
                user_data["matricule"] = student.matricule
                user_data["program"] = student.program
                user_data["department"] = student.department
                user_data["student_id"] = student.id

        if user.role == User.Role.COMPANY:
            company = getattr(user, "company_profile", None)
            if company:
                user_data["company_name"] = company.name
                user_data["company_id"] = company.id

        return Response(
            {
                "user": user_data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )


# ---------------------------------------------------------------------------
# Students
# ---------------------------------------------------------------------------

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.STUDENT:
            return Student.objects.filter(user=user)
        if user.role == User.Role.SUPERVISOR:
            return Student.objects.filter(
                internships__supervisor=user
            ).distinct()
        return Student.objects.all()

    def perform_update(self, serializer):
        instance = serializer.save()
        data = self.request.data
        user = instance.user
        changed = False
        for field in ("first_name", "last_name", "phone_number"):
            if field in data:
                setattr(user, field, data[field])
                changed = True
        if changed:
            user.save()


# ---------------------------------------------------------------------------
# Companies
# ---------------------------------------------------------------------------

class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.COMPANY:
            return Company.objects.filter(user=user)
        return Company.objects.all()

    def perform_update(self, serializer):
        serializer.save()


# ---------------------------------------------------------------------------
# Internships
# ---------------------------------------------------------------------------

class InternshipViewSet(viewsets.ModelViewSet):
    serializer_class = InternshipSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Internship.objects.select_related("student__user", "company", "supervisor")

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        company_param = self.request.query_params.get("company")
        if company_param == "me" and user.role == User.Role.COMPANY:
            company = getattr(user, "company_profile", None)
            if company:
                qs = qs.filter(company=company)
        elif company_param and company_param != "me":
            qs = qs.filter(company_id=company_param)

        student_param = self.request.query_params.get("student")
        if student_param == "me" and user.role == User.Role.STUDENT:
            student = getattr(user, "student_profile", None)
            if student:
                qs = qs.filter(student=student)
        elif student_param and student_param != "me":
            qs = qs.filter(student_id=student_param)

        if user.role == User.Role.SUPERVISOR:
            qs = qs.filter(supervisor=user)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        kwargs = {}
        if user.role == User.Role.COMPANY:
            company = getattr(user, "company_profile", None)
            if company:
                kwargs["company"] = company
        serializer.save(**kwargs)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()


# ---------------------------------------------------------------------------
# Internship Applications
# ---------------------------------------------------------------------------

class InternshipApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = InternshipApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        qs = InternshipApplication.objects.select_related(
            "student__user", "company", "internship"
        )

        if user.role == User.Role.STUDENT:
            return qs.filter(student__user=user)

        if user.role == User.Role.COMPANY:
            company = getattr(user, "company_profile", None)
            if company:
                return qs.filter(company=company)

        company_param = self.request.query_params.get("company")
        if company_param == "me" and user.role == User.Role.COMPANY:
            company = getattr(user, "company_profile", None)
            if company:
                return qs.filter(company=company)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        student = getattr(user, "student_profile", None)
        kwargs = {"student": student}

        internship_id = self.request.data.get("internship")
        if internship_id:
            try:
                internship = Internship.objects.get(pk=internship_id)
                kwargs["company"] = internship.company
            except Internship.DoesNotExist:
                pass

        serializer.save(**kwargs)


# ---------------------------------------------------------------------------
# Logbooks
# ---------------------------------------------------------------------------

class LogbookViewSet(viewsets.ModelViewSet):
    serializer_class = LogbookSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        qs = Logbook.objects.select_related(
            "internship__student__user", "internship__company"
        )

        if user.role == User.Role.STUDENT:
            qs = qs.filter(internship__student__user=user)

        if user.role == User.Role.SUPERVISOR:
            qs = qs.filter(internship__supervisor=user)

        review_status = self.request.query_params.get("review_status")
        if review_status:
            qs = qs.filter(review_status=review_status)

        student_param = self.request.query_params.get("student")
        if student_param:
            qs = qs.filter(internship__student_id=student_param)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        student = getattr(user, "student_profile", None)
        if student:
            active_internship = student.internships.filter(
                status__in=["ongoing", "pending"]
            ).first()
            if active_internship:
                serializer.save(internship=active_internship)
                return
        serializer.save()

    def perform_update(self, serializer):
        review_status = self.request.data.get("review_status")
        kwargs = {}
        if review_status in ("approved", "needs_revision"):
            kwargs["reviewed_at"] = timezone.now()
        serializer.save(**kwargs)


# ---------------------------------------------------------------------------
# Evaluations
# ---------------------------------------------------------------------------

class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Evaluation.objects.select_related(
            "internship__student__user", "supervisor"
        )

        if user.role == User.Role.SUPERVISOR:
            qs = qs.filter(supervisor=user)

        student_param = self.request.query_params.get("student")
        if student_param:
            qs = qs.filter(internship__student_id=student_param)

        return qs

    def perform_create(self, serializer):
        serializer.save(supervisor=self.request.user)


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------

class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer

    def get_queryset(self):
        return Report.objects.select_related(
            "student__user", "internship__company", "reviewed_by"
        ).all()


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=["patch"], url_path="mark_all_read")
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(read=False).update(read=True)
        return Response({"status": "ok", "updated": updated})
