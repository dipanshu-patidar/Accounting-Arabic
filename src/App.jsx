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

  useEffect(() => {
    const lang = localStorage.getItem("lang") || "en";
    const html = document.getElementById("html-root");

    if (!html) return;

    if (lang === "ar") {
        html.setAttribute("dir", "rtl");
        html.setAttribute("lang", "ar");
    } else {
        html.setAttribute("dir", "ltr");
        html.setAttribute("lang", "en");
    }
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
          <Route path="/dashboard" element={<Dashboardd />} />
          <Route path="/superadmin/company" element={<Company />} />
          <Route path="/superadmin/planpricing" element={<PlansPricing />} />
          <Route path="/superadmin/requestplan" element={<RequestPlan />} />
          <Route path="/superadmin/payments" element={<Payments />} />
          <Route path="/superadmin/manage-passwords" element={<Managepassword />} />
        </Route>

        {/* Company Dashboard Routes */}
        <Route element={<MainLayout />}>
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/allacounts" element={<AllAcounts />} />
          <Route path="/company/ledgerpageaccount" element={<LedgerPageAccount />} />
          <Route path="/company/ledgercustomer" element={<Ledgercustomer />} />
          <Route path="/company/customer-item-details" element={<CustomerItemDetailsView />} />
          <Route path="/company/customer-transaction-details" element={<CustomerTransactionDetails />} />
          <Route path="/company/customersdebtors" element={<CustomersDebtors />} />
          <Route path="/company/ledgervendor" element={<Ledgervendor />} />
          <Route path="/company/vendor-transaction-details" element={<VendorTransactionDetails />} />
          <Route path="/company/vendor-item-details" element={<VendorItemDetailsView />} />
          <Route path="/company/addcustomersmodal" element={<AddCustomerModal />} />
          <Route path="/company/vendorscreditors" element={<VendorsCreditors />} />
          <Route path="/company/addvendorsmodal" element={<AddVendorModal />} />
          <Route path="/company/receiptentry" element={<ReceiptEntry />} />
          <Route path="/company/paymententry" element={<PaymentEntry />} />
          <Route path="/company/transaction" element={<Transaction />} />
          <Route path="/company/warehouse" element={<WareHouse />} />
          <Route path="/company/warehouse/:id" element={<WareHouseDetail />} />
          <Route path="/company/unitofmeasure" element={<UnitofMeasure />} />
          <Route path="/company/service" element={<Service />} />
          <Route path="/company/inventorys" element={<Inventorys />} />
          <Route path="/company/inventorydetails/:id" element={<InventoryDetails />} />
          <Route path="/company/addproduct" element={<AddProductModal />} />
          <Route path="/company/createvoucher" element={<CreateVoucher />} />
          <Route path="/company/stocktranfer" element={<StockTransfer />} />
          <Route path="/company/inventory-adjustment" element={<InventoryAdjustment />} />
          <Route path="/company/salesvoucher" element={<SalesVoucher />} />
          <Route path="/company/purchasevoucher" element={<PurchaseVoucher />} />
          <Route path="/company/purchasevoucherview" element={<PurchaseVoucherView />} />
          <Route path="/company/salesvoucherview" element={<SalesVoucherView />} />
          <Route path="/company/categories" element={<Categories />} />
          <Route path="/company/brands" element={<BrandPage />} />
          <Route path="/company/product" element={<Productt />} />
          <Route path="/company/createproduct" element={<AddProduct />} />
          <Route path="/company/update-product/:id" element={<AddProduct />} />
          <Route path="/company/device" element={<DevicePage />} />
          <Route path="/company/ponitofsale" element={<PointOfSale />} />
          <Route path="/company/invoice-summary" element={<InvoiceSummary />} />
          <Route path="/company/manageinvoice" element={<ManageInvoices />} />
          <Route path="/company/editinvoice" element={<EditInvoice />} />
          <Route path="/company/viewinvoice" element={<ViewInvoice />} />
          <Route path="/company/deliverychallans" element={<DeliveryChallans />} />
          <Route path="/company/invoice" element={<Invoice />} />
          <Route path="/company/multistepsalesform" element={<MultiStepSalesForm />} />
          <Route path="/company/viewinvoicee" element={<ViewInvoicee />} />
          <Route path="/company/salesdelivery" element={<SalesDelivery />} />
          <Route path="/company/salesreturn" element={<SalesReturn />} />
          <Route path="/company/gstreturns" element={<GSTReturns />} />
          <Route path="/company/tdstcs" element={<TdsTcs />} />
          <Route path="/company/itcreport" element={<ITCReport />} />
          <Route path="/company/ewaybill" element={<EWayBill />} />
          <Route path="/company/purchasorderr" element={<PurchaseOrderr />} />
          <Route path="/company/multiforms" element={<MultiStepPurchaseForms />} />
          <Route path="/company/purchasequotationpage" element={<PurchaseQuotationPage />} />
          <Route path="/company/purchaseorderpage" element={<PurchaseOrderPage />} />
          <Route path="/company/paymentpage" element={<PaymentPage />} />
          <Route path="/company/goodreceiptpage" element={<GoodsReceiptPage />} />
          <Route path="/company/billpage" element={<BillPage />} />
          <Route path="/company/purchasereturn" element={<PurchaseReturn />} />
          <Route path="/company/purchaseview" element={<PurchaseOrderView />} />
          <Route path="/company/daybook" element={<DayBook />} />
          <Route path="/company/expense" element={<Expense />} />
          <Route path="/company/income" element={<Income />} />
          <Route path="/company/contravoucher" element={<ContraVoucher />} />
          <Route path="/company/paymnetsupplier" element={<PaymnetSupplier />} />
          <Route path="/company/receivedcustomer" element={<ReceivedCustomer />} />
          <Route path="/company/journalentries" element={<JournalEntries />} />
          <Route path="/company/ledger" element={<Ledger />} />
          <Route path="/company/trialbalance" element={<TrialBalance />} />
          <Route path="/company/salesreport" element={<Salesreport />} />
          <Route path="/company/purchasereport" element={<Purchasereport />} />
          <Route path="/company/posreport" element={<Posreport />} />
          <Route path="/company/taxreport" element={<Taxreport />} />
          <Route path="/company/inventorysummary" element={<InventorySummary />} />
          <Route path="/company/balancesheet" element={<BalanceSheet />} />
          <Route path="/company/balancesheet/asstedetails" element={<AssetDetails />} />
          <Route path="/company/balancesheet/liabilitydetails" element={<Liabilitydetails />} />
          <Route path="/company/cashflow" element={<CashFlow />} />
          <Route path="/company/profitloss" element={<ProfitLoss />} />
          <Route path="/company/vatreport" element={<VatReport />} />
          <Route path="/company/users" element={<Users />} />
          <Route path="/company/rolespermissions" element={<RolesPermissions />} />
          <Route path="/company/deleteaccountrequests" element={<DeleteAccountRequest />} />
          <Route path="/company/companyinfo" element={<CompanyInfo />} />
          <Route path="/superadmin/manage-passwords" element={<SuperAdminPasswordRequests />} />
          <Route path="/company/password-request" element={<PasswordRequests />} />
          <Route path="/Company/CustomersDebtors" element={<AddEditCustomerModal />} />
{/* new menu     */}

          <Route path ="/company/employeemanagement" element={<EmployeeManagement/>} />
          <Route path="/company/salarystructure" element={<SalaryStructure />} />
          <Route path="/company/generatepayroll" element={<GeneratePayroll />} />
          <Route path="/company/payslipreports" element={<PaySlipReports />} />
          <Route path="/company/payrollreports" element={<PayrollReports />} />
          <Route path="/company/payrollsettings" element={<PayrollSettings />} />

          <Route path="/company/end-of-service" element={<Settlement/>} />
          <Route path="/company/attendance" element={<Attendance/>} />
          <Route path="/company/documents" element={<Documents/>} />
          <Route path="/company/payroll" element={<Payroll/>} />
          <Route path="/company/leave-requests" element={<LeaveRequests/>} />

          <Route path="/company/task-management" element={<TaskManagement/>} />
          <Route path="/company/department-summary" element={<DepartmentPerformanceSummary/>} />
          <Route path="/company/task-progress" element={<TaskProgressTracking/>} />
          <Route path="/company/department-analytics-dashboard" element={<DepartmentalAnalyticsDashboard/>} />
          <Route path="/company/zatca-e-invoicing" element={<ZatcaInvoicing />} />
          <Route path="/company/saudicomplianceintegration" element={<SaudiComplianceIntegration/>} />
          <Route path="/company/support-tickets" element={<SupportTickets />} />
          <Route path="/company/audit-logs" element={<AuditLogs />} />
          <Route path="/company/income-statement-report" element={<IncomeStatementReport />} />
          <Route path="/company/account-statement-report" element={<AccountStatementReport/>}/>






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