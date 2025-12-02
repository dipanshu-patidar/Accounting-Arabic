import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Badge,
  InputGroup,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaTrash,
  FaEye,
  FaPlus,
  FaEdit,
  FaSearch,
  FaFileImport,
  FaFileExport,
  FaDownload,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import API components
import axiosInstance from "../../../../Api/axiosInstance";
import BaseUrl from "../../../../Api/BaseUrl";
import GetCompanyId from "../../../../Api/GetCompanyId";
import DeleteCustomer from "./DeleteCustomer";
import ViewCustomerModal from "./ViewCustomerModal";
import AddEditCustomerModal from "./AddEditCustomerModal";

// Empty customer template
const emptyCustomer = {
  name: "",
  contact: "",
  email: "",
  taxNumber: "",
  altMobile: "",
  balance: "",
  taxEnabled: false,
  billing: {
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
  },
  shipping: {
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
  },
};

// Account types for dropdown
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

// Allowed account names for customers
const allAccountNames = ["Cash in Hand", "Bank Account", "Accounts Receivable"];

const CustomersDebtors = () => {
  const navigate = useNavigate();

  // State for API data
  const [customersList, setCustomersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get company ID
  const companyId = GetCompanyId();

  // Modal states
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Customer form states
  const [editMode, setEditMode] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(() =>
    JSON.parse(JSON.stringify(emptyCustomer))
  );
  const [currentIndex, setCurrentIndex] = useState(null); // Only used for edit

  // 👇 NEW: Use customer ID for deletion (not index)
  const [customerIdToDelete, setCustomerIdToDelete] = useState(null);

  const [customerFormData, setCustomerFormData] = useState({
    name: "",
    nameArabic: "",
    companyName: "",
    companyLocation: "",
    idCardImage: null,
    extraFile: null,
    accountType: "Sundry Debtors",
    accountName: "",
    balanceType: "Debit",
    accountBalance: "0.00",
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
    gstType: "Registered",
    taxEnabled: true,
    taxNumber: "",
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Excel import ref
  const fileInputRef = useRef();

  // Fetch customers by company ID from API
  const fetchCustomersByCompany = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        `vendorCustomer/company/${companyId}?type=customer`
      );

      if (response?.status) {
        const transformedCustomers = response.data.data.map((apiCustomer) => {
          return {
            id: apiCustomer.id,
            name: apiCustomer.name_english,
            nameArabic: apiCustomer.name_arabic,
            companyName: apiCustomer.company_name,
            contact: apiCustomer.phone,
            email: apiCustomer.email,
            taxNumber: apiCustomer.gstIn || "",
            altMobile: "",
            balance: apiCustomer.account_balance?.toString(),
            accountBalance: apiCustomer.account_balance?.toString() || "0.00",
            taxEnabled: apiCustomer.enable_gst === true,
            accountType: apiCustomer.account_type || "Sundry Debtors",
            accountName: apiCustomer.account_name || "Accounts Receivable",
            balanceType: apiCustomer.balance_type || "Debit",
            creationDate: apiCustomer.creation_date,
            bankAccountNumber: apiCustomer.bank_account_number,
            bankIFSC: apiCustomer.bank_ifsc,
            bankName: apiCustomer.bank_name_branch,
            country: apiCustomer.country,
            state: apiCustomer.state,
            pincode: apiCustomer.pincode,
            address: apiCustomer.address,
            stateCode: apiCustomer.state_code,
            shippingAddress: apiCustomer.shipping_address,
            phone: apiCustomer.phone,
            email: apiCustomer.email,
            creditPeriod: apiCustomer.credit_period_days.toString(),
            gstin: apiCustomer.gstIn || "",
            gstEnabled: apiCustomer.enable_gst === true,
            companyLocation: apiCustomer.google_location,
            idCardImage: apiCustomer.id_card_image,
            extraFile: apiCustomer.any_file,
            billing: {
              name: apiCustomer.name_english,
              phone: apiCustomer.phone,
              address: apiCustomer.address,
              city: "",
              state: apiCustomer.state,
              country: apiCustomer.country,
              zip: apiCustomer.pincode,
            },
            shipping: {
              name: apiCustomer.name_english,
              phone: apiCustomer.phone,
              address: apiCustomer.shipping_address,
              city: "",
              state: apiCustomer.state,
              country: apiCustomer.country,
              zip: apiCustomer.pincode,
            },
          };
        });

        setCustomersList(transformedCustomers);
      } else {
        const errorMsg = response.data.message || "Failed to fetch customers";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      const errorMsg = "An error occurred while fetching customers";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCustomersByCompany();
    }
  }, [companyId]);

  // Handlers
  const handleOpenAddEditModal = (mode, customer = null, index = null) => {
    setEditMode(mode === "edit");
    if (mode === "add") {
      const empty = JSON.parse(JSON.stringify(emptyCustomer));
      setCurrentCustomer(empty);
      setCustomerFormData({
        accountType: "Sundry Debtors",
        accountName: "Accounts Receivable",
        balanceType: "Debit",
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
        gstType: "Registered",
        taxEnabled: true,
        taxNumber: "",
      });
    } else if (customer) {
      setCurrentCustomer(customer);
      setCustomerFormData({
        accountType: customer.accountType || "Sundry Debtors",
        accountName: customer.accountName || "Accounts Receivable",
        balanceType: customer.balanceType || "Debit",
        creationDate: customer.creationDate || "",
        bankAccountNumber: customer.bankAccountNumber || "",
        bankIFSC: customer.bankIFSC || "",
        bankName: customer.bankName || "",
        country: customer.country || "",
        state: customer.state || "",
        pincode: customer.pincode || "",
        address: customer.address || "",
        stateCode: customer.stateCode || "",
        shippingAddress: customer.shippingAddress || "",
        phone: customer.phone || "",
        email: customer.email || "",
        creditPeriod: customer.creditPeriod || "",
        gstin: customer.gstin || "",
        gstType: customer.gstType || "Registered",
        taxEnabled: customer.taxEnabled || true,
        taxNumber: customer.taxNumber || "",
      });
      toast.info(`Editing customer: ${customer.name}`);
    }
    setCurrentIndex(index);
    setShowAddEditModal(true);
  };

  const handleOpenViewModal = (customer) => {
    setCurrentCustomer(customer);
    setShowViewModal(true);
    toast.info(`Viewing details for: ${customer.name}`);
  };

  const handleSave = (savedCustomer, mode) => {
    // Transform API response to match UI structure
    const transformedCustomer = {
      id: savedCustomer.id,
      name: savedCustomer.name_english,
      nameArabic: savedCustomer.name_arabic,
      companyName: savedCustomer.company_name,
      contact: savedCustomer.phone,
      email: savedCustomer.email,
      taxNumber: savedCustomer.gstIn || "",
      altMobile: "",
      balance: savedCustomer.account_balance.toString(),
      taxEnabled: savedCustomer.enable_gst === true,
      accountType: savedCustomer.account_type || "Sundry Debtors",
      accountName: savedCustomer.account_name || "Accounts Receivable",
      balanceType: savedCustomer.balance_type || "Debit",
      creationDate: savedCustomer.creation_date,
      bankAccountNumber: savedCustomer.bank_account_number,
      bankIFSC: savedCustomer.bank_ifsc,
      bankName: savedCustomer.bank_name_branch,
      country: savedCustomer.country,
      state: savedCustomer.state,
      pincode: savedCustomer.pincode,
      address: savedCustomer.address,
      stateCode: savedCustomer.state_code,
      shippingAddress: savedCustomer.shipping_address,
      phone: savedCustomer.phone,
      email: savedCustomer.email,
      creditPeriod: savedCustomer.credit_period_days.toString(),
      gstin: savedCustomer.gstIn || "",
      gstEnabled: savedCustomer.enable_gst === true,
      companyLocation: savedCustomer.google_location,
      idCardImage: savedCustomer.id_card_image,
      extraFile: savedCustomer.any_file,
      billing: {
        name: savedCustomer.name_english,
        phone: savedCustomer.phone,
        address: savedCustomer.address,
        city: "",
        state: savedCustomer.state,
        country: savedCustomer.country,
        zip: savedCustomer.pincode,
      },
      shipping: {
        name: savedCustomer.name_english,
        phone: savedCustomer.phone,
        address: savedCustomer.shipping_address,
        city: "",
        state: savedCustomer.state,
        country: savedCustomer.country,
        zip: savedCustomer.pincode,
      },
    };

    if (mode === "edit" && currentIndex !== null) {
      const updatedList = [...customersList];
      updatedList[currentIndex] = transformedCustomer;
      setCustomersList(updatedList);
    } else {
      setCustomersList([...customersList, transformedCustomer]);
    }

    setShowAddEditModal(false);
    resetModal();
    // Optional: Uncomment if you want to refetch after save
    // fetchCustomersByCompany();
  };

  const resetModal = () => {
    setCurrentCustomer(JSON.parse(JSON.stringify(emptyCustomer)));
    setCustomerFormData({
      accountType: "Sundry Debtors",
      accountName: "Accounts Receivable",
      balanceType: "Debit",
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
      gstType: "Registered",
      taxEnabled: true,
      taxNumber: "",
    });
    setEditMode(false);
    setCurrentIndex(null);
  };

  // Filter customers - UPDATED to include Arabic name search
  const filteredCustomers = customersList.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.nameArabic.includes(searchTerm) || // No toLowerCase for Arabic text
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Excel Import
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

      const imported = data.map((row) => {
        const cust = JSON.parse(JSON.stringify(emptyCustomer));
        Object.entries(row).forEach(([key, value]) => {
          if (key.startsWith("billing.") || key.startsWith("shipping.")) {
            const [section, field] = key.split(".");
            cust[section][field] = value;
          } else if (key === "taxEnabled") {
            cust.taxEnabled = value === "ON" || value === true;
          } else {
            cust[key] = value;
          }
        });
        return cust;
      });
      setCustomersList((prev) => [...prev, ...imported]);
      toast.success(`${imported.length} customers imported successfully`);
    };
    reader.readAsBinaryString(file);
  };

  // Excel Export
  const handleExport = () => {
    const columns = [
      "name",
      "contact",
      "email",
      "taxNumber",
      "altMobile",
      "balance",
      "taxEnabled",
      "billing.name",
      "billing.phone",
      "billing.address",
      "billing.city",
      "billing.state",
      "billing.country",
      "billing.zip",
      "shipping.name",
      "shipping.phone",
      "shipping.address",
      "shipping.city",
      "shipping.state",
      "shipping.country",
      "shipping.zip",
    ];
    const data = customersList.map((cust, idx) => {
      const flat = {
        name: cust.name,
        contact: cust.contact,
        email: cust.email,
        taxNumber: cust.taxNumber,
        altMobile: cust.altMobile,
        balance: cust.balance,
        taxEnabled: cust.taxEnabled ? "ON" : "OFF",
        "billing.name": cust.billing.name,
        "billing.phone": cust.billing.phone,
        "billing.address": cust.billing.address,
        "billing.city": cust.billing.city,
        "billing.state": cust.billing.state,
        "billing.country": cust.billing.country,
        "billing.zip": cust.billing.zip,
        "shipping.name": cust.shipping.name,
        "shipping.phone": cust.shipping.phone,
        "shipping.address": cust.shipping.address,
        "shipping.city": cust.shipping.city,
        "shipping.state": cust.shipping.state,
        "shipping.country": cust.shipping.country,
        "shipping.zip": cust.shipping.zip,
      };
      return { No: idx + 1, ...flat };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "customers.xlsx");
    toast.success("Customer data exported successfully");
  };

  // Download Blank Template
  const handleDownloadBlank = () => {
    const columns = [
      "name",
      "contact",
      "email",
      "taxNumber",
      "altMobile",
      "balance",
      "taxEnabled",
      "billing.name",
      "billing.phone",
      "billing.address",
      "billing.city",
      "billing.state",
      "billing.country",
      "billing.zip",
      "shipping.name",
      "shipping.phone",
      "shipping.address",
      "shipping.city",
      "shipping.state",
      "shipping.country",
      "shipping.zip",
    ];
    const blankRow = { No: "" };
    columns.forEach((col) => (blankRow[col] = ""));
    const ws = XLSX.utils.json_to_sheet([blankRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "customer_template.xlsx");
    toast.success("Customer template downloaded successfully");
  };

  return (
    <div className="p-4 mt-2">
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
        theme="colored"
      />

      {/* Header Buttons */}
      <div className="mb-3">
        <Row className="gy-2 align-items-center">
          <Col xs={12} md="auto">
            <h4 className="fw-bold mb-0">Customer Table</h4>
          </Col>
          <Col xs={12} md>
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImport}
              />
              <Button
                variant="success"
                className="rounded-pill d-flex align-items-center"
                style={{ fontWeight: 600 }}
                onClick={() => fileInputRef.current?.click()}
                title="Import Excel"
              >
                <FaFileImport className="me-2" /> Import
              </Button>
              <Button
                variant="primary"
                className="rounded-pill d-flex align-items-center"
                style={{ fontWeight: 600 }}
                onClick={handleExport}
                title="Export Excel"
              >
                <FaFileExport className="me-2" /> Export
              </Button>
              <Button
                variant="warning"
                className="rounded-pill d-flex align-items-center"
                style={{ fontWeight: 600, color: "#fff" }}
                onClick={handleDownloadBlank}
                title="Download Blank Template"
              >
                <FaDownload className="me-2" /> Download
              </Button>
              <Button
                onClick={() => handleOpenAddEditModal("add")}
                size="sm"
                style={{
                  backgroundColor: "#53b2a5",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                }}
                className="rounded-pill"
              >
                <FaPlus className="me-1" />
                <span>Add Customer</span>
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Customer Table */}
      <Card className="rounded-3 p-3">
        <div className="mb-3">
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, email, phone or Arabic name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </div>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading customers...</p>
          </div>
        ) : (
          <>
            <Table bordered hover responsive>
              <thead className="">
                <tr>
                  <th>Voucher No</th>
                  <th>Name (English)</th>
                  <th>Name (Arabic)</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Account Type</th>
                  <th>Account Name</th>
                  <th>Opening Balance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((cust, idx) => (
                    <tr key={cust.id || idx}>
                      <td>{idx + 1}</td>
                      <td>{cust.name}</td>
                      <td>
                        <span
                          style={{
                            direction: "rtl",
                            fontFamily: "Arial, sans-serif",
                            display: "block",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            minWidth: "100px",
                            maxWidth: "200px",
                          }}
                        >
                          {cust.nameArabic || "-"}
                        </span>
                      </td>
                      <td>{cust.contact}</td>
                      <td>{cust.email}</td>
                      <td>
                        <Badge bg="info" className="text-white">
                          {cust.accountType || "Sundry Debtors"}
                        </Badge>
                      </td>
                      <td>{cust.accountName || "Accounts Receivable"}</td>
                      <td>${parseFloat(cust.balance || 0).toFixed(2)}</td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button
                            variant="link"
                            className="p-0 text-info"
                            onClick={() => handleOpenViewModal(cust)}
                            title="View Details"
                          >
                            <FaEye size={16} />
                          </Button>
                          <Button
                            variant="link"
                            className="p-0 text-warning"
                            onClick={() =>
                              handleOpenAddEditModal("edit", cust, idx)
                            }
                            title="Edit Customer"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="link"
                            className="p-0 text-danger"
                            onClick={() => {
                              setCustomerIdToDelete(cust.id);
                              setShowConfirmDelete(true);
                            }}
                            title="Delete Customer"
                          >
                            <FaTrash />
                          </Button>
                          <Button
                            variant="none"
                            className="p-0 text-primary text-decoration-none"
                            onClick={() => {
                              navigate(`/company/Ledgercustomer`, {
                                state: {
                                  customer: {
                                    id: cust.id,
                                    name: cust.name,
                                    nameArabic: cust.nameArabic || "",
                                    companyName: cust.companyName || "N/A",
                                    email: cust.email,
                                    phone: cust.contact,
                                    altPhone: cust.altPhone || "",
                                    address: `${cust.billing.address}, ${cust.billing.city}, ${cust.billing.state}`,
                                    shippingAddress:
                                      cust.shippingAddress || "Same as above",
                                    country: cust.billing.country || "India",
                                    state: cust.billing.state || "N/A",
                                    pincode: cust.billing.pincode || "N/A",
                                    gst: cust.taxNumber,
                                    gstEnabled: !!cust.taxNumber,
                                    pan: cust.pan || "",
                                    stateCode: cust.stateCode || "",
                                    openingBalance: parseFloat(cust.balance || 0),
                                    accountName:
                                      cust.accountName || "Sundry Debtors",
                                    accountBalance: cust.accountBalance || "0.00",
                                    creditPeriod: cust.creditPeriod || "30",
                                    bankAccountNumber: cust.bankAccountNumber || "",
                                    bankIFSC: cust.bankIFSC || "",
                                    bankName: cust.bankName || "",
                                    creationDate:
                                      cust.creationDate ||
                                      new Date().toISOString().split("T")[0],
                                    companyLocation: cust.companyLocation || "",
                                  },
                                },
                              });
                            }}
                            title="View Ledger"
                            style={{
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              padding: "4px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            View Ledger
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
                      {customersList.length === 0
                        ? "No customers found. Add your first customer!"
                        : "No matching customers found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
              <small className="text-muted ms-2">
                1 to {filteredCustomers.length} of {customersList.length}{" "}
                results
              </small>
              <nav>
                <ul className="pagination mb-0">
                  <li className="page-item disabled">
                    <button className="page-link">&laquo;</button>
                  </li>
                  <li className="page-item active">
                    <button className="page-link">1</button>
                  </li>
                  <li className="page-item">
                    <button className="page-link">2</button>
                  </li>
                  <li className="page-item">
                    <button className="page-link">&raquo;</button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </Card>

      {/* Page Description */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">
            Page Info
          </h5>
          <ul
            className="text-muted fs-6 mb-0"
            style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}
          >
            <li>Manage customer records including contact and address details.</li>
            <li>Track customer balances and tax information (e.g., GSTIN).</li>
            <li>Perform actions like add, view, edit, and delete customers.</li>
            <li>
              Import and export customer data via Excel for bulk operations.
            </li>
            <li>Search and filter customers by name, email, phone, or city.</li>
          </ul>
        </Card.Body>
      </Card>

      {/* Modals */}
      <DeleteCustomer
        show={showConfirmDelete}
        onHide={() => {
          setShowConfirmDelete(false);
          setCustomerIdToDelete(null);
        }}
        customerId={customerIdToDelete}
        onSuccess={() => {
          // ✅ OPTION 1: Refetch entire list (recommended)
          fetchCustomersByCompany();
          setShowConfirmDelete(false);
          setCustomerIdToDelete(null);
        }}
      />

      <ViewCustomerModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        customer={currentCustomer}
      />

      <AddEditCustomerModal
        show={showAddEditModal}
        onHide={() => setShowAddEditModal(false)}
        editMode={editMode}
        customerFormData={customerFormData}
        setCustomerFormData={setCustomerFormData}
        onSave={handleSave}
        customerId={currentCustomer.id}
      />
    </div>
  );
};

export default CustomersDebtors;