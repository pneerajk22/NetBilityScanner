# consumers.py

import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def send_dashboard_data(self, event):
        data = event["data"]
        await self.send(text_data=json.dumps(data))
