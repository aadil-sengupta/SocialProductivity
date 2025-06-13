from django.contrib import admin
from users.models import UserData

class UserDataAdmin(admin.ModelAdmin):
    list_display = ('user', 'font', 'accentColor', 'darkMode', 'isOnline', 'wallpaper')
    list_filter = ('darkMode', 'isOnline', 'accentColor', 'font')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('activeTime', 'totalTime', 'isWorking')
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Appearance Settings', {
            'fields': ('wallpaper', 'font', 'accentColor', 'darkMode')
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

