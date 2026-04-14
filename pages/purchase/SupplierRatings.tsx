
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, FileText, Trash2, Star } from 'lucide-react';
import { Card, Button, Input, Select } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { SupplierRating } from '../../types';
import { SupplierRatingModal } from '../../components/purchase/SupplierRatingModal';

export const SupplierRatings: React.FC = () => {
  const { t } = useTranslation();
  const { supplierRatings, addSupplierRating, deleteSupplierRating } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredRatings = supplierRatings.filter(r =>
    r.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (data: any) => {
    const overallRating = Math.round((data.quality + data.delivery + data.service + data.compliance) / 4);
    addSupplierRating({ ...data, id: '', overallRating });
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );

  const columns = [
    { key: 'supplier', header: t('supplier') },
    {
      key: 'quality',
      header: t('quality'),
      render: (rating: SupplierRating) => renderStars(rating.quality),
    },
    {
      key: 'delivery',
      header: t('delivery'),
      render: (rating: SupplierRating) => renderStars(rating.delivery),
    },
    {
      key: 'service',
      header: t('service'),
      render: (rating: SupplierRating) => renderStars(rating.service),
    },
    {
      key: 'compliance',
      header: t('compliance'),
      render: (rating: SupplierRating) => renderStars(rating.compliance),
    },
    {
      key: 'overallRating',
      header: t('overall_rating'),
      render: (rating: SupplierRating) => (
        <div className="flex items-center gap-2">
          {renderStars(rating.overallRating)}
          <span className="text-sm font-medium">({rating.overallRating})</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      render: (rating: SupplierRating) => (
        <button onClick={() => deleteSupplierRating(rating.id)} className="p-1 text-gray-400 hover:text-red-500 border border-gray-200 rounded">
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{t('supplier_rating')}</h1>
          <p className="text-gray-500 text-sm">{t('manage_supplier_performance')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText size={18} /> {t('export')}
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="bg-[#4361EE]">
            <Plus size={18} /> {t('add_supplier_rating')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4">
            <Select
              options={[{ value: 'all', label: t('supplier') }]}
              className="w-40"
            />
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Table columns={columns} data={filteredRatings} keyExtractor={(r) => r.id} />
      </Card>

      <SupplierRatingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};
