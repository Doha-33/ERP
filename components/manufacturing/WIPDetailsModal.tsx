import React, { Activity } from "react";
import { useTranslation } from "react-i18next";
import { 
  Eye, 
  Package, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  User,
  Layers
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Badge } from "../../components/ui/Common";
import { WorkInProgress as WIPType } from "../../types";

interface WIPDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WIPType | null;
}

export const WIPDetailsModal: React.FC<WIPDetailsModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const { t } = useTranslation();

  if (!item) return null;

  const calculateProgress = () => {
    if (!item.planned_qty || item.planned_qty === 0) return 0;
    return Math.round((item.produced_qty / item.planned_qty) * 100);
  };

  const getStatus = () => {
    const progress = calculateProgress();
    if (progress >= 100) return { label: t("completed"), variant: "success" as const };
    return { label: t("in_progress"), variant: "info" as const };
  };

  const status = getStatus();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Eye size={20} />
          {t("wip_details")} - {item.mo_number}
        </div>
      }
      size="4xl"
    >
      <div className="space-y-6">
        {/* Progress Section */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t("production_progress")}</span>
            <span className="text-lg font-bold text-indigo-600">{calculateProgress()}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Package size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("product")}</p>
              <p className="text-sm font-medium text-gray-900">{item.product}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Layers size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("mo_number")}</p>
              <p className="text-sm font-medium text-gray-900">{item.mo_number}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle2 size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("produced_qty")}</p>
              <p className="text-sm font-medium text-gray-900">{item.produced_qty.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Layers size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("planned_qty")}</p>
              <p className="text-sm font-medium text-gray-900">{item.planned_qty.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle size={16} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("scrap_qty")}</p>
              <p className="text-sm font-medium text-red-600">{item.scrap_qty.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
            <div>
              <p className="text-xs text-gray-500">{t("remaining_qty")}</p>
              <p className="text-sm font-medium text-gray-900">
                {(item.planned_qty - item.produced_qty).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar size={16} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("start_date")}</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(item.start_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock size={16} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("expected_end_date")}</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(item.expected_end_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">{t("current_status")}</p>
            <Badge variant={status.variant} className="mt-1">
              {status.label}
            </Badge>
          </div>
          <Button variant="secondary" onClick={onClose}>
            {t("close")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};