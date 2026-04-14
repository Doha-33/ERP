
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Branch } from '../../types';
import { useData } from '../../context/DataContext';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (branch: Branch) => void;
  branchToEdit?: Branch | null;
}

const branchSchema = z.object({
  companyId: z.string().min(1, 'Required'),
  name: z.string().min(1, 'Required'),
  email: z.string().optional(),
  address: z.string().min(1, 'Required'),
});

type BranchFormInputs = z.infer<typeof branchSchema>;

export const BranchModal: React.FC<BranchModalProps> = ({ isOpen, onClose, onSave, branchToEdit }) => {
  const { t } = useTranslation();
  const { companies } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormInputs>({
    resolver: zodResolver(branchSchema),
  });

  useEffect(() => {
    if (branchToEdit) {
      reset({
        companyId: branchToEdit.companyId,
        name: branchToEdit.name,
        email: branchToEdit.email,
        address: branchToEdit.address,
      });
    } else {
      reset({
        companyId: companies.length > 0 ? companies[0].id : '',
        name: '',
        email: '',
        address: '',
      });
    }
  }, [branchToEdit, isOpen, reset, companies]);

  const onSubmit = (data: BranchFormInputs) => {
    const newBranch: Branch = {
      id: branchToEdit ? branchToEdit.id : '',
      email: data.email || '',
      state: 'ACTIVE',
      ...data,
    };
    onSave(newBranch);
    onClose();
  };

  const title = (
    <>
      <span className="text-lg">{branchToEdit ? '✎' : '⊕'}</span> {branchToEdit ? t('edit_branch') : t('add_branch')}
    </>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="branch-form" className="bg-[#4361EE] hover:bg-blue-700">{branchToEdit ? t('save') : t('add_branch')}</Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      className="max-w-4xl"
    >
      <form id="branch-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-6">
                <Select 
                   label={t('company_name') + ' *'} 
                   options={companies.map(c => ({ value: c.id, label: c.name }))}
                   {...register('companyId')} 
                   error={errors.companyId?.message} 
                />
                
                <Input 
                   label={t('address') + ' *'} 
                   placeholder="Address"
                   {...register('address')}
                   error={errors.address?.message}
                />
             </div>
             
             <div className="space-y-6">
                <Input 
                   label={t('branch_name') + ' *'} 
                   placeholder="Branch Name" 
                   {...register('name')} 
                   error={errors.name?.message} 
                />
                
                <Input 
                   label={t('email')} 
                   placeholder="Email (Optional)" 
                   {...register('email')} 
                   error={errors.email?.message} 
                />
             </div>
         </div>
      </form>
    </Modal>
  );
};
