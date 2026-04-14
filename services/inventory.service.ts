import apiClient from '../client/apiClient';

const inventoryService = {
  async getStockItems() {
    const res = await apiClient.get('/inventory/items');
    return res.data.data;
  },
  async addStockItem(data: any) { return apiClient.post('/inventory/items', data); },
  async updateStockItem(id: string, data: any) { return apiClient.put(`/inventory/items/${id}`, data); },
  async deleteStockItem(id: string) { return apiClient.delete(`/inventory/items/${id}`); },
  
  async getWarehouses() {
    const res = await apiClient.get('/warehouses');
    return res.data.data;
  },
  async getWarehouse(id: string) {
    const res = await apiClient.get(`/warehouses/${id}`);
    return res.data.data;
  },
  async addWarehouse(data: any) {
    const res = await apiClient.post('/warehouses', data);
    return res.data.data;
  },
  async updateWarehouse(id: string, data: any) {
    const res = await apiClient.put(`/warehouses/${id}`, data);
    return res.data.data;
  },
  async deleteWarehouse(id: string) {
    const res = await apiClient.delete(`/warehouses/${id}`);
    return res.data;
  },

  async getCategories() {
    const res = await apiClient.get('/inventory/categories');
    return res.data.data;
  },
  
  async addStockMovement(data: any) { return apiClient.post('/inventory/movements', data); },
};

export default inventoryService;
