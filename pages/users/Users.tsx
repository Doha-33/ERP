
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, Edit2, X } from 'lucide-react';
import { Button, Input, Select } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { UserRecord } from '../../types';
import { useData } from '../../context/DataContext';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: any) => Promise<void>;
  userToEdit?: UserRecord | null;
}

const userSchema = z.object({
  full_name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  branch_name: z.string().optional(),
  role_id: z.string().min(1, 'Required'),
  status: z.enum(['Active', 'Inactive']),
  notes: z.string().optional(),
  password: z.string().optional(),
});

type UserFormInputs = z.infer<typeof userSchema>;

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const { t } = useTranslation();
  const { roles } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      status: 'Active'
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        reset({
          full_name: userToEdit.full_name,
          email: userToEdit.email,
          role_id: userToEdit.role_id,
          status: userToEdit.status,
          branch_name: userToEdit.Branch?.name || '',
          notes: (userToEdit as any).notes || '',
        });
      } else {
        reset({
          full_name: '',
          email: '',
          role_id: roles[0]?.role_id || '',
          status: 'Active',
          branch_name: '',
          notes: '',
        });
      }
    }
  }, [userToEdit, isOpen, reset, roles]);

  const onSubmit = async (data: UserFormInputs) => {
    try {
        const payload = { ...data, username: data.email.split('@')[0] };
        await onSave(payload);
        onClose();
    } catch (e) {
        console.error(e);
    }
  };

  const title = (
    <div className="flex items-center gap-2">
      {userToEdit ? <Edit2 size={20} /> : <UserPlus size={20} />}
      <span className="text-[#2D3748] font-bold">{userToEdit ? t('edit_user') : t('add_user')}</span>
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
         form="user-form" 
         disabled={isSubmitting} 
         className="bg-[#4361EE] hover:bg-blue-700 text-white px-8 min-w-[120px] flex items-center gap-2"
       >
         {!userToEdit && <UserPlus size={18} />}
         {isSubmitting ? 'Saving...' : (userToEdit ? t('save') : t('add_user'))}
       </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      className="max-w-2xl"
    >
      <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <Input 
               label={<span className="flex items-center gap-1">{t('user_name')} <span className="text-red-500">*</span></span>}
               placeholder="XX"
               required 
               {...register('full_name')} 
               error={errors.full_name?.message} 
            />
            
            <Select 
               label={<span className="flex items-center gap-1">{t('states')} <span className="text-red-500">*</span></span>}
               options={[
                  {value: 'Active', label: t('active')},
                  {value: 'Inactive', label: t('inactive')}
               ]}
               {...register('status')} 
               error={errors.status?.message}
            />

            <Input 
               label={<span className="flex items-center gap-1">{t('email')} <span className="text-red-500">*</span></span>}
               placeholder="xxx"
               type="email" 
               required 
               {...register('email')} 
               error={errors.email?.message} 
            />

            <Select 
               label={<span className="flex items-center gap-1">{t('role')} <span className="text-red-500">*</span></span>}
               options={roles.map(r => ({ value: r.role_id, label: r.name }))}
               {...register('role_id')} 
               error={errors.role_id?.message}
            />

            <Input 
               label={<span className="flex items-center gap-1">{t('branch_name')} <span className="text-red-500">*</span></span>}
               placeholder="xxx"
               {...register('branch_name')} 
            />
         </div>

         <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
               <span className="flex items-center gap-1">{t('note')} <span className="text-red-500">*</span></span>
            </label>
            <textarea 
               className="w-full px-4 py-2.5 rounded-lg border border-[#A0AEC0] bg-white dark:bg-dark-surface 
               text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none h-32"
               {...register('notes')}
            ></textarea>
         </div>
      </form>
    </Modal>
  );
};
