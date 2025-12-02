// src/components/purchase/tabs/BillTab.js
import React from 'react';
import { Form, Row, Col, Button ,Table} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
const BillPage = ({
  formData,
  handleChange,
  addItem,
  removeItem,
  renderItemsTable,
  generateReferenceId,
  renderAttachmentFields
}) => {
  const calculateTotal = () => {
    return formData.bill.items.reduce((sum, item) => {
      const rate = parseFloat(item.rate) || 0;
      const qty = parseInt(item.qty) || 0;
      const tax = parseFloat(item.tax) || 0;
      const discount = parseFloat(item.discount) || 0;
      return sum + (rate * qty) + (rate * qty * tax / 100) - discount;
    }, 0);
  };

  const navigate = useNavigate();

  return (
    <>
      {/* Header: Logo + Title */}
      <Row className="mb-4">
        <Col md={3} className="d-flex align-items-center justify-content-center">
          <div
            className="border rounded d-flex flex-column align-items-center justify-content-center"
            style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer" }}
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
            <span>Upload Logo</span>
            <input id="logo-upload" type="file" accept="image/*" style={{ display: 'none' }} />
          </div>
        </Col>
        <Col md={9} className="d-flex align-items-center justify-content-end">
          <h2 className="text-success mb-0">PURCHASE BILL</h2>
        </Col>
      </Row>

      {/* Horizontal Line */}
      <hr style={{ borderTop: "1px solid #a5c786", margin: "10px 0" }} />

      {/* Company Info + Bill Details */}
      <Row className="mb-4 d-flex justify-content-between align-items-start">
        <Col md={6}>
          <Form.Group className="mb-1">
            <Form.Control
              type="text"
              value={formData.bill.companyName}
              onChange={(e) => handleChange("bill", "companyName", e.target.value)}
              placeholder="Your Company Name"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Control
              type="text"
              value={formData.bill.companyAddress}
              onChange={(e) => handleChange("bill", "companyAddress", e.target.value)}
              placeholder="Company Address, City, State, Pincode"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Control
              type="email"
              value={formData.bill.companyEmail}
              onChange={(e) => handleChange("bill", "companyEmail", e.target.value)}
              placeholder="Company Email"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Control
              type="text"
              value={formData.bill.companyPhone}
              onChange={(e) => handleChange("bill", "companyPhone", e.target.value)}
              placeholder="Phone No."
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
        </Col>
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

  {/* Due Date */}
  <Form.Group className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
    <Form.Label className="mb-0" style={{ minWidth: "110px", fontSize: "0.95rem" }}>
      Due Date
    </Form.Label>
    <Form.Control
      type="date"
      value={formData.bill.dueDate}
      onChange={(e) => handleChange("bill", "dueDate", e.target.value)}
      style={{ border: "1px solid #a5c786" }}
    />
  </Form.Group>
</Col>
      </Row>

      {/* Horizontal Line */}
      <hr style={{ borderTop: "1px solid #a5c786", margin: "10px 0" }} />

  {/* Vendor & Ship To Sections */}
<Row className="mb-4 d-flex justify-content-between align-items-start">
{/* Left: VENDOR (Left End) */}
<Col md={5} className="d-flex flex-column align-items-start">
  <h6 className="mb-1">VENDOR</h6>

  {/* Vendor Name with Add Vendor Button */}
  <div className="d-flex w-100 align-items-center mb-1" style={{ gap: "0.5rem" }}>
    <Form.Group className="flex-grow-1 mb-0">
      <Form.Control
        type="text"
        value={formData.bill.vendorName}
        onChange={(e) => handleChange("bill", "vendorName", e.target.value)}
        placeholder="Vendor Name"
        className="form-control-no-border"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0.375rem 0.75rem",
        }}
      />
    </Form.Group>

    {/* Add Vendor Button */}
    <Button
      variant="outline-primary"
      size="sm"
      as={Link}
      to="/Company/vendorscreditors"
      style={{
        whiteSpace: "nowrap",
        fontSize: "0.85rem",
        padding: "0.25rem 0.5rem",
      }}
    >
      Add Vendor
    </Button>
  </div>

  {/* Other Vendor Fields Below */}
  <Form.Group className="mb-1 w-100">
    <Form.Control
      type="text"
      value={formData.bill.vendorAddress}
      onChange={(e) => handleChange("bill", "vendorAddress", e.target.value)}
      placeholder="Vendor Address"
      className="form-control-no-border"
      style={{
        fontSize: "1rem",
        lineHeight: "1.5",
        minHeight: "auto",
        padding: "0.375rem 0",
      }}
    />
  </Form.Group>

  <Form.Group className="mb-1 w-100">
    <Form.Control
      type="email"
      value={formData.bill.vendorEmail}
      onChange={(e) => handleChange("bill", "vendorEmail", e.target.value)}
      placeholder="Email"
      className="form-control-no-border"
      style={{
        fontSize: "1rem",
        lineHeight: "1.5",
        minHeight: "auto",
        padding: "0.375rem 0",
      }}
    />
  </Form.Group>

  <Form.Group className="mb-1 w-100">
    <Form.Control
      type="text"
      value={formData.bill.vendorPhone}
      onChange={(e) => handleChange("bill", "vendorPhone", e.target.value)}
      placeholder="Phone"
      className="form-control-no-border"
      style={{
        fontSize: "1rem",
        lineHeight: "1.5",
        minHeight: "auto",
        padding: "0.375rem 0",
      }}
    />
  </Form.Group>
</Col>

  {/* Right: SHIP TO (Right End) */}
  <Col md={5} className="d-flex flex-column align-items-end">
    <h6 className="mb-1">SHIP TO</h6>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.bill.shipToName}
        onChange={(e) => handleChange("bill", "shipToName", e.target.value)}
        placeholder="Name"
        className="form-control-no-border text-end"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.bill.shipToAddress}
        onChange={(e) => handleChange("bill", "shipToAddress", e.target.value)}
        placeholder="Address"
        className="form-control-no-border text-end"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="email"
        value={formData.bill.shipToEmail}
        onChange={(e) => handleChange("bill", "shipToEmail", e.target.value)}
        placeholder="Email"
        className="form-control-no-border text-end"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.bill.shipToPhone}
        onChange={(e) => handleChange("bill", "shipToPhone", e.target.value)}
        placeholder="Phone"
        className="form-control-no-border text-end"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
      />
    </Form.Group>
  </Col>
</Row>

   
      {/* Items Table */}
      <div className="mt-4">{renderItemsTable('bill')}</div>

      {/* Totals */}
      <Row className="mb-4 mt-2">
        <Col md={4}>
          <Table bordered size="sm" className="dark-bordered-table">
            <tbody>
              <tr>
                <td className="fw-bold">Sub Total:</td>
                <td>${calculateTotal().toFixed(2)}</td>
              </tr>
              <tr>
                <td className="fw-bold">Total:</td>
                <td className="fw-bold">${calculateTotal().toFixed(2)}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Terms & Notes */}
      <Form.Group className="mt-4">
        <Form.Label>Terms & Conditions</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={formData.bill.notes}
          onChange={(e) => handleChange("bill", "notes", e.target.value)}
          style={{ border: "1px solid #a5c786" }}
        />
      </Form.Group>

      {/* Attachment Fields */}
      {renderAttachmentFields("bill")}
    </>
  );
};

export default BillPage;