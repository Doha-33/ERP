
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, ChevronDown, Download, X } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';

interface Contact {
  id: string;
  name: string;
  phone: string;
  tags: string;
  location: string;
  rating: number;
  state: 'Active' | 'Inactive';
}

export const Contacts: React.FC = () => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Ahmed gaber',
      phone: '1234567890',
      tags: 'Collab',
      location: 'USA',
      rating: 4.3,
      state: 'Active',
    },
    {
      id: '2',
      name: '',
      phone: '',
      tags: 'Promotion',
      location: '',
      rating: 0,
      state: 'Inactive',
    },
    {
      id: '3',
      name: '',
      phone: '',
      tags: 'VIP',
      location: '',
      rating: 0,
      state: 'Active',
    },
  ]);

  const columns: Column<Contact>[] = [
    { header: t('name'), accessorKey: 'name' },
    { header: t('phone'), accessorKey: 'phone' },
    { 
      header: t('tags'), 
      render: (item) => {
        const variants: Record<string, string> = {
          'Collab': 'success',
          'Promotion': 'warning',
          'VIP': 'danger'
        };
        return <Badge variant={variants[item.tags]}>{item.tags}</Badge>;
      }
    },
    { header: t('location'), accessorKey: 'location' },
    { header: t('rating'), accessorKey: 'rating' },
    { 
      header: t('state'), 
      render: (item) => (
        <Badge variant={item.state === 'Active' ? 'success' : 'secondary'}>
          {item.state}
        </Badge>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedContact(item); setIsEditModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-white">{t('contacts')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_your_contacts')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-primary border-primary flex items-center gap-2">
            <ChevronDown size={16} />
            {t('export')}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Plus size={18} />
            {t('add_contacts')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-sm">
        <div className="p-6 space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2 text-gray-600 border-gray-200">
              <ChevronDown size={16} />
              {t('name')}
            </Button>
          </div>

          <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <Table 
              data={contacts}
              columns={columns}
              keyExtractor={(item) => item.id}
              selectable
              className="w-full"
              headerClassName="bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-200"
            />
          </div>
        </div>
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={<div className="flex items-center gap-2"><Plus size={20} className="text-primary" /> {t('add_contacts')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('name')} placeholder="aaaaaaa" required />
          <Input label={t('phone')} placeholder="aaaaaaa" required />
          <Select label={t('tags')} options={[{ value: 'aaaa', label: 'aaaa' }]} required />
          <Input label={t('location')} placeholder="2222" required />
          <Select label={t('rating')} options={[{ value: 'aaaa', label: 'aaaa' }]} required />
          <Select label={t('states')} options={[{ value: 'Active', label: 'Active' }]} required />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} className="bg-slate-700 text-white hover:bg-slate-800">
            {t('cancel')}
          </Button>
          <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Plus size={18} />
            {t('add_contacts')}
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={<div className="flex items-center gap-2"><Edit2 size={20} className="text-primary" /> {t('edit_contacts')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('name')} defaultValue={selectedContact?.name} placeholder="aaaaaaa" required />
          <Input label={t('phone')} defaultValue={selectedContact?.phone} placeholder="aaaaaaa" required />
          <Select label={t('tags')} defaultValue={selectedContact?.tags} options={[{ value: 'aaaa', label: 'aaaa' }]} required />
          <Input label={t('location')} defaultValue={selectedContact?.location} placeholder="2222" required />
          <Select label={t('rating')} defaultValue={selectedContact?.rating.toString()} options={[{ value: 'aaaa', label: 'aaaa' }]} required />
          <Select label={t('states')} defaultValue={selectedContact?.state} options={[{ value: 'Active', label: 'Active' }]} required />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} className="bg-slate-700 text-white hover:bg-slate-800">
            {t('cancel')}
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            {t('save')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
