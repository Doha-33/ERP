import React, { useEffect } from 'react';
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
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
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

  useEffect(() => {
    if (accountToEdit) {
      reset({
        accountCode: accountToEdit.accountCode,
        accountName: accountToEdit.accountName,
        accountType: accountToEdit.accountType as any,
        parentAccountId: typeof accountToEdit.parentAccountId === 'object' ? accountToEdit.parentAccountId?._id : accountToEdit.parentAccountId,
        isActive: accountToEdit.isActive,
        notes: accountToEdit.notes,
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

  const parentAccountOptions = [
    { value: '', label: t('none') },
    ...parentAccounts
      .filter(a => a._id !== accountToEdit?._id && a.id !== accountToEdit?.id)
      .map(a => ({
        value: a._id || a.id,
        label: `${a.accountCode} - ${a.accountName}`,
      })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? t('edit_account') : t('add_account')}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('account_code')}
          {...register('accountCode')}
          error={errors.accountCode?.message}
          required
        />
        <Input
          label={t('account_name')}
          {...register('accountName')}
          error={errors.accountName?.message}
          required
        />
        <Select
          label={t('account_type')}
          options={accountTypeOptions}
          {...register('accountType')}
          error={errors.accountType?.message}
          required
        />
        <Select
          label={t('parent_account')}
          options={parentAccountOptions}
          {...register('parentAccountId')}
          error={errors.parentAccountId?.message}
        />
        <TextArea
          label={t('notes')}
          {...register('notes')}
          error={errors.notes?.message}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
            {t('active')}
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit">
            {t('save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
