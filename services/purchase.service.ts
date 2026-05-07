import apiClient from "../client/apiClient";

const purchaseService = {
  async getSuppliers() {
    const res = await apiClient.get("/suppliers/list");
    return res.data.data;
  },
  async addSupplier(data: any) {
    const res = await apiClient.post("/suppliers/create", data);
    return res.data.data;
  },
  async updateSupplier(id: string, data: any) {
    const res = await apiClient.patch(`/suppliers/update/${id}`, data);
    return res.data.data;
  },
  async deleteSupplier(id: string) {
    const res = await apiClient.delete(`/suppliers/delete/${id}`);
    return res.data;
  },

  async getPurchaseRequests() {
    const res = await apiClient.get("/purchase-requests/list");
    return res.data.data;
  },
  async addPurchaseRequest(data: any) {
    const res = await apiClient.post("/purchase-requests/create", data);
    return res.data.data;
  },
  async updatePurchaseRequest(id: string, data: any) {
    const res = await apiClient.patch(`/purchase-requests/update/${id}`, data);
    return res.data.data;
  },
  async updatePurchaseRequestStatus(id: string, status: string) {
    const res = await apiClient.patch(
      `/purchase-requests/update/${id}/status`,
      {
        status,
      },
    );
    return res.data.data;
  },
  async deletePurchaseRequest(id: string) {
    const res = await apiClient.delete(`/purchase-requests/delete/${id}`);
    return res.data;
  },

  async getPurchaseOrders() {
    const res = await apiClient.get("/purchase-orders/list");
    return res.data.data;
  },
  async addPurchaseOrder(data: any) {
    const res = await apiClient.post("/purchase-orders/create", data);
    return res.data.data;
  },
  async updatePurchaseOrder(id: string, data: any) {
    const res = await apiClient.patch(`/purchase-orders/update/${id}`, data);
    return res.data.data;
  },
  async deletePurchaseOrder(id: string) {
    const res = await apiClient.delete(`/purchase-orders/delete/${id}`);
    return res.data;
  },

  async getGoodsReceipts() {
    const res = await apiClient.get("/goods-receipts/list");
    return res.data.data;
  },
  async addGoodsReceipt(data: any) {
    return apiClient.post("/goods-receipts/create", data);
  },
  async updateGoodsReceipt(id: string, data: any) {
    return apiClient.patch(`/goods-receipts/update/${id}`, data);
  },
  async deleteGoodsReceipt(id: string) {
    return apiClient.delete(`/goods-receipts/delete/${id}`);
  },

  async getPurchaseInvoices() {
    const res = await apiClient.get("/purchase-invoice/list");
    return res.data.data;
  },
  async addPurchaseInvoice(data: any) {
    return apiClient.post("/purchase-invoice/create", data);
  },
  async updatePurchaseInvoice(id: string, data: any) {
    return apiClient.patch(`/purchase-invoice/update/${id}`, data);
  },
  async deletePurchaseInvoice(id: string) {
    return apiClient.delete(`/purchase-invoice/delete/${id}`);
  },

  async getReturnsToSupplier() {
    const res = await apiClient.get("/purchase-returns/list");
    const data = res.data?.data || [];
    return data.map((item: any) => ({
      ...item,
      id: item._id,
      _id: item._id,
    }));
  },

  async addReturnToSupplier(data: any) {
    const res = await apiClient.post("/purchase-returns/create", data);
    return res.data.data;
  },

  async updateReturnToSupplier(id: string, data: any) {
    const res = await apiClient.patch(`/purchase-returns/update/${id}`, data);
    return res.data.data;
  },

  async deleteReturnToSupplier(id: string) {
    const res = await apiClient.delete(`/purchase-returns/delete/${id}`);
    return res.data;
  },

  // Supplier Ratings
  async getSupplierRatings() {
    const res = await apiClient.get('/supplier-ratings/list');
    const data = res.data?.data || [];
    return data.map((item: any) => ({
      ...item,
      id: item._id,
      _id: item._id,
    }));
  },

  async addSupplierRating(data: any) {
    const res = await apiClient.post('/supplier-ratings/create', data);
    return res.data.data;
  },

  async updateSupplierRating(id: string, data: any) {
    const res = await apiClient.patch(`/supplier-ratings/update/${id}`, data);
    return res.data.data;
  },

  async deleteSupplierRating(id: string) {
    const res = await apiClient.delete(`/supplier-ratings/delete/${id}`);
    return res.data;
  },

    async getPurchaseReport() {
    const res = await apiClient.get('/purchase/reports/list');
    return res.data.data;
  },
};

export default purchaseService;
