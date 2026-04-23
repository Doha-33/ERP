import { useState, useCallback, useMemo } from 'react';
import financeService from '../../services/finance.service';
import { 
  Account, JournalEntry, AccountReceivable, AccountPayable,
  APPayment, ARPayment, Tax,
  GeneralLedgerReport, BalanceSheetReport,
  TrialBalanceReport, ProfitLossReport,
  Income, Expense, Budget,
  Currency, ExchangeRate, MonthlyClosing, BankAccount
} from '../../types';

export const useAccountingModule = (fetchAllData?: () => Promise<void>) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([]);
  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>([]);
  const [arPayments, setARPayments] = useState<ARPayment[]>([]);
  const [apPayments, setAPPayments] = useState<APPayment[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [closings, setClosings] = useState<MonthlyClosing[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccountingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        accountsData, journalsData, arData, apData, 
        arPayData, apPayData, taxData,
        incomeData, expenseData, budgetData,
        currencyData, exchangeRateData, closingData,
        bankData
      ] = await Promise.all([
        financeService.getAccounts(),
        financeService.getJournalEntries(),
        financeService.getAccountsReceivable(),
        financeService.getAccountsPayable(),
        financeService.getARPayments(),
        financeService.getAPPayments(),
        financeService.getTaxes(),
        financeService.getIncomes(),
        financeService.getExpenses(),
        financeService.getBudgets(),
        financeService.getCurrencies(),
        financeService.getExchangeRates(),
        financeService.getClosings(),
        financeService.getBankAccounts()
      ]);
      setAccounts(accountsData);
      setJournalEntries(journalsData);
      setAccountsReceivable(arData);
      setAccountsPayable(apData);
      setARPayments(arPayData);
      setAPPayments(apPayData);
      setTaxes(taxData);
      setIncomes(incomeData);
      setExpenses(expenseData);
      setBudgets(budgetData);
      setCurrencies(currencyData);
      setExchangeRates(exchangeRateData);
      setClosings(closingData);
      setBankAccounts(bankData);
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

  // --- Incomes ---
  const addIncome = useCallback(async (data: any) => {
    try {
      await financeService.createIncome(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const updateIncome = useCallback(async (id: string, data: any) => {
    try {
      await financeService.updateIncome(id, data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const deleteIncome = useCallback(async (id: string) => {
    try {
      await financeService.deleteIncome(id);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  // --- Expenses ---
  const addExpense = useCallback(async (data: any) => {
    try {
      await financeService.createExpense(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const updateExpense = useCallback(async (id: string, data: any) => {
    try {
      await financeService.updateExpense(id, data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await financeService.deleteExpense(id);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  // --- Budgets ---
  const addBudget = useCallback(async (data: any) => {
    try {
      await financeService.createBudget(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const updateBudget = useCallback(async (id: string, data: any) => {
    try {
      await financeService.updateBudget(id, data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const deleteBudget = useCallback(async (id: string) => {
    try {
      await financeService.deleteBudget(id);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  // --- Bank Accounts ---
  const addBankAccount = useCallback(async (data: any) => {
    try {
      await financeService.createBankAccount(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const updateBankAccount = useCallback(async (id: string, data: any) => {
    try {
      await financeService.updateBankAccount(id, data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const deleteBankAccount = useCallback(async (id: string) => {
    try {
      await financeService.deleteBankAccount(id);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  // --- Currencies ---
  const addCurrency = useCallback(async (data: any) => {
    try {
      await financeService.createCurrency(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const updateCurrency = useCallback(async (id: string, data: any) => {
    try {
      await financeService.updateCurrency(id, data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const deleteCurrency = useCallback(async (id: string) => {
    try {
      await financeService.deleteCurrency(id);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  // --- Exchange Rates ---
  const addExchangeRate = useCallback(async (data: any) => {
    try {
      await financeService.createExchangeRate(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  // --- Monthly Closing ---
  const closeMonth = useCallback(async (data: { month: number; year: number }) => {
    try {
      await financeService.closeMonth(data);
      await fetchAccountingData();
    } catch (error) { console.error(error); throw error; }
  }, [fetchAccountingData]);

  const reopenMonth = useCallback(async (data: { month: number; year: number }) => {
    try {
      await financeService.reopenMonth(data);
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
    bankAccounts,
    taxes,
    incomes,
    expenses,
    budgets,
    currencies,
    exchangeRates,
    closings,
    accountingLoading: isLoading,
    fetchAccountingData,
    addAccount,
    updateAccount,
    deleteAccount,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
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
    deleteTax,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    addBudget,
    updateBudget,
    deleteBudget,
    addCurrency,
    updateCurrency,
    deleteCurrency,
    addExchangeRate,
    closeMonth,
    reopenMonth
  }), [
    accounts, journalEntries, accountsReceivable, accountsPayable, arPayments, apPayments, bankAccounts, taxes, incomes, expenses, budgets, currencies, exchangeRates, closings, isLoading, fetchAccountingData,
    addAccount, updateAccount, deleteAccount,
    addBankAccount, updateBankAccount, deleteBankAccount,
    addJournalEntry, updateJournalEntry, deleteJournalEntry,
    addAccountReceivable, updateAccountReceivable, deleteAccountReceivable,
    addAccountPayable, updateAccountPayable, deleteAccountPayable,
    addARPayment, deleteARPayment,
    addAPPayment, deleteAPPayment,
    addTax, updateTax, deleteTax,
    addIncome, updateIncome, deleteIncome,
    addExpense, updateExpense, deleteExpense,
    addBudget, updateBudget, deleteBudget,
    addCurrency, updateCurrency, deleteCurrency,
    addExchangeRate, closeMonth, reopenMonth
  ]);
};
