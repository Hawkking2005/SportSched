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

    def update_availability(self):
        """Update court availability based on its time slots"""
        # Get today's date
        today = timezone.localtime().date()
        # Check if there are any available time slots for today or future dates
        has_available_slots = self.time_slots.filter(
            date__gte=today,
            is_available=True
        ).exists()
        
        if self.is_available != has_available_slots:
            self.is_available = has_available_slots
            self.save()

    def generate_time_slots(self, for_date=None):
        """
        Generate time slots based on facility's opening and closing times.
        If date not provided, defaults to today.
        """
        if for_date is None:
            for_date = timezone.localtime().date()

        # Get current time in the correct timezone
        now = timezone.localtime()

        # Don't generate slots for past dates
        if for_date < now.date():
            return []

        # Get facility times
        start_time = self.facility.opening_time
        end_time_limit = self.facility.closing_time
        slot_duration = self.facility.slot_duration

        # If it's today and we're past the opening time,
        # adjust start time to the next available slot
        if for_date == now.date() and now.time() > start_time:
            # Calculate minutes since midnight for current time
            current_minutes = now.hour * 60 + now.minute
            # Round up to next slot boundary
            next_slot_minutes = ((current_minutes + slot_duration - 1) // slot_duration) * slot_duration
            # If we're past all slots, return empty list
            if next_slot_minutes >= end_time_limit.hour * 60 + end_time_limit.minute:
                return []
            # Convert minutes to time
            start_time = time(next_slot_minutes // 60, next_slot_minutes % 60)

        slots = []
        current_time_dt = timezone.make_aware(datetime.combine(for_date, start_time))
        end_time_dt = timezone.make_aware(datetime.combine(for_date, end_time_limit))

        while current_time_dt < end_time_dt:
            # Calculate end time for this slot
            slot_end_dt = current_time_dt + timedelta(minutes=slot_duration)
            slot_end_time = slot_end_dt.time()

            # If this slot would end after closing time, break
            if slot_end_time > end_time_limit:
                break

            # Get or create the time slot
            slot, created = TimeSlot.objects.get_or_create(
                court=self,
                date=for_date,
                start_time=current_time_dt.time(),
                end_time=slot_end_time,
                defaults={'is_available': True}
            )

            # Only update availability if the slot was just created
            if created:
                # A slot should be unavailable only if it has reservations
                has_reservations = slot.reservations.filter(is_cancelled=False).exists()
                # For today's slots, also check if they're in the past
                is_past = for_date == now.date() and current_time_dt <= now
                
                if has_reservations or is_past:
                    slot.is_available = False
                    slot.save(update_court=False)

            slots.append(slot)
            current_time_dt = slot_end_dt

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

    def save(self, *args, update_court=True, **kwargs):
        # Prevent infinite recursion by adding a flag
        super().save(*args, **kwargs)
        if update_court:
            self.court.update_availability()

    @property
    def is_past(self):
        """Check if this time slot is in the past"""
        now = timezone.localtime()
        slot_datetime = timezone.make_aware(
            datetime.combine(self.date, self.start_time)
        )
        # Consider a slot as past only if it's start time is more than the slot duration ago
        slot_duration = timedelta(minutes=self.court.facility.slot_duration)
        return slot_datetime + slot_duration < now

    def update_availability(self):
        """Update availability based on reservation status and time"""
        now = timezone.localtime()
        slot_datetime = timezone.make_aware(datetime.combine(self.date, self.start_time))
        slot_end_datetime = timezone.make_aware(datetime.combine(self.date, self.end_time))
        
        # A slot is considered unavailable if:
        # 1. It's completely in the past (including its duration)
        # 2. It has active reservations
        if slot_end_datetime < now:
            self.is_available = False
        else:
            self.is_available = not self.reservations.filter(is_cancelled=False).exists()
        
        # Use save with update_court=False to prevent recursive updates
        self.save(update_court=False)

class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='reservations')
    created_at = models.DateTimeField(auto_now_add=True)
    is_cancelled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.time_slot}"
