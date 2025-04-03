from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class SportFacility(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    facility_type = models.CharField(max_length=50)  # e.g., "Basketball Court", "Tennis Court"
    image = models.ImageField(upload_to='facilities/', null=True, blank=True)
    
    def __str__(self):
        return self.name

class TimeSlot(models.Model):
    facility = models.ForeignKey(SportFacility, on_delete=models.CASCADE, related_name='time_slots')
    start_time = models.TimeField()
    end_time = models.TimeField()
    date = models.DateField()
    is_available = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.facility.name} - {self.date} {self.start_time}-{self.end_time}"

class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='reservations')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['time_slot']  # Ensures a time slot can only be booked once
    
    def __str__(self):
        return f"{self.user.username} - {self.time_slot}"