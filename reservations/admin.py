# reservations/admin.py
from django.contrib import admin
from .models import SportFacility, Court, TimeSlot, Reservation

@admin.register(SportFacility)
class SportFacilityAdmin(admin.ModelAdmin):
    list_display = ('name', 'facility_type')
    search_fields = ('name', 'facility_type')

@admin.register(Court)
class CourtAdmin(admin.ModelAdmin):
    list_display = ('name', 'facility', 'is_available')
    list_filter = ('facility', 'is_available')
    search_fields = ('name', 'facility__name')

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('court', 'date', 'start_time', 'end_time', 'is_available')
    list_filter = ('court', 'date', 'is_available')
    search_fields = ('court__name', 'court__facility__name')

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('user', 'time_slot', 'created_at', 'is_cancelled')
    list_filter = ('is_cancelled', 'time_slot__court__facility')
    search_fields = ('user__username', 'time_slot__court__name')