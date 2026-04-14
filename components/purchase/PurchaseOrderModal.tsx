
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { PurchaseOrder } from '../../types';
import { useData } from '../../context/DataContext';

const purchaseOrderSchema = z.object({
  referenceNo: z.string().min(1, 'Reference No is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  linkedPurchaseRequestId: z.string().optional().nullable(),
  orderDate: z.string().min(1, 'Order date is required'),
  companyId: z.string().min(1, 'Company is required'),
  branchId: z.string().min(1, 'Branch is required'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    sku: z.string().optional(),
    quantity: z.number().min(1),
    unitCost: z.number().min(0),
    tax: z.number().min(0),
    receivedQuantity: z.number().default(0),
    pendingQuantity: z.number().default(0),
  })).min(1, 'At least one item is required'),
  paymentStatus: z.enum(['PAID', 'UNPAID', 'PARTIAL']),
  deliveryStatus: z.enum(['PENDING', 'DELIVERED', 'PROCESSING', 'CANCELLED']),
  notes: z.string().optional(),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  orderToEdit?: PurchaseOrder | null;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  orderToEdit,
}) => {
  const { t } = useTranslation();
  const { suppliers, products, companies, branches, purchaseRequests } = useData();
  
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema) as any,
    defaultValues: {
      referenceNo: '',
      orderDate: new Date().toISOString().split('T')[0],
      supplierId: '',
      companyId: '',
      branchId: '',
      items: [{ productId: '', sku: '', quantity: 1, unitCost: 0, tax: 0, receivedQuantity: 0, pendingQuantity: 1 }],
      paymentStatus: 'UNPAID',
      deliveryStatus: 'PENDING',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  React.useEffect(() => {
    if (orderToEdit) {
      reset({
        referenceNo: orderToEdit.referenceNo,
        orderDate: new Date(orderToEdit.orderDate).toISOString().split('T')[0],
        supplierId: typeof orderToEdit.supplierId === 'object' ? orderToEdit.supplierId?._id : orderToEdit.supplierId,
        linkedPurchaseRequestId: typeof orderToEdit.linkedPurchaseRequestId === 'object' ? orderToEdit.linkedPurchaseRequestId?._id : orderToEdit.linkedPurchaseRequestId,
        companyId: typeof orderToEdit.companyId === 'object' ? orderToEdit.companyId?._id : orderToEdit.companyId,
        branchId: typeof orderToEdit.branchId === 'object' ? orderToEdit.branchId?._id : orderToEdit.branchId,
        items: orderToEdit.items.map(item => ({
          productId: typeof item.productId === 'object' ? item.productId?._id : item.productId,
          sku: item.sku,
          quantity: item.quantity,
          unitCost: item.unitCost,
          tax: item.tax,
          receivedQuantity: item.receivedQuantity,
          pendingQuantity: item.pendingQuantity,
        })),
        paymentStatus: orderToEdit.paymentStatus as any,
        deliveryStatus: orderToEdit.deliveryStatus as any,
        notes: orderToEdit.notes,
      });
    } else {
      reset({
        referenceNo: `PO-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        orderDate: new Date().toISOString().split('T')[0],
        supplierId: '',
        companyId: '',
        branchId: '',
        items: [{ productId: '', sku: '', quantity: 1, unitCost: 0, tax: 0, receivedQuantity: 0, pendingQuantity: 1 }],
        paymentStatus: 'UNPAID',
        deliveryStatus: 'PENDING',
      });
    }
  }, [orderToEdit, reset]);

  const onSubmit = (data: PurchaseOrderFormData) => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const taxAmount = data.items.reduce((sum, item) => sum + item.tax, 0);
    const totalAmount = subtotal + taxAmount;
    
    onSave({ ...data, subtotal, taxAmount, totalAmount });
    onClose();
  };

  const onProductChange = (index: number, productId: string) => {
    const product = products.find(p => (p._id || p.id) === productId);
    if (product) {
      setValue(`items.${index}.sku`, product.sku);
      setValue(`items.${index}.unitCost`, product.cost);
      setValue(`items.${index}.pendingQuantity`, watch(`items.${index}.quantity`));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={orderToEdit ? t('edit_purchase_order') : t('add_purchase_order')}
      className="max-w-5xl"
    >
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t('order_no')}
            {...register('referenceNo')}
            error={errors.referenceNo?.message}
            required
          />
          <Input
            label={t('order_date')}
            type="date"
            {...register('orderDate')}
            error={errors.orderDate?.message}
            required
          />
          <Select
            label={t('supplier')}
            options={suppliers.map(s => ({ value: s._id || s.id, label: s.supplierName }))}
            {...register('supplierId')}
            error={errors.supplierId?.message}
            required
          />
          <Select
            label={t('company')}
            options={companies.map(c => ({ value: c._id || c.id, label: c.name }))}
            {...register('companyId')}
            error={errors.companyId?.message}
            required
          />
          <Select
            label={t('branch')}
            options={branches.map(b => ({ value: b._id || b.id, label: b.name }))}
            {...register('branchId')}
            error={errors.branchId?.message}
            required
          />
          <Select
            label={t('linked_pr')}
            options={[
              { value: '', label: t('none') },
              ...purchaseRequests.map(pr => ({ value: pr._id || pr.id, label: pr.prNumber }))
            ]}
            {...register('linkedPurchaseRequestId')}
            error={errors.linkedPurchaseRequestId?.message}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t('items')}</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', sku: '', quantity: 1, unitCost: 0, tax: 0, receivedQuantity: 0, pendingQuantity: 1 })}>
              <Plus size={16} className="mr-1" /> {t('add_item')}
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-100 rounded-lg relative">
              <div className="md:col-span-2">
                <Select
                  label={t('product')}
                  options={products.map(p => ({ value: p._id || p.id, label: p.productName }))}
                  {...register(`items.${index}.productId`)}
                  onChange={(e) => onProductChange(index, e.target.value)}
                  error={errors.items?.[index]?.productId?.message}
                  required
                />
              </div>
              <Input
                label={t('sku')}
                {...register(`items.${index}.sku`)}
                readOnly
                className="bg-gray-50"
              />
              <Input
                label={t('quantity')}
                type="number"
                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                onChange={(e) => setValue(`items.${index}.pendingQuantity`, Number(e.target.value) - watch(`items.${index}.receivedQuantity`))}
                error={errors.items?.[index]?.quantity?.message}
                required
              />
              <Input
                label={t('unit_cost')}
                type="number"
                {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
                error={errors.items?.[index]?.unitCost?.message}
                required
              />
              <div className="flex items-end gap-2">
                <Input
                  label={t('tax')}
                  type="number"
                  {...register(`items.${index}.tax`, { valueAsNumber: true })}
                  error={errors.items?.[index]?.tax?.message}
                  required
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label={t('payment_status')}
            options={[
              { value: 'UNPAID', label: t('unpaid') },
              { value: 'PARTIAL', label: t('partial') },
              { value: 'PAID', label: t('paid') },
            ]}
            {...register('paymentStatus')}
            error={errors.paymentStatus?.message}
            required
          />
          <Select
            label={t('delivery_status')}
            options={[
              { value: 'PENDING', label: t('pending') },
              { value: 'PROCESSING', label: t('processing') },
              { value: 'DELIVERED', label: t('delivered') },
              { value: 'CANCELLED', label: t('cancelled') },
            ]}
            {...register('deliveryStatus')}
            error={errors.deliveryStatus?.message}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="bg-gray-600 text-white border-none hover:bg-gray-700">
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {orderToEdit ? t('submit') : t('add_purchase_order')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
