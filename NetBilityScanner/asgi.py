import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from NetBilityScanner.routing import websocket_urlpatterns  # Replace 'your_app' with the actual name of your app's folder

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'NetBilityScanner.settings')

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": URLRouter(
            websocket_urlpatterns
        ),
    }
)
