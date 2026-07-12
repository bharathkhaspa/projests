from django.db import models
from django.utils import timezone


class ActiveQuerySet(models.QuerySet):
    """Filter to records that are simply marked active."""

    def live(self):
        return self.filter(is_active=True)


class TimeWindowQuerySet(models.QuerySet):
    """Filter to records that are active and within their optional date window."""

    def live(self):
        now = timezone.now()
        return self.filter(is_active=True).filter(
            models.Q(start_at__isnull=True) | models.Q(start_at__lte=now)
        ).filter(models.Q(end_at__isnull=True) | models.Q(end_at__gte=now))


class Banner(models.Model):
    """Rotating hero slide on the home page carousel."""

    heading = models.CharField(max_length=120)
    subheading = models.CharField(max_length=240, blank=True)
    image = models.ImageField(upload_to="banners/", blank=True, null=True)
    image_url = models.URLField(blank=True, help_text="Used if no image file is uploaded")
    button_text = models.CharField(max_length=40, blank=True)
    button_link = models.CharField(max_length=300, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    objects = ActiveQuerySet.as_manager()

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.heading

    @property
    def display_image(self):
        return self.image.url if self.image else self.image_url


class Advertisement(models.Model):
    """A placed advertisement banner rendered in a named slot on the site."""

    class Slot(models.TextChoices):
        HOME_TOP = "home_top", "Home — top"
        HOME_MID = "home_mid", "Home — middle"
        SIDEBAR = "sidebar", "Dashboard sidebar"
        BOOKING_PAGE = "booking_page", "Booking page"

    title = models.CharField(max_length=120)
    image = models.ImageField(upload_to="ads/", blank=True, null=True)
    image_url = models.URLField(blank=True)
    link_url = models.CharField(max_length=300, blank=True)
    slot = models.CharField(max_length=30, choices=Slot.choices, default=Slot.HOME_MID)
    start_at = models.DateTimeField(null=True, blank=True)
    end_at = models.DateTimeField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    objects = TimeWindowQuerySet.as_manager()

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.title} [{self.get_slot_display()}]"

    @property
    def display_image(self):
        return self.image.url if self.image else self.image_url


class OfferPoster(models.Model):
    """Promotional offer / poster shown in the offers strip."""

    title = models.CharField(max_length=120)
    description = models.CharField(max_length=240, blank=True)
    offer_text = models.CharField(max_length=60, blank=True, help_text="e.g. 'Flat 20% off'")
    image = models.ImageField(upload_to="offers/", blank=True, null=True)
    image_url = models.URLField(blank=True)
    link_url = models.CharField(max_length=300, blank=True)
    start_at = models.DateTimeField(null=True, blank=True)
    end_at = models.DateTimeField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    objects = TimeWindowQuerySet.as_manager()

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title

    @property
    def display_image(self):
        return self.image.url if self.image else self.image_url


class SiteContent(models.Model):
    """
    A key-based editable content block. Any text/value on the public site that
    the admin team may want to change lives here and is rendered dynamically.
    """

    key = models.SlugField(max_length=80, unique=True, help_text="e.g. hero_title, about_text, footer_text")
    label = models.CharField(max_length=120, help_text="Friendly name shown to the admin team")
    value = models.TextField(blank=True)
    notes = models.CharField(max_length=200, blank=True, help_text="Where this appears on the site")

    class Meta:
        ordering = ["key"]
        verbose_name = "Site content block"

    def __str__(self):
        return self.label or self.key


class Testimonial(models.Model):
    name = models.CharField(max_length=80)
    role = models.CharField(max_length=120, blank=True)
    quote = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.name} — {self.rating}★"


class FAQ(models.Model):
    question = models.CharField(max_length=200)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"

    def __str__(self):
        return self.question


class ContactMessage(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=160, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} — {self.subject or 'Enquiry'}"
