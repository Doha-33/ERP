// POS.tsx - Redesigned with better proportions
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, User, CreditCard, 
  Tag, Percent, Truck, Pause, XCircle, RotateCcw, LayoutGrid, List,
  Package, Info, Receipt as ReceiptIcon, X
} from 'lucide-react';
import { Card, Button, Input, Badge, Dialog } from '../../components/ui/Common';
import { POSProduct, Customer, POSOrder } from '../../types';
import { useData } from '../../context/DataContext';
import { toast } from 'sonner';
import { POSReceipt } from '../../components/sales/POSReceipt';
import { POSValueModal } from '../../components/sales/POSValueModal';
import { POSPaymentModal } from '../../components/sales/POSPaymentModal';
import { POSOrdersModal } from '../../components/sales/POSOrdersModal';
import { useAuth } from '../../context/AuthContext';

export const POS: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { 
    posProducts, 
    customers, 
    warehouses,
    posOrders,
    fetchPosOrders,
    createPOSOrder, 
    addItemToPOSOrder, 
    payOrder,
    updateItemQty,
    removeItemFromPOSOrder,
    setPOSDiscount,
    setPOSTax,
    setPOSShipping,
    holdPOSOrder,
    cancelPOSOrder,
    getPOSOrderById
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [currentOrder, setCurrentOrder] = useState<POSOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<'discount' | 'tax' | 'shipping' | 'payment' | 'receipt' | null>(null);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchPosOrders();
  }, [fetchPosOrders]);

  const categories = useMemo(() => {
    const cats = new Set(posProducts.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [posProducts]);

  const filteredProducts = useMemo(() => {
    return posProducts.filter(p => {
      const matchesSearch = (p.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posProducts, searchTerm, selectedCategory]);

  const refreshOrder = useCallback(async (orderId: string) => {
    try {
      const order = await getPOSOrderById(orderId);
      setCurrentOrder(order);
    } catch (error:any) {
      console.error('Error refreshing order:', error);
      toast(error.message || "Error refreshing order")
    }
  }, [getPOSOrderById]);

  const startNewOrder = async () => {
    try {
      setIsLoading(true);
      
      // Fix: Get default warehouseId to avoid validation error
      const defaultWarehouseId = warehouses[0]?._id || warehouses[0]?.id;
      if (!defaultWarehouseId) {
        toast.error('No warehouse found. Please create a warehouse in Inventory first.');
        return;
      }

      const order = await createPOSOrder({
        warehouseId: defaultWarehouseId,
        customerId: selectedCustomerId || undefined
      });
      
      setCurrentOrder(order);
      setSelectedCustomerId('');
      fetchPosOrders(); // Refresh orders list
      return order;
    } catch (error:any) {
      toast.error(error.message || 'Failed to create new order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      const order = await getPOSOrderById(orderId);
      setCurrentOrder(order);
      setSelectedCustomerId((order.customerId?._id || order.customerId) as string || '');
      setIsOrdersModalOpen(false);
      toast.success(`Order ${order.orderNumber} resumed`);
    } catch (error) {
      toast.error('Failed to resume order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product: POSProduct) => {
    try {
      let orderId = currentOrder?._id || currentOrder?.id;
      if (!orderId) {
        const newOrder = await startNewOrder();
        if (!newOrder) return;
        orderId = newOrder._id || newOrder.id;
      }

      await addItemToPOSOrder(orderId!, {
        productId: product._id || product.id,
        qty: 1
      });
      
      await refreshOrder(orderId!);
      toast.success(`${product.productName} added`);
    } catch (error:any) {
      console.error('Error adding to order:', error);
      toast.error( error.message || 'Failed to add item');
    }
  };

  const handleUpdateQty = async (itemId: string, qty: number) => {
    const orderId = currentOrder?._id || currentOrder?.id;
    if (!orderId) return;
    try {
      if (qty < 1) {
        await removeItemFromPOSOrder(orderId, itemId);
      } else {
        await updateItemQty(orderId, itemId, qty);
      }
      await refreshOrder(orderId);
    } catch (error:any) {
      toast.error( error.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const orderId = currentOrder?._id || currentOrder?.id;
    if (!orderId) return;
    try {
      await removeItemFromPOSOrder(orderId, itemId);
      await refreshOrder(orderId);
      toast.success('Item removed');
    } catch (error:any) {
      toast.error( error.message || 'Failed to remove item');
    }
  };

  const handleApplyDiscount = async (data: { value: number; type: 'AMOUNT' | 'PERCENT' }) => {
    const orderId = currentOrder?._id || currentOrder?.id;
    if (!orderId) return;
    try {
      await setPOSDiscount(orderId, { discount: data });
      await refreshOrder(orderId);
      setActiveModal(null);
      toast.success('Discount applied');
    } catch (error:any) {
      toast.error( error.message || 'Failed to apply discount');
    }
  };

  const handleApplyTax = async (data: { value: number; type: 'AMOUNT' | 'PERCENT' }) => {
    const orderId = currentOrder?._id || currentOrder?.id;
    if (!orderId) return;
    try {
      await setPOSTax(orderId, { tax: data });
      await refreshOrder(orderId);
      setActiveModal(null);
      toast.success('Tax applied');
    } catch (error:any) {
      toast.error( error.message || 'Failed to apply tax');
    }
  };

  const handleApplyShipping = async (data: { value: number }) => {
    const orderId = currentOrder?._id || currentOrder?.id;
    if (!orderId) return;
    try {
      await setPOSShipping(orderId, { shippingAmount: data.value });
      await refreshOrder(orderId);
      setActiveModal(null);
      toast.success('Shipping updated');
    } catch (error:any) {
      toast.error( error.message || 'Failed to apply shipping');
    }
  };

  const handleHoldOrder = async () => {
    const orderId = currentOrder?._id || currentOrder?.id;
    if (!orderId || currentOrder.items.length === 0) return;
    try {
      await holdPOSOrder(orderId);
      toast.info('Order put on hold');
      setCurrentOrder(null);
    } catch (error:any) {
      toast.error( error.message || 'Failed to hold order');
    }
  };

  const handleCancelOrder = async () => {
    const orderId = currentOrder?._id || currentOrder?.id;
    if (!orderId) return;
    try {
      await cancelPOSOrder(orderId);
      toast.warning('Order cancelled');
      setCurrentOrder(null);
    } catch (error:any) {
      toast.error( error.message || 'Failed to cancel order');
    }
  };

  const handlePay = async (paymentData: any) => {
    const orderId = currentOrder?._id || currentOrder?.id;
    if (!orderId) return;
    try {
      await payOrder(orderId, paymentData);
      const updated = await getPOSOrderById(orderId);
      setCurrentOrder(updated);
      setActiveModal('receipt');
      toast.success('Order paid successfully');
    } catch (error:any) {
      toast.error( error.message || 'Payment failed');
    }
  };

  const currentCustomer = useMemo(() => {
    return customers.find(c => (c._id || c.id) === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  return (
    <div className="h-[calc(100vh-80px)] flex gap-5 p-5 bg-gray-50">
      {/* Left Side: Products Catalog */}
      <div className="flex-1 flex flex-col gap-5 min-w-0 bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Point of Sale</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsOrdersModalOpen(true)} 
                size="sm"
                className="gap-2"
              >
                <LayoutGrid size={16} /> {t('orders')}
              </Button>
              <Button 
                onClick={startNewOrder} 
                size="sm"
                className="gap-2"
              >
                <Plus size={16} /> New Order
              </Button>
            </div>
          </div>

          {/* Search and Categories */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search products by name, SKU..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm bg-gray-50 border-gray-200 rounded-xl" 
              />
            </div>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mt-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div
                  key={product.id || product._id}
                  onClick={() => handleAddToCart(product)}
                  className="group cursor-pointer bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-primary/20 transition-all overflow-hidden"
                >
                  {/* <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    <img 
                      src={product.image || `https://placehold.co/400x400?text=${product.productName?.[0]}`} 
                      alt={product.productName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute top-2 right-2 text-[10px] font-medium bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                        Low Stock
                      </span>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">Out of Stock</span>
                      </div>
                    )}
                  </div> */}
                  <div className="p-3">
                    <div className="text-[10px] font-medium text-gray-400 uppercase mb-1">{product.category}</div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-2">{product.productName}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary">{product.salesPrice?.toFixed(2)}</span>
                        <span className="text-[10px] text-gray-400 ml-0.5">SAR</span>
                      </div>
                      <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Plus size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map(product => (
                <div
                  key={product.id || product._id}
                  onClick={() => handleAddToCart(product)}
                  className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm hover:border-primary/20 transition-all cursor-pointer"
                >
                  {/* <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                    <img 
                      src={product.image || `https://placehold.co/100x100?text=${product.productName?.[0]}`} 
                      alt={product.productName} 
                      className="w-full h-full object-cover"
                    />
                  </div> */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-medium text-gray-400 uppercase">{product.category}</span>
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="text-[10px] font-medium text-orange-600">Low Stock</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{product.productName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-primary">{product.salesPrice?.toFixed(2)} SAR</span>
                      {product.stock > 0 && (
                        <span className="text-[10px] text-gray-400">{product.stock} in stock</span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" className="w-8 h-8 rounded-lg p-0 flex-shrink-0">
                    <Plus size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package size={48} className="text-gray-200 mb-3" />
              <h3 className="text-base font-semibold text-gray-600">No products found</h3>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Order Cart */}
      <div className="w-[380px] flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Cart Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-primary" />
              <h2 className="font-semibold text-gray-900">Current Order</h2>
            </div>
            {currentOrder?.orderNumber && (
              <Badge status="Active" variant="outline" className="text-xs">
                #{currentOrder.orderNumber}
              </Badge>
            )}
          </div>

          {/* Customer Select */}
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={selectedCustomerId} 
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
              disabled={isLoading}
            >
              <option value="">Walk-in Customer</option>
              {customers.map(c => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.customerName || c.name}
                </option>
              ))}
            </select>
            {selectedCustomerId && (
              <button 
                onClick={() => setSelectedCustomerId('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded"
              >
                <X size={12} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {!currentOrder || currentOrder.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <ShoppingCart size={24} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">Cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Add items to get started</p>
            </div>
          ) : (
            currentOrder.items.map(item => (
              <div key={item._id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{item.productName}</h4>
                  <p className="text-xs text-primary font-medium mt-0.5">{item.unitPrice?.toFixed(2)} SAR</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white rounded-lg border border-gray-200">
                    <button 
                      onClick={() => handleUpdateQty(item._id!, item.qty - 1)} 
                      className="w-6 h-6 flex items-center justify-center rounded-l-lg hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-7 text-center text-xs font-medium">{item.qty}</span>
                    <button 
                      onClick={() => handleUpdateQty(item._id!, item.qty + 1)} 
                      className="w-6 h-6 flex items-center justify-center rounded-r-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item._id!)} 
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary */}
        <div className="p-5 border-t border-gray-100 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-900">{(currentOrder?.subtotal || 0).toFixed(2)} SAR</span>
            </div>
            {(currentOrder?.taxAmount || 0) > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Tax ({currentOrder?.tax?.value || 0}{currentOrder?.tax?.type === 'PERCENT' ? '%' : ' SAR'})</span>
                <span className="font-medium text-gray-900">{(currentOrder?.taxAmount || 0).toFixed(2)} SAR</span>
              </div>
            )}
            {(currentOrder?.discountAmount || 0) > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Discount</span>
                <span>-{(currentOrder?.discountAmount || 0).toFixed(2)} SAR</span>
              </div>
            )}
            {(currentOrder?.shippingAmount || 0) > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-gray-900">{(currentOrder?.shippingAmount || 0).toFixed(2)} SAR</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-primary">{(currentOrder?.totalAmount || 0).toFixed(2)} SAR</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveModal('discount')}
              className="flex-col gap-1 h-auto py-2 text-xs"
            >
              <Tag size={14} /> Discount
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveModal('tax')}
              className="flex-col gap-1 h-auto py-2 text-xs"
            >
              <Percent size={14} /> Tax
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveModal('shipping')}
              className="flex-col gap-1 h-auto py-2 text-xs"
            >
              <Truck size={14} /> Shipping
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleHoldOrder}
              className="flex-col gap-1 h-auto py-2 text-xs"
            >
              <Pause size={14} /> Hold
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelOrder}
              className="px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <XCircle size={16} />
            </Button>
            <Button 
              fullWidth 
              disabled={!currentOrder || currentOrder.items.length === 0}
              onClick={() => setActiveModal('payment')}
              className="gap-2"
            >
              <CreditCard size={16} /> Checkout
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Dialog isOpen={activeModal === 'discount'} onClose={() => setActiveModal(null)}>
        <POSValueModal 
          title="Apply Discount" 
          label="Discount Value" 
          initialValue={currentOrder?.discount?.value || 0}
          initialType={currentOrder?.discount?.type as any || 'PERCENT'}
          onClose={() => setActiveModal(null)}
          onApply={handleApplyDiscount}
        />
      </Dialog>

      <Dialog isOpen={activeModal === 'tax'} onClose={() => setActiveModal(null)}>
        <POSValueModal 
          title="Apply Tax" 
          label="Tax Rate" 
          initialValue={currentOrder?.tax?.value || 0}
          initialType={currentOrder?.tax?.type as any || 'PERCENT'}
          onClose={() => setActiveModal(null)}
          onApply={handleApplyTax}
        />
      </Dialog>

      <Dialog isOpen={activeModal === 'shipping'} onClose={() => setActiveModal(null)}>
        <POSValueModal 
          title="Shipping Cost" 
          label="Shipping Amount" 
          initialValue={currentOrder?.shippingAmount || 0}
          onClose={() => setActiveModal(null)}
          onApply={(data) => handleApplyShipping({ value: data.value })}
        />
      </Dialog>

      <Dialog isOpen={activeModal === 'payment'} onClose={() => setActiveModal(null)} maxWidth="lg">
        <POSPaymentModal 
          totalAmount={currentOrder?.totalAmount || 0}
          onClose={() => setActiveModal(null)}
          onPay={handlePay}
        />
      </Dialog>

      {currentOrder && (
        <Dialog isOpen={activeModal === 'receipt'} onClose={() => { setActiveModal(null); setCurrentOrder(null); }} maxWidth="sm">
          <POSReceipt 
            order={currentOrder} 
            onClose={() => { setActiveModal(null); setCurrentOrder(null); }} 
          />
        </Dialog>
      )}

      <POSOrdersModal 
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        orders={posOrders}
        onSelectOrder={handleResumeOrder}
        isLoading={isLoading}
      />
    </div>
  );
};