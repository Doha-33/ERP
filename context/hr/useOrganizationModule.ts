
import { useState, useCallback, useMemo } from 'react';
import hrService from '../../services/hr.service';
import { Company, Branch, Department, Job } from '../../types';

export const useOrganizationModule = (fetchAllData?: () => Promise<void>) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const fetchOrganizationData = useCallback(async () => {
    try {
      const [companiesRes, branchesRes, departmentsRes, jobsRes] = await Promise.all([
        hrService.getCompanies(),
        hrService.getBranches(),
        hrService.getDepartments(),
        hrService.getJobs(),
      ]);
      setCompanies(companiesRes);
      setBranches(branchesRes);
      setDepartments(departmentsRes);
      setJobs(jobsRes);
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  }, []);

  // Companies
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

  return useMemo(() => ({
    companies, setCompanies,
    branches, setBranches,
    departments, setDepartments,
    jobs, setJobs,
    addCompany, updateCompany, deleteCompany,
    addBranch, updateBranch, deleteBranch,
    addDepartment, updateDepartment, deleteDepartment,
    addJob, updateJob, deleteJob,
    fetchOrganizationData
  }), [
    companies, branches, departments, jobs,
    addCompany, updateCompany, deleteCompany,
    addBranch, updateBranch, deleteBranch,
    addDepartment, updateDepartment, deleteDepartment,
    addJob, updateJob, deleteJob,
    fetchOrganizationData
  ]);
};
    