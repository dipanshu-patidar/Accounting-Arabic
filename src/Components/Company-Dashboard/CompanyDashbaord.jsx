import React, { useState, useEffect } from "react";
import "./CompanyDashboard.css";
import {
  Card,
  Row,
  Col,
  Table,
  Dropdown,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaUser,
  FaUserCheck,
  FaFileInvoice,
  FaFileInvoiceDollar,
  FaExclamationTriangle,
} from "react-icons/fa";
import { BsBagDashFill as BagIcon } from "react-icons/bs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import GetCompanyId from "../../Api/GetCompanyId";
import axiosInstance from "../../Api/axiosInstance";
import { Link } from "react-router-dom";

const CompanyDashboard = () => {
  const companyId = GetCompanyId();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [timePeriod, setTimePeriod] = useState("Today");
  const [selectedPeriod, setSelectedPeriod] = useState("Weekly");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedSalesYear, setSelectedSalesYear] = useState("2025");
  
  // State for API data
  const [cards, setCards] = useState({
    totalPurchaseDue: "0",
    totalSalesDue: "0",
    totalSaleAmount: "0",
    totalExpense: "0",
    customers: 0,
    vendors: 0,
    purchaseInvoiceCount: 0,
    salesInvoiceCount: 0,
  });
  const [charts, setCharts] = useState({ salesPurchase: [], salesStats: [] });
  const [widgets, setWidgets] = useState({
    topProducts: [],
    lowStockProducts: [],
    recentSales: [],
    topCustomers: [],
  });
  const [salesStatics, setSalesStatics] = useState({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalExpense1: 0,
    expenseGrowth: 0,
    chart: [],
  });
  
  // State for new dashboard sections
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [overdueBills, setOverdueBills] = useState([]);
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [outstandingBills, setOutstandingBills] = useState([]);

  useEffect(() => {
    // Get user role and permissions
    const role = localStorage.getItem("role");
    
    // Superadmin and Company roles have access to all modules
    if (role === "SUPERADMIN" || role === "COMPANY") {
      setHasPermission(true);
    } else if (role === "USER") {
      // For USER role, check specific permissions
      try {
        const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
        setUserPermissions(permissions);
        
        // Check if user has view permission for Dashboard
        const dashboardPermission = permissions.find(p => p.module_name === "Dashboard");
        setHasPermission(dashboardPermission ? dashboardPermission.can_view : false);
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setHasPermission(false);
      }
    } else {
      setHasPermission(false);
    }
  }, []);

  useEffect(() => {
    if (!hasPermission) {
      setLoading(false);
      return;
    }
    
    if (!companyId) {
      setError("Company ID is missing");
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`dashboard/${companyId}`);
        if (res.data.success) {
          const data = res.data;

          // Cards
          setCards({
            totalPurchaseDue: Number(data.cards.totalPurchaseDue || 0),
            totalSalesDue: Number(data.cards.totalSalesDue || 0),
            totalSaleAmount: Number(data.cards.totalSaleAmount || 0),
            totalExpense: Number(data.cards.totalExpense || 0),
            customers: data.cards.customers || 0,
            vendors: data.cards.vendors || 0,
            purchaseInvoiceCount: data.cards.purchaseInvoiceCount || 0,
            salesInvoiceCount: data.cards.salesInvoiceCount || 0,
          });

          // Charts
          setCharts({
            salesPurchase: data.charts.salesPurchase || [],
            salesStats: data.charts.salesStats || [],
          });

          // Widgets
          setWidgets({
            topProducts: data.widgets.topProducts || [],
            lowStockProducts: data.widgets.lowStockProducts || [],
            recentSales: data.widgets.recentSales || [],
            topCustomers: data.widgets.topCustomers || [],
          });

          // Sales Statics
          setSalesStatics({
            totalRevenue: data.salesStatics.totalRevenue || 0,
            revenueGrowth: data.salesStatics.revenueGrowth || 0,
            totalExpense1: data.salesStatics.totalExpense1 || 0,
            expenseGrowth: data.salesStatics.expenseGrowth || 0,
            chart: data.salesStatics.chart || [],
          });

          // Overdue and Outstanding data
          setOverdueInvoices(data.overdueInvoices || []);
          setOverdueBills(data.overdueBills || []);
          setOutstandingInvoices(data.outstandingInvoices || []);
          setOutstandingBills(data.outstandingBills || []);
        } else {
          setError("Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Dashboard API Error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [companyId, hasPermission]);

  const formatNumber = (num) =>
    Number(num).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getBadgeClass = (status) => {
    if (status.toLowerCase().includes("cash")) return "bg-success";
    if (status.toLowerCase().includes("due")) return "bg-warning";
    return "bg-secondary";
  };

  // Prepare chart data for Sales & Purchase
  const salesPurchaseData = charts.salesPurchase.map((item) => ({
    name: item.month,
    Sales: item.sales,
    Purchase: item.purchase,
  }));

  // Prepare sales statics chart data
  const salesStaticData = salesStatics.chart.map((item) => ({
    month: item.month,
    revenue: item.revenue,
    expense: item.expense,
  }));

  // Show loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Show access denied if user doesn't have permission
  if (!hasPermission) {
    return (
      <div className="container-fluid mt-3 mt-sm-3">
        <Alert variant="success" className="d-flex align-items-center">
          <FaExclamationTriangle className="me-3" size={24} />
          <div>
            <h5 className="alert-heading">Access Denied</h5>
            <p>You don't have permission to view the Dashboard. Please contact your administrator for access.</p>
            <hr />
           
          </div>
        </Alert>
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="container-fluid mt-3 mt-sm-3">
        <Alert variant="danger" className="d-flex align-items-center">
          <FaExclamationTriangle className="me-3" size={24} />
          <div>
            <h5 className="alert-heading">Error</h5>
            <p>{error}</p>
            <hr />
            <p className="mb-0">
              <Button variant="primary" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3 mt-sm-3">
      {/* Company Name at Top */}
      <div className="mb-4">
        <h3 className="semi-bold text-left dashboard-title">
          <i className="fas fa-chart-line me-2"></i>
          ZirakBook Dashboard
        </h3>
      </div>

      {/* Top Section: Profit and Loss & Gross Profit */}
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="dashboard-section-card">
            <Card.Body className="p-4">
              <h5 className="dashboard-section-title mb-4">Profit and Loss</h5>
              <div className="dashboard-empty-state">
                <div className="dashboard-empty-chart"></div>
                <div className="dashboard-empty-text">
                  <p className="mb-2">No data available for selected range</p>
                  <p className="text-muted small">Modify the selected date range or add some invoices to see some data.</p>
                </div>
                <Button className="dashboard-add-btn" as={Link} to="/company/salesreturn">
                  Add invoice
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="dashboard-section-card">
            <Card.Body className="p-4">
              <h5 className="dashboard-section-title mb-4">Gross Profit</h5>
              <div className="dashboard-empty-state">
                <div className="dashboard-empty-chart"></div>
                <div className="dashboard-empty-text">
                  <p className="mb-2">No data available for selected range</p>
                  <p className="text-muted small">Modify the selected date range or add some invoices to see some data.</p>
                </div>
                <Button className="dashboard-add-btn" as={Link} to="/company/salesreturn">
                  Add invoice
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Middle Section: Largest Overdue Invoices & Bills */}
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="dashboard-section-card">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="dashboard-section-title mb-0">Largest overdue invoices</h5>
                <Link to="/company/salesreturn" className="dashboard-view-link">
                  View &gt;
                </Link>
              </div>
              <Table className="dashboard-table mb-0" responsive>
                <thead>
                  <tr>
                    <th>INVOICE</th>
                    <th>DAYS OVERDUE</th>
                    <th>BALANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueInvoices.length > 0 ? (
                    overdueInvoices.map((invoice, index) => (
                      <tr key={index}>
                        <td>{invoice.invoice_number || invoice.invoice}</td>
                        <td>{invoice.days_overdue || 0}</td>
                        <td>{formatNumber(invoice.balance || 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-3">
                        No overdue invoices
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="dashboard-section-card">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="dashboard-section-title mb-0">Largest overdue bills</h5>
                <Link to="/company/purchasorderr" className="dashboard-view-link">
                  View &gt;
                </Link>
              </div>
              <Table className="dashboard-table mb-0" responsive>
                <thead>
                  <tr>
                    <th>BILL</th>
                    <th>DAYS OVERDUE</th>
                    <th>BALANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueBills.length > 0 ? (
                    overdueBills.map((bill, index) => (
                      <tr key={index}>
                        <td>{bill.bill_number || bill.bill}</td>
                        <td>{bill.days_overdue || 0}</td>
                        <td>{formatNumber(bill.balance || 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-3">
                        No overdue bills
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom Section: Largest Outstanding Invoices & Bills */}
      <Row className="g-4">
        <Col md={6}>
          <Card className="dashboard-section-card">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="dashboard-section-title mb-0">Largest outstanding invoices</h5>
                <Link to="/company/salesreturn" className="dashboard-view-link">
                  View &gt;
                </Link>
              </div>
              <Table className="dashboard-table mb-0" responsive>
                <thead>
                  <tr>
                    <th>INVOICE</th>
                    <th>DUE DATE</th>
                    <th>BALANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {outstandingInvoices.length > 0 ? (
                    outstandingInvoices.map((invoice, index) => (
                      <tr key={index}>
                        <td>{invoice.invoice_number || invoice.invoice}</td>
                        <td>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}</td>
                        <td>{formatNumber(invoice.balance || 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-3">
                        No outstanding invoices
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="dashboard-section-card">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="dashboard-section-title mb-0">Largest outstanding bills</h5>
                <Link to="/company/purchasorderr" className="dashboard-view-link">
                  View &gt;
                </Link>
              </div>
              <Table className="dashboard-table mb-0" responsive>
                <thead>
                  <tr>
                    <th>BILL</th>
                    <th>DUE DATE</th>
                    <th>BALANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {outstandingBills.length > 0 ? (
                    outstandingBills.map((bill, index) => (
                      <tr key={index}>
                        <td>{bill.bill_number || bill.bill}</td>
                        <td>{bill.due_date ? new Date(bill.due_date).toLocaleDateString() : '-'}</td>
                        <td>{formatNumber(bill.balance || 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-3">
                        No outstanding bills
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default CompanyDashboard;