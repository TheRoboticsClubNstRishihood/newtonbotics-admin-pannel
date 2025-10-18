// Backend configuration
export const BACKEND_CONFIG = {
  // Production backend URL
  PRODUCTION_URL: 'https://newton-botics-servers-chi.vercel.app',
  
  // Development backend URL (fallback)
  DEVELOPMENT_URL: 'http://localhost:3005',
  
  // Get the appropriate backend URL based on environment
  getBackendUrl(): string {
    // Check for environment variables first
    if (typeof window !== 'undefined') {
      // Client-side: use NEXT_PUBLIC_ environment variables
      return process.env.NEXT_PUBLIC_BACKEND_URL || this.PRODUCTION_URL;
    } else {
      // Server-side: prefer BACKEND_URL, fall back to NEXT_PUBLIC_BACKEND_URL (useful in dev), then dev/prod defaults
      return process.env.BACKEND_URL 
        || process.env.NEXT_PUBLIC_BACKEND_URL 
        || this.DEVELOPMENT_URL 
        || this.PRODUCTION_URL;
    }
  },
  
  // Get development URL for testing/mock data
  getDevBackendUrl(): string {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_BACKEND_URL || this.DEVELOPMENT_URL;
    } else {
      return process.env.DEV_BACKEND_URL || this.DEVELOPMENT_URL;
    }
  }
};

// Export the main backend URL getter
export const getBackendUrl = () => BACKEND_CONFIG.getBackendUrl();
export const getDevBackendUrl = () => BACKEND_CONFIG.getDevBackendUrl();
