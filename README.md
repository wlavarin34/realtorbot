# Puppeteer Web Scraping Feature

This feature uses Puppeteer with NodeJS and TypeScript to scrape home listings from top home listing websites like Zillow. It fetches the listings, extracts relevant details, and saves them as JSON. You can test this feature locally using Postman.

## Prerequisites

- NodeJS installed on your machine
- Postman for API testing

## Setup

1. **Clone the repository:**
    ```bash
    git clone [repository_url]
    ```

2. **Navigate to the project directory:**
    ```bash
    cd [project_directory]
    ```

3. **Install dependencies:**
    ```bash
    npm install
    ```

## Running the Feature Locally

1. **Start the server:**
    ```bash
    npm start
    ```

2. **Open Postman.**

3. **Set the request method to `POST`.**

4. **Enter the following URL:**
    ```
    http://localhost:3000/scrape
    ```

5. **Set the request body to `raw` and `JSON (application/json)`.**

6. **Enter the Google search string in the request body:**
    ```json
    {
        "search: "Neptune NJ"
    }
    ```

7. **Send the request.**

## Testing with Postman

### Request

- **Method**: POST
- **URL**: `http://localhost:3000/scrape`
- **Body**: 
    ```json
    {
        "search": "Eatontown NJ"
    }
    ```

### Response

The API will return a JSON response with the scraped listings and details.

Example Response:
```json
{
    "listings": [
        {
            "image": "https://image.jpg",
            "price": "$500,000",
            "title": "123 Main St, City, State",
            "link": "https://link.com"
            "specs": {
            "bedrooms": "3",
            "baths": "2",
            "sqft": "2000",
                etc...
            }
            
        },
        ...
    ]
}
