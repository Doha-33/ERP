
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Job } from '../../types';
import { useData } from '../../context/DataContext';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Job) => void;
  jobToEdit?: Job | null;
}

const jobSchema = z.object({
  departmentId: z.string().min(1, 'Required'),
  jobName: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
});

type JobFormInputs = z.infer<typeof jobSchema>;

export const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, onSave, jobToEdit }) => {
  const { t } = useTranslation();
  const { departments } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormInputs>({
    resolver: zodResolver(jobSchema),
  });

  useEffect(() => {
    if (jobToEdit) {
      reset({
        departmentId: typeof jobToEdit.departmentId === 'object' ? jobToEdit.departmentId._id : jobToEdit.departmentId,
        jobName: jobToEdit.jobName,
        description: jobToEdit.description,
      });
    } else {
      reset({
        departmentId: departments.length > 0 ? departments[0]._id : '',
        jobName: '',
        description: '',
      });
    }
  }, [jobToEdit, isOpen, reset, departments]);

  const onSubmit = (data: JobFormInputs) => {
    const newJob: any = {
      _id: jobToEdit ? jobToEdit._id : undefined,
      ...data,
      state: 'ACTIVE'
    };
    onSave(newJob);
    onClose();
  };

  const title = (
    <>
      <span className="text-lg">{jobToEdit ? '✎' : '⊕'}</span> {jobToEdit ? t('edit_jobs') : t('add_jobs')}
    </>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="job-form" className="bg-[#4361EE] hover:bg-blue-700">{jobToEdit ? t('save') : t('add_jobs')}</Button>
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
      <form id="job-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-6">
                <Select 
                   label={t('department') + ' *'} 
                   options={departments.map(d => ({ value: d._id, label: d.departmentName }))}
                   {...register('departmentId')} 
                   error={errors.departmentId?.message} 
                />
             </div>
             
             <div className="space-y-6">
                <Input 
                   label={t('job_name') + ' *'} 
                   placeholder="Job Name" 
                   {...register('jobName')} 
                   error={errors.jobName?.message} 
                />
             </div>
         </div>
         
         <div className="space-y-6">
            <Input 
               label={t('description') + ' *'} 
               placeholder="Description" 
               {...register('description')} 
               error={errors.description?.message} 
            />
         </div>
      </form>
    </Modal>
  );
};
