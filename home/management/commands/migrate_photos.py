import os
import shutil
from django.core.management.base import BaseCommand
from django.conf import settings
from home.models import Car, Photo

def car_photo_upload_to(instance, filename):
    """Generate folder path based on car year, mark, and model."""
    folder_name = f"{instance.year}_{instance.mark}_{instance.model}".replace(" ", "_")
    return os.path.join('cars', folder_name, filename)

class Command(BaseCommand):
    help = 'Migrate car photos to their respective directories and create Photo instances.'

    def handle(self, *args, **kwargs):
        def get_unique_path(base_path, filename):
            """Generate a unique file path if a file with the same name exists."""
            counter = 1
            file_path = os.path.join(base_path, filename)
            file_name, file_extension = os.path.splitext(filename)
            while os.path.exists(file_path):
                new_filename = f"{file_name}({counter}){file_extension}"
                file_path = os.path.join(base_path, new_filename)
                counter += 1
            return file_path

        cars = Car.objects.all()
        for car in cars:
            # Handle the main car photo
            if car.photo:
                old_path = car.photo.path
                car_dir = os.path.join(settings.MEDIA_ROOT, f'{car.year}_{car.mark}_{car.model}'.replace(" ", "_"))
                new_main_photo_path = get_unique_path(car_dir, os.path.basename(old_path))

                # Ensure the car's main folder exists
                if not os.path.exists(car_dir):
                    os.makedirs(car_dir)
                    self.stdout.write(f'Created directory: {car_dir}')

                # Copy the main photo to the car's folder
                self.stdout.write(f'Copying main photo from {old_path} to {new_main_photo_path}')

                if os.path.exists(old_path):
                    shutil.copy(old_path, new_main_photo_path)
                    # Create a Photo instance for the copied image
                    photo_instance = Photo(car=car)
                    photo_instance.image.name = os.path.relpath(new_main_photo_path, settings.MEDIA_ROOT)
                    photo_instance.save()
                    self.stdout.write(f'Copied main photo to Photo instance for {car.mark} {car.model}')
                else:
                    self.stdout.write(f'Main photo not found for {car.mark} {car.model}')

            # Handle additional car photos
            photos = Photo.objects.filter(car=car)
            for photo in photos:
                old_path = photo.image.path
                car_photos_dir = os.path.join(settings.MEDIA_ROOT, f'{car.year}_{car.mark}_{car.model}'.replace(" ", "_"), 'car_photos')
                new_photo_path = get_unique_path(car_photos_dir, os.path.basename(old_path))

                # Ensure the car_photos subfolder exists
                if not os.path.exists(car_photos_dir):
                    os.makedirs(car_photos_dir)
                    self.stdout.write(f'Created car_photos directory: {car_photos_dir}')

                # Copy the additional photos to the car_photos folder
                self.stdout.write(f'Copying additional photo from {old_path} to {new_photo_path}')

                if os.path.exists(old_path):
                    shutil.copy(old_path, new_photo_path)
                    # Update the existing Photo instance with the new path
                    photo.image.name = os.path.relpath(new_photo_path, settings.MEDIA_ROOT)
                    photo.save()
                    self.stdout.write(f'Copied additional photo for {photo.car.mark} {photo.car.model}')
                else:
                    self.stdout.write(f'Additional photo not found for {photo.car.mark} {photo.car.model}')

        self.stdout.write(self.style.SUCCESS('Photos migrated and copied successfully'))
