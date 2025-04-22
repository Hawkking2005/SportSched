import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync

class TimeSlotConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """
        Called when the websocket is trying to connect.
        """
        # Extract facility_id and date_str from the URL route
        self.facility_id = self.scope['url_route']['kwargs']['facility_id']
        self.date_str = self.scope['url_route']['kwargs']['date_str']

        # Create a unique group name for this facility and date
        self.group_name = f'timeslots_{self.facility_id}_{self.date_str}'

        # Join room group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name  # Unique name for this consumer connection
        )

        # Accept the connection
        await self.accept()
        print(f"WebSocket connected: {self.channel_name} to group {self.group_name}") # For debugging

    async def disconnect(self, close_code):
        """
        Called when the WebSocket closes for any reason.
        """
        print(f"WebSocket disconnected: {self.channel_name} from group {self.group_name}") # For debugging
        # Leave room group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Note: We don't need a receive() method here if the client
    # doesn't send messages *to* the server via WebSocket.
    # We only need to handle messages *sent from* the server/group.

    async def timeslot_update(self, event):
        """
        Handler for messages sent to the group with type='timeslot.update'.
        Receives the event data and sends it to the WebSocket client.
        """
        slot_id = event['slot_id']
        is_available = event['is_available']
        print(f"Sending update for slot {slot_id} in group {self.group_name}") # For debugging

        # Send message to WebSocket client
        await self.send(text_data=json.dumps({
            'type': 'timeslot_update', # Message type for the frontend to identify
            'slot_id': slot_id,
            'is_available': is_available,
        })) 