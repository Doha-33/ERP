import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Laptop,
  DollarSign,
  FileText,
  CreditCard,
  Tag,
  Calendar,
} from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { DisposalFormModal } from "../../components/assets/DisposalFormModal";
import { useData } from "../../context/DataContext";
import { Disposal as DisposalType } from "../../types";
import { toast } from "sonner";

export const Disposal: React.FC = () => {
  const { t } = useTranslation();
  const {
    disposals,
    assets,
    assetsLoading,
    addDisposal,
    updateDisposal,
    deleteDisposal,
  } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDisposal, setSelectedDisposal] = useState<DisposalType | null>(
    null,
  );
  const [disposalIdToDelete, setDisposalIdToDelete] = useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDisposals = disposals.filter((d) => {
    const asset = d.assetId as any;
    const assetName = asset?.assetName || d.assetName || "";
    const assetCode = asset?.assetCode || d.disposalCode || "";
    return (
      assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.disposalType?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSave = async (
    data: Partial<DisposalType>,
    attachments?: string[],
  ) => {
    try {
      const processedData = {
        ...data,
        attachments: attachments || selectedDisposal?.attachments || [],
      };

      if (selectedDisposal) {
        await updateDisposal(
          selectedDisposal._id || selectedDisposal.id!,
          processedData,
        );
        toast.success(t("disposal_updated_successfully"));
      } else {
        await addDisposal(processedData);
        toast.success(t("disposal_added_successfully"));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save disposal:", error);
      toast.error(t("failed_to_save_disposal"));
    }
  };

  const handleDelete = async () => {
    if (!disposalIdToDelete) return;
    try {
      await deleteDisposal(disposalIdToDelete);
      setIsDeleteModalOpen(false);
      setDisposalIdToDelete(null);
      toast.success(t("disposal_deleted_successfully"));
    } catch (error) {
      console.error("Failed to delete disposal:", error);
      toast.error(t("failed_to_delete_disposal"));
    }
  };

  const getDisposalTypeBadge = (type: string) => {
    const typeLower = type?.toLowerCase(); // غيرنا من t إلى typeLower

    const typeMap: Record<string, { label: string; color: string }> = {
      sale: { label: t("sale"), color: "green" },
      scrap: { label: t("scrap"), color: "red" },
      donation: { label: t("donation"), color: "blue" },
      transfer: { label: t("transfer"), color: "purple" },
    };

    const { label, color } = typeMap[typeLower] || {
      label: type || t("unknown"),
      color: "gray",
    };

    const colorClasses = {
      green: "bg-green-50 text-green-700 border-green-200",
      red: "bg-red-50 text-red-700 border-red-200",
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}
      >
        <Tag size={12} />
        <span>{label}</span>
      </div>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodLower = method?.toLowerCase(); // غيرنا من m إلى methodLower

    const methodMap: Record<string, { label: string; color: string }> = {
      cash: { label: t("cash"), color: "green" },
      "bank transfer": { label: t("bank_transfer"), color: "blue" },
      cheque: { label: t("cheque"), color: "purple" },
      card: { label: t("credit_card"), color: "orange" },
    };

    const { label, color } = methodMap[methodLower] || {
      label: method || t("unknown"),
      color: "gray",
    };

    const colorClasses = {
      green: "bg-green-50 text-green-700 border-green-200",
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}
      >
        <CreditCard size={12} />
        <span>{label}</span>
      </div>
    );
  };

  const columns: Column<DisposalType>[] = [
    { header: t("code"), accessorKey: "disposalCode" },
    {
      header: t("asset_name"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
            <Laptop size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">
              {item.assetName}
            </span>
            <span className="text-xs text-gray-500">{item.model}</span>
          </div>
        </div>
      ),
    },
    { header: t("category"), accessorKey: "category" },
    { header: t("model"), accessorKey: "model" },
    { header: t("serial_number"), accessorKey: "serialNumber" },
    { header: t("brand"), accessorKey: "brand" },
    {
      header: t("purchase_info"),
      render: (item) => (
        <div className="flex flex-col text-sm">
          <div className="flex items-center gap-1">
            <Calendar size={12} className="text-gray-400" />
            <span>
              {item.purchaseDate
                ? new Date(item.purchaseDate).toLocaleDateString()
                : "-"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={12} className="text-gray-400" />
            <span>{item.purchaseCost?.toLocaleString()} SAR</span>
          </div>
        </div>
      ),
    },
    {
      header: t("current_value"),
      render: (item) => (
        <div className="text-sm font-medium text-gray-900">
          {item.currentValue?.toLocaleString()} SAR
        </div>
      ),
    },
    { header: t("purchase_cost"), accessorKey: "purchaseCost" },
    { header: t("purchase_date"), accessorKey: "purchaseDate" },
    {
      header: t("disposal_type"),
      render: (item) => getDisposalTypeBadge(item.disposalType),
    },
    {
      header: t("disposal_value"),
      render: (item) => (
        <div className="text-sm font-medium text-green-600">
          {item.disposalValue?.toLocaleString()} SAR
        </div>
      ),
    },
    {
      header: t("payment_method"),
      render: (item) => getPaymentMethodBadge(item.paymentMethod),
    },
    {
      header: t("invoice_number"),
      accessorKey: "invoiceNumber",
      render: (item) => (
        <div className="flex items-center gap-1">
          <FileText size={12} className="text-gray-400" />
          <span className="text-sm">{item.invoiceNumber}</span>
        </div>
      ),
    },
    { header: t("attachments"), accessorKey: "attachments" },
    {
      header: t("actions"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedDisposal(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setDisposalIdToDelete(item._id || item.id!);
              setIsDeleteModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("disposal_page")}
          </h1>
          <p className="text-gray-500">{t("manage_your_disposal_page")}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={disposals} filename="disposal" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedDisposal(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_disposal")}
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_disposal")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
      </div>

      <Table
        columns={columns}
        data={filteredDisposals}
        keyExtractor={(item) => item._id || item.id!}
        isLoading={assetsLoading}
        selectable
      />

      <DisposalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDisposal={selectedDisposal}
        assets={assets}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_disposal")}
        message={t("are_you_sure_delete_disposal")}
      />
    </div>
  );
};
