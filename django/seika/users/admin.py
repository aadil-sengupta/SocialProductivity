from django.contrib import admin
from users.models import UserData, FriendRequest

class UserDataAdmin(admin.ModelAdmin):
    list_display = ('user', 'isOnline', 'darkMode', 'font', 'accentColor', 'focusDuration', 'desktopNotifications', 'onboarded', 'profilePhoto', 'timeZone', 'level', 'experiencePoints', 'streak')
    list_filter = ('darkMode', 'isOnline', 'showOnlineStatus', 'showTimeSpendStudying', 'backgroundBlur', 'pauseIsBreak', 'desktopNotifications', 'playSoundOnNotification', 'breakReminders', 'standUpReminders', 'onboarded', 'level')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('activeTime', 'totalTime', 'isWorking')
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'friends')
        }),
        ('Profile Settings', {
            'fields': ('profilePhoto', 'showOnlineStatus', 'showTimeSpendStudying', 'timeZone', 'onboarded')
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
        ('Experience & Progress', {
            'fields': ('experiencePoints', 'level', 'streak', 'lastWorked', 'maxStreak')
        }),
        ('Status', {
            'fields': ('isOnline',)
        }),
        ('Statistics (Read-only)', {
            'fields': ('isWorking', 'activeTime', 'totalTime'),
            'classes': ('collapse',)
        }),
    )

class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('sender__username', 'receiver__username')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Request Information', {
            'fields': ('sender', 'receiver', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

# Register your models here.
admin.site.register(UserData, UserDataAdmin)
admin.site.register(FriendRequest, FriendRequestAdmin)

