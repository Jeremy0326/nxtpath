from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('jobs', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL('DROP TABLE IF EXISTS career_fair CASCADE;', reverse_sql=''),
        migrations.RunSQL('DROP TABLE IF EXISTS career_fair_application CASCADE;', reverse_sql=''),
        migrations.RunSQL('DROP TABLE IF EXISTS career_fair_employer CASCADE;', reverse_sql=''),
    ] 