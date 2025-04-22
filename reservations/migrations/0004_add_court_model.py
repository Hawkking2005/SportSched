from django.db import migrations, models
import django.db.models.deletion

def create_courts_from_facilities(apps, schema_editor):
    SportFacility = apps.get_model('reservations', 'SportFacility')
    Court = apps.get_model('reservations', 'Court')
    
    for facility in SportFacility.objects.all():
        # Create a default court for each facility
        Court.objects.create(
            facility=facility,
            name=f"{facility.name} - Court 1",
            description=f"Default court for {facility.name}",
            is_available=True
        )

def migrate_timeslots_to_courts(apps, schema_editor):
    TimeSlot = apps.get_model('reservations', 'TimeSlot')
    Court = apps.get_model('reservations', 'Court')
    
    # First, ensure all facilities have courts
    SportFacility = apps.get_model('reservations', 'SportFacility')
    for facility in SportFacility.objects.all():
        if not Court.objects.filter(facility=facility).exists():
            Court.objects.create(
                facility=facility,
                name=f"{facility.name} - Court 1",
                description=f"Default court for {facility.name}",
                is_available=True
            )
    
    # Then migrate the timeslots
    for timeslot in TimeSlot.objects.all():
        # Get the first court for the facility
        court = Court.objects.filter(facility=timeslot.facility).first()
        if court:
            timeslot.court = court
            timeslot.save()

class Migration(migrations.Migration):

    dependencies = [
        ('reservations', '0003_alter_sportfacility_closing_time_and_more'),
    ]

    operations = [
        # First, create the Court model
        migrations.CreateModel(
            name='Court',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('is_available', models.BooleanField(default=True)),
                ('facility', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='courts', to='reservations.sportfacility')),
            ],
        ),
        
        # Create default courts for existing facilities
        migrations.RunPython(create_courts_from_facilities),
        
        # Add the court field to TimeSlot (nullable at first)
        migrations.AddField(
            model_name='timeslot',
            name='court',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='time_slots', to='reservations.court'),
        ),
        
        # Migrate the data
        migrations.RunPython(migrate_timeslots_to_courts),
    ] 