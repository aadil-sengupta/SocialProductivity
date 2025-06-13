from django.contrib import admin
from users.models import UserData

class UserDataAdmin(admin.ModelAdmin):
    list_display = ('user', 'isOnline', 'darkMode', 'font', 'accentColor', 'focusDuration', 'desktopNotifications')
    list_filter = ('darkMode', 'isOnline', 'showOnlineStatus', 'showTimeSpendStudying', 'backgroundBlur', 'pauseIsBreak', 'desktopNotifications', 'playSoundOnNotification', 'breakReminders', 'standUpReminders')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('activeTime', 'totalTime', 'isWorking')
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Profile Settings', {
            'fields': ('profilePhoto', 'showOnlineStatus', 'showTimeSpendStudying')
        }),
        ('Theme & Appearance', {
            'fields': ('accentColor', 'wallpaper', 'backgroundBlur', 'font', 'darkMode')
        }),
        ('Timer Settings', {
            'fields': ('focusDuration', 'shortBreakDuration', 'longBreakDuration', 'longBreakInterval', 'pauseIsBreak')
        }),
        ('Notification Settings', {
            'fields': ('desktopNotifications', 'playSoundOnNotification', 'breakReminders', 'standUpReminders')
        }),
        ('Status', {
            'fields': ('isOnline',)
        }),
        ('Statistics (Read-only)', {
            'fields': ('isWorking', 'activeTime', 'totalTime'),
            'classes': ('collapse',)
        }),
    )

# Register your models here.
admin.site.register(UserData, UserDataAdmin)

