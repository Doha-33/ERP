import apiClient from '../client/apiClient';

const salesService = {
  async addPricingRule(data: any) {
    const res = await apiClient.post('/pricing-rules', data);
    return res.data.data;
  },
  async updatePricingRule(id: string, data: any) {
    const res = await apiClient.put(`/pricing-rules/${id}`, data);
    return res.data.data;
  },
  async deletePricingRule(id: string) {
    const res = await apiClient.delete(`/pricing-rules/${id}`);
    return res.data;
  },
  
  async getAllDiscounts() {
    const res = await apiClient.get('/discounts');
    return res.data.data;
  },
  async addDiscount(data: any) {
    const res = await apiClient.post('/discounts', data);
    return res.data.data;
  },
  async updateDiscount(id: string, data: any) {
    const res = await apiClient.put(`/discounts/${id}`, data);
    return res.data.data;
  },
  async deleteDiscount(id: string) {
    const res = await apiClient.delete(`/discounts/${id}`);
    return res.data;
  },
  
  async getAllPromotions() {
    const res = await apiClient.get('/promotions');
    return res.data.data;
  },
  async addPromotion(data: any) {
    const res = await apiClient.post('/promotions', data);
    return res.data.data;
  },
  async updatePromotion(id: string, data: any) {
    const res = await apiClient.put(`/promotions/${id}`, data);
    return res.data.data;
  },
  async deletePromotion(id: string) {
    const res = await apiClient.delete(`/promotions/${id}`);
    return res.data;
  },
  
  async getAllQuotations() {
    const res = await apiClient.get('/quotations');
    return res.data.data;
  },
  async addQuotation(data: any) {
    const res = await apiClient.post('/quotations', data);
    return res.data.data;
  },
  async updateQuotation(id: string, data: any) {
    const res = await apiClient.put(`/quotations/${id}`, data);
    return res.data.data;
  },
  async deleteQuotation(id: string) {
    const res = await apiClient.delete(`/quotations/${id}`);
    return res.data;
  },
  
  async addPOSProduct(data: any) {
    const res = await apiClient.post('/pos-products', data);
    return res.data.data;
  },
  async updatePOSProduct(id: string, data: any) {
    const res = await apiClient.put(`/pos-products/${id}`, data);
    return res.data.data;
  },
  async deletePOSProduct(id: string) {
    const res = await apiClient.delete(`/pos-products/${id}`);
    return res.data;
  },
  
  async updateSalesSettings(data: any) {
    const res = await apiClient.put('/settings', data);
    return res.data.data;
  },
  
  async getAllCustomers() {
    const res = await apiClient.get('/customers');
    return res.data.data;
  },
  async addCustomer(data: any) {
    const res = await apiClient.post('/customers', data);
    return res.data.data;
  },
  async updateCustomer(id: string, data: any) {
    const res = await apiClient.put(`/customers/${id}`, data);
    return res.data.data;
  },
  async deleteCustomer(id: string) {
    const res = await apiClient.delete(`/customers/${id}`);
    return res.data;
  },
  
  async getAllSalesOrders() {
    const res = await apiClient.get('/sales-orders');
    return res.data.data;
  },
  async addSalesOrder(data: any) {
    const res = await apiClient.post('/sales-orders', data);
    return res.data.data;
  },
  async updateSalesOrder(id: string, data: any) {
    const res = await apiClient.put(`/sales-orders/${id}`, data);
    return res.data.data;
  },
  async deleteSalesOrder(id: string) {
    const res = await apiClient.delete(`/sales-orders/${id}`);
    return res.data;
  },
  
  async getAllSalesInvoices() {
    const res = await apiClient.get('/sales-invoices');
    return res.data.data;
  },
  async addSalesInvoice(data: any) {
    const res = await apiClient.post('/sales-invoices', data);
    return res.data.data;
  },
  async updateSalesInvoice(id: string, data: any) {
    const res = await apiClient.put(`/sales-invoices/${id}`, data);
    return res.data.data;
  },
  async deleteSalesInvoice(id: string) {
    const res = await apiClient.delete(`/sales-invoices/${id}`);
    return res.data;
  },
  
  async getAllSalesReturns() {
    const res = await apiClient.get('/sales-returns');
    return res.data.data;
  },
  async addSalesReturn(data: any) {
    const res = await apiClient.post('/sales-returns', data);
    return res.data.data;
  },
  async updateSalesReturn(id: string, data: any) {
    const res = await apiClient.put(`/sales-returns/${id}`, data);
    return res.data.data;
  },
  async deleteSalesReturn(id: string) {
    const res = await apiClient.delete(`/sales-returns/${id}`);
    return res.data;
  },

  async getAllProducts() {
    const res = await apiClient.get('/products');
    return res.data.data;
  },
  async addProduct(data: any) {
    const res = await apiClient.post('/products', data);
    return res.data.data;
  },
  async updateProduct(id: string, data: any) {
    const res = await apiClient.put(`/products/${id}`, data);
    return res.data.data;
  },
  async deleteProduct(id: string) {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },
};

export default salesService;
