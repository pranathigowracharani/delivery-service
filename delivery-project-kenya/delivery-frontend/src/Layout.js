import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import "./styles/index.css";
import TopNavbar from "./components/TopNavbar";

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 1024;
      setIsMobile(mobileView);

      if (!mobileView) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`app-layout ${!isMobile && isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        isOpen={isMobile ? isSidebarOpen : true}
        isCollapsed={!isMobile && isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="main-wrapper">
        <TopNavbar onMenuToggle={() => setIsSidebarOpen(true)} />

        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
