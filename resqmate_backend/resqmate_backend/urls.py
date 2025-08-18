# resqmate_backend/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken import views as authtoken_views
from emergencies.views import SOSAlertViewSet, DonationViewSet, VolunteerAssignView, DashboardView # Add DashboardView
from users.views import CustomAuthToken, MeView
from django.conf import settings
from django.conf.urls.static import static
from users.views import UserRegistrationView

# Create a router for your viewsets
router = DefaultRouter()
router.register(r'sos', SOSAlertViewSet, basename='sos')
router.register(r'donations', DonationViewSet, basename='donations')

urlpatterns = [
    # Admin
    # path('admin/', admin.site.urls),

    # Auth URLs
    path('api/auth/register/', UserRegistrationView.as_view(), name='register'),
    path('api/auth/token/login/', CustomAuthToken.as_view(), name='token_login'),
    # Alias for compatibility
    path('api/auth/login/', CustomAuthToken.as_view(), name='login'),
    # Profile (me) endpoint
    path('api/auth/me/', MeView.as_view(), name='me'),

    # API URLs for your apps
    path('api/', include(router.urls)),

    # New volunteer assignment and dashboard URLs
    path('api/assign/', VolunteerAssignView.as_view(), name='volunteer-assign'),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard-stats'), # New line
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)