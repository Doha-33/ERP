
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, History } from 'lucide-react';
import { Card, Button } from '../../components/ui/Common';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ResponsesHistoryModal } from '../../components/hr/ResponsesHistoryModal';
import { ActionHistory } from '../../types';

type ResponseType = 'eos' | 'loans' | 'leaves' | 'requests';

export const Responses: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { endOfServices, loans, leaves, requests, actionHistory, fetchActionHistory, currentUserEmployee } = useData();
  const [activeTab, setActiveTab] = useState<ResponseType>('eos');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<ActionHistory[]>([]);

  const isAdmin = user?.role === 'admin';

  const handleShowHistory = async (id: string) => {
    await fetchActionHistory();
    const filteredHistory = actionHistory.filter(h => h.requestId === id);
    setSelectedHistory(filteredHistory);
    setIsHistoryOpen(true);
  };

  const data = useMemo(() => {
    let source: any[] = [];
    switch (activeTab) {
      case 'eos': source = endOfServices; break;
      case 'loans': source = loans; break;
      case 'leaves': source = leaves; break;
      case 'requests': source = requests; break;
    }

    // Filter by employee identity if not admin
    const filteredSource = isAdmin 
      ? source 
      : source.filter(item => item.employeeId === currentUserEmployee?.id);

    // Map to displayable format
    return filteredSource.map(i => ({
       id: i.id, 
       name: i.employeeName, 
       date: i.requestDate || i.createdAt || i.fromDate || i.date, 
       sub: i.eosType || i.loanAmount || i.leaveType || i.requestType 
    }));
  }, [activeTab, endOfServices, loans, leaves, requests, isAdmin, currentUserEmployee]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('responses')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">
             {isAdmin ? t('manage_responses') : 'Track the status of your requests'}
           </p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
           {(['eos', 'loans', 'leaves', 'requests'] as ResponseType[]).map((tab) => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-500 hover:text-primary'
                }`}
             >
                {t(tab === 'eos' ? 'end_of_service' : tab)}
             </button>
           ))}
        </div>
      </div>

      <Card className="p-8">
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-8 border-b pb-4">
          {t(`employee_${activeTab === 'eos' ? 'eos' : activeTab}`)}
        </h3>

        <div className="space-y-6">
           <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              {t(`recent_${activeTab === 'eos' ? 'eos' : activeTab}`)}
           </p>

           <div className="space-y-3">
              {data.length === 0 ? (
                <div className="p-12 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  No {activeTab} records found.
                </div>
              ) : (
                data.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-[#F5F7FF] dark:bg-gray-800/40 rounded-xl hover:shadow-md transition-all group border border-transparent hover:border-primary/20">
                    <div className="flex items-center gap-6">
                        <div className="p-2.5 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                          <FileText className="text-slate-400" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100">{item.name}</h4>
                          <div className="flex items-center gap-4 text-xs text-slate-400 font-bold mt-1">
                              <span>{item.date}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                              <span>{item.sub}</span>
                          </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleShowHistory(item.id)}
                          className="px-5 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg border border-primary transition-colors flex items-center gap-2"
                        >
                          <History size={16} />
                          <span className="hidden sm:inline">{t('action_history')}</span>
                        </button>
                        <Button 
                          className="bg-[#4361EE] hover:bg-blue-700 px-8"
                          onClick={() => navigate(`/hr/responses/${activeTab}/${item.id}`)}
                        >
                          {t('view')}
                        </Button>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </Card>

      <ResponsesHistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={selectedHistory} 
      />
    </div>
  );
};
