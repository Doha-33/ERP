import apiClient from '../client/apiClient';

export interface Role {
  _id: string;
  name: string;
  description: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

const roleService = {
  async getAllRoles(): Promise<Role[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Role[] }>('/roles');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch roles');
    } catch (error: any) {
      throw new Error(error.message || 'Error fetching roles');
    }
  },

  async createRole(roleData: { name: string; description: string }): Promise<Role> {
    try {
      const response = await apiClient.post<{ success: boolean; data: Role }>('/roles', roleData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to create role');
    } catch (error: any) {
      throw new Error(error.message || 'Error creating role');
    }
  },

  async updateRole(roleId: string, roleData: Partial<Role>): Promise<Role> {
    try {
      const response = await apiClient.put<{ success: boolean; data: Role }>(`/roles/${roleId}`, roleData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to update role');
    } catch (error: any) {
      throw new Error(error.message || 'Error updating role');
    }
  },

  async deleteRole(roleId: string): Promise<void> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/roles/${roleId}`);
      if (!response.data.success) {
        throw new Error('Failed to delete role');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error deleting role');
    }
  },

  async getPermissionsByRole(roleId: string): Promise<any[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>(`/roles/${roleId}/permissions`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching role permissions:', error);
      return [];
    }
  },

  async addPermissionToRole(roleId: string, permissionIds: string[]): Promise<void> {
    try {
      await apiClient.post(`/roles/${roleId}/permissions`, { permissionIds });
    } catch (error: any) {
      throw new Error(error.message || 'Error assigning permissions');
    }
  }
};

export default roleService;
