import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../../components/ui/Modal";
import { ActionHistory } from "../../types";
import { Table, Column } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Common";
import { History } from "lucide-react";

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
    const actionMap: Record<string, { variant: "success" | "danger" | "warning" | "info"; label: string }> = {
      Approved: { variant: "success", label: t("approved") },
      Rejected: { variant: "danger", label: t("rejected") },
      Pending: { variant: "warning", label: t("pending") },
      Submitted: { variant: "info", label: t("submitted") },
      Created: { variant: "info", label: t("created") },
    };
    const config = actionMap[action] || { variant: "info", label: action };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return "-";
    }
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
          <span className="text-sm font-medium text-gray-900">{item.by || item.userName || "-"}</span>
          <span className="text-xs text-gray-500">{item.role || item.userRole || "-"}</span>
        </div>
      )
    },
    {
      header: t("action"),
      render: (item) => getActionBadge(item.action || item.status)
    },
    {
      header: t("reason"),
      render: (item) => (
        <span className="text-sm text-gray-500 max-w-xs truncate">
          {item.rejectedReason || item.reason || item.comment || "-"}
        </span>
      )
    },
  ];

  const getKeyExtractor = (item: ActionHistory, index: number) => {
    return item.id || item._id || index.toString();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <History size={20} className="text-indigo-600" />
          <span className="font-bold text-gray-900">{t("action_history")}</span>
        </div>
      }
      size="4xl"
    >
      <div className="max-h-[60vh] overflow-y-auto">
        {history.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <History size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm font-medium">{t("no_history_found")}</p>
            <p className="text-xs mt-1">{t("no_actions_recorded")}</p>
          </div>
        ) : (
          <Table
            data={history}
            columns={columns}
            keyExtractor={getKeyExtractor}
          />
        )}
      </div>
    </Modal>
  );
};