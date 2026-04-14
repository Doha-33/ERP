import apiClient from '../client/apiClient';

const purchaseService = {
  async getSuppliers() {
    const res = await apiClient.get('/suppliers');
    return res.data.data;
  },
  async addSupplier(data: any) {
    const res = await apiClient.post('/suppliers', data);
    return res.data.data;
  },
  async updateSupplier(id: string, data: any) {
    const res = await apiClient.put(`/suppliers/${id}`, data);
    return res.data.data;
  },
  async deleteSupplier(id: string) {
    const res = await apiClient.delete(`/suppliers/${id}`);
    return res.data;
  },
  
  async getPurchaseRequests() {
    const res = await apiClient.get('/purchase-requests');
    return res.data.data;
  },
  async addPurchaseRequest(data: any) {
    const res = await apiClient.post('/purchase-requests', data);
    return res.data.data;
  },
  async updatePurchaseRequest(id: string, data: any) {
    const res = await apiClient.put(`/purchase-requests/${id}`, data);
    return res.data.data;
  },
  async updatePurchaseRequestStatus(id: string, status: string) {
    const res = await apiClient.put(`/purchase-requests/${id}/status`, { status });
    return res.data.data;
  },
  async deletePurchaseRequest(id: string) {
    const res = await apiClient.delete(`/purchase-requests/${id}`);
    return res.data;
  },
  
  async getPurchaseOrders() {
    const res = await apiClient.get('/purchase-orders');
    return res.data.data;
  },
  async addPurchaseOrder(data: any) {
    const res = await apiClient.post('/purchase-orders', data);
    return res.data.data;
  },
  async updatePurchaseOrder(id: string, data: any) {
    const res = await apiClient.put(`/purchase-orders/${id}`, data);
    return res.data.data;
  },
  async deletePurchaseOrder(id: string) {
    const res = await apiClient.delete(`/purchase-orders/${id}`);
    return res.data;
  },
  
  async addGoodsReceipt(data: any) { return apiClient.post('/purchase/goods-receipts', data); },
  async updateGoodsReceipt(id: string, data: any) { return apiClient.put(`/purchase/goods-receipts/${id}`, data); },
  async deleteGoodsReceipt(id: string) { return apiClient.delete(`/purchase/goods-receipts/${id}`); },
  
  async getPurchaseInvoices() {
    const res = await apiClient.get('/purchase-invoice');
    return res.data.data;
  },
  async addPurchaseInvoice(data: any) { return apiClient.post('/purchase-invoice', data); },
  async updatePurchaseInvoice(id: string, data: any) { return apiClient.put(`/purchase-invoice/${id}`, data); },
  async deletePurchaseInvoice(id: string) { return apiClient.delete(`/purchase-invoice/${id}`); },
  
  async addReturnToSupplier(data: any) { return apiClient.post('/purchase/returns', data); },
  async updateReturnToSupplier(id: string, data: any) { return apiClient.put(`/purchase/returns/${id}`, data); },
  async deleteReturnToSupplier(id: string) { return apiClient.delete(`/purchase/returns/${id}`); },
  
  async addSupplierRating(data: any) { return apiClient.post('/purchase/ratings', data); },
  async deleteSupplierRating(id: string) { return apiClient.delete(`/purchase/ratings/${id}`); },
};

export default purchaseService;
