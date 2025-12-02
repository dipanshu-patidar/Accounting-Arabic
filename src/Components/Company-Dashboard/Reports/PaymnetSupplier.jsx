import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Table, Row, Col, Dropdown } from 'react-bootstrap';

const paymentData = [
  {
    account: 'ABC Suppliers Ltd',
    description: 'Purchase\nVoucher No: PV/843/78\nVoucher Date: 24/05/2025\nVoucher Due Date: 27/06/2025',
    totalAmount: 454.000,
    outstandingAmount: 454.000,
    amountToPay: 454.000,
  },
  {
    account: 'XYZ Trading Co',
    description: 'Purchase\nVoucher No: PV/843/78\nVoucher Date: 24/05/2025\nVoucher Due Date: 31/05/2025',
    totalAmount: 8205.120,
    outstandingAmount: 8205.120,
    amountToPay: 8205.120,
  },
  {
    account: 'Global Imports Inc',
    description: 'Purchase\nVoucher No: PV/843/74\nVoucher Date: 20/07/2025\nVoucher Due Date: 27/07/2025',
    totalAmount: 1965.960,
    outstandingAmount: 1965.960,
    amountToPay: 1965.960,
  },
  {
    account: 'Metro Suppliers',
    description: 'Purchase\nVoucher No: PV/843/74\nVoucher Date: 21/07/2025\nVoucher Due Date: 30/07/2025',
    totalAmount: 318.800,
    outstandingAmount: 318.800,
    amountToPay: 318.800,
  },
];

const discountOptions = [
  "Bulk Purchase Discount",
  "Early Payment Discount",
  "Trade Discount",
  "Seasonal Discount",
  "Promotional Discount",
  "Volume Discount",
  "Cash Discount",
  "Loyalty Discount",
  "Special Discount",
  "Contractual Discount"
];

const paidToOptions = [
  "ABC Suppliers Ltd",
  "XYZ Trading Co",
  "Global Imports Inc",
  "Metro Suppliers",
  "Northern Supplies",
  "Southern Distributors"
];

const paidFromOptions = [
  "Cash In Hand",
  "Bank Account - Current",
  "Bank Account - Savings",
  "Credit Card",
  "Cheque",
  "Online Transfer",
  "Other Payment Method"
];

const PaymentSupplier = () => {
  const [showPaymentTable, setShowPaymentTable] = useState(false);
  const [showDiscountFields, setShowDiscountFields] = useState(false);
  const [taxDeducted, setTaxDeducted] = useState(false);
  const [showNarration, setShowNarration] = useState(true);
  const [discountReceived, setDiscountReceived] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [subTotal, setSubTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(500);
  const [paidTo, setPaidTo] = useState('');
  const [paidToSearch, setPaidToSearch] = useState('');
  const [paidFrom, setPaidFrom] = useState('Cash In Hand');
  const [paidFromSearch, setPaidFromSearch] = useState('');
  const [narration, setNarration] = useState('');
  const [autoPaymentNo, setAutoPaymentNo] = useState('');
  const [manualPaymentNo, setManualPaymentNo] = useState('');
  const [referenceDocument, setReferenceDocument] = useState('');
  const [taxPercent, setTaxPercent] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  const paidToRef = useRef(null);
  const paidFromRef = useRef(null);
  
  // Generate auto payment number on component mount
  useEffect(() => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    setAutoPaymentNo(`AUTO-PAY-${timestamp}-${randomNum}`);
  }, []);
  
  // Handle clicks outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paidToRef.current && !paidToRef.current.contains(event.target)) {
        document.getElementById('paidToDropdown').classList.remove('show');
      }
      if (paidFromRef.current && !paidFromRef.current.contains(event.target)) {
        document.getElementById('paidFromDropdown').classList.remove('show');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle dropdown visibility
  const toggleDropdown = (dropdownId) => {
    const dropdown = document.getElementById(dropdownId);
    dropdown.classList.toggle('show');
  };
  
  // Discount calculation
  const handleCalculateDiscount = () => {
    const percent = parseFloat(discountPercent) || 0;
    const value = ((subTotal * percent) / 100).toFixed(3);
    setDiscountValue(value);
    setTotalAmount((subTotal - value).toFixed(3));
  };
  
  // Paid To search filter
  const filteredPaidTo = paidToOptions.filter(opt =>
    opt.toLowerCase().includes(paidToSearch.toLowerCase())
  );
  
  // Paid From search filter
  const filteredPaidFrom = paidFromOptions.filter(opt =>
    opt.toLowerCase().includes(paidFromSearch.toLowerCase())
  );
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };
  
  return (
    <div className='p-2 mt-2'>
             <h4>Payment To Vendor</h4>
      <Container className='card p-4'>
   
        <Row className="mb-2">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Payment No (Auto)</Form.Label>
              <Form.Control 
                type="text" 
                value={autoPaymentNo} 
                readOnly 
                className="mb-2" 
              />
              <Form.Label>Payment No (Manual)</Form.Label>
              <Form.Control 
                type="text" 
                value={manualPaymentNo}
                onChange={(e) => setManualPaymentNo(e.target.value)}
                placeholder="Enter manual payment no"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Voucher Date</Form.Label>
              <Form.Control type="date" defaultValue="2025-08-23" />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group ref={paidFromRef}>
              <Form.Label>Paid From</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  value={paidFrom}
                  onChange={(e) => {
                    setPaidFrom(e.target.value);
                    setPaidFromSearch(e.target.value);
                  }}
                  onClick={() => toggleDropdown('paidFromDropdown')}
                  placeholder="Select or type..."
                />
                <div 
                  id="paidFromDropdown" 
                  className="dropdown-menu position-absolute w-100"
                  style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                >
                  {filteredPaidFrom.map((opt, idx) => (
                    <Dropdown.Item 
                      key={idx} 
                      onClick={() => {
                        setPaidFrom(opt);
                        setPaidFromSearch('');
                        document.getElementById('paidFromDropdown').classList.remove('show');
                      }}
                    >
                      {opt}
                    </Dropdown.Item>
                  ))}
                </div>
              </div>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group ref={paidToRef}>
              <Form.Label>Paid To</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  value={paidTo}
                  onChange={(e) => {
                    setPaidTo(e.target.value);
                    setPaidToSearch(e.target.value);
                  }}
                  onClick={() => toggleDropdown('paidToDropdown')}
                  placeholder="Select or type..."
                />
                <div 
                  id="paidToDropdown" 
                  className="dropdown-menu position-absolute w-100"
                  style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                >
                  {filteredPaidTo.map((opt, idx) => (
                    <Dropdown.Item 
                      key={idx} 
                      onClick={() => {
                        setPaidTo(opt);
                        setPaidToSearch('');
                        document.getElementById('paidToDropdown').classList.remove('show');
                      }}
                    >
                      {opt}
                    </Dropdown.Item>
                  ))}
                </div>
              </div>
            </Form.Group>
          </Col>
        </Row>
        
        {/* Document Upload */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Upload Document</Form.Label>
              <Form.Control 
                type="file" 
                onChange={handleFileUpload}
              />
              {uploadedFile && (
                <div className="mt-2">
                  <small>Selected file: {uploadedFile.name}</small>
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>
        
        <div className="mb-3">
          <Form.Check
            type="checkbox"
            label="Payment against bill"
            checked={showPaymentTable}
            onChange={() => setShowPaymentTable(!showPaymentTable)}
            style={{ display: 'inline-block', marginRight: '20px' }}
          />
          <Form.Check
            type="checkbox"
            label="Discount Received"
            checked={showDiscountFields}
            onChange={() => setShowDiscountFields(!showDiscountFields)}
            style={{ display: 'inline-block', marginRight: '20px' }}
          />
          <Form.Check
            type="checkbox"
            label="Tax Deducted at Source"
            checked={taxDeducted}
            onChange={() => setTaxDeducted(!taxDeducted)}
            style={{ display: 'inline-block' }}
          />
        </div>
        
        {/* Tax Deduction Field */}
        {taxDeducted && (
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>TDS Percentage (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Enter TDS percentage"
                />
              </Form.Group>
            </Col>
          </Row>
        )}
        
        {/* Payment Table */}
        {showPaymentTable && (
          <div className="mb-4">
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>Supplier Account</th>
                  <th>Description</th>
                  <th>Total Amount</th>
                  <th>Outstanding Amount</th>
                  <th>Amount To Pay</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {paymentData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.account}</td>
                    <td>
                      {row.description.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </td>
                    <td>{row.totalAmount}</td>
                    <td>{row.outstandingAmount}</td>
                    <td>
                      <Form.Control type="number" defaultValue={row.amountToPay} min={0} />
                    </td>
                    <td>
                      <Form.Check type="checkbox" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            {/* Centered Controls */}
            <div className="d-flex justify-content-center align-items-center mt-3">
              <div className="text-center">
                <span className="me-3">Advance Payment</span>
                <Form.Control 
                  type="number" 
                  style={{ 
                    width: '150px', 
                    display: 'inline-block',
                    marginLeft: '10px',
                    marginRight: '10px'
                  }} 
                />
              </div>

              <div className="text-center">
                <span className="me-3">Amount</span>
                <Form.Control 
                  type="number" 
                  style={{ 
                    width: '150px', 
                    display: 'inline-block',
                    marginLeft: '10px',
                    marginRight: '10px'
                  }} 
                />
                <Button variant="primary" className="ms-2">Save</Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Discount Fields */}
        {showDiscountFields && (
          <div className="mb-4">
            <Row className="align-items-center">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Discount Received</Form.Label>
                  <Form.Select
                    value={discountReceived}
                    onChange={e => setDiscountReceived(e.target.value)}
                  >
                    <option value="">Select Discount</option>
                    {discountOptions.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Discount %</Form.Label>
                  <Form.Control
                    type="number"
                    value={discountPercent}
                    onChange={e => setDiscountPercent(e.target.value)}
                    step="0.001"
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button
                  variant="warning"
                  style={{ marginTop: '30px' }}
                  onClick={handleCalculateDiscount}
                >
                  Calculate
                </Button>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Sub Total</Form.Label>
                  <Form.Control
                    type="number"
                    value={subTotal}
                    onChange={e => setSubTotal(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Discount Value</Form.Label>
                  <Form.Control
                    type="number"
                    value={discountValue}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        )}
        
        {/* Narration row with right side Sub Total & Total Amount */}
        <Row className="mb-3 align-items-center">
          <Col md={10}>
            <Form.Group>
              <Form.Label>
                Narration <span style={{ fontSize: '12px', color: '#888' }}>Ctrl+Enter for next line</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={narration}
                onChange={e => setNarration(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-2">
              <Form.Label>Sub Total</Form.Label>
              <Form.Control
                type="number"
                value={subTotal}
                onChange={e => setSubTotal(e.target.value)}
                style={{ fontWeight: 'bold' }}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Total Amount</Form.Label>
              <Form.Control
                type="number"
                value={totalAmount}
                readOnly
                style={{ fontWeight: 'bold' }}
              />
            </Form.Group>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PaymentSupplier;