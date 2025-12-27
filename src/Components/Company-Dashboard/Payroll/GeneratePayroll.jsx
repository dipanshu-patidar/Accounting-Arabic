import React, { useState, useEffect, useRef } from 'react';
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
import './GeneratePayroll.css';
import { Spinner } from 'react-bootstrap';

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

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0, payslip: 0 });

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
  const handleCloseModal = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setShowModal(false);
    
    // Force modal remount on next open
    modalKeyRef.current.main += 1;
  };
  
  // Handle modal exit - cleanup after animation
  const handleModalExited = () => {
    // Reset form state after modal fully closed
    setSelectedMonth('');
    setSelectedYear('');
    setSelectedEmployees([]);
    setRemarks('');
    setPreviewData([]);
    isCleaningUpRef.current = false;
  };
  
  const handleClosePayslipModal = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setShowPayslipModal(false);
    
    // Force modal remount on next open
    modalKeyRef.current.payslip += 1;
  };
  
  // Handle payslip modal exit - cleanup after animation
  const handlePayslipModalExited = () => {
    // Reset payslip data after modal fully closed
    setCurrentPayslip(null);
    isCleaningUpRef.current = false;
  };

  const handleShowModal = () => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    const now = new Date();
    setSelectedMonth(months[now.getMonth()]);
    setSelectedYear(now.getFullYear().toString());
    setSelectedEmployees([]);
    setPreviewData([]);
    setShowModal(true);
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
        // Reset cleanup flag before closing
        isCleaningUpRef.current = false;
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
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.payslip += 1;
    
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
    <Card className="mobile-card mb-3">
      <Card.Body className="mobile-card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Card.Title className="h6 mb-1 fw-bold" style={{ color: '#505ece' }}>{row.employeeName}</Card.Title>
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
          <Badge className={row.paymentStatus === 'Paid' ? 'badge-status badge-paid' : 'badge-status badge-pending'}>
            {row.paymentStatus}
          </Badge>
          <span className="ms-2 small text-muted">{row.month}</span>
        </div>

        <div className="d-flex justify-content-between mb-3">
          <div><div className="small text-muted">Net Pay</div><div className="fw-bold text-primary">{formatINR(row.netPay)}</div></div>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <Button
            className="btn-action btn-view"
            onClick={() => handleViewPayslip(row.id)}
            title="View"
          >
            <FaEye />
          </Button>
          {row.paymentStatus === 'Pending' && (
            <Button
              className="btn-action btn-approve"
              onClick={() => handleApprovePayment(row.id)}
              title="Approve"
            >
              <FaCheck />
            </Button>
          )}
          <Button
            className="btn-action btn-email"
            onClick={() => handleSendEmail(row.employeeName)}
            title="Email"
          >
            <FaEnvelope />
          </Button>
          <Button
            className="btn-action btn-whatsapp"
            onClick={() => handleSendWhatsApp(row.employeeName)}
            title="WhatsApp"
          >
            <FaWhatsapp />
          </Button>
          <Button
            className="btn-action btn-delete"
            onClick={() => handleDeletePayroll(row.id, row.employeeName)}
            title="Delete"
          >
            <FaTrash />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center loading-container" style={{ height: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="p-4 generate-payroll-container">
      {/* Header Section */}
      <div className="mb-4">
        <Row className="align-items-center">
          <Col xs={12} md={8}>
            <h3 className="generate-payroll-title">
              <i className="fas fa-money-bill-wave me-2"></i>
              Payroll Management
            </h3>
            <p className="generate-payroll-subtitle">Generate and manage employee payroll records</p>
          </Col>
          <Col xs={12} md={4} className="d-flex justify-content-md-end mt-3 mt-md-0">
            <Button className="btn-generate-payroll d-flex align-items-center" onClick={handleShowModal}>
              <FaPlus className="me-2" /> Generate Payroll
            </Button>
          </Col>
        </Row>
      </div>

      {/* Filter Card */}
      <Card className="filter-card">
        <Card.Header className="d-flex align-items-center">
          <FaFilter className="me-2" />
          <h6 className="mb-0 filter-title">Filters</h6>
        </Card.Header>
        <Card.Body>
              <Row>
                <Col xs={12} sm={6} md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className="form-label-custom d-flex align-items-center"><FaCalendarAlt className="me-1" /> Month</Form.Label>
                    <Form.Select
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="form-select-custom"
                    >
                      <option value="">All Months</option>
                      {[...new Set(payrollData.map(p => p.month))].map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className="form-label-custom d-flex align-items-center"><FaBuilding className="me-1" /> Department</Form.Label>
                    <Form.Select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="form-select-custom"
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
                      className="btn-clear-filters d-block w-100"
                      onClick={() => {
                        setMonthFilter('');
                        setDepartmentFilter('');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6} md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label>&nbsp;</Form.Label>
                    <Button
                      className="btn-bulk-approve d-block w-100 d-flex align-items-center justify-content-center"
                      onClick={handleBulkApprove}
                      disabled={selectedRows.length === 0}
                    >
                      <FaCheckCircle className="me-2" />
                      Bulk Approve ({selectedRows.length})
                    </Button>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Table Card */}
          <Card className="payroll-table-card border-0 shadow-lg">
            <Card.Body className="p-0">
              {/* Desktop Table */}
              <div className="d-none d-md-block">
                <div className="table-responsive">
                  <Table hover responsive className="payroll-table">
                    <thead className="table-header">
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
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayroll.length > 0 ? (
                        filteredPayroll.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedRows.includes(row.id)}
                                onChange={() => handleRowSelect(row.id)}
                              />
                            </td>
                            <td className="fw-semibold">{row.employeeName}</td>
                            <td>{row.department}</td>
                            <td>{row.month}</td>
                            <td className="fw-bold text-primary">{formatINR(row.netPay)}</td>
                            <td>
                              <Badge className={row.paymentStatus === 'Paid' ? 'badge-status badge-paid' : 'badge-status badge-pending'}>
                                {row.paymentStatus}
                              </Badge>
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <Button
                                  className="btn-action btn-view"
                                  onClick={() => handleViewPayslip(row.id)}
                                  title="View Payslip"
                                >
                                  <FaEye />
                                </Button>
                                {row.paymentStatus === 'Pending' && (
                                  <Button
                                    className="btn-action btn-approve"
                                    onClick={() => handleApprovePayment(row.id)}
                                    title="Approve"
                                  >
                                    <FaCheck />
                                  </Button>
                                )}
                                <Button
                                  className="btn-action btn-email"
                                  onClick={() => handleSendEmail(row.employeeName)}
                                  title="Send via Email"
                                >
                                  <FaEnvelope />
                                </Button>
                                <Button
                                  className="btn-action btn-whatsapp"
                                  onClick={() => handleSendWhatsApp(row.employeeName)}
                                  title="Send via WhatsApp"
                                >
                                  <FaWhatsapp />
                                </Button>
                                <Button
                                  className="btn-action btn-delete"
                                  onClick={() => handleDeletePayroll(row.id, row.employeeName)}
                                  title="Delete"
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center text-muted py-4">
                            No payroll records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="d-md-none p-3">
                {filteredPayroll.length > 0 ? (
                  filteredPayroll.map((row) => (
                    <PayrollCard key={row.id} row={row} />
                  ))
                ) : (
                  <div className="text-center text-muted py-4">
                    No payroll records found.
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

      {/* Generate Payroll Modal */}
      <Modal 
        key={modalKeyRef.current.main}
        show={showModal} 
        onHide={handleCloseModal}
        onExited={handleModalExited}
        size="lg" 
        fullscreen="sm-down"
        centered
        className="generate-payroll-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Generate Payroll</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom"><FaCalendarAlt className="me-1" /> Month</Form.Label>
                <Form.Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="form-select-custom"
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom"><FaCalendarAlt className="me-1" /> Year</Form.Label>
                <Form.Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="form-select-custom"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Label className="form-label-custom mt-2 mb-2"><FaUser className="me-1" /> Select Employees</Form.Label>
              <Form.Check
                type="checkbox"
                label="Select All"
                checked={selectedEmployees.length === employees.length}
                onChange={handleSelectAll}
                className="mb-2 fw-semibold"
              />
              <div className="employee-selection-list">
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
                <Form.Label className="form-label-custom">Remarks (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <div className="d-flex flex-column flex-sm-row justify-content-between mt-3 gap-2">
                <Button
                  className="btn-modal-preview d-flex justify-content-center align-items-center flex-grow-1"
                  onClick={handlePreview}
                >
                  <FaCalculator className="me-2" /> Preview & Calculate
                </Button>
              </div>
            </Col>

            {previewData.length > 0 && (
              <Col xs={12}>
                <h5 className="mt-3 mb-3 fw-bold" style={{ color: '#505ece' }}>Preview</h5>
                <div className="table-responsive">
                  <Table hover responsive size="sm" className="preview-table">
                    <thead>
                      <tr>
                        <th>Employee Name</th>
                        <th>Department</th>
                        <th>Net Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((item) => (
                        <tr key={item.id}>
                          <td className="fw-semibold">{item.employeeName}</td>
                          <td>{item.department}</td>
                          <td className="fw-bold text-primary">{formatINR(item.netPay)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            className="btn-modal-generate"
            onClick={handleGeneratePayroll}
            disabled={previewData.length === 0}
          >
            Generate Payroll
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payslip Modal */}
      <Modal 
        key={modalKeyRef.current.payslip}
        show={showPayslipModal} 
        onHide={handleClosePayslipModal}
        onExited={handlePayslipModalExited}
        size="lg" 
        fullscreen="sm-down"
        centered
        className="generate-payroll-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Payslip Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {currentPayslip && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5 className="fw-bold" style={{ color: '#505ece' }}><FaUser className="me-2" />Employee Information</h5>
                  <Table borderless>
                    <tbody>
                      <tr><td><strong>Name:</strong></td><td>{currentPayslip.employeeName}</td></tr>
                      <tr><td><strong>Department:</strong></td><td>{currentPayslip.department}</td></tr>
                      <tr><td><strong>Designation:</strong></td><td>{currentPayslip.designation || 'N/A'}</td></tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5 className="fw-bold" style={{ color: '#505ece' }}><FaCalendarAlt className="me-2" />Pay Period</h5>
                  <Table borderless>
                    <tbody>
                      <tr><td><strong>Month:</strong></td><td>{currentPayslip.month}</td></tr>
                      <tr>
                        <td><strong>Payment Status:</strong></td>
                        <td>
                          <Badge className={currentPayslip.paymentStatus === 'Paid' ? 'badge-status badge-paid' : 'badge-status badge-pending'}>
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
                  <h5 className="fw-bold" style={{ color: '#505ece' }}><FaMoneyBillWave className="me-2" />Salary Details</h5>
                  <Table hover responsive className="payslip-details-table">
                    <thead>
                      <tr>
                        <th>Gross Pay</th>
                        <th>Deductions</th>
                        <th>Net Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-semibold text-success">{formatINR(currentPayslip.basicPay)}</td>
                        <td className="fw-semibold text-danger">{formatINR(currentPayslip.deductions)}</td>
                        <td className="fw-bold text-primary">{formatINR(currentPayslip.netPay)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-preview d-flex align-items-center" style={{ borderColor: '#505ece', color: '#505ece' }}>
            <FaDownload className="me-1" /> Download
          </Button>
          <Button className="btn-modal-preview d-flex align-items-center">
            <FaEnvelope className="me-1" /> Email
          </Button>
          <Button className="btn-action btn-whatsapp d-flex align-items-center">
            <FaWhatsapp className="me-1" /> WhatsApp
          </Button>
          <Button className="btn-modal-cancel" onClick={handleClosePayslipModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GeneratePayroll;