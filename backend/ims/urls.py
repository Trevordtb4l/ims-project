from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'students', views.StudentViewSet, basename='student')
router.register(r'companies', views.CompanyViewSet, basename='company')
router.register(r'internships', views.InternshipViewSet, basename='internship')
router.register(r'internship-applications', views.InternshipApplicationViewSet, basename='internship-application')
router.register(r'logbooks', views.LogbookViewSet, basename='logbook')
router.register(r'evaluations', views.EvaluationViewSet, basename='evaluation')
router.register(r'reports', views.ReportViewSet, basename='report')
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    path('auth/login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain'),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]
