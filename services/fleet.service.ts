import apiClient from '../client/apiClient';
import { 
  Vehicle, Driver, Trip, MaintenanceRecord, FuelLog, 
  Accident, VehicleExpense, VehicleBooking, CostCenter 
} from '../types';

export const fleetService = {
  // --- Vehicles ---
  async getVehicles(): Promise<Vehicle[]> {
    const response = await apiClient.get('/fleet/vehicles/list');
    return response.data.data;
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    const response = await apiClient.get(`/fleet/vehicles/${id}`);
    return response.data.data;
  },

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await apiClient.post('/fleet/vehicles/create', data);
    return response.data.data;
  },

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await apiClient.patch(`/fleet/vehicles/update/${id}`, data);
    return response.data.data;
  },

  async deleteVehicle(id: string): Promise<void> {
    await apiClient.delete(`/fleet/vehicles/delete/${id}`);
  },

  // --- Drivers ---
  async getDrivers(): Promise<Driver[]> {
    const response = await apiClient.get('/fleet/drivers/list');
    return response.data.data;
  },

  async getDriverById(id: string): Promise<Driver> {
    const response = await apiClient.get(`/fleet/drivers/${id}`);
    return response.data.data;
  },

  async createDriver(data: Partial<Driver>): Promise<Driver> {
    const response = await apiClient.post('/fleet/drivers/create', data);
    return response.data.data;
  },

  async updateDriver(id: string, data: Partial<Driver>): Promise<Driver> {
    const response = await apiClient.patch(`/fleet/drivers/update/${id}`, data);
    return response.data.data;
  },

  async deleteDriver(id: string): Promise<void> {
    await apiClient.delete(`/fleet/drivers/delete/${id}`);
  },

  // --- Trips ---
  async getTrips(): Promise<Trip[]> {
    const response = await apiClient.get('/fleet/trips/list');
    return response.data.data;
  },

  async getTripById(id: string): Promise<Trip> {
    const response = await apiClient.get(`/fleet/trips/${id}`);
    return response.data.data;
  },

  async createTrip(data: Partial<Trip>): Promise<Trip> {
    const response = await apiClient.post('/fleet/trips/create', data);
    return response.data.data;
  },

  async updateTrip(id: string, data: Partial<Trip>): Promise<Trip> {
    const response = await apiClient.patch(`/fleet/trips/update/${id}`, data);
    return response.data.data;
  },

  async deleteTrip(id: string): Promise<void> {
    await apiClient.delete(`/fleet/trips/delete/${id}`);
  },

  // --- Maintenance ---
  async getMaintenance(): Promise<MaintenanceRecord[]> {
    const response = await apiClient.get('/fleet/maintenance/list');
    return response.data.data;
  },

  async getMaintenanceById(id: string): Promise<MaintenanceRecord> {
    const response = await apiClient.get(`/fleet/maintenance/${id}`);
    return response.data.data;
  },

  async createMaintenance(data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const response = await apiClient.post('/fleet/maintenance/create', data);
    return response.data.data;
  },

  async updateMaintenance(id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const response = await apiClient.patch(`/fleet/maintenance/update/${id}`, data);
    return response.data.data;
  },

  async deleteMaintenance(id: string): Promise<void> {
    await apiClient.delete(`/fleet/maintenance/delete/${id}`);
  },

  // --- Fuel Logs ---
  async getFuelLogs(): Promise<FuelLog[]> {
    const response = await apiClient.get('/fleet/fuel-logs/list');
    return response.data.data;
  },

  async getFuelLogById(id: string): Promise<FuelLog> {
    const response = await apiClient.get(`/fleet/fuel-logs/${id}`);
    return response.data.data;
  },

  async createFuelLog(data: Partial<FuelLog>): Promise<FuelLog> {
    const response = await apiClient.post('/fleet/fuel-logs/create', data);
    return response.data.data;
  },

  async updateFuelLog(id: string, data: Partial<FuelLog>): Promise<FuelLog> {
    const response = await apiClient.patch(`/fleet/fuel-logs/update/${id}`, data);
    return response.data.data;
  },

  async deleteFuelLog(id: string): Promise<void> {
    await apiClient.delete(`/fleet/fuel-logs/delete/${id}`);
  },

  // --- Accidents ---
  async getAccidents(): Promise<Accident[]> {
    const response = await apiClient.get('/fleet/accidents/list');
    return response.data.data;
  },

  async getAccidentById(id: string): Promise<Accident> {
    const response = await apiClient.get(`/fleet/accidents/${id}`);
    return response.data.data;
  },

  async createAccident(data: Partial<Accident>): Promise<Accident> {
    const response = await apiClient.post('/fleet/accidents/create', data);
    return response.data.data;
  },

  async updateAccident(id: string, data: Partial<Accident>): Promise<Accident> {
    const response = await apiClient.patch(`/fleet/accidents/update/${id}`, data);
    return response.data.data;
  },

  async deleteAccident(id: string): Promise<void> {
    await apiClient.delete(`/fleet/accidents/delete/${id}`);
  },

  // --- Vehicle Expenses ---
  async getExpenses(): Promise<VehicleExpense[]> {
    const response = await apiClient.get('/fleet/vehicle-expenses/list');
    return response.data.data;
  },

  async getExpenseById(id: string): Promise<VehicleExpense> {
    const response = await apiClient.get(`/fleet/vehicle-expenses/${id}`);
    return response.data.data;
  },

  async createExpense(data: Partial<VehicleExpense>): Promise<VehicleExpense> {
    const response = await apiClient.post('/fleet/vehicle-expenses/create', data);
    return response.data.data;
  },

  async updateExpense(id: string, data: Partial<VehicleExpense>): Promise<VehicleExpense> {
    const response = await apiClient.patch(`/fleet/vehicle-expenses/update/${id}`, data);
    return response.data.data;
  },

  async deleteExpense(id: string): Promise<void> {
    await apiClient.delete(`/fleet/vehicle-expenses/delete/${id}`);
  },

  // --- Bookings ---
  async getBookings(): Promise<VehicleBooking[]> {
    const response = await apiClient.get('/fleet/bookings/list');
    return response.data.data;
  },

  async getBookingById(id: string): Promise<VehicleBooking> {
    const response = await apiClient.get(`/fleet/bookings/${id}`);
    return response.data.data;
  },

  async createBooking(data: Partial<VehicleBooking>): Promise<VehicleBooking> {
    const response = await apiClient.post('/fleet/bookings/create', data);
    return response.data.data;
  },

  async updateBooking(id: string, data: Partial<VehicleBooking>): Promise<VehicleBooking> {
    const response = await apiClient.patch(`/fleet/bookings/update/${id}`, data);
    return response.data.data;
  },

  async deleteBooking(id: string): Promise<void> {
    await apiClient.delete(`/fleet/bookings/delete/${id}`);
  },

  // --- Cost Centers ---
  async getCostCenters(): Promise<CostCenter[]> {
    const response = await apiClient.get('/fleet/cost-centers/list');
    return response.data.data;
  },

  async getCostCenterById(id: string): Promise<CostCenter> {
    const response = await apiClient.get(`/fleet/cost-centers/${id}`);
    return response.data.data;
  },

  async createCostCenter(data: Partial<CostCenter>): Promise<CostCenter> {
    const response = await apiClient.post('/fleet/cost-centers/create', data);
    return response.data.data;
  },

  async updateCostCenter(id: string, data: Partial<CostCenter>): Promise<CostCenter> {
    const response = await apiClient.patch(`/fleet/cost-centers/update/${id}`, data);
    return response.data.data;
  },

  async deleteCostCenter(id: string): Promise<void> {
    await apiClient.delete(`/fleet/cost-centers/delete/${id}`);
  },

  // --- KPIs & Dashboard ---
  async getKPIs(): Promise<any> {
    const response = await apiClient.get('/fleet/kpis');
    return response.data.data;
  },

  async getDashboardStats(period: string = 'this_month'): Promise<any> {
    const response = await apiClient.get(`/fleet/dashboard?period=${period}`);
    return response.data.data;
  },
};

