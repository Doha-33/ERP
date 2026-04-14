
import { useState, useCallback, useMemo } from 'react';
import hrService from '../../services/hr.service';
import { Leave, HRRequest, EndOfService, ActionHistory } from '../../types';

export const useRequestModule = (fetchAllDataCentral?: () => Promise<void>) => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [requests, setRequests] = useState<HRRequest[]>([]);
  const [endOfServices, setEndOfServices] = useState<EndOfService[]>([]);
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);

  const fetchActionHistory = useCallback(async () => {
    // In a real app, this would fetch data.
  }, []);

  // Leaves
  const addLeave = useCallback(async (leave: Leave) => {
    await hrService.addLeave(leave);
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const updateLeave = useCallback(async (updated: Leave) => {
    await hrService.updateLeave(updated.id, updated);
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const deleteLeave = useCallback(async (id: string) => {
    await hrService.deleteLeave(id);
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const toggleLeaveWorkflow = useCallback(async (id: string, role: 'hr' | 'manager') => {
    // Assuming toggle logic on backend
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const rejectLeave = useCallback(async (id: string, reason?: string) => {
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  // General Requests
  const addRequest = useCallback(async (item: HRRequest) => {
    await hrService.addRequest(item);
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const updateRequest = useCallback(async (item: HRRequest) => {
    await hrService.updateRequest(item.id, item);
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const deleteRequest = useCallback(async (id: string) => {
    await hrService.deleteRequest(id);
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const toggleRequestWorkflow = useCallback(async (id: string, role: 'hr' | 'manager') => {
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const rejectRequest = useCallback(async (id: string, reason?: string) => {
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  // End of Service
  const addEndOfService = useCallback(async (eos: EndOfService) => {
    await hrService.addEndOfService(eos);
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const updateEndOfService = useCallback(async (eos: EndOfService) => {
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const deleteEndOfService = useCallback(async (id: string) => {
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const approveEndOfService = useCallback(async (id: string) => {
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const rejectEndOfService = useCallback(async (id: string, reason?: string) => {
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const fetchRequestData = useCallback(async () => {
    try {
      const [leavesRes, requestsRes] = await Promise.all([
        hrService.getLeaves(),
        hrService.getRequests(),
      ]);
      setLeaves(leavesRes);
      setRequests(requestsRes);
    } catch (error) {
      console.error('Error fetching request data:', error);
    }
  }, []);

  return useMemo(() => ({
    leaves, setLeaves,
    requests, setRequests,
    endOfServices, setEndOfServices,
    actionHistory, setActionHistory, fetchActionHistory,
    fetchRequestData,
    addLeave, updateLeave, deleteLeave, toggleLeaveWorkflow, rejectLeave,
    addRequest, updateRequest, deleteRequest, toggleRequestWorkflow, rejectRequest,
    addEndOfService, updateEndOfService, deleteEndOfService, approveEndOfService, rejectEndOfService
  }), [
    leaves, requests, endOfServices, actionHistory, fetchActionHistory,
    addLeave, updateLeave, deleteLeave, toggleLeaveWorkflow, rejectLeave,
    addRequest, updateRequest, deleteRequest, toggleRequestWorkflow, rejectRequest,
    addEndOfService, updateEndOfService, deleteEndOfService, approveEndOfService, rejectEndOfService
  ]);
};
