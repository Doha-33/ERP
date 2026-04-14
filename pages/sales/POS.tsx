
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ShoppingCart, Plus, Minus, Trash2, User, CreditCard } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { POSProduct } from '../../types';
import { useData } from '../../context/DataContext';

interface CartItem extends POSProduct {
  cartQuantity: number;
}

export const POS: React.FC = () => {
  const { t } = useTranslation();
  const { posProducts, customers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const categories = ['All', 'Electronics', 'Laptops', 'Accessories'];

  const filteredProducts = useMemo(() => {
    return posProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posProducts, searchTerm, selectedCategory]);

  const addToCart = (product: POSProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.cartQuantity + delta);
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
      {/* Left Side: Products */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'bg-white dark:bg-dark-surface text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="w-full md:w-64 relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none" 
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="group hover:border-primary transition-all cursor-pointer p-0 overflow-hidden flex flex-col" onClick={() => addToCart(product)}>
              <div className="aspect-square bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
                <img 
                  src={product.image || `https://picsum.photos/seed/${product.id}/300/300`} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-2 right-2">
                  <Badge status={product.stock > 0 ? 'Active' : 'Inactive'}>
                    {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                  </Badge>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{product.category}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">{product.price} SAR</span>
                  <button className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Side: Order Summary */}
      <Card className="w-full lg:w-[400px] flex flex-col p-0 overflow-hidden shadow-xl border-none">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart className="text-primary" size={24} />
            <h2 className="text-xl font-bold dark:text-white">Order Summary</h2>
          </div>
          
          <div className="relative">
            <select 
              value={selectedCustomerId} 
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none appearance-none"
            >
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Add some products to start an order</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 animate-in slide-in-from-right-4 duration-200">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</h4>
                  <p className="text-xs text-primary font-bold mb-2">{item.price} SAR</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-primary transition-colors"><Minus size={14} /></button>
                      <span className="w-8 text-center text-xs font-bold">{item.cartQuantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-primary transition-colors"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{(item.price * item.cartQuantity).toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-bold text-gray-900 dark:text-white">{subtotal.toFixed(2)} SAR</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax (15%)</span>
            <span className="font-bold text-gray-900 dark:text-white">{tax.toFixed(2)} SAR</span>
          </div>
          <div className="flex justify-between text-lg pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="font-bold text-gray-900 dark:text-white">Total</span>
            <span className="font-bold text-primary text-2xl">{total.toFixed(2)} SAR</span>
          </div>
          <Button fullWidth size="lg" className="mt-4 h-14 text-lg font-bold" disabled={cart.length === 0}>
            <CreditCard size={20} /> Pay Now
          </Button>
        </div>
      </Card>
    </div>
  );
};
