import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import axios from "axios";
import BaseUrl from "../../../../Api/BaseUrl";
import axiosInstance from "../../../../Api/axiosInstance";
import GetCompanyId from "../../../../Api/GetCompanyId";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddVendorModal = ({ show, onHide, onExited, onSave, vendorFormData, setVendorFormData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const companyId = GetCompanyId();

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Create FormData object to handle file uploads
      const formData = new FormData();

      // Add all form fields to FormData with updated field names
      formData.append('company_id', companyId);
      formData.append('name_english', vendorFormData.name || '');
      formData.append('name_arabic', vendorFormData.nameArabic || '');
      formData.append('company_name', vendorFormData.companyName || '');
      formData.append('google_location', vendorFormData.companyLocation || '');
      formData.append('account_type', 'Current'); // Changed from "Sundry Creditors"
      formData.append('balance_type', 'Credit');
      formData.append('account_name', vendorFormData.accountName || '');
      formData.append('account_balance', vendorFormData.accountBalance || '0.00');
      formData.append('creation_date', vendorFormData.creationDate || '');
      formData.append('bank_account_number', vendorFormData.bankAccountNumber || '');
      formData.append('bank_ifsc', vendorFormData.bankIFSC || '');
      formData.append('bank_name_branch', vendorFormData.bankName || ''); // Changed field name
      formData.append('country', vendorFormData.country || '');
      formData.append('state', vendorFormData.state || '');
      formData.append('pincode', vendorFormData.pincode || '');
      formData.append('address', vendorFormData.address || '');
      formData.append('state_code', vendorFormData.stateCode || '');
      formData.append('shipping_address', vendorFormData.shippingAddress || '');
      formData.append('phone', vendorFormData.phone || '');
      formData.append('email', vendorFormData.email || '');
      formData.append('credit_period_days', vendorFormData.creditPeriod || ''); // Changed field name
      formData.append('enable_gst', vendorFormData.gstEnabled); // Changed field name
      formData.append('gstIn', vendorFormData.gstin || ''); // Changed field name
      formData.append('type', 'vender'); // Added default type

      // Add files if they exist
      if (vendorFormData.idCardImage) {
        formData.append('id_card_image', vendorFormData.idCardImage);
      }

      if (vendorFormData.extraFile) {
        formData.append('any_file', vendorFormData.extraFile); // Changed field name
      }

      // Make API call
      const response = await axiosInstance.post(`${BaseUrl}vendorCustomer`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Call onSave callback with response data
      onSave(response.data);

      // Show success toast
      toast.success('Vendor added successfully!');

      // Reset form after successful submission
      setVendorFormData({
        name: '',
        nameArabic: '',
        companyName: '',
        companyLocation: '',
        accountName: '',
        accountBalance: '0.00',
        creationDate: '',
        bankAccountNumber: '',
        bankIFSC: '',
        bankName: '',
        country: '',
        state: '',
        pincode: '',
        address: '',
        stateCode: '',
        shippingAddress: '',
        phone: '',
        email: '',
        creditPeriod: '',
        gstEnabled: false,
        gstin: '',
        idCardImage: null,
        extraFile: null,
      });

      // Close modal
      onHide();

    } catch (error) {
      console.error('Error saving vendor:', error);
      // Show error toast
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add vendor. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        onExited={onExited}
        size="xl"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Add Vendor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Name (English)</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setVendorFormData({
                        ...vendorFormData,
                        name: value,
                        accountName:
                          vendorFormData.name === vendorFormData.accountName || !vendorFormData.accountName
                            ? value
                            : vendorFormData.accountName,
                      });
                    }}
                    placeholder="Enter vendor name"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Name (Arabic)</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.nameArabic}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        nameArabic: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.companyName}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        companyName: e.target.value,
                      })
                    }
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
                    value={vendorFormData.companyLocation}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        companyLocation: e.target.value,
                      })
                    }
                    placeholder="Add Location"
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
                      setVendorFormData({
                        ...vendorFormData,
                        idCardImage: e.target.files[0],
                      })
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
                      setVendorFormData({
                        ...vendorFormData,
                        extraFile: e.target.files[0],
                      })
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
                    style={{ backgroundColor: "#fff" }}
                  >
                    <option value="Cash-in-hand">Cash-in-hand</option>
                    <option value="Bank A/Cs">Bank A/Cs</option>
                    <option value="Sundry Debtors">Sundry Debtors</option>
                    <option value="Sundry Creditors">Sundry Creditors</option>
                    <option value="Purchases A/C">Purchases A/C</option>
                    <option value="Purchases Return">Purchases Return</option>
                    <option value="Sales A/C">Sales A/C</option>
                    <option value="Sales Return">Sales Return</option>
                    <option value="Capital A/C">Capital A/C</option>
                    <option value="Direct Expenses">Direct Expenses</option>
                    <option value="Indirect Expenses">Indirect Expenses</option>
                    <option value="Direct Income">Direct Income</option>
                    <option value="Indirect Income">Indirect Income</option>
                    <option value="Current Assets">Current Assets</option>
                    <option value="Current Liabilities">Current Liabilities</option>
                    <option value="Misc. Expenses">Misc. Expenses</option>
                    <option value="Misc. Income">Misc. Income</option>
                    <option value="Loans (Liability)">Loans (Liability)</option>
                    <option value="Loans & Advances">Loans & Advances</option>
                    <option value="Fixed Assets">Fixed Assets</option>
                    <option value="Investments">Investments</option>
                    <option value="Bank OD A/C">Bank OD A/C</option>
                    <option value="Deposits (Assets)">Deposits (Assets)</option>
                    <option value="Provisions">Provisions</option>
                    <option value="Reserves & Surplus">Reserves & Surplus</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Balance Type</Form.Label>
                  <Form.Control
                    type="text"
                    value="Credit"
                    disabled
                    style={{ backgroundColor: "#fff" }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Account Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.accountName}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        accountName: e.target.value,
                      })
                    }
                    placeholder=""
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Account Balance</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={vendorFormData.accountBalance}
                    onChange={(e) => {
                      const value = e.target.value;
                      setVendorFormData({
                        ...vendorFormData,
                        accountBalance: value || "0.00",
                      });
                    }}
                    placeholder="Enter account balance"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Creation Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={vendorFormData.creationDate}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        creationDate: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Bank Account Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.bankAccountNumber}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        bankAccountNumber: e.target.value,
                      })
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
                    value={vendorFormData.bankIFSC}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        bankIFSC: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Bank Name & Branch</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.bankName}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        bankName: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.country}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        country: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.state}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        state: e.target.value,
                      })
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
                    value={vendorFormData.pincode}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        pincode: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.address}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        address: e.target.value,
                      })
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
                    value={vendorFormData.stateCode}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        stateCode: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Shipping Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.shippingAddress}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        shippingAddress: e.target.value,
                      })
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
                    value={vendorFormData.phone}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        phone: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={vendorFormData.email}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        email: e.target.value,
                      })
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
                    value={vendorFormData.creditPeriod}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        creditPeriod: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="d-flex align-items-center">
                  {vendorFormData.gstEnabled && (
                    <div className="flex-grow-1 me-3">
                      <Form.Label>GSTIN</Form.Label>
                      <Form.Control
                        type="text"
                        value={vendorFormData.gstin}
                        onChange={(e) =>
                          setVendorFormData({
                            ...vendorFormData,
                            gstin: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  <div>
                    <Form.Label className="me-2">Enable GST</Form.Label>
                    <Form.Check
                      type="switch"
                      id="gstin-toggle"
                      checked={vendorFormData.gstEnabled}
                      onChange={(e) =>
                        setVendorFormData({
                          ...vendorFormData,
                          gstEnabled: e.target.checked,
                          gstin: e.target.checked ? vendorFormData.gstin : "",
                        })
                      }
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={onHide}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: "#53b2a5", border: "none" }}
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Vendor'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default AddVendorModal;