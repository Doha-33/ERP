
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { InitialTraining } from '../../types';
import { useData } from '../../context/DataContext';

interface InitialTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (training: InitialTraining) => void;
  trainingToEdit?: InitialTraining | null;
}

const trainingSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  trainingType: z.string().min(1, 'Required'),
  doneAt: z.string().min(1, 'Required'),
  doneBy: z.string().min(1, 'Required'),
  status: z.enum(['Paid', 'Unpaid', 'Pending']),
  trainer: z.string().min(1, 'Required'),
  departmentId: z.string().min(1, 'Required'),
});

type TrainingFormInputs = z.infer<typeof trainingSchema>;

export const InitialTrainingModal: React.FC<InitialTrainingModalProps> = ({ isOpen, onClose, onSave, trainingToEdit }) => {
  const { t } = useTranslation();
  const { employees, departments } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TrainingFormInputs>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      status: 'Pending'
    }
  });

  useEffect(() => {
    if (trainingToEdit) {
      reset({
        employeeId: trainingToEdit.employeeId || '', // Using ID logic
        trainingType: trainingToEdit.trainingType,
        doneAt: trainingToEdit.doneAt,
        doneBy: trainingToEdit.doneBy,
        status: trainingToEdit.status,
        trainer: trainingToEdit.trainer,
        departmentId: trainingToEdit.departmentId || '', // Using ID logic
      });
    } else {
      reset({
        employeeId: '',
        trainingType: '',
        doneAt: new Date().toISOString().split('T')[0],
        doneBy: '',
        status: 'Pending',
        trainer: '',
        departmentId: '',
      });
    }
  }, [trainingToEdit, isOpen, reset]);

  const onSubmit = (data: TrainingFormInputs) => {
    const selectedEmp = employees.find(e => e.id === data.employeeId);
    const selectedDept = departments.find(d => d.id === data.departmentId);
    
    const newTraining: InitialTraining = {
      id: trainingToEdit ? trainingToEdit.id : '', // Handled by API
      employeeId: data.employeeId,
      empCode: selectedEmp?.code || '',
      empName: selectedEmp?.fullName || '',
      department: selectedDept?.name || '',
      ...data,
    };
    onSave(newTraining);
    onClose();
  };

  const title = (
    <>
      <span className="text-lg">{trainingToEdit ? '✎' : '⊕'}</span> {trainingToEdit ? t('edit_initial_training') : t('add_initial_training')}
    </>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="training-form" className="bg-[#4361EE] hover:bg-blue-700">{trainingToEdit ? t('save') : t('add_initial_training')}</Button>
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
      <form id="training-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                   label={t('status') + ' *'} 
                   options={[
                     {value: 'Pending', label: t('pending')},
                     {value: 'Paid', label: t('paid')},
                     {value: 'Unpaid', label: t('unpaid')}
                   ]}
                   {...register('status')}
                   error={errors.status?.message}
                />

                <Select 
                   label={t('department') + ' *'} 
                   options={departments.map(d => ({ value: d.id, label: d.name }))}
                   {...register('departmentId')}
                   error={errors.departmentId?.message}
                />
             </div>
             
             <div className="space-y-6">
                <Select 
                   label={t('training_type') + ' *'} 
                   options={[
                     {value: 'Orientation', label: 'Orientation'},
                     {value: 'Technical', label: 'Technical'},
                     {value: 'Soft Skills', label: 'Soft Skills'}
                   ]}
                   {...register('trainingType')}
                   error={errors.trainingType?.message}
                />
                
                <Input 
                   label={t('done_by') + ' *'} 
                   placeholder="HR / Manager" 
                   {...register('doneBy')} 
                   error={errors.doneBy?.message} 
                />

                <Input 
                   label={t('trainer') + ' *'} 
                   placeholder="Trainer Name" 
                   {...register('trainer')} 
                   error={errors.trainer?.message}
                />
             </div>
         </div>
      </form>
    </Modal>
  );
};
