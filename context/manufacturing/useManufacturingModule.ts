import { useState, useCallback } from 'react';
import { manufacturingService } from '../../services/manufacturing.service';
import { 
  BillOfMaterials, 
  ManufacturingOrder, 
  Operation, 
  WorkCenter, 
  ProductionReport, 
  MaterialRequirement, 
  WorkInProgress 
} from '../../types';
import { toast } from 'sonner';

export const useManufacturingModule = () => {
  const [boms, setBoms] = useState<BillOfMaterials[]>([]);
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [productionReports, setProductionReports] = useState<ProductionReport[]>([]);
  const [materialRequirements, setMaterialRequirements] = useState<MaterialRequirement[]>([]);
  const [wips, setWips] = useState<WorkInProgress[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchManufacturingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        bomsRes, 
        moRes, 
        opsRes, 
        wcRes, 
        reportsRes, 
        reqRes, 
        wipRes, 
        statsRes, 
        kpisRes
      ] = await Promise.all([
        manufacturingService.getBOMs(),
        manufacturingService.getManufacturingOrders(),
        manufacturingService.getOperations(),
        manufacturingService.getWorkCenters(),
        manufacturingService.getProductionReports(),
        manufacturingService.getMaterialRequirements(),
        manufacturingService.getWIPs(),
        manufacturingService.getDashboardStats(),
        manufacturingService.getKPIs(),
      ]);

      setBoms(Array.isArray(bomsRes) ? bomsRes : []);
      setManufacturingOrders(Array.isArray(moRes) ? moRes : []);
      setOperations(Array.isArray(opsRes) ? opsRes : []);
      setWorkCenters(Array.isArray(wcRes) ? wcRes : []);
      setProductionReports(Array.isArray(reportsRes) ? reportsRes : []);
      setMaterialRequirements(Array.isArray(reqRes) ? reqRes : []);
      setWips(Array.isArray(wipRes) ? wipRes : []);
      setDashboardStats(statsRes);
      setKpis(kpisRes);
    } catch (error) {
      console.error('Error fetching manufacturing data:', error);
      toast.error('Failed to fetch manufacturing data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // BOM Actions
  const addBOM = async (data: Partial<BillOfMaterials>) => {
    try {
      await manufacturingService.createBOM(data);
      toast.success('BOM created successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to create BOM');
      throw error;
    }
  };

  const updateBOM = async (id: string, data: Partial<BillOfMaterials>) => {
    try {
      await manufacturingService.updateBOM(id, data);
      toast.success('BOM updated successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to update BOM');
      throw error;
    }
  };

  const deleteBOM = async (id: string) => {
    try {
      await manufacturingService.deleteBOM(id);
      toast.success('BOM deleted successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to delete BOM');
      throw error;
    }
  };

  // Manufacturing Order Actions
  const addMO = async (data: Partial<ManufacturingOrder>) => {
    try {
      await manufacturingService.createManufacturingOrder(data);
      toast.success('Manufacturing Order created successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to create Manufacturing Order');
      throw error;
    }
  };

  const updateMO = async (id: string, data: Partial<ManufacturingOrder>) => {
    try {
      await manufacturingService.updateManufacturingOrder(id, data);
      toast.success('Manufacturing Order updated successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to update Manufacturing Order');
      throw error;
    }
  };

  const deleteMO = async (id: string) => {
    try {
      await manufacturingService.deleteManufacturingOrder(id);
      toast.success('Manufacturing Order deleted successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to delete Manufacturing Order');
      throw error;
    }
  };

  // Work Center Actions
  const addWorkCenter = async (data: Partial<WorkCenter>) => {
    try {
      await manufacturingService.createWorkCenter(data);
      toast.success('Work Center created successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to create Work Center');
      throw error;
    }
  };

  const updateWorkCenter = async (id: string, data: Partial<WorkCenter>) => {
    try {
      await manufacturingService.updateWorkCenter(id, data);
      toast.success('Work Center updated successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to update Work Center');
      throw error;
    }
  };

  const deleteWorkCenter = async (id: string) => {
    try {
      await manufacturingService.deleteWorkCenter(id);
      toast.success('Work Center deleted successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to delete Work Center');
      throw error;
    }
  };

  // Operation Actions
  const addOperation = async (data: Partial<Operation>) => {
    try {
      await manufacturingService.createOperation(data);
      toast.success('Operation created successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to create Operation');
      throw error;
    }
  };

  const updateOperation = async (id: string, data: Partial<Operation>) => {
    try {
      await manufacturingService.updateOperation(id, data);
      toast.success('Operation updated successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to update Operation');
      throw error;
    }
  };

  const deleteOperation = async (id: string) => {
    try {
      await manufacturingService.deleteOperation(id);
      toast.success('Operation deleted successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to delete Operation');
      throw error;
    }
  };

  // Material Requirement Actions
  const addMR = async (data: Partial<MaterialRequirement>) => {
    try {
      await manufacturingService.createMaterialRequirement(data);
      toast.success('Material Requirement created successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to create Material Requirement');
      throw error;
    }
  };

  const updateMR = async (id: string, data: Partial<MaterialRequirement>) => {
    try {
      await manufacturingService.updateMaterialRequirement(id, data);
      toast.success('Material Requirement updated successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to update Material Requirement');
      throw error;
    }
  };

  const deleteMR = async (id: string) => {
    try {
      await manufacturingService.deleteMaterialRequirement(id);
      toast.success('Material Requirement deleted successfully');
      await fetchManufacturingData();
    } catch (error) {
      toast.error('Failed to delete Material Requirement');
      throw error;
    }
  };

  return {
    boms,
    manufacturingOrders,
    operations,
    workCenters,
    productionReports,
    materialRequirements,
    wips,
    dashboardStats,
    kpis,
    isLoading,
    fetchManufacturingData,
    addBOM,
    updateBOM,
    deleteBOM,
    addMO,
    updateMO,
    deleteMO,
    addWorkCenter,
    updateWorkCenter,
    deleteWorkCenter,
    addOperation,
    updateOperation,
    deleteOperation,
    addMR,
    updateMR,
    deleteMR,
  };
};
