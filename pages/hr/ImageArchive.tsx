
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Image as ImageIcon, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Trash2, 
  Eye,
  Calendar,
  User,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { Card, Button, Badge, Input, Dropdown } from '../../components/ui/Common';
import { useData } from '../../context/DataContext';
import { DocumentRecord } from '../../types';
import { DocumentModal } from '../../components/hr/DocumentModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const ImageArchive: React.FC = () => {
  const { t } = useTranslation();
  const { documents, addDocument, updateDocument, deleteDocument, fetchAllDataCentral } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = async (data: any) => {
    await addDocument(data);
  };

  const filtered = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = (doc.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || doc.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [documents, searchTerm, filterType]);

  const docTypes = useMemo(() => Array.from(new Set(documents.map(d => d.type))), [documents]);

  const isImage = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null || url.includes('image/upload');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30">
              <ImageIcon size={28} />
            </div>
            {t('documents_archive')}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">عرض وإدارة جميع صور ومستندات الموظفين المرفوعة</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => fetchAllDataCentral()}
            className="bg-white dark:bg-dark-surface border-slate-200 dark:border-slate-700"
          >
            <RefreshCw size={18} />
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-primary hover:bg-primary-dark shadow-xl shadow-primary/20 h-12 px-8 font-bold rounded-2xl"
          >
            <Plus size={20} className="mr-2" />
            {t('add_documents')}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="p-4 border-none shadow-sm bg-white/50 dark:bg-dark-surface/50 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text"
              placeholder="ابحث عن اسم الموظف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-900 border border-slate-100 dark:border-slate-800 py-3 px-6 pr-12 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer min-w-[160px]"
              >
                <option value="">كل الأنواع</option>
                {docTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </Card>

      {/* Media Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-gray-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
          <ImageIcon size={64} className="text-slate-200 dark:text-slate-800 mb-4" />
          <p className="text-slate-400 font-bold">لا توجد مستندات تطابق بحثك</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((doc) => (
            <div key={doc.id} className="group bg-white dark:bg-dark-surface rounded-[2.5rem] p-4 border border-transparent hover:border-primary/20 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              {/* Media Preview */}
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-gray-900 mb-5">
                {isImage(doc.fileUrl) ? (
                  <img 
                    src={doc.fileUrl} 
                    alt={doc.type} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { (e.target as any).src = 'https://placehold.co/400x300?text=Error+Loading'; }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                    <FileText size={64} strokeWidth={1} />
                    <span className="text-[10px] font-black uppercase tracking-widest mt-2">PDF Document</span>
                  </div>
                )}

                {/* Overlay Action */}
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <button 
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                    className="w-12 h-12 rounded-2xl bg-white text-primary flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                  >
                    <Eye size={22} />
                  </button>
                  <button 
                    onClick={() => setDeleteId(doc.id)}
                    className="w-12 h-12 rounded-2xl bg-white text-red-500 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>

                {/* Expiry Badge */}
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-1 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-md rounded-full text-[10px] font-black text-slate-800 dark:text-white shadow-sm flex items-center gap-1.5 border border-white/20">
                    <Calendar size={12} className="text-primary" />
                    {doc.expiryDate}
                  </div>
                </div>
              </div>

              {/* Content Info */}
              <div className="px-2 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{doc.type}</h4>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate leading-tight">{doc.employeeName}</h3>
                  </div>
                  <div className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer">
                    <Download size={18} className="text-slate-400" onClick={() => window.open(doc.fileUrl, '_blank')} />
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 dark:border-gray-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                    <User size={12} className="text-slate-400" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {doc.employeeId?.substring(0, 8) || 'N/A'}...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <DocumentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
      />
      
      <ConfirmationModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={async () => {
          if (deleteId) await deleteDocument(deleteId);
          setDeleteId(null);
        }} 
      />
    </div>
  );
};
