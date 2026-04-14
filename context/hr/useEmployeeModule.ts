
import { useState, useCallback, useMemo } from 'react';
import hrService from '../../services/hr.service';
import { Employee, DocumentRecord, Attendance, Performance, CareerHistory, Contract } from '../../types';

export const useEmployeeModule = (fetchAllData?: () => Promise<void>) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [evaluations, setEvaluations] = useState<Performance[]>([]);
  const [careerHistory, setCareerHistory] = useState<CareerHistory[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);

  const fetchEmployeeData = useCallback(async () => {
    try {
      const [employeesRes, attendanceRes, performanceRes, careerRes] = await Promise.all([
        hrService.getEmployees(),
        hrService.getAttendance(),
        hrService.getPerformance(),
        hrService.getCareerHistory(),
      ]);
      setEmployees(employeesRes);
      setAttendanceRecords(attendanceRes);
      setEvaluations(performanceRes);
      setCareerHistory(careerRes);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  }, []);

  const addEmployee = useCallback(async (employee: Employee) => {
    try {
      await hrService.addEmployee(employee);
      if (fetchAllData) await fetchAllData();
    } catch (error: any) {
      console.error('Failed to add employee:', error);
      throw error; 
    }
  }, [fetchAllData]);

  const updateEmployee = useCallback(async (updatedEmployee: Employee) => {
    try {
      await hrService.updateEmployee(updatedEmployee.id, updatedEmployee);
      if (fetchAllData) await fetchAllData();
    } catch (error: any) {
      console.error('Failed to update employee:', error);
      throw error;
    }
  }, [fetchAllData]);

  const deleteEmployee = useCallback(async (id: string) => {
    try {
      await hrService.deleteEmployee(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to delete employee:', error);
      throw error;
    }
  }, [fetchAllData]);

  const getEmployeeById = useCallback((id: string) => employees.find(e => e.id === id), [employees]);

  // --- Documents ---
  const addDocument = useCallback(async (payload: any) => {
    try {
      await hrService.addEmployee(payload); 
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const updateDocument = useCallback(async (id: string, data: any) => {
    try {
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  // --- Attendance ---
  const addAttendanceRecord = useCallback(async (record: any) => {
    try {
      await hrService.addAttendance(record);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const updateAttendanceRecord = useCallback(async (record: any) => {
    try {
      await hrService.updateAttendance(record.id, record);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteAttendanceRecord = useCallback(async (id: string) => {
    try {
      await hrService.deleteAttendance(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  // --- Evaluation ---
  const addEvaluation = useCallback(async (evaluation: Performance) => {
    try {
      await hrService.addPerformance(evaluation);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const updateEvaluation = useCallback(async (evaluation: Performance) => {
    try {
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteEvaluation = useCallback(async (id: string) => {
    try {
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  // --- Career History ---
  const addCareerHistory = useCallback(async (item: CareerHistory) => {
    try {
      await hrService.addCareerHistory(item);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  // --- Contract ---
  const addContract = useCallback(async (contract: Contract) => {
    try {
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const updateContract = useCallback(async (contract: Contract) => {
    try {
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteContract = useCallback(async (id: string) => {
    try {
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  return useMemo(() => ({
    employees, setEmployees,
    documents, setDocuments,
    attendanceRecords, setAttendanceRecords,
    evaluations, setEvaluations,
    careerHistory, setCareerHistory,
    contracts, setContracts,
    addEmployee, updateEmployee, deleteEmployee,
    getEmployeeById,
    addDocument, updateDocument, deleteDocument,
    addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord,
    addEvaluation, updateEvaluation, deleteEvaluation,
    addCareerHistory,
    addContract, updateContract, deleteContract,
    fetchEmployeeData
  }), [
    employees, documents, attendanceRecords, evaluations, careerHistory, contracts, 
    addEmployee, updateEmployee, deleteEmployee, getEmployeeById,
    addDocument, updateDocument, deleteDocument,
    addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord,
    addEvaluation, updateEvaluation, deleteEvaluation,
    addCareerHistory,
    addContract, updateContract, deleteContract,
    fetchEmployeeData
  ]);
};
