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
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Normalize user data
        const safeUser: User = {
          id: (user as any)._id || (user as any).id,
          username: user.username,
          fullName: (user as any).fullName || user.username,
          email: user.email,
          role: typeof (user as any).roleId === 'object' 
            ? (user as any).roleId.name.toLowerCase() 
            : ((user as any).roleId === "69c5884b51b72171118729a7" ? 'admin' : 'user'),
          avatar: (user as any).avatar,
          state: (user as any).state,
          lastLoginAt: (user as any).lastLoginAt,
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(safeUser));

        return { user: safeUser, token };
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during login';
      console.error('[AuthService] Login Error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Register function to create a new admin account.
   */
  async register(userData: { username: string; email: string; password?: string }): Promise<LoginResponse['data']> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/register-admin', userData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        const safeUser: User = {
          id: (user as any)._id || (user as any).id,
          username: user.username,
          fullName: (user as any).fullName || user.username,
          email: user.email,
          role: typeof (user as any).roleId === 'object' 
            ? (user as any).roleId.name.toLowerCase() 
            : ((user as any).roleId === "69c5884b51b72171118729a7" ? 'admin' : 'admin'), // Default to admin for register-admin endpoint
          avatar: (user as any).avatar,
          state: (user as any).state,
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(safeUser));

        return { user: safeUser, token };
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during registration';
      console.error('[AuthService] Register Error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get current user profile from backend.
   */
  async getMe(): Promise<User> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/auth/me');
      if (response.data.success) {
        const user = response.data.data;
        const safeUser: User = {
          id: user._id,
          username: user.username,
          fullName: user.fullName || user.username,
          email: user.email,
          role: typeof user.roleId === 'object' 
            ? user.roleId.name.toLowerCase() 
            : (user.roleId === "69c5884b51b72171118729a7" ? 'admin' : 'user'),
          avatar: user.avatar,
          state: user.state,
          lastLoginAt: user.lastLoginAt,
        };
        localStorage.setItem('user', JSON.stringify(safeUser));
        return safeUser;
      }
      throw new Error('Failed to fetch profile');
    } catch (error: any) {
      throw new Error(error.message || 'Profile fetch error');
    }
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
