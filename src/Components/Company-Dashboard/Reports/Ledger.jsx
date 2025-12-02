import React, { useState, useEffect, useMemo } from "react";
import { FaEye, FaPrint } from "react-icons/fa";
import { Card, Form, Modal, Button, Pagination } from "react-bootstrap";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";

const Ledger = () => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("");
  const [voucherNoFilter, setVoucherNoFilter] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const companyId = GetCompanyId();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch main ledger
  useEffect(() => {
    if (!companyId) {
      setError("Company ID not available");
      setLoading(false);
      return;
    }

    const fetchLedger = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`ledger-report/ledger/${companyId}`);
        if (response.data.success && Array.isArray(response.data.data)) {
          const txs = response.data.data.map((t) => ({
            ...t,
            date: new Date(t.date).toISOString().split("T")[0], // normalize to YYYY-MM-DD
            debit: Number(t.debit) || 0,
            credit: Number(t.credit) || 0,
            balance: Number(t.balance) || 0,
          }));
          setTransactions(txs);
        } else {
          setError("Invalid data format");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load ledger data");
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [companyId]);

  // Compute summary from transactions
  const summary = useMemo(() => {
    let totalDebits = 0;
    let totalCredits = 0;
    let openingBalance = 0;
    let closingBalance = 0;

    if (transactions.length > 0) {
      totalDebits = transactions.reduce((sum, t) => sum + t.debit, 0);
      totalCredits = transactions.reduce((sum, t) => sum + t.credit, 0);
      // Assume opening is based on first balance minus first net effect
      const first = transactions[0];
      const netFirst = first.credit - first.debit;
      openingBalance = first.balance - netFirst;
      closingBalance = transactions[transactions.length - 1]?.balance || 0;
    }

    return {
      opening_balance: openingBalance,
      closing_balance: closingBalance,
      total_debits: totalDebits,
      total_credits: totalCredits,
    };
  }, [transactions]);

  // Unique voucher types
  const voucherTypes = [...new Set(transactions.map((t) => t.voucher_type))];

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const txDate = new Date(t.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      const inDateRange = (!from || txDate >= from) && (!to || txDate <= to);

      const s = searchText.toLowerCase();
      const matchesSearch =
        t.voucher_no.toLowerCase().includes(s) ||
        t.from_to.toLowerCase().includes(s) ||
        t.voucher_type.toLowerCase().includes(s);

      const matchesVoucherType = voucherTypeFilter ? t.voucher_type === voucherTypeFilter : true;
      const matchesVoucherNo = voucherNoFilter
        ? t.voucher_no.toLowerCase().includes(voucherNoFilter.toLowerCase())
        : true;

      return inDateRange && matchesSearch && matchesVoucherType && matchesVoucherNo;
    });
  }, [transactions, fromDate, toDate, searchText, voucherTypeFilter, voucherNoFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Open modal and fetch full voucher details (optional enhancement)
  const handleViewClick = async (transaction) => {
    // Optional: fetch full voucher details if needed
    try {
      const response = await axiosInstance.get(`/api/v1/ledger-report/ledger/voucher-details/${transaction.id}`);
      if (response.data.success) {
        setSelectedTransaction({
          ...transaction,
          narration: response.data.details?.narration || transaction.narration || "",
        });
      } else {
        setSelectedTransaction(transaction);
      }
    } catch (err) {
      console.warn("Could not fetch voucher details, using basic data");
      setSelectedTransaction(transaction);
    }
    setShowModal(true);
  };

  if (loading) {
    return <div className="p-4">Loading ledger data...</div>;
  }

  if (error) {
    return <div className="p-4 text-danger">Error: {error}</div>;
  }

  return (
    <div className="mt-3 p-2">
      {/* Summary Cards */}
      <h5 className="fw-bold mb-3">Ledger Report</h5>
      <Card className="mb-4">
        <Card.Body className="p-3">
          <div className="d-flex flex-wrap gap-2">
            <div className="bg-secondary-subtle rounded p-2 flex-fill text-center">
              <small className="text-muted d-block">Opening Balance</small>
              <strong className="text-primary fs-6">
                ₹{summary.opening_balance.toLocaleString()}
              </strong>
            </div>
            <div className="bg-danger-subtle rounded p-2 flex-fill text-center">
              <small className="text-muted d-block">Total Debits</small>
              <strong className="text-danger fs-6">
                ₹{summary.total_debits.toLocaleString()}
              </strong>
            </div>
            <div className="bg-success-subtle rounded p-2 flex-fill text-center">
              <small className="text-muted d-block">Total Credits</small>
              <strong className="text-success fs-6">
                ₹{summary.total_credits.toLocaleString()}
              </strong>
            </div>
            <div className="bg-primary-subtle rounded p-2 flex-fill text-center">
              <small className="text-muted d-block">Closing Balance</small>
              <strong className="text-primary fs-6">
                ₹{summary.closing_balance.toLocaleString()}
              </strong>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-3 mb-4 align-items-end">
        <div>
          <label className="form-label mb-1">From Date</label>
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div>
          <label className="form-label mb-1">To Date</label>
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div>
          <label className="form-label mb-1">Voucher Type</label>
          <Form.Select
            value={voucherTypeFilter}
            onChange={(e) => {
              setVoucherTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Types</option>
            {voucherTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Form.Select>
        </div>
        <div>
          <label className="form-label mb-1">Voucher No</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. INV-20"
            value={voucherNoFilter}
            onChange={(e) => {
              setVoucherNoFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex-grow-1">
          <label className="form-label mb-1">Search</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search from/to, narration..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead className="">
            <tr>
              <th>Date</th>
              <th>Voucher Type</th>
              <th>Voucher No</th>
              <th>From/To</th>
              <th>Debit (₹)</th>
              <th>Credit (₹)</th>
              <th>Balance (₹)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.length > 0 ? (
              currentTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.voucher_type}</td>
                  <td>{t.voucher_no}</td>
                  <td className="text-start">{t.from_to}</td>
                  <td className="text-danger">{t.debit > 0 ? `₹${t.debit.toLocaleString()}` : ""}</td>
                  <td className="text-success">{t.credit > 0 ? `₹${t.credit.toLocaleString()}` : ""}</td>
                  <td className={t.balance >= 0 ? "text-primary" : "text-danger"}>
                    ₹{Math.abs(t.balance).toLocaleString()} {t.balance < 0 ? "(Cr)" : "(Dr)"}
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleViewClick(t)}
                      >
                        <FaEye />
                      </Button>
                      {/* Print can be implemented later */}
                      {/* <Button variant="outline-warning" size="sm" disabled>
                        <FaPrint />
                      </Button> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted py-3">
                  No entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{" "}
            {filteredTransactions.length} entries
          </small>
          <Pagination size="sm">
            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum = currentPage - 2 + i;
              if (pageNum < 1) pageNum = 1;
              if (pageNum > totalPages) pageNum = totalPages;
              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* Voucher Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Voucher Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction && (
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <td width="30%" className="fw-semibold">Date</td>
                  <td>{selectedTransaction.date}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Voucher Type</td>
                  <td>{selectedTransaction.voucher_type}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Voucher No</td>
                  <td>{selectedTransaction.voucher_no}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">From / To</td>
                  <td>{selectedTransaction.from_to}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Narration</td>
                  <td>{selectedTransaction.narration || "-"}</td>
                </tr>
                <tr>
                  <td className="fw-semibold">Debit</td>
                  <td className="text-danger">
                    {selectedTransaction.debit > 0
                      ? `₹${selectedTransaction.debit.toLocaleString()}`
                      : "₹0"}
                  </td>
                </tr>
                <tr>
                  <td className="fw-semibold">Credit</td>
                  <td className="text-success">
                    {selectedTransaction.credit > 0
                      ? `₹${selectedTransaction.credit.toLocaleString()}`
                      : "₹0"}
                  </td>
                </tr>
                <tr>
                  <td className="fw-semibold">Balance</td>
                  <td>
                    ₹{Math.abs(selectedTransaction.balance).toLocaleString()}{" "}
                    {selectedTransaction.balance < 0 ? "(Cr)" : "(Dr)"}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Page Info */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-4">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
          <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            <li>Provides a detailed record of all financial transactions for a specific account or party.</li>
            <li>Displays both debit and credit entries along with dates and references.</li>
            <li>Maintains a running balance over a selected time period to track account position.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Ledger;