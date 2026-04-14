
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select, FileUpload } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Penalty } from '../../types';
import { useData } from '../../context/DataContext';

interface PenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (penalty: Penalty) => void;
  penaltyToEdit?: Penalty | null;
}

const penaltySchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  penaltyType: z.string().min(1, 'Required'),
  amount: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  decisionMaker: z.string().optional(),
  status: z.enum(['Pending', 'Approved', 'Rejected']),
  reason: z.string().min(1, 'Required'),
});

type PenaltyFormInputs = z.infer<typeof penaltySchema>;

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

export const PenaltyModal: React.FC<PenaltyModalProps> = ({ isOpen, onClose, onSave, penaltyToEdit }) => {
  const { t } = useTranslation();
  const { employees } = useData();
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PenaltyFormInputs>({
    resolver: zodResolver(penaltySchema),
    defaultValues: { status: 'Pending' }
  });

  useEffect(() => {
    if (penaltyToEdit) {
      setAttachment(penaltyToEdit.attachment);
      reset({
        employeeId: penaltyToEdit.employeeId || '',
        penaltyType: penaltyToEdit.penaltyType,
        amount: penaltyToEdit.amount,
        date: penaltyToEdit.date,
        decisionMaker: penaltyToEdit.decisionMaker,
        status: penaltyToEdit.status,
        reason: penaltyToEdit.reason,
      });
    } else {
      setAttachment(undefined);
      reset({
        employeeId: '',
        penaltyType: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        decisionMaker: '',
        status: 'Pending',
        reason: '',
      });
    }
  }, [penaltyToEdit, isOpen, reset]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        if (file.type.startsWith('image/')) {
          const optimized = await compressImage(result);
          setAttachment(optimized);
        } else {
          setAttachment(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setAttachment(undefined);
    }
  };

  const onSubmit = async (data: PenaltyFormInputs) => {
    setIsProcessing(true);
    try {
      const selectedEmp = employees.find(e => e.id === data.employeeId);
      const newPenalty: Penalty = {
        id: penaltyToEdit ? penaltyToEdit.id : '', 
        penaltyId: penaltyToEdit ? penaltyToEdit.penaltyId : '',
        employeeId: data.employeeId,
        employeeName: selectedEmp ? selectedEmp.fullName : '',
        avatar: selectedEmp ? selectedEmp.avatar : '',
        attachment: attachment,
        ...data,
        decisionMaker: data.decisionMaker || '',
      };
      await onSave(newPenalty);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const footer = (
    <>
       <Button type="button" variant="ghost" className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="penalty-form" disabled={isProcessing} className="bg-[#4361EE] hover:bg-blue-700">
         {isProcessing ? 'Saving...' : (penaltyToEdit ? t('save') : t('add_penalties'))}
       </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={penaltyToEdit ? t('edit_penalties') : t('add_penalties')} footer={footer} className="max-w-4xl">
      <form id="penalty-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-6">
                <Select label={t('employee_info') + ' *'} options={employees.map(e => ({ value: e.id, label: e.fullName }))} {...register('employeeId')} error={errors.employeeId?.message} />
                <Input type="date" label={t('date') + ' *'} {...register('date')} error={errors.date?.message} />
                <Select label={t('state') + ' *'} options={[{value: 'Pending', label: t('pending')}, {value: 'Approved', label: t('approved')}, {value: 'Rejected', label: t('rejected')}]} {...register('status')} error={errors.status?.message} />
             </div>
             <div className="space-y-6">
                <Select label={t('penalty_type') + ' *'} options={[{value: 'Late Arrival', label: 'Late Arrival'}, {value: 'Absence', label: 'Absence'}, {value: 'Misconduct', label: 'Misconduct'}]} {...register('penaltyType')} error={errors.penaltyType?.message} />
                <Input label={t('penalty_amount') + ' *'} placeholder="Amount" {...register('amount')} error={errors.amount?.message} />
                <Select label={t('decision_maker')} options={[{value: '', label: 'None'}, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} {...register('decisionMaker')} error={errors.decisionMaker?.message} />
             </div>
         </div>
         <div className="space-y-6">
            <Input label={t('reason') + ' *'} placeholder="Reason..." {...register('reason')} error={errors.reason?.message} className="h-12" />
            <FileUpload label={t('upload_attachment')} accept=".pdf,.png,.jpg" onChange={handleFileChange} />
         </div>
      </form>
    </Modal>
  );
};
