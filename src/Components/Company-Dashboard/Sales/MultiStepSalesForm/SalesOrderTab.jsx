// src/components/Forms/SalesOrderTab.jsx
import React from 'react';
import { Form, Row, Col, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import AddProductModal from '../../Inventory/AddProductModal';

const SalesOrderTab = ({
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
  handleSaveNext,
  handleNext,
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
      {/* Header: Logo + Company Info + Title */}
      <Row className="mb-4 d-flex justify-content-between">
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

        <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
          <h2 className="text-success mb-0">SALES ORDER FORM</h2>
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
          <div className="d-flex flex-column align-items-end justify-content-center gap-1">
            <Form.Control
              type="text"
              value={formData.salesOrder.companyName}
              onChange={(e) => handleChange("salesOrder", "companyName", e.target.value)}
              placeholder="Your Company Name"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
            <Form.Control
              type="text"
              value={formData.salesOrder.companyAddress}
              onChange={(e) => handleChange("salesOrder", "companyAddress", e.target.value)}
              placeholder="Company Address, City, State, Pincode"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
            <Form.Control
              type="email"
              value={formData.salesOrder.companyEmail}
              onChange={(e) => handleChange("salesOrder", "companyEmail", e.target.value)}
              placeholder="Company Email"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
            <Form.Control
              type="text"
              value={formData.salesOrder.companyPhone}
              onChange={(e) => handleChange("salesOrder", "companyPhone", e.target.value)}
              placeholder="Phone No."
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </div>
        </Col>
        <Col md={6} className="d-flex flex-column align-items-end">
          <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>
            {/* Sales Order No (Auto or Manual) */}
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
                  SO No.
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.salesOrder.salesOrderNo}
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

            {/* Quotation No (Auto from Quotation) */}
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
                  Quotation No
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.salesOrder.quotationNo}
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

            {/* Manual Quotation Ref (Optional) */}
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
                  Manual Quotation No (Optional)
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.salesOrder.manualQuotationRef || ""}
                  onChange={(e) => handleChange("salesOrder", "manualQuotationRef", e.target.value)}
                  placeholder="e.g. CUST-QTN-001"
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

            {/* Customer No */}
            <Form.Group>
              <Form.Control
                type="text"
                value={formData.salesOrder.customerNo}
                onChange={(e) => handleChange('salesOrder', 'customerNo', e.target.value)}
                placeholder="Customer No."
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

      {/* Bill To and Ship To Sections */}
      <Row className="mb-4 d-flex justify-content-between">
        <Col md={6} className="d-flex flex-column align-items-start">
          <h5>BILL TO</h5>
          <Form.Group className="mb-2 w-100">
            <Form.Label>ATN: Name / Dept</Form.Label>
            <Form.Control
              type="text"
              value={formData.salesOrder.billToAttn}
              onChange={(e) => handleChange("salesOrder", "billToAttn", e.target.value)}
              placeholder="Attention Name / Department"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-2 w-100">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Form.Control
                type="text"
                value={formData.salesOrder.billToCompanyName}
                onChange={(e) => handleChange("salesOrder", "billToCompanyName", e.target.value)}
                placeholder="Company Name"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", marginRight: '5px' }}
              />

            </div>
          </Form.Group>
          <Form.Group className="mb-2 w-100">
            <Form.Control
              type="text"
              value={formData.salesOrder.billToAddress}
              onChange={(e) => handleChange("salesOrder", "billToAddress", e.target.value)}
              placeholder="Company Address"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-2 w-100">
            <Form.Control
              type="text"
              value={formData.salesOrder.billToPhone}
              onChange={(e) => handleChange("salesOrder", "billToPhone", e.target.value)}
              placeholder="Phone"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
          <Form.Group className="mb-2 w-100">
            <Form.Control
              type="email"
              value={formData.salesOrder.billToEmail}
              onChange={(e) => handleChange("salesOrder", "billToEmail", e.target.value)}
              placeholder="Email"
              className="form-control-no-border"
              style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
            />
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex flex-column align-items-end">
          <h5>SHIP TO</h5>
          <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
            <Form.Group className="mb-2">
              <Form.Label>ATN: Name / Dept</Form.Label>
              <Form.Control
                type="text"
                value={formData.salesOrder.shipToAttn}
                onChange={(e) => handleChange("salesOrder", "shipToAttn", e.target.value)}
                placeholder="Attention Name / Department"
                className="form-control-no-border text-end"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                value={formData.salesOrder.shipToCompanyName}
                onChange={(e) => handleChange("salesOrder", "shipToCompanyName", e.target.value)}
                placeholder="Company Name"
                className="form-control-no-border text-end"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                value={formData.salesOrder.shipToAddress}
                onChange={(e) => handleChange("salesOrder", "shipToAddress", e.target.value)}
                placeholder="Company Address"
                className="form-control-no-border text-end"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                value={formData.salesOrder.shipToPhone}
                onChange={(e) => handleChange("salesOrder", "shipToPhone", e.target.value)}
                placeholder="Phone"
                className="form-control-no-border text-end"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="email"
                value={formData.salesOrder.shipToEmail}
                onChange={(e) => handleChange("salesOrder", "shipToEmail", e.target.value)}
                placeholder="Email"
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

      {/* Items Table */}
      <div className="mt-4">{renderItemsTable('salesOrder')}</div>

      {/* Totals - Moved to left side */}
      <Row className="mb-4 mt-2">
        <Col md={4}>
          <Table bordered size="sm" className="dark-bordered-table">
            <tbody>
              <tr>
                <td className="fw-bold">Sub Total:</td>
                <td>${calculateTotalAmount(formData.salesOrder.items).toFixed(2)}</td>
              </tr>
              <tr>
                <td className="fw-bold">Total:</td>
                <td className="fw-bold">
                  ${calculateTotalAmount(formData.salesOrder.items).toFixed(2)}
                </td>
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
          value={formData.salesOrder.terms}
          onChange={(e) => handleChange('salesOrder', 'terms', e.target.value)}
          style={{ border: "1px solid #343a40" }}
        />
      </Form.Group>

      {/* Attachment Fields */}
      {renderAttachmentFields("salesOrder")}

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={handleSkip}>Skip</Button>
        <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
        <Button variant="primary" onClick={handleSaveNext}>Save & Next</Button>
        <Button variant="success" onClick={handleNext}>Next</Button>
      </div>
    </Form>
  );
};

export default SalesOrderTab;