import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Unlock, Calendar, History, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { MonthlyClosing as MonthlyClosingType } from '../../types';
import { toast } from 'sonner';

export const MonthlyClosing: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { closings, accountingLoading, closeMonth, reopenMonth } = useData();

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<{ month: number; year: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isRTL = i18n.language === 'ar';

  const filteredClosings = useMemo(() => {
    return closings.filter(closing => 
      closing.year.toString().includes(searchTerm) || 
      closing.month.toString().includes(searchTerm) ||
      `${closing.month}/${closing.year}`.includes(searchTerm)
    );
  }, [closings, searchTerm]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalMonths = closings.length;
    const closedMonths = closings.filter(c => c.isClosed).length;
    const openMonths = totalMonths - closedMonths;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const isCurrentMonthClosed = closings.find(
      c => c.year === currentYear && c.month === currentMonth
    )?.isClosed || false;
    
    // Get last closed period
    const lastClosed = [...closings]
      .filter(c => c.isClosed)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      })[0];
    
    return { 
      totalMonths, 
      closedMonths, 
      openMonths, 
      isCurrentMonthClosed,
      lastClosed: lastClosed ? `${lastClosed.month}/${lastClosed.year}` : '-'
    };
  }, [closings]);

  const handleClose = async (data: { month: number; year: number }) => {
    try {
      await closeMonth(data);
      setIsConfirmModalOpen(false);
      setIsCloseModalOpen(false);
      setSelectedPeriod(null);
      toast.success(t('month_closed_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_close_month'));
    }
  };

  const handleReopen = async () => {
    if (!selectedPeriod) return;
    try {
      await reopenMonth(selectedPeriod);
      setIsReopenModalOpen(false);
      setSelectedPeriod(null);
      toast.success(t('month_reopened_successfully'));
    } catch (error) {
      console.error(error);
      toast.error(t('failed_to_reopen_month'));
    }
  };

  const columns: Column<MonthlyClosingType>[] = [
    { 
      header: t('period'), 
      render: (item) => `${item.month}/${item.year}`,
      cell: (item: MonthlyClosingType) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span className="font-medium text-gray-900">{item.month}/{item.year}</span>
        </div>
      )
    },
    { 
      header: t('status'), 
      render: (item) => (
        <Badge status={item.isClosed ? 'danger' : 'success'}>
          {item.isClosed ? t('closed') : t('open')}
        </Badge>
      )
    },
    { 
      header: t('closed_at'), 
      render: (item) => item.closedAt ? new Date(item.closedAt).toLocaleString() : '-',
      cell: (item: MonthlyClosingType) => (
        <span className="text-sm text-gray-600">
          {item.closedAt ? new Date(item.closedAt).toLocaleString() : '-'}
        </span>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.isClosed ? (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => { setSelectedPeriod({ month: item.month, year: item.year }); setIsReopenModalOpen(true); }}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Unlock size={14} className="mr-1" /> {t('reopen')}
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={() => { setSelectedPeriod({ month: item.month, year: item.year }); setIsConfirmModalOpen(true); }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Lock size={14} className="mr-1" /> {t('close_month')}
            </Button>
          )}
        </div>
      )
    }
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Check if a period is already closed
  const isPeriodClosed = (month: number, year: number) => {
    return closings.some(c => c.month === month && c.year === year && c.isClosed);
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t('monthly_closing')}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            {t('manage_accounting_periods_closing')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <ExportDropdown data={closings} filename="monthly_closings" />
          </div>
          <Button 
            onClick={() => setIsCloseModalOpen(true)} 
            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto justify-center"
          >
            <Lock size={20} className="mr-2" /> {t('close_new_period')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('total_periods')}</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalMonths}</p>
            </div>
            <History size={24} className="text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('closed_periods')}</p>
              <p className="text-2xl font-bold text-red-600">{summary.closedMonths}</p>
            </div>
            <Lock size={24} className="text-red-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('open_periods')}</p>
              <p className="text-2xl font-bold text-green-600">{summary.openMonths}</p>
            </div>
            <Unlock size={24} className="text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('current_month_status')}</p>
              <p className={`text-lg font-bold ${summary.isCurrentMonthClosed ? 'text-red-600' : 'text-green-600'}`}>
                {summary.isCurrentMonthClosed ? t('closed') : t('open')}
              </p>
            </div>
            {summary.isCurrentMonthClosed ? (
              <Lock size={24} className="text-red-400" />
            ) : (
              <Unlock size={24} className="text-green-400" />
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* History Table */}
        <div className="lg:col-span-2">
          <Card className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <History size={20} className="text-blue-600" /> 
                {t('closing_history')}
              </h2>
              <div className="w-full sm:w-64">
                <Input 
                  placeholder={t('search_periods')} 
                  icon={<Search size={18} />} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                />
              </div>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-full inline-block align-middle">
                <Table 
                  data={filteredClosings} 
                  columns={columns} 
                  keyExtractor={(item) => item._id || `${item.month}-${item.year}`} 
                  isLoading={accountingLoading}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Close Form */}
        <div>
          <Card className="p-4 bg-white border border-gray-200 rounded-xl h-fit sticky top-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-blue-600" /> 
              {t('quick_close')}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const month = Number(formData.get('month'));
              const year = Number(formData.get('year'));
              
              if (isPeriodClosed(month, year)) {
                toast.error(t('period_already_closed'));
                return;
              }
              
              handleClose({ month, year });
            }} className="space-y-4">
              <Select 
                label={t('month')} 
                name="month" 
                defaultValue={currentMonth}
                options={months.map(m => ({ 
                  value: m, 
                  label: t(`month_${m}`) || m.toString() 
                }))}
                required
                fullWidth
              />
              <Select 
                label={t('year')} 
                name="year" 
                defaultValue={currentYear}
                options={years.map(y => ({ value: y, label: y.toString() }))}
                required
                fullWidth
              />
              
              {/* Info Box */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">{t('closing_effects')}:</p>
                    <ul className="list-disc list-inside mt-1 text-xs">
                      <li>{t('no_new_transactions')}</li>
                      <li>{t('period_finalized')}</li>
                      <li>{t('reports_frozen')}</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                fullWidth 
                className="bg-red-600 hover:bg-red-700 text-white justify-center" 
                isLoading={accountingLoading}
              >
                <Lock size={18} className="mr-2" /> {t('close_period')}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Close Period Modal */}
      <Modal 
        isOpen={isCloseModalOpen} 
        onClose={() => setIsCloseModalOpen(false)}
        title={t('close_accounting_period')}
        className="w-full max-w-md mx-4 sm:mx-auto"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const month = Number(formData.get('month'));
          const year = Number(formData.get('year'));
          
          if (isPeriodClosed(month, year)) {
            toast.error(t('period_already_closed'));
            return;
          }
          
          setSelectedPeriod({ month, year });
          setIsConfirmModalOpen(true);
        }} className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
            <Select 
              label={t('month')} 
              name="month" 
              defaultValue={currentMonth}
              options={months.map(m => ({ 
                value: m, 
                label: t(`month_${m}`) || m.toString() 
              }))}
              required
              fullWidth
            />
            <Select 
              label={t('year')} 
              name="year" 
              defaultValue={currentYear}
              options={years.map(y => ({ value: y, label: y.toString() }))}
              required
              fullWidth
            />
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <strong>{t('warning')}:</strong> {t('closing_period_warning')}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsCloseModalOpen(false)} 
              className="w-full sm:w-auto"
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto justify-center"
            >
              {t('continue')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modals */}
      <ConfirmationModal 
        isOpen={isConfirmModalOpen}
        onClose={() => { 
          setIsConfirmModalOpen(false); 
          if(!isCloseModalOpen) setSelectedPeriod(null); 
        }}
        onConfirm={() => selectedPeriod && handleClose(selectedPeriod)}
        title={t('close_month')}
        message={selectedPeriod ? `${t('confirm_close_month')} ${selectedPeriod.month}/${selectedPeriod.year}?` : ''}
      />

      <ConfirmationModal 
        isOpen={isReopenModalOpen}
        onClose={() => { 
          setIsReopenModalOpen(false); 
          setSelectedPeriod(null); 
        }}
        onConfirm={handleReopen}
        title={t('reopen_month')}
        message={selectedPeriod ? `${t('confirm_reopen_month')} ${selectedPeriod.month}/${selectedPeriod.year}?` : ''}
      />
    </div>
  );
};