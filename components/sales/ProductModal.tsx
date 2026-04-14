
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { Product } from '../../types';

const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  productName: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  productType: z.enum(['STOCKABLE', 'SERVICE', 'CONSUMABLE']),
  salesPrice: z.number().min(0, 'Sales price must be positive'),
  cost: z.number().min(0, 'Cost must be positive'),
  description: z.string().min(0),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
  barcode: z.string().min(0),
  hasExpiry: z.boolean(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productType: 'STOCKABLE',
      unitOfMeasure: 'pcs',
      hasExpiry: false,
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (productToEdit) {
      reset({
        sku: productToEdit.sku,
        productName: productToEdit.productName,
        category: productToEdit.category,
        productType: productToEdit.productType,
        salesPrice: productToEdit.salesPrice,
        cost: productToEdit.cost,
        description: productToEdit.description,
        unitOfMeasure: productToEdit.unitOfMeasure,
        barcode: productToEdit.barcode,
        hasExpiry: productToEdit.hasExpiry,
        status: productToEdit.status,
      });
    } else {
      reset({
        sku: '',
        productName: '',
        category: '',
        productType: 'STOCKABLE',
        salesPrice: 0,
        cost: 0,
        description: '',
        unitOfMeasure: 'pcs',
        barcode: '',
        hasExpiry: false,
        status: 'ACTIVE',
      });
    }
  }, [productToEdit, reset]);

  const onSubmit = (data: ProductFormData) => {
    onSave({
      ...data,
      id: productToEdit?.id || '',
    } as Product);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={productToEdit ? t('edit_product') : t('add_product')}
      className="max-w-3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('sku')}
            {...register('sku')}
            error={errors.sku?.message}
            required
          />
          <Input
            label={t('product_name')}
            {...register('productName')}
            error={errors.productName?.message}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('sales_price')}
            type="number"
            {...register('salesPrice', { valueAsNumber: true })}
            error={errors.salesPrice?.message}
            required
          />
          <Input
            label={t('cost')}
            type="number"
            {...register('cost', { valueAsNumber: true })}
            error={errors.cost?.message}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label={t('category')}
            {...register('category')}
            error={errors.category?.message}
            options={[
              { value: 'Electronics', label: 'Electronics' },
              { value: 'Laptops', label: 'Laptops' },
              { value: 'Services', label: 'Services' },
            ]}
            required
          />
          <Select
            label={t('product_type')}
            {...register('productType')}
            error={errors.productType?.message}
            options={[
              { value: 'STOCKABLE', label: t('stockable') },
              { value: 'SERVICE', label: t('service') },
              { value: 'CONSUMABLE', label: t('consumable') },
            ]}
            required
          />
          <Select
            label={t('unit_of_measure')}
            {...register('unitOfMeasure')}
            error={errors.unitOfMeasure?.message}
            options={[
              { value: 'pcs', label: 'pcs' },
              { value: 'kg', label: 'kg' },
              { value: 'm', label: 'm' },
            ]}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('barcode')}
            {...register('barcode')}
            error={errors.barcode?.message}
          />
          <Select
            label={t('status')}
            {...register('status')}
            error={errors.status?.message}
            options={[
              { value: 'ACTIVE', label: t('active') },
              { value: 'INACTIVE', label: t('inactive') },
            ]}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hasExpiry"
            {...register('hasExpiry')}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="hasExpiry" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('has_expiry')}
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
          <textarea
            {...register('description')}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit">
            {productToEdit ? t('submit') : t('add_product')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
