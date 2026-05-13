
import { useState, useCallback, useMemo } from 'react';
import hrService from '../../services/hr.service';
import { Leave, HRRequest, EndOfService, ActionHistory } from '../../types';

export const useRequestModule = (fetchAllDataCentral?: () => Promise<void>) => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [requests, setRequests] = useState<HRRequest[]>([]);
  const [endOfServices, setEndOfServices] = useState<EndOfService[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);

  // Leaves
  const fetchLeaves = useCallback(async () => {
    try {
      const data = await hrService.getLeaves();
      setLeaves(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching Leaves:", error);
    }
  }, []);

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
  const fetchRequests = useCallback(async () => {
    try {
      const data = await hrService.getRequests();
      setRequests(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching Requests:", error);
    }
  }, []);

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
  const fetchEndOfServices= useCallback(async () => {
    try {
      const data = await hrService.getEndOfServices();
      setEndOfServices(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching End Of Services:", error);
    }
  }, []);

  const addEndOfService = useCallback(async (eos: EndOfService) => {
    await hrService.addEndOfService(eos);
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const updateEndOfService = useCallback(async (eos: EndOfService) => {
    await hrService.updateEndOfService(eos.id, eos);
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const deleteEndOfService = useCallback(async (id: string) => {
    await hrService.deleteEndOfService(id);
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const approveEndOfService = useCallback(async (id: string) => {
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const rejectEndOfService = useCallback(async (id: string, reason?: string) => {
    if (fetchAllDataCentral) await fetchAllDataCentral();
  }, [fetchAllDataCentral]);

  const fetchResponses = useCallback(async (type: string) => {
    try {
      const data = await hrService.getResponses(type);
      setResponses(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching responses:', error);
      return [];
    }
  }, []);

  const fetchActionHistory = useCallback(async () => {
    try {
      // Assuming hrService has a method or just using responses as history
      const data = await hrService.getResponses('history');
      setActionHistory(data || []);
    } catch (error) {
      console.error('Error fetching action history:', error);
    }
  }, []);

  const fetchRequestData = useCallback(async () => {
    try {
      const [leavesRes, requestsRes, eosRes] = await Promise.all([
        hrService.getLeaves(),
        hrService.getRequests(),
        hrService.getEndOfServices(),
      ]);
      setLeaves(Array.isArray(leavesRes) ? leavesRes : (leavesRes?.data || []));
      setRequests(Array.isArray(requestsRes) ? requestsRes : (requestsRes?.data || []));
      setEndOfServices(Array.isArray(eosRes) ? eosRes : (eosRes?.data || []));
    } catch (error) {
      console.error('Error fetching request data:', error);
    }
  }, []);

  return useMemo(() => ({
    leaves, setLeaves,
    requests, setRequests,
    endOfServices, setEndOfServices,
    responses, setResponses, fetchResponses,
    actionHistory, setActionHistory, fetchActionHistory,
    fetchRequestData,
    addLeave, updateLeave, deleteLeave, toggleLeaveWorkflow, rejectLeave, fetchLeaves,
    addRequest, updateRequest, deleteRequest, fetchRequests, toggleRequestWorkflow, rejectRequest,
    addEndOfService, updateEndOfService, deleteEndOfService, fetchEndOfServices, approveEndOfService, rejectEndOfService
  }), [
    leaves, requests, endOfServices, responses, fetchResponses, actionHistory, fetchActionHistory,
    addLeave, updateLeave, deleteLeave, toggleLeaveWorkflow, rejectLeave, fetchLeaves,
    addRequest, updateRequest, deleteRequest, fetchRequests, toggleRequestWorkflow, rejectRequest,
    addEndOfService, updateEndOfService, deleteEndOfService, fetchEndOfServices, approveEndOfService, rejectEndOfService
  ]);
};
