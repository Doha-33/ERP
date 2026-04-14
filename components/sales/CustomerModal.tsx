
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { Customer } from '../../types';

const customerSchema = z.object({
  customerCode: z.string().min(1, 'Customer code is required'),
  customerName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  phoneNumber: z.string().min(5, 'Phone is required').or(z.literal('')),
  address: z.string().min(2, 'Address is required').or(z.literal('')),
  companyName: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customerToEdit?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customerToEdit,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (customerToEdit) {
      reset({
        customerCode: customerToEdit.customerCode,
        customerName: customerToEdit.customerName,
        email: customerToEdit.email,
        phoneNumber: customerToEdit.phoneNumber,
        address: customerToEdit.address,
        companyName: customerToEdit.companyName,
        status: customerToEdit.status,
      });
    } else {
      reset({
        customerCode: '',
        customerName: '',
        email: '',
        phoneNumber: '',
        address: '',
        companyName: '',
        status: 'ACTIVE',
      });
    }
  }, [customerToEdit, reset]);

  const onSubmit = (data: CustomerFormData) => {
    onSave({
      ...data,
      id: customerToEdit?.id || '',
    } as Customer);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customerToEdit ? t('edit_customer') : t('add_customer')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('customer_code')}
            placeholder="CUST001"
            {...register('customerCode')}
            error={errors.customerCode?.message}
            required
          />
          <Input
            label={t('customer_name')}
            placeholder="John Doe"
            {...register('customerName')}
            error={errors.customerName?.message}
            required
          />
          <Input
            label={t('address')}
            placeholder="123 Main St"
            {...register('address')}
            error={errors.address?.message}
          />
          <Input
            label={t('phone')}
            placeholder="0123456789"
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
          />
          <Input
            label={t('email')}
            placeholder="john@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
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
          <Input
            label={t('company_name')}
            placeholder="Google"
            {...register('companyName')}
            error={errors.companyName?.message}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="bg-gray-600 text-white border-none hover:bg-gray-700">
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {customerToEdit ? t('submit') : t('add_customer')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
