from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    path("login/", views.EmailLoginView.as_view(), name="login"),
    path("signup/", views.signup_view, name="signup"),
    path("logout/", views.logout_view, name="logout"),
    path("go/", views.redirect_after_login, name="redirect_after_login"),
    path("profile/", views.profile_view, name="profile"),
]
