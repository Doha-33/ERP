
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select, FileUpload } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Leave } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2 } from 'lucide-react';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leave: Leave) => Promise<void>;
  recordToEdit?: Leave | null;
}

const leaveSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  leaveType: z.string().min(1, 'Required'),
  fromDate: z.string().min(1, 'Required'),
  toDate: z.string().min(1, 'Required'),
  reason: z.string().min(1, 'Required'),
});

type LeaveFormInputs = z.infer<typeof leaveSchema>;

const compressImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
      } else {
        if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
      }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const LeaveModal: React.FC<LeaveModalProps> = ({ isOpen, onClose, onSave, recordToEdit }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { employees, currentUserEmployee } = useData();
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeaveFormInputs>({
    resolver: zodResolver(leaveSchema),
    defaultValues: { leaveType: 'Annual Leave' }
  });

  useEffect(() => {
    if (isOpen) {
      if (recordToEdit) {
        setAttachment(recordToEdit.attachment);
        const empId = typeof recordToEdit.employeeId === 'object' ? recordToEdit.employeeId?._id : recordToEdit.employeeId;
        reset({ 
          employeeId: empId || '', 
          leaveType: recordToEdit.leaveType, 
          fromDate: recordToEdit.fromDate?.split('T')[0], 
          toDate: recordToEdit.toDate?.split('T')[0], 
          reason: recordToEdit.reason 
        });
      } else {
        setAttachment(undefined);
        reset({ employeeId: currentUserEmployee?._id || currentUserEmployee?.id || '', leaveType: 'ANNUAL', fromDate: new Date().toISOString().split('T')[0], toDate: new Date().toISOString().split('T')[0], reason: '' });
      }
    }
  }, [recordToEdit, isOpen, reset, currentUserEmployee]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(result);
          setAttachment(compressed);
        } else {
          setAttachment(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setAttachment(undefined);
    }
  };

  const onSubmit = async (data: LeaveFormInputs) => {
    setIsSubmitting(true);
    try {
        const start = new Date(data.fromDate);
        const end = new Date(data.toDate);
        const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        await onSave({
            id: recordToEdit ? recordToEdit.id : '',
            _id: recordToEdit ? recordToEdit._id : '',
            leaveId: recordToEdit ? recordToEdit.leaveId : `L${Date.now()}`,
            employeeId: data.employeeId,
            leaveType: data.leaveType,
            fromDate: data.fromDate,
            toDate: data.toDate,
            days: days,
            remainingBalance: recordToEdit ? recordToEdit.remainingBalance : 0, 
            reason: data.reason,
            attachment: attachment,
            status: recordToEdit ? recordToEdit.status : 'PENDING',
            workflowStatus: recordToEdit ? recordToEdit.workflowStatus : 'PENDING_MANAGER',
        });
        onClose();
    } catch (e) {
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      <div className="flex items-center gap-2">
        {recordToEdit ? <Edit2 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
        <span className="text-[#2D3748] font-bold">{recordToEdit ? t('edit_leaves') : t('add_leaves')}</span>
      </div>
    } footer={
      <div className="flex justify-end gap-3 w-full">
         <Button type="button" className="bg-[#4A5568] hover:bg-[#2D3748] text-white px-8" onClick={onClose} disabled={isSubmitting}>{t('cancel')}</Button>
         <Button type="submit" form="leave-form" disabled={isSubmitting} className="bg-[#4361EE] hover:bg-blue-700 min-w-[140px]">
            {isSubmitting ? 'Sending...' : (recordToEdit ? t('save') : t('add_leaves'))}
         </Button>
      </div>
    } className="max-w-3xl">
      <form id="leave-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1.5">
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('employee_info')} <span className="text-red-500">*</span></label>
               {isAdmin ? (
                 <Select 
                   options={employees.map(e => ({ value: e.id, label: e.fullName }))}
                   {...register('employeeId')}
                   error={errors.employeeId?.message}
                 />
               ) : (
                 <>
                   <input type="text" readOnly disabled value={currentUserEmployee?.fullName || 'Loading...'} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 outline-none" />
                   <input type="hidden" {...register('employeeId')} />
                 </>
               )}
            </div>
            <Select label={t('leave_types')} options={[{value: 'ANNUAL', label: t('annual_leave')}, {value: 'SICK', label: t('sick_leave')}, {value: 'UNPAID', label: t('unpaid_leave')}, {value: 'EMERGENCY', label: 'Emergency Leave'}, {value: 'MATERNITY', label: 'Maternity Leave'}]} {...register('leaveType')} error={errors.leaveType?.message} />
            <Input label={t('from_date')} type="date" {...register('fromDate')} error={errors.fromDate?.message} />
            <Input label={t('to_date')} type="date" {...register('toDate')} error={errors.toDate?.message} />
         </div>
         <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reason')} <span className="text-red-500">*</span></label>
            <textarea className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-surface focus:ring-2 focus:ring-primary/20 outline-none h-24" {...register('reason')}></textarea>
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
         </div>
         <FileUpload label={t('upload_attachment')} onChange={handleFileChange} />
      </form>
    </Modal>
  );
};
