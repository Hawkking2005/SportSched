import requests
from bs4 import BeautifulSoup
import logging
from datetime import datetime
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ERPScraperTest:
    def __init__(self):
        self.session = requests.Session()
        self.base_url = "https://erp.cbit.org.in"
        # Store cookies and maintain session
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def test_connection(self):
        """Test if we can connect to the ERP"""
        try:
            response = self.session.get(self.base_url)
            logger.info(f"Connection test status code: {response.status_code}")
            logger.info("Response headers:")
            for key, value in response.headers.items():
                logger.info(f"{key}: {value}")
            
            # Parse the response to check the login form
            soup = BeautifulSoup(response.text, 'html.parser')
            logger.info("\nPage content analysis:")
            logger.info(f"Title: {soup.title.string if soup.title else 'No title found'}")
            
            # Look for forms
            forms = soup.find_all('form')
            logger.info(f"\nFound {len(forms)} forms on the page")
            for form in forms:
                logger.info(f"\nForm action: {form.get('action', 'No action specified')}")
                logger.info("Form inputs:")
                for input_field in form.find_all('input'):
                    logger.info(f"- {input_field.get('name', 'unnamed')}: type={input_field.get('type', 'unknown')}")
            
            return True
        except Exception as e:
            logger.error(f"Connection test failed: {str(e)}")
            return False

    def test_login_page(self, test_username="test", test_password="test"):
        """Test login page structure without actually logging in"""
        try:
            # First get the login page to capture any CSRF token
            response = self.session.get(f"{self.base_url}")
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for common CSRF token patterns
            csrf_token = None
            csrf_field = soup.find('input', {'name': ['csrf_token', '_csrf', 'csrfmiddlewaretoken']})
            if csrf_field:
                csrf_token = csrf_field.get('value')
                logger.info(f"Found CSRF token: {csrf_token}")
            
            # Prepare login data (don't actually submit)
            login_data = {
                'username': test_username,
                'password': test_password
            }
            if csrf_token:
                login_data['csrf_token'] = csrf_token
            
            logger.info("\nPotential login form structure:")
            logger.info(login_data)
            
            return True
        except Exception as e:
            logger.error(f"Login page test failed: {str(e)}")
            return False

    def test_login(self, username, password):
        """Test login with provided credentials"""
        try:
            # First get the login page to capture any tokens/cookies
            response = self.session.get(self.base_url)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find the login form and its action URL
            form = soup.find('form')
            if form:
                login_url = form.get('action', '')
                if login_url.startswith('./'):
                    login_url = self.base_url + login_url[1:]
                elif login_url.startswith('/'):
                    login_url = self.base_url + login_url
                elif not login_url:
                    login_url = self.base_url
                elif not login_url.startswith('http'):
                    login_url = self.base_url + '/' + login_url
            else:
                login_url = self.base_url
                
            logger.info(f"Attempting login at: {login_url}")
            
            # Get all form fields
            form_fields = {}
            if form:
                logger.info("\nFound form fields:")
                for input_field in form.find_all(['input', 'button']):
                    field_name = input_field.get('name')
                    field_type = input_field.get('type')
                    field_value = input_field.get('value')
                    if field_name:
                        logger.info(f"Field: {field_name}, Type: {field_type}, Value: {field_value}")
                        if field_type == 'hidden':
                            form_fields[field_name] = field_value
            
            # Prepare login data
            login_data = {
                'txtUserName': username,  # Try common username field names
                'username': username,
                'txtPassword': password,  # Try common password field names
                'password': password,
                'btnNext': 'Login',  # Include the submit button value
                **form_fields  # Include any hidden fields
            }
            
            logger.info("\nSending login data:")
            logger.info(json.dumps(login_data, indent=2))
            
            # Attempt login
            login_response = self.session.post(login_url, data=login_data, allow_redirects=True)
            logger.info(f"\nLogin response status: {login_response.status_code}")
            logger.info(f"Final URL after redirects: {login_response.url}")
            logger.info("\nResponse headers:")
            for key, value in login_response.headers.items():
                logger.info(f"{key}: {value}")
            
            # Save the response content for analysis
            self.save_page_content("login_response.html", login_response.text)
            
            # Try to detect if login was successful
            login_soup = BeautifulSoup(login_response.text, 'html.parser')
            logger.info(f"\nResponse page title: {login_soup.title.string if login_soup.title else 'No title'}")
            
            # Look for common success/failure indicators
            error_messages = login_soup.find_all(class_=['error', 'alert', 'message'])
            if error_messages:
                logger.info("\nFound messages on page:")
                for msg in error_messages:
                    logger.info(msg.text.strip())
            
            if login_response.url != self.base_url and "login" not in login_response.url.lower():
                logger.info("Login might be successful - redirected to new page")
                return True
            else:
                logger.info("Login might have failed - still on login page")
                return False
            
        except Exception as e:
            logger.error(f"Login test failed: {str(e)}")
            return False

    def try_access_timetable(self):
        """Try to access the timetable page"""
        try:
            # Common endpoints to try
            endpoints = [
                "/timetable",
                "/student/timetable",
                "/academic/timetable",
                "/dashboard"
            ]
            
            for endpoint in endpoints:
                url = self.base_url + endpoint
                logger.info(f"\nTrying to access: {url}")
                response = self.session.get(url)
                logger.info(f"Response status: {response.status_code}")
                
                if response.status_code == 200:
                    logger.info("Successfully accessed page")
                    self.save_page_content(f"page_{endpoint.replace('/', '_')}.html", response.text)
                    
                    # Try to find timetable data in the response
                    soup = BeautifulSoup(response.text, 'html.parser')
                    tables = soup.find_all('table')
                    if tables:
                        logger.info(f"Found {len(tables)} tables on the page")
                        for i, table in enumerate(tables):
                            logger.info(f"\nTable {i+1} structure:")
                            headers = table.find_all('th')
                            if headers:
                                logger.info("Headers: " + ", ".join([h.text.strip() for h in headers]))
                
        except Exception as e:
            logger.error(f"Timetable access failed: {str(e)}")

    def save_page_content(self, filename, content):
        """Save page content for analysis"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            logger.info(f"Saved response content to {filename}")
        except Exception as e:
            logger.error(f"Failed to save content: {str(e)}")

def main():
    scraper = ERPScraperTest()
    logger.info("Starting ERP scraper test...")
    
    # Test basic connection
    logger.info("\nTesting connection to ERP...")
    if scraper.test_connection():
        logger.info("Successfully connected to ERP")
    else:
        logger.error("Failed to connect to ERP")
        return
    
    # Test login page structure
    logger.info("\nAnalyzing login page structure...")
    if scraper.test_login_page():
        logger.info("Successfully analyzed login page")
    else:
        logger.error("Failed to analyze login page")
        return

    # Test login with provided credentials
    username = "160123737173P"
    password = "160123737173P"
    
    logger.info("\nTesting login...")
    if scraper.test_login(username, password):
        logger.info("Login test completed - attempting to access timetable")
        scraper.try_access_timetable()
    else:
        logger.error("Login test failed")

if __name__ == "__main__":
    main() 