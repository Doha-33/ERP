
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { Supplier } from '../../types';
import { useData } from '../../context/DataContext';

const supplierSchema = z.object({
  supplierCode: z.string().min(1, 'Supplier code is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  companyId: z.string().min(1, 'Company is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  branchId: z.string().min(1, 'Branch is required'),
  paymentTerms: z.string().optional(),
  companyName: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  supplierToEdit?: Supplier | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  supplierToEdit,
}) => {
  const { t } = useTranslation();
  const { companies, branches } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplierToEdit || {
      status: 'ACTIVE',
    },
  });

  React.useEffect(() => {
    if (supplierToEdit) {
      reset({
        supplierCode: supplierToEdit.supplierCode,
        supplierName: supplierToEdit.supplierName,
        companyId: typeof supplierToEdit.companyId === 'object' ? supplierToEdit.companyId?._id : supplierToEdit.companyId,
        email: supplierToEdit.email,
        phoneNumber: supplierToEdit.phoneNumber,
        address: supplierToEdit.address,
        branchId: typeof supplierToEdit.branchId === 'object' ? supplierToEdit.branchId?._id : supplierToEdit.branchId,
        paymentTerms: supplierToEdit.paymentTerms,
        companyName: supplierToEdit.companyName,
        status: supplierToEdit.status,
      });
    } else {
      reset({ status: 'ACTIVE' });
    }
  }, [supplierToEdit, reset]);

  const onSubmit = (data: SupplierFormData) => {
    const selectedCompany = companies.find(c => (c._id || c.id) === data.companyId);
    const finalData = {
      ...data,
      companyName: selectedCompany?.name || data.companyName,
    };
    onSave(finalData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplierToEdit ? t('edit_supplier') : t('add_supplier')}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('supplier_code')}
            {...register('supplierCode')}
            error={errors.supplierCode?.message}
            required
          />
          <Input
            label={t('supplier_name')}
            {...register('supplierName')}
            error={errors.supplierName?.message}
            required
          />
          <Select
            label={t('company_name')}
            options={companies.map(c => ({ value: c._id || c.id, label: c.name }))}
            {...register('companyId')}
            error={errors.companyId?.message}
            required
          />
          <Input
            label={t('email_address')}
            type="email"
            {...register('email')}
            error={errors.email?.message}
            required
          />
          <Input
            label={t('phone_number')}
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
            required
          />
          <Input
            label={t('address')}
            {...register('address')}
            error={errors.address?.message}
            required
          />
          <Select
            label={t('branch')}
            options={branches.map(b => ({ value: b._id || b.id, label: b.name }))}
            {...register('branchId')}
            error={errors.branchId?.message}
            required
          />
          <Input
            label={t('payment_terms')}
            {...register('paymentTerms')}
            error={errors.paymentTerms?.message}
          />
          {supplierToEdit && (
            <Select
              label={t('status')}
              options={[
                { value: 'ACTIVE', label: t('active') },
                { value: 'INACTIVE', label: t('inactive') },
              ]}
              {...register('status')}
              error={errors.status?.message}
              required
            />
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="bg-gray-600 text-white border-none hover:bg-gray-700">
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {supplierToEdit ? t('submit') : t('add_supplier')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
