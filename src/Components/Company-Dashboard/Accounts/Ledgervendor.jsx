import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "react-router-dom";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import {
  FaCalendarAlt,
  FaSearch,
  FaFileExport,
  FaFilePdf,
  FaGlobe,
} from "react-icons/fa";
import { Button, Card, Row, Col, Form, InputGroup, Table, Badge, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Ledgervendor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const companyId = GetCompanyId();
  // State for API data
  const [vendorData, setVendorData] = useState(null);
  const [ledgerSummary, setLedgerSummary] = useState(null);
  const [transactionSummary, setTransactionSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const passedVendor = location.state?.vendor;

  // State for filters and UI
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-11-30");
  const [balanceType, setBalanceType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState({});
  const [showConfirmLetter, setShowConfirmLetter] = useState(false);
  const [letterType, setLetterType] = useState("vendor");

  // Fetch data from API
  useEffect(() => {
    const fetchVendorLedger = async () => {
      if (!companyId) {
        setError("Company ID not found");
        setLoading(false);
        return;
      }
      if (!passedVendor || !passedVendor.id) {
        setError("Vendor ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/vendorCustomer/vendor-ledger/${passedVendor.id}/${companyId}`
        );
        const result = response.data;

        if (result.vendor) {
          // Map vendor data exactly as in API
          setVendorData(result.vendor);
          setLedgerSummary(result.ledger_summary);
          setTransactionSummary(result.transaction_summary);

          // Map transactions
          const processedTransactions = (result.transactions || []).map((t, index) => ({
            id: index, // API doesn't provide ID, so use index
            date: t.date ? new Date(t.date).toISOString().split("T")[0] : "N/A",
            particulars: t.particulars || "",
            vch_type: t.vch_type || "",
            vch_no: t.vch_no || "",
            debit: parseFloat(t.debit) || 0,
            credit: parseFloat(t.credit) || 0,
            balance: parseFloat(t.balance) || 0,
            balanceType: t.balance >= 0 ? "Dr" : "Cr",
            items: t.items || [],
            narration: t.narration || "",
          }));

          setTransactions(processedTransactions);
        }
      } catch (err) {
        console.error("Error fetching vendor ledger:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorLedger();
  }, [companyId, passedVendor]);

  // Use API data if available, with safe fallbacks
  const currentVendor = vendorData || {
    name_english: "Unknown Vendor",
    name_arabic: "",
    company_name: "N/A",
    email: "N/A",
    phone: "N/A",
    address: "N/A",
    shipping_address: "Same as above",
    country: "India",
    state: "N/A",
    pincode: "N/A",
    state_code: "N/A",
    gstIn: "N/A",
    account_balance: 0,
    account_name: "Sundry Creditors",
    credit_period_days: "30",
    bank_account_number: "N/A",
    bank_ifsc: "N/A",
    bank_name_branch: "N/A",
    google_location: "",
    creation_date: new Date().toISOString(),
    company: {},
  };

  const currentSummary = ledgerSummary || {
    opening_balance: 0,
    total_purchases: 0,
    total_returns: 0,
    total_payments: 0,
    balance: 0,
    balance_type: "Cr",
  };

  const resetFilters = () => {
    setFromDate("2025-01-01");
    setToDate("2025-11-30");
    setBalanceType("all");
    setVoucherTypeFilter("all");
    setSearchQuery("");
  };

  const exportToExcel = () => alert("Export to Excel functionality");
  const exportToPDF = () => alert("Export to PDF functionality");

  // Calculate totals
  const totals = transactions.reduce(
    (acc, transaction) => {
      acc.totalDebit += transaction.debit;
      acc.totalCredit += transaction.credit;
      return acc;
    },
    { totalDebit: 0, totalCredit: 0 }
  );

  // Determine visibility based on activeTab
  const showVendorDetails = activeTab === "all" || activeTab === "customerDetails";
  const showNarration = activeTab === "narration";
  const showCountTable = activeTab === "all" || activeTab === "countTable";
  const showTable = ["all", "itemsDetails"].includes(activeTab);

  // Check if any transaction has items
  const hasItems = transactions.some((transaction) => transaction.items && transaction.items.length > 0);
  
  // Get opening balance info from description_summary
  const getOpeningBalanceInfo = () => {
    // First try to get from description_summary
    if (ledgerSummary && ledgerSummary.description_summary) {
      const opening = ledgerSummary.description_summary.find(item => item.description === "Opening Balance");
      if (opening) {
        return {
          amount: opening.amount,
          type: opening.type
        };
      }
    }
    
    // Fallback to ledger_summary.outstanding_balance if available
    if (ledgerSummary && ledgerSummary.outstanding_balance) {
      return {
        amount: ledgerSummary.outstanding_balance.amount,
        type: ledgerSummary.outstanding_balance.type
      };
    }
    
    // Final fallback to currentSummary.balance
    return {
      amount: currentSummary.balance,
      type: currentSummary.balance_type
    };
  };

  const openingInfo = getOpeningBalanceInfo();

  return (
    <div className="container mt-4">
      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="d-flex align-items-center px-3 py-1"
        >
          <span className="me-1">←</span> Back to Vendors
        </Button>
        <h4 className="fw-bold mb-0 text-dark text-center flex-grow-1">
          Vendor Ledger - {currentVendor.name_english}
        </h4>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="border-left-secondary shadow h-100 py-2">
            <Card.Body>
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs font-weight-bold text-secondary text-uppercase mb-1">
                        Opening Balance
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {typeof openingInfo.amount === "number"
                      ? openingInfo.amount.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })
                      : "₹0.00"}{" "}
                    {openingInfo.type}
                  </div>
                </div>
                <div className="col-auto">
                  <div
                    className={`btn-circle btn-sm btn-${openingInfo.type === "Cr" ? "info" : "secondary"
                      }`}
                  >
                    {openingInfo.type}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-left-primary shadow h-100 py-2">
            <Card.Body>
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        Total Payments (Dr)
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {typeof currentSummary.total_payments === "number"
                      ? currentSummary.total_payments.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })
                      : "₹0.00"}
                  </div>
                </div>
                <div className="col-auto">
                  <div className="btn-circle btn-sm btn-primary">Dr</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-left-success shadow h-100 py-2">
            <Card.Body>
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                        Total Purchases (Cr)
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {typeof currentSummary.total_purchases === "number"
                      ? currentSummary.total_purchases.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })
                      : "₹0.00"}
                  </div>
                </div>
                <div className="col-auto">
                  <div className="btn-circle btn-sm btn-success">Cr</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            className={`border-left-${currentSummary.balance_type === "Cr" ? "info" : "danger"
              } shadow h-100 py-2`}
          >
            <Card.Body>
              <div className="row align-items-center">
                <div className="col">
                  <div className="text-xs font-weight-bold text-uppercase mb-1">Current Balance</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {typeof currentSummary.balance === "number"
                      ? Math.abs(currentSummary.balance).toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })
                      : "₹0.00"}{" "}
                    {currentSummary.balance_type}
                  </div>
                </div>
                <div className="col-auto">
                  <div
                    className={`btn-circle btn-sm btn-${currentSummary.balance_type === "Cr" ? "info" : "danger"
                      }`}
                  >
                    {currentSummary.balance_type}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Tabs */}
      <div className="mb-4 border-3 p-1">
        <Card.Body className="p-0">
          <Nav
            variant="tabs"
            activeKey={activeTab}
            onSelect={(k) => {
              setActiveTab(k);
              if (k === "confirmLetter") {
                setLetterType("vendor");
                setShowConfirmLetter(true);
              } else {
                setShowConfirmLetter(false);
              }
            }}
            className="px-3 custom-tabs"
          >
            <Nav.Item>
              <Nav.Link eventKey="all">All</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="customerDetails">Vendor Details</Nav.Link>
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
            <button className="btn btn-success">Send to Email</button>
          </Nav>
        </Card.Body>
      </div>

      {/* Confirm Letter */}
      {showConfirmLetter && (
        <Card className="mt-3 border mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h5 className="mb-3 fw-bold text-primary">Our Company</h5>
                <p><strong>Company Name:</strong> {currentVendor.company?.name || "N/A"}</p>
                <p><strong>Address:</strong> {currentVendor.company?.address || "N/A"}</p>
                <p><strong>Contact:</strong> {currentVendor.company?.phone || "N/A"}</p>
                <p><strong>GSTIN:</strong> N/A</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-end">
                <h5 className="mb-3 fw-bold text-success">Vendor Details</h5>
                <p><strong>Name:</strong> {currentVendor.name_english || "N/A"}</p>
                <p><strong>Company:</strong> {currentVendor.company_name || "N/A"}</p>
                <p><strong>Email:</strong> {currentVendor.email || "N/A"}</p>
                <p><strong>Phone:</strong> {currentVendor.phone || "N/A"}</p>
                <p><strong>GSTIN:</strong> {currentVendor.gstIn || "N/A"}</p>
              </div>
            </div>
            <hr />
            <h6 className="mb-3">Dear {currentVendor.name_english},</h6>
            <p>This is to confirm that as per our records, your account stands at the following balance:</p>
            <Table bordered size="sm" className="mb-4">
              <thead className="table-light">
                <tr>
                  <th>Description</th>
                  <th>Amount (₹)</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Opening Balance</td>
                  <td>
                    {typeof openingInfo.amount === "number"
                      ? Math.abs(openingInfo.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })
                      : "0.00"}
                  </td>
                  <td>{openingInfo.type}</td>
                </tr>
                <tr>
                  <td>Total Purchases (Cr)</td>
                  <td>
                    {typeof currentSummary.total_purchases === "number"
                      ? currentSummary.total_purchases.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })
                      : "0.00"}
                  </td>
                  <td>Cr</td>
                </tr>
                <tr>
                  <td>Total Returns (Dr)</td>
                  <td>
                    {typeof currentSummary.total_returns === "number"
                      ? currentSummary.total_returns.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })
                      : "0.00"}
                  </td>
                  <td>Dr</td>
                </tr>
                <tr>
                  <td>Total Payments (Dr)</td>
                  <td>
                    {typeof currentSummary.total_payments === "number"
                      ? currentSummary.total_payments.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })
                      : "0.00"}
                  </td>
                  <td>Dr</td>
                </tr>
                <tr className="table-info fw-bold">
                  <td>Current Balance</td>
                  <td>
                    {typeof currentSummary.balance === "number"
                      ? Math.abs(currentSummary.balance).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })
                      : "0.00"}
                  </td>
                  <td>{currentSummary.balance_type}</td>
                </tr>
              </tbody>
            </Table>
            <p className="fw-bold">We hereby confirm the above balance as correct.</p>
            <div className="d-flex justify-content-between mt-5">
              <div>
                <p><strong>For Company</strong></p>
                <div style={{ height: "40px", borderBottom: "1px solid #000" }}></div>
                <p className="mt-2">
                  <strong>Name:</strong> Accountant<br />
                  <strong>Designation:</strong> Accountant<br />
                  <strong>Place:</strong> {currentVendor.company?.address?.split(",")[1] || "N/A"}<br />
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <p><strong>For Vendor</strong></p>
                <div style={{ height: "40px", borderBottom: "1px solid #000" }}></div>
                <p className="mt-2">
                  <strong>Name:</strong> {currentVendor.name_english || "N/A"}<br />
                  <strong>Signature:</strong><br />
                  <strong>Date:</strong> _______________
                </p>
              </div>
            </div>
            <div className="text-center mt-4">
              <Button
                variant="primary"
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
                <title>Balance Confirmation</title>
                <style>
                  @page { size: A4; margin: 10mm; }
                  body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; }
                  .container { max-width: 800px; margin: 0 auto; }
                  .header { text-align: center; margin-bottom: 15px; }
                  .company-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
                  .company-info div { width: 48%; }
                  .company-info p { margin: 3px 0; font-size: 12px; }
                  .company-info h5 { margin: 0 0 8px 0; font-size: 14px; }
                  hr { border: none; border-top: 1px solid #ccc; margin: 15px 0; }
                  .greeting { margin-bottom: 10px; }
                  .balance-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
                  .balance-table th, .balance-table td { border: 1px solid #ddd; padding: 6px; text-align: left; }
                  .balance-table th { background-color: #f2f2f2; font-weight: bold; }
                  .balance-table .total-row { background-color: #e9f7fe; font-weight: bold; }
                  .confirmation-text { font-weight: bold; margin: 15px 0; }
                  .signatures { display: flex; justify-content: space-between; margin-top: 30px; }
                  .signature-block { width: 48%; }
                  .signature-block p { margin: 3px 0; font-size: 12px; }
                  .signature-line { border-bottom: 1px solid black; height: 20px; margin: 8px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h2>BALANCE CONFIRMATION LETTER</h2>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                  </div>
                  <div class="company-info">
                    <div>
                      <h5 style="color: #0d6efd;">Our Company</h5>
                      <p><strong>Company Name:</strong> ${currentVendor.company?.name || "N/A"}</p>
                      <p><strong>Address:</strong> ${currentVendor.company?.address || "N/A"}</p>
                      <p><strong>Contact:</strong> ${currentVendor.company?.phone || "N/A"}</p>
                      <p><strong>GSTIN:</strong> N/A</p>
                    </div>
                    <div style="text-align: right;">
                      <h5 style="color: #198754;">Vendor Details</h5>
                      <p><strong>Name:</strong> ${currentVendor.name_english || "N/A"}</p>
                      <p><strong>Company:</strong> ${currentVendor.company_name || "N/A"}</p>
                      <p><strong>Email:</strong> ${currentVendor.email || "N/A"}</p>
                      <p><strong>Phone:</strong> ${currentVendor.phone || "N/A"}</p>
                      <p><strong>GSTIN:</strong> ${currentVendor.gstIn || "N/A"}</p>
                    </div>
                  </div>
                  <hr>
                  <div class="greeting">
                    <p>Dear ${currentVendor.name_english || ""},</p>
                    <p>This is to confirm that as per our records, your account stands at the following balance:</p>
                  </div>
                  <table class="balance-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Amount (₹)</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Opening Balance</td>
                        <td>${typeof openingInfo.amount === "number" ? Math.abs(openingInfo.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</td>
                        <td>${openingInfo.type}</td>
                      </tr>
                      <tr>
                        <td>Total Purchases (Cr)</td>
                        <td>${typeof currentSummary.total_purchases === "number" ? currentSummary.total_purchases.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</td>
                        <td>Cr</td>
                      </tr>
                      <tr>
                        <td>Total Returns (Dr)</td>
                        <td>${typeof currentSummary.total_returns === "number" ? currentSummary.total_returns.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</td>
                        <td>Dr</td>
                      </tr>
                      <tr>
                        <td>Total Payments (Dr)</td>
                        <td>${typeof currentSummary.total_payments === "number" ? currentSummary.total_payments.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</td>
                        <td>Dr</td>
                      </tr>
                      <tr class="total-row">
                        <td>Current Balance</td>
                        <td>${typeof currentSummary.balance === "number" ? Math.abs(currentSummary.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}</td>
                        <td>${currentSummary.balance_type}</td>
                      </tr>
                    </tbody>
                  </table>
                  <p class="confirmation-text">We hereby confirm the above balance as correct.</p>
                  <div class="signatures">
                    <div class="signature-block">
                      <p><strong>For Company</strong></p>
                      <div class="signature-line"></div>
                      <p><strong>Name:</strong> Accountant</p>
                      <p><strong>Designation:</strong> Accountant</p>
                      <p><strong>Place:</strong> ${currentVendor.company?.address?.split(",")[1] || "N/A"}</p>
                      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                    <div class="signature-block">
                      <p><strong>For Vendor</strong></p>
                      <div class="signature-line"></div>
                      <p><strong>Name:</strong> ${currentVendor.name_english || "N/A"}</p>
                      <p><strong>Signature:</strong></p>
                      <p><strong>Date:</strong> _______________</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `);
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                  }, 500);
                }}
              >
                🖨️ Print Confirmation
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="ms-2"
                onClick={() => setShowConfirmLetter(false)}
              >
                Close
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Vendor Details */}
      {showVendorDetails && (
        <Card
          className="mt-3 mb-3"
          style={{
            borderRadius: "12px",
            border: "1px solid #dee2e6",
            backgroundColor: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <Card.Body className="p-3">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Vendor Details</h5>
            <Row className="g-3">
              <Col md={4}>
                <div style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "15px" }}>
                  <h6 className="fw-semibold mb-3 text-muted">Personal Info</h6>
                  <p className="mb-2">
                    <i className="bi bi-person text-success me-2"></i>
                    <strong>Name:</strong> {currentVendor.name_english || "N/A"}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-building text-success me-2"></i>
                    <strong>Company:</strong> {currentVendor.company_name || "N/A"}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-telephone text-success me-2"></i>
                    <strong>Phone:</strong> {currentVendor.phone || "N/A"}
                  </p>
                  <p className="mb-0">
                    <i className="bi bi-envelope text-success me-2"></i>
                    <strong>Email:</strong> {currentVendor.email || "N/A"}
                  </p>
                  <p className="mb-0 d-flex align-items-center">
                    <FaGlobe className="me-2" style={{ color: "#53b2a5" }} />
                    <span>
                      <strong>Location:</strong>{" "}
                      <a
                        href={currentVendor.google_location || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#007bff" }}
                      >
                        Click Location
                      </a>
                    </span>
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "15px" }}>
                  <h6 className="fw-semibold mb-3 text-muted">Address Info</h6>
                  <p className="mb-2">
                    <i className="bi bi-geo-alt text-success me-2"></i>
                    <strong>Address:</strong> {currentVendor.address}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-truck text-success me-2"></i>
                    <strong>Shipping:</strong> {currentVendor.shipping_address || "Same as above"}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-globe text-success me-2"></i>
                    <strong>Country:</strong> {currentVendor.country || "India"}
                  </p>
                  <p className="mb-0">
                    <i className="bi bi-flag text-success me-2"></i>
                    <strong>State:</strong> {currentVendor.state || "N/A"}
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "15px" }}>
                  <h6 className="fw-semibold mb-3 text-muted">Financial Info</h6>
                  <p className="mb-2">
                    <i className="bi bi-hash text-success me-2"></i>
                    <strong>Pincode:</strong> {currentVendor.pincode || "N/A"}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-file-earmark-text text-success me-2"></i>
                    <strong>GSTIN:</strong> {currentVendor.gstIn || "N/A"}
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-calendar text-success me-2"></i>
                    <strong>Credit Period:</strong> {currentVendor.credit_period_days || "N/A"} days
                  </p>
                  <p className="mb-0">
                    <i className="bi bi-cash-stack text-success me-2"></i>
                    <strong>Balance:</strong> ₹
                    {parseFloat(currentVendor.account_balance || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Transaction Count Table */}
      {showCountTable && (
        <Card className="mt-3 mb-3">
          <Card.Body>
            <h5 className="mb-3">Transaction Summary</h5>
            <div className="table-responsive">
              <Table striped hover bordered className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Transaction Type</th>
                    <th className="text-center">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const countsToUse = transactionSummary || {};
                    const apiKeysOrder = [
                      "opening_balance",
                      "purchase",
                      "payment",
                      "purchase_return",
                      "expense",
                      "receipt",
                      "sales_return",
                      "manufacturing",
                      "stock_journal",
                      "stock_adjustment",
                      "banking",
                      "journal",
                    ];
                    return apiKeysOrder.map((key) => {
                      const count = countsToUse[key] || 0;
                      const displayLabel = key
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");
                      return (
                        <tr key={key}>
                          <td className="py-2">{displayLabel}</td>
                          <td className="text-center fw-bold py-2">{count}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
                <tfoot>
                  <tr className="bg-light fw-bold">
                    <td>Total Transactions</td>
                    <td className="text-center">
                      {transactionSummary?.total_transactions || transactions.length}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Main Ledger Table */}
      {(showTable || showNarration) && (
        <div>
          <Card className="mb-4">
            <Card.Header className="text-white d-flex justify-content-between align-items-center">
              <Badge bg="light" text="dark">{transactions.length} transaction(s)</Badge>
              <div className="d-flex align-items-center gap-2">
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
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="me-2"
                  >
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>
                <Badge bg="warning" text="dark">Vendor Ledger</Badge>
              </div>
              {showFilters && (
                <Card className="mb-4 bg-light">
                  <Card.Body>
                    <Row className="g-3">
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group>
                          <Form.Label>From Date</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>
                              <FaCalendarAlt />
                            </InputGroup.Text>
                            <Form.Control
                              type="date"
                              value={fromDate}
                              onChange={(e) => setFromDate(e.target.value)}
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group>
                          <Form.Label>To Date</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>
                              <FaCalendarAlt />
                            </InputGroup.Text>
                            <Form.Control
                              type="date"
                              value={toDate}
                              onChange={(e) => setToDate(e.target.value)}
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group>
                          <Form.Label>Balance Type</Form.Label>
                          <Form.Select
                            value={balanceType}
                            onChange={(e) => setBalanceType(e.target.value)}
                          >
                            <option value="all">All Transactions</option>
                            <option value="debit">Payments Only (Debit)</option>
                            <option value="credit">Purchases Only (Credit)</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group>
                          <Form.Label>Voucher Type</Form.Label>
                          <Form.Select
                            value={voucherTypeFilter}
                            onChange={(e) => setVoucherTypeFilter(e.target.value)}
                          >
                            <option value="all">All Types</option>
                            <option value="Opening">Opening</option>
                            <option value="Purchase">Purchase</option>
                            <option value="Payment">Payment</option>
                            <option value="Purchase Return">Purchase Return</option>
                            <option value="Expense">Expense</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="g-3 mt-3">
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>Search</Form.Label>
                          <InputGroup>
                            <InputGroup.Text>
                              <FaSearch />
                            </InputGroup.Text>
                            <Form.Control
                              type="text"
                              placeholder="Search by voucher, description, narration, or item..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
              <div className="table-responsive">
                <Table striped hover bordered className="shadow-sm align-middle">
                  <thead className="table-light border">
                    <tr className="py-2">
                      <th className="py-2">Date</th>
                      <th className="py-2">Particulars</th>
                      <th>VCH NO</th>
                      <th>VCH TYPE</th>
                      <th className="text-end">Debit (Dr)</th>
                      <th className="text-end">Credit (Cr)</th>
                      <th className="text-end">Balance</th>
                      {showNarration && <th>Narration</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map((entry) => (
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
                              >
                                <span className="me-2">
                                  {entry.items && entry.items.length > 0
                                    ? expandedRows[entry.id]
                                      ? "▼"
                                      : "▶"
                                    : " "}
                                </span>
                                <span>{entry.particulars}</span>
                              </div>
                            </td>
                            <td>{entry.vch_no}</td>
                            <td>
                              <Badge
                                bg={
                                  entry.vch_type === "Opening"
                                    ? "secondary"
                                    : entry.vch_type === "Purchase"
                                      ? "primary"
                                      : entry.vch_type === "Payment"
                                        ? "success"
                                        : entry.vch_type === "Purchase Return"
                                          ? "warning"
                                          : entry.vch_type === "Expense"
                                            ? "info"
                                            : "dark"
                                }
                              >
                                {entry.vch_type}
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
                            <td
                              className={`text-end ${entry.balanceType === "Cr" ? "text-success" : "text-danger"
                                }`}
                            >
                              {Math.abs(entry.balance).toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                              })}{" "}
                              {entry.balanceType}
                            </td>
                            {showNarration && (
                              <td className="text-muted small" style={{ maxWidth: "200px", whiteSpace: "normal" }}>
                                {entry.narration || "—"}
                              </td>
                            )}
                          </tr>
                          {entry.items && entry.items.length > 0 && expandedRows[entry.id] && (
                            <tr>
                              <td className="text-muted" style={{ fontSize: "0.8rem" }}>
                                ••
                              </td>
                              <td colSpan={showNarration ? 7 : 6} className="p-0">
                                <div className="bg-light border-top">
                                  <Table striped hover className="mb-0" size="sm">
                                    <thead className="table-light">
                                      <tr>
                                        <th>ITEM / MATERIAL</th>
                                        <th>QUANTITY</th>
                                        <th>RATE (₹)</th>
                                        <th>VALUE (₹)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {entry.items.map((item, idx) => (
                                        <tr key={`${entry.id}_item_${idx}`}>
                                          <td className="fw-bold">{item.item_name}</td>
                                          <td>{item.quantity}</td>
                                          <td>{parseFloat(item.rate || 0).toFixed(3)}</td>
                                          <td>₹{parseFloat(item.value || 0).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={showNarration ? 8 : 7} className="text-center py-4 text-muted">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan={showNarration ? 4 : 3} className="text-end fw-bold">
                        Total
                      </td>
                      <td className="text-end fw-bold">
                        {typeof totals.totalDebit === "number"
                          ? totals.totalDebit.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })
                          : "₹0.00"}
                      </td>
                      <td className="text-end fw-bold">
                        {typeof totals.totalCredit === "number"
                          ? totals.totalCredit.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })
                          : "₹0.00"}
                      </td>
                      <td className="text-end fw-bold">
                        {currentSummary && typeof currentSummary.balance === "number"
                          ? `${Math.abs(currentSummary.balance).toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })} ${currentSummary.balance_type}`
                          : "₹0.00 Cr"}
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Ledgervendor;