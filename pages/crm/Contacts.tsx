import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, User, Phone, MapPin, Tag, Star, Filter, X, Users, Mail, Building, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { ContactModal } from "../../components/crm/ContactModal";
import { useCRM } from "../../context/crm/CRMContext";
import { CRMContact } from "../../types";
import crmService from "../../services/crm.service";
import { toast } from "sonner";
import { GroupsTab } from "../../components/crm/GroupsTab";
import { PricelistsTab } from "../../components/crm/PricelistsTab";
import * as XLSX from "xlsx"; // أضف هذا الـ import

export const Contacts: React.FC = () => {
  const { t } = useTranslation();
  const { 
    contacts, 
    loading, 
    addContact, 
    updateContact, 
    deleteContact,
    groups,
    fetchContacts,
  } = useCRM();
  
  const [activeTab, setActiveTab] = useState<"contacts" | "groups" | "pricelists">("contacts");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<CRMContact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [groupIdFilter, setGroupIdFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  // Helper to get group name from contact (handles both object and string)
  const getGroupName = useCallback((contact: CRMContact): string => {
    const group = contact.groupId;
    if (!group) return "-";
    if (typeof group === "object" && group !== null) {
      return (group as any).name || "-";
    }
    const foundGroup = groups.find(g => extractId(g) === group);
    return foundGroup?.name || "-";
  }, [groups, extractId]);

  // Helper to check if contact belongs to a group
  const isContactInGroup = useCallback((contact: CRMContact, groupId: string): boolean => {
    if (!groupId) return true;
    const contactGroupId = extractId(contact.groupId);
    return contactGroupId === groupId;
  }, [extractId]);

  // Fetch contacts when component mounts
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, groupIdFilter]);

  const handleSave = async (contactData: Partial<CRMContact>) => {
    try {
      setIsLoading(true);
      if (editingContact) {
        const contactId = extractId(editingContact);
        await updateContact(contactId, contactData);
        toast.success(t("contact_updated_successfully"));
      } else {
        await addContact(contactData);
        toast.success(t("contact_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingContact(null);
      await fetchContacts();
    } catch (error: any) {
      console.error("Error saving contact:", error);
      const message = error?.response?.data?.message || error?.message || t("failed_to_save_contact");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((contact: CRMContact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteContact(deleteId);
        toast.success(t("contact_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchContacts();
      } catch (error) {
        toast.error(t("failed_to_delete_contact"));
      }
    }
  }, [deleteId, deleteContact, t, fetchContacts]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteContact(id)));
      toast.success(t("contacts_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchContacts();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_contacts"));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Excel Import via backend API with a client-side parsing fallback
  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // First attempt: Try importing via backend API
      try {
        const response = await crmService.importContacts(file);
        if (response && response.success) {
          toast.success(t("import_successful") || "تم الاستيراد بنجاح");
          await fetchContacts();
          return;
        }
      } catch (apiError: any) {
        console.warn("Backend API import failed, falling back to client-side import...", apiError);
        const errMsg = apiError?.response?.data?.message || apiError?.message || "";
        
        // If the error is about missing uploads directory or other ENOENT, we use the fallback
        if (errMsg.includes("ENOENT") || errMsg.includes("uploads") || errMsg.includes("no such file")) {
          toast.info(t("processing_locally") || "جاري الاستيراد محلياً لتجنب مشكلة الخادم...");
        } else {
          // If it's a different error, we still try the local fallback to be safe and helpful
          toast.info(t("processing_locally") || "جاري محاولة الاستيراد محلياً...");
        }
      }

      // Fallback: Client-side Excel parsing & item-by-item creation
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        try {
          const r = row as any;
          // Exact and helper translation mapping
          const nameValue = r.name || r.الاسم || r["الاسم بالعربية"] || r["الاسم عربي"] || r.customerName || r.customer_name;
          const nameEnValue = r.nameEn || r.الاسم_بالانجليزية || r["الاسم بالانجليزية"] || r["الاسم انجليزي"] || r.name_en;
          
          if (!nameValue && !nameEnValue) {
            console.warn("Skipping row due to missing name:", r);
            errorCount++;
            continue;
          }

          const contactData: Partial<CRMContact> = {
            name: nameValue || nameEnValue || "",
            nameEn: nameEnValue || "",
            phone: r.phone || r.الهاتف || r.التليفون || r.تليفون || r.phoneNumber || r.phone_number || "",
            mobile: r.mobile || r.الجوال || r.الموبايل || r.موبايل || r.mobileNumber || r.mobile_number || "",
            email: r.email || r.البريد_الالكتروني || r["البريد الالكتروني"] || r["البريد الإلكتروني"] || "",
            address: r.address || r.العنوان || r["العنوان بالتفصيل"] || "",
            notes: r.notes || r.ملاحظات || "",
            isCustomer: r.isCustomer === true || r.isCustomer === "true" || r.isCustomer === 1 || r.عميل === "نعم" || r.عميل === true || r.عميل === "yes" || !(r.isSupplier === true || r.مورد === "نعم"), // default to customer
            isSupplier: r.isSupplier === true || r.isSupplier === "true" || r.isSupplier === 1 || r.مورد === "نعم" || r.مورد === true || r.مورد === "yes",
            companyName: r.companyName || r.companyNameAr || r.اسم_الشركة || r["اسم الشركة"] || "",
            companyNameEn: r.companyNameEn || r.companyName_en || r.اسم_الشركة_بالانجليزية || r["اسم الشركة بالانجليزية"] || "",
            rating: Number(r.rating) || Number(r.التقييم) || 0,
            status: (r.status === "Inactive" || r.status === "inactive" || r.الحالة === "غير نشط") ? "Inactive" : "Active",
            pricelistId: r.pricelistId || r.pricelist_id || r.قائمة_الاسعار || r["قائمة الأسعار"] || r["قائمة الاسعار"] || "",
            groupId: r.groupId || r.group_id || r.المجموعة || r.مجموعة || r["مجموعة العملاء"] || "",
            tags: r.tags || r.الوسوم || r.التاجات || r["الوسوم"] || "",
            location: r.location || r.الموقع || r.العنوان || ""
          };

          await addContact(contactData);
          successCount++;
        } catch (err) {
          errorCount++;
          console.error("Error importing row:", row, err);
        }
      }

      await fetchContacts();
      toast.success(t("import_successful_details", { success: successCount, error: errorCount }) || `تم استيراد ${successCount} بنجاح وفشل ${errorCount}`);
    } catch (error: any) {
      console.error("Error importing Excel totally:", error);
      const msg = error?.response?.data?.message || error?.message || t("failed_to_import");
      toast.error(msg);
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  // Apply all filters (client-side filtering)
  const filteredContacts = useMemo(() => {
    let result = [...contacts];
    
    // Apply group filter
    if (groupIdFilter) {
      result = result.filter(c => isContactInGroup(c, groupIdFilter));
    }
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(c => c.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter === "customer") {
      result = result.filter(c => c.isCustomer === true);
    } else if (typeFilter === "supplier") {
      result = result.filter(c => c.isSupplier === true);
    } else if (typeFilter === "both") {
      result = result.filter(c => c.isCustomer === true && c.isSupplier === true);
    }
    
    return result;
  }, [contacts, searchTerm, statusFilter, typeFilter, groupIdFilter, isContactInGroup]);

  // Pagination logic
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredContacts.slice(startIndex, endIndex);
  }, [filteredContacts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage) || 1;

  // Statistics
  const totalContacts = filteredContacts.length;
  const activeCount = filteredContacts.filter(c => c.status === "Active").length;
  const customerCount = filteredContacts.filter(c => c.isCustomer === true).length;
  const supplierCount = filteredContacts.filter(c => c.isSupplier === true).length;
  const avgRating = filteredContacts.length > 0
    ? (filteredContacts.reduce((sum, c) => sum + (c.rating || 0), 0) / filteredContacts.length).toFixed(1)
    : 0;

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "Active" ? "success" : "danger"}>
        {status === "Active" ? t("active") : t("inactive")}
      </Badge>
    );
  };

  const getTagBadge = (tags: string) => {
    if (!tags) return <span className="text-gray-400">-</span>;
    
    const tagsArray = tags.split(/[,\s]+/).filter(tag => tag.trim().length > 0);
    if (tagsArray.length === 0) return <span className="text-gray-400">-</span>;
    
    const tagMap: Record<string, { variant: "success" | "warning" | "info" | "purple" | "default"; label: string }> = {
      VIP: { variant: "purple", label: t("vip") },
      Promotion: { variant: "warning", label: t("promotion") },
      "Cold Lead": { variant: "info", label: t("cold_lead") },
      Wholesale: { variant: "default", label: "Wholesale" },
    };
    
    return (
      <div className="flex flex-wrap gap-1">
        {tagsArray.slice(0, 3).map((tag, index) => {
          const normalizedTag = tag.trim();
          const config = tagMap[normalizedTag] || { variant: "default", label: normalizedTag };
          return (
            <Badge key={index} variant={config.variant as any}>
              {config.label}
            </Badge>
          );
        })}
        {tagsArray.length > 3 && <Badge variant="default">+{tagsArray.length - 3}</Badge>}
      </div>
    );
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        <span className="text-sm font-medium text-gray-700 mr-1">{rating}</span>
        {[...Array(Math.floor(rating))].map((_, i) => (
          <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
        ))}
        {[...Array(5 - Math.floor(rating))].map((_, i) => (
          <Star key={i} size={14} className="text-gray-300" />
        ))}
      </div>
    );
  };

  const getContactTypeBadge = (contact: CRMContact) => {
    const types = [];
    if (contact.isCustomer) types.push(t("customer"));
    if (contact.isSupplier) types.push(t("supplier"));
    
    if (types.length === 0) return <span className="text-gray-400">-</span>;
    if (types.length === 2) return <Badge variant="info">{t("customer_supplier")}</Badge>;
    return <Badge variant={contact.isCustomer ? "success" : "warning"}>{types[0]}</Badge>;
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "Active", label: t("active") },
    { value: "Inactive", label: t("inactive") },
  ];

  const typeOptions = [
    { value: "", label: t("all_types") },
    { value: "customer", label: t("customers_only") },
    { value: "supplier", label: t("suppliers_only") },
    { value: "both", label: t("customer_and_supplier") },
  ];

  const groupFilterOptions = [
    { value: "", label: t("all_groups") || "All Groups" },
    ...groups.map(g => ({
      value: extractId(g),
      label: g.name
    }))
  ];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const columns: Column<CRMContact>[] = useMemo(
    () => [
      {
        header: t("contact"),
        render: (c) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{c.name}</span>
              <span className="text-xs text-gray-500">{c.contactCode}</span>
            </div>
          </div>
        )
      },
      {
        header: t("contact_info"),
        render: (c) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Phone size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{c.phone}</span>
            </div>
            {c.email && (
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500 truncate max-w-[150px]">{c.email}</span>
              </div>
            )}
          </div>
        )
      },
      {
        header: t("customer_group") || "Group",
        render: (c) => {
          const groupName = getGroupName(c);
          return groupName !== "-" ? (
            <Badge variant="info">{groupName}</Badge>
          ) : (
            <span className="text-gray-400">-</span>
          );
        }
      },
      {
        header: t("type"),
        render: (c) => (
          <div className="flex flex-col gap-1">
            {getContactTypeBadge(c)}
            {getTagBadge(c.tags || "")}
          </div>
        )
      },
      {
        header: t("rating"),
        render: (c) => renderRating(c.rating || 0)
      },
      {
        header: t("status"),
        render: (c) => getStatusBadge(c.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (c) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(c)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(extractId(c))}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t("delete")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      }
    ],
    [t, handleEdit, handleDelete, extractId, getGroupName]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("contacts") || "جهات الاتصال والعملاء"}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_crm_contacts_desc") || "إدارة جهات الاتصال والمجموعات وقوائم الأسعار"}
          </p>
        </div>
        
        {activeTab === "contacts" && (
          <div className="flex gap-3">
            {selectedIds.length > 0 && (
              <Button
                variant="danger"
                onClick={() => setIsBulkConfirmOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 size={18} />
                {t("delete_selected")} ({selectedIds.length})
              </Button>
            )}
            <ExportDropdown data={filteredContacts} filename="contacts" />
            
            {/* Import Button */}
            <div className="flex items-center">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleImportExcel}
                className="hidden"
                disabled={isImporting}
                id="excel-import"
              />
              <Button
                variant="secondary"
                className="border-gray-300"
                disabled={isImporting}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("excel-import")?.click();
                }}
              >
                <Upload size={18} className="ml-2" />
                {isImporting ? t("importing") || "جاري الاستيراد..." : t("import_from_excel") || "استيراد من Excel"}
              </Button>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setEditingContact(null);
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 font-medium"
            >
              <Plus size={18} />
              {t("add_contact")}
            </Button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        <button
          onClick={() => setActiveTab("contacts")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
            activeTab === "contacts"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {t("contacts") || "جهات الاتصال (Contacts)"}
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
            activeTab === "groups"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {t("customer_groups") || "مجموعات العملاء (Groups)"}
        </button>
        <button
          onClick={() => setActiveTab("pricelists")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
            activeTab === "pricelists"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {t("pricelists") || "قوائم الأسعار (Pricelists)"}
        </button>
      </div>

      {/* Conditionally Render Tabs */}
      {activeTab === "groups" ? (
        <GroupsTab />
      ) : activeTab === "pricelists" ? (
        <PricelistsTab />
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-indigo-600" />
                <p className="text-xs text-gray-500">{t("total_contacts")}</p>
              </div>
              <p className="text-xl font-bold text-gray-900 mt-1">{totalContacts}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <User size={16} className="text-green-600" />
                <p className="text-xs text-gray-500">{t("active")}</p>
              </div>
              <p className="text-xl font-bold text-green-600 mt-1">{activeCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" />
                <p className="text-xs text-gray-500">{t("customers")}</p>
              </div>
              <p className="text-xl font-bold text-blue-600 mt-1">{customerCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <TrendingDown size={16} className="text-orange-600" />
                <p className="text-xs text-gray-500">{t("suppliers")}</p>
              </div>
              <p className="text-xl font-bold text-orange-600 mt-1">{supplierCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-500" />
                <p className="text-xs text-gray-500">{t("avg_rating")}</p>
              </div>
              <p className="text-xl font-bold text-yellow-600 mt-1">{avgRating}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("search_contacts")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={groupIdFilter}
              onChange={(e) => setGroupIdFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {groupFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {(groupIdFilter || typeFilter || statusFilter || searchTerm) && (
              <button
                onClick={() => {
                  setGroupIdFilter("");
                  setTypeFilter("");
                  setStatusFilter("");
                  setSearchTerm("");
                }}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X size={14} />
                {t("clear_filters")}
              </button>
            )}
          </div>

          {/* Table */}
          <Table
            data={paginatedContacts}
            columns={columns}
            keyExtractor={(item) => extractId(item)}
            isLoading={loading || isLoading}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />

          {/* Pagination */}
          {filteredContacts.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("previous") || "Previous"}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("next") || "Next"}
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {t("showing") || "Showing"} <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>{" "}
                    {t("to") || "to"} <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredContacts.length)}</span>{" "}
                    {t("of") || "of"} <span className="font-medium">{filteredContacts.length}</span> {t("results") || "results"}
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">{t("previous") || "Previous"}</span>
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === pageNum
                              ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">{t("next") || "Next"}</span>
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSave}
        contactToEdit={editingContact}
        isLoading={loading || isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_contact")}
        message={t("are_you_sure_delete_contact")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_contacts")}
        message={t("are_you_sure_delete_contacts", { count: selectedIds.length })}
      />
    </div>
  );
};