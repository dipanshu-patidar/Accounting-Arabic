import React, { useState } from 'react';
import { 
  Table, Button, Modal, Form, Row, Col, 
  InputGroup, FormControl, DropdownButton, Dropdown,
  Card
} from 'react-bootstrap';
import { 
  FaEye, FaDownload, FaEnvelope, FaWhatsapp, 
  FaSearch, FaFilter, FaCalendarAlt, FaUser, FaMoneyBillWave
} from 'react-icons/fa';

const PayslipReports = () => {
  // Sample data for payslips
  const [payslips, setPayslips] = useState([
    {
      id: 1,
      payslipNo: 'PS-001',
      employeeName: 'John Doe',
      department: 'Engineering',
      month: 'January 2023',
      netSalary: 4500,
      paymentMode: 'Bank',
      status: 'Paid'
    },
    {
      id: 2,
      payslipNo: 'PS-002',
      employeeName: 'Jane Smith',
      department: 'Marketing',
      month: 'January 2023',
      netSalary: 4200,
      paymentMode: 'Bank',
      status: 'Paid'
    },
    {
      id: 3,
      payslipNo: 'PS-003',
      employeeName: 'Robert Johnson',
      department: 'Finance',
      month: 'February 2023',
      netSalary: 5000,
      paymentMode: 'Cash',
      status: 'Pending'
    },
    {
      id: 4,
      payslipNo: 'PS-004',
      employeeName: 'Emily Davis',
      department: 'HR',
      month: 'February 2023',
      netSalary: 3800,
      paymentMode: 'Bank',
      status: 'Paid'
    }
  ]);

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // State for filters
  const [monthFilter, setMonthFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Function to handle view payslip
  const handleViewPayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setShowModal(true);
  };

  // Function to handle download
  const handleDownload = (payslip) => {
    alert(`Downloading payslip ${payslip.payslipNo} as PDF`);
    // In a real app, this would trigger a PDF download
  };

  // Function to handle email
  const handleEmail = (payslip) => {
    alert(`Emailing payslip ${payslip.payslipNo} to ${payslip.employeeName}`);
    // In a real app, this would open an email client or API call
  };

  // Function to handle WhatsApp
  const handleWhatsApp = (payslip) => {
    alert(`Sending payslip ${payslip.payslipNo} to ${payslip.employeeName} via WhatsApp`);
    // In a real app, this would open WhatsApp with a pre-filled message
  };

  // Function to apply filters
  const filteredPayslips = payslips.filter(payslip => {
    return (
      (monthFilter === '' || payslip.month.includes(monthFilter)) &&
      (employeeFilter === '' || payslip.employeeName.toLowerCase().includes(employeeFilter.toLowerCase())) &&
      (statusFilter === '' || payslip.status === statusFilter)
    );
  });

  // Function to convert number to words
  const numberToWords = (num) => {
    // This is a simplified version - in a real app, use a proper library
    return `Four Thousand Five Hundred Dollars`;
  };

  return (
    <div className="container-fluid mt-4 px-3 px-md-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh' }}>
      <h2 className="mb-4 text-center text-md-start" style={{ color: '#023347' }}>Payslip Reports</h2>
      
      {/* Filters */}
      <Row className="mb-4">
        <Col xs={12} md={4} className="mb-3 mb-md-0">
          <InputGroup>
            <InputGroup.Text style={{ backgroundColor: '#e6f3f5', border: '1px solid #ced4da', color: '#023347' }}><FaCalendarAlt /></InputGroup.Text>
            <Form.Control 
              placeholder="Filter by Month" 
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              style={{ border: '1px solid #ced4da' }}
            />
          </InputGroup>
        </Col>
        <Col xs={12} md={4} className="mb-3 mb-md-0">
          <InputGroup>
            <InputGroup.Text style={{ backgroundColor: '#e6f3f5', border: '1px solid #ced4da', color: '#023347' }}><FaUser /></InputGroup.Text>
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
            <InputGroup.Text style={{ backgroundColor: '#e6f3f5', border: '1px solid #ced4da', color: '#023347' }}><FaMoneyBillWave /></InputGroup.Text>
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

      {/* Payslips Table - Desktop View */}
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
            {filteredPayslips.map((payslip) => (
              <tr key={payslip.id}>
                <td>{payslip.payslipNo}</td>
                <td>{payslip.employeeName}</td>
                <td>{payslip.department}</td>
                <td>{payslip.month}</td>
                <td>${payslip.netSalary.toLocaleString()}</td>
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
                      className="action-btn"
                      style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                    >
                      <FaEye />
                    </Button>
                    <Button 
                      variant="light"
                      size="sm"
                      onClick={() => handleDownload(payslip)}
                      className="action-btn"
                      style={{ color: '#2a8e9c', backgroundColor: '#e6f3f5' }}
                    >
                      <FaDownload /> 
                    </Button>
                    <Button 
                      variant="light"
                      size="sm"
                      onClick={() => handleEmail(payslip)}
                      className="action-btn"
                      style={{ color: '#2a8e9c', backgroundColor: '#e6f3f5' }}
                    >
                      <FaEnvelope />
                    </Button>
                    <Button 
                      variant="light"
                      size="sm"
                      onClick={() => handleWhatsApp(payslip)}
                      className="action-btn"
                      style={{ color: '#25D366', backgroundColor: '#e6f3f5' }}
                    >
                      <FaWhatsapp />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Payslips Cards - Mobile View */}
      <div className="d-md-none">
        {filteredPayslips.map((payslip) => (
          <Card key={payslip.id} className="mb-3" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center" style={{ color: '#023347' }}>
                <span>{payslip.payslipNo}</span>
                <span className={`badge ${payslip.status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                  {payslip.status}
                </span>
              </Card.Title>
              <Card.Text>
                <div className="mb-2">
                  <strong>Employee:</strong> {payslip.employeeName}
                </div>
                <div className="mb-2">
                  <strong>Department:</strong> {payslip.department}
                </div>
                <div className="mb-2">
                  <strong>Month:</strong> {payslip.month}
                </div>
                <div className="mb-2">
                  <strong>Net Salary:</strong> ${payslip.netSalary.toLocaleString()}
                </div>
                <div className="mb-3">
                  <strong>Payment Mode:</strong> {payslip.paymentMode}
                </div>
                <div className="d-flex justify-content-around">
                  <Button 
                    variant="light"
                    size="sm"
                    onClick={() => handleViewPayslip(payslip)}
                    className="action-btn"
                    style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                  >
                    <FaEye />
                  </Button>
                  <Button 
                    variant="light"
                    size="sm"
                    onClick={() => handleDownload(payslip)}
                    className="action-btn"
                    style={{ color: '#2a8e9c', backgroundColor: '#e6f3f5' }}
                  >
                    <FaDownload /> 
                  </Button>
                  <Button 
                    variant="light"
                    size="sm"
                    onClick={() => handleEmail(payslip)}
                    className="action-btn"
                    style={{ color: '#2a8e9c', backgroundColor: '#e6f3f5' }}
                  >
                    <FaEnvelope />
                  </Button>
                  <Button 
                    variant="light"
                    size="sm"
                    onClick={() => handleWhatsApp(payslip)}
                    className="action-btn"
                    style={{ color: '#25D366', backgroundColor: '#e6f3f5' }}
                  >
                    <FaWhatsapp />
                  </Button>
                </div>
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Payslip View Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        fullscreen="md-down"
        dialogClassName="modal-90w"
      >
        <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#ffffff' }}>
          <Modal.Title>Payslip Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3 p-md-4" style={{ backgroundColor: '#f0f7f8' }}>
          {selectedPayslip && (
            <div className="payslip-details">
              {/* Company Info */}
              <div className="text-center mb-4">
                <div className="d-flex justify-content-center mb-2">
                  <div className="rounded-circle" style={{ width: '60px', height: '60px', backgroundColor: '#e6f3f5' }}></div>
                </div>
                <h4 style={{ color: '#023347' }}>Company Name</h4>
                <p className="mb-0">123 Business Street, City, Country</p>
              </div>

              {/* Employee Info */}
              <Row className="mb-4">
                <Col xs={12} md={6} className="mb-3 mb-md-0">
                  <h5 style={{ color: '#023347' }}>Employee Information</h5>
                  <p className="mb-1"><strong>Name:</strong> {selectedPayslip.employeeName}</p>
                  <p className="mb-1"><strong>Department:</strong> {selectedPayslip.department}</p>
                  <p className="mb-0"><strong>Designation:</strong> Senior Developer</p>
                </Col>
                <Col xs={12} md={6}>
                  <h5 style={{ color: '#023347' }}>Payslip Information</h5>
                  <p className="mb-1"><strong>Payslip No:</strong> {selectedPayslip.payslipNo}</p>
                  <p className="mb-1"><strong>Month:</strong> {selectedPayslip.month}</p>
                  <p className="mb-0"><strong>Payment Mode:</strong> {selectedPayslip.paymentMode}</p>
                </Col>
              </Row>

              {/* Earnings Table */}
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
                    <tr>
                      <td>Basic Salary</td>
                      <td>${(selectedPayslip.netSalary * 0.6).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Bonus</td>
                      <td>${(selectedPayslip.netSalary * 0.1).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Allowances</td>
                      <td>${(selectedPayslip.netSalary * 0.3).toFixed(2)}</td>
                    </tr>
                    <tr className="table-primary">
                      <td><strong>Total Earnings</strong></td>
                      <td><strong>${selectedPayslip.netSalary.toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              {/* Deductions Table */}
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
                    <tr>
                      <td>Tax</td>
                      <td>${(selectedPayslip.netSalary * 0.15).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Provident Fund</td>
                      <td>${(selectedPayslip.netSalary * 0.08).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Insurance</td>
                      <td>${(selectedPayslip.netSalary * 0.02).toFixed(2)}</td>
                    </tr>
                    <tr className="table-primary">
                      <td><strong>Total Deductions</strong></td>
                      <td><strong>${(selectedPayslip.netSalary * 0.25).toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              {/* Net Pay */}
              <div className="text-center mb-4 p-3 rounded" style={{ backgroundColor: '#e6f3f5' }}>
                <h4 style={{ color: '#023347' }}>Net Pay: ${selectedPayslip.netSalary.toLocaleString()}</h4>
                <p className="mb-0">{numberToWords(selectedPayslip.netSalary)}</p>
              </div>

              {/* Bank Info */}
              <Row className="mb-4">
                <Col xs={12}>
                  <h5 style={{ color: '#023347' }}>Bank Information</h5>
                  <p className="mb-1"><strong>Bank Name:</strong> Example Bank</p>
                  <p className="mb-1"><strong>Account Number:</strong> ****1234</p>
                  <p className="mb-0"><strong>IFSC Code:</strong> EXMP0001234</p>
                </Col>
              </Row>

              {/* Signature */}
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
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="flex-column flex-md-row" style={{ backgroundColor: '#f0f7f8', border: 'none' }}>
          <Button variant="secondary" onClick={() => setShowModal(false)} className="w-100 w-md-auto mb-2 mb-md-0" style={{ border: '1px solid #ced4da' }}>
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
      
      <style jsx>{`
        .action-btn {
          width: 36px;
          height: 36px;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        @media (max-width: 767px) {
          .modal-footer {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PayslipReports;