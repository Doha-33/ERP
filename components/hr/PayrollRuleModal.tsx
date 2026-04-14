import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { PayrollRule } from '../../types';

interface PayrollRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: PayrollRule) => void;
  recordToEdit?: PayrollRule | null;
}

const ruleSchema = z.object({
  ruleName: z.string().min(1, 'Required'),
  value: z.string().min(1, 'Required'),
  state: z.enum(['Active', 'Inactive']),
});

type RuleFormInputs = z.infer<typeof ruleSchema>;

export const PayrollRuleModal: React.FC<PayrollRuleModalProps> = ({ isOpen, onClose, onSave, recordToEdit }) => {
  const { t } = useTranslation();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RuleFormInputs>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      state: 'Active'
    }
  });

  useEffect(() => {
    if (recordToEdit) {
      reset({
        ruleName: recordToEdit.ruleName,
        value: recordToEdit.value,
        state: recordToEdit.state,
      });
    } else {
      reset({
        ruleName: '',
        value: '',
        state: 'Active',
      });
    }
  }, [recordToEdit, isOpen, reset]);

  const onSubmit = (data: RuleFormInputs) => {
    const newRecord: PayrollRule = {
      id: recordToEdit ? recordToEdit.id : Math.random().toString(36).substr(2, 9),
      ruleCode: recordToEdit?.ruleCode || `R${Math.floor(Math.random() * 10)}`,
      ...data,
    };
    onSave(newRecord);
    onClose();
  };

  const title = (
    <>
      <span className="text-lg">{recordToEdit ? '✎' : '⊕'}</span> {recordToEdit ? t('edit_rule') : t('add_rule')}
    </>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="rule-form" className="bg-[#4361EE] hover:bg-blue-700">{t('save')}</Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      className="max-w-2xl"
    >
      <form id="rule-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label={t('rule_name')} placeholder="SANED" {...register('ruleName')} error={errors.ruleName?.message} />
            <Input label={t('value')} placeholder="Value" {...register('value')} error={errors.value?.message} />
            
            <Select 
              label={t('state')} 
              options={[
                {value: 'Active', label: t('active')},
                {value: 'Inactive', label: t('inactive')}
              ]} 
              {...register('state')} 
            />
            
            {/* Placeholder for alignment */}
            <div className="hidden md:block"></div> 
         </div>
      </form>
    </Modal>
  );
};
