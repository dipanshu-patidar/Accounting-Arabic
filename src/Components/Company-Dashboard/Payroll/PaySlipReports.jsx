import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Row, Col,
  InputGroup, Card
} from 'react-bootstrap';
import {
  FaEye, FaDownload, FaEnvelope, FaWhatsapp,
  FaCalendarAlt, FaUser, FaMoneyBillWave
} from 'react-icons/fa';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';

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


  return (
    <div className="container-fluid mt-4 px-3 px-md-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh' }}>
      <h2 className="mb-4 text-center text-md-start" style={{ color: '#023347' }}>Payslip Reports</h2>

      {/* Filters */}
      <Row className="mb-4">
        <Col xs={12} md={4} className="mb-3 mb-md-0">
          <InputGroup>
            <InputGroup.Text style={{ backgroundColor: '#e6f3f5', border: '1px solid #ced4da', color: '#023347' }}>
              <FaCalendarAlt />
            </InputGroup.Text>
            <Form.Select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              style={{ border: '1px solid #ced4da' }}
            >
              <option value="">All Months</option>
              {uniqueMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>
        <Col xs={12} md={4} className="mb-3 mb-md-0">
          <InputGroup>
            <InputGroup.Text style={{ backgroundColor: '#e6f3f5', border: '1px solid #ced4da', color: '#023347' }}>
              <FaUser />
            </InputGroup.Text>
            <Form.Control
              placeholder="Filter by Employee"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              style={{ border: '1px solid #ced4da' }}
            />
          </InputGroup>
        </Col>
        <Col xs={12} md={4}>
          <InputGroup>
            <InputGroup.Text style={{ backgroundColor: '#e6f3f5', border: '1px solid #ced4da', color: '#023347' }}>
              <FaMoneyBillWave />
            </InputGroup.Text>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ border: '1px solid #ced4da' }}
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      {/* Desktop Table */}
      <div className="d-none d-md-block">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Payslip No</th>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Month</th>
              <th>Net Salary</th>
              <th>Payment Mode</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayslips.length > 0 ? (
              filteredPayslips.map((payslip) => (
                <tr key={payslip.id}>
                  <td>{payslip.payslipNo}</td>
                  <td>{payslip.employeeName}</td>
                  <td>{payslip.department}</td>
                  <td>{payslip.monthUi}</td>
                  <td>{formatINR(payslip.netSalary)}</td>
                  <td>{payslip.paymentMode}</td>
                  <td>
                    <span className={`badge ${payslip.status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                      {payslip.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-around">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleViewPayslip(payslip)}
                        style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleDownload(payslip)}
                        style={{ color: '#2a8e9c', backgroundColor: '#e6f3f5' }}
                      >
                        <FaDownload />
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleEmail(payslip)}
                        style={{ color: '#2a8e9c', backgroundColor: '#e6f3f5' }}
                      >
                        <FaEnvelope />
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleWhatsApp(payslip)}
                        style={{ color: '#25D366', backgroundColor: '#e6f3f5' }}
                      >
                        <FaWhatsapp />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">No payslips found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="d-md-none">
        {filteredPayslips.length > 0 ? (
          filteredPayslips.map((payslip) => (
            <Card key={payslip.id} className="mb-3" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
              <Card.Body>
                <Card.Title className="d-flex justify-content-between align-items-center" style={{ color: '#023347' }}>
                  <span>{payslip.payslipNo}</span>
                  <span className={`badge ${payslip.status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                    {payslip.status}
                  </span>
                </Card.Title>
                <Card.Text>
                  <div className="mb-2"><strong>Employee:</strong> {payslip.employeeName}</div>
                  <div className="mb-2"><strong>Department:</strong> {payslip.department}</div>
                  <div className="mb-2"><strong>Month:</strong> {payslip.monthUi}</div>
                  <div className="mb-2"><strong>Net Salary:</strong> {formatINR(payslip.netSalary)}</div>
                  <div className="mb-3"><strong>Payment Mode:</strong> {payslip.paymentMode}</div>
                  <div className="d-flex justify-content-around">
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => handleViewPayslip(payslip)}
                      style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                    >
                      <FaEye />
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => handleDownload(payslip)}
                      style={{ color: '#2a8e9c', backgroundColor: '#e6f3f5' }}
                    >
                      <FaDownload />
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => handleEmail(payslip)}
                      style={{ color: '#2a8e9c', backgroundColor: '#e6f3f5' }}
                    >
                      <FaEnvelope />
                    </Button>
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => handleWhatsApp(payslip)}
                      style={{ color: '#25D366', backgroundColor: '#e6f3f5' }}
                    >
                      <FaWhatsapp />
                    </Button>
                  </div>
                </Card.Text>
              </Card.Body>
            </Card>
          ))
        ) : (
          <div className="text-center py-4">No payslips found</div>
        )}
      </div>

      {/* Payslip Detail Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        fullscreen="md-down"
      >
        <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#ffffff' }}>
          <Modal.Title>Payslip Details - {selectedPayslip?.payslipNo}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3 p-md-4" style={{ backgroundColor: '#f0f7f8' }}>
          {detailLoading ? (
            <div className="text-center py-4">Loading payslip details...</div>
          ) : payslipDetail ? (
            <>
              <div className="text-center mb-4">
                <h4 style={{ color: '#023347' }}>{payslipDetail.companyInfo.name}</h4>
                <p className="mb-0">{payslipDetail.companyInfo.address}</p>
              </div>

              <Row className="mb-4">
                <Col xs={12} md={6} className="mb-3 mb-md-0">
                  <h5 style={{ color: '#023347' }}>Employee Information</h5>
                  <p className="mb-1"><strong>Name:</strong> {payslipDetail.employeeInfo.name}</p>
                  <p className="mb-1"><strong>Department:</strong> {payslipDetail.employeeInfo.department}</p>
                  <p className="mb-1"><strong>Designation:</strong> {payslipDetail.employeeInfo.designation}</p>
                  <p className="mb-0"><strong>Employee Code:</strong> {payslipDetail.employeeInfo.employeeCode}</p>
                </Col>
                <Col xs={12} md={6}>
                  <h5 style={{ color: '#023347' }}>Payslip Information</h5>
                  <p className="mb-1"><strong>Payslip No:</strong> {payslipDetail.payslipInfo.payslipNo}</p>
                  <p className="mb-1"><strong>Month:</strong> {payslipDetail.payslipInfo.month}</p>
                  <p className="mb-1"><strong>Payment Mode:</strong> {payslipDetail.payslipInfo.paymentMode}</p>
                  <p className="mb-0"><strong>Status:</strong> {payslipDetail.payslipInfo.status}</p>
                </Col>
              </Row>

              <h5 className="mb-3" style={{ color: '#023347' }}>Earnings</h5>
              <div className="table-responsive mb-4">
                <Table striped bordered hover>
                  <thead style={{ backgroundColor: '#2a8e9c', color: '#ffffff' }}>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Basic Salary</td><td>{formatINR(payslipDetail.earnings.basicSalary)}</td></tr>
                    <tr><td>Bonus</td><td>{formatINR(payslipDetail.earnings.bonus)}</td></tr>
                    <tr><td>Allowances</td><td>{formatINR(payslipDetail.earnings.allowances)}</td></tr>
                    <tr><td>Overtime Pay</td><td>{formatINR(payslipDetail.earnings.overtimePay)}</td></tr>
                    <tr className="table-primary">
                      <td><strong>Total Earnings</strong></td>
                      <td><strong>{formatINR(payslipDetail.earnings.totalEarnings)}</strong></td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              <h5 className="mb-3" style={{ color: '#023347' }}>Deductions</h5>
              <div className="table-responsive mb-4">
                <Table striped bordered hover>
                  <thead style={{ backgroundColor: '#2a8e9c', color: '#ffffff' }}>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Tax</td><td>{formatINR(payslipDetail.deductions.Tax)}</td></tr>
                    <tr><td>Provident Fund</td><td>{formatINR(payslipDetail.deductions.Provident_Fund)}</td></tr>
                    <tr><td>Insurance</td><td>{formatINR(payslipDetail.deductions.Insurance)}</td></tr>
                    <tr className="table-primary">
                      <td><strong>Total Deductions</strong></td>
                      <td><strong>{formatINR(payslipDetail.deductions.totalDeductions)}</strong></td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#e6f3f5' }}>
                <h4 style={{ color: '#023347' }}>
                  Net Pay: {formatINR(payslipDetail.summary.netSalary)}
                </h4>
                <p className="mb-0">{payslipDetail.summary.netSalaryInWords}</p>
              </div>

              <Row className="mb-4">
                <Col xs={12}>
                  <h5 style={{ color: '#023347' }}>Bank Information</h5>
                  <p className="mb-1"><strong>Bank Name:</strong> {payslipDetail.bankInfo.bankName}</p>
                  <p className="mb-1"><strong>Account Holder:</strong> {payslipDetail.bankInfo.accountHolder}</p>
                  <p className="mb-1"><strong>Account Number:</strong> ****{payslipDetail.bankInfo.accountNumber.slice(-4)}</p>
                  <p className="mb-0"><strong>IFSC Code:</strong> {payslipDetail.bankInfo.ifscCode}</p>
                </Col>
              </Row>

              <div className="d-flex justify-content-between mt-5">
                <div>
                  <p className="mb-1">Employee Signature</p>
                  <div className="border-bottom" style={{ width: '150px', borderColor: '#ced4da' }}></div>
                </div>
                <div>
                  <p className="mb-1">Authorized Signature</p>
                  <div className="border-bottom" style={{ width: '150px', borderColor: '#ced4da' }}></div>
                </div>
              </div>
            </>
          ) : (
            <div>Error loading payslip details.</div>
          )}
        </Modal.Body>
        <Modal.Footer className="flex-column flex-md-row" style={{ backgroundColor: '#f0f7f8', border: 'none' }}>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            className="w-100 w-md-auto mb-2 mb-md-0"
            style={{ border: '1px solid #ced4da' }}
          >
            Close
          </Button>
          <Button
            style={{ backgroundColor: '#023347', border: 'none' }}
            onClick={() => handleDownload(selectedPayslip)}
            className="w-100 w-md-auto d-flex justify-content-center align-items-center"
          >
            <FaDownload className="me-1" /> Download PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PayslipReports;