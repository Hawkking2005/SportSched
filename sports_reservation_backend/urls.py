# sports_reservation_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from reservations.views import SportFacilityViewSet, CourtViewSet, TimeSlotViewSet, ReservationViewSet

router = DefaultRouter()
router.register(r'facilities', SportFacilityViewSet)
router.register(r'courts', CourtViewSet)
router.register(r'timeslots', TimeSlotViewSet)
router.register(r'reservations', ReservationViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)