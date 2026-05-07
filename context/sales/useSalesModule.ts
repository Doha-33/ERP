import { useState, useCallback, useMemo } from "react";
import salesService from "../../services/sales.service";
import {
  Customer,
  SalesOrder,
  SalesInvoice,
  SalesReturn,
  POSProduct,
  PricingRule,
  Discount,
  Promotion,
  Quotation,
  SalesSettings,
  Product,
  SalesReport,
  CustomerReport,
} from "../../types";
import posService from "@/services/pos.service";

export const useSalesModule = (fetchAllData?: () => Promise<void>) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [posProducts, setPosProducts] = useState<POSProduct[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [salesReports, setSalesReports] = useState<SalesReport[]>([]);
  const [customerReports, setCustomerReports] = useState<CustomerReport[]>([]);
  const [salesSettings, setSalesSettings] = useState<SalesSettings>({
    vatPercentage: 15,
    invoiceNumberingMethod: "Manual",
    defaultPricelist: "Standard",
    defaultPaymentTerms: "Net 30",
    defaultCurrency: "USD",
    allowReturnsWithoutInvoice: false,
    allowSellingOutOfStock: false,
  });

  const fetchSalesData = useCallback(async () => {
    try {
      const [
        customersRes,
        ordersRes,
        invoicesRes,
        returnsRes,
        discountsRes,
        promotionsRes,
        quotationsRes,
        productsRes,
        salesRepRes,
        custRepRes,
        posProductsRes,
        pricingRes,
      ] = await Promise.all([
        salesService.getAllCustomers(),
        salesService.getAllSalesOrders(),
        salesService.getAllSalesInvoices(),
        salesService.getAllSalesReturns(),
        salesService.getAllPricingRules(),
        salesService.getAllDiscounts(),
        salesService.getAllPromotions(),
        salesService.getAllQuotations(),
        salesService.getAllProducts(),
        salesService.getSalesReport(),
        salesService.getCustomerReport(),
        posService.getPosOrders(),
      ]);

      setCustomers(
        Array.isArray(customersRes) ? customersRes : customersRes?.data || [],
      );
      setSalesOrders(
        Array.isArray(ordersRes) ? ordersRes : ordersRes?.data || [],
      );
      setSalesInvoices(
        Array.isArray(invoicesRes) ? invoicesRes : invoicesRes?.data || [],
      );
      setSalesReturns(
        Array.isArray(returnsRes) ? returnsRes : returnsRes?.data || [],
      );
      setDiscounts(
        Array.isArray(discountsRes) ? discountsRes : discountsRes?.data || [],
      );
      setPricingRules(
        Array.isArray(pricingRes) ? pricingRes : pricingRes?.data || [],
      );
      setPromotions(
        Array.isArray(promotionsRes)
          ? promotionsRes
          : promotionsRes?.data || [],
      );
      setQuotations(
        Array.isArray(quotationsRes)
          ? quotationsRes
          : quotationsRes?.data || [],
      );
      setProducts(
        Array.isArray(productsRes) ? productsRes : productsRes?.data || [],
      );
      setSalesReports(
        Array.isArray(salesRepRes) ? salesRepRes : salesRepRes?.data || [],
      );
      setCustomerReports(
        Array.isArray(custRepRes) ? custRepRes : custRepRes?.data || [],
      );
      setPosProducts(
        Array.isArray(posProductsRes)
          ? posProductsRes
          : posProductsRes?.data || [],
      );
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  }, []);

  // --- Pricing Rules ---
  const fetchPricingRules = useCallback(async () => {
    try {
      const data = await salesService.getAllPricingRules();
      setPricingRules(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching pricing rules:", error);
    }
  }, []);

  const addPricingRule = useCallback(
    async (rule: PricingRule) => {
      await salesService.addPricingRule(rule);
      if (fetchAllData) await fetchAllData();
    },
    [fetchAllData],
  );

  const updatePricingRule = useCallback(
    async (rule: PricingRule) => {
      await salesService.updatePricingRule(rule.id, rule);
      if (fetchAllData) await fetchAllData();
    },
    [fetchAllData],
  );

  const deletePricingRule = useCallback(
    async (id: string) => {
      await salesService.deletePricingRule(id);
      if (fetchAllData) await fetchAllData();
    },
    [fetchAllData],
  );

  // --- Discounts ---
  const addDiscount = useCallback(
    async (discount: Discount) => {
      await salesService.addDiscount(discount);
      if (fetchAllData) await fetchAllData();
    },
    [fetchAllData],
  );

  const updateDiscount = useCallback(
    async (discount: Discount) => {
      await salesService.updateDiscount(discount.id, discount);
      if (fetchAllData) await fetchAllData();
    },
    [fetchAllData],
  );

  const deleteDiscount = useCallback(
    async (id: string) => {
      await salesService.deleteDiscount(id);
      if (fetchAllData) await fetchAllData();
    },
    [fetchAllData],
  );

  // --- Promotions ---
  const addPromotion = useCallback(
    async (promotion: Promotion) => {
      await salesService.addPromotion(promotion);
      if (fetchAllData) await fetchAllData();
    },
    [fetchAllData],
  );

  const updatePromotion = useCallback(
    async (promotion: Promotion) => {
      await salesService.updatePromotion(promotion.id, promotion);
      if (fetchAllData) await fetchAllData();
    },
    [fetchAllData],
  );

  const deletePromotion = useCallback(
    async (id: string) => {
      await salesService.deletePromotion(id);
      if (fetchAllData) await fetchAllData();
    },
    [fetchAllData],
  );

  // --- Quotations ---
  const fetchQuotations = useCallback(async () => {
    try {
      const data = await salesService.getAllQuotations();
      setQuotations(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching quotations:", error);
    }
  }, []);

  const addQuotation = useCallback(
    async (quotation: Quotation) => {
      await salesService.addQuotation(quotation);
      if (fetchAllData) await fetchAllData();
    },
    [fetchAllData],
  );

  const updateQuotation = useCallback(
    async (quotation: Quotation) => {
      await salesService.updateQuotation(quotation.id, quotation);
      if (fetchAllData) await fetchAllData();
    },
    [fetchAllData],
  );

  const deleteQuotation = useCallback(
    async (id: string) => {
      await salesService.deleteQuotation(id);
      if (fetchAllData) await fetchAllData();
    },
    [fetchAllData],
  );

  // --- Settings ---
  const updateSalesSettings = useCallback(
    async (settings: SalesSettings) => {
      await salesService.updateSalesSettings(settings);
      if (fetchAllData) await fetchAllData();
    },
    [fetchAllData],
  );

  // --- Customers ---
  const fetchCustomers = useCallback(async () => {
    try {
      const data = await salesService.getAllCustomers();
      setCustomers(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }, []);
  const addCustomer = useCallback(
    async (customer: Customer) => {
      try {
        await salesService.addCustomer(customer);
        if (fetchAllData) await fetchAllData();
      } catch (error) {
        console.error(error);
      }
    },
    [fetchAllData],
  );

  const updateCustomer = useCallback(
    async (customer: Customer) => {
      try {
        await salesService.updateCustomer(customer.id, customer);
        if (fetchAllData) await fetchAllData();
      } catch (error) {
        console.error(error);
      }
    },
    [fetchAllData],
  );

  const deleteCustomer = useCallback(
    async (id: string) => {
      try {
        await salesService.deleteCustomer(id);
        if (fetchAllData) await fetchAllData();
      } catch (error) {
        console.error(error);
      }
    },
    [fetchAllData],
  );

  // --- Sales Orders ---
  const fetchOrders = useCallback(async () => {
    try {
      const data = await salesService.getAllSalesOrders();
      setSalesOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }, []);

  const addSalesOrder = async (order: SalesOrder) => {
    try {
      const newOrder = await salesService.addSalesOrder(order);
      setSalesOrders((prev) => [...prev, newOrder]);
      return newOrder;
    } catch (error) {
      console.error("Error adding order:", error);
      throw error;
    }
  };

  const updateSalesOrder = async (id: string, order: Partial<SalesOrder>) => {
    try {
      const updatedOrder = await salesService.updateSalesOrder(id, order);
      setSalesOrders((prev) =>
        prev.map((o) => (o._id === id || o.id === id ? updatedOrder : o)),
      );
      return updatedOrder;
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  };

  const deleteSalesOrder = async (id: string) => {
    try {
      await salesService.deleteSalesOrder(id);
      setSalesOrders((prev) => prev.filter((o) => o._id !== id && o.id !== id));
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  };

  // --- Sales Invoices ---
  const fetchSalesInvoicesData = useCallback(async () => {
    try {
      const data = await salesService.getAllSalesInvoices();
      setSalesInvoices(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching sales invoices:", error);
    }
  }, []);
  const addSalesInvoice = useCallback(
    async (invoice: SalesInvoice) => {
      try {
        await salesService.addSalesInvoice(invoice);
        if (fetchAllData) await fetchAllData();
      } catch (error) {
        console.error(error);
      }
    },
    [fetchAllData],
  );

  const updateSalesInvoice = useCallback(
    async (invoice: SalesInvoice) => {
      try {
        await salesService.updateSalesInvoice(invoice.id, invoice);
        if (fetchAllData) await fetchAllData();
      } catch (error) {
        console.error(error);
      }
    },
    [fetchAllData],
  );

  const deleteSalesInvoice = useCallback(
    async (id: string) => {
      try {
        await salesService.deleteSalesInvoice(id);
        if (fetchAllData) await fetchAllData();
      } catch (error) {
        console.error(error);
      }
    },
    [fetchAllData],
  );

  // --- Sales Returns ---
  const fetchSalesReturnsData = useCallback(async () => {
    try {
      const data = await salesService.getAllSalesReturns();
      setSalesReturns(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching sales returns:", error);
    }
  }, []);
  const addSalesReturn = useCallback(
    async (ret: SalesReturn) => {
      try {
        await salesService.addSalesReturn(ret);
        if (fetchAllData) await fetchAllData();
      } catch (error) {
        console.error(error);
      }
    },
    [fetchAllData],
  );

  const updateSalesReturn = useCallback(
    async (ret: SalesReturn) => {
      try {
        await salesService.updateSalesReturn(ret.id, ret);
        if (fetchAllData) await fetchAllData();
      } catch (error) {
        console.error(error);
      }
    },
    [fetchAllData],
  );

  const deleteSalesReturn = useCallback(
    async (id: string) => {
      try {
        await salesService.deleteSalesReturn(id);
        if (fetchAllData) await fetchAllData();
      } catch (error) {
        console.error(error);
      }
    },
    [fetchAllData],
  );

  // --- Products ---
  const fetchProducts = useCallback(async () => {
    try {
      const data = await salesService.getAllProducts();
      setProducts(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);
  const addSalesProduct = useCallback(
    async (product: Product) => {
      try {
        await salesService.addProduct(product);
        if (fetchAllData) await fetchAllData();
      } catch (error) {
        console.error(error);
      }
    },
    [fetchAllData],
  );

  const updateSalesProduct = useCallback(
    async (product: Product) => {
      try {
        await salesService.updateProduct(product.id, product);
        if (fetchAllData) await fetchAllData();
      } catch (error) {
        console.error(error);
      }
    },
    [fetchAllData],
  );

  const deleteSalesProduct = useCallback(
    async (id: string) => {
      try {
        await salesService.deleteProduct(id);
        if (fetchAllData) await fetchAllData();
      } catch (error) {
        console.error(error);
      }
    },
    [fetchAllData],
  );
  const addItemToPOSOrder = useCallback(
    async (orderId: string, itemData: any) => {
      const res = await posService.addItem(orderId, itemData);
      await fetchSalesData();
      return res;
    },
    [fetchSalesData],
  );

  const payOrder = useCallback(
    async (orderId: string, paymentData: any) => {
      const res = await posService.payOrder(orderId, paymentData);
      await fetchSalesData();
      return res;
    },
    [fetchSalesData],
  );

  const createPOSOrder = useCallback(async () => {
    const res = await posService.createPosOrder();
    await fetchSalesData();
    return res;
  }, [fetchSalesData]);

  return useMemo(
    () => ({
      customers,
      setCustomers,
      products,
      setProducts,
      salesOrders,
      setSalesOrders,
      salesInvoices,
      setSalesInvoices,
      salesReturns,
      setSalesReturns,
      posProducts,
      setPosProducts,
      pricingRules,
      setPricingRules,

      discounts,
      setDiscounts,
      promotions,
      setPromotions,
      quotations,
      setQuotations,
      salesSettings,
      salesReports,
      customerReports,

      setSalesSettings,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      fetchCustomers,
      addSalesOrder,
      updateSalesOrder,
      deleteSalesOrder,
      fetchOrders,
      addSalesInvoice,
      updateSalesInvoice,
      deleteSalesInvoice,
      fetchSalesInvoicesData,
      addSalesReturn,
      updateSalesReturn,
      deleteSalesReturn,
      fetchSalesReturnsData,
      addPricingRule,
      updatePricingRule,
      deletePricingRule,

      fetchPricingRules,
      addDiscount,
      updateDiscount,
      deleteDiscount,
      addPromotion,
      updatePromotion,
      deletePromotion,
      addQuotation,
      updateQuotation,
      deleteQuotation,
      fetchQuotations,
      addSalesProduct,
      updateSalesProduct,
      deleteSalesProduct,
      fetchProducts,
      updateSalesSettings,
      addItemToPOSOrder,
      payOrder,
      createPOSOrder,
      fetchSalesData,
    }),
    [
      customers,
      products,
      salesOrders,
      salesInvoices,
      salesReturns,
      posProducts,
      pricingRules,
      discounts,
      promotions,
      quotations,
      salesSettings,
      salesReports,
      customerReports,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      fetchCustomers,
      addSalesOrder,
      updateSalesOrder,
      deleteSalesOrder,
      fetchOrders,
      addSalesInvoice,
      updateSalesInvoice,
      deleteSalesInvoice,
      fetchSalesInvoicesData,
      addSalesReturn,
      updateSalesReturn,
      deleteSalesReturn,
      fetchSalesReturnsData,
      addPricingRule,
      updatePricingRule,
      deletePricingRule,
      fetchPricingRules,
      addDiscount,
      updateDiscount,
      deleteDiscount,
      addPromotion,
      updatePromotion,
      deletePromotion,
      addQuotation,
      updateQuotation,
      deleteQuotation,
      fetchQuotations,
      addItemToPOSOrder,
      payOrder,
      createPOSOrder,

      addSalesProduct,
      updateSalesProduct,
      deleteSalesProduct,
      fetchProducts,
      updateSalesSettings,
      fetchSalesData,
    ],
  );
};
