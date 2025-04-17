from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Contract, ContractStage, ContractDocument
from .serializers import ContractSerializer, ContractStageSerializer, ContractDocumentSerializer
from django.shortcuts import get_object_or_404


class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(responsible=self.request.user)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        contract = self.get_object()
        return Response({'progress': contract.progress})

    @action(detail=True, methods=['get'])
    def report(self, request, pk=None):
        contract = self.get_object()
        stages = contract.stages.all()
        serializer = ContractStageSerializer(stages, many=True)
        return Response({
            'contract': ContractSerializer(contract).data,
            'stages': serializer.data,
            'progress': contract.progress
        })


class ContractStageViewSet(viewsets.ModelViewSet):
    queryset = ContractStage.objects.all()
    serializer_class = ContractStageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        contract_id = self.kwargs.get('contract_id')
        return self.queryset.filter(contract_id=contract_id)

    def perform_create(self, serializer):
        contract = get_object_or_404(Contract, id=self.kwargs.get('contract_id'))
        serializer.save(contract=contract)


class ContractDocumentViewSet(viewsets.ModelViewSet):
    queryset = ContractDocument.objects.all()
    serializer_class = ContractDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        contract_id = self.kwargs.get('contract_id')
        return self.queryset.filter(contract_id=contract_id)

    def perform_create(self, serializer):
        contract = get_object_or_404(Contract, id=self.kwargs.get('contract_id'))
        serializer.save(contract=contract, uploaded_by=self.request.user)