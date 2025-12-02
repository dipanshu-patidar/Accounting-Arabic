import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Container
} from 'react-bootstrap';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const DepartmentalAnalyticsDashboard = () => {
  // Mock data
  const [totalEmployees] = useState(142);
  const [payrollData] = useState([
    { department: 'IT', amount: 420000 },
    { department: 'HR', amount: 180000 },
    { department: 'Finance', amount: 210000 },
    { department: 'Operations', amount: 350000 },
    { department: 'Sales', amount: 290000 }
  ]);
  const [leaveData] = useState({ approved: 24, pending: 8 });
  const [attendanceData] = useState([
    { day: 'Mon', present: 132 },
    { day: 'Tue', present: 136 },
    { day: 'Wed', present: 128 },
    { day: 'Thu', present: 138 },
    { day: 'Fri', present: 130 }
  ]);
  const [expenseData] = useState([
    { month: 'Jun', amount: 85000 },
    { month: 'Jul', amount: 92000 },
    { month: 'Aug', amount: 78000 },
    { month: 'Sep', amount: 95000 },
    { month: 'Oct', amount: 102000 }
  ]);
  const [taskStatusData] = useState([
    { name: 'Completed', value: 62 },
    { name: 'In Progress', value: 24 },
    { name: 'Pending', value: 14 }
  ]);

  const COLORS = ['#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'];
  const TASK_COLORS = ['#28a745', '#17a2b8', '#ffc107'];

  return (
    <Container fluid className="p-3 p-md-4" style={{ backgroundColor: '#f8fbfc', minHeight: '100vh' }}>
      <div className="mb-4">
        <h2 className="text-primary fw-bold" style={{ color: '#023347' }}>Departmental Analytics Dashboard</h2>
        <p className="text-muted">Real-time insights across HR, payroll, attendance, and operations.</p>
      </div>

      {/* Row 1: Total Employees + Leave Summary */}
      <Row className="g-4 mb-4">
        {/* Total Employees */}
        <Col md={6} xl={4}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
              <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                <span className="display-6 text-primary">👥</span>
              </div>
              <h6 className="text-muted mb-1">Total Employees</h6>
              <h2 className="fw-bold" style={{ color: '#023347' }}>{totalEmployees}</h2>
            </Card.Body>
          </Card>
        </Col>

        {/* Leave Summary */}
        <Col md={6} xl={4}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
            <Card.Body className="d-flex flex-column">
              <h6 className="text-muted mb-3">Leave Summary</h6>
              <div className="d-flex justify-content-between mb-2">
                <span>Approved</span>
                <span className="fw-bold text-success">{leaveData.approved}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Pending</span>
                <span className="fw-bold text-warning">{leaveData.pending}</span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${(leaveData.approved / (leaveData.approved + leaveData.pending)) * 100}%` }}
                ></div>
                <div
                  className="progress-bar bg-warning"
                  style={{ width: `${(leaveData.pending / (leaveData.approved + leaveData.pending)) * 100}%` }}
                ></div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Attendance Overview */}
        <Col md={12} xl={4}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
            <Card.Body>
              <h6 className="text-muted mb-3">Attendance Overview (This Week)</h6>
              <div style={{ height: '120px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis hide domain={[120, 140]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="present"
                      stroke="#2a8e9c"
                      strokeWidth={3}
                      dot={{ stroke: '#023347', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="d-flex justify-content-between mt-2 small text-muted">
                <span>Avg: 132</span>
                <span>Present: {attendanceData.reduce((a, b) => a + b.present, 0)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Department-wise Payroll + Expense Chart + Task Status */}
      <Row className="g-4">
        {/* Department-wise Payroll */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
            <Card.Header className="bg-white py-2">
              <h6 className="mb-0 fw-bold" style={{ color: '#023347' }}>Department-wise Payroll (SAR)</h6>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payrollData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="department" type="category" width={80} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [`SAR ${Number(value).toLocaleString()}`, 'Amount']} />
                    <Bar dataKey="amount" fill="#2a8e9c" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Expense Chart */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
            <Card.Header className="bg-white py-2">
              <h6 className="mb-0 fw-bold" style={{ color: '#023347' }}>Monthly Expenses (SAR)</h6>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis
                      tickFormatter={(value) => `SAR ${value / 1000}k`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip formatter={(value) => [`SAR ${Number(value).toLocaleString()}`, 'Expense']} />
                    <Bar dataKey="amount" fill="#fd7e14" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Task Status Pie */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
            <Card.Header className="bg-white py-2">
              <h6 className="mb-0 fw-bold" style={{ color: '#023347' }}>Task Status</h6>
            </Card.Header>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <div style={{ width: '180px', height: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TASK_COLORS[index % TASK_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Tasks']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 small text-muted">
                Total Tasks: {taskStatusData.reduce((a, b) => a + b.value, 0)}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DepartmentalAnalyticsDashboard;