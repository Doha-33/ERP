import apiClient from '../client/apiClient';
import { 
  Account, JournalEntry, AccountReceivable, AccountPayable,
  APPayment, ARPayment, Tax,
  GeneralLedgerReport, BalanceSheetReport, 
  TrialBalanceReport, ProfitLossReport,
  Income, Expense, Budget, Currency, ExchangeRate, MonthlyClosing, BankAccount
} from '../types';

const financeService = {
  // --- Bank Accounts ---
  async getBankAccounts(): Promise<BankAccount[]> {
    const response = await apiClient.get('/finance/bank-accounts/list');
    return response.data.data;
  },

  async createBankAccount(data: any): Promise<BankAccount> {
    const response = await apiClient.post('/finance/bank-accounts/create', data);
    return response.data.data;
  },

  async updateBankAccount(id: string, data: any): Promise<BankAccount> {
    const response = await apiClient.patch(`/finance/bank-accounts/update/${id}`, data);
    return response.data.data;
  },

  async deleteBankAccount(id: string): Promise<void> {
    await apiClient.delete(`/finance/bank-accounts/delete/${id}`);
  },

  // --- Chart of Accounts ---
  async getAccounts(): Promise<Account[]> {
    const response = await apiClient.get('/finance/chart-of-accounts/list');
    return response.data.data;
  },

  async getAccountById(id: string): Promise<Account> {
    const response = await apiClient.get(`/finance/chart-of-accounts/${id}`);
    return response.data.data;
  },

  async createAccount(data: any): Promise<Account> {
    const response = await apiClient.post('/finance/chart-of-accounts/create', data);
    return response.data.data;
  },

  async updateAccount(id: string, data: any): Promise<Account> {
    const response = await apiClient.patch(`/finance/chart-of-accounts/update/${id}`, data);
    return response.data.data;
  },

  async deleteAccount(id: string): Promise<void> {
    await apiClient.delete(`/finance/chart-of-accounts/delete/${id}`);
  },

  // --- Journal Entries ---
  async getJournalEntries(): Promise<JournalEntry[]> {
    const response = await apiClient.get('/finance/journal-entries/list');
    return response.data.data;
  },

  async getJournalEntryById(id: string): Promise<JournalEntry> {
    const response = await apiClient.get(`/finance/journal-entries/${id}`);
    return response.data.data;
  },

  async createJournalEntry(data: any): Promise<JournalEntry> {
    const response = await apiClient.post('/finance/journal-entries/create', data);
    return response.data.data;
  },

  async updateJournalEntry(id: string, data: any): Promise<JournalEntry> {
    const response = await apiClient.patch(`/finance/journal-entries/update/${id}`, data);
    return response.data.data;
  },

  async deleteJournalEntry(id: string): Promise<void> {
    await apiClient.delete(`/finance/journal-entries/delete/${id}`);
  },

  // --- Accounts Receivable ---
  async getAccountsReceivable(): Promise<AccountReceivable[]> {
    const response = await apiClient.get('/finance/accounts-receivable/list');
    return response.data.data;
  },

  async getAccountReceivableById(id: string): Promise<AccountReceivable> {
    const response = await apiClient.get(`/finance/accounts-receivable/${id}`);
    return response.data.data;
  },

  async createAccountReceivable(data: any): Promise<AccountReceivable> {
    const response = await apiClient.post('/finance/accounts-receivable/create', data);
    return response.data.data;
  },

  async updateAccountReceivable(id: string, data: any): Promise<AccountReceivable> {
    const response = await apiClient.patch(`/finance/accounts-receivable/update/${id}`, data);
    return response.data.data;
  },

  async deleteAccountReceivable(id: string): Promise<void> {
    await apiClient.delete(`/finance/accounts-receivable/delete/${id}`);
  },

  // --- Accounts Payable ---
  async getAccountsPayable(): Promise<AccountPayable[]> {
    const response = await apiClient.get('/finance/accounts-payable/list');
    return response.data.data;
  },

  async getAccountPayableById(id: string): Promise<AccountPayable> {
    const response = await apiClient.get(`/finance/accounts-payable/${id}`);
    return response.data.data;
  },

  async createAccountPayable(data: any): Promise<AccountPayable> {
    const response = await apiClient.post('/finance/accounts-payable/create', data);
    return response.data.data;
  },

  async updateAccountPayable(id: string, data: any): Promise<AccountPayable> {
    const response = await apiClient.patch(`/finance/accounts-payable/update/${id}`, data);
    return response.data.data;
  },

  async deleteAccountPayable(id: string): Promise<void> {
    await apiClient.delete(`/finance/accounts-payable/delete/${id}`);
  },

  // --- AR Payments ---
  async getARPayments(): Promise<ARPayment[]> {
    const response = await apiClient.get('/finance/accounts-receivable-payments/list');
    return response.data.data;
  },

  async createARPayment(data: any): Promise<ARPayment> {
    const response = await apiClient.post('/finance/accounts-receivable-payments/create', data);
    return response.data.data;
  },

  async deleteARPayment(id: string): Promise<void> {
    await apiClient.delete(`/finance/accounts-receivable-payments/delete/${id}`);
  },

  // --- AP Payments ---
  async getAPPayments(): Promise<APPayment[]> {
    const response = await apiClient.get('/finance/accounts-payable-payments/list');
    return response.data.data;
  },

  async createAPPayment(data: any): Promise<APPayment> {
    const response = await apiClient.post('/finance/accounts-payable-payments/create', data);
    return response.data.data;
  },

  async deleteAPPayment(id: string): Promise<void> {
    await apiClient.delete(`/finance/accounts-payable-payments/delete/${id}`);
  },

  // --- Taxes ---
  async getTaxes(): Promise<Tax[]> {
    const response = await apiClient.get('/finance/taxes/list');
    return response.data.data;
  },

  async createTax(data: any): Promise<Tax> {
    const response = await apiClient.post('/finance/taxes/create', data);
    return response.data.data;
  },

  async updateTax(id: string, data: any): Promise<Tax> {
    const response = await apiClient.patch(`/finance/taxes/update/${id}`, data);
    return response.data.data;
  },

  async deleteTax(id: string): Promise<void> {
    await apiClient.delete(`/finance/taxes/delete/${id}`);
  },

  // --- Currencies ---
  async getCurrencies(): Promise<Currency[]> {
    const response = await apiClient.get('/finance/currencies/list');
    return response.data.data;
  },

  async createCurrency(data: any): Promise<Currency> {
    const response = await apiClient.post('/finance/currencies/create', data);
    return response.data.data;
  },

  async updateCurrency(id: string, data: any): Promise<Currency> {
    const response = await apiClient.patch(`/finance/currencies/update/${id}`, data);
    return response.data.data;
  },

  async deleteCurrency(id: string): Promise<void> {
    await apiClient.delete(`/finance/currencies/delete/${id}`);
  },

  // --- Exchange Rates ---
  async getExchangeRates(): Promise<ExchangeRate[]> {
    const response = await apiClient.get('/finance/exchange-rates/list');
    return response.data.data;
  },

  async createExchangeRate(data: any): Promise<ExchangeRate> {
    const response = await apiClient.post('/finance/exchange-rates/create', data);
    return response.data.data;
  },

  // --- Monthly Closing ---
  async getClosings(): Promise<MonthlyClosing[]> {
    const response = await apiClient.get('/finance/closing/list');
    return response.data.data;
  },

  async closeMonth(data: { month: number; year: number }): Promise<MonthlyClosing> {
    const response = await apiClient.post('/finance/closing/close', data);
    return response.data.data;
  },

  async reopenMonth(data: { month: number; year: number }): Promise<void> {
    await apiClient.post('/finance/closing/reopen', data);
  },

  // --- Reports ---
  async getGeneralLedger(params: { accountId?: string; fromDate?: string; toDate?: string }): Promise<GeneralLedgerReport> {
    const response = await apiClient.get('/finance/reports/general-ledger', { params });
    return response.data.data;
  },

  async getBalanceSheet(params: { asOfDate?: string }): Promise<BalanceSheetReport> {
    const response = await apiClient.get('/finance/reports/balance-sheet', { params });
    return response.data.data;
  },

  async getTrialBalance(params: { fromDate?: string; toDate?: string }): Promise<TrialBalanceReport> {
    const response = await apiClient.get('/finance/reports/trial-balance', { params });
    return response.data.data;
  },

  async getProfitLoss(params: { fromDate?: string; toDate?: string }): Promise<ProfitLossReport> {
    const response = await apiClient.get('/finance/reports/profit-loss', { params });
    return response.data.data;
  },

  // --- Income ---
  async getIncomes(): Promise<Income[]> {
    const response = await apiClient.get('/finance/income/list');
    return response.data.data;
  },

  async getIncomeById(id: string): Promise<Income> {
    const response = await apiClient.get(`/finance/income/${id}`);
    return response.data.data;
  },

  async createIncome(data: any): Promise<Income> {
    const response = await apiClient.post('/finance/income/create', data);
    return response.data.data;
  },

  async updateIncome(id: string, data: any): Promise<Income> {
    const response = await apiClient.patch(`/finance/income/update/${id}`, data);
    return response.data.data;
  },

  async deleteIncome(id: string): Promise<void> {
    await apiClient.delete(`/finance/income/delete/${id}`);
  },

  // --- Expenses ---
  async getExpenses(): Promise<Expense[]> {
    const response = await apiClient.get('/finance/expenses/list');
    return response.data.data;
  },

  async getExpenseById(id: string): Promise<Expense> {
    const response = await apiClient.get(`/finance/expenses/${id}`);
    return response.data.data;
  },

  async createExpense(data: any): Promise<Expense> {
    const response = await apiClient.post('/finance/expenses/create', data);
    return response.data.data;
  },

  async updateExpense(id: string, data: any): Promise<Expense> {
    const response = await apiClient.patch(`/finance/expenses/update/${id}`, data);
    return response.data.data;
  },

  async deleteExpense(id: string): Promise<void> {
    await apiClient.delete(`/finance/expenses/delete/${id}`);
  },

  // --- Budgets ---
  async getBudgets(): Promise<Budget[]> {
    const response = await apiClient.get('/finance/budgets/list');
    return response.data.data;
  },

  async getBudgetById(id: string): Promise<Budget> {
    const response = await apiClient.get(`/finance/budgets/${id}`);
    return response.data.data;
  },

  async createBudget(data: any): Promise<Budget> {
    const response = await apiClient.post('/finance/budgets/create', data);
    return response.data.data;
  },

  async updateBudget(id: string, data: any): Promise<Budget> {
    const response = await apiClient.patch(`/finance/budgets/update/${id}`, data);
    return response.data.data;
  },

  async deleteBudget(id: string): Promise<void> {
    await apiClient.delete(`/finance/budgets/delete/${id}`);
  }
};

export default financeService;
