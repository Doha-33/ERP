import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const MainLayout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden">
      {" "}
      {/* تغيير min-h-screen إلى h-screen overflow-hidden */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {" "}
        {/* إضافة h-full overflow-hidden */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {" "}
          {/* نقل overflow-y-auto إلى هنا */}
          {children}
        </main>
      </div>
    </div>
  );
};
