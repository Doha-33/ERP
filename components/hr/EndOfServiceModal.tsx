
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select, FileUpload } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { EndOfService } from '../../types';
import { useData } from '../../context/DataContext';
import { Plus } from 'lucide-react';

interface EndOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eos: EndOfService) => Promise<void>;
  eosToEdit?: EndOfService | null;
}

const eosSchema = z.object({
  employee_id: z.string().min(1, 'Required'),
  eos_type: z.string().min(1, 'Required'),
  job_id: z.string().min(1, 'Required'),
  department_id: z.string().min(1, 'Required'),
  collect_laptop: z.boolean(),
  collect_access_cards: z.boolean(),
  final_settlement: z.string().min(1, 'Required'),
  reason: z.string().min(1, 'Required'),
  start_date: z.string().optional(),
  last_working_day: z.string().min(1, 'Required'),
});

type EosFormInputs = z.infer<typeof eosSchema>;

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

export const EndOfServiceModal: React.FC<EndOfServiceModalProps> = ({ isOpen, onClose, onSave, eosToEdit }) => {
  const { t } = useTranslation();
  const { employees, jobs, departments } = useData();
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EosFormInputs>({
    resolver: zodResolver(eosSchema),
    defaultValues: { collect_laptop: false, collect_access_cards: false, eos_type: 'Resignation', last_working_day: new Date().toISOString().split('T')[0] }
  });

  const selectedEmployeeId = watch('employee_id');

  useEffect(() => {
    if (selectedEmployeeId && !eosToEdit) {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      if (emp) {
        if (emp.department) setValue('department_id', emp.department);
        if (emp.position) setValue('job_id', emp.position);
        if (emp.joinDate) setValue('start_date', emp.joinDate.split('T')[0]);
      }
    }
  }, [selectedEmployeeId, employees, setValue, eosToEdit]);

  useEffect(() => {
    if (isOpen) {
      if (eosToEdit) {
        setAttachment(eosToEdit.attachment);
        reset({
          employee_id: eosToEdit.employeeId,
          eos_type: eosToEdit.eosType,
          job_id: eosToEdit.jobId || '',
          department_id: eosToEdit.departmentId || '',
          collect_laptop: String(eosToEdit.collectLaptop).toLowerCase() === 'true',
          collect_access_cards: String(eosToEdit.collectAccessCards).toLowerCase() === 'true',
          final_settlement: eosToEdit.finalSettlement,
          reason: eosToEdit.reason,
          start_date: eosToEdit.startDate?.split('T')[0],
          last_working_day: eosToEdit.lastWorkingDay?.split('T')[0] || new Date().toISOString().split('T')[0]
        });
      } else {
        setAttachment(undefined);
        reset({ employee_id: '', eos_type: 'Resignation', job_id: '', department_id: '', collect_laptop: false, collect_access_cards: false, final_settlement: '', reason: '', start_date: '', last_working_day: new Date().toISOString().split('T')[0] });
      }
    }
  }, [eosToEdit, isOpen, reset]);

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

  const onSubmit = async (data: EosFormInputs) => {
    setIsSubmitting(true);
    try {
      const selectedEmp = employees.find(e => e.id === data.employee_id);
      const start = data.start_date ? new Date(data.start_date) : (selectedEmp?.joinDate ? new Date(selectedEmp.joinDate) : new Date());
      const end = new Date(data.last_working_day);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const years = Number((diffTime / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1));

      const eosPayload: EndOfService = {
        id: eosToEdit?.id || '',
        employeeId: data.employee_id,
        employeeName: selectedEmp?.fullName || '',
        eosType: data.eos_type,
        jobId: data.job_id,
        jobTitle: jobs.find(j => j.id === data.job_id)?.name || '',
        departmentId: data.department_id,
        department: departments.find(d => d.id === data.department_id)?.name || '',
        startDate: data.start_date || '',
        endDate: data.last_working_day,
        yearsOfService: String(years),
        requestDate: new Date().toISOString().split('T')[0],
        lastWorkingDay: data.last_working_day,
        collectLaptop: data.collect_laptop ? 'true' : 'false',
        collectAccessCards: data.collect_access_cards ? 'true' : 'false',
        finalSettlement: data.final_settlement,
        reason: data.reason,
        attachment: attachment,
        status: eosToEdit ? eosToEdit.status : 'Pending'
      };
      await onSave(eosPayload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex gap-2">
      <Button type="button" variant="ghost" className="bg-[#4B5563] text-white hover:bg-gray-700" onClick={onClose} disabled={isSubmitting}>{t('cancel')}</Button>
      <Button type="submit" form="eos-form" disabled={isSubmitting} className="bg-[#4361EE] hover:bg-blue-700 min-w-[150px]">
        {isSubmitting ? 'Processing...' : (eosToEdit ? t('save') : t('add_resignation'))}
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={eosToEdit ? t('edit_end_of_service') : t('add_end_of_service')} footer={footer} className="max-w-3xl">
      <form id="eos-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <Select label={t('employee_info') + ' *'} options={[{ value: '', label: 'Select Employee' }, ...employees.map(e => ({ value: e.id, label: e.fullName }))]} {...register('employee_id')} error={errors.employee_id?.message} />
            <Select label={t('eos_type') + ' *'} options={[{value: 'Resignation', label: t('resignation')}, {value: 'Termination', label: t('termination')}, {value: 'Retirement', label: t('retirement')}, {value: 'Contract Expiry', label: t('contract_expiry')}]} {...register('eos_type')} error={errors.eos_type?.message} />
            <Select label={t('department') + ' *'} options={[{ value: '', label: 'Select Department' }, ...departments.map(d => ({ value: d.id, label: d.name }))]} {...register('department_id')} error={errors.department_id?.message} />
            <Select label={t('job_title') + ' *'} options={[{ value: '', label: 'Select Job' }, ...jobs.map(j => ({ value: j.id, label: j.name }))]} {...register('job_id')} error={errors.job_id?.message} />
            <Input label={t('final_settlement_calculation') + ' *'} placeholder="Settlement amount" {...register('final_settlement')} error={errors.final_settlement?.message} />
            <Input type="date" label={t('last_working_day') + ' *'} {...register('last_working_day')} error={errors.last_working_day?.message} />
         </div>
         <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('reason')} *</label>
            <textarea {...register('reason')} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface outline-none h-32"></textarea>
            {errors.reason && <p className="text-red-500 text-xs">{errors.reason.message}</p>}
         </div>
         <FileUpload label={t('upload_attachment')} onChange={handleFileChange} />
      </form>
    </Modal>
  );
};
