import React, { useState, useEffect, useRef } from 'react';
import {
  Table, Button, Modal, Form, Row, Col,
  InputGroup, Card, Badge, Container, Spinner
} from 'react-bootstrap';
import {
  FaEye, FaDownload, FaEnvelope, FaWhatsapp,
  FaCalendarAlt, FaUser, FaMoneyBillWave, FaSearch, FaFilter, FaTimes
} from 'react-icons/fa';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';
import './PaySlipReports.css';

// Convert "November, 2025" → "Nov 2025"
const apiMonthToUiMonth = (apiMonth) => {
  if (!apiMonth) return 'Jan 2025';
  const [full, yearPart] = apiMonth.split(', ');
  const mapping = {
    'January': 'Jan',
    'February': 'Feb',
    'March': 'Mar',
    'April': 'Apr',
    'May': 'May',
    'June': 'Jun',
    'July': 'Jul',
    'August': 'Aug',
    'September': 'Sep',
    'October': 'Oct',
    'November': 'Nov',
    'December': 'Dec'
  };
  const short = mapping[full] || 'Jan';
  return `${short} ${yearPart?.trim() || '2025'}`;
};

// Format as INR
const formatINR = (value) => {
  if (value == null) return '₹0';
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num) || !isFinite(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

const PayslipReports = () => {
  const companyIdRaw = GetCompanyId();
  const companyId = Number(companyIdRaw);

  const [payslips, setPayslips] = useState([]);
  const [uniqueMonths, setUniqueMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [payslipDetail, setPayslipDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef(0);

  // Filters
  const [monthFilter, setMonthFilter] = useState(''); // "Nov 2025"
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch payslip list
  useEffect(() => {
    const fetchPayslips = async () => {
      if (isNaN(companyId) || companyId <= 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get(`payslipReport/reports?company_id=${companyId}`);
        const data = res.data?.data || [];

        const mapped = data.map(item => ({
          id: item.id,
          payslipNo: item.payslipNo,
          employeeName: item.employeeName,
          department: item.department,
          month: item.month, // Keep API format for accurate filtering
          monthUi: apiMonthToUiMonth(item.month),
          netSalary: item.netSalary,
          paymentMode: item.paymentMode,
          status: item.status
        }));

        // Extract unique months in UI format for filter dropdown
        const monthsSet = new Set();
        mapped.forEach(p => monthsSet.add(p.monthUi));
        const sortedMonths = Array.from(monthsSet).sort((a, b) => {
          const [aShort, aYear] = a.split(' ');
          const [bShort, bYear] = b.split(' ');
          return new Date(bYear, getMonthIndex(bShort)) - new Date(aYear, getMonthIndex(aShort));
        });

        setPayslips(mapped);
        setUniqueMonths(sortedMonths);
        if (sortedMonths.length > 0) {
          setMonthFilter(''); // Default: show all
        }
      } catch (err) {
        console.error('Failed to fetch payslips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [companyId]);

  // Helper: Get month index from short name
  const getMonthIndex = (short) => {
    const map = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    return map[short] || 0;
  };

  // View Payslip
  const handleViewPayslip = async (payslip) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current += 1;
    
    setDetailLoading(true);
    setSelectedPayslip(payslip);
    try {
      const res = await axiosInstance.get(`payslipReport/details/${payslip.id}`);
      const detail = res.data?.data;
      if (detail) {
        setPayslipDetail(detail);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch payslip details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setShowModal(false);
    
    // Force modal remount on next open
    modalKeyRef.current += 1;
  };
  
  // Handle modal exit - cleanup after animation
  const handleModalExited = () => {
    // Reset payslip data after modal fully closed
    setSelectedPayslip(null);
    setPayslipDetail(null);
    isCleaningUpRef.current = false;
  };

  const handleDownload = (payslip) => {
    alert(`Downloading payslip ${payslip.payslipNo}`);
  };

  const handleEmail = (payslip) => {
    alert(`Emailing payslip to ${payslip.employeeName}`);
  };

  const handleWhatsApp = (payslip) => {
    alert(`Sending via WhatsApp to ${payslip.employeeName}`);
  };

  // Filtering: compare actual month/year
  const filteredPayslips = payslips.filter(payslip => {
    let matchesMonth = true;
    if (monthFilter) {
      matchesMonth = payslip.monthUi === monthFilter;
    }

    const matchesEmployee = !employeeFilter || payslip.employeeName.toLowerCase().includes(employeeFilter.toLowerCase());
    const matchesStatus = !statusFilter || payslip.status === statusFilter;

    return matchesMonth && matchesEmployee && matchesStatus;
  });


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center loading-container" style={{ height: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading payslip reports...</p>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    return status === "Paid" ? "badge-status badge-paid" : "badge-status badge-pending";
  };

  return (
    <Container fluid className="p-4 payslip-reports-container">
      {/* Header Section */}
      <div className="mb-4">
        <Row className="align-items-center">
          <Col xs={12} md={8}>
            <h3 className="payslip-reports-title">
              <i className="fas fa-file-invoice-dollar me-2"></i>
              Payslip Reports
            </h3>
            <p className="payslip-reports-subtitle">View and manage employee payslip reports</p>
          </Col>
        </Row>
      </div>

      {/* Filter Card */}
      <Card className="filter-card">
        <Card.Header className="d-flex justify-content-between align-items-center bg-white border-0 pb-0">
          <div className="d-flex align-items-center">
            <FaFilter className="me-2" style={{ color: '#505ece' }} />
            <h6 className="mb-0 filter-title">Filters</h6>
          </div>
          <Button
            variant="link"
            onClick={() => setShowFilters(!showFilters)}
            className="p-0"
            style={{ color: '#505ece' }}
          >
            {showFilters ? <FaTimes /> : <FaFilter />}
          </Button>
        </Card.Header>
        {showFilters && (
          <Card.Body className="pt-3">
            <Row>
              <Col xs={12} md={4} className="mb-3 mb-md-0">
                <Form.Group>
                  <Form.Label className="form-label-custom d-flex align-items-center">
                    <FaCalendarAlt className="me-1" /> Month
                  </Form.Label>
                  <InputGroup className="input-group-custom">
                    <InputGroup.Text>
                      <FaCalendarAlt />
                    </InputGroup.Text>
                    <Form.Select
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="form-select-custom"
                    >
                      <option value="">All Months</option>
                      {uniqueMonths.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xs={12} md={4} className="mb-3 mb-md-0">
                <Form.Group>
                  <Form.Label className="form-label-custom d-flex align-items-center">
                    <FaUser className="me-1" /> Employee
                  </Form.Label>
                  <InputGroup className="input-group-custom">
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search by Employee"
                      value={employeeFilter}
                      onChange={(e) => setEmployeeFilter(e.target.value)}
                      className="form-control-custom"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xs={12} md={4} className="mb-3 mb-md-0">
                <Form.Group>
                  <Form.Label className="form-label-custom d-flex align-items-center">
                    <FaMoneyBillWave className="me-1" /> Status
                  </Form.Label>
                  <InputGroup className="input-group-custom">
                    <InputGroup.Text>
                      <FaMoneyBillWave />
                    </InputGroup.Text>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="form-select-custom"
                    >
                      <option value="">All Statuses</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={12} className="text-end mt-3">
                <Button
                  className="btn-clear-filters"
                  onClick={() => {
                    setMonthFilter('');
                    setEmployeeFilter('');
                    setStatusFilter('');
                  }}
                >
                  <FaTimes className="me-1" /> Clear Filters
                </Button>
              </Col>
            </Row>
          </Card.Body>
        )}
      </Card>

      {/* Table Card */}
      <Card className="payslip-table-card border-0 shadow-lg">
        <Card.Body className="p-0">
          {/* Desktop Table */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <Table hover responsive className="payslip-table">
                <thead className="table-header">
                  <tr>
                    <th>Payslip No</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Month</th>
                    <th>Net Salary</th>
                    <th>Payment Mode</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayslips.length > 0 ? (
                    filteredPayslips.map((payslip) => (
                      <tr key={payslip.id}>
                        <td className="fw-semibold">{payslip.payslipNo}</td>
                        <td className="fw-semibold">{payslip.employeeName}</td>
                        <td>{payslip.department}</td>
                        <td>{payslip.monthUi}</td>
                        <td className="fw-bold text-primary">{formatINR(payslip.netSalary)}</td>
                        <td>{payslip.paymentMode}</td>
                        <td>
                          <Badge className={getStatusBadgeClass(payslip.status)}>
                            {payslip.status}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              className="btn-action btn-view"
                              onClick={() => handleViewPayslip(payslip)}
                              title="View"
                            >
                              <FaEye />
                            </Button>
                            <Button
                              className="btn-action btn-download"
                              onClick={() => handleDownload(payslip)}
                              title="Download"
                            >
                              <FaDownload />
                            </Button>
                            <Button
                              className="btn-action btn-email"
                              onClick={() => handleEmail(payslip)}
                              title="Email"
                            >
                              <FaEnvelope />
                            </Button>
                            <Button
                              className="btn-action btn-whatsapp"
                              onClick={() => handleWhatsApp(payslip)}
                              title="WhatsApp"
                            >
                              <FaWhatsapp />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        No payslips found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="d-md-none p-3">
            {filteredPayslips.length > 0 ? (
              filteredPayslips.map((payslip) => (
                <Card key={payslip.id} className="mobile-card mb-3">
                  <Card.Body className="mobile-card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <Card.Title className="h6 mb-1 fw-bold" style={{ color: '#505ece' }}>
                          {payslip.payslipNo}
                        </Card.Title>
                        <Card.Subtitle className="text-muted small">{payslip.employeeName}</Card.Subtitle>
                      </div>
                      <Badge className={getStatusBadgeClass(payslip.status)}>
                        {payslip.status}
                      </Badge>
                    </div>
                    <div className="mb-3">
                      <div className="mb-2"><strong>Department:</strong> {payslip.department}</div>
                      <div className="mb-2"><strong>Month:</strong> {payslip.monthUi}</div>
                      <div className="mb-2"><strong>Net Salary:</strong> <span className="fw-bold text-primary">{formatINR(payslip.netSalary)}</span></div>
                      <div className="mb-2"><strong>Payment Mode:</strong> {payslip.paymentMode}</div>
                    </div>
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        className="btn-action btn-view"
                        onClick={() => handleViewPayslip(payslip)}
                        title="View"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        className="btn-action btn-download"
                        onClick={() => handleDownload(payslip)}
                        title="Download"
                      >
                        <FaDownload />
                      </Button>
                      <Button
                        className="btn-action btn-email"
                        onClick={() => handleEmail(payslip)}
                        title="Email"
                      >
                        <FaEnvelope />
                      </Button>
                      <Button
                        className="btn-action btn-whatsapp"
                        onClick={() => handleWhatsApp(payslip)}
                        title="WhatsApp"
                      >
                        <FaWhatsapp />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted py-4">
                No payslips found.
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Payslip Detail Modal */}
      <Modal
        key={modalKeyRef.current}
        show={showModal}
        onHide={handleCloseModal}
        onExited={handleModalExited}
        size="lg"
        fullscreen="md-down"
        centered
        className="payslip-reports-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Payslip Details - {selectedPayslip?.payslipNo}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {detailLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" className="spinner-custom" />
              <p className="mt-3 text-muted">Loading payslip details...</p>
            </div>
          ) : payslipDetail ? (
            <>
              <div className="text-center mb-4">
                <h4 className="fw-bold" style={{ color: '#505ece' }}>{payslipDetail.companyInfo.name}</h4>
                <p className="mb-0 text-muted">{payslipDetail.companyInfo.address}</p>
              </div>

              <Row className="mb-4">
                <Col xs={12} md={6} className="mb-3 mb-md-0">
                  <h5 className="fw-bold" style={{ color: '#505ece' }}><FaUser className="me-2" />Employee Information</h5>
                  <Table borderless>
                    <tbody>
                      <tr><td><strong>Name:</strong></td><td>{payslipDetail.employeeInfo.name}</td></tr>
                      <tr><td><strong>Department:</strong></td><td>{payslipDetail.employeeInfo.department}</td></tr>
                      <tr><td><strong>Designation:</strong></td><td>{payslipDetail.employeeInfo.designation}</td></tr>
                      <tr><td><strong>Employee Code:</strong></td><td>{payslipDetail.employeeInfo.employeeCode}</td></tr>
                    </tbody>
                  </Table>
                </Col>
                <Col xs={12} md={6}>
                  <h5 className="fw-bold" style={{ color: '#505ece' }}><FaCalendarAlt className="me-2" />Payslip Information</h5>
                  <Table borderless>
                    <tbody>
                      <tr><td><strong>Payslip No:</strong></td><td>{payslipDetail.payslipInfo.payslipNo}</td></tr>
                      <tr><td><strong>Month:</strong></td><td>{payslipDetail.payslipInfo.month}</td></tr>
                      <tr><td><strong>Payment Mode:</strong></td><td>{payslipDetail.payslipInfo.paymentMode}</td></tr>
                      <tr>
                        <td><strong>Status:</strong></td>
                        <td>
                          <Badge className={getStatusBadgeClass(payslipDetail.payslipInfo.status)}>
                            {payslipDetail.payslipInfo.status}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              <h5 className="mb-3 fw-bold" style={{ color: '#505ece' }}>Earnings</h5>
              <div className="table-responsive mb-4">
                <Table hover responsive className="payslip-detail-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Basic Salary</td><td className="fw-semibold text-success">{formatINR(payslipDetail.earnings.basicSalary)}</td></tr>
                    <tr><td>Bonus</td><td className="fw-semibold text-success">{formatINR(payslipDetail.earnings.bonus)}</td></tr>
                    <tr><td>Allowances</td><td className="fw-semibold text-success">{formatINR(payslipDetail.earnings.allowances)}</td></tr>
                    <tr><td>Overtime Pay</td><td className="fw-semibold text-success">{formatINR(payslipDetail.earnings.overtimePay)}</td></tr>
                    <tr className="table-primary">
                      <td><strong>Total Earnings</strong></td>
                      <td><strong className="text-success">{formatINR(payslipDetail.earnings.totalEarnings)}</strong></td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              <h5 className="mb-3 fw-bold" style={{ color: '#505ece' }}>Deductions</h5>
              <div className="table-responsive mb-4">
                <Table hover responsive className="payslip-detail-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Tax</td><td className="fw-semibold text-danger">{formatINR(payslipDetail.deductions.Tax)}</td></tr>
                    <tr><td>Provident Fund</td><td className="fw-semibold text-danger">{formatINR(payslipDetail.deductions.Provident_Fund)}</td></tr>
                    <tr><td>Insurance</td><td className="fw-semibold text-danger">{formatINR(payslipDetail.deductions.Insurance)}</td></tr>
                    <tr className="table-primary">
                      <td><strong>Total Deductions</strong></td>
                      <td><strong className="text-danger">{formatINR(payslipDetail.deductions.totalDeductions)}</strong></td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              <div className="summary-card text-center mb-4">
                <h4 className="fw-bold" style={{ color: '#505ece' }}>
                  Net Pay: <span className="text-primary">{formatINR(payslipDetail.summary.netSalary)}</span>
                </h4>
                <p className="mb-0 text-muted">{payslipDetail.summary.netSalaryInWords}</p>
              </div>

              <Row className="mb-4">
                <Col xs={12}>
                  <h5 className="fw-bold" style={{ color: '#505ece' }}>Bank Information</h5>
                  <Table borderless>
                    <tbody>
                      <tr><td><strong>Bank Name:</strong></td><td>{payslipDetail.bankInfo.bankName}</td></tr>
                      <tr><td><strong>Account Holder:</strong></td><td>{payslipDetail.bankInfo.accountHolder}</td></tr>
                      <tr><td><strong>Account Number:</strong></td><td>****{payslipDetail.bankInfo.accountNumber.slice(-4)}</td></tr>
                      <tr><td><strong>IFSC Code:</strong></td><td>{payslipDetail.bankInfo.ifscCode}</td></tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              <div className="d-flex justify-content-between mt-5">
                <div>
                  <p className="mb-1 fw-semibold">Employee Signature</p>
                  <div className="border-bottom" style={{ width: '150px', borderColor: '#e9ecef', borderWidth: '2px' }}></div>
                </div>
                <div>
                  <p className="mb-1 fw-semibold">Authorized Signature</p>
                  <div className="border-bottom" style={{ width: '150px', borderColor: '#e9ecef', borderWidth: '2px' }}></div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-danger py-4">Error loading payslip details.</div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button
            className="btn-modal-cancel"
            onClick={handleCloseModal}
          >
            Close
          </Button>
          <Button
            className="btn-modal-download d-flex align-items-center"
            onClick={() => handleDownload(selectedPayslip)}
          >
            <FaDownload className="me-1" /> Download PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PayslipReports;