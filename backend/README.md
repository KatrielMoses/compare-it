# Compare-It Backend

This is the backend server for the Compare-It price comparison website. It provides web scraping functionality for Zepto, Blinkit, and SwiggyMart.

## Features

- Real-time price comparison across multiple Indian e-commerce platforms
- Caching system to improve response times and reduce load on e-commerce sites
- Rate limiting to prevent abuse
- TypeScript for better type safety and development experience
- Puppeteer for reliable web scraping

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Chrome/Chromium (for Puppeteer)

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

The server will start on port 3001 by default. You can change this by setting the `PORT` environment variable.

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

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per hour per IP address
- Cached results are served when available (1-hour cache duration)

## Development

- `npm run dev`: Start development server with hot-reload
- `npm run build`: Build TypeScript code
- `npm start`: Start production server

## Error Handling

The API implements proper error handling:
- Invalid requests return 400 status code
- Rate limit exceeded returns 429 status code
- Server errors return 500 status code
- All errors include a descriptive message

## Production Deployment

For production deployment:
1. Build the TypeScript code
2. Set appropriate environment variables
3. Use a process manager like PM2 or deploy to a platform like Render.com

## Environment Variables

- `PORT`: Server port (default: 3001)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 