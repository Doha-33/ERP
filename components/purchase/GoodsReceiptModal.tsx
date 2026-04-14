
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { GoodsReceipt } from '../../types';
import { useData } from '../../context/DataContext';

const goodsReceiptSchema = z.object({
  grNumber: z.string().min(1, 'GR Number is required'),
  purchaseOrderId: z.string().min(1, 'Purchase Order is required'),
  receiptDate: z.string().min(1, 'Receipt date is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  companyId: z.string().min(1, 'Company is required'),
  branchId: z.string().min(1, 'Branch is required'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    sku: z.string().optional(),
    orderedQuantity: z.number().min(1),
    receivedQuantity: z.number().min(0),
    acceptedQuantity: z.number().min(0),
    rejectedQuantity: z.number().min(0),
    unitCost: z.number().min(0),
    totalValue: z.number().min(0),
  })).min(1, 'At least one item is required'),
  receivedBy: z.string().min(1, 'Received by is required'),
  notes: z.string().optional(),
});

type GoodsReceiptFormData = z.infer<typeof goodsReceiptSchema>;

interface GoodsReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  receiptToEdit?: GoodsReceipt | null;
}

export const GoodsReceiptModal: React.FC<GoodsReceiptModalProps> = ({
  isOpen,
  onClose,
  onSave,
  receiptToEdit,
}) => {
  const { t } = useTranslation();
  const { products, companies, branches, purchaseOrders, warehouses } = useData();
  
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GoodsReceiptFormData>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: {
      grNumber: '',
      receiptDate: new Date().toISOString().split('T')[0],
      purchaseOrderId: '',
      warehouseId: '',
      companyId: '',
      branchId: '',
      items: [{ productId: '', sku: '', orderedQuantity: 1, receivedQuantity: 1, acceptedQuantity: 1, rejectedQuantity: 0, unitCost: 0, totalValue: 0 }],
      receivedBy: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  React.useEffect(() => {
    if (receiptToEdit) {
      reset({
        grNumber: receiptToEdit.grNumber,
        receiptDate: new Date(receiptToEdit.receiptDate).toISOString().split('T')[0],
        purchaseOrderId: typeof receiptToEdit.purchaseOrderId === 'object' ? receiptToEdit.purchaseOrderId?._id : receiptToEdit.purchaseOrderId,
        warehouseId: typeof receiptToEdit.warehouseId === 'object' ? receiptToEdit.warehouseId?._id : receiptToEdit.warehouseId,
        companyId: typeof receiptToEdit.companyId === 'object' ? receiptToEdit.companyId?._id : receiptToEdit.companyId,
        branchId: typeof receiptToEdit.branchId === 'object' ? receiptToEdit.branchId?._id : receiptToEdit.branchId,
        items: receiptToEdit.items.map(item => ({
          productId: typeof item.productId === 'object' ? item.productId?._id : item.productId,
          sku: item.sku,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          acceptedQuantity: item.acceptedQuantity,
          rejectedQuantity: item.rejectedQuantity,
          unitCost: item.unitCost,
          totalValue: item.totalValue,
        })),
        receivedBy: receiptToEdit.receivedBy,
        notes: receiptToEdit.notes,
      });
    } else {
      reset({
        grNumber: `GR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        receiptDate: new Date().toISOString().split('T')[0],
        purchaseOrderId: '',
        warehouseId: '',
        companyId: '',
        branchId: '',
        items: [{ productId: '', sku: '', orderedQuantity: 1, receivedQuantity: 1, acceptedQuantity: 1, rejectedQuantity: 0, unitCost: 0, totalValue: 0 }],
        receivedBy: '',
      });
    }
  }, [receiptToEdit, reset]);

  const onSubmit = (data: GoodsReceiptFormData) => {
    const totalQty = data.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
    const totalValue = data.items.reduce((sum, item) => sum + item.totalValue, 0);
    
    onSave({ ...data, totalQty, totalValue });
    onClose();
  };

  const onPOChange = (poId: string) => {
    const po = purchaseOrders.find(o => (o._id || o.id) === poId);
    if (po) {
      setValue('companyId', typeof po.companyId === 'object' ? po.companyId?._id : po.companyId);
      setValue('branchId', typeof po.branchId === 'object' ? po.branchId?._id : po.branchId);
      
      const newItems = po.items.map(item => ({
        productId: typeof item.productId === 'object' ? item.productId?._id : item.productId,
        sku: item.sku,
        orderedQuantity: item.quantity,
        receivedQuantity: item.quantity,
        acceptedQuantity: item.quantity,
        rejectedQuantity: 0,
        unitCost: item.unitCost,
        totalValue: item.quantity * item.unitCost,
      }));
      setValue('items', newItems);
    }
  };

  const calculateItemTotal = (index: number) => {
    const qty = watch(`items.${index}.acceptedQuantity`);
    const cost = watch(`items.${index}.unitCost`);
    setValue(`items.${index}.totalValue`, qty * cost);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={receiptToEdit ? t('edit_goods_receipt') : t('add_goods_receipt')}
      className="max-w-5xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t('gr_number')}
            {...register('grNumber')}
            error={errors.grNumber?.message}
            required
          />
          <Input
            label={t('receipt_date')}
            type="date"
            {...register('receiptDate')}
            error={errors.receiptDate?.message}
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
            label={t('warehouse')}
            options={warehouses.map(w => ({ value: w._id || w.id, label: w.warehouseName }))}
            {...register('warehouseId')}
            error={errors.warehouseId?.message}
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
          <Input
            label={t('received_by')}
            {...register('receivedBy')}
            error={errors.receivedBy?.message}
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t('items')}</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', sku: '', orderedQuantity: 1, receivedQuantity: 1, acceptedQuantity: 1, rejectedQuantity: 0, unitCost: 0, totalValue: 0 })}>
              <Plus size={16} className="mr-1" /> {t('add_item')}
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-100 rounded-lg relative">
              <div className="md:col-span-2">
                <Select
                  label={t('product')}
                  options={products.map(p => ({ value: p._id || p.id, label: p.productName }))}
                  {...register(`items.${index}.productId`)}
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
                label={t('ordered_quantity')}
                type="number"
                {...register(`items.${index}.orderedQuantity`, { valueAsNumber: true })}
                readOnly
                className="bg-gray-50"
              />
              <Input
                label={t('received_quantity')}
                type="number"
                {...register(`items.${index}.receivedQuantity`, { valueAsNumber: true })}
                error={errors.items?.[index]?.receivedQuantity?.message}
                required
              />
              <Input
                label={t('accepted_quantity')}
                type="number"
                {...register(`items.${index}.acceptedQuantity`, { valueAsNumber: true })}
                onChange={() => calculateItemTotal(index)}
                error={errors.items?.[index]?.acceptedQuantity?.message}
                required
              />
              <Input
                label={t('rejected_quantity')}
                type="number"
                {...register(`items.${index}.rejectedQuantity`, { valueAsNumber: true })}
                error={errors.items?.[index]?.rejectedQuantity?.message}
                required
              />
              <div className="flex items-end gap-2">
                <Input
                  label={t('total_value')}
                  type="number"
                  {...register(`items.${index}.totalValue`, { valueAsNumber: true })}
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

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="bg-gray-600 text-white border-none hover:bg-gray-700">
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {receiptToEdit ? t('submit') : t('add_goods_receipt')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
