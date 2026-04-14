import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, FileText, Download } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui/Common';
import { useData } from '../../context/DataContext';
import { ResponseRejectModal } from '../../components/hr/ResponseRejectModal';
import { ResponseLoanModal } from '../../components/hr/ResponseLoanModal';

const DetailItem: React.FC<{ label: string; value: string | boolean | undefined }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
      {typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : (value || '-')}
    </p>
  </div>
);

export const ResponseDetails: React.FC = () => {
  const { type, id } = useParams<{ type: string, id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { 
    endOfServices, 
    loans, 
    leaves, 
    requests, 
    toggleLoanWorkflow, 
    toggleLeaveWorkflow, 
    toggleRequestWorkflow,
    rejectRequest,
    rejectLeave,
    approveEndOfService,
    rejectEndOfService,
    updateLoan,
    rejectLoan
  } = useData();
  
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isLoanOpen, setIsLoanOpen] = useState(false);

  const item = useMemo(() => {
    switch (type) {
      case 'eos': return endOfServices.find(i => i.id === id);
      case 'loans': return loans.find(i => i.id === id);
      case 'leaves': return leaves.find(i => i.id === id);
      case 'requests': return requests.find(i => i.id === id);
      default: return null;
    }
  }, [type, id, endOfServices, loans, leaves, requests]);

  if (!item) return <div>Not found</div>;

  const handleAction = (action: string) => {
    if (action === 'Rejected') {
      setIsRejectOpen(true);
    } else if (action === 'Approved') {
        if (type === 'loans') toggleLoanWorkflow(id!, 'hr');
        else if (type === 'leaves') toggleLeaveWorkflow(id!, 'hr');
        else if (type === 'requests') toggleRequestWorkflow(id!, 'hr');
        else if (type === 'eos') approveEndOfService(id!);
    }
  };

  const renderDetails = () => {
    if (type === 'eos') {
      const eos = item as any;
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 gap-x-6">
          <DetailItem label="EOS ID" value={eos.id} />
          <DetailItem label={t('job_title')} value={eos.jobTitle} />
          <DetailItem label={t('department')} value={eos.department} />
          <DetailItem label={t('eos_type')} value={eos.eosType} />
          <DetailItem label={t('start_date')} value={eos.startDate} />
          <DetailItem label={t('last_working_day')} value={eos.lastWorkingDay} />
          <DetailItem label={t('years_of_service')} value={eos.yearsOfService} />
          <div className="space-y-1">
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('attachment')}</p>
             <div className="p-2 bg-slate-50 dark:bg-gray-800 rounded-lg w-fit cursor-pointer hover:bg-slate-100 transition-colors">
                <FileText size={18} className="text-slate-400" onClick={() => eos.attachment && window.open(eos.attachment, '_blank')} />
             </div>
          </div>
          <DetailItem label={t('collect_laptop')} value={eos.collectLaptop === 'true'} />
          <DetailItem label={t('collect_access_cards')} value={eos.collectAccessCards === 'true'} />
          <DetailItem label={t('final_settlement_calculation')} value={eos.finalSettlement} />
          <DetailItem label={t('reason')} value={eos.reason} />
          {eos.rejected_reason && <DetailItem label={t('rejected_reason')} value={eos.rejected_reason} />}
        </div>
      );
    }
    if (type === 'loans') {
       const loan = item as any;
       return (
         <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 gap-x-6">
            <DetailItem label="Loan ID" value={loan.loanId} />
            <DetailItem label={t('loan_amount')} value={loan.loanAmount} />
            <DetailItem label={t('remaining_amount')} value={loan.remainingAmount} />
            <DetailItem label={t('deduction_type')} value={loan.deductionType} />
            <DetailItem label={t('installment_amount')} value={loan.installmentAmount} />
            <DetailItem label={t('start_month')} value={loan.startMonth} />
            <DetailItem label={t('status')} value={loan.status} />
            <DetailItem label={t('manager_approval')} value={loan.approved_by_manager} />
            <DetailItem label={t('hr_approval')} value={loan.approved_by_hr} />
         </div>
       );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 gap-x-6">
            <DetailItem label="Request ID" value={(item as any).leavesId || (item as any).requestId} />
            <DetailItem label={t('request_type')} value={(item as any).leaveType || (item as any).requestType} />
            <DetailItem label={t('reason')} value={(item as any).reason || (item as any).description} />
            <DetailItem label={t('date')} value={(item as any).fromDate || (item as any).date} />
        </div>
    );
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div className="flex items-center gap-4">
               <button onClick={() => navigate('/hr/responses')} className="p-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                   <ChevronLeft size={20} className="text-gray-500" />
               </button>
               <div>
                  <h1 className="text-2xl font-bold dark:text-white">{t('responses')}</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_responses')}</p>
               </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {(['eos', 'loans', 'leaves', 'requests'] as string[]).map((tab) => (
                  <button
                      key={tab}
                      onClick={() => navigate(`/hr/responses`)}
                      className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        type === tab 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-gray-500 opacity-50'
                      }`}
                  >
                      {t(tab === 'eos' ? 'end_of_service' : tab)}
                  </button>
                ))}
              </div>
           </div>
       </div>

       <Card className="p-10 space-y-10 overflow-visible relative">
          <div className="flex items-center justify-between border-b pb-8">
             <div className="flex items-center gap-4 p-3 bg-[#D4DBFF] dark:bg-blue-900/30 rounded-2xl border-none min-w-[280px]">
                <img src={(item as any).avatar} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                <span className="font-bold text-slate-800 dark:text-slate-100">{(item as any).employeeName}</span>
             </div>

             <div className="relative group">
                <select 
                   onChange={(e) => handleAction(e.target.value)}
                   className="appearance-none bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-700 py-3 px-8 pr-12 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[180px] shadow-sm"
                >
                   <option value="">Action</option>
                   <option value="Approved">Approved</option>
                   <option value="Pending">Pending</option>
                   <option value="Rejected">Rejected</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                   <svg width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M1 1L7 7L13 1" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
             </div>
          </div>

          <div className="space-y-1">
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('created_at')}</p>
             <p className="text-sm font-bold text-slate-700">{(item as any).createdAt || (item as any).date}</p>
          </div>

          <div className="space-y-8">
             <h4 className="px-6 py-4 bg-[#F5F7FF] dark:bg-gray-800/50 rounded-xl font-bold text-slate-800 dark:text-slate-100">
                {t(`details_of_${type === 'eos' ? 'eos' : type.slice(0, -1)}`)}
             </h4>

             <div className="px-6">
                {renderDetails()}
             </div>
          </div>

          {type === 'loans' && (
            <div className="flex justify-end pt-8">
               <Button className="bg-[#4361EE] hover:bg-blue-700" onClick={() => setIsLoanOpen(true)}>
                  Manage installments
               </Button>
            </div>
          )}
       </Card>

       <ResponseRejectModal 
         isOpen={isRejectOpen} 
         onClose={() => setIsRejectOpen(false)} 
         onSave={(reason) => {
            if (type === 'requests') rejectRequest(id!, reason);
            else if (type === 'leaves') rejectLeave(id!, reason);
            else if (type === 'eos') rejectEndOfService(id!, reason);
            else if (type === 'loans') rejectLoan(id!, reason);
         }} 
       />

       {type === 'loans' && (
         <ResponseLoanModal 
           isOpen={isLoanOpen} 
           onClose={() => setIsLoanOpen(false)} 
           loan={item as any} 
           onSave={async (updated) => {
              try {
                await updateLoan(updated);
              } catch (e) {
                console.error(e);
              }
           }} 
         />
       )}
    </div >
  );
};