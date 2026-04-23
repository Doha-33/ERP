import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Unlock, Calendar, History, Search } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useData } from '../../context/DataContext';
import { MonthlyClosing as MonthlyClosingType } from '../../types';
import { toast } from 'sonner';

export const MonthlyClosing: React.FC = () => {
  const { t } = useTranslation();
  const { closings, accountingLoading, closeMonth, reopenMonth } = useData();

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<{ month: number; year: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClosings = closings.filter(closing => 
    closing.year.toString().includes(searchTerm) || 
    closing.month.toString().includes(searchTerm)
  );

  const handleClose = async (data: { month: number; year: number }) => {
    try {
      await closeMonth(data);
      setIsConfirmModalOpen(false);
      setIsCloseModalOpen(false);
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
      render: (item) => `${item.month}/${item.year}`
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
      render: (item) => item.closedAt ? new Date(item.closedAt).toLocaleString() : '-'
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
              className="text-primary border-primary hover:bg-blue-50"
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
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('monthly_closing')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_accounting_periods_closing')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={closings} filename="monthly_closings" />
          <Button onClick={() => setIsCloseModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
            <Lock size={20} className="mr-2" /> {t('close_new_period')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <History size={20} className="text-primary" /> {t('closing_history')}
            </h2>
            <Input 
              placeholder={t('search_periods')} 
              icon={<Search size={18} />} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <Table 
            data={filteredClosings} 
            columns={columns} 
            keyExtractor={(item) => item._id || `${item.month}-${item.year}`} 
            isLoading={accountingLoading}
          />
        </Card>

        <Card className="h-fit">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-primary" /> {t('quick_close')}
          </h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleClose({
              month: Number(formData.get('month')),
              year: Number(formData.get('year'))
            });
          }} className="space-y-4">
            <Select 
              label={t('month')} 
              name="month" 
              defaultValue={new Date().getMonth() + 1}
              options={months.map(m => ({ value: m, label: t(`month_${m}`) || m.toString() }))}
              required
            />
            <Select 
              label={t('year')} 
              name="year" 
              defaultValue={currentYear}
              options={years.map(y => ({ value: y, label: y.toString() }))}
              required
            />
            <Button type="submit" fullWidth className="bg-red-600 hover:bg-red-700 text-white" isLoading={accountingLoading}>
              <Lock size={18} className="mr-2" /> {t('close_period')}
            </Button>
          </form>
        </Card>
      </div>

      <Modal 
        isOpen={isCloseModalOpen} 
        onClose={() => setIsCloseModalOpen(false)}
        title={t('close_accounting_period')}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          setSelectedPeriod({
            month: Number(formData.get('month')),
            year: Number(formData.get('year'))
          });
          setIsConfirmModalOpen(true);
        }} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label={t('month')} 
              name="month" 
              defaultValue={new Date().getMonth() + 1}
              options={months.map(m => ({ value: m, label: t(`month_${m}`) || m.toString() }))}
              required
            />
            <Select 
              label={t('year')} 
              name="year" 
              defaultValue={currentYear}
              options={years.map(y => ({ value: y, label: y.toString() }))}
              required
            />
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 text-sm">
            <strong>{t('warning')}:</strong> {t('closing_period_warning')}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setIsCloseModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" isLoading={accountingLoading}>{t('confirm_close')}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal 
        isOpen={isConfirmModalOpen}
        onClose={() => { setIsConfirmModalOpen(false); if(!isCloseModalOpen) setSelectedPeriod(null); }}
        onConfirm={() => selectedPeriod && handleClose(selectedPeriod)}
        title={t('close_month')}
        message={selectedPeriod ? `${t('confirm_close_month')} ${selectedPeriod.month}/${selectedPeriod.year}?` : ''}
      />

      <ConfirmationModal 
        isOpen={isReopenModalOpen}
        onClose={() => { setIsReopenModalOpen(false); setSelectedPeriod(null); }}
        onConfirm={handleReopen}
        title={t('reopen_month')}
        message={selectedPeriod ? `${t('confirm_reopen_month')} ${selectedPeriod.month}/${selectedPeriod.year}?` : ''}
      />
    </div>
  );
};
