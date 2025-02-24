from bs4 import BeautifulSoup
import re


def remove_query_strings(file_path, output_path):
    # Read the HTML file
    with open(file_path, 'r', encoding='utf-8') as file:
        soup = BeautifulSoup(file, 'html.parser')

    # Find all tags with 'src' or 'href' attributes
    for tag in soup.find_all(['script', 'link', 'img', 'a']):  # Common tags with 'src' or 'href'
        for attr in ['src', 'href']:
            if tag.has_attr(attr):
                original_value = tag[attr]

                # Check if it has a static tag and query string
                static_match = re.match(r"{% static '(.*?)' %}", original_value)
                if static_match:
                    # Remove query string from the value
                    cleaned_path = static_match.group(1).split('?')[0]
                    tag[attr] = f"{{% static '{cleaned_path}' %}}"
                elif '?' in original_value:
                    # For non-static attributes, also clean query strings
                    tag[attr] = original_value.split('?')[0]

    # Write the modified HTML back to a file
    with open(output_path, 'w', encoding='utf-8') as file:
        file.write(str(soup))


# Example usage
input_file = 'footer.html'  # Path to your input HTML file
output_file = 'footer_example.html'  # Path to your output HTML file
remove_query_strings(input_file, output_file)
