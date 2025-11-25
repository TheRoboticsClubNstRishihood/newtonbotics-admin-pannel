/**
 * Admin authentication utilities
 * Used to verify admin access in API routes
 */

interface User {
  id?: string;
  _id?: string;
  role?: string;
  email?: string;
}

/**
 * Get user information from authorization token
 */
export async function getUserFromToken(token: string | null, backendUrl?: string): Promise<User | null> {
  if (!token) return null;

  try {
    const baseUrl = backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.data?.user || data?.user || null;
  } catch (error) {
    console.error('Error fetching user from token:', error);
    return null;
  }
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'admin';
}

/**
 * Verify admin access from authorization token
 * Returns user if admin, null otherwise
 */
export async function verifyAdminAccess(token: string | null, backendUrl?: string): Promise<User | null> {
  if (!token) return null;
  
  const user = await getUserFromToken(token, backendUrl);
  if (!user) return null;
  
  return isAdmin(user) ? user : null;
}



