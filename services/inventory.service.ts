import apiClient from '../client/apiClient';

const inventoryService = {
  // Stock Items (Products)
  async getStockItems() {
    const res = await apiClient.get('/inventory/product-list/list');
    const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return items.map((item: any) => ({
      ...item,
      id: item._id || item.id,
      _id: item._id,
      productName: item.productName || item.name,
      sku: item.sku,
      category: item.category,
      productType: item.productType,
      salesPrice: item.sellingPrice || item.salesPrice,
      cost: item.purchasePrice || item.cost,
      description: item.description,
      unitOfMeasure: item.defaultUnit || item.unitOfMeasure,
      barcode: item.barcode,
      hasExpiry: item.expired === 'YES',
      status: item.status || (item.isDeleted ? 'INACTIVE' : 'ACTIVE'),
      currentStock: item.currentStockQty || item.currentStock || 0,
      reorderLevel: item.reorderLevel || 0,
      image: item.image,
      warehouseName: item.warehouseId?.warehouseName || item.warehouseName
    }));
  },

  async addStockItem(data: any) {
    const res = await apiClient.post('/inventory/product-list/create', data);
    return res.data.data;
  },

  async updateStockItem(id: string, data: any) {
    const res = await apiClient.put(`/inventory/product-list/update/${id}`, data);
    return res.data.data;
  },

  async deleteStockItem(id: string) {
    const res = await apiClient.delete(`/inventory/product-list/delete/${id}`);
    return res.data;
  },

  async getProductMovements(productId: string) {
    const res = await apiClient.get(`/stock/movements/${productId}`);
    return res.data.data || [];
  },

  // Warehouses
  async getWarehouses() {
    const res = await apiClient.get('/warehouses/list');
    const warehouses = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return warehouses.map((w: any) => ({
      ...w,
      id: w._id || w.id,
      _id: w._id,
      warehouseName: w.warehouseName || w.name,
      code: w.code,
      type: w.type,
      managerName: w.managerName,
      phoneNumber: w.phoneNumber,
      location: w.location,
      state: w.state,
      companyId: w.companyId,
      branchId: w.branchId,
    }));
  },

  async getWarehouse(id: string) {
    const res = await apiClient.get(`/warehouses/${id}`);
    const w = res.data.data;
    return {
      ...w,
      id: w._id || w.id,
      _id: w._id,
    };
  },

  async addWarehouse(data: any) {
    const res = await apiClient.post('/warehouses/create', data);
    return res.data.data;
  },

  async updateWarehouse(id: string, data: any) {
    const res = await apiClient.put(`/warehouses/update/${id}`, data);
    return res.data.data;
  },

  async deleteWarehouse(id: string) {
    const res = await apiClient.delete(`/warehouses/delete/${id}`);
    return res.data;
  },

  // Categories
  async getCategories() {
    const res = await apiClient.get('/inventory/category/list');
    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return data.map((item: any) => ({
      ...item,
      id: item._id,
      _id: item._id,
    }));
  },

  async addCategory(data: any) {
    const res = await apiClient.post('/inventory/category/create', data);
    return res.data.data;
  },

  async updateCategory(id: string, data: any) {
    const res = await apiClient.put(`/inventory/category/update/${id}`, data);
    return res.data.data;
  },

  async deleteCategory(id: string) {
    const res = await apiClient.delete(`/inventory/category/delete/${id}`);
    return res.data;
  },

  // Units
  async getUnits() {
    const res = await apiClient.get('/inventory/unit/list');
    const data = res.data?.data || [];
    return data.map((item: any) => ({
      ...item,
      id: item._id,
      _id: item._id,
    }));
  },

  async addUnit(data: any) {
    const res = await apiClient.post('/inventory/unit/create', data);
    return res.data.data;
  },

  async updateUnit(id: string, data: any) {
    const res = await apiClient.patch(`/inventory/unit/update/${id}`, data);
    return res.data.data;
  },

  async deleteUnit(id: string) {
    const res = await apiClient.delete(`/inventory/unit/delete/${id}`);
    return res.data;
  },

  // Stock Management
  async getStock() {
    const res = await apiClient.get('/stock/list');
    const data = res.data?.data || [];
    return data.map((item: any) => ({
      ...item,
      id: item._id,
      _id: item._id,
      productName: item.productId?.productName || item.productName,
      sku: item.productId?.sku || item.sku,
      unit: item.productId?.unitOfMeasure || item.unit,
      warehouseName: item.warehouseId?.warehouseName || item.warehouseName,
      warehouseId: typeof item.warehouseId === 'object' ? (item.warehouseId._id || item.warehouseId.id) : item.warehouseId,
      productId: typeof item.productId === 'object' ? (item.productId._id || item.productId.id) : item.productId,
    }));
  },

  async stockIn(data: any) {
    const res = await apiClient.post('/stock/in', data);
    return res.data.data;
  },

  async stockOut(data: any) {
    const res = await apiClient.post('/stock/out', data);
    return res.data.data;
  },

  async getStockMovements(productId?: string) {
    const url = productId ? `/stock/movements/${productId}` : '/stock/movements';
    const res = await apiClient.get(url);
    const data = res.data.data || [];
    return data.map((m: any) => ({
      ...m,
      id: m._id || m.id,
      productName: m.productId?.productName || m.productName,
      sku: m.productId?.sku || m.sku,
      warehouse: typeof m.warehouseId === 'object' ? (m.warehouseId.warehouseName || m.warehouseId.name) : (m.warehouse || m.warehouseId),
      qty: m.qty || m.quantity,
      type: m.type || (m.qty > 0 ? 'In' : 'Out'),
    }));
  },

  async reserveStock(data: any) {
    const res = await apiClient.post('/stock/reserve', data);
    return res.data.data;
  },

  async releaseStock(data: any) {
    const res = await apiClient.post('/stock/release', data);
    return res.data.data;
  },

  // Alias for getStock as requested by user
  async getStockList() {
    return this.getStock();
  },

  async getInventoryReport() {
    const res = await apiClient.get('/inventory/reports/list');
    return res.data.data;
  },
};

export default inventoryService;