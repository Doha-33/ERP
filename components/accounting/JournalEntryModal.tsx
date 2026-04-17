import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input, Select, TextArea } from '../ui/Common';
import { JournalEntry, Account } from '../../types';

const journalLineSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  debit: z.number().min(0),
  credit: z.number().min(0),
  description: z.string().optional(),
});

const journalEntrySchema = z.object({
  entryDate: z.string().min(1, 'Date is required'),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  memo: z.string().min(1, 'Memo is required'),
  status: z.enum(['DRAFT', 'POSTED', 'CANCELLED']),
  lines: z.array(journalLineSchema).min(2, 'At least two lines are required'),
}).refine((data) => {
  const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);
  return Math.abs(totalDebit - totalCredit) < 0.01;
}, {
  message: 'Total Debit and Total Credit must be equal',
  path: ['lines'],
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: JournalEntryFormData) => void;
  entryToEdit?: JournalEntry | null;
  accounts: Account[];
}

export const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  entryToEdit,
  accounts,
}) => {
  const { t } = useTranslation();
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      entryDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      memo: '',
      status: 'DRAFT',
      lines: [
        { accountId: '', debit: 0, credit: 0, description: '' },
        { accountId: '', debit: 0, credit: 0, description: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const lines = watch('lines');
  const totalDebit = lines?.reduce((sum, line) => sum + Number(line.debit || 0), 0) || 0;
  const totalCredit = lines?.reduce((sum, line) => sum + Number(line.credit || 0), 0) || 0;

  useEffect(() => {
    if (entryToEdit) {
      reset({
        entryDate: entryToEdit.entryDate ? new Date(entryToEdit.entryDate).toISOString().split('T')[0] : '',
        referenceNumber: entryToEdit.referenceNumber,
        memo: entryToEdit.memo,
        status: entryToEdit.status as any,
        lines: entryToEdit.lines.map(line => ({
          accountId: typeof line.accountId === 'object' ? (line.accountId?._id || line.accountId?.id) : line.accountId,
          debit: line.debit,
          credit: line.credit,
          description: line.description || '',
        })),
      });
    } else {
      reset({
        entryDate: new Date().toISOString().split('T')[0],
        referenceNumber: `JV-${Date.now().toString().slice(-6)}`,
        memo: '',
        status: 'DRAFT',
        lines: [
          { accountId: '', debit: 0, credit: 0, description: '' },
          { accountId: '', debit: 0, credit: 0, description: '' },
        ],
      });
    }
  }, [entryToEdit, reset]);

  const onSubmit = (data: JournalEntryFormData) => {
    onSave(data);
    onClose();
  };

  const accountOptions = [
    { value: '', label: t('select_account') },
    ...accounts.map(a => ({
      value: a._id || a.id,
      label: `${a.accountCode} - ${a.accountName}`,
    })),
  ];

  const statusOptions = [
    { value: 'DRAFT', label: t('draft') },
    { value: 'POSTED', label: t('posted') },
    { value: 'CANCELLED', label: t('cancelled') },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entryToEdit ? t('edit_journal_entry') : t('add_journal_entry')}
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t('reference_number')}
            {...register('referenceNumber')}
            error={errors.referenceNumber?.message}
            required
          />
          <Input
            label={t('entry_date')}
            type="date"
            {...register('entryDate')}
            error={errors.entryDate?.message}
            required
          />
          <Select
            label={t('status')}
            options={statusOptions}
            {...register('status')}
            error={errors.status?.message}
            required
          />
        </div>

        <TextArea
          label={t('memo')}
          {...register('memo')}
          error={errors.memo?.message}
          required
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{t('entry_lines')}</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ accountId: '', debit: 0, credit: 0, description: '' })}
            >
              <Plus size={16} className="mr-1" /> {t('add_line')}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 px-1 w-1/3">{t('account')}</th>
                  <th className="text-left py-2 px-1 w-1/4">{t('description')}</th>
                  <th className="text-right py-2 px-1 w-1/6">{t('debit')}</th>
                  <th className="text-right py-2 px-1 w-1/6">{t('credit')}</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id} className="border-b dark:border-gray-700 last:border-0 uppercase">
                    <td className="py-2 px-1">
                      <Select
                        options={accountOptions}
                        {...register(`lines.${index}.accountId`)}
                        error={errors.lines?.[index]?.accountId?.message}
                        className="w-full"
                      />
                    </td>
                    <td className="py-2 px-1">
                      <Input
                        {...register(`lines.${index}.description`)}
                        placeholder={t('description')}
                        className="w-full"
                      />
                    </td>
                    <td className="py-2 px-1 text-right">
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`lines.${index}.debit`, { valueAsNumber: true })}
                        className="w-full text-right"
                      />
                    </td>
                    <td className="py-2 px-1 text-right">
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`lines.${index}.credit`, { valueAsNumber: true })}
                        className="w-full text-right"
                      />
                    </td>
                    <td className="py-2 px-1 text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={fields.length <= 2}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 dark:bg-gray-800/50 font-bold">
                  <td colSpan={2} className="py-2 px-1 text-right">{t('total')}</td>
                  <td className="py-2 px-1 text-right">{totalDebit.toLocaleString()}</td>
                  <td className="py-2 px-1 text-right">{totalCredit.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          {errors.lines?.root?.message && (
            <p className="text-sm text-red-500 mt-1">{errors.lines.root.message}</p>
          )}
          {errors.lines && !errors.lines.root && (
            <p className="text-sm text-red-500 mt-1">{t('please_fix_line_errors')}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={Math.abs(totalDebit - totalCredit) > 0.01}>
            {t('save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
