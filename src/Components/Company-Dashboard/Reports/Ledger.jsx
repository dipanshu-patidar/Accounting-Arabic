import React, { useState, useEffect, useMemo } from "react";
import { FaEye, FaPrint, FaBook, FaFile } from "react-icons/fa";
import { Card, Form, Modal, Button, Pagination, Container, Row, Col, Table, Spinner } from "react-bootstrap";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import './Ledger.css';

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

  return (
    <Container fluid className="ledger-container py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="ledger-title">
            <FaBook className="me-2" />
            Ledger Report
          </h4>
          <p className="ledger-subtitle mb-0">View and manage your ledger transactions</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" className="spinner-custom" />
          <p className="mt-3">Loading ledger data...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <Card className="summary-card mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col xs={12} md={3}>
                  <div className="summary-item summary-opening">
                    <div className="summary-item-label">Opening Balance</div>
                    <div className="summary-item-value">
                      ₹{summary.opening_balance.toLocaleString()}
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={3}>
                  <div className="summary-item summary-debit">
                    <div className="summary-item-label">Total Debits</div>
                    <div className="summary-item-value">
                      ₹{summary.total_debits.toLocaleString()}
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={3}>
                  <div className="summary-item summary-credit">
                    <div className="summary-item-label">Total Credits</div>
                    <div className="summary-item-value">
                      ₹{summary.total_credits.toLocaleString()}
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={3}>
                  <div className="summary-item summary-closing">
                    <div className="summary-item-label">Closing Balance</div>
                    <div className="summary-item-value">
                      ₹{summary.closing_balance.toLocaleString()}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Filters */}
          <Card className="filter-card mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col xs={12} md={2}>
                  <Form.Label className="filter-label">From Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="filter-input"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <Form.Label className="filter-label">To Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="filter-input"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <Form.Label className="filter-label">Voucher Type</Form.Label>
                  <Form.Select
                    className="filter-select"
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
                </Col>
                <Col xs={12} md={2}>
                  <Form.Label className="filter-label">Voucher No</Form.Label>
                  <Form.Control
                    type="text"
                    className="filter-input"
                    placeholder="e.g. INV-20"
                    value={voucherNoFilter}
                    onChange={(e) => {
                      setVoucherNoFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </Col>
                <Col xs={12} md={4}>
                  <Form.Label className="filter-label">Search</Form.Label>
                  <Form.Control
                    type="text"
                    className="filter-input"
                    placeholder="Search from/to, narration..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Table */}
          <Card className="ledger-table-card mb-4">
            <Card.Body>
              <div className="table-responsive">
                {currentTransactions.length > 0 ? (
                  <Table className="ledger-table" hover responsive="sm">
                    <thead className="table-header">
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
                      {currentTransactions.map((t) => (
                        <tr key={t.id}>
                          <td>{t.date}</td>
                          <td>{t.voucher_type}</td>
                          <td><strong>{t.voucher_no}</strong></td>
                          <td className="text-start">{t.from_to}</td>
                          <td className="text-danger">{t.debit > 0 ? `₹${t.debit.toLocaleString()}` : ""}</td>
                          <td className="text-success">{t.credit > 0 ? `₹${t.credit.toLocaleString()}` : ""}</td>
                          <td className={t.balance >= 0 ? "text-primary" : "text-danger"}>
                            ₹{Math.abs(t.balance).toLocaleString()} {t.balance < 0 ? "(Cr)" : "(Dr)"}
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                className="btn-action btn-view"
                                onClick={() => handleViewClick(t)}
                                title="View Details"
                              >
                                <FaEye />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5 empty-state">
                    <FaFile style={{ fontSize: "3rem", color: "#adb5bd", marginBottom: "1rem" }} />
                    <p className="text-muted mb-0">No ledger entries found</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

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
        </>
      )}

      {/* Voucher Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="ledger-modal">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Voucher Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedTransaction && (
            <Table className="modal-table" bordered>
              <tbody>
                <tr>
                  <td className="fw-semibold">Date</td>
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
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-close" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Ledger;