// src/components/purchase/tabs/GoodsReceiptTab.js
import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';

const GoodsReceiptPage = ({
  formData,
  handleChange,
  addItem,
  removeItem,
  renderItemsTable,
  generateReferenceId,
  renderAttachmentFields
}) => {
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
          <h2 className="text-success mb-0">GOODS RECEIPT NOTE</h2>
        </Col>
      </Row>

      {/* Horizontal Line */}
      <hr style={{ borderTop: "4px solid #28a745", margin: "10px 0" }} />

      {/* Company Info + GRN Details */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group className="mb-1">
            <Form.Control
              type="text"
              value={formData.goodsReceipt.companyName}
              onChange={(e) => handleChange("goodsReceipt", "companyName", e.target.value)}
              placeholder="Your Company Name"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Control
              type="text"
              value={formData.goodsReceipt.companyAddress}
              onChange={(e) => handleChange("goodsReceipt", "companyAddress", e.target.value)}
              placeholder="Company Address, City, State, Pincode"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Control
              type="email"
              value={formData.goodsReceipt.companyEmail}
              onChange={(e) => handleChange("goodsReceipt", "companyEmail", e.target.value)}
              placeholder="Company Email"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Control
              type="text"
              value={formData.goodsReceipt.companyPhone}
              onChange={(e) => handleChange("goodsReceipt", "companyPhone", e.target.value)}
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
        value={formData.goodsReceipt.grnDate}
        onChange={(e) => handleChange("goodsReceipt", "grnDate", e.target.value)}
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
        value={formData.goodsReceipt.referenceId || generateReferenceId('receipt')}
        readOnly
        style={{
          border: "1px solid #a5c786",
          backgroundColor: "#f8f9fa",
          fontWeight: "500"
        }}
      />
    </Col>

    {/* Receipt No. */}
    <Col md={4} className="d-flex align-items-center">
      <Form.Label className="mb-0">Receipt No.</Form.Label>
    </Col>
    <Col md={8}>
      <Form.Control
        type="text"
        value={formData.goodsReceipt.receiptNo}
        onChange={(e) => handleChange("goodsReceipt", "receiptNo", e.target.value)}
        placeholder="e.g. RCP-001"
        style={{ border: "1px solid #a5c786" }}
      />
    </Col>

    {/* Purchase Order No. */}
    <Col md={4} className="d-flex align-items-center">
      <Form.Label className="mb-0">PO No.</Form.Label>
    </Col>
    <Col md={8}>
      <Form.Control
        type="text"
        value={formData.goodsReceipt.poNo}
        onChange={(e) => handleChange("goodsReceipt", "poNo", e.target.value)}
        placeholder="e.g. PO-001"
        style={{ border: "1px solid #a5c786" }}
      />
    </Col>

    {/* Vehicle No. */}
    <Col md={4} className="d-flex align-items-center">
      <Form.Label className="mb-0">Vehicle No.</Form.Label>
    </Col>
    <Col md={8}>
      <Form.Control
        type="text"
        value={formData.goodsReceipt.vehicleNo}
        onChange={(e) => handleChange("goodsReceipt", "vehicleNo", e.target.value)}
        placeholder="e.g. MH-01-AB-1234"
        style={{ border: "1px solid #a5c786" }}
      />
    </Col>
  </Row>
</Col>
      </Row>

      {/* Horizontal Line */}
      <hr style={{ borderTop: "4px solid #28a745", margin: "10px 0" }} />

 {/* Vendor & Ship To Sections */}
<Row className="mb-4 d-flex justify-content-between align-items-start">
  {/* Left: VENDOR (Left End) */}
  <Col md={5} className="d-flex flex-column align-items-start">
    <h6 className="mb-1">VENDOR</h6>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.goodsReceipt.vendorName}
        onChange={(e) => handleChange("goodsReceipt", "vendorName", e.target.value)}
        placeholder="Vendor Name"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.goodsReceipt.vendorAddress}
        onChange={(e) => handleChange("goodsReceipt", "vendorAddress", e.target.value)}
        placeholder="Vendor Address"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.goodsReceipt.vendorPhone}
        onChange={(e) => handleChange("goodsReceipt", "vendorPhone", e.target.value)}
        placeholder="Phone"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="email"
        value={formData.goodsReceipt.vendorEmail}
        onChange={(e) => handleChange("goodsReceipt", "vendorEmail", e.target.value)}
        placeholder="Email"
        className="form-control-no-border"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
      />
    </Form.Group>
  </Col>

  {/* Right: SHIP TO (Right End) */}
  <Col md={5} className="d-flex flex-column align-items-end">
    <h6 className="mb-1">SHIP TO</h6>
    <Form.Group className="mb-1 w-100">
      <Form.Label className="mb-0">ATN: Name / Dept</Form.Label>
      <Form.Control
        type="text"
        value={formData.goodsReceipt.shipToAttn}
        onChange={(e) => handleChange("goodsReceipt", "shipToAttn", e.target.value)}
        placeholder="Attention Name / Department"
        className="form-control-no-border text-end"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.goodsReceipt.shipToCompanyName}
        onChange={(e) => handleChange("goodsReceipt", "shipToCompanyName", e.target.value)}
        placeholder="Company Name"
        className="form-control-no-border text-end"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.goodsReceipt.shipToAddress}
        onChange={(e) => handleChange("goodsReceipt", "shipToAddress", e.target.value)}
        placeholder="Company Address"
        className="form-control-no-border text-end"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="text"
        value={formData.goodsReceipt.shipToPhone}
        onChange={(e) => handleChange("goodsReceipt", "shipToPhone", e.target.value)}
        placeholder="Phone"
        className="form-control-no-border text-end"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
      />
    </Form.Group>
    <Form.Group className="mb-1 w-100">
      <Form.Control
        type="email"
        value={formData.goodsReceipt.shipToEmail}
        onChange={(e) => handleChange("goodsReceipt", "shipToEmail", e.target.value)}
        placeholder="Email"
        className="form-control-no-border text-end"
        style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
      />
    </Form.Group>
  </Col>
</Row>

      {/* Horizontal Line */}
      <hr style={{ borderTop: "4px solid #28a745", margin: "10px 0" }} />

      {/* Driver Details */}
      <Row className="mb-4">
        <Col md={6}>
          <h6 className="mb-1">Driver Details</h6>
          <Form.Group className="mb-1">
            <Form.Label className="mb-1">Driver Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.goodsReceipt.driverName}
              onChange={(e) => handleChange("goodsReceipt", "driverName", e.target.value)}
              placeholder="Driver Name"
              style={{ border: "1px solid #a5c786" }}
            />
          </Form.Group>
          <Form.Group className="mb-1">
            <Form.Label className="mb-0">Driver Phone</Form.Label>
            <Form.Control
              type="text"
              value={formData.goodsReceipt.driverPhone}
              onChange={(e) => handleChange("goodsReceipt", "driverPhone", e.target.value)}
              placeholder="Driver Phone"
              style={{ border: "1px solid #a5c786" }}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Items Table */}
      <div className="mt-4">{renderItemsTable('goodsReceipt', true)}</div>

      {/* Attachment Fields */}
      {renderAttachmentFields("goodsReceipt")}
    </>
  );
};

export default GoodsReceiptPage;