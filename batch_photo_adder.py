import os
import re
from django.conf import settings
from django.core.files import File

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django

django.setup()
from home.models import Car, Photo


def add_photos_to_car(car_folder_path, car):
    """Adds photos to an existing car from its folder."""
    photos_folder_path = os.path.join(car_folder_path, 'photos')
    if os.path.exists(photos_folder_path):
        photo_files = [f for f in os.listdir(photos_folder_path) if f.endswith(('.jpg', '.jpeg', '.png'))]
        for order, photo_file in enumerate(photo_files):
            photo_path = os.path.join(photos_folder_path, photo_file)
            with open(photo_path, 'rb') as f:
                photo = Photo(car=car, order=order)
                photo.image.save(photo_file, File(f))
                photo.save()
                print(f"Added photo: {photo_file} to car: {car.mark} {car.model}")


def main(base_dir):
    """Finds existing cars in the database and adds photos to them."""
    print(f"Processing directory: {base_dir}")
    for car_folder in os.listdir(base_dir):
        car_folder_path = os.path.join(base_dir, car_folder)
        if os.path.isdir(car_folder_path):
            txt_file_path = None

            for item in os.listdir(car_folder_path):
                item_path = os.path.join(car_folder_path, item)
                if item.endswith('.txt'):
                    txt_file_path = item_path
                    break

            if txt_file_path:
                print(f"Parsing file: {txt_file_path}")
                car_info = parse_car_info(txt_file_path)
                vin = car_info.get('vin', 'Unknown')

                try:
                    car = Car.objects.get(vin=vin)
                    add_photos_to_car(car_folder_path, car)
                except Car.DoesNotExist:
                    print(f"No car found with VIN {vin}")


def parse_car_info(file_path):
    """Extracts the VIN from the text file."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as file:
            lines = file.readlines()

        for line in lines:
            if "Chassis" in line:
                return {'vin': line.split(':')[-1].strip()}

        return {'vin': 'Unknown'}
    except Exception as e:
        print(f"Error parsing file {file_path}: {e}")
        return {'vin': 'Unknown'}


if __name__ == "__main__":
    base_directory = 'C:/Users/ppap0/Desktop/cars'
    print("Starting process...")
    main(base_directory)
    print("Process completed.")
