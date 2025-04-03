from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import SportFacility, TimeSlot, Reservation
from .serializers import SportFacilitySerializer, TimeSlotSerializer, ReservationSerializer

class SportFacilityViewSet(viewsets.ModelViewSet):
    queryset = SportFacility.objects.all()
    serializer_class = SportFacilitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filter time slots by facility and date"""
        queryset = TimeSlot.objects.all()
        facility_id = self.request.query_params.get('facility_id')
        date = self.request.query_params.get('date')
        
        if facility_id:
            queryset = queryset.filter(facility_id=facility_id)
        if date:
            queryset = queryset.filter(date=date)
            
        return queryset

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]
    # In your ReservationViewSet
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context
    def get_queryset(self):
        """Users can only see their own reservations"""
        if self.request.user.is_staff:
            return Reservation.objects.all()
        return Reservation.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create a new reservation and mark the time slot as unavailable"""
        time_slot_id = request.data.get('time_slot')
        
        try:
            time_slot = TimeSlot.objects.get(id=time_slot_id)
            if not time_slot.is_available:
                return Response(
                    {"detail": "This time slot is already booked."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mark the time slot as unavailable
            time_slot.is_available = False
            time_slot.save()
            
            # Create reservation with the current user
            request.data['user'] = request.user.id
            return super().create(request, *args, **kwargs)
        
        except TimeSlot.DoesNotExist:
            return Response(
                {"detail": "Time slot not found."},
                status=status.HTTP_404_NOT_FOUND
            )