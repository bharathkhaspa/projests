from django.urls import path

from . import views

app_name = "shipper"

urlpatterns = [
    path("", views.shipper_dashboard, name="dashboard"),
    path("book/", views.book, name="book"),
    path("fare-estimate/", views.fare_estimate, name="fare_estimate"),
    path("bookings/", views.my_bookings, name="bookings"),
    path("bookings/<int:pk>/cancel/", views.cancel_booking, name="cancel"),
    path("tracking/", views.tracking, name="tracking"),
    path("tracking/<int:pk>/", views.tracking_detail, name="tracking_detail"),
]
