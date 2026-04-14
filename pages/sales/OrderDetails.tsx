
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Printer, Download } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui/Common';
import { useData } from '../../context/DataContext';

export const OrderDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { salesOrders } = useData();
  
  const order = salesOrders.find(o => o.id === id);

  if (!order) return <div className="p-8 text-center">Order not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-dark-surface rounded-lg border border-gray-100 dark:border-gray-800 text-gray-500">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Order Details</h1>
            <p className="text-gray-500 text-sm">View your Order details</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download size={18} /> Export
          </Button>
          <Button className="bg-[#4361EE]">
            <Printer size={18} /> Print Invoice
          </Button>
        </div>
      </div>

      <Card className="p-8">
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              {order.companyId?.name?.[0] || 'C'}
            </div>
            <span className="text-gray-900 dark:text-white">{order.companyId?.name || 'Company'}</span>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm font-medium text-gray-500">Order No : {order.orderNo}</p>
            <p className="text-sm font-medium text-gray-500">Created Date : {new Date(order.orderDate).toLocaleDateString()}</p>
            <p className="text-sm font-medium text-gray-500">Payment Status : {order.paymentStatus}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">From</p>
            <p className="font-bold text-gray-900 dark:text-white">{order.companyId?.name || 'Company Name'}</p>
            <p className="text-sm text-gray-500">Branch: {order.branchId?.name || 'Branch Name'}</p>
            <p className="text-sm text-gray-500">Warehouse: {order.warehouseId?.name || 'Warehouse Name'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">To</p>
            <p className="font-bold text-gray-900 dark:text-white">{order.customerId?.customerName || 'Customer Name'}</p>
            <p className="text-sm text-gray-500">Address: {order.customerId?.address || 'N/A'}</p>
            <p className="text-sm text-gray-500">Email: {order.customerId?.email || 'N/A'}</p>
            <p className="text-sm text-gray-500">Phone: {order.customerId?.phone || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Status</p>
            <Badge 
              status={order.status === 'CONFIRMED' ? 'Active' : order.status === 'DRAFT' ? 'Pending' : 'Inactive'}
              label={order.status}
            />
            <div className="mt-4 flex justify-end">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${order.orderNo}`} alt="QR" className="w-16 h-16" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E0E7FF]/50 text-gray-600 text-sm font-semibold">
                <th className="p-4 border-b border-gray-100 dark:border-gray-800">#</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800">Product Name</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800 text-center">Quantity</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800">Unit Price</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800">Discount</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800">Tax</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {order.items?.map((item, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                  <td className="p-4 text-gray-500">{i + 1}</td>
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{item.productId?.productName || item.sku}</td>
                  <td className="p-4 text-center text-gray-500">{item.quantity}</td>
                  <td className="p-4 text-gray-500">{item.unitPrice}</td>
                  <td className="p-4 text-gray-500">{item.discount}</td>
                  <td className="p-4 text-gray-500">{item.tax}</td>
                  <td className="p-4 text-right font-bold text-gray-900 dark:text-white">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <div className="w-full md:w-64 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Sub Total</span>
              <span className="font-bold text-gray-900 dark:text-white">{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax Amount</span>
              <span className="font-bold text-gray-900 dark:text-white">{order.taxAmount}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Discount Amount</span>
              <span className="font-bold text-gray-900 dark:text-white">{order.discountAmount}</span>
            </div>
            <div className="flex justify-between text-lg pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-white">Total</span>
              <span className="font-bold text-primary">{order.totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Terms and Conditions</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Please pay within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Notes</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Please quote invoice number when remitting funds.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
