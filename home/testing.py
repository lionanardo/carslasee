import os
import django
import tkinter as tk
from tkinter import filedialog, messagebox
from tkinterdnd2 import TkinterDnD, DND_FILES
from PIL import Image, ImageTk
from home.models import Car  # Import your Car model from your Django app

# Ensure Django settings are loaded
os.environ.setdefault('DJANGO_SETTINGS_MODULE',
                      'core.settings')  # Replace with your actual Django project name
django.setup()


class PhotoUploadApp(TkinterDnD.Tk):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.title("Photo Upload and Reordering")
        self.geometry("600x500")

        # Select car dropdown
        self.car_label = tk.Label(self, text="Select Car")
        self.car_label.pack(pady=10)

        self.car_var = tk.StringVar(self)

        # Fetch the list of cars
        cars = self.get_cars()

        # If there are cars, set the default value to the first car
        if cars:
            self.car_var.set(cars[0])  # Default to the first car
        else:
            self.car_var.set("No Cars Available")  # Default if no cars exist

        # Initialize the dropdown with the car names
        self.car_dropdown = tk.OptionMenu(self, self.car_var, *cars)
        self.car_dropdown.pack(pady=10)

        # Listbox to display the photos with previews
        self.photo_listbox = tk.Listbox(self, selectmode=tk.SINGLE, height=10)
        self.photo_listbox.pack(pady=20, padx=20, fill=tk.BOTH, expand=True)

        # Upload Button
        self.upload_button = tk.Button(self, text="Upload Photos", command=self.upload_photos)
        self.upload_button.pack(pady=10)

        # Set up the drag-and-drop area for photos
        self.drop_area = tk.Label(self, text="Drag and Drop Photos Here", relief="solid", width=50, height=5)
        self.drop_area.pack(pady=10)
        self.drop_area.drop_target_register(DND_FILES)
        self.drop_area.dnd_bind('<<Drop>>', self.on_drop)

        # Reorder Button
        self.reorder_button = tk.Button(self, text="Reorder Photos", command=self.reorder_photos)
        self.reorder_button.pack(pady=10)

        # Upload To Car Button
        self.upload_to_car_button = tk.Button(self, text="Upload to Car", command=self.upload_to_car)
        self.upload_to_car_button.pack(pady=10)

        self.selected_car = None
        self.photos = []

    def get_cars(self):
        """Fetch cars from the Django database and return a list of car names."""
        cars = Car.objects.all()  # Fetch cars from the database
        car_names = [f"{car.mark} {car.model}" for car in cars]  # List of car names
        self.car_dict = {f"{car.mark} {car.model}": car for car in cars}  # Mapping of car names to Car objects
        return car_names

    # Other methods like upload_photos, on_drop, etc.
