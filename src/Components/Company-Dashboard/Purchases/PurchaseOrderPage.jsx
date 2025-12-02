// src/components/purchase/tabs/PurchaseOrderTab.js
import React from 'react';
import { Form, Row, Col, Button, Table } from 'react-bootstrap';

const PurchaseOrderTab = ({
  formData,
  handleChange,
  addItem,
  removeItem,
  renderItemsTable,
  generateReferenceId,
  renderAttachmentFields
}) => {
  const calculateTotalAmount = (items) => {
    return items.reduce((sum, item) => {
      const rate = parseFloat(item.rate) || 0;
      const qty = parseInt(item.qty) || 0;
      const tax = parseFloat(item.tax) || 0;
      const discount = parseFloat(item.discount) || 0;
      return sum + (rate * qty) + (rate * qty * tax / 100) - discount;
    }, 0);
  };

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
          <h2 className="text-success mb-0">PURCHASE ORDER</h2>
        </Col>
      </Row>

      {/* Horizontal Line */}
      <hr style={{ borderTop: "5px solid #28a745", margin: "10px 0" }} />

      {/* Company Info + PO Details */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group className="mb-1">
            <Form.Control
              type="text"
              value={formData.purchaseOrder.companyName}
              onChange={(e) => handleChange("purchaseOrder", "companyName", e.target.value)}
              placeholder="Your Company Name"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Control
              type="text"
              value={formData.purchaseOrder.companyAddress}
              onChange={(e) => handleChange("purchaseOrder", "companyAddress", e.target.value)}
              placeholder="Company Address, City, State, Pincode"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Control
              type="email"
              value={formData.purchaseOrder.companyEmail}
              onChange={(e) => handleChange("purchaseOrder", "companyEmail", e.target.value)}
              placeholder="Company Email"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Control
              type="text"
              value={formData.purchaseOrder.companyPhone}
              onChange={(e) => handleChange("purchaseOrder", "companyPhone", e.target.value)}
              placeholder="Phone No."
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
  <Row className="g-1">
    {/* Date */}
    <Col md={4} className="d-flex align-items-center">
      <Form.Label className="mb-0">Date</Form.Label>
    </Col>
    <Col md={8}>
      <Form.Control
        type="date"
        value={formData.purchaseOrder.poDate}
        onChange={(e) => handleChange("purchaseOrder", "poDate", e.target.value)}
        style={{ border: "1px solid #a5c786" }}
      />
    </Col>

    {/* Ref No. */}
    <Col md={4} className="d-flex align-items-center">
      <Form.Label className="mb-0">Ref No.</Form.Label>
    </Col>
    <Col md={8}>
      <Form.Control
        type="text"
        value={formData.purchaseOrder.referenceId || generateReferenceId('order')}
        readOnly
        style={{
          border: "1px solid #a5c786",
          backgroundColor: "#f8f9fa",
          fontWeight: "500"
        }}
      />
    </Col>

    {/* Purchase Order No. */}
    <Col md={4} className="d-flex align-items-center">
      <Form.Label className="mb-0">PO No.</Form.Label>
    </Col>
    <Col md={8}>
      <Form.Control
        type="text"
        value={formData.purchaseOrder.poNo}
        onChange={(e) => handleChange("purchaseOrder", "poNo", e.target.value)}
        placeholder="e.g. PO-001"
        style={{ border: "1px solid #a5c786" }}
      />
    </Col>

    {/* Quotation No. */}
    <Col md={4} className="d-flex align-items-center">
      <Form.Label className="mb-0">Quotation No.</Form.Label>
    </Col>
    <Col md={8}>
      <Form.Control
        type="text"
        value={formData.purchaseOrder.quotationNo}
        onChange={(e) => handleChange("purchaseOrder", "quotationNo", e.target.value)}
        placeholder="e.g. QO-001"
        style={{ border: "1px solid #a5c786" }}
      />
    </Col>

    {/* Vendor No. */}
    <Col md={4} className="d-flex align-items-center">
      <Form.Label className="mb-0">Vendor No.</Form.Label>
    </Col>
    <Col md={8}>
      <Form.Control
        type="text"
        value={formData.purchaseOrder.vendorNo}
        onChange={(e) => handleChange("purchaseOrder", "vendorNo", e.target.value)}
        placeholder="e.g. VND-001"
        style={{ border: "1px solid #a5c786" }}
      />
    </Col>
  </Row>
</Col>
      </Row>

      {/* Horizontal Line */}
      <hr style={{ borderTop: "4px solid  #28a745", margin: "10px 0" }} />

   {/* Vendor & Ship To Sections with Extra Right Column */}
<Row className="mb-4 d-flex justify-content-between mt-2">
  {/* Left: VENDOR */}
  <Col md={5} className="d-flex flex-column align-items-start">
    <h6 className="mb-1">VENDOR</h6>
    <Form.Group className="mb-1 w-100">
      <Form.Label className="mb-0">ATN: Name / Dept</Form.Label>
      <Form.Control
        type="text"
        value={formData.purchaseOrder.vendorAttn}
        onChange={(e) => handleChange("purchaseOrder", "vendorAttn", e.target.value)}
        placeholder="Attention Name / Department"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.purchaseOrder.vendorName}
        onChange={(e) => handleChange("purchaseOrder", "vendorName", e.target.value)}
        placeholder="Vendor Name"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.purchaseOrder.vendorAddress}
        onChange={(e) => handleChange("purchaseOrder", "vendorAddress", e.target.value)}
        placeholder="Vendor Address"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.purchaseOrder.vendorPhone}
        onChange={(e) => handleChange("purchaseOrder", "vendorPhone", e.target.value)}
        placeholder="Phone"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="email"
        value={formData.purchaseOrder.vendorEmail}
        onChange={(e) => handleChange("purchaseOrder", "vendorEmail", e.target.value)}
        placeholder="Email"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
  </Col>

  {/* Middle: SHIP TO */}
  <Col md={4} className="d-flex flex-column align-items-start">
    <h6 className="mb-1">SHIP TO</h6>
    <Form.Group className="mb-1 w-100">
      <Form.Label className="mb-0">ATN: Name / Dept</Form.Label>
      <Form.Control
        type="text"
        value={formData.purchaseOrder.shipToAttn}
        onChange={(e) => handleChange("purchaseOrder", "shipToAttn", e.target.value)}
        placeholder="Attention Name / Department"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.purchaseOrder.shipToCompanyName}
        onChange={(e) => handleChange("purchaseOrder", "shipToCompanyName", e.target.value)}
        placeholder="Company Name"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.purchaseOrder.shipToAddress}
        onChange={(e) => handleChange("purchaseOrder", "shipToAddress", e.target.value)}
        placeholder="Company Address"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.purchaseOrder.shipToPhone}
        onChange={(e) => handleChange("purchaseOrder", "shipToPhone", e.target.value)}
        placeholder="Phone"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="email"
        value={formData.purchaseOrder.shipToEmail}
        onChange={(e) => handleChange("purchaseOrder", "shipToEmail", e.target.value)}
        placeholder="Email"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
  </Col>

 
</Row>

      {/* Horizontal Line */}
      <hr style={{ borderTop: "4px solid #28a745", margin: "10px 0" }} />

      {/* Items Table */}
      <div className="mt-4">{renderItemsTable('purchaseOrder')}</div>

      {/* Totals */}
      <Row className="mb-4 mt-2">
        <Col md={4}>
          <Table bordered size="sm" className="dark-bordered-table">
            <tbody>
              <tr>
                <td className="fw-bold">Sub Total:</td>
                <td>${calculateTotalAmount(formData.purchaseOrder.items).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="fw-bold">Total:</td>
                <td className="fw-bold">${calculateTotalAmount(formData.purchaseOrder.items).toFixed(2)}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Terms & Conditions */}
      <Form.Group className="mt-4">
        <Form.Label>Terms & Conditions</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={formData.purchaseOrder.terms}
          onChange={(e) => handleChange('purchaseOrder', 'terms', e.target.value)}
          style={{ border: "1px solid #a5c786" }}
        />
      </Form.Group>

      {/* Attachment Fields */}
      {renderAttachmentFields("purchaseOrder")}
    </>
  );
};

export default PurchaseOrderTab;