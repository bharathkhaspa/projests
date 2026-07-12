from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.shortcuts import redirect, render
from django.urls import reverse

from .forms import EmailAuthenticationForm, ShipperProfileForm, SignupForm, TransporterProfileForm
from .models import ShipperProfile, TransporterProfile, User


def dashboard_url_for(user) -> str:
    if user.is_superuser or user.role == User.Role.ADMIN:
        return reverse("admin:index")
    if user.role == User.Role.TRANSPORTER:
        return reverse("transporter:dashboard")
    return reverse("shipper:dashboard")


class EmailLoginView(LoginView):
    template_name = "accounts/login.html"
    form_class = EmailAuthenticationForm
    redirect_authenticated_user = True

    def get_success_url(self):
        return dashboard_url_for(self.request.user)


@login_required
def redirect_after_login(request):
    return redirect(dashboard_url_for(request.user))


def signup_view(request):
    if request.user.is_authenticated:
        return redirect(dashboard_url_for(request.user))

    form = SignupForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        if user.role == User.Role.SHIPPER:
            ShipperProfile.objects.get_or_create(user=user)
        else:
            TransporterProfile.objects.get_or_create(user=user)
        login(request, user)
        messages.success(request, f"Welcome aboard, {user.first_name or 'there'}! Your account is ready.")
        return redirect(dashboard_url_for(user))

    return render(request, "accounts/signup.html", {"form": form})


def logout_view(request):
    logout(request)
    messages.info(request, "You have been signed out.")
    return redirect("public:home")


@login_required
def profile_view(request):
    user = request.user
    is_transporter = user.role == User.Role.TRANSPORTER
    if is_transporter:
        profile, _ = TransporterProfile.objects.get_or_create(user=user)
        form_class = TransporterProfileForm
    else:
        profile, _ = ShipperProfile.objects.get_or_create(user=user)
        form_class = ShipperProfileForm

    form = form_class(request.POST or None, request.FILES or None, instance=profile)
    if request.method == "POST" and form.is_valid():
        form.save()
        if not user.is_verified:
            messages.success(request, "Documents submitted — your account is now pending verification.")
        else:
            messages.success(request, "Profile updated.")
        return redirect("accounts:profile")

    return render(
        request,
        "accounts/profile.html",
        {"profile_form": form, "is_transporter": is_transporter, "profile": profile},
    )
