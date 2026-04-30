import apiClient from '../client/apiClient';
import { CRMContact, CRMDeal, CRMLead, CRMPipeline, CRMProject, CRMTask } from '../types';

const crmService = {
  // Contacts
  async getContacts() {
    const res = await apiClient.get('/crm/contacts/list');
    return res.data.data;
  },
  async getContactById(id: string) {
    const res = await apiClient.get(`/crm/contacts/${id}`);
    return res.data.data;
  },
  async addContact(data: Partial<CRMContact>) {
    const res = await apiClient.post('/crm/contacts/create', data);
    return res.data.data;
  },
  async updateContact(id: string, data: Partial<CRMContact>) {
    const res = await apiClient.patch(`/crm/contacts/update/${id}`, data);
    return res.data.data;
  },
  async deleteContact(id: string) {
    const res = await apiClient.delete(`/crm/contacts/delete/${id}`);
    return res.data.data;
  },

  // Deals
  async getDeals() {
    const res = await apiClient.get('/crm/deals/list');
    return res.data.data;
  },
  async getDealById(id: string) {
    const res = await apiClient.get(`/crm/deals/${id}`);
    return res.data.data;
  },
  async addDeal(data: Partial<CRMDeal>) {
    const res = await apiClient.post('/crm/deals/create', data);
    return res.data.data;
  },
  async updateDeal(id: string, data: Partial<CRMDeal>) {
    const res = await apiClient.patch(`/crm/deals/update/${id}`, data);
    return res.data.data;
  },
  async deleteDeal(id: string) {
    const res = await apiClient.delete(`/crm/deals/delete/${id}`);
    return res.data.data;
  },

  // Leads
  async getLeads() {
    const res = await apiClient.get('/crm/leads/list');
    return res.data.data;
  },
  async getLeadById(id: string) {
    const res = await apiClient.get(`/crm/leads/${id}`);
    return res.data.data;
  },
  async addLead(data: Partial<CRMLead>) {
    const res = await apiClient.post('/crm/leads/create', data);
    return res.data.data;
  },
  async updateLead(id: string, data: Partial<CRMLead>) {
    const res = await apiClient.patch(`/crm/leads/update/${id}`, data);
    return res.data.data;
  },
  async deleteLead(id: string) {
    const res = await apiClient.delete(`/crm/leads/delete/${id}`);
    return res.data.data;
  },

  // Pipeline
  async getPipelines() {
    const res = await apiClient.get('/crm/pipeline/list');
    return res.data.data;
  },
  async getPipelineById(id: string) {
    const res = await apiClient.get(`/crm/pipeline/${id}`);
    return res.data.data;
  },
  async addPipeline(data: Partial<CRMPipeline>) {
    const res = await apiClient.post('/crm/pipeline/create', data);
    return res.data.data;
  },
  async updatePipeline(id: string, data: Partial<CRMPipeline>) {
    const res = await apiClient.patch(`/crm/pipeline/update/${id}`, data);
    return res.data.data;
  },
  async deletePipeline(id: string) {
    const res = await apiClient.delete(`/crm/pipeline/delete/${id}`);
    return res.data.data;
  },

  // Projects
  async getProjects() {
    const res = await apiClient.get('/crm/projects/list');
    return res.data.data;
  },
  async getProjectById(id: string) {
    const res = await apiClient.get(`/crm/projects/${id}`);
    return res.data.data;
  },
  async addProject(data: Partial<CRMProject>) {
    const res = await apiClient.post('/crm/projects/create', data);
    return res.data.data;
  },
  async updateProject(id: string, data: Partial<CRMProject>) {
    const res = await apiClient.patch(`/crm/projects/update/${id}`, data);
    return res.data.data;
  },
  async deleteProject(id: string) {
    const res = await apiClient.delete(`/crm/projects/delete/${id}`);
    return res.data.data;
  },

  // Tasks
  async getTasks() {
    const res = await apiClient.get('/crm/tasks/list');
    return res.data.data;
  },
  async getTaskById(id: string) {
    const res = await apiClient.get(`/crm/tasks/${id}`);
    return res.data.data;
  },
  async addTask(data: Partial<CRMTask>) {
    const res = await apiClient.post('/crm/tasks/create', data);
    return res.data.data;
  },
  async updateTask(id: string, data: Partial<CRMTask>) {
    const res = await apiClient.patch(`/crm/tasks/update/${id}`, data);
    return res.data.data;
  },
  async deleteTask(id: string) {
    const res = await apiClient.delete(`/crm/tasks/delete/${id}`);
    return res.data.data;
  },
};

export default crmService;
