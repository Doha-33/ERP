
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, FileText } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { SalesReturn } from '../../types';
import { useData } from '../../context/DataContext';

const returnSchema = z.object({
  originalInvoiceId: z.string().min(1, 'Invoice is required'),
  customerId: z.string().min(1, 'Customer is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  refundStatus: z.enum(['PENDING', 'REFUNDED', 'REJECTED']),
  reasonForReturn: z.string().min(1, 'Reason is required'),
  returnQuantity: z.number().min(1),
  productId: z.string().min(1, 'Product is required'),
});

type ReturnFormData = z.infer<typeof returnSchema>;

interface SalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ret: any) => void;
  returnToEdit?: SalesReturn | null;
}

export const SalesReturnModal: React.FC<SalesReturnModalProps> = ({
  isOpen,
  onClose,
  onSave,
  returnToEdit,
}) => {
  const { t } = useTranslation();
  const { salesInvoices, customers, warehouses, products } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      refundStatus: 'PENDING',
    },
  });

  useEffect(() => {
    if (returnToEdit) {
      reset({
        originalInvoiceId: typeof returnToEdit.originalInvoiceId === 'object' ? returnToEdit.originalInvoiceId?.id : returnToEdit.originalInvoiceId,
        customerId: typeof returnToEdit.customerId === 'object' ? returnToEdit.customerId?.id : returnToEdit.customerId,
        warehouseId: typeof returnToEdit.warehouseId === 'object' ? returnToEdit.warehouseId?.id : returnToEdit.warehouseId,
        refundStatus: returnToEdit.refundStatus,
        reasonForReturn: returnToEdit.items?.[0]?.reasonForReturn || '',
        returnQuantity: returnToEdit.items?.[0]?.returnQuantity || 0,
        productId: typeof returnToEdit.items?.[0]?.productId === 'object' ? returnToEdit.items?.[0]?.productId?.id : returnToEdit.items?.[0]?.productId,
      });
    } else {
      reset({
        originalInvoiceId: '',
        customerId: '',
        warehouseId: '',
        refundStatus: 'PENDING',
        reasonForReturn: '',
        returnQuantity: 0,
        productId: '',
      });
    }
  }, [returnToEdit, reset]);

  const onSubmit = (data: ReturnFormData) => {
    onSave({
      ...data,
      id: returnToEdit?.id || undefined,
      returnNumber: returnToEdit?.returnNumber || `RET-${Date.now()}`,
      returnDate: returnToEdit?.returnDate || new Date().toISOString(),
      items: [
        {
          productId: data.productId,
          returnQuantity: data.returnQuantity,
          reasonForReturn: data.reasonForReturn,
          // Other fields would be calculated or fetched
        }
      ]
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={returnToEdit ? t('edit_sales_return') : t('add_sales_return')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 dark:text-gray-300">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Original Invoice"
              options={salesInvoices.map(i => ({ value: i.id, label: i.invoiceNumber }))}
              {...register('originalInvoiceId')}
              error={errors.originalInvoiceId?.message}
              required
            />
            <Select
              label="Product"
              options={products.map(p => ({ value: p.id, label: p.productName }))}
              {...register('productId')}
              error={errors.productId?.message}
              required
            />
            <Select
              label="Customer"
              options={customers.map(c => ({ value: c.id, label: c.customerName }))}
              {...register('customerId')}
              error={errors.customerId?.message}
              required
            />
            <Select
              label="Warehouse"
              options={warehouses.map(w => ({ value: w.id, label: w.warehouseName }))}
              {...register('warehouseId')}
              error={errors.warehouseId?.message}
              required
            />
            <Select
              label="Refund Status"
              options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'REFUNDED', label: 'Refunded' },
                { value: 'REJECTED', label: 'Rejected' },
              ]}
              {...register('refundStatus')}
              error={errors.refundStatus?.message}
              required
            />
            <Input
              label="Return Quantity"
              type="number"
              {...register('returnQuantity', { valueAsNumber: true })}
              error={errors.returnQuantity?.message}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Return</label>
          <textarea
            {...register('reasonForReturn')}
            className="w-full px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none h-24"
            placeholder="Enter reason for return..."
          />
          {errors.reasonForReturn && <p className="text-red-500 text-xs">{errors.reasonForReturn.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {returnToEdit ? t('submit') : t('add_sales_return')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
