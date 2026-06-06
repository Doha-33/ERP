import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CRMContact, CRMDeal, CRMLead, CRMPipeline, CRMProject, CRMTask, CRMGroup, CRMPricelist } from '../../types';
import crmService from '../../services/crm.service';

interface CRMContextType {
  contacts: CRMContact[];
  deals: CRMDeal[];
  leads: CRMLead[];
  pipelines: CRMPipeline[];
  projects: CRMProject[];
  tasks: CRMTask[];
  groups: CRMGroup[];
  pricelists: CRMPricelist[];
  loading: boolean;
  refreshContacts: () => Promise<void>;
  refreshDeals: () => Promise<void>;
  refreshLeads: () => Promise<void>;
  refreshPipelines: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshGroups: () => Promise<void>;
  refreshPricelists: () => Promise<void>;
  addContact: (data: Partial<CRMContact>) => Promise<void>;
  fetchContacts: () => Promise<void>;
  updateContact: (id: string, data: Partial<CRMContact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  addDeal: (data: Partial<CRMDeal>) => Promise<void>;
  updateDeal: (id: string, data: Partial<CRMDeal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  addLead: (data: Partial<CRMLead>) => Promise<void>;
  updateLead: (id: string, data: Partial<CRMLead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addPipeline: (data: Partial<CRMPipeline>) => Promise<void>;
  updatePipeline: (id: string, data: Partial<CRMPipeline>) => Promise<void>;
  deletePipeline: (id: string) => Promise<void>;
  addProject: (data: Partial<CRMProject>) => Promise<void>;
  updateProject: (id: string, data: Partial<CRMProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (data: Partial<CRMTask>) => Promise<void>;
  updateTask: (id: string, data: Partial<CRMTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addGroup: (data: Partial<CRMGroup>) => Promise<void>;
  updateGroup: (id: string, data: Partial<CRMGroup>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addPricelist: (data: Partial<CRMPricelist>) => Promise<void>;
  updatePricelist: (id: string, data: Partial<CRMPricelist>) => Promise<void>;
  deletePricelist: (id: string) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [pipelines, setPipelines] = useState<CRMPipeline[]>([]);
  const [projects, setProjects] = useState<CRMProject[]>([]);
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [groups, setGroups] = useState<CRMGroup[]>([]);
  const [pricelists, setPricelists] = useState<CRMPricelist[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshContacts = useCallback(async () => {
    try {
      const firstRes = await crmService.getContactsFull({ page: 1, limit: 100 });
      const firstPageData = firstRes?.data || [];
      const pagination = firstRes?.pagination;
      
      if (pagination && pagination.pages > 1) {
        const totalPages = pagination.pages;
        const promises = [];
        for (let p = 2; p <= totalPages; p++) {
          promises.push(crmService.getContactsFull({ page: p, limit: 100 }));
        }
        const responses = await Promise.all(promises);
        let allContacts = [...firstPageData];
        responses.forEach(res => {
          if (res?.data) {
            allContacts = [...allContacts, ...res.data];
          }
        });
        setContacts(allContacts);
      } else {
        setContacts(firstPageData);
      }
    } catch (error) {
      console.error('Failed to fetch CRM contacts:', error);
    }
  }, []);

  const refreshDeals = useCallback(async () => {
    try {
      const data = await crmService.getDeals();
      setDeals(data);
    } catch (error) {
      console.error('Failed to fetch CRM deals:', error);
    }
  }, []);

  const refreshLeads = useCallback(async () => {
    try {
      const data = await crmService.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch CRM leads:', error);
    }
  }, []);

  const refreshPipelines = useCallback(async () => {
    try {
      const data = await crmService.getPipelines();
      setPipelines(data);
    } catch (error) {
      console.error('Failed to fetch CRM pipelines:', error);
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      const data = await crmService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch CRM projects:', error);
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    try {
      const data = await crmService.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch CRM tasks:', error);
    }
  }, []);

  const refreshGroups = useCallback(async () => {
    try {
      const data = await crmService.getGroups();
      setGroups(data || []);
    } catch (error) {
      console.error('Failed to fetch CRM groups:', error);
    }
  }, []);

  const refreshPricelists = useCallback(async () => {
    try {
      const data = await crmService.getPricelists();
      setPricelists(data || []);
    } catch (error) {
      console.error('Failed to fetch CRM pricelists:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      refreshContacts(),
      refreshDeals(),
      refreshLeads(),
      refreshPipelines(),
      refreshProjects(),
      refreshTasks(),
      refreshGroups(),
      refreshPricelists()
    ]).finally(() => setLoading(false));
  }, [refreshContacts, refreshDeals, refreshLeads, refreshPipelines, refreshProjects, refreshTasks, refreshGroups, refreshPricelists]);

  const fetchContacts = useCallback(async () => {
    await refreshContacts();
  }, [refreshContacts]);

  const addContact = useCallback(async (data: Partial<CRMContact>) => {
    await crmService.addContact(data);
    await refreshContacts();
  }, [refreshContacts]);

  const updateContact = useCallback(async (id: string, data: Partial<CRMContact>) => {
    await crmService.updateContact(id, data);
    await refreshContacts();
  }, [refreshContacts]);

  const deleteContact = useCallback(async (id: string) => {
    await crmService.deleteContact(id);
    await refreshContacts();
  }, [refreshContacts]);

  const addDeal = useCallback(async (data: Partial<CRMDeal>) => {
    await crmService.addDeal(data);
    await refreshDeals();
  }, [refreshDeals]);

  const updateDeal = useCallback(async (id: string, data: Partial<CRMDeal>) => {
    await crmService.updateDeal(id, data);
    await refreshDeals();
  }, [refreshDeals]);

  const deleteDeal = useCallback(async (id: string) => {
    await crmService.deleteDeal(id);
    await refreshDeals();
  }, [refreshDeals]);

  const addLead = useCallback(async (data: Partial<CRMLead>) => {
    await crmService.addLead(data);
    await refreshLeads();
  }, [refreshLeads]);

  const updateLead = useCallback(async (id: string, data: Partial<CRMLead>) => {
    await crmService.updateLead(id, data);
    await refreshLeads();
  }, [refreshLeads]);

  const deleteLead = useCallback(async (id: string) => {
    await crmService.deleteLead(id);
    await refreshLeads();
  }, [refreshLeads]);

  const addPipeline = useCallback(async (data: Partial<CRMPipeline>) => {
    await crmService.addPipeline(data);
    await refreshPipelines();
  }, [refreshPipelines]);

  const updatePipeline = useCallback(async (id: string, data: Partial<CRMPipeline>) => {
    await crmService.updatePipeline(id, data);
    await refreshPipelines();
  }, [refreshPipelines]);

  const deletePipeline = useCallback(async (id: string) => {
    await crmService.deletePipeline(id);
    await refreshPipelines();
  }, [refreshPipelines]);

  const addProject = useCallback(async (data: Partial<CRMProject>) => {
    await crmService.addProject(data);
    await refreshProjects();
  }, [refreshProjects]);

  const updateProject = useCallback(async (id: string, data: Partial<CRMProject>) => {
    await crmService.updateProject(id, data);
    await refreshProjects();
  }, [refreshProjects]);

  const deleteProject = useCallback(async (id: string) => {
    await crmService.deleteProject(id);
    await refreshProjects();
  }, [refreshProjects]);

  const addTask = useCallback(async (data: Partial<CRMTask>) => {
    await crmService.addTask(data);
    await refreshTasks();
  }, [refreshTasks]);

  const updateTask = useCallback(async (id: string, data: Partial<CRMTask>) => {
    await crmService.updateTask(id, data);
    await refreshTasks();
  }, [refreshTasks]);

  const deleteTask = useCallback(async (id: string) => {
    await crmService.deleteTask(id);
    await refreshTasks();
  }, [refreshTasks]);

  const addGroup = useCallback(async (data: Partial<CRMGroup>) => {
    await crmService.addGroup(data);
    await refreshGroups();
  }, [refreshGroups]);

  const updateGroup = useCallback(async (id: string, data: Partial<CRMGroup>) => {
    await crmService.updateGroup(id, data);
    await refreshGroups();
  }, [refreshGroups]);

  const deleteGroup = useCallback(async (id: string) => {
    await crmService.deleteGroup(id);
    await refreshGroups();
  }, [refreshGroups]);

  const addPricelist = useCallback(async (data: Partial<CRMPricelist>) => {
    await crmService.addPricelist(data);
    await refreshPricelists();
  }, [refreshPricelists]);

  const updatePricelist = useCallback(async (id: string, data: Partial<CRMPricelist>) => {
    await crmService.updatePricelist(id, data);
    await refreshPricelists();
  }, [refreshPricelists]);

  const deletePricelist = useCallback(async (id: string) => {
    await crmService.deletePricelist(id);
    await refreshPricelists();
  }, [refreshPricelists]);

  return (
    <CRMContext.Provider value={{
      contacts, deals, leads, pipelines, projects, tasks, groups, pricelists, loading,
      refreshContacts, refreshDeals, refreshLeads, refreshPipelines, refreshProjects, refreshTasks, refreshGroups, refreshPricelists,
      addContact, updateContact, deleteContact, fetchContacts,
      addDeal, updateDeal, deleteDeal,
      addLead, updateLead, deleteLead,
      addPipeline, updatePipeline, deletePipeline,
      addProject, updateProject, deleteProject,
      addTask, updateTask, deleteTask,
      addGroup, updateGroup, deleteGroup,
      addPricelist, updatePricelist, deletePricelist
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
