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
  addJob(data: any): Promise<any>;
  updateJob(id: string, data: any): Promise<any>;
  deleteJob(id: string): Promise<any>;
  getEmployees(): Promise<any>;
  addEmployee(data: any): Promise<any>;
  updateEmployee(id: string, data: any): Promise<any>;
  deleteEmployee(id: string): Promise<any>;
  getAttendance(): Promise<any>;
  addAttendance(data: any): Promise<any>;
  updateAttendance(id: string, data: any): Promise<any>;
  deleteAttendance(id: string): Promise<any>;
  getPayrolls(): Promise<any>;
  addPayroll(data: any): Promise<any>;
  updatePayroll(id: string, data: any): Promise<any>;
  deletePayroll(id: string): Promise<any>;
  getPayrollLogs(): Promise<any>;
  addPayrollLog(data: any): Promise<any>;
  generatePayroll(data: any): Promise<any>;
  addLoan(data: any): Promise<any>;
  updateLoan(id: string, data: any): Promise<any>;
  deleteLoan(id: string): Promise<any>;
  addInsurance(data: any): Promise<any>;
  updateInsurance(id: string, data: any): Promise<any>;
  deleteInsurance(id: string): Promise<any>;
  addAssignLaptop(data: any): Promise<any>;
  updateAssignLaptop(id: string, data: any): Promise<any>;
  deleteAssignLaptop(id: string): Promise<any>;
  addAccessCard(data: any): Promise<any>;
  updateAccessCard(id: string, data: any): Promise<any>;
  deleteAccessCard(id: string): Promise<any>;
  addInitialTraining(data: any): Promise<any>;
  updateInitialTraining(id: string, data: any): Promise<any>;
  deleteInitialTraining(id: string): Promise<any>;
  addPenalty(data: any): Promise<any>;
  updatePenalty(id: string, data: any): Promise<any>;
  deletePenalty(id: string): Promise<any>;
  addReward(data: any): Promise<any>;
  updateReward(id: string, data: any): Promise<any>;
  deleteReward(id: string): Promise<any>;
  getPerformance(): Promise<any>;
  addPerformance(data: any): Promise<any>;
  getCareerHistory(): Promise<any>;
  addCareerHistory(data: any): Promise<any>;
  getLeaves(): Promise<any>;
  addLeave(data: any): Promise<any>;
  updateLeave(id: string, data: any): Promise<any>;
  deleteLeave(id: string): Promise<any>;
  getRequests(): Promise<any>;
  addRequest(data: any): Promise<any>;
  updateRequest(id: string, data: any): Promise<any>;
  deleteRequest(id: string): Promise<any>;
  addEndOfService(data: any): Promise<any>;
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
}

const hrService: HRService = {
  // Users
  async getUsers() {
    const res = await apiClient.get('/users');
    return res.data.data;
  },
  async addUser(data: any) {
    const res = await apiClient.post('/auth/register', data);
    return res.data.data;
  },
  async updateUser(id: string, data: any) {
    const res = await apiClient.put(`/users/${id}`, data);
    return res.data.data;
  },
  async deleteUser(id: string) {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
  async toggleUserStatus(id: string) {
    const res = await apiClient.post(`/users/${id}/toggle-status`);
    return res.data;
  },

  // Companies
  async getCompanies() {
    const res = await apiClient.get('/companies');
    return res.data.data;
  },
  async addCompany(data: any) {
    const res = await apiClient.post('/companies', data);
    return res.data.data;
  },
  async updateCompany(id: string, data: any) {
    const res = await apiClient.put(`/companies/${id}`, data);
    return res.data.data;
  },
  async deleteCompany(id: string) {
    const res = await apiClient.delete(`/companies/${id}`);
    return res.data;
  },

  // Branches
  async getBranches() {
    const res = await apiClient.get('/branches');
    return res.data.data;
  },
  async addBranch(data: any) {
    const res = await apiClient.post('/branches', data);
    return res.data.data;
  },
  async updateBranch(id: string, data: any) {
    const res = await apiClient.put(`/branches/${id}`, data);
    return res.data.data;
  },
  async deleteBranch(id: string) {
    const res = await apiClient.delete(`/branches/${id}`);
    return res.data;
  },

  // Departments
  async getDepartments() {
    const res = await apiClient.get('/departments');
    return res.data.data;
  },
  async addDepartment(data: any) {
    const res = await apiClient.post('/departments', data);
    return res.data.data;
  },
  async updateDepartment(id: string, data: any) {
    const res = await apiClient.put(`/departments/${id}`, data);
    return res.data.data;
  },
  async deleteDepartment(id: string) {
    const res = await apiClient.delete(`/departments/${id}`);
    return res.data;
  },

  // Jobs
  async getJobs() {
    const res = await apiClient.get('/jobs');
    return res.data.data;
  },
  async addJob(data: any) {
    const res = await apiClient.post('/jobs', data);
    return res.data.data;
  },
  async updateJob(id: string, data: any) {
    const res = await apiClient.put(`/jobs/${id}`, data);
    return res.data.data;
  },
  async deleteJob(id: string) {
    const res = await apiClient.delete(`/jobs/${id}`);
    return res.data;
  },

  // Employees
  async getEmployees() {
    const res = await apiClient.get('/employees');
    return res.data.data;
  },
  async addEmployee(data: any) {
    const res = await apiClient.post('/employees', data);
    return res.data.data;
  },
  async updateEmployee(id: string, data: any) {
    const res = await apiClient.put(`/employees/${id}`, data);
    return res.data.data;
  },
  async deleteEmployee(id: string) {
    const res = await apiClient.delete(`/employees/${id}`);
    return res.data;
  },

  // Attendance
  async getAttendance() {
    const res = await apiClient.get('/attendance');
    return res.data.data;
  },
  async addAttendance(data: any) {
    const res = await apiClient.post('/attendance', data);
    return res.data.data;
  },
  async updateAttendance(id: string, data: any) {
    const res = await apiClient.put(`/attendance/${id}`, data);
    return res.data.data;
  },
  async deleteAttendance(id: string) {
    const res = await apiClient.delete(`/attendance/${id}`);
    return res.data;
  },

  // Finance
  async getPayrolls() {
    const res = await apiClient.get('/payrolls');
    return res.data.data;
  },
  async addPayroll(data: any) {
    const res = await apiClient.post('/payrolls', data);
    return res.data.data;
  },
  async updatePayroll(id: string, data: any) {
    const res = await apiClient.put(`/payrolls/${id}`, data);
    return res.data.data;
  },
  async deletePayroll(id: string) {
    const res = await apiClient.delete(`/payrolls/${id}`);
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
    const res = await apiClient.post('/loans', data);
    return res.data.data;
  },
  async updateLoan(id: string, data: any) {
    const res = await apiClient.put(`/loans/${id}`, data);
    return res.data.data;
  },
  async deleteLoan(id: string) {
    const res = await apiClient.delete(`/loans/${id}`);
    return res.data;
  },

  // Onboarding & Insurance
  async addInsurance(data: any) {
    const res = await apiClient.post('/insurance', data);
    return res.data.data;
  },
  async updateInsurance(id: string, data: any) {
    const res = await apiClient.put(`/insurance/${id}`, data);
    return res.data.data;
  },
  async deleteInsurance(id: string) {
    const res = await apiClient.delete(`/insurance/${id}`);
    return res.data;
  },
  async addAssignLaptop(data: any) {
    const res = await apiClient.post('/laptop-assignments', data);
    return res.data.data;
  },
  async updateAssignLaptop(id: string, data: any) {
    const res = await apiClient.put(`/laptop-assignments/${id}`, data);
    return res.data.data;
  },
  async deleteAssignLaptop(id: string) {
    const res = await apiClient.delete(`/laptop-assignments/${id}`);
    return res.data;
  },
  async addAccessCard(data: any) {
    const res = await apiClient.post('/access-cards', data);
    return res.data.data;
  },
  async updateAccessCard(id: string, data: any) {
    const res = await apiClient.put(`/access-cards/${id}`, data);
    return res.data.data;
  },
  async deleteAccessCard(id: string) {
    const res = await apiClient.delete(`/access-cards/${id}`);
    return res.data;
  },
  async addInitialTraining(data: any) {
    const res = await apiClient.post('/trainings', data);
    return res.data.data;
  },
  async updateInitialTraining(id: string, data: any) {
    const res = await apiClient.put(`/trainings/${id}`, data);
    return res.data.data;
  },
  async deleteInitialTraining(id: string) {
    const res = await apiClient.delete(`/trainings/${id}`);
    return res.data;
  },
  async addPenalty(data: any) {
    const res = await apiClient.post('/penalties', data);
    return res.data.data;
  },
  async updatePenalty(id: string, data: any) {
    const res = await apiClient.put(`/penalties/${id}`, data);
    return res.data.data;
  },
  async deletePenalty(id: string) {
    const res = await apiClient.delete(`/penalties/${id}`);
    return res.data;
  },
  async addReward(data: any) {
    const res = await apiClient.post('/rewards', data);
    return res.data.data;
  },
  async updateReward(id: string, data: any) {
    const res = await apiClient.put(`/rewards/${id}`, data);
    return res.data.data;
  },
  async deleteReward(id: string) {
    const res = await apiClient.delete(`/rewards/${id}`);
    return res.data;
  },

  // Performance & Career
  async getPerformance() {
    const res = await apiClient.get('/hr/performance/list');
    return res.data.data;
  },
  async addPerformance(data: any) {
    const res = await apiClient.post('/hr/performance/create', data);
    return res.data.data;
  },
  async getCareerHistory() {
    const res = await apiClient.get('/hr/careerHistory/list');
    return res.data.data;
  },
  async addCareerHistory(data: any) {
    const res = await apiClient.post('/hr/careerHistory/create', data);
    return res.data.data;
  },

  // Requests
  async getLeaves() {
    const res = await apiClient.get('/leaves');
    return res.data.data;
  },
  async addLeave(data: any) {
    const res = await apiClient.post('/leaves', data);
    return res.data.data;
  },
  async updateLeave(id: string, data: any) {
    const res = await apiClient.put(`/leaves/${id}`, data);
    return res.data.data;
  },
  async deleteLeave(id: string) {
    const res = await apiClient.delete(`/leaves/${id}`);
    return res.data;
  },
  async getRequests() {
    const res = await apiClient.get('/hr-requests');
    return res.data.data;
  },
  async addRequest(data: any) {
    const res = await apiClient.post('/hr-requests', data);
    return res.data.data;
  },
  async updateRequest(id: string, data: any) {
    const res = await apiClient.put(`/hr-requests/${id}`, data);
    return res.data.data;
  },
  async deleteRequest(id: string) {
    const res = await apiClient.delete(`/hr-requests/${id}`);
    return res.data;
  },
  async addEndOfService(data: any) {
    const res = await apiClient.post('/end-of-service', data);
    return res.data.data;
  },

  // Reports
  async getOvertimeReport() {
    const res = await apiClient.get('/hr/reports/overtime-report');
    return res.data.data;
  },
  async getPerformanceReport(period?: string) {
    const res = await apiClient.get('/hr/reports/performance-report', { params: { period } });
    return res.data.data;
  },
  async getContractsExpiryReport(days: number = 60) {
    const res = await apiClient.get('/hr/reports/contracts-expiry', { params: { days } });
    return res.data.data;
  },
  async getDocumentsExpiryReport() {
    const res = await apiClient.get('/hr/reports/documents-expiry');
    return res.data.data;
  },
  async getEmployeeSummaryReport() {
    const res = await apiClient.get('/hr/reports/employee-summary');
    return res.data.data;
  },
  async getMonthlyPayrollReport() {
    const res = await apiClient.get('/hr/reports/monthly-payroll');
    return res.data.data;
  },
  async getAttendanceReport() {
    const res = await apiClient.get('/hr/reports/attendance');
    return res.data.data;
  },
  async getLeaveReport() {
    const res = await apiClient.get('/hr/reports/leave');
    return res.data.data;
  },
  async getAnnualPayrollCostReport() {
    const res = await apiClient.get('/hr/reports/annual-payroll-cost');
    return res.data.data;
  },
  async getGosiReport() {
    const res = await apiClient.get('/hr/reports/gosi');
    return res.data.data;
  },
  async getTurnoverReport() {
    const res = await apiClient.get('/hr/reports/turnover');
    return res.data.data;
  },
  async getHeadcountGrowthReport() {
    const res = await apiClient.get('/hr/reports/headcount-growth');
    return res.data.data;
  },
  async getSalaryTrendReport() {
    const res = await apiClient.get('/hr/reports/salary-trend');
    return res.data.data;
  },
  async getDepartmentCostReport() {
    const res = await apiClient.get('/hr/reports/department-cost');
    return res.data.data;
  },
  async getLeaveBalanceReport() {
    const res = await apiClient.get('/hr/reports/leave-balance');
    return res.data.data;
  },
  async getPayrollVarianceReport() {
    const res = await apiClient.get('/hr/reports/payroll-variance');
    return res.data.data;
  },
  async getPromotionHistoryReport() {
    const res = await apiClient.get('/hr/reports/promotion-history');
    return res.data.data;
  },
  async getHiringReport() {
    const res = await apiClient.get('/hr/reports/hiring');
    return res.data.data;
  }
};

export default hrService;
