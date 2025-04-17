from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User  # это твоя кастомная модель

admin.site.register(User, UserAdmin)