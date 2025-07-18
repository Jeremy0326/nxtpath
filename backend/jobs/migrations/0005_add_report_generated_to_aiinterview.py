from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('jobs', '0004_interviewreport'),
    ]

    operations = [
        migrations.AddField(
            model_name='aiinterview',
            name='report_generated',
            field=models.BooleanField(default=False, help_text='True if the employer-facing interview report has been generated.'),
        ),
    ] 