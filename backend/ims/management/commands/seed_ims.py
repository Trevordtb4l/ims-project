from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from ims.models import Student, Company, CompanyRepresentative, Internship, Logbook, Notification

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with test data for all 5 roles'

    def handle(self, *args, **options):
        password = 'Pass1234!'

        # Admin
        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults=dict(email='admin@ims.com', first_name='System', last_name='Admin', role='admin', is_staff=True, is_superuser=True)
        )
        admin.set_password(password)
        admin.save()

        # Coordinator
        coord, _ = User.objects.get_or_create(
            username='coordinator',
            defaults=dict(email='coordinator@ims.com', first_name='Jane', last_name='Coordinator', role='coordinator', is_staff=True)
        )
        coord.set_password(password)
        coord.save()

        # Supervisor
        sup, _ = User.objects.get_or_create(
            username='supervisor',
            defaults=dict(email='supervisor@ims.com', first_name='Dr', last_name='Kolle', role='supervisor', is_staff=True, phone_number='+237 677 000 111')
        )
        sup.set_password(password)
        sup.save()

        # Company user + Company + Representative
        comp_user, _ = User.objects.get_or_create(
            username='company',
            defaults=dict(email='company@techcorp.com', first_name='Tech', last_name='Corp', role='company')
        )
        comp_user.set_password(password)
        comp_user.save()

        company, _ = Company.objects.get_or_create(
            name='TechCorp',
            defaults=dict(address='Douala, Cameroon', contact='+237 699 000 000', contact_email='hr@techcorp.com', phone='+237 699 000 000', verified=True, user=comp_user)
        )
        CompanyRepresentative.objects.get_or_create(user=comp_user, defaults=dict(company=company, position='HR Manager'))

        # Second company
        comp_user2, _ = User.objects.get_or_create(
            username='company2',
            defaults=dict(email='company2@dataflow.com', first_name='Data', last_name='Flow', role='company')
        )
        comp_user2.set_password(password)
        comp_user2.save()
        company2, _ = Company.objects.get_or_create(
            name='DataFlow Inc',
            defaults=dict(address='Buea, Cameroon', contact='+237 677 111 222', contact_email='jobs@dataflow.com', phone='+237 677 111 222', verified=True, user=comp_user2)
        )
        CompanyRepresentative.objects.get_or_create(user=comp_user2, defaults=dict(company=company2, position='CTO'))

        # Student user + Student profile
        stu_user, _ = User.objects.get_or_create(
            username='student',
            defaults=dict(email='student@ub.edu', first_name='Andeh', last_name='Trevor', role='student', phone_number='+237 680 123 456')
        )
        stu_user.set_password(password)
        stu_user.save()

        student, _ = Student.objects.get_or_create(
            user=stu_user,
            defaults=dict(matricule='CT23A017', program='B.Tech Software Engineering', department='Computer Engineering', year_of_study='3', gpa='3.5')
        )

        # Second student
        stu_user2, _ = User.objects.get_or_create(
            username='student2',
            defaults=dict(email='student2@ub.edu', first_name='Alice', last_name='Johnson', role='student')
        )
        stu_user2.set_password(password)
        stu_user2.save()
        student2, _ = Student.objects.get_or_create(
            user=stu_user2,
            defaults=dict(matricule='CT23A018', program='B.Tech Software Engineering', department='Computer Engineering', year_of_study='3', gpa='3.8')
        )

        # Create internships
        from datetime import date
        internship, _ = Internship.objects.get_or_create(
            student=student, company=company,
            defaults=dict(
                supervisor=sup, title='Frontend Developer Intern',
                start_date=date(2026, 1, 15), end_date=date(2026, 4, 15),
                status='ongoing', work_type='onsite', location='Douala, Cameroon',
                description='Working on React frontend for enterprise applications.',
                tags=['React', 'TypeScript', 'Tailwind'],
            )
        )

        internship2, _ = Internship.objects.get_or_create(
            student=student2, company=company2,
            defaults=dict(
                supervisor=sup, title='Backend Developer Intern',
                start_date=date(2026, 2, 1), end_date=date(2026, 5, 1),
                status='ongoing', work_type='hybrid', location='Buea, Cameroon',
                description='Building REST APIs with Django.',
                tags=['Python', 'Django', 'PostgreSQL'],
            )
        )

        # Open internship postings (no student assigned)
        Internship.objects.get_or_create(
            title='UI/UX Design Intern', company=company,
            defaults=dict(
                start_date=date(2026, 4, 1), end_date=date(2026, 7, 1),
                status='open', work_type='remote', location='Remote',
                description='Design user interfaces for mobile and web applications.',
                tags=['Figma', 'UI/UX', 'Prototyping'],
                application_deadline=date(2026, 3, 20),
                contact_email='hr@techcorp.com', contact_phone='+237 699 000 000',
            )
        )
        Internship.objects.get_or_create(
            title='Data Analyst Intern', company=company2,
            defaults=dict(
                start_date=date(2026, 5, 1), end_date=date(2026, 8, 1),
                status='open', work_type='onsite', location='Buea, Cameroon',
                description='Analyze business data and create dashboards.',
                tags=['Python', 'SQL', 'Power BI'],
                application_deadline=date(2026, 4, 15),
                contact_email='jobs@dataflow.com', contact_phone='+237 677 111 222',
            )
        )

        # Logbooks
        for week in range(1, 4):
            Logbook.objects.get_or_create(
                internship=internship, week_number=week,
                defaults=dict(
                    activities=f'Week {week}: Completed assigned tasks, attended team meetings, worked on project components.',
                    review_status='approved' if week < 3 else 'pending',
                    supervisor_comment='Good progress.' if week < 3 else '',
                )
            )

        # Notifications
        Notification.objects.get_or_create(
            user=stu_user, message='Your week 3 logbook is due tomorrow.',
            defaults=dict(read=False)
        )
        Notification.objects.get_or_create(
            user=stu_user, message='Your logbook for week 2 has been approved.',
            defaults=dict(read=True)
        )
        Notification.objects.get_or_create(
            user=sup, message='New logbook submission from Andeh Trevor.',
            defaults=dict(read=False)
        )

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
        self.stdout.write(f'All users have password: {password}')
        self.stdout.write('Users: admin, coordinator, supervisor, company, company2, student, student2')
