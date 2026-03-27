from io import BytesIO
from xml.sax.saxutils import escape as xml_escape

from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
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

PDF_SKILLS = [
    "Django & Python Development",
    "REST API Design & Integration",
    "React.js & Tailwind CSS",
    "PostgreSQL Database Management",
    "Git & Version Control",
    "Unit & Integration Testing",
    "Technical Documentation",
    "Agile & Team Collaboration",
]


def _pdf_p(text):
    """Escape text for ReportLab Paragraph (subset of HTML)."""
    return xml_escape(str(text or "")).replace("\n", "<br/>")


def _fmt_pdf_date(d):
    """Format date as e.g. Jan 6, 2026 (no leading zero on day)."""
    if d is None:
        return "—"
    return d.strftime("%b ") + str(d.day) + d.strftime(", %Y")


def _fmt_pdf_datetime(dt):
    if dt is None:
        return "—"
    if timezone.is_aware(dt):
        dt = timezone.localtime(dt)
    return dt.strftime("%b ") + str(dt.day) + dt.strftime(", %Y %H:%M")


def _logbook_status_label(status):
    if status == Logbook.ReviewStatus.APPROVED:
        return "Approved"
    if status == Logbook.ReviewStatus.NEEDS_REVISION:
        return "Needs revision"
    return "Pending"


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer

    def get_queryset(self):
        qs = Report.objects.select_related(
            "student__user",
            "internship__company",
            "internship__student__user",
            "internship__supervisor",
            "reviewed_by",
        )
        user = self.request.user
        if user.role == User.Role.STUDENT:
            student = getattr(user, "student_profile", None)
            if student:
                qs = qs.filter(student=student)
            else:
                qs = qs.none()
        elif user.role == User.Role.SUPERVISOR:
            qs = qs.filter(internship__supervisor=user)
        return qs

    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        """
        PDF report: resolve Report → Internship → Student, logbooks via internship.
        Student may live on report.student when internship.student is unset (nullable FK).
        """
        report = self.get_object()
        try:
            internship = Internship.objects.select_related(
                "company", "supervisor", "student__user"
            ).get(pk=report.internship_id)
        except Internship.DoesNotExist:
            return Response(
                {"detail": "Report has no linked internship."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        student = internship.student or report.student
        if student is None:
            return Response(
                {"detail": "No student linked to this report or internship."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        student = Student.objects.select_related("user").get(pk=student.pk)

        logbooks = Logbook.objects.filter(internship=internship).order_by("week_number")

        total_weeks = logbooks.count()
        approved_n = logbooks.filter(review_status=Logbook.ReviewStatus.APPROVED).count()
        pending_n = logbooks.filter(review_status=Logbook.ReviewStatus.PENDING).count()
        compliance_pct = (
            int(round((approved_n / total_weeks) * 100)) if total_weeks else 0
        )

        days_present = 35
        days_absent = 5
        total_working_days = 40

        supervisor_name = (
            internship.supervisor.get_full_name()
            if internship.supervisor
            else "—"
        )
        prepared_by = request.user.get_full_name() or request.user.username

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )
        styles = getSampleStyleSheet()
        story = []

        title_style = ParagraphStyle(
            name="DocTitle",
            parent=styles["Heading1"],
            fontSize=16,
            alignment=TA_CENTER,
            spaceAfter=12,
        )
        h2_style = ParagraphStyle(
            name="H2",
            parent=styles["Heading2"],
            fontSize=12,
            spaceBefore=12,
            spaceAfter=8,
        )
        body = ParagraphStyle(name="Body", parent=styles["Normal"], fontSize=9, leading=12)
        small = ParagraphStyle(name="Small", parent=styles["Normal"], fontSize=8, leading=10)

        story.append(Paragraph("Student Internship Report", title_style))
        story.append(
            Paragraph(
                f"<i>Prepared by</i>: {_pdf_p(prepared_by)}",
                ParagraphStyle(name="sub", parent=styles["Normal"], fontSize=9, alignment=TA_CENTER),
            )
        )
        story.append(Spacer(1, 0.4 * cm))

        report_type = (internship.title or "").strip() or "General Report"
        submitted_raw = getattr(report, "submitted_at", None) or internship.created_at
        submitted_display = _fmt_pdf_datetime(submitted_raw)

        # Student & placement info (all from internship + student.user)
        story.append(Paragraph("Student information", h2_style))
        info_rows = [
            ["Report type", report_type],
            ["Full name", student.user.get_full_name() or "—"],
            ["Matricule", student.matricule or "—"],
            ["Program", student.program or "—"],
            ["Email", student.user.email or "—"],
            ["Company", internship.company.name if internship.company else "—"],
            ["Supervisor", supervisor_name],
            ["Start date", _fmt_pdf_date(internship.start_date)],
            ["End date", _fmt_pdf_date(internship.end_date)],
            ["Submitted", submitted_display],
        ]
        t_info = Table(
            [[Paragraph(_pdf_p(a), body), Paragraph(_pdf_p(b), body)] for a, b in info_rows],
            colWidths=[4 * cm, 12 * cm],
        )
        t_info.setStyle(
            TableStyle(
                [
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )
        story.append(t_info)
        story.append(Spacer(1, 0.6 * cm))

        # Attendance
        story.append(Paragraph("Attendance / compliance", h2_style))
        att_rows = [
            ["Weeks logged", str(total_weeks)],
            ["Approved", str(approved_n)],
            ["Pending", str(pending_n)],
            ["Compliance", f"{compliance_pct}%"],
            ["Days present", str(days_present)],
            ["Days absent", str(days_absent)],
            ["Total working days", str(total_working_days)],
        ]
        t_att = Table(
            [[Paragraph(_pdf_p(a), body), Paragraph(_pdf_p(b), body)] for a, b in att_rows],
            colWidths=[5 * cm, 11 * cm],
        )
        t_att.setStyle(
            TableStyle(
                [
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
                ]
            )
        )
        story.append(t_att)
        story.append(Spacer(1, 0.6 * cm))

        # Skills
        story.append(Paragraph("Skills developed", h2_style))
        for skill in PDF_SKILLS:
            story.append(Paragraph(f"• {_pdf_p(skill)}", body))
        story.append(Spacer(1, 0.6 * cm))

        # Logbook table
        story.append(Paragraph("Weekly logbook summary", h2_style))
        table_data = [
            [
                Paragraph("<b>Week number</b>", small),
                Paragraph("<b>Activities</b>", small),
                Paragraph("<b>Review status</b>", small),
                Paragraph("<b>Supervisor comment</b>", small),
            ]
        ]
        for lb in logbooks:
            table_data.append(
                [
                    Paragraph(_pdf_p(lb.week_number), small),
                    Paragraph(_pdf_p(lb.activities), small),
                    Paragraph(_pdf_p(_logbook_status_label(lb.review_status)), small),
                    Paragraph(_pdf_p(lb.supervisor_comment or "—"), small),
                ]
            )
        t_lb = Table(
            table_data,
            colWidths=[1.2 * cm, 7 * cm, 2.5 * cm, 5 * cm],
        )
        t_lb.setStyle(
            TableStyle(
                [
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#003366")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )
        story.append(t_lb)
        story.append(Spacer(1, 0.6 * cm))

        # Final assessment: grade only (letter in black box)
        story.append(Paragraph("Final Assessment", h2_style))
        grade_letter = (report.grade or "").strip() or "—"
        grade_box_style = ParagraphStyle(
            name="GradeBoxText",
            parent=styles["Normal"],
            fontSize=32,
            alignment=TA_CENTER,
            textColor=colors.white,
            leading=36,
        )
        t_grade = Table(
            [[Paragraph(_pdf_p(grade_letter), grade_box_style)]],
            colWidths=[12 * cm],
            rowHeights=[2.2 * cm],
        )
        t_grade.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.black),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ]
            )
        )
        story.append(t_grade)

        doc.build(story)
        buffer.seek(0)
        filename = f"report-{report.id}-internship-{internship.id}.pdf"
        response = HttpResponse(buffer.read(), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response


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
