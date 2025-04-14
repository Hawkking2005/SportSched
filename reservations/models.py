from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta, time, date

class SportFacility(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    facility_type = models.CharField(max_length=50)
    image = models.ImageField(upload_to='facilities/', null=True, blank=True)
    opening_time = models.TimeField(default=time(12, 0))  # 12:00 PM
    closing_time = models.TimeField(default=time(20, 0))  # 8:00 PM
    slot_duration = models.PositiveIntegerField(default=60)  # in minutes

    def __str__(self):
        return self.name

class Court(models.Model):
    facility = models.ForeignKey(SportFacility, on_delete=models.CASCADE, related_name='courts')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.facility.name} - {self.name}"

    def generate_time_slots(self, for_date=None):
        """
        Generate time slots from 12 PM to 8 PM for the given date.
        If not provided, defaults to today.
        """
        if for_date is None:
            for_date = timezone.localtime().date()

        # Avoid generating for past dates
        current_time = timezone.localtime()
        if for_date < current_time.date():
            return []

        # Set fixed opening (12 PM) and closing (8 PM) times
        start_time = time(12, 0)  # 12:00 PM
        end_time_limit = time(20, 0)  # 8:00 PM

        # If it's today, adjust start time if current time is past noon
        if for_date == current_time.date():
            if current_time.time() >= end_time_limit:
                return []  # Past closing time, don't create any slots
            if current_time.time() > start_time:
                # Round up to the next slot boundary
                minutes_past_hour = current_time.minute
                if minutes_past_hour > 0:
                    minutes_to_next_slot = self.facility.slot_duration - (minutes_past_hour % self.facility.slot_duration)
                    start_time_dt = current_time + timedelta(minutes=minutes_to_next_slot)
                    start_time = start_time_dt.time()
                else:
                    start_time = current_time.time()

        slots = []
        current_time_dt = datetime.combine(for_date, start_time)

        while current_time_dt.time() < end_time_limit:
            slot_end_time = (current_time_dt + timedelta(minutes=self.facility.slot_duration)).time()
            
            if slot_end_time > end_time_limit:
                break

            slot, created = TimeSlot.objects.get_or_create(
                court=self,
                date=for_date,
                start_time=current_time_dt.time(),
                end_time=slot_end_time,
                defaults={'is_available': True}
            )

            # Update availability based on current time
            if created:
                slot_datetime = timezone.make_aware(datetime.combine(for_date, slot.start_time))
                if slot_datetime < timezone.localtime():
                    slot.is_available = False
                    slot.save()

            slots.append(slot)
            current_time_dt += timedelta(minutes=self.facility.slot_duration)

        return slots

    def clean_past_slots(self):
        """Remove time slots that are in the past"""
        current_time = timezone.localtime()
        TimeSlot.objects.filter(
            court=self,
            date__lt=current_time.date()
        ).delete()
        
        # Clean today's past slots
        TimeSlot.objects.filter(
            court=self,
            date=current_time.date(),
            end_time__lt=current_time.time()
        ).delete()

class TimeSlot(models.Model):
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name='time_slots')
    start_time = models.TimeField()
    end_time = models.TimeField()
    date = models.DateField()
    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ['date', 'start_time']
        unique_together = ['court', 'date', 'start_time']

    def __str__(self):
        return f"{self.court.name} - {self.date} {self.start_time}-{self.end_time}"

    @property
    def is_past(self):
        """Check if this time slot is in the past"""
        slot_datetime = timezone.make_aware(
            datetime.combine(self.date, self.start_time)
        )
        return slot_datetime < timezone.localtime()

    def update_availability(self):
        """Update availability based on reservation status and time"""
        current_time = timezone.localtime()
        slot_datetime = timezone.make_aware(datetime.combine(self.date, self.start_time))
        
        # If the slot is in the past, it's not available
        if slot_datetime < current_time:
            self.is_available = False
        else:
            # Otherwise, check for active reservations
            self.is_available = not self.reservations.filter(is_cancelled=False).exists()
        
        self.save()

class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='reservations')
    created_at = models.DateTimeField(auto_now_add=True)
    is_cancelled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.time_slot}"
