import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Calendar, User, Clock, CheckCircle, XCircle, Target } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { CRMTask } from "../../types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<CRMTask>) => Promise<void>;
  taskToEdit?: CRMTask | null;
  isLoading?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    taskTitle: "",
    description: "",
    assignee: "",
    startDate: "",
    dueDate: "",
    state: "In Progress",
  });

  useEffect(() => {
    if (taskToEdit && isOpen) {
      setFormData({
        taskTitle: taskToEdit.taskTitle || "",
        description: taskToEdit.description || "",
        assignee: taskToEdit.assignee || "",
        startDate: taskToEdit.startDate ? new Date(taskToEdit.startDate).toISOString().split("T")[0] : "",
        dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split("T")[0] : "",
        state: taskToEdit.state || "In Progress",
      });
    } else if (!taskToEdit && isOpen) {
      setFormData({
        taskTitle: "",
        description: "",
        assignee: "",
        startDate: "",
        dueDate: "",
        state: "In Progress",
      });
    }
  }, [taskToEdit, isOpen]);

  const stateOptions = [
    { value: "In Progress", label: t("in_progress"), icon: Clock },
    { value: "Completed", label: t("completed"), icon: CheckCircle },
    { value: "Cancelled", label: t("cancelled"), icon: XCircle },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
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
          {taskToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {taskToEdit ? t("edit_task") : t("add_task")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Task Title */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("task_title")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.taskTitle}
              onChange={(e) => handleChange("taskTitle", e.target.value)}
              placeholder={t("enter_task_title")}
              required
              fullWidth
            />
          </div>

          {/* Assignee */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("assignee")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.assignee}
              onChange={(e) => handleChange("assignee", e.target.value)}
              placeholder={t("enter_assignee_name")}
              required
              fullWidth
            />
          </div>

          {/* State */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("status")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              options={stateOptions}
              required
              fullWidth
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("start_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("due_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Description */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("description")}
            </label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={t("enter_task_description")}
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
            {taskToEdit ? t("save") : t("add_task")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};