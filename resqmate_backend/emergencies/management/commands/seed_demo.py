from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from emergencies.models import SOSAlert, Donation
from users.models import UserProfile

class Command(BaseCommand):
    help = "Seed database with demo users, SOS alerts, and donations"

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Seeding demo data...'))

        # Clear existing app data (optional, idempotent)
        SOSAlert.objects.all().delete()
        Donation.objects.all().delete()

        # Create users
        victim_user, created = User.objects.get_or_create(username='devpriya')
        if created:
            victim_user.set_password('devpriya71')
            victim_user.save()
        UserProfile.objects.get_or_create(user=victim_user, defaults={'role': 'victim'})
        Token.objects.get_or_create(user=victim_user)

        volunteer_user, created = User.objects.get_or_create(username='priya')
        if created:
            volunteer_user.set_password('priya11')
            volunteer_user.save()
        UserProfile.objects.get_or_create(user=volunteer_user, defaults={'role': 'volunteer'})
        Token.objects.get_or_create(user=volunteer_user)

        # Create SOS alerts with varied severity/resolution
        sos_samples = [
            {
                'title': 'Building Fire in Andheri',
                'description': 'Major fire reported in a residential building near Andheri East.',
                'type': 'fire',
                'latitude': 19.1197,
                'longitude': 72.8468,
                'severity': 'critical',
                'resolved': False,
                'volunteers': [volunteer_user],
            },
            {
                'title': 'Medical Emergency at Connaught Place',
                'description': 'Person fainted near metro gate, requires immediate assistance.',
                'type': 'medical',
                'latitude': 28.6315,
                'longitude': 77.2167,
                'severity': 'medium',
                'resolved': False,
                'volunteers': [],
            },
            {
                'title': 'Road Accident near MG Road',
                'description': 'Multi-vehicle collision, traffic impacted.',
                'type': 'other',
                'latitude': 12.9716,
                'longitude': 77.5946,
                'severity': 'high',
                'resolved': False,
                'volunteers': [],
            },
            {
                'title': 'Waterlogging in Salt Lake',
                'description': 'Street flooded after heavy rain, no casualties reported.',
                'type': 'other',
                'latitude': 22.5867,
                'longitude': 88.4170,
                'severity': 'low',
                'resolved': True,
                'volunteers': [],
            },
        ]

        for data in sos_samples:
            sos = SOSAlert.objects.create(
                title=data['title'],
                description=data['description'],
                latitude=data['latitude'],
                longitude=data['longitude'],
                type=data['type'],
                severity=data['severity'],
                resolved=data['resolved'],
                reporter=victim_user,
                volunteer=(data['volunteers'][0] if data['volunteers'] else None),
            )
            for v in data['volunteers']:
                sos.volunteers.add(v)

        # Create Donations
        donations = [
            {
                'item': 'Blankets',
                'quantity': '30',
                'pickup_address': 'Andheri East, Mumbai, MH',
                'volunteer': None,
            },
            {
                'item': 'Bottled Water',
                'quantity': '200',
                'pickup_address': 'Connaught Place, New Delhi',
                'volunteer': volunteer_user,
            },
            {
                'item': 'First Aid Kits',
                'quantity': '15',
                'pickup_address': 'MG Road, Bengaluru, KA',
                'volunteer': None,
            },
        ]
        for d in donations:
            Donation.objects.create(
                item=d['item'],
                quantity=d['quantity'],
                pickup_address=d['pickup_address'],
                volunteer=d['volunteer'],
            )

        self.stdout.write(self.style.SUCCESS('Demo data seeded successfully.'))
