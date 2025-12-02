import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProfileModal from "./ProfileModal";
import newlogo from "../assets/watheeq.jpeg";
import "./Sidebar.css";
import "./header.css";

const Header = ({ onToggleSidebar }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 🌐 Google Translate setup + fix for banner hiding header
  useEffect(() => {
    // Inject Google Translate only once
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        if (!document.querySelector("#google_translate_element select")) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,ar,ps", // English, Arabic, Pashto
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            "google_translate_element"
          );
        }

        // 🔧 Hide Google Translate top banner (iframe) continuously
        const hideGoogleBanner = () => {
          const frame = document.querySelector(".goog-te-banner-frame");
          const skip = document.querySelector(".skiptranslate");
          if (frame) frame.remove();
          if (skip) skip.style.display = "none";
          document.body.style.top = "0px";
        };

        // Run immediately + keep checking (banner reappears dynamically)
        hideGoogleBanner();
        const observer = new MutationObserver(hideGoogleBanner);
        observer.observe(document.body, { childList: true, subtree: true });
      };

      // Load the Google Translate script
      const existingScript = document.querySelector(
        "script[src*='translate_a/element.js']"
      );
      if (!existingScript) {
        const script = document.createElement("script");
        script.src =
          "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  return (
    <header
      className="py-3 px-3 header text-light shadow-sm"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "#023347",
        borderBottom: "1px solid rgba(230, 243, 245, 0.3)",
      }}
    >
      {/* Mobile View */}
      <div className="d-flex align-items-center justify-content-between d-lg-none">
        <button
          className="btn"
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="fas fa-bars text-white"></i>
        </button>

        <img
          src={newlogo}
          alt="Logo"
          className="img-fluid sidebar-logo"
          style={{
            height: "40px",
            width: "90px",
            display: "block !important",
            visibility: "visible !important",
            opacity: "1 !important",
          }}
        />

        <Link to="/" className="text-decoration-none">
          <button
            className="btn btn-outline"
            style={{
              borderColor: "#e6f3f5",
              color: "#e6f3f5",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(230, 243, 245, 0.2)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </Link>
      </div>

      {/* Desktop View */}
      <div className="d-flex align-items-center justify-content-between flex-wrap d-none d-lg-flex">
        <div className="d-flex align-items-center flex-grow-1 gap-3">
          <img
            src={newlogo}
            alt="Logo"
            className="img-fluid sidebar-logo"
            style={{
              height: "40px",
              width: "202px",
              display: "block !important",
              visibility: "visible !important",
              opacity: "1 !important",
            }}
          />
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* 🌐 Google Translate */}
          <div
            id="google_translate_element"
            className="d-inline-block d-none d-md-block text-white"
            aria-hidden="false"
          >Select Language</div>

          {/* 🔔 Notifications */}
          <button
            className="btn position-relative"
            style={{ transition: "all 0.3s ease" }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.querySelector("i").style.color = "#e6f3f5";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.querySelector("i").style.color = "white";
            }}
          >
            <i className="far fa-bell text-white fs-5"></i>
            <span
              className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
              style={{
                width: "10px",
                height: "10px",
                boxShadow: "0 0 0 2px rgba(2, 51, 71, 0.3)",
              }}
            ></span>
          </button>

          {/* 👤 Profile Icon */}
          <div
            className="d-flex align-items-center me-3 ms-2"
            onClick={() => setShowProfileModal(true)}
            style={{
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div
              className="rounded-circle text-white d-flex justify-content-center align-items-center"
              style={{
                width: "35px",
                height: "35px",
                fontWeight: "600",
                fontSize: "16px",
                background: "#023347",
                border: "2px solid #e6f3f5",
                boxShadow: "0 4px 8px rgba(2, 51, 71, 0.2)",
              }}
            >
             P 
            </div>
          </div>

          {/* Profile Modal */}
          <ProfileModal
            show={showProfileModal}
            handleClose={() => setShowProfileModal(false)}
          />

          {/* 🔓 Logout */}
          <Link to="/" className="text-decoration-none">
            <button
              className="btn btn-outline"
              style={{
                borderColor: "#e6f3f5",
                color: "#e6f3f5",
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(230, 243, 245, 0.2)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <i className="fas fa-sign-out-alt me-1"></i> Logout
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;