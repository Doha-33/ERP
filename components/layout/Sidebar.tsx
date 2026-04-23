import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  FileText,
  LogOut,
  Package,
  ClipboardList,
  DollarSign,
  FileInput,
  UserMinus,
  Calendar,
  AlertTriangle,
  Award,
  Building2,
  MapPin,
  Briefcase,
  Star,
  ShieldCheck,
  Laptop,
  GraduationCap,
  CreditCard,
  MinusCircle,
  Wallet,
  MessageSquare,
  UserCog,
  Shield,
  RefreshCcw,
  Wrench,
  Image as ImageIcon,
  BarChart3,
  ListTree,
  Landmark,
  Edit2,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  FileBarChart,
  Truck,
  Fuel,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>([]);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isRTL = i18n.language === "ar";

  // Auto-expand groups and items based on active route
  React.useEffect(() => {
    const newExpandedGroups: string[] = [];
    const newExpandedItems: string[] = [];

    navGroups.forEach((group) => {
      group.items.forEach((item: any) => {
        if (item.subItems) {
          const isSubItemActive = item.subItems.some(
            (sub: any) => location.pathname === sub.path,
          );
          if (isSubItemActive) {
            newExpandedGroups.push(group.title);
            newExpandedItems.push(item.id);
          }
        } else if (location.pathname === item.path) {
          newExpandedGroups.push(group.title);
        }
      });
    });

    setExpandedGroups((prev) => [...new Set([...prev, ...newExpandedGroups])]);
    setExpandedItems((prev) => [...new Set([...prev, ...newExpandedItems])]);
  }, [location.pathname]);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  const toggleItem = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const navGroups = [
    {
      title: "main",
      items: [
        { id: "1", label: "dashboard", path: "/", icon: LayoutDashboard },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: "user_management",
            items: [
              {
                id: "system-users",
                label: "users",
                path: "/users",
                icon: UserCog,
              },
              {
                id: "system-roles",
                label: "roles",
                path: "/roles",
                icon: Shield,
              },
            ],
          },
        ]
      : []),

    {
      title: "sales",
      items: [
        {
          id: "sales-orders",
          label: "orders",
          path: "/sales/orders",
          icon: ShoppingCart,
        },
        {
          id: "sales-quotations",
          label: "quotations",
          path: "/sales/quotations",
          icon: FileText,
        },
        {
          id: "sales-invoices",
          label: "invoices",
          path: "/sales/invoices",
          icon: FileText,
        },
        {
          id: "sales-returns",
          label: "sales_return",
          path: "/sales/returns",
          icon: RefreshCcw,
        },
        {
          id: "sales-customers",
          label: "customers",
          path: "/sales/customers",
          icon: Users,
        },
        {
          id: "sales-products",
          label: "products",
          path: "/sales/products",
          icon: Package,
        },
        {
          id: "sales-pricing",
          label: "pricing_rules",
          path: "/sales/pricing",
          icon: DollarSign,
        },
        {
          id: "sales-discounts",
          label: "discounts",
          path: "/sales/discounts",
          icon: MinusCircle,
        },
        {
          id: "sales-promotions",
          label: "promotions",
          path: "/sales/promotions",
          icon: Award,
        },
        {
          id: "sales-pos",
          label: "pos",
          path: "/sales/pos",
          icon: LayoutDashboard,
        },
        {
          id: "sales-settings",
          label: "sales_settings",
          path: "/sales/settings",
          icon: UserCog,
        },
      ],
    },
    {
      title: "crm",
      items: [
        {
          id: "crm-contacts",
          label: "contacts",
          path: "/crm/contacts",
          icon: Users,
        },
        {
          id: "crm-deals",
          label: "deals",
          path: "/crm/deals",
          icon: DollarSign,
        },
        {
          id: "crm-leads",
          label: "leads",
          path: "/crm/leads",
          icon: UserMinus,
        },
        {
          id: "crm-pipeline",
          label: "pipeline",
          path: "/crm/pipeline",
          icon: RefreshCcw,
        },
        {
          id: "crm-projects",
          label: "projects",
          path: "/crm/projects",
          icon: Briefcase,
        },
        {
          id: "crm-tasks",
          label: "tasks",
          path: "/crm/tasks",
          icon: ClipboardList,
        },
      ],
    },
    {
      title: "accounting",
      items: [
        {
          id: "accounting-income",
          label: "income",
          path: "/accounting/income",
          icon: DollarSign,
        },
        {
          id: "accounting-expenses",
          label: "expenses",
          path: "/accounting/expenses",
          icon: CreditCard,
        },
        {
          id: "accounting-budget",
          label: "budget",
          path: "/accounting/budget",
          icon: BarChart3,
        },
        {
          id: "accounting-currencies",
          label: "currencies",
          path: "/accounting/currencies",
          icon: DollarSign,
        },
        {
          id: "accounting-exchange-rates",
          label: "exchange_rates",
          path: "/accounting/exchange-rates",
          icon: RefreshCcw,
        },
        {
          id: "accounting-monthly-closing",
          label: "monthly_closing",
          path: "/accounting/monthly-closing",
          icon: Lock,
        },
        {
          id: "accounting-coa",
          label: "chart_of_accounts",
          path: "/accounting/chart-of-accounts",
          icon: ListTree,
        },
        {
          id: "accounting-banks",
          label: "bank_accounts",
          path: "/accounting/bank-accounts",
          icon: Landmark,
        },
        {
          id: "accounting-journal",
          label: "journal_entries",
          path: "/accounting/journal-entries",
          icon: Edit2,
        },
        {
          id: "accounting-ledger",
          label: "general_ledger",
          path: "/accounting/general-ledger",
          icon: BookOpen,
        },
        {
          id: "accounting-receivable",
          label: "accounts_receivable",
          path: "/accounting/accounts-receivable",
          icon: ArrowDownLeft,
        },
        {
          id: "accounting-payable",
          label: "accounts_payable",
          path: "/accounting/accounts-payable",
          icon: ArrowUpRight,
        },
        {
          id: "accounting-taxes",
          label: "taxes",
          path: "/accounting/taxes",
          icon: Landmark,
        },
        {
          id: "accounting-closing",
          label: "monthly_closing",
          path: "/accounting/monthly-closing",
          icon: Lock,
        },
        {
          id: "accounting-reports",
          label: "financial_reports",
          path: "/accounting/financial-reports",
          icon: FileBarChart,
        },
      ],
    },
    {
      title: "fleet",
      items: [
        {
          id: "fleet-dashboard",
          label: "fleet_dashboard",
          path: "/fleet/dashboard",
          icon: LayoutDashboard,
        },
        {
          id: "fleet-vehicles",
          label: "vehicles",
          path: "/fleet/vehicles",
          icon: Truck,
        },
        {
          id: "fleet-drivers",
          label: "drivers",
          path: "/fleet/drivers",
          icon: Users,
        },
        {
          id: "fleet-trips",
          label: "trips",
          path: "/fleet/trips",
          icon: MapPin,
        },
        {
          id: "fleet-fuel",
          label: "fuel_logs",
          path: "/fleet/fuel-logs",
          icon: Fuel,
        },
        {
          id: "fleet-maintenance",
          label: "maintenance",
          path: "/fleet/maintenance",
          icon: Wrench,
        },
        {
          id: "fleet-accidents",
          label: "accidents",
          path: "/fleet/accidents",
          icon: AlertTriangle,
        },
        {
          id: "fleet-expenses",
          label: "vehicle_expenses",
          path: "/fleet/expenses",
          icon: DollarSign,
        },
        {
          id: "fleet-booking",
          label: "vehicle_booking",
          path: "/fleet/booking",
          icon: Calendar,
        },
        {
          id: "fleet-reports",
          label: "fleet_kpi_report",
          path: "/fleet/reports",
          icon: FileBarChart,
        },
        {
          id: "fleet-cost-center",
          label: "cost_center_management",
          path: "/fleet/cost-center",
          icon: Building2,
        },
      ],
    },
    {
      title: "manufacturing",
      items: [
        {
          id: "mfg-dashboard",
          label: "manufacturing_dashboard",
          path: "/manufacturing/dashboard",
          icon: LayoutDashboard,
        },
        {
          id: "mfg-bom",
          label: "bill_of_materials",
          path: "/manufacturing/bom",
          icon: ListTree,
        },
        {
          id: "mfg-orders",
          label: "manufacturing_orders",
          path: "/manufacturing/orders",
          icon: ClipboardList,
        },
        {
          id: "mfg-operations",
          label: "operations",
          path: "/manufacturing/operations",
          icon: Wrench,
        },
        {
          id: "mfg-work-centers",
          label: "work_centers",
          path: "/manufacturing/work-centers",
          icon: Building2,
        },
        {
          id: "mfg-material-req",
          label: "material_requirements",
          path: "/manufacturing/material-requirements",
          icon: Package,
        },
        {
          id: "mfg-wip",
          label: "work_in_progress",
          path: "/manufacturing/wip",
          icon: RefreshCcw,
        },
        {
          id: "mfg-reports",
          label: "production_reports",
          path: "/manufacturing/reports",
          icon: FileBarChart,
        },
      ],
    },
    {
      title: "assets_management",
      items: [
        {
          id: "assets-register",
          label: "asset_register",
          path: "/assets/register",
          icon: ClipboardList,
        },
        {
          id: "assets-maintenance",
          label: "maintenance",
          path: "/assets/maintenance",
          icon: Wrench,
        },
        {
          id: "assets-depreciation",
          label: "depreciation",
          path: "/assets/depreciation",
          icon: DollarSign,
        },
        {
          id: "assets-allocation",
          label: "allocation",
          path: "/assets/allocation",
          icon: Users,
        },
        {
          id: "assets-tracking",
          label: "tracking",
          path: "/assets/tracking",
          icon: MapPin,
        },
        {
          id: "assets-disposal",
          label: "disposal",
          path: "/assets/disposal",
          icon: Trash2,
        },
        {
          id: "assets-audit",
          label: "audit_log",
          path: "/assets/audit",
          icon: FileText,
        },
      ],
    },
    {
      title: "purchases",
      items: [
        {
          id: "purchase-suppliers",
          label: "suppliers",
          path: "/purchase/suppliers",
          icon: Users,
        },
        {
          id: "purchase-orders",
          label: "purchase_order",
          path: "/purchase/orders",
          icon: ShoppingCart,
        },
        {
          id: "purchase-requests",
          label: "purchase_request",
          path: "/purchase/requests",
          icon: FileText,
        },
        {
          id: "purchase-goods-receipts",
          label: "goods_receipts",
          path: "/purchase/goods-receipts",
          icon: Package,
        },
        {
          id: "purchase-invoices",
          label: "purchase_invoice",
          path: "/purchase/invoices",
          icon: FileText,
        },
        {
          id: "purchase-returns",
          label: "return_to_supplier",
          path: "/purchase/returns",
          icon: RefreshCcw,
        },
        {
          id: "purchase-ratings",
          label: "supplier_rating",
          path: "/purchase/ratings",
          icon: Star,
        },
      ],
    },
    {
      title: "inventory",
      items: [
        {
          id: "inventory-products",
          label: "products",
          path: "/inventory/products",
          icon: Package,
        },
        {
          id: "inventory-stocks",
          label: "stocks",
          path: "/inventory/stocks",
          icon: ClipboardList,
        },
        {
          id: "inventory-warehouses",
          label: "warehouses",
          path: "/inventory/warehouses",
          icon: Building2,
        },
        {
          id: "inventory-units",
          label: "units",
          path: "/inventory/units",
          icon: Wrench,
        },
        {
          id: "inventory-categories",
          label: "categories",
          path: "/inventory/categories",
          icon: LayoutDashboard,
        },
        {
          id: "inventory-movements",
          label: "stock_movements",
          path: "/inventory/movements",
          icon: RefreshCcw,
        },
      ],
    },
    {
      title: "reports",
      items: [
        {
          id: "reports-sales",
          label: "sales_report",
          path: "/reports/sales",
          icon: BarChart3,
        },
        {
          id: "reports-purchase",
          label: "purchase_report",
          path: "/reports/purchase",
          icon: BarChart3,
        },
        {
          id: "reports-inventory",
          label: "inventory_report",
          path: "/reports/inventory",
          icon: BarChart3,
        },
        {
          id: "reports-customer",
          label: "customer_report",
          path: "/reports/customer",
          icon: BarChart3,
        },
        {
          id: "reports-hr",
          label: "hr_reports",
          path: "/reports/hr",
          icon: BarChart3,
          subItems: [
            {
              id: "hr-report-summary",
              label: "employee_summary",
              path: "/reports/hr/employee-summary",
              icon: BarChart3,
            },
            {
              id: "hr-report-payroll",
              label: "monthly_payroll",
              path: "/reports/hr/monthly-payroll",
              icon: BarChart3,
            },
            {
              id: "hr-report-annual",
              label: "annual_payroll_cost",
              path: "/reports/hr/annual-payroll-cost",
              icon: BarChart3,
            },
            {
              id: "hr-report-attendance",
              label: "attendance_report",
              path: "/reports/hr/attendance",
              icon: BarChart3,
            },
            {
              id: "hr-report-leave",
              label: "leave_report",
              path: "/reports/hr/leave",
              icon: BarChart3,
            },
            {
              id: "hr-report-contracts",
              label: "expired_contracts",
              path: "/reports/hr/expired-contracts",
              icon: BarChart3,
            },
            {
              id: "hr-report-requests",
              label: "employee_requests",
              path: "/reports/hr/employee-requests",
              icon: BarChart3,
            },
            {
              id: "hr-report-logs",
              label: "payroll_file_logs",
              path: "/reports/hr/payroll-file-logs",
              icon: BarChart3,
            },
            {
              id: "hr-report-gosi",
              label: "gosi_contribution",
              path: "/reports/hr/gosi-contribution",
              icon: BarChart3,
            },
            {
              id: "hr-report-performance",
              label: "performance_report",
              path: "/reports/hr/performance",
              icon: BarChart3,
            },
            {
              id: "hr-report-insurance",
              label: "insurance_report",
              path: "/reports/hr/insurance",
              icon: BarChart3,
            },
          ],
        },
      ],
    },
    {
      title: "hr",
      items: [
        { id: "12", label: "employees", path: "/hr", icon: Users },
        ...(isAdmin
          ? [
              {
                id: "media-archive",
                label: "أرشيف الصور",
                path: "/hr/media-archive",
                icon: ImageIcon,
              },
              {
                id: "21",
                label: "company_page_title",
                path: "/hr/company",
                icon: Building2,
              },
              {
                id: "22",
                label: "branch_page_title",
                path: "/hr/branch",
                icon: MapPin,
              },
              {
                id: "23",
                label: "department_page_title",
                path: "/hr/departments",
                icon: Briefcase,
              },
              { id: "24", label: "jobs", path: "/hr/jobs", icon: Briefcase },
            ]
          : []),
        {
          id: "13",
          label: "attendance",
          path: "/hr/attendance",
          icon: ClipboardList,
        },
        { id: "14", label: "payroll", path: "/hr/payroll", icon: DollarSign },
        { id: "100", label: "loans", path: "/hr/loans", icon: Wallet },
        {
          id: "101",
          label: "responses",
          path: "/hr/responses",
          icon: MessageSquare,
        },
        ...(isAdmin
          ? [
              {
                id: "32",
                label: "deductions",
                path: "/hr/deductions",
                icon: MinusCircle,
              },
              {
                id: "26",
                label: "insurance",
                path: "/hr/insurance",
                icon: ShieldCheck,
              },
            ]
          : []),
        { id: "18", label: "leaves", path: "/hr/leaves", icon: FileInput },
        { id: "15", label: "request", path: "/hr/request", icon: Calendar },
        { id: "17", label: "contracts", path: "/hr/contracts", icon: FileText },
        { id: "25", label: "performance", path: "/hr/performance", icon: Star },
        ...(isAdmin
          ? [
              {
                id: "27",
                label: "assign_laptop",
                path: "/hr/assign-laptop",
                icon: Laptop,
              },
              {
                id: "30",
                label: "access_cards",
                path: "/hr/access-cards",
                icon: CreditCard,
              },
              {
                id: "28",
                label: "initial_training",
                path: "/hr/initial-training",
                icon: GraduationCap,
              },
              {
                id: "19",
                label: "penalties",
                path: "/hr/penalties",
                icon: AlertTriangle,
              },
              { id: "20", label: "rewards", path: "/hr/rewards", icon: Award },
              {
                id: "29",
                label: "end_of_service",
                path: "/hr/end-of-service",
                icon: UserMinus,
              },
              {
                id: "fix-errors",
                label: "Fix System Errors",
                path: "/hr/fix",
                icon: Wrench,
              },
              {
                id: "sync-data",
                label: "Sync Data",
                path: "/hr/sync",
                icon: RefreshCcw,
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Mobile menu button */}
      {/* <button
        onClick={onClose}
        className={`fixed top-4 z-30 lg:hidden p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 transition-all duration-300 ${
          isOpen
            ? isRTL
              ? "right-64"
              : "left-64"
            : isRTL
              ? "right-4"
              : "left-4"
        }`}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button> */}

      <aside
        className={`fixed lg:static top-0 z-30 h-screen w-64 
        bg-white dark:bg-dark-surface border-r rtl:border-r-0 rtl:border-l border-gray-200 dark:border-dark-border
        transition-all duration-300 transform flex flex-col shadow-xl dark:shadow-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 rtl:translate-x-full rtl:lg:translate-x-0"}
        ${isRTL ? "right-0" : "left-0"}
      `}
      >
        {/* Logo Area - Changed to match header background */}
        <div className="h-16 min-h-[4rem] flex items-center px-5 border-b border-gray-100 dark:border-gray-800 bg-inherit">
          {" "}
          <div className="flex items-center gap-2.5 font-bold text-xl">
              <img src="/images/logo.png" alt="Logo" className="w-10 h-6" />
            <span className="dark:text-white text-gray-800 tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              ERP System
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1 custom-scrollbar">
          {navGroups.map((group) => {
            const isGroupExpanded = expandedGroups.includes(group.title);

            return (
              <div key={group.title} className="mb-2">
                {/* Group Title Dropdown Button */}
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold text-primary dark:text-primary-light uppercase tracking-wider hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-primary/40 group-hover:bg-primary transition-all"></span>
                    {t(group.title)}
                  </span>
                  <div className="p-0.5 rounded-md group-hover:bg-primary/10 transition-colors">
                    {isGroupExpanded ? (
                      <ChevronDown size={14} className="text-primary" />
                    ) : (
                      <ChevronIcon
                        size={14}
                        className="text-gray-400 group-hover:text-primary"
                      />
                    )}
                  </div>
                </button>

                {/* Group Items */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${isGroupExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <nav className="mt-2 space-y-1 mr-2 border-r-2 rtl:border-r-0 rtl:border-l-2 border-gray-100 dark:border-dark-border">
                    {group.items.map((item: any) => {
                      const hasSubItems =
                        item.subItems && item.subItems.length > 0;
                      const isItemExpanded = expandedItems.includes(item.id);

                      if (hasSubItems) {
                        return (
                          <div key={item.id} className="space-y-1">
                            <button
                              onClick={() => toggleItem(item.id)}
                              className={`
                                w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${
                                  isItemExpanded
                                    ? "text-primary bg-primary/10 dark:bg-primary/20 shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-primary"
                                }
                              `}
                            >
                              <div className="flex items-center gap-3">
                                <item.icon
                                  size={18}
                                  strokeWidth={1.8}
                                  className={
                                    isItemExpanded
                                      ? "text-primary"
                                      : "text-gray-500 dark:text-gray-500"
                                  }
                                />
                                <span>{t(item.label) || item.label}</span>
                              </div>
                              <div className="p-0.5 rounded-md">
                                {isItemExpanded ? (
                                  <ChevronDown size={14} />
                                ) : (
                                  <ChevronIcon size={14} />
                                )}
                              </div>
                            </button>

                            {isItemExpanded && (
                              <div className="pl-9 space-y-1 border-l-2 rtl:border-l-0 rtl:border-r-2 border-gray-100 dark:border-dark-border ml-5 rtl:mr-5 rtl:ml-0">
                                {item.subItems.map((subItem: any) => (
                                  <NavLink
                                    key={subItem.id}
                                    to={subItem.path}
                                    onClick={() =>
                                      window.innerWidth < 1024 && onClose()
                                    }
                                    className={({ isActive }) => `
                                      flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                                      ${
                                        isActive
                                          ? "text-primary bg-primary/5 dark:bg-primary/10"
                                          : "text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-primary"
                                      }
                                    `}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}
                                    ></span>
                                    <span>
                                      {t(subItem.label) || subItem.label}
                                    </span>
                                  </NavLink>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      const isActive = location.pathname === item.path;

                      return (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          end={item.path === "/"}
                          onClick={() => window.innerWidth < 1024 && onClose()}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${
                              isActive
                                ? "text-primary bg-primary/10 dark:bg-primary/20 shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-primary"
                            }
                          `}
                        >
                          <item.icon
                            size={18}
                            strokeWidth={1.8}
                            className={
                              isActive
                                ? "text-primary"
                                : "text-gray-500 dark:text-gray-500"
                            }
                          />
                          <span>{t(item.label) || item.label}</span>
                          {isActive && (
                            <span className="w-1 h-6 rounded-full bg-primary absolute right-0 rtl:right-auto rtl:left-0"></span>
                          )}
                        </NavLink>
                      );
                    })}
                  </nav>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </>
  );
};
