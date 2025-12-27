import React, { useEffect, useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Modal, Button, Table, Form, Row, Col, Container, Spinner } from "react-bootstrap";
import { FaCashRegister, FaFile, FaEye } from "react-icons/fa";
import axiosInstance from "../../../Api/axiosInstance";
import GetCompanyId from "../../../Api/GetCompanyId";
import { CurrencyContext } from "../../../hooks/CurrencyContext";
import './Posreport.css';

const PosReport = () => {
  const companyId = GetCompanyId();
  const [posData, setPosData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    totalGST: 0,
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState(""); // Not used (no date in API), kept for UI
  const [toDate, setToDate] = useState("");     // Same
  const [productSearch, setProductSearch] = useState(""); // changed from customerSearch

  const { convertPrice, symbol } = useContext(CurrencyContext);

  // ✅ Fetch POS data from correct endpoint
  const fetchPosData = async () => {
    if (!companyId) return;

    try {
      const res = await axiosInstance.get(`/pos-report`, {
        params: { company_id: companyId },
      });

      if (!res.data?.success) {
        throw new Error("Invalid response");
      }

      const { summary: apiSummary, table: apiTable } = res.data;

      setSummary({
        totalInvoices: apiSummary.totalInvoices || 0,
        totalAmount: apiSummary.totalAmount || 0,
        totalGST: apiSummary.totalGST || 0,
      });

      // Normalize data
      const normalized = (apiTable || []).map((item) => ({
        invoiceNo: item.invoiceNo || "N/A",
        product: item.product || "N/A",
        paymentType: item.paymentType || "N/A",
        time: item.time || "N/A",
        amount: parseFloat(item.amount) || 0,
        gst: parseFloat(item.gst) || 0,
        total: parseFloat(item.total) || 0,
      }));

      setPosData(normalized);
      setFilteredData(normalized);
    } catch (error) {
      console.error("Error fetching POS data:", error);
      setPosData([]);
      setFilteredData([]);
      setSummary({ totalInvoices: 0, totalAmount: 0, totalGST: 0 });
    }
  };

  // Apply filters (only paymentType and product name supported)
  const applyFilters = () => {
    let result = [...posData];

    if (paymentStatusFilter) {
      result = result.filter(
        (item) => item.paymentType.toLowerCase() === paymentStatusFilter.toLowerCase()
      );
    }

    if (productSearch) {
      const term = productSearch.toLowerCase();
      result = result.filter((item) => item.product.toLowerCase().includes(term));
    }

    setFilteredData(result);
  };

  const clearFilters = () => {
    setPaymentStatusFilter("");
    setProductSearch("");
    setFromDate("");
    setToDate("");
    setFilteredData([...posData]);
  };

  useEffect(() => {
    fetchPosData();
  }, [companyId]);

  useEffect(() => {
    applyFilters();
  }, [paymentStatusFilter, productSearch, posData]);

  const getStatusBadge = (status) => {
    const lower = status.toLowerCase();
    if (lower === "paid") return "bg-success";
    if (lower === "due") return "bg-danger";
    if (lower === "partial") return "bg-warning";
    if (lower === "cash") return "bg-primary";
    return "bg-secondary";
  };

  return (
    <Container fluid className="pos-report-container py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="pos-report-title">
            <FaCashRegister className="me-2" />
            POS Report
          </h4>
          <p className="pos-report-subtitle mb-0">Daily invoice transactions summary</p>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <Card className="summary-card summary-card-invoices">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <div className="card-label">Total Invoices</div>
                <div className="card-value">{summary.totalInvoices}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="summary-card summary-card-amount">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <div className="card-label">Total Amount</div>
                <div className="card-value">{symbol} {convertPrice(summary.totalAmount.toFixed(2))}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="summary-card summary-card-gst">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <div className="card-label">Total GST</div>
                <div className="card-value">{symbol} {convertPrice(summary.totalGST.toFixed(2))}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="filter-card mb-4">
        <Card.Body className="p-4">
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="filter-label">Payment Status</Form.Label>
                <Form.Select
                  className="filter-select"
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Due">Due</option>
                  <option value="Partial">Partial</option>
                  <option value="Cash">Cash</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="filter-label">Product Name</Form.Label>
                <Form.Control
                  type="text"
                  className="filter-input"
                  placeholder="Search product..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </Form.Group>
            </Col>

            {/* Date fields are kept for UI but ignored in filtering (API has no date) */}
            <Col md={3}>
              <Form.Group>
                <Form.Label className="filter-label">From Date</Form.Label>
                <Form.Control
                  type="date"
                  className="filter-input"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  disabled
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="filter-label">To Date</Form.Label>
                <Form.Control
                  type="date"
                  className="filter-input"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3">
            <Button className="btn-clear-filters" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="pos-report-table-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0" style={{ color: '#505ece' }}>Transaction Details</h5>
          </div>

          <div className="table-responsive">
            {filteredData.length > 0 ? (
              <>
                <Table className="pos-report-table" hover responsive="sm">
                  <thead className="table-header">
                    <tr>
                      <th>Invoice No</th>
                      <th>Product</th>
                      <th>Payment Type</th>
                      <th>Amount</th>
                      <th>GST</th>
                      <th>Total</th>
                      <th>Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, i) => (
                      <tr key={i}>
                        <td><strong>{item.invoiceNo}</strong></td>
                        <td>{item.product}</td>
                        <td>
                          <span className={`badge status-badge ${getStatusBadge(item.paymentType)}`}>
                            {item.paymentType}
                          </span>
                        </td>
                        <td>{symbol} {convertPrice(item.amount.toFixed(2))}</td>
                        <td>{symbol} {convertPrice(item.gst.toFixed(2))}</td>
                        <td className="amount-cell">{symbol} {convertPrice(item.total.toFixed(2))}</td>
                        <td>{item.time}</td>
                        <td>
                          <Button
                            size="sm"
                            className="btn-view"
                            onClick={() => {
                              setSelectedInvoice(item);
                              setShowModal(true);
                            }}
                          >
                            <FaEye className="me-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="d-flex justify-content-between mt-3 px-2">
                  <span className="small text-muted">
                    Showing {filteredData.length} of {posData.length} invoices
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-5 empty-state">
                <FaFile style={{ fontSize: "3rem", color: "#adb5bd", marginBottom: "1rem" }} />
                <p className="text-muted mb-0">No POS data available</p>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="pos-report-modal">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Invoice Details - {selectedInvoice?.invoiceNo}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedInvoice ? (
            <Table bordered>
              <tbody>
                <tr><td><strong>Invoice No</strong></td><td>{selectedInvoice.invoiceNo}</td></tr>
                <tr><td><strong>Product</strong></td><td>{selectedInvoice.product}</td></tr>
                <tr><td><strong>Payment Type</strong></td><td>
                  <span className={`badge status-badge ${getStatusBadge(selectedInvoice.paymentType)}`}>
                    {selectedInvoice.paymentType}
                  </span>
                </td></tr>
                <tr><td><strong>Amount (Excl. GST)</strong></td><td>{symbol} {convertPrice(selectedInvoice.amount.toFixed(2))}</td></tr>
                <tr><td><strong>GST</strong></td><td>{symbol} {convertPrice(selectedInvoice.gst.toFixed(2))}</td></tr>
                <tr><td><strong>Total</strong></td><td className="amount-cell">{symbol} {convertPrice(selectedInvoice.total.toFixed(2))}</td></tr>
                <tr><td><strong>Time</strong></td><td>{selectedInvoice.time}</td></tr>
              </tbody>
            </Table>
          ) : (
            <p>No invoice selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-close" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PosReport;