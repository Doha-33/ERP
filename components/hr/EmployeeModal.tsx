
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select, FileUpload } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Employee } from '../../types';
import { useData } from '../../context/DataContext';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employeeToEdit?: Employee | null;
}

const employeeSchema = z.object({
  fullName: z.string().min(1, 'Required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED']),
  employeeCode: z.string().optional(),
  idNumber: z.string().optional(),
  nationality: z.string().min(1, 'Required'),
  birthDate: z.string().min(1, 'Required'),
  gender: z.enum(['Male', 'Female']),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
  phone: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  address: z.string().min(1, 'Required'),
  companyId: z.string().min(1, 'Required'),
  branchId: z.string().min(1, 'Required'),
  departmentId: z.string().min(1, 'Required'),
  jobId: z.string().min(1, 'Required'),
  jobGrade: z.enum(['Junior', 'Mid Level', 'Senior']),
  directManagerId: z.string().optional(),
  hiringDate: z.string().min(1, 'Required'),
  internalId: z.string().optional(),
  contractType: z.enum(['Full-Time', 'Part-Time', 'Temporary']),
  idExpiry: z.string().optional(),
  passportExpiry: z.string().optional(),
  permitExpiry: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  userId: z.string().optional(),
});

type EmployeeFormInputs = z.infer<typeof employeeSchema>;

// Shared utility
const compressImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200, quality = 0.5): Promise<string> => {
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
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, employeeToEdit }) => {
  const { t } = useTranslation();
  const { companies, branches, departments, jobs, employees, users } = useData(); 
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documents, setDocuments] = useState<any>({});
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<EmployeeFormInputs>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { status: 'ACTIVE', gender: 'Male', maritalStatus: 'Single', contractType: 'Full-Time', jobGrade: 'Mid Level' }
  });

  const selectedDepartment = watch('departmentId');
  const filteredJobs = useMemo(() => {
    if (!selectedDepartment) return [];
    return jobs.filter(job => {
        const deptId = typeof job.departmentId === 'object' ? job.departmentId?._id : job.departmentId;
        return deptId === selectedDepartment;
    });
  }, [jobs, selectedDepartment]);

  useEffect(() => {
    if (isOpen) {
      if (employeeToEdit) {
        setAvatarPreview(employeeToEdit.photo);
        
        reset({
          fullName: employeeToEdit.fullName,
          status: (employeeToEdit.status || 'ACTIVE') as any,
          employeeCode: employeeToEdit.employeeCode || '',
          idNumber: employeeToEdit.idNumber || '',
          nationality: employeeToEdit.nationality || '',
          birthDate: employeeToEdit.birthDate?.split('T')[0] || '',
          gender: (['Male', 'Female'].includes(employeeToEdit.gender as any) ? employeeToEdit.gender : 'Male') as 'Male' | 'Female',
          maritalStatus: (['Single', 'Married', 'Divorced', 'Widowed'].includes(employeeToEdit.maritalStatus as any) ? employeeToEdit.maritalStatus : 'Single') as 'Single' | 'Married' | 'Divorced' | 'Widowed',
          phone: employeeToEdit.phone || '',
          email: employeeToEdit.email || '',
          address: employeeToEdit.address || '',
          companyId: typeof employeeToEdit.companyId === 'object' ? employeeToEdit.companyId?._id : employeeToEdit.companyId,
          branchId: typeof employeeToEdit.branchId === 'object' ? employeeToEdit.branchId?._id : employeeToEdit.branchId,
          departmentId: typeof employeeToEdit.departmentId === 'object' ? employeeToEdit.departmentId?._id : employeeToEdit.departmentId,
          jobId: typeof employeeToEdit.jobId === 'object' ? employeeToEdit.jobId?._id : employeeToEdit.jobId,
          jobGrade: (employeeToEdit.jobGrade || 'Mid Level') as any,
          directManagerId: typeof employeeToEdit.directManagerId === 'object' ? employeeToEdit.directManagerId?._id : employeeToEdit.directManagerId,
          hiringDate: employeeToEdit.hiringDate?.split('T')[0] || '',
          internalId: employeeToEdit.internalId || '',
          contractType: (employeeToEdit.contractType || 'Full-Time') as any,
          bankName: employeeToEdit.bankInfo?.bankName || '',
          accountNumber: employeeToEdit.bankInfo?.accountNumber || '',
          userId: employeeToEdit.userId || '',
        });
      } else {
        setAvatarPreview(undefined);
        setDocuments({});
        reset({ fullName: '', email: '', phone: '', status: 'ACTIVE', nationality: '', birthDate: '', gender: 'Male', maritalStatus: 'Single', address: '', companyId: companies[0]?.id || '', branchId: branches[0]?.id || '', departmentId: departments[0]?._id || '', jobId: '', jobGrade: 'Mid Level', directManagerId: '', hiringDate: new Date().toISOString().split('T')[0], internalId: '', contractType: 'Full-Time', employeeCode: '', idNumber: '', userId: '' });
      }
    }
  }, [employeeToEdit, isOpen, reset, companies, branches, departments, jobs]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 400, 400);
        setAvatarPreview(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocChange = (key: string) => (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        if (file.type.startsWith('image/')) {
          const optimized = await compressImage(result);
          setDocuments((prev: any) => ({ ...prev, [key]: optimized }));
        } else {
          setDocuments((prev: any) => ({ ...prev, [key]: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: EmployeeFormInputs) => {
    setIsProcessing(true);
    try {
      const { bankName, accountNumber, ...rest } = data;
      const newEmployee: any = {
        id: employeeToEdit ? employeeToEdit.id : undefined, 
        _id: employeeToEdit ? employeeToEdit._id : undefined,
        photo: avatarPreview || employeeToEdit?.photo || `https://ui-avatars.com/api/?name=${data.fullName}&background=4361EE&color=fff`,
        bankInfo: { bankName, accountNumber },
        ...rest,
      };
      await onSave(newEmployee);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const footer = (
    <>
       <Button type="button" variant="ghost" className="bg-gray-600 text-white hover:bg-gray-700" onClick={onClose} disabled={isProcessing}>{t('cancel')}</Button>
       <Button type="submit" form="employee-form" className="bg-[#4361EE] hover:bg-blue-700 min-w-[120px]" disabled={isProcessing}>
         {isProcessing ? 'Processing...' : (employeeToEdit ? t('save') : t('add_employee'))}
       </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={employeeToEdit ? t('edit_employee') : t('add_employee')} footer={footer} className="max-w-4xl">
      <form id="employee-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
         <section>
            <h3 className="text-lg font-bold mb-4 dark:text-white">{t('basic_information')}</h3>
            <div className="flex items-center gap-4 mb-6">
               <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                  {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-2xl">😊</span>}
               </div>
               <div>
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  <Button type="button" size="sm" className="bg-[#4361EE] hover:bg-blue-700" onClick={() => avatarInputRef.current?.click()}>
                     {t('change_image')}
                  </Button>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
               <Input label={t('full_name')} required {...register('fullName')} error={errors.fullName?.message} />
               <Select label={t('employee_status')} options={[{value:'ACTIVE', label: t('active')}, {value:'INACTIVE', label: t('inactive')}, {value:'SUSPENDED', label: t('suspended')}, {value:'TERMINATED', label: t('resigned')}]} {...register('status')} />
               <Input label={t('emp_code')} {...register('employeeCode')} />
               <Input label={t('id_number')} {...register('idNumber')} />
               <Input label={t('nationality')} {...register('nationality')} error={errors.nationality?.message} />
               <Input label={t('birth_date')} type="date" {...register('birthDate')} error={errors.birthDate?.message} />
               <Select label={t('gender')} options={[{value:'Male', label: t('male')}, {value:'Female', label: t('female')}]} {...register('gender')} />
               <Select label={t('marital_status')} options={[{value:'Single', label: t('single')}, {value:'Married', label: t('married')}, {value:'Divorced', label: t('divorced')}, {value:'Widowed', label: t('widowed')}]} {...register('maritalStatus')} />
               <Input label={t('phone')} {...register('phone')} error={errors.phone?.message} />
               <Input label={t('email')} {...register('email')} error={errors.email?.message} />
               <Input label={t('address')} {...register('address')} error={errors.address?.message} />
               <Select label={t('link_to_user')} options={[{value: '', label: 'None'}, ...users.map(u => ({value: u.user_id, label: u.username}))]} {...register('userId')} />
               <Select label={t('company')} options={companies.map(c => ({value: c.id, label: c.name}))} {...register('companyId')} error={errors.companyId?.message} />
               <Select label={t('branch')} options={branches.map(b => ({value: b.id, label: b.name}))} {...register('branchId')} error={errors.branchId?.message} />
            </div>
         </section>
         <hr className="border-gray-100 dark:border-gray-800" />
         <section>
            <h3 className="text-lg font-bold mb-4 dark:text-white">{t('work_information')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
               <Select label={t('department')} options={departments.map(d => ({value: d._id, label: d.departmentName}))} {...register('departmentId')} error={errors.departmentId?.message} />
               <Select label={t('position')} options={[{ value: '', label: 'Select Position' }, ...filteredJobs.map(j => ({value: j._id, label: j.jobName}))]} {...register('jobId')} error={errors.jobId?.message} />
               <Select label={t('job_grade')} options={[{value: 'Junior', label: t('junior')}, {value: 'Mid Level', label: t('mid_level')}, {value: 'Senior', label: t('senior')}]} {...register('jobGrade')} error={errors.jobGrade?.message} />
               <Select label={t('direct_manager')} options={[{value: '', label: 'None'}, ...employees.filter(e => (e._id || e.id) !== employeeToEdit?._id).map(e => ({value: e._id || e.id, label: e.fullName}))]} {...register('directManagerId')} error={errors.directManagerId?.message} />
               <Input label={t('join_date')} type="date" {...register('hiringDate')} error={errors.hiringDate?.message} />
               <Input label={t('internal_id')} {...register('internalId')} />
               <Select label={t('contract_type')} options={[{value:'Full-Time', label: t('full_time')}, {value:'Part-Time', label: t('part_time')}, {value:'Temporary', label: t('temporary')}]} {...register('contractType')} />
            </div>
         </section>
         <hr className="border-gray-100 dark:border-gray-800" />
         <section>
            <h3 className="text-lg font-bold mb-4 dark:text-white">Bank Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
               <Input label="Bank Name" {...register('bankName')} />
               <Input label="Account Number" {...register('accountNumber')} />
            </div>
         </section>
      </form>
    </Modal>
  );
};
