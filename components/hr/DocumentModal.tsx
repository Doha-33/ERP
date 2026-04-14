
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select, FileUpload } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { DocumentRecord } from '../../types';
import { useData } from '../../context/DataContext';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: any) => Promise<void>;
  documentToEdit?: DocumentRecord | null;
  fixedEmployeeId?: string;
}

const documentSchema = z.object({
  employee_id: z.string().min(1, 'Required'),
  type: z.string().min(1, 'Required'),
  expiry_date: z.string().min(1, 'Required'),
});

type DocumentFormInputs = z.infer<typeof documentSchema>;

// Global compression utility for all components
const compressAnyImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height *= maxWidth / width;
          width = maxWidth;
        } else {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      }
      // Using 0.5 quality to significantly reduce size while maintaining readability
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    img.onerror = () => resolve(base64Str); 
  });
};

export const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, onSave, documentToEdit, fixedEmployeeId }) => {
  const { t } = useTranslation();
  const { employees } = useData();
  const [fileBase64, setFileBase64] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentFormInputs>({
    resolver: zodResolver(documentSchema),
  });

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setFileBase64(undefined);
      if (documentToEdit) {
        reset({
          employee_id: documentToEdit.employeeId,
          type: documentToEdit.type,
          expiry_date: documentToEdit.expiryDate,
        });
      } else {
        reset({
          employee_id: fixedEmployeeId || '',
          type: 'ID',
          expiry_date: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [documentToEdit, isOpen, reset, fixedEmployeeId]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        if (file.type.startsWith('image/')) {
          const optimized = await compressAnyImage(result);
          setFileBase64(optimized);
        } else {
          setFileBase64(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFileBase64(undefined);
    }
  };

  const onSubmit = async (data: DocumentFormInputs) => {
    if (!documentToEdit && !fileBase64) {
      setErrorMessage('Please select a file to upload');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
        const cleanBase64 = fileBase64?.includes('base64,') 
          ? fileBase64.split('base64,')[1] 
          : fileBase64;

        if (documentToEdit) {
            const updatePayload: any = {
                employee_id: data.employee_id,
                type: data.type,
                expiry_date: data.expiry_date
            };
            if (cleanBase64) updatePayload.file = cleanBase64;
            await onSave({ id: documentToEdit.id, data: updatePayload });
        } else {
            const payload = {
                employee_id: data.employee_id,
                type: data.type, 
                file: cleanBase64, 
                expiry_date: data.expiry_date 
            };
            await onSave(payload);
        }
        onClose();
    } catch (err: any) {
        console.error('Submit Error:', err);
        setErrorMessage(err.response?.data?.message || 'Request failed. File might still be too large.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const title = (
    <><span className="text-lg">{documentToEdit ? '✎' : '⊕'}</span> {documentToEdit ? t('edit_documents') : t('add_documents')}</>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" disabled={isSubmitting} className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="document-form" disabled={isSubmitting} className="bg-[#4361EE] hover:bg-blue-700 min-w-[120px]">
           {isSubmitting ? 'Compressing & Sending...' : (documentToEdit ? t('save') : t('add_documents'))}
       </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} className="max-w-2xl">
      <form id="document-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         {errorMessage && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm text-sm">
               <p className="font-bold">Upload Error</p>
               <p>{errorMessage}</p>
            </div>
         )}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select 
              label={t('employee_info')} 
              options={employees.map(e => ({ value: e.id, label: e.fullName }))} 
              {...register('employee_id')} 
              error={errors.employee_id?.message}
              disabled={!!fixedEmployeeId || !!documentToEdit}
            />
            <Select label={t('request_type')} options={[{value: 'ID', label: 'ID Card'}, {value: 'Passport', label: 'Passport'}, {value: 'Work_Permit', label: 'Work Permit'}, {value: 'Medical_Insurance', label: 'Medical Insurance'}, {value: 'Certificates', label: 'Certificates'}, {value: 'Other', label: 'Other'}]} {...register('type')} error={errors.type?.message} />
            <Input label={t('expiry_date')} type="date" required {...register('expiry_date')} error={errors.expiry_date?.message} />
         </div>
         <FileUpload 
            label={t('upload_attachment')} 
            accept=".pdf,.png,.jpg,.jpeg" 
            onChange={handleFileChange}
          />
      </form>
    </Modal>
  );
};
