import apiClient from '../client/apiClient';

const inventoryService = {
  // Stock Items (Products)
  async getStockItems() {
    const res = await apiClient.get('/products/list');
    const items = res.data?.data || [];
    return items.map((item: any) => ({
      ...item,
      id: item._id || item.id,
      _id: item._id,
      productName: item.productName || item.name,
      sku: item.sku,
      category: item.category,
      productType: item.productType,
      salesPrice: item.salesPrice,
      cost: item.cost,
      description: item.description,
      unitOfMeasure: item.unitOfMeasure,
      barcode: item.barcode,
      hasExpiry: item.hasExpiry,
      status: item.status,
      currentStock: item.currentStock || item.quantityOnHand || 0,
      reorderLevel: item.reorderLevel || 0,
    }));
  },

  async addStockItem(data: any) {
    const res = await apiClient.post('/products/create', {
      sku: data.sku,
      productName: data.productName,
      category: data.category,
      productType: data.productType,
      salesPrice: data.salesPrice,
      cost: data.cost,
      description: data.description,
      unitOfMeasure: data.unitOfMeasure,
      barcode: data.barcode,
      hasExpiry: data.hasExpiry,
      status: data.status || 'ACTIVE',
    });
    return res.data.data;
  },

  async updateStockItem(id: string, data: any) {
    const res = await apiClient.patch(`/products/update/${id}`, {
      sku: data.sku,
      productName: data.productName,
      category: data.category,
      productType: data.productType,
      salesPrice: data.salesPrice,
      cost: data.cost,
      description: data.description,
      unitOfMeasure: data.unitOfMeasure,
      barcode: data.barcode,
      hasExpiry: data.hasExpiry,
      status: data.status,
    });
    return res.data.data;
  },

  async deleteStockItem(id: string) {
    const res = await apiClient.delete(`/products/delete/${id}`);
    return res.data;
  },

  // Stocks
  async getStock() {
    const res = await apiClient.get('/stocks/list');
    return res.data.data || [];
  },
  async addStock(data: any) {
    const res = await apiClient.post('/stocks/create', data);
    return res.data.data;
  },
  async updateStock(id: string, data: any) {
    const res = await apiClient.patch(`/stocks/update/${id}`, data);
    return res.data.data;
  },
  async deleteStock(id: string) {
    const res = await apiClient.delete(`/stocks/delete/${id}`);
    return res.data;
  },

  // Warehouses
  async getWarehouses() {
    const res = await apiClient.get('/warehouses/list');
    const warehouses = res.data?.data || [];
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
    const res = await apiClient.post('/warehouses/create', {
      code: data.code,
      warehouseName: data.warehouseName,
      type: data.type,
      companyId: data.companyId,
      branchId: data.branchId,
      managerName: data.managerName,
      phoneNumber: data.phoneNumber,
      location: data.location,
      state: data.state || 'ACTIVE',
    });
    return res.data.data;
  },

  async updateWarehouse(id: string, data: any) {
    const res = await apiClient.patch(`/warehouses/update/${id}`, {
      code: data.code,
      warehouseName: data.warehouseName,
      type: data.type,
      companyId: data.companyId,
      branchId: data.branchId,
      managerName: data.managerName,
      phoneNumber: data.phoneNumber,
      location: data.location,
      state: data.state,
    });
    return res.data.data;
  },

  async deleteWarehouse(id: string) {
    const res = await apiClient.delete(`/warehouses/delete/${id}`);
    return res.data;
  },

  // Categories
  async getCategories() {
    const res = await apiClient.get('/categories/list');
    return res.data?.data || [];
  },

  // Stock Movements
  async addStockMovement(data: any) {
    const res = await apiClient.post('/stock-movements/create', data);
    return res.data.data;
  },

  async getStockMovements(productId?: string) {
    const url = productId 
      ? `/stock-movements/list?productId=${productId}`
      : '/stock-movements/list';
    const res = await apiClient.get(url);
    return res.data?.data || [];
  },
};

export default inventoryService;