// src/components/Forms/PaymentTab.jsx
import React from 'react';
import { Form, Row, Col, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const PaymentTab = ({
  formData,
  handleChange,
  handleItemChange,
  addItem,
  removeItem,
  renderItemsTable,
  renderAttachmentFields,
  calculateTotalAmount,
  handleSkip,
  handleSaveDraft,
  handleFinalSubmit,
  showAdd,
  showEdit,
  newItem,
  categories,
  newCategory,
  showUOMModal,
  showAddCategoryModal,
  setShowAdd,
  setShowEdit,
  setShowUOMModal,
  setShowAddCategoryModal,
  setNewCategory,
  handleProductChange,
  handleAddItem,
  handleUpdateItem,
  handleAddCategory
}) => {
  return (
    <Form>
      {/* Header: Logo + Title */}
      <Row className="mb-4 d-flex justify-content-between align-items-center">
        <Col md={3} className="d-flex align-items-center justify-content-center">
          <div
            className="border rounded d-flex flex-column align-items-center justify-content-center"
            style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer" }}
            onClick={() => document.getElementById('logo-upload-payment')?.click()}
          >
            <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
            <small>Upload Logo</small>
            <input id="logo-upload-payment" type="file" accept="image/*" hidden />
          </div>
        </Col>
        <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
          <h2 className="text-success mb-0">PAYMENT RECEIPT</h2>
          <hr
            style={{
              width: "80%",
              borderColor: "#28a745",
              marginTop: "5px",
              marginBottom: "10px",
            }}
          />
        </Col>
      </Row>

      <hr
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: "#28a745",
          border: "none",
          marginTop: "5px",
          marginBottom: "10px",
        }}
      />

      <Row className="mb-4 mt-3">
        <Col md={6}>
          <div className="d-flex flex-column gap-1">
            <Form.Control
              type="text"
              value={formData.payment.companyName}
              onChange={(e) => handleChange("payment", "companyName", e.target.value)}
              placeholder=" Enter Your Company Name. . . . ."
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
            <Form.Control
              type="text"
              value={formData.payment.companyAddress}
              onChange={(e) => handleChange("payment", "companyAddress", e.target.value)}
              placeholder="Company Address, City, State, Pincode  . . . "
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
            <Form.Control
              type="email"
              value={formData.payment.companyEmail}
              onChange={(e) => handleChange("payment", "companyEmail", e.target.value)}
              placeholder="Company Email. . . ."
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
            <Form.Control
              type="text"
              value={formData.payment.companyPhone}
              onChange={(e) => handleChange("payment", "companyPhone", e.target.value)}
              placeholder="Phone No....."
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </div>
        </Col>
        <Col md={6} className="d-flex flex-column align-items-end">
          <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
            
            {/* Payment No (Auto) */}
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label
                  className="mb-0"
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    marginRight: "8px"
                  }}
                >
                  Payment No.
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.payment.paymentNo}
                  readOnly
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    fontWeight: "500",
                    backgroundColor: "#f8f9fa",
                    color: "#495057",
                    cursor: "not-allowed",
                    textAlign: "right",
                    flexGrow: 1
                  }}
                />
              </div>
            </Form.Group>

            {/* Manual Payment No (Optional) */}
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label
                  className="mb-0 flex-shrink-0 me-2"
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    whiteSpace: "nowrap"
                  }}
                >
                  Manual Payment No (Optional)
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.payment.manualPaymentNo || ""}
                  onChange={(e) => handleChange("payment", "manualPaymentNo", e.target.value)}
                  placeholder="e.g. PAY-CUST-001"
                  className="form-control-no-border text-end flex-grow-1"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0.375rem 0.75rem",
                    textAlign: "right"
                  }}
                />
              </div>
            </Form.Group>

            {/* Invoice No (Auto) */}
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label
                  className="mb-0"
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    marginRight: "8px"
                  }}
                >
                  Invoice No.
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.payment.invoiceNo}
                  readOnly
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    fontWeight: "500",
                    backgroundColor: "#f8f9fa",
                    color: "#495057",
                    cursor: "not-allowed",
                    textAlign: "right",
                    flexGrow: 1
                  }}
                />
              </div>
            </Form.Group>

            {/* Manual Invoice No (Optional) */}
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label
                  className="mb-0 flex-shrink-0 me-2"
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    whiteSpace: "nowrap"
                  }}
                >
                  Manual Invoice No (Optional)
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.payment.manualInvoiceRef || ""}
                  onChange={(e) => handleChange("payment", "manualInvoiceRef", e.target.value)}
                  placeholder="e.g. INV-CUST-001"
                  className="form-control-no-border text-end flex-grow-1"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0.375rem 0.75rem",
                    textAlign: "right"
                  }}
                />
              </div>
            </Form.Group>

            {/* Payment Method */}
            <Form.Group>
              <Form.Control
                type="text"
                value={formData.payment.paymentMethod}
                onChange={(e) => handleChange("payment", "paymentMethod", e.target.value)}
                placeholder="Payment Method"
                className="form-control-no-border text-end"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                  textAlign: "right"
                }}
              />
            </Form.Group>
          </div>
        </Col>
      </Row>

      <hr
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: "#28a745",
          border: "none",
          marginTop: "5px",
          marginBottom: "10px",
        }}
      />

      <Row className="mb-4 d-flex justify-content-between">
        <Col md={6} className="d-flex flex-column align-items-start">
          <h5>RECEIVED FROM</h5>
          <Form.Control
            type="text"
            value={formData.payment.customerName || ""}
            onChange={(e) => handleChange("payment", "customerName", e.target.value)}
            placeholder="Enter Customer Name. . . . . ."
            className="form-control-no-border"
            style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
          />
          <Form.Group className="mb-1 w-100">
            <Form.Control
              rows={2}
              value={formData.payment.customerAddress || ""}
              onChange={(e) => handleChange("payment", "customerAddress", e.target.value)}
              placeholder="Customer Address. . . .  ."
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-2 w-100">
            <Form.Control
              type="email"
              value={formData.payment.customerEmail || ""}
              onChange={(e) => handleChange("payment", "customerEmail", e.target.value)}
              placeholder="Email. . . . . "
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-2 w-100">
            <Form.Control
              type="text"
              value={formData.payment.customerPhone || ""}
              onChange={(e) => handleChange("payment", "customerPhone", e.target.value)}
              placeholder="Phone. . . . . . ."
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex flex-column align-items-end">
          <h5>PAYMENT DETAILS</h5>
          <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
            <Form.Group className="mb-2">
              <Form.Label>Amount Received</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.payment.amount}
                onChange={(e) => handleChange("payment", "amount", e.target.value)}
                placeholder="Amount"
                className="form-control-no-border text-end"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Total Amount</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={(
                  parseFloat(formData.payment.totalAmount) ||
                  calculateTotalAmount(formData.invoice.items)
                ).toFixed(2)}
                readOnly
                className="form-control-no-border text-end"
                style={{ textAlign: "right" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Payment Status</Form.Label>
              <Form.Control
                type="text"
                value={formData.payment.paymentStatus}
                onChange={(e) => handleChange("payment", "paymentStatus", e.target.value)}
                placeholder="Payment Status"
                className="form-control-no-border text-end"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
              />
            </Form.Group>
          </div>
        </Col>
      </Row>

      <hr
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: "#28a745",
          border: "none",
          marginTop: "5px",
          marginBottom: "10px",
        }}
      />

      <Row className="mb-4 mt-2">
        <Col md={4}>
          <Table bordered size="sm" className="dark-bordered-table">
            <tbody>
              <tr>
                <td className="fw-bold">Total Invoice:</td>
                <td>
                  ${(
                    parseFloat(formData.payment.totalAmount) ||
                    calculateTotalAmount(formData.invoice.items)
                  ).toFixed(2)}
                </td>
              </tr>
              <tr className="fw-bold">
                <td>Amount Received:</td>
                <td>${(parseFloat(formData.payment.amount) || 0).toFixed(2)}</td>
              </tr>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <td className="fw-bold">Balance:</td>
                <td className="fw-bold text-danger">
                  ${(
                    (parseFloat(formData.payment.totalAmount) ||
                      calculateTotalAmount(formData.invoice.items)) -
                    (parseFloat(formData.payment.amount) || 0)
                  ).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>

      <Form.Group className="mt-4">
        <Form.Label>Note</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={formData.payment.note}
          onChange={(e) => handleChange("payment", "note", e.target.value)}
          placeholder="e.g. Payment received via UPI / Cash"
          style={{ border: "1px solid #343a40" }}
        />
      </Form.Group>

      {/* Attachment Fields */}
      {renderAttachmentFields("payment")}

      <Row className="text-center mt-5 mb-4 pt-3 border-top">
        <Col>
          <Form.Control
            type="text"
            value={formData.payment.footerNote}
            onChange={(e) => handleChange("payment", "footerNote", e.target.value)}
            className="text-center mb-2 fw-bold"
            placeholder="Thank you for your payment!"
          />
        </Col>
      </Row>

      <div className="d-flex justify-content-between mt-4 border-top pt-3">
        <Button variant="secondary" onClick={handleSkip}>Skip</Button>
        <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
        <Button variant="primary" onClick={handleFinalSubmit}>Submit</Button>
      </div>
    </Form>
  );
};

export default PaymentTab;