import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Table, 
  Form, 
  Row, 
  Col, 
  Modal, 
  Badge,
  Dropdown,
  Container
} from 'react-bootstrap';
import { 
  FaPlus, 
  FaCalculator, 
  FaDownload, 
  FaEnvelope, 
  FaWhatsapp, 
  FaEye, 
  FaCheck, 
  FaTrash,
  FaEllipsisV,
  FaTimes,
  FaPaperPlane,
  FaFilter,
  FaCalendarAlt,
  FaBuilding,
  FaUser,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaCheckCircle
} from 'react-icons/fa';

const GeneratePayroll = () => {
  // State for payroll data
  const [payrollData, setPayrollData] = useState([]);
  const [filteredPayroll, setFilteredPayroll] = useState([]);
  
  // State for filters
  const [monthFilter, setMonthFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [previewData, setPreviewData] = useState([]);
  
  // State for payslip modal
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [currentPayslip, setCurrentPayslip] = useState(null);
  
  // State for actions
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Mock data for employees
  const employees = [
    { id: 1, name: 'Rahul Sharma', department: 'Engineering', basicPay: 50000, email: 'rahul.sharma@company.com', phone: '+91 9876543210' },
    { id: 2, name: 'Priya Singh', department: 'HR', basicPay: 45000, email: 'priya.singh@company.com', phone: '+91 9876543211' },
    { id: 3, name: 'Amit Patel', department: 'Finance', basicPay: 55000, email: 'amit.patel@company.com', phone: '+91 9876543212' },
    { id: 4, name: 'Sneha Reddy', department: 'Engineering', basicPay: 60000, email: 'sneha.reddy@company.com', phone: '+91 9876543213' },
    { id: 5, name: 'Vikas Kumar', department: 'Marketing', basicPay: 48000, email: 'vikas.kumar@company.com', phone: '+91 9876543214' },
  ];
  
  // Mock departments
  const departments = ['All', 'Engineering', 'HR', 'Finance', 'Marketing'];
  
  // Mock months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Mock years
  const years = ['2023', '2024', '2025'];
  
  // Initialize with some payroll data
  useEffect(() => {
    const mockPayroll = [
      {
        id: 1,
        employeeName: 'Rahul Sharma',
        department: 'Engineering',
        month: 'January 2024',
        basicPay: 50000,
        earnings: 15000,
        deductions: 8000,
        netPay: 57000,
        paymentStatus: 'Paid',
        employeeId: 1
      },
      {
        id: 2,
        employeeName: 'Priya Singh',
        department: 'HR',
        month: 'January 2024',
        basicPay: 45000,
        earnings: 12000,
        deductions: 7500,
        netPay: 49500,
        paymentStatus: 'Pending',
        employeeId: 2
      },
      {
        id: 3,
        employeeName: 'Amit Patel',
        department: 'Finance',
        month: 'February 2024',
        basicPay: 55000,
        earnings: 18000,
        deductions: 9000,
        netPay: 64000,
        paymentStatus: 'Paid',
        employeeId: 3
      }
    ];
    
    setPayrollData(mockPayroll);
    setFilteredPayroll(mockPayroll);
  }, []);
  
  // Handle filter changes
  useEffect(() => {
    let result = payrollData;
    
    if (monthFilter) {
      result = result.filter(item => item.month.includes(monthFilter));
    }
    
    if (departmentFilter && departmentFilter !== 'All') {
      result = result.filter(item => item.department === departmentFilter);
    }
    
    setFilteredPayroll(result);
  }, [monthFilter, departmentFilter, payrollData]);
  
  // Handle modal show
  const handleShowModal = () => {
    setShowModal(true);
    // Set current month and year as default
    const currentDate = new Date();
    setSelectedMonth(months[currentDate.getMonth()]);
    setSelectedYear(currentDate.getFullYear().toString());
  };
  
  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployees([]);
    setRemarks('');
    setPreviewData([]);
  };
  
  // Handle employee selection
  const handleEmployeeSelect = (employeeId) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };
  
  // Handle select all employees
  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };
  
  // Handle preview calculation
  const handlePreview = () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }
    
    const preview = selectedEmployees.map(empId => {
      const employee = employees.find(emp => emp.id === empId);
      // Mock calculation
      const earnings = Math.round(employee.basicPay * 0.3);
      const deductions = Math.round(employee.basicPay * 0.15);
      const netPay = employee.basicPay + earnings - deductions;
      
      return {
        id: empId,
        employeeName: employee.name,
        department: employee.department,
        basicPay: employee.basicPay,
        earnings,
        deductions,
        netPay
      };
    });
    
    setPreviewData(preview);
  };
  
  // Handle generate payroll
  const handleGeneratePayroll = () => {
    if (previewData.length === 0) {
      alert('Please preview the payroll first');
      return;
    }
    
    const newPayroll = previewData.map(item => ({
      ...item,
      month: `${selectedMonth} ${selectedYear}`,
      paymentStatus: 'Pending'
    }));
    
    setPayrollData([...payrollData, ...newPayroll]);
    handleCloseModal();
    alert('Payroll generated successfully!');
  };
  
  // Handle row selection
  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };
  
  // Handle select all rows
  const handleSelectAllRows = () => {
    if (selectedRows.length === filteredPayroll.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredPayroll.map(item => item.id));
    }
  };
  
  // Handle approve payment
  const handleApprovePayment = (id) => {
    setPayrollData(payrollData.map(item => 
      item.id === id ? { ...item, paymentStatus: 'Paid' } : item
    ));
  };
  
  // Handle delete payroll
  const handleDeletePayroll = (id, employeeName) => {
    if (window.confirm(`Are you sure you want to delete payroll for ${employeeName}?`)) {
      setPayrollData(payrollData.filter(item => item.id !== id));
    }
  };
  
  // Handle bulk approve
  const handleBulkApprove = () => {
    if (selectedRows.length === 0) {
      alert('Please select at least one row');
      return;
    }
    
    setPayrollData(payrollData.map(item => 
      selectedRows.includes(item.id) ? { ...item, paymentStatus: 'Paid' } : item
    ));
    setSelectedRows([]);
    alert('Selected payroll records approved successfully!');
  };
  
  // Handle download all payslips
  const handleDownloadAll = () => {
    alert('Downloading all payslips as PDF...');
  };
  
  // Handle send via email
  const handleSendEmail = (employeeName) => {
    alert(`Sending payslip for ${employeeName} via email`);
  };
  
  // Handle send via WhatsApp
  const handleSendWhatsApp = (employeeName) => {
    alert(`Sending payslip for ${employeeName} via WhatsApp`);
  };
  
  // Handle view payslip
  const handleViewPayslip = (payslipId) => {
    const payslip = payrollData.find(item => item.id === payslipId);
    if (payslip) {
      const employee = employees.find(emp => emp.id === payslip.employeeId);
      setCurrentPayslip({
        ...payslip,
        employeeDetails: employee
      });
      setShowPayslipModal(true);
    }
  };

  // Mobile-friendly payroll card
  const PayrollCard = ({ row }) => (
    <Card className="mb-3" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Card.Title className="h6 mb-1" style={{ color: '#023347' }}>{row.employeeName}</Card.Title>
            <Card.Subtitle className="mb-1 text-muted">
              <FaBuilding className="me-1" size={12} />
              {row.department}
            </Card.Subtitle>
          </div>
          <Form.Check 
            type="checkbox"
            checked={selectedRows.includes(row.id)}
            onChange={() => handleRowSelect(row.id)}
          />
        </div>
        
        <div className="mb-2">
          <Badge bg={row.paymentStatus === 'Paid' ? 'success' : 'warning'}>
            {row.paymentStatus}
          </Badge>
          <span className="ms-2 small text-muted">{row.month}</span>
        </div>
        
        <div className="d-flex justify-content-between mb-3">
          <div>
            <div className="small text-muted">Basic Pay</div>
            <div>₹{row.basicPay.toLocaleString()}</div>
          </div>
          <div>
            <div className="small text-muted">Earnings</div>
            <div className="text-success">₹{row.earnings.toLocaleString()}</div>
          </div>
          <div>
            <div className="small text-muted">Deductions</div>
            <div className="text-danger">₹{row.deductions.toLocaleString()}</div>
          </div>
          <div>
            <div className="small text-muted">Net Pay</div>
            <div className="fw-bold" style={{ color: '#023347' }}>₹{row.netPay.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="d-flex gap-1 flex-wrap">
          <Button 
            variant="light"
            size="sm"
            onClick={() => handleViewPayslip(row.id)}
            className="d-flex align-items-center"
            style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
          >
            <FaEye className="me-1" /> 
          </Button>
          {row.paymentStatus === 'Pending' && (
            <Button 
              variant="light"
              size="sm"
              onClick={() => handleApprovePayment(row.id)}
              className="d-flex align-items-center"
              style={{ color: '#28a745', backgroundColor: '#e6f3f5' }}
            >
              <FaCheck className="me-1" />
            </Button>
          )}
          <Button 
            variant="light"
            size="sm"
            onClick={() => handleSendEmail(row.employeeName)}
            className="d-flex align-items-center"
            style={{ color: '#2a8e9c', backgroundColor: '#e6f3f5' }}
          >
            <FaEnvelope className="me-1" />
          </Button>
          <Button 
            variant="light"
            size="sm"
            onClick={() => handleSendWhatsApp(row.employeeName)}
            className="d-flex align-items-center"
            style={{ color: '#25D366', backgroundColor: '#e6f3f5' }}
          >
            <FaWhatsapp className="me-1" /> 
          </Button>
          <Button 
            variant="light"
            size="sm"
            onClick={() => handleDeletePayroll(row.id, row.employeeName)}
            className="d-flex align-items-center"
            style={{ color: '#dc3545', backgroundColor: '#e6f3f5' }}
          >
            <FaTrash className="me-1" /> 
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="p-3 p-md-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh' }}>
      <Card style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
        <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center" >
          <h4 className="mb-3 mb-md-0">Payroll Management</h4>
          <Button style={{ backgroundColor: '#2a8e9c', border: 'none' }} onClick={handleShowModal} className='d-flex justify-content-center align-items-center w-30 w-md-auto'>
            <FaPlus className="me-2" /> Generate Payroll
          </Button>
        </Card.Header>
        <Card.Body>
          {/* Filters */}
          <Card className="mb-4 border-light" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
            <Card.Header className="d-flex align-items-center" style={{ backgroundColor: '#023347', color: '#ffffff' }}>
              <FaFilter className="me-2" />
              <h6 className="mb-0">Filters</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={12} sm={6} md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className='d-flex align-items-center'><FaCalendarAlt className="me-1" /> Month</Form.Label>
                    <Form.Select 
                      value={monthFilter} 
                      onChange={(e) => setMonthFilter(e.target.value)}
                      style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                    >
                      <option value="">All Months</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className='d-flex align-items-center'><FaBuilding className="me-1" /> Department</Form.Label>
                    <Form.Select 
                      value={departmentFilter} 
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label>&nbsp;</Form.Label>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => {
                        setMonthFilter('');
                        setDepartmentFilter('');
                      }}
                      className="d-block w-100"
                      style={{ borderColor: '#ced4da', color: '#023347' }}
                    >
                      Clear Filters
                    </Button>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label>&nbsp;</Form.Label>
                    <Button 
                      style={{ backgroundColor: '#2a8e9c', border: 'none' }}
                      onClick={handleBulkApprove}
                      disabled={selectedRows.length === 0}
                      className="d-block w-100 d-flex align-items-center justify-content-center"
                    >
                      <FaCheckCircle className="me-2" /> 
                      Bulk Approve ({selectedRows.length})
                    </Button>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {/* Desktop Table View */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>
                      <Form.Check 
                        type="checkbox"
                        checked={selectedRows.length === filteredPayroll.length && filteredPayroll.length > 0}
                        onChange={handleSelectAllRows}
                      />
                    </th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Month</th>
                    <th>Basic Pay</th>
                    <th>Earnings</th>
                    <th>Deductions</th>
                    <th>Net Pay</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayroll.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <Form.Check 
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleRowSelect(row.id)}
                        />
                      </td>
                      <td>{row.employeeName}</td>
                      <td>{row.department}</td>
                      <td>{row.month}</td>
                      <td>₹{row.basicPay.toLocaleString()}</td>
                      <td>₹{row.earnings.toLocaleString()}</td>
                      <td>₹{row.deductions.toLocaleString()}</td>
                      <td>₹{row.netPay.toLocaleString()}</td>
                      <td>
                        <Badge bg={row.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                          {row.paymentStatus}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button 
                            variant="light"
                            size="sm"
                            onClick={() => handleViewPayslip(row.id)}
                            title="View Payslip"
                            style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                          >
                            <FaEye />
                          </Button>
                          {row.paymentStatus === 'Pending' && (
                            <Button 
                              variant="light"
                              size="sm"
                              onClick={() => handleApprovePayment(row.id)}
                              title="Approve"
                              style={{ color: '#28a745', backgroundColor: '#e6f3f5' }}
                            >
                              <FaCheck />
                            </Button>
                          )}
                          <Button 
                            variant="light"
                            size="sm"
                            onClick={() => handleSendEmail(row.employeeName)}
                            title="Send via Email"
                            style={{ color: '#2a8e9c', backgroundColor: '#e6f3f5' }}
                          >
                            <FaEnvelope />
                          </Button>
                          <Button 
                            variant="light"
                            size="sm"
                            onClick={() => handleSendWhatsApp(row.employeeName)}
                            title="Send via WhatsApp"
                            style={{ color: '#25D366', backgroundColor: '#e6f3f5' }}
                          >
                            <FaWhatsapp />
                          </Button>
                          <Button 
                            variant="light"
                            size="sm"
                            onClick={() => handleDeletePayroll(row.id, row.employeeName)}
                            title="Delete"
                            style={{ color: '#dc3545', backgroundColor: '#e6f3f5' }}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
          
          {/* Mobile Card View */}
          <div className="d-md-none">
            {filteredPayroll.map((row) => (
              <PayrollCard key={row.id} row={row} />
            ))}
          </div>
          
          {/* Generate Payroll Modal */}
          <Modal show={showModal} onHide={handleCloseModal} size="lg" fullscreen="sm-down">
            <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#ffffff' }}>
              <Modal.Title>Generate Payroll</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#f0f7f8' }}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><FaCalendarAlt className="me-1" /> Month</Form.Label>
                    <Form.Select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                    >
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><FaCalendarAlt className="me-1" /> Year</Form.Label>
                    <Form.Select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col xs={12}>
                  <Form.Label className="mt-2 mb-2"><FaUser className="me-1" /> Select Employees</Form.Label>
                  <Form.Check
                    type="checkbox"
                    label="Select All"
                    checked={selectedEmployees.length === employees.length}
                    onChange={handleSelectAll}
                    className="mb-2"
                  />
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px', padding: '10px', backgroundColor: '#e6f3f5' }}>
                    {employees.map(employee => (
                      <Form.Check
                        key={employee.id}
                        type="checkbox"
                        label={`${employee.name} (${employee.department})`}
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleEmployeeSelect(employee.id)}
                        className="mb-1"
                      />
                    ))}
                  </div>
                </Col>
                
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Remarks (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                    />
                  </Form.Group>
                </Col>
                
                <Col xs={12}>
                  <div className="d-flex flex-column flex-sm-row justify-content-between mt-3 gap-2">
                    <Button 
                      variant="outline-primary" 
                      onClick={handlePreview}
                      className='d-flex justify-content-center align-items-center flex-grow-1'
                      style={{ borderColor: '#023347', color: '#023347' }}
                    >
                      <FaCalculator className="me-2" /> Preview & Calculate
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleDownloadAll}
                      className='d-flex justify-content-center align-items-center flex-grow-1'
                      style={{ borderColor: '#2a8e9c', color: '#2a8e9c' }}
                    >
                      <FaDownload className="me-2" /> Download All Payslips
                    </Button>
                  </div>
                </Col>
                
                {previewData.length > 0 && (
                  <>
                    <Col xs={12}>
                      <h5 className="mt-3 mb-3" style={{ color: '#023347' }}>Preview</h5>
                      <div className="table-responsive">
                        <Table striped bordered hover size="sm">
                          <thead style={{ backgroundColor: '#2a8e9c', color: '#ffffff' }}>
                            <tr>
                              <th>Employee Name</th>
                              <th>Department</th>
                              <th>Basic Pay</th>
                              <th>Earnings</th>
                              <th>Deductions</th>
                              <th>Net Pay</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.map((item) => (
                              <tr key={item.id}>
                                <td>{item.employeeName}</td>
                                <td>{item.department}</td>
                                <td>₹{item.basicPay.toLocaleString()}</td>
                                <td>₹{item.earnings.toLocaleString()}</td>
                                <td>₹{item.deductions.toLocaleString()}</td>
                                <td>₹{item.netPay.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Col>
                  </>
                )}
              </Row>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#f0f7f8', border: 'none' }}>
              <Button variant="secondary" onClick={handleCloseModal} style={{ border: '1px solid #ced4da' }}>
                Cancel
              </Button>
              <Button 
                style={{ backgroundColor: '#023347', border: 'none' }}
                onClick={handleGeneratePayroll}
                disabled={previewData.length === 0}
              >
                 Generate Payroll
              </Button>
            </Modal.Footer>
          </Modal>
          
          {/* Payslip View Modal */}
          <Modal show={showPayslipModal} onHide={() => setShowPayslipModal(false)} size="lg" fullscreen="sm-down">
            <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#ffffff' }}>
              <Modal.Title>Payslip Details</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#f0f7f8' }}>
              {currentPayslip && (
                <>
                  <Row className="mb-4">
                    <Col md={6}>
                      <h5 style={{ color: '#023347' }}><FaUser className="me-2" />Employee Information</h5>
                      <Table borderless>
                        <tbody>
                          <tr>
                            <td><strong>Name:</strong></td>
                            <td>{currentPayslip.employeeName}</td>
                          </tr>
                          <tr>
                            <td><strong>Department:</strong></td>
                            <td>{currentPayslip.department}</td>
                          </tr>
                          <tr>
                            <td><strong>Email:</strong></td>
                            <td>{currentPayslip.employeeDetails?.email || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Phone:</strong></td>
                            <td>{currentPayslip.employeeDetails?.phone || 'N/A'}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                    <Col md={6}>
                      <h5 style={{ color: '#023347' }}><FaCalendarAlt className="me-2" />Pay Period</h5>
                      <Table borderless>
                        <tbody>
                          <tr>
                            <td><strong>Month:</strong></td>
                            <td>{currentPayslip.month}</td>
                          </tr>
                          <tr>
                            <td><strong>Payment Status:</strong></td>
                            <td>
                              <Badge bg={currentPayslip.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                                {currentPayslip.paymentStatus}
                              </Badge>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col xs={12}>
                      <h5 style={{ color: '#023347' }}><FaMoneyBillWave className="me-2" />Salary Details</h5>
                      <Table striped bordered>
                        <thead style={{ backgroundColor: '#2a8e9c', color: '#ffffff' }}>
                          <tr>
                            <th>Basic Pay</th>
                            <th>Earnings</th>
                            <th>Deductions</th>
                            <th>Net Pay</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>₹{currentPayslip.basicPay.toLocaleString()}</td>
                            <td className="text-success">₹{currentPayslip.earnings.toLocaleString()}</td>
                            <td className="text-danger">₹{currentPayslip.deductions.toLocaleString()}</td>
                            <td><strong style={{ color: '#023347' }}>₹{currentPayslip.netPay.toLocaleString()}</strong></td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                </>
              )}
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#f0f7f8', border: 'none' }}>
              <Button variant="outline-primary" className="d-flex align-items-center" style={{ borderColor: '#023347', color: '#023347' }}>
                <FaDownload className="me-1" /> Download
              </Button>
              <Button variant="outline-info" className="d-flex align-items-center" style={{ borderColor: '#2a8e9c', color: '#2a8e9c' }}>
                <FaEnvelope className="me-1" /> Email
              </Button>
              <Button variant="outline-success" className="d-flex align-items-center" style={{ borderColor: '#25D366', color: '#25D366' }}>
                <FaWhatsapp className="me-1" /> WhatsApp
              </Button>
              <Button variant="secondary" onClick={() => setShowPayslipModal(false)} style={{ border: '1px solid #ced4da' }}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GeneratePayroll;