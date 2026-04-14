import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Company } from '../../types';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: Company) => void;
  companyToEdit?: Company | null;
}

const companySchema = z.object({
  name: z.string().min(1, 'Required'),
  taxNumber: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  defaultCurrency: z.string().min(1, 'Required'),
});

type CompanyFormInputs = z.infer<typeof companySchema>;

export const CompanyModal: React.FC<CompanyModalProps> = ({ isOpen, onClose, onSave, companyToEdit }) => {
  const { t } = useTranslation();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormInputs>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      defaultCurrency: 'EGP'
    }
  });

  useEffect(() => {
    if (companyToEdit) {
      reset({
        name: companyToEdit.name,
        taxNumber: companyToEdit.taxNumber,
        email: companyToEdit.email,
        defaultCurrency: companyToEdit.defaultCurrency,
      });
    } else {
      reset({
        name: '',
        taxNumber: '',
        email: '',
        defaultCurrency: 'EGP',
      });
    }
  }, [companyToEdit, isOpen, reset]);

  const onSubmit = (data: CompanyFormInputs) => {
    const newCompany: Company = {
      id: companyToEdit ? companyToEdit.id : Math.random().toString(36).substr(2, 9),
      ...data,
    };
    onSave(newCompany);
    onClose();
  };

  const title = (
    <>
      <span className="text-lg">{companyToEdit ? '✎' : '⊕'}</span> {companyToEdit ? t('edit_company') : t('add_company')}
    </>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="company-form" className="bg-[#4361EE] hover:bg-blue-700">{companyToEdit ? t('save') : t('add_company')}</Button>
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
      <form id="company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-6">
                <Input 
                   label={t('company_name') + ' *'} 
                   placeholder="Company Name"
                   {...register('name')} 
                   error={errors.name?.message} 
                />
                
                <Select 
                   label={t('default_currency') + ' *'} 
                   options={[
                     {value: 'EGP', label: 'EGP'},
                     {value: 'USD', label: 'USD'},
                     {value: 'EUR', label: 'EUR'},
                     {value: 'SAR', label: 'SAR'}
                   ]}
                   {...register('defaultCurrency')}
                   error={errors.defaultCurrency?.message}
                />
             </div>
             
             <div className="space-y-6">
                <Input 
                   label={t('tax_number') + ' *'} 
                   placeholder="TAX Number" 
                   {...register('taxNumber')} 
                   error={errors.taxNumber?.message} 
                />
                
                <Input 
                   label={t('email') + ' *'} 
                   placeholder="Email" 
                   {...register('email')} 
                   error={errors.email?.message} 
                />
             </div>
         </div>
      </form>
    </Modal>
  );
};