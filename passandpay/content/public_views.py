from django.contrib import messages
from django.shortcuts import redirect, render

from trucks.models import TruckType

from .models import FAQ, Banner, ContactMessage, OfferPoster, Testimonial


def home(request):
    context = {
        "banners": Banner.objects.live(),
        "truck_types": TruckType.objects.filter(is_active=True),
        "offers": OfferPoster.objects.live(),
        "testimonials": Testimonial.objects.filter(is_active=True),
        "faqs": FAQ.objects.filter(is_active=True)[:6],
    }
    return render(request, "public/home.html", context)


def how_it_works(request):
    return render(request, "public/how_it_works.html")


def services(request):
    return render(request, "public/services.html", {"truck_types": TruckType.objects.filter(is_active=True)})


def pricing(request):
    return render(request, "public/pricing.html", {"truck_types": TruckType.objects.filter(is_active=True)})


def about(request):
    return render(request, "public/about.html", {"testimonials": Testimonial.objects.filter(is_active=True)})


def contact(request):
    if request.method == "POST":
        ContactMessage.objects.create(
            name=request.POST.get("name", "").strip(),
            email=request.POST.get("email", "").strip(),
            subject=request.POST.get("subject", "").strip(),
            message=request.POST.get("message", "").strip(),
        )
        messages.success(request, "Thanks! We'll get back to you within one business day.")
        return redirect("public:contact")
    return render(request, "public/contact.html", {"faqs": FAQ.objects.filter(is_active=True)})
