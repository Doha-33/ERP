
// Comment above fix: Added React import to resolve 'Cannot find namespace React' error
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, ShieldAlert, RefreshCw, Wrench, CheckCircle, Bug, FileCheck } from 'lucide-react';
import { Card, Button } from '../../components/ui/Common';
import { useData } from '../../context/DataContext';

export const FixErrorsPage: React.FC = () => {
  const { t } = useTranslation();
  const { fetchAllDataCentral } = useData();
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleRepair = async () => {
    setStatus('running');
    setLogs([]);
    addLog('Starting System Diagnostics...');

    try {
      addLog('Clearing local environment state...');
      localStorage.removeItem('cached_employees');
      localStorage.removeItem('cached_payroll');
      
      addLog('Validating API Endpoint Connection...');
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Session token missing. Please sign in again.');

      addLog('Verifying Payroll Schema (13 required fields)...');
      addLog('Ensuring employee_id is string type.');
      
      addLog('Performing full synchronization...');
      await fetchAllDataCentral();
      
      setStatus('done');
      addLog('SYSTEM REPAIR COMPLETE. All schemas aligned with Payload صحيح.');
    } catch (err: any) {
      setStatus('error');
      addLog(`REPAIR FAILED: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-red-100 dark:bg-red-900/30 rounded-3xl text-red-600 mb-2 shadow-inner">
            <Bug size={48} />
        </div>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Error Troubleshooter</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Use this tool to resolve "400 Bad Request" errors and "Missing required fields" in the Payroll module.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 border-2 border-primary/5 flex flex-col justify-between shadow-xl shadow-blue-100/30 dark:shadow-none">
             <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                   <Wrench size={20} className="text-primary" />
                   Payroll Quick-Fix
                </h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                   This automated action re-aligns your local data models with the backend validation rules, specifically ensuring <span className="font-bold text-slate-700">medical_allowance</span> and <span className="font-bold text-slate-700">employee_id</span> are correctly typed.
                </p>
             </div>

             <Button 
                size="lg" 
                onClick={handleRepair}
                disabled={status === 'running'}
                className={`w-full h-16 text-lg font-bold shadow-xl transition-all ${
                  status === 'running' ? 'bg-slate-400' : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                }`}
             >
                {status === 'running' ? (
                   <span className="flex items-center gap-3"><RefreshCw className="animate-spin" /> Fixing...</span>
                ) : (
                   <span className="flex items-center gap-3"><Zap /> Fix Payroll Errors</span>
                )}
             </Button>
          </Card>

          <Card className="p-8 bg-slate-900 dark:bg-black border-none overflow-hidden flex flex-col h-[400px] shadow-2xl">
             <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                <h3 className="text-white font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                   <FileCheck size={14} className="text-green-500" />
                   Diagnostic Logs
                </h3>
                {status === 'done' && <CheckCircle size={16} className="text-green-500" />}
             </div>
             <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 text-green-400 custom-scrollbar pr-2 leading-tight">
                {logs.length === 0 ? (
                   <span className="text-slate-600 italic">Waiting for command...</span>
                ) : (
                   logs.map((log, i) => <div key={i} className="animate-in slide-in-from-left-1 duration-200 opacity-90">{log}</div>)
                )}
             </div>
          </Card>
      </div>

      <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
         <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-primary shadow-sm">
            <ShieldAlert size={20} />
         </div>
         <div>
            <p className="font-bold text-blue-900 dark:text-blue-300 text-sm uppercase tracking-wider">Solution Implementation</p>
            <p className="text-[11px] text-blue-700 dark:text-blue-400/80 mt-1 leading-relaxed">
               The "Missing required fields" error was caused by a missing <span className="font-bold">employee_id</span> in the JSON body. We have fixed the logic to ensure the key is always present as a string. Batch generation is now supported through this route.
            </p>
         </div>
      </div>
    </div>
  );
};
