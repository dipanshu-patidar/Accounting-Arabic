// src/components/AddCustomerModal.jsx

import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const accountTypes = [
  "Current Assets",
  "Current Liabilities",
  "Misc. Expenses",
  "Misc. Income",
  "Loans (Liability)",
  "Loans & Advances",
  "Fixed Assets",
  "Investments",
  "Bank OD A/C",
  "Deposits (Assets)",
  "Provisions",
  "Reserves & Surplus",
  "Cash-in-hand",
  "Bank A/Cs",
  "Sundry Debtors",
  "Sundry Creditors",
  "Purchases A/C",
  "Purchases Return",
  "Sales A/C",
  "Sales Return",
  "Capital A/C",
  "Direct Expenses",
  "Indirect Expenses",
];

const AddCustomerModal = ({
  show,
  onHide,
  formData,
  setFormData,
  handleSave,
  title = "Add Customer",
}) => {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Name */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Account Type + Name + Balance Type */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Account Type</Form.Label>
                <Form.Select
                  value={formData.accountType}
                  onChange={(e) =>
                    setFormData({ ...formData, accountType: e.target.value })
                  }
                >
                  {accountTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Account Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.accountName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                  placeholder="e.g., Accounts Receivable"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Balance Type</Form.Label>
                <Form.Control
                  type="text"
                  value="Debit"
                  readOnly
                  disabled
                  style={{ backgroundColor: "#f8f9fa", fontWeight: "500" }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Opening & Current Balance */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Opening Balance</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.payable}
                  onChange={(e) =>
                    setFormData({ ...formData, payable: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Current Balance</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.currentBalance}
                  onChange={(e) =>
                    setFormData({ ...formData, currentBalance: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Date & Bank */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Creation Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.creationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, creationDate: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Bank Account Number</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, bankAccountNumber: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Bank IFSC</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.bankIFSC}
                  onChange={(e) =>
                    setFormData({ ...formData, bankIFSC: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Bank Name & Branch</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Address */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Pincode</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>State Code</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.stateCode}
                  onChange={(e) =>
                    setFormData({ ...formData, stateCode: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Shipping Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.shippingAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingAddress: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Contact */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Credit Period (days)</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.creditPeriod}
                  onChange={(e) =>
                    setFormData({ ...formData, creditPeriod: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>GSTIN</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.gstin}
                  onChange={(e) =>
                    setFormData({ ...formData, gstin: e.target.value })
                  }
                  placeholder="22AAAAA0000A1Z5"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          style={{ backgroundColor: "#53b2a5", border: "none" }}
          onClick={handleSave}
        >
          Save Customer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddCustomerModal;