# Generated by Django 5.2.1 on 2025-07-13 08:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='resume',
            unique_together=set(),
        ),
    ]
