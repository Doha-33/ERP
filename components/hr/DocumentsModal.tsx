
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FilePlus, Upload, X, Edit2 } from 'lucide-react';
import { Button } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { DocumentRecord } from '../../types';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: any) => Promise<void>;
  // Add documentToEdit prop to support editing
  documentToEdit?: DocumentRecord | null;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, onSave, documentToEdit }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset file state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file && !documentToEdit) return;
    setIsSubmitting(true);
    try {
        // Pass the id if we are editing
        await onSave({ file, id: documentToEdit?.id });
        onClose();
    } catch (e) {
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  };

  const title = (
    <div className="flex items-center gap-2">
      {documentToEdit ? <Edit2 size={20} className="text-primary" /> : <FilePlus size={20} />}
      <span className="text-[#2D3748] font-bold">{documentToEdit ? t('save') : t('add_document')}</span>
    </div>
  );

  const footer = (
    <div className="flex justify-end gap-3 w-full">
       <Button 
         type="button" 
         className="bg-[#4A5568] hover:bg-[#2D3748] text-white px-8" 
         onClick={onClose}
       >
         {t('cancel')}
       </Button>
       <Button 
         type="button" 
         disabled={(!file && !documentToEdit) || isSubmitting} 
         onClick={handleSubmit}
         className="bg-[#4361EE] hover:bg-blue-700 text-white px-8 flex items-center gap-2"
       >
         {documentToEdit ? <Edit2 size={18} /> : <FilePlus size={18} />}
         {isSubmitting ? 'Uploading...' : (documentToEdit ? t('save') : t('add_document'))}
       </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      className="max-w-md"
    >
      <div className="space-y-4 py-2">
         <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
           {documentToEdit ? t('upload_document') : t('upload_document')}
         </p>
         
         <label className="border-2 border-dashed border-[#CBD5E0] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="file" className="hidden" onChange={handleFileChange} />
            <div className="w-16 h-16 rounded-xl border border-gray-300 flex items-center justify-center mb-2">
               <div className="relative">
                  <div className="w-10 h-12 border-2 border-[#4A5568] rounded-sm flex items-center justify-center">
                    <Upload size={16} className="text-[#4A5568]" />
                  </div>
               </div>
            </div>
            {file ? (
                <p className="text-sm font-bold text-primary">{file.name}</p>
            ) : documentToEdit ? (
                <p className="text-sm text-gray-400 italic">Leave empty to keep current file</p>
            ) : (
                <div className="opacity-0 h-0 w-0" />
            )}
         </label>
      </div>
    </Modal>
  );
};
