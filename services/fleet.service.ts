import api from './api';
import { Vehicle, Driver, Trip, Maintenance, FuelLog, FleetAccident, VehicleExpense, VehicleBooking, CostCenter } from '../types';

export const fleetService = {
  // Vehicles
  getVehicles: async () => {
    const response = await api.get<{ success: boolean; data: Vehicle[] }>('/fleet/vehicles/list');
    return response.data.data;
  },
  getVehicleById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Vehicle }>(`/fleet/vehicles/${id}`);
    return response.data.data;
  },
  createVehicle: async (data: Partial<Vehicle>) => {
    const response = await api.post<{ success: boolean; data: Vehicle }>('/fleet/vehicles/create', data);
    return response.data.data;
  },
  updateVehicle: async (id: string, data: Partial<Vehicle>) => {
    const response = await api.patch<{ success: boolean; data: Vehicle }>(`/fleet/vehicles/update/${id}`, data);
    return response.data.data;
  },
  deleteVehicle: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/fleet/vehicles/delete/${id}`);
    return response.data.success;
  },

  // Drivers
  getDrivers: async () => {
    const response = await api.get<{ success: boolean; data: Driver[] }>('/fleet/drivers/list');
    return response.data.data;
  },
  getDriverById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Driver }>(`/fleet/drivers/${id}`);
    return response.data.data;
  },
  createDriver: async (data: Partial<Driver>) => {
    const response = await api.post<{ success: boolean; data: Driver }>('/fleet/drivers/create', data);
    return response.data.data;
  },
  updateDriver: async (id: string, data: Partial<Driver>) => {
    const response = await api.patch<{ success: boolean; data: Driver }>(`/fleet/drivers/update/${id}`, data);
    return response.data.data;
  },
  deleteDriver: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/fleet/drivers/delete/${id}`);
    return response.data.success;
  },

  // Trips
  getTrips: async () => {
    const response = await api.get<{ success: boolean; data: Trip[] }>('/fleet/trips/list');
    return response.data.data;
  },
  getTripById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Trip }>(`/fleet/trips/${id}`);
    return response.data.data;
  },
  createTrip: async (data: Partial<Trip>) => {
    const response = await api.post<{ success: boolean; data: Trip }>('/fleet/trips/create', data);
    return response.data.data;
  },
  updateTrip: async (id: string, data: Partial<Trip>) => {
    const response = await api.patch<{ success: boolean; data: Trip }>(`/fleet/trips/update/${id}`, data);
    return response.data.data;
  },
  deleteTrip: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/fleet/trips/delete/${id}`);
    return response.data.success;
  },

  // Maintenance
  getMaintenance: async () => {
    const response = await api.get<{ success: boolean; data: Maintenance[] }>('/fleet/maintenance/list');
    return response.data.data;
  },
  getMaintenanceById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Maintenance }>(`/fleet/maintenance/${id}`);
    return response.data.data;
  },
  createMaintenance: async (data: Partial<Maintenance>) => {
    const response = await api.post<{ success: boolean; data: Maintenance }>('/fleet/maintenance/create', data);
    return response.data.data;
  },
  updateMaintenance: async (id: string, data: Partial<Maintenance>) => {
    const response = await api.patch<{ success: boolean; data: Maintenance }>(`/fleet/maintenance/update/${id}`, data);
    return response.data.data;
  },
  deleteMaintenance: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/fleet/maintenance/delete/${id}`);
    return response.data.success;
  },

  // Fuel Logs
  getFuelLogs: async () => {
    const response = await api.get<{ success: boolean; data: FuelLog[] }>('/fleet/fuel-logs/list');
    return response.data.data;
  },
  getFuelLogById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: FuelLog }>(`/fleet/fuel-logs/${id}`);
    return response.data.data;
  },
  createFuelLog: async (data: Partial<FuelLog>) => {
    const response = await api.post<{ success: boolean; data: FuelLog }>('/fleet/fuel-logs/create', data);
    return response.data.data;
  },
  updateFuelLog: async (id: string, data: Partial<FuelLog>) => {
    const response = await api.patch<{ success: boolean; data: FuelLog }>(`/fleet/fuel-logs/update/${id}`, data);
    return response.data.data;
  },
  deleteFuelLog: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/fleet/fuel-logs/delete/${id}`);
    return response.data.success;
  },

  // Accidents
  getAccidents: async () => {
    const response = await api.get<{ success: boolean; data: FleetAccident[] }>('/fleet/accidents/list');
    return response.data.data;
  },
  getAccidentById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: FleetAccident }>(`/fleet/accidents/${id}`);
    return response.data.data;
  },
  createAccident: async (data: Partial<FleetAccident>) => {
    const response = await api.post<{ success: boolean; data: FleetAccident }>('/fleet/accidents/create', data);
    return response.data.data;
  },
  updateAccident: async (id: string, data: Partial<FleetAccident>) => {
    const response = await api.patch<{ success: boolean; data: FleetAccident }>(`/fleet/accidents/update/${id}`, data);
    return response.data.data;
  },
  deleteAccident: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/fleet/accidents/delete/${id}`);
    return response.data.success;
  },

  // Vehicle Expenses
  getExpenses: async () => {
    const response = await api.get<{ success: boolean; data: VehicleExpense[] }>('/fleet/vehicle-expenses/list');
    return response.data.data;
  },
  getExpenseById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: VehicleExpense }>(`/fleet/vehicle-expenses/${id}`);
    return response.data.data;
  },
  createExpense: async (data: Partial<VehicleExpense>) => {
    const response = await api.post<{ success: boolean; data: VehicleExpense }>('/fleet/vehicle-expenses/create', data);
    return response.data.data;
  },
  updateExpense: async (id: string, data: Partial<VehicleExpense>) => {
    const response = await api.patch<{ success: boolean; data: VehicleExpense }>(`/fleet/vehicle-expenses/update/${id}`, data);
    return response.data.data;
  },
  deleteExpense: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/fleet/vehicle-expenses/delete/${id}`);
    return response.data.success;
  },

  // Bookings
  getBookings: async () => {
    const response = await api.get<{ success: boolean; data: VehicleBooking[] }>('/fleet/bookings/list');
    return response.data.data;
  },
  getBookingById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: VehicleBooking }>(`/fleet/bookings/${id}`);
    return response.data.data;
  },
  createBooking: async (data: Partial<VehicleBooking>) => {
    const response = await api.post<{ success: boolean; data: VehicleBooking }>('/fleet/bookings/create', data);
    return response.data.data;
  },
  updateBooking: async (id: string, data: Partial<VehicleBooking>) => {
    const response = await api.patch<{ success: boolean; data: VehicleBooking }>(`/fleet/bookings/update/${id}`, data);
    return response.data.data;
  },
  deleteBooking: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/fleet/bookings/delete/${id}`);
    return response.data.success;
  },

  // Cost Centers
  getCostCenters: async () => {
    const response = await api.get<{ success: boolean; data: CostCenter[] }>('/fleet/cost-centers/list');
    return response.data.data;
  },
  getCostCenterById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: CostCenter }>(`/fleet/cost-centers/${id}`);
    return response.data.data;
  },
  createCostCenter: async (data: Partial<CostCenter>) => {
    const response = await api.post<{ success: boolean; data: CostCenter }>('/fleet/cost-centers/create', data);
    return response.data.data;
  },
  updateCostCenter: async (id: string, data: Partial<CostCenter>) => {
    const response = await api.patch<{ success: boolean; data: CostCenter }>(`/fleet/cost-centers/update/${id}`, data);
    return response.data.data;
  },
  deleteCostCenter: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/fleet/cost-centers/delete/${id}`);
    return response.data.success;
  },

  // KPI & Dashboard
  getKPIs: async () => {
    const response = await api.get<{ success: boolean; data: any }>('/fleet/kpis');
    return response.data.data;
  },
  getDashboardStats: async (period: string = 'this_month') => {
    const response = await api.get<{ success: boolean; data: any }>(`/fleet/dashboard?period=${period}`);
    return response.data.data;
  },
};
