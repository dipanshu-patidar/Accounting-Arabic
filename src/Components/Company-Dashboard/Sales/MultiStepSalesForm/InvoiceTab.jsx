// src/components/Forms/InvoiceTab.jsx
import React from 'react';
import { useState } from 'react';
import { Form, Row, Col, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import AddProductModal from '../../Inventory/AddProductModal';
import AddEditCustomerModal from '../../Accounts/CustomersDebtors/AddEditCustomerModal';

const InvoiceTab = ({
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
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Optional: Handle save callback
  const handleSave = (customerData, mode) => {
    console.log(`${mode === 'edit' ? 'Updated' : 'Added'} customer:`, customerData);
    // You can refresh the customer list here if needed
  };
  return (
    <>
      <Form>
        {/* Header: Logo + Company Info + Title */}
        <Row className="mb-4 d-flex justify-content-between align-items-center">
          <Col md={3} className="d-flex align-items-center justify-content-center">
            <div
              className="border rounded d-flex flex-column align-items-center justify-content-center"
              style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer" }}
              onClick={() => document.getElementById('logo-upload-invoice')?.click()}
            >
              <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
              <small>Upload Logo</small>
              <input id="logo-upload-invoice" type="file" accept="image/*" hidden />
            </div>
          </Col>
          <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
            <h2 className="text-success mb-0">INVOICE</h2>
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
                value={formData.invoice.companyName}
                onChange={(e) => handleChange("invoice", "companyName", e.target.value)}
                placeholder="Your Company Name"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="text"
                value={formData.invoice.companyAddress}
                onChange={(e) => handleChange("invoice", "companyAddress", e.target.value)}
                placeholder="Company Address, City, State, Pincode"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="email"
                value={formData.invoice.companyEmail}
                onChange={(e) => handleChange("invoice", "companyEmail", e.target.value)}
                placeholder="Company Email"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="text"
                value={formData.invoice.companyPhone}
                onChange={(e) => handleChange("invoice", "companyPhone", e.target.value)}
                placeholder="Phone No."
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-end">
            <div className="d-flex flex-column gap-2 text-end" style={{ maxWidth: "400px", width: "100%" }}>

              {/* Invoice No (Auto or Manual) */}
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
                    value={formData.invoice.invoiceNo}
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
                    value={formData.invoice.manualInvoiceNo || ""}
                    onChange={(e) => handleChange("invoice", "manualInvoiceNo", e.target.value)}
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
              {/* Challan No (Auto from DC) */}
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
                    Challan No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.invoice.challanNo}
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

              {/* Manual Challan No (Optional) */}
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
                    Manual Challan No (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.invoice.manualChallanNo || ""}
                    onChange={(e) => handleChange("invoice", "manualChallanNo", e.target.value)}
                    placeholder="e.g. DC-CUST-001"
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
              {/* Due Date */}
              <Form.Group>
                <Form.Label className="mb-0" style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                  Due Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={formData.invoice.dueDate}
                  onChange={(e) => handleChange("invoice", "dueDate", e.target.value)}
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

        {/* Bill To & Customer Info */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={6} className="d-flex flex-column align-items-start">
            <h5>BILL TO</h5>
            <Form.Group className="mb-2 w-100">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Form.Control
                  type="text"
                  value={formData.invoice.customerName}
                  onChange={(e) => handleChange("invoice", "customerName", e.target.value)}
                  placeholder="Customer Name"
                  className="form-control-no-border"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", marginRight: '5px' }}
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowModal(true)} // ✅ Open modal
                  title="Add Customer"
                >
                  Add Customer
                </Button>
              </div>
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.invoice.customerAddress}
                onChange={(e) => handleChange("invoice", "customerAddress", e.target.value)}
                placeholder="Customer Address"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="email"
                value={formData.invoice.customerEmail}
                onChange={(e) => handleChange("invoice", "customerEmail", e.target.value)}
                placeholder="Email"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="text"
                value={formData.invoice.customerPhone}
                onChange={(e) => handleChange("invoice", "customerPhone", e.target.value)}
                placeholder="Phone"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-end">
            <h5>SHIP TO</h5>
            <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.invoice.shipToName || ""}
                  onChange={(e) => handleChange("invoice", "shipToName", e.target.value)}
                  placeholder="Name"
                  className="form-control-no-border text-end"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.invoice.shipToAddress || ""}
                  onChange={(e) => handleChange("invoice", "shipToAddress", e.target.value)}
                  placeholder="Address"
                  className="form-control-no-border text-end"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="email"
                  value={formData.invoice.shipToEmail || ""}
                  onChange={(e) => handleChange("invoice", "shipToEmail", e.target.value)}
                  placeholder="Email"
                  className="form-control-no-border text-end"
                  style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", textAlign: "right" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.invoice.shipToPhone || ""}
                  onChange={(e) => handleChange("invoice", "shipToPhone", e.target.value)}
                  placeholder="Phone"
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
        <div className="mt-4">{renderItemsTable('invoice')}</div>

        {/* Totals - Moved to left side */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td className="fw-bold">Sub Total:</td>
                  <td>${calculateTotalAmount(formData.invoice.items).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Total Due:</td>
                  <td className="fw-bold">${calculateTotalAmount(formData.invoice.items).toFixed(2)}</td>
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
            rows={3}
            value={formData.invoice.terms}
            onChange={(e) => handleChange("invoice", "terms", e.target.value)}
            placeholder="e.g. Payment within 15 days. Late fees may apply."
            style={{ border: "1px solid #343a40" }}
          />
        </Form.Group>

        {/* Attachment Fields */}
        {renderAttachmentFields("invoice")}

        {/* Footer Note */}
        <Row className="text-center mt-5 mb-4 pt-3">
          <Col>
            <Form.Control
              type="text"
              value={formData.invoice.footerNote}
              onChange={(e) => handleChange("invoice", "footerNote", e.target.value)}
              className="text-center mb-2 fw-bold"
              placeholder=" Thank you for your business!"
            />
          </Col>
        </Row>

        {/* Navigation */}
        <div className="d-flex justify-content-between mt-4 border-top pt-3">
          <Button variant="secondary" onClick={handleSkip}>Skip</Button>
          <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
          <Button variant="primary" onClick={handleSaveNext}>Save & Next</Button>
          <Button variant="success" onClick={handleNext}>Next</Button>
        </div>
      </Form>

      <AddEditCustomerModal
        show={showModal}
        onHide={() => setShowModal(false)} // ✅ Close modal
        editMode={false}
        customerFormData={{}}
        setCustomerFormData={() => { }} // Will be initialized inside modal
        onSave={handleSave}
        customerId={null}
        keyboard={false}
      />
    </>
  );
};

export default InvoiceTab;