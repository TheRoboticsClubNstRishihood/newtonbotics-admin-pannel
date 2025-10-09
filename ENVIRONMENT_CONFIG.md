# Environment Configuration

This document explains how to configure the backend URLs for the NewtonBotics Admin Panel.

## Environment Variables

The application uses the following environment variables to configure backend URLs:

### Production Backend (Main API)
- `NEXT_PUBLIC_BACKEND_URL`: Used for client-side API calls (authentication, main features)
- `BACKEND_URL`: Used for server-side API calls (API routes)

**Default Value**: `https://newton-botics-servers-chi.vercel.app`

### Development Backend (Mock/Testing)
- `NEXT_PUBLIC_BACKEND_URL`: Used for client-side development API calls
- `DEV_BACKEND_URL`: Used for server-side development API calls

**Default Value**: `http://localhost:3005`

## Setup Instructions

### For Local Development

1. Create a `.env.local` file in the project root
2. Add the following variables:

```bash
# Production backend URL (used for authentication and main API calls)
NEXT_PUBLIC_BACKEND_URL=https://newton-botics-servers-chi.vercel.app
BACKEND_URL=https://newton-botics-servers-chi.vercel.app

# Development/Testing URLs (used for mock data and development)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3005
DEV_BACKEND_URL=http://localhost:3005
```

### For Production Deployment

Set these environment variables in your hosting platform (Vercel, Netlify, etc.):

- `NEXT_PUBLIC_BACKEND_URL`: `https://newton-botics-servers-chi.vercel.app`
- `BACKEND_URL`: `https://newton-botics-servers-chi.vercel.app`

## Usage in Code

The application automatically uses the appropriate backend URL based on the environment:

- **Client-side code**: Uses `NEXT_PUBLIC_BACKEND_URL` or `NEXT_PUBLIC_BACKEND_URL`
- **Server-side code**: Uses `BACKEND_URL` or `DEV_BACKEND_URL`
- **API routes**: Use `BACKEND_URL` for production backend calls
- **Mock data**: Uses `DEV_BACKEND_URL` for development/testing

## Fallback Behavior

If environment variables are not set, the application will use these defaults:
- Production backend: `https://newton-botics-servers-chi.vercel.app`
- Development backend: `http://localhost:3005`

## Files Updated

The following files have been updated to use environment variables instead of hardcoded URLs:

### Frontend Pages
- `src/app/page.tsx` - Authentication calls
- `src/app/dashboard/page.tsx` - Dashboard API calls
- `src/app/users/page.tsx` - User management API calls
- `src/app/users/[id]/page.tsx` - Individual user API calls

### Components
- `src/components/EditUserModal.tsx` - User editing API calls
- `src/components/DebugModal.tsx` - Debug API calls

### Test Files
- `test-backend-connection.js` - Backend connection testing

### Configuration
- `src/config/backend.ts` - Centralized backend configuration (new file)

## API Routes

The API routes in `src/app/api/` already use environment variables and don't need updates.
