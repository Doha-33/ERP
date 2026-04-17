import { useState, useCallback, useMemo } from 'react';
import financeService from '../../services/finance.service';
import { 
  Account, JournalEntry, AccountReceivable, AccountPayable,
  APPayment, ARPayment, Tax,
  GeneralLedgerReport, BalanceSheetReport,
  TrialBalanceReport, ProfitLossReport 
} from '../../types';

export const useAccountingModule = (fetchAllData?: () => Promise<void>) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([]);
  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>([]);
  const [arPayments, setARPayments] = useState<ARPayment[]>([]);
  const [apPayments, setAPPayments] = useState<APPayment[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccountingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        accountsData, journalsData, arData, apData, 
        arPayData, apPayData, taxData
      ] = await Promise.all([
        financeService.getAccounts(),
        financeService.getJournalEntries(),
        financeService.getAccountsReceivable(),
        financeService.getAccountsPayable(),
        financeService.getARPayments(),
        financeService.getAPPayments(),
        financeService.getTaxes()
      ]);
      setAccounts(accountsData);
      setJournalEntries(journalsData);
      setAccountsReceivable(arData);
      setAccountsPayable(apData);
      setARPayments(arPayData);
      setAPPayments(apPayData);
      setTaxes(taxData);
    } catch (error) {
      console.error('Error fetching accounting data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Accounts ---
  const addAccount = useCallback(async (data: any) => {
    try {
      await financeService.createAccount(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const updateAccount = useCallback(async (id: string, data: any) => {
    try {
      await financeService.updateAccount(id, data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      await financeService.deleteAccount(id);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  // --- Journal Entries ---
  const addJournalEntry = useCallback(async (data: any) => {
    try {
      await financeService.createJournalEntry(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const updateJournalEntry = useCallback(async (id: string, data: any) => {
    try {
      await financeService.updateJournalEntry(id, data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const deleteJournalEntry = useCallback(async (id: string) => {
    try {
      await financeService.deleteJournalEntry(id);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  // --- Accounts Receivable ---
  const addAccountReceivable = useCallback(async (data: any) => {
    try {
      await financeService.createAccountReceivable(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const updateAccountReceivable = useCallback(async (id: string, data: any) => {
    try {
      await financeService.updateAccountReceivable(id, data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const deleteAccountReceivable = useCallback(async (id: string) => {
    try {
      await financeService.deleteAccountReceivable(id);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  // --- Accounts Payable ---
  const addAccountPayable = useCallback(async (data: any) => {
    try {
      await financeService.createAccountPayable(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const updateAccountPayable = useCallback(async (id: string, data: any) => {
    try {
      await financeService.updateAccountPayable(id, data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const deleteAccountPayable = useCallback(async (id: string) => {
    try {
      await financeService.deleteAccountPayable(id);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  // --- AR Payments ---
  const addARPayment = useCallback(async (data: any) => {
    try {
      await financeService.createARPayment(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const deleteARPayment = useCallback(async (id: string) => {
    try {
      await financeService.deleteARPayment(id);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  // --- AP Payments ---
  const addAPPayment = useCallback(async (data: any) => {
    try {
      await financeService.createAPPayment(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const deleteAPPayment = useCallback(async (id: string) => {
    try {
      await financeService.deleteAPPayment(id);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  // --- Taxes ---
  const addTax = useCallback(async (data: any) => {
    try {
      await financeService.createTax(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const updateTax = useCallback(async (id: string, data: any) => {
    try {
      await financeService.updateTax(id, data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const deleteTax = useCallback(async (id: string) => {
    try {
      await financeService.deleteTax(id);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  return useMemo(() => ({
    accounts,
    journalEntries,
    accountsReceivable,
    accountsPayable,
    arPayments,
    apPayments,
    taxes,
    accountingLoading: isLoading,
    fetchAccountingData,
    addAccount,
    updateAccount,
    deleteAccount,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    addAccountReceivable,
    updateAccountReceivable,
    deleteAccountReceivable,
    addAccountPayable,
    updateAccountPayable,
    deleteAccountPayable,
    addARPayment,
    deleteARPayment,
    addAPPayment,
    deleteAPPayment,
    addTax,
    updateTax,
    deleteTax
  }), [
    accounts, journalEntries, accountsReceivable, accountsPayable, arPayments, apPayments, taxes, isLoading, fetchAccountingData,
    addAccount, updateAccount, deleteAccount,
    addJournalEntry, updateJournalEntry, deleteJournalEntry,
    addAccountReceivable, updateAccountReceivable, deleteAccountReceivable,
    addAccountPayable, updateAccountPayable, deleteAccountPayable,
    addARPayment, deleteARPayment,
    addAPPayment, deleteAPPayment,
    addTax, updateTax, deleteTax
  ]);
};
