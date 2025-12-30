import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Badge,
} from "react-bootstrap";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaChartLine,
  FaBuilding,
  FaUsers,
  FaDollarSign,
  FaUserPlus,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  BsBuilding,
  BsPeople,
  BsCurrencyDollar,
  BsPersonPlus,
  BsCalendar2,
} from "react-icons/bs";
import "./Dashboardd.css";
import axiosInstance from "../../Api/axiosInstance";

const Dashboardd = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get(`dashboard/admin`);
        console.log("API Response:", response.data);
        setDashboardData(response.data); // assuming top-level data, not nested in .data
        setApiError(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setApiError(true);
        // Fallback structure matching your new response shape
        setDashboardData({
          totalCompanies: { value: 0, growth: "0" },
          totalRequests: { value: 0, growth: "0" },
          totalRevenue: { value: 0, growth: "0" },
          newSignupsCompany: { value: 0 },
          growthChartData: [],
          signupChartData: [],
          revenueTrendsData: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper: Get month index (1–11) from name like "Nov"
  const getMonthIndex = (monthName) => {
    const fullNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    return fullNames.indexOf(monthName) + 1; // 1-based
  };

  // Prepare unified chart data from the 3 arrays
  const getChartData = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    const chartDataMap = {};

    // Initialize all months
    monthNames.forEach((name) => {
      chartDataMap[name] = {
        name,
        Growth: 0,
        users: 0,
        revenue: 0,
      };
    });

    if (dashboardData && !apiError) {
      // Map growthChartData → Growth
      (dashboardData.growthChartData || []).forEach((item) => {
        if (chartDataMap[item.month]) {
          chartDataMap[item.month].Growth = item.growth;
        }
      });

      // Map signupChartData → users
      (dashboardData.signupChartData || []).forEach((item) => {
        if (chartDataMap[item.month]) {
          chartDataMap[item.month].users = item.signups;
        }
      });

      // Map revenueTrendsData → revenue
      (dashboardData.revenueTrendsData || []).forEach((item) => {
        if (chartDataMap[item.month]) {
          chartDataMap[item.month].revenue = item.revenue;
        }
      });
    }

    return Object.values(chartDataMap);
  };

  const chartData = getChartData();

  // Get current and previous month names (based on real date)
  const now = new Date(); // Today is Thursday, November 27, 2025
  const currentMonthIndex = now.getMonth(); // 0 = Jan → Nov = 10
  const prevMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  const currentMonthName = monthNames[currentMonthIndex];
  const prevMonthName = monthNames[prevMonthIndex];

  const currentData = chartData.find((d) => d.name === currentMonthName) || {};
  const prevData = chartData.find((d) => d.name === prevMonthName) || {};

  const calculateGrowthPercent = (current, previous) => {
    if (previous === 0 && current === 0) return "0%";
    if (previous === 0) return "+100%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  if (loading)
    return (
      <Container fluid className="dashboard-container py-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </div>
      </Container>
    );

  return (
    <Container fluid className="dashboard-container py-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Section */}
      <div className="dashboard-header mb-4">
        <h4 className="fw-bold d-flex align-items-center gap-2 dashboard-title">
          <FaChartLine style={{ color: '#505ece' }} /> Dashboard Overview
        </h4>
        <p className="text-muted mb-0">Welcome to your admin dashboard</p>
      </div>

      {apiError && (
        <Alert variant="warning" dismissible className="mb-4">
          Unable to fetch latest data. Showing cached or default values.
        </Alert>
      )}

      {/* Stats Cards Section */}
      <Row className="g-4 mb-4">
        {[
          {
            icon: <FaBuilding />,
            value: (dashboardData?.totalCompanies?.value || 0).toString(),
            label: "Total Company",
            growth: dashboardData?.totalCompanies?.growth
              ? `+${dashboardData.totalCompanies.growth}%`
              : "+0%",
            color: "#27ae60",
          },
          {
            icon: <FaUsers />,
            value: (dashboardData?.totalRequests?.value || 0).toString(),
            label: "Total Request",
            growth: dashboardData?.totalRequests?.growth
              ? `+${dashboardData.totalRequests.growth}%`
              : "+0%",
            color: "#3498db",
          },
          {
            icon: <FaDollarSign />,
            value: `$${(dashboardData?.totalRevenue?.value || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            label: "Total Revenue",
            growth: dashboardData?.totalRevenue?.growth
              ? `+${dashboardData.totalRevenue.growth}%`
              : "+0%",
            color: "#e74c3c",
          },
          {
            icon: <FaUserPlus />,
            value: (dashboardData?.newSignupsCompany?.value || 0).toString(),
            label: "New Signups Company",
            growth: "Today",
            color: "#505ece",
          },
        ].map((card, index) => (
          <Col xs={12} sm={6} lg={3} key={index}>
            <Card className="dashboard-stats-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="dashboard-icon-box" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                    {card.icon}
                  </div>
                  <Badge className="dashboard-growth-badge" style={{ backgroundColor: card.color }}>
                    {card.growth}
                  </Badge>
                </div>
                <h4 className="fw-bold mb-2 dashboard-stat-value">{card.value}</h4>
                <p className="text-muted mb-0 dashboard-stat-label">{card.label}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Section */}
      <Row className="g-4">
        {/* Line Chart - Growth */}
        <Col xs={12} md={6}>
          <Card className="dashboard-chart-card h-100">
            <Card.Header className="dashboard-chart-header">
              <h6 className="mb-0 fw-bold">Total Growth</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="name" stroke="#6c757d" />
                  <YAxis stroke="#6c757d" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e9ecef', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Growth"
                    name="Growth (%)"
                    stroke="#505ece"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Bar Chart - Signup */}
        <Col xs={12} md={6}>
          <Card className="dashboard-chart-card h-100">
            <Card.Header className="dashboard-chart-header">
              <h6 className="mb-0 fw-bold">Signup Company</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="name" stroke="#6c757d" />
                  <YAxis stroke="#6c757d" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e9ecef', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="users" fill="#505ece" name="Signups" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Area Chart - Revenue */}
        <Col xs={12}>
          <Card className="dashboard-chart-card">
            <Card.Header className="dashboard-chart-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Revenue Trends</h6>
              <Button variant="outline-light" size="sm" className="btn-year-filter d-flex align-items-center gap-2">
                <FaCalendarAlt /> 2025
              </Button>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="name" stroke="#6c757d" />
                  <YAxis stroke="#6c757d" />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e9ecef', 
                      borderRadius: '8px' 
                    }} 
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue ($)"
                    stroke="#505ece"
                    fill="#505ece"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboardd;