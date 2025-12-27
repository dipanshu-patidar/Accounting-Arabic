import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
  Modal,
  Pagination,
  Container,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { FaFilePdf, FaFileExcel, FaArrowLeft, FaSearch, FaTimes, FaBalanceScale, FaFile } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import './TrialBalance.css';

const TrialBalance = () => {
  const companyId = GetCompanyId();

  // Global filters
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [filterType, setFilterType] = useState("All");
  const [searchAccount, setSearchAccount] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [modalSearchText, setModalSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const itemsPerPage = 5;

  // Data & loading states
  const [trialEntries, setTrialEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const types = ["All", "Asset", "Liability", "Expense", "Income", "Equity"];

  // Fetch trial balance data
  useEffect(() => {
    if (!companyId) {
      setError("Company ID missing");
      setLoading(false);
      return;
    }

    const fetchTrialBalance = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`trial-balance/${companyId}`);

        if (response.data.success && Array.isArray(response.data.data)) {
          const mapped = response.data.data.map((item) => ({
            code: String(item.account_code),
            name: item.account_name,
            type: item.type || "Other",
            opening: Number(item.opening_balance) || 0,
            debit: Number(item.debit) || 0,
            credit: Number(item.credit) || 0,
            closing: Number(item.closing_balance) || 0,
            accountId: item.account_id, // IMPORTANT: assuming API returns account_id
          }));
          setTrialEntries(mapped);
        } else {
          setError("Invalid API response format");
        }
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load trial balance");
      } finally {
        setLoading(false);
      }
    };

    fetchTrialBalance();
  }, [companyId]);

  const calculateClosing = (entry) => {
    return entry.opening + entry.debit - entry.credit;
  };

  const filteredRows = trialEntries.filter((entry) => {
    const matchesType = filterType === "All" || entry.type === filterType;
    const matchesSearch =
      entry.name.toLowerCase().includes(searchAccount.toLowerCase()) ||
      entry.code.toLowerCase().includes(searchAccount.toLowerCase());
    return matchesType && matchesSearch;
  });

  // FETCH LEDGER WHEN ACCOUNT IS SELECTED
  const openDetails = async (account) => {
    if (!companyId || !account.code) {
      setModalError("Missing company or account ID");
      setShowModal(true);
      return;
    }

    setModalLoading(true);
    setModalError(null);
    try {
      const response = await axiosInstance.get(
        `trial-balance/ledger/${companyId}/${account.code}`
      );

      if (response.data.success) {
        const ledgerData = {
          ...account,
          opening_balance: response.data.opening_balance || 0,
          total_debit: response.data.total_debit || 0,
          total_credit: response.data.total_credit || 0,
          current_balance: response.data.current_balance || 0,
          transactions: Array.isArray(response.data.transactions)
            ? response.data.transactions.map((tx) => ({
                date: tx.date,
                type: tx.type || "Other",
                particulars: tx.particulars || "-",
                debit: Number(tx.debit) || 0,
                credit: Number(tx.credit) || 0,
              }))
            : [],
        };
        setSelectedAccount(ledgerData);
      } else {
        setModalError("Failed to load ledger data");
      }
    } catch (err) {
      console.error("Ledger API Error:", err);
      setModalError("Error loading transactions");
    } finally {
      setModalLoading(false);
      setShowModal(true);
      setCurrentPage(1);
      setModalSearchText("");
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!selectedAccount || !selectedAccount.transactions) return [];
    return selectedAccount.transactions.filter((t) => {
      const txDate = new Date(t.date);
      const matchesDateRange =
        !startDate || !endDate || (txDate >= startDate && txDate <= endDate);
      const searchText = modalSearchText.toLowerCase();
      const matchesText =
        !searchText ||
        t.type.toLowerCase().includes(searchText) ||
        t.particulars.toLowerCase().includes(searchText);
      return matchesDateRange && matchesText;
    });
  }, [selectedAccount, startDate, endDate, modalSearchText]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationItems = () => {
    let items = [];
    if (totalPages <= 7) {
      for (let number = 1; number <= totalPages; number++) {
        items.push(
          <Pagination.Item
            key={number}
            active={number === currentPage}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </Pagination.Item>
        );
      }
    } else {
      const pageNumbers = [];
      pageNumbers.push(1);
      if (currentPage > 4) pageNumbers.push("start-ellipsis");
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (currentPage < totalPages - 3) pageNumbers.push("end-ellipsis");
      pageNumbers.push(totalPages);

      pageNumbers.forEach((number, index) => {
        if (number === "start-ellipsis" || number === "end-ellipsis") {
          items.push(<Pagination.Ellipsis key={number + index} disabled />);
        } else {
          items.push(
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </Pagination.Item>
          );
        }
      });
    }
    return items;
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAccount(null);
    setModalSearchText("");
    setCurrentPage(1);
    setModalError(null);
  };

  return (
    <Container fluid className="trial-balance-container py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="trial-balance-title">
            <FaBalanceScale className="me-2" />
            Trial Balance Report
          </h4>
          <p className="trial-balance-subtitle mb-0">Auto-generated accounting summary by account head</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" className="spinner-custom" />
          <p className="mt-3">Loading trial balance data...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      ) : (
        <>

          {/* Filter UI */}
          <Card className="filter-card">
            <Card.Body>
              <Form>
                <Row className="g-3 align-items-end">
                  <Col xs={12} md={3}>
                    <Form.Group controlId="accountType">
                      <Form.Label className="filter-label">Account Type</Form.Label>
                      <Form.Select
                        className="filter-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        {types.map((t, i) => (
                          <option key={i} value={t}>
                            {t}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Group controlId="searchAccount">
                      <Form.Label className="filter-label">Search Account</Form.Label>
                      <div className="search-input-wrapper">
                        <Form.Control
                          type="text"
                          className="filter-input"
                          placeholder="Search by Account Name or Code"
                          value={searchAccount}
                          onChange={(e) => setSearchAccount(e.target.value)}
                        />
                        {searchAccount ? (
                          <button
                            type="button"
                            className="search-clear-btn"
                            onClick={() => setSearchAccount("")}
                          >
                            <FaTimes />
                          </button>
                        ) : (
                          <FaSearch className="search-icon" />
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={5} className="d-flex justify-content-md-end justify-content-start align-items-center">
                    <Button className="btn-generate w-100 w-md-auto">
                      Generate Report
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Trial Balance Table */}
          <Card className="trial-balance-table-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                <h5 className="fw-bold mb-2 mb-md-0" style={{ color: '#505ece' }}>Account Summary</h5>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <Button className="btn-export-pdf" size="sm">
                    <FaFilePdf /> PDF
                  </Button>
                  <Button className="btn-export-excel" size="sm">
                    <FaFileExcel /> Excel
                  </Button>
                </div>
              </div>
              <div className="table-responsive">
                {filteredRows.length > 0 ? (
                  <Table className="trial-balance-table" hover responsive="sm">
                    <thead className="table-header">
                      <tr>
                        <th>S.No</th>
                        <th>Account Name</th>
                        <th>Type</th>
                        <th>Opening Balance</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Closing Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, idx) => (
                        <tr key={row.code || idx}>
                          <td><strong>{idx + 1}</strong></td>
                          <td>
                            <Button
                              variant="link"
                              onClick={() => openDetails(row)}
                              className="account-name-link p-0 text-start"
                            >
                              {row.name}
                            </Button>
                          </td>
                          <td>
                            <span className={`badge status-badge bg-${row.type === "Asset" ? "primary" :
                              row.type === "Liability" ? "info" :
                                row.type === "Expense" ? "danger" :
                                  row.type === "Income" ? "success" : "warning"
                            }`}>
                              {row.type}
                            </span>
                          </td>
                          <td>₹{row.opening.toLocaleString()}</td>
                          <td>₹{row.debit.toLocaleString()}</td>
                          <td>₹{row.credit.toLocaleString()}</td>
                          <td className="amount-cell">₹{calculateClosing(row).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5 empty-state">
                    <FaFile style={{ fontSize: "3rem", color: "#adb5bd", marginBottom: "1rem" }} />
                    <p className="text-muted mb-0">No accounts found</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Modal for Ledger Details */}
          <Modal
            show={showModal}
            onHide={closeModal}
            size="xl"
            centered
            scrollable
            className="trial-balance-modal"
          >
            <Modal.Header className="modal-header-custom">
              <Modal.Title className="flex-grow-1">
                Ledger: {selectedAccount ? selectedAccount.name : ""}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-custom">
              {modalLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" className="spinner-custom" />
                  <p className="mt-3">Loading ledger...</p>
                </div>
              ) : modalError ? (
                <div className="text-center py-4 text-danger">{modalError}</div>
              ) : (
                <>
                  <Card className="modal-filter-card">
                    <Card.Body>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group controlId="modalDateRange">
                            <Form.Label className="filter-label">Filter by Date Range</Form.Label>
                            <DatePicker
                              selectsRange
                              startDate={startDate}
                              endDate={endDate}
                              onChange={(update) => setDateRange(update)}
                              isClearable
                              className="form-control filter-input"
                              dateFormat="dd/MM/yyyy"
                              placeholderText="Select date range"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="modalSearchText">
                            <Form.Label className="filter-label">Search by Type / Particulars</Form.Label>
                            <div className="search-input-wrapper">
                              <Form.Control
                                type="text"
                                className="filter-input"
                                placeholder="Type or Particulars..."
                                value={modalSearchText}
                                onChange={(e) => {
                                  setModalSearchText(e.target.value);
                                  setCurrentPage(1);
                                }}
                              />
                              {modalSearchText ? (
                                <button
                                  type="button"
                                  className="search-clear-btn"
                                  onClick={() => setModalSearchText("")}
                                >
                                  <FaTimes />
                                </button>
                              ) : (
                                <FaSearch className="search-icon" />
                              )}
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <Card className="modal-table-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 fw-bold" style={{ color: '#505ece' }}>Transactions</h5>
                        <span className="badge bg-primary">
                          {filteredTransactions.length} records found
                        </span>
                      </div>
                      <div className="table-responsive">
                        {currentTransactions.length > 0 ? (
                          <>
                            <Table className="modal-table" responsive>
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Type</th>
                                  <th>Particulars</th>
                                  <th>Debit (₹)</th>
                                  <th>Credit (₹)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentTransactions.map((tx, i) => (
                                  <tr key={i}>
                                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                                    <td>
                                      <span className={`badge status-badge bg-${tx.type === "Opening Balance" ? "secondary" :
                                        tx.type.includes("Sale") || tx.type.includes("Receipt") ? "success" :
                                          tx.type.includes("Payment") || tx.type.includes("Purchase") ? "danger" : "info"
                                      }`}>
                                        {tx.type}
                                      </span>
                                    </td>
                                    <td>{tx.particulars}</td>
                                    <td>{tx.debit > 0 ? `₹${tx.debit.toLocaleString()}` : "-"}</td>
                                    <td>{tx.credit > 0 ? `₹${tx.credit.toLocaleString()}` : "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>

                            {totalPages > 1 && (
                              <div className="d-flex justify-content-between align-items-center mt-3">
                                <div className="text-muted">
                                  Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredTransactions.length)} of {filteredTransactions.length} entries
                                </div>
                                <Pagination className="mb-0">
                                  <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                                  <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                                  {renderPaginationItems()}
                                  <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                                  <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                                </Pagination>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-5 empty-state">
                            <FaFile style={{ fontSize: "3rem", color: "#adb5bd", marginBottom: "1rem" }} />
                            <p className="text-muted mb-0">No transactions available</p>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </>
              )}
            </Modal.Body>
            <Modal.Footer className="modal-footer-custom">
              <Button className="btn-modal-close" onClick={closeModal}>Close</Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default TrialBalance;