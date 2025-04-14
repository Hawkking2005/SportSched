from django.core.management.base import BaseCommand
from reservations.models import SportFacility
from django.utils import timezone

class Command(BaseCommand):
    help = 'Clean up past time slots'

    def handle(self, *args, **options):
        facilities = SportFacility.objects.all()
        for facility in facilities:
            facility.clean_past_slots()
        self.stdout.write(self.style.SUCCESS('Successfully cleaned past time slots')) 