Puppeteer Web Scraping Feature
This feature uses Puppeteer with NodeJS and TypeScript to scrape home listings from top home listing websites like Zillow. It fetches the listings, extracts relevant details, and saves them as JSON. You can test this feature locally using Postman.

Prerequisites
NodeJS installed on your machine
Postman for API testing
Setup
Clone the repository:
bash
Copy code
git clone [repository_url]
Navigate to the project directory:
bash
Copy code
cd [project_directory]
Install dependencies:
Copy code
npm install
Running the Feature Locally
Start the server:
sql
Copy code
npm start
Open Postman.
Set the request method to POST.
Enter the following URL:
bash
Copy code
http://localhost:3000/scrape
Set the request body to raw and JSON (application/json).
Enter the Google search string in the request body:
json
Copy code
{
    "searchQuery": "top home listing websites"
}
Send the request.
Testing with Postman
Request
Method: POST
URL: http://localhost:3000/scrape
Body:
json
Copy code
{
    "searchQuery": "top home listing websites"
}
Response
The API will return a JSON response with the scraped listings and details.

Example Response:

json
Copy code
{
    "listings": [
        {
            "title": "Home Title",
            "price": "$500,000",
            "address": "123 Main St, City, State",
            "bedrooms": "3",
            "baths": "2",
            "sqft": "2000"
        },
        ...
    ]
}
Handling Pagination/Scrolling
The feature handles multiple pages by accessing and scraping one of the links in the listing. It uses pagination/scrolling features to get all the listings.

Save Content as JSON
The scraped listings and details are saved as JSON in the following format:

json
Copy code
{
    "listings": [
        {
            "title": "",
            "price": "",
            "address": "",
            "bedrooms": "",
            "baths": "",
            "sqft": "",
            "details": {
                ...
            }
        },
        ...
    ]
}
Notes
This is a basic example and might require further customization based on specific requirements.
Ensure that the Google search string provided is relevant to get accurate results.
