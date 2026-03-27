import datetime

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from ims.models import Company, Internship, Logbook, Report, Student

User = get_user_model()

LOGBOOK_WEEKS = [
    {
        "week_number": 1,
        "activities": (
            "Completed company onboarding and orientation. Set up development environment including "
            "Python, Django, Node.js and PostgreSQL. Reviewed existing codebase and internal documentation."
        ),
        "supervisor_comment": (
            "Excellent start. Shows strong initiative and technical readiness."
        ),
    },
    {
        "week_number": 2,
        "activities": (
            "Attended daily standup meetings. Fixed 3 frontend UI bugs on the customer portal. "
            "Studied REST API architecture. Wrote first API endpoint for user profile retrieval."
        ),
        "supervisor_comment": "Good progress. Communication in team meetings is improving.",
    },
    {
        "week_number": 3,
        "activities": (
            "Implemented responsive dashboard UI improvements using React and Tailwind CSS. "
            "Wrote unit tests for 4 components. Resolved 2 cross-browser compatibility issues."
        ),
        "supervisor_comment": "Strong technical execution. Code quality is notable for an intern.",
    },
    {
        "week_number": 4,
        "activities": (
            "Debugged and resolved critical REST API integration issues between frontend and backend. "
            "Collaborated with senior backend engineer on database query optimization."
        ),
        "supervisor_comment": "Problem-solving approach is methodical and effective.",
    },
    {
        "week_number": 5,
        "activities": (
            "Designed and built a new internal reporting module from scratch. Created PDF export "
            "functionality using ReportLab. Presented progress to team lead and incorporated feedback."
        ),
        "supervisor_comment": "Impressive initiative. Presentation skills are excellent.",
    },
    {
        "week_number": 6,
        "activities": (
            "Refactored the JWT authentication flow to improve token refresh handling. Reviewed and "
            "approved 3 pull requests from peers. Wrote technical documentation for authentication module."
        ),
        "supervisor_comment": "Demonstrates solid understanding of security best practices.",
    },
    {
        "week_number": 7,
        "activities": (
            "Integrated third-party SMS notification API into the platform. Wrote comprehensive "
            "integration tests. Fixed 5 bugs identified during QA testing cycle."
        ),
        "supervisor_comment": "Handles complex third-party integrations confidently.",
    },
    {
        "week_number": 8,
        "activities": (
            "Conducted final user testing sessions with 6 participants. Compiled feedback report. "
            "Completed full project documentation and handover notes for the team."
        ),
        "supervisor_comment": (
            "Outstanding performance throughout the internship. A highly capable engineer."
        ),
    },
]


class Command(BaseCommand):
    help = "Seed Andeh Trevor student data (uses get_or_create; does not create supervisors)."

    def handle(self, *args, **options):
        supervisor = (
            User.objects.filter(username="supervisor@ims.test").first()
            or User.objects.filter(email__iexact="supervisor@ims.test").first()
        )
        if not supervisor:
            raise CommandError(
                "No existing supervisor found. Expected username 'supervisor@ims.test' "
                "or email 'supervisor@ims.test'. Run seed_users or create that user first."
            )

        user, user_created = User.objects.get_or_create(
            username="andeh.trevor",
            defaults={
                "email": "trevorandeh@gmail.com",
                "first_name": "Andeh",
                "last_name": "Trevor",
                "role": "student",
            },
        )
        if user_created:
            user.set_password("password123")
            user.save()

        student, _ = Student.objects.get_or_create(
            matricule="CT23A017",
            defaults={
                "user": user,
                "program": "B.Tech Software Engineering",
                "department": "Computer Engineering",
                "year_of_study": "Final Year",
            },
        )

        company, _ = Company.objects.get_or_create(
            name="Orange Cameroon",
            defaults={
                "address": "Akwa, Douala, Cameroon",
                "contact_email": "internships@orange.cm",
                "phone": "+237 699 000 000",
                "verified": True,
            },
        )

        internship, _ = Internship.objects.get_or_create(
            student=student,
            company=company,
            defaults={
                "supervisor": supervisor,
                "start_date": datetime.date(2026, 1, 6),
                "end_date": datetime.date(2026, 2, 28),
                "status": "ongoing",
                "title": "Software Engineering Internship",
                "description": "Full-stack development internship at Orange Cameroon.",
                "work_type": "On-site",
                "location": "Douala, Cameroon",
            },
        )

        reviewed_at = timezone.now()
        for row in LOGBOOK_WEEKS:
            Logbook.objects.get_or_create(
                internship=internship,
                week_number=row["week_number"],
                defaults={
                    "activities": row["activities"],
                    "review_status": Logbook.ReviewStatus.APPROVED,
                    "supervisor_comment": row["supervisor_comment"],
                    "reviewed_at": reviewed_at,
                },
            )

        pdf_placeholder = ContentFile(
            b"%PDF-1.4\n% minimal placeholder for seed\n",
            name="andeh_trevor_midterm.pdf",
        )

        report, _ = Report.objects.get_or_create(
            internship=internship,
            student=student,
            defaults={
                "file_upload": pdf_placeholder,
                "grade": "A",
                "reviewed_by": supervisor,
            },
        )

        self.stdout.write(self.style.SUCCESS("Andeh Trevor seeded successfully"))
        self.stdout.write(f"   Student ID: {student.id}")
        self.stdout.write(f"   Internship ID: {internship.id}")
        self.stdout.write("   Logbook entries: 8")
        self.stdout.write(f"   Report ID: {report.id}")
