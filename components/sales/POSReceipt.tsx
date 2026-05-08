// POSReceipt.tsx - Redesigned
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Common';
import { POSOrder } from '../../types';

interface POSReceiptProps {
  order: POSOrder;
  onClose: () => void;
}

export const POSReceipt: React.FC<POSReceiptProps> = ({ order, onClose }) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6">
      {/* Success Header */}
      <div className="text-center mb-5">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={24} className="text-green-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Payment Successful</h2>
        <p className="text-xs text-gray-500 mt-1">Your transaction has been completed</p>
      </div>

      {/* Receipt Content */}
      <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs space-y-3">
        <div className="text-center pb-3 border-b border-gray-200">
          <div className="font-bold text-primary text-sm mb-1">INVOICE</div>
          <div className="text-[10px] text-gray-500">#{order.orderNumber}</div>
        </div>

        <div className="flex justify-between text-[10px]">
          <span className="text-gray-500">Date:</span>
          <span className="font-medium">{new Date(order.paidAt || order.createdAt).toLocaleString()}</span>
        </div>

        <div className="space-y-2 pt-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <div>
                <div className="font-medium">{item.productName}</div>
                <div className="text-[9px] text-gray-400">{item.qty} × {item.unitPrice.toFixed(2)}</div>
              </div>
              <div className="font-medium">{(item.qty * item.unitPrice).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-2 space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tax ({order.tax?.value || 0}{order.tax?.type === 'PERCENT' ? '%' : ''})</span>
            <span>{order.taxAmount.toFixed(2)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-gray-200 font-bold">
            <span>Total</span>
            <span className="text-primary">{order.totalAmount.toFixed(2)} SAR</span>
          </div>
        </div>

        <div className="text-center pt-3 text-[9px] text-gray-400 border-t border-gray-200">
          <p>Thank you for your purchase!</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-5">
        <Button variant="outline" fullWidth onClick={handlePrint} className="gap-2 h-11">
          <Printer size={16} /> Print
        </Button>
        <Button fullWidth onClick={onClose} className="h-11">
          Close
        </Button>
      </div>
    </div>
  );
};