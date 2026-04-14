
import { useState, useCallback, useMemo } from 'react';
import salesService from '../../services/sales.service';
import { 
  Customer, SalesOrder, SalesInvoice, SalesReturn, POSProduct,
  PricingRule, Discount, Promotion, Quotation, SalesSettings, Product
} from '../../types';

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
  const [salesSettings, setSalesSettings] = useState<SalesSettings>({
    vatPercentage: 15,
    invoiceNumberingMethod: 'Manual',
    defaultPricelist: 'Standard',
    defaultPaymentTerms: 'Net 30',
    defaultCurrency: 'USD',
    allowReturnsWithoutInvoice: false,
    allowSellingOutOfStock: false,
  });

  const fetchSalesData = useCallback(async () => {
    try {
      const [
        customersRes, ordersRes, invoicesRes, returnsRes, 
        discountsRes, promotionsRes, quotationsRes, productsRes
      ] = await Promise.all([
        salesService.getAllCustomers(),
        salesService.getAllSalesOrders(),
        salesService.getAllSalesInvoices(),
        salesService.getAllSalesReturns(),
        salesService.getAllDiscounts(),
        salesService.getAllPromotions(),
        salesService.getAllQuotations(),
        salesService.getAllProducts(),
      ]);

      setCustomers(customersRes);
      setSalesOrders(ordersRes);
      setSalesInvoices(invoicesRes);
      setSalesReturns(returnsRes);
      setDiscounts(discountsRes);
      setPromotions(promotionsRes);
      setQuotations(quotationsRes);
      setProducts(productsRes);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  }, []);

  // --- Pricing Rules ---
  const addPricingRule = useCallback(async (rule: PricingRule) => {
    await salesService.addPricingRule(rule);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updatePricingRule = useCallback(async (rule: PricingRule) => {
    await salesService.updatePricingRule(rule.id, rule);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deletePricingRule = useCallback(async (id: string) => {
    await salesService.deletePricingRule(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // --- Discounts ---
  const addDiscount = useCallback(async (discount: Discount) => {
    await salesService.addDiscount(discount);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateDiscount = useCallback(async (discount: Discount) => {
    await salesService.updateDiscount(discount.id, discount);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteDiscount = useCallback(async (id: string) => {
    await salesService.deleteDiscount(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // --- Promotions ---
  const addPromotion = useCallback(async (promotion: Promotion) => {
    await salesService.addPromotion(promotion);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updatePromotion = useCallback(async (promotion: Promotion) => {
    await salesService.updatePromotion(promotion.id, promotion);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deletePromotion = useCallback(async (id: string) => {
    await salesService.deletePromotion(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // --- Quotations ---
  const addQuotation = useCallback(async (quotation: Quotation) => {
    await salesService.addQuotation(quotation);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateQuotation = useCallback(async (quotation: Quotation) => {
    await salesService.updateQuotation(quotation.id, quotation);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteQuotation = useCallback(async (id: string) => {
    await salesService.deleteQuotation(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // --- Products ---
  const addPOSProduct = useCallback(async (product: POSProduct) => {
    await salesService.addPOSProduct(product);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updatePOSProduct = useCallback(async (product: POSProduct) => {
    await salesService.updatePOSProduct(product.id, product);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deletePOSProduct = useCallback(async (id: string) => {
    await salesService.deletePOSProduct(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // --- Settings ---
  const updateSalesSettings = useCallback(async (settings: SalesSettings) => {
    await salesService.updateSalesSettings(settings);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // --- Customers ---
  const addCustomer = useCallback(async (customer: Customer) => {
    try {
      await salesService.addCustomer(customer);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const updateCustomer = useCallback(async (customer: Customer) => {
    try {
      await salesService.updateCustomer(customer.id, customer);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      await salesService.deleteCustomer(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  // --- Sales Orders ---
  const addSalesOrder = useCallback(async (order: SalesOrder) => {
    try {
      await salesService.addSalesOrder(order);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const updateSalesOrder = useCallback(async (order: SalesOrder) => {
    try {
      await salesService.updateSalesOrder(order.id, order);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteSalesOrder = useCallback(async (id: string) => {
    try {
      await salesService.deleteSalesOrder(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  // --- Sales Invoices ---
  const addSalesInvoice = useCallback(async (invoice: SalesInvoice) => {
    try {
      await salesService.addSalesInvoice(invoice);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const updateSalesInvoice = useCallback(async (invoice: SalesInvoice) => {
    try {
      await salesService.updateSalesInvoice(invoice.id, invoice);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteSalesInvoice = useCallback(async (id: string) => {
    try {
      await salesService.deleteSalesInvoice(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  // --- Sales Returns ---
  const addSalesReturn = useCallback(async (ret: SalesReturn) => {
    try {
      await salesService.addSalesReturn(ret);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const updateSalesReturn = useCallback(async (ret: SalesReturn) => {
    try {
      await salesService.updateSalesReturn(ret.id, ret);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteSalesReturn = useCallback(async (id: string) => {
    try {
      await salesService.deleteSalesReturn(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  // --- Products ---
  const addSalesProduct = useCallback(async (product: Product) => {
    try {
      await salesService.addProduct(product);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const updateSalesProduct = useCallback(async (product: Product) => {
    try {
      await salesService.updateProduct(product.id, product);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteSalesProduct = useCallback(async (id: string) => {
    try {
      await salesService.deleteProduct(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  return useMemo(() => ({
    customers, setCustomers,
    products, setProducts,
    salesOrders, setSalesOrders,
    salesInvoices, setSalesInvoices,
    salesReturns, setSalesReturns,
    posProducts, setPosProducts,
    pricingRules, setPricingRules,
    discounts, setDiscounts,
    promotions, setPromotions,
    quotations, setQuotations,
    salesSettings, setSalesSettings,
    addCustomer, updateCustomer, deleteCustomer,
    addSalesOrder, updateSalesOrder, deleteSalesOrder,
    addSalesInvoice, updateSalesInvoice, deleteSalesInvoice,
    addSalesReturn, updateSalesReturn, deleteSalesReturn,
    addPricingRule, updatePricingRule, deletePricingRule,
    addDiscount, updateDiscount, deleteDiscount,
    addPromotion, updatePromotion, deletePromotion,
    addQuotation, updateQuotation, deleteQuotation,
    addPOSProduct, updatePOSProduct, deletePOSProduct,
    addSalesProduct, updateSalesProduct, deleteSalesProduct,
    updateSalesSettings,
    fetchSalesData
  }), [
    customers, products, salesOrders, salesInvoices, salesReturns, posProducts,
    pricingRules, discounts, promotions, quotations, salesSettings,
    addCustomer, updateCustomer, deleteCustomer,
    addSalesOrder, updateSalesOrder, deleteSalesOrder,
    addSalesInvoice, updateSalesInvoice, deleteSalesInvoice,
    addSalesReturn, updateSalesReturn, deleteSalesReturn,
    addPricingRule, updatePricingRule, deletePricingRule,
    addDiscount, updateDiscount, deleteDiscount,
    addPromotion, updatePromotion, deletePromotion,
    addQuotation, updateQuotation, deleteQuotation,
    addPOSProduct, updatePOSProduct, deletePOSProduct,
    addSalesProduct, updateSalesProduct, deleteSalesProduct,
    updateSalesSettings,
    fetchSalesData
  ]);
};
