# Generated manually for UUID conversion of booth-job relationships

import uuid
from django.db import migrations, models
import django.db.models.deletion


def migrate_booth_job_data(apps, schema_editor):
    """
    Migrate existing booth-job relationships from bigint IDs to UUIDs
    """
    # Get the models
    Booth = apps.get_model('career_fairs', 'Booth')
    Job = apps.get_model('jobs', 'Job')
    BoothJob = apps.get_model('career_fairs', 'BoothJob')
    
    # Get the database connection
    db_alias = schema_editor.connection.alias
    
    # Get existing relationships from the old table
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("""
            SELECT booth_id, job_id 
            FROM career_fairs_booth_jobs_old 
            WHERE booth_id IS NOT NULL AND job_id IS NOT NULL
        """)
        relationships = cursor.fetchall()
    
    # Create new relationships with UUIDs
    booth_job_objects = []
    for booth_id, job_id in relationships:
        try:
            booth = Booth.objects.using(db_alias).get(id=booth_id)
            job = Job.objects.using(db_alias).get(id=job_id)
            
            booth_job = BoothJob(
                id=uuid.uuid4(),
                booth=booth,
                job=job
            )
            booth_job_objects.append(booth_job)
        except (Booth.DoesNotExist, Job.DoesNotExist):
            # Skip if booth or job doesn't exist
            continue
    
    # Bulk create the new relationships
    if booth_job_objects:
        BoothJob.objects.using(db_alias).bulk_create(booth_job_objects, ignore_conflicts=True)
    
    print(f"Migrated {len(booth_job_objects)} booth-job relationships to UUID format")


def reverse_migrate_booth_job_data(apps, schema_editor):
    """
    Reverse migration - convert back to bigint IDs (if needed)
    """
    # This is a complex reverse migration that would require
    # recreating the old table structure and data
    # For now, we'll just pass as this is primarily a forward migration
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('career_fairs', '0008_booth_booth_number'),
        ('jobs', '0002_remove_old_career_fair_tables'),
    ]

    operations = [
        # Step 1: Create the new BoothJob model
        migrations.CreateModel(
            name='BoothJob',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('booth', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='booth_job_relationships', to='career_fairs.booth')),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='booth_job_relationships', to='jobs.job')),
            ],
            options={
                'db_table': 'career_fairs_booth_jobs',
                'unique_together': {('booth', 'job')},
            },
        ),
        
        # Step 2: Rename the old table to preserve data
        migrations.RunSQL(
            "ALTER TABLE career_fairs_booth_jobs RENAME TO career_fairs_booth_jobs_old;",
            reverse_sql="ALTER TABLE career_fairs_booth_jobs_old RENAME TO career_fairs_booth_jobs;"
        ),
        
        # Step 3: Migrate the data
        migrations.RunPython(
            migrate_booth_job_data,
            reverse_migrate_booth_job_data
        ),
        
        # Step 4: Drop the old table
        migrations.RunSQL(
            "DROP TABLE IF EXISTS career_fairs_booth_jobs_old;",
            reverse_sql=""  # No reverse SQL as we can't recreate the old data easily
        ),
        
        # Step 5: Update the Booth model to use the through model
        migrations.AlterField(
            model_name='booth',
            name='jobs',
            field=models.ManyToManyField(blank=True, related_name='booths', through='career_fairs.BoothJob', to='jobs.job'),
        ),
    ] 