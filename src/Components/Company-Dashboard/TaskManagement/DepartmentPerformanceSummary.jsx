import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Container, Spinner, Alert
} from 'react-bootstrap';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';
import {
  FaCheckCircle,
  FaTasks,
  FaExclamationTriangle,
  FaUserFriends,
  FaChartLine,
  FaClock
} from 'react-icons/fa';
import './DepartmentPerformanceSummary.css';

const DepartmentPerformanceSummary = () => {
  const companyId = GetCompanyId();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [statusDistribution, setStatusDistribution] = useState(null);
  const [monthlyCompletion, setMonthlyCompletion] = useState([]);

  // Fetch department summary by company ID
  useEffect(() => {
    const fetchSummary = async () => {
      if (!companyId) {
        setError('Company ID not found.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axiosInstance.get(`dashboard/departmentsSummary/${companyId}`);
        if (res?.data) {
          const data = res.data;
          setSummary(data.summary);
          setStatusDistribution(data.statusDistribution);
          setMonthlyCompletion(data.monthlyCompletion || []);
        } else {
          setError('Unexpected response format.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load department performance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [companyId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center loading-container" style={{ height: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading department performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Alert variant="danger" className="alert-custom">{error}</Alert>
      </div>
    );
  }

  // Prepare cards data
  const cards = [
    { icon: <FaCheckCircle />, title: 'Completed Tasks', value: summary?.completedTasks || 0, color: '#28a745' },
    { icon: <FaTasks />, title: 'In Progress Tasks', value: summary?.inProgressTasks || 0, color: '#17a2b8' },
    { icon: <FaExclamationTriangle />, title: 'Overdue Tasks', value: summary?.overdueTasks || 0, color: '#dc3545' },
    { icon: <FaUserFriends />, title: 'Active Employees', value: summary?.activeEmployees || 0, color: '#505ece' },
    { icon: <FaChartLine />, title: 'Efficiency', value: `${summary?.efficiency || 0}%`, color: summary?.efficiency >= 80 ? '#28a745' : summary?.efficiency >= 60 ? '#ffc107' : '#dc3545' },
    { icon: <FaClock />, title: 'Avg. Task Duration', value: `${summary?.avgTaskDuration || 0} days`, color: '#505ece' }
  ];

  // Prepare pie chart data from statusDistribution
  const pieData = statusDistribution
    ? [
      { name: 'Completed', value: statusDistribution.Completed || 0 },
      { name: 'In Progress', value: statusDistribution.InProgress || 0 },
      { name: 'Overdue', value: statusDistribution.Overdue || 0 },
    ]
    : [];

  const COLORS = ['#28a745', '#17a2b8', '#dc3545'];
  const CHART_COLOR = '#505ece';

  return (
    <Container fluid className="p-4 department-summary-container">
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="department-summary-title">
          <i className="fas fa-chart-bar me-2"></i>
          Department Performance Summary
        </h3>
        <p className="department-summary-subtitle">Real-time productivity and efficiency metrics for your company</p>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4 g-4">
        {cards.map((card, idx) => (
          <Col xs={12} sm={6} md={4} lg={4} xl={3} key={idx}>
            <Card className="stats-card">
              <Card.Body className="stats-card-body">
                <div className="stats-card-icon" style={{ color: card.color }}>
                  {card.icon}
                </div>
                <h6 className="stats-card-title">{card.title}</h6>
                <h4 className="stats-card-value" style={{ color: card.color }}>{card.value}</h4>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row className="g-4">
        {/* Pie Chart */}
        <Col lg={6}>
          <Card className="chart-card">
            <Card.Header className="chart-card-header">
              <h6>Task Status Distribution</h6>
            </Card.Header>
            <Card.Body className="chart-card-body">
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      paddingAngle={5}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Tasks']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Bar Chart */}
        <Col lg={6}>
          <Card className="chart-card">
            <Card.Header className="chart-card-header">
              <h6>Monthly Completed Tasks</h6>
            </Card.Header>
            <Card.Body className="chart-card-body">
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyCompletion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#495057"
                      tick={{ fill: '#495057' }}
                    />
                    <YAxis 
                      stroke="#495057"
                      tick={{ fill: '#495057' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e9ecef',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="completed" 
                      fill={CHART_COLOR} 
                      barSize={40} 
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DepartmentPerformanceSummary;