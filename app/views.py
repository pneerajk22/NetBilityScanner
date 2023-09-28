from django.shortcuts import render
from django.http import JsonResponse
import hashlib
import requests
import time
from zapv2 import ZAPv2
import nmap
from app.models import FileScanResult, PortScanResult, ScanResult, ZapScanResult
from django.contrib.auth.decorators import user_passes_test
import plotly.express as px
from datetime import datetime, timedelta


ZAP_API = 'mh2n9ao5nii3g47kq02roea403'
VIRUS_TOTAL_API_KEY = '2646f29686a4d9304a92079d2db94e1214f1d8b9fc8aff9bb9a4d03f55312393'


def index(request):
    return render(request, 'index.html')


def get_initial_dashboard_data(request):
    # Retrieve initial data from your database or any other source
    zap_scan_count = ZapScanResult.objects.count()
    port_scan_count = PortScanResult.objects.count()
    file_scan_count = FileScanResult.objects.count()
    initial_data = {
        'zap_scans': zap_scan_count,  # Initial count of ZAP scans,
        'port_scans': port_scan_count,  # Initial count of port scans,
        'file_scans':  file_scan_count,  # Initial count of file scans,
    }
    return JsonResponse(initial_data)


def scan_vulnerabilities(url):
    apiKey = ZAP_API
    zap = ZAPv2(apikey=apiKey)

    try:
        # Spider the target
        scanID = zap.spider.scan(url)
        while int(zap.spider.status(scanID)) < 100:
            # Poll the status until it completes
            time.sleep(1)

        # Get the URLs the spider has crawled
        spider_results = zap.spider.results(scanID)

        # Collect alert data
        st = 0
        pg = 5000
        alert_dict = {}
        alert_count = 0
        alerts = zap.alert.alerts(baseurl=url, start=st, count=pg)
        blacklist = [1, 2]
        while len(alerts) > 0:
            alert_count += len(alerts)
            for alert in alerts:
                plugin_id = alert.get('pluginId')
                if plugin_id in blacklist:
                    continue
                if alert.get('risk') == 'High':
                    # Trigger any relevant postprocessing
                    continue
                if alert.get('risk') == 'Informational':
                    # Ignore all info alerts - some of them may have been downgraded by security annotations
                    continue
                # Add the alert to the alert_dict (modify this based on your desired data structure)
                alert_dict[alert['id']] = alert
            st += pg
            alerts = zap.alert.alerts(baseurl=url, start=st, count=pg)

        # Prepare the scan results
        scan_results = {
            'spider_results': spider_results,
            'alert_count': alert_count,
            'alert_dict': alert_dict,
        }

        zap_scan_result = ZapScanResult(
            target_url=url,
            scan_results=scan_results,
        )
        zap_scan_result.save()

        

        return scan_results
    except Exception as e:
        print("Error occurred during the scan:", str(e))
        return {'error': 'An error occurred during the scan.'}


def scan(request):
    if request.method == 'POST':
        url = request.POST.get('url')
        scan_results = scan_vulnerabilities(url)
        if 'error' in scan_results:
            # Return a 500 status code for errors
            return JsonResponse(scan_results, status=500)
        else:
            return JsonResponse(scan_results)
    else:
        return render(request, 'scan.html')


def get_zap_progress(request):
    zap_api_url = 'http://127.0.0.1:8080/'  # Replace with your ZAP API URL
    progress_endpoint = '/JSON/pscan/view/progress/'

    response = requests.get(zap_api_url + progress_endpoint)
    if response.status_code == 200:
        progress_data = response.json()
        progress = progress_data['progress']
        return JsonResponse({'progress': progress})
    else:
        return JsonResponse({'error': 'Failed to fetch scan progress.'}, status=500)


def port_scan(request):
    if request.method == 'POST':
        ip_address = request.POST.get('ip_address')
        port_ranges = request.POST.get('port_ranges')

        try:
            # Use the Nmap module to scan the ports
            nmap_scanner = nmap.PortScanner()
            nmap_scanner.scan(ip_address, port_ranges)

            # Get the list of open ports along with their service names and versions
            open_ports = []
            for host in nmap_scanner.all_hosts():
                port_info = []
                for port in nmap_scanner[host]['tcp']:
                    if nmap_scanner[host]['tcp'][port]['state'] == 'open':
                        service_name = nmap_scanner[host]['tcp'][port]['name']
                        service_version = nmap_scanner[host]['tcp'][port]['version']
                        port_info.append(
                            f'Port {port}: {service_name} (Version: {service_version})')
                if port_info:
                    open_ports.append({
                        'ip': host,
                        'ports': port_info
                    })

            port_scan_result = PortScanResult(
                ip_address=ip_address,
                port_ranges=port_ranges,
                open_ports=open_ports,
            )
            port_scan_result.save()

            

            return JsonResponse({
                'ip_address': ip_address,
                'port_ranges': port_ranges,
                'open_ports': open_ports
            })
        except Exception as e:
            return JsonResponse({'error': str(e)})
    else:
        return render(request, 'port_scan.html')


def upload_file(request):
    if request.method == 'POST' and request.FILES['file']:
        uploaded_file = request.FILES['file']

        # Calculate MD5 hash
        md5_hash = hashlib.md5()
        for chunk in uploaded_file.chunks():
            md5_hash.update(chunk)
        md5 = md5_hash.hexdigest()

        # Send hashes to VirusTotal API
        api_key = VIRUS_TOTAL_API_KEY
        url = f'https://www.virustotal.com/api/v3/files/{md5}'
        headers = {
            'x-apikey': api_key,
        }
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            vt_data = response.json()
            scan_results = vt_data['data']['attributes']['last_analysis_results']

            # Save scan results to the database
            scan_result = FileScanResult(
                file_md5=md5,
                scan_results=scan_results,
            )
            scan_result.save()

            safe_count = 0
            harmful_count = 0
            other_reason = 0
            for engine, result in scan_results.items():
                if result['category'] == 'undetected' or result['category'] == 'Unable to process file type' or result['category'] == 'timeout' or result['category'] == 'type-unsupported':
                    safe_count += 1
                else:
                    harmful_count += 1

            total_engines = safe_count + harmful_count + other_reason
            file_status = 'Harmful' if harmful_count > 0 else 'Safe'

            return render(request, 'scan_results.html', {
                'scan_results': vt_data['data']['attributes']['last_analysis_results'],
                'safe_count': safe_count,
                'harmful_count': harmful_count,
                'total_engines': total_engines,
                'file_status': file_status,
            })

        else:
            return render(request, 'scan_results.html', {
                'safe_count': 0,
                'harmful_count': 0,
                'total_engines': 0,
                'file_status': 'Error'
            })
    else:
        return render(request, 'upload.html')


    
@user_passes_test(lambda u: u.is_superuser)
def admin_report(request):
    # Collect data from the database for each scan type
    file_scan_count = FileScanResult.objects.count()
    zap_scan_count = ZapScanResult.objects.count()
    port_scan_count = PortScanResult.objects.count()

    # Create a pie chart representing the distribution of scan types
    scan_data = {
        'File Scans': file_scan_count,
        'Port Scans': port_scan_count,
        'ZAP Scans': zap_scan_count,
    }

    fig_pie = px.pie(
        values=list(scan_data.values()),
        names=list(scan_data.keys()),
        title='Scan Distribution Report',
    )

    # Convert the Plotly pie chart to HTML
    pie_chart_html = fig_pie.to_html(full_html=False)

    selected_date = request.GET.get('selected_date')

    # Collect data for the selected date from the database
    if selected_date:
        selected_date = datetime.strptime(selected_date, '%Y-%m-%d')
        end_date = selected_date + timedelta(days=1)  # Add one day to get data until midnight of the selected date

        file_scan_count = FileScanResult.objects.filter(scan_date__gte=selected_date, scan_date__lt=end_date).count()
        zap_scan_count = ZapScanResult.objects.filter(scan_date__gte=selected_date, scan_date__lt=end_date).count()
        port_scan_count = PortScanResult.objects.filter(scan_date__gte=selected_date, scan_date__lt=end_date).count()
    else:
        # Provide default values if no date is selected
        file_scan_count = zap_scan_count = port_scan_count = 0

    # Create a bar chart for the selected date
    data_bar = {
        'Scan Types': ['File Scans', 'Port Scans', 'ZAP Scans'],
        'Counts': [file_scan_count, port_scan_count, zap_scan_count],
    }

    fig_bar = px.bar(
        data_bar, x='Scan Types', y='Counts',
        title='Scan Report for {}'.format(selected_date) if selected_date else 'Scan Report',
    )

    # Convert the Plotly bar chart to HTML
    bar_chart_html = fig_bar.to_html(full_html=False)

    context = {
        'pie_chart_html': pie_chart_html,
        'bar_chart_html': bar_chart_html,
    }

    return render(request, 'admin_report.html', context)


