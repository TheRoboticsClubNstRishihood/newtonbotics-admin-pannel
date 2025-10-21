const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3006;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data storage
let newsArticles = [
  {
    id: '64f8a1b2c3d4e5f6a7b8c9d5',
    title: 'NewtonBotics Wins Regional Robotics Competition',
    content: 'Our team has achieved remarkable success in the regional robotics competition...',
    authorId: {
      id: '64f8a1b2c3d4e5f6a7b8c9d0',
      firstName: 'Admin',
      lastName: 'User'
    },
    categoryId: {
      id: '64f8a1b2c3d4e5f6a7b8c9d6',
      name: 'Achievements',
      description: 'Team achievements and awards'
    },
    isPublished: true,
    isFeatured: true,
    featureOptions: {
      showInNav: true,
      navOrder: 1,
      featuredImage: 'https://example.com/featured-image.jpg'
    },
    publishedAt: '2023-09-05T10:00:00.000Z',
    viewCount: 150,
    tags: ['competition', 'robotics', 'achievement'],
    createdAt: '2023-09-05T08:00:00.000Z',
    updatedAt: '2023-09-05T10:00:00.000Z'
  },
  {
    id: '64f8a1b2c3d4e5f6a7b8c9d8',
    title: 'New Workshop Series: Introduction to AI and Machine Learning',
    content: 'We are excited to announce our new workshop series focused on AI and Machine Learning fundamentals...',
    authorId: {
      id: '64f8a1b2c3d4e5f6a7b8c9d0',
      firstName: 'Admin',
      lastName: 'User'
    },
    categoryId: {
      id: '64f8a1b2c3d4e5f6a7b8c9d7',
      name: 'Workshops',
      description: 'Workshop announcements and updates'
    },
    isPublished: false,
    isFeatured: false,
    featureOptions: {
      showInNav: false,
      navOrder: 0,
      featuredImage: ''
    },
    viewCount: 0,
    tags: ['workshop', 'ai', 'machine learning'],
    createdAt: '2023-09-05T12:00:00.000Z',
    updatedAt: '2023-09-05T12:00:00.000Z'
  }
];

let newsCategories = [
  {
    id: '64f8a1b2c3d4e5f6a7b8c9d6',
    name: 'Achievements',
    description: 'Team achievements and awards',
    createdAt: '2023-09-01T08:00:00.000Z'
  },
  {
    id: '64f8a1b2c3d4e5f6a7b8c9d7',
    name: 'Workshops',
    description: 'Workshop announcements and updates',
    createdAt: '2023-09-01T08:00:00.000Z'
  }
];

// Mock events data
let events = [
  {
    _id: '68b2df886abc19933b13d029',
    title: 'Robotics Workshop: Introduction to Arduino',
    description: 'Learn the basics of Arduino programming and robotics in this hands-on workshop.',
    startDate: '2024-01-15T10:00:00.000Z',
    endDate: '2024-01-15T16:00:00.000Z',
    location: 'Engineering Building - Room 101',
    maxCapacity: 30,
    currentRegistrations: 15,
    status: 'upcoming',
    organizerId: '68a30681af3f3b7d9e2653a3',
    category: 'workshop',
    type: 'workshop',
    isFeatured: true,
    requiresRegistration: true,
    registrationDeadline: '2024-01-10T23:59:59.000Z',
    registrationFormLink: 'https://forms.google.com/robotics-workshop',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
    featureOptions: {
      showInNav: true,
      navLabel: 'Workshops',
      navOrder: 1
    },
    registrations: [],
    createdAt: '2023-12-01T08:00:00.000Z',
    updatedAt: '2023-12-01T08:00:00.000Z'
  },
  {
    _id: '68b2df886abc19933b13d030',
    title: 'AI Competition 2024',
    description: 'Annual AI competition showcasing innovative projects from students.',
    startDate: '2024-02-20T09:00:00.000Z',
    endDate: '2024-02-20T18:00:00.000Z',
    location: 'Main Auditorium',
    maxCapacity: 100,
    currentRegistrations: 45,
    status: 'upcoming',
    organizerId: '68a30681af3f3b7d9e2653a3',
    category: 'competition',
    type: 'competition',
    isFeatured: false,
    requiresRegistration: true,
    registrationDeadline: '2024-02-15T23:59:59.000Z',
    registrationFormLink: 'https://forms.google.com/ai-competition',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    featureOptions: {
      showInNav: true,
      navLabel: 'Competitions',
      navOrder: 2
    },
    registrations: [],
    createdAt: '2023-12-01T08:00:00.000Z',
    updatedAt: '2023-12-01T08:00:00.000Z'
  }
];

// Mock admin user data
const ADMIN_USER = {
  id: '64f8a1b2c3d4e5f6a7b8c9d0',
  email: 'admin@newtonbotics.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,
  emailVerified: true,
  permissions: ['*'],
  lastLogin: new Date().toISOString(),
  // Password hash for "AdminPass123!"
  passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
};

// Authentication middleware (mock)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header required'
    });
  }

  // Mock token validation - accept any token for development
  // In production, this would verify JWT tokens
  if (token === 'mock-token' || token.startsWith('mock') || token.length > 10) {
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Authentication Routes

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user exists and credentials match
    if (email !== ADMIN_USER.email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // For mock purposes, accept any password or the specific password
    if (password !== 'AdminPass123!' && password !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!ADMIN_USER.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate mock tokens
    const accessToken = `mock-access-token-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${Date.now()}`;

    // Update last login
    const updatedUser = {
      ...ADMIN_USER,
      lastLogin: new Date().toISOString()
    };

    // Return success response
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          emailVerified: updatedUser.emailVerified,
          permissions: updatedUser.permissions,
          lastLogin: updatedUser.lastLogin
        },
        tokens: {
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiresIn: '24h'
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    // Return user profile
    return res.json({
      success: true,
      data: {
        user: {
          id: ADMIN_USER.id,
          email: ADMIN_USER.email,
          firstName: ADMIN_USER.firstName,
          lastName: ADMIN_USER.lastName,
          role: ADMIN_USER.role,
          isActive: ADMIN_USER.isActive,
          emailVerified: ADMIN_USER.emailVerified,
          permissions: ADMIN_USER.permissions,
          lastLogin: ADMIN_USER.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/refresh
app.post('/api/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Validate input
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // For mock purposes, accept any refresh token
    if (!refreshToken.includes('mock-refresh-token')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = `mock-access-token-${Date.now()}`;
    const newRefreshToken = `mock-refresh-token-${Date.now()}`;

    // Return new tokens
    return res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: '24h'
        }
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Validate input
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // For mock purposes, just return success
    return res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// News Articles Routes

// GET /api/news - List News Articles
app.get('/api/news', authenticateToken, (req, res) => {
  try {
    const { limit = 20, skip = 0, isPublished, isFeatured, categoryId, search } = req.query;
    
    let filteredArticles = [...newsArticles];

    // Apply filters
    if (isPublished !== undefined) {
      filteredArticles = filteredArticles.filter(article => 
        article.isPublished === (isPublished === 'true')
      );
    }

    if (isFeatured !== undefined) {
      filteredArticles = filteredArticles.filter(article => 
        article.isFeatured === (isFeatured === 'true')
      );
    }

    if (categoryId) {
      filteredArticles = filteredArticles.filter(article => 
        article.categoryId.id === categoryId
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredArticles = filteredArticles.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination
    const total = filteredArticles.length;
    const paginatedArticles = filteredArticles.slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    res.json({
      success: true,
      data: {
        items: paginatedArticles,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: parseInt(skip) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching news articles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/news - Create News Article
app.post('/api/news', authenticateToken, (req, res) => {
  try {
    const { title, content, authorId, categoryId, isPublished, featureOptions, tags } = req.body;

    // Validation
    if (!title || !content || !authorId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: {
          details: {
            errors: [
              { field: 'title', message: 'Title is required' },
              { field: 'content', message: 'Content is required' },
              { field: 'authorId', message: 'Author ID is required' },
              { field: 'categoryId', message: 'Category ID is required' }
            ]
          }
        }
      });
    }

    // Find category
    const category = newsCategories.find(cat => cat.id === categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    const newArticle = {
      id: uuidv4().replace(/-/g, '').substring(0, 24),
      title,
      content,
      authorId: {
        id: authorId,
        firstName: 'Admin',
        lastName: 'User'
      },
      categoryId: {
        id: category.id,
        name: category.name,
        description: category.description
      },
      isPublished: isPublished || false,
      isFeatured: false,
      featureOptions: featureOptions || {
        showInNav: false,
        navOrder: 0,
        featuredImage: ''
      },
      publishedAt: isPublished ? new Date().toISOString() : null,
      viewCount: 0,
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    newsArticles.push(newArticle);

    res.status(201).json({
      success: true,
      message: 'News created',
      data: {
        item: newArticle
      }
    });
  } catch (error) {
    console.error('Error creating news article:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/news/:id - Update News Article
app.put('/api/news/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const articleIndex = newsArticles.findIndex(article => article.id === id);
    if (articleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    const updatedArticle = {
      ...newsArticles[articleIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Update publishedAt if isPublished is being set to true
    if (updateData.isPublished && !newsArticles[articleIndex].isPublished) {
      updatedArticle.publishedAt = new Date().toISOString();
    }

    newsArticles[articleIndex] = updatedArticle;

    res.json({
      success: true,
      message: 'News updated',
      data: {
        item: updatedArticle
      }
    });
  } catch (error) {
    console.error('Error updating news article:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/news/:id - Delete News Article
app.delete('/api/news/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const articleIndex = newsArticles.findIndex(article => article.id === id);
    if (articleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    newsArticles.splice(articleIndex, 1);

    res.json({
      success: true,
      message: 'News deleted'
    });
  } catch (error) {
    console.error('Error deleting news article:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// News Categories Routes

// GET /api/news/categories - List News Categories
app.get('/api/news/categories', authenticateToken, (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        categories: newsCategories
      }
    });
  } catch (error) {
    console.error('Error fetching news categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/news/categories - Create News Category
app.post('/api/news/categories', authenticateToken, (req, res) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: {
          details: {
            errors: [
              { field: 'name', message: 'Name is required' }
            ]
          }
        }
      });
    }

    // Check if category already exists
    const existingCategory = newsCategories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const newCategory = {
      id: uuidv4().replace(/-/g, '').substring(0, 24),
      name,
      description: description || '',
      createdAt: new Date().toISOString()
    };

    newsCategories.push(newCategory);

    res.status(201).json({
      success: true,
      message: 'Category created',
      data: {
        category: newCategory
      }
    });
  } catch (error) {
    console.error('Error creating news category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/news/categories/:id - Update News Category
app.put('/api/news/categories/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const categoryIndex = newsCategories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const updatedCategory = {
      ...newsCategories[categoryIndex],
      name: name || newsCategories[categoryIndex].name,
      description: description || newsCategories[categoryIndex].description,
      updatedAt: new Date().toISOString()
    };

    newsCategories[categoryIndex] = updatedCategory;

    res.json({
      success: true,
      message: 'Category updated',
      data: {
        category: updatedCategory
      }
    });
  } catch (error) {
    console.error('Error updating news category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/news/categories/:id - Delete News Category
app.delete('/api/news/categories/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const categoryIndex = newsCategories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category is being used by any articles
    const articlesUsingCategory = newsArticles.filter(article => article.categoryId.id === id);
    if (articlesUsingCategory.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that is being used by articles'
      });
    }

    newsCategories.splice(categoryIndex, 1);

    res.json({
      success: true,
      message: 'Category deleted'
    });
  } catch (error) {
    console.error('Error deleting news category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Events Routes

// GET /api/events - List Events
app.get('/api/events', authenticateToken, (req, res) => {
  try {
    const { limit = 20, skip = 0, status, category, search } = req.query;
    
    let filteredEvents = [...events];

    // Apply filters
    if (status) {
      filteredEvents = filteredEvents.filter(event => event.status === status);
    }

    if (category) {
      filteredEvents = filteredEvents.filter(event => event.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const total = filteredEvents.length;
    const paginatedEvents = filteredEvents.slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    res.json({
      success: true,
      data: {
        items: paginatedEvents,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: parseInt(skip) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/events - Create Event
app.post('/api/events', authenticateToken, (req, res) => {
  try {
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      location, 
      maxCapacity, 
      organizerId, 
      category, 
      type, 
      isFeatured,
      requiresRegistration,
      registrationDeadline,
      registrationFormLink,
      imageUrl,
      featureOptions
    } = req.body;

    // Validation
    if (!title || !description || !startDate || !endDate || !location || !maxCapacity || !organizerId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: {
          details: {
            errors: [
              { field: 'title', message: 'Title is required' },
              { field: 'description', message: 'Description is required' },
              { field: 'startDate', message: 'Start date is required' },
              { field: 'endDate', message: 'End date is required' },
              { field: 'location', message: 'Location is required' },
              { field: 'maxCapacity', message: 'Max capacity is required' },
              { field: 'organizerId', message: 'Organizer ID is required' },
              { field: 'type', message: 'Type is required' }
            ]
          }
        }
      });
    }

    const newEvent = {
      _id: uuidv4().replace(/-/g, '').substring(0, 24),
      title,
      description,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      location,
      maxCapacity: parseInt(maxCapacity),
      currentRegistrations: 0,
      status: 'upcoming',
      organizerId,
      category: category || null,
      type,
      isFeatured: isFeatured || false,
      requiresRegistration: requiresRegistration || false,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
      registrationFormLink: registrationFormLink || null,
      imageUrl: imageUrl || null,
      featureOptions: {
        showInNav: featureOptions?.showInNav || false,
        navLabel: featureOptions?.navLabel || null,
        navOrder: featureOptions?.navOrder || 0
      },
      registrations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    events.push(newEvent);

    res.status(201).json({
      success: true,
      message: 'Event created',
      data: {
        item: newEvent
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/events/:id - Get Single Event
app.get('/api/events/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const event = events.find(event => event._id === id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: {
        item: event
      }
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/events/:id - Update Event
app.put('/api/events/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const eventIndex = events.findIndex(event => event._id === id);
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const updatedEvent = {
      ...events[eventIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    events[eventIndex] = updatedEvent;

    res.json({
      success: true,
      message: 'Event updated',
      data: {
        item: updatedEvent
      }
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/events/:id - Delete Event
app.delete('/api/events/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const eventIndex = events.findIndex(event => event._id === id);
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    events.splice(eventIndex, 1);

    res.json({
      success: true,
      message: 'Event deleted'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Media Categories endpoints
let mediaCategories = [
  {
    _id: '64f8a1b2c3d4e5f6a7b8c9d1',
    name: 'Gallery',
    description: 'General gallery images and media',
    createdAt: '2023-09-05T08:00:00.000Z',
    updatedAt: '2023-09-05T08:00:00.000Z'
  },
  {
    _id: '64f8a1b2c3d4e5f6a7b8c9d2',
    name: 'Projects',
    description: 'Project-related media and documentation',
    createdAt: '2023-09-05T08:00:00.000Z',
    updatedAt: '2023-09-05T08:00:00.000Z'
  }
];

// GET /api/media/categories
app.get('/api/media/categories', (req, res) => {
  try {
    res.json({
      success: true,
      data: mediaCategories
    });
  } catch (error) {
    console.error('Error fetching media categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/media/categories
app.post('/api/media/categories', (req, res) => {
  try {
    const { name, description, parentCategoryId } = req.body;

    if (!name || name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be between 2-100 characters'
      });
    }

    const newCategory = {
      _id: uuidv4(),
      name,
      description: description || '',
      parentCategoryId: parentCategoryId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mediaCategories.push(newCategory);

    res.status(201).json({
      success: true,
      message: 'Media category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating media category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/media/categories/:id
app.put('/api/media/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentCategoryId } = req.body;

    const categoryIndex = mediaCategories.findIndex(cat => cat._id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Media category not found'
      });
    }

    if (name && (name.length < 2 || name.length > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2-100 characters'
      });
    }

    const updatedCategory = {
      ...mediaCategories[categoryIndex],
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(parentCategoryId !== undefined && { parentCategoryId }),
      updatedAt: new Date().toISOString()
    };

    mediaCategories[categoryIndex] = updatedCategory;

    res.json({
      success: true,
      message: 'Media category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating media category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/media/categories/:id
app.delete('/api/media/categories/:id', (req, res) => {
  try {
    const { id } = req.params;

    const categoryIndex = mediaCategories.findIndex(cat => cat._id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Media category not found'
      });
    }

    mediaCategories.splice(categoryIndex, 1);

    res.json({
      success: true,
      message: 'Media category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting media category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Role Approvals endpoints
let roleApprovals = [
  {
    _id: '1',
    email: 'john.doe@university.edu',
    allowedRoles: ['student', 'team_member'],
    note: 'Computer Science student, approved for team projects',
    isActive: true,
    createdBy: 'admin@newtonbotics.com',
    updatedBy: 'admin@newtonbotics.com',
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z'
  },
  {
    _id: '2',
    email: 'jane.smith@university.edu',
    allowedRoles: ['mentor', 'researcher'],
    note: 'Senior researcher, can mentor students',
    isActive: true,
    createdBy: 'admin@newtonbotics.com',
    updatedBy: 'admin@newtonbotics.com',
    createdAt: '2024-01-14T09:15:00.000Z',
    updatedAt: '2024-01-14T09:15:00.000Z'
  }
];

// GET /api/role-approvals
app.get('/api/role-approvals', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        approvals: roleApprovals
      }
    });
  } catch (error) {
    console.error('Error fetching role approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/role-approvals
app.post('/api/role-approvals', (req, res) => {
  try {
    const { email, allowedRoles, note, isActive = true } = req.body;

    if (!email || !allowedRoles || !Array.isArray(allowedRoles)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and allowedRoles are required'
        }
      });
    }

    // Check if approval already exists
    const existingIndex = roleApprovals.findIndex(approval => approval.email === email);
    
    if (existingIndex !== -1) {
      // Update existing approval
      roleApprovals[existingIndex] = {
        ...roleApprovals[existingIndex],
        allowedRoles,
        note: note || '',
        isActive,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: {
          approval: roleApprovals[existingIndex]
        }
      });
    } else {
      // Create new approval
      const newApproval = {
        _id: uuidv4(),
        email,
        allowedRoles,
        note: note || '',
        isActive,
        createdBy: 'admin@newtonbotics.com',
        updatedBy: 'admin@newtonbotics.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      roleApprovals.push(newApproval);

      res.json({
        success: true,
        data: {
          approval: newApproval
        }
      });
    }
  } catch (error) {
    console.error('Error creating/updating role approval:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/role-approvals/:email
app.delete('/api/role-approvals/:email', (req, res) => {
  try {
    const { email } = req.params;
    const decodedEmail = decodeURIComponent(email);

    const approvalIndex = roleApprovals.findIndex(approval => approval.email === decodedEmail);
    
    if (approvalIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Role approval not found'
        }
      });
    }

    roleApprovals.splice(approvalIndex, 1);

    res.json({
      success: true,
      message: 'Role approval deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role approval:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Dashboard endpoints - Mock data structure matching frontend expectations
const getDashboardData = (period = '30d', includeCharts = false) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - (period === '7d' ? 7 : period === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000);
  
  return {
    period,
    dateRange: {
      start: startDate.toISOString(),
      end: now.toISOString()
    },
    overview: {
      totalUsers: 156,
      activeUsers: 142,
      totalProjects: 23,
      activeProjects: 18,
      totalWorkshops: 8,
      upcomingEvents: 5,
      totalNews: 12,
      totalEquipment: 45,
      pendingRequests: 7,
      contactSubmissions: 23,
      newsletterSubscribers: 89,
      unreadNotifications: 3
    },
    recentActivity: {
      newUsers: 12,
      newProjects: 3,
      newRequests: 5,
      newWorkshops: 2,
      newEvents: 1,
      newNews: 4,
      newContacts: 8
    },
    statusBreakdown: {
      projects: [
        { _id: 'active', count: 18 },
        { _id: 'completed', count: 5 },
        { _id: 'pending', count: 3 }
      ],
      requests: [
        { _id: 'pending', count: 7 },
        { _id: 'approved', count: 12 },
        { _id: 'rejected', count: 3 }
      ],
      workshops: [
        { _id: 'upcoming', count: 5 },
        { _id: 'completed', count: 3 }
      ],
      events: [
        { _id: 'upcoming', count: 5 },
        { _id: 'completed', count: 8 }
      ],
      equipment: [
        { _id: 'available', count: 32 },
        { _id: 'in-use', count: 13 }
      ]
    },
    charts: includeCharts ? {
      userGrowth: [
        { _id: { year: 2024, month: 1, day: 1 }, count: 120 },
        { _id: { year: 2024, month: 1, day: 15 }, count: 135 },
        { _id: { year: 2024, month: 2, day: 1 }, count: 142 },
        { _id: { year: 2024, month: 2, day: 15 }, count: 156 }
      ],
      projectActivity: [
        { _id: { year: 2024, month: 1, day: 1 }, count: 15 },
        { _id: { year: 2024, month: 1, day: 15 }, count: 18 },
        { _id: { year: 2024, month: 2, day: 1 }, count: 21 },
        { _id: { year: 2024, month: 2, day: 15 }, count: 23 }
      ],
      requestTrends: [
        { _id: { year: 2024, month: 1, day: 1 }, count: 8 },
        { _id: { year: 2024, month: 1, day: 15 }, count: 12 },
        { _id: { year: 2024, month: 2, day: 1 }, count: 15 },
        { _id: { year: 2024, month: 2, day: 15 }, count: 18 }
      ],
      equipmentUtilization: [
        { _id: 'available', count: 32 },
        { _id: 'in-use', count: 13 }
      ],
      notificationTrends: [
        { _id: { year: 2024, month: 1, day: 1 }, count: 5 },
        { _id: { year: 2024, month: 1, day: 15 }, count: 8 },
        { _id: { year: 2024, month: 2, day: 1 }, count: 6 },
        { _id: { year: 2024, month: 2, day: 15 }, count: 3 }
      ]
    } : undefined
  };
};

// GET /api/admin/dashboard/summary
app.get('/api/admin/dashboard/summary', authenticateToken, (req, res) => {
  try {
    const { period = '30d', includeCharts = 'false' } = req.query;
    
    const dashboardData = getDashboardData(period, includeCharts === 'true');

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Subroles endpoints
let subroles = [
  {
    _id: '64f8a1b2c3d4e5f6a7b8c9d1',
    name: 'Team Lead',
    description: 'Lead team projects and coordinate activities',
    permissions: ['project_create', 'project_edit', 'team_manage'],
    isActive: true,
    createdAt: '2023-09-05T08:00:00.000Z',
    updatedAt: '2023-09-05T08:00:00.000Z'
  },
  {
    _id: '64f8a1b2c3d4e5f6a7b8c9d2',
    name: 'Developer',
    description: 'Develop and maintain technical projects',
    permissions: ['project_create', 'project_edit'],
    isActive: true,
    createdAt: '2023-09-05T08:00:00.000Z',
    updatedAt: '2023-09-05T08:00:00.000Z'
  },
  {
    _id: '64f8a1b2c3d4e5f6a7b8c9d3',
    name: 'Designer',
    description: 'Handle UI/UX design and visual elements',
    permissions: ['project_edit'],
    isActive: false,
    createdAt: '2023-09-05T08:00:00.000Z',
    updatedAt: '2023-09-05T08:00:00.000Z'
  }
];

// GET /api/subroles
app.get('/api/subroles', authenticateToken, (req, res) => {
  try {
    const { limit = 50, skip = 0, isActive, q } = req.query;
    
    let filteredSubroles = [...subroles];

    // Apply filters
    if (isActive !== undefined) {
      filteredSubroles = filteredSubroles.filter(subrole => 
        subrole.isActive === (isActive === 'true')
      );
    }

    if (q) {
      const searchLower = q.toLowerCase();
      filteredSubroles = filteredSubroles.filter(subrole =>
        subrole.name.toLowerCase().includes(searchLower) ||
        subrole.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const total = filteredSubroles.length;
    const paginatedSubroles = filteredSubroles.slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    res.json({
      success: true,
      data: {
        items: paginatedSubroles,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: parseInt(skip) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subroles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/subroles
app.post('/api/subroles', authenticateToken, (req, res) => {
  try {
    const { name, description, permissions, isActive = true } = req.body;

    // Validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: {
          details: {
            errors: [
              { field: 'name', message: 'Name is required' },
              { field: 'description', message: 'Description is required' }
            ]
          }
        }
      });
    }

    const newSubrole = {
      _id: uuidv4().replace(/-/g, '').substring(0, 24),
      name,
      description,
      permissions: permissions || [],
      isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    subroles.push(newSubrole);

    res.status(201).json({
      success: true,
      message: 'Subrole created',
      data: {
        item: newSubrole
      }
    });
  } catch (error) {
    console.error('Error creating subrole:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/subroles/active
app.get('/api/subroles/active', authenticateToken, (req, res) => {
  try {
    const activeSubroles = subroles.filter(subrole => subrole.isActive);
    
    res.json({
      success: true,
      data: {
        items: activeSubroles
      }
    });
  } catch (error) {
    console.error('Error fetching active subroles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/subroles/categories
app.get('/api/subroles/categories', authenticateToken, (req, res) => {
  try {
    const categories = [
      { id: 'technical', name: 'Technical', description: 'Technical roles and responsibilities' },
      { id: 'management', name: 'Management', description: 'Management and leadership roles' },
      { id: 'creative', name: 'Creative', description: 'Creative and design roles' }
    ];
    
    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Error fetching subrole categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Users endpoints
let users = [
  {
    id: '64f8a1b2c3d4e5f6a7b8c9d0',
    email: 'admin@newtonbotics.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    studentId: 'ADMIN001',
    department: 'Computer Science',
    yearOfStudy: 4,
    phone: '+1234567890',
    isActive: true,
    emailVerified: true,
    lastLogin: new Date().toISOString(),
    createdAt: '2023-09-01T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    bio: 'System administrator for NewtonBotics',
    skills: ['Management', 'System Administration', 'Project Management'],
    permissions: ['*'],
    preferences: {
      notifications: true,
      newsletter: true
    }
  },
  {
    id: '64f8a1b2c3d4e5f6a7b8c9d1',
    email: 'john.doe@university.edu',
    firstName: 'John',
    lastName: 'Doe',
    role: 'student',
    studentId: 'STU001',
    department: 'Computer Science',
    yearOfStudy: 3,
    phone: '+1234567891',
    isActive: true,
    emailVerified: true,
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2023-09-15T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    bio: 'Computer Science student interested in robotics',
    skills: ['Python', 'JavaScript', 'Robotics'],
    permissions: ['project_create', 'project_edit'],
    preferences: {
      notifications: true,
      newsletter: false
    }
  },
  {
    id: '64f8a1b2c3d4e5f6a7b8c9d2',
    email: 'jane.smith@university.edu',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'mentor',
    studentId: 'MEN001',
    department: 'Electrical Engineering',
    yearOfStudy: 5,
    phone: '+1234567892',
    isActive: true,
    emailVerified: true,
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2023-09-10T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
    bio: 'Senior researcher and mentor',
    skills: ['Research', 'Mentoring', 'Electronics', 'Machine Learning'],
    permissions: ['project_create', 'project_edit', 'mentor_students'],
    preferences: {
      notifications: true,
      newsletter: true
    }
  },
  {
    id: '64f8a1b2c3d4e5f6a7b8c9d3',
    email: 'mike.wilson@university.edu',
    firstName: 'Mike',
    lastName: 'Wilson',
    role: 'student',
    studentId: 'STU002',
    department: 'Mechanical Engineering',
    yearOfStudy: 2,
    phone: '+1234567893',
    isActive: false,
    emailVerified: false,
    lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2023-10-01T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    bio: 'Mechanical engineering student',
    skills: ['CAD', 'Mechanical Design', '3D Printing'],
    permissions: ['project_create'],
    preferences: {
      notifications: false,
      newsletter: false
    }
  }
];

// GET /api/users
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    const { page = 1, limit = 20, q, role, department } = req.query;
    
    let filteredUsers = [...users];

    // Apply filters
    if (q) {
      const searchLower = q.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.studentId?.toLowerCase().includes(searchLower)
      );
    }

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    if (department) {
      filteredUsers = filteredUsers.filter(user => user.department === department);
    }

    // Apply pagination
    const total = filteredUsers.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedUsers = filteredUsers.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          total,
          limit: parseInt(limit),
          skip,
          hasMore: skip + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/users/statistics
app.get('/api/users/statistics', authenticateToken, (req, res) => {
  try {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const verifiedUsers = users.filter(user => user.emailVerified).length;
    
    // Calculate role distribution
    const roleDistribution = users.reduce((acc, user) => {
      const existingRole = acc.find(r => r.role === user.role);
      if (existingRole) {
        existingRole.count++;
      } else {
        acc.push({ role: user.role, count: 1 });
      }
      return acc;
    }, []);

    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          activeUsers,
          verifiedUsers,
          roleDistribution
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/users/departments
app.get('/api/users/departments', authenticateToken, (req, res) => {
  try {
    const departments = [...new Set(users.map(user => user.department).filter(Boolean))];
    
    res.json({
      success: true,
      data: {
        departments
      }
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/users/roles
app.get('/api/users/roles', authenticateToken, (req, res) => {
  try {
    const roles = [...new Set(users.map(user => user.role))];
    
    res.json({
      success: true,
      data: {
        roles
      }
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Dashboard Notifications endpoint
let notifications = [
  {
    _id: 'notif_001',
    userId: 'admin_user_001',
    title: 'New Project Request',
    message: 'A new project request has been submitted',
    type: 'project_update',
    priority: 'medium',
    category: 'info',
    read: false,
    readAt: null,
    archived: false,
    archivedAt: null,
    expiresAt: null,
    delivery: {
      email: {
        sent: true,
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      push: {
        sent: true,
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      sms: {
        sent: false,
        sentAt: null,
        error: null
      },
      inApp: {
        delivered: true,
        deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    },
    relatedEntity: {
      type: 'project_request',
      id: 'req_001',
      title: 'AI Chatbot Development'
    },
    action: {
      type: 'review',
      url: '/project-requests/req_001',
      label: 'Review Request'
    },
    metadata: {
      requesterName: 'User',
      requesterEmail: 'user@university.edu',
      projectTitle: 'AI Chatbot Development'
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    timeAgo: '2 hours ago'
  },
  {
    _id: 'notif_002',
    userId: 'admin_user_001',
    title: 'System Maintenance',
    message: 'Scheduled system maintenance will occur tonight',
    type: 'system',
    priority: 'high',
    category: 'warning',
    read: true,
    readAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    archived: false,
    archivedAt: null,
    expiresAt: null,
    delivery: {
      email: {
        sent: true,
        sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      push: {
        sent: true,
        sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      sms: {
        sent: true,
        sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        error: null
      },
      inApp: {
        delivered: true,
        deliveredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    },
    relatedEntity: {
      type: 'system',
      id: 'maint_001',
      title: 'System Maintenance'
    },
    action: {
      type: 'info',
      url: '/system/maintenance',
      label: 'View Details'
    },
    metadata: {
      maintenanceStart: '2024-01-15T02:00:00.000Z',
      maintenanceEnd: '2024-01-15T06:00:00.000Z',
      affectedServices: ['API', 'Database', 'File Storage']
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    timeAgo: '3 hours ago'
  }
];

// GET /api/admin/dashboard/notifications
app.get('/api/admin/dashboard/notifications', authenticateToken, (req, res) => {
  try {
    const { limit = 10, skip = 0, type, priority, read } = req.query;
    
    let filteredNotifications = [...notifications];

    // Apply filters
    if (type) {
      filteredNotifications = filteredNotifications.filter(notif => notif.type === type);
    }

    if (priority) {
      filteredNotifications = filteredNotifications.filter(notif => notif.priority === priority);
    }

    if (read !== undefined) {
      const isRead = read === 'true';
      filteredNotifications = filteredNotifications.filter(notif => notif.read === isRead);
    }

    // Apply pagination
    const total = filteredNotifications.length;
    const paginatedNotifications = filteredNotifications.slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: parseInt(skip) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/admin/dashboard/notifications/read-all
app.put('/api/admin/dashboard/notifications/read-all', authenticateToken, (req, res) => {
  try {
    let markedCount = 0;
    notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        notification.readAt = new Date().toISOString();
        notification.updatedAt = new Date().toISOString();
        markedCount++;
      }
    });

    res.json({
      success: true,
      message: `Marked ${markedCount} notifications as read`,
      data: {
        markedCount,
        totalNotifications: notifications.length
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/admin/dashboard/notifications/:id/read
app.put('/api/admin/dashboard/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const notificationIndex = notifications.findIndex(notif => notif._id === id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Mark as read
    notifications[notificationIndex].read = true;
    notifications[notificationIndex].readAt = new Date().toISOString();
    notifications[notificationIndex].updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification: notifications[notificationIndex]
      }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Dashboard Settings endpoint
let notificationSettings = {
  email: {
    enabled: true,
    projectRequests: true,
    events: true,
    news: true,
    equipment: true,
    system: true,
    frequency: 'immediate'
  },
  push: {
    enabled: true,
    projectRequests: true,
    events: true,
    news: false,
    equipment: true,
    system: true,
    frequency: 'immediate'
  },
  sms: {
    enabled: false,
    projectRequests: false,
    events: true,
    news: false,
    equipment: false,
    system: true,
    frequency: 'daily'
  },
  inApp: {
    enabled: true,
    projectRequests: true,
    events: true,
    news: true,
    equipment: true,
    system: true,
    frequency: 'immediate'
  },
  frequency: {
    immediate: true,
    daily: false,
    weekly: false,
    monthly: false
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'UTC'
  },
  admin: {
    receiveAllNotifications: true,
    notificationDigest: 'daily',
    systemAlerts: true,
    userActivityAlerts: true
  }
};

// GET /api/admin/dashboard/settings
app.get('/api/admin/dashboard/settings', authenticateToken, (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        settings: notificationSettings
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/admin/dashboard/settings
app.put('/api/admin/dashboard/settings', authenticateToken, (req, res) => {
  try {
    const body = req.body;
    
    // Update the settings
    Object.assign(notificationSettings, body);
    
    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        settings: notificationSettings
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mock backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('Authentication:');
  console.log('- POST /api/auth/login');
  console.log('- GET  /api/auth/me');
  console.log('- POST /api/auth/refresh');
  console.log('- POST /api/auth/logout');
  console.log('News:');
  console.log('- GET  /api/news');
  console.log('- POST /api/news');
  console.log('- PUT  /api/news/:id');
  console.log('- DELETE /api/news/:id');
  console.log('- GET  /api/news/categories');
  console.log('- POST /api/news/categories');
  console.log('- PUT  /api/news/categories/:id');
  console.log('- DELETE /api/news/categories/:id');
  console.log('Events:');
  console.log('- GET  /api/events');
  console.log('- POST /api/events');
  console.log('- GET  /api/events/:id');
  console.log('- PUT  /api/events/:id');
  console.log('- DELETE /api/events/:id');
  console.log('Dashboard:');
  console.log('- GET  /api/admin/dashboard/summary');
  console.log('- GET  /api/admin/dashboard/notifications');
  console.log('Users:');
  console.log('- GET  /api/users');
  console.log('- POST /api/users');
  console.log('- GET  /api/users/statistics');
  console.log('- GET  /api/users/departments');
  console.log('- GET  /api/users/roles');
  console.log('Subroles:');
  console.log('- GET  /api/subroles');
  console.log('- POST /api/subroles');
  console.log('- GET  /api/subroles/active');
  console.log('- GET  /api/subroles/categories');
  console.log('Media Categories:');
  console.log('- GET  /api/media/categories');
  console.log('- POST /api/media/categories');
  console.log('- PUT  /api/media/categories/:id');
  console.log('- DELETE /api/media/categories/:id');
  console.log('Role Approvals:');
  console.log('- GET  /api/role-approvals');
  console.log('- POST /api/role-approvals');
  console.log('- DELETE /api/role-approvals/:email');
  console.log('- GET  /api/health');
  console.log('\nUse any Bearer token for authentication (e.g., "Bearer mock-token")');
  console.log('Login credentials: admin@newtonbotics.com / admin');
});
