from rest_framework import serializers
from .models import User, Contract, ContractStage, ContractDocument
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.conf import settings

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'position', 'department', 'phone']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            position=validated_data.get('position', ''),
            department=validated_data.get('department', ''),
            phone=validated_data.get('phone', '')
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Добавьте кастомные поля, если нужно
        data['username'] = self.user.username
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'position', 'department', 'phone']


class ContractStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractStage
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        # Добавьте логи здесь, чтобы отследить данные
        print(f"Validation data: {attrs}")
        return super().validate(attrs)


class ContractDocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ContractDocument
        fields = '__all__'
        read_only_fields = ['uploaded_by', 'uploaded_at', 'file_url']

    def validate(self, attrs):
        # Если файл не был передан, выбрасываем ошибку
        if not attrs.get('file'):
            raise serializers.ValidationError("Файл не был загружен.")
        return attrs

    def get_file_url(self, obj):
        # Генерация полного URL для файла
        return obj.file.url if obj.file else None


class ContractSerializer(serializers.ModelSerializer):
    stages = ContractStageSerializer(many=True, read_only=True)
    documents = ContractDocumentSerializer(many=True, read_only=True)
    responsible = UserSerializer(read_only=True)
    responsible_name = serializers.SerializerMethodField()
    progress = serializers.IntegerField(read_only=True)

    class Meta:
        model = Contract
        fields = [
            'id', 'number', 'name', 'start_date', 'end_date',
            'customer', 'responsible', 'responsible_name', 'status',
            'created_at', 'updated_at', 'progress', 'stages', 'documents'
        ]
        read_only_fields = ['created_at', 'updated_at', 'progress']

    def get_responsible_name(self, obj):
        if obj.responsible:
            return f"{obj.responsible.last_name} {obj.responsible.first_name}"
        return ""

