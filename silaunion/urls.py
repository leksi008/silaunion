from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('contracts.urls')),  # Подключаем URL-ы приложения contracts
]