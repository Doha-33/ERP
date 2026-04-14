import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  FilePlus,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, Button } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import userService, { User } from "../../services/user.service";
import { UserModal } from "../../components/users/UserModal";
import { DocumentModal } from "../../components/hr/DocumentModal";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";

export const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSave = async (data: any) => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser._id, data);
      } else {
        await userService.createUser(data);
      }
      await fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await userService.deleteUser(deleteId);
        await fetchUsers();
        setDeleteId(null);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleDocSave = async (data: any) => {
    console.log("Saving document...", data);
  };

  const filtered = users.filter(
    (u) =>
      (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-sm shadow-emerald-200";
      case "INACTIVE":
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm shadow-gray-200";
      case "SUSPENDED":
        return "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-200";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  const columns: Column<User>[] = useMemo(
    () => [
      {
        header: t("user_id"),
        render: (u, idx) => (
          <span className="text-[#718096] text-xs">
            {(idx + 1).toString().padStart(3, "0")}
          </span>
        ),
      },
      {
        header: t("user_name"),
        render: (u) => (
          <span className="font-bold text-[#4A5568]">{u?.username || "-"}</span>
        ),
      },
      { header: t("email"), accessorKey: "email", className: "text-[#718096]" },
      {
        header: t("role"),
        render: (u) => (
          <span className="text-[#4A5568] font-medium">
            {u.roleId?.name || u.roleId || "-"}
          </span>
        ),
      },
      {
        header: t("branch_name"),
        render: (u) => (
          <span className="text-[#718096]">
            {u.branchId?.name || u.branchId || "-"}
          </span>
        ),
      },
      {
        header: t("status"),
        render: (u) => (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-white font-semibold ${getStatusColor(u?.state)}`}
          >
            {u?.state === "ACTIVE" ? (
              <CheckCircle size={12} />
            ) : (
              <XCircle size={12} />
            )}
            {u?.state || "-"}
          </span>
        ),
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (u) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setEditingUser(u);
                setIsModalOpen(true);
              }}
              className="p-1.5 text-[#718096] hover:text-primary rounded-lg border border-[#E2E8F0] transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => setDeleteId(u._id)}
              className="p-1.5 text-[#718096] hover:text-red-600 rounded-lg border border-[#E2E8F0] transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3748] dark:text-white">
            {t("users")}
          </h1>
          <p className="text-[#718096] dark:text-gray-400 text-sm">
            {t("user_management_desc")}
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="text-primary border-primary bg-blue-50 hover:bg-blue-100 min-w-[120px] flex items-center justify-between"
          >
            <ChevronDown size={18} /> {t("export")}
          </Button>
          <Button
            variant="outline"
            className="text-primary border-primary bg-blue-50 hover:bg-blue-100 min-w-[160px] flex items-center gap-2"
            onClick={() => setIsDocModalOpen(true)}
          >
            <FilePlus size={18} /> {t("add_document")}
          </Button>
          <Button
            onClick={() => {
              setEditingUser(null);
              setIsModalOpen(true);
            }}
            className="bg-[#4361EE] hover:bg-blue-700 text-white min-w-[160px] flex items-center gap-2"
          >
            <Plus size={18} /> {t("add_user")}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-[#E2E8F0] dark:border-gray-700 rounded-lg text-sm outline-none pr-10 focus:ring-1 focus:ring-primary"
            />
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table
            data={filtered}
            columns={columns}
            keyExtractor={(u) => u._id}
            selectable
            minWidth="min-w-[1000px]"
            className="users-table"
          />
        )}
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        userToEdit={editingUser as any}
      />

      <DocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSave={handleDocSave}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t("confirm_delete")}
        message={t("are_you_sure_delete")}
      />

      <style>{`
        .users-table thead tr {
          background-color: #F5F7FF;
        }
        .users-table th {
          color: #718096;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
