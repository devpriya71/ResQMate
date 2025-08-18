# emergencies/views.py

from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
from .models import SOSAlert, Donation
from django.contrib.auth.models import User
from .serializers import SOSAlertSerializer, DonationSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

class SOSAlertViewSet(viewsets.ModelViewSet):
    queryset = SOSAlert.objects.all()
    serializer_class = SOSAlertSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        instance = serializer.save(reporter=self.request.user)
        # Broadcast to WebSocket clients
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'alerts_broadcast_group',
            {
                'type': 'sos_created',
                'payload': SOSAlertSerializer(instance).data,
            }
        )

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        sos = self.get_object()
        user = request.user
        # Only reporter or any assigned volunteer can update status
        allowed_usernames = set([sos.reporter.username if sos.reporter else None] + [u.username for u in sos.volunteers.all()])
        if user.username not in allowed_usernames:
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)
        resolved = request.data.get('resolved')
        severity = request.data.get('severity')
        changed = False
        if resolved is not None:
            sos.resolved = bool(resolved in [True, 'true', 'True', '1', 1])
            changed = True
        if severity in dict(SOSAlert.SEVERITY_CHOICES):
            sos.severity = severity
            changed = True
        if changed:
            sos.save()
            return Response(SOSAlertSerializer(sos).data)
        return Response({'detail': 'No changes'}, status=status.HTTP_400_BAD_REQUEST)

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        instance = serializer.save()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'alerts_broadcast_group',
            {
                'type': 'donation_created',
                'payload': DonationSerializer(instance).data,
            }
        )

class DashboardView(APIView):
    def get(self, request, *args, **kwargs):
        total_sos_alerts = SOSAlert.objects.count()
        total_donations = Donation.objects.count()
        
        # You can add more logic here, like counting active alerts, etc.
        # For now, we'll return these basic stats to resolve the 404 error.
        
        data = {
            'total_sos_alerts': total_sos_alerts,
            'total_donations': total_donations,
            'total_volunteers': 0, # Placeholder, as you don't have a dedicated volunteer model yet
            'active_alerts': 0,
            'donations_fulfilled': 0
        }
        return Response(data)
    
class VolunteerAssignView(APIView):
    def post(self, request, *args, **kwargs):
        item_type = request.data.get('type')
        item_id = request.data.get('id')
        volunteer_name = request.data.get('volunteer')
        
        try:
            if item_type == 'sos':
                item = SOSAlert.objects.get(id=item_id)
            elif item_type == 'donation':
                item = Donation.objects.get(id=item_id)
            else:
                return Response({"error": "Invalid item type"}, status=status.HTTP_400_BAD_REQUEST)

            user_obj = None
            if volunteer_name:
                try:
                    user_obj = User.objects.get(username=volunteer_name)
                except User.DoesNotExist:
                    return Response({"error": "Volunteer username not found"}, status=status.HTTP_404_NOT_FOUND)

            if isinstance(item, SOSAlert):
                # Maintain legacy single volunteer for backward compatibility
                item.volunteer = user_obj
                item.save()
                if user_obj:
                    item.volunteers.add(user_obj)
                volunteers_list = [u.username for u in item.volunteers.all()]
            else:
                item.volunteer = user_obj
                item.save()
                volunteers_list = [user_obj.username] if user_obj else []

            # Broadcast assignment
            channel_layer = get_channel_layer()
            payload = {
                'type': item_type,
                'id': item.id,
                'volunteer': user_obj.username if user_obj else None,
                'volunteers': volunteers_list,
            }
            async_to_sync(channel_layer.group_send)(
                'alerts_broadcast_group',
                {
                    'type': 'volunteer_assigned',
                    'payload': payload,
                }
            )
            return Response({"message": "Assignment successful", "volunteers": volunteers_list}, status=status.HTTP_200_OK)
        except (SOSAlert.DoesNotExist, Donation.DoesNotExist):
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)