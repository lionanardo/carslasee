from uuid import uuid4
import requests
import json
from django.contrib import admin
from django.shortcuts import render, get_object_or_404
from django.core.mail import send_mail
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.urls import reverse
from .models import Car
from django.db.models import Q
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import ssl
import smtplib



def index(request):
    # Fetch all unique car marks
    car_marks = list(Car.objects.values_list('mark', flat=True).distinct())

    # Fetch all car models, grouped by mark
    car_models = {}
    for mark in car_marks:
        models = list(Car.objects.filter(mark=mark).values_list('model', flat=True).distinct())
        car_models[mark] = models

    # Get query params for filtering cars (optional)
    car_mark = request.GET.get('mark')
    car_model = request.GET.get('model')

    # Filter cars based on search
    cars = Car.objects.all()
    if car_mark:
        cars = cars.filter(mark=car_mark)
    if car_model:
        cars = cars.filter(model=car_model)

    return render(request, 'pages/index.html', {
        'cars': cars,
        'car_marks': car_marks,
        'car_models': json.dumps(car_models),  # Serialize car_models as a JSON string
    })


def about_us(request):
    return render(request, 'pages/About_us.html')

def blog(request):
    return render(request, 'pages/Blog.html')

def blog_1(request):
    return render(request, 'pages/blog_1.html')

def blog_2(request):
    return render(request, 'pages/blog_2.html')

def financing(request):
    return render(request, 'pages/Financing.html')

def shipping(request):
    return render(request, 'pages/shipping.html')

def terms(request):
    return render(request, 'pages/terms.html')

def privacy(request):
    return render(request, 'pages/privacy.html')

def dealer_warranty(request):
    return render(request, 'pages/Dealer_warranty.html')

def contact_us(request):
    return render(request, 'pages/contact_us.html')


def car_detail(request, caryear, carmark, carmodel):
    # Get the car based on the year, mark, and model
    car = get_object_or_404(Car, year=caryear, mark=carmark, model=carmodel)
    photos = car.photos.all()
    return render(request, 'pages/car_detail.html', {'car': car, 'photos': photos})


def listings(request):
    cars = Car.objects.all()  # Start with all cars

    # Collect filter parameters from GET request
    mark = request.GET.get('make')  # Make filter
    model = request.GET.get('model')  # Model filter
    year = request.GET.get('year')  # Year filter
    miles = request.GET.get('miles')  # Miles filter
    body = request.GET.get('body')  # Body filter
    transmission = request.GET.get('transmission')  # Transmission filter
    sort_by = request.GET.get('sort_by')  # Sorting filter

    # Apply filters based on the selected values
    if mark:
        cars = cars.filter(mark__iexact=mark)  # Case-insensitive filter for make

    if model:
        cars = cars.filter(model__iexact=model)  # Case-insensitive filter for model

    if year:
        try:
            year = int(year)  # Ensure it's an integer
            cars = cars.filter(year__gte=year)  # Filter for cars made from the year onwards
        except ValueError:
            pass  # If the year is invalid, we do nothing

    if miles:
        if miles == "10-30k":
            cars = cars.filter(miles__gte=10000, miles__lt=30000)
        elif miles == "30-50k":
            cars = cars.filter(miles__gte=30000, miles__lt=50000)
        elif miles == "50k+":
            cars = cars.filter(miles__gte=50000)

    if body:
        cars = cars.filter(body__iexact=body)  # Case-insensitive filter for body type

    if transmission:
        cars = cars.filter(transmission__iexact=transmission)  # Filter by transmission type

    # Default sorting by year (ascending order)
    if not sort_by:
        cars = cars.order_by('year')  # Default to sorting by year in ascending order

    # Sorting the results based on user choice
    if sort_by:
        if sort_by == 'price':
            cars = cars.order_by('price')  # Sort by price in ascending order
        elif sort_by == 'year':
            cars = cars.order_by('year')  # Sort by year in ascending order
        elif sort_by == 'miles':
            cars = cars.order_by('miles')  # Sort by miles in ascending order

    # For debugging purposes (optional)
    print(cars.query)  # To view the generated SQL query

    # Return the filtered cars to the template
    return render(request, 'pages/listings.html', {'cars': cars})



def get_geolocation(ip):
    try:
        response = requests.get(f'http://ipinfo.io/{ip}/json')
        if response.status_code == 200:
            data = response.json()
            city = data.get('city', 'N/A')
            region = data.get('region', 'N/A')
            country = data.get('country', 'N/A')
            print(f"{city}, {region}, {country}")
            return f"{city}, {region}, {country}"
        return "Location not found"
    except Exception as e:
        return "Error retrieving location"

def get_client_ip(request):
    # Check X-Forwarded-For for proxies or use request.META for the IP
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
        print(ip)
    else:
        ip = request.META.get('REMOTE_ADDR')
        print(ip)
    return ip


def submit_info(request):
    print("🔹 submit_info() called")

    if request.method == 'POST':
        print("✅ Received a POST request")

        # Get form data
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        message = request.POST.get('message')
        car_link = request.POST.get('car_link')
        client_ip = get_client_ip(request)
        geolocation = "N/A, N/A"  # Replace with actual geolocation function if needed

        print(f"📩 Form Data - Name: {name}, Email: {email}, Phone: {phone}, Message: {message}")
        print(f"🌐 Car Link: {car_link}")
        print(f"🛰️ IP Address: {client_ip}, Geolocation: {geolocation}")

        # Set email parameters
        email_subject = 'New Inquiry Submitted'
        email_body = f"""
        Name: {name}
        Email: {email}
        Phone: {phone}
        Message: {message}
        Car Link: {car_link}
        Geolocation: {geolocation}
        IP Address: {client_ip}
        """

        # Create email message
        msg = MIMEMultipart()
        msg['From'] = 'sales@everydayautosales7.com'
        msg['To'] = 'sales@everydayautosales7.com'
        msg['Subject'] = email_subject
        msg.attach(MIMEText(email_body, 'plain'))

        # SMTP details (Hostinger example)
        smtp_host = 'smtp.hostinger.com'  # Correct SMTP server for Hostinger
        smtp_port = 465  # Port for SSL
        smtp_user = 'sales@everydayautosales7.com'  # Your email address
        smtp_password = 'vAJbo6m;P'  # Your email password

        # Create SSL context and disable certificate verification
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE

        try:
            # Connect to SMTP server with the updated SSL context
            with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
                server.login(smtp_user, smtp_password)
                server.sendmail(msg['From'], msg['To'], msg.as_string())
                print("📧 Email sent successfully")
        except smtplib.SMTPAuthenticationError:
            print("❌ Email sending failed: Authentication Error")
        except Exception as e:
            print(f"❌ Email sending failed: {e}")

        # Redirect user after submission
        redirect_url = reverse('index')
        print(f"🔄 Redirecting to: {redirect_url}")
        return JsonResponse({"redirect_url": redirect_url})  # Send JSON response with redirect


def submit_fin_form(request):
    if request.method == 'POST':
        # Personal Information
        car_link = request.POST.get('car_link1')
        first_name = request.POST.get('first-name')
        middle_name = request.POST.get('middle-name')
        last_name = request.POST.get('last-name')
        address_1 = request.POST.get('address-1')
        address_2 = request.POST.get('address-2')
        city = request.POST.get('city')
        state = request.POST.get('state')
        zip_code = request.POST.get('zip')
        social_security = request.POST.get('social-security')
        date_of_birth = request.POST.get('date-of-birth')
        drivers_license_number = request.POST.get('drivers-license-number')
        drivers_license_state = request.POST.get('drivers-license-state')
        drivers_license_exp = request.POST.get('drivers-license-exp')
        mobile_phone = request.POST.get('mobile-phone')
        home_phone = request.POST.get('home-phone')
        email = request.POST.get('email')

        # Residence Information
        years = request.POST.get('years')
        months = request.POST.get('months')
        residence_type = request.POST.get('residence-type')
        rent_mortgage = request.POST.get('rent-mortgage')

        # Employment Information
        employer = request.POST.get('employer')
        employer_type = request.POST.get('employer-type')
        monthly_income = request.POST.get('monthly-income')
        occupation = request.POST.get('occupation')
        employer_address_1 = request.POST.get('employer-address-1')
        employer_address_2 = request.POST.get('employer-address-2')
        employer_city = request.POST.get('employer-city')
        employer_state = request.POST.get('employer-state')
        employer_zip = request.POST.get('employer-zip')
        work_phone = request.POST.get('work-phone')
        employer_years = request.POST.get('employer-years')
        employer_months = request.POST.get('employer-months')

        # Get the user's IP and geolocation
        client_ip = get_client_ip(request)
        geolocation = get_geolocation(client_ip)

        # Email content
        email_subject = 'New Financial Application Submitted'
        email_body = f"""
        Car Link: {car_link}

        Personal Information:
        First Name: {first_name}
        Middle Name: {middle_name}
        Last Name: {last_name}
        Address 1: {address_1}
        Address 2: {address_2}
        City: {city}
        State: {state}
        Zip Code: {zip_code}
        Social Security: {social_security}
        Date of Birth: {date_of_birth}
        Drivers License Number: {drivers_license_number}
        Drivers License State: {drivers_license_state}
        Drivers License Exp: {drivers_license_exp}
        Mobile Phone: {mobile_phone}
        Home Phone: {home_phone}
        Email: {email}

        Residence Information:
        Years: {years}
        Months: {months}
        Residence Type: {residence_type}
        Rent/Mortgage: {rent_mortgage}

        Employment Information:
        Employer: {employer}
        Employer Type: {employer_type}
        Monthly Income: {monthly_income}
        Occupation: {occupation}
        Employer Address 1: {employer_address_1}
        Employer Address 2: {employer_address_2}
        Employer City: {employer_city}
        Employer State: {employer_state}
        Employer Zip: {employer_zip}
        Work Phone: {work_phone}
        Employer Years: {employer_years}
        Employer Months: {employer_months}

        Geolocation (based on IP): {geolocation}
        IP Address: {client_ip}
        """

        # Send email
        send_mail(
            email_subject,
            email_body,
            'sales@everydayautosales7.com',  # From email
            ['sales@everydayautosales7.com'],  # To email
            fail_silently=False,
        )

        return HttpResponse("Form submitted!")
    return render(request, 'pages/index.html')