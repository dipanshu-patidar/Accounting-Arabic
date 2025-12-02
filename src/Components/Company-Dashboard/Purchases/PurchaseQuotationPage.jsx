// src/components/tabs/PurchaseQuotationTab.js
import React from 'react';
import { Form, Row, Col, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const PurchaseQuotationPage = ({
  formData,
  handleChange,
  addItem,
  removeItem,
  renderItemsTable,
  renderAttachmentFields,
  generateReferenceId
}) => {
  return (
    <>
      {/* Header: Logo + Company Info + Title */}
      <Row className="mb-4 mt-3">
        <Col md={3} className="d-flex align-items-center justify-content-center">
          <div
            className="border rounded d-flex flex-column align-items-center justify-content-center"
            style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer" }}
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
            <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
            <small>Upload Logo</small>
            <input id="logo-upload" type="file" accept="image/*" hidden />
          </div>
        </Col>
        <Col md={6}>
          <div className="d-flex flex-column align-items-start">
            <Form.Control
              type="text"
              value={formData.purchaseQuotation.companyName}
              onChange={(e) => handleChange("purchaseQuotation", "companyName", e.target.value)}
              placeholder="Your Company Name"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
            <Form.Control
              type="text"
              value={formData.purchaseQuotation.companyAddress}
              onChange={(e) => handleChange("purchaseQuotation", "companyAddress", e.target.value)}
              placeholder="Company Address, City, State, Pincode..."
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
            <Form.Control
              type="email"
              value={formData.purchaseQuotation.companyEmail}
              onChange={(e) => handleChange("purchaseQuotation", "companyEmail", e.target.value)}
              placeholder="Company Email..."
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
            <Form.Control
              type="text"
              value={formData.purchaseQuotation.companyPhone}
              onChange={(e) => handleChange("purchaseQuotation", "companyPhone", e.target.value)}
              placeholder="Phone No..."
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </div>
        </Col>
        <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
          <h2 className="text-success mb-0">PURCHASE QUOTATION</h2>
          <hr style={{
            width: "80%",
            borderColor: "#28a745",
            marginTop: "5px",
            marginBottom: "10px",
          }} />
        </Col>
      </Row>

      <hr style={{
        width: "100%",
        height: "4px",
        backgroundColor: "#28a745",
        border: "none",
        marginTop: "5px",
        marginBottom: "10px",
      }} />

      {/* Quotation & Vendor Info */}
      <Row className="mb-4 d-flex justify-content-between">
        <Col md={8}>
          <h5>Quotation From</h5>
          <Form.Group className="mb-2">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Form.Control
                type="text"
                value={formData.purchaseQuotation.vendorName}
                onChange={(e) => handleChange("purchaseQuotation", "vendorName", e.target.value)}
                placeholder=" Enter Vendor Name..."
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", marginRight: '5px' }}
              />
       <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={() => navigate('/Company/vendorscreditors')}
              title="Add Vendor"
            >
              Add Vendor
            </Button>
            </div>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              value={formData.purchaseQuotation.vendorAddress}
              onChange={(e) => handleChange("purchaseQuotation", "vendorAddress", e.target.value)}
              placeholder="Vendor Address"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Control
              type="email"
              value={formData.purchaseQuotation.vendorEmail}
              onChange={(e) => handleChange("purchaseQuotation", "vendorEmail", e.target.value)}
              placeholder="Email"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              value={formData.purchaseQuotation.vendorPhone}
              onChange={(e) => handleChange("purchaseQuotation", "vendorPhone", e.target.value)}
              placeholder="Phone"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-2">
            <Form.Label>Reference No</Form.Label>
            <Form.Control
              type="text"
              value={formData.purchaseQuotation.referenceId || generateReferenceId('quotation')}
              readOnly
              style={{
                border: "1px solid #495057",
                backgroundColor: "#f8f9fa",
                fontWeight: "500"
              }}
              placeholder="PUR-QRF-2025-XXXX"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Quotation No.</Form.Label>
            <Form.Control
              type="text"
              value={formData.purchaseQuotation.quotationNo}
              onChange={(e) => handleChange("purchaseQuotation", "quotationNo", e.target.value)}
              placeholder="e.g. PQ-001"
              style={{ border: "1px solid #495057" }}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Quotation Date</Form.Label>
            <Form.Control
              type="date"
              value={formData.purchaseQuotation.quotationDate}
              onChange={(e) => handleChange("purchaseQuotation", "quotationDate", e.target.value)}
              style={{ border: "1px solid #495057" }}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Valid Till</Form.Label>
            <Form.Control
              type="date"
              value={formData.purchaseQuotation.validDate}
              onChange={(e) => handleChange("purchaseQuotation", "validDate", e.target.value)}
              style={{ border: "1px solid #495057" }}
            />
          </Form.Group>
        </Col>
      </Row>

      <hr style={{
        width: "100%",
        height: "4px",
        backgroundColor: "#28a745",
        border: "none",
        marginTop: "5px",
        marginBottom: "10px",
      }} />

      {/* Items Table */}
      <Row className="mb-4">
        <Col>{renderItemsTable("purchaseQuotation")}</Col>
      </Row>

      <hr style={{
        width: "100%",
        height: "4px",
        backgroundColor: "#28a745",
        border: "none",
        marginTop: "5px",
        marginBottom: "10px",
      }} />

      {/* Totals */}
      <Row className="mb-4 mt-2">
        <Col md={4}>
          <Table bordered size="sm" className="dark-bordered-table">
            <tbody>
              <tr>
                <td className="fw-bold">Sub Total:</td>
                <td>
                  $
                  {formData.purchaseQuotation.items
                    .reduce(
                      (sum, item) =>
                        sum + (parseFloat(item.rate) || 0) * (parseInt(item.qty) || 0),
                      0
                    )
                    .toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="fw-bold">Tax:</td>
                <td>
                  $
                  {formData.purchaseQuotation.items
                    .reduce(
                      (sum, item) =>
                        sum +
                        ((parseFloat(item.rate) || 0) *
                          (parseInt(item.qty) || 0) *
                          (parseFloat(item.tax) || 0)) /
                        100,
                      0
                    )
                    .toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="fw-bold">Discount:</td>
                <td>
                  $
                  {formData.purchaseQuotation.items
                    .reduce(
                      (sum, item) => sum + (parseFloat(item.discount) || 0),
                      0
                    )
                    .toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="fw-bold">Total:</td>
                <td>
                  $
                  {(
                    formData.purchaseQuotation.items.reduce(
                      (sum, item) =>
                        sum +
                        (parseFloat(item.rate) || 0) * (parseInt(item.qty) || 0) +
                        ((parseFloat(item.rate) || 0) *
                          (parseInt(item.qty) || 0) *
                          (parseFloat(item.tax) || 0)) /
                        100 -
                        (parseFloat(item.discount) || 0),
                      0
                    )
                  ).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>

      <hr style={{
        width: "100%",
        height: "4px",
        backgroundColor: "#28a745",
        border: "none",
        marginTop: "5px",
        marginBottom: "10px",
      }} />

      {/* Bank & Notes */}
      <Row className="mb-4">
        <h5>Bank Details</h5>
        <Col md={6} className="p-2 rounded" style={{ border: "1px solid #343a40" }}>
          {['bankName', 'accountNo', 'accountHolder', 'ifsc'].map((field) => (
            <Form.Group key={field} className="mb-2">
              <Form.Control
                type="text"
                placeholder={{
                  bankName: 'Bank Name',
                  accountNo: 'Account No.',
                  accountHolder: 'Account Holder',
                  ifsc: 'IFSC Code',
                }[field]}
                value={formData.purchaseQuotation[field] || ""}
                onChange={(e) => handleChange("purchaseQuotation", field, e.target.value)}
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
          ))}
        </Col>
        <Col md={6}>
          <h5>Notes</h5>
          <Form.Control
            as="textarea"
            rows={5}
            placeholder="Enter any additional notes"
            value={formData.purchaseQuotation.notes || ""}
            onChange={(e) => handleChange("purchaseQuotation", "notes", e.target.value)}
            style={{ border: "1px solid #343a40" }}
          />
        </Col>
      </Row>

      <hr style={{
        width: "100%",
        height: "4px",
        backgroundColor: "#28a745",
        border: "none",
        marginTop: "5px",
        marginBottom: "10px",
      }} />

      {/* Terms & Footer */}
      <Row className="mb-4">
        <Col>
          <Form.Group>
            <Form.Label>Terms & Conditions</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.purchaseQuotation.terms}
              onChange={(e) => handleChange("purchaseQuotation", "terms", e.target.value)}
              placeholder="e.g. Payment within 15 days"
              style={{ border: "1px solid #343a40" }}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Attachment Fields */}
      {renderAttachmentFields("purchaseQuotation")}

      <Row className="text-center mb-4">
        <Col>
          <p><strong>Thank you for your business!</strong></p>
          <p className="text-muted">www.yourcompany.com</p>
        </Col>
      </Row>
    </>
  );
};

export default PurchaseQuotationPage;