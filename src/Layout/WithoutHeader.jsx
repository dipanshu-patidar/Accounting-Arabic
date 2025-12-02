import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import { Button } from "react-bootstrap";
import { FaCog } from "react-icons/fa";
import './Sidebar.css';
import SettingModal from "../Components/SettingModal";

const WithoutHeader = () => {
  const [screenSize, setScreenSize] = useState(getScreenCategory());
  const [sidebarVisible, setSidebarVisible] = useState(screenSize === 'desktop');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  function getScreenCategory() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width >= 768 && width < 992) return 'tablet';
    return 'desktop';
  }

  const handleToggleSidebar = () => {
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      setSidebarOpen(prev => !prev);
      const offcanvasEl = document.getElementById("mobileSidebar");
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (bsOffcanvas) {
        bsOffcanvas.toggle();
      } else {
        new bootstrap.Offcanvas(offcanvasEl).show();
      }
    } else {
      setSidebarVisible(prev => !prev);
    }
  };

  const handleCloseSidebar = () => {
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      setSidebarOpen(false);
      const offcanvasEl = document.getElementById("mobileSidebar");
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (bsOffcanvas) bsOffcanvas.hide();
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const currentScreen = getScreenCategory();
      setScreenSize(currentScreen);
      if (currentScreen === 'desktop') {
        setSidebarVisible(true);
        setSidebarOpen(false);
      } else {
        setSidebarVisible(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="main-layout d-flex flex-column min-vh-100">
      {/* Main Body */}
      <div className="d-flex" style={{ flexGrow: 1 }}>
        {/* Sidebar - visible on desktop */}
        {screenSize === 'desktop' && sidebarVisible && (
          <div
            className="d-none d-lg-block bg-white border-end"
            style={{
              width: '240px',
              minHeight: '100vh',
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 1
            }}
          >
            <Sidebar isMobile={false} onClose={handleCloseSidebar} />
          </div>
        )}

        {/* Main Content */}
        <main
          className="flex-grow-1 bg-light"
          style={{
            minHeight: "100vh",
            overflowX: "hidden",
            padding: "1rem",
            marginLeft: screenSize === 'desktop' && sidebarVisible ? "240px" : "0",
            transition: "margin 0.3s ease"
          }}
        >
          <Outlet />
        </main>
      </div>

      <div
        style={{
          position: "fixed",
          right: 16,
          top: "55%",
          zIndex: 1000,
        }}
      >
        <Button
          onClick={() => setShowSettings(true)}
          style={{
            backgroundColor: "#53b2a5",
            border: "none",
            borderRadius: "50%",
            width: 48,
            height: 48,
            boxShadow: "0 2px 8px #0001",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            padding: 0,
          }}
        >
          <FaCog color="#fff" />
        </Button>
      </div>

      <SettingModal show={showSettings} handleClose={() => setShowSettings(false)}/>

      {/* Offcanvas Sidebar - for mobile and tablet */}
      {(screenSize === 'mobile' || screenSize === 'tablet') && (
        <div
          className="offcanvas offcanvas-start"
          tabIndex="-1"
          id="mobileSidebar"
          aria-labelledby="mobileSidebarLabel"
          data-bs-scroll="true"
          data-bs-backdrop="false"
          style={{ width: '240px' }}
        >
          <div className="offcanvas-body p-0">
            <Sidebar isMobile={true} onLinkClick={handleCloseSidebar} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WithoutHeader;