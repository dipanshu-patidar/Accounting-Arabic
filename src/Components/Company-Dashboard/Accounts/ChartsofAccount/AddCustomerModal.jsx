import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import axios from "axios";
import BaseUrl from "../../../../Api/BaseUrl";
import axiosInstance from "../../../../Api/axiosInstance";
import GetCompanyId from "../../../../Api/GetCompanyId";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddCustomerModal = ({ show, onHide, onSave, customerFormData, setCustomerFormData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const companyId = GetCompanyId();

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Create FormData object to handle file uploads
      const formData = new FormData();
      
      // Add all form fields to FormData with updated field names
      formData.append('company_id', companyId);
      formData.append('name_english', customerFormData.name || '');
      formData.append('name_arabic', customerFormData.nameArabic || '');
      formData.append('company_name', customerFormData.companyName || '');
      formData.append('google_location', customerFormData.companyLocation || ''); // Changed field name
      formData.append('account_type', 'Sundry Debtors');
      formData.append('balance_type', 'Debit');
      formData.append('account_name', customerFormData.accountName || '');
      formData.append('account_balance', customerFormData.accountBalance || '0.00');
      formData.append('creation_date', customerFormData.creationDate || '');
      formData.append('bank_account_number', customerFormData.bankAccountNumber || '');
      formData.append('bank_ifsc', customerFormData.bankIFSC || '');
      formData.append('bank_name_branch', customerFormData.bankName || ''); // Changed field name
      formData.append('country', customerFormData.country || '');
      formData.append('state', customerFormData.state || '');
      formData.append('pincode', customerFormData.pincode || '');
      formData.append('address', customerFormData.address || '');
      formData.append('state_code', customerFormData.stateCode || '');
      formData.append('shipping_address', customerFormData.shippingAddress || '');
      formData.append('phone', customerFormData.phone || '');
      formData.append('email', customerFormData.email || '');
      formData.append('credit_period_days', customerFormData.creditPeriod || ''); // Changed field name
      formData.append('enable_gst', customerFormData.gstEnabled); // Changed field name
      formData.append('gstIn', customerFormData.gstin || ''); // Changed field name
      formData.append('type', 'customer'); // Added default type
      
      // Add files if they exist
      if (customerFormData.idCardImage) {
        formData.append('id_card_image', customerFormData.idCardImage);
      }
      
      if (customerFormData.extraFile) {
        formData.append('any_file', customerFormData.extraFile); // Changed field name
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
      toast.success('Customer added successfully!');
      
      // Reset form after successful submission
      setCustomerFormData({
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
      console.error('Error saving customer:', error);
      // Show error toast
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add customer. Please try again.');
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
        size="xl"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Add Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Name (English)</Form.Label>
                  <Form.Control
                    type="text"
                    value={customerFormData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomerFormData({
                        ...customerFormData,
                        name: value,
                        accountName: customerFormData.name === customerFormData.accountName 
                          ? value 
                          : customerFormData.accountName,
                      });
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Name (Arabic)</Form.Label>
                  <Form.Control
                    type="text"
                    value={customerFormData.nameArabic}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.companyName}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.companyLocation}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                      setCustomerFormData({
                        ...customerFormData,
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
                      setCustomerFormData({
                        ...customerFormData,
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
                    value="Debit"
                    readOnly
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
                    value={customerFormData.accountName}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.accountBalance}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.creationDate}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.bankAccountNumber}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.bankIFSC}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.bankName}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.country}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.state}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.pincode}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.address}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.stateCode}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.shippingAddress}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.phone}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.email}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
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
                    value={customerFormData.creditPeriod}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
                        creditPeriod: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="d-flex align-items-center">
                  {customerFormData.gstEnabled && (
                    <div className="flex-grow-1 me-3">
                      <Form.Label>GSTIN</Form.Label>
                      <Form.Control
                        type="text"
                        value={customerFormData.gstin}
                        onChange={(e) =>
                          setCustomerFormData({
                            ...customerFormData,
                            gstin: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  <div>
                    <Form.Label className="me-2">Enable</Form.Label>
                    <Form.Check
                      type="switch"
                      id="gstin-toggle"
                      checked={customerFormData.gstEnabled}
                      onChange={(e) =>
                        setCustomerFormData({
                          ...customerFormData,
                          gstEnabled: e.target.checked,
                          gstin: e.target.checked ? customerFormData.gstin : "",
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
            {isSubmitting ? 'Saving...' : 'Save Customer'}
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

export default AddCustomerModal;