# reservations/management/commands/setup_test_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from datetime import datetime, timedelta
from reservations.models import SportFacility, TimeSlot
import random

class Command(BaseCommand):
    help = 'Sets up initial test data for the sports reservation system'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating test data...')
        
        # Create admin user if it doesn't exist
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'adminpassword')
            self.stdout.write(self.style.SUCCESS('Admin user created'))
        
        # Create facilities
        facilities = [
            {
                'name': 'Basketball Court',
                'description': 'Indoor basketball court with 6 hoops, suitable for team practice or casual games.',
                'facility_type': 'Basketball',
            },
            {
                'name': 'Tennis Court',
                'description': 'Outdoor tennis court with professional-grade surface, available for singles or doubles matches.',
                'facility_type': 'Tennis',
            },
            {
                'name': 'Swimming Pool',
                'description': 'Olympic-sized swimming pool with 8 lanes, heated and available for team practice or recreational swimming.',
                'facility_type': 'Swimming',
            },
            {
                'name': 'Football Field',
                'description': 'Regulation-size football field with natural grass, perfect for team practice or matches.',
                'facility_type': 'Football',
            }
        ]
        
        for facility_data in facilities:
            facility, created = SportFacility.objects.get_or_create(
                name=facility_data['name'],
                defaults=facility_data
            )
            if created:
                self.stdout.write(f'Created facility: {facility.name}')
            
            # Create time slots for the next 7 days
            today = datetime.now().date()
            for day_offset in range(7):
                slot_date = today + timedelta(days=day_offset)
                
                # Create 8 slots per day (9 AM to 5 PM, each 1 hour)
                for hour in range(9, 17):
                    start_time = f"{hour}:00:00"
                    end_time = f"{hour+1}:00:00"
                    
                    time_slot, created = TimeSlot.objects.get_or_create(
                        facility=facility,
                        date=slot_date,
                        start_time=start_time,
                        end_time=end_time,
                        defaults={'is_available': random.choice([True, True, True, False])}  # 75% chance to be available
                    )
                    
                    if created:
                        status = 'available' if time_slot.is_available else 'booked'
                        self.stdout.write(f'Created time slot for {facility.name} on {slot_date} at {start_time} ({status})')
        
        self.stdout.write(self.style.SUCCESS('Test data setup complete!'))