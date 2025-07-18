from django.db import migrations, models
import uuid

class Migration(migrations.Migration):
    dependencies = [
        ('jobs', '0006_remove_aianalysisreport_application_and_more'),
    ]

    operations = [
        # Rename InterviewReport table to jobs_aiinterviewreport
        migrations.AlterModelTable(
            name='interviewreport',
            table='jobs_aiinterviewreport',
        ),
        # Remove application and version fields, add report_version, model_name, overall_score
        migrations.RemoveField(
            model_name='interviewreport',
            name='application',
        ),
        migrations.RemoveField(
            model_name='interviewreport',
            name='version',
        ),
        migrations.AddField(
            model_name='interviewreport',
            name='report_version',
            field=models.CharField(max_length=50, default='1.0', help_text='Version of the report format/LLM prompt.'),
        ),
        migrations.AddField(
            model_name='interviewreport',
            name='model_name',
            field=models.CharField(max_length=100, default='', help_text="Version of the model used (e.g., 'gemini-1.5-pro')."),
        ),
        migrations.AddField(
            model_name='interviewreport',
            name='overall_score',
            field=models.IntegerField(null=True, blank=True, help_text="Overall performance score (0-100)."),
        ),
        # Rename InterviewReport model to AIInterviewReport
        migrations.RenameModel(
            old_name='InterviewReport',
            new_name='AIInterviewReport',
        ),
    ] 