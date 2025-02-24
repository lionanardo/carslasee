import os
import tkinter as tk
from tkinter import filedialog, messagebox
from tkinterdnd2 import TkinterDnD, DND_FILES
from PIL import Image, ImageTk
from django.core.files import File

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django

django.setup()
from home.models import Car, Photo


class PhotoUploadApp(TkinterDnD.Tk):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.title("Photo Upload and Reordering")
        self.geometry("1200x800")
        self.configure(bg="#f0f4f7")

        title_label = tk.Label(self, text="Car Photo Manager", font=("Helvetica", 16, "bold"), bg="#f0f4f7")
        title_label.pack(pady=20)

        self.car_var = tk.StringVar(self)
        self.car_var.set("Select Car")

        cars = self.get_cars()
        self.car_dropdown = tk.OptionMenu(self, self.car_var, *cars, command=self.load_car_photos)
        self.car_dropdown.config(font=("Helvetica", 12), bg="white", width=30)
        self.car_dropdown.pack(pady=10)

        button_frame = tk.Frame(self, bg="#f0f4f7")
        button_frame.pack(pady=15)

        upload_button = tk.Button(button_frame, text="Upload Photos", command=self.upload_photos, font=("Helvetica", 12), bg="#4CAF50", fg="white")
        upload_button.grid(row=0, column=0, padx=10)

        save_button = tk.Button(button_frame, text="Save Photos to Database", command=self.save_photos_to_db, font=("Helvetica", 12), bg="#2196F3", fg="white")
        save_button.grid(row=0, column=1, padx=10)

        delete_button = tk.Button(button_frame, text="Delete Selected Photo", command=self.delete_photo, font=("Helvetica", 12), bg="#F44336", fg="white")
        delete_button.grid(row=0, column=2, padx=10)

        self.drop_area = tk.Label(self, text="Drag and Drop Photos Here", font=("Helvetica", 14), bg="#f0f4f7", fg="gray", relief="solid", width=40, height=2)
        self.drop_area.pack(pady=10)
        self.drop_area.drop_target_register(DND_FILES)
        self.drop_area.dnd_bind('<<Drop>>', self.on_drop)

        self.canvas = tk.Canvas(self, bg="#f0f4f7", highlightthickness=0)
        self.canvas.pack(fill=tk.BOTH, expand=True)
        self.photo_frame = tk.Frame(self.canvas, bg="#f0f4f7")
        self.canvas.create_window((0, 0), window=self.photo_frame, anchor="nw")

        self.photos = []
        self.labels = []
        self.thumbnail_size = 100
        self.columns = 8
        self.selected_label = None

        self.scrollbar = tk.Scrollbar(self, orient="vertical", command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        self.scrollbar.pack(side="right", fill="y")

        self.statistics_label = tk.Label(self, text="Photos: 0", font=("Helvetica", 12), bg="#f0f4f7")
        self.statistics_label.pack(pady=10)

        self.bind("<Configure>", self.on_resize)

    def get_cars(self):
        cars = Car.objects.all()
        self.car_dict = {f"{car.mark} {car.model}": car for car in cars}
        return list(self.car_dict.keys())

    def upload_photos(self):
        file_paths = filedialog.askopenfilenames(title="Select Photos", filetypes=[("Image Files", "*.jpg;*.jpeg;*.png;*.gif;*.bmp;*.tiff;*.webp")])

        for file_path in file_paths:
            if file_path not in self.photos:
                self.photos.append(file_path)
                self.display_image_preview(file_path)

    def on_drop(self, event):
        file_paths = event.data.split()
        for file_path in file_paths:
            if file_path.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp')) and file_path not in self.photos:
                self.photos.append(file_path)
                self.display_image_preview(file_path)

    def load_car_photos(self, car_name):
        self.clear_photos()
        self.photos = []

        selected_car = self.car_dict.get(car_name)
        if selected_car:
            photo_records = Photo.objects.filter(car=selected_car)
            for photo_record in photo_records:
                self.photos.append(photo_record.image.path)
                self.display_image_preview(photo_record.image.path)

    def display_image_preview(self, file_path):
        img = Image.open(file_path)
        img.thumbnail((self.thumbnail_size, self.thumbnail_size))
        img_tk = ImageTk.PhotoImage(img)

        label = tk.Label(self.photo_frame, image=img_tk, bd=1, relief="solid", width=self.thumbnail_size + 10, height=self.thumbnail_size + 10, bg="white")
        label.image = img_tk
        label.bind("<Button-1>", lambda e, lbl=label: self.on_photo_click(lbl))

        label.grid(row=len(self.labels) // self.columns, column=len(self.labels) % self.columns, padx=5, pady=5)
        self.labels.append(label)
        self.update_statistics()

    def on_photo_click(self, label):
        if self.selected_label:
            idx1 = self.labels.index(self.selected_label)
            idx2 = self.labels.index(label)

            self.photos[idx1], self.photos[idx2] = self.photos[idx2], self.photos[idx1]
            self.selected_label.config(bg="white")
            self.update_label_image(self.selected_label, self.photos[idx1])
            self.update_label_image(label, self.photos[idx2])

            self.selected_label = None
        else:
            self.selected_label = label
            label.config(bg="#cce7ff")

    def delete_photo(self):
        if self.selected_label:
            idx = self.labels.index(self.selected_label)
            self.photos.pop(idx)
            self.selected_label.destroy()
            self.labels.pop(idx)
            self.selected_label = None
            self.update_statistics()
        else:
            messagebox.showwarning("Warning", "No photo selected to delete!")

    def update_label_image(self, label, file_path):
        img = Image.open(file_path)
        img.thumbnail((self.thumbnail_size, self.thumbnail_size))
        img_tk = ImageTk.PhotoImage(img)
        label.config(image=img_tk)
        label.image = img_tk

    def clear_photos(self):
        for label in self.labels:
            label.destroy()
        self.labels.clear()

    def save_photos_to_db(self):
        selected_car_name = self.car_var.get()
        selected_car = self.car_dict.get(selected_car_name)

        if selected_car:
            existing_photos = list(Photo.objects.filter(car=selected_car).order_by('order'))
            db_photos_count = len(existing_photos)
            script_photos_count = len(self.photos)

            # Update existing photo records if possible
            for idx, photo_path in enumerate(self.photos):
                if idx < db_photos_count:
                    # Update existing record
                    existing_photo = existing_photos[idx]
                    if existing_photo.image.path != photo_path:
                        with open(photo_path, 'rb') as f:
                            existing_photo.image.save(os.path.basename(photo_path), File(f), save=True)
                    existing_photo.order = idx
                    existing_photo.save()
                else:
                    # Add new photo record
                    with open(photo_path, 'rb') as f:
                        new_photo = Photo(car=selected_car, order=idx)
                        new_photo.image.save(os.path.basename(photo_path), File(f), save=True)

            # Delete extra photos from the database if script photos are fewer
            if script_photos_count < db_photos_count:
                for photo_to_delete in existing_photos[script_photos_count:]:
                    photo_to_delete.delete()

            messagebox.showinfo("Success", "Photos saved/updated in the database successfully.")
        else:
            messagebox.showwarning("Warning", "Please select a car first.")

    def update_statistics(self):
        photo_count = len(self.photos)
        self.statistics_label.config(text=f"Photos: {photo_count}")

    def on_resize(self, event):
        width = self.canvas.winfo_width()
        new_columns = max(1, width // (self.thumbnail_size + 15))
        if new_columns != self.columns:
            self.columns = new_columns
            self.rearrange_photos()

    def rearrange_photos(self):
        for idx, label in enumerate(self.labels):
            row = idx // self.columns
            col = idx % self.columns
            label.grid(row=row, column=col, padx=5, pady=5)


if __name__ == "__main__":
    app = PhotoUploadApp()
    app.mainloop()
