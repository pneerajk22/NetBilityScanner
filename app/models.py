from django.db import models
from django.contrib.auth.models import Permission
# Create your models here.

# For File Scan Storing


class FileScanResult(models.Model):
    file_md5 = models.CharField(max_length=32)
    scan_date = models.DateTimeField(auto_now_add=True)
    scan_results = models.JSONField()

# For Web Scan Storing


class ZapScanResult(models.Model):
    scan_date = models.DateTimeField(auto_now_add=True)
    target_url = models.URLField()
    scan_results = models.JSONField()

# For Port Scan Storing


class PortScanResult(models.Model):
    scan_date = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    port_ranges = models.CharField(max_length=255)
    open_ports = models.JSONField()
    
    

class ScanResult(models.Model):
    SCAN_TYPES = (
        ('file', 'File Scan'),
        ('zap', 'ZAP Scan'),
        ('port', 'Port Scan'),
    )

    scan_type = models.CharField(max_length=4, choices=SCAN_TYPES)
    scan_date = models.DateTimeField(auto_now_add=True)
