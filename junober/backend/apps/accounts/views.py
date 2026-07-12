from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()


def issue_tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class RegisterView(generics.CreateAPIView):
    """Create an account and return tokens so the client is logged in immediately."""

    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = issue_tokens_for(user)
        return Response(
            {"user": UserSerializer(user).data, **tokens},
            status=status.HTTP_201_CREATED,
        )


class MeView(generics.RetrieveUpdateAPIView):
    """GET to read the current user, PATCH to update first_name/last_name/phone."""

    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    http_method_names = ("get", "patch", "head", "options")

    def get_object(self):
        return self.request.user


class PasswordChangeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password changed."}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """Always returns 200 to avoid leaking whether an email exists."""

    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email__iexact=email, is_active=True)
        except User.DoesNotExist:
            user = None

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend = getattr(settings, "FRONTEND_URL", "http://localhost:5174")
            reset_url = f"{frontend}/reset-password?uid={uid}&token={token}"
            send_mail(
                subject="Reset your JunOber password",
                message=(
                    "We received a request to reset your password.\n\n"
                    f"Open this link to set a new one:\n{reset_url}\n\n"
                    "This link expires in 3 days. If you didn't request this, you can ignore the email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        return Response(
            {"detail": "If that email exists, a reset link has been sent."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response(
                {"detail": "Invalid reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response(
            {"detail": "Password reset successful."}, status=status.HTTP_200_OK
        )
