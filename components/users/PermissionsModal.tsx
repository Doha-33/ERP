
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Check, Save, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { UserRole, Permission } from '../../types';
import { useData } from '../../context/DataContext';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole | null;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onClose, role }) => {
  const { t } = useTranslation();
  const { structuredPermissions, roles, assignPermissionsToRole } = useData();
  
  // Local state for selected permission IDs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Find all permission IDs currently in use across roles to create a flat mapping of Code -> ID
  const codeToIdMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!Array.isArray(roles)) return map;
    
    roles.forEach(r => {
      if (Array.isArray(r.Permissions)) {
        r.Permissions.forEach(p => {
          if (p.code && p.permission_id) {
            map[p.code] = p.permission_id;
          }
        });
      }
    });
    return map;
  }, [roles]);

  useEffect(() => {
    if (isOpen && role) {
      const currentIds = (role.Permissions || []).map(p => p.permission_id).filter(Boolean);
      setSelectedIds(currentIds);
      // Auto-expand HR by default as it's common
      setExpandedModules(['hr']);
    }
  }, [isOpen, role]);

  const handleToggleModule = (module: string) => {
    setExpandedModules(prev => 
      prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]
    );
  };

  const handleTogglePermission = (id: string) => {
    if (!id) return;
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllModule = (moduleData: any) => {
    const moduleIds: string[] = [];
    
    const extractIds = (obj: any) => {
      if (typeof obj === 'string') {
        const id = codeToIdMap[obj];
        if (id) moduleIds.push(id);
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(val => extractIds(val));
      }
    };

    extractIds(moduleData);

    const allIn = moduleIds.length > 0 && moduleIds.every(id => selectedIds.includes(id));
    if (allIn) {
        setSelectedIds(prev => prev.filter(id => !moduleIds.includes(id)));
    } else {
        setSelectedIds(prev => Array.from(new Set([...prev, ...moduleIds])));
    }
  };

  const handleSave = async () => {
    if (!role) return;
    setIsSaving(true);
    try {
        const success = await assignPermissionsToRole(role.role_id, selectedIds);
        if (success) onClose();
    } catch (err) {
        console.error('Permission assignment error:', err);
    } finally {
        setIsSaving(false);
    }
  };

  const title = (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Shield size={20} className="text-primary" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">Role Permissions</h3>
        <p className="text-xs text-gray-400 font-medium">Assigning access to: <span className="text-primary">{role?.name}</span></p>
      </div>
    </div>
  );

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={onClose} disabled={isSaving}>
        {t('cancel')}
      </Button>
      <Button 
        onClick={handleSave} 
        disabled={isSaving} 
        className="bg-primary hover:bg-blue-700 min-w-[140px]"
      >
        {isSaving ? 'Updating...' : <><Save size={18} /> {t('save')}</>}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      className="max-w-4xl"
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {Object.entries(structuredPermissions || {}).map(([moduleKey, categories]: [string, any]) => {
          const isExpanded = expandedModules.includes(moduleKey);
          
          return (
            <div key={moduleKey} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50/30 dark:bg-gray-900/10">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-surface cursor-pointer" onClick={() => handleToggleModule(moduleKey)}>
                <div className="flex items-center gap-3">
                  <div className="text-primary">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider text-sm">{moduleKey}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleSelectAllModule(categories); }}
                  className="text-[10px] font-black uppercase text-primary hover:underline"
                >
                  Toggle Module
                </button>
              </div>

              {isExpanded && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-1 duration-200">
                  {Object.entries(categories || {}).map(([categoryName, perms]: [string, any]) => {
                    // Category can be a string (direct permission) or an object (sub-categories)
                    if (typeof perms === 'string') {
                      const id = codeToIdMap[perms];
                      if (!id) return null;
                      return (
                        <label key={perms} className="flex items-center gap-3 p-3 bg-white dark:bg-dark-surface rounded-lg border border-gray-100 dark:border-gray-800 cursor-pointer hover:border-primary/30 transition-colors">
                           <div className="relative">
                              <input 
                                type="checkbox" 
                                checked={selectedIds.includes(id)}
                                onChange={() => handleTogglePermission(id)}
                                className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:bg-primary checked:border-primary transition-all"
                              />
                              <Check size={14} className="absolute top-0.5 left-0.5 text-white scale-0 peer-checked:scale-100 transition-transform" />
                           </div>
                           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{categoryName}</span>
                        </label>
                      );
                    }

                    return (
                      <div key={categoryName} className="space-y-3">
                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-1">{categoryName}</h4>
                        <div className="space-y-2">
                           {Object.entries(perms || {}).map(([action, code]: [string, any]) => {
                             const id = codeToIdMap[code];
                             if (!id) return null;

                             return (
                               <label key={code} className="flex items-center gap-3 group cursor-pointer">
                                  <div className="relative">
                                     <input 
                                       type="checkbox" 
                                       checked={selectedIds.includes(id)}
                                       onChange={() => handleTogglePermission(id)}
                                       className="peer appearance-none w-4 h-4 border-2 border-gray-200 dark:border-gray-700 rounded checked:bg-primary checked:border-primary transition-all"
                                     />
                                     <Check size={10} className="absolute top-0.5 left-0.5 text-white scale-0 peer-checked:scale-100 transition-transform" />
                                  </div>
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors">{action}</span>
                               </label>
                             );
                           })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
