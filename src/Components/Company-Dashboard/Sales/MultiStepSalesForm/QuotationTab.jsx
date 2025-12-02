import React, { useState, useEffect, useRef } from 'react';
import { Form, Row, Col, Button, Table, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faUserPlus, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import AddProductModal from '../../Inventory/AddProductModal';
import axiosInstance from '../../../../Api/axiosInstance';
import GetCompanyId from '../../../../Api/GetCompanyId';
import toast from 'react-hot-toast'; // Optional: for user feedback
import AddEditCustomerModal from '../../Accounts/CustomersDebtors/AddEditCustomerModal';
import BaseUrl from '../../../../Api/BaseUrl';

const QuotationTab = ({
  formData,
  handleChange,
  handleItemChange,
  addItem,
  removeItem,
  renderItemsTable,
  renderAttachmentFields,
  calculateTotalAmount,
  calculateTotalWithTaxAndDiscount,
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
  handleAddCategory,
  handleSkip,
}) => {
  const navigate = useNavigate();
  const company_id = GetCompanyId();
  const [showModal, setShowModal] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const [filteredCustomerList, setFilteredCustomerList] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const [companyInfo, setCompanyInfo] = useState({
    id: null,
    company_id: null,
    company_name: '',
    company_address: '',
    company_email: '',
    company_phone: '',
    logo_url: null,
    bank_name: '',
    account_no: '',
    account_holder: '',
    ifsc_code: '',
    notes: '',
    terms: ''
  });

  // Fetch customers and company info
  useEffect(() => {
    if (!company_id) return;

    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get(`${BaseUrl}vendorCustomer/company/${company_id}?type=customer`);
        if (response.data.success) {
          setCustomerList(response.data.data);
          setFilteredCustomerList(response.data.data);
        } else {
          toast.error('Failed to fetch customers');
        }
      } catch (err) {
        console.error('Failed to fetch customers:', err);
        toast.error('Error fetching customers');
      }
    };

    const fetchCompanies = async () => {
      try {
        const res = await axiosInstance.get(`${BaseUrl}auth/Company`);
        const companies = res?.data?.data || [];

        let selected = companies.find(c => String(c.id) === String(company_id));
        if (!selected && companies.length) selected = companies[0];

        if (selected) {
          const info = {
            id: selected.id || null,
            company_id: selected.id || null, // Assuming company ID is the same as the selected object's ID
            company_name: selected.name || '',
            company_email: selected.email || '',
            logo_url: selected.branding?.company_logo_url || '',
            company_address: selected.address || '',
            bank_name: selected.bank_details?.bank_name || '',
            account_no: selected.bank_details?.account_number || '',
            account_holder: selected.bank_details?.account_holder || '',
            ifsc_code: selected.bank_details?.ifsc_code || '',
            notes: selected.notes || '',
            terms: selected.terms_and_conditions || ''
          };
          setCompanyInfo(info);

          // Set the bank details and notes/terms to the form
          handleChange("quotation", "bankName", info.bank_name);
          handleChange("quotation", "accountNo", info.account_no);
          handleChange("quotation", "accountHolder", info.account_holder);
          handleChange("quotation", "ifsc", info.ifsc_code);
          handleChange("quotation", "notes", info.notes);
          handleChange("quotation", "terms", info.terms);
        }
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      }
    };

    fetchCustomers();
    fetchCompanies();
  }, [company_id]);

  // Filter customers based on search term
  useEffect(() => {
    const term = (customerSearchTerm || '').trim();
    if (!term) {
      setFilteredCustomerList(customerList);
      return;
    }

    const lower = term.toLowerCase();
    const digits = term.replace(/\D/g, '');

    const filtered = customerList.filter(customer => {
      const nameMatch = (customer?.name_english || '').toString().toLowerCase().includes(lower);
      const companyMatch = (customer?.company_name || '').toString().toLowerCase().includes(lower);
      const emailMatch = (customer?.email || '').toString().toLowerCase().includes(lower);
      const phoneFields = [customer?.phone, customer?.mobile, customer?.contact, customer?.phone_no, customer?.mobile_no];
      const phoneMatch = digits ? phoneFields.some(p => p && p.toString().replace(/\D/g, '').includes(digits)) : false;

      return !!(nameMatch || companyMatch || emailMatch || phoneMatch);
    });

    setFilteredCustomerList(filtered);
  }, [customerSearchTerm, customerList]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        searchRef.current && !searchRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSave = (customerData, mode) => {
    console.log(`${mode === 'edit' ? 'Updated' : 'Added'} customer:`, customerData);

    if (mode === 'add') {
      setCustomerList(prev => [...prev, customerData]);
    } else {
      setCustomerList(prev =>
        prev.map(customer =>
          customer.id === customerData.id ? customerData : customer
        )
      );
    }

    setFilteredCustomerList(prev => {
      if (mode === 'add') {
        return [...prev, customerData];
      } else {
        return prev.map(customer =>
          customer.id === customerData.id ? customerData : customer
        );
      }
    });

    toast.success(`Customer ${mode === 'edit' ? 'updated' : 'added'} successfully!`);
    setShowModal(false);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    handleChange("quotation", "billToName", customer.name_english || '');
    handleChange("quotation", "billToAddress", customer.address || '');
    handleChange("quotation", "billToEmail", customer.email || '');
    handleChange("quotation", "billToPhone", customer.phone || '');
    handleChange("quotation", "customerId", customer.id);
    setCustomerSearchTerm(customer.name_english);
    setShowCustomerDropdown(false);
  };

  // 🚀 UPDATED: POST API Function with new endpoint and payload structure
  const saveQuotation = async (status) => {
    try {
      // Calculate totals
      const subtotal = formData.quotation.items.reduce((sum, item) =>
        sum + (parseFloat(item.rate) || 0) * (parseInt(item.qty) || 0), 0);

      const taxTotal = formData.quotation.items.reduce((sum, item) => {
        const subtotalItem = (parseFloat(item.rate) || 0) * (parseInt(item.qty) || 0);
        return sum + (subtotalItem * (parseFloat(item.tax) || 0)) / 100;
      }, 0);

      const discountTotal = formData.quotation.items.reduce((sum, item) =>
        sum + (parseFloat(item.discount) || 0), 0);

      const grandTotal = calculateTotalWithTaxAndDiscount(formData.quotation.items);

      // Construct the payload according to the API response structure
      const payload = {
        company_id: company_id, // Top-level company_id for the record
        company_info: {
          id: companyInfo.id, // Assuming this comes from the fetched company details
          company_id: companyInfo.company_id, // The ID associated with the company record
          company_name: companyInfo.company_name,
          company_address: companyInfo.company_address,
          company_email: companyInfo.company_email,
          company_phone: formData.quotation.companyPhone || '',
          logo_url: companyInfo.logo_url,
          bank_name: companyInfo.bank_name,
          account_no: companyInfo.account_no,
          account_holder: companyInfo.account_holder,
          ifsc_code: companyInfo.ifsc_code,
          // Add other company_info fields as needed, but avoid duplicates with top-level
        },
        items: formData.quotation.items.map(item => ({
          // Map your form item fields to the expected API structure
          item_name: item.item_name || '',
          qty: parseFloat(item.qty) || 0,
          rate: parseFloat(item.rate) || 0,
          tax_percent: parseFloat(item.tax) || 0,
          discount: parseFloat(item.discount) || 0,
          amount: (parseFloat(item.rate) || 0) * (parseFloat(item.qty) || 0) // Calculate amount per item
        })),
        steps: [
          {
            step: "quotation",
            status: status === 'Draft' ? 'pending' : 'completed', // Use 'pending' for draft, 'completed' for final
            data: {
              // Map your form fields to the quotation step data structure
              ref_no: formData.quotation.referenceId || '',
              Manual_ref_ro: '', // Not in your form
              quotation_no: formData.quotation.quotationNo || '',
              manual_quo_no: formData.quotation.manualQuotationRef || '',
              quotation_date: formData.quotation.quotationDate || '',
              valid_till: formData.quotation.validDate || '',
              due_date: formData.quotation.validDate || '', // Using valid date as due date if needed elsewhere

              // Customer details for quotation
              qoutation_to_customer_name: formData.quotation.billToName || '',
              qoutation_to_customer_address: formData.quotation.billToAddress || '',
              qoutation_to_customer_email: formData.quotation.billToEmail || '',
              qoutation_to_customer_phone: formData.quotation.billToPhone || '',

              // Bill To Information (using customer details from form)
              bill_to: {
                attention_name: formData.quotation.billToName || '',
                company_name: formData.quotation.billToName || '', // Or a separate company name field if available
                company_address: formData.quotation.billToAddress || '',
                company_phone: formData.quotation.billToPhone || '',
                company_email: formData.quotation.billToEmail || '',
                customer_name: formData.quotation.billToName || '',
                customer_address: formData.quotation.billToAddress || '',
                customer_email: formData.quotation.billToEmail || '',
                customer_phone: formData.quotation.billToPhone || '',
              },

              // Ship To Information (using same as bill to for now, adjust if needed)
              ship_to: {
                attention_name: formData.quotation.billToName || '',
                company_name: formData.quotation.billToName || '',
                company_address: formData.quotation.billToAddress || '',
                company_phone: formData.quotation.billToPhone || '',
                company_email: formData.quotation.billToEmail || '',
                customer_name: formData.quotation.billToName || '',
                customer_address: formData.quotation.billToAddress || '',
                customer_email: formData.quotation.billToEmail || '',
                customer_phone: formData.quotation.billToPhone || '',
              },

              notes: formData.quotation.notes || '',
              terms: formData.quotation.terms || '',

              // Calculated totals
              subtotal: subtotal,
              tax: taxTotal,
              discount: discountTotal,
              total: grandTotal,

              // Status
              quotation_status: status === 'Draft' ? 'Draft' : 'Completed', // Match your form's status logic
              draft_status: status === 'Draft' ? 'Draft' : 'Final', // Match your form's status logic
            }
          },
          // Initialize other steps as pending with empty data
          {
            step: "sales_order",
            status: "pending",
            data: {
              SO_no: '', // Not in your form
              Manual_SO_ref: '', // Not in your form
              bill_to: {
                attention_name: formData.quotation.billToName || '',
                company_name: formData.quotation.billToName || '',
                company_address: formData.quotation.billToAddress || '',
                company_phone: formData.quotation.billToPhone || '',
                company_email: formData.quotation.billToEmail || '',
                customer_name: formData.quotation.billToName || '',
                customer_address: formData.quotation.billToAddress || '',
                customer_email: formData.quotation.billToEmail || '',
                customer_phone: formData.quotation.billToPhone || '',
              },
              ship_to: {
                attention_name: formData.quotation.billToName || '',
                company_name: formData.quotation.billToName || '',
                company_address: formData.quotation.billToAddress || '',
                company_phone: formData.quotation.billToPhone || '',
                company_email: formData.quotation.billToEmail || '',
                customer_name: formData.quotation.billToName || '',
                customer_address: formData.quotation.billToAddress || '',
                customer_email: formData.quotation.billToEmail || '',
                customer_phone: formData.quotation.billToPhone || '',
              },
              sales_order_status: "Pending" // Default status
            }
          },
          {
            step: "delivery_challan",
            status: "pending",
            data: {
              Challan_no: '', // Not in your form
              Manual_challan_no: '', // Not in your form
              Manual_DC_no: '', // Not in your form
              bill_to: {
                attention_name: formData.quotation.billToName || '',
                company_name: formData.quotation.billToName || '',
                company_address: formData.quotation.billToAddress || '',
                company_phone: formData.quotation.billToPhone || '',
                company_email: formData.quotation.billToEmail || '',
                customer_name: formData.quotation.billToName || '',
                customer_address: formData.quotation.billToAddress || '',
                customer_email: formData.quotation.billToEmail || '',
                customer_phone: formData.quotation.billToPhone || '',
              },
              ship_to: {
                attention_name: formData.quotation.billToName || '',
                company_name: formData.quotation.billToName || '',
                company_address: formData.quotation.billToAddress || '',
                company_phone: formData.quotation.billToPhone || '',
                company_email: formData.quotation.billToEmail || '',
                customer_name: formData.quotation.billToName || '',
                customer_address: formData.quotation.billToAddress || '',
                customer_email: formData.quotation.billToEmail || '',
                customer_phone: formData.quotation.billToPhone || '',
              },
              driver_name: '', // Not in your form
              driver_phone: '', // Not in your form
              delivery_challan_status: "Pending" // Default status
            }
          },
          {
            step: "invoice",
            status: "pending",
            data: {
              invoice_no: '', // Not in your form
              Manual_invoice_no: '', // Not in your form
              total_invoice: grandTotal, // Use the calculated grand total
              bill_to: {
                attention_name: formData.quotation.billToName || '',
                company_name: formData.quotation.billToName || '',
                company_address: formData.quotation.billToAddress || '',
                company_phone: formData.quotation.billToPhone || '',
                company_email: formData.quotation.billToEmail || '',
                customer_name: formData.quotation.billToName || '',
                customer_address: formData.quotation.billToAddress || '',
                customer_email: formData.quotation.billToEmail || '',
                customer_phone: formData.quotation.billToPhone || '',
              },
              ship_to: {
                attention_name: formData.quotation.billToName || '',
                company_name: formData.quotation.billToName || '',
                company_address: formData.quotation.billToAddress || '',
                company_phone: formData.quotation.billToPhone || '',
                company_email: formData.quotation.billToEmail || '',
                customer_name: formData.quotation.billToName || '',
                customer_address: formData.quotation.billToAddress || '',
                customer_email: formData.quotation.billToEmail || '',
                customer_phone: formData.quotation.billToPhone || '',
              },
              invoice_status: "Pending" // Default status
            }
          },
          {
            step: "payment",
            status: "pending",
            data: {
              Payment_no: '', // Not in your form
              Manual_payment_no: '', // Not in your form
              received_from: {
                customer_name: formData.quotation.billToName || '',
                customer_address: formData.quotation.billToAddress || '',
                customer_email: formData.quotation.billToEmail || '',
                customer_phone: formData.quotation.billToPhone || '',
              },
              payment_details: {
                amount_received: 0, // Not in your form
                total_amount: grandTotal, // Use the calculated grand total
                payment_status: "Pending", // Default status
                balance: grandTotal, // Not in your form
                payment_note: '' // Not in your form
              }
            }
          }
        ],
        additional_info: {
          customer_ref: formData.quotation.customerReference || '',
          signature_url: '', // Not in your form
          photo_url: '', // Not in your form
          attachment_url: '' // Not in your form
        }
      };

      // Send POST request with JSON payload to the NEW API URL
      const response = await axiosInstance.post(`${BaseUrl}sales-order/create-sales-order`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) { // Check for success field from API
        toast.success(`Quotation saved as ${status} successfully!`);
        // Optionally reset form or redirect
        // navigate('/some-path');
      } else {
        // Show more specific error message from API if available
        const errorMessage = response.data.message || 'Failed to save quotation.';
        toast.error(errorMessage);
      }

    } catch (error) {
      console.error("Error saving quotation:", error);
      // Show more detailed error message
      const errorMessage = error.response?.data?.message || error.message || 'Something went wrong while saving quotation.';
      toast.error(errorMessage);
    }
  };

  const handleSaveDraft = async () => {
    await saveQuotation('Draft');
  };

  const handleSaveNext = async () => {
    await saveQuotation('Draft');
    // Call your existing next logic if needed
    // handleNext();
  };

  const handleNext = async () => {
    await saveQuotation('Final'); // This will set status to 'completed' in the quotation step
    // Optionally navigate to next step
    // navigate('/next-step');
  };

  const formatCompanyAddress = () => {
    const parts = [
      companyInfo.company_address,
      // Add other address parts if available in companyInfo, e.g., city, state, postal code, country
    ].filter(Boolean);

    return parts.join(', ');
  };

  return (
    <>
      <Form>
        {/* Header: Logo + Company Info + Title */}
        <Row className="mb-4 mt-3">
          <Col md={3} className="d-flex align-items-center justify-content-center">
            <div
              className="border rounded d-flex flex-column align-items-center justify-content-center"
              style={{ height: "120px", width: "100%", borderStyle: "dashed", cursor: "pointer", overflow: "hidden" }}
              onClick={() => document.getElementById('logo-upload')?.click()}
            >
              {companyInfo.logo_url ? (
                <img
                  src={companyInfo.logo_url}
                  alt="Company Logo"
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                </>
              )}
              <input id="logo-upload" type="file" accept="image/*" hidden onChange={(e) => {
                if (e.target.files[0]) {
                  handleChange("quotation", "logo", e.target.files[0]);
                }
              }} />
            </div>
          </Col>

          <Col md={6}>
            <div className="d-flex flex-column gap-1">
              <Form.Control
                type="text"
                value={companyInfo.company_name || ''}
                readOnly
                placeholder="Company Name"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0", fontWeight: "bold" }}
              />
              <Form.Control
                type="text"
                value={formatCompanyAddress()}
                onChange={(e) => handleChange("quotation", "companyAddress", e.target.value)}
                placeholder="Company Address, City, State, Pincode......."
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="email"
                value={companyInfo.company_email || ''}
                readOnly
                placeholder="Company Email"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
              <Form.Control
                type="text"
                value={formData.quotation.companyPhone}
                onChange={(e) => handleChange("quotation", "companyPhone", e.target.value)}
                placeholder="Phone No........"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </div>
          </Col>

          <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
            <h2 className="text-success mb-0">QUOTATION</h2>
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

        {/* Quotation & Customer Info */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={8}>
            <h5>Quotation To</h5>
            <Form.Group className="mb-2 position-relative">
              <div className="position-relative" ref={searchRef}>
                <Form.Control
                  type="text"
                  placeholder="Search Customer..."
                  value={customerSearchTerm}
                  onChange={(e) => {
                    setCustomerSearchTerm(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => {
                    setShowCustomerDropdown(true);
                    if (!customerSearchTerm) {
                      setFilteredCustomerList(customerList);
                    }
                  }}
                />
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="position-absolute end-0 top-50 translate-middle-y me-2 text-muted"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setShowCustomerDropdown(!showCustomerDropdown);
                    if (!showCustomerDropdown && !customerSearchTerm) {
                      setFilteredCustomerList(customerList);
                    }
                  }}
                />
              </div>

              {showCustomerDropdown && filteredCustomerList.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm z-index-10"
                  style={{ maxHeight: '200px', overflowY: 'auto' }}
                >
                  {filteredCustomerList.map(customer => (
                    <div
                      key={customer.id}
                      className="p-2 hover:bg-light cursor-pointer"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="fw-bold">{customer.name_english}</div>
                      {customer.company_name && (
                        <div className="text-muted small">{customer.company_name}</div>
                      )}
                      <div className="text-muted small">{customer.email}</div>
                    </div>
                  ))}
                </div>
              )}

              {showCustomerDropdown && filteredCustomerList.length === 0 && (
                <div
                  ref={dropdownRef}
                  className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm z-index-10 p-2 text-muted"
                >
                  No customers found
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                value={formData.quotation.billToAddress}
                onChange={(e) => handleChange("quotation", "billToAddress", e.target.value)}
                placeholder="Customer Address"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="email"
                value={formData.quotation.billToEmail}
                onChange={(e) => handleChange("quotation", "billToEmail", e.target.value)}
                placeholder="Email"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                value={formData.quotation.billToPhone}
                onChange={(e) => handleChange("quotation", "billToPhone", e.target.value)}
                placeholder="Phone"
                className="form-control-no-border"
                style={{ fontSize: "1rem", lineHeight: "1.5", minHeight: "auto", padding: "0" }}
              />
            </Form.Group>
            <div className="mt-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowModal(true)}
                title="Add Customer"
              >
                Add Customer
              </Button>
            </div>
          </Col>

          <Col md={4} className="d-flex flex-column align-items-start">
            <div className="d-flex flex-column gap-2" style={{ maxWidth: "400px", width: "100%" }}>
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="mb-0" style={{ fontSize: "0.9rem", color: "#6c757d", whiteSpace: "nowrap", flexShrink: 0, marginRight: "8px" }}>
                    Quotation No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.quotation.quotationNo}
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

              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="mb-0 flex-shrink-0 me-2" style={{ fontSize: "0.9rem", color: "#6c757d", whiteSpace: "nowrap" }}>
                    Manual QUO No (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.quotation.manualQuotationRef || ""}
                    onChange={(e) => handleChange("quotation", "manualQuotationRef", e.target.value)}
                    placeholder="e.g. QUO-CUST-001"
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

              <Row className="align-items-center g-2 mb-2">
                <Col md="auto" className="p-0">
                  <Form.Label className="mb-0 flex-shrink-0 me-2" style={{ fontSize: "0.9rem", color: "#6c757d", whiteSpace: "nowrap" }}>
                    Quotation Date
                  </Form.Label>
                </Col>
                <Col className="p-0">
                  <Form.Control
                    type="date"
                    value={formData.quotation.quotationDate}
                    onChange={(e) => handleChange("quotation", "quotationDate", e.target.value)}
                    style={{ border: "1px solid #495057", fontSize: "1rem" }}
                  />
                </Col>
              </Row>

              <Row className="align-items-center g-2 mb-2">
                <Col md="auto" className="p-0">
                  <Form.Label className="mb-0 flex-shrink-0 me-2" style={{ fontSize: "0.9rem", color: "#6c757d", whiteSpace: "nowrap" }}>
                    Valid Till
                  </Form.Label>
                </Col>
                <Col className="p-0">
                  <Form.Control
                    type="date"
                    value={formData.quotation.validDate}
                    onChange={(e) => handleChange("quotation", "validDate", e.target.value)}
                    style={{ border: "1px solid #495057", fontSize: "1rem" }}
                  />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Items Table */}
        <Row className="mb-4">
          <Col>{renderItemsTable("quotation")}</Col>
        </Row>

        <hr style={{ width: "100%", height: "4px", backgroundColor: "#28a745", border: "none", marginTop: "5px", marginBottom: "10px" }} />

        {/* Totals */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td className="fw-bold">Sub Total:</td>
                  <td>
                    ${formData.quotation.items.reduce((sum, item) =>
                      sum + (parseFloat(item.rate) || 0) * (parseInt(item.qty) || 0), 0).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Tax:</td>
                  <td>
                    ${formData.quotation.items.reduce((sum, item) => {
                      const subtotal = (parseFloat(item.rate) || 0) * (parseInt(item.qty) || 0);
                      return sum + (subtotal * (parseFloat(item.tax) || 0)) / 100;
                    }, 0).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Discount:</td>
                  <td>
                    ${formData.quotation.items.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Total:</td>
                  <td className="fw-bold">
                    ${calculateTotalWithTaxAndDiscount(formData.quotation.items).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>

        <hr style={{ width: "100%", height: "4px", backgroundColor: "#28a745", border: "none", marginTop: "5px", marginBottom: "10px" }} />

        {/* Bank & Notes */}
        <Row className="mb-4">
          <h5>Bank Details</h5>
          <Col md={6} className="p-2 rounded" style={{ border: "1px solid #343a40" }}>
            {['bankName', 'accountNo', 'accountHolder', 'ifsc'].map(field => (
              <Form.Group key={field} className="mb-2">
                <Form.Control
                  type="text"
                  placeholder={{
                    bankName: 'Bank Name',
                    accountNo: 'Account No.',
                    accountHolder: 'Account Holder',
                    ifsc: 'IFSC Code',
                  }[field]}
                  value={formData.quotation[field] || ""}
                  onChange={(e) => handleChange("quotation", field, e.target.value)}
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
              value={formData.quotation.notes || ""}
              onChange={(e) => handleChange("quotation", "notes", e.target.value)}
              style={{ border: "1px solid #343a40" }}
            />
          </Col>
        </Row>

        <hr style={{ width: "100%", height: "4px", backgroundColor: "#28a745", border: "none", marginTop: "5px", marginBottom: "10px" }} />

        {/* Terms & Footer */}
        <Row className="mb-4">
          <Col>
            <Form.Group>
              <Form.Label>Terms & Conditions</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.quotation.terms}
                onChange={(e) => handleChange("quotation", "terms", e.target.value)}
                placeholder="e.g. Payment within 15 days"
                style={{ border: "1px solid #343a40" }}
              />
            </Form.Group>
          </Col>
        </Row>
        {/* Attachment Fields */}
        {renderAttachmentFields("quotation")}

        <Row className="text-center mb-4">
          <Col>
            <p><strong>Thank you for your business!</strong></p>
            <p className="text-muted">www.yourcompany.com</p>
          </Col>
        </Row>

        {/* Navigation */}
        <div className="d-flex justify-content-between mt-5">
          <Button variant="secondary" onClick={handleSkip}>Skip</Button>
          <Button variant="warning" onClick={handleSaveDraft}>Save</Button>
          <Button variant="primary" onClick={handleSaveNext}>Save & Next</Button>
          <Button variant="success" onClick={handleNext}>Next</Button>
        </div>
      </Form>
      {/* Modal */}
      <AddEditCustomerModal
        show={showModal}
        onHide={() => setShowModal(false)}
        editMode={false}
        customerFormData={{}}
        setCustomerFormData={() => { }}
        onSave={handleSave}
        customerId={null}
        keyboard={false}
      />
    </>
  );
};

export default QuotationTab;