from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    position = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    groups = models.ManyToManyField(
        Group,
        verbose_name=_('groups'),
        blank=True,
        help_text=_(
            'The groups this user belongs to. A user will get all permissions '
            'granted to each of their groups.'
        ),
        related_name="contracts_user_groups",
        related_query_name="contracts_user",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=_('user permissions'),
        blank=True,
        help_text=_('Specific permissions for this user.'),
        related_name="contracts_user_permissions",
        related_query_name="contracts_user",
    )

    def __str__(self):
        return f"{self.last_name} {self.first_name}"


class Contract(models.Model):
    CONTRACT_STATUS = (
        ('active', 'Активный'),
        ('completed', 'Завершен'),
        ('suspended', 'Приостановлен'),
    )

    number = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    customer = models.CharField(max_length=255)
    responsible = models.ForeignKey(User, on_delete=models.PROTECT, related_name='contracts')
    status = models.CharField(max_length=20, choices=CONTRACT_STATUS, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.number} - {self.name}"

    @property
    def progress(self):
        stages = self.stages.all()
        if not stages:
            return 0
        completed = stages.filter(is_completed=True).count()
        return int((completed / stages.count()) * 100)


class ContractStage(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name='stages')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    planned_date = models.DateField()
    actual_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['planned_date']

    def __str__(self):
        return f"{self.contract.number} - {self.name}"


class ContractDocument(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='contract_documents/')
    uploaded_by = models.ForeignKey(User, on_delete=models.PROTECT)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.contract.number} - {self.name}"


