# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import ContractViewSet, ContractStageViewSet, ContractDocumentViewSet
from .serializers import CustomTokenObtainPairSerializer

router = DefaultRouter()
router.register(r'contracts', ContractViewSet)
router.register(r'contracts/(?P<contract_id>\d+)/stages', ContractStageViewSet, basename='contract-stages')
router.register(r'contracts/(?P<contract_id>\d+)/documents', ContractDocumentViewSet, basename='contract-documents')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]