from django.core.management.base import BaseCommand
from reservations.models import TimeSlot, SportFacility
from django.utils import timezone
from datetime import timedelta, datetime, date as dt_date

class Command(BaseCommand):
    help = 'Auto add time slots for all facilities for the next 7 days'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        for facility in SportFacility.objects.all():
            for day in range(7):  # next 7 days
                slot_date = today + timedelta(days=day)
                current_time = datetime.combine(slot_date, facility.opening_time)
                end_time = datetime.combine(slot_date, facility.closing_time)
                slot_delta = timedelta(minutes=facility.slot_duration)

                while current_time + slot_delta <= end_time:
                    start = current_time.time()
                    end = (current_time + slot_delta).time()

                    slot, created = TimeSlot.objects.get_or_create(
                        facility=facility,
                        date=slot_date,
                        start_time=start,
                        end_time=end,
                        defaults={'is_available': True}
                    )

                    # Update availability based on reservation status
                    slot.is_available = not slot.reservations.exists()
                    slot.save()

                    if created:
                        self.stdout.write(
                            self.style.SUCCESS(f"Created slot {start}-{end} for {facility.name} on {slot_date}")
                        )
                    
                    current_time += slot_delta
