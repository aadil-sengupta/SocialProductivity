# filepath: /Volumes/stuff/Productivity/SocialProductivity/django/seika/pomo/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import SessionData, CurrentSession


class SessionDataSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='user', 
        write_only=True
    )
    
    class Meta:
        model = SessionData
        fields = [
            'id',
            'user',
            'user_id', 
            'startTime',
            'endTime',
            'totalTime',
            'activeTime',
            'breakTime'
        ]
        read_only_fields = ['id', 'endTime', 'activeTime']
    
    def to_representation(self, instance):
        """
        Convert duration fields to a more readable format (seconds)
        """
        data = super().to_representation(instance)
        
        # Convert duration fields to total seconds for easier frontend handling
        if data.get('totalTime'):
            data['totalTimeSeconds'] = instance.totalTime.total_seconds()
        if data.get('activeTime'):
            data['activeTimeSeconds'] = instance.activeTime.total_seconds()
        if data.get('breakTime'):
            data['breakTimeSeconds'] = instance.breakTime.total_seconds()
            
        return data


class CurrentSessionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True
    )
    
    class Meta:
        model = CurrentSession
        fields = [
            'id',
            'user',
            'user_id',
            'mode',
            'phase',
            'pomodoroCount',
            'startTime',
            'isConnected',
            'lastDisconnected',
            'lastBreakStartTime',
            'accumulatedBreakDuration',
            'lastPauseStartTime',
            'accumulatedPauseDuration'
        ]
        read_only_fields = [
            'id',
            'startTime',
            'lastDisconnected',
            'lastBreakStartTime',
            'accumulatedBreakDuration',
            'lastPauseStartTime',
            'accumulatedPauseDuration'
        ]
    
    def to_representation(self, instance):
        """
        Convert duration fields to a more readable format (seconds)
        """
        data = super().to_representation(instance)
        
        # Convert duration fields to total seconds for easier frontend handling
        if data.get('accumulatedBreakDuration'):
            data['accumulatedBreakDurationSeconds'] = instance.accumulatedBreakDuration.total_seconds()
        if data.get('accumulatedPauseDuration'):
            data['accumulatedPauseDurationSeconds'] = instance.accumulatedPauseDuration.total_seconds()
            
        return data