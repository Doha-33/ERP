import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Lock, Save, ChevronDown } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Switch } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import roleService, { Role } from "../../services/role.service";
import { toast } from "sonner";

interface PagePermission {
  module: string;
  page: string;
  read: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  allowAll: boolean;
}

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

const PAGES_LIST = [
  { module: "Dashboard", page: "Main Dashboard" },
  { module: "Sales", page: "Sales Orders" },
  { module: "Sales", page: "Sales Invoice" },
  { module: "Sales", page: "Customers" },
  { module: "Sales", page: "Quotations" },
  { module: "Sales", page: "Products" },
  { module: "Sales", page: "Discounts" },
  { module: "Sales", page: "Promotions" },
  { module: "Inventory", page: "Products" },
  { module: "Inventory", page: "Warehouses" },
  { module: "Inventory", page: "Stock" },
  { module: "HR", page: "Employees" },
  { module: "HR", page: "Attendance" },
  { module: "HR", page: "Payroll" },
  { module: "HR", page: "Leaves" },
  { module: "HR", page: "Requests" },
  { module: "Fleet", page: "Vehicles" },
  { module: "Fleet", page: "Drivers" },
  { module: "Fleet", page: "Trips" },
  { module: "Manufacturing", page: "BOM" },
  { module: "Manufacturing", page: "Orders" },
  { module: "Purchasing", page: "Suppliers" },
  { module: "Purchasing", page: "Purchase Orders" },
  { module: "CRM", page: "Leads" },
  { module: "CRM", page: "Contacts" },
  { module: "CRM", page: "Deals" },
  { module: "Settings", page: "Users" },
  { module: "Settings", page: "Roles" },
  { module: "Settings", page: "Companies" },
  { module: "Settings", page: "Branches" },
];

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  role,
}) => {
  const { t } = useTranslation();
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && role) {
      const fetchPermissions = async () => {
        setIsLoading(true);
        try {
          const data = await roleService.getPermissionsByRole(role._id);
          const mapped = PAGES_LIST.map((p) => {
            const existing = data.find(
              (ex) => ex.module === p.module && ex.page === p.page
            );
            const actions = existing?.actions || {
              read: false,
              create: false,
              edit: false,
              delete: false,
            };
            const allowAll =
              actions.read && actions.create && actions.edit && actions.delete;

            return {
              module: p.module,
              page: p.page,
              read: actions.read || false,
              create: actions.create || false,
              edit: actions.edit || false,
              delete: actions.delete || false,
              allowAll,
            };
          });
          setPermissions(mapped);
        } catch (error) {
          console.error("Error fetching permissions:", error);
          setPermissions(
            PAGES_LIST.map((p) => ({
              ...p,
              read: false,
              create: false,
              edit: false,
              delete: false,
              allowAll: false,
            }))
          );
        } finally {
          setIsLoading(false);
        }
      };
      fetchPermissions();
    }
  }, [isOpen, role]);

  const handleToggle = (index: number, action: keyof PagePermission) => {
    const updated = [...permissions];
    const item = { ...updated[index] };

    if (action === "allowAll") {
      const newVal = !item.allowAll;
      item.allowAll = newVal;
      item.read = newVal;
      item.create = newVal;
      item.edit = newVal;
      item.delete = newVal;
    } else {
      (item as any)[action] = !(item as any)[action];
      item.allowAll = item.read && item.create && item.edit && item.delete;
    }

    updated[index] = item;
    setPermissions(updated);
  };

  const handleSave = async () => {
    if (!role) return;
    setIsSaving(true);
    try {
      for (const p of permissions) {
        await roleService.updatePermissionForRole(role._id, {
          module: p.module,
          page: p.page,
          actions: {
            read: p.read,
            create: p.create,
            edit: p.edit,
            delete: p.delete,
          },
        });
      }
      toast.success(t("permissions_saved_successfully"));
      onClose();
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error(t("failed_to_save_permissions"));
    } finally {
      setIsSaving(false);
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, PagePermission[]>);

  const columns: Column<PagePermission>[] = [
    {
      header: t("page"),
      accessorKey: "page",
      render: (p) => <span className="text-sm text-gray-700">{p.page}</span>,
    },
    {
      header: t("allow_all"),
      className: "text-center",
      render: (p, idx) => (
        <div className="flex justify-center">
          <Switch
            checked={p.allowAll}
            onChange={() => handleToggle(idx!, "allowAll")}
          />
        </div>
      ),
    },
    {
      header: t("read"),
      className: "text-center",
      render: (p, idx) => (
        <div className="flex justify-center">
          <Switch
            checked={p.read}
            onChange={() => handleToggle(idx!, "read")}
          />
        </div>
      ),
    },
    {
      header: t("create"),
      className: "text-center",
      render: (p, idx) => (
        <div className="flex justify-center">
          <Switch
            checked={p.create}
            onChange={() => handleToggle(idx!, "create")}
          />
        </div>
      ),
    },
    {
      header: t("edit"),
      className: "text-center",
      render: (p, idx) => (
        <div className="flex justify-center">
          <Switch
            checked={p.edit}
            onChange={() => handleToggle(idx!, "edit")}
          />
        </div>
      ),
    },
    {
      header: t("delete"),
      className: "text-center",
      render: (p, idx) => (
        <div className="flex justify-center">
          <Switch
            checked={p.delete}
            onChange={() => handleToggle(idx!, "delete")}
          />
        </div>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">
              {t("permissions_for")}: {role?.name}
            </h3>
          </div>
          <p className="text-xs text-gray-500">{t("manage_page_permissions")}</p>
        </div>
      }
      size="xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
            <div key={moduleName} className="border-b border-gray-100 pb-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Shield size={16} className="text-indigo-500" />
                {moduleName}
              </h4>
              <Table
                data={modulePermissions}
                columns={columns}
                keyExtractor={(p) => p.page}
              />
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose} disabled={isSaving}>
          {t("cancel")}
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 px-8"
          isLoading={isSaving}
          disabled={isSaving}
        >
          <Save size={16} />
          {t("save_permissions")}
        </Button>
      </div>
    </Modal>
  );
};