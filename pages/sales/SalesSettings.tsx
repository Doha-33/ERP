
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save } from 'lucide-react';
import { Card, Button, Input, Select, Switch } from '../../components/ui/Common';
import { useData } from '../../context/DataContext';
import { SalesSettings as SalesSettingsType } from '../../types';

const salesSettingsSchema = z.object({
  vatPercentage: z.number().min(0).max(100),
  invoiceNumberingMethod: z.enum(['Manual', 'Automatic']),
  defaultPricelist: z.string().min(1),
  defaultPaymentTerms: z.string().min(1),
  defaultCurrency: z.string().min(1),
  allowReturnsWithoutInvoice: z.boolean(),
  allowSellingOutOfStock: z.boolean(),
});

export const SalesSettings: React.FC = () => {
  const { t } = useTranslation();
  const { salesSettings, updateSalesSettings } = useData();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SalesSettingsType>({
    resolver: zodResolver(salesSettingsSchema),
    defaultValues: salesSettings,
  });

  const allowReturns = watch('allowReturnsWithoutInvoice');
  const allowOutOfStock = watch('allowSellingOutOfStock');

  const onSubmit: SubmitHandler<SalesSettingsType> = (data) => {
    updateSalesSettings(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('sales_settings')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('configure_your_sales_module')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('general_settings')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t('vat_percentage')}
              type="number"
              {...register('vatPercentage', { valueAsNumber: true })}
              error={errors.vatPercentage?.message}
              required
            />
            <Select
              label={t('invoice_numbering_method')}
              {...register('invoiceNumberingMethod')}
              error={errors.invoiceNumberingMethod?.message}
              options={[
                { value: 'Manual', label: t('manual') },
                { value: 'Automatic', label: t('automatic') },
              ]}
              required
            />
            <Select
              label={t('default_pricelist')}
              {...register('defaultPricelist')}
              error={errors.defaultPricelist?.message}
              options={[
                { value: 'Standard', label: 'Standard' },
                { value: 'Wholesale', label: 'Wholesale' },
              ]}
              required
            />
            <Select
              label={t('default_payment_terms')}
              {...register('defaultPaymentTerms')}
              error={errors.defaultPaymentTerms?.message}
              options={[
                { value: 'Net 30', label: 'Net 30' },
                { value: 'Net 60', label: 'Net 60' },
                { value: 'Due on Receipt', label: 'Due on Receipt' },
              ]}
              required
            />
            <Select
              label={t('default_currency')}
              {...register('defaultCurrency')}
              error={errors.defaultCurrency?.message}
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'SAR', label: 'SAR' },
                { value: 'EUR', label: 'EUR' },
              ]}
              required
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('inventory_returns')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t('allow_returns_without_invoice')}</p>
                <p className="text-sm text-gray-500">{t('enable_this_to_process_returns_without_original_invoice')}</p>
              </div>
              <Switch 
                checked={allowReturns}
                onChange={(checked) => setValue('allowReturnsWithoutInvoice', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t('allow_selling_out_of_stock')}</p>
                <p className="text-sm text-gray-500">{t('enable_this_to_allow_sales_even_when_inventory_is_zero')}</p>
              </div>
              <Switch 
                checked={allowOutOfStock}
                onChange={(checked) => setValue('allowSellingOutOfStock', checked)}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="flex items-center gap-2 px-8">
            <Save size={18} />
            {t('save_settings')}
          </Button>
        </div>
      </form>
    </div>
  );
};
