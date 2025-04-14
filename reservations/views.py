from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import SportFacility, Court, TimeSlot, Reservation
from .serializers import SportFacilitySerializer, CourtSerializer, TimeSlotSerializer, ReservationSerializer
from django.utils.dateparse import parse_date
from django.utils import timezone
from rest_framework import serializers

class SportFacilityViewSet(viewsets.ModelViewSet):
    queryset = SportFacility.objects.all()
    serializer_class = SportFacilitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['get'])
    def courts(self, request, pk=None):
        facility = self.get_object()
        courts = facility.courts.all()
        serializer = CourtSerializer(courts, many=True)
        return Response(serializer.data)

class CourtViewSet(viewsets.ModelViewSet):
    queryset = Court.objects.all()
    serializer_class = CourtSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        facility_id = self.request.query_params.get('facility_id')
        if facility_id:
            return Court.objects.filter(facility_id=facility_id)
        return Court.objects.all()

class TimeSlotViewSet(viewsets.ModelViewSet):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Auto-generate slots and filter by court, date, and current time"""
        court_id = self.request.query_params.get('court_id')
        date_str = self.request.query_params.get('date')
        queryset = TimeSlot.objects.none()

        if court_id and date_str:
            try:
                court = Court.objects.get(id=court_id)
                requested_date = parse_date(date_str)
                if requested_date:
                    # Generate slots if they don't exist for this date
                    if not TimeSlot.objects.filter(court=court, date=requested_date).exists():
                        court.generate_time_slots(for_date=requested_date)

                    # Initial filter by court and date
                    queryset = TimeSlot.objects.filter(court=court, date=requested_date)

                    # If the requested date is today, filter out past slots
                    now = timezone.localtime()
                    if requested_date == now.date():
                        queryset = queryset.filter(start_time__gte=now.time())

            except Court.DoesNotExist:
                pass

        return queryset

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Users can only see their own reservations"""
        if self.request.user.is_staff:
            return Reservation.objects.all()
        return Reservation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Check if user has reached the maximum number of reservations (2)
        user_reservations = Reservation.objects.filter(
            user=self.request.user,
            is_cancelled=False
        ).count()
        
        if user_reservations >= 2:
            raise serializers.ValidationError("Maximum number of reservations (2) reached. Please cancel an existing reservation to make a new one.")
        
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create a new reservation and mark the time slot as unavailable"""
        time_slot_id = request.data.get('time_slot')

        try:
            time_slot = TimeSlot.objects.get(id=time_slot_id)
            
            # Check if the time slot is available
            if not time_slot.is_available:
                return Response(
                    {"detail": "This time slot is already booked."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check for overlapping reservations
            overlapping_reservations = Reservation.objects.filter(
                user=request.user,
                is_cancelled=False,
                time_slot__date=time_slot.date,
                time_slot__start_time=time_slot.start_time
            ).exists()

            if overlapping_reservations:
                return Response(
                    {"detail": "You already have a reservation for this time slot."},
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
        except serializers.ValidationError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        """Delete reservation and make slot available again"""
        try:
            reservation = self.get_object()
            time_slot = reservation.time_slot
            
            # Delete the reservation
            reservation.delete()
            
            # Update the time slot availability
            time_slot.is_available = True
            time_slot.save()
            
            return Response({"detail": "Reservation deleted successfully."}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
