import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Container, Spinner, Alert
} from 'react-bootstrap';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
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
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#f0f7f8' }}>
        <Spinner animation="border" style={{ color: '#023347' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh', backgroundColor: '#f0f7f8' }}>
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  // Prepare cards data
  const cards = [
    { icon: <FaCheckCircle size={24} />, title: 'Completed Tasks', value: summary?.completedTasks || 0, color: '#28a745' },
    { icon: <FaTasks size={24} />, title: 'In Progress Tasks', value: summary?.inProgressTasks || 0, color: '#17a2b8' },
    { icon: <FaExclamationTriangle size={24} />, title: 'Overdue Tasks', value: summary?.overdueTasks || 0, color: '#dc3545' },
    { icon: <FaUserFriends size={24} />, title: 'Active Employees', value: summary?.activeEmployees || 0, color: '#6f42c1' },
    { icon: <FaChartLine size={24} />, title: 'Efficiency', value: `${summary?.efficiency || 0}%`, color: summary?.efficiency >= 80 ? '#28a745' : summary?.efficiency >= 60 ? '#ffc107' : '#dc3545' },
    { icon: <FaClock size={24} />, title: 'Avg. Task Duration', value: `${summary?.avgTaskDuration || 0} days`, color: '#fd7e14' }
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

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Header */}
      <div className="mb-4 text-center text-md-start">
        <h2 style={{ color: '#023347', fontWeight: 'bold', letterSpacing: '0.5px' }}>
          Department Performance Summary
        </h2>
        <p style={{ color: '#2a8e9c' }} className="text-center">
          Real-time productivity and efficiency metrics for your company.
        </p>
      </div>

      {/* Cards */}
      <Row className="mb-4 g-4">
        {cards.map((card, idx) => (
          <Col xs={12} sm={6} md={4} lg={4} xl={3} key={idx}>
            <Card
              className="h-100 shadow-sm"
              style={{
                border: 'none',
                borderRadius: '16px',
                backgroundColor: '#e6f3f5',
                transition: 'transform 0.3s ease',
              }}
            >
              <Card.Body className="text-center py-4">
                <div className="fs-3 mb-2">{card.icon}</div>
                <h6 className="fw-bold" style={{ color: '#023347' }}>{card.title}</h6>
                <h4 className="fw-bold" style={{ color: card.color }}>{card.value}</h4>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row className="g-4">
        {/* Pie Chart */}
        <Col lg={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '16px', backgroundColor: '#ffffff' }}>
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="fw-bold mb-0" style={{ color: '#023347' }}>Task Status Distribution</h6>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={2}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Tasks']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Bar Chart */}
        <Col lg={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '16px', backgroundColor: '#ffffff' }}>
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="fw-bold mb-0" style={{ color: '#023347' }}>Monthly Completed Tasks</h6>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyCompletion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#023347" />
                    <YAxis stroke="#023347" />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#2a8e9c" barSize={40} radius={[10, 10, 0, 0]} />
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