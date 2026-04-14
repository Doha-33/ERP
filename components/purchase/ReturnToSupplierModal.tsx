
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { ReturnToSupplier } from '../../types';

const returnToSupplierSchema = z.object({
  supplier: z.string().min(1, 'Supplier is required'),
  product: z.string().min(1, 'Product is required'),
  reasonForReturn: z.string().min(1, 'Reason is required'),
  returnQty: z.number().min(1),
  status: z.enum(['Approval', 'Pending', 'Rejected']),
});

type ReturnToSupplierFormData = z.infer<typeof returnToSupplierSchema>;

interface ReturnToSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  returnToEdit?: ReturnToSupplier | null;
}

export const ReturnToSupplierModal: React.FC<ReturnToSupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  returnToEdit,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReturnToSupplierFormData>({
    resolver: zodResolver(returnToSupplierSchema),
    defaultValues: returnToEdit || {
      returnQty: 1,
      status: 'Pending',
    },
  });

  React.useEffect(() => {
    if (returnToEdit) {
      reset(returnToEdit);
    } else {
      reset({ returnQty: 1, status: 'Pending' });
    }
  }, [returnToEdit, reset]);

  const onSubmit = (data: ReturnToSupplierFormData) => {
    onSave(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={returnToEdit ? t('edit_return_to_supplier') : t('add_return_to_supplier')}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t('supplier')}
            options={[{ value: '002', label: '002' }]}
            {...register('supplier')}
            error={errors.supplier?.message}
            required
          />
          <Select
            label={t('product')}
            options={[{ value: '33', label: '33' }]}
            {...register('product')}
            error={errors.product?.message}
            required
          />
          <Input
            label={t('reason_for_return')}
            {...register('reasonForReturn')}
            error={errors.reasonForReturn?.message}
            required
          />
          <Input
            label={t('return_qty')}
            type="number"
            {...register('returnQty', { valueAsNumber: true })}
            error={errors.returnQty?.message}
            required
          />
          {returnToEdit && (
            <Select
              label={t('status')}
              options={[
                { value: 'Pending', label: t('pending') },
                { value: 'Approval', label: t('approval') },
                { value: 'Rejected', label: t('rejected') },
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
            {returnToEdit ? t('submit') : t('add_return_to_supplier')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
