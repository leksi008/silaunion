from rest_framework import viewsets, permissions, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Contract, ContractStage, ContractDocument
from .serializers import ContractSerializer, ContractStageSerializer, ContractDocumentSerializer, UserRegisterSerializer
from django.shortcuts import get_object_or_404


from django.http import JsonResponse
from django.http import HttpResponse
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from django.conf import settings
import os

import logging
from django.http import JsonResponse
from reportlab.pdfgen import canvas
from io import BytesIO


class UserRegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer

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

    @action(detail=True, methods=['get'], url_path='report-pdf')
    def report_pdf(self, request, pk=None):
        try:
            contract = self.get_object()
            stages = contract.stages.all()
            documents = contract.documents.all()

            font_path = os.path.join(settings.BASE_DIR, 'frontend', 'static', 'DejaVuSans.ttf')
            pdfmetrics.registerFont(TTFont('DejaVu', font_path))

            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4
            y = height - 40

            p.setFont("DejaVu", 10)

            def write(text, step=20):
                nonlocal y
                if y < 40:
                    p.showPage()
                    y = height - 40
                p.drawString(40, y, text)
                y -= step

            write(f"Отчет по договору №{contract.number}")
            write(f"Название: {contract.name}")
            write(f"Клиент: {contract.customer}")
            write(f"Период: {contract.start_date} — {contract.end_date}")
            write(f"Статус: {contract.status}")
            write("")

            write("Этапы договора:")
            completed_count = 0
            for stage in stages:
                status = 'Завершён' if stage.is_completed else ('В работе' if stage.actual_date else 'Не начат')
                write(f"- {stage.name} ({status})", step=16)
                write(f"  Описание: {stage.description}", step=16)
                write(f"  План: {stage.planned_date} | Факт: {stage.actual_date or '-'}", step=20)
                if stage.is_completed:
                    completed_count += 1

            total = stages.count()
            progress = int((completed_count / total) * 100) if total else 0
            write("")
            write(f"Прогресс: {completed_count} из {total} этапов ({progress}%)")
            write("")

            if documents.exists():
                write("Документы:")
                for doc in documents:
                    write(f"- {doc.name or doc.file.name}", step=16)

            p.showPage()
            p.save()
            buffer.seek(0)

            filename = f"contract_{contract.id}_report.pdf"
            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            return response
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


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

    @action(detail=True, methods=['patch'], url_path='complete')
    def mark_complete(self, request, contract_id=None, pk=None):
        stage = self.get_object()
        stage.is_completed = True
        stage.save()
        return Response({'status': 'stage marked as completed'})



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

