
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, Edit2, Plus } from 'lucide-react';
import { Button, Input } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Role } from '../../services/role.service';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: any) => Promise<void>;
  roleToEdit?: Role | null;
}

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().min(1, 'Description is required'),
});

type RoleFormInputs = z.infer<typeof roleSchema>;

export const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSave, roleToEdit }) => {
  const { t } = useTranslation();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormInputs>({
    resolver: zodResolver(roleSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (roleToEdit) {
        reset({
          name: roleToEdit.name,
          description: roleToEdit.description,
        });
      } else {
        reset({
          name: '',
          description: '',
        });
      }
    }
  }, [roleToEdit, isOpen, reset]);

  const onSubmit = async (data: RoleFormInputs) => {
    try {
        await onSave(data);
        onClose();
    } catch (e) {
        console.error("Form submission error:", e);
    }
  };

  const title = (
    <div className="flex items-center gap-2">
      {roleToEdit ? <Edit2 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
      <span className="text-[#2D3748] font-bold">{roleToEdit ? t('edit_role') : t('add_role')}</span>
    </div>
  );

  const footer = (
    <div className="flex justify-end gap-3 w-full">
       <Button 
         type="button" 
         className="bg-[#4A5568] hover:bg-[#2D3748] text-white px-8 min-w-[120px]" 
         onClick={onClose}
       >
         {t('cancel')}
       </Button>
       <Button 
         type="submit" 
         form="role-form" 
         disabled={isSubmitting} 
         className="bg-[#4361EE] hover:bg-blue-700 text-white px-8 min-w-[140px] flex items-center gap-2"
       >
         {isSubmitting ? 'Saving...' : (roleToEdit ? t('save') : t('add_role'))}
       </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      className="max-w-xl"
    >
      <form id="role-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
         <Input 
            label={<span className="flex items-center gap-1">{t('role_name')} <span className="text-red-500">*</span></span>}
            placeholder="e.g. Manager, HR, Editor"
            required 
            icon={<Shield size={16} />}
            {...register('name')} 
            error={errors.name?.message} 
         />

         <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
               <span className="flex items-center gap-1">{t('description')} <span className="text-red-500">*</span></span>
            </label>
            <textarea 
               className="w-full px-4 py-2.5 rounded-lg border border-[#A0AEC0] bg-white dark:bg-dark-surface 
               text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none h-32"
               placeholder="Briefly describe what this role does..."
               {...register('description')}
            ></textarea>
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
         </div>
      </form>
    </Modal>
  );
};
