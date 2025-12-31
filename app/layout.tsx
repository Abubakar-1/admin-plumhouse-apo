import "./globals.css";

import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { ReduxProvider } from "@/components/ReduxProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <ReduxProvider>
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                <div className="container mx-auto px-6 py-8">{children}</div>
              </main>
            </div>
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
