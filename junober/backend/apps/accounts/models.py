from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("role", User.Role.CUSTOMER)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.SUPER_ADMIN)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Email-based auth with IAM roles for the super-admin panel."""

    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", "Super Admin"
        ADMIN = "admin", "Admin"
        SUPPORT = "support", "Customer Support"
        PRODUCTION = "production", "Production"
        MARKETING = "marketing", "Marketing"
        CUSTOMER = "customer", "Customer"

    username = None
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.CUSTOMER
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    @property
    def is_staff_role(self):
        return self.role in {
            self.Role.SUPER_ADMIN,
            self.Role.ADMIN,
            self.Role.SUPPORT,
            self.Role.PRODUCTION,
            self.Role.MARKETING,
        }
