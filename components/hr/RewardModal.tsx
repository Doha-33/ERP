
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Reward } from '../../types';
import { useData } from '../../context/DataContext';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reward: Reward) => void;
  rewardToEdit?: Reward | null;
}

const rewardSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  rewardType: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  amount: z.string().min(1, 'Required'),
  bonus: z.string().optional(),
  commission: z.string().optional(),
});

type RewardFormInputs = z.infer<typeof rewardSchema>;

export const RewardModal: React.FC<RewardModalProps> = ({ isOpen, onClose, onSave, rewardToEdit }) => {
  const { t } = useTranslation();
  const { employees } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RewardFormInputs>({
    resolver: zodResolver(rewardSchema),
  });

  useEffect(() => {
    if (rewardToEdit) {
      reset({
        employeeId: rewardToEdit.employeeId || '', // Use ID
        rewardType: rewardToEdit.rewardType,
        date: rewardToEdit.date,
        amount: rewardToEdit.amount,
        bonus: rewardToEdit.bonus,
        commission: rewardToEdit.commission,
      });
    } else {
      reset({
        employeeId: '',
        rewardType: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        bonus: '',
        commission: '',
      });
    }
  }, [rewardToEdit, isOpen, reset]);

  const onSubmit = (data: RewardFormInputs) => {
    const selectedEmp = employees.find(e => e.id === data.employeeId);

    const newReward: Reward = {
      id: rewardToEdit ? rewardToEdit.id : '', // Handled by API
      rewardId: rewardToEdit ? rewardToEdit.rewardId : '',
      employeeId: data.employeeId,
      employeeName: selectedEmp ? selectedEmp.fullName : '',
      avatar: selectedEmp ? selectedEmp.avatar : '',
      ...data,
    };
    onSave(newReward);
    onClose();
  };

  const title = (
    <>
      <span className="text-lg">{rewardToEdit ? '✎' : '⊕'}</span> {rewardToEdit ? t('edit_rewards') : t('add_rewards')}
    </>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="reward-form" className="bg-[#4361EE] hover:bg-blue-700">{rewardToEdit ? t('save') : t('add_rewards')}</Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      className="max-w-4xl"
    >
      <form id="reward-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-6">
                <Select 
                  label={t('employee_info') + ' *'} 
                  options={employees.map(e => ({ value: e.id, label: e.fullName }))}
                  {...register('employeeId')}
                  error={errors.employeeId?.message}
                />
                
                <Select 
                   label={t('rewards_types') + ' *'} 
                   options={[
                     {value: 'Performance Bonus', label: 'Performance Bonus'},
                     {value: 'Spot Reward', label: 'Spot Reward'},
                     {value: 'Incentive', label: 'Incentive'}
                   ]}
                   {...register('rewardType')}
                   error={errors.rewardType?.message}
                />
                
                <Input 
                   type="date"
                   label={t('reward_date') + ' *'} 
                   {...register('date')} 
                   error={errors.date?.message} 
                />
             </div>
             
             <div className="space-y-6">
                <Input 
                   label={t('reward_amount') + ' *'} 
                   placeholder="Amount" 
                   {...register('amount')} 
                   error={errors.amount?.message} 
                />
                
                <Input 
                   label={t('bouns')} 
                   placeholder="Bonus Amount" 
                   {...register('bonus')} 
                />

                <Input 
                   label={t('commissions')} 
                   placeholder="Commission Amount" 
                   {...register('commission')} 
                />
             </div>
         </div>
      </form>
    </Modal>
  );
};
