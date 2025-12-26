import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isMobile, onLinkClick, onCollapseChange }) => {
  const { pathname } = useLocation();
  const [activePath, setActivePath] = useState(pathname);
  const [role, setRole] = useState("");
  const [userPermissions, setUserPermissions] = useState([]);
  const [expandedMenu, setExpandedMenu] = useState({});
  const [isTranslateFixed, setIsTranslateFixed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    
    // Get user permissions from localStorage
    if (storedRole === "USER") {
      try {
        const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
        setUserPermissions(permissions);
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setUserPermissions([]);
      }
    }
  }, []);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  // Close all expanded menus when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      setExpandedMenu({});
    }
  }, [isCollapsed]);

  // Helper function to check if user has view permission for a module
  const hasViewPermission = (moduleName) => {
    if (role === "SUPERADMIN" || role === "COMPANY") {
      return true; // Superadmin and Company have access to all modules
    }
    
    const permission = userPermissions.find(p => p.module_name === moduleName);
    return permission ? permission.can_view : false;
  };

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

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      // Notify parent about collapse state change
      if (onCollapseChange) {
        onCollapseChange(newState);
      }
      return newState;
    });
  };

  // Notify parent on initial mount and when collapse state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCollapsed]);

  /**
   * Renders a section with a clickable header to expand/collapse sub-items.
   * @param {string} title - The title of section (e.g., "Accounting").
   * @param {Array} items - An array of sub-items, each with `to` and `label`.
   * @param {string} icon - The FontAwesome icon class for header.
   */
  const renderExpandableSection = (title, items, icon) => {
    // Create a unique key for section to manage its expanded state
    const menuKey = title.replace(/\s+/g, "-").toLowerCase();
    const isExpanded = expandedMenu[menuKey];

    // Check if any child item is currently active path
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
          title={isCollapsed ? title : ""}
        >
          <i className={`me-3 ${icon}`} style={iconStyle}></i>
          {!isCollapsed && <span>{title}</span>}
          {!isCollapsed && (
            <i
              className={`ms-auto fas ${isExpanded ? "fa-minus" : "fa-plus"}`}
              style={{ fontSize: "0.8rem", opacity: 0.7 }}
            ></i>
          )}
        </div>

        {/* Submenu Items - rendered only if section is expanded */}
        {isExpanded && !isCollapsed && (
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
        className={`nav-link d-flex align-items-center sidebar-link px-3 py-2${
          activePath === to ? "active-link" : ""
        }`}
        style={linkStyle}
        title={isCollapsed ? label : ""}
      >
        <i className={`me-3 ${icon}`} style={iconStyle}></i>
        {!isCollapsed && <span>{label}</span>}
      </Link>
    </div>
  );

  /**
   * Generates menu structure based on user's role and permissions.
   */
  const getMenuItems = () => {
    // For SUPERADMIN role, show all admin menu items
    if (role === "SUPERADMIN") {
      return [
        navItem("/dashboard", "fa-solid fa-house-chimney", "Dashboard"),
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
      ];
    }
    
    // For COMPANY role, show all company menu items
    if (role === "COMPANY") {
      const menuItems = [
        navItem("/company/dashboard", "fa-solid fa-house-chimney", "Dashboard"),
      ];

      // User Management section
      menuItems.push(
        renderExpandableSection(
          "User Management",
          [
            { to: "/company/users", label: "Users" },
            { to: "/company/rolespermissions", label: "Roles & Permissions" },
          ],
          "fas fa-users"
        )
      );

      // Sales section
      menuItems.push(
        renderExpandableSection(
          "Sales",
          [
            { to: "/company/Invoice", label: "Sales Order" },
            { to: "/company/salesreturn", label: "Sales Return" },
          ],
          "fas fa-chart-line"
        )
      );

      // Purchases section
      menuItems.push(
        renderExpandableSection(
          "Purchases",
          [
            { to: "/company/purchasorderr", label: "Purchase Orders" },
            { to: "/company/purchasereturn", label: "Purchase Return" },
          ],
          "fas fa-shopping-cart"
        )
      );

      // Accounting section
      menuItems.push(
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
            // { to: "/company/vatreport", label: "Vat Report" },
            { to: "/company/taxreport", label: "Tax Report" },
          ],
          "fa-solid fa-dollar-sign"
        )
      );

      // Inventory section
      menuItems.push(
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
          "fa-solid fa-list-ul"
        )
      );

      // HR & Payroll section
      menuItems.push(
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
          "fa-solid fa-money-bill-1"
        )
      );

      // Task Management section
      menuItems.push(
        renderExpandableSection(
          "Task Management",
          [
            { to: "/company/task-management", label: "Task Management" },
            { to: "/company/department-summary", label: "Department Summary" },
            { to: "/company/task-progress", label: "Task Progress" },
          ],
          "fas fa-tasks"
        )
      );

      // Compliance & Integration section
      menuItems.push(
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
        )
      );

      menuItems.push(navItem("/company/audit-logs", "fas fa-list-alt", "Audit Logs"));
      menuItems.push(navItem("/company/support-tickets", "fas fa-life-ring", "Support Tickets"));

      // Settings section
      menuItems.push(
        renderExpandableSection(
          "Settings",
          [
            { to: "/company/companyinfo", label: "Company Info" },
            { to: "/company/password-request", label: "Password Requests" },
          ],
          "fa-solid fa-wrench"
        )
      );

      menuItems.push(navItem("/company/ponitofsale", "fas fa-desktop", "POS Screen"));

      // Voucher section
      menuItems.push(
        renderExpandableSection(
          "Voucher",
          [
            { to: "/company/createvoucher", label: "Create Voucher" },
            { to: "/company/expense", label: "Expenses" },
            { to: "/company/income", label: "Income" },
            { to: "/company/contravoucher", label: "Contra Voucher" },
          ],
          "fas fa-file-invoice-dollar"
        )
      );

      // Reports section
      menuItems.push(
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
        )
      );

      return menuItems;
    }
    
    // For USER role, show only menu items based on permissions
    if (role === "USER") {
      const menuItems = [];
      
      // Dashboard section
      if (hasViewPermission("Dashboard")) {
        menuItems.push(
          navItem("/company/dashboard", "fa-solid fa-house-chimney", "Dashboard")
        );
      }
      
      // User Management section
      const userManagementItems = [];
      if (hasViewPermission("Users")) {
        userManagementItems.push({
          to: "/company/users",
          label: "Users"
        });
      }
      if (hasViewPermission("Roles_Permissions")) {
        userManagementItems.push({
          to: "/company/rolespermissions",
          label: "Roles & Permissions"
        });
      }
      if (userManagementItems.length > 0) {
        menuItems.push(
          renderExpandableSection(
            "User Management",
            userManagementItems,
            "fas fa-users"
          )
        );
      }
      
      // Sales section
      const salesItems = [];
      if (hasViewPermission("Sales_Order")) {
        salesItems.push({
          to: "/company/Invoice",
          label: "Sales Order"
        });
      }
      if (hasViewPermission("Sales_Return")) {
        salesItems.push({
          to: "/company/salesreturn",
          label: "Sales Return"
        });
      }
      if (salesItems.length > 0) {
        menuItems.push(
          renderExpandableSection(
            "Sales",
            salesItems,
            "fas fa-chart-line"
          )
        );
      }
      
      // Purchases section
      const purchasesItems = [];
      if (hasViewPermission("Purchase_Orders")) {
        purchasesItems.push({
          to: "/company/purchasorderr",
          label: "Purchase Orders"
        });
      }
      if (hasViewPermission("Purchase_Return")) {
        purchasesItems.push({
          to: "/company/purchasereturn",
          label: "Purchase Return"
        });
      }
      if (purchasesItems.length > 0) {
        menuItems.push(
          renderExpandableSection(
            "Purchases",
            purchasesItems,
            "fas fa-shopping-cart"
          )
        );
      }
      
      // Accounting section
      const accountingItems = [];
      if (hasViewPermission("Charts_of_Accounts")) {
        accountingItems.push({
          to: "/company/allacounts",
          label: "Charts of Accounts"
        });
      }
      if (hasViewPermission("Customers/Debtors")) {
        accountingItems.push({
          to: "/company/customersdebtors",
          label: "Customers/Debtors"
        });
      }
      if (hasViewPermission("Vendors/Creditors")) {
        accountingItems.push({
          to: "/company/vendorscreditors",
          label: "Vendors/Creditors"
        });
      }
      if (hasViewPermission("Cash_Flow")) {
        accountingItems.push({
          to: "/company/cashflow",
          label: "Cash Flow"
        });
      }
      if (hasViewPermission("Profit_Loss")) {
        accountingItems.push({
          to: "/company/profitloss",
          label: "Profit & Loss"
        });
      }
      if (hasViewPermission("Balance_Sheet")) {
        accountingItems.push({
          to: "/company/balancesheet",
          label: "Balance Sheet"
        });
      }
      if (hasViewPermission("Expenses")) {
        accountingItems.push({
          to: "/company/expense",
          label: "Expenses"
        });
      }
      // if (hasViewPermission("Vat_Report")) {
      //   accountingItems.push({
      //     to: "/company/vatreport",
      //     label: "Vat Report"
      //   });
      // }
      if (hasViewPermission("Tax_Report")) {
        accountingItems.push({
          to: "/company/taxreport",
          label: "Tax Report"
        });
      }
      if (accountingItems.length > 0) {
        menuItems.push(
          renderExpandableSection(
            "Accounting",
            accountingItems,
            "fa-solid fa-dollar-sign"
          )
        );
      }
      
      // Inventory section
      const inventoryItems = [];
      if (hasViewPermission("Warehouse")) {
        inventoryItems.push({
          to: "/company/warehouse",
          label: "Warehouse"
        });
      }
      if (hasViewPermission("Unit_of_measure")) {
        inventoryItems.push({
          to: "/company/unitofmeasure",
          label: "Unit of measure"
        });
      }
      if (hasViewPermission("Product_Inventory")) {
        inventoryItems.push({
          to: "/company/inventorys",
          label: "Product & Inventory"
        });
      }
      if (hasViewPermission("Service")) {
        inventoryItems.push({
          to: "/company/service",
          label: "Service"
        });
      }
      if (hasViewPermission("StockTransfer")) {
        inventoryItems.push({
          to: "/company/stocktranfer",
          label: "StockTransfer"
        });
      }
      if (hasViewPermission("Inventory_Adjustment")) {
        inventoryItems.push({
          to: "/company/inventory-adjustment",
          label: "Inventory Adjustment"
        });
      }
      if (inventoryItems.length > 0) {
        menuItems.push(
          renderExpandableSection(
            "Inventory",
            inventoryItems,
            "fa-solid fa-list-ul"
          )
        );
      }
      
      // POS section
      if (hasViewPermission("POS_Screen")) {
        menuItems.push(
          navItem("/company/ponitofsale", "fas fa-desktop", "POS Screen")
        );
      }
      
      // Voucher section
      const voucherItems = [];
      if (hasViewPermission("Create_Voucher")) {
        voucherItems.push({
          to: "/company/createvoucher",
          label: "Create Voucher"
        });
      }
      if (hasViewPermission("Expenses")) {
        voucherItems.push({
          to: "/company/expense",
          label: "Expenses"
        });
      }
      if (hasViewPermission("Income")) {
        voucherItems.push({
          to: "/company/income",
          label: "Income"
        });
      }
      if (hasViewPermission("Contra_Voucher")) {
        voucherItems.push({
          to: "/company/contravoucher",
          label: "Contra Voucher"
        });
      }
      if (voucherItems.length > 0) {
        menuItems.push(
          renderExpandableSection(
            "Voucher",
            voucherItems,
            "fas fa-file-invoice-dollar"
          )
        );
      }
      
      // Reports section
      const reportsItems = [];
      if (hasViewPermission("Sales_Report")) {
        reportsItems.push({
          to: "/company/salesreport",
          label: "Sales Report"
        });
      }
      if (hasViewPermission("Purchase_Report")) {
        reportsItems.push({
          to: "/company/purchasereport",
          label: "Purchase Report"
        });
      }
      if (hasViewPermission("POS_Report")) {
        reportsItems.push({
          to: "/company/posreport",
          label: "POS Report"
        });
      }
      if (hasViewPermission("Inventory_Summary")) {
        reportsItems.push({
          to: "/company/inventorysummary",
          label: "Inventory Summary"
        });
      }
      if (hasViewPermission("DayBook")) {
        reportsItems.push({
          to: "/company/daybook",
          label: "DayBook"
        });
      }
      if (hasViewPermission("Journal_Entries")) {
        reportsItems.push({
          to: "/company/journalentries",
          label: "Journal Entries"
        });
      }
      if (hasViewPermission("Ledger")) {
        reportsItems.push({
          to: "/company/ledger",
          label: "Ledger"
        });
      }
      if (hasViewPermission("Trial_Balance")) {
        reportsItems.push({
          to: "/company/trialbalance",
          label: "Trial Balance"
        });
      }
      if (reportsItems.length > 0) {
        menuItems.push(
          renderExpandableSection(
            "Reports",
            reportsItems,
            "fas fa-chart-bar"
          )
        );
      }
      
      // Settings section
      const settingsItems = [];
      if (hasViewPermission("Company_Info")) {
        settingsItems.push({
          to: "/company/companyinfo",
          label: "Company Info"
        });
      }
      if (hasViewPermission("Password_Requests")) {
        settingsItems.push({
          to: "/company/password-request",
          label: "Password Requests"
        });
      }
      if (settingsItems.length > 0) {
        menuItems.push(
          renderExpandableSection(
            "Settings",
            settingsItems,
            "fa-solid fa-wrench"
          )
        );
      }
      
      return menuItems;
    }
    
    return null;
  };

  // Styles
  const linkStyle = {
    fontWeight: 500,
    fontSize: "15px",
    color: "#fff",
    // Padding is adjusted for RTL
    paddingRight: isCollapsed ? "1rem" : "2.5rem",
    paddingLeft: isCollapsed ? "1rem" : "1rem",
    justifyContent: isCollapsed ? "center" : "flex-start",
  };

  const iconStyle = {
    width: "16px",
    minWidth: "16px",
    textAlign: "center",
    fontSize: "17px",
    color: "#fff",
    // Margin is adjusted for RTL
    marginLeft: isCollapsed ? "0" : "0.75rem", // was me-3
    marginRight: "0", // was me-3
  };

  return (
    <div
      className="sidebar d-flex flex-column position-fixed"
      style={{
        height: "100vh",
        width: isCollapsed ? "70px" : "250px",
        // This is key fix: always position on the right
        right: 0,
        left: "auto",
        // Also ensure the border is on the correct side
        borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        borderRight: "none",
        transition: "width 0.6s ease",
      }}
    >
      <div className="d-flex justify-content-between align-items-center py-2 position-relative mb-4 ">
        {!isMobile && (
          <button
            type="button"
            className="btn btn-link text-white p-2"
            onClick={toggleSidebar}
            style={{
              position: "absolute",
              top: "10px",
              left: isCollapsed ? "15px" : "10px",
              zIndex: 1001,
              fontSize: "18px",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "all 0.6s ease",
              // backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "none",
              
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            }}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <i className={`fas ${isCollapsed ? "fa-chevron-left" : "fa-chevron-right"}`}></i>
          </button>
        )}
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