import React, { useState } from "react";
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
} from "react-bootstrap";

// Utility: Generate Google Maps link
const getGoogleMapsLink = (companyName) =>
  companyName ? `https://maps.google.com/?q=${encodeURIComponent(companyName)}` : "";

// Predefined accounts data
const predefinedAccounts = {
  "Sundry Creditors": [
    "Accounts Payable",
    "Bills Payable",
    "Supplier A",
    "Supplier B",
    "Creditors Control",
  ],
  "Loans (Liability)": ["Bank Loan", "Overdraft", "Other Loans"],
  "Direct Expenses": ["Electricity", "Rent", "Salaries"],
  // Add more as needed
};

const AddVendorModal = ({ show, onHide, isStandalone = false }) => {
  const [vendorFormData, setVendorFormData] = useState({
    name: "",
    nameArabic: "",
    companyName: "",
    companyLocation: "",
    idCardImage: null,
    extraFile: null,
    accountType: "Sundry Creditors",
    accountName: "",
    balanceType: "",
    payable: "",
    currentBalance: "",
    creationDate: "",
    bankAccountNumber: "",
    bankIFSC: "",
    bankName: "",
    country: "",
    state: "",
    pincode: "",
    address: "",
    stateCode: "",
    shippingAddress: "",
    phone: "",
    email: "",
    creditPeriod: "",
    gstin: "",
    gstEnabled: true,
    gstType: "Registered",
    taxEnabled: true,
    taxNumber: "",
  });

  const handleSave = () => {
    console.log("Vendor Saved:", vendorFormData);
    if (!isStandalone && onHide) onHide();
  };

  // Use Fragment when standalone, Modal when inside modal
  const Wrapper = isStandalone ? React.Fragment : Modal;

  // Only pass Modal-specific props if not standalone
  const wrapperProps = isStandalone
    ? {}
    : { show, onHide, size: "xl", centered, backdrop: "static" };

  return (
    <Wrapper {...wrapperProps}>
      {/* Header: Only if not standalone */}
      {!isStandalone && (
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Add Vendor</Modal.Title>
        </Modal.Header>
      )}

      {/* Body */}
      
        {!isStandalone ? (
          <Modal.Body>
            <FormVendorContent
              formData={vendorFormData}
              setFormData={setVendorFormData}
              getGoogleMapsLink={getGoogleMapsLink}
              predefinedAccounts={predefinedAccounts}
            />
          </Modal.Body>
        ) : (
          <FormVendorContent
            formData={vendorFormData}
            setFormData={setVendorFormData}
            getGoogleMapsLink={getGoogleMapsLink}
            predefinedAccounts={predefinedAccounts}
          />
        )}
    

      {/* Footer: Only if not standalone */}
      {!isStandalone && (
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button style={{ backgroundColor: "#53b2a5", border: "none" }} onClick={handleSave}>
            Save Vendor
          </Button>
        </Modal.Footer>
      )}
    </Wrapper>
  );
};

// ✅ Reusable Form Component
const FormVendorContent = ({
  formData,
  setFormData,
  getGoogleMapsLink,
  predefinedAccounts,
}) => {
  return (
    <Form>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Name (English)</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Name (Arabic)</Form.Label>
            <Form.Control
              type="text"
              value={formData.nameArabic}
              onChange={(e) =>
                setFormData({ ...formData, nameArabic: e.target.value })
              }
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Company Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.companyName}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  companyName: name,
                  companyLocation: getGoogleMapsLink(name),
                });
              }}
              placeholder="Enter company name"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Company Google Location</Form.Label>
            <Form.Control
              type="text"
              value={formData.companyLocation}
              placeholder="Add location"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>ID Card Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, idCardImage: e.target.files[0] })
              }
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Any File</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) =>
                setFormData({ ...formData, extraFile: e.target.files[0] })
              }
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Account Type</Form.Label>
            <Form.Select
              value={formData.accountType}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  accountType: e.target.value,
                  accountName: "", // reset account name
                });
              }}
            >
              <option value="">Select Account Type</option>
              {Object.keys(predefinedAccounts).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Account Name</Form.Label>
            <Form.Select
              value={formData.accountName}
              onChange={(e) =>
                setFormData({ ...formData, accountName: e.target.value })
              }
              disabled={!formData.accountType}
            >
              <option value="">Select Account Name</option>
              {formData.accountType &&
                predefinedAccounts[formData.accountType].map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Balance Type</Form.Label>
            <Form.Select
              value={formData.balanceType}
              onChange={(e) =>
                setFormData({ ...formData, balanceType: e.target.value })
              }
            >
              <option value="">Select Type</option>
              <option value="Debit">Debit</option>
              <option value="Credit">Credit</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Opening Balance</Form.Label>
            <Form.Control
              type="number"
              value={formData.payable}
              onChange={(e) =>
                setFormData({ ...formData, payable: e.target.value })
              }
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Current Balance</Form.Label>
            <Form.Control
              type="number"
              value={formData.currentBalance}
              onChange={(e) =>
                setFormData({ ...formData, currentBalance: e.target.value })
              }
            />
          </Form.Group>
        </Col>
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
      </Row>

      {/* Bank Details */}
      <Row className="mb-3">
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
      </Row>

      <Row className="mb-3">
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

      {/* Address Fields */}
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
              type="text"
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
              type="text"
              value={formData.shippingAddress}
              onChange={(e) =>
                setFormData({ ...formData, shippingAddress: e.target.value })
              }
            />
          </Form.Group>
        </Col>
      </Row>

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
          <Form.Group className="d-flex align-items-center">
            <div className="flex-grow-1 me-3">
              <Form.Label>GSTIN</Form.Label>
              <Form.Control
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              /> </div>

            {/* On/Off Toggle */}
            <div>
              <Form.Label className="me-2 ">Enable</Form.Label>
              <Form.Check
                type="switch"
                id="gstin-toggle"
                checked={formData.gstEnabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gstEnabled: e.target.checked,
                  })
                }
              />
            </div>
          </Form.Group>
        </Col>
      </Row>
    </Form>

  );
};

// ✅ Must export default
export default AddVendorModal;