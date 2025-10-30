// Backend configuration
export const BACKEND_CONFIG = {
  // Production backend URL
  PRODUCTION_URL: 'https://newton-botics-servers-chi.vercel.app',
  
  // Development backend URL (your local backend)
  DEVELOPMENT_URL: 'http://localhost:3006',
  
  // Normalize URL to avoid duplicated path segments like /api/api
  normalizeBaseUrl(url: string): string {
    try {
      // Remove any trailing '/api' (with or without trailing slash)
      return url.replace(/\/api\/?$/, '');
    } catch {
      return url;
    }
  },

  // Get the appropriate backend URL based on environment
  getBackendUrl(): string {
    // Check for environment variables first
    if (typeof window !== 'undefined') {
      // Client-side: use NEXT_PUBLIC_ environment variables
      const raw = process.env.NEXT_PUBLIC_BACKEND_URL || this.DEVELOPMENT_URL;
      return this.normalizeBaseUrl(raw);
    } else {
      // Server-side: prefer NEXT_PUBLIC_BACKEND_URL (single source of truth), then BACKEND_URL, then dev defaults
      const raw = process.env.NEXT_PUBLIC_BACKEND_URL 
        || process.env.BACKEND_URL 
        || this.DEVELOPMENT_URL;
      return this.normalizeBaseUrl(raw);
    }
  },
  
  // Get development URL for testing/mock data
  getDevBackendUrl(): string {
    if (typeof window !== 'undefined') {
      const raw = process.env.NEXT_PUBLIC_BACKEND_URL || this.DEVELOPMENT_URL;
      return this.normalizeBaseUrl(raw);
    } else {
      const raw = process.env.DEV_BACKEND_URL || this.DEVELOPMENT_URL;
      return this.normalizeBaseUrl(raw);
    }
  }
};

// Export the main backend URL getter
export const getBackendUrl = () => BACKEND_CONFIG.getBackendUrl();
export const getDevBackendUrl = () => BACKEND_CONFIG.getDevBackendUrl();
