
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
  phoneNumber: string;
  email: string;
  address: string;
  employeeStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'RESIGNED' | 'CONTRACT_ENDED' | string;
  code?: string; // Legacy
  avatar?: string; // Legacy
  phone?: string; // Legacy
  position?: string; // Legacy
  department?: string; // Legacy
  departmentName?: string; // Legacy
  joinDate?: string; // Legacy
  company?: string; // Legacy
  branch?: string; // Legacy
  username?: string; // Legacy
  companyId: any; // populated
  branchId: any; // populated
  departmentId: any; // populated
  jobId: any; // populated
  directManagerId: any; // populated
  terminationDate?: string | null;
  hireDate: string;
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
  _id?: string;
  employeeInfo: any;
  loanAmount: number;
  date: string;
  loanDetails?: string;
  loanType: string;
  reason: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for UI compatibility
  employeeId?: string;
  employeeName?: string;
  empCode?: string;
  avatar?: string;
  loanId?: string;
  remainingAmount?: string | number;
  deductionType?: 'SINGLE' | 'INSTALLMENTS' | string | null;
  installmentAmount?: string | number | null;
  startMonth?: string | null;
  workflowStatus?: {
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
  shiftType: 'MORNING' | 'NIGHT' | 'EVENING'| string;
  breakDuration: number;
  workingHours: number;
  overtimeHours: number;
  lateMinutes: number;
  earlyLeaveMinutes: string | number;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE' | 'PERMISSION' | string;
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
  amount?: number; // Legacy
  employeeName?: string; // Legacy
  overtime?: number; // Legacy
  totals?: number; // Legacy
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

export interface Deduction {
  id: string;
  _id?: string;
  employeeInfo?: any;
  company?: any;
  branch?: any;
  date: string;
  absence: number;
  lateArrival: number;
  earlyLeave: number;
  loan: number;
  penaltiesDeduction: number;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeductionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeInfo?: any;
  avatar?: string;
  month?: number;
  year?: number;
  date?: string;
  absence: string;
  lateArrival: string;
  earlyLeave: string;
  loan: string;
  penalties: string;
  penaltiesDeduction?: string | number;
  company: string;
  branch: string;
  _companyId?: string;
  _branchId?: string;
  granularIds?: Record<string, string>;
}

export interface Leave {
  id: string;
  _id: string;
  leaveId: string;
  employeeId: any; // populated
  leaveType: 'ANNUAL' | 'SICK' | 'UNPAID' | 'EMERGENCY' | 'MATERNITY' | 'OTHER' | string;
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
  attachment?: string;
  requestDate: string;
  date?: string; // Legacy
  employeeName?: string; // Legacy
  avatar?: string; // Legacy
  requestId?: string; // Legacy
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
  _id?: string;
  employeeInfo: any;
  company?: any;
  branch?: any;
  penaltyType: string;
  penaltyAmount: number;
  date: string;
  decisionMaker?: string;
  status: string;
  reason: string;
  attachment?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy
  employeeId?: string;
  employeeName?: string;
  avatar?: string;
  amount?: any;
  penaltyId?: string;
}

export interface Reward {
  id: string;
  _id?: string;
  employeeInfo: any;
  company?: any;
  branch?: any;
  rewardType: string;
  rewardAmount: number;
  date: string;
  bonusAmount?: number;
  commissionAmount?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy
  employeeId?: string;
  employeeName?: string;
  avatar?: string;
  amount?: any;
  bonus?: any;
  commission?: any;
  rewardId?: string;
}

export interface Performance {
  id: string;
  _id: string;
  employeeId: any; // populated
  period: string;
  evaluationScore: number;
  attendance?: number; // Legacy
  productivity?: number; // Legacy
  teamwork?: number; // Legacy
  communication?: number; // Legacy
  skillDevelopment?: number; // Legacy
  status: 'COMPLETED' | 'DRAFT' | 'APPROVED' | string;
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
  _id?: string;
  employeeInfo: any;
  company?: any;
  branch?: any;
  policyNumber: string;
  insuranceCompany: string;
  planName: string;
  totalCost: number;
  policyStartDate: string;
  policyEndDate: string;
  coverageExpiryDate: string;
  membershipId: string;
  policyPlan: string;
  familyMembers: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy
  employeeId?: string;
  employeeName?: string;
  avatar?: string;
  startDate?: string;
  endDate?: string;
  coverageExpiry?: string;
}

export interface Company {
  id: string;
  _id?: string;
  name: string;
  companyName?: string; // Legacy
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
  name?: string; // Legacy
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
  name?: string; // Legacy
  description: string;
  departmentId: any; // populated
  state: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignLaptop {
  id: string;
  _id?: string;
  employeeInfo: any;
  deviceType: string;
  serialNumber: string;
  assignmentDate: string;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy
  employeeId?: string;
  empCode?: string;
  empName?: string;
  doneAt?: string;
  doneBy?: string;
}

export interface AccessCard {
  id: string;
  _id?: string;
  employeeInfo: any;
  cardNumber: string;
  issueDate: string;
  status: string;
  accessLevel: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy
  employeeId?: string;
  empCode?: string;
  empName?: string;
  doneAt?: string;
  doneBy?: string;
}

export interface InitialTraining {
  id: string;
  _id?: string;
  employeeInfo: any;
  trainingName: string;
  trainingDate: string;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy
  employeeId?: string;
  empCode?: string;
  empName?: string;
  trainingType?: string;
  trainer?: string;
  departmentId?: string;
  department?: string;
  doneAt?: string;
  doneBy?: string;
}

export interface EndOfService {
  id: string;
  _id?: string;
  employeeInfo: any;
  lastWorkingDay: string;
  reasonForLeaving: string;
  endOfServiceBenefits: number;
  status: string;
  notes?: string;
  attachment?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy
  employeeId?: string;
  employeeName?: string;
  empCode?: string;
  avatar?: string;
  eosType?: string;
  jobId?: string;
  jobTitle?: string;
  departmentId?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  yearsOfService?: any;
  requestDate?: string;
  collectLaptop?: any;
  collectAccessCards?: any;
  finalSettlement?: any;
  reason?: string;
  approved_by_manager?: boolean;
  approved_by_hr?: boolean;
  rejected_reason?: string;
}

export interface Customer {
  id: string;
  _id?: string; // Added
  customerCode: string;
  customerName: string;
  name?: string; // Legacy
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
  _id?: string; // Added
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
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID' | string;
  deliveryStatus: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | string;
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
  _id?: string; // Added
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
  _id?: string;
  ruleName: string;
  customer: string;
  product: string;
  condition: string;
  priceChange: string;
  appliesTo: 'PRODUCT' | 'CATEGORY' | 'CUSTOMER' | 'ORDER_TOTAL';
  status: 'ACTIVE' | 'INACTIVE';
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
  _id?: string;
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
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED';
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationItem {
  productId: any;
  productName: string;
  sku?: string; // Added
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Quotation {
  id: string;
  _id?: string; // Added
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
  status: 'DRAFT' | 'SENT' | 'EXPIRED' | string;
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
  status: 'ACTIVE' | 'INACTIVE' | string;
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
  grnNumber: string;
  purchaseOrderId: any;
  receiptDate: string;
  warehouseId: any;
  supplierId: any;
  companyId: any;
  branchId: any;
  items: {
    productId: any;
    sku?: string;
    orderedQuantity: number;
    receivedQuantity: number;
    acceptedQuantity: number;
    rejectedQuantity: number;
    unitCost?: number;
    totalValue?: number;
    price?: number; // Legacy/Compat
    unitPrice?: number; // Legacy/Compat
    total?: number; // Legacy/Compat
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
  image: string;
  productName: string;
  category: string;
  productType: 'STOCKABLE' | 'SERVICE' | 'CONSUMABLE' | string;
  salesPrice: number;
  cost: number;
  description: string;
  unitOfMeasure: string;
  barcode: string;
  companyName: string;
  companyId?: any | null;
  branchId?: any | null;
  hasExpiry: boolean;
  status: 'ACTIVE' | 'INACTIVE' | string;
  quantityOnHand?: number;
  currentStock?: number;
  reorderLevel?: number;
  defaultUnit?: string;
  sellingPrice?: number;
  expired: boolean;
  purchasePrice?: number;
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
  state: 'ACTIVE' | 'INACTIVE' | string;
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
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Online' | string;
  note: string;
  incomeId: string;
  vatPercent: number;
  vatAmount: number;
  status: 'Paid' | 'Unpaid' | 'partial' | string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id?: string;
  _id?: string;
  expenseId: string;
  date: string;
  amount: number;
  vendorName: string;
  category: string;
  payee: string;
  vatPercent: number;
  vatAmount: number;
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

export interface Vehicle {
  _id: string;
  vehicleCode: string;
  plateNumber: string;
  model: string;
  type: string;
  fuelType: string;
  mileage: number;
  status: 'Active' | 'In Maintenance' | 'Inactive' | string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  _id: string;
  driverCode: string;
  driverName: string;
  licenseNumber: string;
  licenseExpiry: string;
  phone: string;
  assignedVehicleId: string | Vehicle;
  status: 'Active' | 'On Trip' | 'Inactive' | string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  _id: string;
  tripCode: string;
  vehicleId: string | Vehicle;
  driverId: string | Driver;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime?: string | null;
  fuelUsed: number;
  distance: number;
  status: 'Ongoing' | 'Completed' | 'Cancelled' | string;
  createdAt: string;
  updatedAt: string;
}


export interface CostCenter {
  _id: string;
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive' | string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleBooking {
  _id: string;
  vehicleId: string | Vehicle;
  requestedBy: string;
  startDate: string;
  endDate: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleExpense {
  _id: string;
  vehicleId: string | Vehicle;
  type: string;
  amount: number;
  date: string;
  description: string;
  status: 'Paid' | 'Pending' | string;
  createdAt: string;
  updatedAt: string;
}

export interface Accident {
  _id: string;
  vehicleId: string | Vehicle;
  driverId: string | Driver;
  date: string;
  location: string;
  damageLevel: 'Low' | 'Medium' | 'High' | string;
  actualCost: number;
  insuranceProvider: string;
  status: 'Open' | 'Closed' | string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  _id: string;
  vehicleId: string | Vehicle;
  type: string;
  date: string;
  cost: number;
  odometer: number;
  provider: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelLog {
  _id: string;
  vehicleId: string | Vehicle;
  driverId: string | Driver;
  date: string;
  quantity: number;
  cost: number;
  odometer: number;
  station: string;
  createdAt: string;
  updatedAt: string;
}

export interface FleetKPIs {
  totalVehicles: number;
  activeVehicles: number;
  totalTrips: number;
  totalFuelCost: number;
  averageFuelConsumption: number;
  maintenanceCosts: number;
  summary?: string; // Added
}


// Manufacturing Module Types
export interface BillOfMaterials {
  _id: string;
  bom_id: string;
  product_name: string;
  product_code: string;
  component_item: string;
  qty: number;
  uom: string;
  version: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ManufacturingOrder {
  _id: string;
  mo_number: string;
  product_name: string;
  product_code: string;
  planned_quantity: number;
  produced_quantity: number;
  cost_summary: number;
  bom_used: string;
  work_center: string;
  start_date: string;
  end_date: string;
  responsible: string;
  raw_material_availability: string;
  state: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Operation {
  _id: string;
  operation_id: string;
  operation_name: string;
  work_center: string;
  duration: number;
  sequence: number;
  cost: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkCenter {
  _id: string;
  name: string;
  code: string;
  capacity: number;
  efficiency: number;
  oee: number;
  status: string;
  location: string;
  state: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductionReport {
  _id: string;
  mo_number: string;
  finished_product: string;
  planned_qty: number;
  produced_qty: number;
  completion: number;
  materials_consumed: number;
  scrap_qty: number;
  start_time: string;
  end_time: string;
  operation_duration: number;
  operation_cost: number;
  material_cost: number;
  total_production_cost: number;
  responsible: string;
  production_status: string;
  notes: string;
  // UI helper fields (if summary exists)
  report_name?: string;
  report_date?: string;
  total_production?: number;
  avg_efficiency?: number;
  downtime_hours?: number;
  summary?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialRequirement {
  _id: string;
  material: string;
  description: string;
  bom_qty_per_unit: number;
  required_qty: number;
  available_qty: number;
  unit: string;
  source: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkInProgress {
  _id: string;
  mo_number: string;
  product: string;
  planned_qty: number;
  produced_qty: number;
  scrap_qty: number;
  start_date: string;
  expected_end_date: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}


// CRM Module Types
export interface CRMContact {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  tags: string;
  location: string;
  rating: number;
  status: 'Active' | 'Inactive' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRMDeal {
  id: string;
  _id?: string;
  dealName: string;
  customer: string;
  dealValue: number;
  stage: 'Proposal' | 'Negotiation' | 'Won' | 'Lost' | string;
  closingDate: string;
  salesOwner: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRMLead {
  id: string;
  _id?: string;
  leadCode: string;
  leadName: string;
  phone: string;
  company: string;
  leadOwner: string;
  leadStatus: 'New' | 'Contacted' | 'Connected' | 'Qualified' | 'Lost' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRMPipeline {
  id: string;
  _id?: string;
  pipelineCode: string;
  pipelineName: string;
  totalDealValue: number;
  numberOfDeals: number;
  stage: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRMProject {
  id: string;
  _id?: string;
  projectName: string;
  teamLeader: string;
  client: string;
  progress: number;
  startDate: string;
  deadline: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRMTask {
  id: string;
  _id?: string;
  taskTitle: string;
  startDate: string;
  dueDate: string;
  assignee: string;
  state: 'To Do' | 'In Progress' | 'Review' | 'Done' | string;
  description: string;
  priority?: 'Low' | 'Medium' | 'High';
  createdAt?: string;
  updatedAt?: string;
}
