import React, { createContext, useContext, useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { useUserModule } from './hr/useUserModule';
import { useOrganizationModule } from './hr/useOrganizationModule';
import { useEmployeeModule } from './hr/useEmployeeModule';
import { useHRFinanceModule } from './hr/useHRFinanceModule';
import { useAccountingModule } from './accounting/useAccountingModule';
import { useRequestModule } from './hr/useRequestModule';
import { useOnboardingModule } from './hr/useOnboardingModule';
import { useSalesModule } from './sales/useSalesModule';
import { useInventoryModule } from './inventory/useInventoryModule';
import { usePurchaseModule } from './purchase/usePurchaseModule';
import { useAssetsModule } from './assets/useAssetsModule';
import { useAuth } from './AuthContext';
import { Employee } from '../types';

type UserModule = ReturnType<typeof useUserModule>;
type OrganizationModule = ReturnType<typeof useOrganizationModule>;
type EmployeeModule = ReturnType<typeof useEmployeeModule>;
type HRFinanceModule = ReturnType<typeof useHRFinanceModule>;
type AccountingModule = ReturnType<typeof useAccountingModule>;
type RequestModule = ReturnType<typeof useRequestModule>;
type OnboardingModule = ReturnType<typeof useOnboardingModule>;
type SalesModule = ReturnType<typeof useSalesModule>;
type InventoryModule = ReturnType<typeof useInventoryModule>;
type PurchaseModule = ReturnType<typeof usePurchaseModule>;
type AssetsModule = ReturnType<typeof useAssetsModule>;

export interface DataContextType extends 
  UserModule, 
  OrganizationModule, 
  EmployeeModule, 
  HRFinanceModule,
  AccountingModule,
  RequestModule, 
  OnboardingModule, 
  SalesModule, 
  InventoryModule, 
  PurchaseModule,
  AssetsModule {
  isDataLoading: boolean;
  fetchAllDataCentral: () => Promise<void>;
  currentUserEmployee: Employee | undefined;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Refs to store module fetchers to avoid circular dependencies
  const salesFetchRef = useRef<(() => Promise<void>) | null>(null);
  const orgFetchRef = useRef<(() => Promise<void>) | null>(null);
  const employeeFetchRef = useRef<(() => Promise<void>) | null>(null);
  const hrFinanceFetchRef = useRef<(() => Promise<void>) | null>(null);
  const accountingFetchRef = useRef<(() => Promise<void>) | null>(null);
  const requestFetchRef = useRef<(() => Promise<void>) | null>(null);
  const onboardingFetchRef = useRef<(() => Promise<void>) | null>(null);
  const inventoryFetchRef = useRef<(() => Promise<void>) | null>(null);
  const purchaseFetchRef = useRef<(() => Promise<void>) | null>(null);
  const assetsFetchRef = useRef<(() => Promise<void>) | null>(null);

  const fetchAllDataCentral = useCallback(async () => {
    setIsDataLoading(true);
    try {
      // Execute fetches sequentially to avoid overwhelming the proxy/backend
      // which can lead to timeouts (especially over ngrok/slow networks)
      await salesFetchRef.current?.();
      await orgFetchRef.current?.();
      await employeeFetchRef.current?.();
      await hrFinanceFetchRef.current?.();
      await accountingFetchRef.current?.();
      await requestFetchRef.current?.();
      await onboardingFetchRef.current?.();
      await inventoryFetchRef.current?.();
      await purchaseFetchRef.current?.();
      await assetsFetchRef.current?.();
    } catch (error) {
      console.error('Error fetching data during central update:', error);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  const userModule = useUserModule(fetchAllDataCentral);
  const orgModule = useOrganizationModule(fetchAllDataCentral);
  const employeeModule = useEmployeeModule(fetchAllDataCentral);
  const hrFinanceModule = useHRFinanceModule(fetchAllDataCentral);
  const accountingModule = useAccountingModule(fetchAllDataCentral);
  const requestModule = useRequestModule(fetchAllDataCentral);
  const onboardingModule = useOnboardingModule(fetchAllDataCentral);
  const salesModule = useSalesModule();
  const inventoryModule = useInventoryModule();
  const purchaseModule = usePurchaseModule();
  const assetsModule = useAssetsModule(fetchAllDataCentral);

  useEffect(() => {
    salesFetchRef.current = salesModule.fetchSalesData;
    orgFetchRef.current = orgModule.fetchOrganizationData;
    employeeFetchRef.current = employeeModule.fetchEmployeeData;
    hrFinanceFetchRef.current = hrFinanceModule.fetchFinanceData;
    accountingFetchRef.current = accountingModule.fetchAccountingData;
    requestFetchRef.current = requestModule.fetchRequestData;
    onboardingFetchRef.current = onboardingModule.fetchOnboardingData;
    inventoryFetchRef.current = inventoryModule.fetchInventoryData;
    purchaseFetchRef.current = purchaseModule.fetchPurchaseData;
    assetsFetchRef.current = assetsModule.fetchAssetsData;

    fetchAllDataCentral();
  }, [
    salesModule.fetchSalesData, 
    orgModule.fetchOrganizationData, 
    employeeModule.fetchEmployeeData,
    hrFinanceModule.fetchFinanceData,
    accountingModule.fetchAccountingData,
    requestModule.fetchRequestData,
    onboardingModule.fetchOnboardingData,
    inventoryModule.fetchInventoryData,
    purchaseModule.fetchPurchaseData,
    assetsModule.fetchAssetsData,
    fetchAllDataCentral
  ]);

  const currentUserEmployee = useMemo(() => {
    if (!user || !employeeModule.employees.length) return undefined;
    return employeeModule.employees.find(e => e.userId === user.id);
  }, [user, employeeModule.employees]);

  const value = {
    isDataLoading,
    fetchAllDataCentral,
    currentUserEmployee,
    ...userModule,
    ...orgModule,
    ...employeeModule,
    ...hrFinanceModule,
    ...accountingModule,
    ...requestModule,
    ...onboardingModule,
    ...salesModule,
    ...inventoryModule,
    ...purchaseModule,
    ...assetsModule,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
