'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  phone?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  permissions: string[];
  lastLogin?: string;
}


export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  // Check authentication on page load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      setIsLoading(false);
      setIsAuthenticated(false);
      return;
    }

    // If we have user data from login, use it immediately
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUser(user);
        setIsAuthenticated(true);
        setIsLoading(false);
        // Redirect to dashboard when authenticated
        router.push('/dashboard');
        return;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setIsAuthenticated(true);
        // Redirect to dashboard when authenticated
        router.push('/dashboard');
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setError('Your session has expired for security reasons. Please log in again to continue.');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // If token validation fails but we have user data, still show admin panel
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
          setIsAuthenticated(true);
          // Redirect to dashboard when authenticated
          router.push('/dashboard');
        } catch (parseError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };


  // If not authenticated, show login form
  if (!isLoading && !isAuthenticated) {
    return <LoginForm onLoginSuccess={checkAuth} />;
  }

  // If loading, show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/authbgimage.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        
        <div className="text-center z-30">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500/20 border-t-red-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="mt-6 text-red-200 font-medium">Loading Newtonbotics Admin...</p>
          <div className="mt-2 w-32 h-0.5 bg-gradient-to-r from-red-400 to-red-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Redirect to dashboard when authenticated
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/authbgimage.mp4" type="video/mp4" />
      </video>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      <div className="text-center z-30">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500/20 border-t-red-500 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
        <p className="mt-6 text-red-200 font-medium">Redirecting to dashboard...</p>
        <div className="mt-2 w-32 h-0.5 bg-gradient-to-r from-red-400 to-red-500 mx-auto"></div>
      </div>
    </div>
  );
}


// Login Form Component
function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Save tokens and user data
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Trigger auth check - this will update the state and redirect to dashboard
        onLoginSuccess();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/authbgimage.mp4" type="video/mp4" />
      </video>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(239, 68, 68, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)`
        }}></div>
      </div>
      
      {/* Main Login Container */}
      <div className="relative w-full max-w-md z-30">
        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 animate-fade-in">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4 shadow-lg animate-float animate-glow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">Newtonbotics</h1>
            <p className="text-red-200 text-sm font-medium">Admin Control Panel</p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-red-400 to-red-500 mx-auto mt-3"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label htmlFor="email" className="block text-sm font-medium text-red-100">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm hover:bg-white/15"
                  placeholder="admin@newtonbotics.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label htmlFor="password" className="block text-sm font-medium text-red-100">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm hover:bg-white/15"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 rounded-r-lg transition-all duration-200 group border-l border-red-500/30"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-white group-hover:text-red-200 transition-colors group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-white group-hover:text-red-200 transition-colors group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-200 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Login Button */}
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </div>
              )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-red-200 text-xs">
              Secure access to Newtonbotics administration
            </p>
            <div className="mt-2 flex items-center justify-center space-x-2 text-red-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs">SSL Encrypted</span>
            </div>
            
            {/* Emergency Contact */}
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-300 text-xs font-medium">Emergency Support</span>
              </div>
              <p className="text-red-200 text-xs">
                For urgent issues or system faults, contact:
              </p>
              <a 
                href="mailto:monu2feb2004@gmail.com" 
                className="text-white text-xs font-semibold hover:text-red-200 transition-colors underline"
              >
                monu2feb2004@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-500/20 rounded-full animate-float"></div>
        <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-red-600/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 -right-8 w-4 h-4 bg-red-400/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}
