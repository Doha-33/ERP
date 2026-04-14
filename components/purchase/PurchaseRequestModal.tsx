
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { PurchaseRequest } from '../../types';
import { useData } from '../../context/DataContext';

const purchaseRequestSchema = z.object({
  prNumber: z.string().min(1, 'PR Number is required'),
  requestDate: z.string().min(1, 'Request date is required'),
  department: z.string().min(1, 'Department is required'),
  items: z.array(z.object({
    productId: z.string().optional().nullable(),
    itemName: z.string().min(1, 'Item name is required'),
    requiredQuantity: z.number().min(1),
    estimatedUnitCost: z.number().min(0),
    totalCost: z.number().min(0),
  })).min(1, 'At least one item is required'),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  notes: z.string().optional(),
});

type PurchaseRequestFormData = z.infer<typeof purchaseRequestSchema>;

interface PurchaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  requestToEdit?: PurchaseRequest | null;
}

export const PurchaseRequestModal: React.FC<PurchaseRequestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  requestToEdit,
}) => {
  const { t } = useTranslation();
  const { departments, products } = useData();
  
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PurchaseRequestFormData>({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues: {
      prNumber: '',
      requestDate: new Date().toISOString().split('T')[0],
      department: '',
      items: [{ itemName: '', requiredQuantity: 1, estimatedUnitCost: 0, totalCost: 0 }],
      status: 'PENDING',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  React.useEffect(() => {
    if (requestToEdit) {
      reset({
        prNumber: requestToEdit.prNumber,
        requestDate: new Date(requestToEdit.requestDate).toISOString().split('T')[0],
        department: requestToEdit.department,
        items: requestToEdit.items.map(item => ({
          productId: typeof item.productId === 'object' ? item.productId?._id : item.productId,
          itemName: item.itemName,
          requiredQuantity: item.requiredQuantity,
          estimatedUnitCost: item.estimatedUnitCost,
          totalCost: item.totalCost,
        })),
        status: requestToEdit.status as any,
        notes: requestToEdit.notes,
      });
    } else {
      reset({
        prNumber: `PR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        requestDate: new Date().toISOString().split('T')[0],
        department: '',
        items: [{ itemName: '', requiredQuantity: 1, estimatedUnitCost: 0, totalCost: 0 }],
        status: 'PENDING',
      });
    }
  }, [requestToEdit, reset]);

  const onSubmit = (data: PurchaseRequestFormData) => {
    onSave(data);
    onClose();
  };

  const calculateTotal = (index: number) => {
    const qty = watch(`items.${index}.requiredQuantity`);
    const cost = watch(`items.${index}.estimatedUnitCost`);
    setValue(`items.${index}.totalCost`, qty * cost);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={requestToEdit ? t('edit_purchase_request') : t('add_purchase_request')}
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t('pr_number')}
            {...register('prNumber')}
            error={errors.prNumber?.message}
            required
          />
          <Input
            label={t('request_date')}
            type="date"
            {...register('requestDate')}
            error={errors.requestDate?.message}
            required
          />
          <Select
            label={t('department')}
            options={departments.map(d => ({ value: d.departmentName, label: d.departmentName }))}
            {...register('department')}
            error={errors.department?.message}
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t('items')}</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ itemName: '', requiredQuantity: 1, estimatedUnitCost: 0, totalCost: 0 })}>
              <Plus size={16} className="mr-1" /> {t('add_item')}
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-100 rounded-lg relative">
              <div className="md:col-span-2">
                <Input
                  label={t('item_name')}
                  {...register(`items.${index}.itemName`)}
                  error={errors.items?.[index]?.itemName?.message}
                  required
                />
              </div>
              <Input
                label={t('quantity')}
                type="number"
                {...register(`items.${index}.requiredQuantity`, { valueAsNumber: true })}
                onChange={() => calculateTotal(index)}
                error={errors.items?.[index]?.requiredQuantity?.message}
                required
              />
              <Input
                label={t('unit_cost')}
                type="number"
                {...register(`items.${index}.estimatedUnitCost`, { valueAsNumber: true })}
                onChange={() => calculateTotal(index)}
                error={errors.items?.[index]?.estimatedUnitCost?.message}
                required
              />
              <div className="flex items-end gap-2">
                <Input
                  label={t('total')}
                  type="number"
                  {...register(`items.${index}.totalCost`, { valueAsNumber: true })}
                  readOnly
                  className="bg-gray-50"
                />
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-50 rounded mb-1">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Input
            label={t('notes')}
            {...register('notes')}
            error={errors.notes?.message}
          />
          {requestToEdit && (
            <Select
              label={t('status')}
              options={[
                { value: 'PENDING', label: t('pending') },
                { value: 'APPROVED', label: t('approved') },
                { value: 'REJECTED', label: t('rejected') },
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
            {requestToEdit ? t('submit') : t('add_purchase_request')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
