// POSValueModal.tsx - Redesigned
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button, Input } from '../ui/Common';

interface POSValueModalProps {
  title: string;
  label: string;
  initialValue: number;
  initialType?: 'AMOUNT' | 'PERCENT';
  onClose: () => void;
  onApply: (data: { value: number; type: 'AMOUNT' | 'PERCENT' }) => void;
}

export const POSValueModal: React.FC<POSValueModalProps> = ({ 
  title, label, initialValue, initialType = 'AMOUNT', onClose, onApply 
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const [type, setType] = useState<'AMOUNT' | 'PERCENT'>(initialType);
  const showTypeToggle = title.toLowerCase().includes('discount') || title.toLowerCase().includes('tax');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button 
          onClick={onClose} 
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      <div className="space-y-5">
        {showTypeToggle && (
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setType('AMOUNT')}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                type === 'AMOUNT' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'
              }`}
            >
              Fixed Amount
            </button>
            <button
              onClick={() => setType('PERCENT')}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                type === 'PERCENT' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'
              }`}
            >
              Percentage (%)
            </button>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="h-12 text-lg font-semibold text-center bg-gray-50 border-gray-200 rounded-xl"
            autoFocus
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" fullWidth onClick={onClose} className="h-10">
            {t('cancel')}
          </Button>
          <Button fullWidth onClick={() => onApply({ value, type })} className="h-10">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};