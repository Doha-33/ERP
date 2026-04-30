import apiClient from '../client/apiClient';

const inventoryService = {
  async getStockItems() {
    const res = await apiClient.get('/products');
    const items = res.data.data || [];
    return items.map((item: any) => ({
      ...item,
      id: item.id || item._id,
      name: item.productName || item.name,
      sellingPrice: item.salesPrice || item.sellingPrice,
      purchasePrice: item.cost || item.purchasePrice,
      currentStock: item.quantityOnHand || item.currentStock || 0,
      reorderLevel: item.reorderLevel || 0,
      expired: item.expired || 'Active', // Default status
      defaultUnit: item.unitOfMeasure || item.defaultUnit,
    }));
  },
  async addStockItem(data: any) { 
    return apiClient.post('/products', {
      ...data,
      productName: data.name || data.productName,
      salesPrice: data.sellingPrice || data.salesPrice,
      cost: data.purchasePrice || data.cost,
      unitOfMeasure: data.defaultUnit || data.unitOfMeasure,
    }); 
  },
  async updateStockItem(id: string, data: any) { 
    return apiClient.put(`/products/${id}`, {
      ...data,
      productName: data.name || data.productName,
      salesPrice: data.sellingPrice || data.salesPrice,
      cost: data.purchasePrice || data.cost,
      unitOfMeasure: data.defaultUnit || data.unitOfMeasure,
    }); 
  },
  async deleteStockItem(id: string) { return apiClient.delete(`/products/${id}`); },
  
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
