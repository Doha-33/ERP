import { useState, useCallback, useMemo } from 'react';
import hrService from '../../services/hr.service';
import { Insurance, AssignLaptop, AccessCard, InitialTraining, Penalty, Reward } from '../../types';

export const useOnboardingModule = (fetchAllData?: () => Promise<void>) => {
  const [insurancePolicies, setInsurancePolicies] = useState<Insurance[]>([]);
  const [assignLaptops, setAssignLaptops] = useState<AssignLaptop[]>([]);
  const [accessCards, setAccessCards] = useState<AccessCard[]>([]);
  const [initialTrainings, setInitialTrainings] = useState<InitialTraining[]>([]);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  const addInsurance = useCallback(async (insurance: Insurance) => {
    try {
      await hrService.addInsurance(insurance);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to add insurance:', error);
    }
  }, [fetchAllData]);

  const updateInsurance = useCallback(async (updatedInsurance: Insurance) => {
    try {
      await hrService.updateInsurance(updatedInsurance.id, updatedInsurance);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to update insurance:', error);
    }
  }, [fetchAllData]);

  const deleteInsurance = useCallback(async (id: string) => {
    try {
      await hrService.deleteInsurance(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to delete insurance:', error);
    }
  }, [fetchAllData]);

  const addAssignLaptop = useCallback(async (laptop: AssignLaptop) => {
    try {
      await hrService.addAssignLaptop(laptop);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to assign laptop:', error);
    }
  }, [fetchAllData]);

  const updateAssignLaptop = useCallback(async (updatedLaptop: AssignLaptop) => {
    try {
      await hrService.updateAssignLaptop(updatedLaptop.id, updatedLaptop);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to update assignment:', error);
    }
  }, [fetchAllData]);

  const deleteAssignLaptop = useCallback(async (id: string) => {
    try {
      await hrService.deleteAssignLaptop(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
  }, [fetchAllData]);

  const addAccessCard = useCallback(async (card: AccessCard) => {
    try {
      await hrService.addAccessCard(card);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to add access card:', error);
    }
  }, [fetchAllData]);

  const updateAccessCard = useCallback(async (updatedCard: AccessCard) => {
    try {
      await hrService.updateAccessCard(updatedCard.id, updatedCard);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to update access card:', error);
    }
  }, [fetchAllData]);

  const deleteAccessCard = useCallback(async (id: string) => {
    try {
      await hrService.deleteAccessCard(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to delete access card:', error);
    }
  }, [fetchAllData]);

  const addInitialTraining = useCallback(async (training: InitialTraining) => {
    try {
      await hrService.addInitialTraining(training);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to add initial training:', error);
    }
  }, [fetchAllData]);

  const updateInitialTraining = useCallback(async (updatedTraining: InitialTraining) => {
    try {
      await hrService.updateInitialTraining(updatedTraining.id, updatedTraining);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to update initial training:', error);
    }
  }, [fetchAllData]);

  const deleteInitialTraining = useCallback(async (id: string) => {
    try {
      await hrService.deleteInitialTraining(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to delete initial training:', error);
    }
  }, [fetchAllData]);

  const addPenalty = useCallback(async (penalty: Penalty) => {
    try {
      await hrService.addPenalty(penalty);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to add penalty:', error);
    }
  }, [fetchAllData]);

  const updatePenalty = useCallback(async (updatedPenalty: Penalty) => {
    try {
      await hrService.updatePenalty(updatedPenalty.id, updatedPenalty);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to update penalty:', error);
    }
  }, [fetchAllData]);

  const deletePenalty = useCallback(async (id: string) => {
    try {
      await hrService.deletePenalty(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to delete penalty:', error);
    }
  }, [fetchAllData]);

  const addReward = useCallback(async (reward: Reward) => {
    try {
      await hrService.addReward(reward);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to add reward:', error);
    }
  }, [fetchAllData]);

  const updateReward = useCallback(async (updatedReward: Reward) => {
    try {
      await hrService.updateReward(updatedReward.id, updatedReward);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to update reward:', error);
    }
  }, [fetchAllData]);

  const deleteReward = useCallback(async (id: string) => {
    try {
      await hrService.deleteReward(id);
      if (fetchAllData) await fetchAllData();
    } catch (error) {
      console.error('Failed to delete reward:', error);
    }
  }, [fetchAllData]);

  return useMemo(() => ({
    insurancePolicies, setInsurancePolicies,
    assignLaptops, setAssignLaptops,
    accessCards, setAccessCards,
    initialTrainings, setInitialTrainings,
    penalties, setPenalties,
    rewards, setRewards,
    addInsurance, updateInsurance, deleteInsurance,
    addAssignLaptop, updateAssignLaptop, deleteAssignLaptop,
    addAccessCard, updateAccessCard, deleteAccessCard,
    addInitialTraining, updateInitialTraining, deleteInitialTraining,
    addPenalty, updatePenalty, deletePenalty,
    addReward, updateReward, deleteReward
  }), [
    insurancePolicies, assignLaptops, accessCards, initialTrainings, penalties, rewards,
    addInsurance, updateInsurance, deleteInsurance,
    addAssignLaptop, updateAssignLaptop, deleteAssignLaptop,
    addAccessCard, updateAccessCard, deleteAccessCard,
    addInitialTraining, updateInitialTraining, deleteInitialTraining,
    addPenalty, updatePenalty, deletePenalty,
    addReward, updateReward, deleteReward
  ]);
};