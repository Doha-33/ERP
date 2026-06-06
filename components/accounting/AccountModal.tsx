import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button, Input, Select, TextArea } from '../ui/Common';
import { Account } from '../../types';

// Updated schema to include accountCategory
const accountSchema = z.object({
  accountCode: z.string().min(1, 'Account code is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountType: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  accountCategory: z.enum([
    'CASH', 'BANK', 'RECEIVABLE', 'PAYABLE', 
    'INVENTORY', 'SALES', 'COGS', 'EXPENSE', 
    'EQUITY', 'OTHER'
  ]),
  paymentMethod: z.enum(['CASH', 'BANK', 'NONE']),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AccountFormData) => void;
  accountToEdit?: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accountToEdit,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountCode: '',
      accountName: '',
      accountType: 'ASSET',
      accountCategory: 'OTHER',
      paymentMethod: 'CASH',
      isActive: true,
      notes: '',
    },
  });

  const selectedAccountType = watch('accountType');
  const selectedAccountCategory = watch('accountCategory');

  // Auto-select accountCategory based on accountType
  useEffect(() => {
    if (!accountToEdit) {
      // Set default category based on type for new accounts
      const defaultCategoryByType: Record<string, string> = {
        ASSET: 'CASH',
        LIABILITY: 'PAYABLE',
        EQUITY: 'EQUITY',
        REVENUE: 'SALES',
        EXPENSE: 'EXPENSE',
      };
      setValue('accountCategory', defaultCategoryByType[selectedAccountType] as any || 'OTHER');
    }
  }, [selectedAccountType, setValue, accountToEdit]);

  useEffect(() => {
    if (accountToEdit) {
      reset({
        accountCode: accountToEdit.accountCode,
        accountName: accountToEdit.accountName,
        accountType: accountToEdit.accountType,
        accountCategory: accountToEdit.accountCategory || 'OTHER',
        paymentMethod: accountToEdit.paymentMethod || 'CASH',
        isActive: accountToEdit.isActive,
        notes: accountToEdit.notes || '',
      });
    } else {
      reset({
        accountCode: '',
        accountName: '',
        accountType: 'ASSET',
        accountCategory: 'CASH',
        paymentMethod: 'CASH',
        isActive: true,
        notes: '',
      });
    }
  }, [accountToEdit, reset]);

  const onSubmit = (data: AccountFormData) => {
    onSave(data);
  };

  const accountTypeOptions = [
    { value: 'ASSET', label: t('asset') },
    { value: 'LIABILITY', label: t('liability') },
    { value: 'EQUITY', label: t('equity') },
    { value: 'REVENUE', label: t('revenue') },
    { value: 'EXPENSE', label: t('expense') },
  ];

  const accountCategoryOptions = [
    { value: 'CASH', label: t('account_category_cash') },
    { value: 'BANK', label: t('account_category_bank') },
    { value: 'RECEIVABLE', label: t('account_category_receivable') },
    { value: 'PAYABLE', label: t('account_category_payable') },
    { value: 'INVENTORY', label: t('account_category_inventory') },
    { value: 'SALES', label: t('account_category_sales') },
    { value: 'COGS', label: t('account_category_cogs') },
    { value: 'EXPENSE', label: t('account_category_expense') },
    { value: 'EQUITY', label: t('account_category_equity') },
    { value: 'OTHER', label: t('account_category_other') },
  ];

  const paymentMethodOptions = [
    { value: 'CASH', label: t('payment_method_cash') },
    { value: 'BANK', label: t('payment_method_bank') },
    { value: 'NONE', label: t('payment_method_none') },
  ];

  // Get category options filtered by account type for better UX
  const getFilteredCategoryOptions = () => {
    const categoryTypeMap: Record<string, string[]> = {
      ASSET: ['CASH', 'BANK', 'RECEIVABLE', 'INVENTORY', 'OTHER'],
      LIABILITY: ['PAYABLE', 'OTHER'],
      EQUITY: ['EQUITY', 'OTHER'],
      REVENUE: ['SALES', 'OTHER'],
      EXPENSE: ['EXPENSE', 'COGS', 'OTHER'],
    };

    const allowedCategories = categoryTypeMap[selectedAccountType] || ['OTHER'];
    
    return accountCategoryOptions.filter(opt => allowedCategories.includes(opt.value));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={accountToEdit ? t('edit_account') : t('add_account')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Account Code */}
        <Input
          label={t('account_code')}
          {...register('accountCode')}
          error={errors.accountCode?.message}
          fullWidth
          required
        />

        {/* Account Name */}
        <Input
          label={t('account_name')}
          {...register('accountName')}
          error={errors.accountName?.message}
          fullWidth
          required
        />

        {/* Account Type */}
        <Select
          label={t('account_type')}
          value={watch('accountType')}
          onChange={(e) => setValue('accountType', e.target.value as any)}
          options={accountTypeOptions}
          error={errors.accountType?.message}
          fullWidth
          required
        />

        {/* Account Category */}
        <Select
          label={t('account_category')}
          value={watch('accountCategory')}
          onChange={(e) => setValue('accountCategory', e.target.value as any)}
          options={getFilteredCategoryOptions()}
          error={errors.accountCategory?.message}
          fullWidth
          required
        />
        <p className="text-xs text-gray-500 mt-1">{t('account_category_helper')}</p>

        {/* Payment Method */}
        <Select
          label={t('payment_method')}
          value={watch('paymentMethod')}
          onChange={(e) => setValue('paymentMethod', e.target.value as any)}
          options={paymentMethodOptions}
          error={errors.paymentMethod?.message}
          fullWidth
          required
        />

        {/* Notes */}
        <TextArea
          label={t('notes')}
          {...register('notes')}
          error={errors.notes?.message}
          fullWidth
          rows={3}
        />

        {/* Active Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={watch('isActive')}
            onChange={(e) => setValue('isActive', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            {t('active')}
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} fullWidth>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting} fullWidth>
            {isSubmitting ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};