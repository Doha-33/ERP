import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CRMContact, CRMDeal, CRMLead, CRMPipeline, CRMProject, CRMTask } from '../../types';
import crmService from '../../services/crm.service';

interface CRMContextType {
  contacts: CRMContact[];
  deals: CRMDeal[];
  leads: CRMLead[];
  pipelines: CRMPipeline[];
  projects: CRMProject[];
  tasks: CRMTask[];
  loading: boolean;
  refreshContacts: () => Promise<void>;
  refreshDeals: () => Promise<void>;
  refreshLeads: () => Promise<void>;
  refreshPipelines: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  addContact: (data: Partial<CRMContact>) => Promise<void>;
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
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [pipelines, setPipelines] = useState<CRMPipeline[]>([]);
  const [projects, setProjects] = useState<CRMProject[]>([]);
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshContacts = useCallback(async () => {
    try {
      const data = await crmService.getContacts();
      setContacts(data);
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

  useEffect(() => {
    setLoading(true);
    Promise.all([
      refreshContacts(),
      refreshDeals(),
      refreshLeads(),
      refreshPipelines(),
      refreshProjects(),
      refreshTasks()
    ]).finally(() => setLoading(false));
  }, [refreshContacts, refreshDeals, refreshLeads, refreshPipelines, refreshProjects, refreshTasks]);

  const addContact = async (data: Partial<CRMContact>) => {
    await crmService.addContact(data);
    await refreshContacts();
  };

  const updateContact = async (id: string, data: Partial<CRMContact>) => {
    await crmService.updateContact(id, data);
    await refreshContacts();
  };

  const deleteContact = async (id: string) => {
    await crmService.deleteContact(id);
    await refreshContacts();
  };

  const addDeal = async (data: Partial<CRMDeal>) => {
    await crmService.addDeal(data);
    await refreshDeals();
  };

  const updateDeal = async (id: string, data: Partial<CRMDeal>) => {
    await crmService.updateDeal(id, data);
    await refreshDeals();
  };

  const deleteDeal = async (id: string) => {
    await crmService.deleteDeal(id);
    await refreshDeals();
  };

  const addLead = async (data: Partial<CRMLead>) => {
    await crmService.addLead(data);
    await refreshLeads();
  };

  const updateLead = async (id: string, data: Partial<CRMLead>) => {
    await crmService.updateLead(id, data);
    await refreshLeads();
  };

  const deleteLead = async (id: string) => {
    await crmService.deleteLead(id);
    await refreshLeads();
  };

  const addPipeline = async (data: Partial<CRMPipeline>) => {
    await crmService.addPipeline(data);
    await refreshPipelines();
  };

  const updatePipeline = async (id: string, data: Partial<CRMPipeline>) => {
    await crmService.updatePipeline(id, data);
    await refreshPipelines();
  };

  const deletePipeline = async (id: string) => {
    await crmService.deletePipeline(id);
    await refreshPipelines();
  };

  const addProject = async (data: Partial<CRMProject>) => {
    await crmService.addProject(data);
    await refreshProjects();
  };

  const updateProject = async (id: string, data: Partial<CRMProject>) => {
    await crmService.updateProject(id, data);
    await refreshProjects();
  };

  const deleteProject = async (id: string) => {
    await crmService.deleteProject(id);
    await refreshProjects();
  };

  const addTask = async (data: Partial<CRMTask>) => {
    await crmService.addTask(data);
    await refreshTasks();
  };

  const updateTask = async (id: string, data: Partial<CRMTask>) => {
    await crmService.updateTask(id, data);
    await refreshTasks();
  };

  const deleteTask = async (id: string) => {
    await crmService.deleteTask(id);
    await refreshTasks();
  };

  return (
    <CRMContext.Provider value={{
      contacts, deals, leads, pipelines, projects, tasks, loading,
      refreshContacts, refreshDeals, refreshLeads, refreshPipelines, refreshProjects, refreshTasks,
      addContact, updateContact, deleteContact,
      addDeal, updateDeal, deleteDeal,
      addLead, updateLead, deleteLead,
      addPipeline, updatePipeline, deletePipeline,
      addProject, updateProject, deleteProject,
      addTask, updateTask, deleteTask
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
