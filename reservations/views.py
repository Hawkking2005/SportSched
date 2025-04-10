from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import SportFacility, TimeSlot, Reservation
from .serializers import SportFacilitySerializer, TimeSlotSerializer, ReservationSerializer
from django.utils.dateparse import parse_date

class SportFacilityViewSet(viewsets.ModelViewSet):
    queryset = SportFacility.objects.all()
    serializer_class = SportFacilitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Auto-generate slots and filter by facility and date"""
        facility_id = self.request.query_params.get('facility_id')
        date_str = self.request.query_params.get('date')

        if facility_id and date_str:
            try:
                facility = SportFacility.objects.get(id=facility_id)
                date = parse_date(date_str)
                if date:
                    # Auto-generate slots for the given date
                    facility.generate_time_slots(for_date=date)
                    return TimeSlot.objects.filter(facility=facility, date=date)
            except SportFacility.DoesNotExist:
                return TimeSlot.objects.none()
        
        return TimeSlot.objects.none()

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

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

    def destroy(self, request, *args, **kwargs):
        """Cancel reservation and make slot available again"""
        reservation = self.get_object()
        reservation.cancel()  # Custom model method updates availability
        return Response({"detail": "Reservation cancelled."}, status=status.HTTP_204_NO_CONTENT)
