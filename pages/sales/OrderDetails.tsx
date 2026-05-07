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
  
  // البحث باستخدام _id أو id
  const order = salesOrders.find(o => o._id === id || o.id === id);

  // دالة مساعدة لاستخراج الاسم من الكائن المتداخل
  const getCustomerName = (customerId: any): string => {
    if (!customerId) return 'N/A';
    if (typeof customerId === 'object') {
      return customerId.customerName || customerId.name || 'N/A';
    }
    return 'Customer';
  };

  const getCompanyName = (companyId: any): string => {
    if (!companyId) return 'N/A';
    if (typeof companyId === 'object') {
      return companyId.name || 'N/A';
    }
    return 'Company';
  };

  const getBranchName = (branchId: any): string => {
    if (!branchId) return 'N/A';
    if (typeof branchId === 'object') {
      return branchId.name || 'N/A';
    }
    return 'Branch';
  };

  const getWarehouseName = (warehouseId: any): string => {
    if (!warehouseId) return 'N/A';
    if (typeof warehouseId === 'object') {
      return warehouseId.name || 'N/A';
    }
    return 'Warehouse';
  };

  const getProductName = (productId: any, sku: string): string => {
    if (!productId) return sku || 'N/A';
    if (typeof productId === 'object') {
      return productId.productName || productId.name || sku || 'N/A';
    }
    return sku || 'N/A';
  };

  const getSalespersonName = (salespersonId: any): string => {
    if (!salespersonId) return 'N/A';
    if (typeof salespersonId === 'object') {
      return salespersonId.fullName || salespersonId.username || 'N/A';
    }
    return 'Salesperson';
  };

  if (!order) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('order_not_found')}</h2>
          <p className="text-gray-500 mb-4">{t('order_not_found_description')}</p>
          <Button onClick={() => navigate('/sales/orders')} variant="primary">
            {t('back_to_orders')}
          </Button>
        </div>
      </div>
    );
  }

  // تحويل حالة الطلب إلى التنسيق المطلوب للـ Badge
  const getBadgeStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      CONFIRMED: 'Active',
      DRAFT: 'Pending',
      CANCELLED: 'Inactive'
    };
    return statusMap[status] || 'Pending';
  };

  // تنسيق العملة
  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return '0 EGP';
    return `${amount.toLocaleString()} EGP`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/sales/orders')} 
            className="p-2 bg-white dark:bg-dark-surface rounded-lg border border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">{t('order_details')}</h1>
            <p className="text-gray-500 text-sm">{t('view_your_order_details')}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            <Download size={18} /> {t('export')}
          </Button>
          <Button className="bg-[#4361EE] hover:bg-[#3551c9]" onClick={() => window.print()}>
            <Printer size={18} /> {t('print_invoice')}
          </Button>
        </div>
      </div>

      <Card className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              {getCompanyName(order.companyId)[0] || 'C'}
            </div>
            <span className="text-gray-900 dark:text-white">{getCompanyName(order.companyId)}</span>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm font-medium text-gray-500">
              {t('order_no')}: <span className="text-gray-900">{order.orderNo || 'N/A'}</span>
            </p>
            <p className="text-sm font-medium text-gray-500">
              {t('created_date')}: <span className="text-gray-900">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</span>
            </p>
            <p className="text-sm font-medium text-gray-500">
              {t('payment_status')}: <Badge 
                status={order.paymentStatus === 'PAID' ? 'Active' : order.paymentStatus === 'PARTIALLY_PAID' ? 'Pending' : 'Inactive'}
                label={order.paymentStatus || 'N/A'}
              />
            </p>
          </div>
        </div>

        {/* Address Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">{t('from')}</p>
            <p className="font-bold text-gray-900 dark:text-white">{getCompanyName(order.companyId)}</p>
            <p className="text-sm text-gray-500">{t('branch')}: {getBranchName(order.branchId)}</p>
            <p className="text-sm text-gray-500">{t('warehouse')}: {getWarehouseName(order.warehouseId)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">{t('to')}</p>
            <p className="font-bold text-gray-900 dark:text-white">{getCustomerName(order.customerId)}</p>
            <p className="text-sm text-gray-500">
              {t('address')}: {typeof order.customerId === 'object' ? order.customerId.address || 'N/A' : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              {t('email')}: {typeof order.customerId === 'object' ? order.customerId.email || 'N/A' : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              {t('phone')}: {typeof order.customerId === 'object' ? order.customerId.phoneNumber || order.customerId.phone || 'N/A' : 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">{t('status')}</p>
            <Badge 
              status={getBadgeStatus(order.status)}
              label={order.status || 'N/A'}
            />
            <div className="mt-4 flex justify-end">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${order.orderNo || order._id}`} 
                alt="QR" 
                className="w-16 h-16"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E0E7FF]/50 text-gray-600 text-sm font-semibold">
                <th className="p-4 border-b border-gray-100 dark:border-gray-800">#</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800">{t('product_name')}</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800 text-center">{t('quantity')}</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800">{t('unit_price')}</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800">{t('discount')}</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800">{t('tax')}</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800 text-right">{t('total')}</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                    <td className="p-4 text-gray-500">{i + 1}</td>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {getProductName(item.productId, item.sku)}
                    </td>
                    <td className="p-4 text-center text-gray-500">{item.quantity}</td>
                    <td className="p-4 text-gray-500">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-4 text-gray-500">{formatCurrency(item.discount)}</td>
                    <td className="p-4 text-gray-500">{formatCurrency(item.tax)}</td>
                    <td className="p-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    {t('no_items_found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="mt-8 flex justify-end">
          <div className="w-full md:w-80 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('sub_total')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(order.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('discount_amount')}</span>
              <span className="font-medium text-red-600">{formatCurrency(order.discountAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('tax_amount')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(order.taxAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-lg pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-white">{t('total')}</span>
              <span className="font-bold text-indigo-600 text-xl">{formatCurrency(order.totalAmount || 0)}</span>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">{t('terms_and_conditions')}</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('terms_and_conditions_text') || 'Please pay within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.'}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">{t('notes')}</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              {order.notes || t('default_notes') || 'Please quote invoice number when remitting funds.'}
            </p>
            {order.salespersonId && (
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-medium">{t('salesperson')}:</span> {getSalespersonName(order.salespersonId)}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};