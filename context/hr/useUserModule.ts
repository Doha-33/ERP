import { useState, useCallback, useMemo } from 'react';
import userService from '../../services/user.service';
import roleService from '../../services/role.service';
import { UserRecord, UserRole } from '../../types';

export const useUserModule = (fetchAllData?: () => Promise<void>) => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [structuredPermissions, setStructuredPermissions] = useState<any>({
    hr: {
      employees: { view: 'hr_view_employees', add: 'hr_add_employees', edit: 'hr_edit_employees', delete: 'hr_delete_employees' },
      payroll: { view: 'hr_view_payroll', process: 'hr_process_payroll' },
      attendance: { view: 'hr_view_attendance', mark: 'hr_mark_attendance' },
    },
    sales: {
      orders: { view: 'sales_view_orders', add: 'sales_add_orders' },
      invoices: { view: 'sales_view_invoices', add: 'sales_add_invoices' },
    },
    user_management: {
      users: { view: 'view_users', add: 'add_users', edit: 'edit_users', delete: 'delete_users' },
      roles: { view: 'view_roles', add: 'add_roles', edit: 'edit_roles', delete: 'delete_roles' },
    }
  });

  // ================= USERS =================
  const fetchUsers = useCallback(async () => {
    try {
      const res = await userService.getAllUsers();
      // Map backend User to UserRecord if needed
      const mapped = res.map((u: any) => ({
        ...u,
        user_id: u._id,
        full_name: u.username, // Fallback
        status: u.state === 'ACTIVE' ? 'Active' : 'Inactive',
        Role: typeof u.roleId === 'object' ? u.roleId : { name: u.roleId },
        Branch: typeof u.branchId === 'object' ? u.branchId : { name: u.branchId },
      }));
      setUsers(mapped as any);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  // ================= ROLES =================
  const fetchRoles = useCallback(async () => {
    try {
      const res = await roleService.getAllRoles();

      const mapped = res.map((r: any) => ({
        ...r,
        role_id: r._id, 
      }));

      setRoles(mapped as any);
    } catch (err: any) {
      console.error('Failed to fetch roles:', err);
    }
  }, []);

  // ================= PERMISSIONS =================
  const fetchPermissions = useCallback(async () => {
    // Implement if needed
  }, []);

  // ================= USER ACTIONS =================
  const addUser = useCallback(async (userData: any) => {
    try {
      await userService.createUser(userData);
      await fetchUsers();
    } catch (err) {
      console.error('Failed to add user:', err);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: string, userData: any) => {
    try {
      // await userService.updateUser(id, userData);
      await fetchUsers();
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await userService.deleteUser(id);
      await fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  }, [fetchUsers]);

  const toggleUserStatus = useCallback(async (id: string) => {
    try {
      // await userService.toggleUserStatus(id);
      await fetchUsers();
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
  }, [fetchUsers]);

  // ================= ROLE ACTIONS =================
  const addRole = useCallback(async (roleData: any) => {
    try {
      const newRole = await roleService.createRole(roleData);
      await fetchRoles();
    } catch (err: any) {
      console.error('Failed to add role:', err);
    }
  }, [fetchRoles]);

  const updateRole = useCallback(async (id: string, roleData: any) => {
    try {
      await roleService.updateRole(id, roleData);
      await fetchRoles();
    } catch (err: any) {
      console.error('Failed to update role:', err);
    }
  }, [fetchRoles]);

  const deleteRole = useCallback(async (id: string) => {
    try {
      await roleService.deleteRole(id);
      await fetchRoles();
    } catch (err: any) {
      console.error('Failed to delete role:', err);
    }
  }, [fetchRoles]);

  const assignPermissionsToRole = useCallback(async (roleId: string, data: any) => {
    try {
      await roleService.addPermissionToRole(roleId, data);
      await fetchRoles(); // Refresh roles to get updated permissions
      return true;
    } catch (err) {
      console.error('Failed to assign permissions:', err);
      return false;
    }
  }, [fetchRoles]);

  return useMemo(() => ({
    users, setUsers,
    roles, setRoles,
    structuredPermissions,
    setStructuredPermissions,

    fetchUsers,
    fetchRoles,
    fetchPermissions,

    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,

    addRole,
    updateRole,
    deleteRole,
    assignPermissionsToRole
  }), [
    users,
    roles,
    structuredPermissions,
    fetchUsers,
    fetchRoles,
    fetchPermissions,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    addRole,
    updateRole,
    deleteRole,
    assignPermissionsToRole
  ]);
};
