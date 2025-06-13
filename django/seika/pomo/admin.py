from django.contrib import admin
from pomo.models import CurrentSession, SessionData

class CurrentSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'mode', 'phase', 'pomodoroCount', 'startTime', 'isConnected')
    list_filter = ('mode', 'phase', 'isConnected', 'startTime')
    search_fields = ('user__username',)
    readonly_fields = (
        'startTime', 
        'lastDisconnected', 
        'lastBreakStartTime', 
        'accumulatedBreakDuration',
        'lastPauseStartTime', 
        'accumulatedPauseDuration'
    )
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'mode', 'phase', 'pomodoroCount', 'isConnected')
        }),
        ('Timing Information', {
            'fields': ('startTime', 'lastDisconnected', 'lastBreakStartTime', 'accumulatedBreakDuration')
        }),
        ('Pause Information', {
            'fields': ('lastPauseStartTime', 'accumulatedPauseDuration')
        }),
    )

class SessionDataAdmin(admin.ModelAdmin):
    list_display = ('user', 'startTime', 'endTime', 'totalTime', 'activeTime', 'breakTime')
    list_filter = ('endTime', 'startTime')
    search_fields = ('user__username',)
    readonly_fields = ('endTime', 'activeTime')
    fieldsets = (
        ('Session Information', {
            'fields': ('user', 'startTime', 'endTime')
        }),
        ('Duration Information', {
            'fields': ('totalTime', 'activeTime', 'breakTime')
        }),
    )

# Register your models here.
admin.site.register(CurrentSession, CurrentSessionAdmin)
admin.site.register(SessionData, SessionDataAdmin)
