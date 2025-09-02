# Mock Backend Server for News Management

This is a simple Express.js mock server that implements all the news management API endpoints for testing the NewtonBotics admin panel frontend.

## Quick Start

### 1. Install Dependencies

```bash
# Copy the package.json and install dependencies
cp mock-server-package.json package.json
npm install
```

### 2. Start the Mock Server

```bash
# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

The server will start on `http://localhost:3005`

### 3. Test the Endpoints

You can test the endpoints using curl or any API client:

```bash
# Health check
curl http://localhost:3005/api/health

# Get news categories (requires auth)
curl -H "Authorization: Bearer mock-token" http://localhost:3005/api/news/categories

# Get news articles (requires auth)
curl -H "Authorization: Bearer mock-token" http://localhost:3005/api/news
```

## Available Endpoints

### News Articles
- `GET /api/news` - List articles with filtering and pagination
- `POST /api/news` - Create new article
- `PUT /api/news/:id` - Update article
- `DELETE /api/news/:id` - Delete article

### News Categories
- `GET /api/news/categories` - List categories
- `POST /api/news/categories` - Create category
- `PUT /api/news/categories/:id` - Update category
- `DELETE /api/news/categories/:id` - Delete category

### Health Check
- `GET /api/health` - Server health status

## Authentication

The mock server accepts any Bearer token for authentication. You can use:
- `Bearer mock-token`
- `Bearer any-token-here`
- Any token that starts with "Bearer"

## Sample Data

The server comes with pre-loaded sample data:

### Sample Articles
1. **NewtonBotics Wins Regional Robotics Competition**
   - Published and featured
   - Category: Achievements
   - Tags: competition, robotics, achievement

2. **New Workshop Series: Introduction to AI and Machine Learning**
   - Draft status
   - Category: Workshops
   - Tags: workshop, ai, machine learning

### Sample Categories
1. **Achievements** - Team achievements and awards
2. **Workshops** - Workshop announcements and updates

## Testing with Frontend

1. Make sure your frontend is configured to use `http://localhost:3005` as the backend URL
2. Set the environment variable: `NEXT_PUBLIC_BACKEND_URL=http://localhost:3005`
3. Use any Bearer token for authentication in your frontend
4. The news management page should now work with real API calls

## API Response Format

All endpoints return responses in this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "details": {
      "errors": [
        {
          "field": "fieldName",
          "message": "Validation error message"
        }
      ]
    }
  }
}
```

## Features

- **CORS enabled** - Works with frontend applications
- **Authentication middleware** - Validates Bearer tokens
- **Input validation** - Validates required fields
- **Error handling** - Proper HTTP status codes and error messages
- **Pagination** - Supports limit and skip parameters
- **Filtering** - Filter by published status, featured status, category
- **Search** - Search in title, content, and tags
- **Data persistence** - Data persists in memory during server runtime

## Limitations

- **In-memory storage** - Data is lost when server restarts
- **Mock authentication** - No real JWT validation
- **No database** - Uses JavaScript arrays for storage
- **No file upload** - Featured images are URL strings only

## Production Implementation

When implementing the real backend, consider:

1. **Database integration** - Use MongoDB, PostgreSQL, or MySQL
2. **Real authentication** - Implement JWT token validation
3. **File upload** - Add image upload functionality
4. **Caching** - Implement Redis or similar for performance
5. **Logging** - Add proper logging and monitoring
6. **Security** - Add rate limiting, input sanitization, etc.
7. **Backup** - Implement data backup and recovery

## Troubleshooting

### Port Already in Use
If port 3005 is already in use, change the PORT variable in `mock-backend-server.js`:

```javascript
const PORT = 3006; // or any available port
```

### CORS Issues
The server includes CORS middleware, but if you have issues, you can configure it:

```javascript
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));
```

### Authentication Issues
Make sure your frontend is sending the Authorization header correctly:

```javascript
headers: {
  'Authorization': 'Bearer mock-token',
  'Content-Type': 'application/json'
}
```

## Development

To modify the mock server:

1. Edit `mock-backend-server.js`
2. Restart the server: `npm start`
3. Test your changes

The server uses nodemon for development, so changes will auto-restart the server.
