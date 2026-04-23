
import React from 'react';

export interface User {
  id: string;
  username: string;
  fullName?: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'MANAGER' | string;
  avatar?: string;
  state?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface UserRole {
  role_id: string;
  name: string;
  description: string;
  Permissions?: Permission[];
}

export interface Permission {
  permission_id: string;
  code: string;
  description?: string | null;
}

export interface UserRecord {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  role_id: string;
  branch_id?: string | null;
  status: 'Active' | 'Inactive';
  created_at: string;
  image_url?: string | null;
  Role: UserRole;
  Branch?: any | null;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  subItems?: NavItem[];
}

export interface Order {
  id: string;
  product: string;
  variants: string;
  category: string;
  price: number;
  status: 'Delivered' | 'Pending' | 'Canceled';
  image: string;
}

export interface Employee {
  id: string;
  _id?: string;
  employeeCode: string;
  fullName: string;
  photo: string;
  contractStartDate: string;
  contractEndDate: string;
  idNumber: string;
  nationality: string;
  gosiId: string;
  dob: string;
  gender: 'Male' | 'Female' | string;
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | string;
  phone: string;
  email: string;
  address: string;
  employeeStatus: 'Active' | 'Inactive' | 'Suspended' | 'Resigned' | 'Contract Ended' | string;
  companyId: any; // populated
  branchId: any; // populated
  departmentId: any; // populated
  jobId: any; // populated
  directManagerId: any; // populated
  terminationDate?: string | null;
  joinDate: string;
  contractType: 'Full-Time' | 'Part-Time' | 'Temporary' | string;
  internalId: string;
  jobGrade: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
  };
  documents: {
    documentType: string;
    documentNumber: string;
    issueDate: string;
    expiryDate: string;
    _id?: string;
  }[];
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActionHistory {
  id: string;
  requestId: string;
  requestType: string;
  createdAt: string;
  by: string;
  role: string;
  date: string;
  time: string;
  action: 'Pending' | 'Approved' | 'Rejected' | string;
  rejectedReason?: string | null;
}

export interface Loan {
  id: string;
  loanId: string;
  createdAt: string;
  employeeId: string;
  employeeName: string;
  empCode?: string;
  avatar: string;
  loanAmount: string;
  remainingAmount: string;
  deductionType: 'SINGLE' | 'INSTALLMENTS' | null;
  installmentAmount: string | null;
  startMonth: string | null;
  reason: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Rejected' | string;
  rejectedReason?: string;
  approved_by_manager: boolean;
  approved_by_hr: boolean;
  workflowStatus: {
    hr: boolean;
    manager: boolean;
  };
}

export interface DocumentRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  type: 'ID' | 'Passport' | 'Work_Permit' | 'Medical_Insurance' | 'Certificates' | string;
  fileUrl: string;
  expiryDate: string;
  uploadedBy?: string | null;
  createdAt?: string;
}

export interface Attendance {
  id: string;
  _id: string;
  employeeId: any; // populated
  date: string;
  checkInTime: string;
  checkOutTime: string;
  shiftType: 'morning' | 'night' | string;
  breakDuration: string | number;
  workingHours: string | number;
  overtimeHours: string | number;
  lateMinutes: string | number;
  earlyLeaveMinutes: string | number;
  status: 'Present' | 'Absent' | 'On Leave' | 'Late' | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AttendanceRecord = Attendance;

export interface Payroll {
  id: string;
  _id: string;
  employeeId: any; // populated
  companyId: any; // populated
  branchId: any; // populated
  payrollMonth: number;
  payrollYear: number;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  workNatureAllowance: number;
  medicalAllowance: number;
  commissions: number;
  bonus: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimeAmount: number;
  totalAllowances: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  status: 'DRAFT' | 'PAID' | string;
  notes?: string;
  deductions: {
    absence: number;
    lateArrival: number;
    earlyLeave: number;
    loan: number;
    penalties: number;
    other: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type PayrollRecord = Payroll;

export interface PayrollRule {
  id: string;
  ruleCode: string;
  ruleName: string;
  value: string;
  state: 'Active' | 'Inactive';
}

export interface DeductionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar?: string;
  month?: number;
  year?: number;
  absence: string;
  lateArrival: string;
  earlyLeave: string;
  loan: string;
  penalties: string;
  company: string;
  branch: string;
  granularIds?: Record<string, string>;
}

export interface Leave {
  id: string;
  _id: string;
  leaveId: string;
  employeeId: any; // populated
  leaveType: 'ANNUAL' | 'SICK' | 'UNPAID' | string;
  fromDate: string;
  toDate: string;
  days: number;
  remainingBalance: number;
  reason: string;
  attachment?: string;
  workflowStatus: 'PENDING_MANAGER' | 'APPROVED' | 'REJECTED' | string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  approverId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type LeaveRequest = Leave;

export interface HRRequest {
  id: string;
  _id: string;
  requestNumber: string;
  employeeId: any; // populated
  requestType: 'LEAVE' | 'ALLOWANCE' | 'CLEARANCE' | string;
  dueDate: string;
  description: string;
  approvedBy?: string | null;
  approvalDate?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  notes?: string;
  requestDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RequestRecord = HRRequest;

export interface Contract {
  id: string;
  contractId: string; // Internal Serial
  employeeId: string;
  employeeName: string;
  empCode?: string;
  avatar?: string;
  contractType: string; // e.g. Saudi, Expat
  duration: string;
  jobTitle: string;
  branch: string;
  startDate: string;
  endDate: string;
  workingHours: string;
  allowances: string;
  // Comment above fix: Renamed basic_salary to basicSalary to resolve type mismatch errors in components
  basicSalary: string;
  state: 'Active' | 'Expired' | 'Under Renewal' | 'Pending' | string;
}

export interface Penalty {
  id: string;
  penaltyId: string;
  employeeId: string;
  employeeName: string;
  avatar?: string;
  penaltyType: string;
  amount: string;
  date: string;
  decisionMaker: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  attachment?: string;
}

export interface Reward {
  id: string;
  rewardId: string;
  employeeId: string;
  employeeName: string;
  avatar?: string;
  rewardType: string;
  amount: string;
  date: string;
  bonus?: string;
  commission?: string;
}

export interface Performance {
  id: string;
  _id: string;
  employeeId: any; // populated
  period: string;
  evaluationScore: number;
  status: 'COMPLETED' | 'DRAFT' | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Evaluation = Performance;

export interface PayrollLog {
  id: string;
  _id: string;
  payrollRunId: string;
  month: string;
  runBy: any; // populated
  numberOfEmployees: number;
  totalPayroll: number;
  status: 'SUCCESS' | 'FAILED' | string;
  notes?: string;
  runDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerHistory {
  id: string;
  _id: string;
  employeeId: any; // populated
  previousJobId: any; // populated
  newJobId: any; // populated
  previousGrade: string;
  newGrade: string;
  previousSalary: number;
  newSalary: number;
  effectiveDate: string;
  changeType: 'PROMOTION' | 'TRANSFER' | 'INCREMENT' | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Insurance {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar?: string;
  policyNumber: string;
  insuranceCompany: string;
  planName: string;
  startDate: string;
  endDate: string;
  totalCost: string;
  policyPlan: string;
  familyMembers: string;
  coverageExpiry: string;
  membershipId: string;
}

export interface Company {
  id: string;
  _id?: string;
  name: string;
  taxNumber: string;
  email: string;
  defaultCurrency: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Branch {
  id: string;
  _id?: string;
  companyId: any;
  name: string;
  email: string;
  address: string;
  state: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  _id: string;
  departmentName: string;
  companyId: any; // populated
  managerName: string;
  state: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface Job {
  id: string;
  _id: string;
  jobName: string;
  description: string;
  departmentId: any; // populated
  state: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignLaptop {
  id: string;
  empCode: string;
  employeeId?: string; 
  empName: string;
  deviceType: string;
  serialNumber: string;
  doneAt: string;
  doneBy: string;
  status: 'Done' | 'Pending';
}

export interface AccessCard {
  id: string;
  employeeId?: string; 
  empCode: string;
  empName: string;
  cardNumber: string;
  doneAt: string;
  doneBy: string;
  status: 'Done' | 'Pending';
}

export interface InitialTraining {
  id: string;
  employeeId?: string; 
  empCode: string;
  empName: string;
  trainingType: string;
  trainer: string;
  departmentId?: string; 
  department: string;
  doneAt: string;
  doneBy: string;
  status: 'Paid' | 'Unpaid' | 'Pending';
}

export interface EndOfService {
  id: string;
  empCode?: string;
  employeeId: string;
  employeeName: string;
  avatar?: string;
  eosType: string;
  jobId?: string; 
  jobTitle: string;
  departmentId?: string; 
  department: string;
  startDate: string;
  endDate: string;
  yearsOfService: string;
  requestDate: string;
  collectLaptop: string;
  collectAccessCards: string;
  finalSettlement: string;
  lastWorkingDay: string;
  reason: string;
  attachment?: string; 
  status: 'Pending' | 'Approved' | 'Rejected';
  approved_by_manager?: boolean;
  approved_by_hr?: boolean;
  rejected_reason?: string;
}

export interface Customer {
  id: string;
  customerCode: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  address: string;
  companyName: string;
  companyId?: any | null;
  branchId?: any | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesOrderItem {
  productId: any;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface SalesOrder {
  id: string;
  orderNo: string;
  customerId: any;
  orderDate: string;
  companyId: any;
  branchId: any;
  warehouseId: any;
  salespersonId: any;
  items: SalesOrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';
  deliveryStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  notes?: string;
  promoCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesInvoiceItem {
  productId: any;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  salesOrderId: any;
  customerId: any;
  warehouseId: any;
  companyId: any;
  branchId: any;
  salespersonId: any;
  issuedDate: string;
  dueDate?: string | null;
  items: SalesInvoiceItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesReturnItem {
  productId: any;
  sku: string;
  invoicedQuantity: number;
  returnQuantity: number;
  unitPrice: number;
  reasonForReturn: string;
  totalReturnAmount: number;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  originalInvoiceId: any;
  customerId: any;
  warehouseId: any;
  companyId: any;
  branchId: any;
  returnDate: string;
  items: SalesReturnItem[];
  refundStatus: 'PENDING' | 'REFUNDED' | 'REJECTED';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface POSProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  image: string;
  category: string;
  productType: string;
  unitOfMeasure: string;
  expiredDate: string;
}

export interface PricingRule {
  id: string;
  ruleName: string;
  customer: string;
  product: string;
  condition: string;
  priceChange: string;
  status: 'Active' | 'Inactive';
}

export interface Discount {
  id: string;
  discountName: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y';
  appliesTo: 'PRODUCT' | 'CATEGORY' | 'CUSTOMER' | 'CUSTOMER_GROUP' | 'ORDER_TOTAL';
  productId?: any;
  categoryId?: string;
  customerId?: any;
  value: number;
  minOrderTotal?: number;
  startDate?: string | null;
  endDate?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  createdAt?: string;
  updatedAt?: string;
}

export interface Promotion {
  id: string;
  promotionName: string;
  type: 'PERCENTAGE' | 'FIXED' | 'BUY_X_GET_Y' | 'FREE_SHIPPING';
  conditionType: 'ORDER_TOTAL' | 'PROMO_CODE' | 'PRODUCT' | 'CUSTOMER_TYPE';
  productId?: string | null;
  customerId?: string | null;
  promoCode?: string;
  minOrderTotal?: number;
  minQty?: number;
  value: number;
  benefitDescription: string;
  startDate?: string | null;
  endDate?: string | null;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED';
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationItem {
  productId: any;
  productName: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  customerId: any;
  quotationDate: string;
  expirationDate?: string | null;
  companyId?: any;
  branchId?: any;
  salespersonId?: any;
  items: QuotationItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  termsAndConditions?: string;
  status: 'DRAFT' | 'SENT' | 'EXPIRED';
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesSettings {
  vatPercentage: number;
  invoiceNumberingMethod: 'Manual' | 'Automatic';
  defaultPricelist: string;
  defaultPaymentTerms: string;
  defaultCurrency: string;
  allowReturnsWithoutInvoice: boolean;
  allowSellingOutOfStock: boolean;
}

export interface StockAdjustment {
  id: string;
  productName: string;
  warehouse: string;
  adjustmentQty: number;
  reason: string;
  date: string;
  status: 'Pending' | 'Completed';
}

export interface InventorySettings {
  allowNegativeStock: boolean;
  enableWarehouseTracking: boolean;
  defaultWarehouse: string;
  stockValuationMethod: 'FIFO' | 'LIFO' | 'Average';
}

export interface PurchaseSettings {
  defaultPaymentTerms: string;
  defaultCurrency: string;
  requireApprovalForOrdersOver: number;
  allowPartialDelivery: boolean;
}

export interface CartItem extends POSProduct {
  quantity: number;
}

export interface Supplier {
  id: string;
  _id?: string;
  supplierCode: string;
  supplierName: string;
  email: string;
  phoneNumber: string;
  address: string;
  paymentTerms: string;
  companyName: string;
  companyId: any;
  branchId: any;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrder {
  id: string;
  _id?: string;
  referenceNo: string;
  supplierId: any;
  linkedPurchaseRequestId?: any;
  orderDate: string;
  companyId: any;
  branchId: any;
  items: {
    productId: any;
    sku?: string;
    quantity: number;
    unitCost: number;
    tax: number;
    receivedQuantity: number;
    pendingQuantity: number;
  }[];
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL' | string;
  deliveryStatus: 'PENDING' | 'DELIVERED' | 'PROCESSING' | 'CANCELLED' | string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoodsReceipt {
  id: string;
  _id?: string;
  grNumber: string;
  purchaseOrderId: any;
  receiptDate: string;
  warehouseId: any;
  companyId: any;
  branchId: any;
  items: {
    productId: any;
    sku?: string;
    orderedQuantity: number;
    receivedQuantity: number;
    acceptedQuantity: number;
    rejectedQuantity: number;
    unitCost: number;
    totalValue: number;
  }[];
  totalQty: number;
  receivedBy: string;
  totalValue: number;
  notes?: string;
}

export interface PurchaseInvoice {
  id: string;
  _id?: string;
  invoiceNo: string;
  supplierId: any;
  purchaseOrderId: any;
  invoiceDate: string;
  dueDate: string;
  warehouseId: any;
  companyId: any;
  branchId: any;
  items: {
    productId: any;
    sku: string;
    quantity: number;
    unitCost: number;
    tax: number;
    total: number;
  }[];
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL' | string;
  deliveryStatus: 'PENDING' | 'DELIVERED' | 'PROCESSING' | 'CANCELLED' | string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseRequest {
  id: string;
  _id?: string;
  prNumber: string;
  requestDate: string;
  department: string;
  requestedBy: any;
  companyId: any;
  branchId: any;
  items: {
    productId: any;
    itemName: string;
    requiredQuantity: number;
    estimatedUnitCost: number;
    totalCost: number;
  }[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierRating {
  id: string;
  supplier: string;
  quality: number;
  delivery: number;
  service: number;
  compliance: number;
  overallRating: number;
}

export interface ReturnToSupplier {
  id: string;
  rtsNumber: string;
  supplier: string;
  date: string;
  status: 'Approval' | 'Pending' | 'Rejected';
  product: string;
  reasonForReturn: string;
  receivedQty: number;
  createdBy: string;
  returnQty: number;
}

export interface Product {
  id: string;
  _id?: string;
  sku: string;
  productName: string;
  category: string;
  productType: 'STOCKABLE' | 'SERVICE' | 'CONSUMABLE';
  salesPrice: number;
  cost: number;
  description: string;
  unitOfMeasure: string;
  barcode: string;
  companyName: string;
  companyId?: any | null;
  branchId?: any | null;
  hasExpiry: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  quantityOnHand?: number;
  forecastedQuantity?: number;
  lastSoldDate?: string;
  totalSold?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Stock {
  id: string;
  sku: string;
  productName: string;
  warehouse: string;
  inStockQty: number;
  reservedQty: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out Of Stock';
  availableQty?: number;
}

export interface Warehouse {
  id: string;
  _id?: string;
  code: string;
  warehouseName: string;
  type: 'MAIN_WAREHOUSE' | 'DISTRIBUTION_CENTER' | 'RETAIL_STORE' | string;
  companyId: any;
  branchId: any;
  managerName: string;
  phoneNumber: string;
  location: string;
  state: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface Unit {
  id: string;
  name: string;
  createdAt: string;
  abbreviation: string;
  parentUnit: string;
  conversionFactor: string;
  state: 'Active' | 'Inactive';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  state: 'Active' | 'Inactive';
}

export interface StockMovement {
  id: string;
  productName: string;
  warehouse: string;
  qty: number;
  type: 'In' | 'Out';
  reference: string;
  userName: string;
  userRole: string;
  date: string;
}

export interface Account {
  id: string;
  _id?: string;
  accountCode: string;
  accountName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | string;
  parentAccountId?: any | null;
  level?: number;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalLine {
  accountId: any;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  _id?: string;
  entryDate: string;
  referenceNumber: string;
  memo: string;
  lines: JournalLine[];
  status: 'DRAFT' | 'POSTED' | 'CANCELLED' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountReceivable {
  id: string;
  _id?: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LedgerLine {
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface GeneralLedgerReport {
  account: {
    id: string;
    code: string;
    name: string;
    type: string;
  };
  fromDate: string;
  toDate: string;
  totalTransactions: number;
  ledgerLines: LedgerLine[];
  closingBalance: number;
}

export interface BalanceSheetReport {
  asOfDate: string;
  assets: { accountCode: string; accountName: string; amount: number }[];
  liabilities: { accountCode: string; accountName: string; amount: number }[];
  equity: { accountCode: string; accountName: string; amount: number }[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
}

export interface TrialBalanceReport {
  fromDate: string;
  toDate: string;
  totalAccounts: number;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  lines: {
    accountId: string;
    accountCode: string;
    accountName: string;
    accountType: string;
    debit: number;
    credit: number;
  }[];
}

export interface ProfitLossReport {
  fromDate: string;
  toDate: string;
  revenues: { accountCode: string; accountName: string; amount: number }[];
  expenses: { accountCode: string; accountName: string; amount: number }[];
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export interface AccountPayable {
  id: string;
  _id?: string;
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface APPayment {
  id: string;
  _id?: string;
  apInvoiceId: string | any;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ARPayment {
  id: string;
  _id?: string;
  arInvoiceId: string | any;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tax {
  id: string;
  _id?: string;
  taxName: string;
  taxCode: string;
  taxType: 'VAT' | 'WITHHOLDING' | 'SALES_TAX' | string;
  rate: number;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Income {
  id?: string;
  _id?: string;
  date: string;
  amount: number;
  source: string;
  companyName: string;
  paymentMethod: 'CASH' | 'BANK' | 'CARD' | 'ONLINE' | string;
  note: string;
  status: 'PENDING' | 'COMPLETED' | string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id?: string;
  _id?: string;
  date: string;
  amount: number;
  vendorName: string;
  category: string;
  paymentMethod: 'CASH' | 'BANK' | 'CARD' | 'ONLINE' | string;
  note: string;
  status: 'PENDING' | 'COMPLETED' | string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankAccount {
  id: string;
  _id?: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  currency: string;
  branch: string;
  currentBalance: number;
  chartAccount?: string | any;
  status: 'Active' | 'Inactive';
  company?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Budget {
  id?: string;
  _id?: string;
  name: string;
  category: string;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | string;
  budgetedAmount: number;
  spentAmount: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CLOSED' | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Currency {
  id?: string;
  _id?: string;
  code: string;
  name: string;
  symbol: string;
  isBaseCurrency: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExchangeRate {
  id?: string;
  _id?: string;
  fromCurrency: string | Currency;
  toCurrency: string | Currency;
  rate: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonthlyClosing {
  id?: string;
  _id?: string;
  month: number;
  year: number;
  isClosed: boolean;
  closedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Asset {
  id?: string;
  _id?: string;
  assetCode?: string;
  assetName: string;
  model: string;
  serialNumber: string;
  brand: string;
  warrantyPeriod: number;
  warrantyEndDate: string;
  warrantyNumber: string;
  barcode: string;
  category: 'ELECTRONICS' | 'FURNITURE' | 'VEHICLE' | 'IT Equipment'| string;
  location: string;
  cost: number;
  purchaseDate: string;
  assignedTo: string;
  state: 'ACTIVE' | 'INACTIVE' | 'IN_MAINTENANCE' | 'LOST' | 'SCRAP' | string;
  notes: string;
  image?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Maintenance {
  id?: string;
  _id?: string;
  maintenanceCode?: string;
  assetId: string | Asset;
  maintenanceType: string;
  scheduledDate: string;
  technician: string;
  state: string;
  cost: number;
  description: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Depreciation {
  id?: string;
  _id?: string;
  depreciationCode?: string;
  assetId: string | Asset;
  purchaseCost: number;
  usefulLife: string;
  depreciationMethod: string;
  accumulatedDepreciation: number;
  currentValue: number;
  accountingPeriod: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Allocation {
  id?: string;
  _id?: string;
  allocationCode?: string;
  assetId: string | Asset;
  assignedTo: string;
  location: string;
  usagePurpose: string;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tracking {
  id?: string;
  _id?: string;
  trackingCode?: string;
  assetId: string | Asset;
  currentLocation: string;
  movementHistory: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id?: string;
  _id?: string;
  auditCode?: string;
  assetId: string | Asset;
  actionType: string;
  byWho: string;
  changeDescription: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Disposal {
  id?: string;
  _id?: string;
  disposalCode?: string;
  assetId: string | Asset;
  assetName: string;
  model: string;
  serialNumber: string;
  brand: string;
  category: string;
  currentValue: number;
  purchaseCost: number;
  purchaseDate: string;
  disposalType: string;
  disposalValue: number;
  invoiceNumber: string;
  paymentMethod: string;
  notes: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}
