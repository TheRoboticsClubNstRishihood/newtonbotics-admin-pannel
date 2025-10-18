'use client';

import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { 
  DocumentTextIcon,
  CodeBracketIcon,
  ServerIcon,
  Cog6ToothIcon,
  CloudIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  content: string;
}

const docSections: DocSection[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    icon: CodeBracketIcon,
    description: 'React, Next.js, and UI components documentation',
    content: `
# Frontend Documentation

## Overview
The NewtonBotics Admin Panel frontend is built using Next.js 15 with React and TypeScript.

## Key Technologies
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Icon library
- **React Hooks**: State management

## Project Structure
\`\`\`
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── config/             # Configuration files
├── hooks/              # Custom React hooks
└── lib/                # Utility libraries
\`\`\`

## Key Components
- **AdminLayout**: Main layout wrapper with sidebar navigation
- **Toast**: Notification system
- **Modals**: Various modal components for forms and details

## State Management
- React hooks (useState, useEffect)
- Local storage for authentication
- Context API for global state

## Styling
- Tailwind CSS for styling
- Responsive design principles
- Dark/light mode support (planned)
    `
  },
  {
    id: 'backend',
    title: 'Backend',
    icon: ServerIcon,
    description: 'API endpoints, database, and server architecture',
    content: `
# Backend Documentation

## Overview
The NewtonBotics backend provides RESTful APIs for the admin panel and other services.

## Architecture
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database (planned)
- **JWT**: Authentication tokens

## API Endpoints

### Authentication
- \`POST /api/auth/login\` - User login
- \`POST /api/auth/logout\` - User logout
- \`GET /api/auth/me\` - Get current user
- \`POST /api/auth/refresh\` - Refresh token

### User Management
- \`GET /api/users\` - List all users
- \`POST /api/users\` - Create new user
- \`GET /api/users/:id\` - Get user by ID
- \`PUT /api/users/:id\` - Update user
- \`DELETE /api/users/:id\` - Delete user

### News Management
- \`GET /api/news\` - List news articles
- \`POST /api/news\` - Create news article
- \`GET /api/news/:id\` - Get news article
- \`PUT /api/news/:id\` - Update news article
- \`DELETE /api/news/:id\` - Delete news article

### Events Management
- \`GET /api/events\` - List events
- \`POST /api/events\` - Create event
- \`GET /api/events/:id\` - Get event
- \`PUT /api/events/:id\` - Update event
- \`DELETE /api/events/:id\` - Delete event

## Database Schema
*To be documented*

## Authentication Flow
1. User submits login credentials
2. Backend validates credentials
3. JWT tokens are generated
4. Access token (short-lived) and refresh token (long-lived) are returned
5. Frontend stores tokens and includes access token in API requests
6. When access token expires, refresh token is used to get new access token

## Error Handling
- Consistent error response format
- HTTP status codes
- Error logging and monitoring
    `
  },
  {
    id: 'admin-panel',
    title: 'Admin Panel',
    icon: Cog6ToothIcon,
    description: 'Admin panel features, permissions, and user management',
    content: `
# Admin Panel Documentation

## Overview
The NewtonBotics Admin Panel provides comprehensive management tools for administrators.

## Features

### User Management
- View all registered users
- Create, edit, and delete users
- Manage user roles and permissions
- User statistics and analytics
- Bulk operations

### Content Management
- **News Management**: Create and manage news articles
- **Events Management**: Schedule and manage events
- **Media Management**: Upload and organize media files
- **Project Management**: Track projects and milestones

### System Administration
- **Role Approvals**: Manage user role requests
- **Contact Management**: Handle contact form submissions
- **Newsletter Management**: Manage email subscriptions
- **Inventory Management**: Track equipment and resources

## User Roles and Permissions

### Admin
- Full access to all features
- User management
- System configuration
- Analytics and reports

### Moderator
- Content management
- User moderation
- Limited administrative access

### Team Member
- Basic content creation
- Limited user management
- Project participation

### Student
- View-only access
- Project participation
- Limited content creation

## Navigation Structure
- **Dashboard**: Overview and quick actions
- **Users**: User management
- **News**: News article management
- **Events**: Event management
- **Projects**: Project tracking
- **Media**: Media library
- **Inventory**: Equipment management
- **Contact**: Contact form submissions
- **Role Approvals**: Role request management
- **Newsletter**: Email subscription management

## Security Features
- JWT-based authentication
- Role-based access control
- Session management
- Input validation and sanitization
- CSRF protection
    `
  },
  {
    id: 'external-services',
    title: 'External Services',
    icon: CloudIcon,
    description: 'Third-party integrations and external APIs',
    content: `
# External Services Documentation

## Overview
The NewtonBotics Admin Panel integrates with various external services for enhanced functionality.

## Cloud Services

### Cloudinary
- **Purpose**: Image and video management
- **Features**: 
  - Image upload and optimization
  - Video processing
  - CDN delivery
  - Transformations and filters
- **Integration**: Used for media management in the admin panel
- **API Endpoints**:
  - \`POST /api/cloudinary/sign\` - Get upload signature
  - \`DELETE /api/cloudinary/delete\` - Delete media

### Vercel
- **Purpose**: Hosting and deployment
- **Features**:
  - Serverless functions
  - Edge network
  - Automatic deployments
  - Analytics and monitoring

## Email Services
*To be documented*

## Analytics Services
*To be documented*

## Payment Services
*To be documented*

## Social Media Integration
*To be documented*

## API Integrations

### NewtonBotics Backend API
- **Base URL**: \`https://newton-botics-servers-chi.vercel.app\`
- **Authentication**: Bearer token
- **Rate Limiting**: Standard rate limits apply
- **Documentation**: Available at backend API docs

### Mock Backend Server
- **Purpose**: Development and testing
- **Base URL**: \`http://localhost:3005\`
- **Features**: Mock data for all endpoints
- **Usage**: Local development environment

## Configuration
External service configurations are managed through environment variables:

\`\`\`bash
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Backend API
NEXT_PUBLIC_BACKEND_URL=https://newton-botics-servers-chi.vercel.app
BACKEND_URL=https://newton-botics-servers-chi.vercel.app

# Development
NEXT_PUBLIC_BACKEND_URL=http://localhost:3005
DEV_BACKEND_URL=http://localhost:3005
\`\`\`

## Error Handling
- Service-specific error handling
- Fallback mechanisms
- Retry logic for failed requests
- Monitoring and alerting
    `
  },
  {
    id: 'other',
    title: 'Other',
    icon: InformationCircleIcon,
    description: 'Miscellaneous documentation, troubleshooting, and additional resources',
    content: `
# Other Documentation

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
\`\`\`bash
# Clone the repository
git clone <repository-url>
cd newtonbotics-admin

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
\`\`\`

### Available Scripts
- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint
- \`npm run type-check\` - Run TypeScript type checking

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
\`\`\`bash
# Build the application
npm run build

# Start production server
npm run start
\`\`\`

## Troubleshooting

### Common Issues

#### Authentication Issues
- **Problem**: "Failed to fetch" errors
- **Solution**: Check backend URL configuration and network connectivity
- **Debug**: Use browser dev tools to inspect network requests

#### Build Errors
- **Problem**: TypeScript compilation errors
- **Solution**: Run \`npm run type-check\` to identify issues
- **Debug**: Check for missing imports or type definitions

#### Environment Variables
- **Problem**: API calls failing due to missing environment variables
- **Solution**: Ensure all required environment variables are set
- **Debug**: Check \`.env.local\` file and deployment environment

### Debug Mode
Enable debug mode by setting \`NODE_ENV=development\` and checking browser console for detailed error messages.

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

### Pull Request Process
1. Create feature branch from main
2. Make changes and test thoroughly
3. Update documentation if needed
4. Submit pull request with description
5. Address review feedback

## Resources

### Documentation Links
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Internal Resources
- Backend API Documentation
- Design System Guidelines
- Deployment Guide
- Security Guidelines

## Changelog
*To be maintained*

## Roadmap
*To be documented*

## Support
For technical support and questions:
- Create an issue in the repository
- Contact the development team
- Check existing documentation and troubleshooting guides
    `
  }
];

export default function DocsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isExpanded = (sectionId: string) => expandedSections.includes(sectionId);

  return (
    <AdminLayout pageTitle="Documentation">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
            <p className="text-gray-600">Complete guide to the NewtonBotics Admin Panel</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <DocumentTextIcon className="h-5 w-5" />
            <span>v1.0.0</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Getting Started</h3>
              <p className="text-sm text-blue-700 mt-1">
                This documentation is currently in development. Content will be updated regularly as features are implemented.
              </p>
            </div>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-4">
          {docSections.map((section) => {
            const Icon = section.icon;
            const expanded = isExpanded(section.id);
            
            return (
              <div key={section.id} className="bg-white rounded-lg shadow border border-gray-200">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-6 w-6 text-gray-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {expanded ? 'Hide' : 'Show'}
                      </span>
                      {expanded ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Section Content */}
                {expanded && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <div className="pt-4">
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto">
                          {section.content}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600">
            Documentation last updated: {new Date().toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            For questions or suggestions, please contact the development team.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
