
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, Download, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { PricingRule } from '../../types';
import { useData } from '../../context/DataContext';
import { PricingRuleModal } from '../../components/sales/PricingRuleModal';

export const PricingRules: React.FC = () => {
  const { t } = useTranslation();
  const { pricingRules, addPricingRule, updatePricingRule, deletePricingRule } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return pricingRules.filter(rule => 
      rule.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.product.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pricingRules, searchTerm]);

  const columns: Column<PricingRule>[] = [
    { header: t('rule_name'), accessorKey: 'ruleName' },
    { 
      header: t('customer'), 
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-[10px] text-white">
            {item.customer.charAt(0)}
          </div>
          <span>{item.customer}</span>
        </div>
      )
    },
    { 
      header: t('product'), 
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-500 rounded-sm" />
          </div>
          <span>{item.product}</span>
        </div>
      )
    },
    { header: t('condition'), accessorKey: 'condition' },
    { header: t('price_change'), accessorKey: 'priceChange' },
    { 
      header: t('state'), 
      render: (item) => (
        <Badge variant={item.status === 'Active' ? 'success' : 'secondary'}>
          {item.status}
        </Badge>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setEditingRule(item); setIsModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => deletePricingRule(item.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('pricing_rules')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_pricing_rules')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={18} />
            {t('export')}
          </Button>
          <Button onClick={() => { setEditingRule(null); setIsModalOpen(true); }} className="flex items-center gap-2">
            <Plus size={18} />
            {t('add_pricing_rules')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder={t('search')} 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select 
                options={[
                  { value: 'all', label: t('product') },
                  { value: 'laptop', label: 'Laptop' },
                ]}
                className="w-32"
              />
              <Select 
                options={[
                  { value: 'all', label: t('customer') },
                  { value: 'mohamed', label: 'Mohamed' },
                ]}
                className="w-32"
              />
            </div>
          </div>
        </div>

        <Table 
          data={filtered}
          columns={columns}
          keyExtractor={(item) => item.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          className="border-none"
        />
      </Card>

      <PricingRuleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(rule) => {
          if (editingRule) updatePricingRule(rule);
          else addPricingRule(rule);
          setIsModalOpen(false);
        }}
        ruleToEdit={editingRule}
      />
    </div>
  );
};
