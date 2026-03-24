from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'student', 'Student'
        SUPERVISOR = 'supervisor', 'Supervisor'
        COORDINATOR = 'coordinator', 'Coordinator'
        COMPANY = 'company', 'Company'
        ADMIN = 'admin', 'Admin'

    role = models.CharField(max_length=20, choices=Role.choices)
    phone_number = models.CharField(max_length=20, blank=True)
    profile_image = models.URLField(blank=True)
    bio = models.TextField(blank=True)


class Company(models.Model):
    name = models.CharField(max_length=200, unique=True)
    address = models.TextField(blank=True)
    contact = models.CharField(max_length=150, blank=True)
    contact_email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    verified = models.BooleanField(default=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='company_profile',
        null=True,
        blank=True,
        limit_choices_to={'role': 'company'},
    )

    def __str__(self):
        return self.name


class Student(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='student_profile'
    )
    matricule = models.CharField(max_length=30, unique=True)
    program = models.CharField(max_length=120)
    department = models.CharField(max_length=120)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    year_of_study = models.CharField(max_length=20, blank=True)
    gpa = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return f'{self.user.get_full_name()} ({self.matricule})'


class CompanyRepresentative(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'company'},
        related_name='company_representative_profile',
    )
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name='representatives'
    )
    position = models.CharField(max_length=120, blank=True)

    def __str__(self):
        return f'{self.user.get_full_name()} @ {self.company.name}'


class Internship(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        OPEN = 'open', 'Open'
        PENDING = 'pending', 'Pending'
        ONGOING = 'ongoing', 'Ongoing'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='internships',
        null=True,
        blank=True,
    )
    company = models.ForeignKey(
        Company, on_delete=models.PROTECT, related_name='internships'
    )
    supervisor = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='supervised_internships',
        limit_choices_to={'role': 'supervisor'},
        null=True,
        blank=True,
    )
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=15, choices=Status.choices, default=Status.DRAFT
    )

    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    work_type = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=200, blank=True)
    application_deadline = models.DateField(null=True, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'coordinator'},
        related_name='coordinated_internships',
    )
    assigned_at = models.DateTimeField(null=True, blank=True)

    company_confirmed = models.BooleanField(default=False)
    company_confirmed_at = models.DateTimeField(null=True, blank=True)
    company_confirmation_comment = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f'{self.title or "Internship"} @ {self.company.name}'


class InternshipApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SHORTLISTED = 'shortlisted', 'Shortlisted'
        INTERVIEW = 'interview', 'Interview'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        WITHDRAWN = 'withdrawn', 'Withdrawn'

    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='internship_applications'
    )
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name='internship_applications'
    )
    internship = models.ForeignKey(
        Internship,
        on_delete=models.CASCADE,
        related_name='applications',
        null=True,
        blank=True,
    )
    message = models.TextField(blank=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.PENDING
    )
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-applied_at']
        unique_together = [('student', 'company')]

    def __str__(self):
        return f'{self.student} → {self.company.name}'


class Logbook(models.Model):
    class ReviewStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        NEEDS_REVISION = 'needs_revision', 'Needs Revision'

    internship = models.ForeignKey(
        Internship, on_delete=models.CASCADE, related_name='logbooks'
    )
    week_number = models.PositiveIntegerField()
    activities = models.TextField()
    file_upload = models.FileField(upload_to='logbooks/', null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    review_status = models.CharField(
        max_length=20,
        choices=ReviewStatus.choices,
        default=ReviewStatus.PENDING,
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    supervisor_comment = models.TextField(blank=True)

    class Meta:
        ordering = ['-submitted_at']
        unique_together = [('internship', 'week_number')]

    def __str__(self):
        return f'Week {self.week_number} – {self.internship}'


class Evaluation(models.Model):
    internship = models.ForeignKey(
        Internship, on_delete=models.CASCADE, related_name='evaluations'
    )
    supervisor = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        limit_choices_to={'role': 'supervisor'},
        related_name='evaluations_submitted',
    )
    score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    comments = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']
        unique_together = [('internship', 'supervisor')]


class Report(models.Model):
    internship = models.ForeignKey(
        Internship, on_delete=models.CASCADE, related_name='reports'
    )
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='reports'
    )
    file_upload = models.FileField(upload_to='reports/')
    grade = models.CharField(max_length=10, blank=True)
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_reports',
    )

    class Meta:
        ordering = ['-id']


class Notification(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='notifications'
    )
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class CompanyCoordinatorMessage(models.Model):
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name='coordinator_messages'
    )
    coordinator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'coordinator'},
        related_name='company_messages',
    )
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sent_company_messages'
    )
    message = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
