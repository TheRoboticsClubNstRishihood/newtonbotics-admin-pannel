const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3005;

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
  if (token === 'mock-token' || token.startsWith('Bearer mock') || token.length > 10) {
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

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
});
