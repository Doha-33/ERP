
import { useState, useCallback, useMemo } from 'react';
import purchaseService from '../../services/purchase.service';
import { 
  Supplier, PurchaseOrder, GoodsReceipt, PurchaseInvoice, 
  PurchaseRequest, SupplierRating, ReturnToSupplier 
} from '../../types';

export const usePurchaseModule = (fetchAllData?: () => Promise<void>) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [supplierRatings, setSupplierRatings] = useState<SupplierRating[]>([]);
  const [returnsToSupplier, setReturnsToSupplier] = useState<ReturnToSupplier[]>([]);

  const fetchPurchaseData = useCallback(async () => {
    try {
      const [suppliersData, requestsData, ordersData, invoicesData] = await Promise.all([
        purchaseService.getSuppliers(),
        purchaseService.getPurchaseRequests(),
        purchaseService.getPurchaseOrders(),
        purchaseService.getPurchaseInvoices(),
      ]);
      setSuppliers(suppliersData || []);
      setPurchaseRequests(requestsData || []);
      setPurchaseOrders(ordersData || []);
      setPurchaseInvoices(invoicesData || []);
    } catch (error) {
      console.error('Error fetching purchase data:', error);
    }
  }, []);

  const addSupplier = useCallback(async (supplier: Supplier) => {
    await purchaseService.addSupplier(supplier as any);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateSupplier = useCallback(async (supplier: Supplier) => {
    await purchaseService.updateSupplier(supplier.id, supplier as any);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteSupplier = useCallback(async (id: string) => {
    await purchaseService.deleteSupplier(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const addPurchaseOrder = useCallback(async (order: PurchaseOrder) => {
    await purchaseService.addPurchaseOrder(order);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updatePurchaseOrder = useCallback(async (order: PurchaseOrder) => {
    await purchaseService.updatePurchaseOrder(order.id, order);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deletePurchaseOrder = useCallback(async (id: string) => {
    await purchaseService.deletePurchaseOrder(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const addGoodsReceipt = useCallback(async (receipt: GoodsReceipt) => {
    await purchaseService.addGoodsReceipt(receipt);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateGoodsReceipt = useCallback(async (receipt: GoodsReceipt) => {
    await purchaseService.updateGoodsReceipt(receipt.id, receipt);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteGoodsReceipt = useCallback(async (id: string) => {
    await purchaseService.deleteGoodsReceipt(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const addPurchaseInvoice = useCallback(async (invoice: PurchaseInvoice) => {
    await purchaseService.addPurchaseInvoice(invoice);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updatePurchaseInvoice = useCallback(async (invoice: PurchaseInvoice) => {
    await purchaseService.updatePurchaseInvoice(invoice.id, invoice);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deletePurchaseInvoice = useCallback(async (id: string) => {
    await purchaseService.deletePurchaseInvoice(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const addPurchaseRequest = useCallback(async (request: PurchaseRequest) => {
    await purchaseService.addPurchaseRequest(request);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updatePurchaseRequest = useCallback(async (request: PurchaseRequest) => {
    await purchaseService.updatePurchaseRequest(request.id, request);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deletePurchaseRequest = useCallback(async (id: string) => {
    await purchaseService.deletePurchaseRequest(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const addSupplierRating = useCallback(async (rating: SupplierRating) => {
    await purchaseService.addSupplierRating(rating);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteSupplierRating = useCallback(async (id: string) => {
    await purchaseService.deleteSupplierRating(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const addReturnToSupplier = useCallback(async (ret: ReturnToSupplier) => {
    await purchaseService.addReturnToSupplier(ret as any);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateReturnToSupplier = useCallback(async (ret: ReturnToSupplier) => {
    await purchaseService.updateReturnToSupplier(ret.id, ret as any);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteReturnToSupplier = useCallback(async (id: string) => {
    await purchaseService.deleteReturnToSupplier(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  return useMemo(() => ({
    suppliers, setSuppliers,
    purchaseOrders, setPurchaseOrders,
    goodsReceipts, setGoodsReceipts,
    purchaseInvoices, setPurchaseInvoices,
    purchaseRequests, setPurchaseRequests,
    supplierRatings, setSupplierRatings,
    returnsToSupplier, setReturnsToSupplier,
    addSupplier, updateSupplier, deleteSupplier,
    addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
    addGoodsReceipt, updateGoodsReceipt, deleteGoodsReceipt,
    addPurchaseInvoice, updatePurchaseInvoice, deletePurchaseInvoice,
    addPurchaseRequest, updatePurchaseRequest, deletePurchaseRequest,
    addSupplierRating, deleteSupplierRating,
    addReturnToSupplier, updateReturnToSupplier, deleteReturnToSupplier,
    fetchPurchaseData
  }), [
    suppliers, purchaseOrders, goodsReceipts, purchaseInvoices, purchaseRequests, supplierRatings, returnsToSupplier,
    addSupplier, updateSupplier, deleteSupplier,
    addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
    addGoodsReceipt, updateGoodsReceipt, deleteGoodsReceipt,
    addPurchaseInvoice, updatePurchaseInvoice, deletePurchaseInvoice,
    addPurchaseRequest, updatePurchaseRequest, deletePurchaseRequest,
    addSupplierRating, deleteSupplierRating,
    addReturnToSupplier, updateReturnToSupplier, deleteReturnToSupplier,
    fetchPurchaseData
  ]);
};
