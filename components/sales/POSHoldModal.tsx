
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Pause } from 'lucide-react';
import { Button, Input } from '../ui/Common';

interface POSHoldModalProps {
  onClose: () => void;
  onHold: (reference: string) => void;
}

export const POSHoldModal: React.FC<POSHoldModalProps> = ({ onClose, onHold }) => {
  const { t } = useTranslation();
  const [reference, setReference] = useState('');

  return (
    <div className="p-8 bg-white rounded-[2rem]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black italic tracking-tight text-gray-900 flex items-center gap-3">
          <Pause className="text-primary" size={28} /> Hold Current Order
        </h2>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="group">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 mb-2 block">Order Reference / Note</label>
          <Input
            placeholder="e.g. Table 4 / Customer will return"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="h-16 text-lg font-bold bg-gray-50 border-none rounded-2xl focus:ring-8 focus:ring-primary/5 px-6 italic"
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-3 ml-4">Use a unique reference to identify this order later.</p>
        </div>

        <div className="flex gap-4 pt-4">
          <Button variant="outline" fullWidth onClick={onClose} className="h-14 rounded-2xl font-bold border-gray-100">
            {t('cancel')}
          </Button>
          <Button fullWidth onClick={() => onHold(reference)} className="h-14 rounded-2xl font-black italic shadow-xl shadow-primary/20">
            HOLD ORDER
          </Button>
        </div>
      </div>
    </div>
  );
};
