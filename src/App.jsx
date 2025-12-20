import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import MainLayout from "./Layout/MainLayout";

// Auth Pages
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
import ForgotPassword from "./Components/Auth/ForgotPassword";
import ResetPassword from "./Components/Auth/ResetPassword";
import SettingModal from "./Components/SettingModal";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";

// Super Admin Dashboard
import Dashboardd from "./Components/Dashboard/Dashboardd";
import Company from "./Components/Dashboard/Company";
import PlansPricing from "./Components/Dashboard/PlansPricing/PlansPricing";
import RequestPlan from "./Components/Dashboard/RequestPlan";
import Payments from "./Components/Dashboard/Payments";
import Managepassword from "./Components/Dashboard/Managepassword/Managepassword";

// Company Dashboard - All Pages
import CompanyDashboard from "./Components/Company-Dashboard/CompanyDashbaord";
import Inventorys from "./Components/Company-Dashboard/Inventory/Inventorys";
import UnitofMeasure from "./Components/Company-Dashboard/Inventory/UnitofMeasure";
import Invoice from "./Components/Company-Dashboard/Sales/Invoice";
import SalesDelivery from "./Components/Company-Dashboard/Sales/SalesDelivery";
import SalesReturn from "./Components/Company-Dashboard/Sales/SalesReturn";
import GSTReturns from "./Components/Company-Dashboard/GST/GSTReturns";
import TdsTcs from "./Components/Company-Dashboard/GST/TdsTcs";
import ITCReport from "./Components/Company-Dashboard/GST/ITCReport";
import EWayBill from "./Components/Company-Dashboard/GST/EWayBill";
import PurchaseReturn from "./Components/Company-Dashboard/Purchases/PurchaseReturn";
import DayBook from "./Components/Company-Dashboard/Reports/DayBook";
import Expense from "./Components/Company-Dashboard/Reports/Expense";
import JournalEntries from "./Components/Company-Dashboard/Reports/JournalEntries";
import Ledger from "./Components/Company-Dashboard/Reports/Ledger";
import TrialBalance from "./Components/Company-Dashboard/Reports/TrialBalance";
import Posreport from "./Components/Company-Dashboard/Reports/Posreport";
import CreateVoucher from "./Components/Company-Dashboard/Inventory/CreateVoucher";
import Taxreport from "./Components/Company-Dashboard/Reports/Taxreports";
import InventorySummary from "./Components/Company-Dashboard/Reports/InventorySummary";
import VatReport from "./Components/Company-Dashboard/Reports/VatReport";
import BalanceSheet from "./Components/Company-Dashboard/Reports/BalanceSheet";
import CashFlow from "./Components/Company-Dashboard/Reports/CashFlow";
import ProfitLoss from "./Components/Company-Dashboard/Reports/ProfitLoss";
import Income from "./Components/Company-Dashboard/Reports/Income";
import ContraVoucher from "./Components/Company-Dashboard/Reports/ContraVoucher";
import PaymnetSupplier from "./Components/Company-Dashboard/Reports/PaymnetSupplier";
import ReceivedCustomer from "./Components/Company-Dashboard/Reports/ReceivedCustomer";
import AssetDetails from "./Components/Company-Dashboard/Reports/AssetDetails";
import Liabilitydetails from "./Components/Company-Dashboard/Reports/Liabilitydetails";
import Salesreport from "./Components/Company-Dashboard/Reports/Salesreport";
import Purchasereport from "./Components/Company-Dashboard/Reports/Purchasereport";
import IncomeStatementReport from "./Components/Company-Dashboard/Reports/IncomeStatementReport";
import AccountStatementReport from "./Components/Company-Dashboard/Reports/AccountStatemetReport";


// Inventory & Site Data
import WareHouse from "./Components/Company-Dashboard/Inventory/SiteData/WareHouse";
import WareHouseDetail from "./Components/Company-Dashboard/Inventory/SiteData/WareHouseDetail";
import BrandPage from "./Components/Company-Dashboard/Inventory/SiteData/BrandPage";
import Categories from "./Components/Company-Dashboard/Inventory/SiteData/Categories";
import DevicePage from "./Components/Company-Dashboard/Inventory/SiteData/DevicePage";
import StockTransfer from "./Components/Company-Dashboard/Inventory/SiteData/StockTransfer";
import Service from "./Components/Company-Dashboard/Inventory/SiteData/Service";
import Productt from "./Components/Company-Dashboard/Inventory/Productt";
import AddProduct from "./Components/Company-Dashboard/Inventory/Product/AddProduct";
import AddProductModal from "./Components/Company-Dashboard/Inventory/AddProductModal";
import InventoryDetails from "./Components/Company-Dashboard/Inventory/InventoryDetails";
import InventoryAdjustment from "./Components/Company-Dashboard/Inventory/InventoryAdjustment";

// POS
import PointOfSale from "./Components/Company-Dashboard/Inventory/Pos/PointOfSale";
import InvoiceSummary from "./Components/Company-Dashboard/Inventory/Pos/InvoiceSummary";
import ManageInvoices from "./Components/Company-Dashboard/Inventory/Pos/ManageInvoice";
import ViewInvoice from "./Components/Company-Dashboard/Inventory/Pos/ViewInvoice";
import EditInvoice from "./Components/Company-Dashboard/Inventory/Pos/EditInvoice";

// Purchases
import PurchaseOrderr from "./Components/Company-Dashboard/Purchases/PurchaseOrderr";
import MultiStepPurchaseForms from "./Components/Company-Dashboard/Purchases/MultiStepPurchaseForms";
import PurchaseOrderView from "./Components/Company-Dashboard/Purchases/PurchaseOrderView";
import PurchaseQuotationPage from "./Components/Company-Dashboard/Purchases/PurchaseQuotationPage";
import PurchaseOrderPage from "./Components/Company-Dashboard/Purchases/PurchaseOrderPage";
import GoodsReceiptPage from "./Components/Company-Dashboard/Purchases/GoodsReceiptPage";
import BillPage from "./Components/Company-Dashboard/Purchases/BillPage";
import PaymentPage from "./Components/Company-Dashboard/Purchases/PaymentPage";

// Sales
import MultiStepSalesForm from "./Components/Company-Dashboard/Sales/MultiStepSalesForm";
import ViewInvoicee from "./Components/Company-Dashboard/Sales/ViewInvoicee";
import DeliveryChallans from "./Components/Company-Dashboard/Sales/DeliveryChallans";

// Accounts
import AllAcounts from "./Components/Company-Dashboard/Accounts/ChartsofAccount/AllAcounts";
import Ledgercustomer from "./Components/Company-Dashboard/Accounts/Ledgercustomer";
import Ledgervendor from "./Components/Company-Dashboard/Accounts/Ledgervendor";
import VendorsCreditors from "./Components/Company-Dashboard/Accounts/VendorsCreditors";
import CustomersDebtors from "./Components/Company-Dashboard/Accounts/CustomersDebtors/CustomersDebtors";
import Transaction from "./Components/Company-Dashboard/Accounts/Transaction";
import PaymentEntry from "./Components/Company-Dashboard/Accounts/PaymentEntry";
import ReceiptEntry from "./Components/Company-Dashboard/Accounts/ReceiptEntry";
import AddCustomerModal from "./Components/Company-Dashboard/Accounts/AddCustomerModal";
import AddVendorModal from "./Components/Company-Dashboard/Accounts/AddVendorModal";
import LedgerPageAccount from "./Components/Company-Dashboard/Accounts/LedgerPageAccount";
import CustomerItemDetailsView from "./Components/Company-Dashboard/Accounts/CustomerItemDetailsView";
import CustomerTransactionDetails from "./Components/Company-Dashboard/Accounts/CustomerTransactionDetails";
import VendorTransactionDetails from "./Components/Company-Dashboard/Accounts/VendorTransactionDetails";
import VendorItemDetailsView from "./Components/Company-Dashboard/Accounts/VendorItemDetailsView";

// Vouchers
import PurchaseVoucher from "./Components/Company-Dashboard/Inventory/PurchaseVoucher";
import SalesVoucher from "./Components/Company-Dashboard/Inventory/SalesVoucher";
import PurchaseVoucherView from "./Components/Company-Dashboard/Inventory/PurchaseVoucherView";
import SalesVoucherView from "./Components/Company-Dashboard/Inventory/SalesVoucherView";

// User Management
import Users from "./Components/Company-Dashboard/UserManagement/Users";
import RolesPermissions from "./Components/Company-Dashboard/UserManagement/RolesPermissions";
import DeleteAccountRequest from "./Components/Company-Dashboard/UserManagement/DeleteAccountRequest";

// Settings
import CompanyInfo from "./Components/Company-Dashboard/Settings/CompanyInfo";

// Website Pages
import Overview from "./Components/Website/Pages/Overview";
import Features from "./Components/Website/Pages/Features";
import Pricing from "./Components/Website/Pages/Pricing";
import Contact from "./Components/Website/Pages/Contact";
import Aboutus from "./Components/Website/Pages/Aboutus";
import NewInterprice from "./Components/Website/Pages/NewInterprice";
import PrivacyPolicy from "./Components/Website/Pages/PrivacyPolicy";
import TermsConditions from "./Components/Website/Pages/TermsConditions";

// Website Layout
import Navbarwebsite from "./Components/Website/Layout/Navbarwebsite";
import Footer1 from "./Components/Website/Layout/Footer1";
import ScrollToTop from "./Components/Website/Layout/ScrollToTop";

import 'bootstrap/dist/css/bootstrap.min.css';
import PasswordRequests from "./Components/Company-Dashboard/Settings/PasswordRequests/PasswordRequests";
import SuperAdminPasswordRequests from "./Components/Dashboard/Managepassword/Managepassword";
import AddEditCustomerModal from "./Components/Company-Dashboard/Accounts/CustomersDebtors/AddEditCustomerModal";

import EmployeeManagement from "./Components/Company-Dashboard/Payroll/EmployeeManagement";
import SalaryStructure from "./Components/Company-Dashboard/Payroll/SalaryStructure";
import GeneratePayroll from "./Components/Company-Dashboard/Payroll/GeneratePayroll";
import PaySlipReports from "./Components/Company-Dashboard/Payroll/PaySlipReports";
import PayrollReports from "./Components/Company-Dashboard/Payroll/PayrollReports";
import PayrollSettings from "./Components/Company-Dashboard/Payroll/PayrollSettings";
import Settlement from "./Components/Company-Dashboard/Payroll/Settlement";
import Attendance from "./Components/Company-Dashboard/Payroll/Attendance";
import Documents from "./Components/Company-Dashboard/Payroll/Documents";
import Payroll from "./Components/Company-Dashboard/Payroll/Payroll";
import LeaveRequests from "./Components/Company-Dashboard/Payroll/LeaveRequests";
import TaskManagement from "./Components/Company-Dashboard/TaskManagement/TaskManagement";


import DepartmentPerformanceSummary from "./Components/Company-Dashboard/TaskManagement/DepartmentPerformanceSummary";
import TaskProgressTracking from "./Components/Company-Dashboard/TaskManagement/TaskProgressTracking";

import ZatcaInvoicing from "./Components/Company-Dashboard/ComplianceIntegration/ZATCAEInvoicing";
import  SaudiComplianceIntegration from "./Components/Company-Dashboard/ComplianceIntegration/SaudiComplianceIntegration";
import SupportTickets from "./Components/Company-Dashboard/Communication-&-Support/SupportTickets";
import AuditLogs from "./Components/Company-Dashboard/Security-&-Logs/AuditLogs";
import DepartmentalAnalyticsDashboard from "./Components/Company-Dashboard/Payroll/DepartmentalAnalyticsDashboard";



import { CurrencyProvider } from "./hooks/CurrencyContext";

// ✅ Helper Component: Layout Logic
function AppContent() {
  const location = useLocation();

 // Force Google Translate Arabic After Every Reload
useEffect(() => {
  const interval = setInterval(() => {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      if (select.value !== "ar") {
        select.value = "ar";
        select.dispatchEvent(new Event("change"));
      }

      // Apply RTL globally
      document.documentElement.dir = "rtl";
      document.body.classList.add("rtl-mode");

      clearInterval(interval);
    }
  }, 800); // delay increased for reliability

  return () => clearInterval(interval);
}, []);


  // ✅ Define PUBLIC WEBSITE ROUTES (show Navbar + Footer)
  const publicWebsiteRoutes = [
    "/",
    "/overview",
    "/features",
    "/pricing",
    "/contact",
    "/aboutus",
    "/newinterprise",
    "/PrivacyPolicy",
    "/TermsConditions"
  ];

  const isPublicWebsiteRoute = publicWebsiteRoutes.some(route => location.pathname === route);

  // ✅ Define AUTH ROUTES (hide Navbar + Footer)
  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/settingmodal"
  ];

  const isAuthRoute = authRoutes.some(route => location.pathname === route);

  // ✅ Define DASHBOARD ROUTES (use MainLayout only)
  const isDashboardRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/superadmin") ||
    location.pathname.startsWith("/company");

  // 🔹 Render Public Website Layout
  if (isPublicWebsiteRoute) {
    return (
      <>
        <Navbarwebsite />
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/aboutus" element={<Aboutus />} />
          <Route path="/newinterprise" element={<NewInterprice />} />
          <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
          <Route path="/TermsConditions" element={<TermsConditions />} />
        </Routes>
        <Footer1 />
      </>
    );
  }

  // 🔹 Render Auth Pages (NO Navbar, NO Footer)
  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/settingmodal" element={<SettingModal />} />
      </Routes>
    );
  }

  // 🔹 Render Dashboard Layout
  if (isDashboardRoute) {
    return (
      <Routes>
        {/* Super Admin Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboardd /></ProtectedRoute>} />
          <Route path="/superadmin/company" element={<ProtectedRoute><Company /></ProtectedRoute>} />
          <Route path="/superadmin/planpricing" element={<ProtectedRoute><PlansPricing /></ProtectedRoute>} />
          <Route path="/superadmin/requestplan" element={<ProtectedRoute><RequestPlan /></ProtectedRoute>} />
          <Route path="/superadmin/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/superadmin/manage-passwords" element={<ProtectedRoute><Managepassword /></ProtectedRoute>} />
        </Route>

        {/* Company Dashboard Routes */}
        <Route element={<MainLayout />}>
          <Route path="/company/dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/company/allacounts" element={<ProtectedRoute><AllAcounts /></ProtectedRoute>} />
          <Route path="/company/ledgerpageaccount" element={<ProtectedRoute><LedgerPageAccount /></ProtectedRoute>} />
          <Route path="/company/ledgercustomer" element={<ProtectedRoute><Ledgercustomer /></ProtectedRoute>} />
          <Route path="/company/customer-item-details" element={<ProtectedRoute><CustomerItemDetailsView /></ProtectedRoute>} />
          <Route path="/company/customer-transaction-details" element={<ProtectedRoute><CustomerTransactionDetails /></ProtectedRoute>} />
          <Route path="/company/customersdebtors" element={<ProtectedRoute><CustomersDebtors /></ProtectedRoute>} />
          <Route path="/company/ledgervendor" element={<ProtectedRoute><Ledgervendor /></ProtectedRoute>} />
          <Route path="/company/vendor-transaction-details" element={<ProtectedRoute><VendorTransactionDetails /></ProtectedRoute>} />
          <Route path="/company/vendor-item-details" element={<ProtectedRoute><VendorItemDetailsView /></ProtectedRoute>} />
          <Route path="/company/addcustomersmodal" element={<ProtectedRoute><AddCustomerModal /></ProtectedRoute>} />
          <Route path="/company/vendorscreditors" element={<ProtectedRoute><VendorsCreditors /></ProtectedRoute>} />
          <Route path="/company/addvendorsmodal" element={<ProtectedRoute><AddVendorModal /></ProtectedRoute>} />
          <Route path="/company/receiptentry" element={<ProtectedRoute><ReceiptEntry /></ProtectedRoute>} />
          <Route path="/company/paymententry" element={<ProtectedRoute><PaymentEntry /></ProtectedRoute>} />
          <Route path="/company/transaction" element={<ProtectedRoute><Transaction /></ProtectedRoute>} />
          <Route path="/company/warehouse" element={<ProtectedRoute><WareHouse /></ProtectedRoute>} />
          <Route path="/company/warehouse/:id" element={<ProtectedRoute><WareHouseDetail /></ProtectedRoute>} />
          <Route path="/company/unitofmeasure" element={<ProtectedRoute><UnitofMeasure /></ProtectedRoute>} />
          <Route path="/company/service" element={<ProtectedRoute><Service /></ProtectedRoute>} />
          <Route path="/company/inventorys" element={<ProtectedRoute><Inventorys /></ProtectedRoute>} />
          <Route path="/company/inventorydetails/:id" element={<ProtectedRoute><InventoryDetails /></ProtectedRoute>} />
          <Route path="/company/addproduct" element={<ProtectedRoute><AddProductModal /></ProtectedRoute>} />
          <Route path="/company/createvoucher" element={<ProtectedRoute><CreateVoucher /></ProtectedRoute>} />
          <Route path="/company/stocktranfer" element={<ProtectedRoute><StockTransfer /></ProtectedRoute>} />
          <Route path="/company/inventory-adjustment" element={<ProtectedRoute><InventoryAdjustment /></ProtectedRoute>} />
          <Route path="/company/salesvoucher" element={<ProtectedRoute><SalesVoucher /></ProtectedRoute>} />
          <Route path="/company/purchasevoucher" element={<ProtectedRoute><PurchaseVoucher /></ProtectedRoute>} />
          <Route path="/company/purchasevoucherview" element={<ProtectedRoute><PurchaseVoucherView /></ProtectedRoute>} />
          <Route path="/company/salesvoucherview" element={<ProtectedRoute><SalesVoucherView /></ProtectedRoute>} />
          <Route path="/company/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/company/brands" element={<ProtectedRoute><BrandPage /></ProtectedRoute>} />
          <Route path="/company/product" element={<ProtectedRoute><Productt /></ProtectedRoute>} />
          <Route path="/company/createproduct" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
          <Route path="/company/update-product/:id" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
          <Route path="/company/device" element={<ProtectedRoute><DevicePage /></ProtectedRoute>} />
          <Route path="/company/ponitofsale" element={<ProtectedRoute><PointOfSale /></ProtectedRoute>} />
          <Route path="/company/invoice-summary" element={<ProtectedRoute><InvoiceSummary /></ProtectedRoute>} />
          <Route path="/company/manageinvoice" element={<ProtectedRoute><ManageInvoices /></ProtectedRoute>} />
          <Route path="/company/editinvoice" element={<ProtectedRoute><EditInvoice /></ProtectedRoute>} />
          <Route path="/company/viewinvoice" element={<ProtectedRoute><ViewInvoice /></ProtectedRoute>} />
          <Route path="/company/deliverychallans" element={<ProtectedRoute><DeliveryChallans /></ProtectedRoute>} />
          <Route path="/company/invoice" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
          <Route path="/company/multistepsalesform" element={<ProtectedRoute><MultiStepSalesForm /></ProtectedRoute>} />
          <Route path="/company/viewinvoicee" element={<ProtectedRoute><ViewInvoicee /></ProtectedRoute>} />
          <Route path="/company/salesdelivery" element={<ProtectedRoute><SalesDelivery /></ProtectedRoute>} />
          <Route path="/company/salesreturn" element={<ProtectedRoute><SalesReturn /></ProtectedRoute>} />
          <Route path="/company/gstreturns" element={<ProtectedRoute><GSTReturns /></ProtectedRoute>} />
          <Route path="/company/tdstcs" element={<ProtectedRoute><TdsTcs /></ProtectedRoute>} />
          <Route path="/company/itcreport" element={<ProtectedRoute><ITCReport /></ProtectedRoute>} />
          <Route path="/company/ewaybill" element={<ProtectedRoute><EWayBill /></ProtectedRoute>} />
          <Route path="/company/purchasorderr" element={<ProtectedRoute><PurchaseOrderr /></ProtectedRoute>} />
          <Route path="/company/multiforms" element={<ProtectedRoute><MultiStepPurchaseForms /></ProtectedRoute>} />
          <Route path="/company/purchasequotationpage" element={<ProtectedRoute><PurchaseQuotationPage /></ProtectedRoute>} />
          <Route path="/company/purchaseorderpage" element={<ProtectedRoute><PurchaseOrderPage /></ProtectedRoute>} />
          <Route path="/company/paymentpage" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/company/goodreceiptpage" element={<ProtectedRoute><GoodsReceiptPage /></ProtectedRoute>} />
          <Route path="/company/billpage" element={<ProtectedRoute><BillPage /></ProtectedRoute>} />
          <Route path="/company/purchasereturn" element={<ProtectedRoute><PurchaseReturn /></ProtectedRoute>} />
          <Route path="/company/purchaseview" element={<ProtectedRoute><PurchaseOrderView /></ProtectedRoute>} />
          <Route path="/company/daybook" element={<ProtectedRoute><DayBook /></ProtectedRoute>} />
          <Route path="/company/expense" element={<ProtectedRoute><Expense /></ProtectedRoute>} />
          <Route path="/company/income" element={<ProtectedRoute><Income /></ProtectedRoute>} />
          <Route path="/company/contravoucher" element={<ProtectedRoute><ContraVoucher /></ProtectedRoute>} />
          <Route path="/company/paymnetsupplier" element={<ProtectedRoute><PaymnetSupplier /></ProtectedRoute>} />
          <Route path="/company/receivedcustomer" element={<ProtectedRoute><ReceivedCustomer /></ProtectedRoute>} />
          <Route path="/company/journalentries" element={<ProtectedRoute><JournalEntries /></ProtectedRoute>} />
          <Route path="/company/ledger" element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
          <Route path="/company/trialbalance" element={<ProtectedRoute><TrialBalance /></ProtectedRoute>} />
          <Route path="/company/salesreport" element={<ProtectedRoute><Salesreport /></ProtectedRoute>} />
          <Route path="/company/purchasereport" element={<ProtectedRoute><Purchasereport /></ProtectedRoute>} />
          <Route path="/company/posreport" element={<ProtectedRoute><Posreport /></ProtectedRoute>} />
          <Route path="/company/taxreport" element={<ProtectedRoute><Taxreport /></ProtectedRoute>} />
          <Route path="/company/inventorysummary" element={<ProtectedRoute><InventorySummary /></ProtectedRoute>} />
          <Route path="/company/balancesheet" element={<ProtectedRoute><BalanceSheet /></ProtectedRoute>} />
          <Route path="/company/balancesheet/asstedetails" element={<ProtectedRoute><AssetDetails /></ProtectedRoute>} />
          <Route path="/company/balancesheet/liabilitydetails" element={<ProtectedRoute><Liabilitydetails /></ProtectedRoute>} />
          <Route path="/company/cashflow" element={<ProtectedRoute><CashFlow /></ProtectedRoute>} />
          <Route path="/company/profitloss" element={<ProtectedRoute><ProfitLoss /></ProtectedRoute>} />
          <Route path="/company/vatreport" element={<ProtectedRoute><VatReport /></ProtectedRoute>} />
          <Route path="/company/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/company/rolespermissions" element={<ProtectedRoute><RolesPermissions /></ProtectedRoute>} />
          <Route path="/company/deleteaccountrequests" element={<ProtectedRoute><DeleteAccountRequest /></ProtectedRoute>} />
          <Route path="/company/companyinfo" element={<ProtectedRoute><CompanyInfo /></ProtectedRoute>} />
          <Route path="/superadmin/manage-passwords" element={<ProtectedRoute><SuperAdminPasswordRequests /></ProtectedRoute>} />
          <Route path="/company/password-request" element={<ProtectedRoute><PasswordRequests /></ProtectedRoute>} />
          <Route path="/Company/CustomersDebtors" element={<ProtectedRoute><AddEditCustomerModal /></ProtectedRoute>} />
{/* new menu     */}

          <Route path ="/company/employeemanagement" element={<ProtectedRoute><EmployeeManagement/></ProtectedRoute>} />
          <Route path="/company/salarystructure" element={<ProtectedRoute><SalaryStructure /></ProtectedRoute>} />
          <Route path="/company/generatepayroll" element={<ProtectedRoute><GeneratePayroll /></ProtectedRoute>} />
          <Route path="/company/payslipreports" element={<ProtectedRoute><PaySlipReports /></ProtectedRoute>} />
          <Route path="/company/payrollreports" element={<ProtectedRoute><PayrollReports /></ProtectedRoute>} />
          <Route path="/company/payrollsettings" element={<ProtectedRoute><PayrollSettings /></ProtectedRoute>} />

          <Route path="/company/end-of-service" element={<ProtectedRoute><Settlement/></ProtectedRoute>} />
          <Route path="/company/attendance" element={<ProtectedRoute><Attendance/></ProtectedRoute>} />
          <Route path="/company/documents" element={<ProtectedRoute><Documents/></ProtectedRoute>} />
          <Route path="/company/payroll" element={<ProtectedRoute><Payroll/></ProtectedRoute>} />
          <Route path="/company/leave-requests" element={<ProtectedRoute><LeaveRequests/></ProtectedRoute>} />

          <Route path="/company/task-management" element={<ProtectedRoute><TaskManagement/></ProtectedRoute>} />
          <Route path="/company/department-summary" element={<ProtectedRoute><DepartmentPerformanceSummary/></ProtectedRoute>} />
          <Route path="/company/task-progress" element={<ProtectedRoute><TaskProgressTracking/></ProtectedRoute>} />
          <Route path="/company/department-analytics-dashboard" element={<ProtectedRoute><DepartmentalAnalyticsDashboard/></ProtectedRoute>} />
          <Route path="/company/zatca-e-invoicing" element={<ProtectedRoute><ZatcaInvoicing /></ProtectedRoute>} />
          <Route path="/company/saudicomplianceintegration" element={<ProtectedRoute><SaudiComplianceIntegration/></ProtectedRoute>} />
          <Route path="/company/support-tickets" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
          <Route path="/company/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
          <Route path="/company/income-statement-report" element={<ProtectedRoute><IncomeStatementReport /></ProtectedRoute>} />
          <Route path="/company/account-statement-report" element={<ProtectedRoute><AccountStatementReport/></ProtectedRoute>}/>
        </Route>
      </Routes>
    );
  }

  // 🔹 Fallback: 404 Page (with Navbar/Footer for safety)
  return (
    <>
      <Navbarwebsite />
      <div className="container py-5 text-center">
        <h2>404 - Page Not Found</h2>
      </div>
      <Footer1 />
    </>
  );
}

// ✅ Main App
export default function App() {
  return (
     <CurrencyProvider> 
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
       </CurrencyProvider>
  );
}