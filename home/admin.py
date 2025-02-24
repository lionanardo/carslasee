from django.contrib import admin
from django.contrib import messages
from .models import Car, Photo

class PhotoInline(admin.TabularInline):
    model = Photo
    extra = 1
    fields = ('image', 'order')  # Display the image and order fields
    ordering = ('order',)  # Ensure photos are ordered by 'order' field

class CarAdmin(admin.ModelAdmin):
    list_display = ('mark', 'model', 'price', 'miles', 'year', 'fuel_type', 'transmission', 'drive_type', 'condition', 'engine_size', 'doors', 'cylinders', 'color', 'vin')
    search_fields = ('mark', 'model', 'vin')
    list_filter = ('fuel_type', 'transmission', 'drive_type', 'condition', 'year')
    inlines = [PhotoInline]  # Add PhotoInline to allow photo uploads

    # Custom admin action to delete all photos for selected cars
    def delete_all_photos(self, request, queryset):
        total_photos_deleted = 0
        for car in queryset:
            photos = Photo.objects.filter(car=car)
            total_photos_deleted += photos.count()
            photos.delete()
        self.message_user(
            request,
            f"Successfully deleted {total_photos_deleted} photos from selected cars.",
            messages.SUCCESS
        )

    delete_all_photos.short_description = "Delete all photos of selected cars"

    actions = ['delete_all_photos']

# Register the Car model with the customized CarAdmin
admin.site.register(Car, CarAdmin)
