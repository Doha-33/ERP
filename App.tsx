
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { MainLayout } from './components/layout/MainLayout';
import { Toaster } from 'sonner';

// Auth Pages
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';

// Dashboard
import { Dashboard } from './pages/dashboard/Dashboard';

// HR Pages
import { Employees } from './pages/hr/Employees';
import { EmployeeDetails } from './pages/hr/EmployeeDetails';
import { Profile } from './pages/Profile';
import { CompanyPage } from './pages/organization/Company';
import { BranchPage } from './pages/organization/Branch';
import { Departments } from './pages/hr/Departments';
import { Jobs } from './pages/hr/Jobs';
import { Attendance } from './pages/hr/Attendance';
import { Payroll } from './pages/hr/Payroll';
import { LoansPage } from './pages/hr/Loans';
import { Responses } from './pages/hr/Responses';
import { ResponseDetails } from './pages/hr/ResponseDetails';
import { Deductions } from './pages/hr/Deductions';
import { Payslip } from './pages/hr/Payslip';
import { Leaves } from './pages/hr/Leaves';
import { Request } from './pages/hr/Request';
import { Contracts } from './pages/hr/Contracts';
import { Performance } from './pages/hr/Performance';
import { InsurancePage } from './pages/hr/Insurance';
import { AssignLaptopPage } from './pages/hr/AssignLaptop';
import { AccessCardsPage } from './pages/hr/AccessCards';
import { InitialTrainingPage } from './pages/hr/InitialTraining';
import { Penalties } from './pages/hr/Penalties';
import { Rewards } from './pages/hr/Rewards';
import { EndOfServicePage } from './pages/hr/EndOfService';
import { SyncDataPage } from './pages/hr/SyncData';
import { FixErrorsPage } from './pages/hr/FixErrors';
import { ImageArchive } from './pages/hr/ImageArchive';

// Sales Pages
import { Orders } from './pages/sales/Orders';
import { OrderDetails } from './pages/sales/OrderDetails';
import { Invoices } from './pages/sales/Invoices';
import { SalesReturnPage } from './pages/sales/SalesReturn';
import { Customers } from './pages/sales/Customers';
import { POS } from './pages/sales/POS';
import { PricingRules } from './pages/sales/PricingRules';
import { Discounts } from './pages/sales/Discounts';
import { Promotions } from './pages/sales/Promotions';
import { Products } from './pages/sales/Products';
import { Quotations } from './pages/sales/Quotations';
import { SalesSettings } from './pages/sales/SalesSettings';

// Purchase
import { Suppliers } from './pages/purchase/Suppliers';
import { PurchaseOrders } from './pages/purchase/PurchaseOrders';
import { PurchaseRequests } from './pages/purchase/PurchaseRequests';
import { GoodsReceipts } from './pages/purchase/GoodsReceipts';
import { PurchaseInvoices } from './pages/purchase/PurchaseInvoices';
import { ReturnsToSupplier } from './pages/purchase/ReturnsToSupplier';
import { SupplierRatings } from './pages/purchase/SupplierRatings';

// Inventory
import { InventoryProducts } from './pages/inventory/Products';
import { Stocks } from './pages/inventory/Stocks';
import { Warehouses } from './pages/inventory/Warehouses';
import { Units } from './pages/inventory/Units';
import { Categories } from './pages/inventory/Categories';
import { StockMovements } from './pages/inventory/StockMovements';

// Reports
import { SalesReport } from './pages/reports/SalesReport';
import { PurchaseReport } from './pages/reports/PurchaseReport';
import { InventoryReport } from './pages/reports/InventoryReport';
import { CustomerReport } from './pages/reports/CustomerReport';

// HR Reports
import { EmployeeSummaryReport } from './pages/reports/hr/EmployeeSummaryReport';
import { MonthlyPayrollReport } from './pages/reports/hr/MonthlyPayrollReport';
import { AnnualPayrollCostReport } from './pages/reports/hr/AnnualPayrollCostReport';
import { AttendanceReport } from './pages/reports/hr/AttendanceReport';
import { LeaveReport } from './pages/reports/hr/LeaveReport';
import { ExpiredContractsReport } from './pages/reports/hr/ExpiredContractsReport';
import { EmployeeRequestsReport } from './pages/reports/hr/EmployeeRequestsReport';
import { PayrollFileLogsReport } from './pages/reports/hr/PayrollFileLogsReport';
import { GOSIContributionReport } from './pages/reports/hr/GOSIContributionReport';
import { PerformanceReport } from './pages/reports/hr/PerformanceReport';
import { InsuranceReport } from './pages/reports/hr/InsuranceReport';

// CRM
import { Contacts } from './pages/crm/Contacts';
import { Deals } from './pages/crm/Deals';
import { Leads } from './pages/crm/Leads';
import { Pipeline } from './pages/crm/Pipeline';
import { Projects } from './pages/crm/Projects';
import { Tasks } from './pages/crm/Tasks';

// Accounting
import { Income } from './pages/accounting/Income';
import { Expenses } from './pages/accounting/Expenses';
import { ChartOfAccounts } from './pages/accounting/ChartOfAccounts';
import { BankAccounts } from './pages/accounting/BankAccounts';
import { JournalEntries } from './pages/accounting/JournalEntries';
import { GeneralLedger } from './pages/accounting/GeneralLedger';
import { AccountsReceivable } from './pages/accounting/AccountsReceivable';
import { AccountsPayable } from './pages/accounting/AccountsPayable';
import { Taxes } from './pages/accounting/Taxes';
import { Budget } from './pages/accounting/Budget';
import { Currencies } from './pages/accounting/Currencies';
import { ExchangeRates } from './pages/accounting/ExchangeRates';
import { MonthlyClosing } from './pages/accounting/MonthlyClosing';
import { FinancialReports } from './pages/accounting/FinancialReports';

// Fleet
import { FleetDashboard } from './pages/fleet/FleetDashboard';
import { Vehicles } from './pages/fleet/Vehicles';
import { Drivers } from './pages/fleet/Drivers';
import { Trips } from './pages/fleet/Trips';
import { FuelLogs } from './pages/fleet/FuelLogs';
import { Maintenance } from './pages/fleet/Maintenance';
import { Accidents } from './pages/fleet/Accidents';
import { VehicleExpenses } from './pages/fleet/VehicleExpenses';
import { VehicleBooking } from './pages/fleet/VehicleBooking';
import { FleetKPIsReport } from './pages/fleet/FleetKPIsReport';
import { CostCenterManagement } from './pages/fleet/CostCenterManagement';

// Manufacturing
import { ManufacturingDashboard } from './pages/manufacturing/ManufacturingDashboard';
import { BillOfMaterials } from './pages/manufacturing/BillOfMaterials';
import { ManufacturingOrders } from './pages/manufacturing/ManufacturingOrders';
import { Operations } from './pages/manufacturing/Operations';
import { WorkCenters } from './pages/manufacturing/WorkCenters';
import { MaterialRequirements } from './pages/manufacturing/MaterialRequirements';
import { WorkInProgress } from './pages/manufacturing/WorkInProgress';
import { ProductionReports } from './pages/manufacturing/ProductionReports';

// Assets Management
import { AssetRegister } from './pages/assets/AssetRegister';
import { Maintenance as AssetMaintenance } from './pages/assets/Maintenance';
import { Depreciation } from './pages/assets/Depreciation';
import { Allocation } from './pages/assets/Allocation';
import { Tracking } from './pages/assets/Tracking';
import { Disposal } from './pages/assets/Disposal';
import { AuditLog } from './pages/assets/AuditLog';

// System Pages
import { UsersPage } from './pages/users/UsersPage';
import { RolesPage } from './pages/users/RolesPage';
import { SalesPermissions } from './pages/users/SalesPermissions';

import { ErrorBoundary } from './components/common/ErrorBoundary';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (user?.role?.toLowerCase() !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <DataProvider>
              <Toaster richColors position="top-right" />
              <Routes>
                {/* Public Routes */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } />

                {/* System Routes - Admin Only */}
                <Route path="/users" element={<AdminRoute><MainLayout><UsersPage /></MainLayout></AdminRoute>} />
                <Route path="/roles" element={<AdminRoute><MainLayout><RolesPage /></MainLayout></AdminRoute>} />
                <Route path="/sales-permissions" element={<AdminRoute><MainLayout><SalesPermissions /></MainLayout></AdminRoute>} />

                {/* HR Routes */}
                <Route path="/hr" element={<ProtectedRoute><MainLayout><Employees /></MainLayout></ProtectedRoute>} />
                <Route path="/hr/employees/:id" element={<ProtectedRoute><MainLayout><EmployeeDetails /></MainLayout></ProtectedRoute>} />
                
                {/* Profile Route */}
                <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
              
                {/* Organizational & Policy Routes - Admin Only */}
                <Route path="/hr/company" element={<AdminRoute><MainLayout><CompanyPage /></MainLayout></AdminRoute>} />
                <Route path="/hr/branch" element={<AdminRoute><MainLayout><BranchPage /></MainLayout></AdminRoute>} />
                <Route path="/hr/departments" element={<AdminRoute><MainLayout><Departments /></MainLayout></AdminRoute>} />
                <Route path="/hr/jobs" element={<AdminRoute><MainLayout><Jobs /></MainLayout></AdminRoute>} />
                <Route path="/hr/deductions" element={<AdminRoute><MainLayout><Deductions /></MainLayout></AdminRoute>} />
                <Route path="/hr/insurance" element={<AdminRoute><MainLayout><InsurancePage /></MainLayout></AdminRoute>} />
                <Route path="/hr/assign-laptop" element={<AdminRoute><MainLayout><AssignLaptopPage /></MainLayout></AdminRoute>} />
                <Route path="/hr/access-cards" element={<AdminRoute><MainLayout><AccessCardsPage /></MainLayout></AdminRoute>} />
                <Route path="/hr/initial-training" element={<AdminRoute><MainLayout><InitialTrainingPage /></MainLayout></AdminRoute>} />
                <Route path="/hr/end-of-service" element={<AdminRoute><MainLayout><EndOfServicePage /></MainLayout></AdminRoute>} />
                <Route path="/hr/penalties" element={<AdminRoute><MainLayout><Penalties /></MainLayout></AdminRoute>} />
                <Route path="/hr/rewards" element={<AdminRoute><MainLayout><Rewards /></MainLayout></AdminRoute>} />
                <Route path="/hr/sync" element={<AdminRoute><MainLayout><SyncDataPage /></MainLayout></AdminRoute>} />
                <Route path="/hr/fix" element={<AdminRoute><MainLayout><FixErrorsPage /></MainLayout></AdminRoute>} />
                <Route path="/hr/media-archive" element={<AdminRoute><MainLayout><ImageArchive /></MainLayout></AdminRoute>} />
                
                {/* Common User Modules */}
                <Route path="/hr/attendance" element={<ProtectedRoute><MainLayout><Attendance /></MainLayout></ProtectedRoute>} />
                <Route path="/hr/payroll" element={<ProtectedRoute><MainLayout><Payroll /></MainLayout></ProtectedRoute>} />
                <Route path="/hr/loans" element={<ProtectedRoute><MainLayout><LoansPage /></MainLayout></ProtectedRoute>} />
                <Route path="/hr/responses" element={<ProtectedRoute><MainLayout><Responses /></MainLayout></ProtectedRoute>} />
                <Route path="/hr/responses/:type/:id" element={<ProtectedRoute><MainLayout><ResponseDetails /></MainLayout></ProtectedRoute>} />
                <Route path="/hr/payroll/payslip/:id" element={<ProtectedRoute><MainLayout><Payslip /></MainLayout></ProtectedRoute>} />
                <Route path="/hr/leaves" element={<ProtectedRoute><MainLayout><Leaves /></MainLayout></ProtectedRoute>} />
                <Route path="/hr/request" element={<ProtectedRoute><MainLayout><Request /></MainLayout></ProtectedRoute>} />
                <Route path="/hr/contracts" element={<ProtectedRoute><MainLayout><Contracts /></MainLayout></ProtectedRoute>} />
                <Route path="/hr/performance" element={<ProtectedRoute><MainLayout><Performance /></MainLayout></ProtectedRoute>} />

                {/* Sales Routes */}
                <Route path="/sales/orders" element={<ProtectedRoute><MainLayout><Orders /></MainLayout></ProtectedRoute>} />
                <Route path="/sales/orders/:id" element={<ProtectedRoute><MainLayout><OrderDetails /></MainLayout></ProtectedRoute>} />
                <Route path="/sales/quotations" element={<ProtectedRoute><MainLayout><Quotations /></MainLayout></ProtectedRoute>} />
                <Route path="/sales/invoices" element={<ProtectedRoute><MainLayout><Invoices /></MainLayout></ProtectedRoute>} />
                <Route path="/sales/returns" element={<ProtectedRoute><MainLayout><SalesReturnPage /></MainLayout></ProtectedRoute>} />
                <Route path="/sales/customers" element={<ProtectedRoute><MainLayout><Customers /></MainLayout></ProtectedRoute>} />
                <Route path="/sales/products" element={<ProtectedRoute><MainLayout><Products /></MainLayout></ProtectedRoute>} />
                <Route path="/sales/pricing" element={<ProtectedRoute><MainLayout><PricingRules /></MainLayout></ProtectedRoute>} />
                <Route path="/sales/discounts" element={<ProtectedRoute><MainLayout><Discounts /></MainLayout></ProtectedRoute>} />
                <Route path="/sales/promotions" element={<ProtectedRoute><MainLayout><Promotions /></MainLayout></ProtectedRoute>} />
                <Route path="/sales/pos" element={<ProtectedRoute><MainLayout><POS /></MainLayout></ProtectedRoute>} />
                <Route path="/sales/settings" element={<ProtectedRoute><MainLayout><SalesSettings /></MainLayout></ProtectedRoute>} />

                {/* Purchase Module */}
                <Route path="/purchase/suppliers" element={<ProtectedRoute><MainLayout><Suppliers /></MainLayout></ProtectedRoute>} />
                <Route path="/purchase/orders" element={<ProtectedRoute><MainLayout><PurchaseOrders /></MainLayout></ProtectedRoute>} />
                <Route path="/purchase/requests" element={<ProtectedRoute><MainLayout><PurchaseRequests /></MainLayout></ProtectedRoute>} />
                <Route path="/purchase/goods-receipts" element={<ProtectedRoute><MainLayout><GoodsReceipts /></MainLayout></ProtectedRoute>} />
                <Route path="/purchase/invoices" element={<ProtectedRoute><MainLayout><PurchaseInvoices /></MainLayout></ProtectedRoute>} />
                <Route path="/purchase/returns" element={<ProtectedRoute><MainLayout><ReturnsToSupplier /></MainLayout></ProtectedRoute>} />
                <Route path="/purchase/ratings" element={<ProtectedRoute><MainLayout><SupplierRatings /></MainLayout></ProtectedRoute>} />

                {/* Inventory Module */}
                <Route path="/inventory/products" element={<ProtectedRoute><MainLayout><InventoryProducts /></MainLayout></ProtectedRoute>} />
                <Route path="/inventory/stocks" element={<ProtectedRoute><MainLayout><Stocks /></MainLayout></ProtectedRoute>} />
                <Route path="/inventory/warehouses" element={<ProtectedRoute><MainLayout><Warehouses /></MainLayout></ProtectedRoute>} />
                <Route path="/inventory/units" element={<ProtectedRoute><MainLayout><Units /></MainLayout></ProtectedRoute>} />
                <Route path="/inventory/categories" element={<ProtectedRoute><MainLayout><Categories /></MainLayout></ProtectedRoute>} />
                <Route path="/inventory/movements" element={<ProtectedRoute><MainLayout><StockMovements /></MainLayout></ProtectedRoute>} />

                {/* Reports Module */}
                <Route path="/reports/sales" element={<ProtectedRoute><MainLayout><SalesReport /></MainLayout></ProtectedRoute>} />
                <Route path="/reports/purchase" element={<ProtectedRoute><MainLayout><PurchaseReport /></MainLayout></ProtectedRoute>} />
                <Route path="/reports/inventory" element={<ProtectedRoute><MainLayout><InventoryReport /></MainLayout></ProtectedRoute>} />
                <Route path="/reports/customer" element={<ProtectedRoute><MainLayout><CustomerReport /></MainLayout></ProtectedRoute>} />
                
                {/* HR Reports */}
                <Route path="/reports/hr/employee-summary" element={<ProtectedRoute><MainLayout><EmployeeSummaryReport /></MainLayout></ProtectedRoute>} />
                <Route path="/reports/hr/monthly-payroll" element={<ProtectedRoute><MainLayout><MonthlyPayrollReport /></MainLayout></ProtectedRoute>} />
                <Route path="/reports/hr/annual-payroll-cost" element={<ProtectedRoute><MainLayout><AnnualPayrollCostReport /></MainLayout></ProtectedRoute>} />
                <Route path="/reports/hr/attendance" element={<ProtectedRoute><MainLayout><AttendanceReport /></MainLayout></ProtectedRoute>} />
                <Route path="/reports/hr/leave" element={<ProtectedRoute><MainLayout><LeaveReport /></MainLayout></ProtectedRoute>} />
                <Route path="/reports/hr/expired-contracts" element={<ProtectedRoute><MainLayout><ExpiredContractsReport /></MainLayout></ProtectedRoute>} />
                <Route path="/reports/hr/employee-requests" element={<ProtectedRoute><MainLayout><EmployeeRequestsReport /></MainLayout></ProtectedRoute>} />
                <Route path="/reports/hr/payroll-file-logs" element={<ProtectedRoute><MainLayout><PayrollFileLogsReport /></MainLayout></ProtectedRoute>} />
                <Route path="/reports/hr/gosi-contribution" element={<ProtectedRoute><MainLayout><GOSIContributionReport /></MainLayout></ProtectedRoute>} />
                <Route path="/reports/hr/performance" element={<ProtectedRoute><MainLayout><PerformanceReport /></MainLayout></ProtectedRoute>} />
                <Route path="/reports/hr/insurance" element={<ProtectedRoute><MainLayout><InsuranceReport /></MainLayout></ProtectedRoute>} />

                {/* CRM Module */}
                <Route path="/crm/contacts" element={<ProtectedRoute><MainLayout><Contacts /></MainLayout></ProtectedRoute>} />
                <Route path="/crm/deals" element={<ProtectedRoute><MainLayout><Deals /></MainLayout></ProtectedRoute>} />
                <Route path="/crm/leads" element={<ProtectedRoute><MainLayout><Leads /></MainLayout></ProtectedRoute>} />
                <Route path="/crm/pipeline" element={<ProtectedRoute><MainLayout><Pipeline /></MainLayout></ProtectedRoute>} />
                <Route path="/crm/projects" element={<ProtectedRoute><MainLayout><Projects /></MainLayout></ProtectedRoute>} />
                <Route path="/crm/tasks" element={<ProtectedRoute><MainLayout><Tasks /></MainLayout></ProtectedRoute>} />

                {/* Accounting Module */}
                <Route path="/accounting/income" element={<ProtectedRoute><MainLayout><Income /></MainLayout></ProtectedRoute>} />
                <Route path="/accounting/expenses" element={<ProtectedRoute><MainLayout><Expenses /></MainLayout></ProtectedRoute>} />
                <Route path="/accounting/budget" element={<ProtectedRoute><MainLayout><Budget /></MainLayout></ProtectedRoute>} />
                <Route path="/accounting/chart-of-accounts" element={<ProtectedRoute><MainLayout><ChartOfAccounts /></MainLayout></ProtectedRoute>} />
                <Route path="/accounting/bank-accounts" element={<ProtectedRoute><MainLayout><BankAccounts /></MainLayout></ProtectedRoute>} />
                <Route path="/accounting/journal-entries" element={<ProtectedRoute><MainLayout><JournalEntries /></MainLayout></ProtectedRoute>} />
                <Route path="/accounting/general-ledger" element={<ProtectedRoute><MainLayout><GeneralLedger /></MainLayout></ProtectedRoute>} />
                <Route path="/accounting/accounts-receivable" element={<ProtectedRoute><MainLayout><AccountsReceivable /></MainLayout></ProtectedRoute>} />
                <Route path="/accounting/accounts-payable" element={<ProtectedRoute><MainLayout><AccountsPayable /></MainLayout></ProtectedRoute>} />
                <Route path="/accounting/taxes" element={<ProtectedRoute><MainLayout><Taxes /></MainLayout></ProtectedRoute>} />
                <Route path="/accounting/currencies" element={<ProtectedRoute><MainLayout><Currencies /></MainLayout></ProtectedRoute>} />
                <Route path="/accounting/exchange-rates" element={<ProtectedRoute><MainLayout><ExchangeRates /></MainLayout></ProtectedRoute>} />
                <Route path="/accounting/monthly-closing" element={<ProtectedRoute><MainLayout><MonthlyClosing /></MainLayout></ProtectedRoute>} />
                <Route path="/accounting/financial-reports" element={<ProtectedRoute><MainLayout><FinancialReports /></MainLayout></ProtectedRoute>} />

                {/* Fleet Module */}
                <Route path="/fleet/dashboard" element={<ProtectedRoute><MainLayout><FleetDashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/fleet/vehicles" element={<ProtectedRoute><MainLayout><Vehicles /></MainLayout></ProtectedRoute>} />
                <Route path="/fleet/drivers" element={<ProtectedRoute><MainLayout><Drivers /></MainLayout></ProtectedRoute>} />
                <Route path="/fleet/trips" element={<ProtectedRoute><MainLayout><Trips /></MainLayout></ProtectedRoute>} />
                <Route path="/fleet/fuel-logs" element={<ProtectedRoute><MainLayout><FuelLogs /></MainLayout></ProtectedRoute>} />
                <Route path="/fleet/maintenance" element={<ProtectedRoute><MainLayout><Maintenance /></MainLayout></ProtectedRoute>} />
                <Route path="/fleet/accidents" element={<ProtectedRoute><MainLayout><Accidents /></MainLayout></ProtectedRoute>} />
                <Route path="/fleet/expenses" element={<ProtectedRoute><MainLayout><VehicleExpenses /></MainLayout></ProtectedRoute>} />
                <Route path="/fleet/booking" element={<ProtectedRoute><MainLayout><VehicleBooking /></MainLayout></ProtectedRoute>} />
                <Route path="/fleet/reports" element={<ProtectedRoute><MainLayout><FleetKPIsReport /></MainLayout></ProtectedRoute>} />
                <Route path="/fleet/cost-center" element={<ProtectedRoute><MainLayout><CostCenterManagement /></MainLayout></ProtectedRoute>} />

                {/* Manufacturing Module */}
                <Route path="/manufacturing/dashboard" element={<ProtectedRoute><MainLayout><ManufacturingDashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/manufacturing/bom" element={<ProtectedRoute><MainLayout><BillOfMaterials /></MainLayout></ProtectedRoute>} />
                <Route path="/manufacturing/orders" element={<ProtectedRoute><MainLayout><ManufacturingOrders /></MainLayout></ProtectedRoute>} />
                <Route path="/manufacturing/operations" element={<ProtectedRoute><MainLayout><Operations /></MainLayout></ProtectedRoute>} />
                <Route path="/manufacturing/work-centers" element={<ProtectedRoute><MainLayout><WorkCenters /></MainLayout></ProtectedRoute>} />
                <Route path="/manufacturing/material-requirements" element={<ProtectedRoute><MainLayout><MaterialRequirements /></MainLayout></ProtectedRoute>} />
                <Route path="/manufacturing/wip" element={<ProtectedRoute><MainLayout><WorkInProgress /></MainLayout></ProtectedRoute>} />
                <Route path="/manufacturing/reports" element={<ProtectedRoute><MainLayout><ProductionReports /></MainLayout></ProtectedRoute>} />

                {/* Assets Management Module */}
                <Route path="/assets/register" element={<ProtectedRoute><MainLayout><AssetRegister /></MainLayout></ProtectedRoute>} />
                <Route path="/assets/maintenance" element={<ProtectedRoute><MainLayout><AssetMaintenance /></MainLayout></ProtectedRoute>} />
                <Route path="/assets/depreciation" element={<ProtectedRoute><MainLayout><Depreciation /></MainLayout></ProtectedRoute>} />
                <Route path="/assets/allocation" element={<ProtectedRoute><MainLayout><Allocation /></MainLayout></ProtectedRoute>} />
                <Route path="/assets/tracking" element={<ProtectedRoute><MainLayout><Tracking /></MainLayout></ProtectedRoute>} />
                <Route path="/assets/disposal" element={<ProtectedRoute><MainLayout><Disposal /></MainLayout></ProtectedRoute>} />
                <Route path="/assets/audit" element={<ProtectedRoute><MainLayout><AuditLog /></MainLayout></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </DataProvider>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
