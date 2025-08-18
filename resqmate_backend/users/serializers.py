# users/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role', 'victim')

        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )

        UserProfile.objects.create(user=user, role=role)
        return user

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLES, required=False)
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'role', 'avatar', 'is_safety_user']

    def update(self, instance, validated_data):
        # Accept both plain 'email' and nested 'user': {'email': ...}
        email = validated_data.pop('email', None)
        if email is None:
            user_data = validated_data.pop('user', {})
            email = user_data.get('email')
        if email is not None:
            instance.user.email = email
            instance.user.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance