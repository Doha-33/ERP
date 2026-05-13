// components/hr/ResponseDetails.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, FileText, Clock, User, Calendar, AlertCircle, History, CheckCircle, XCircle } from "lucide-react";
import { Card, Button, Badge } from "../../components/ui/Common";
import { useData } from "../../context/DataContext";
import { ResponsesHistoryModal } from "../../components/hr/ResponsesHistoryModal";

type ResponseType = "eos" | "loans" | "leaves" | "requests";

export const ResponseDetails: React.FC = () => {
  const { t } = useTranslation();
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { 
    responses, 
    actionHistory, 
    fetchActionHistory,
    fetchResponses 
  } = useData();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<any>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any[]>([]);

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
    }
    return "";
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch responses if not already loaded
        if (responses.length === 0) {
          const responseType = type === "eos" ? "end-of-service" : type;
          await fetchResponses(responseType as any);
        }
        await fetchActionHistory();
        
        // Find the item by ID
        const foundItem = responses.find(r => extractId(r) === id);
        setItem(foundItem);
      } catch (error) {
        console.error("Error loading response details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id && type) {
      load();
    }
  }, [id, type, responses, fetchResponses, fetchActionHistory, extractId]);

  const handleShowHistory = async () => {
    try {
      const filteredHistory = actionHistory.filter(h => extractId(h.requestId) === id);
      setSelectedHistory(filteredHistory);
      setIsHistoryOpen(true);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "warning" | "success" | "danger" | "info"; label: string; icon: any }> = {
      Pending: { variant: "warning", label: t("pending"), icon: Clock },
      Approved: { variant: "success", label: t("approved"), icon: CheckCircle },
      Rejected: { variant: "danger", label: t("rejected"), icon: XCircle },
      Submitted: { variant: "info", label: t("submitted"), icon: FileText },
    };
    const config = statusMap[status] || { variant: "info", label: status, icon: FileText };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {Icon && <Icon size={12} />}
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return "-";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">{t("request_not_found")}</h2>
        <p className="text-gray-400 mt-1">{t("request_not_found_description")}</p>
        <Button onClick={() => navigate("/hr/responses")} className="mt-6">
          {t("back_to_responses")}
        </Button>
      </div>
    );
  }

  // Get the request title based on type
  const getRequestTitle = () => {
    switch (type) {
      case "eos": return t("end_of_service_request");
      case "loans": return t("loan_request");
      case "leaves": return t("leave_request");
      case "requests": return t("general_request");
      default: return t("request_details");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/hr/responses")}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getRequestTitle()}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {item.requestNumber || item.id}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleShowHistory}
          className="gap-2"
        >
          <History size={16} />
          {t("action_history")}
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              {t("request_information")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t("status")}</p>
                <div className="mt-1">{getStatusBadge(item.status)}</div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t("date")}</p>
                <p className="text-sm font-medium text-gray-800 mt-1">
                  {formatDateTime(item.date || item.createdAt || item.requestDate)}
                </p>
              </div>
              {item.employeeName && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{t("employee")}</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{item.employeeName}</p>
                  {item.employeeCode && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.employeeCode}</p>
                  )}
                </div>
              )}
              {item.type && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{t("type")}</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{item.type}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Reason Section */}
          {(item.reason || item.loanDetails) && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-indigo-600" />
                {t("reason_details")}
              </h3>
              <div className="space-y-4">
                {item.reason && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t("reason")}</p>
                    <p className="text-sm text-gray-700 mt-1">{item.reason}</p>
                  </div>
                )}
                {item.loanDetails && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t("loan_details")}</p>
                    <p className="text-sm text-gray-700 mt-1">{item.loanDetails}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Rejection Reason */}
          {item.status === "Rejected" && item.rejectedReason && (
            <Card className="p-6 border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                <XCircle size={18} className="text-red-600" />
                {t("rejection_reason")}
              </h3>
              <p className="text-sm text-red-700">{item.rejectedReason}</p>
            </Card>
          )}
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Financial Info (for loans) */}
          {item.loanAmount && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign size={16} className="text-green-600" />
                {t("financial_details")}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{t("loan_amount")}</span>
                  <span className="text-sm font-medium">{item.loanAmount?.toLocaleString()} EGP</span>
                </div>
                {item.installmentAmount && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">{t("installment_amount")}</span>
                    <span className="text-sm font-medium">{item.installmentAmount?.toLocaleString()} EGP</span>
                  </div>
                )}
                {item.numberOfInstallments && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">{t("number_of_installments")}</span>
                    <span className="text-sm font-medium">{item.numberOfInstallments}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Leave Info (for leaves) */}
          {item.startDate && item.endDate && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" />
                {t("leave_period")}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{t("start_date")}</span>
                  <span className="text-sm font-medium">{formatDate(item.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{t("end_date")}</span>
                  <span className="text-sm font-medium">{formatDate(item.endDate)}</span>
                </div>
                {item.leaveDays && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">{t("leave_days")}</span>
                    <span className="text-sm font-medium">{item.leaveDays}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* EOS Info */}
          {item.endOfServiceDate && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" />
                {t("end_of_service_details")}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{t("end_of_service_date")}</span>
                  <span className="text-sm font-medium">{formatDate(item.endOfServiceDate)}</span>
                </div>
                {item.lastWorkingDay && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">{t("last_working_day")}</span>
                    <span className="text-sm font-medium">{formatDate(item.lastWorkingDay)}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* History Modal */}
      <ResponsesHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={selectedHistory}
      />
    </div>
  );
};

// Add missing imports
import { DollarSign } from "lucide-react";