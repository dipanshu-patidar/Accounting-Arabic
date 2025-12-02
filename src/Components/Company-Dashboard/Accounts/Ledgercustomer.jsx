import React, { useState, useEffect, useMemo } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaFilter, FaCalendarAlt, FaSearch, FaUndo, FaFileExport, FaFilePdf, FaUser,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTruck,
  FaGlobeAsia,
  FaFlag,
  FaHashtag,
  FaFileInvoice,
  FaWallet,
  FaGlobe
} from "react-icons/fa";
import { Button, Card, Row, Col, Form, InputGroup, Table, Badge, Nav, Tab, Spinner, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';

const Ledgercustomer = () => {
  const companyId = GetCompanyId();
  const navigate = useNavigate();
  const location = useLocation();
  const passedCustomer = location.state?.customer;
  
  // State for API data
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters and UI
  const [ledgerType] = useState("customer");
  const [fromDate, setFromDate] = useState("2025-04-01");
  const [toDate, setToDate] = useState("2025-04-30");
  const [balanceType, setBalanceType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState({});
  const [activeTab, setActiveTab] = useState("all");

  const [manualVoucherNo, setManualVoucherNo] = useState("");
  const [autoVoucherNo] = useState("VCH-" + Date.now());

  // Fetch data from API
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        
        // Check if we have a valid customer ID
        if (!passedCustomer?.id) {
          setError("No customer ID provided. Please select a customer from the list.");
          setLoading(false);
          return;
        }
        
        // Get customer ID from passed customer
        const customerId = passedCustomer.id;
        
        // Make API call
        const response = await axiosInstance.get(`/vendorCustomer/customer-ledger/${customerId}/${companyId}`);
        setApiData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError("Failed to load customer data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [passedCustomer, companyId]);

  // Transform API data to match our component structure
  const customer = useMemo(() => {
    if (apiData && apiData.customer) {
      const cust = apiData.customer;
      return {
        id: cust.id,
        name: cust.name_english,
        nameArabic: cust.name_arabic,
        companyName: cust.company_name,
        companyLocation: cust.google_location,
        accountName: cust.account_name,
        accountBalance: cust.account_balance,
        creationDate: new Date(cust.creation_date).toISOString().split('T')[0],
        bankAccountNumber: cust.bank_account_number,
        bankIFSC: cust.bank_ifsc,
        bankName: cust.bank_name_branch,
        country: cust.country,
        state: cust.state,
        pincode: cust.pincode,
        address: cust.address,
        stateCode: cust.state_code,
        shippingAddress: cust.shipping_address,
        phone: cust.phone,
        email: cust.email,
        creditPeriod: cust.credit_period_days,
        gst: cust.gstIn,
        openingBalance: 0, // Will be set from transactions
        idCardImage: cust.id_card_image,
        extraFile: cust.any_file,
        company: cust.company
      };
    }
    
    // Fallback to passed customer data if API data is not available
    if (passedCustomer) {
      return {
        id: passedCustomer.id,
        name: passedCustomer.name,
        nameArabic: passedCustomer.nameArabic || "",
        companyName: passedCustomer.companyName || "N/A",
        companyLocation: passedCustomer.companyLocation || "",
        accountName: passedCustomer.accountName || "Accounts Receivable",
        accountBalance: passedCustomer.accountBalance || "0.00",
        creationDate: passedCustomer.creationDate || new Date().toISOString().split("T")[0],
        bankAccountNumber: passedCustomer.bankAccountNumber || "",
        bankIFSC: passedCustomer.bankIFSC || "",
        bankName: passedCustomer.bankName || "",
        country: passedCustomer.country || "India",
        state: passedCustomer.state || "N/A",
        pincode: passedCustomer.pincode || "N/A",
        address: passedCustomer.address || "",
        stateCode: passedCustomer.stateCode || "",
        shippingAddress: passedCustomer.shippingAddress || "Same as above",
        phone: passedCustomer.phone || "",
        email: passedCustomer.email || "",
        creditPeriod: passedCustomer.creditPeriod || "30",
        gst: passedCustomer.gst || "",
        openingBalance: passedCustomer.openingBalance || 0,
        idCardImage: passedCustomer.idCardImage || null,
        extraFile: passedCustomer.extraFile || null,
        company: passedCustomer.company || null
      };
    }
    
    // Default fallback
    return {
      name: "Demo Customer",
      nameArabic: "",
      companyName: "ABC Traders",
      companyLocation: "https://maps.google.com/?q=Indore",
      accountName: "Accounts Receivable",
      accountBalance: 5000,
      creationDate: "2025-04-01",
      bankAccountNumber: "1234567890",
      bankIFSC: "HDFC0000001",
      bankName: "HDFC Bank, Indore Branch",
      country: "India",
      state: "Madhya Pradesh",
      pincode: "452001",
      address: "Indore, MP",
      stateCode: "MP-23",
      shippingAddress: "Same as above",
      phone: "9999999999",
      email: "demo@email.com",
      creditPeriod: "30",
      gst: "22AAAAA0000A1Z5",
      openingBalance: 5000,
    };
  }, [apiData, passedCustomer]);

  // Transform transactions from API
  const ledgerData = useMemo(() => {
    if (apiData && apiData.transactions) {
      // Find opening balance transaction
      const openingBalanceTx = apiData.transactions.find(tx => tx.vch_type === "Opening");
      const openingBalance = openingBalanceTx ? openingBalanceTx.credit - openingBalanceTx.debit : 0;
      
      // Update customer opening balance
      customer.openingBalance = openingBalance;
      
      // Transform transactions
      return apiData.transactions.map(tx => ({
        id: tx.id || Math.random().toString(36).substring(7),
        date: new Date(tx.date).toISOString().split('T')[0],
        particulars: tx.particulars,
        narration: tx.narration,
        voucherNo: tx.vch_no,
        voucherType: tx.vch_type,
        debit: tx.debit,
        credit: tx.credit,
        balance: tx.balance,
        balanceType: tx.balance_type,
        items: tx.items ? tx.items.map(item => ({
          item: item.item_name,
          quantity: item.quantity,
          rate: item.rate,
          discount: item.discount,
          tax: item.tax_percent,
          taxAmt: item.tax_amount,
          value: item.value,
          description: item.description
        })) : []
      }));
    }
    
    // Fallback to dummy data if API data is not available
    return [
      {
        id: 1,
        date: "2025-04-01",
        particulars: "Opening Balance",
        narration: "Initial opening balance carried forward",
        voucherNo: "--",
        voucherType: "Opening",
        debit: customer.openingBalance > 0 ? customer.openingBalance : 0,
        credit: customer.openingBalance < 0 ? Math.abs(customer.openingBalance) : 0,
        items: [],
      },
      {
        id: 2,
        date: "2025-04-03",
        particulars: "Sales Invoice INV101",
        narration: "Goods sold on credit to Ravi Traders",
        voucherNo: "INV101",
        voucherType: "Invoice",
        debit: 10000,
        credit: 0,
        items: [
          {
            item: "SNB CH 58 LOT WHITE",
            quantity: "100.00 yds",
            rate: "0.400",
            discount: "0.000",
            tax: "0.000",
            taxAmt: "0.000",
            value: "40.00",
            description: "4 PCS",
          },
        ],
      },
      {
        id: 3,
        date: "2025-04-07",
        particulars: "Payment / Receipt",
        narration: "Payment received against invoice INV101",
        voucherNo: "RC001",
        voucherType: "Payment",
        debit: 0,
        credit: 5000,
        items: [],
      },
      {
        id: 4,
        date: "2025-04-12",
        particulars: "Return",
        narration: "Returned damaged goods",
        voucherNo: "CN001",
        voucherType: "Return",
        debit: 0,
        credit: 1000,
        items: [
          {
            item: "SNB CH 58 LOT WHITE",
            quantity: "50.00 yds",
            rate: "0.400",
            discount: "0.000",
            tax: "0.000",
            taxAmt: "0.000",
            value: "20.00",
            description: "2 PCS",
          },
        ],
      },
      {
        id: 5,
        date: "2025-04-15",
        particulars: "Sales Invoice INV102",
        narration: "Second sale of cotton fabric",
        voucherNo: "INV102",
        voucherType: "Invoice",
        debit: 7500,
        credit: 0,
        items: [
          {
            item: "COTTON BLUE 600GSM",
            quantity: "250.00 mtrs",
            rate: "0.300",
            discount: "0.000",
            tax: "0.000",
            taxAmt: "0.000",
            value: "75.00",
            description: "10 ROLLS",
          },
        ],
      },
      {
        id: 6,
        date: "2025-04-18",
        particulars: "Payment Received",
        narration: "Partial payment received",
        voucherNo: "RC002",
        voucherType: "Payment",
        debit: 0,
        credit: 3000,
        items: [],
      },
    ];
  }, [apiData, customer]);

  const filteredData = useMemo(() => {
    let runningBalance = customer.openingBalance || 0;
    return ledgerData.map((e) => {
      runningBalance += (e.debit || 0) - (e.credit || 0);
      const balType = runningBalance >= 0 ? "Dr" : "Cr";
      return {
        ...e,
        balance: `${Math.abs(runningBalance).toLocaleString("en-IN", { style: "currency", currency: "INR" })} ${balType}`,
        balanceValue: runningBalance,
        balanceType: balType,
      };
    });
  }, [ledgerData, customer.openingBalance]);

  const totals = useMemo(() => {
    if (apiData && apiData.ledger_summary) {
      return {
        totalDebit: apiData.ledger_summary.total_debit,
        totalCredit: apiData.ledger_summary.total_credit
      };
    }
    
    // Fallback to calculated totals
    return filteredData.reduce(
      (acc, e) => {
        acc.totalDebit += e.debit || 0;
        acc.totalCredit += e.credit || 0;
        return acc;
      },
      { totalDebit: 0, totalCredit: 0 }
    );
  }, [filteredData, apiData]);

  const currentBalance = useMemo(() => {
    if (apiData && apiData.ledger_summary && apiData.ledger_summary.outstanding_balance) {
      return apiData.ledger_summary.outstanding_balance.amount * (apiData.ledger_summary.outstanding_balance.type === "Dr" ? 1 : -1);
    }
    
    // Fallback to calculated balance
    return filteredData.length > 0 ? filteredData[filteredData.length - 1].balanceValue : 0;
  }, [filteredData, apiData]);

  const resetFilters = () => {
    setFromDate("2025-04-01");
    setToDate("2025-04-30");
    setBalanceType("all");
    setVoucherTypeFilter("all");
    setSearchQuery("");
  };

  const exportToExcel = () => alert("Export to Excel");
  const exportToPDF = () => alert("Export to PDF");

  const hasItems = filteredData.some((e) => e.items.length > 0);

  const toggleAllItems = () => {
    if (!hasItems) return;
    const anyExpanded = Object.values(expandedRows).some(Boolean);
    setExpandedRows(anyExpanded ? {} : Object.fromEntries(filteredData.filter(e => e.items?.length > 0).map(e => [e.id, true])));
  };

  // Loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div className="container">
          <Alert variant="danger">
            {error}
          </Alert>
          <Button variant="primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Reusable Components
  const CustomerDetailsTab = () => (
    <Card className="mb-4 shadow-sm border-0 rounded-3">
      <Card.Header className="bg-white border-bottom">
        <h5 className="mb-0 fw-bold text-dark">Customer Details</h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-4">
          <Col md={4}>
            <div className="p-3 bg-light rounded-3 h-100">
              <h6 className="fw-semibold mb-3 text-secondary">Personal Info</h6>
              <p className="mb-2 d-flex align-items-center">
                <FaUser className="me-2" style={{ color: "#53b2a5" }} />
                <span><strong>Name:</strong> {customer.name}</span>
              </p>
              {customer.nameArabic && (
                <p className="mb-2 d-flex align-items-center">
                  <span className="me-2" style={{ color: "#53b2a5" }}>🌐</span>
                  <span><strong>Name (Arabic):</strong> {customer.nameArabic}</span>
                </p>
              )}
              <p className="mb-2 d-flex align-items-center">
                <FaBuilding className="me-2" style={{ color: "#53b2a5" }} />
                <span><strong>Company:</strong> {customer.companyName || "N/A"}</span>
              </p>
              <p className="mb-2 d-flex align-items-center">
                <FaPhone className="me-2" style={{ color: "#53b2a5" }} />
                <span><strong>Phone:</strong> {customer.phone}</span>
              </p>
              <p className="mb-0 d-flex align-items-center">
                <FaEnvelope className="me-2" style={{ color: "#53b2a5" }} />
                <span><strong>Email:</strong> {customer.email}</span>
              </p>
              <p className="mb-0 d-flex align-items-center">
                <FaGlobe className="me-2" style={{ color: "#53b2a5" }} />
                <span>
                  <strong>Location:</strong>
                  <a
                    href={customer.companyLocation}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    Click Location
                  </a>
                </span>
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 bg-light rounded-3 h-100">
              <h6 className="fw-semibold mb-3 text-secondary">Address Info</h6>
              <p className="mb-2 d-flex align-items-center">
                <FaMapMarkerAlt className="me-2" style={{ color: "#53b2a5" }} />
                <span><strong>Address:</strong> {customer.address}</span>
              </p>
              <p className="mb-2 d-flex align-items-center">
                <FaTruck className="me-2" style={{ color: "#53b2a5" }} />
                <span><strong>Shipping:</strong> {customer.shippingAddress || "Same as above"}</span>
              </p>
              <p className="mb-2 d-flex align-items-center">
                <FaGlobeAsia className="me-2" style={{ color: "#53b2a5" }} />
                <span><strong>Country:</strong> {customer.country || "India"}</span>
              </p>
              <p className="mb-0 d-flex align-items-center">
                <FaFlag className="me-2" style={{ color: "#53b2a5" }} />
                <span><strong>State:</strong> {customer.state || "N/A"}</span>
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-3 bg-light rounded-3 h-100">
              <h6 className="fw-semibold mb-3 text-secondary">Financial Info</h6>
              <p className="mb-2 d-flex align-items-center">
                <FaHashtag className="me-2" style={{ color: "#53b2a5" }} />
                <span><strong>Pincode:</strong> {customer.pincode || "N/A"}</span>
              </p>
              <p className="mb-2 d-flex align-items-center">
                <FaFileInvoice className="me-2" style={{ color: "#53b2a5" }} />
                <span><strong>GSTIN:</strong> {customer.gst || "N/A"}</span>
              </p>
              <p className="mb-2 d-flex align-items-center">
                <FaCalendarAlt className="me-2" style={{ color: "#53b2a5" }} />
                <span><strong>Credit Period:</strong> {customer.creditPeriod || "N/A"} days</span>
              </p>
              <p className="mb-0 d-flex align-items-center">
                <FaWallet className="me-2" style={{ color: "#53b2a5" }} />
                <span><strong>Balance:</strong> ₹{customer.accountBalance?.toLocaleString("en-IN") || "0.00"}</span>
              </p>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  const ItemsDetailsTab = () => (
    <div className="mb-4">
      <Button className="mb-3" size="sm" variant="outline-primary" onClick={toggleAllItems}>
        {Object.values(expandedRows).some(Boolean) ? "Collapse All Items" : "Expand All Items"}
      </Button>

      {/* Ledger Table */}
      <Card className="mb-4 shadow-sm">
        <Card className="mb-4 border-0 shadow-sm rounded-4">
          <Card.Header className="bg-white border-0 py-3 px-4 d-flex flex-wrap justify-content-between align-items-center custom-ledger-header">
            <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
              <h5 className="mb-0 fw-semibold text-primary">Ledger Transactions</h5>
            </div>

            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                className="rounded-pill fw-medium px-3 py-1 custom-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                className="rounded-pill fw-medium px-3 py-1 custom-btn"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </div>
          </Card.Header>

          {showFilters && (
            <Card.Body className="pt-3 pb-4 px-4 bg-light border-top">
              <Row className="g-3">
                <Col xs={12} sm={6} md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">From Date</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white">
                        <FaCalendarAlt className="text-primary" />
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="shadow-sm"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">To Date</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white">
                        <FaCalendarAlt className="text-primary" />
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="shadow-sm"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Balance Type</Form.Label>
                    <Form.Select
                      value={balanceType}
                      onChange={(e) => setBalanceType(e.target.value)}
                      className="shadow-sm"
                    >
                      <option value="all">All Transactions</option>
                      <option value="debit">Debit Only</option>
                      <option value="credit">Credit Only</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Voucher Type</Form.Label>
                    <Form.Select
                      value={voucherTypeFilter}
                      onChange={(e) => setVoucherTypeFilter(e.target.value)}
                      className="shadow-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="Invoice">Invoice</option>
                      <option value="Payment">Payment</option>
                      <option value="Return">Return</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Search</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white">
                        <FaSearch className="text-primary" />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by particulars, voucher no, or item..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="shadow-sm"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          )}
        </Card>
        <Card.Body>
          <div className="table-responsive">
            <Table striped hover className="align-middle">
              <thead className="table-light text-black">
                <tr>
                  <th>Date</th>
                  <th>Particulars</th>
                  <th>VCH NO</th>
                  <th>VCH TYPE</th>
                  <th className="text-end">Debit (Dr)</th>
                  <th className="text-end">Credit (Cr)</th>
                  <th className="text-end">Running Balance</th>
                  {(activeTab === "narration" || activeTab === "all") && <th>Narration</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry) => (
                  <React.Fragment key={entry.id}>
                    <tr>
                      <td>{entry.date}</td>
                      <td>
                        <div
                          className="d-flex align-items-center cursor-pointer"
                          onClick={() => {
                            if (entry.items && entry.items.length > 0) {
                              setExpandedRows((prev) => ({
                                ...prev,
                                [entry.id]: !prev[entry.id],
                              }));
                            }
                          }}
                          style={{ minWidth: "120px" }}
                        >
                          <span className="me-2">
                            {entry.items && entry.items.length > 0 ? (expandedRows[entry.id] ? "▼" : "▶") : " "}
                          </span>
                          <span>{entry.particulars}</span>
                        </div>
                      </td>
                      <td>{entry.voucherNo}</td>
                      <td>
                        <Badge
                          bg={
                            entry.voucherType === "Invoice"
                              ? "primary"
                              : entry.voucherType === "Payment"
                                ? "success"
                                : entry.voucherType === "Return"
                                  ? "warning"
                                  : "secondary"
                          }
                        >
                          {entry.voucherType === "Invoice"
                            ? "Sales"
                            : entry.voucherType === "Payment"
                              ? "Receipt"
                              : entry.voucherType === "Return"
                                ? "Sales Return"
                                : entry.voucherType}
                        </Badge>
                      </td>
                      <td className="text-end">
                        {entry.debit
                          ? entry.debit.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })
                          : ""}
                      </td>
                      <td className="text-end">
                        {entry.credit
                          ? entry.credit.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })
                          : ""}
                      </td>
                      <td className={`text-end ${entry.balanceType === "Dr" ? "text-primary" : "text-success"}`}>
                        {entry.balance}
                      </td>
                      {(activeTab === "narration" || activeTab === "all") && (
                        <td className="text-muted small" style={{ maxWidth: "200px", whiteSpace: "normal" }}>
                          {entry.narration || "—"}
                        </td>
                      )}
                    </tr>
                    {entry.items && entry.items.length > 0 && expandedRows[entry.id] && (
                      <tr>
                        <td colSpan={(activeTab === "narration" || activeTab === "all") ? 8 : 7} className="p-0" style={{ backgroundColor: "#f9f9f9" }}>
                          <div className="p-2 ps-4 bg-light border-top">
                            <Table size="sm" bordered className="mb-0 bg-white shadow-sm" style={{ fontSize: "0.85rem" }}>
                              <thead className="table-light">
                                <tr>
                                  <th>Item / Material</th>
                                  <th>Qty</th>
                                  <th>Rate (₹)</th>
                                  <th>Disc (%)</th>
                                  <th>Tax (%)</th>
                                  <th>Tax Amt (₹)</th>
                                  <th>Value (₹)</th>
                                  <th>Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {entry.items.map((item, idx) => (
                                  <tr key={idx}>
                                    <td className="fw-bold">{item.item}</td>
                                    <td>{item.quantity}</td>
                                    <td>{parseFloat(item.rate).toFixed(3)}</td>
                                    <td>{item.discount}</td>
                                    <td>{item.tax}</td>
                                    <td>₹{parseFloat(item.taxAmt).toFixed(2)}</td>
                                    <td>₹{parseFloat(item.value).toFixed(2)}</td>
                                    <td className="text-muted">{item.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <td colSpan={(activeTab === "narration" || activeTab === "all") ? "5" : "4"} className="text-end fw-bold">
                    Total
                  </td>
                  <td className="text-end fw-bold">
                    {totals.totalDebit.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                  </td>
                  <td className="text-end fw-bold">
                    {totals.totalCredit.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                  </td>
                  <td className="text-end fw-bold">
                    {Math.abs(currentBalance).toLocaleString("en-IN", { style: "currency", currency: "INR" })}{" "}
                    {currentBalance >= 0 ? "Dr" : "Cr"}
                  </td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const CountTableTab = () => (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-light">
        <h5 className="mb-0">Transaction Type Summary</h5>
      </Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table striped hover bordered size="sm">
            <thead className="table-light">
              <tr>
                <th>Transaction Type</th>
                <th className="text-center">Count</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Use API data if available
                if (apiData && apiData.transaction_summary) {
                  const summary = apiData.transaction_summary;
                  return [
                    { type: "Opening Balance", count: summary.opening_balance },
                    { type: "Sales", count: summary.sales },
                    { type: "Receipt", count: summary.receipt },
                    { type: "Sales Return", count: summary.sales_return },
                    { type: "Journal", count: summary.journal },
                    { type: "Contra", count: summary.contra },
                    { type: "Adjustments", count: summary.adjustments },
                  ].map((item, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold">{item.type}</td>
                      <td className="text-center">{item.count}</td>
                    </tr>
                  ));
                }
                
                // Fallback to calculated counts
                const counts = {};
                filteredData.forEach((item) => {
                  const type = item.voucherType;
                  counts[type] = (counts[type] || 0) + 1;
                });
                const labelMap = {
                  Opening: "Opening Balance",
                  Invoice: "Sales",
                  Payment: "Receipt",
                  Return: "Sales Return",
                };
                return Object.entries(labelMap).map(([key, label]) => (
                  <tr key={key}>
                    <td className="fw-bold">{label}</td>
                    <td className="text-center">{counts[key] || 0}</td>
                  </tr>
                ));
              })()}
            </tbody>
            <tfoot>
              <tr className="bg-light fw-bold">
                <td>Total Transactions</td>
                <td className="text-center">
                  {apiData && apiData.transaction_summary 
                    ? apiData.transaction_summary.total_transactions 
                    : filteredData.length}
                </td>
              </tr>
            </tfoot>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );

  const NarrationTab = () => (
    <div>
      {/* Ledger Table */}
      <Card className="mb-4 shadow-sm">
        <Card className="mb-4 border-0 shadow-sm rounded-4">
          <Card.Header className="bg-white border-0 py-3 px-4 d-flex flex-wrap justify-content-between align-items-center custom-ledger-header">
            <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
              <h5 className="mb-0 fw-semibold text-primary">Ledger Transactions</h5>
            </div>

            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                className="rounded-pill fw-medium px-3 py-1 custom-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                className="rounded-pill fw-medium px-3 py-1 custom-btn"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </div>
          </Card.Header>

          {showFilters && (
            <Card.Body className="pt-3 pb-4 px-4 bg-light border-top">
              <Row className="g-3">
                <Col xs={12} sm={6} md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">From Date</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white">
                        <FaCalendarAlt className="text-primary" />
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="shadow-sm"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">To Date</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white">
                        <FaCalendarAlt className="text-primary" />
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="shadow-sm"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Balance Type</Form.Label>
                    <Form.Select
                      value={balanceType}
                      onChange={(e) => setBalanceType(e.target.value)}
                      className="shadow-sm"
                    >
                      <option value="all">All Transactions</option>
                      <option value="debit">Debit Only</option>
                      <option value="credit">Credit Only</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Voucher Type</Form.Label>
                    <Form.Select
                      value={voucherTypeFilter}
                      onChange={(e) => setVoucherTypeFilter(e.target.value)}
                      className="shadow-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="Invoice">Invoice</option>
                      <option value="Payment">Payment</option>
                      <option value="Return">Return</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-secondary">Search</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white">
                        <FaSearch className="text-primary" />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by particulars, voucher no, or item..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="shadow-sm"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          )}
        </Card>
        <Card.Body>
          <div className="table-responsive">
            <Table striped hover className="align-middle">
              <thead className="table-light text-black">
                <tr>
                  <th>Date</th>
                  <th>Particulars</th>
                  <th>VCH NO</th>
                  <th>VCH TYPE</th>
                  <th className="text-end">Debit (Dr)</th>
                  <th className="text-end">Credit (Cr)</th>
                  <th className="text-end">Running Balance</th>
                  {(activeTab === "narration" || activeTab === "all") && <th>Narration</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry) => (
                  <React.Fragment key={entry.id}>
                    <tr>
                      <td>{entry.date}</td>
                      <td>
                        <div
                          className="d-flex align-items-center cursor-pointer"
                          onClick={() => {
                            if (entry.items && entry.items.length > 0) {
                              setExpandedRows((prev) => ({
                                ...prev,
                                [entry.id]: !prev[entry.id],
                              }));
                            }
                          }}
                          style={{ minWidth: "120px" }}
                        >
                          <span className="me-2">
                            {entry.items && entry.items.length > 0 ? (expandedRows[entry.id] ? "▼" : "▶") : " "}
                          </span>
                          <span>{entry.particulars}</span>
                        </div>
                      </td>
                      <td>{entry.voucherNo}</td>
                      <td>
                        <Badge
                          bg={
                            entry.voucherType === "Invoice"
                              ? "primary"
                              : entry.voucherType === "Payment"
                                ? "success"
                                : entry.voucherType === "Return"
                                  ? "warning"
                                  : "secondary"
                          }
                        >
                          {entry.voucherType === "Invoice"
                            ? "Sales"
                            : entry.voucherType === "Payment"
                              ? "Receipt"
                              : entry.voucherType === "Return"
                                ? "Sales Return"
                                : entry.voucherType}
                        </Badge>
                      </td>
                      <td className="text-end">
                        {entry.debit
                          ? entry.debit.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })
                          : ""}
                      </td>
                      <td className="text-end">
                        {entry.credit
                          ? entry.credit.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })
                          : ""}
                      </td>
                      <td className={`text-end ${entry.balanceType === "Dr" ? "text-primary" : "text-success"}`}>
                        {entry.balance}
                      </td>
                      {(activeTab === "narration" || activeTab === "all") && (
                        <td className="text-muted small" style={{ maxWidth: "200px", whiteSpace: "normal" }}>
                          {entry.narration || "—"}
                        </td>
                      )}
                    </tr>
                    {entry.items && entry.items.length > 0 && expandedRows[entry.id] && (
                      <tr>
                        <td colSpan={(activeTab === "narration" || activeTab === "all") ? 8 : 7} className="p-0" style={{ backgroundColor: "#f9f9f9" }}>
                          <div className="p-2 ps-4 bg-light border-top">
                            <Table size="sm" bordered className="mb-0 bg-white shadow-sm" style={{ fontSize: "0.85rem" }}>
                              <thead className="table-light">
                                <tr>
                                  <th>Item / Material</th>
                                  <th>Qty</th>
                                  <th>Rate (₹)</th>
                                  <th>Disc (%)</th>
                                  <th>Tax (%)</th>
                                  <th>Tax Amt (₹)</th>
                                  <th>Value (₹)</th>
                                  <th>Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {entry.items.map((item, idx) => (
                                  <tr key={idx}>
                                    <td className="fw-bold">{item.item}</td>
                                    <td>{item.quantity}</td>
                                    <td>{parseFloat(item.rate).toFixed(3)}</td>
                                    <td>{item.discount}</td>
                                    <td>{item.tax}</td>
                                    <td>₹{parseFloat(item.taxAmt).toFixed(2)}</td>
                                    <td>₹{parseFloat(item.value).toFixed(2)}</td>
                                    <td className="text-muted">{item.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <td colSpan={(activeTab === "narration" || activeTab === "all") ? "5" : "4"} className="text-end fw-bold">
                    Total
                  </td>
                  <td className="text-end fw-bold">
                    {totals.totalDebit.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                  </td>
                  <td className="text-end fw-bold">
                    {totals.totalCredit.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                  </td>
                  <td className="text-end fw-bold">
                    {Math.abs(currentBalance).toLocaleString("en-IN", { style: "currency", currency: "INR" })}{" "}
                    {currentBalance >= 0 ? "Dr" : "Cr"}
                  </td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const ConfirmLetterTab = () => (
    <div>
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Balance Confirmation Letter</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h5 className="mb-3 fw-bold text-success">Our Company</h5>
              <p><strong>Company Name:</strong> {customer.company?.name || "ABC Textiles Pvt Ltd"}</p>
              <p><strong>Address:</strong> {customer.company?.address || "123, Textile Market, Indore, MP 452001"}</p>
              <p><strong>Contact:</strong> {customer.company?.phone || "+91 98765 43210"}</p>
              <p><strong>GSTIN:</strong> 23AABCCDD123E1Z</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <h5 className="mb-3 fw-bold text-primary">Customer Details</h5>
              <p><strong>Name:</strong> {customer.name}</p>
              <p><strong>Company:</strong> {customer.companyName || "N/A"}</p>
              <p><strong>Email:</strong> {customer.email}</p>
              <p><strong>Phone:</strong> {customer.phone}</p>
              <p><strong>Location:</strong>
                <a
                  href={customer.companyLocation}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007bff", textDecoration: "none" }}
                >
                  Click Location
                </a>
              </p>
            </div>
          </div>
          <hr />
          <h6 className="mb-3">Dear {customer.name},</h6>
          <p>This is to confirm that as per our records, your account stands at the following balance:</p>
          <Table bordered size="sm" className="mb-4">
            <thead className="table-light">
              <tr>
                <th>Description</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {apiData && apiData.description_summary ? (
                apiData.description_summary.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.description}</td>
                    <td>{item.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr>
                    <td>Opening Balance</td>
                    <td>{customer.openingBalance.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Total Sales (Dr)</td>
                    <td>{totals.totalDebit.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Total Payments (Cr)</td>
                    <td>{totals.totalCredit.toLocaleString('en-IN')}</td>
                  </tr>
                </>
              )}
              <tr className="table-info fw-bold">
                <td>Current Balance</td>
                <td>
                  {Math.abs(currentBalance).toLocaleString('en-IN')} {currentBalance >= 0 ? "Dr" : "Cr"}
                </td>
              </tr>
            </tbody>
          </Table>
          <p className="fw-bold">We hereby confirm the above balance as correct.</p>
          <div className="d-flex justify-content-between mt-5">
            <div>
              <p><strong>For the Company</strong></p>
              <div style={{ height: "40px", borderBottom: "1px solid #000" }}></div>
              <p className="mt-2">
                <strong>Name:</strong> Accountant<br />
                <strong>Designation:</strong> Accountant<br />
                <strong>Place:</strong> Indore<br />
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>
            <div>
              <p><strong>For Customer</strong></p>
              <div style={{ height: "40px", borderBottom: "1px solid #000" }}></div>
              <p className="mt-2">
                <strong>Name:</strong> {customer.name}<br />
                <strong>Signature:</strong><br />
                <strong>Date:</strong> _______________
              </p>
            </div>
          </div>
          <div className="text-center mt-4">
            <Button
              variant="none"
              size="sm"
              style={{
                backgroundColor: "#53b2a5",
                color: "white",
                border: "none",
                padding: "0.375rem 0.75rem",
                borderRadius: "0.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
              onClick={() => {
                const printWindow = window.open("", "_blank");
                printWindow.document.write(`
              <html>
                <head>
                  <title>Balance Confirmation Letter</title>
                  <style>
                    @page {
                      size: A4;
                      margin: 0.5in;
                    }
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                      padding: 15px;
                      margin: 0;
                      color: #212529;
                      font-size: 12px;
                      line-height: 1.4;
                    }
                    .card {
                      border: 1px solid rgba(0,0,0,.125);
                      border-radius: 0.375rem;
                      box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,.075);
                      background-color: #fff;
                      margin-bottom: 1.5rem;
                    }
                    .card-header {
                      padding: 0.75rem 1.25rem;
                      margin-bottom: 0;
                      background-color: #f8f9fa;
                      border-bottom: 1px solid rgba(0,0,0,.125);
                      border-top-left-radius: calc(0.375rem - 1px);
                      border-top-right-radius: calc(0.375rem - 1px);
                    }
                    .card-body {
                      padding: 1rem;
                    }
                    .mb-4 {
                      margin-bottom: 1rem !important;
                    }
                    .mb-0 {
                      margin-bottom: 0 !important;
                    }
                    .mb-3 {
                      margin-bottom: 0.75rem !important;
                    }
                    .mb-2 {
                      margin-bottom: 0.5rem !important;
                    }
                    .mt-5 {
                      margin-top: 1.5rem !important;
                    }
                    .mt-2 {
                      margin-top: 0.5rem !important;
                    }
                    .mt-4 {
                      margin-top: 1rem !important;
                    }
                    .fw-bold {
                      font-weight: 700 !important;
                    }
                    .text-success {
                      color: #198754 !important;
                    }
                    .text-primary {
                      color: #0d6efd !important;
                    }
                    .text-center {
                      text-align: center !important;
                    }
                    .text-right {
                      text-align: right !important;
                    }
                    .d-flex {
                      display: flex !important;
                    }
                    .justify-content-between {
                      justify-content: space-between !important;
                    }
                    .align-items-start {
                      align-items: flex-start !important;
                    }
                    .table {
                      width: 100%;
                      margin-bottom: 1rem;
                      color: #212529;
                      vertical-align: top;
                      border-color: #dee2e6;
                      font-size: 11px;
                    }
                    .table-bordered {
                      border: 1px solid #dee2e6;
                    }
                    .table-bordered > :not(caption) > * {
                      border-width: 1px;
                    }
                    .table-sm > :not(caption) > * > * {
                      padding: 0.2rem 0.25rem;
                    }
                    .table-light {
                      background-color: #f8f9fa;
                    }
                    .table-info {
                      background-color: #cff4fc;
                    }
                    .table th,
                    .table td {
                      padding: 0.25rem;
                      vertical-align: top;
                      border-top: 1px solid #dee2e6;
                      border-color: #dee2e6;
                    }
                    .table thead th {
                      vertical-align: bottom;
                      border-bottom: 2px solid #dee2e6;
                    }
                    .table-light th,
                    .table-light td,
                    .table-light thead th {
                      background-color: #f8f9fa;
                      border-color: #dee2e6;
                    }
                    hr {
                      margin: 0.75rem 0;
                      color: inherit;
                      border: 0;
                      border-top: 1px solid;
                      opacity: .25;
                    }
                    strong {
                      font-weight: bolder;
                    }
                    p {
                      margin-top: 0;
                      margin-bottom: 0.5rem;
                    }
                    h5 {
                      font-size: 1rem;
                      margin-bottom: 0.5rem;
                    }
                    h6 {
                      font-size: 0.9rem;
                      margin-bottom: 0.5rem;
                    }
                    a {
                      color: #0d6efd;
                      text-decoration: none;
                    }
                    .signature-line {
                      height: 30px;
                      border-bottom: 1px solid #000;
                      margin: 8px 0;
                    }
                    .company-info, .customer-info {
                      flex: 1;
                      min-width: 0;
                    }
                    .signature-section {
                      page-break-inside: avoid;
                    }
                  </style>
                </head>
                <body>
                  <div class="card mb-4 shadow-sm">
                    <div class="card-header bg-light">
                      <h5 class="mb-0">Balance Confirmation Letter</h5>
                    </div>
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start mb-4">
                        <div class="company-info">
                          <h5 class="mb-3 fw-bold text-success">Our Company</h5>
                          <p><strong>Company Name:</strong> ${customer.company?.name || "ABC Textiles Pvt Ltd"}</p>
                          <p><strong>Address:</strong> ${customer.company?.address || "123, Textile Market, Indore, MP 452001"}</p>
                          <p><strong>Contact:</strong> ${customer.company?.phone || "+91 98765 43210"}</p>
                          <p><strong>GSTIN:</strong> 23AABCCDD123E1Z</p>
                          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                        <div class="customer-info text-right">
                          <h5 class="mb-3 fw-bold text-primary">Customer Details</h5>
                          <p><strong>Name:</strong> ${customer.name}</p>
                          <p><strong>Company:</strong> ${customer.companyName || "N/A"}</p>
                          <p><strong>Email:</strong> ${customer.email}</p>
                          <p><strong>Phone:</strong> ${customer.phone}</p>
                          <p><strong>Location:</strong> Click Location</p>
                        </div>
                      </div>
                      <hr />
                      <h6 class="mb-3">Dear ${customer.name},</h6>
                      <p>This is to confirm that as per our records, your account stands at the following balance:</p>
                      <table class="table table-bordered table-sm mb-4">
                        <thead class="table-light">
                          <tr>
                            <th>Description</th>
                            <th>Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${apiData && apiData.description_summary ? 
                            apiData.description_summary.map(item => 
                              `<tr>
                                <td>${item.description}</td>
                                <td>${item.amount.toLocaleString('en-IN')}</td>
                              </tr>`
                            ).join('')
                            : 
                            `<tr>
                              <td>Opening Balance</td>
                              <td>${customer.openingBalance.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                              <td>Total Sales (Dr)</td>
                              <td>${totals.totalDebit.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                              <td>Total Payments (Cr)</td>
                              <td>${totals.totalCredit.toLocaleString('en-IN')}</td>
                            </tr>`
                          }
                          <tr class="table-info fw-bold">
                            <td>Current Balance</td>
                            <td>
                              ${Math.abs(currentBalance).toLocaleString('en-IN')} ${currentBalance >= 0 ? "Dr" : "Cr"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <p class="fw-bold">We hereby confirm the above balance as correct.</p>
                      <div class="d-flex justify-content-between mt-5 signature-section">
                        <div>
                          <p><strong>For the Company</strong></p>
                          <div class="signature-line"></div>
                          <p class="mt-2">
                            <strong>Name:</strong> Rajesh Sharma<br />
                            <strong>Designation:</strong> Accountant<br />
                            <strong>Place:</strong> Indore<br />
                            <strong>Date:</strong> ${new Date().toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p><strong>For Customer</strong></p>
                          <div class="signature-line"></div>
                          <p class="mt-2">
                            <strong>Name:</strong> ${customer.name}<br />
                            <strong>Signature:</strong><br />
                            <strong>Date:</strong> _______________
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </body>
              </html>
            `);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
              }}
            >
              Print Confirmation
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  // Render logic based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "all":
        return (
          <>
            <CustomerDetailsTab />
            {/* <ItemsDetailsTab /> */}
            <CountTableTab />
            <NarrationTab />
            <ConfirmLetterTab />
          </>
        );
      case "customerDetails":
        return <CustomerDetailsTab />;
      case "itemsDetails":
        return <ItemsDetailsTab />;
      case "countTable":
        return <CountTableTab />;
      case "narration":
        return <NarrationTab />;
      case "confirmLetter":
        return <ConfirmLetterTab />;
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="container">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate(-1)}
              className="d-flex align-items-center px-3 py-2"
            >
              <span className="me-1">←</span> Back to Customers
            </Button>
          </div>
          <h2 className="mb-0 text-center flex-grow-1">
            {ledgerType === "customer" ? `Customer Ledger - ${customer.name}` : "Vendor Ledger - Sharma Suppliers"}
          </h2>
          <div className="d-flex gap-2">
            <Button
              variant="light"
              size="sm"
              className="d-flex align-items-center px-3 py-2 shadow-sm border"
              onClick={exportToExcel}
            >
              <FaFileExport className="me-2" />
              <span className="small fw-medium">Excel</span>
            </Button>
            <Button
              variant="light"
              size="sm"
              className="d-flex align-items-center px-3 py-2 shadow-sm border"
              onClick={exportToPDF}
            >
              <FaFilePdf className="me-2" />
              <span className="small fw-medium">PDF</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="border-left-primary shadow h-100 py-2">
              <Card.Body>
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Total Debit</div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {totals.totalDebit.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="btn-circle btn-sm btn-primary">Dr</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-left-success shadow h-100 py-2">
              <Card.Body>
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Total Credit</div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {totals.totalCredit.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="btn-circle btn-sm btn-success">Cr</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className={`border-left-${currentBalance >= 0 ? "info" : "danger"} shadow h-100 py-2`}>
              <Card.Body>
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-uppercase mb-1">Current Balance</div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {Math.abs(currentBalance).toLocaleString("en-IN", { style: "currency", currency: "INR" })}{" "}
                      {currentBalance >= 0 ? "Dr" : "Cr"}
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className={`btn-circle btn-sm btn-${currentBalance >= 0 ? "info" : "danger"}`}>
                      {currentBalance >= 0 ? "Dr" : "Cr"}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <div className="mb-4 border-3 p-1">
          <Card.Body className="p-0">
            <Nav
              variant="tabs"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="px-3 custom-tabs"
            >
              <Nav.Item>
                <Nav.Link eventKey="all">All</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="customerDetails">Customer Details</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="itemsDetails" disabled={!hasItems}>
                  Items Details
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="countTable">Count of Transaction</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="narration">Narration</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="confirmLetter">Confirm Balance</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Body>
        </div>

        {/* Tab Content */}
        <Tab.Content activeKey={activeTab}>
          {renderContent()}
        </Tab.Content>
      </div>
    </div>
  );
};

export default Ledgercustomer;