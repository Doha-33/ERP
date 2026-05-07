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


  // CRUD for Asset Register
  const fetchAssets = async () => {
    setAssetsLoading(true);
    try {
      const res = await assetsService.getAssets();
      if (Array.isArray(res)) {
        setAssets(res);
      } else if (res?.data) {
        setAssets(res.data);
      } else {
        console.error("Unexpected response format for assets:", res);
      }
    } catch (error: any) {
      console.error("Error fetching assets:", error);
    } finally {
      setAssetsLoading(false);
    }
  };

  const addAsset = async (data: any) => {
    const res = await assetsService.createAsset(data);
    if (res.success) return res;
  };

  const updateAsset = async (id: string, data: any) => {
    const res = await assetsService.updateAsset(id, data);
    if (res.success) return res;
  };

  const deleteAsset = async (id: string) => {
    const res = await assetsService.deleteAsset(id);
    if (res.success)
    return res;
  };

  // CRUD for Maintenance
  const fetchMaintenances = async () => {
    setAssetsLoading(true);
    try {
      const res = await assetsService.getMaintenances();
      if (Array.isArray(res)) {
        setMaintenances(res);
      }
      else if (res?.data) {
        setMaintenances(res.data);
      } else {
        console.error("Unexpected response format for maintenances:", res);
      }
    } catch (error: any) {
      console.error("Error fetching maintenances:", error);
    } finally {
      setAssetsLoading(false);
    }
  };

  const addMaintenance = async (data: any) => {
    const res = await assetsService.createMaintenance(data);
    if (res.success)
    return res;
  };

  const updateMaintenance = async (id: string, data: any) => {
    const res = await assetsService.updateMaintenance(id, data);
    if (res.success)
    return res;
  };

  const deleteMaintenance = async (id: string) => {
    console.log("Deleting maintenance with ID:", id); // أضيفي هذا السطر
    const res = await assetsService.deleteMaintenance(id);
    console.log("Delete response:", res); // أضيفي هذا السطر
    if (res.success)
    return res;
  };

  // CRUD for Depreciation
  const fetchDepreciations = async () => {
    setAssetsLoading(true); 
    try {
      const res = await assetsService.getDepreciations();
      if (Array.isArray(res)) {
        setDepreciations(res);
      } else if (res?.data) {
        setDepreciations(res.data);
      }
        else {  
        console.error("Unexpected response format for depreciations:", res);
      }
    } catch (error: any) {
      console.error("Error fetching depreciations:", error);
    } finally {
      setAssetsLoading(false);
    }
  };
  const addDepreciation = async (data: any) => {
    const res = await assetsService.createDepreciation(data);
    if (res.success) return res;
  };

  const updateDepreciation = async (id: string, data: any) => {
    const res = await assetsService.updateDepreciation(id, data);
    if (res.success)
    return res;
  };

  const deleteDepreciation = async (id: string) => {
    const res = await assetsService.deleteDepreciation(id);
    if (res.success)
    return res;
  };

  // CRUD for Allocation
  const fetchAllocations = async () => {
    setAssetsLoading(true); 
    try {
      const res = await assetsService.getAllocations();
      if (Array.isArray(res)) {
        setAllocations(res);
      } else if (res?.data) {
        setAllocations(res.data);
      } else {
        console.error("Unexpected response format for allocations:", res);
      }
    } catch (error: any) {
      console.error("Error fetching allocations:", error);
    } finally {
      setAssetsLoading(false);
    }
  };

  const addAllocation = async (data: any) => {
    const res = await assetsService.createAllocation(data);
    if (res.success)
    return res;
  };

  const updateAllocation = async (id: string, data: any) => {
    const res = await assetsService.updateAllocation(id, data);
    if (res.success)
    return res;
  };

  const deleteAllocation = async (id: string) => {
    const res = await assetsService.deleteAllocation(id);
    if (res.success)
    return res;
  };

  // CRUD for Tracking
  const fetchTrackings = async () => {
    setAssetsLoading(true);
    try {      const res = await assetsService.getTrackings();
      if (Array.isArray(res)) {
        setTrackings(res);
      } else if (res?.data) {
        setTrackings(res.data);
      } else {
        console.error("Unexpected response format for trackings:", res);
      }
    } catch (error: any) {
      console.error("Error fetching trackings:", error);
    } finally {
      setAssetsLoading(false);
    }
  };
  const addTracking = async (data: any) => {
    const res = await assetsService.createTracking(data);
    if (res.success)
    return res;
  };

  const updateTracking = async (id: string, data: any) => {
    const res = await assetsService.updateTracking(id, data);
    if (res.success)
    return res;
  };

  const deleteTracking = async (id: string) => {
    const res = await assetsService.deleteTracking(id);
    if (res.success)
    return res;
  };

  // CRUD for Audit Logs
    const fetchAuditLogs = async () => {  
    setAssetsLoading(true);
    try {
      const res = await assetsService.getAuditLogs();
      if (Array.isArray(res)) {
        setAuditLogs(res);
      } else if (res?.data) {
        setAuditLogs(res.data);
      } else {
        console.error("Unexpected response format for audit logs:", res);
      }
    } catch (error: any) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setAssetsLoading(false);
    }
  };
  const addAuditLog = async (data: any) => {
    const res = await assetsService.createAuditLog(data);
    if (res.success)
    return res;
  };

  const updateAuditLog = async (id: string, data: any) => {
    const res = await assetsService.updateAuditLog(id, data);
    if (res.success)
    return res;
  };

  const deleteAuditLog = async (id: string) => {
    const res = await assetsService.deleteAuditLog(id);
    if (res.success)
    return res;
  };

  // CRUD for Disposal
  const fetchDisposals = async () => {
    setAssetsLoading(true); 
    try {
      const res = await assetsService.getDisposals();
      if (Array.isArray(res)) {
        setDisposals(res);
      } else if (res?.data) {
        setDisposals(res.data);
      } else {
        console.error("Unexpected response format for disposals:", res);
      }
    } catch (error: any) {
      console.error("Error fetching disposals:", error);
    } finally {
      setAssetsLoading(false);
    }
  };
  const addDisposal = async (data: any) => {
    const res = await assetsService.createDisposal(data);
    if (res.success)
    return res;
  };

  const updateDisposal = async (id: string, data: any) => {
    const res = await assetsService.updateDisposal(id, data);
    if (res.success)
    return res;
  };

  const deleteDisposal = async (id: string) => {
    const res = await assetsService.deleteDisposal(id);
    if (res.success)
    return res;
  };

  const fetchAssetsData = useCallback(async () => {
    setAssetsLoading(true);
    try {
      const [assetRes, maintRes, depRes, allocRes, trackRes, auditRes, dispRes] = await Promise.all([
        assetsService.getAssets(),
        assetsService.getMaintenances(),
        assetsService.getDepreciations(),
        assetsService.getAllocations(),
        assetsService.getTrackings(),
        assetsService.getAuditLogs(),
        assetsService.getDisposals()
      ]);
      setAssets(Array.isArray(assetRes) ? assetRes : (assetRes?.data || []));
      setMaintenances(Array.isArray(maintRes) ? maintRes : (maintRes?.data || []));
      setDepreciations(Array.isArray(depRes) ? depRes : (depRes?.data || []));
      setAllocations(Array.isArray(allocRes) ? allocRes : (allocRes?.data || []));
      setTrackings(Array.isArray(trackRes) ? trackRes : (trackRes?.data || []));
      setAuditLogs(Array.isArray(auditRes) ? auditRes : (auditRes?.data || []));
      setDisposals(Array.isArray(dispRes) ? dispRes : (dispRes?.data || []));
    } catch (error) {
      console.error("Error fetching assets data:", error);
    } finally {
      setAssetsLoading(false);
    }
  }, []);

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
    fetchAssets,
    fetchMaintenances,
    fetchDepreciations,
    fetchAllocations,
    fetchTrackings,
    fetchAuditLogs,
    fetchDisposals,
    
  };
};
