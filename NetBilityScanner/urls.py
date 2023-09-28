from django.contrib import admin
from django.urls import path, include
from app.views import admin_report, index
from app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path("",index, name="index"),
    path('scan/', include('app.urls')),
    path('', include('app.urls')),
    path('get_zap_progress/', views.get_zap_progress, name='get_zap_progress'),
    path('port_scan/', views.port_scan, name='port_scan'),
    path('upload/', views.upload_file, name='upload_file'),
    path('scan_results/', views.upload_file, name='upload_file'),
    path('report/', admin_report, name='admin_report'),
    path('admin_report/<str:selected_date>/', views.admin_report, name='admin_report_with_date'),
]
