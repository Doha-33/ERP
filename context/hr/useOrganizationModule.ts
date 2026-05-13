
import { useState, useCallback, useMemo } from 'react';
import hrService from '../../services/hr.service';
import { Company, Branch, Department, Job } from '../../types';

export const useOrganizationModule = (fetchAllData?: () => Promise<void>) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Companies
  const fetchCompanies = useCallback(async () => {
    try {
      const data = await hrService.getCompanies();
      setCompanies(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  }, []);

  const addCompany = useCallback(async (company: Company) => {
    await hrService.addCompany(company);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateCompany = useCallback(async (company: Company) => {
    await hrService.updateCompany(company.id, company);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteCompany = useCallback(async (id: string) => {
    await hrService.deleteCompany(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // Branches
  const fetchBranches = useCallback(async () => {
    try {
      const data = await hrService.getBranches();
      setBranches(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  }, []);

  const addBranch = useCallback(async (branch: Branch) => {
    await hrService.addBranch(branch);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateBranch = useCallback(async (branch: Branch) => {
    await hrService.updateBranch(branch.id, branch);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteBranch = useCallback(async (id: string) => {
    await hrService.deleteBranch(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // Departments
  const fetchDepartments = useCallback(async () => {
    try {
      const data = await hrService.getDepartments();
      setDepartments(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching Departments:", error);
    }
  }, []);
  const addDepartment = useCallback(async (department: Department) => {
    await hrService.addDepartment(department);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateDepartment = useCallback(async (department: Department) => {
    await hrService.updateDepartment(department.id, department);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteDepartment = useCallback(async (id: string) => {
    await hrService.deleteDepartment(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  // Jobs
  const fetchJobs = useCallback(async () => {
    try {
      const data = await hrService.getJobs();
      setJobs(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching Jobs:", error);
    }
  }, []);


  const addJob = useCallback(async (job: Job) => {
    await hrService.addJob(job);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const updateJob = useCallback(async (job: Job) => {
    await hrService.updateJob(job.id, job);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const deleteJob = useCallback(async (id: string) => {
    await hrService.deleteJob(id);
    if (fetchAllData) await fetchAllData();
  }, [fetchAllData]);

  const fetchOrganizationData = useCallback(async () => {
    try {
      const [compRes, branchRes, deptRes, jobRes] = await Promise.all([
        hrService.getCompanies(),
        hrService.getBranches(),
        hrService.getDepartments(),
        hrService.getJobs(),
      ]);
      setCompanies(Array.isArray(compRes) ? compRes : (compRes?.data || []));
      setBranches(Array.isArray(branchRes) ? branchRes : (branchRes?.data || []));
      setDepartments(Array.isArray(deptRes) ? deptRes : (deptRes?.data || []));
      setJobs(Array.isArray(jobRes) ? jobRes : (jobRes?.data || []));
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  }, []);

  return useMemo(() => ({
    companies, setCompanies,
    branches, setBranches,
    departments, setDepartments,
    jobs, setJobs,
    fetchOrganizationData, fetchCompanies, fetchBranches,
    addCompany, updateCompany, deleteCompany,
    addBranch, updateBranch, deleteBranch,
    addDepartment, updateDepartment, deleteDepartment, fetchDepartments,
    addJob, updateJob, deleteJob,fetchJobs,
  }), [
    companies, branches, departments, jobs, fetchOrganizationData,
    addCompany, updateCompany, deleteCompany,fetchCompanies,
    addBranch, updateBranch, deleteBranch, fetchBranches,
    addDepartment, updateDepartment, deleteDepartment, fetchDepartments,
    addJob, updateJob, deleteJob,fetchJobs,
  ]);
};
    