from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from ims.models import Student, Company, CompanyRepresentative

User = get_user_model()

USERS = [
    {
        'email': 'student@ims.test',
        'username': 'student_test',
        'password': 'Pass1234!',
        'first_name': 'Trevor',
        'last_name': 'Andeh',
        'role': 'student',
    },
    {
        'email': 'supervisor@ims.test',
        'username': 'supervisor_test',
        'password': 'Pass1234!',
        'first_name': 'John',
        'last_name': 'Supervisor',
        'role': 'supervisor',
        'is_staff': True,
    },
    {
        'email': 'company@ims.test',
        'username': 'company_test',
        'password': 'Pass1234!',
        'first_name': 'TechNova',
        'last_name': 'Cameroon',
        'role': 'company',
    },
    {
        'email': 'coordinator@ims.test',
        'username': 'coord_test',
        'password': 'Pass1234!',
        'first_name': 'Coord',
        'last_name': 'User',
        'role': 'coordinator',
        'is_staff': True,
    },
    {
        'email': 'admin@ims.test',
        'username': 'admin_test',
        'password': 'Pass1234!',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True,
    },
]


class Command(BaseCommand):
    help = 'Seed test users (email + username); reset password if user already exists'

    def handle(self, *args, **options):
        self.stdout.write('Seeding users...\n')

        for raw in USERS:
            data = raw.copy()
            password = data.pop('password')
            email = data['email']
            username = data['username']
            role = data['role']
            is_super = data.pop('is_superuser', False)

            if User.objects.filter(email__iexact=email).exists():
                user = User.objects.get(email__iexact=email)
                user.username = username
                user.set_password(password)
                for k, v in data.items():
                    setattr(user, k, v)
                if is_super:
                    user.is_staff = True
                    user.is_superuser = True
                user.save()
                self.stdout.write(self.style.WARNING(f'  [reset] Password + username synced: {email} ({username})'))
            else:
                if is_super:
                    User.objects.create_superuser(password=password, **data)
                else:
                    User.objects.create_user(password=password, **data)
                user = User.objects.get(email__iexact=email)

                if role == 'student':
                    if not Student.objects.filter(user=user).exists():
                        mid = 'CT23A017'
                        if Student.objects.filter(matricule=mid).exists():
                            mid = 'CT23A017_ims_test'
                        Student.objects.create(
                            user=user,
                            matricule=mid,
                            department='Software Engineering',
                            program='B.Tech Software Engineering',
                            year_of_study='3',
                            gpa='3.5',
                        )
                if role == 'company':
                    company, _ = Company.objects.get_or_create(
                        name='TechNova Cameroon',
                        defaults=dict(
                            user=user,
                            contact_email=email,
                            phone='+237 699 000 111',
                            address='Molyko, Buea',
                            verified=True,
                        ),
                    )
                    if not company.user_id:
                        company.user = user
                        company.save(update_fields=['user'])
                    CompanyRepresentative.objects.get_or_create(
                        user=user,
                        defaults=dict(company=company, position='HR Manager'),
                    )

                self.stdout.write(self.style.SUCCESS(f'  [created] {email} (username: {username})'))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('All users ready!'))
        self.stdout.write('  Password for all: Pass1234!')
        self.stdout.write('  Log in with email OR username (mapped to username on backend).')
        self.stdout.write('  Emails: student@ims.test, supervisor@ims.test, company@ims.test, coordinator@ims.test, admin@ims.test')
        self.stdout.write('  Usernames: student_test, supervisor_test, company_test, coord_test, admin_test')
