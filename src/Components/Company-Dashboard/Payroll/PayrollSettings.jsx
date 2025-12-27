import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Dropdown, 
  Image,
  Alert,
  Modal
} from 'react-bootstrap';
import { 
  FiSave, 
  FiEye, 
  FiUpload, 
  FiRefreshCw, 
  FiDollarSign, 
  FiFileText, 
  FiBell,
  FiSettings,
  FiInfo,
  FiMail,
  FiMessageSquare,
  FiCheckSquare,
  FiX
} from 'react-icons/fi';
import './PayrollSettings.css';

const PayrollSettings = () => {
  // State for Company Payroll Info
  const [payCycle, setPayCycle] = useState('Monthly');
  const [bankAccount, setBankAccount] = useState('');
  const [currency, setCurrency] = useState('USD');
  
  // State for Payslip Template Settings
  const [logo, setLogo] = useState(null);
  const [layout, setLayout] = useState('Simple');
  const [footerNotes, setFooterNotes] = useState('');
  const [digitalSignature, setDigitalSignature] = useState(true);
  
  // State for Tax Configuration
  const [taxSlab, setTaxSlab] = useState('');
  const [pfEnabled, setPfEnabled] = useState(true);
  const [insuranceEnabled, setInsuranceEnabled] = useState(true);
  const [otherDeductionsEnabled, setOtherDeductionsEnabled] = useState(false);
  
  // State for Notification Settings
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState('Your payslip for {month} is now available.');
  
  // State for alerts
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');
  
  // State for modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
        setAlertMessage('Logo uploaded successfully!');
        setAlertVariant('success');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    // Here you would typically save the settings to your backend
    setAlertMessage('Settings saved successfully!');
    setAlertVariant('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };
  
  // Handle preview payslip
  const handlePreviewPayslip = () => {
    setShowPreviewModal(true);
  };
  
  // Handle reset defaults
  const handleResetDefaults = () => {
    // Reset all states to default values
    setPayCycle('Monthly');
    setBankAccount('');
    setCurrency('USD');
    setLogo(null);
    setLayout('Simple');
    setFooterNotes('');
    setDigitalSignature(true);
    setTaxSlab('');
    setPfEnabled(true);
    setInsuranceEnabled(true);
    setOtherDeductionsEnabled(false);
    setEmailEnabled(true);
    setWhatsappEnabled(false);
    setMessageTemplate('Your payslip for {month} is now available.');
    
    setAlertMessage('Settings reset to defaults!');
    setAlertVariant('warning');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };
  
  return (
    <Container fluid className="p-4 payroll-settings-container">
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="payroll-settings-title">
          <i className="fas fa-cog me-2"></i>
          Payroll Settings
        </h3>
        <p className="payroll-settings-subtitle">Configure payroll information, templates, and notification settings</p>
      </div>

      {showAlert && (
        <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible className="alert-custom">
          {alertMessage}
        </Alert>
      )}
      
      <Row>
        <Col lg={6}>
          {/* Company Payroll Info */}
          <Card className="settings-card">
            <Card.Header className="card-header-custom">
              <FiDollarSign className="me-2" />
              <h5>Company Payroll Info</h5>
            </Card.Header>
            <Card.Body className="card-body-custom">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Default Pay Cycle</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" id="pay-cycle-dropdown" className="dropdown-toggle-custom">
                      {payCycle}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu-custom">
                      <Dropdown.Item className="dropdown-item-custom" onClick={() => setPayCycle('Weekly')}>Weekly</Dropdown.Item>
                      <Dropdown.Item className="dropdown-item-custom" onClick={() => setPayCycle('Bi-Weekly')}>Bi-Weekly</Dropdown.Item>
                      <Dropdown.Item className="dropdown-item-custom" onClick={() => setPayCycle('Monthly')}>Monthly</Dropdown.Item>
                      <Dropdown.Item className="dropdown-item-custom" onClick={() => setPayCycle('Quarterly')}>Quarterly</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Default Bank Account</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter bank account number"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="form-control-custom"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Default Currency</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" id="currency-dropdown" className="dropdown-toggle-custom">
                      {currency}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu-custom">
                      <Dropdown.Item className="dropdown-item-custom" onClick={() => setCurrency('USD')}>USD - US Dollar</Dropdown.Item>
                      <Dropdown.Item className="dropdown-item-custom" onClick={() => setCurrency('EUR')}>EUR - Euro</Dropdown.Item>
                      <Dropdown.Item className="dropdown-item-custom" onClick={() => setCurrency('GBP')}>GBP - British Pound</Dropdown.Item>
                      <Dropdown.Item className="dropdown-item-custom" onClick={() => setCurrency('JPY')}>JPY - Japanese Yen</Dropdown.Item>
                      <Dropdown.Item className="dropdown-item-custom" onClick={() => setCurrency('CAD')}>CAD - Canadian Dollar</Dropdown.Item>
                      <Dropdown.Item className="dropdown-item-custom" onClick={() => setCurrency('AUD')}>AUD - Australian Dollar</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
          
          {/* Tax Configuration */}
          <Card className="settings-card">
            <Card.Header className="card-header-custom">
              <FiFileText className="me-2" />
              <h5>Tax Configuration</h5>
            </Card.Header>
            <Card.Body className="card-body-custom">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Add Tax Slab / Percentage</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="e.g., 10% for income up to $50,000"
                    value={taxSlab}
                    onChange={(e) => setTaxSlab(e.target.value)}
                    className="form-control-custom"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="pf-switch"
                    label={
                      <span className="form-check-label">
                        Enable PF (Provident Fund)
                      </span>
                    }
                    checked={pfEnabled}
                    onChange={(e) => setPfEnabled(e.target.checked)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="insurance-switch"
                    label={
                      <span className="form-check-label">
                        Enable Insurance
                      </span>
                    }
                    checked={insuranceEnabled}
                    onChange={(e) => setInsuranceEnabled(e.target.checked)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="other-deductions-switch"
                    label={
                      <span className="form-check-label">
                        Enable Other Deductions
                      </span>
                    }
                    checked={otherDeductionsEnabled}
                    onChange={(e) => setOtherDeductionsEnabled(e.target.checked)}
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          {/* Payslip Template Settings */}
          <Card className="settings-card">
            <Card.Header className="card-header-custom">
              <FiFileText className="me-2" />
              <h5>Payslip Template Settings</h5>
            </Card.Header>
            <Card.Body className="card-body-custom">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Upload Company Logo</Form.Label>
                  <div className="d-flex align-items-center">
                    <Button 
                      className="btn-upload"
                      onClick={() => document.getElementById('logo-upload').click()}
                    >
                      <FiUpload /> Upload
                    </Button>
                    <Form.Control 
                      type="file" 
                      id="logo-upload"
                      className="d-none"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    {logo && (
                      <Image src={logo} alt="Company Logo" height="40" className="logo-preview" />
                    )}
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Select Layout</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" id="layout-dropdown" className="dropdown-toggle-custom">
                      {layout}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu-custom">
                      <Dropdown.Item className="dropdown-item-custom" onClick={() => setLayout('Simple')}>Simple</Dropdown.Item>
                      <Dropdown.Item className="dropdown-item-custom" onClick={() => setLayout('Detailed')}>Detailed</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Add Footer Notes</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    placeholder="Enter footer notes for payslips"
                    value={footerNotes}
                    onChange={(e) => setFooterNotes(e.target.value)}
                    className="form-control-custom"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="digital-signature-check"
                    label={
                      <span className="form-check-label">
                        Include Digital Signature
                      </span>
                    }
                    checked={digitalSignature}
                    onChange={(e) => setDigitalSignature(e.target.checked)}
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
          
          {/* Notification Settings */}
          <Card className="settings-card">
            <Card.Header className="card-header-custom">
              <FiBell className="me-2" />
              <h5>Notification Settings</h5>
            </Card.Header>
            <Card.Body className="card-body-custom">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="email-switch"
                    label={
                      <span className="form-check-label">
                        <FiMail /> Enable Email Send
                      </span>
                    }
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="whatsapp-switch"
                    label={
                      <span className="form-check-label">
                        <FiMessageSquare /> Enable WhatsApp Send
                      </span>
                    }
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Default Message Template</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    placeholder="Enter default message template"
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    className="form-control-custom"
                  />
                  <Form.Text className="text-muted">
                    Use {'{month}'} as a placeholder for the month name.
                  </Form.Text>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Action Buttons */}
      <Card className="action-buttons-card">
        <div className="d-flex flex-wrap justify-content-end gap-3">
          <Button className="btn-reset btn-action" onClick={handleResetDefaults}>
            <span>
              {/* <FiRefreshCw className="d-block mx-auto mb-1" /> */}
              Reset<br />defaults
            </span>
          </Button>
          <Button className="btn-preview btn-action" onClick={handlePreviewPayslip}>
            <span>
              {/* <FiEye className="d-block mx-auto mb-1" /> */}
              Payslip<br />settings
            </span>
          </Button>
          <Button className="btn-save btn-action" onClick={handleSaveSettings}>
            <span>
              {/* <FiSave className="d-block mx-auto mb-1" /> */}
              Save<br />settings
            </span>
          </Button>
        </div>
      </Card>
      
      {/* Preview Payslip Modal */}
      <Modal 
        show={showPreviewModal} 
        onHide={() => setShowPreviewModal(false)}
        size="lg"
        centered
        className="payroll-settings-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Preview Payslip Template</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Card className="preview-card">
            <Card.Header className="preview-card-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                {logo ? (
                  <Image src={logo} alt="Company Logo" height="40" className="me-3" />
                ) : (
                  <div className="me-3 d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px', backgroundColor: '#f0f7f8'}}>
                    <FiFileText style={{ color: '#023347' }} />
                  </div>
                )}
                <div>
                  <h5 className="mb-0">Company Name</h5>
                  <small>Payslip for the month of July 2023</small>
                </div>
              </div>
              <div className="text-end">
                <h6 className="mb-0">Employee ID: EMP001</h6>
                <small>Pay Date: 31/07/2023</small>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <h6 style={{ color: '#023347' }}>Employee Information</h6>
                  <p className="mb-1"><strong>Name:</strong> John Doe</p>
                  <p className="mb-1"><strong>Department:</strong> Engineering</p>
                  <p className="mb-1"><strong>Designation:</strong> Software Developer</p>
                  <p className="mb-0"><strong>Bank Account:</strong> {bankAccount || 'XXXX-XXXX-XXXX-1234'}</p>
                </Col>
                <Col md={6}>
                  <h6 style={{ color: '#023347' }}>Payment Details</h6>
                  <p className="mb-1"><strong>Pay Cycle:</strong> {payCycle}</p>
                  <p className="mb-1"><strong>Currency:</strong> {currency}</p>
                  <p className="mb-1"><strong>Payment Method:</strong> Bank Transfer</p>
                  <p className="mb-0"><strong>Tax ID:</strong> TAX123456</p>
                </Col>
              </Row>
              
              <Row className="mb-4">
                <Col md={6}>
                  <h6 style={{ color: '#023347' }}>Earnings</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td>Basic Salary</td>
                        <td className="text-end">5,000.00 {currency}</td>
                      </tr>
                      <tr>
                        <td>House Rent Allowance</td>
                        <td className="text-end">1,500.00 {currency}</td>
                      </tr>
                      <tr>
                        <td>Transport Allowance</td>
                        <td className="text-end">500.00 {currency}</td>
                      </tr>
                      <tr>
                        <td>Medical Allowance</td>
                        <td className="text-end">300.00 {currency}</td>
                      </tr>
                      <tr className="fw-bold">
                        <td>Total Earnings</td>
                        <td className="text-end">7,300.00 {currency}</td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
                <Col md={6}>
                  <h6 style={{ color: '#023347' }}>Deductions</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td>Income Tax</td>
                        <td className="text-end">700.00 {currency}</td>
                      </tr>
                      {pfEnabled && (
                        <tr>
                          <td>Provident Fund</td>
                          <td className="text-end">500.00 {currency}</td>
                        </tr>
                      )}
                      {insuranceEnabled && (
                        <tr>
                          <td>Insurance</td>
                          <td className="text-end">200.00 {currency}</td>
                        </tr>
                      )}
                      {otherDeductionsEnabled && (
                        <tr>
                          <td>Other Deductions</td>
                          <td className="text-end">100.00 {currency}</td>
                        </tr>
                      )}
                      <tr className="fw-bold">
                        <td>Total Deductions</td>
                        <td className="text-end">
                          {pfEnabled && insuranceEnabled && otherDeductionsEnabled 
                            ? '1,500.00' 
                            : pfEnabled && insuranceEnabled 
                              ? '1,400.00' 
                              : pfEnabled || insuranceEnabled 
                                ? '1,200.00' 
                                : '700.00'} {currency}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
              
              <Row>
                <Col>
                  <div className="summary-box d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Net Salary</h5>
                    <h4 className="mb-0 fw-bold text-primary">
                      {pfEnabled && insuranceEnabled && otherDeductionsEnabled 
                        ? '5,800.00' 
                        : pfEnabled && insuranceEnabled 
                          ? '5,900.00' 
                          : pfEnabled || insuranceEnabled 
                            ? '6,100.00' 
                            : '6,600.00'} {currency}
                    </h4>
                  </div>
                </Col>
              </Row>
              
              {footerNotes && (
                <div className="mt-4 pt-3 border-top">
                  <p className="mb-0 small text-muted">{footerNotes}</p>
                </div>
              )}
              
              {digitalSignature && (
                <div className="mt-4 d-flex justify-content-end">
                  <div className="text-center">
                    <div className="border-bottom mb-2" style={{width: '150px', borderColor: '#ced4da'}}></div>
                    <small>Digital Signature</small>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
          <Button className="btn-modal-download">
            <FiUpload className="me-1" /> Download Sample
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PayrollSettings;