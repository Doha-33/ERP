
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Plus } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { SalesOrder } from '../../types';
import { useData } from '../../context/DataContext';

const orderSchema = z.object({
  orderNo: z.string().min(1, 'Order number is required'),
  customerId: z.string().min(1, 'Customer is required'),
  companyId: z.string().min(1, 'Company is required'),
  branchId: z.string().min(1, 'Branch is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  salespersonId: z.string().min(1, 'Salesperson is required'),
  paymentStatus: z.enum(['PAID', 'UNPAID', 'PARTIALLY_PAID']),
  deliveryStatus: z.enum(['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    discount: z.number().min(0),
    tax: z.number().min(0),
  })).min(1),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: any) => void;
  orderToEdit?: SalesOrder | null;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  orderToEdit,
}) => {
  const { t } = useTranslation();
  const { customers, companies, branches, warehouses, employees, products } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      status: 'DRAFT',
      paymentStatus: 'UNPAID',
      deliveryStatus: 'PENDING',
      items: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    if (orderToEdit) {
      reset({
        orderNo: orderToEdit.orderNo,
        customerId: typeof orderToEdit.customerId === 'object' ? orderToEdit.customerId._id : orderToEdit.customerId,
        companyId: typeof orderToEdit.companyId === 'object' ? orderToEdit.companyId._id : orderToEdit.companyId,
        branchId: typeof orderToEdit.branchId === 'object' ? orderToEdit.branchId._id : orderToEdit.branchId,
        warehouseId: typeof orderToEdit.warehouseId === 'object' ? orderToEdit.warehouseId._id : orderToEdit.warehouseId,
        salespersonId: typeof orderToEdit.salespersonId === 'object' ? orderToEdit.salespersonId._id : orderToEdit.salespersonId,
        paymentStatus: orderToEdit.paymentStatus,
        deliveryStatus: orderToEdit.deliveryStatus,
        status: orderToEdit.status,
        notes: orderToEdit.notes,
        items: orderToEdit.items.map(item => ({
          productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          tax: item.tax,
        })),
      });
    } else {
      reset({
        orderNo: '',
        customerId: '',
        companyId: '',
        branchId: '',
        warehouseId: '',
        salespersonId: '',
        paymentStatus: 'UNPAID',
        deliveryStatus: 'PENDING',
        status: 'DRAFT',
        notes: '',
        items: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 }],
      });
    }
  }, [orderToEdit, reset]);

  const onSubmit: SubmitHandler<OrderFormData> = (data) => {
    onSave({
      ...data,
      id: orderToEdit?.id || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={orderToEdit ? t('edit_order') : t('add_order')} className="max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 dark:text-gray-300">Order Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Order No."
              {...register('orderNo')}
              error={errors.orderNo?.message}
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
              label="Company"
              options={companies.map(c => ({ value: c.id, label: c.name }))}
              {...register('companyId')}
              error={errors.companyId?.message}
              required
            />
            <Select
              label="Branch"
              options={branches.map(b => ({ value: b.id, label: b.name }))}
              {...register('branchId')}
              error={errors.branchId?.message}
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
              label="Salesperson"
              options={employees.map(e => ({ value: e.id, label: e.fullName }))}
              {...register('salespersonId')}
              error={errors.salespersonId?.message}
              required
            />
            <Select
              label="Payment Status"
              options={[
                { value: 'UNPAID', label: 'Unpaid' },
                { value: 'PAID', label: 'Paid' },
                { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
              ]}
              {...register('paymentStatus')}
              error={errors.paymentStatus?.message}
              required
            />
            <Select
              label="Delivery Status"
              options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'SHIPPED', label: 'Shipped' },
                { value: 'DELIVERED', label: 'Delivered' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              {...register('deliveryStatus')}
              error={errors.deliveryStatus?.message}
              required
            />
            <Select
              label="Order Status"
              options={[
                { value: 'DRAFT', label: 'Draft' },
                { value: 'CONFIRMED', label: 'Confirmed' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              {...register('status')}
              error={errors.status?.message}
              required
            />
          </div>
          <Input
            label="Notes"
            {...register('notes')}
            error={errors.notes?.message}
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 dark:text-gray-300">Items</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl relative items-end">
              {index > 0 && (
                <button type="button" onClick={() => remove(index)} className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-500 rounded-full">
                  <X size={14} />
                </button>
              )}
              <div className="md:col-span-2">
                <Select
                  label="Product"
                  options={products.map(p => ({ value: p.id, label: p.productName }))}
                  {...register(`items.${index}.productId` as const)}
                  error={errors.items?.[index]?.productId?.message}
                  required
                />
              </div>
              <Input
                label="Qty"
                type="number"
                {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                error={errors.items?.[index]?.quantity?.message}
                required
              />
              <Input
                label="Unit Price"
                type="number"
                {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                error={errors.items?.[index]?.unitPrice?.message}
                required
              />
              <Input
                label="Discount"
                type="number"
                {...register(`items.${index}.discount` as const, { valueAsNumber: true })}
                error={errors.items?.[index]?.discount?.message}
              />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 })} className="w-full border-primary text-primary">
            <Plus size={18} /> Add Another Item
          </Button>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="bg-gray-600 text-white border-none hover:bg-gray-700">
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {orderToEdit ? t('submit') : 'Add Sales'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
