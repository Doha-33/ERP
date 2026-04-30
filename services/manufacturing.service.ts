import apiClient from '../client/apiClient';
import { 
  BillOfMaterials, 
  ManufacturingOrder, 
  Operation, 
  WorkCenter, 
  ProductionReport, 
  MaterialRequirement, 
  WorkInProgress 
} from '../types';

export const manufacturingService = {
  // --- Bill of Materials (BOM) ---
  async getBOMs(): Promise<BillOfMaterials[]> {
    const response = await apiClient.get('/manufacturing/bill-of-materials/list');
    return response.data.data;
  },

  async getBOMById(id: string): Promise<BillOfMaterials> {
    const response = await apiClient.get(`/manufacturing/bill-of-materials/${id}`);
    return response.data.data;
  },

  async createBOM(data: Partial<BillOfMaterials>): Promise<BillOfMaterials> {
    const response = await apiClient.post('/manufacturing/bill-of-materials/create', data);
    return response.data.data;
  },

  async updateBOM(id: string, data: Partial<BillOfMaterials>): Promise<BillOfMaterials> {
    const response = await apiClient.patch(`/manufacturing/bill-of-materials/update/${id}`, data);
    return response.data.data;
  },

  async deleteBOM(id: string): Promise<void> {
    await apiClient.delete(`/manufacturing/bill-of-materials/delete/${id}`);
  },

  // --- Manufacturing Orders (MO) ---
  async getManufacturingOrders(): Promise<ManufacturingOrder[]> {
    const response = await apiClient.get('/manufacturing/manufacturing-orders/list');
    return response.data.data;
  },

  async getManufacturingOrderById(id: string): Promise<ManufacturingOrder> {
    const response = await apiClient.get(`/manufacturing/manufacturing-orders/${id}`);
    return response.data.data;
  },

  async createManufacturingOrder(data: Partial<ManufacturingOrder>): Promise<ManufacturingOrder> {
    const response = await apiClient.post('/manufacturing/manufacturing-orders/create', data);
    return response.data.data;
  },

  async updateManufacturingOrder(id: string, data: Partial<ManufacturingOrder>): Promise<ManufacturingOrder> {
    const response = await apiClient.patch(`/manufacturing/manufacturing-orders/update/${id}`, data);
    return response.data.data;
  },

  async deleteManufacturingOrder(id: string): Promise<void> {
    await apiClient.delete(`/manufacturing/manufacturing-orders/delete/${id}`);
  },

  // --- Operations ---
  async getOperations(): Promise<Operation[]> {
    const response = await apiClient.get('/manufacturing/operations/list');
    return response.data.data;
  },

  async getOperationById(id: string): Promise<Operation> {
    const response = await apiClient.get(`/manufacturing/operations/${id}`);
    return response.data.data;
  },

  async createOperation(data: Partial<Operation>): Promise<Operation> {
    const response = await apiClient.post('/manufacturing/operations/create', data);
    return response.data.data;
  },

  async updateOperation(id: string, data: Partial<Operation>): Promise<Operation> {
    const response = await apiClient.patch(`/manufacturing/operations/update/${id}`, data);
    return response.data.data;
  },

  async deleteOperation(id: string): Promise<void> {
    await apiClient.delete(`/manufacturing/operations/delete/${id}`);
  },

  // --- Work Centers ---
  async getWorkCenters(): Promise<WorkCenter[]> {
    const response = await apiClient.get('/manufacturing/work-centers/list');
    return response.data.data;
  },

  async getWorkCenterById(id: string): Promise<WorkCenter> {
    const response = await apiClient.get(`/manufacturing/work-centers/${id}`);
    return response.data.data;
  },

  async createWorkCenter(data: Partial<WorkCenter>): Promise<WorkCenter> {
    const response = await apiClient.post('/manufacturing/work-centers/create', data);
    return response.data.data;
  },

  async updateWorkCenter(id: string, data: Partial<WorkCenter>): Promise<WorkCenter> {
    const response = await apiClient.patch(`/manufacturing/work-centers/update/${id}`, data);
    return response.data.data;
  },

  async deleteWorkCenter(id: string): Promise<void> {
    await apiClient.delete(`/manufacturing/work-centers/delete/${id}`);
  },

  // --- Production Reports ---
  async getProductionReports(): Promise<ProductionReport[]> {
    const response = await apiClient.get('/manufacturing/production-reports/list');
    return response.data.data;
  },

  async getProductionReportById(id: string): Promise<ProductionReport> {
    const response = await apiClient.get(`/manufacturing/production-reports/${id}`);
    return response.data.data;
  },

  async createProductionReport(data: Partial<ProductionReport>): Promise<ProductionReport> {
    const response = await apiClient.post('/manufacturing/production-reports/create', data);
    return response.data.data;
  },

  async updateProductionReport(id: string, data: Partial<ProductionReport>): Promise<ProductionReport> {
    const response = await apiClient.patch(`/manufacturing/production-reports/update/${id}`, data);
    return response.data.data;
  },

  async deleteProductionReport(id: string): Promise<void> {
    await apiClient.delete(`/manufacturing/production-reports/delete/${id}`);
  },

  // --- Material Requirements ---
  async getMaterialRequirements(): Promise<MaterialRequirement[]> {
    const response = await apiClient.get('/manufacturing/material-requirements/list');
    return response.data.data;
  },

  async getMaterialRequirementById(id: string): Promise<MaterialRequirement> {
    const response = await apiClient.get(`/manufacturing/material-requirements/${id}`);
    return response.data.data;
  },

  async createMaterialRequirement(data: Partial<MaterialRequirement>): Promise<MaterialRequirement> {
    const response = await apiClient.post('/manufacturing/material-requirements/create', data);
    return response.data.data;
  },

  async updateMaterialRequirement(id: string, data: Partial<MaterialRequirement>): Promise<MaterialRequirement> {
    const response = await apiClient.patch(`/manufacturing/material-requirements/update/${id}`, data);
    return response.data.data;
  },

  async deleteMaterialRequirement(id: string): Promise<void> {
    await apiClient.delete(`/manufacturing/material-requirements/delete/${id}`);
  },

  // --- Work In Progress (WIP) ---
  async getWIPs(): Promise<WorkInProgress[]> {
    const response = await apiClient.get('/manufacturing/work-in-progress/list');
    return response.data.data;
  },

  async getWIPById(id: string): Promise<WorkInProgress> {
    const response = await apiClient.get(`/manufacturing/work-in-progress/${id}`);
    return response.data.data;
  },

  async createWIP(data: Partial<WorkInProgress>): Promise<WorkInProgress> {
    const response = await apiClient.post('/manufacturing/work-in-progress/create', data);
    return response.data.data;
  },

  async updateWIP(id: string, data: Partial<WorkInProgress>): Promise<WorkInProgress> {
    const response = await apiClient.patch(`/manufacturing/work-in-progress/update/${id}`, data);
    return response.data.data;
  },

  async deleteWIP(id: string): Promise<void> {
    await apiClient.delete(`/manufacturing/work-in-progress/delete/${id}`);
  },

  // --- Dashboard & KPIs ---
  async getDashboardStats(period: string = 'this_month'): Promise<any> {
    const response = await apiClient.get(`/manufacturing/dashboard?period=${period}`);
    return response.data.data;
  },

  async getKPIs(): Promise<any> {
    const response = await apiClient.get('/manufacturing/kpis');
    return response.data.data;
  },
};

