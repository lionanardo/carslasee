from django.contrib import admin
from .models import Car


class CarAdmin(admin.ModelAdmin):
    list_display = (
    'mark', 'model', 'price', 'miles', 'year', 'fuel_type', 'transmission', 'drive_type', 'condition', 'engine_size',
    'doors', 'cylinders', 'color', 'vin')
    search_fields = ('mark', 'model', 'vin')
    list_filter = ('fuel_type', 'transmission', 'drive_type', 'condition', 'year')


admin.site.register(Car, CarAdmin)

