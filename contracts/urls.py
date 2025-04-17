from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView  # Добавьте для проверки токенов
)
from .views import ContractViewSet, ContractStageViewSet, ContractDocumentViewSet
from .serializers import CustomTokenObtainPairSerializer
from .views import UserRegisterView
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'contracts', ContractViewSet, basename='contracts')  # Явно укажите basename
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

urlpatterns = [
    path('', include(router.urls)),

    # Аутентификация
    path('auth/register/', UserRegisterView.as_view(), name='register'),
    path('auth/token/', TokenObtainPairView.as_view(
        serializer_class=CustomTokenObtainPairSerializer
    ), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)