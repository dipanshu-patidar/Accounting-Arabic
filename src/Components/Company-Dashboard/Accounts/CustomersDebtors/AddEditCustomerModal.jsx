import React, { useState, useEffect } from "react";
import { Button, Col, Form, Modal, Row, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GetCompanyId from "../../../../Api/GetCompanyId";
import axiosInstance from "../../../../Api/axiosInstance";

const AddEditCustomerModal = ({
  show,
  onHide,
  onExited,
  editMode,
  customerFormData,
  setCustomerFormData,
  onSave,
  customerId,
}) => {
  const companyId = GetCompanyId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (!show) return;

    if (!editMode) {
      setCustomerFormData({
        nameEnglish: "",
        nameArabic: "",
        companyName: "",
        googleLocation: "",
        idCardImage: null,
        anyFile: null,
        accountName: "",
        accountBalance: "0.00",
        accountType: "Sundry Debtors", // Added account type
        accountBalanceType: "Debit", // Added balance type
        creationDate: new Date().toISOString().split("T")[0],
        bankAccountNumber: "",
        bankIfsc: "",
        bankNameBranch: "",
        country: "",
        state: "",
        pincode: "",
        address: "",
        stateCode: "",
        shippingAddress: "",
        phone: "",
        email: "",
        creditPeriodDays: "",
        enableGst: false,
        gstin: "",
      });
      setOriginalData(null);
      setError(null);
    } else if (editMode && customerId) {
      const fetchCustomerData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axiosInstance.get(
            `/vendorCustomer/${customerId}`
          );

          if (response.data.success && response.data.data) {
            const customer = response.data.data;
            setOriginalData(customer);
            setCustomerFormData({
              nameEnglish: customer.name_english || "",
              nameArabic: customer.name_arabic || "",
              companyName: customer.company_name || "",
              googleLocation: customer.google_location || "",
              idCardImage: null,
              anyFile: null,
              accountName: customer.account_name || "",
              accountBalance: customer.account_balance?.toString() || "0.00",
              accountType: customer.account_type || "Sundry Debtors", // Added account type
              accountBalanceType: customer.account_balance_type || "Debit", // Added balance type
              creationDate: customer.creation_date
                ? new Date(customer.creation_date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              bankAccountNumber: customer.bank_account_number || "",
              bankIfsc: customer.bank_ifsc || "",
              bankNameBranch: customer.bank_name_branch || "",
              country: customer.country || "",
              state: customer.state || "",
              pincode: customer.pincode || "",
              address: customer.address || "",
              stateCode: customer.state_code || "",
              shippingAddress: customer.shipping_address || "",
              phone: customer.phone || "",
              email: customer.email || "",
              creditPeriodDays: customer.credit_period_days?.toString() || "",
              enableGst: customer.enable_gst === true,
              gstin: customer.gstIn || "",
            });
          } else {
            setError("Failed to load customer data.");
            toast.error("Failed to load customer data.");
          }
        } catch (err) {
          console.error("Error fetching customer:", err);
          setError("Error loading customer. Please try again.");
          toast.error("Error loading customer. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchCustomerData();
    }
  }, [editMode, show, customerId, setCustomerFormData]);

  const handleSaveCustomer = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("company_id", companyId);
      formData.append("name_english", customerFormData.nameEnglish);
      formData.append("name_arabic", customerFormData.nameArabic);
      formData.append("company_name", customerFormData.companyName);
      formData.append("google_location", customerFormData.googleLocation);
      formData.append("account_name", customerFormData.accountName);
      formData.append("account_balance", customerFormData.accountBalance);
      formData.append("account_type", customerFormData.accountType); // Added account type
      formData.append("account_balance_type", customerFormData.accountBalanceType); // Added balance type

      // ✅ FIX: Convert "YYYY-MM-DD" to ISO 8601 datetime string
      const creationDateISO = new Date(customerFormData.creationDate).toISOString();
      formData.append("creation_date", creationDateISO);

      formData.append("bank_account_number", customerFormData.bankAccountNumber);
      formData.append("bank_ifsc", customerFormData.bankIfsc);
      formData.append("bank_name_branch", customerFormData.bankNameBranch);
      formData.append("country", customerFormData.country);
      formData.append("state", customerFormData.state);
      formData.append("pincode", customerFormData.pincode);
      formData.append("address", customerFormData.address);
      formData.append("state_code", customerFormData.stateCode);
      formData.append("shipping_address", customerFormData.shippingAddress);
      formData.append("phone", customerFormData.phone);
      formData.append("email", customerFormData.email);
      formData.append("credit_period_days", customerFormData.creditPeriodDays || "0");
      formData.append("enable_gst", customerFormData.enableGst ? "1" : "0");
      formData.append("gstIn", customerFormData.gstin);

      // ✅ CRITICAL: Add type = customer so backend recognizes it
      formData.append("type", "customer");

      if (
        customerFormData.idCardImage &&
        customerFormData.idCardImage instanceof File
      ) {
        if (!validateImageFile(customerFormData.idCardImage)) {
          setError(
            "Invalid ID card image. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
          );
          toast.error(
            "Invalid ID card image. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
          );
          setIsSubmitting(false);
          return;
        }
        formData.append("id_card_image", customerFormData.idCardImage);
      }

      if (
        customerFormData.anyFile &&
        customerFormData.anyFile instanceof File
      ) {
        if (customerFormData.anyFile.type.match("image.*")) {
          if (!validateImageFile(customerFormData.anyFile)) {
            setError(
              "Invalid image file. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
            );
            toast.error(
              "Invalid image file. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
            );
            setIsSubmitting(false);
            return;
          }
        }
        formData.append("any_file", customerFormData.anyFile);
      }

      let response;
      if (editMode && customerId) {
        response = await axiosInstance.put(
          `/vendorCustomer/${customerId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        response = await axiosInstance.post("/vendorCustomer", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        onSave(response.data.data, editMode ? "edit" : "add");
        onHide();
        toast.success(
          editMode ? "Customer updated successfully!" : "Customer added successfully!"
        );
      } else {
        const msg = response.data.message || "Error saving customer";
        setError(msg);
        toast.error(msg);
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while saving customer";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateImageFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) return false;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) return false;
    return true;
  };

  const handleIdCardImageChange = (e) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.match("image.*")) {
        setError("Please select an image file for ID card");
        toast.error("Please select an image file for ID card");
        return;
      }
      if (!validateImageFile(file)) {
        setError(
          "Invalid ID card image. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
        );
        toast.error(
          "Invalid ID card image. Please upload a valid image file (JPEG, PNG, or JPG under 5MB)."
        );
        return;
      }
      setCustomerFormData({
        ...customerFormData,
        idCardImage: file,
      });
    }
  };

  const handleAnyFileChange = (e) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomerFormData({
        ...customerFormData,
        anyFile: file,
      });
    }
  };

  const handleAccountTypeChange = (e) => {
    const selectedType = e.target.value;
    setCustomerFormData({
      ...customerFormData,
      accountType: selectedType,
      // Update balance type based on account type
      accountBalanceType: selectedType === "Sundry Debtors" || selectedType === "Current Assets" ||
        selectedType === "Loans & Advances" || selectedType === "Fixed Assets" ||
        selectedType === "Investments" || selectedType === "Deposits (Assets)"
        ? "Debit" : "Credit"
    });
  };

  return (
    <Modal show={show} onHide={onHide} onExited={onExited} size="xl" centered backdrop="static" className="customer-modal">
      <Modal.Header closeButton className="modal-header-custom" style={{ background: "linear-gradient(135deg, #505ece 0%, #3d47b8 100%)", color: "white" }}>
        <Modal.Title style={{ color: "white" }}>{editMode ? "Edit Customer" : "Add Customer"}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        {error && <Alert variant="danger">{error}</Alert>}
        {isLoading && <Alert variant="info">Loading customer data...</Alert>}

        <Form>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Name (English)</Form.Label>
                <Form.Control
                  type="text"
                  value={customerFormData.nameEnglish}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomerFormData({
                      ...customerFormData,
                      nameEnglish: value,
                      accountName:
                        customerFormData.accountName === customerFormData.nameEnglish
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
                  value={customerFormData.googleLocation}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      googleLocation: e.target.value,
                    })
                  }
                  placeholder="Enter Google Maps link"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Profile Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/jpeg, image/png, image/jpg"
                  onChange={handleIdCardImageChange}
                />
                {editMode && originalData?.id_card_image && (
                  <div className="mt-2">
                    <small className="text-muted">Previously uploaded</small>
                    <div>
                      <a
                        href={originalData.id_card_image.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        View ID Image
                      </a>
                    </div>
                  </div>
                )}
                <Form.Text className="text-muted">
                  JPEG, PNG or JPG (max 5MB)
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Any File</Form.Label>
                <Form.Control type="file" onChange={handleAnyFileChange} />
                {editMode && originalData?.any_file && (
                  <div className="mt-2">
                    <small className="text-muted">Previously uploaded</small>
                    <div>
                      <a
                        href={originalData.any_file.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        View File
                      </a>
                    </div>
                  </div>
                )}
                <Form.Text className="text-muted">
                  Any file type. If image, max 5MB
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Account Type</Form.Label>
                <Form.Select
                  value={customerFormData.accountType}
                  onChange={handleAccountTypeChange}
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
                  value={customerFormData.accountBalanceType}
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
                  value={customerFormData.bankIfsc}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      bankIfsc: e.target.value,
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
                  value={customerFormData.bankNameBranch}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      bankNameBranch: e.target.value,
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
                  value={customerFormData.creditPeriodDays}
                  onChange={(e) =>
                    setCustomerFormData({
                      ...customerFormData,
                      creditPeriodDays: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="d-flex align-items-center">
                {customerFormData.enableGst && (
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
                  <Form.Label className="me-2">Enable GST</Form.Label>
                  <Form.Check
                    type="switch"
                    id="gstin-toggle"
                    checked={customerFormData.enableGst}
                    onChange={(e) =>
                      setCustomerFormData({
                        ...customerFormData,
                        enableGst: e.target.checked,
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
      <Modal.Footer className="modal-footer-custom">
        <Button 
          variant="secondary" 
          onClick={onHide} 
          disabled={isLoading}
          style={{
            backgroundColor: "#6c757d",
            borderColor: "#6c757d",
            color: "white",
            padding: "8px 18px",
            borderRadius: "8px",
            fontWeight: "600",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            if (isLoading) return;
            e.currentTarget.style.backgroundColor = "#5a6268";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(108, 117, 125, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#6c757d";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Cancel
        </Button>
        <Button
          style={{ 
            backgroundColor: "#505ece", 
            borderColor: "#505ece",
            border: "none",
            color: "white",
            padding: "8px 18px",
            borderRadius: "8px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            opacity: (isSubmitting || isLoading) ? 0.6 : 1
          }}
          onClick={handleSaveCustomer}
          disabled={isSubmitting || isLoading}
          onMouseEnter={(e) => {
            if (isSubmitting || isLoading) return;
            e.currentTarget.style.backgroundColor = "#3d47b8";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(80, 94, 206, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#505ece";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {isSubmitting
            ? "Saving..."
            : editMode
              ? "Update Customer"
              : "Save Customer"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddEditCustomerModal;