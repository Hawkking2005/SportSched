from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta, time, date

class SportFacility(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    facility_type = models.CharField(max_length=50)
    image = models.ImageField(upload_to='facilities/', null=True, blank=True)
    opening_time = models.TimeField(default=time(8, 0))  # 8:00 AM
    closing_time = models.TimeField(default=time(22, 0)) # 10:00 PM
    slot_duration = models.PositiveIntegerField(default=60)  # in minutes

    def __str__(self):
        return self.name

    def generate_time_slots(self, for_date=None):
        """
        Generate time slots for the given date. If not provided, defaults to today.
        Avoids creating duplicates and updates availability.
        """
        if for_date is None:
            for_date = date.today()

        # Avoid generating for past dates
        if for_date < date.today():
            return []

        now = timezone.now()
        start_time = self.opening_time

        if for_date == now.date():
            # Round up current time to the next slot boundary
            start_time = now.time()
            minutes = (self.slot_duration - (now.minute % self.slot_duration)) % self.slot_duration
            start_time_dt = datetime.combine(for_date, start_time) + timedelta(minutes=minutes)
            start_time = max(start_time_dt.time(), self.opening_time)

        slots = []
        current_time = start_time

        while (datetime.combine(for_date, current_time) + 
               timedelta(minutes=self.slot_duration)).time() <= self.closing_time:

            end_time = (datetime.combine(for_date, current_time) +
                        timedelta(minutes=self.slot_duration)).time()

            slot, created = TimeSlot.objects.get_or_create(
                facility=self,
                date=for_date,
                start_time=current_time,
                end_time=end_time,
                defaults={'is_available': True}
            )

            # Update availability based on current reservations
            slot.is_available = not slot.reservations.filter(is_cancelled=False).exists()
            slot.save()

            slots.append(slot)
            current_time = end_time

        return slots

class TimeSlot(models.Model):
    facility = models.ForeignKey(SportFacility, on_delete=models.CASCADE, related_name='time_slots')
    start_time = models.TimeField()
    end_time = models.TimeField()
    date = models.DateField()
    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ['facility', 'date', 'start_time']

    def __str__(self):
        return f"{self.facility.name} - {self.date} {self.start_time}-{self.end_time}"

    @property
    def is_past(self):
        """Check if this time slot is in the past"""
        slot_datetime = timezone.make_aware(
            datetime.combine(self.date, self.start_time)
        )
        return slot_datetime < timezone.now()

    def update_availability(self):
        """Update availability based on reservation status"""
        self.is_available = not self.reservations.filter(is_cancelled=False).exists()
        self.save()

class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='reservations')
    created_at = models.DateTimeField(auto_now_add=True)
    is_cancelled = models.BooleanField(default=False)

    class Meta:
        unique_together = ['time_slot']  # One reservation per slot

    def __str__(self):
        status = "CANCELLED" if self.is_cancelled else "ACTIVE"
        return f"{self.user.username} - {self.time_slot} ({status})"

    def cancel(self):
        """Cancel this reservation and update the slot availability"""
        if not self.is_cancelled:
            self.is_cancelled = True
            self.save()
            self.time_slot.update_availability()
