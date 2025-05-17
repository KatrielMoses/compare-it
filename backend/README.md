# Compare-It Backend

This is the backend server for the Compare-It price comparison website. It provides web scraping functionality for Zepto, Blinkit, and SwiggyMart.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### POST /api/scrape
Scrapes product information from selected e-commerce platforms.

Request body:
```json
{
    "searchTerm": "string",
    "sources": ["zepto", "blinkit", "swiggymart"]
}
```

Response:
```json
{
    "success": true,
    "products": [
        {
            "id": "string",
            "name": "string",
            "price": number,
            "image": "string",
            "link": "string",
            "source": "zepto" | "blinkit" | "swiggymart"
        }
    ]
}
```

### GET /api/health
Health check endpoint.

Response:
```json
{
    "status": "healthy"
}
```

## Deployment

This backend is designed to be deployed on Render.com. Follow these steps:

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables: None required

## Environment Variables

- `PORT`: Server port (default: 3001)

## Development

- `npm run dev`: Start development server with hot-reload
- `npm run build`: Build TypeScript code
- `npm start`: Start production server 