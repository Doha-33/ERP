import apiClient from '../client/apiClient';

const hrService = {
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
  }
};

export default hrService;
