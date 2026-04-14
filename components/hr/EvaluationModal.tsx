
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Evaluation } from '../../types';
import { useData } from '../../context/DataContext';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (evaluation: Evaluation) => Promise<void>;
  evaluationToEdit?: Evaluation | null;
}

const evaluationSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  attendance: z.string().min(1, 'Required'),
  productivity: z.string().min(1, 'Required'),
  teamwork: z.string().min(1, 'Required'),
  communication: z.string().min(1, 'Required'),
  skillDevelopment: z.string().min(1, 'Required'),
  overallScore: z.string().min(1, 'Required'),
  comments: z.string().min(1, 'Required'),
});

type EvaluationFormInputs = z.infer<typeof evaluationSchema>;

export const EvaluationModal: React.FC<EvaluationModalProps> = ({ isOpen, onClose, onSave, evaluationToEdit }) => {
  const { t } = useTranslation();
  const { employees } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EvaluationFormInputs>({
    resolver: zodResolver(evaluationSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (evaluationToEdit) {
        reset({
          employeeId: evaluationToEdit.employeeId,
          attendance: evaluationToEdit.attendance,
          productivity: evaluationToEdit.productivity,
          teamwork: evaluationToEdit.teamwork,
          communication: evaluationToEdit.communication,
          skillDevelopment: evaluationToEdit.skillDevelopment,
          overallScore: evaluationToEdit.overallScore,
          comments: evaluationToEdit.comments,
        });
      } else {
        reset({
          employeeId: '',
          attendance: '0',
          productivity: '0',
          teamwork: '0',
          communication: '0',
          skillDevelopment: '0',
          overallScore: '0',
          comments: '',
        });
      }
    }
  }, [evaluationToEdit, isOpen, reset]);

  const onSubmit = async (data: EvaluationFormInputs) => {
    const selectedEmp = employees.find(e => e.id === data.employeeId);
    const newEvaluation: Evaluation = {
      id: evaluationToEdit ? evaluationToEdit.id : '',
      employeeName: selectedEmp ? selectedEmp.fullName : '',
      avatar: selectedEmp ? selectedEmp.avatar : '',
      ...data,
    };
    await onSave(newEvaluation);
    onClose();
  };

  const title = (
    <>
      <span className="text-lg">{evaluationToEdit ? '✎' : '⊕'}</span> {evaluationToEdit ? t('edit_evaluation') : t('add_evaluation')}
    </>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" disabled={isSubmitting} className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="evaluation-form" disabled={isSubmitting} className="bg-[#4361EE] hover:bg-blue-700">
         {isSubmitting ? 'Saving...' : (evaluationToEdit ? t('save') : t('add_evaluation'))}
       </Button>
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
      <form id="evaluation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-6">
                <Select 
                  label={t('employee_info') + ' *'} 
                  options={employees.map(e => ({ value: e.id, label: e.fullName }))}
                  {...register('employeeId')}
                  error={errors.employeeId?.message}
                />
                
                <Input label={t('productivity') + ' (0-100) *'} type="number" placeholder="Productivity" {...register('productivity')} error={errors.productivity?.message} />
                <Input label={t('communication') + ' (0-100) *'} type="number" placeholder="Communication" {...register('communication')} error={errors.communication?.message} />
                <Input label={t('overall_score') + ' (0-100) *'} type="number" placeholder="Overall Score" {...register('overallScore')} error={errors.overallScore?.message} />
             </div>
             
             <div className="space-y-6">
                <Input label={t('attendance') + ' (0-100) *'} type="number" placeholder="Attendance" {...register('attendance')} error={errors.attendance?.message} />
                <Input label={t('teamwork') + ' (0-100) *'} type="number" placeholder="Teamwork" {...register('teamwork')} error={errors.teamwork?.message} />
                <Input label={t('skill_development') + ' (0-100) *'} type="number" placeholder="Skill Development" {...register('skillDevelopment')} error={errors.skillDevelopment?.message} />
                <Input label={t('comments') + ' *'} placeholder="Comments" {...register('comments')} error={errors.comments?.message} />
             </div>
         </div>
      </form>
    </Modal>
  );
};
