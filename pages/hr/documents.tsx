
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, FileText, ExternalLink, Search, Eye, Calendar, User, Download, X } from 'lucide-react';
import { Card, Button, Badge, Input, ExportDropdown } from '../../components/ui/Common';
import { useData } from '../../context/DataContext';
import { DocumentRecord } from '../../types';
import { DocumentModal } from '../../components/hr/DocumentModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const DocumentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { documents, employees, addDocument, updateDocument, deleteDocument } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = async (data: any) => {
    if (editingDoc) {
      await updateDocument(data.id, data.data);
    } else {
      await addDocument(data);
    }
  };

  const handleEdit = (doc: DocumentRecord) => {
    setEditingDoc(doc);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteDocument(deleteId);
      setDeleteId(null);
    }
  };

  const handleViewFile = (url: string) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const filtered = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = (doc.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || doc.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [documents, searchTerm, filterType]);

  // Comment above fix: Explicitly typed as string array to help TS inference in JSX
  const uniqueTypes = useMemo<string[]>(() => {
    return Array.from(new Set(documents.map(d => d.type))).sort();
  }, [documents]);

  return (
    <div className="space-y-8 pb-12">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              <span>HR Management</span>
              <ChevronDown size={14} className="-rotate-90" />
              <span className="text-primary">{t('documents')}</span>
           </div>
           <h1 className="text-3xl font-black text-slate-800 dark:text-white">{t('documents')}</h1>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="archived_documents" />
           <Button onClick={() => { setEditingDoc(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700 shadow-xl shadow-blue-200 dark:shadow-none min-w-[180px] h-12 text-sm font-bold">
              <Plus size={20} /> {t('add_documents')}
           </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 border-none shadow-sm shadow-gray-200/50 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md sticky top-20 z-20">
         <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-96 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="Search by employee name or document type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-56">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full appearance-none bg-gray-50 dark:bg-gray-900/50 border-none py-3 px-6 pr-10 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                  >
                    <option value="">{t('all')} Types</option>
                    {/* Comment above fix: Added string type to type parameter to resolve unknown property access */}
                    {uniqueTypes.map((type: string) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
               </div>

               {(searchTerm || filterType) && (
                 <button onClick={() => { setSearchTerm(''); setFilterType(''); }} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors">
                    <X size={20} />
                 </button>
               )}
            </div>
         </div>
      </Card>

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400 bg-gray-50/50 dark:bg-gray-800/30 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
           <FileText size={64} className="mb-4 opacity-20" />
           <p className="font-bold text-lg">No documents found matching your filters</p>
           <p className="text-sm opacity-60">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {filtered.map((doc) => (
             <div key={doc.id} className="group relative bg-white dark:bg-dark-surface rounded-[2rem] border border-transparent hover:border-primary/20 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
                {/* Image Preview Header */}
                <div 
                   className="relative h-48 w-full bg-slate-50 dark:bg-gray-900 flex items-center justify-center cursor-pointer overflow-hidden border-b border-gray-50 dark:border-gray-800"
                   onClick={() => handleViewFile(doc.fileUrl)}
                >
                   {doc.fileUrl && (doc.fileUrl.endsWith('.png') || doc.fileUrl.endsWith('.jpg') || doc.fileUrl.endsWith('.jpeg') || doc.fileUrl.includes('image')) ? (
                      <img src={doc.fileUrl} alt={doc.type} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-300 group-hover:text-primary transition-colors">
                         <FileText size={48} strokeWidth={1.5} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Document View</span>
                      </div>
                   )}
                   
                   {/* Overlay Actions */}
                   <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                       <button onClick={(e) => { e.stopPropagation(); handleViewFile(doc.fileUrl); }} className="w-12 h-12 rounded-2xl bg-white text-primary flex items-center justify-center shadow-lg hover:scale-110 transition-all"><Eye size={20} /></button>
                       <button onClick={(e) => { e.stopPropagation(); handleEdit(doc); }} className="w-12 h-12 rounded-2xl bg-white text-slate-700 flex items-center justify-center shadow-lg hover:scale-110 transition-all"><Edit2 size={20} /></button>
                       <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }} className="w-12 h-12 rounded-2xl bg-white text-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition-all"><Trash2 size={20} /></button>
                   </div>

                   {/* Expiry Badge */}
                   <div className="absolute top-4 right-4">
                      <Badge status={new Date(doc.expiryDate) < new Date() ? 'Rejected' : 'Active'}>
                         {doc.expiryDate}
                      </Badge>
                   </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex flex-col flex-1">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{doc.type.replace('_', ' ')}</h4>
                         <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight line-clamp-1">{doc.employeeName}</h3>
                      </div>
                   </div>

                   <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                         <Calendar size={12} />
                         <span>{new Date(doc.createdAt || '').toLocaleDateString()}</span>
                      </div>
                      <button 
                         onClick={() => handleViewFile(doc.fileUrl)}
                         className="flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
                      >
                         <Download size={14} /> DOWNLOAD
                      </button>
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
         documentToEdit={editingDoc}
      />

      <ConfirmationModal
         isOpen={!!deleteId}
         onClose={() => setDeleteId(null)}
         onConfirm={confirmDelete}
         title={t('confirm_delete')}
         message={t('are_you_sure_delete')}
      />
    </div>
  );
};
