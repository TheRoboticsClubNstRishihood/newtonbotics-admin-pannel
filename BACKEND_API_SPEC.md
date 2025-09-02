# News Management Backend API Specification

This document outlines the backend API endpoints required for the news management system in the NewtonBotics admin panel.

## Base URL
```
http://localhost:3005/api
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <access_token>
```

## News Articles Endpoints

### 1. GET /api/news - List News Articles

**Query Parameters:**
- `limit` (number, optional): Number of articles to return (default: 20)
- `skip` (number, optional): Number of articles to skip (default: 0)
- `isPublished` (boolean, optional): Filter by published status
- `isFeatured` (boolean, optional): Filter by featured status
- `categoryId` (string, optional): Filter by category ID
- `search` (string, optional): Search in title, content, and tags

**Example Request:**
```
GET /api/news?limit=20&skip=0&isPublished=true&isFeatured=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d5",
        "title": "NewtonBotics Wins Regional Robotics Competition",
        "content": "Our team has achieved remarkable success in the regional robotics competition...",
        "authorId": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "firstName": "Admin",
          "lastName": "User"
        },
        "categoryId": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d6",
          "name": "Achievements",
          "description": "Team achievements and awards"
        },
        "isPublished": true,
        "isFeatured": true,
        "featureOptions": {
          "showInNav": true,
          "navOrder": 1,
          "featuredImage": "https://example.com/featured-image.jpg"
        },
        "publishedAt": "2023-09-05T10:00:00.000Z",
        "viewCount": 150,
        "tags": ["competition", "robotics", "achievement"],
        "createdAt": "2023-09-05T08:00:00.000Z",
        "updatedAt": "2023-09-05T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 30,
      "limit": 20,
      "skip": 0,
      "hasMore": true
    }
  }
}
```

### 2. POST /api/news - Create News Article

**Request Body:**
```json
{
  "title": "New Workshop Series: Introduction to AI and Machine Learning",
  "content": "We are excited to announce our new workshop series focused on AI and Machine Learning fundamentals...",
  "authorId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "categoryId": "64f8a1b2c3d4e5f6a7b8c9d7",
  "isPublished": false,
  "featureOptions": {
    "showInNav": true,
    "navOrder": 2,
    "featuredImage": "https://example.com/ai-workshop.jpg"
  },
  "tags": ["workshop", "ai", "machine learning"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "News created",
  "data": {
    "item": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d8",
      "title": "New Workshop Series: Introduction to AI and Machine Learning",
      "content": "We are excited to announce our new workshop series focused on AI and Machine Learning fundamentals...",
      "authorId": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "firstName": "Admin",
        "lastName": "User"
      },
      "categoryId": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "name": "Workshops",
        "description": "Workshop announcements and updates"
      },
      "isPublished": false,
      "featureOptions": {
        "showInNav": true,
        "navOrder": 2,
        "featuredImage": "https://example.com/ai-workshop.jpg"
      },
      "viewCount": 0,
      "tags": ["workshop", "ai", "machine learning"],
      "createdAt": "2023-09-05T12:00:00.000Z",
      "updatedAt": "2023-09-05T12:00:00.000Z"
    }
  }
}
```

### 3. PUT /api/news/:id - Update News Article

**Request Body:**
```json
{
  "title": "Updated: New Workshop Series: Introduction to AI and Machine Learning",
  "isPublished": true,
  "publishedAt": "2023-09-05T12:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "News updated",
  "data": {
    "item": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d8",
      "title": "Updated: New Workshop Series: Introduction to AI and Machine Learning",
      "isPublished": true,
      "publishedAt": "2023-09-05T12:00:00.000Z",
      "updatedAt": "2023-09-05T12:30:00.000Z"
    }
  }
}
```

### 4. DELETE /api/news/:id - Delete News Article

**Response:**
```json
{
  "success": true,
  "message": "News deleted"
}
```

## News Categories Endpoints

### 1. GET /api/news/categories - List News Categories

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d6",
        "name": "Achievements",
        "description": "Team achievements and awards",
        "createdAt": "2023-09-01T08:00:00.000Z"
      },
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "name": "Workshops",
        "description": "Workshop announcements and updates",
        "createdAt": "2023-09-01T08:00:00.000Z"
      }
    ]
  }
}
```

### 2. POST /api/news/categories - Create News Category

**Request Body:**
```json
{
  "name": "Events",
  "description": "Upcoming events and announcements"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category created",
  "data": {
    "category": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d9",
      "name": "Events",
      "description": "Upcoming events and announcements",
      "createdAt": "2023-09-05T12:00:00.000Z"
    }
  }
}
```

### 3. PUT /api/news/categories/:id - Update News Category

**Request Body:**
```json
{
  "name": "Special Events",
  "description": "Special events and important announcements"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category updated",
  "data": {
    "category": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d9",
      "name": "Special Events",
      "description": "Special events and important announcements",
      "updatedAt": "2023-09-05T12:30:00.000Z"
    }
  }
}
```

### 4. DELETE /api/news/categories/:id - Delete News Category

**Response:**
```json
{
  "success": true,
  "message": "Category deleted"
}
```

## Error Responses

All endpoints should return consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "details": {
      "errors": [
        {
          "field": "title",
          "message": "Title is required"
        }
      ]
    }
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authorization header required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "News article not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Database Schema (Suggested)

### News Articles Table
```sql
CREATE TABLE news_articles (
  id VARCHAR(24) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  authorId VARCHAR(24) NOT NULL,
  categoryId VARCHAR(24) NOT NULL,
  isPublished BOOLEAN DEFAULT FALSE,
  isFeatured BOOLEAN DEFAULT FALSE,
  featureOptions JSON,
  publishedAt TIMESTAMP,
  viewCount INTEGER DEFAULT 0,
  tags JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id),
  FOREIGN KEY (categoryId) REFERENCES news_categories(id)
);
```

### News Categories Table
```sql
CREATE TABLE news_categories (
  id VARCHAR(24) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Implementation Notes

1. **Authentication**: Verify the Bearer token and check user permissions
2. **Validation**: Validate all input data before processing
3. **Error Handling**: Return appropriate HTTP status codes and error messages
4. **Pagination**: Implement proper pagination for large datasets
5. **Search**: Implement full-text search across title, content, and tags
6. **Audit Trail**: Log all create, update, and delete operations
7. **File Upload**: Consider implementing file upload for featured images
8. **Caching**: Implement caching for frequently accessed data

## Testing

Test all endpoints with:
- Valid authentication tokens
- Invalid/missing authentication
- Valid and invalid request data
- Edge cases (empty data, large content, etc.)
- Pagination limits
- Search functionality
- Error conditions
