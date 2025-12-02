import React, { useState, useRef,useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Modal,
  Form,
  Card,
  Row,
  Col,
  Badge,
  InputGroup,
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
import { CurrencyContext } from "../../../hooks/CurrencyContext";

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

const getCustomerColumns = () => [
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
  "accountType",     // 👈 Added
  "accountName",

];

const CustomersDebtors = () => {
  const navigate = useNavigate();
  const [customersList, setCustomersList] = useState([
    // Existing customer
    {
      id: "cust-001",
      name: "Lalit Singh",
      nameArabic: "لاليت سينغ", // Lalit Singh in Arabic
      contact: "09752100980",
      email: "lalit@example.com",
      taxNumber: "GSTIN123",
      altMobile: "0987654321",
      balance: "5000",
      taxEnabled: true,
      accountType: "Sundry Debtors",
      accountName: "Accounts Receivable",
      billing: {
        name: "Lalit Singh",
        phone: "09752100980",
        address: "34 Mahal Kachhari Road",
        city: "Indore",
        state: "Madhya Pradesh",
        country: "India",
        zip: "452001",
      },
      shipping: {
        name: "Lalit Singh",
        phone: "09752100980",
        address: "34 Mahal Kachhari Road",
        city: "Indore",
        state: "Madhya Pradesh",
        country: "India",
        zip: "452001",
      },
    },

    // New Customer 1
    {
      id: "cust-002",
      name: "Priya Mehta",
      nameArabic: "بريا مهتا", // Priya Mehta in Arabic
      contact: "09876543210",
      email: "priya.mehta@fashionhub.com",
      taxNumber: "GSTIN456789",
      altMobile: "0987654321",
      balance: "12500",
      taxEnabled: true,
      accountType: "Sundry Debtors",
      accountName: "Accounts Receivable",
      billing: {
        name: "Priya Mehta",
        phone: "09876543210",
        address: "Shop No 5, Link Road",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        zip: "400001",
      },
      shipping: {
        name: "Delivery Manager",
        phone: "09876543210",
        address: "Attn: Delivery, Shop No 5, Link Road",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        zip: "400001",
      },
    },

    // New Customer 2
    {
      id: "cust-003",
      name: "Rajesh Kumar",
      nameArabic: "راجيش كومار", // Rajesh Kumar in Arabic
      contact: "09412345678",
      email: "rajesh.electro@business.in",
      taxNumber: "GSTIN789012",
      altMobile: "",
      balance: "7800",
      taxEnabled: true,
      accountType: "Sundry Debtors",
      accountName: "Accounts Receivable",
      billing: {
        name: "Rajesh Kumar",
        phone: "09412345678",
        address: "Plot 12, Industrial Area",
        city: "Chandigarh",
        state: "Punjab",
        country: "India",
        zip: "160001",
      },
      shipping: {
        name: "Rajesh Kumar",
        phone: "09412345678",
        address: "Plot 12, Industrial Area",
        city: "Chandigarh",
        state: "Punjab",
        country: "India",
        zip: "160001",
      },
    },

    // New Customer 3
    {
      id: "cust-004",
      name: "Anita Desai",
      nameArabic: "अनिता देसाई", // Anita Desai in Arabic
      contact: "09012345678",
      email: "anita.desai@edu.org",
      taxNumber: "GSTIN345678",
      altMobile: "0901234567",
      balance: "3200",
      taxEnabled: false,
      accountType: "Sundry Debtors",
      accountName: "Accounts Receivable",
      billing: {
        name: "Anita Desai",
        phone: "09012345678",
        address: "15, Teacher's Colony",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        zip: "560001",
      },
      shipping: {
        name: "Procurement Dept",
        phone: "09012345678",
        address: "15, Teacher's Colony, Near School Gate",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        zip: "560001",
      },
    },

    // New Customer 4
    {
      id: "cust-005",
      name: "Global Traders Ltd",
      nameArabic: "جلوبال تريدرز لميتد", // Global Traders Ltd in Arabic
      contact: "01123456789",
      email: "info@globaltraders.co.in",
      taxNumber: "GSTIN999000",
      altMobile: "0112345678",
      balance: "25000",
      taxEnabled: true,
      accountType: "Sundry Debtors",
      accountName: "Accounts Receivable",
      billing: {
        name: "Global Traders Ltd",
        phone: "01123456789",
        address: "Corporate Office, Tower B, Sector 62",
        city: "Noida",
        state: "Uttar Pradesh",
        country: "India",
        zip: "201301",
      },
      shipping: {
        name: "Logistics Head",
        phone: "01123456789",
        address: "Warehouse 3, Plot 7, Sector 44",
        city: "Noida",
        state: "Uttar Pradesh",
        country: "India",
        zip: "201307",
      },
    },

    // New Customer 5
    {
      id: "cust-006",
      name: "Sandeep Verma",
      nameArabic: "संदीप वर्मा", // Sandeep Verma in Arabic
      contact: "09876000987",
      email: "sandeep.auto@workshop.in",
      taxNumber: "GSTIN112233",
      altMobile: "",
      balance: "4500",
      taxEnabled: true,
      accountType: "Sundry Debtors",
      accountName: "Accounts Receivable",
      billing: {
        name: "Sandeep Verma",
        phone: "09876000987",
        address: "Verma Auto Care, Main GT Road",
        city: "Ludhiana",
        state: "Punjab",
        country: "India",
        zip: "141001",
      },
      shipping: {
        name: "Sandeep Verma",
        phone: "09876000987",
        address: "Verma Auto Care, Main GT Road",
        city: "Ludhiana",
        state: "Punjab",
        country: "India",
        zip: "141001",
      },
    },
  ]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(() =>
    JSON.parse(JSON.stringify(emptyCustomer))
  );
  const [currentIndex, setCurrentIndex] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const passedVendor = location.state?.vendor;
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const { symbol, convertPrice } = useContext(CurrencyContext);

  // Excel import
  const fileInputRef = useRef();

  // ✅ Account types for dropdown
  // ✅ Updated accountTypes from AllAccounts.js
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
    "Indirect Expenses"
  ];

  // ✅ Allowed account names for customers
  const allAccountNames = ["Cash in Hand", "Bank Account", "Accounts Receivable"];

  const handleSaveCustomer = () => {
    const updatedCustomer = {
      ...customerFormData,
      id: editMode ? selectedCustomer.id : `cust-${Date.now()}`,
    };

    if (editMode) {
      setCustomers(customers.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
    } else {
      setCustomers([...customers, updatedCustomer]);
    }

    setShowAddEditModal(false);
  };
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
    gstEnabled: true,
    taxNumber: "",
    isAccountNameSynced: true,
  });

  // Handlers
  const handleOpenAddEditModal = (mode, customer = null, index = null) => {
    setEditMode(mode === "edit");
    if (mode === "add") {
      const empty = JSON.parse(JSON.stringify(emptyCustomer));
      setCurrentCustomer(empty);
      // ✅ Reset with default values
      setCustomerFormData({
        accountType: "Sundry Debtors",
        accountName: "",
        balanceType: "Debit",
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
        gstType: "Registered",
        taxEnabled: true,
        taxNumber: "",
      });
    } else if (customer) {
      // ✅ Load existing data with fallback
      setCurrentCustomer(customer);
      setCustomerFormData({
        accountType: customer.accountType || "Sundry Debtors",
        accountName: customer.accountName || "Accounts Receivable",
        balanceType: customer.balanceType || "Debit",
        payable: customer.payable || "",
        currentBalance: customer.currentBalance || "",
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
    }
    setCurrentIndex(index);
    setShowAddEditModal(true);
  };

  const handleOpenViewModal = (customer) => {
    setCurrentCustomer(customer);
    setShowViewModal(true);
  };

  const handleSave = () => {
    const newCustomerData = { ...customerFormData, id: currentCustomer.id || Date.now().toString(36) };

    if (editMode && currentIndex !== null) {
      const updatedList = [...customersList];
      updatedList[currentIndex] = { ...currentCustomer, ...newCustomerData };
      setCustomersList(updatedList);
    } else {
      setCustomersList([...customersList, { ...currentCustomer, ...newCustomerData }]);
    }

    setShowAddEditModal(false);
    resetModal();
  };

  const handleDelete = () => {
    setCustomersList((prev) => prev.filter((_, idx) => idx !== deleteIndex));
    setShowConfirmDelete(false);
  };

  const resetModal = () => {
    setCurrentCustomer(JSON.parse(JSON.stringify(emptyCustomer)));
    setCustomerFormData({
      accountType: "Sundry Debtors",
      accountName: "",
      balanceType: "Debit",
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
      gstType: "Registered",
      taxEnabled: true,
      taxNumber: "",
    });
    setEditMode(false);
    setCurrentIndex(null);
  };

  // Update field in nested object
  const updateField = (path, value) => {
    const keys = path.split(".");
    const updated = JSON.parse(JSON.stringify(currentCustomer));
    let obj = updated;
    while (keys.length > 1) {
      if (!obj[keys[0]]) obj[keys[0]] = {};
      obj = obj[keys.shift()];
    }
    obj[keys[0]] = value;
    setCurrentCustomer(updated);
  };

  // Copy billing to shipping
  const copyBillingToShipping = () => {
    setCurrentCustomer((prev) => ({
      ...prev,
      shipping: { ...prev.billing },
    }));
  };

  // Filter customers
  const filteredCustomers = customersList.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.billing?.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.shipping?.city.toLowerCase().includes(searchTerm.toLowerCase());
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
    };
    reader.readAsBinaryString(file);
  };

  // Excel Export
  const handleExport = () => {
    const columns = getCustomerColumns();
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

    const ws = XLSX.utils.json_to_sheet(data, { header: ["No", ...columns] });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "customers.xlsx");
  };

  // Download Blank Template
  const handleDownloadBlank = () => {
    const columns = getCustomerColumns();
    const blankRow = { No: "" };
    columns.forEach((col) => (blankRow[col] = ""));
    const ws = XLSX.utils.json_to_sheet([blankRow], { header: ["No", ...columns] });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "customer_template.xlsx");
  };



  // Helper function for Google Maps link
  function getGoogleMapsLink(companyName) {
    return companyName ? `https://maps.google.com/?q=${encodeURIComponent(companyName)}` : "";
  }
  return (
    <div className="p-4 mt-2">
      {/* Header Buttons */}
      <div className="mb-3">
        <Row className="gy-2 align-items-center">
          <Col xs={12} md="auto">
            <h6 className="fw-semibold mb-0">Customer Table</h6>
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
        {/* Search */}
        <div className="mb-3">
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, email or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>Voucher No</th>
              <th>Name (English)</th>
              <th>Name (Arabic)</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Account Type</th>        {/* 👈 New */}
              <th>Account Name</th>        {/* 👈 New */}
              <th> Opening Balance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((cust, idx) => (
                <tr key={cust.id || idx}>
                  <td>{idx + 1}</td>
                  {/* Name (English) */}
                  <td>{cust.name}</td>

                  {/* Name (Arabic) */}
                  <td>
                    <span
                      style={{
                        direction: 'rtl',
                        fontFamily: 'Arial, sans-serif',
                        display: 'block',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: '100px',
                        maxWidth: '200px',
                      }}
                    >
                      {cust.nameArabic || "-"}
                    </span>
                  </td>
                  <td>{cust.contact}</td>
                  <td>{cust.email}</td>

                  {/* New Columns */}
                  <td>
                    <Badge bg="info" className="text-white">
                      {cust.accountType || "Sundry Debtors"}
                    </Badge>
                  </td>
                  <td>{cust.accountName || "Accounts Receivable"}</td>

                  <td>{symbol}{convertPrice(cust.balance || "-")}</td>
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
                        onClick={() => handleOpenAddEditModal("edit", cust, idx)}
                        title="Edit Customer"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="link"
                        className="p-0 text-danger"
                        onClick={() => {
                          setDeleteIndex(idx);
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
                                // Basic Info
                                name: cust.name,
                                nameArabic: cust.nameArabic || "",
                                companyName: cust.companyName || "N/A",
                                email: cust.email,
                                phone: cust.contact,
                                altPhone: cust.altPhone || "",
                                address: `${cust.billing.address}, ${cust.billing.city}, ${cust.billing.state}`,
                                shippingAddress: cust.shippingAddress || "Same as above",
                                country: cust.billing.country || "India",
                                state: cust.billing.state || "N/A",
                                pincode: cust.billing.pincode || "N/A",

                                // Tax & IDs
                                gst: cust.taxNumber,
                                gstEnabled: !!cust.taxNumber,
                                pan: cust.pan || "",
                                stateCode: cust.stateCode || "",

                                // Financial Info
                                openingBalance: parseFloat(cust.balance || 0),
                                accountName: cust.accountName || "Sundry Debtors",
                                accountBalance: cust.accountBalance || "0.00",
                                creditPeriod: cust.creditPeriod || "30",

                                // Bank Info
                                bankAccountNumber: cust.bankAccountNumber || "",
                                bankIFSC: cust.bankIFSC || "",
                                bankName: cust.bankName || "",

                                // Meta Info
                                creationDate: cust.creationDate || new Date().toISOString().split("T")[0],
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
                <td colSpan="8" className="text-center text-muted py-4">
                  {customersList.length === 0
                    ? "No customers found. Add your first customer!"
                    : "No matching customers found."}
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
          <small className="text-muted ms-2">
            1 to {filteredCustomers.length} of {customersList.length} results
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
      </Card>

      {/* Add/Edit Modal */}
    <Modal
  show={showAddEditModal}
  onHide={() => setShowAddEditModal(false)}
  size="xl"
  centered
  backdrop="static"
  keyboard={false}
>
  <Modal.Header closeButton className="bg-light">
    <Modal.Title>{editMode ? "Edit Customer" : "Add Customer"}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Name (English)</Form.Label>
            <Form.Control
              type="text"
              value={customerFormData.name || ""}
              onChange={(e) => {
                const value = e.target.value;
                setCustomerFormData({
                  ...customerFormData,
                  name: value,
                  accountName:
                    customerFormData.name === customerFormData.accountName
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
              value={customerFormData.nameArabic || ""}
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
              value={customerFormData.companyName || ""}
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
              value={customerFormData.companyLocation || ""}
              onChange={(e) =>
                setCustomerFormData({
                  ...customerFormData,
                  companyLocation: e.target.value,
                })
              }
              placeholder="Enter Google Maps link"
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
                  idCardImage: e.target.files[0] || null,
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
                  extraFile: e.target.files[0] || null,
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
            <Form.Control
              type="text"
              value="Sundry Debtors"
              readOnly
              disabled
              style={{ backgroundColor: "#fff" }}
            />
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
              value={customerFormData.accountName || ""}
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
              value={customerFormData.accountBalance || ""}
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
              value={customerFormData.creationDate || ""}
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
              value={customerFormData.bankAccountNumber || ""}
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
              value={customerFormData.bankIFSC || ""}
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
              value={customerFormData.bankName || ""}
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
              value={customerFormData.country || ""}
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
              value={customerFormData.state || ""}
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
              value={customerFormData.pincode || ""}
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
              value={customerFormData.address || ""}
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
              value={customerFormData.stateCode || ""}
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
              value={customerFormData.shippingAddress || ""}
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
              value={customerFormData.phone || ""}
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
              value={customerFormData.email || ""}
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
              value={customerFormData.creditPeriod || ""}
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
                  value={customerFormData.gstin || ""}
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
                checked={customerFormData.gstEnabled || false}
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
    <Button variant="secondary" onClick={() => setShowAddEditModal(false)}>
      Cancel
    </Button>
    <Button
      style={{ backgroundColor: "#53b2a5", border: "none" }}
      onClick={handleSave}
    >
      {editMode ? "Update Customer" : "Save Customer"}
    </Button>
  </Modal.Footer>
</Modal>


      {/* View Modal */}
      <Modal.Body>
        {/* Circular Profile Image + Name (Centered) */}
        <div className="text-center mb-4">
          {/* Circular ID Card Image */}
          {currentCustomer.idCardImage && (
            <div className="mb-3">
              {typeof currentCustomer.idCardImage === 'string' ? (
                <img
                  src={currentCustomer.idCardImage}
                  alt="ID Card"
                  className="rounded-circle border"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              ) : currentCustomer.idCardImage instanceof File ? (
                <img
                  src={URL.createObjectURL(currentCustomer.idCardImage)}
                  alt="ID Card"
                  className="rounded-circle border"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                />
              ) : null}
            </div>
          )}

          {/* Large Name */}
          <h2 className="text-primary">{currentCustomer.name || "N/A"}</h2>

          {/* Arabic Name (optional, smaller) */}
          {currentCustomer.nameArabic && (
            <h5
              dir="rtl"
              style={{
                fontFamily: 'Arial, sans-serif',
                color: '#555',
                marginTop: '0.25rem',
              }}
            >
              {currentCustomer.nameArabic}
            </h5>
          )}
        </div>

        {/* Remaining Details */}
        <Card className="mb-3">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Basic Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Contact:</strong> {currentCustomer.contact}</p>
                <p><strong>Email:</strong> {currentCustomer.email}</p>
                <p><strong>Account Type:</strong> {currentCustomer.accountType || "Sundry Debtors"}</p>
              </Col>
              <Col md={6}>
                <p><strong>Alternate Mobile:</strong> {currentCustomer.altMobile || "-"}</p>
                <p><strong>Tax Number:</strong> {currentCustomer.taxNumber || "-"}</p>
                <p>
                  <strong>Tax Enabled:</strong>{" "}
                  <Badge bg={currentCustomer.taxEnabled ? "success" : "secondary"} className="ms-2">
                    {currentCustomer.taxEnabled ? "ON" : "OFF"}
                  </Badge>
                </p>
                <p><strong>Account Name:</strong> {currentCustomer.accountName || "Accounts Receivable"}</p>
                <p><strong>Balance:</strong> ${parseFloat(currentCustomer.balance || 0).toFixed(2)}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-3">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Billing Address</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {Object.entries(currentCustomer.billing || {}).map(([key, value], i) => (
                <Col md={6} key={i}>
                  <p className="mb-2">
                    <strong className="text-capitalize">{key}:</strong> {value || "-"}
                  </p>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header className="bg-light">
            <h5 className="mb-0">Shipping Address</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {Object.entries(currentCustomer.shipping || {}).map(([key, value], i) => (
                <Col md={6} key={i}>
                  <p className="mb-2">
                    <strong className="text-capitalize">{key}:</strong> {value || "-"}
                  </p>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </Modal.Body>

      {/* Delete Confirmation Modal */}
      <Modal show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this customer?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Page Description */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
          <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            <li>Manage customer records including contact and address details.</li>
            <li>Track customer balances and tax information (e.g., GSTIN).</li>
            <li>Perform actions like add, view, edit, and delete customers.</li>
            <li>Import and export customer data via Excel for bulk operations.</li>
            <li>Search and filter customers by name, email, phone, or city.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomersDebtors;