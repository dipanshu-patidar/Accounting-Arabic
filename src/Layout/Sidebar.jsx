import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isMobile, onLinkClick }) => {
  const { pathname } = useLocation();
  const [activePath, setActivePath] = useState(pathname);
  const [role, setRole] = useState("");
  const [expandedMenu, setExpandedMenu] = useState({});
  const [isTranslateFixed, setIsTranslateFixed] = useState(false);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  // Auto Apply Arabic on Sidebar load (Google Translate Fix)
  useEffect(() => {
    // Function to apply Arabic translation
    const applyArabicTranslation = () => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        // If already Arabic, don't change
        if (select.value !== "ar") {
          select.value = "ar";
          select.dispatchEvent(new Event("change"));
        }

        // RTL direction apply again
        document.documentElement.dir = "rtl";
        document.body.classList.add("rtl-mode");
        
        setIsTranslateFixed(true);
        return true;
      }
      return false;
    };

    // Try immediately
    if (applyArabicTranslation()) return;

    // If not successful, try every 500ms
    const interval = setInterval(() => {
      if (applyArabicTranslation()) {
        clearInterval(interval);
      }
    }, 500);

    // Also try when DOM is fully loaded
    const handleDOMContentLoaded = () => {
      if (applyArabicTranslation()) {
        clearInterval(interval);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    } else {
      handleDOMContentLoaded();
    }

    return () => {
      clearInterval(interval);
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
    };
  }, []);

  // Additional effect to ensure RTL is maintained even after page reload
  useEffect(() => {
    // Check if RTL is applied, if not, apply it
    if (document.documentElement.dir !== "rtl" || !document.body.classList.contains("rtl-mode")) {
      document.documentElement.dir = "rtl";
      document.body.classList.add("rtl-mode");
    }

    // Re-apply Arabic translation if needed
    const interval = setInterval(() => {
      const select = document.querySelector(".goog-te-combo");
      if (select && select.value !== "ar") {
        select.value = "ar";
        select.dispatchEvent(new Event("change"));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTranslateFixed]);

  const handleMenuClick = (path) => {
    setActivePath(path);
    if (isMobile) {
      const offcanvas = window.bootstrap?.Offcanvas.getInstance(
        document.getElementById("mobileSidebar")
      );
      offcanvas?.hide();
    }
    onLinkClick?.();
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenu((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  /**
   * Renders a section with a clickable header to expand/collapse sub-items.
   * @param {string} title - The title of the section (e.g., "Accounting").
   * @param {Array} items - An array of sub-items, each with `to` and `label`.
   * @param {string} icon - The FontAwesome icon class for the header.
   */
  const renderExpandableSection = (title, items, icon) => {
    // Create a unique key for the section to manage its expanded state
    const menuKey = title.replace(/\s+/g, "-").toLowerCase();
    const isExpanded = expandedMenu[menuKey];

    // Check if any child item is the currently active path
    const hasActiveChild = items.some((item) => item.to === activePath);

    return (
      <div className="mb-3" key={menuKey}>
        {/* Clickable Header */}
        <div
          className={`nav-item ps-2 d-flex align-items-center sidebar-link px-3 py-2 cursor-pointer ${
            hasActiveChild ? "active-link" : ""
          }`}
          style={linkStyle}
          onClick={() => toggleMenu(menuKey)}
        >
          <i className={`me-3 ${icon}`} style={iconStyle}></i>
          <span>{title}</span>
          <i
            className={`ms-auto fas ${isExpanded ? "fa-minus" : "fa-plus"}`}
            style={{ fontSize: "0.8rem", opacity: 0.7 }}
          ></i>
        </div>

        {/* Submenu Items - rendered only if the section is expanded */}
        {isExpanded && (
          <div className="submenu ps-4">
            {items.map((item) => (
              <div className="nav-item" key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => handleMenuClick(item.to)}
                  className={`nav-link d-flex align-items-center sidebar-link px-3 py-1 small ${
                    activePath === item.to ? "active-sublink" : ""
                  }`}
                  style={{
                    ...linkStyle,
                    paddingRight: "3.5rem", // More indent for sub-items
                    fontSize: "14px",
                    color: "#ccc",
                  }}
                >
                  <span>{item.label}</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /**
   * Renders a single, non-expandable navigation item.
   */
  const navItem = (to, icon, label) => (
    <div className="nav-item ps-2" key={to}>
      <Link
        to={to}
        onClick={() => handleMenuClick(to)}
        className={`nav-link d-flex align-items-center sidebar-link px-3 py-2 ${
          activePath === to ? "active-link" : ""
        }`}
        style={linkStyle}
      >
        <i className={`me-3 ${icon}`} style={iconStyle}></i>
        <span>{label}</span>
      </Link>
    </div>
  );

  /**
   * Generates the menu structure based on the user's role.
   */
  const getMenuItems = () => {
    const menuItems = {
      SUPERADMIN: [
        navItem("/dashboard", "fas fa-tachometer-alt", "Dashboard"),
        navItem("/superadmin/company", "fas fa-building", "Company"),
        navItem("/superadmin/planpricing", "fas fa-tags", "Plans & Pricing"),
        navItem(
          "/superadmin/requestplan",
          "fas fa-envelope-open",
          "Request Plan"
        ),
        navItem("/superadmin/payments", "fas fa-credit-card", "Payments"),
        navItem(
          "/superadmin/manage-passwords",
          "fas fa-key",
          "Manage Passwords"
        ),
      ],
      COMPANY: [
        navItem("/company/dashboard", "fas fa-tachometer-alt", "Dashboard"),

        renderExpandableSection(
          "User Management",
          [
            { to: "/company/users", label: "Users" },
            { to: "/company/rolespermissions", label: "Roles & Permissions" },
          ],
          "fas fa-users"
        ),

        renderExpandableSection(
          "Sales",
          [
            { to: "/company/Invoice", label: "Sales Order" },
            { to: "/company/salesreturn", label: "Sales Return" },
          ],
          "fas fa-chart-line"
        ),

        renderExpandableSection(
          "Purchases",
          [
            { to: "/company/purchasorderr", label: "Purchase Orders" },
            { to: "/company/purchasereturn", label: "Purchase Return" },
          ],
          "fas fa-shopping-cart"
        ),

        renderExpandableSection(
          "Accounting",
          [
            { to: "/company/allacounts", label: "Charts of Accounts" },
            { to: "/company/customersdebtors", label: "Customers/Debtors" },
            { to: "/company/vendorscreditors", label: "Vendors/Creditors" },
            { to: "/company/cashflow", label: "Cash Flow" },
            { to: "/company/profitloss", label: "Profit & Loss" },
            { to: "/company/balancesheet", label: "Balance Sheet" },
            { to: "/company/expense", label: "Expenses" },
            { to: "/company/vatreport", label: "Vat Report" },
            { to: "/company/taxreport", label: "Tax Report" },
          ],
          "fas fa-calculator"
        ),

        renderExpandableSection(
          "Inventory",
          [
            { to: "/company/warehouse", label: "Warehouse" },
            { to: "/company/unitofmeasure", label: "Unit of measure" },
            { to: "/company/inventorys", label: "Product & Inventory" },
            { to: "/company/service", label: "Service" },
            { to: "/company/stocktranfer", label: "StockTransfer" },
            {
              to: "/company/inventory-adjustment",
              label: "Inventory Adjustment",
            },
          ],
          "fas fa-warehouse"
        ),

        renderExpandableSection(
          "HR & Payroll",
          [
            {
              to: "/company/department-analytics-dashboard",
              label: "Dashboard",
            },
            { to: "/company/employeemanagement", label: "Employee Management" },
            { to: "/company/attendance", label: "Attendance" },
            { to: "/company/leave-requests", label: "Leave Requests" },
            { to: "/company/payroll", label: "Payroll" },
            { to: "/company/documents", label: "Documents" },
            { to: "/company/end-of-service", label: "End of Service" },
            { to: "/company/salarystructure", label: "Salary Structure" },
            { to: "/company/generatepayroll", label: "Generate Payroll" },
            { to: "/company/payslipreports", label: "Payslip Report" },
            { to: "/company/payrollreports", label: "Payroll Report" },
            { to: "/company/payrollsettings", label: "Payroll Setting" },
          ],
          "fas fa-users-cog"
        ),

        renderExpandableSection(
          "Task Management",
          [
            { to: "/company/task-management", label: "Task Management" },
            { to: "/company/department-summary", label: "Department Summary" },
            { to: "/company/task-progress", label: "Task Progress" },
          ],
          "fas fa-tasks"
        ),

        renderExpandableSection(
          "Compliance & Integration",
          [
            { to: "/company/zatca-e-invoicing", label: "ZATCA e-Invoicing" },
            {
              to: "/company/saudicomplianceintegration",
              label: "Compliance Integration",
            },
          ],
          "fas fa-certificate"
        ),

        navItem("/company/audit-logs", "fas fa-list-alt", "Audit Logs"),
        navItem(
          "/company/support-tickets",
          "fas fa-life-ring",
          "Support Tickets"
        ),

        renderExpandableSection(
          "Settings",
          [
            { to: "/company/companyinfo", label: "Company Info" },
            { to: "/company/password-request", label: "Password Requests" },
          ],
          "fas fa-cog"
        ),

        navItem("/company/ponitofsale", "fas fa-desktop", "POS Screen"),

        renderExpandableSection(
          "Voucher",
          [
            { to: "/company/createvoucher", label: "Create Voucher" },
            { to: "/company/expense", label: "Expenses" }, // Note: This is a duplicate, you might want to remove one
            { to: "/company/income", label: "Income" },
            { to: "/company/contravoucher", label: "Contra Voucher" },
          ],
          "fas fa-file-invoice-dollar"
        ),

        renderExpandableSection(
          "Reports",
          [
            { to: "/company/salesreport", label: "Sales Report" },
            { to: "/company/purchasereport", label: "Purchase Report" },
            { to: "/company/posreport", label: "POS Report" },
            { to: "/company/inventorysummary", label: "Inventory Summary" },
            { to: "/company/daybook", label: "DayBook" },
            { to: "/company/journalentries", label: "Journal Entries" },
            { to: "/company/ledger", label: "Ledger" },
            { to: "/company/trialbalance", label: "Trial Balance" },
            {
              to: "/company/income-statement-report",
              label: "Income Statement Report",
            },
            {
              to: "/company/account-statement-report",
              label: "Account Statement Report",
            },
          ],
          "fas fa-chart-bar"
        ),
      ],
    };

    return menuItems[role] || null;
  };

  // Styles
  const linkStyle = {
    fontWeight: 500,
    fontSize: "15px",
    color: "#fff",
    // Padding is adjusted for RTL
    paddingRight: "2.5rem",
    paddingLeft: "1rem",
  };

  const iconStyle = {
    width: "16px",
    minWidth: "16px",
    textAlign: "center",
    fontSize: "17px",
    color: "#fff",
    // Margin is adjusted for RTL
    marginLeft: "0.75rem", // was me-3
    marginRight: "0", // was me-3
  };

  return (
    <div
      className="sidebar d-flex flex-column position-fixed"
      style={{
        height: "100vh",
        width: "250px",
        // This is the key fix: always position on the right
        right: 0,
        left: "auto",
        // Also ensure the border is on the correct side
        borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        borderRight: "none",
      }}
    >
      <div className="d-flex justify-content-between align-items-center py-2">
        {isMobile && (
          <div className="d-flex align-items-center ms-3 mt-3">
            <img
              src="https://i.ibb.co/TqtpQyH2/image.png"
              alt="Company Logo"
              style={{ height: "50px", width: "170px" }}
            />
          </div>
        )}
        <button
          type="button"
          className="btn btn-outline-light ms-auto d-lg-none me-2 mt-3"
          onClick={() =>
            window.bootstrap?.Offcanvas.getInstance(
              document.getElementById("mobileSidebar")
            )?.hide()
          }
          style={{ padding: "4px 10px", borderRadius: "6px" }}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div
        className="sidebar-menu-container"
        style={{
          overflowY: "auto",
          flexGrow: 1,
          paddingBottom: "20px",
          maxHeight: "calc(100vh - 70px)",
        }}
      >
        <div className="p-2">{getMenuItems()}</div>
      </div>
    </div>
  );
};

export default Sidebar;