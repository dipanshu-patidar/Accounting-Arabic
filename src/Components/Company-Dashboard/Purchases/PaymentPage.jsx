import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const PaymentPage = ({
  formData,
  handleChange,
  generateReferenceId,
  renderAttachmentFields
}) => {
  return (
    <>
{/* Header: Logo & Title */}
<Row className="mb-4">
  {/* Logo Upload (Left) */}
  <Col md={6} className="d-flex align-items-center justify-content-start">
    <div
      className="border rounded d-flex flex-column align-items-center justify-content-center"
      style={{
        height: "120px",
        width: "180px",
        borderStyle: "dashed",
        borderColor: "#a5c786",
        cursor: "pointer",
        textAlign: "center",
        fontSize: "0.85rem",
        color: "#6c757d",
      }}
      onClick={() => document.getElementById('logo-upload')?.click()}
    >
      <i className="bi bi-cloud-upload" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}></i>
      <span>Upload Logo</span>
      <input id="logo-upload" type="file" accept="image/*" style={{ display: 'none' }} />
    </div>
  </Col>

  {/* PAYMENT RECEIPT Title (Right) */}
  <Col md={6} className="d-flex align-items-center justify-content-end">
    <h2 className="text-success mb-0">PAYMENT RECEIPT</h2>
  </Col>
  
</Row>

      {/* Divider */}
      <hr
        style={{
          width: "100%",
          height: "2px",
          backgroundColor: "#a5c786",
          border: "none",
          marginTop: "5px",
          marginBottom: "10px",
        }}
      />

      {/* Company Info + Right-side Details */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            value={formData.payment.companyName}
            onChange={(e) => handleChange("payment", "companyName", e.target.value)}
            placeholder="Enter Your Company Name..."
            className="form-control-no-border mb-1"
            style={{
              fontSize: "1rem",
              lineHeight: "1.5",
              padding: "0",
              borderBottom: "1px solid #dee2e6",
            }}
          />
          <Form.Control
            type="text"
            value={formData.payment.companyAddress}
            onChange={(e) => handleChange("payment", "companyAddress", e.target.value)}
            placeholder="Company Address, City, State, Pincode ..."
            className="form-control-no-border mb-1"
            style={{
              fontSize: "1rem",
              lineHeight: "1.5",
              padding: "0",
              borderBottom: "1px solid #dee2e6",
            }}
          />
          <Form.Control
            type="email"
            value={formData.payment.companyEmail}
            onChange={(e) => handleChange("payment", "companyEmail", e.target.value)}
            placeholder="Company Email..."
            className="form-control-no-border mb-1"
            style={{
              fontSize: "1rem",
              lineHeight: "1.5",
              padding: "0",
              borderBottom: "1px solid #dee2e6",
            }}
          />
          <Form.Control
            type="text"
            value={formData.payment.companyPhone}
            onChange={(e) => handleChange("payment", "companyPhone", e.target.value)}
            placeholder="Phone No...."
            className="form-control-no-border"
            style={{
              fontSize: "1rem",
              lineHeight: "1.5",
              padding: "0",
              borderBottom: "1px solid #dee2e6",
            }}
          />
        </Col>


  {/* Right: Payment Details (Display Only) */}
      <Col md={6} className="d-flex flex-column gap-2">
  {/* Bill Date */}
  <Form.Group className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
    <Form.Label className="mb-0" style={{ minWidth: "150px", fontSize: "0.95rem" }}>
      Bill Date
    </Form.Label>
    <Form.Control
      type="date"
      value={formData.bill.billDate}
      onChange={(e) => handleChange("bill", "billDate", e.target.value)}
      style={{ border: "1px solid #a5c786" }}
    />
  </Form.Group>

  {/* Ref No. */}
  <Form.Group className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
    <Form.Label className="mb-0" style={{ minWidth: "110px", fontSize: "0.95rem" }}>
      Ref No.
    </Form.Label>
    <Form.Control
      type="text"
      value={formData.bill.referenceId || generateReferenceId('bill')}
      readOnly
      style={{ border: "1px solid #a5c786" }}
    />
  </Form.Group>

  {/* Bill No. */}
  <Form.Group className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
    <Form.Label className="mb-0" style={{ minWidth: "110px", fontSize: "0.95rem" }}>
      Bill No.
    </Form.Label>
    <Form.Control
      type="text"
      value={formData.bill.billNo}
      onChange={(e) => handleChange("bill", "billNo", e.target.value)}
      placeholder="e.g. INV-001"
      style={{ border: "1px solid #a5c786" }}
    />
  </Form.Group>

  {/* Purchase Order No. */}
  <Form.Group className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
    <Form.Label className="mb-0" style={{ minWidth: "110px", fontSize: "0.95rem" }}>
      Purchase Order No.
    </Form.Label>
    <Form.Control
      type="text"
      value={formData.bill.poNo}
      onChange={(e) => handleChange("bill", "poNo", e.target.value)}
      placeholder="e.g. PO-001"
      style={{ border: "1px solid #a5c786" }}
    />
  </Form.Group>

{/* Payment Method */}
{/* Payment Method */}
<Form.Group className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
  <Form.Label className="mb-0" style={{ minWidth: "110px", fontSize: "0.95rem" }}>
    Payment Method
  </Form.Label>
  <Form.Control
    type="text"
    value={formData.bill.paymentMethod}
    onChange={(e) => handleChange("bill", "paymentMethod", e.target.value)}
    placeholder="e.g. Bank Transfer, UPI, Cash"
    style={{
      border: "1px solid #a5c786",
      fontSize: "0.95rem",
      padding: "0.375rem 0.75rem",
    }}
  />
</Form.Group>
</Col>

      </Row>

      {/* Divider */}
      <hr
        style={{
          width: "100%",
          height: "2px",
          backgroundColor: "#a5c786",
          border: "none",
          marginTop: "5px",
          marginBottom: "10px",
        }}
      />

      {/* PAID TO Section */}
      <Row>
        <Col md={6}>
          <h6 className="mb-2">PAID TO</h6>
          <Form.Control
            type="text"
            value={formData.payment.vendorName}
            onChange={(e) => handleChange("payment", "vendorName", e.target.value)}
            placeholder="Enter Vendor Name......"
            className="form-control-no-border mb-1"
            style={{
              fontSize: "1rem",
              lineHeight: "1.5",
              padding: "0",
              borderBottom: "1px solid #dee2e6",
            }}
          />
          <Form.Control
            type="text"
            value={formData.payment.vendorAddress}
            onChange={(e) => handleChange("payment", "vendorAddress", e.target.value)}
            placeholder="Vendor Address....."
            className="form-control-no-border mb-1"
            style={{
              fontSize: "1rem",
              lineHeight: "1.5",
              padding: "0",
              borderBottom: "1px solid #dee2e6",
            }}
          />
          <Form.Control
            type="email"
            value={formData.payment.vendorEmail}
            onChange={(e) => handleChange("payment", "vendorEmail", e.target.value)}
            placeholder="Email....."
            className="form-control-no-border mb-1"
            style={{
              fontSize: "1rem",
              lineHeight: "1.5",
              padding: "0",
              borderBottom: "1px solid #dee2e6",
            }}
          />
          <Form.Control
            type="text"
            value={formData.payment.vendorPhone}
            onChange={(e) => handleChange("payment", "vendorPhone", e.target.value)}
            placeholder="Phone......"
            className="form-control-no-border"
            style={{
              fontSize: "1rem",
              lineHeight: "1.5",
              padding: "0",
              borderBottom: "1px solid #dee2e6",
            }}
          />
        </Col>

        <Col md={6} className="d-flex flex-column align-items-end">
  <h6 className="mb-2">PAYMENT DETAILS</h6>

  {/* Amount Paid */}
  <Form.Group className=" mb-2" style={{ textAlign: "right" }}>
    <small className="text-muted">Amount Paid</small>
    <Form.Control
      type="number"
      step="0.01"
      value={formData.payment.amount}
      onChange={(e) => handleChange("payment", "amount", e.target.value)}
      placeholder="0.00"
      style={{
        border: "1px solid #dee2e6",
        fontSize: "1rem",
        textAlign: "right",
        padding: "0.375rem 0.75rem",
        marginTop: "0.25rem",
      }}
     className="form-control-no-border"
    />
  </Form.Group>

  {/* Total Amount */}
  <Form.Group className="mb-2" style={{ textAlign: "right" }}>
    <small className="text-muted">Total Amount</small>
    <Form.Control
      type="number"
      step="0.01"
      value={formData.payment.totalAmount}
      onChange={(e) => handleChange("payment", "totalAmount", e.target.value)}
      placeholder="0.00"
             className="form-control-no-border"
             style={{
              border: "1px solid #dee2e6",
              fontSize: "1rem",
              textAlign: "right",
              padding: "0.375rem 0.75rem",
              marginTop: "0.25rem",
            }}
      
    
    />

    
  </Form.Group>


{/* Payment Status */}
<div className="d-flex justify-content-end align-items-baseline mb-2" style={{ gap: "0.2rem" }}>
  <small className="text-muted" style={{ whiteSpace: "nowrap" }}>
    Payment Status
  </small>
  <Form.Control
    type="text"
    value={formData.payment.status}
    onChange={(e) => handleChange("payment", "status", e.target.value)}
    placeholder="Paid, Pending, Failed"
    style={{
      width: "180px",
      border: "1px solid #dee2e6",
      fontSize: "1rem",
      textAlign: "right",
      padding: "0.375rem 0.75rem",
    }}
    className="form-control-no-border"
  />
</div>
</Col>
      </Row>

      {/* Attachment Fields */}
      {renderAttachmentFields("payment")}
    </>
  );
};

export default PaymentPage;