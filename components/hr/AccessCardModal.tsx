
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { AccessCard } from '../../types';
import { useData } from '../../context/DataContext';

interface AccessCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: AccessCard) => void;
  cardToEdit?: AccessCard | null;
}

const cardSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  cardNumber: z.string().min(1, 'Required'),
  doneAt: z.string().min(1, 'Required'),
  doneBy: z.string().min(1, 'Required'),
  status: z.enum(['Done', 'Pending']),
});

type CardFormInputs = z.infer<typeof cardSchema>;

export const AccessCardModal: React.FC<AccessCardModalProps> = ({ isOpen, onClose, onSave, cardToEdit }) => {
  const { t } = useTranslation();
  const { employees } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CardFormInputs>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      status: 'Pending'
    }
  });

  useEffect(() => {
    if (cardToEdit) {
      reset({
        employeeId: cardToEdit.employeeId || '', // Using employeeId instead of empName
        cardNumber: cardToEdit.cardNumber,
        doneAt: cardToEdit.doneAt,
        doneBy: cardToEdit.doneBy,
        status: cardToEdit.status,
      });
    } else {
      reset({
        employeeId: '',
        cardNumber: '',
        doneAt: new Date().toISOString().split('T')[0],
        doneBy: '',
        status: 'Pending',
      });
    }
  }, [cardToEdit, isOpen, reset]);

  const onSubmit = (data: CardFormInputs) => {
    const selectedEmp = employees.find(e => e.id === data.employeeId);
    
    const newCard: AccessCard = {
      id: cardToEdit ? cardToEdit.id : '', // Handled by API/DataContext
      employeeId: data.employeeId,
      empCode: selectedEmp?.code || '',
      empName: selectedEmp?.fullName || '', 
      ...data,
    };
    onSave(newCard);
    onClose();
  };

  const title = (
    <>
      <span className="text-lg">{cardToEdit ? '✎' : '⊕'}</span> {cardToEdit ? t('edit_access_cards') : t('add_access_cards')}
    </>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="card-form" className="bg-[#4361EE] hover:bg-blue-700">{cardToEdit ? t('save') : t('add_access_cards')}</Button>
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
      <form id="card-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-6">
                <Select 
                  label={t('employee_info') + ' *'} 
                  options={employees.map(e => ({ value: e.id, label: e.fullName }))}
                  {...register('employeeId')}
                  error={errors.employeeId?.message}
                />
                
                <Input 
                   type="date"
                   label={t('done_at') + ' *'} 
                   {...register('doneAt')} 
                   error={errors.doneAt?.message} 
                />

                <Select 
                   label={t('state') + ' *'} 
                   options={[
                     {value: 'Pending', label: t('pending')},
                     {value: 'Done', label: t('done')}
                   ]}
                   {...register('status')}
                   error={errors.status?.message}
                />
             </div>
             
             <div className="space-y-6">
                <Input 
                   label={t('card_number_id') + ' *'} 
                   placeholder="AC-00123" 
                   {...register('cardNumber')} 
                   error={errors.cardNumber?.message} 
                />
                
                <Input 
                   label={t('done_by') + ' *'} 
                   placeholder="Admin Name" 
                   {...register('doneBy')} 
                   error={errors.doneBy?.message} 
                />
             </div>
         </div>
      </form>
    </Modal>
  );
};
