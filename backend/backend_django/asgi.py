"""
ASGI config for backend_django project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
import jobs.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter(jobs.routing.websocket_urlpatterns),
})
