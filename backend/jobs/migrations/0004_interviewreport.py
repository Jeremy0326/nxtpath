from django.db import migrations, models
import uuid

class Migration(migrations.Migration):
    dependencies = [
        ('jobs', '0003_remove_aiinterview_audio_file_url_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='InterviewReport',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)),
                ('report_data', models.JSONField(help_text='Comprehensive employer-facing interview report data.')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('version', models.CharField(max_length=20, default='1.0', help_text='Version of the report format/LLM prompt.')),
                ('interview', models.OneToOneField(on_delete=models.CASCADE, related_name='employer_report', to='jobs.aiinterview')),
                ('application', models.ForeignKey(on_delete=models.CASCADE, related_name='interview_reports', to='jobs.application')),
            ],
            options={
                'unique_together': {('interview', 'application')},
                'ordering': ['-created_at'],
            },
        ),
    ] 