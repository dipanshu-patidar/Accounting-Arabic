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
    <Container fluid className="py-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh' }}>
      <div className="d-flex align-items-center mb-4">
        <FiSettings className="me-2" size={24} style={{ color: '#023347' }} />
        <h2 className="mb-0" style={{ color: '#023347' }}>Payroll Settings</h2>
      </div>
      
      {showAlert && (
        <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
          {alertMessage}
        </Alert>
      )}
      
      <Row>
        <Col lg={6}>
          {/* Company Payroll Info */}
          <Card className="mb-4 shadow-sm" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
            <Card.Header className="d-flex align-items-center" style={{ backgroundColor: '#023347', color: '#ffffff' }}>
              <FiDollarSign className="me-2" />
              <h5 className="mb-0">Company Payroll Info</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Default Pay Cycle</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" id="pay-cycle-dropdown" className="w-100 text-start" style={{ borderColor: '#ced4da', color: '#023347' }}>
                      {payCycle}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                      <Dropdown.Item onClick={() => setPayCycle('Weekly')}>Weekly</Dropdown.Item>
                      <Dropdown.Item onClick={() => setPayCycle('Bi-Weekly')}>Bi-Weekly</Dropdown.Item>
                      <Dropdown.Item onClick={() => setPayCycle('Monthly')}>Monthly</Dropdown.Item>
                      <Dropdown.Item onClick={() => setPayCycle('Quarterly')}>Quarterly</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Default Bank Account</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter bank account number"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    style={{ border: '1px solid #ced4da' }}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Default Currency</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" id="currency-dropdown" className="w-100 text-start" style={{ borderColor: '#ced4da', color: '#023347' }}>
                      {currency}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                      <Dropdown.Item onClick={() => setCurrency('USD')}>USD - US Dollar</Dropdown.Item>
                      <Dropdown.Item onClick={() => setCurrency('EUR')}>EUR - Euro</Dropdown.Item>
                      <Dropdown.Item onClick={() => setCurrency('GBP')}>GBP - British Pound</Dropdown.Item>
                      <Dropdown.Item onClick={() => setCurrency('JPY')}>JPY - Japanese Yen</Dropdown.Item>
                      <Dropdown.Item onClick={() => setCurrency('CAD')}>CAD - Canadian Dollar</Dropdown.Item>
                      <Dropdown.Item onClick={() => setCurrency('AUD')}>AUD - Australian Dollar</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
          
          {/* Tax Configuration */}
          <Card className="mb-4 shadow-sm" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
            <Card.Header className="d-flex align-items-center" style={{ backgroundColor: '#023347', color: '#ffffff' }}>
              <FiFileText className="me-2" />
              <h5 className="mb-0">Tax Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Add Tax Slab / Percentage</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="e.g., 10% for income up to $50,000"
                    value={taxSlab}
                    onChange={(e) => setTaxSlab(e.target.value)}
                    style={{ border: '1px solid #ced4da' }}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="pf-switch"
                    label="Enable PF (Provident Fund)"
                    checked={pfEnabled}
                    onChange={(e) => setPfEnabled(e.target.checked)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="insurance-switch"
                    label="Enable Insurance"
                    checked={insuranceEnabled}
                    onChange={(e) => setInsuranceEnabled(e.target.checked)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="other-deductions-switch"
                    label="Enable Other Deductions"
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
          <Card className="mb-4 shadow-sm" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
            <Card.Header className="d-flex align-items-center" style={{ backgroundColor: '#023347', color: '#ffffff' }}>
              <FiFileText className="me-2" />
              <h5 className="mb-0">Payslip Template Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Upload Company Logo</Form.Label>
                  <div className="d-flex align-items-center">
                    <Button 
                      variant="outline-primary" 
                      className="me-3 d-flex justify-content-center align-items-center"
                      style={{ borderColor: '#023347', color: '#023347' }}
                      onClick={() => document.getElementById('logo-upload').click()}
                    >
                      <FiUpload className="me-1" /> Upload
                    </Button>
                    <Form.Control 
                      type="file" 
                      id="logo-upload"
                      className="d-none"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    {logo && (
                      <Image src={logo} alt="Company Logo" height="40" />
                    )}
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Select Layout</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" id="layout-dropdown" className="w-100 text-start" style={{ borderColor: '#ced4da', color: '#023347' }}>
                      {layout}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                      <Dropdown.Item onClick={() => setLayout('Simple')}>Simple</Dropdown.Item>
                      <Dropdown.Item onClick={() => setLayout('Detailed')}>Detailed</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Add Footer Notes</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    placeholder="Enter footer notes for payslips"
                    value={footerNotes}
                    onChange={(e) => setFooterNotes(e.target.value)}
                    style={{ border: '1px solid #ced4da' }}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="digital-signature-check"
                    label="Include Digital Signature"
                    checked={digitalSignature}
                    onChange={(e) => setDigitalSignature(e.target.checked)}
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
          
          {/* Notification Settings */}
          <Card className="mb-4 shadow-sm" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
            <Card.Header className="d-flex align-items-center" style={{ backgroundColor: '#023347', color: '#ffffff' }}>
              <FiBell className="me-2" />
              <h5 className="mb-0">Notification Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="switch"
                    id="email-switch"
                    label={
                      <span>
                        <FiMail className="me-1" /> Enable Email Send
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
                      <span>
                        <FiMessageSquare className="me-1" /> Enable WhatsApp Send
                      </span>
                    }
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Default Message Template</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    placeholder="Enter default message template"
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    style={{ border: '1px solid #ced4da' }}
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
      <Card className="shadow-sm" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
        <Card.Body>
          <div className="d-flex flex-wrap gap-2">
            <Button style={{ backgroundColor: '#023347', border: 'none' }} onClick={handleSaveSettings} className='d-flex justify-content-center align-items-center'>
              <FiSave className="me-1" /> Save Settings
            </Button>
            <Button variant="outline-info" onClick={handlePreviewPayslip} className='d-flex justify-content-center align-items-center' style={{ borderColor: '#2a8e9c', color: '#2a8e9c' }}>
              <FiEye className="me-1" /> Preview Payslip Template
            </Button>
            <Button variant="outline-warning" onClick={handleResetDefaults} className='d-flex justify-content-center align-items-center' style={{ borderColor: '#fd7e14', color: '#fd7e14' }}>
              <FiRefreshCw className="me-1" /> Reset Defaults
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* Preview Payslip Modal */}
      <Modal 
        show={showPreviewModal} 
        onHide={() => setShowPreviewModal(false)}
        size="lg"
        centered
      >
        <Modal.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: '#023347', color: '#ffffff' }}>
          <Modal.Title>© Preview Payslip Template</Modal.Title>
          <Button variant="light" onClick={() => setShowPreviewModal(false)}>
            <FiX />
          </Button>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#f0f7f8' }}>
          <Card style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
            <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: '#2a8e9c', color: '#ffffff' }}>
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
                  <div className="d-flex justify-content-between align-items-center p-3 rounded" style={{ backgroundColor: '#e6f3f5' }}>
                    <h5 className="mb-0" style={{ color: '#023347' }}>Net Salary</h5>
                    <h4 className="mb-0" style={{ color: '#023347' }}>
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
        <Modal.Footer style={{ backgroundColor: '#f0f7f8', border: 'none' }}>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)} style={{ border: '1px solid #ced4da' }}>
            Close
          </Button>
          <Button style={{ backgroundColor: '#023347', border: 'none' }}>
            Download Sample
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PayrollSettings;