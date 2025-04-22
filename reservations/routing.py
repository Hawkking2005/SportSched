from django.urls import re_path

from . import consumers

# Define the WebSocket URL patterns
websocket_urlpatterns = [
    # Route for time slot updates for a specific facility and date
    # Example path: ws://<your_domain>/ws/timeslots/1/2024-07-30/
    re_path(r'ws/timeslots/(?P<facility_id>\d+)/(?P<date_str>\d{4}-\d{2}-\d{2})/$', consumers.TimeSlotConsumer.as_asgi()),
] 