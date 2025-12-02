import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Container, DropdownButton, Dropdown, Badge
} from 'react-bootstrap';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const DepartmentPerformanceSummary = () => {
  const [selectedDept, setSelectedDept] = useState('IT Department');
  const [departments] = useState([
    'IT Department',
    'HR Department',
    'Finance Department',
    'Operations'
  ]);

  const [analyticsData] = useState({
    'IT Department': { completed: 42, inProgress: 18, overdue: 7, activeEmployees: 12, totalTasks: 67, efficiency: Math.round((42 / 67) * 100), avgDuration: 4.2,
      taskHistory: [{ month: 'Jun', completed: 8 }, { month: 'Jul', completed: 10 }, { month: 'Aug', completed: 9 }, { month: 'Sep', completed: 7 }, { month: 'Oct', completed: 8 }]
    },
    'HR Department': { completed: 28, inProgress: 12, overdue: 3, activeEmployees: 8, totalTasks: 43, efficiency: Math.round((28 / 43) * 100), avgDuration: 3.1,
      taskHistory: [{ month: 'Jun', completed: 5 }, { month: 'Jul', completed: 6 }, { month: 'Aug', completed: 5 }, { month: 'Sep', completed: 6 }, { month: 'Oct', completed: 6 }]
    },
    'Finance Department': { completed: 35, inProgress: 9, overdue: 5, activeEmployees: 6, totalTasks: 49, efficiency: Math.round((35 / 49) * 100), avgDuration: 5.7,
      taskHistory: [{ month: 'Jun', completed: 7 }, { month: 'Jul', completed: 8 }, { month: 'Aug', completed: 6 }, { month: 'Sep', completed: 7 }, { month: 'Oct', completed: 7 }]
    },
    'Operations': { completed: 50, inProgress: 22, overdue: 10, activeEmployees: 15, totalTasks: 82, efficiency: Math.round((50 / 82) * 100), avgDuration: 6.3,
      taskHistory: [{ month: 'Jun', completed: 10 }, { month: 'Jul', completed: 12 }, { month: 'Aug', completed: 9 }, { month: 'Sep', completed: 10 }, { month: 'Oct', completed: 9 }]
    }
  });

  const data = analyticsData[selectedDept];

  const cards = [
    { icon: '✅', title: 'Completed Tasks', value: data?.completed || 0, color: '#2a8e9c' },
    { icon: '⚙️', title: 'Tasks in Progress', value: data?.inProgress || 0, color: '#17a2b8' },
    { icon: '⏰', title: 'Overdue Tasks', value: data?.overdue || 0, color: '#dc3545' },
    { icon: '👥', title: 'Active Employees', value: data?.activeEmployees || 0, color: '#6f42c1' },
    { icon: '📊', title: 'Efficiency', value: `${data?.efficiency || 0}%`, color: data?.efficiency >= 80 ? '#28a745' : data?.efficiency >= 60 ? '#ffc107' : '#dc3545' },
    { icon: '🕒', title: 'Avg. Task Duration', value: `${data?.avgDuration || 0} days`, color: '#fd7e14' }
  ];

  const pieData = [
    { name: 'Completed', value: data?.completed || 0 },
    { name: 'In Progress', value: data?.inProgress || 0 },
    { name: 'Overdue', value: data?.overdue || 0 }
  ];

  const COLORS = ['#2a8e9c', '#89c3cf', '#dc3545'];

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Header */}
      <div className="mb-4 text-center text-md-start">
        <h2 style={{ color: '#023347', fontWeight: 'bold', letterSpacing: '0.5px' }}>
          Department-wise Performance Summary
        </h2>
        <p style={{ color: '#2a8e9c' }} className='text-center'>Track productivity and efficiency across departments.</p>
      </div>

      {/* Department Selector */}
      <div className="mb-4 d-flex justify-content-end">
        <DropdownButton
          title={`Department: ${selectedDept}`}
          onSelect={(dept) => setSelectedDept(dept)}
          size="sm"
          style={{
            borderRadius: '10px',
            border: '2px solid #2a8e9c',
            backgroundColor: '#023347',
            color: '#023347'
          }}
        >
          {departments.map((dept) => (
            <Dropdown.Item key={dept} eventKey={dept}>{dept}</Dropdown.Item>
          ))}
        </DropdownButton>
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
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
                  <BarChart data={data?.taskHistory || []}>
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
