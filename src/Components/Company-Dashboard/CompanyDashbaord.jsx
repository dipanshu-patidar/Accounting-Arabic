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
} from "react-bootstrap";
import {
  FaUser,
  FaUserCheck,
  FaFileInvoice,
  FaFileInvoiceDollar,
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

  useEffect(() => {
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
  }, [companyId]);

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

  return (
    <div className="container-fluid mt-3 mt-sm-3">
      {/* Company Name at Top */}
      <div className="mb-4">
        <h3 className="semi-bold text-left" style={{ color: "#53b2a5" }}>
          ZirakBook Dashboard
        </h3>
      </div>

      {/* Summary Cards */}
      <Row className="g-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-3" style={{ backgroundColor: "#fff3cd" }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-semibold mb-1 text-dark">{formatNumber(cards.totalPurchaseDue)}</h5>
                <div className="text-muted small">Total Purchase Due</div>
              </div>
              <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm">
                <BagIcon size={30} className="text-warning" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-3" style={{ backgroundColor: "#d4edda" }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-semibold mb-1 text-dark">{formatNumber(cards.totalSalesDue)}</h5>
                <div className="text-muted small">Total Sales Due</div>
              </div>
              <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm">
                <FaFileInvoiceDollar size={30} className="text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-3" style={{ backgroundColor: "#cce5ff" }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-semibold mb-1 text-dark">{formatNumber(cards.totalSaleAmount)}</h5>
                <div className="text-muted small">Total Sale Amount</div>
              </div>
              <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm">
                <FaFileInvoice size={30} className="text-info" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-3" style={{ backgroundColor: "#f8d7da" }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-semibold mb-1 text-dark">{formatNumber(cards.totalExpense)}</h5>
                <div className="text-muted small">Total Expense</div>
              </div>
              <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm">
                <FaFileInvoiceDollar size={30} className="text-danger" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="my-4 g-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 p-3 rounded-3 text-black" style={{ backgroundColor: "#FFE8CC" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold mb-0">{cards.customers}</h4>
                <div className="small">Customers</div>
              </div>
              <div className="fs-3"><FaUser size={28} className="text-warning" /></div>
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 p-3 rounded-3 text-black" style={{ backgroundColor: "#D0EBFF" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold mb-0">{cards.vendors}</h4>
                <div className="small">Vendors</div>
              </div>
              <div className="fs-3"><FaUserCheck size={28} className="text-info" /></div>
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 p-3 rounded-3 text-black" style={{ backgroundColor: "#E3D7FF" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold mb-0">{cards.purchaseInvoiceCount}</h4>
                <div className="small">Purchase Invoice</div>
              </div>
              <div className="fs-3"><FaFileInvoice size={28} className="text-primary" /></div>
            </div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 p-3 rounded-3 text-black" style={{ backgroundColor: "#D8F5E8" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold mb-0">{cards.salesInvoiceCount}</h4>
                <div className="small">Sales Invoice</div>
              </div>
              <div className="fs-3"><FaFileInvoiceDollar size={28} className="text-success" /></div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Sales & Purchase Chart */}
      <Row className="g-4 align-items-stretch">
        <Col md={12}>
          <Card className="h-100 border-0 shadow-sm rounded-4 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
              <h6 className="fw-semibold mb-0">
                <i className="fa fa-chart-bar"></i> Sales & Purchase Report
              </h6>
              <Dropdown>
                <Dropdown.Toggle variant="light" className="border rounded-3 shadow-sm" size="sm">
                  {selectedYear}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setSelectedYear("2024")}>2024</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedYear("2025")}>2025</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesPurchaseData}>
                <XAxis dataKey="name" />
                <YAxis />
                <RechartTooltip formatter={(value) => formatNumber(value)} />
                <Legend />
                <Bar dataKey="Sales" fill="#1a237e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Purchase" fill="#53b2a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mt-3">
        {/* Top Selling Products */}
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="bg-pink-100 text-pink-600 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm1 13H7v-2h2v2zm0-4H7V7h2v2zm0-4H7V3h2v2z" />
                  </svg>
                </span>
                <Card.Title className="mb-0 fw-semibold">Top Selling Products</Card.Title>
              </div>
              <Dropdown size="sm" className="me-2">
                <Dropdown.Toggle variant="light" className="border rounded-3 shadow-sm">
                  {timePeriod}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setTimePeriod("Today")}>Today</Dropdown.Item>
                  <Dropdown.Item onClick={() => setTimePeriod("This Week")}>This Week</Dropdown.Item>
                  <Dropdown.Item onClick={() => setTimePeriod("This Month")}>This Month</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body className="p-0">
              {widgets.topProducts.length > 0 ? (
                widgets.topProducts.map((product, i) => (
                  <div key={i} className="p-3 border-bottom">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={product.image?.trim()}
                        alt={product.name}
                        className="rounded-2"
                        width="50"
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/50")}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-0">{product.name}</h6>
                        <small className="text-muted">
                          {formatNumber(product.price)} • {product.total_sales}+ Sales
                        </small>
                      </div>
                      <span className="badge bg-success text-dark">↑ {product.revenue > 0 ? "High" : "Steady"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-muted">No top products</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Low Stock Products */}
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="bg-orange-100 text-orange-600 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.943 1.557a1 1 0 0 0-1.342 0L4.5 4.5 3.75 3.75a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l2.5-2.5a1 1 0 0 0 0-1.414z" />
                    <path d="M8 5a.5.5 0 0 1 .5-.5H10v2H8.5A.5.5 0 0 1 8 5zM8 7a.5.5 0 0 1 .5-.5H10v2H8.5A.5.5 0 0 1 8 7zm-2 2a.5.5 0 0 1 .5-.5h2v2h-2.5A.5.5 0 0 1 6 9z" />
                  </svg>
                </span>
                <Card.Title className="mb-0 fw-semibold">Low Stock Products</Card.Title>
              </div>
              <Link to="/company/inventorys">
                <Button variant="link" className="p-0 m-0 text-decoration-none text-primary">View All</Button>
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              {widgets.lowStockProducts.length > 0 ? (
                widgets.lowStockProducts.map((product, i) => (
                  <div key={i} className="p-3 border-bottom">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={product.image?.trim()}
                        alt={product.name}
                        className="rounded-2"
                        width="50"
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/50")}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-0">{product.name}</h6>
                        <small className="text-muted">ID: #{product.id}</small>
                      </div>
                      <div className="text-end">
                        <div className="text-muted small">Instock</div>
                        <div className="fw-bold text-danger">{product.stock}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-muted">No low stock items</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Sales */}
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="bg-pink-100 text-pink-600 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm1 13H7v-2h2v2zm0-4H7V7h2v2zm0-4H7V3h2v2z" />
                  </svg>
                </span>
                <Card.Title className="mb-0 fw-semibold">Recent Sales</Card.Title>
              </div>
              <Dropdown size="sm" className="me-2">
                <Dropdown.Toggle variant="light" className="border rounded-3 shadow-sm">
                  {selectedPeriod}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setSelectedPeriod("Today")}>Today</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedPeriod("Weekly")}>Weekly</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedPeriod("Monthly")}>Monthly</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body className="p-0">
              {widgets.recentSales.length > 0 ? (
                widgets.recentSales.map((sale, i) => (
                  <div key={i} className="p-3 border-bottom">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={sale.product_image?.trim()}
                        alt={sale.product_name}
                        className="rounded-2"
                        width="50"
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/50")}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-0">{sale.product_name}</h6>
                        <small className="text-muted">
                          {sale.category} • {formatNumber(sale.price)}
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="text-muted small">
                          {new Date(sale.date).toLocaleDateString()}
                        </div>
                        <span className={`badge ${getBadgeClass(sale.status)} text-white`}>
                          {sale.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-muted">No recent sales</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sales Statics & Top Customers */}
      <Row className="g-4 mt-4">
        {/* Sales Statics */}
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="bg-red-100 text-red-600 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm1 13H7v-2h2v2zm0-4H7V7h2v2zm0-4H7V3h2v2z" />
                  </svg>
                </span>
                <Card.Title className="mb-0 fw-semibold">Sales Statistics</Card.Title>
              </div>
              <Dropdown size="sm" className="me-2">
                <Dropdown.Toggle variant="light" className="border rounded-3 shadow-sm"> {selectedSalesYear}</Dropdown.Toggle>
                <Dropdown.Menu className="w-10">
                  <Dropdown.Item onClick={() => setSelectedSalesYear("2024")}>2024</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSelectedSalesYear("2025")}>2025</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="d-flex gap-2 p-3 rounded-2 mb-3">
                <div className="flex-grow-1 text-center">
                  <div className="fw-bold">{formatNumber(salesStatics.totalRevenue)}</div>
                  <small className="text-muted">Revenue</small>
                  {salesStatics.revenueGrowth !== 0 && (
                    <span className="badge bg-success ms-1">↑ {salesStatics.revenueGrowth}%</span>
                  )}
                </div>
                <div className="flex-grow-1 text-center">
                  <div className="fw-bold">{formatNumber(salesStatics.totalExpense1)}</div>
                  <small className="text-muted">Expense</small>
                  {salesStatics.expenseGrowth !== 0 && (
                    <span className="badge bg-danger ms-1">↓ {salesStatics.expenseGrowth}%</span>
                  )}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salesStaticData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartTooltip formatter={(value) => formatNumber(value)} />
                  <Bar dataKey="revenue" fill="#00b469ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#3a474bff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Top Customers */}
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="bg-pink-100 text-pink-600 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm1 13H7v-2h2v2zm0-4H7V7h2v2zm0-4H7V3h2v2z" />
                  </svg>
                </span>
                <Card.Title className="mb-0 fw-semibold">Top Customers</Card.Title>
              </div>
              <Link to="/company/customersdebtors">
                <Button variant="link" className="p-0 m-0 text-decoration-none text-primary">View All</Button>
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              {widgets.topCustomers.length > 0 ? (
                widgets.topCustomers.map((customer, i) => (
                  <div key={i} className="p-3 border-bottom">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={customer.image?.trim()}
                          alt={customer.name}
                          style={{ borderRadius: "50%" , height: "40px"}}
                          width="40"
                          onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/40")}
                        />
                        <div>
                          <h6 className="mb-0">{customer.name}</h6>
                          <small className="text-muted">
                            {customer.country} • {customer.orders} Orders
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{formatNumber(customer.total_sale)}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-muted">No top customers</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CompanyDashboard;