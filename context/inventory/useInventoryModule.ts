
import { useState, useCallback, useMemo } from 'react';
import inventoryService from '../../services/inventory.service';
import { 
  Product, Stock, Warehouse, Unit, Category, StockMovement 
} from '../../types';

export const useInventoryModule = (fetchAllData?: () => Promise<void>) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  const fetchInventoryData = useCallback(async () => {
    try {
      const [productsData, warehousesData, categoriesData] = await Promise.all([
        inventoryService.getStockItems(),
        inventoryService.getWarehouses(),
        inventoryService.getCategories(),
      ]);
      setProducts(productsData);
      setWarehouses(warehousesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  }, []);

  // Products
  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    await inventoryService.addStockItem(product as any);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    await inventoryService.updateStockItem(id, product as any);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteProduct = useCallback(async (id: string) => {
    await inventoryService.deleteStockItem(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // Stocks
  const addStock = useCallback(async (stock: Omit<Stock, 'id'>) => {
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateStock = useCallback(async (id: string, stock: Partial<Stock>) => {
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteStock = useCallback(async (id: string) => {
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // Warehouses
  const addWarehouse = useCallback(async (warehouse: Omit<Warehouse, 'id'>) => {
    await inventoryService.addWarehouse(warehouse as any);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateWarehouse = useCallback(async (id: string, warehouse: Partial<Warehouse>) => {
    await inventoryService.updateWarehouse(id, warehouse as any);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteWarehouse = useCallback(async (id: string) => {
    await inventoryService.deleteWarehouse(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // Units
  const addUnit = useCallback(async (unit: Omit<Unit, 'id'>) => {
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateUnit = useCallback(async (id: string, unit: Partial<Unit>) => {
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteUnit = useCallback(async (id: string) => {
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // Categories
  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateCategory = useCallback(async (id: string, category: Partial<Category>) => {
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteCategory = useCallback(async (id: string) => {
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // Stock Movements
  const addStockMovement = useCallback(async (movement: Omit<StockMovement, 'id'>) => {
    await inventoryService.addStockMovement(movement as any);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  return useMemo(() => ({
    products, setProducts,
    stocks, setStocks,
    warehouses, setWarehouses,
    units, setUnits,
    categories, setCategories,
    stockMovements, setStockMovements,
    addProduct, updateProduct, deleteProduct,
    addStock, updateStock, deleteStock,
    addWarehouse, updateWarehouse, deleteWarehouse,
    addUnit, updateUnit, deleteUnit,
    addCategory, updateCategory, deleteCategory,
    addStockMovement,
    fetchInventoryData
  }), [
    products, stocks, warehouses, units, categories, stockMovements,
    addProduct, updateProduct, deleteProduct,
    addStock, updateStock, deleteStock,
    addWarehouse, updateWarehouse, deleteWarehouse,
    addUnit, updateUnit, deleteUnit,
    addCategory, updateCategory, deleteCategory,
    addStockMovement,
    fetchInventoryData
  ]);
};
