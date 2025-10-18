import { SignJWT, jwtVerify } from 'jose';

// JWT secret key (in production, this should be in environment variables)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  /**
   * Generate an access token
   */
  static async generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    return token;
  }

  /**
   * Generate a refresh token
   */
  static async generateRefreshToken(userId: string): Promise<string> {
    const tokenId = Math.random().toString(36).substring(2, 15);
    
    const token = await new SignJWT({
      userId,
      tokenId
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    return token;
  }

  /**
   * Verify an access token
   */
  static async verifyAccessToken(token: string): Promise<{ valid: boolean; payload?: TokenPayload }> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Validate that the payload has the required fields
      if (typeof payload === 'object' && payload !== null && 
          'userId' in payload && 'email' in payload && 'role' in payload && 'permissions' in payload) {
        return {
          valid: true,
          payload: payload as unknown as TokenPayload
        };
      }
      
      return {
        valid: false
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        valid: false
      };
    }
  }

  /**
   * Verify a refresh token
   */
  static async verifyRefreshToken(token: string): Promise<{ valid: boolean; payload?: RefreshTokenPayload }> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Validate that the payload has the required fields
      if (typeof payload === 'object' && payload !== null && 
          'userId' in payload && 'tokenId' in payload) {
        return {
          valid: true,
          payload: payload as unknown as RefreshTokenPayload
        };
      }
      
      return {
        valid: false
      };
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return {
        valid: false
      };
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Validate user permissions
   */
  static hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    // Admin users with '*' permission have all permissions
    if (userPermissions.includes('*')) {
      return true;
    }
    
    // Check for specific permission
    return userPermissions.includes(requiredPermission);
  }

  /**
   * Check if user has admin role
   */
  static isAdmin(userRole: string): boolean {
    return userRole === 'admin';
  }

  /**
   * Check if user has moderator role or higher
   */
  static isModeratorOrHigher(userRole: string): boolean {
    const moderatorRoles = ['admin', 'moderator'];
    return moderatorRoles.includes(userRole);
  }

  /**
   * Generate a secure random string for tokens
   */
  static generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash a password (placeholder - in production use bcrypt or similar)
   */
  static async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt or similar
    // For now, return a placeholder
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Compare password with hash (placeholder - in production use bcrypt or similar)
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }
}

// Export default for convenience
export default AuthService;
