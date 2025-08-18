# emergencies/serializers.py

from rest_framework import serializers
from .models import SOSAlert, Donation

# SOSAlert Serializer (ensure volunteers, severity, resolved included)
class SOSAlertSerializer(serializers.ModelSerializer):
    type = serializers.CharField(write_only=True, required=False)
    volunteer = serializers.SerializerMethodField()
    volunteers = serializers.SerializerMethodField()
    reporter = serializers.SerializerMethodField()

    class Meta:
        model = SOSAlert
        fields = ['id','title','description','image','latitude','longitude','timestamp','type','severity','resolved','volunteer','volunteers','reporter']

    def get_volunteer(self, obj):
        return obj.volunteer.username if obj.volunteer else None

    def get_volunteers(self, obj):
        return [u.username for u in obj.volunteers.all()]

    def get_reporter(self, obj):
        return obj.reporter.username if obj.reporter else None

# New Donation Serializer
class DonationSerializer(serializers.ModelSerializer):
    volunteer = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = ['id', 'item', 'quantity', 'pickup_address', 'timestamp', 'volunteer']

    def get_volunteer(self, obj):
        return obj.volunteer.username if obj.volunteer else None