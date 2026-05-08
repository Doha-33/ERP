
import React from 'react';
import { X, Clock, ShoppingCart, User, CheckCircle, PauseCircle, Trash2 } from 'lucide-react';
import { POSOrder } from '../../types';
import { Button } from '../ui/Common';

interface POSOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: POSOrder[];
  onSelectOrder: (orderId: string) => void;
  isLoading?: boolean;
}

export const POSOrdersModal: React.FC<POSOrdersModalProps> = ({ 
  isOpen, 
  onClose, 
  orders, 
  onSelectOrder,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent & Held Orders</h2>
            <p className="text-sm text-gray-500">Manage and resume your POS orders</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-500 font-medium">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <ShoppingCart size={40} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No orders found</h3>
              <p className="text-gray-500 max-w-xs">You don't have any recent or held orders at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <div 
                  key={order._id || order.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all group flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                      {order.orderNumber}
                    </span>
                    <div className="flex items-center gap-1.5 ring-1 ring-inset px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                      {order.status === 'HOLD' ? (
                        <span className="text-amber-600 flex items-center gap-1">
                          <PauseCircle size={12} /> Held
                        </span>
                      ) : order.status === 'PAID' ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle size={12} /> Paid
                        </span>
                      ) : (
                        <span className="text-blue-600 flex items-center gap-1">
                          <Clock size={12} /> Draft
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User size={14} className="text-gray-400" />
                      <span className="truncate">{order.customerId?.customerName || 'Walk-in Customer'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} className="text-gray-400" />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Amount</p>
                      <p className="text-lg font-bold text-gray-900">{order.totalAmount.toFixed(2)} SAR</p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => onSelectOrder((order._id || order.id) as string)}
                      className="rounded-lg"
                    >
                      Resume
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-bold text-gray-900">{orders.length}</span> orders
            </p>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
