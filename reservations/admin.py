# reservations/admin.py
from django.contrib import admin
from .models import SportFacility, TimeSlot, Reservation

@admin.register(SportFacility)
class SportFacilityAdmin(admin.ModelAdmin):
    list_display = ('name', 'facility_type')
    search_fields = ('name', 'facility_type')

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('facility', 'date', 'start_time', 'end_time', 'is_available')
    list_filter = ('facility', 'date', 'is_available')
    search_fields = ('facility__name',)

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('user', 'time_slot', 'created_at')
    list_filter = ('time_slot__facility', 'time_slot__date')
    search_fields = ('user__username', 'time_slot__facility__name')