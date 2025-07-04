# Generated by Django 5.2.3 on 2025-06-25 09:16

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('isOnline', models.BooleanField(default=True)),
                ('timeZone', models.CharField(default='UTC', help_text="User's timezone, e.g., 'UTC', 'America/New_York'", max_length=50)),
                ('onboarded', models.BooleanField(default=False, help_text='Whether the user has completed the onboarding process')),
                ('profilePhoto', models.CharField(blank=True, default='/avatars/vibrent_1.png', max_length=255, null=True)),
                ('showOnlineStatus', models.BooleanField(default=True)),
                ('showTimeSpendStudying', models.BooleanField(default=True)),
                ('accentColor', models.CharField(default='#10b981', max_length=20)),
                ('wallpaper', models.CharField(default='leaves.jpg', max_length=255)),
                ('backgroundBlur', models.BooleanField(default=False, help_text='Enable background blur')),
                ('font', models.CharField(default='Arial', max_length=100)),
                ('darkMode', models.BooleanField(default=True)),
                ('focusDuration', models.IntegerField(default=25, help_text='Focus duration in minutes')),
                ('shortBreakDuration', models.IntegerField(default=5, help_text='Short break duration in minutes')),
                ('longBreakDuration', models.IntegerField(default=15, help_text='Long break duration in minutes')),
                ('longBreakInterval', models.IntegerField(default=4, help_text='Number of pomodoros before a long break')),
                ('pauseIsBreak', models.BooleanField(default=True, help_text='Whether to treat pause as a break')),
                ('desktopNotifications', models.BooleanField(default=True, help_text='Enable desktop notifications')),
                ('playSoundOnNotification', models.BooleanField(default=True, help_text='Play sound on notification')),
                ('breakReminders', models.BooleanField(default=True, help_text='Enable break reminders')),
                ('standUpReminders', models.BooleanField(default=True, help_text='Enable stand up reminders')),
                ('friends', models.ManyToManyField(blank=True, related_name='friend_of', to=settings.AUTH_USER_MODEL)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='FriendRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')], default='pending', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('receiver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_requests', to=settings.AUTH_USER_MODEL)),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_requests', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('sender', 'receiver')},
            },
        ),
    ]
