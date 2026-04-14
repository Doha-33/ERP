import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, Button } from '../../components/ui/Common';
import { useData } from '../../context/DataContext';

export const SyncDataPage: React.FC = () => {
  const { t } = useTranslation();
  const { fetchAllDataCentral } = useData();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      await fetchAllDataCentral();
      setLastSync(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Synchronization failed');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white">{t('system_sync')}</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Synchronize your local workspace with the latest data from the cloud servers. This will refresh all employees, payrolls, and requests.
        </p>
      </div>

      <Card className="p-12 flex flex-col items-center justify-center text-center shadow-2xl shadow-blue-100 dark:shadow-none border-2 border-primary/5">
        <div className={`w-24 h-24 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary mb-8 ${isSyncing ? 'animate-spin' : ''}`}>
          <RefreshCw size={48} />
        </div>

        <Button 
          size="lg" 
          onClick={handleSync}
          disabled={isSyncing}
          className="bg-[#4361EE] hover:bg-blue-700 min-w-[280px] h-16 text-xl font-bold shadow-xl shadow-blue-200 dark:shadow-none"
        >
          {isSyncing ? (
            <span className="flex items-center gap-3">
              <RefreshCw className="animate-spin" size={24} />
              Syncing...
            </span>
          ) : (
            'Synchronize Now'
          )}
        </Button>

        {lastSync && !error && (
          <div className="mt-8 flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full border border-green-100">
            <CheckCircle size={18} />
            Last Sync Successful at {lastSync}
          </div>
        )}

        {error && (
          <div className="mt-8 flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-2 rounded-full border border-red-100">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
         <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status</p>
            <p className="font-bold text-slate-700 dark:text-slate-200">Connected</p>
         </div>
         <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Server</p>
            <p className="font-bold text-slate-700 dark:text-slate-200">scoeybackend.onrender.com</p>
         </div>
         <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Protocol</p>
            <p className="font-bold text-slate-700 dark:text-slate-200">HTTPS / REST</p>
         </div>
      </div>
    </div>
  );
};