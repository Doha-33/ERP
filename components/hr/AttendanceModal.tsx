
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Attendance, Employee } from '../../types';
import { useData } from '../../context/DataContext';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Attendance) => void;
  recordToEdit?: Attendance | null;
}

const attendanceSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  shiftType: z.enum(['morning', 'night']),
  breakDuration: z.string().optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE', 'HALF_DAY']),
  notes: z.string().optional(),
});

type AttendanceFormInputs = z.infer<typeof attendanceSchema>;

export const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, onSave, recordToEdit }) => {
  const { t } = useTranslation();
  const { employees } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttendanceFormInputs>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      status: 'PRESENT',
      shiftType: 'morning'
    }
  });

  useEffect(() => {
    if (recordToEdit) {
      reset({
        employeeId: typeof recordToEdit.employeeId === 'object' ? recordToEdit.employeeId?._id : recordToEdit.employeeId,
        date: recordToEdit.date,
        checkInTime: recordToEdit.checkInTime === '--:--' ? '' : recordToEdit.checkInTime,
        checkOutTime: recordToEdit.checkOutTime === '--:--' ? '' : recordToEdit.checkOutTime,
        shiftType: (recordToEdit.shiftType as any) || 'morning',
        breakDuration: recordToEdit.breakDuration || '',
        status: (recordToEdit.status || 'PRESENT') as any,
        notes: recordToEdit.notes || '',
      });
    } else {
      reset({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        checkInTime: '',
        checkOutTime: '',
        shiftType: 'morning',
        breakDuration: '',
        status: 'PRESENT',
        notes: '',
      });
    }
  }, [recordToEdit, isOpen, reset]);

  const onSubmit = (data: AttendanceFormInputs) => {
    const newRecord: any = {
      _id: recordToEdit ? recordToEdit._id : undefined, 
      ...data,
      checkInTime: data.checkInTime || '',
      checkOutTime: data.checkOutTime || '',
      breakDuration: data.breakDuration || '0'
    };
    onSave(newRecord);
    onClose();
  };

  const title = (
    <>
      <span className="text-lg">{recordToEdit ? '✎' : '⊕'}</span> {recordToEdit ? t('edit_attendance') : t('add_attendance')}
    </>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="attendance-form" className="bg-[#4361EE] hover:bg-blue-700">{recordToEdit ? t('save') : t('add_attendance')}</Button>
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
      <form id="attendance-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select 
              label={t('employee_info')} 
              options={employees.map(e => ({ value: e._id || e.id, label: e.fullName }))}
              {...register('employeeId')}
              error={errors.employeeId?.message}
            />
            
            <Input label={t('date')} type="date" required {...register('date')} error={errors.date?.message} />
            
            <Input label={t('check_in')} type="time" {...register('checkInTime')} error={errors.checkInTime?.message} />
            <Input label={t('check_out')} type="time" {...register('checkOutTime')} error={errors.checkOutTime?.message} />
            
            <Select 
              label={t('state')} 
              options={[
                {value: 'PRESENT', label: t('present')},
                {value: 'ABSENT', label: t('absent')},
                {value: 'ON_LEAVE', label: t('on_leave')},
                {value: 'LATE', label: t('late')},
                {value: 'HALF_DAY', label: t('half_day')}
              ]} 
              {...register('status')} 
            />

            <Select 
              label={t('shift_type')} 
              options={[
                {value: 'morning', label: t('morning')},
                {value: 'night', label: t('night')}
              ]} 
              {...register('shiftType')} 
            />
            
            <Input label={t('break_duration') + ' (mins)'} placeholder="15" {...register('breakDuration')} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('notes')}</label>
            <textarea 
              className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-dark-surface 
              border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white
              focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none h-24"
              {...register('notes')}
            ></textarea>
          </div>
      </form>
    </Modal>
  );
};
