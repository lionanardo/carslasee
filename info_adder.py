import os
import re
from django.conf import settings
from django.core.files import File
from django.db import IntegrityError

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

from home.models import Car, Photo  # Import your models


def generate_stock_number(counter):
    """Generates a sequential stock number in the format E2539001, E2539002, etc."""
    return f"E2539{counter:03d}"  # Format: E2539 + 3-digit counter


def parse_car_info(file_path):
    """Extracts all details from 'Новый текстовый документ.txt' formatted file."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as file:
            lines = file.readlines()

        car_info = {}
        color_found = False  # Flag to track if color has been found

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Extract mileage
            if "Miles Shown" in line:
                miles_match = re.search(r'(\d{1,3}(?:,\d{3})*) Miles', line, re.IGNORECASE)
                car_info['miles'] = miles_match.group(1).replace(',', '') if miles_match else '0'

            # Extract chassis (VIN)
            elif "Chassis" in line:
                chassis = line.split(':')[-1].strip()
                car_info['vin'] = chassis

            # Extract transmission type
            elif "Transmission" in line:
                transmission_match = re.search(r'Transmission: (.+)', line, re.IGNORECASE)
                if transmission_match:
                    car_info['transmission'] = transmission_match.group(1).strip()

            # Extract paint color (look for "Repainted" or "Paint")
            if not color_found and ("Repainted" in line or "Paint" in line):
                color_match = re.search(r'Repainted (\w+)|Paint: (\w+)', line, re.IGNORECASE)
                if color_match:
                    car_info['color'] = color_match.group(1) or color_match.group(2)
                    color_found = True  # Stop further color extraction

            # Extract doors
            elif "Doors" in line:
                doors_match = re.search(r'(\d+) Doors', line, re.IGNORECASE)
                car_info['doors'] = doors_match.group(1) if doors_match else '2'  # Default to 2 doors if not found

            # Extract engine (cylinders)
            elif "ci" in line and "Engine" not in line:  # Exclude lines that mention 'Engine' explicitly
                engine_match = re.search(r'(\d+)\s?ci', line)
                car_info['cylinders'] = engine_match.group(1) if engine_match else '4'  # Default to 4 cylinders if not found

            # Extract price
            elif "$" in line:
                price_match = re.search(r'\$\s?([\d,]+)', line)
                car_info['price'] = price_match.group(1).replace(',', '') if price_match else '0.00'

        # Default values if missing
        car_info.setdefault('miles', '0')
        car_info.setdefault('transmission', 'Automatic')
        car_info.setdefault('color', 'Unknown')
        car_info.setdefault('vin', 'Unknown')
        car_info.setdefault('price', '0.00')
        car_info.setdefault('doors', '2')  # Default to 2 doors
        car_info.setdefault('cylinders', '4')  # Default to 4 cylinders

        return car_info
    except Exception as e:
        print(f"Error parsing file {file_path}: {e}")
        return {}


def extract_name_and_year(folder_name):
    """Extracts mark (brand), model, and year from folder names."""
    parts = folder_name.split()

    year = '2021'  # Default year
    mark = 'Unknown'
    model = 'Unknown'

    for i, part in enumerate(parts):
        if part.isdigit() and len(part) == 4:
            year = part
            mark = parts[i + 1] if i + 1 < len(parts) else 'Unknown'
            model = ' '.join(parts[i + 2:]) if i + 2 < len(parts) else 'Unknown'
            break

    if year == '2021':  # If no year is found, assume it's a modified/custom car
        mark = parts[0]
        model = ' '.join(parts[1:])

    return mark, model, year


def read_description_file(file_path):
    """Reads the content of the description file and extracts engine size."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as file:
            content = file.read()

        # Extract engine size (e.g., 1.9-Liter)
        engine_size_match = re.search(r'(\d+\.\d+)-Liter', content, re.IGNORECASE)
        engine_size = engine_size_match.group(1) if engine_size_match else 'N/A'

        return content, engine_size
    except Exception as e:
        print(f"Error reading description file {file_path}: {e}")
        return "", "N/A"


def create_car_from_info(car_info, mark, model, year, description, engine_size, stock_number, main_photo_path=None):
    """Saves the car info to the Django database and returns the Car instance."""
    try:
        car = Car(
            mark=mark,
            model=model,
            price=car_info.get('price', '0.00'),
            miles=car_info.get('miles', '0'),
            transmission=car_info.get('transmission', 'Automatic'),
            color=car_info.get('color', 'Unknown'),
            vin=car_info.get('vin', 'Unknown'),
            stock=stock_number,  # Save the generated stock number
            year=int(year) if year.isdigit() else 2021,
            doors=int(car_info.get('doors', '2')),  # Default to 2 doors
            cylinders=int(car_info.get('cylinders', '4')),
            information=description,  # Save the description
            engine_size=engine_size  # Save the engine size
        )

        # Save the main photo if provided
        if main_photo_path:
            with open(main_photo_path, 'rb') as f:
                car.photo.save(os.path.basename(main_photo_path), File(f))
                print(f"Main photo added: {main_photo_path}")

        car.save()
        print(f"Car saved: {car} (Stock: {stock_number})")
        return car
    except IntegrityError as e:
        print(f"Error saving car: {e}")
        return None


def main(base_dir):
    """Processes each car directory, extracting and saving details."""
    print(f"Processing directory: {base_dir}")
    counter = 1  # Initialize counter for stock numbers

    for car_folder in os.listdir(base_dir):
        car_folder_path = os.path.join(base_dir, car_folder)
        if os.path.isdir(car_folder_path):
            txt_file_path = None
            description_file_path = None
            main_photo_path = None
            additional_photo_paths = []

            for item in os.listdir(car_folder_path):
                item_path = os.path.join(car_folder_path, item)
                if item.endswith('.txt') and 'Новый текстовый документ' in item:
                    if '(2)' in item:  # Description file
                        description_file_path = item_path
                    else:  # Main info file
                        txt_file_path = item_path
                elif item.endswith(('.jpg', '.jpeg', '.png')):
                    if not main_photo_path:  # First image is treated as the main photo
                        main_photo_path = item_path
                    else:
                        additional_photo_paths.append(item_path)  # Collect additional image paths

            # Extract main car details
            car_info = {}
            if txt_file_path:
                print(f"Parsing file: {txt_file_path}")
                car_info.update(parse_car_info(txt_file_path))

            # Read description file and extract engine size
            description = ""
            engine_size = "N/A"
            if description_file_path:
                print(f"Reading description file: {description_file_path}")
                description, engine_size = read_description_file(description_file_path)

            # Extract mark, model, year from folder name
            mark, model, year = extract_name_and_year(car_folder)

            # Generate stock number
            stock_number = generate_stock_number(counter)
            counter += 1  # Increment counter for the next car

            # Save the car to the database with the main photo, description, and engine size
            car = create_car_from_info(car_info, mark, model, year, description, engine_size, stock_number, main_photo_path)

            # Save additional photos to the Photo model
            if car and additional_photo_paths:
                for order, photo_path in enumerate(additional_photo_paths):
                    with open(photo_path, 'rb') as f:
                        photo = Photo(car=car, order=order)
                        photo.image.save(os.path.basename(photo_path), File(f))
                        print(f"Additional photo added: {photo_path} (Order: {order})")


if __name__ == "__main__":
    base_directory = 'C:/Users/AVTO/Desktop/papka/cars/cars'
    print("Starting process...")
    main(base_directory)
    print("Process completed.")

