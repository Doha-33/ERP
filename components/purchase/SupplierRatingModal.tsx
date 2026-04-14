
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { SupplierRating } from '../../types';

const supplierRatingSchema = z.object({
  supplier: z.string().min(1, 'Supplier is required'),
  quality: z.number().min(1).max(5),
  delivery: z.number().min(1).max(5),
  service: z.number().min(1).max(5),
  compliance: z.number().min(1).max(5),
});

type SupplierRatingFormData = z.infer<typeof supplierRatingSchema>;

interface SupplierRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const SupplierRatingModal: React.FC<SupplierRatingModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierRatingFormData>({
    resolver: zodResolver(supplierRatingSchema),
    defaultValues: {
      quality: 5,
      delivery: 5,
      service: 5,
      compliance: 5,
    },
  });

  const onSubmit = (data: SupplierRatingFormData) => {
    onSave(data);
    onClose();
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('add_supplier_rating')}
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
          <Input
            label={t('quality')}
            type="number"
            min={1}
            max={5}
            {...register('quality', { valueAsNumber: true })}
            error={errors.quality?.message}
            required
          />
          <Input
            label={t('delivery')}
            type="number"
            min={1}
            max={5}
            {...register('delivery', { valueAsNumber: true })}
            error={errors.delivery?.message}
            required
          />
          <Input
            label={t('service')}
            type="number"
            min={1}
            max={5}
            {...register('service', { valueAsNumber: true })}
            error={errors.service?.message}
            required
          />
          <Input
            label={t('compliance')}
            type="number"
            min={1}
            max={5}
            {...register('compliance', { valueAsNumber: true })}
            error={errors.compliance?.message}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="bg-gray-600 text-white border-none hover:bg-gray-700">
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {t('add_supplier_rating')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
