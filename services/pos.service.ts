import apiClient from '../client/apiClient';

const posService = {
  async getPosOrders() {
    const res = await apiClient.get('/pos/orders');
    return res.data.data;
  },

  async getPosOrderById(id: string) {
    const res = await apiClient.get(`/pos/orders/${id}`);
    return res.data.data;
  },

  async createPosOrder() {
    const res = await apiClient.post('/pos/orders');
    return res.data.data;
  },

  async addItem(orderId: string, itemData: any) {
    const res = await apiClient.post(`/pos/orders/${orderId}/items`, itemData);
    return res.data.data;
  },

  async updateItemQty(orderId: string, itemId: string, qty: number) {
    const res = await apiClient.patch(`/pos/orders/${orderId}/items/${itemId}`, { qty });
    return res.data.data;
  },

  async removeItem(orderId: string, itemId: string) {
    const res = await apiClient.delete(`/pos/orders/${orderId}/items/${itemId}`);
    return res.data.data;
  },

  async setDiscount(orderId: string, discount: any) {
    const res = await apiClient.post(`/pos/orders/${orderId}/discount`, discount);
    return res.data.data;
  },

  async setTax(orderId: string, tax: any) {
    const res = await apiClient.post(`/pos/orders/${orderId}/tax`, tax);
    return res.data.data;
  },

  async setShipping(orderId: string, shipping: any) {
    const res = await apiClient.post(`/pos/orders/${orderId}/shipping`, shipping);
    return res.data.data;
  },

  async holdOrder(orderId: string) {
    const res = await apiClient.post(`/pos/orders/${orderId}/hold`);
    return res.data.data;
  },

  async cancelOrder(orderId: string) {
    const res = await apiClient.post(`/pos/orders/${orderId}/cancel`);
    return res.data.data;
  },

  async payOrder(orderId: string, paymentData: any) {
    const res = await apiClient.post(`/pos/orders/${orderId}/pay`, paymentData);
    return res.data.data;
  },

  async getReceipt(orderId: string) {
    const res = await apiClient.get(`/pos/orders/${orderId}/receipt`);
    return res.data.data;
  }
};

export default posService;
