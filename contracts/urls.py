from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,  # Добавлено для проверки токенов
)

from .views import ContractViewSet, ContractStageViewSet, ContractDocumentViewSet, UserRegisterView
from .serializers import CustomTokenObtainPairSerializer

# Создание маршрутизатора для API
router = DefaultRouter()

# Регистрируем роуты для контрактов и связанных с ними данных
router.register(r'contracts', ContractViewSet, basename='contracts')
router.register(
    r'contracts/(?P<contract_id>\d+)/stages',
    ContractStageViewSet,
    basename='contract-stages'
)
router.register(
    r'contracts/(?P<contract_id>\d+)/documents',
    ContractDocumentViewSet,
    basename='contract-documents'
)

# Основные URL- маршруты
urlpatterns = [
    # Включение роутов для контрактов
    path('', include(router.urls)),

    # Маршруты для аутентификации
    path('auth/register/', UserRegisterView.as_view(), name='register'),
    path('auth/token/', TokenObtainPairView.as_view(
        serializer_class=CustomTokenObtainPairSerializer
    ), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

# Добавление маршрутов для медиа файлов, если в режиме DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
