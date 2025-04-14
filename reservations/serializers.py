# reservations/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import SportFacility, TimeSlot, Reservation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'facility', 'start_time', 'end_time', 'date', 'is_available']
        read_only_fields = ['id']

class SportFacilitySerializer(serializers.ModelSerializer):
    time_slots = TimeSlotSerializer(many=True, read_only=True)
    
    class Meta:
        model = SportFacility
        fields = ['id', 'name', 'description', 'facility_type', 'image', 'time_slots']
        read_only_fields = ['id']

class ReservationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True, default=serializers.CurrentUserDefault())
    time_slot_details = TimeSlotSerializer(source='time_slot', read_only=True)
    facility_name = serializers.CharField(source='time_slot.facility.name', read_only=True)
    
    class Meta:
        model = Reservation
        fields = ['id', 'user', 'time_slot', 'time_slot_details', 'facility_name', 'created_at', 'is_cancelled']
        read_only_fields = ['id', 'user', 'created_at', 'time_slot_details', 'facility_name']
    
    def create(self, validated_data):
        # Set the user to the current user making the request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)