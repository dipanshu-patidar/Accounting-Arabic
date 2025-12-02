import React, { useState, useEffect } from "react";
import { FaFilePdf, FaFileExcel, FaTrash, FaEye } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Daybook.css";
import { Card, Modal, Button, Badge } from "react-bootstrap";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";

const Daybook = () => {
  const predefinedAccounts = [
    "Cash-in-hand", "Bank A/Cs", "Sundry Debtors", "Sundry Creditors",
    "Purchases A/C", "Purchases Return", "Sales A/C", "Sales Return",
    "Capital A/C", "Direct Expenses", "Indirect Expenses", "Current Assets",
    "Current Liabilities", "Misc. Expenses", "Electricity", "Office Supplies",
    "Salaries", "Rent", "Depreciation", "Equipment", "Client Payment",
    "Customer A", "Interest Income", "Bank B"
  ];
  const companyId = GetCompanyId();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [viewEntry, setViewEntry] = useState(null);

  // Filters
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [minAmountFilter, setMinAmountFilter] = useState("");
  const [maxAmountFilter, setMaxAmountFilter] = useState("");

  // Fetch data from API
  useEffect(() => {
    const fetchDaybook = async () => {
      try {
        const companyId = GetCompanyId(); // Assumes this returns e.g. "3"
        const response = await axiosInstance.get(`daybook/${companyId}`);
        if (response.data.success && Array.isArray(response.data.data)) {
          // Normalize API data to match your UI structure
          const normalized = response.data.data.map(item => {
            // Determine actual debit/credit account (ignore "-")
            const debit = item.debit_account !== "-" ? item.debit_account : item.credit_account;
            const credit = item.credit_account !== "-" ? item.credit_account : item.debit_account;

            // Amounts
            const debitAmount = item.debit_amount || 0;
            const creditAmount = item.credit_amount || 0;

            return {
              id: item.id,
              voucherDate: item.voucher_date,
              voucherNo: item.voucher_no,
              voucherType: item.voucher_type,
              debit,
              credit,
              debitAmount,
              creditAmount,
              narration: item.narration || "",
            };
          });
          setEntries(normalized);
        }
      } catch (error) {
        console.error("Failed to fetch daybook:", error);
        // Optionally set toast message here
      } finally {
        setLoading(false);
      }
    };

    fetchDaybook();
  }, []);

  // Rest of your code remains mostly the same...

  const totalEntries = entries.length;
  const totalDebit = entries.reduce((sum, entry) => sum + entry.debitAmount, 0);
  const totalCredit = entries.reduce((sum, entry) => sum + entry.creditAmount, 0);
  const netBalance = totalDebit - totalCredit;

  const filteredEntries = entries.filter((entry) => {
    const isVoucherTypeMatch =
      !voucherTypeFilter || entry.voucherType === voucherTypeFilter;
    const isDateInRange =
      (!dateFromFilter || entry.voucherDate >= dateFromFilter) &&
      (!dateToFilter || entry.voucherDate <= dateToFilter);
    const isAmountInRange =
      (!minAmountFilter || entry.debitAmount >= parseFloat(minAmountFilter)) &&
      (!maxAmountFilter || entry.debitAmount <= parseFloat(maxAmountFilter));
    return isVoucherTypeMatch && isDateInRange && isAmountInRange;
  });

  const handleDelete = (entry) => setDeleteEntry(entry);

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`daybook/${deleteEntry.id}`);
      setEntries(entries.filter((entry) => entry.id !== deleteEntry.id));
      setDeleteEntry(null);
    } catch (error) {
      console.error("Delete failed:", error);
      // Show toast instead of modal error
    }
  };

  const handleView = (entry) => setViewEntry(entry);

  const getVoucherTypeBadgeColor = (type) => {
    switch (type) {
      case "Payment":
      case "Expense":
      case "Purchase":
        return "bg-danger";
      case "Receipt":
      case "Income":
      case "Sales":
      case "Interest Income":
        return "bg-success";
      case "Contra":
        return "bg-warning text-dark";
      case "Journal":
        return "bg-primary";
      case "Credit Note":
      case "Debit Note":
        return "bg-info text-dark";
      case "Opening Balance":
        return "bg-secondary";
      case "Delivery Challans":
        return "bg-purple"; // ensure .bg-purple is defined in CSS
      default:
        return "bg-secondary";
    }
  };

  if (loading) {
    return (
      <div className="container-fluid bg-light py-4 px-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading Daybook...</p>
        </div>
      </div>
    );
  }

  // 👇 Then render your JSX (same as before, but using real `entries`)
  return (
    <div className="py-4 px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-1">DayBook</h5>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-light border text-danger"><FaFilePdf /></button>
          <button className="btn btn-light border text-success"><FaFileExcel /></button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4 g-4">
        <div className="col-md-3">
          <Card className="shadow-sm border-0 rounded-3" style={{ backgroundColor: "#e3f2fd" }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-semibold mb-1 text-dark">{totalEntries}</h5>
                <div className="text-muted small">Total Entries</div>
              </div>
              <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm">
                <span className="text-primary fs-5">📝</span>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="shadow-sm border-0 rounded-3" style={{ backgroundColor: "#e8f5e9" }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-semibold mb-1 text-dark">${totalDebit.toLocaleString()}</h5>
                <div className="text-muted small">Total Debit</div>
              </div>
              <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm">
                <span className="text-success fs-5">💰</span>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="shadow-sm border-0 rounded-3" style={{ backgroundColor: "#fff3e0" }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-semibold mb-1 text-dark">${totalCredit.toLocaleString()}</h5>
                <div className="text-muted small">Total Credit</div>
              </div>
              <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm">
                <span className="text-warning fs-5">💳</span>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="shadow-sm border-0 rounded-3" style={{ backgroundColor: netBalance >= 0 ? "#e8f5e9" : "#ffebee" }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-semibold mb-1 text-dark">${netBalance.toLocaleString()}</h5>
                <div className="text-muted small">Net Balance</div>
              </div>
              <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm">
                <span className={netBalance >= 0 ? "text-success fs-5" : "text-danger fs-5"}>⚖️</span>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Filter Section */}
      <div className="row mb-3" style={{ gap: "10px" }}>
        <div className="col-md-auto">
          <select
            className="form-select"
            value={voucherTypeFilter}
            onChange={(e) => setVoucherTypeFilter(e.target.value)}
            style={{ minWidth: "160px" }}
          >
            <option value="">All Voucher Types</option>
            {["Payment", "Receipt", "Expense", "Income", "Contra", "Journal", "Credit Note", "Debit Note", "Opening Balance", "Sales", "Purchase", "Delivery Challans"].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="col-md-auto">
          <input
            type="date"
            className="form-control"
            value={dateFromFilter}
            onChange={(e) => setDateFromFilter(e.target.value)}
          />
        </div>
        <div className="col-md-auto">
          <input
            type="date"
            className="form-control"
            value={dateToFilter}
            onChange={(e) => setDateToFilter(e.target.value)}
          />
        </div>
        <div className="col-md-auto">
          <input
            type="number"
            className="form-control"
            placeholder="Min Amount"
            value={minAmountFilter}
            onChange={(e) => setMinAmountFilter(e.target.value)}
          />
        </div>
        <div className="col-md-auto">
          <input
            type="number"
            className="form-control"
            placeholder="Max Amount"
            value={maxAmountFilter}
            onChange={(e) => setMaxAmountFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="">
            <tr>
              <th>Voucher Date</th>
              <th>Voucher No</th>
              <th>Voucher Type</th>
              <th>Debit Account</th>
              <th>Credit Account</th>
              <th>Debit Amt</th>
              <th>Credit Amt</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.voucherDate}</td>
                  <td>{entry.voucherNo}</td>
                  <td>
                    <Badge className={getVoucherTypeBadgeColor(entry.voucherType)}>
                      {entry.voucherType}
                    </Badge>
                  </td>
                  <td>{entry.debit}</td>
                  <td>{entry.credit}</td>
                  <td>${entry.debitAmount.toLocaleString()}</td>
                  <td>${entry.creditAmount.toLocaleString()}</td>
                  <td className="d-flex gap-2 justify-content-center">
                    <button
                      className="btn btn-sm text-primary"
                      onClick={() => handleView(entry)}
                    >
                      <FaEye size={16} />
                    </button>
                    <button
                      className="btn btn-sm text-danger"
                      onClick={() => handleDelete(entry)}
                    >
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Page Info */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
          <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            <li>Daybook is a daily summary of all financial and accounting entries recorded on a specific date.</li>
            <li>Acts like a business diary, capturing transactions such as sales, purchases, payments, and receipts.</li>
            <li>Helps monitor daily cash flow and ensures transparency in financial activity.</li>
          </ul>
        </Card.Body>
      </Card>

      {/* View Entry Modal - Updated to match Bookkeeper Software style */}
      <Modal show={!!viewEntry} onHide={() => setViewEntry(null)} centered size="lg">
        <Modal.Header closeButton className=" text-dark">
          <Modal.Title className="fw-bold">Voucher Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewEntry && (
            <div>
              {/* Voucher Header */}
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                  <h5 className="mb-1">Voucher No: {viewEntry.voucherNo}</h5>
                  <p className="text-muted mb-0">Date: {viewEntry.voucherDate}</p>
                </div>
                <Badge className={getVoucherTypeBadgeColor(viewEntry.voucherType)} style={{ fontSize: "1rem" }}>
                  {viewEntry.voucherType}
                </Badge>
              </div>

              {/* Account Details */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <Card className="h-100 border-0 bg-light">
                    <Card.Body>
                      <h6 className="fw-bold text-danger mb-3">Debit Account</h6>
                      <div>
                        <span className="text-muted">Account Name:</span>
                        <span className="fw-semibold ms-2">{viewEntry.debit}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-6">
                  <Card className="h-100 border-0 bg-light">
                    <Card.Body>
                      <h6 className="fw-bold text-success mb-3">Credit Account</h6>
                      <div>
                        <span className="text-muted">Account Name:</span>
                        <span className="fw-semibold ms-2">{viewEntry.credit}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>

              {/* Amount Details */}
              <div className="row">
                <div className="col-md-6">
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Debit Amount</h6>
                          <h4 className="text-danger mb-0">${viewEntry.debitAmount.toLocaleString()}</h4>
                        </div>
                        <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                          <span className="text-danger fs-4">➖</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-6">
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-muted mb-1">Credit Amount</h6>
                          <h4 className="text-success mb-0">${viewEntry.creditAmount.toLocaleString()}</h4>
                        </div>
                        <div className="bg-success bg-opacity-10 rounded-circle p-3">
                          <span className="text-success fs-4">➕</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewEntry(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Entry Modal */}
      <Modal show={!!deleteEntry} onHide={() => setDeleteEntry(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this voucher entry?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteEntry(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Daybook;