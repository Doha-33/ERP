import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, Edit2, Mail, Lock, Shield, Building2, FileText } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { User } from "../../services/user.service";
import roleService, { Role } from "../../services/role.service";
import { useData } from "../../context/DataContext";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  userToEdit?: User | null;
  isLoading?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { branches } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    roleId: "",
    branchId: "",
    state: "ACTIVE",
    notes: "",
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleService.getAllRoles();
        setRoles(data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (userToEdit && isOpen) {
      setFormData({
        username: userToEdit.username || "",
        email: userToEdit.email || "",
        password: "",
        roleId: typeof userToEdit.roleId === "object" 
          ? (userToEdit.roleId as any)?._id 
          : userToEdit.roleId || "",
        branchId: typeof userToEdit.branchId === "object" 
          ? (userToEdit.branchId as any)?._id || (userToEdit.branchId as any)?.id 
          : userToEdit.branchId || "",
        state: userToEdit.state || "ACTIVE",
        notes: (userToEdit as any).notes || "",
      });
    } else if (!userToEdit && isOpen) {
      setFormData({
        username: "",
        email: "",
        password: "",
        roleId: roles[0]?._id || "",
        branchId: branches[0]?._id || branches[0]?.id || "",
        state: "ACTIVE",
        notes: "",
      });
    }
  }, [userToEdit, isOpen, roles, branches]);

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const roleOptions = roles.map(r => ({
    value: r._id,
    label: r.name,
  }));

  const branchOptions = branches.map(b => ({
    value: b._id || b.id,
    label: b.name,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData = { ...formData };
      // Remove password if empty when editing
      if (userToEdit && !submitData.password) {
        delete submitData.password;
      }
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {userToEdit ? <Edit2 size={20} /> : <UserPlus size={20} />}
          {userToEdit ? t("edit_user") : t("add_user")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("username")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder={t("enter_username")}
              required
              fullWidth
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("status")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              options={statusOptions}
              required
              fullWidth
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("email")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder={t("enter_email")}
              required
              fullWidth
            />
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("role")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.roleId}
              onChange={(e) => handleChange("roleId", e.target.value)}
              options={roleOptions}
              placeholder={t("select_role")}
              required
              fullWidth
            />
          </div>

          {/* Branch */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("branch")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.branchId}
              onChange={(e) => handleChange("branchId", e.target.value)}
              options={branchOptions}
              placeholder={t("select_branch")}
              required
              fullWidth
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("password")} {!userToEdit && <span className="text-red-500">*</span>}
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder={userToEdit ? t("leave_blank_to_keep") : t("enter_password")}
              required={!userToEdit}
              fullWidth
            />
          </div>

          {/* Notes */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("notes")}
            </label>
            <TextArea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder={t("enter_notes")}
              rows={3}
              fullWidth
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting || isLoading}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {userToEdit ? t("save") : t("add_user")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};