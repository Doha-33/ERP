
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select, FileUpload } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { RequestRecord } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2 } from 'lucide-react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: RequestRecord) => void;
  recordToEdit?: RequestRecord | null;
}

const requestSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  requestType: z.enum(['SHORT_LEAVE', 'FINAL_CLEARANCE', 'ALLOWANCE', 'OTHER']),
  description: z.string().min(1, 'Reason is required'),
});

type RequestFormInputs = z.infer<typeof requestSchema>;

const compressImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) { height *= maxWidth / width; width = maxWidth; }
        else { width *= maxHeight / height; height = maxHeight; }
      }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, onSave, recordToEdit }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { employees, currentUserEmployee } = useData();
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RequestFormInputs>({
    resolver: zodResolver(requestSchema),
    defaultValues: { requestType: 'SHORT_LEAVE' }
  });

  useEffect(() => {
    if (isOpen) {
      if (recordToEdit) {
        setAttachment(recordToEdit.attachment);
        reset({ 
          employeeId: typeof recordToEdit.employeeId === 'object' ? recordToEdit.employeeId?._id : recordToEdit.employeeId, 
          requestType: (recordToEdit.requestType as any) || 'SHORT_LEAVE', 
          description: recordToEdit.description 
        });
      } else {
        setAttachment(undefined);
        reset({ employeeId: currentUserEmployee?._id || currentUserEmployee?.id || '', requestType: 'SHORT_LEAVE', description: '' });
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

  const onSubmit = async (data: RequestFormInputs) => {
    setIsSubmitting(true);
    try {
      const selectedEmp = employees.find(e => (e._id || e.id) === data.employeeId);
      const newRecord: any = {
        _id: recordToEdit ? recordToEdit._id : undefined,
        id: recordToEdit ? recordToEdit.id : '', 
        requestId: recordToEdit ? recordToEdit.requestId : '', 
        employeeId: data.employeeId,
        employeeName: selectedEmp ? selectedEmp.fullName : '',
        avatar: selectedEmp ? selectedEmp.photo : '',
        requestType: data.requestType,
        date: recordToEdit ? recordToEdit.date : new Date().toISOString().split('T')[0],
        description: data.description,
        status: recordToEdit ? recordToEdit.status : 'PENDING',
        attachment: attachment,
        workflowStatus: recordToEdit ? recordToEdit.workflowStatus : { hr: false, manager: false },
      };
      await onSave(newRecord);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={recordToEdit ? t('edit_request') : t('add_request')} footer={
      <div className="flex justify-end gap-3 w-full">
         <Button type="button" variant="ghost" className="bg-[#4A5568] hover:bg-[#2D3748] text-white px-8" onClick={onClose} disabled={isSubmitting}>{t('cancel')}</Button>
         <Button type="submit" form="request-form" className="bg-[#4361EE] hover:bg-blue-700 min-w-[140px]" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (recordToEdit ? t('save') : t('add_request'))}
         </Button>
      </div>
    } className="max-w-2xl">
      <form id="request-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('employee_info')} <span className="text-red-500">*</span></label>
               {isAdmin ? (
                 <Select 
                   options={employees.map(e => ({ value: e._id || e.id, label: e.fullName }))}
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
            <Select label={t('request_type')} options={[{value: 'SHORT_LEAVE', label: t('short_leave')}, {value: 'FINAL_CLEARANCE', label: t('final_clearance')}, {value: 'ALLOWANCE', label: t('allowance')}, {value: 'OTHER', label: t('other')}]} {...register('requestType')} />
         </div>
         <Input label={t('reason')} placeholder="Reason..." {...register('description')} error={errors.description?.message} />
         <FileUpload label={t('upload_attachment')} accept=".pdf,.png,.jpg" onChange={handleFileChange} />
      </form>
    </Modal>
  );
};
