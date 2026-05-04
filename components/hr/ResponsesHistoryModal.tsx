import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../../components/ui/Modal";
import { ActionHistory } from "../../types";
import { Table, Column } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Common";

interface ResponsesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ActionHistory[];
}

export const ResponsesHistoryModal: React.FC<ResponsesHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
}) => {
  const { t } = useTranslation();

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { variant: "success" | "danger" | "warning"; label: string }> = {
      Approved: { variant: "success", label: t("approved") },
      Rejected: { variant: "danger", label: t("rejected") },
      Pending: { variant: "warning", label: t("pending") },
    };
    const config = actionMap[action] || { variant: "info", label: action };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString();
  };

  const columns: Column<ActionHistory>[] = [
    {
      header: t("date_time"),
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">{formatDateTime(item.createdAt || item.date)}</span>
        </div>
      )
    },
    {
      header: t("action_by"),
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{item.by || "-"}</span>
          <span className="text-xs text-gray-500">{item.role || "-"}</span>
        </div>
      )
    },
    {
      header: t("action"),
      render: (item) => getActionBadge(item.action)
    },
    {
      header: t("reason"),
      render: (item) => (
        <span className="text-sm text-gray-500">{item.rejectedReason || item.reason || "-"}</span>
      )
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <History size={20} />
          <span className="font-bold text-gray-900">{t("action_history")}</span>
        </div>
      }
      size="4xl"
    >
      {history.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <History size={48} className="mx-auto mb-4 opacity-30" />
          <p>{t("no_history_found")}</p>
        </div>
      ) : (
        <Table
          data={history}
          columns={columns}
          keyExtractor={(item, index) => item.id || index.toString()}
        />
      )}
    </Modal>
  );
};

// Add missing imports
import { History } from "lucide-react";