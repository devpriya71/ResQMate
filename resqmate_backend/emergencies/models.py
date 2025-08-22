# emergencies/models.py
from django.db import models
from django.contrib.auth.models import User
from users.models import UserProfile

class EmergencyIncident(models.Model):
    incident_type = models.CharField(max_length=100)
    location_lat = models.DecimalField(max_digits=9, decimal_places=6)
    location_lon = models.DecimalField(max_digits=9, decimal_places=6)
    description = models.TextField()
    reporter = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

class SafetyAlert(models.Model):
    ALERT_TYPES = (
        ('distress_signal', 'Distress Signal'),
        ('fake_call_request', 'Fake Call Request'),
    )
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPES)
    location_lat = models.DecimalField(max_digits=9, decimal_places=6)
    location_lon = models.DecimalField(max_digits=9, decimal_places=6)
    timestamp = models.DateTimeField(auto_now_add=True)

# Existing SOSAlert model
class SOSAlert(models.Model):
    SEVERITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='sos_images/', null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    timestamp = models.DateTimeField(auto_now_add=True)
    # Deprecated single volunteer field kept for backward compatibility in some UIs
    volunteer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='primary_sos_assignments')
    # Multiple volunteers can be assigned
    volunteers = models.ManyToManyField(User, blank=True, related_name='sos_volunteerings')
    # Reporter/creator of the alert
    reporter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reported_sos_alerts')
    type = models.CharField(max_length=50, choices=[("fire", "Fire"), ("medical", "Medical"), ("other", "Other")], default="medical")
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='medium')
    resolved = models.BooleanField(default=False)

    def __str__(self):
        return self.title

# New Donation model
class Donation(models.Model):
    item = models.CharField(max_length=255)
    quantity = models.CharField(max_length=255)
    pickup_address = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    volunteer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.item} donation"

# New HelpRequest model for victims to request assistance
class HelpRequest(models.Model):
    NEED_TYPES = (
        ('medical', 'Medical'),
        ('shelter', 'Shelter'),
        ('food', 'Food'),
        ('safety', 'Safety'),
        ('transport', 'Transport'),
        ('other', 'Other'),
    )

    URGENCY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )

    STATUS_CHOICES = (
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    )

    requester = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='help_requests')
    need_type = models.CharField(max_length=50, choices=NEED_TYPES)
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='medium')
    description = models.TextField()
    location_text = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        who = self.requester.username if self.requester else 'Anonymous'
        return f"{who} - {self.need_type} ({self.urgency})"