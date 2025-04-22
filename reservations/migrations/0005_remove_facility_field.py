from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('reservations', '0004_add_court_model'),
    ]

    operations = [
        # Remove the facility field
        migrations.RemoveField(
            model_name='timeslot',
            name='facility',
        ),
        
        # Make the court field non-nullable
        migrations.AlterField(
            model_name='timeslot',
            name='court',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='time_slots', to='reservations.court'),
        ),
    ] 