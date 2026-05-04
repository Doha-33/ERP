import apiClient from '../client/apiClient';

interface HRService {
  getUsers(): Promise<any>;
  addUser(data: any): Promise<any>;
  updateUser(id: string, data: any): Promise<any>;
  deleteUser(id: string): Promise<any>;
  toggleUserStatus(id: string): Promise<any>;
  getCompanies(): Promise<any>;
  addCompany(data: any): Promise<any>;
  updateCompany(id: string, data: any): Promise<any>;
  deleteCompany(id: string): Promise<any>;
  getBranches(): Promise<any>;
  addBranch(data: any): Promise<any>;
  updateBranch(id: string, data: any): Promise<any>;
  deleteBranch(id: string): Promise<any>;
  getDepartments(): Promise<any>;
  addDepartment(data: any): Promise<any>;
  updateDepartment(id: string, data: any): Promise<any>;
  deleteDepartment(id: string): Promise<any>;
  getJobs(): Promise<any>;
  getJob(id: string): Promise<any>;
  addJob(data: any): Promise<any>;
  updateJob(id: string, data: any): Promise<any>;
  deleteJob(id: string): Promise<any>;
  getEmployees(): Promise<any>;
  getEmployee(id: string):Promise<any>;
  addEmployee(data: any): Promise<any>;
  updateEmployee(id: string, data: any): Promise<any>;
  deleteEmployee(id: string): Promise<any>;
  getAttendance(): Promise<any>;
  addAttendance(data: any): Promise<any>;
  updateAttendance(id: string, data: any): Promise<any>;
  deleteAttendance(id: string): Promise<any>;
  getPayrolls(): Promise<any>;
  getPayroll(id: string): Promise<any>;
  addPayroll(data: any): Promise<any>;
  updatePayroll(id: string, data: any): Promise<any>;
  deletePayroll(id: string): Promise<any>;
  getPayrollLogs(): Promise<any>;
  addPayrollLog(data: any): Promise<any>;
  generatePayroll(data: any): Promise<any>;
  addLoan(data: any): Promise<any>;
  updateLoan(id: string, data: any): Promise<any>;
  deleteLoan(id: string): Promise<any>;
  getLoans(): Promise<any>;
  getLoan(id: string): Promise<any>;
  getInsurances(): Promise<any>;
  getInsurance(id: string): Promise<any>;
  addInsurance(data: any): Promise<any>;
  updateInsurance(id: string, data: any): Promise<any>;
  deleteInsurance(id: string): Promise<any>;
  getAssignLaptops(): Promise<any>;
  getAssignLaptop(id: string): Promise<any>;
  addAssignLaptop(data: any): Promise<any>;
  updateAssignLaptop(id: string, data: any): Promise<any>;
  deleteAssignLaptop(id: string): Promise<any>;
  getAccessCards(): Promise<any>;
  getAccessCard(id: string): Promise<any>;
  addAccessCard(data: any): Promise<any>;
  updateAccessCard(id: string, data: any): Promise<any>;
  deleteAccessCard(id: string): Promise<any>;
  getInitialTrainings(): Promise<any>;
  getInitialTraining(id: string): Promise<any>;
  addInitialTraining(data: any): Promise<any>;
  updateInitialTraining(id: string, data: any): Promise<any>;
  deleteInitialTraining(id: string): Promise<any>;
  getPenalties(): Promise<any>;
  getPenalty(id: string): Promise<any>;
  addPenalty(data: any): Promise<any>;
  updatePenalty(id: string, data: any): Promise<any>;
  deletePenalty(id: string): Promise<any>;
  getRewards(): Promise<any>;
  getReward(id: string): Promise<any>;
  addReward(data: any): Promise<any>;
  updateReward(id: string, data: any): Promise<any>;
  deleteReward(id: string): Promise<any>;
  getDeductions(): Promise<any>;
  getDeduction(id: string): Promise<any>;
  addDeduction(data: any): Promise<any>;
  updateDeduction(id: string, data: any): Promise<any>;
  deleteDeduction(id: string): Promise<any>;
  getEndOfServices(): Promise<any>;
  getEndOfService(id: string): Promise<any>;
  addEndOfService(data: any): Promise<any>;
  updateEndOfService(id: string, data: any): Promise<any>;
  deleteEndOfService(id: string): Promise<any>;
  getResponses(type: string): Promise<any>;
  getResponse(module: string, id: string): Promise<any>;
  getPerformances(): Promise<any>;
  getPerformance(id: string): Promise<any>;
  updatePerformance(id: string, data: any): Promise<any>;
  deletePerformance(id: string): Promise<any>;
  addPerformance(data: any): Promise<any>;
  getCareerHistory(): Promise<any>;
  addCareerHistory(data: any): Promise<any>;
  updateCareerHistory(id: string, data: any): Promise<any>;
  deleteCareerHistory(id: string): Promise<any>;
  getLeaves(): Promise<any>;
  getLeave(id: string): Promise<any>;
  addLeave(data: any): Promise<any>;
  updateLeave(id: string, data: any): Promise<any>;
  deleteLeave(id: string): Promise<any>;
  getRequests(): Promise<any>;
  getRequest(id: string): Promise<any>;
  addRequest(data: any): Promise<any>;
  updateRequest(id: string, data: any): Promise<any>;
  deleteRequest(id: string): Promise<any>;
  getOvertimeReport(): Promise<any>;
  getPerformanceReport(period?: string): Promise<any>;
  getContractsExpiryReport(days?: number): Promise<any>;
  getDocumentsExpiryReport(): Promise<any>;
  getEmployeeSummaryReport(): Promise<any>;
  getMonthlyPayrollReport(): Promise<any>;
  getAttendanceReport(): Promise<any>;
  getLeaveReport(): Promise<any>;
  getAnnualPayrollCostReport(): Promise<any>;
  getGosiReport(): Promise<any>;
  getTurnoverReport(): Promise<any>;
  getHeadcountGrowthReport(): Promise<any>;
  getSalaryTrendReport(): Promise<any>;
  getDepartmentCostReport(): Promise<any>;
  getLeaveBalanceReport(): Promise<any>;
  getPayrollVarianceReport(): Promise<any>;
  getPromotionHistoryReport(): Promise<any>;
  getHiringReport(): Promise<any>;
  getPayslip(id: string): Promise<any>;
  getPayslips(): Promise<any>;
  addPayslip(data: any): Promise<any>;
  updatePayslip(id: string, data: any): Promise<any>;
  deletePayslip(id: string): Promise<any>;
  getContracts(): Promise<any>;
  getContract(id: string): Promise<any>;
  addContract(data: any): Promise<any>;
  updateContract(id: string, data: any): Promise<any>;
  deleteContract(id: string): Promise<any>;
}

const hrService: HRService = {
  // Users
  async getUsers() {
    const res = await apiClient.get('/users/list');
    return res.data.data;
  },
  async addUser(data: any) {
    const res = await apiClient.post('/auth/register', data);
    return res.data.data;
  },
  async updateUser(id: string, data: any) {
    const res = await apiClient.patch(`/users/update/${id}`, data);
    return res.data.data;
  },
  async deleteUser(id: string) {
    const res = await apiClient.delete(`/users/delete/${id}`);
    return res.data;
  },
  async toggleUserStatus(id: string) {
    const res = await apiClient.post(`/users/${id}/toggle-status`);
    return res.data;
  },

  //payslips
  async getPayslips() {
    const res = await apiClient.get('/payslips/list');
    return res.data.data;
  },
  async getPayslip(id: string) {
    const res = await apiClient.get(`/payslips/${id}`);
    return res.data.data;
  },
  async addPayslip(data: any) {
    const res = await apiClient.post('/payslips/create', data);
    return res.data.data;
  },
  async updatePayslip(id: string, data: any) {
    const res = await apiClient.patch(`/payslips/update/${id}`, data);
    return res.data.data;
  },
  async deletePayslip(id: string) {
    const res = await apiClient.delete(`/payslips/delete/${id}`);
    return res.data;
  },

  //contracts
  async getContracts() {
    const res = await apiClient.get('/hr/contracts/list');
    return res.data.data;
  },
  async getContract(id: string) {
    const res = await apiClient.get(`/hr/contracts/${id}`);
    return res.data.data;
  },
  async addContract(data: any) {
    const res = await apiClient.post('/hr/contracts/create', data);
    return res.data.data;
  },
  async updateContract(id: string, data: any) {
    const res = await apiClient.patch(`/hr/contracts/update/${id}`, data);
    return res.data.data;
  },
  async deleteContract(id: string) {
    const res = await apiClient.delete(`/hr/contracts/delete/${id}`);
    return res.data;
  },

  // Companies
  async getCompanies() {
    const res = await apiClient.get('/companies/list');
    return res.data.data;
  },
  async addCompany(data: any) {
    const res = await apiClient.post('/companies/create', data);
    return res.data.data;
  },
  async updateCompany(id: string, data: any) {
    const res = await apiClient.patch(`/companies/update/${id}`, data);
    return res.data.data;
  },
  async deleteCompany(id: string) {
    const res = await apiClient.delete(`/companies/delete/${id}`);
    return res.data;
  },

  // Branches
  async getBranches() {
    const res = await apiClient.get('/branches/list');
    return res.data.data;
  },
  async addBranch(data: any) {
    const res = await apiClient.post('/branches/create', data);
    return res.data.data;
  },
  async updateBranch(id: string, data: any) {
    const res = await apiClient.patch(`/branches/update/${id}`, data);
    return res.data.data;
  },
  async deleteBranch(id: string) {
    const res = await apiClient.delete(`/branches/delete/${id}`);
    return res.data;
  },

  // Departments
  async getDepartments() {
    const res = await apiClient.get('/departments/list');
    return res.data.data;
  },
  async addDepartment(data: any) {
    const res = await apiClient.post('/departments/create', data);
    return res.data.data;
  },
  async updateDepartment(id: string, data: any) {
    const res = await apiClient.patch(`/departments/update/${id}`, data);
    return res.data.data;
  },
  async deleteDepartment(id: string) {
    const res = await apiClient.delete(`/departments/delete/${id}`);
    return res.data;
  },

  // Jobs
  async getJobs() {
    const res = await apiClient.get('/jobs/list');
    return res.data.data;
  },
  async getJob(id: string) {
    const res = await apiClient.get(`/jobs/${id}`);
    return res.data.data;
  },
  async addJob(data: any) {
    const res = await apiClient.post('/jobs/create', data);
    return res.data.data;
  },
  async updateJob(id: string, data: any) {
    const res = await apiClient.patch(`/jobs/update/${id}`, data);
    return res.data.data;
  },
  async deleteJob(id: string) {
    const res = await apiClient.delete(`/jobs/delete/${id}`);
    return res.data;
  },

  // Employees
  async getEmployees() {
    const res = await apiClient.get('/employees/list');
    return res.data.data;
  },
  async getEmployee(id: string){
    const res = await apiClient.get(`/employees/${id}`);
    return res.data.data;
  },
  async addEmployee(data: any) {
    const res = await apiClient.post('/employees/create', data);
    return res.data.data;
  },
  async updateEmployee(id: string, data: any) {
    const res = await apiClient.patch(`/employees/update/${id}`, data);
    return res.data.data;
  },
  async deleteEmployee(id: string) {
    const res = await apiClient.delete(`/employees/delete/${id}`);
    return res.data;
  },

  // Attendance
  async getAttendance() {
    const res = await apiClient.get('/attendance/list');
    return res.data.data;
  },
  async addAttendance(data: any) {
    const res = await apiClient.post('/attendance/create', data);
    return res.data.data;
  },
  async updateAttendance(id: string, data: any) {
    const res = await apiClient.patch(`/attendance/update/${id}`, data);
    return res.data.data;
  },
  async deleteAttendance(id: string) {
    const res = await apiClient.delete(`/attendance/delete/${id}`);
    return res.data;
  },

  // Finance
  async getPayrolls() {
    const res = await apiClient.get('/payrolls/list');
    return res.data.data;
  },
  async getPayroll(id: string) {
    const res = await apiClient.get(`/payrolls/${id}`);
    return res.data.data;
  },
  async addPayroll(data: any) {
    const res = await apiClient.post('/payrolls/create', data);
    return res.data.data;
  },
  async updatePayroll(id: string, data: any) {
    const res = await apiClient.patch(`/payrolls/update/${id}`, data);
    return res.data.data;
  },
  async deletePayroll(id: string) {
    const res = await apiClient.delete(`/payrolls/delete/${id}`);
    return res.data;
  },
  async getPayrollLogs() {
    const res = await apiClient.get('/payroll-file-logs/list');
    return res.data.data;
  },
  async addPayrollLog(data: any) {
    const res = await apiClient.post('/payroll-file-logs/create', data);
    return res.data.data;
  },
  async generatePayroll(data: any) {
    const res = await apiClient.post('/payroll/generate', data);
    return res.data.data;
  },
  async addLoan(data: any) {
    const res = await apiClient.post('/hr/loans/create', data);
    return res.data.data;
  },
  async updateLoan(id: string, data: any) {
    const res = await apiClient.patch(`/hr/loans/update/${id}`, data);
    return res.data.data;
  },
  async deleteLoan(id: string) {
    const res = await apiClient.delete(`/hr/loans/delete/${id}`);
    return res.data;
  },
  async getLoans() {
    const res = await apiClient.get('/hr/loans/list');
    return res.data.data;
  },
  async getLoan(id: string) {
    const res = await apiClient.get(`/hr/loans/${id}`);
    return res.data.data;
  },

  // Onboarding & Insurance
  async getInsurances() {
    const res = await apiClient.get('/hr/insurance-policy/list');
    return res.data.data;
  },
  async getInsurance(id: string) {
    const res = await apiClient.get(`/hr/insurance-policy/${id}`);
    return res.data.data;
  },
  async addInsurance(data: any) {
    const res = await apiClient.post('/hr/insurance-policy/create', data);
    return res.data.data;
  },
  async updateInsurance(id: string, data: any) {
    const res = await apiClient.patch(`/hr/insurance-policy/update/${id}`, data);
    return res.data.data;
  },
  async deleteInsurance(id: string) {
    const res = await apiClient.delete(`/hr/insurance-policy/delete/${id}`);
    return res.data;
  },
  async getAssignLaptops() {
    const res = await apiClient.get('/hr/onboarding/assign-devices/list');
    return res.data.data;
  },
  async getAssignLaptop(id: string) {
    const res = await apiClient.get(`/hr/onboarding/assign-devices/${id}`);
    return res.data.data;
  },
  async addAssignLaptop(data: any) {
    const res = await apiClient.post('/hr/onboarding/assign-devices/create', data);
    return res.data.data;
  },
  async updateAssignLaptop(id: string, data: any) {
    const res = await apiClient.patch(`/hr/onboarding/assign-devices/update/${id}`, data);
    return res.data.data;
  },
  async deleteAssignLaptop(id: string) {
    const res = await apiClient.delete(`/hr/onboarding/assign-devices/delete/${id}`);
    return res.data;
  },
  async getAccessCards() {
    const res = await apiClient.get('/hr/onboarding/access-cards/list');
    return res.data.data;
  },
  async getAccessCard(id: string) {
    const res = await apiClient.get(`/hr/onboarding/access-cards/${id}`);
    return res.data.data;
  },
  async addAccessCard(data: any) {
    const res = await apiClient.post('/hr/onboarding/access-cards/create', data);
    return res.data.data;
  },
  async updateAccessCard(id: string, data: any) {
    const res = await apiClient.patch(`/hr/onboarding/access-cards/update/${id}`, data);
    return res.data.data;
  },
  async deleteAccessCard(id: string) {
    const res = await apiClient.delete(`/hr/onboarding/access-cards/delete/${id}`);
    return res.data;
  },
  async getInitialTrainings() {
    const res = await apiClient.get('/hr/onboarding/initial-training/list');
    return res.data.data;
  },
  async getInitialTraining(id: string) {
    const res = await apiClient.get(`/hr/onboarding/initial-training/${id}`);
    return res.data.data;
  },
  async addInitialTraining(data: any) {
    const res = await apiClient.post('/hr/onboarding/initial-training/create', data);
    return res.data.data;
  },
  async updateInitialTraining(id: string, data: any) {
    const res = await apiClient.patch(`/hr/onboarding/initial-training/update/${id}`, data);
    return res.data.data;
  },
  async deleteInitialTraining(id: string) {
    const res = await apiClient.delete(`/hr/onboarding/initial-training/delete/${id}`);
    return res.data;
  },
  async getPenalties() {
    const res = await apiClient.get('/hr/penalties/list');
    return res.data.data;
  },
  async getPenalty(id: string) {
    const res = await apiClient.get(`/hr/penalties/${id}`);
    return res.data.data;
  },
  async addPenalty(data: any) {
    const res = await apiClient.post('/hr/penalties/create', data);
    return res.data.data;
  },
  async updatePenalty(id: string, data: any) {
    const res = await apiClient.patch(`/hr/penalties/update/${id}`, data);
    return res.data.data;
  },
  async deletePenalty(id: string) {
    const res = await apiClient.delete(`/hr/penalties/delete/${id}`);
    return res.data;
  },
  async getRewards() {
    const res = await apiClient.get('/hr/rewards/list');
    return res.data.data;
  },
  async getReward(id: string) {
    const res = await apiClient.get(`/hr/rewards/${id}`);
    return res.data.data;
  },
  async addReward(data: any) {
    const res = await apiClient.post('/hr/rewards/create', data);
    return res.data.data;
  },
  async updateReward(id: string, data: any) {
    const res = await apiClient.patch(`/hr/rewards/update/${id}`, data);
    return res.data.data;
  },
  async deleteReward(id: string) {
    const res = await apiClient.delete(`/hr/rewards/delete/${id}`);
    return res.data;
  },

  // Deductions
  async getDeductions() {
    const res = await apiClient.get('/hr/deductions/list');
    return res.data.data;
  },
  async getDeduction(id: string) {
    const res = await apiClient.get(`/hr/deductions/${id}`);
    return res.data.data;
  },
  async addDeduction(data: any) {
    const res = await apiClient.post('/hr/deductions/create', data);
    return res.data.data;
  },
  async updateDeduction(id: string, data: any) {
    const res = await apiClient.patch(`/hr/deductions/update/${id}`, data);
    return res.data.data;
  },
  async deleteDeduction(id: string) {
    const res = await apiClient.delete(`/hr/deductions/delete/${id}`);
    return res.data;
  },

  // Performance & Career
  async getPerformances() {
    const res = await apiClient.get('/hr/performance/list');
    return res.data.data;
  },
  async getPerformance(id: string) {
    const res = await apiClient.get(`/hr/performance/${id}`);
    return res.data.data;
  },
  async addPerformance(data: any) {
    const res = await apiClient.post('/hr/performance/create', data);
    return res.data.data;
  },
  async updatePerformance(id: string, data: any) {
    const res = await apiClient.patch(`/hr/performance/update/${id}`, data);
    return res.data.data;
  },
  async deletePerformance(id: string) {
    const res = await apiClient.delete(`/hr/performance/delete/${id}`);
    return res.data;
  },
  async getCareerHistory() {
    const res = await apiClient.get('/hr/careerHistory/list');
    return res.data.data;
  },
  async addCareerHistory(data: any) {
    const res = await apiClient.post('/hr/careerHistory/create', data);
    return res.data.data;
  },
  async updateCareerHistory(id: string, data: any) {
    const res = await apiClient.patch(`/hr/careerHistory/update/${id}`, data);
    return res.data.data;
  },
  async deleteCareerHistory(id: string) {
    const res = await apiClient.delete(`/hr/careerHistory/delete/${id}`);
    return res.data;
  },

  // Requests
  async getLeaves() {
    const res = await apiClient.get('/leaves/list');
    return res.data.data;
  },
  async getLeave(id: string) {
    const res = await apiClient.get(`/leaves/${id}`);
    return res.data.data;
  },
  async addLeave(data: any) {
    const res = await apiClient.post('/leaves/create', data);
    return res.data.data;
  },
  async updateLeave(id: string, data: any) {
    const res = await apiClient.patch(`/leaves/update/${id}`, data);
    return res.data.data;
  },
  async deleteLeave(id: string) {
    const res = await apiClient.delete(`/leaves/delete/${id}`);
    return res.data;
  },
  async getRequests() {
    const res = await apiClient.get('/hr-requests/list');
    return res.data.data;
  },
  async getRequest(id: string) {
    const res = await apiClient.get(`/hr-requests/${id}`);
    return res.data.data;
  },
  async addRequest(data: any) {
    const res = await apiClient.post('/hr-requests/create', data);
    return res.data.data;
  },
  async updateRequest(id: string, data: any) {
    const res = await apiClient.patch(`/hr-requests/update/${id}`, data);
    return res.data.data;
  },
  async deleteRequest(id: string) {
    const res = await apiClient.delete(`/hr-requests/delete/${id}`);
    return res.data;
  },
  async addEndOfService(data: any) {
    const res = await apiClient.post('/hr/end-of-service/create', data);
    return res.data.data;
  },
  async getEndOfServices() {
    const res = await apiClient.get('/hr/end-of-service/list');
    return res.data.data;
  },
  async getEndOfService(id: string) {
    const res = await apiClient.get(`/hr/end-of-service/${id}`);
    return res.data.data;
  },
  async updateEndOfService(id: string, data: any) {
    const res = await apiClient.patch(`/hr/end-of-service/update/${id}`, data);
    return res.data.data;
  },
  async deleteEndOfService(id: string) {
    const res = await apiClient.delete(`/hr/end-of-service/delete/${id}`);
    return res.data;
  },

  async getResponses(type: string) {
    const res = await apiClient.get(`/hr/responses/list`, { params: { type } });
    return res.data.data;
  },
  async getResponse(module: string, id: string) {
    const res = await apiClient.get(`/hr/responses/${module}/${id}`, { params: { module, id } });
    return res.data.data;
  },

  // Reports
  async getOvertimeReport() {
    const res = await apiClient.get('/hr/reports/overtime-report/list');
    return res.data.data;
  },
  async getPerformanceReport(period?: string) {
    const res = await apiClient.get('/hr/reports/performance-report/list', { params: { period } });
    return res.data.data;
  },
  async getContractsExpiryReport(days: number = 60) {
    const res = await apiClient.get('/hr/reports/contracts-expiry/list', { params: { days } });
    return res.data.data;
  },
  async getDocumentsExpiryReport() {
    const res = await apiClient.get('/hr/reports/documents-expiry/list');
    return res.data.data;
  },
  async getEmployeeSummaryReport() {
    const res = await apiClient.get('/hr/reports/employee-summary/list');
    return res.data.data;
  },
  async getMonthlyPayrollReport() {
    const res = await apiClient.get('/hr/reports/monthly-payroll/list');
    return res.data.data;
  },
  async getAttendanceReport() {
    const res = await apiClient.get('/hr/reports/attendance/list');
    return res.data.data;
  },
  async getLeaveReport() {
    const res = await apiClient.get('/hr/reports/leave/list');
    return res.data.data;
  },
  async getAnnualPayrollCostReport() {
    const res = await apiClient.get('/hr/reports/annual-payroll-cost/list');
    return res.data.data;
  },
  async getGosiReport() {
    const res = await apiClient.get('/hr/reports/gosi/list');
    return res.data.data;
  },
  async getTurnoverReport() {
    const res = await apiClient.get('/hr/reports/turnover/list');
    return res.data.data;
  },
  async getHeadcountGrowthReport() {
    const res = await apiClient.get('/hr/reports/headcount-growth/list');
    return res.data.data;
  },
  async getSalaryTrendReport() {
    const res = await apiClient.get('/hr/reports/salary-trend/list');
    return res.data.data;
  },
  async getDepartmentCostReport() {
    const res = await apiClient.get('/hr/reports/department-cost/list');
    return res.data.data;
  },
  async getLeaveBalanceReport() {
    const res = await apiClient.get('/hr/reports/leave-balance/list');
    return res.data.data;
  },
  async getPayrollVarianceReport() {
    const res = await apiClient.get('/hr/reports/payroll-variance/list');
    return res.data.data;
  },
  async getPromotionHistoryReport() {
    const res = await apiClient.get('/hr/reports/promotion-history/list');
    return res.data.data;
  },
  async getHiringReport() {
    const res = await apiClient.get('/hr/reports/hiring/list');
    return res.data.data;
  },
};

export default hrService;
