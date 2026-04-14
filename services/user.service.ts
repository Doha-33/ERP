import apiClient from '../client/apiClient';

export interface User {
  _id: string;
  username: string;
  email: string;
  roleId: any;
  companyId: any;
  branchId: any;
  state: string;
  createdAt: string;
  updatedAt: string;
}

const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: User[] }>('/users');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch users');
    } catch (error: any) {
      throw new Error(error.message || 'Error fetching users');
    }
  },

  async createUser(userData: any): Promise<User> {
    try {
      const response = await apiClient.post<{ success: boolean; data: User }>('/auth/register', userData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to create user');
    } catch (error: any) {
      throw new Error(error.message || 'Error creating user');
    }
  },

  async connectUser(data: { userId: string; companyId: string; branchId: string }): Promise<any> {
    try {
      const response = await apiClient.post<{ success: boolean; data: any }>('/auth/connect-user', data);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to connect user');
    } catch (error: any) {
      throw new Error(error.message || 'Error connecting user');
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/users/${userId}`);
      if (!response.data.success) {
        throw new Error('Failed to delete user');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error deleting user');
    }
  },

  async updateUser(userId: string, userData: any): Promise<User> {
    try {
      const response = await apiClient.put<{ success: boolean; data: User }>(`/users/${userId}`, userData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to update user');
    } catch (error: any) {
      throw new Error(error.message || 'Error updating user');
    }
  },

  async toggleUserStatus(userId: string): Promise<void> {
    try {
      await apiClient.post(`/users/${userId}/toggle-status`);
    } catch (error: any) {
      throw new Error(error.message || 'Error toggling user status');
    }
  }
};

export default userService;
