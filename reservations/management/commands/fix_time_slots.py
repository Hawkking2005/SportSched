from django.core.management.base import BaseCommand
from reservations.models import TimeSlot, Court, SportFacility
from django.utils import timezone
from datetime import timedelta, time

class Command(BaseCommand):
    help = 'Fix time slot availability and regenerate slots with correct timings'

    def handle(self, *args, **kwargs):
        # First, clean up any incorrect time slots
        self.stdout.write('Cleaning up incorrect time slots...')
        TimeSlot.objects.all().delete()

        # Update all facilities to have consistent opening/closing times if needed
        self.stdout.write('Updating facility timings...')
        SportFacility.objects.all().update(
            opening_time=time(12, 0),  # 12:00 PM
            closing_time=time(20, 0),  # 8:00 PM
            slot_duration=60  # 1 hour slots
        )

        # Generate new time slots for all courts
        today = timezone.localtime().date()
        for court in Court.objects.all():
            self.stdout.write(f'Generating slots for {court.name}...')
            # Generate slots for next 7 days
            for day in range(7):
                slot_date = today + timedelta(days=day)
                court.generate_time_slots(for_date=slot_date)

        self.stdout.write(self.style.SUCCESS('Successfully fixed time slots')) 