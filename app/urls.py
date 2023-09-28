from django.urls import path
from . import views

urlpatterns = [
    path('scan/', views.scan, name='scan'),
    path('port_scan/', views.port_scan, name='port_scan'),
    path('upload/', views.upload_file, name='upload'),
    path('get_initial_data/', views.get_initial_dashboard_data, name='get_initial_dashboard_data'),
]
