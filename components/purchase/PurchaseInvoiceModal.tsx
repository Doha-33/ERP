
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { PurchaseInvoice } from '../../types';
import { useData } from '../../context/DataContext';

const purchaseInvoiceSchema = z.object({
  invoiceNo: z.string().min(1, 'Invoice No is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  purchaseOrderId: z.string().min(1, 'Purchase Order is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  warehouseId: z.string().optional().nullable(),
  companyId: z.string().min(1, 'Company is required'),
  branchId: z.string().min(1, 'Branch is required'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    sku: z.string().optional(),
    quantity: z.number().min(1),
    unitCost: z.number().min(0),
    tax: z.number().min(0),
    total: z.number().min(0),
  })).min(1, 'At least one item is required'),
  paymentStatus: z.enum(['PAID', 'UNPAID', 'PARTIAL']),
  deliveryStatus: z.enum(['PENDING', 'DELIVERED', 'PROCESSING', 'CANCELLED']),
  notes: z.string().optional(),
});

type PurchaseInvoiceFormData = z.infer<typeof purchaseInvoiceSchema>;

interface PurchaseInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  invoiceToEdit?: PurchaseInvoice | null;
}

export const PurchaseInvoiceModal: React.FC<PurchaseInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  invoiceToEdit,
}) => {
  const { t } = useTranslation();
  const { suppliers, products, companies, branches, purchaseOrders, warehouses } = useData();
  
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PurchaseInvoiceFormData>({
    resolver: zodResolver(purchaseInvoiceSchema),
    defaultValues: {
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      supplierId: '',
      purchaseOrderId: '',
      companyId: '',
      branchId: '',
      items: [{ productId: '', sku: '', quantity: 1, unitCost: 0, tax: 0, total: 0 }],
      paymentStatus: 'UNPAID',
      deliveryStatus: 'PENDING',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  React.useEffect(() => {
    if (invoiceToEdit) {
      reset({
        invoiceNo: invoiceToEdit.invoiceNo,
        invoiceDate: new Date(invoiceToEdit.invoiceDate).toISOString().split('T')[0],
        dueDate: new Date(invoiceToEdit.dueDate).toISOString().split('T')[0],
        supplierId: typeof invoiceToEdit.supplierId === 'object' ? invoiceToEdit.supplierId?._id : invoiceToEdit.supplierId,
        purchaseOrderId: typeof invoiceToEdit.purchaseOrderId === 'object' ? invoiceToEdit.purchaseOrderId?._id : invoiceToEdit.purchaseOrderId,
        warehouseId: typeof invoiceToEdit.warehouseId === 'object' ? invoiceToEdit.warehouseId?._id : invoiceToEdit.warehouseId,
        companyId: typeof invoiceToEdit.companyId === 'object' ? invoiceToEdit.companyId?._id : invoiceToEdit.companyId,
        branchId: typeof invoiceToEdit.branchId === 'object' ? invoiceToEdit.branchId?._id : invoiceToEdit.branchId,
        items: invoiceToEdit.items.map(item => ({
          productId: typeof item.productId === 'object' ? item.productId?._id : item.productId,
          sku: item.sku,
          quantity: item.quantity,
          unitCost: item.unitCost,
          tax: item.tax,
          total: item.total,
        })),
        paymentStatus: invoiceToEdit.paymentStatus as any,
        deliveryStatus: invoiceToEdit.deliveryStatus as any,
        notes: invoiceToEdit.notes,
      });
    } else {
      reset({
        invoiceNo: `PINV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        supplierId: '',
        purchaseOrderId: '',
        companyId: '',
        branchId: '',
        items: [{ productId: '', sku: '', quantity: 1, unitCost: 0, tax: 0, total: 0 }],
        paymentStatus: 'UNPAID',
        deliveryStatus: 'PENDING',
      });
    }
  }, [invoiceToEdit, reset]);

  const onSubmit = (data: PurchaseInvoiceFormData) => {
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
      calculateItemTotal(index);
    }
  };

  const calculateItemTotal = (index: number) => {
    const qty = watch(`items.${index}.quantity`);
    const cost = watch(`items.${index}.unitCost`);
    const tax = watch(`items.${index}.tax`);
    setValue(`items.${index}.total`, (qty * cost) + tax);
  };

  const onPOChange = (poId: string) => {
    const po = purchaseOrders.find(o => (o._id || o.id) === poId);
    if (po) {
      setValue('supplierId', typeof po.supplierId === 'object' ? po.supplierId?._id : po.supplierId);
      setValue('companyId', typeof po.companyId === 'object' ? po.companyId?._id : po.companyId);
      setValue('branchId', typeof po.branchId === 'object' ? po.branchId?._id : po.branchId);
      
      const newItems = po.items.map(item => ({
        productId: typeof item.productId === 'object' ? item.productId?._id : item.productId,
        sku: item.sku,
        quantity: item.quantity,
        unitCost: item.unitCost,
        tax: item.tax,
        total: (item.quantity * item.unitCost) + item.tax,
      }));
      setValue('items', newItems);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={invoiceToEdit ? t('edit_purchase_invoice') : t('add_purchase_invoice')}
      className="max-w-5xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t('invoice_no')}
            {...register('invoiceNo')}
            error={errors.invoiceNo?.message}
            required
          />
          <Input
            label={t('invoice_date')}
            type="date"
            {...register('invoiceDate')}
            error={errors.invoiceDate?.message}
            required
          />
          <Input
            label={t('due_date')}
            type="date"
            {...register('dueDate')}
            error={errors.dueDate?.message}
            required
          />
          <Select
            label={t('purchase_order')}
            options={[
              { value: '', label: t('select_po') },
              ...purchaseOrders.map(po => ({ value: po._id || po.id, label: po.referenceNo }))
            ]}
            {...register('purchaseOrderId')}
            onChange={(e) => onPOChange(e.target.value)}
            error={errors.purchaseOrderId?.message}
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
            label={t('warehouse')}
            options={warehouses.map(w => ({ value: w._id || w.id, label: w.warehouseName }))}
            {...register('warehouseId')}
            error={errors.warehouseId?.message}
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
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t('items')}</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', sku: '', quantity: 1, unitCost: 0, tax: 0, total: 0 })}>
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
                onChange={() => calculateItemTotal(index)}
                error={errors.items?.[index]?.quantity?.message}
                required
              />
              <Input
                label={t('unit_cost')}
                type="number"
                {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
                onChange={() => calculateItemTotal(index)}
                error={errors.items?.[index]?.unitCost?.message}
                required
              />
              <div className="flex items-end gap-2">
                <Input
                  label={t('tax')}
                  type="number"
                  {...register(`items.${index}.tax`, { valueAsNumber: true })}
                  onChange={() => calculateItemTotal(index)}
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
            {invoiceToEdit ? t('submit') : t('add_purchase_invoice')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
