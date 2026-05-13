
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

  const getEmployeeById = useCallback((id: string) => employees.find(e => e.id === id || e._id === id), [employees]);

  const getEmployeeFromServer = useCallback(async (id: string) => {
    try {
      return await hrService.getEmployee(id);
    } catch (error) {
      console.error('Failed to fetch employee from server:', error);
      return null;
    }
  }, []);

  const fetchEmployeeData = useCallback(async () => {
    try {
      const [empRes, attendRes, perfRes, careerRes, contractRes] = await Promise.all([
        hrService.getEmployees(),
        hrService.getAttendance(),
        hrService.getPerformances(),
        hrService.getCareerHistory(),
        hrService.getContracts(),
      ]);
      setEmployees(Array.isArray(empRes) ? empRes : (empRes?.data || []));
      setAttendanceRecords(Array.isArray(attendRes) ? attendRes : (attendRes?.data || []));
      setEvaluations(Array.isArray(perfRes) ? perfRes : (perfRes?.data || []));
      setCareerHistory(Array.isArray(careerRes) ? careerRes : (careerRes?.data || []));
      setContracts(Array.isArray(contractRes) ? contractRes : (contractRes?.data || []));
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  }, []);

  // --- Documents ---
  const addDocument = useCallback(async (payload: any) => {
    try {
      // Typically document upload is handled within employee update or a separate endpoint
      // Adjusting based on available methods
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
  const fetchAttendanceRecords = useCallback(async () => {
    try {
      const data = await hrService.getAttendance();
      setAttendanceRecords(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching Attendances:", error);
    }
  }, []);

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
      await hrService.updatePerformance(evaluation.id, evaluation);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteEvaluation = useCallback(async (id: string) => {
    try {
      await hrService.deletePerformance(id);
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

  const updateCareerHistory = useCallback(async (item: CareerHistory) => {
    try {
      await hrService.updateCareerHistory(item.id, item);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteCareerHistory = useCallback(async (id: string) => {
    try {
      await hrService.deleteCareerHistory(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  // --- Contract ---
  const fetchContracts = useCallback(async () => {
    try {
      const data = await hrService.getContracts();
      setContracts(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching Contracts:", error);
    }
  }, []);

  const addContract = useCallback(async (contract: Contract) => {
    try {
      await hrService.addContract(contract);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const updateContract = useCallback(async (contract: Contract) => {
    try {
      await hrService.updateContract(contract.id, contract);
      if (fetchAllData) await fetchAllData();
    } catch (error) { console.error(error); }
  }, [fetchAllData]);

  const deleteContract = useCallback(async (id: string) => {
    try {
      await hrService.deleteContract(id);
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
    fetchEmployeeData,
    addEmployee, updateEmployee, deleteEmployee,
    getEmployeeById, getEmployeeFromServer,
    addDocument, updateDocument, deleteDocument,
    addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord, fetchAttendanceRecords,
    addEvaluation, updateEvaluation, deleteEvaluation,
    addCareerHistory, updateCareerHistory, deleteCareerHistory,
    addContract, updateContract, deleteContract, fetchContracts,
  }), [
    employees, documents, attendanceRecords, evaluations, careerHistory, contracts, 
    addEmployee, updateEmployee, deleteEmployee, getEmployeeById, getEmployeeFromServer,
    addDocument, updateDocument, deleteDocument,
    addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord, fetchAttendanceRecords,
    addEvaluation, updateEvaluation, deleteEvaluation,
    addCareerHistory, updateCareerHistory, deleteCareerHistory,
    addContract, updateContract, deleteContract, fetchContracts,
  ]);
};
