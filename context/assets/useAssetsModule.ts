import { useState, useCallback } from "react";
import { assetsService } from "../../services/assets.service";
import {
  Asset,
  Maintenance,
  Depreciation,
  Allocation,
  Tracking,
  AuditLog,
  Disposal,
} from "../../types";

export const useAssetsModule = (fetchAllData: () => Promise<void>) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [depreciations, setDepreciations] = useState<Depreciation[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [trackings, setTrackings] = useState<Tracking[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [disposals, setDisposals] = useState<Disposal[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  const fetchAssetsData = useCallback(async () => {
    setAssetsLoading(true);
    try {
      const [
        assetsRes,
        maintenancesRes,
        depreciationsRes,
        allocationsRes,
        trackingsRes,
        auditLogsRes,
        disposalsRes,
      ] = await Promise.all([
        assetsService.getAssets(),
        assetsService.getMaintenances(),
        assetsService.getDepreciations(),
        assetsService.getAllocations(),
        assetsService.getTrackings(),
        assetsService.getAuditLogs(),
        assetsService.getDisposals(),
      ]);

      if (assetsRes.success) setAssets(assetsRes.data);
      if (maintenancesRes.success) setMaintenances(maintenancesRes.data);
      if (depreciationsRes.success) setDepreciations(depreciationsRes.data);
      if (allocationsRes.success) setAllocations(allocationsRes.data);
      if (trackingsRes.success) setTrackings(trackingsRes.data);
      if (auditLogsRes.success) setAuditLogs(auditLogsRes.data);
      if (disposalsRes.success) setDisposals(disposalsRes.data);
    } catch (error) {
      console.error("Error fetching assets data:", error);
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  // CRUD for Asset Register
  const addAsset = async (data: any) => {
    const res = await assetsService.createAsset(data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const updateAsset = async (id: string, data: any) => {
    const res = await assetsService.updateAsset(id, data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const deleteAsset = async (id: string) => {
    const res = await assetsService.deleteAsset(id);
    if (res.success) await fetchAssetsData();
    return res;
  };

  // CRUD for Maintenance
  const addMaintenance = async (data: any) => {
    const res = await assetsService.createMaintenance(data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const updateMaintenance = async (id: string, data: any) => {
    const res = await assetsService.updateMaintenance(id, data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const deleteMaintenance = async (id: string) => {
    console.log("Deleting maintenance with ID:", id); // أضيفي هذا السطر
    const res = await assetsService.deleteMaintenance(id);
    console.log("Delete response:", res); // أضيفي هذا السطر
    if (res.success) await fetchAssetsData();
    return res;
  };

  // CRUD for Depreciation
  const addDepreciation = async (data: any) => {
    const res = await assetsService.createDepreciation(data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const updateDepreciation = async (id: string, data: any) => {
    const res = await assetsService.updateDepreciation(id, data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const deleteDepreciation = async (id: string) => {
    const res = await assetsService.deleteDepreciation(id);
    if (res.success) await fetchAssetsData();
    return res;
  };

  // CRUD for Allocation
  const addAllocation = async (data: any) => {
    const res = await assetsService.createAllocation(data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const updateAllocation = async (id: string, data: any) => {
    const res = await assetsService.updateAllocation(id, data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const deleteAllocation = async (id: string) => {
    const res = await assetsService.deleteAllocation(id);
    if (res.success) await fetchAssetsData();
    return res;
  };

  // CRUD for Tracking
  const addTracking = async (data: any) => {
    const res = await assetsService.createTracking(data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const updateTracking = async (id: string, data: any) => {
    const res = await assetsService.updateTracking(id, data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const deleteTracking = async (id: string) => {
    const res = await assetsService.deleteTracking(id);
    if (res.success) await fetchAssetsData();
    return res;
  };

  // CRUD for Audit Logs
  const addAuditLog = async (data: any) => {
    const res = await assetsService.createAuditLog(data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const updateAuditLog = async (id: string, data: any) => {
    const res = await assetsService.updateAuditLog(id, data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const deleteAuditLog = async (id: string) => {
    const res = await assetsService.deleteAuditLog(id);
    if (res.success) await fetchAssetsData();
    return res;
  };

  // CRUD for Disposal
  const addDisposal = async (data: any) => {
    const res = await assetsService.createDisposal(data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const updateDisposal = async (id: string, data: any) => {
    const res = await assetsService.updateDisposal(id, data);
    if (res.success) await fetchAssetsData();
    return res;
  };

  const deleteDisposal = async (id: string) => {
    const res = await assetsService.deleteDisposal(id);
    if (res.success) await fetchAssetsData();
    return res;
  };

  return {
    assets,
    maintenances,
    depreciations,
    allocations,
    trackings,
    auditLogs,
    disposals,
    assetsLoading,
    fetchAssetsData,
    addAsset,
    updateAsset,
    deleteAsset,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    addDepreciation,
    updateDepreciation,
    deleteDepreciation,
    addAllocation,
    updateAllocation,
    deleteAllocation,
    addTracking,
    updateTracking,
    deleteTracking,
    addAuditLog,
    updateAuditLog,
    deleteAuditLog,
    addDisposal,
    updateDisposal,
    deleteDisposal,
  };
};
