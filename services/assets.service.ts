import apiClient from '../client/apiClient';

export const assetsService = {
  // Asset Register
  getAssets: async () => {
    const res = await apiClient.get('/assets/register/list');
    return res.data;
  },
  getAssetById: async (id: string) => {
    const res = await apiClient.get(`/assets/register/${id}`);
    return res.data;
  },
  createAsset: async (data: any) => {
    const res = await apiClient.post('/assets/register/create', data);
    return res.data;
  },
  updateAsset: async (id: string, data: any) => {
    const res = await apiClient.patch(`/assets/register/update/${id}`, data);
    return res.data;
  },
  deleteAsset: async (id: string) => {
    const res = await apiClient.delete(`/assets/register/delete/${id}`);
    return res.data;
  },

  // Maintenance
  getMaintenances: async () => {
    const res = await apiClient.get('/assets/maintenance/list');
    return res.data;
  },
  getMaintenanceById: async (id: string) => {
    const res = await apiClient.get(`/assets/maintenance/${id}`);
    return res.data;
  },
  createMaintenance: async (data: any) => {
    const res = await apiClient.post('/assets/maintenance/create', data);
    return res.data;
  },
  updateMaintenance: async (id: string, data: any) => {
    const res = await apiClient.patch(`/assets/maintenance/update/${id}`, data);
    return res.data;
  },
  deleteMaintenance: async (id: string) => {
    const res = await apiClient.delete(`/assets/maintenance/delete/${id}`);
    return res.data;
  },

  // Depreciation
  getDepreciations: async () => {
    const res = await apiClient.get('/assets/depreciation/list');
    return res.data;
  },
  getDepreciationById: async (id: string) => {
    const res = await apiClient.get(`/assets/depreciation/${id}`);
    return res.data;
  },
  createDepreciation: async (data: any) => {
    const res = await apiClient.post('/assets/depreciation/create', data);
    return res.data;
  },
  updateDepreciation: async (id: string, data: any) => {
    const res = await apiClient.patch(`/assets/depreciation/update/${id}`, data);
    return res.data;
  },
  deleteDepreciation: async (id: string) => {
    const res = await apiClient.delete(`/assets/depreciation/delete/${id}`);
    return res.data;
  },

  // Allocation
  getAllocations: async () => {
    const res = await apiClient.get('/assets/allocation/list');
    return res.data;
  },
  getAllocationById: async (id: string) => {
    const res = await apiClient.get(`/assets/allocation/${id}`);
    return res.data;
  },
  createAllocation: async (data: any) => {
    const res = await apiClient.post('/assets/allocation/create', data);
    return res.data;
  },
  updateAllocation: async (id: string, data: any) => {
    const res = await apiClient.patch(`/assets/allocation/update/${id}`, data);
    return res.data;
  },
  deleteAllocation: async (id: string) => {
    const res = await apiClient.delete(`/assets/allocation/delete/${id}`);
    return res.data;
  },

  // Tracking
  getTrackings: async () => {
    const res = await apiClient.get('/assets/tracking/list');
    return res.data;
  },
  getTrackingById: async (id: string) => {
    const res = await apiClient.get(`/assets/tracking/${id}`);
    return res.data;
  },
  createTracking: async (data: any) => {
    const res = await apiClient.post('/assets/tracking/create', data);
    return res.data;
  },
  updateTracking: async (id: string, data: any) => {
    const res = await apiClient.patch(`/assets/tracking/update/${id}`, data);
    return res.data;
  },
  deleteTracking: async (id: string) => {
    const res = await apiClient.delete(`/assets/tracking/delete/${id}`);
    return res.data;
  },

  // Disposal
  getDisposals: async () => {
    const res = await apiClient.get('/assets/disposal/list');
    return res.data;
  },
  getDisposalById: async (id: string) => {
    const res = await apiClient.get(`/assets/disposal/${id}`);
    return res.data;
  },
  createDisposal: async (data: any) => {
    const res = await apiClient.post('/assets/disposal/create', data);
    return res.data;
  },
  updateDisposal: async (id: string, data: any) => {
    const res = await apiClient.patch(`/assets/disposal/update/${id}`, data);
    return res.data;
  },
  deleteDisposal: async (id: string) => {
    const res = await apiClient.delete(`/assets/disposal/delete/${id}`);
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async () => {
    const res = await apiClient.get('/assets/audit-log/list');
    return res.data;
  },
  getAuditLogById: async (id: string) => {
    const res = await apiClient.get(`/assets/audit-log/${id}`);
    return res.data;
  },
  createAuditLog: async (data: any) => {
    const res = await apiClient.post('/assets/audit-log/create', data);
    return res.data;
  },
  updateAuditLog: async (id: string, data: any) => {
    const res = await apiClient.patch(`/assets/audit-log/update/${id}`, data);
    return res.data;
  },
  deleteAuditLog: async (id: string) => {
    const res = await apiClient.delete(`/assets/audit-log/delete/${id}`);
    return res.data;
  },
};
