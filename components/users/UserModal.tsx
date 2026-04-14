
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, Edit2, Key, User as UserIcon } from 'lucide-react';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { User } from '../../services/user.service';
import roleService, { Role } from '../../services/role.service';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: any) => Promise<void>;
  userToEdit?: User | null;
}

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().optional().or(z.literal('')),
  roleId: z.string().min(1, 'Role is required'),
  state: z.enum(['ACTIVE', 'INACTIVE']),
}).refine((data) => {
  return true; 
}, {
  message: "Password is required",
  path: ["password"],
});

type UserFormInputs = z.infer<typeof userSchema>;

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      state: 'ACTIVE'
    }
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleService.getAllRoles();
        setRoles(data);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        reset({
          username: userToEdit.username,
          email: userToEdit.email,
          roleId: (userToEdit.roleId && typeof userToEdit.roleId === 'object') ? userToEdit.roleId._id : (userToEdit.roleId || ''),
          state: userToEdit.state as any,
          password: '',
        });
      } else {
        reset({
          username: '',
          email: '',
          password: '',
          roleId: roles[0]?._id || '',
          state: 'ACTIVE',
        });
      }
    }
  }, [userToEdit, isOpen, reset, roles]);

  const onSubmit = async (data: UserFormInputs) => {
    if (!userToEdit && (!data.password || data.password.length < 6)) {
        alert("Password is required and must be at least 6 characters for new users.");
        return;
    }

    try {
        const payload = { ...data };
        if (userToEdit && !payload.password) {
            delete payload.password;
        }
        await onSave(payload);
        onClose();
    } catch (e) {
        console.error("Form submission error:", e);
    }
  };

  const title = (
    <div className="flex items-center gap-2">
      {userToEdit ? <Edit2 size={20} className="text-primary" /> : <UserPlus size={20} className="text-primary" />}
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
         className="bg-[#4361EE] hover:bg-blue-700 text-white px-8 min-w-[140px] flex items-center gap-2"
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
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <Input 
               label={<span className="flex items-center gap-1">{t('username')} <span className="text-red-500">*</span></span>}
               placeholder="login_username"
               required 
               icon={<UserIcon size={16} />}
               {...register('username')} 
               error={errors.username?.message} 
            />

            <Select 
               label={<span className="flex items-center gap-1">{t('state')} <span className="text-red-500">*</span></span>}
               options={[
                  {value: 'ACTIVE', label: t('active')},
                  {value: 'INACTIVE', label: t('inactive')}
               ]}
               {...register('state')} 
               error={errors.state?.message}
            />

            <Input 
               label={<span className="flex items-center gap-1">{t('email')} <span className="text-red-500">*</span></span>}
               placeholder="email@example.com"
               type="email" 
               required 
               {...register('email')} 
               error={errors.email?.message} 
            />

            <Select 
               label={<span className="flex items-center gap-1">{t('role')} <span className="text-red-500">*</span></span>}
               options={roles.map(r => ({ value: r._id, label: r.name }))}
               {...register('roleId')} 
               error={errors.roleId?.message}
            />

            <Input 
               label={<span className="flex items-center gap-1">{t('password')} {!userToEdit && <span className="text-red-500">*</span>}</span>}
               placeholder={userToEdit ? "Leave blank to keep current" : "Min 6 characters"}
               type="password"
               icon={<Key size={16} />}
               {...register('password')} 
               error={errors.password?.message} 
            />
         </div>
      </form>
    </Modal>
  );
};
