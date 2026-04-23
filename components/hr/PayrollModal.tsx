
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Payroll } from '../../types';
import { useData } from '../../context/DataContext';
import { PlusCircle, Edit2, Users } from 'lucide-react';

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Payroll) => void;
  recordToEdit?: Payroll | null;
}

const payrollSchema = z.object({
  employeeId: z.string().optional(), 
  payrollMonth: z.number().min(1).max(12),
  payrollYear: z.number().min(2000),
  basicSalary: z.number().optional(),
  housingAllowance: z.number().optional(),
  medicalAllowance: z.number().optional(),
  workNatureAllowance: z.number().optional(),
  transportAllowance: z.number().optional(),
  commissions: z.number().optional(),
  bonus: z.number().optional(),
  companyId: z.string().optional(),
  branchId: z.string().optional(),
  netSalary: z.number().optional(),
  status: z.enum(['DRAFT', 'PAID']).optional(),
});

type PayrollFormInputs = z.infer<typeof payrollSchema>;

export const PayrollModal: React.FC<PayrollModalProps> = ({ isOpen, onClose, onSave, recordToEdit }) => {
  const { t } = useTranslation();
  const { employees } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PayrollFormInputs>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      payrollMonth: new Date().getMonth() + 1,
      payrollYear: new Date().getFullYear(),
      status: 'DRAFT',
      basicSalary: 0,
      housingAllowance: 0,
      medicalAllowance: 0,
      workNatureAllowance: 0,
      transportAllowance: 0,
      commissions: 0,
      bonus: 0,
      netSalary: 0
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (recordToEdit) {
        const empId = typeof recordToEdit.employeeId === 'object' ? recordToEdit.employeeId?._id : recordToEdit.employeeId;
        const compId = typeof recordToEdit.companyId === 'object' ? recordToEdit.companyId?._id : recordToEdit.companyId;
        const branchId = typeof recordToEdit.branchId === 'object' ? recordToEdit.branchId?._id : recordToEdit.branchId;
        reset({
          employeeId: empId || '',
          payrollMonth: Number(recordToEdit.payrollMonth),
          payrollYear: Number(recordToEdit.payrollYear),
          basicSalary: recordToEdit.basicSalary,
          housingAllowance: recordToEdit.housingAllowance,
          medicalAllowance: recordToEdit.medicalAllowance,
          workNatureAllowance: recordToEdit.workNatureAllowance,
          transportAllowance: recordToEdit.transportAllowance,
          commissions: recordToEdit.commissions,
          bonus: recordToEdit.bonus,
          companyId: compId || '',
          branchId: branchId || '',
          netSalary: recordToEdit.netSalary,
          status: recordToEdit.status as any,
        });
      } else {
        reset({
          employeeId: '', 
          payrollMonth: new Date().getMonth() + 1,
          payrollYear: new Date().getFullYear(),
          status: 'DRAFT',
        });
      }
    }
  }, [recordToEdit, isOpen, reset]);

  const onSubmit = (data: PayrollFormInputs) => {
    const newRecord: Payroll = {
      id: recordToEdit ? recordToEdit.id : '',
      _id: recordToEdit ? recordToEdit._id : '',
      employeeId: data.employeeId || '', 
      companyId: data.companyId || '',
      branchId: data.branchId || '',
      payrollMonth: Number(data.payrollMonth),
      payrollYear: Number(data.payrollYear),
      basicSalary: data.basicSalary || 0,
      housingAllowance: data.housingAllowance || 0,
      medicalAllowance: data.medicalAllowance || 0,
      workNatureAllowance: data.workNatureAllowance || 0,
      transportAllowance: data.transportAllowance || 0,
      commissions: data.commissions || 0,
      bonus: data.bonus || 0,
      overtimeHours: recordToEdit?.overtimeHours || 0,
      overtimeRate: recordToEdit?.overtimeRate || 0,
      overtimeAmount: recordToEdit?.overtimeAmount || 0,
      totalAllowances: recordToEdit?.totalAllowances || 0,
      totalDeductions: recordToEdit?.totalDeductions || 0,
      grossSalary: recordToEdit?.grossSalary || 0,
      netSalary: data.netSalary || 0,
      status: data.status || 'DRAFT',
      notes: recordToEdit?.notes || '',
      deductions: recordToEdit?.deductions || {
        absence: 0,
        lateArrival: 0,
        earlyLeave: 0,
        loan: 0,
        penalties: 0,
        other: 0
      }
    };
    onSave(newRecord);
    onClose();
  };

  const title = (
    <div className="flex items-center gap-3">
      {recordToEdit ? (
        <Edit2 size={24} className="text-[#2D3748]" />
      ) : (
        <PlusCircle size={24} className="text-[#2D3748]" />
      )}
      <span className="text-[#2D3748] font-bold text-2xl uppercase tracking-tight">
        {recordToEdit ? "Edit Payroll" : "Generate All Payrolls"}
      </span>
    </div>
  );

  const footer = (
    <div className="flex justify-end gap-4 w-full">
       <Button 
          type="button" 
          disabled={isSubmitting}
          className="bg-[#4A5568] hover:bg-[#2D3748] text-white px-10 rounded-xl py-3 font-bold" 
          onClick={onClose}
        >
          {t('cancel')}
        </Button>
       <Button 
          type="submit" 
          form="payroll-form" 
          disabled={isSubmitting}
          className="bg-[#4361EE] hover:bg-blue-700 min-w-[200px] flex items-center justify-center gap-2 text-white rounded-xl py-3 font-bold shadow-lg shadow-blue-200"
        >
          {recordToEdit ? (
            "Save Changes"
          ) : (
            <>
              {isSubmitting ? 'Generating...' : (
                <>
                  <PlusCircle size={18} />
                  Start Generation
                </>
              )}
            </>
          )}
       </Button>
    </div>
  );

  // Month values as numbers to ensure integer handling
  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];
  
  const years = [2023, 2024, 2025, 2026];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      className={recordToEdit ? "max-w-4xl" : "max-w-2xl"}
    >
      <form id="payroll-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
         {!recordToEdit ? (
            <div className="space-y-8 py-2">
               <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-primary"><Users size={20} /></div>
                  <div>
                    <p className="text-sm font-bold text-blue-900">Batch Generation Mode</p>
                    <p className="text-xs text-blue-700 mt-1">This will automatically calculate salaries for all eligible employees for the selected period.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-x-10">
                  <Select 
                     label={<span className="text-[#718096] font-bold flex items-center gap-1">{t('employee_info')}</span>}
                     options={[
                        {value: '', label: '⚡ All Active Employees'}, 
                        ...employees.map(e => ({ value: e.id, label: e.fullName }))
                     ]}
                     {...register('employeeId')} 
                     error={errors.employeeId?.message as string} 
                     className="rounded-xl border-[#E2E8F0] py-3 text-sm font-black text-primary bg-white"
                  />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <Select 
                     label={<span className="text-[#718096] font-bold flex items-center gap-1">Payroll Month <span className="text-red-500 font-bold">*</span></span>}
                     options={months}
                     {...register('payrollMonth', { valueAsNumber: true })} 
                     className="rounded-xl border-[#E2E8F0] py-3 text-sm font-medium"
                  />
                  <Select 
                     label={<span className="text-[#718096] font-bold flex items-center gap-1">Payroll Year <span className="text-red-500 font-bold">*</span></span>}
                     options={years.map(y => ({ value: y, label: String(y) }))}
                     {...register('payrollYear', { valueAsNumber: true })} 
                     className="rounded-xl border-[#E2E8F0] py-3 text-sm font-medium"
                  />
               </div>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
               <Select 
                  label={<span className="text-[#718096] font-bold flex items-center gap-1">{t('employee_info')}</span>}
                  options={employees.map(e => ({ value: e.id, label: e.fullName }))}
                  {...register('employeeId')} 
                  disabled
                  className="rounded-xl border-[#E2E8F0] py-3 text-sm font-medium opacity-60"
               />
               <Input label={<span className="text-[#718096] font-bold">Basic Salary <span className="text-red-500 font-bold">*</span></span>} placeholder="0.00" type="number" {...register('basicSalary', { valueAsNumber: true })} className="rounded-xl border-[#E2E8F0] py-3" />
               
               <Input label={<span className="text-[#718096] font-bold">Housing Allowance</span>} placeholder="0.00" type="number" {...register('housingAllowance', { valueAsNumber: true })} className="rounded-xl border-[#E2E8F0] py-3" />
               <Input label={<span className="text-[#718096] font-bold">Medical Allowance</span>} placeholder="0.00" type="number" {...register('medicalAllowance', { valueAsNumber: true })} className="rounded-xl border-[#E2E8F0] py-3" />
               
               <Input label={<span className="text-[#718096] font-bold">Work Nature Allowance</span>} placeholder="0.00" type="number" {...register('workNatureAllowance', { valueAsNumber: true })} className="rounded-xl border-[#E2E8F0] py-3" />
               <Input label={<span className="text-[#718096] font-bold">Transport Allowance</span>} placeholder="0.00" type="number" {...register('transportAllowance', { valueAsNumber: true })} className="rounded-xl border-[#E2E8F0] py-3" />
               
               <Input label={<span className="text-[#718096] font-bold">Commissions</span>} placeholder="0.00" type="number" {...register('commissions', { valueAsNumber: true })} className="rounded-xl border-[#E2E8F0] py-3" />
               <Input label={<span className="text-[#718096] font-bold">Bonus</span>} placeholder="0.00" type="number" {...register('bonus', { valueAsNumber: true })} className="rounded-xl border-[#E2E8F0] py-3" />
               
               <Input label={<span className="text-[#718096] font-bold">Company ID</span>} {...register('companyId')} className="rounded-xl border-[#E2E8F0] py-3" />
               <Input label={<span className="text-[#718096] font-bold">Branch ID</span>} {...register('branchId')} className="rounded-xl border-[#E2E8F0] py-3" />
               
               <div className="md:col-span-2">
                 <Input label={<span className="text-primary font-black">Net Total Salary <span className="text-red-500 font-bold">*</span></span>} placeholder="0.00" type="number" {...register('netSalary', { valueAsNumber: true })} className="rounded-xl border-primary py-3 font-bold text-primary text-lg" />
               </div>

               <Select 
                  label={<span className="text-[#718096] font-bold flex items-center gap-1">Payment Status <span className="text-red-500 font-bold">*</span></span>}
                  options={[{value: 'PAID', label: 'Paid'}, {value: 'DRAFT', label: 'Draft'}]}
                  {...register('status')} 
                  className="rounded-xl border-[#E2E8F0] py-3 text-sm font-medium"
               />
               
               <div className="grid grid-cols-2 gap-4">
                  <Select 
                    label={<span className="text-[#718096] font-bold">Month</span>}
                    options={months}
                    {...register('payrollMonth', { valueAsNumber: true })} 
                    className="rounded-xl border-[#E2E8F0] py-3 text-sm font-medium"
                  />
                  <Select 
                    label={<span className="text-[#718096] font-bold">Year</span>}
                    options={years.map(y => ({ value: y, label: String(y) }))}
                    {...register('payrollYear', { valueAsNumber: true })} 
                    className="rounded-xl border-[#E2E8F0] py-3 text-sm font-medium"
                  />
               </div>
            </div>
         )}
      </form>
    </Modal>
  );
};
