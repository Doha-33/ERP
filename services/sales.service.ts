import apiClient from '../client/apiClient';

const salesService = {
  async getAllPricingRules() {
    const res = await apiClient.get('/pricing-rules/list');
    return res.data.data;
  },
  async addPricingRule(data: any) {
    const res = await apiClient.post('/pricing-rules/create', data);
    return res.data.data;
  },
  async updatePricingRule(id: string, data: any) {
    const res = await apiClient.patch(`/pricing-rules/update/${id}`, data);
    return res.data.data;
  },
  async deletePricingRule(id: string) {
    const res = await apiClient.delete(`/pricing-rules/delete/${id}`);
    return res.data;
  },
  
  async getAllDiscounts() {
    const res = await apiClient.get('/discounts/list');
    return res.data.data;
  },
  async addDiscount(data: any) {
    const res = await apiClient.post('/discounts/create', data);
    return res.data.data;
  },
  async updateDiscount(id: string, data: any) {
    const res = await apiClient.patch(`/discounts/update/${id}`, data);
    return res.data.data;
  },
  async deleteDiscount(id: string) {
    const res = await apiClient.delete(`/discounts/delete/${id}`);
    return res.data;
  },
  
  async getAllPromotions() {
    const res = await apiClient.get('/promotions/list');
    return res.data.data;
  },
  async addPromotion(data: any) {
    const res = await apiClient.post('/promotions/create', data);
    return res.data.data;
  },
  async updatePromotion(id: string, data: any) {
    const res = await apiClient.patch(`/promotions/update/${id}`, data);
    return res.data.data;
  },
  async deletePromotion(id: string) {
    const res = await apiClient.delete(`/promotions/delete/${id}`);
    return res.data;
  },
  
  async getAllQuotations() {
    const res = await apiClient.get('/quotations/list');
    return res.data.data;
  },
  async addQuotation(data: any) {
    const res = await apiClient.post('/quotations/create', data);
    return res.data.data;
  },
  async updateQuotation(id: string, data: any) {
    const res = await apiClient.patch(`/quotations/update/${id}`, data);
    return res.data.data;
  },
  async deleteQuotation(id: string) {
    const res = await apiClient.delete(`/quotations/delete/${id}`);
    return res.data;
  },
  
  async addPOSProduct(data: any) {
    const res = await apiClient.post('/pos-products/create', data);
    return res.data.data;
  },
  async updatePOSProduct(id: string, data: any) {
    const res = await apiClient.patch(`/pos-products/update/${id}`, data);
    return res.data.data;
  },
  async deletePOSProduct(id: string) {
    const res = await apiClient.delete(`/pos-products/delete/${id}`);
    return res.data;
  },
  
  async getSettings(){
    const res = await apiClient.get('/sales-settings/list');
    return res.data.data;
  },
  async updateSalesSettings(data: any) {
    const res = await apiClient.patch('/sales-settings/update', data);
    return res.data.data;
  },
  
  async getAllCustomers() {
    const res = await apiClient.get('/customers/list');
    return res.data.data;
  },
  async addCustomer(data: any) {
    const res = await apiClient.post('/customers/create', data);
    return res.data.data;
  },
  async updateCustomer(id: string, data: any) {
    const res = await apiClient.patch(`/customers/update/${id}`, data);
    return res.data.data;
  },
  async deleteCustomer(id: string) {
    const res = await apiClient.delete(`/customers/delete/${id}`);
    return res.data;
  },
  
  async getAllSalesOrders() {
    const res = await apiClient.get('/sales-orders/list');
    return res.data.data;
  },
  async addSalesOrder(data: any) {
    const res = await apiClient.post('/sales-orders/create', data);
    return res.data.data;
  },
  async updateSalesOrder(id: string, data: any) {
    const res = await apiClient.patch(`/sales-orders/update/${id}`, data);
    return res.data.data;
  },
  async deleteSalesOrder(id: string) {
    const res = await apiClient.delete(`/sales-orders/delete/${id}`);
    return res.data;
  },
  
  async getAllSalesInvoices() {
    const res = await apiClient.get('/sales-invoices/list');
    return res.data.data;
  },
  async addSalesInvoice(data: any) {
    const res = await apiClient.post('/sales-invoices/create', data);
    return res.data.data;
  },
  async updateSalesInvoice(id: string, data: any) {
    const res = await apiClient.patch(`/sales-invoices/update/${id}`, data);
    return res.data.data;
  },
  async deleteSalesInvoice(id: string) {
    const res = await apiClient.delete(`/sales-invoices/delete/${id}`);
    return res.data;
  },
  
  async getAllSalesReturns() {
    const res = await apiClient.get('/sales-returns/list');
    return res.data.data;
  },
  async addSalesReturn(data: any) {
    const res = await apiClient.post('/sales-returns/create', data);
    return res.data.data;
  },
  async updateSalesReturn(id: string, data: any) {
    const res = await apiClient.patch(`/sales-returns/update/${id}`, data);
    return res.data.data;
  },
  async deleteSalesReturn(id: string) {
    const res = await apiClient.delete(`/sales-returns/delete/${id}`);
    return res.data;
  },

  async getAllProducts() {
    const res = await apiClient.get('/products/list');
    return res.data.data;
  },
  async addProduct(data: any) {
    const res = await apiClient.post('/products/create', data);
    return res.data.data;
  },
  async updateProduct(id: string, data: any) {
    const res = await apiClient.patch(`/products/update/${id}`, data);
    return res.data.data;
  },
  async deleteProduct(id: string) {
    const res = await apiClient.delete(`/products/delete/${id}`);
    return res.data;
  },

    async getSalesReport() {
    const res = await apiClient.get('/sales/reports/list');
    return res.data.data;
  },

  async getCustomerReport() {
    const res = await apiClient.get('/customer/reports/list');
    return res.data.data;
  },
};

export default salesService;
