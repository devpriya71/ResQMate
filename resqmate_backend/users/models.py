# users/models.py
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLES = (
        ('victim', 'Victim'),
        ('volunteer', 'Volunteer'),
        ('authority', 'Authority'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLES, default='victim')
    is_safety_user = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)