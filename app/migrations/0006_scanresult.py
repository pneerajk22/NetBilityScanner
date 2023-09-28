# Generated by Django 4.2.4 on 2023-09-14 07:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_custompermission'),
    ]

    operations = [
        migrations.CreateModel(
            name='ScanResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scan_type', models.CharField(choices=[('file', 'File Scan'), ('zap', 'ZAP Scan'), ('port', 'Port Scan')], max_length=4)),
                ('scan_date', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]