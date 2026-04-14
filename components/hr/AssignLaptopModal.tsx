
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { AssignLaptop } from '../../types';
import { useData } from '../../context/DataContext';

interface AssignLaptopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (laptop: AssignLaptop) => void;
  laptopToEdit?: AssignLaptop | null;
}

const laptopSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  deviceType: z.string().min(1, 'Required'),
  serialNumber: z.string().min(1, 'Required'),
  doneAt: z.string().optional(),
  doneBy: z.string().optional(),
  status: z.enum(['Done', 'Pending']),
});

type LaptopFormInputs = z.infer<typeof laptopSchema>;

export const AssignLaptopModal: React.FC<AssignLaptopModalProps> = ({ isOpen, onClose, onSave, laptopToEdit }) => {
  const { t } = useTranslation();
  const { employees } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LaptopFormInputs>({
    resolver: zodResolver(laptopSchema),
    defaultValues: {
      status: 'Pending'
    }
  });

  useEffect(() => {
    if (laptopToEdit) {
      reset({
        employeeId: laptopToEdit.employeeId || laptopToEdit.empCode, // Use employeeId logic
        deviceType: laptopToEdit.deviceType,
        serialNumber: laptopToEdit.serialNumber,
        doneAt: laptopToEdit.doneAt,
        doneBy: laptopToEdit.doneBy,
        status: laptopToEdit.status,
      });
    } else {
      reset({
        employeeId: '',
        deviceType: 'Laptop',
        serialNumber: '',
        doneAt: '',
        doneBy: '',
        status: 'Pending',
      });
    }
  }, [laptopToEdit, isOpen, reset]);

  const onSubmit = (data: LaptopFormInputs) => {
    const selectedEmp = employees.find(e => e.id === data.employeeId);
    
    const newLaptop: AssignLaptop = {
      id: laptopToEdit ? laptopToEdit.id : '', // Handled by API
      empCode: data.employeeId, // Temporarily storing ID in empCode field as per DataContext logic, ideally refactor types later
      employeeId: data.employeeId,
      empName: selectedEmp ? selectedEmp.fullName : '',
      deviceType: data.deviceType,
      serialNumber: data.serialNumber,
      doneAt: data.doneAt || '',
      doneBy: data.doneBy || '',
      status: data.status
    };
    onSave(newLaptop);
    onClose();
  };

  const title = (
    <>
      <span className="text-lg">{laptopToEdit ? '✎' : '⊕'}</span> {laptopToEdit ? t('edit_assign_laptop') : t('add_assign_laptop')}
    </>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="laptop-form" className="bg-[#4361EE] hover:bg-blue-700">{laptopToEdit ? t('save') : t('add_assign_laptop')}</Button>
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
      <form id="laptop-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                   label={t('done_at')} 
                   {...register('doneAt')} 
                   error={errors.doneAt?.message} 
                />

                <Select 
                   label={t('status') + ' *'} 
                   options={[
                     {value: 'Pending', label: t('pending')},
                     {value: 'Done', label: t('done')}
                   ]}
                   {...register('status')}
                   error={errors.status?.message}
                />
             </div>
             
             <div className="space-y-6">
                <Select 
                   label={t('device_type') + ' *'} 
                   options={[
                     {value: 'Laptop', label: 'Laptop'},
                     {value: 'Monitor', label: 'Monitor'},
                     {value: 'Phone', label: 'Phone'},
                     {value: 'Tablet', label: 'Tablet'}
                   ]}
                   {...register('deviceType')}
                   error={errors.deviceType?.message}
                />
                
                <Input 
                   label={t('done_by')} 
                   placeholder="Manager Name / ID" 
                   {...register('doneBy')} 
                   error={errors.doneBy?.message} 
                />

                <Input 
                   label={t('serial_number') + ' *'} 
                   placeholder="SN-12345"
                   {...register('serialNumber')}
                   error={errors.serialNumber?.message}
                />
             </div>
         </div>
      </form>
    </Modal>
  );
};
