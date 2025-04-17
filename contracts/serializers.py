# serializers.py
from rest_framework import serializers
from .models import User, Contract, ContractStage, ContractDocument
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['name'] = user.get_full_name()
        return token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'position', 'department', 'phone']


class ContractStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractStage
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ContractDocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model = ContractDocument
        fields = '__all__'
        read_only_fields = ['uploaded_by', 'uploaded_at']


class ContractSerializer(serializers.ModelSerializer):
    stages = ContractStageSerializer(many=True, read_only=True)
    documents = ContractDocumentSerializer(many=True, read_only=True)
    responsible = UserSerializer(read_only=True)
    progress = serializers.IntegerField(read_only=True)

    class Meta:
        model = Contract
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'progress']