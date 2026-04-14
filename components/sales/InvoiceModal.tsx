
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { SalesInvoice } from '../../types';
import { useData } from '../../context/DataContext';

const invoiceSchema = z.object({
  salesOrderId: z.string().min(1, 'Order is required'),
  paymentStatus: z.enum(['PAID', 'UNPAID', 'PARTIALLY_PAID']),
  dueDate: z.string().optional(),
  warehouseId: z.string().min(1, 'Warehouse is required'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: any) => void;
  invoiceToEdit?: SalesInvoice | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  invoiceToEdit,
}) => {
  const { t } = useTranslation();
  const { salesOrders, warehouses } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      paymentStatus: 'UNPAID',
    },
  });

  useEffect(() => {
    if (invoiceToEdit) {
      reset({
        salesOrderId: typeof invoiceToEdit.salesOrderId === 'object' ? invoiceToEdit.salesOrderId?.id : invoiceToEdit.salesOrderId,
        paymentStatus: invoiceToEdit.paymentStatus,
        dueDate: invoiceToEdit.dueDate ? new Date(invoiceToEdit.dueDate).toISOString().split('T')[0] : '',
        warehouseId: typeof invoiceToEdit.warehouseId === 'object' ? invoiceToEdit.warehouseId?.id : invoiceToEdit.warehouseId,
      });
    } else {
      reset({
        salesOrderId: '',
        paymentStatus: 'UNPAID',
        dueDate: '',
        warehouseId: '',
      });
    }
  }, [invoiceToEdit, reset]);

  const onSubmit = (data: InvoiceFormData) => {
    onSave({
      ...data,
      id: invoiceToEdit?.id || undefined,
      invoiceNumber: invoiceToEdit?.invoiceNumber || `INV-${Date.now()}`,
      issuedDate: invoiceToEdit?.issuedDate || new Date().toISOString(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={invoiceToEdit ? t('edit_invoice') : t('add_invoice')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Sales Order"
            options={salesOrders.map(o => ({ value: o.id, label: o.orderNo }))}
            {...register('salesOrderId')}
            error={errors.salesOrderId?.message}
            required
          />
          <Select
            label="Payment Status"
            options={[
              { value: 'PAID', label: 'Paid' },
              { value: 'UNPAID', label: 'Unpaid' },
              { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
            ]}
            {...register('paymentStatus')}
            error={errors.paymentStatus?.message}
            required
          />
          <Input
            label="Due Date"
            type="date"
            {...register('dueDate')}
            error={errors.dueDate?.message}
          />
          <Select
            label="Warehouse"
            options={warehouses.map(w => ({ value: w.id, label: w.warehouseName }))}
            {...register('warehouseId')}
            error={errors.warehouseId?.message}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {invoiceToEdit ? t('submit') : t('add_invoice')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
