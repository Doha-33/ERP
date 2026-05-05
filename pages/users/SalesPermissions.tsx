import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, ChevronDown, Download } from "lucide-react";
import { Card, Button, Switch, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";

interface PermissionRow {
  id: string;
  roleName: string;
  description: string;
  page: string;
  allowAll: boolean;
  read: boolean;
  edit: boolean;
  add: boolean;
  delete: boolean;
}

export const SalesPermissions: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole] = useState("sales");

  const [data, setData] = useState<PermissionRow[]>([
    {
      id: "1",
      roleName: "Sales Manager",
      description: "Full access to sales modules",
      page: "Sales Orders",
      allowAll: true,
      read: true,
      edit: true,
      add: true,
      delete: true,
    },
    {
      id: "2",
      roleName: "Sales Representative",
      description: "Limited access to sales",
      page: "Sales Orders",
      allowAll: false,
      read: true,
      edit: true,
      add: true,
      delete: false,
    },
    {
      id: "3",
      roleName: "Sales Representative",
      description: "Limited access to sales",
      page: "Sales Invoice",
      allowAll: false,
      read: true,
      edit: false,
      add: true,
      delete: false,
    },
    {
      id: "4",
      roleName: "Sales Representative",
      description: "Limited access to sales",
      page: "Customers",
      allowAll: false,
      read: true,
      edit: true,
      add: true,
      delete: false,
    },
    {
      id: "5",
      roleName: "Viewer",
      description: "Read-only access",
      page: "Sales Orders",
      allowAll: false,
      read: true,
      edit: false,
      add: false,
      delete: false,
    },
  ]);

  const handleToggle = (id: string, field: keyof PermissionRow) => {
    setData((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const newValue = !row[field];
          if (field === "allowAll") {
            return {
              ...row,
              allowAll: newValue,
              read: newValue,
              edit: newValue,
              add: newValue,
              delete: newValue,
            };
          }
          const updatedRow = { ...row, [field]: newValue };
          const allSet =
            updatedRow.read && updatedRow.edit && updatedRow.add && updatedRow.delete;
          return { ...updatedRow, allowAll: allSet };
        }
        return row;
      })
    );
  };

  const filteredData = data.filter(
    (row) =>
      row.page.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.roleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<PermissionRow>[] = [
    {
      header: t("role_name"),
      accessorKey: "roleName",
      render: (r) => <span className="font-medium text-gray-900">{r.roleName}</span>,
    },
    {
      header: t("page"),
      accessorKey: "page",
      render: (r) => <span className="text-gray-600">{r.page}</span>,
    },
    {
      header: t("allow_all"),
      className: "text-center",
      render: (r) => (
        <div className="flex justify-center">
          <Switch
            checked={r.allowAll}
            onChange={() => handleToggle(r.id, "allowAll")}
          />
        </div>
      ),
    },
    {
      header: t("read"),
      className: "text-center",
      render: (r) => (
        <div className="flex justify-center">
          <Switch
            checked={r.read}
            onChange={() => handleToggle(r.id, "read")}
          />
        </div>
      ),
    },
    {
      header: t("edit"),
      className: "text-center",
      render: (r) => (
        <div className="flex justify-center">
          <Switch
            checked={r.edit}
            onChange={() => handleToggle(r.id, "edit")}
          />
        </div>
      ),
    },
    {
      header: t("add"),
      className: "text-center",
      render: (r) => (
        <div className="flex justify-center">
          <Switch
            checked={r.add}
            onChange={() => handleToggle(r.id, "add")}
          />
        </div>
      ),
    },
    {
      header: t("delete"),
      className: "text-center",
      render: (r) => (
        <div className="flex justify-center">
          <Switch
            checked={r.delete}
            onChange={() => handleToggle(r.id, "delete")}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("sales_permission")}</h1>
          <p className="text-gray-500 mt-1">{t("manage_your_permission")}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={filteredData} filename="sales-permissions" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_permissions")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="relative">
          <button className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <span className="text-gray-500">{t("role_name")}:</span>
            <span className="capitalize">{selectedRole}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Table */}
        <Table
          data={filteredData}
          columns={columns}
          keyExtractor={(r) => r.id}
        />
    </div>
  );
};