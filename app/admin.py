from django.contrib import admin
from .models import FileScanResult, ScanResult
from .models import ZapScanResult
from .models import PortScanResult

# Register your models here.
admin.site.register(FileScanResult)
admin.site.register(ZapScanResult)
admin.site.register(PortScanResult)
admin.site.register(ScanResult)

# Define permissions
admin.site.add_action('Can view File Scan report', 'view_file_scan_report')
admin.site.add_action('Can view ZAP Scan report', 'view_zap_scan_report')
admin.site.add_action('Can view Port Scan report', 'view_port_scan_report')