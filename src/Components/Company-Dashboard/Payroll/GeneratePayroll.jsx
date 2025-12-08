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
  FaTimes,
  FaPaperPlane,
  FaFilter,
  FaCalendarAlt,
  FaBuilding,
  FaUser,
  FaMoneyBillWave,
  FaCheckCircle
} from 'react-icons/fa';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';

const GeneratePayroll = () => {
  const companyIdRaw = GetCompanyId();
  const companyId = Number(companyIdRaw);

  const [payrollData, setPayrollData] = useState([]);
  const [filteredPayroll, setFilteredPayroll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState(['All']);
  const [loading, setLoading] = useState(true);

  // Filters
  const [monthFilter, setMonthFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [previewData, setPreviewData] = useState([]);

  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [currentPayslip, setCurrentPayslip] = useState(null);

  // Actions
  const [selectedRows, setSelectedRows] = useState([]);

  // Static data
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = ['2023', '2024', '2025'];

  // Fetch employees and payroll history
  useEffect(() => {
    if (isNaN(companyId) || companyId <= 0) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch employees
        const empRes = await axiosInstance.get(`employee?company_id=${companyId}`);
        const empList = empRes.data?.data?.employees || [];
        const mappedEmployees = empList.map(emp => ({
          id: emp.id,
          name: emp.full_name,
          department: emp.department?.name || 'N/A',
          basic_salary: emp.basic_salary || '0'
        }));
        setEmployees(mappedEmployees);
        const depts = ['All', ...new Set(mappedEmployees.map(e => e.department))];
        setDepartments(depts);

        // 🔥 Fetch payroll data using the new API endpoint
        const payrollRes = await axiosInstance.get(`payrollReport/payroll?companyId=${companyId}`);
        const payrollResponse = payrollRes.data;

        // Extract and map employeeReport
        const payrollList = (payrollResponse.employeeReport || []).map(item => ({
          id: item.Employee, // temporary; use payroll_id if available
          employeeId: item.Employee, // will update if backend sends id
          employeeName: item.Employee,
          department: item.Department || 'N/A',
          month: item.Month, // e.g., "November, 2025"
          basicPay: parseFloat(item.Gross_Pay) || 0, // Gross_Pay is used as basic for now
          earnings: 0, // not in current response
          deductions: parseFloat(item.Deductions) || 0,
          netPay: parseFloat(item.Net_Pay) || 0,
          paymentStatus: item.Status || 'Pending'
        }));

        setPayrollData(payrollList);
        setFilteredPayroll(payrollList);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        alert('Error loading payroll or employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  // Apply filters
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

  // Modal handlers
  const handleShowModal = () => {
    const now = new Date();
    setSelectedMonth(months[now.getMonth()]);
    setSelectedYear(now.getFullYear().toString());
    setSelectedEmployees([]);
    setPreviewData([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployees([]);
    setRemarks('');
    setPreviewData([]);
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  const handlePreview = () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }

    const preview = selectedEmployees.map(empId => {
      const emp = employees.find(e => e.id === empId);
      const basic = parseFloat(emp.basic_salary) || 0;
      const earnings = Math.round(basic * 0.3);
      const deductions = Math.round(basic * 0.15);
      const netPay = basic + earnings - deductions;

      return {
        id: empId,
        employeeName: emp.name,
        department: emp.department,
        basicPay: basic,
        earnings,
        deductions,
        netPay
      };
    });

    setPreviewData(preview);
  };

  const handleGeneratePayroll = async () => {
    if (previewData.length === 0) {
      alert('Please preview the payroll first');
      return;
    }

    try {
      const payload = {
        companyId: companyId,
        year: selectedYear,
        month: selectedMonth,
        selectedEmployees: selectedEmployees
      };

      const response = await axiosInstance.post(`payrollRequest/generatePayroll`, payload);

      if (response.data.success) {
        // Map new payroll using **actual API response structure**
        const newPayroll = response.data.data.map(item => ({
          id: item.payroll_id,
          employeeId: item.employee_id,
          employeeName: item.Employee_Name,
          department: item.Department,
          month: item.Month, // Already in "November, 2025" format
          basicPay: parseFloat(item.Basic_Pay) || 0,
          earnings: parseFloat(item.Earnings) || 0,
          deductions: parseFloat(item.Deductions) || 0,
          netPay: parseFloat(item.Net_Pay) || 0,
          paymentStatus: item.Payment_Status || 'Pending'
        }));

        setPayrollData(prev => [...prev, ...newPayroll]);
        handleCloseModal();
        alert('Payroll generated successfully!');
      } else {
        alert(response.data.message || 'Failed to generate payroll');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating payroll. Please try again.');
    }
  };

  // UI Helpers
  const handleRowSelect = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAllRows = () => {
    if (selectedRows.length === filteredPayroll.length && filteredPayroll.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredPayroll.map(item => item.id));
    }
  };

  const handleApprovePayment = (id) => {
    setPayrollData(prev =>
      prev.map(item =>
        item.id === id ? { ...item, paymentStatus: 'Paid' } : item
      )
    );
  };

  const handleDeletePayroll = (id, employeeName) => {
    if (window.confirm(`Are you sure you want to delete payroll for ${employeeName}?`)) {
      setPayrollData(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleBulkApprove = () => {
    if (selectedRows.length === 0) {
      alert('Please select at least one row');
      return;
    }
    setPayrollData(prev =>
      prev.map(item =>
        selectedRows.includes(item.id)
          ? { ...item, paymentStatus: 'Paid' }
          : item
      )
    );
    setSelectedRows([]);
    alert('Selected payroll records approved successfully!');
  };

  const handleSendEmail = (employeeName) => {
    alert(`Sending payslip for ${employeeName} via email`);
  };

  const handleSendWhatsApp = (employeeName) => {
    alert(`Sending payslip for ${employeeName} via WhatsApp`);
  };

  const handleViewPayslip = (payslipId) => {
    const payslip = payrollData.find(item => item.id === payslipId);
    if (payslip) {
      setCurrentPayslip(payslip);
      setShowPayslipModal(true);
    }
  };

  const formatINR = (value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Mobile Card Component
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
          <div><div className="small text-muted">Net Pay</div><div className="fw-bold" style={{ color: '#023347' }}>{formatINR(row.netPay)}</div></div>
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
        <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
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
                      {/* Extract unique months from payroll data */}
                      {[...new Set(payrollData.map(p => p.month))].map(month => (
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

          {/* Desktop Table */}
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
                      <td>{formatINR(row.netPay)}</td>
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

          {/* Mobile Cards */}
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
                  </div>
                </Col>

                {previewData.length > 0 && (
                  <Col xs={12}>
                    <h5 className="mt-3 mb-3" style={{ color: '#023347' }}>Preview</h5>
                    <div className="table-responsive">
                      <Table striped bordered hover size="sm">
                        <thead style={{ backgroundColor: '#2a8e9c', color: '#ffffff' }}>
                          <tr>
                            <th>Employee Name</th>
                            <th>Department</th>
                            <th>Net Pay</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((item) => (
                            <tr key={item.id}>
                              <td>{item.employeeName}</td>
                              <td>{item.department}</td>
                              <td>{formatINR(item.netPay)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Col>
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

          {/* Payslip Modal */}
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
                          <tr><td><strong>Name:</strong></td><td>{currentPayslip.employeeName}</td></tr>
                          <tr><td><strong>Department:</strong></td><td>{currentPayslip.department}</td></tr>
                          <tr><td><strong>Designation:</strong></td><td>{currentPayslip.designation || 'N/A'}</td></tr>
                        </tbody>
                      </Table>
                    </Col>
                    <Col md={6}>
                      <h5 style={{ color: '#023347' }}><FaCalendarAlt className="me-2" />Pay Period</h5>
                      <Table borderless>
                        <tbody>
                          <tr><td><strong>Month:</strong></td><td>{currentPayslip.month}</td></tr>
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
                            <th>Gross Pay</th>
                            <th>Deductions</th>
                            <th>Net Pay</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{formatINR(currentPayslip.basicPay)}</td>
                            <td className="text-danger">{formatINR(currentPayslip.deductions)}</td>
                            <td><strong style={{ color: '#023347' }}>{formatINR(currentPayslip.netPay)}</strong></td>
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