// POSPaymentModal.tsx - Redesigned
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Banknote, CreditCard, Smartphone, ShieldCheck } from 'lucide-react';
import { Button, Input } from '../ui/Common';

interface POSPaymentModalProps {
  totalAmount: number;
  onClose: () => void;
  onPay: (paymentData: any) => void;
}

export const POSPaymentModal: React.FC<POSPaymentModalProps> = ({ 
  totalAmount, onClose, onPay 
}) => {
  const { t } = useTranslation();
  const [method, setMethod] = useState<'CASH' | 'CREDIT_CARD' | 'APPLE_PAY' | 'MADA'>('CASH');
  const [amountReceived, setAmountReceived] = useState(totalAmount);
  
  const paymentMethods = [
    { id: 'CASH', label: 'Cash', icon: Banknote, color: 'green' },
    { id: 'CREDIT_CARD', label: 'Card', icon: CreditCard, color: 'blue' },
    { id: 'APPLE_PAY', label: 'Apple Pay', icon: Smartphone, color: 'gray' },
    { id: 'MADA', label: 'Mada', icon: ShieldCheck, color: 'purple' },
  ];

  const change = Math.max(0, amountReceived - totalAmount);

  const handleConfirm = () => {
    const payment = {
      method,
      amount: totalAmount,
      amountReceived: method === 'CASH' ? amountReceived : totalAmount,
      change: method === 'CASH' ? change : 0,
      paidAt: new Date().toISOString()
    };
    onPay(payment);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
        <button 
          onClick={onClose} 
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Payment Methods */}
        <div className="grid grid-cols-4 gap-2">
          {paymentMethods.map((pm) => {
            const Icon = pm.icon;
            const isActive = method === pm.id;
            const colorClasses = {
              green: isActive ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-500',
              blue: isActive ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500',
              gray: isActive ? 'border-gray-500 bg-gray-50 text-gray-600' : 'border-gray-200 text-gray-500',
              purple: isActive ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-200 text-gray-500',
            };
            return (
              <button
                key={pm.id}
                onClick={() => setMethod(pm.id as any)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${colorClasses[pm.color as keyof typeof colorClasses]}`}
              >
                <Icon size={20} />
                <span className="text-[11px] font-medium">{pm.label}</span>
              </button>
            );
          })}
        </div>

        {/* Total Amount Display */}
        <div className="bg-primary/5 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-primary">{totalAmount.toFixed(2)} SAR</p>
        </div>

        {/* Cash Payment Section */}
        {method === 'CASH' ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Amount Received</label>
              <Input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(Number(e.target.value))}
                className="h-12 text-lg font-semibold text-center bg-gray-50"
                autoFocus
              />
            </div>
            {change > 0 && (
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-green-600 mb-1">Change to return</p>
                <p className="text-xl font-bold text-green-600">{change.toFixed(2)} SAR</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <CreditCard size={24} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-gray-900">Process payment on terminal</p>
            <p className="text-xs text-gray-400 mt-1">Please complete the transaction on the card reader</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" fullWidth onClick={onClose} className="h-11">
            Cancel
          </Button>
          <Button fullWidth onClick={handleConfirm} className="h-11">
            Pay {totalAmount.toFixed(2)} SAR
          </Button>
        </div>
      </div>
    </div>
  );
};