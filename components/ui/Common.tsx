import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  X,
  Image as ImageIcon,
  FileSpreadsheet,
  File as FilePdf,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// --- Card ---
export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6 ${className}`}
  >
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5",
    lg: "px-6 py-3 text-lg",
  };

  const variants = {
    primary:
      "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
    outline:
      "border border-gray-300 dark:border-dark-border-strong text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-bg/50",
    ghost:
      "text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 dark:shadow-none dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30",
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${isLoading ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

// --- Dropdown Menu ---
export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = "right",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-48 rounded-xl bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${align === "right" ? "right-0" : "left-0"}`}
        >
          <div className="py-1">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                  ${
                    item.variant === "danger"
                      ? "text-red-600 hover:bg-red-500"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-200"
                  }`}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Export Dropdown Component ---
export const ExportDropdown: React.FC<{ data?: any[]; filename?: string }> = ({
  data,
  filename = "export",
}) => {
  const { t } = useTranslation();

  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    // Get headers from the first object, exclude complex objects/avatars
    const headers = Object.keys(data[0]).filter(
      (key) =>
        typeof data[0][key] !== "object" &&
        !key.toLowerCase().includes("avatar") &&
        !key.toLowerCase().includes("image"),
    );

    const csvRows = [];
    csvRows.push(headers.join(","));

    for (const row of data) {
      const values = headers.map((header) => {
        const val =
          row[header] === null || row[header] === undefined ? "" : row[header];
        const escaped = ("" + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    // Add UTF-8 BOM for Excel Arabic support
    const blob = new Blob(["\ufeff" + csvString], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).filter(
      (key) =>
        typeof data[0][key] !== "object" &&
        !key.toLowerCase().includes("avatar") &&
        !key.toLowerCase().includes("image"),
    );

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const isRtl = document.documentElement.dir === "rtl";

    const html = `
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: 'Inter', 'Cairo', sans-serif; padding: 20px; direction: ${isRtl ? "rtl" : "ltr"}; }
            h1 { text-align: center; color: #4361EE; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #E2E8F0; padding: 10px; text-align: ${isRtl ? "right" : "left"}; font-size: 12px; }
            th { background-color: #F8FAFC; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94A3B8; }
          </style>
        </head>
        <body>
          <h1>${(filename || "Report").toString().toUpperCase()} REPORT</h1>
          <table>
            <thead>
              <tr>${headers.map((h) => `<th>${(h || "").toString().replace(/_/g, " ").toUpperCase()}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row) => `
                <tr>${headers.map((h) => `<td>${row[h] || "-"}</td>`).join("")}</tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <div class="footer">Generated by CodeSoft ERP System on ${new Date().toLocaleString()}</div>
          <script>
            window.onload = function() { window.print(); setTimeout(window.close, 500); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const exportItems: DropdownItem[] = [
    {
      label: "Excel (.csv)",
      icon: <FileSpreadsheet size={18} className="text-green-600" />,
      onClick: exportToCSV,
    },
    {
      label: "PDF (Print)",
      icon: <FilePdf size={18} className="text-red-500" />,
      onClick: exportToPDF,
    },
  ];

  return (
    <Dropdown
      trigger={
        <Button
          variant="outline"
          className="text-primary border-primary bg-blue-50 hover:bg-blue-100 dark:bg-transparent dark:text-primary dark:hover:bg-primary/10"
        >
          {t("export")} <ChevronDown size={16} />
        </Button>
      }
      items={exportItems}
    />
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: any;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = React.forwardRef<
  HTMLInputElement,
  InputProps
>(
  (
    {
      label,
      error,
      icon,
      fullWidth = false, // Add this
      className = "",
      ...props
    },
    ref,
  ) => {
    return (
      <div className={`${fullWidth ? "w-full" : "w-auto"}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`${fullWidth ? "w-full" : "w-auto"} px-4 py-2.5 rounded-lg border bg-white dark:bg-dark-surface 
            border-gray-300 dark:border-dark-border text-gray-900 dark:text-white
            focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? "pl-10 rtl:pr-10 rtl:pl-4" : ""} ${className}`}
            {...props}
          />
          {icon && (
            <div className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  },
);

// --- TextArea ---
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: any;
  error?: string;
  fullWidth?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaProps
>(
  (
    {
      label,
      error,
      fullWidth = false, // Add this
      className = "",
      ...props
    },
    ref,
  ) => (
    <div className={`${fullWidth ? "w-full" : "w-auto"}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`${fullWidth ? "w-full" : "w-auto"} px-4 py-2.5 rounded-lg border bg-white dark:bg-dark-surface 
        border-gray-300 dark:border-dark-border text-gray-900 dark:text-white
        focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none
        disabled:opacity-50 disabled:cursor-not-allowed resize-none
        ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  ),
);

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: any;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = React.forwardRef<
  HTMLSelectElement,
  SelectProps
>(
  (
    {
      label,
      error,
      options,
      placeholder,
      fullWidth = false, // Add this
      className = "",
      ...props
    },
    ref,
  ) => (
    <div className={`${fullWidth ? "w-full" : "w-auto"}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`${fullWidth ? "w-full" : "w-auto"} px-4 py-2.5 rounded-lg border bg-white dark:bg-dark-surface 
          border-gray-300 dark:border-dark-border text-gray-900 dark:text-white
          focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none
          ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
            />
          </svg>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  ),
);

// --- Badge ---
// Common.tsx - تعديل Badge component
export const Badge: React.FC<{
  status?: string;
  variant?: string;
  label?: string;
  children?: React.ReactNode;
  className?: string; // أضيفي هذا السطر
}> = ({ status, variant, label, children, className = "" }) => {
  const badgeStatus = status || variant || "default";
  let styles = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  if (
    [
      "Delivered",
      "Approved",
      "Active",
      "success",
      "PAID",
      "CONFIRMED",
      "REFUNDED",
    ].includes(badgeStatus)
  ) {
    styles =
      "bg-success-bg text-success-text dark:bg-success-bg/10 dark:text-success-text";
  } else if (
    [
      "Pending",
      "On Leave",
      "warning",
      "PARTIALLY_PAID",
      "PENDING",
      "SHIPPED",
    ].includes(badgeStatus)
  ) {
    styles =
      "bg-warning-bg text-warning-text dark:bg-warning-bg/10 dark:text-warning-text";
  } else if (
    [
      "Canceled",
      "Terminated",
      "Inactive",
      "Rejected",
      "danger",
      "error",
      "UNPAID",
      "CANCELLED",
      "REJECTED",
      "EXPIRED",
      "INACTIVE",
    ].includes(badgeStatus)
  ) {
    styles =
      "bg-danger-bg text-danger-text dark:bg-danger-bg/10 dark:text-danger-text";
  }

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${styles} ${className}`}
    >
      {children || label || badgeStatus}
    </span>
  );
};
// --- Switch ---
export const Switch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"}`}
    />
  </button>
);
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "blue" | "green" | "orange";
  trend?: string;
  trendType?: "up" | "down";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = "blue",
  trend,
  trendType,
}) => {
  const colors = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/10",
      text: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-600",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/10",
      text: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-600",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/10",
      text: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-600",
    },
  };

  return (
    <div
      className={`p-4 rounded-xl ${colors[color].bg} border border-gray-100 dark:border-dark-border flex justify-between items-center`}
    >
      <div>
        <p className={`text-sm font-medium mb-1 ${colors[color].text}`}>
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className={`text-2xl font-bold ${colors[color].text}`}>
            {value}
          </h3>
          {trend && (
            <span
              className={`text-xs font-bold ${trendType === "up" ? "text-green-600" : "text-red-600"}`}
            >
              {trend}
            </span>
          )}
        </div>
      </div>
      <div
        className={`w-10 h-10 rounded-full ${colors[color].iconBg} text-white flex items-center justify-center shadow-sm`}
      >
        {icon}
      </div>
    </div>
  );
};

// --- FileUpload ---
interface FileUploadProps {
  label: any;
  expiryDateProps?: any;
  accept?: string;
  onChange?: (file: File | null) => void;
  maxSizeInMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  expiryDateProps,
  accept,
  onChange,
  maxSizeInMB,
}) => {
  const { t } = useTranslation();
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Removed manual size limit rejection to support "Unlimited Size" request
      // Optimization is handled in parent components if needed
      setFile(selectedFile);
      if (onChange) onChange(selectedFile);

      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    if (onChange) onChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </p>
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
          Unlimited Size / High Quality
        </span>
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-all relative min-h-[140px] group"
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />

        {file ? (
          <div className="flex flex-col items-center w-full">
            {preview ? (
              <div className="relative w-full h-32 mb-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-xl shadow-sm"
                />
              </div>
            ) : (
              <div className="w-14 h-14 bg-gray-100 dark:bg-dark-surface rounded-2xl flex items-center justify-center mb-3">
                <FileText className="text-primary" size={28} />
              </div>
            )}
            <p className="text-xs font-bold text-gray-700 dark:text-gray-200 text-center break-all px-4 line-clamp-1">
              {file.name}
            </p>

            <button
              onClick={clearFile}
              className="absolute top-3 right-3 p-1.5 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors shadow-sm"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-dark-surface flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload size={24} className="text-primary" />
            </div>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400 text-center">
              Click or drag to upload
            </p>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center font-medium uppercase tracking-widest">
              Images & PDFs supported
            </p>
          </>
        )}
      </div>
      {expiryDateProps && (
        <div className="pt-1">
          <Input
            label={t("expiry_date")}
            type="date"
            {...expiryDateProps}
            className="text-xs font-bold"
          />
        </div>
      )}
    </div>
  );
};
