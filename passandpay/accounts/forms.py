from django import forms
from django.contrib.auth.forms import AuthenticationForm

from .models import User


class EmailAuthenticationForm(AuthenticationForm):
    """Login by email (stored as username) + password."""

    username = forms.CharField(label="Email", widget=forms.EmailInput(attrs={"class": "form-control form-control-lg", "placeholder": "you@example.com", "autofocus": True}))
    password = forms.CharField(label="Password", widget=forms.PasswordInput(attrs={"class": "form-control form-control-lg", "placeholder": "••••••••"}))


class SignupForm(forms.ModelForm):
    full_name = forms.CharField(max_length=120, widget=forms.TextInput(attrs={"class": "form-control form-control-lg", "placeholder": "e.g. Ravi Kumar"}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={"class": "form-control form-control-lg", "placeholder": "Choose a password"}), min_length=6)
    role = forms.ChoiceField(
        choices=[(User.Role.SHIPPER, "Shipper"), (User.Role.TRANSPORTER, "Transporter")],
        widget=forms.RadioSelect,
        initial=User.Role.SHIPPER,
    )

    class Meta:
        model = User
        fields = ["email", "phone", "company", "city"]
        widgets = {
            "email": forms.EmailInput(attrs={"class": "form-control form-control-lg", "placeholder": "you@example.com"}),
            "phone": forms.TextInput(attrs={"class": "form-control form-control-lg", "placeholder": "+91 90000 00000"}),
            "company": forms.TextInput(attrs={"class": "form-control form-control-lg", "placeholder": "Company / fleet name (optional)"}),
            "city": forms.TextInput(attrs={"class": "form-control form-control-lg", "placeholder": "Base city"}),
        }

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
            raise forms.ValidationError("An account with this email already exists.")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        email = self.cleaned_data["email"]
        user.username = email
        user.email = email
        user.role = self.cleaned_data["role"]
        names = self.cleaned_data["full_name"].split(" ", 1)
        user.first_name = names[0]
        user.last_name = names[1] if len(names) > 1 else ""
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user


class ShipperProfileForm(forms.ModelForm):
    class Meta:
        from .models import ShipperProfile
        model = ShipperProfile
        fields = ["gst_number", "address", "pan_document", "gst_document"]
        widgets = {
            "gst_number": forms.TextInput(attrs={"class": "form-control"}),
            "address": forms.Textarea(attrs={"class": "form-control", "rows": 3}),
        }


class TransporterProfileForm(forms.ModelForm):
    class Meta:
        from .models import TransporterProfile
        model = TransporterProfile
        fields = ["fleet_name", "address", "license_document", "aadhaar_document"]
        widgets = {
            "fleet_name": forms.TextInput(attrs={"class": "form-control"}),
            "address": forms.Textarea(attrs={"class": "form-control", "rows": 3}),
        }
