from django.urls import path

from . import views

app_name = "payments"

urlpatterns = [
    path("", views.payments_list, name="list"),
    path("<int:pk>/pay/", views.pay, name="pay"),
    path("<int:pk>/invoice/", views.invoice, name="invoice"),
    path("<int:pk>/rate/", views.rate, name="rate"),
]
