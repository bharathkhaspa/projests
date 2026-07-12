from django.db import models


class State(models.Model):
    name = models.CharField(max_length=80, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class District(models.Model):
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name="districts")
    name = models.CharField(max_length=120)

    class Meta:
        ordering = ["name"]
        unique_together = ("state", "name")

    def __str__(self):
        return f"{self.name}, {self.state.name}"


class Location(models.Model):
    """
    A searchable place anywhere in India — town/city/village + PIN code.

    Designed for the full India Post PIN-code dataset (~155k rows). The
    `search_text` denormalised column is indexed so autocomplete stays fast
    regardless of dataset size.
    """

    name = models.CharField(max_length=160)
    city = models.CharField(max_length=120, blank=True)
    district = models.ForeignKey(
        District, on_delete=models.SET_NULL, null=True, blank=True, related_name="locations"
    )
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name="locations")
    pincode = models.CharField(max_length=6, blank=True, db_index=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    search_text = models.CharField(max_length=400, db_index=True, blank=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["search_text"]),
            models.Index(fields=["pincode"]),
        ]

    def save(self, *args, **kwargs):
        bits = [self.name, self.city, self.pincode]
        if self.district_id:
            bits.append(self.district.name)
        if self.state_id:
            bits.append(self.state.name)
        self.search_text = " ".join(b for b in bits if b).lower()
        super().save(*args, **kwargs)

    @property
    def label(self):
        parts = [self.name]
        if self.city and self.city != self.name:
            parts.append(self.city)
        if self.district_id:
            parts.append(self.district.name)
        if self.state_id:
            parts.append(self.state.name)
        base = ", ".join(parts)
        return f"{base} - {self.pincode}" if self.pincode else base

    @property
    def short_label(self):
        place = self.city or self.name
        return f"{place}, {self.state.name}" if self.state_id else place

    def __str__(self):
        return self.label
