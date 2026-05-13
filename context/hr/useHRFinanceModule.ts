
import { useState, useCallback, useMemo } from 'react';
import hrService from '../../services/hr.service';
import { Payroll, PayrollLog, DeductionRecord, Loan } from '../../types';

export const useHRFinanceModule = (fetchAllData?: () => Promise<void>) => {
  const [payrollRecords, setPayrollRecords] = useState<Payroll[]>([]);
  const [payrollLogs, setPayrollLogs] = useState<PayrollLog[]>([]);
  const [deductionRecords, setDeductionRecords] = useState<DeductionRecord[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);


  const fetchPayrolls = useCallback(async () => {
    try {
      const data = await hrService.getPayrolls();
      setPayrollRecords(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching Payroll Records:", error);
    }
  }, []);

  const addPayrollRecord = useCallback(async (record: Payroll) => {
    try {
      await hrService.addPayroll(record);
      if (fetchAllData) await fetchAllData();
    } catch (err: any) {
      console.error(err);
    }
  }, [fetchAllData]);

  const updatePayrollRecord = useCallback(async (record: Payroll) => {
    try {
      await hrService.updatePayroll(record.id, record);
      if (fetchAllData) await fetchAllData();
    } catch (err: any) {
      console.error(err);
    }
  }, [fetchAllData]);

  const deletePayrollRecord = useCallback(async (id: string) => {
    try {
      await hrService.deletePayroll(id);
      if (fetchAllData) await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  }, [fetchAllData]);

  const generatePayroll = useCallback(async (month: number, year: number) => {
    try {
      await hrService.generatePayroll({ month, year });
      if (fetchAllData) await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  }, [fetchAllData]);

  // --- Deductions ---
  const fetchDeductionRecords = useCallback(async () => {
    try {
      const data = await hrService.getDeductions();
      setDeductionRecords(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching Deductions:", error);
    }
  }, []);

  const addDeductionRecord = useCallback(async (record: any) => {
    try {
      await hrService.addDeduction(record);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const updateDeductionRecord = useCallback(async (record: any) => {
    try {
      await hrService.updateDeduction(record.id, record);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteDeductionRecord = useCallback(async (id: string) => {
    try {
      await hrService.deleteDeduction(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  // --- Loans ---
  const fetchLoans = useCallback(async () => {
      try {
        const data = await hrService.getLoans();
        setLoans(Array.isArray(data) ? data : data?.data || []);
      } catch (error) {
        console.error("Error fetching Loans:", error);
      }
    }, []);

  const addLoan = useCallback(async (loan: Loan) => {
    try {
      await hrService.addLoan(loan);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const updateLoan = useCallback(async (loan: Loan) => {
    try {
      await hrService.updateLoan(loan.id, loan);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteLoan = useCallback(async (id: string) => {
    try {
      await hrService.deleteLoan(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const toggleLoanWorkflow = useCallback(async (id: string, role: 'hr' | 'manager') => {
    try {
      // Assuming hrService has toggleLoanWorkflow, if not we can use apiClient directly or add it
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const rejectLoan = useCallback(async (id: string, reason?: string) => {
    try {
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const fetchFinanceData = useCallback(async () => {
    try {
      const [payrollsRes, logsRes, loansRes, deductionsRes] = await Promise.all([
        hrService.getPayrolls(),
        hrService.getPayrollLogs(),
        hrService.getLoans(),
        hrService.getDeductions(),
      ]);
      setPayrollRecords(Array.isArray(payrollsRes) ? payrollsRes : (payrollsRes?.data || []));
      setPayrollLogs(Array.isArray(logsRes) ? logsRes : (logsRes?.data || []));
      setLoans(Array.isArray(loansRes) ? loansRes : (loansRes?.data || []));
      setDeductionRecords(Array.isArray(deductionsRes) ? deductionsRes : (deductionsRes?.data || []));
    } catch (error) {
      console.error('Error fetching finance data:', error);
    }
  }, []);

  return useMemo(() => ({
    payrollRecords, setPayrollRecords,
    payrolls: payrollRecords, // alias
    payrollLogs, setPayrollLogs,
    deductionRecords, setDeductionRecords,
    loans, setLoans,
    fetchFinanceData,
    addPayrollRecord,
    addPayroll: addPayrollRecord, // alias
    updatePayrollRecord,
    updatePayroll: updatePayrollRecord, // alias
    deletePayrollRecord,
    deletePayroll: deletePayrollRecord, // alias
    fetchPayrolls,
    generatePayroll,
    addDeductionRecord, updateDeductionRecord, deleteDeductionRecord, fetchDeductionRecords,
    addLoan, updateLoan, deleteLoan, fetchLoans, toggleLoanWorkflow, rejectLoan
  }), [
    payrollRecords, payrollLogs, deductionRecords, loans,
    addPayrollRecord, updatePayrollRecord, fetchPayrolls, deletePayrollRecord, generatePayroll,
    addDeductionRecord, updateDeductionRecord, deleteDeductionRecord, fetchDeductionRecords,
    addLoan, updateLoan, deleteLoan, fetchLoans, toggleLoanWorkflow, rejectLoan
  ]);
};
    