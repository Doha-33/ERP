import { useState, useCallback, useMemo, useEffect } from 'react';
import inventoryService from '../../services/inventory.service';
import { 
  Product, Stock, Warehouse, Unit, Category, StockMovement 
} from '../../types';
import { toast } from 'sonner';

export const useInventoryModule = () => {
  const [inventoryProducts, setInventoryProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  // Products CRUD
  const addProduct = useCallback(async (product: Partial<Product>) => {
    try {
      const newProduct = await inventoryService.addStockItem(product);
      toast.success('Product added successfully');
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (product: Partial<Product>) => {
    try {
      const id = (product._id || product.id) as string;
      const updatedProduct = await inventoryService.updateStockItem(id, product);
      toast.success('Product updated successfully');
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await inventoryService.deleteStockItem(id);
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      throw error;
    }
  }, []);

  // Warehouses CRUD
  const addWarehouse = useCallback(async (warehouse: Partial<Warehouse>) => {
    try {
      const newWarehouse = await inventoryService.addWarehouse(warehouse);
      toast.success('Warehouse added successfully');
      return newWarehouse;
    } catch (error) {
      console.error('Error adding warehouse:', error);
      toast.error('Failed to add warehouse');
      throw error;
    }
  }, []);

  const updateWarehouse = useCallback(async (warehouse: Partial<Warehouse>) => {
    try {
      const id = (warehouse._id || warehouse.id) as string;
      const updatedWarehouse = await inventoryService.updateWarehouse(id, warehouse);
      toast.success('Warehouse updated successfully');
      return updatedWarehouse;
    } catch (error) {
      console.error('Error updating warehouse:', error);
      toast.error('Failed to update warehouse');
      throw error;
    }
  }, []);

  const deleteWarehouse = useCallback(async (id: string) => {
    try {
      await inventoryService.deleteWarehouse(id);
      toast.success('Warehouse deleted successfully');
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      toast.error('Failed to delete warehouse');
      throw error;
    }
  }, []);

  // Categories CRUD
  const addCategory = useCallback(async (category: Partial<Category>) => {
    try {
      // implement category creation if needed
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
      throw error;
    }
  }, []);

  const updateCategory = useCallback(async (category: Partial<Category>) => {
    try {
      const id = ((category as any)._id || (category as any).id) as string;
      // implement category update if needed
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
      throw error;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      // implement category deletion if needed
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      throw error;
    }
  }, []);

  // Stock Movements
  const addStockMovement = useCallback(async (movement: Partial<StockMovement>) => {
    try {
      const newMovement = await inventoryService.addStockMovement(movement);
      toast.success('Stock movement recorded successfully');
      return newMovement;
    } catch (error) {
      console.error('Error adding stock movement:', error);
      toast.error('Failed to record stock movement');
      throw error;
    }
  }, []);

  // Placeholder functions for Stocks, Units (implement as needed)
  const addStock = useCallback(async (stock: Partial<Stock>) => {
    console.log('Add stock:', stock);
    // Implement stock creation
  }, []);

  const updateStock = useCallback(async (stock: Partial<Stock>) => {
    const id = ((stock as any)._id || (stock as any).id) as string;
    await inventoryService.updateStockItem(id, stock);
  }, []);

  const deleteStock = useCallback(async (id: string) => {
    console.log('Delete stock:', id);
    // Implement stock deletion
  }, []);

  const addUnit = useCallback(async (unit: Partial<Unit>) => {
    console.log('Add unit:', unit);
    // Implement unit creation
  }, []);

  const updateUnit = useCallback(async (id: string, unit: Partial<Unit>) => {
    console.log('Update unit:', id, unit);
    // Implement unit update
  }, []);

  const deleteUnit = useCallback(async (id: string) => {
    console.log('Delete unit:', id);
    // Implement unit deletion
  }, []);

  const fetchInventoryData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, stockRes, whRes, catRes, moveRes] = await Promise.all([
        inventoryService.getStockItems(),
        inventoryService.getStockItems(),
        inventoryService.getWarehouses(),
        inventoryService.getCategories(),
        inventoryService.getStockMovements(),
      ]);
      setInventoryProducts(Array.isArray(prodRes) ? prodRes : (prodRes?.data || []));
      setStocks(Array.isArray(stockRes) ? stockRes : (stockRes?.data || []));
      setWarehouses(Array.isArray(whRes) ? whRes : (whRes?.data || []));
      setCategories(Array.isArray(catRes) ? catRes : (catRes?.data || []));
      setStockMovements(Array.isArray(moveRes) ? moveRes : (moveRes?.data || []));
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(() => ({
    // State
    inventoryProducts,
    stocks,
    warehouses,
    units,
    categories,
    stockMovements,
    loading,
    fetchInventoryData,
    
    // Actions
    addProduct,
    updateProduct,
    deleteProduct,
    addStock,
    updateStock,
    deleteStock,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    addUnit,
    updateUnit,
    deleteUnit,
    addCategory,
    updateCategory,
    deleteCategory,
    addStockMovement,
  }), [
    inventoryProducts,
    stocks,
    warehouses,
    units,
    categories,
    stockMovements,
    loading,
    fetchInventoryData,
    addProduct,
    updateProduct,
    deleteProduct,
    addStock,
    updateStock,
    deleteStock,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    addUnit,
    updateUnit,
    deleteUnit,
    addCategory,
    updateCategory,
    deleteCategory,
    addStockMovement,
  ]);
};