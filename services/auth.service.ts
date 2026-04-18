import apiClient from '../client/apiClient';
import { User, LoginResponse } from '../types';

/**
 * Auth Service: Handles authentication-related API calls.
 * This service normalizes user data and handles token storage.
 */

const authService = {
  /**
   * Login function to authenticate user.
   * Normalizes the user object to exclude sensitive backend fields.
   */
  async login(credentials: { username?: string; email?: string; password?: string }): Promise<LoginResponse['data']> {
    // MOCK LOGIN FOR DEVELOPMENT
    console.log('[MockAuth] Logging in with:', credentials);
    
    const token = 'mock-jwt-token-' + Date.now();
    const safeUser: User = {
      id: 'mock-user-id',
      username: credentials.username || credentials.email?.split('@')[0] || 'admin',
      fullName: 'System Admin',
      email: credentials.email || 'admin@example.com',
      role: 'admin', // Always admin for easier testing
      avatar: `https://picsum.photos/seed/${credentials.email || 'admin'}/200/200`,
      state: 'active',
      lastLoginAt: new Date().toISOString(),
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(safeUser));

    return { user: safeUser, token };
  },

  /**
   * Register function to create a new admin account.
   */
  async register(userData: { username: string; email: string; password?: string }): Promise<LoginResponse['data']> {
    return this.login(userData); // Use mock login for registration too
  },

  /**
   * Get current user profile from backend.
   */
  async getMe(): Promise<User> {
    const user = this.getCurrentUser();
    if (user) return user;
    throw new Error('No session');
  },

  /**
   * Logout function to clear authentication data.
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from localStorage.
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  /**
   * Get current token from localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  /**
   * Check if user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

export default authService;
