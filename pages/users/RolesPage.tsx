
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Shield, Search, Lock } from 'lucide-react';
import { Card, Button } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import roleService, { Role } from '../../services/role.service';
import { RoleModal } from '../../components/users/RoleModal';
import { PermissionsModal } from '../../components/users/PermissionsModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const RolesPage: React.FC = () => {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleSave = async (data: any) => {
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole._id, data);
      } else {
        await roleService.createRole(data);
      }
      await fetchRoles();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await roleService.deleteRole(deleteId);
        await fetchRoles();
        setDeleteId(null);
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleOpenPermissions = (role: Role) => {
    setEditingRole(role);
    setIsPermModalOpen(true);
  };

  const filtered = useMemo(() => {
    return roles.filter(r => 
      (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  const columns: Column<Role>[] = useMemo(() => [
    { 
      header: t('role_name'), 
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-lg">
            <Shield size={16} />
          </div>
          <span className="font-bold text-[#4A5568] dark:text-white">{r.name}</span>
        </div>
      )
    },
    { header: t('description'), accessorKey: 'description', className: 'text-[#718096]' },
    { 
      header: t('state'), 
      render: (r) => (
        <span className={`px-4 py-1 rounded-md text-xs font-bold ${
          r.state === 'ACTIVE' ? 'bg-[#2F855A] text-white' : 'bg-[#CBD5E0] text-[#718096]'
        }`}>
          {r.state}
        </span>
      )
    },
    { 
      header: t('user_id'), 
      render: (r) => <span className="text-[#718096] text-[10px] font-mono">{r._id}</span> 
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
           <button 
             onClick={() => handleOpenPermissions(r)}
             title="Manage Permissions"
             className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg border border-orange-100 transition-colors"
           >
             <Lock size={16} />
           </button>
           <button 
             onClick={() => { setEditingRole(r); setIsModalOpen(true); }} 
             className="p-1.5 text-[#718096] hover:text-primary rounded-lg border border-[#E2E8F0] dark:border-gray-700 transition-colors"
           >
             <Edit2 size={16} />
           </button>
           <button 
             onClick={() => setDeleteId(r._id)} 
             className="p-1.5 text-[#718096] hover:text-red-600 rounded-lg border border-[#E2E8F0] dark:border-gray-700 transition-colors"
           >
             <Trash2 size={16} />
           </button>
        </div>
      )
    }
  ], [t]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold text-[#2D3748] dark:text-white">{t('roles')}</h1>
           <p className="text-[#718096] dark:text-gray-400 text-sm">{t('manage_your_roles_desc')}</p>
        </div>
        <div className="flex gap-4">
           <Button 
             onClick={() => { setEditingRole(null); setIsModalOpen(true); }} 
             className="bg-[#4361EE] hover:bg-blue-700 text-white min-w-[160px] flex items-center gap-2"
           >
              <Plus size={18} /> {t('add_role')}
           </Button>
        </div>
      </div>

      <Card className="overflow-visible border-none shadow-xl shadow-gray-200/50 dark:shadow-none">
        <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800/20 p-4 rounded-xl">
           <div className="relative w-full max-w-md">
              <input 
                type="text" 
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-[#E2E8F0] dark:border-gray-700 rounded-lg text-sm outline-none pr-10 focus:ring-1 focus:ring-primary dark:bg-gray-800 dark:text-white"
              />
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
           </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table 
            data={filtered}
            columns={columns}
            keyExtractor={(r) => r._id}
            selectable
            minWidth="min-w-[1000px]"
          />
        )}
      </Card>

      <RoleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        roleToEdit={editingRole as any}
      />

      <PermissionsModal 
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        role={editingRole as any}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('confirm_delete')}
        message={t('are_you_sure_delete')}
      />
    </div>
  );
};
