import { useState, useCallback, useMemo, useEffect } from "react";
import inventoryService from "../../services/inventory.service";
import {
  Product,
  Stock,
  Warehouse,
  Unit,
  Category,
  StockMovement,
  InventoryReport,
} from "../../types";
import { toast } from "sonner";

export const useInventoryModule = () => {
  const [inventoryProducts, setInventoryProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [inventoryReports, setInventoryReports] = useState<InventoryReport[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const fetchInventoryData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, stockRes, whRes, catRes, invRepRes] = await Promise.all([
        inventoryService.getStockItems(),
        inventoryService.getStock(),
        inventoryService.getWarehouses(),
        inventoryService.getCategories(),
        inventoryService.getInventoryReport(),
      ]);
      setInventoryProducts(
        Array.isArray(prodRes) ? prodRes : prodRes?.data || [],
      );
      setStocks(Array.isArray(stockRes) ? stockRes : stockRes?.data || []);
      setWarehouses(Array.isArray(whRes) ? whRes : whRes?.data || []);
      setCategories(Array.isArray(catRes) ? catRes : catRes?.data || []);
      setInventoryReports(
        Array.isArray(invRepRes) ? invRepRes : invRepRes?.data || [],
      );
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  // Products CRUD
  const addProduct = useCallback(async (product: Partial<Product>) => {
    try {
      const newProduct = await inventoryService.addStockItem(product);
      toast.success("Product added successfully");
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (product: Partial<Product>) => {
    try {
      const id = (product._id || product.id) as string;
      const updatedProduct = await inventoryService.updateStockItem(
        id,
        product,
      );
      toast.success("Product updated successfully");
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await inventoryService.deleteStockItem(id);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
      throw error;
    }
  }, []);

  // Warehouses CRUD
  const addWarehouse = useCallback(async (warehouse: Partial<Warehouse>) => {
    try {
      const newWarehouse = await inventoryService.addWarehouse(warehouse);
      toast.success("Warehouse added successfully");
      return newWarehouse;
    } catch (error) {
      console.error("Error adding warehouse:", error);
      toast.error("Failed to add warehouse");
      throw error;
    }
  }, []);

  const updateWarehouse = useCallback(async (warehouse: Partial<Warehouse>) => {
    try {
      const id = (warehouse._id || warehouse.id) as string;
      const updatedWarehouse = await inventoryService.updateWarehouse(
        id,
        warehouse,
      );
      toast.success("Warehouse updated successfully");
      return updatedWarehouse;
    } catch (error) {
      console.error("Error updating warehouse:", error);
      toast.error("Failed to update warehouse");
      throw error;
    }
  }, []);

  const deleteWarehouse = useCallback(async (id: string) => {
    try {
      await inventoryService.deleteWarehouse(id);
      toast.success("Warehouse deleted successfully");
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      toast.error("Failed to delete warehouse");
      throw error;
    }
  }, []);

  // Categories CRUD
  const addCategory = useCallback(
    async (category: Partial<Category>) => {
      try {
        const newCategory = await inventoryService.addCategory(category);
        toast.success("Category added successfully");
        await fetchInventoryData();
        return newCategory;
      } catch (error) {
        console.error("Error adding category:", error);
        toast.error("Failed to add category");
        throw error;
      }
    },
    [fetchInventoryData],
  );

  const updateCategory = useCallback(
    async (category: Partial<Category>) => {
      try {
        const id = ((category as any)._id || (category as any).id) as string;
        const updatedCategory = await inventoryService.updateCategory(
          id,
          category,
        );
        toast.success("Category updated successfully");
        await fetchInventoryData();
        return updatedCategory;
      } catch (error) {
        console.error("Error updating category:", error);
        toast.error("Failed to update category");
        throw error;
      }
    },
    [fetchInventoryData],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        await inventoryService.deleteCategory(id);
        toast.success("Category deleted successfully");
        await fetchInventoryData();
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category");
        throw error;
      }
    },
    [fetchInventoryData],
  );

  // Stocks and Units CRUD
  const addStock = useCallback(
    async (stock: any) => {
      try {
        // Usually stock is managed via stockIn
        const res = await inventoryService.stockIn(stock);
        toast.success("Stock added successfully");
        await fetchInventoryData();
        return res;
      } catch (error) {
        console.error("Error adding stock:", error);
        toast.error("Failed to add stock");
        throw error;
      }
    },
    [fetchInventoryData],
  );

  const updateStock = useCallback(
    async (stock: Partial<Stock>) => {
      try {
        const id = ((stock as any)._id || (stock as any).id) as string;
        // If there's an update stock endpoint, use it. Otherwise placeholder
        await inventoryService.updateStockItem(id, stock);
        await fetchInventoryData();
      } catch (error) {
        console.error("Error updating stock:", error);
        throw error;
      }
    },
    [fetchInventoryData],
  );

  const deleteStock = useCallback(
    async (id: string) => {
      try {
        // if needed
        console.log("Delete stock:", id);
        await fetchInventoryData();
      } catch (error) {
        console.error("Error deleting stock:", error);
        throw error;
      }
    },
    [fetchInventoryData],
  );

  const addUnit = useCallback(async (unit: Partial<Unit>) => {
    try {
      const newUnit = await inventoryService.addUnit(unit);
      toast.success("Unit added successfully");
      return newUnit;
    } catch (error) {
      console.error("Error adding unit:", error);
      toast.error("Failed to add unit");
      throw error;
    }
  }, []);

  const updateUnit = useCallback(async (id: string, unit: Partial<Unit>) => {
    try {
      const updatedUnit = await inventoryService.updateUnit(id, unit);
      toast.success("Unit updated successfully");
      return updatedUnit;
    } catch (error) {
      console.error("Error updating unit:", error);
      toast.error("Failed to update unit");
      throw error;
    }
  }, []);

  const deleteUnit = useCallback(async (id: string) => {
    try {
      await inventoryService.deleteUnit(id);
      toast.success("Unit deleted successfully");
    } catch (error) {
      console.error("Error deleting unit:", error);
      toast.error("Failed to delete unit");
      throw error;
    }
  }, []);

  // Stock Management Actions
  const stockIn = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        const res = await inventoryService.stockIn(data);
        toast.success("Stock added successfully");
        await fetchInventoryData();
        return res;
      } catch (error: any) {
        toast.error(error.message || "Failed to add stock");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchInventoryData],
  );

  const stockOut = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        const res = await inventoryService.stockOut(data);
        toast.success("Stock removed successfully");
        await fetchInventoryData();
        return res;
      } catch (error: any) {
        toast.error(error.message || "Failed to remove stock");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchInventoryData],
  );

  const reserveStock = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        const res = await inventoryService.reserveStock(data);
        toast.success("Stock reserved successfully");
        await fetchInventoryData();
        return res;
      } catch (error: any) {
        toast.error(error.message || "Failed to reserve stock");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchInventoryData],
  );

  const releaseStock = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        const res = await inventoryService.releaseStock(data);
        toast.success("Stock released successfully");
        await fetchInventoryData();
        return res;
      } catch (error: any) {
        toast.error(error.message || "Failed to release stock");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchInventoryData],
  );

  const getProductMovements = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      return await inventoryService.getProductMovements(productId);
    } catch (error: any) {
      console.error("Error fetching movements:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(
    () => ({
      // State
      inventoryProducts,
      stocks,
      warehouses,
      units,
      categories,
      stockMovements,
      inventoryReports,
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
      stockIn,
      stockOut,
      reserveStock,
      releaseStock,
      getProductMovements,
    }),
    [
      inventoryProducts,
      stocks,
      warehouses,
      units,
      categories,
      stockMovements,
      inventoryReports,
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
      stockIn,
      stockOut,
      reserveStock,
      releaseStock,
      getProductMovements,
    ],
  );
};
