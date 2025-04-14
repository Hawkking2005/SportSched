from django.core.management.base import BaseCommand
from reservations.models import TimeSlot, Reservation
from django.utils import timezone

class Command(BaseCommand):
    help = 'Clear all time slots and their associated reservations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Clear all time slots including future ones',
        )
        parser.add_argument(
            '--past-only',
            action='store_true',
            help='Clear only past time slots',
        )

    def handle(self, *args, **options):
        try:
            if options['past_only']:
                # Delete only past time slots
                today = timezone.now().date()
                slots_to_delete = TimeSlot.objects.filter(date__lt=today)
                count = slots_to_delete.count()
                slots_to_delete.delete()
                self.stdout.write(self.style.SUCCESS(f'Successfully deleted {count} past time slots'))
            else:
                # Delete all time slots
                count = TimeSlot.objects.count()
                TimeSlot.objects.all().delete()
                self.stdout.write(self.style.SUCCESS(f'Successfully deleted all {count} time slots'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error deleting time slots: {str(e)}')) 