from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('jobs', '0002_remove_old_career_fair_tables'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='aiinterview',
            name='audio_file_url',
        ),
        migrations.RemoveField(
            model_name='aiinterview',
            name='summary',
        ),
        migrations.RemoveField(
            model_name='aiinterview',
            name='overall_score',
        ),
    ] 