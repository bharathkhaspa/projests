from django.urls import path

from . import views

app_name = "transporter"

urlpatterns = [
    path("", views.transporter_dashboard, name="dashboard"),
    path("loads/", views.available_loads, name="loads"),
    path("loads/<int:pk>/accept/", views.accept_load, name="accept"),
    path("trips/", views.active_trips, name="trips"),
    path("trips/<int:pk>/advance/", views.advance_status, name="advance"),
    path("trucks/", views.my_trucks, name="trucks"),
    path("earnings/", views.earnings, name="earnings"),
]
