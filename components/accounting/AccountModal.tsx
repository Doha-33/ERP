import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button, Input, Select, TextArea } from '../ui/Common';
import { Account } from '../../types';

const accountSchema = z.object({
  accountCode: z.string().min(1, 'Account code is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountType: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  parentAccountId: z.string().optional().nullable(),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AccountFormData) => void;
  accountToEdit?: Account | null;
  parentAccounts: Account[];
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accountToEdit,
  parentAccounts,
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
      parentAccountId: null,
      isActive: true,
      notes: '',
    },
  });

  const selectedAccountType = watch('accountType');

  useEffect(() => {
    if (accountToEdit) {
      // Extract parentAccountId correctly (could be string or object)
      let parentId = null;
      if (accountToEdit.parentAccountId) {
        if (typeof accountToEdit.parentAccountId === 'object') {
          parentId = (accountToEdit.parentAccountId as any)._id || (accountToEdit.parentAccountId as any).id;
        } else {
          parentId = accountToEdit.parentAccountId;
        }
      }
      
      reset({
        accountCode: accountToEdit.accountCode,
        accountName: accountToEdit.accountName,
        accountType: accountToEdit.accountType as any,
        parentAccountId: parentId,
        isActive: accountToEdit.isActive,
        notes: accountToEdit.notes || '',
      });
    } else {
      reset({
        accountCode: '',
        accountName: '',
        accountType: 'ASSET',
        parentAccountId: null,
        isActive: true,
        notes: '',
      });
    }
  }, [accountToEdit, reset]);

  const onSubmit = (data: AccountFormData) => {
    onSave(data);
    onClose();
  };

  const accountTypeOptions = [
    { value: 'ASSET', label: t('asset') },
    { value: 'LIABILITY', label: t('liability') },
    { value: 'EQUITY', label: t('equity') },
    { value: 'REVENUE', label: t('revenue') },
    { value: 'EXPENSE', label: t('expense') },
  ];

  // Filter parent accounts options
  const parentAccountOptions = useMemo(() => {
    const currentAccountId = accountToEdit?._id || accountToEdit?.id;
    
    // Filter out the current account to prevent circular reference
    const availableAccounts = parentAccounts.filter(
      a => (a._id || a.id) !== currentAccountId
    );
    
    // Group accounts by type for better organization
    const groupedAccounts = availableAccounts.reduce((groups, account) => {
      const type = account.accountType;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push({
        value: account._id || account.id,
        label: `${account.accountCode} - ${account.accountName}`,
        type: account.accountType,
      });
      return groups;
    }, {} as Record<string, any[]>);
    
    // Create options array with optgroups
    const options = [{ value: '', label: t('none') }];
    
    // Add accounts grouped by type
    if (selectedAccountType && groupedAccounts[selectedAccountType]) {
      // Show only same type accounts
      options.push({
        value: 'divider',
        label: `── ${t(selectedAccountType.toLowerCase())} ──`,
      });
      groupedAccounts[selectedAccountType].forEach(acc => {
        options.push(acc);
      });
    } else {
      // Show all accounts grouped
      Object.keys(groupedAccounts).forEach(type => {
        options.push({
          value: 'divider',
          label: `── ${t(type.toLowerCase())} ──`,
        });
        groupedAccounts[type].forEach(acc => {
          options.push(acc);
        });
      });
    }
    
    return options;
  }, [parentAccounts, accountToEdit, selectedAccountType, t]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? t('edit_account') : t('add_account')}
      className="w-full max-w-md mx-4 sm:mx-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
        {/* Account Code */}
        <div>
          <Input
            label={t('account_code')}
            {...register('accountCode')}
            error={errors.accountCode?.message}
            required
            fullWidth
            placeholder="e.g., 1001"
          />
        </div>

        {/* Account Name */}
        <div>
          <Input
            label={t('account_name')}
            {...register('accountName')}
            error={errors.accountName?.message}
            required
            fullWidth
            placeholder="e.g., Petty Cash"
          />
        </div>

        {/* Account Type */}
        <div>
          <Select
            label={t('account_type')}
            options={accountTypeOptions}
            {...register('accountType')}
            error={errors.accountType?.message}
            required
            fullWidth
          />
        </div>

        {/* Parent Account - Show only if not editing or if parent exists */}
        <div>
          <Select
            label={t('parent_account')}
            options={parentAccountOptions}
            value={watch('parentAccountId') || ''}
            onChange={(e) => setValue('parentAccountId', e.target.value || null)}
            error={errors.parentAccountId?.message}
            fullWidth
          />
        </div>

        {/* Notes */}
        <div>
          <TextArea
            label={t('notes')}
            {...register('notes')}
            error={errors.notes?.message}
            fullWidth
            rows={3}
            placeholder={t('optional_notes')}
          />
        </div>

        {/* Active Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            {t('active')}
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <Button 
            variant="outline" 
            type="button" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t('cancel')}
          </Button>
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            className="w-full sm:w-auto justify-center"
          >
            {t('save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};