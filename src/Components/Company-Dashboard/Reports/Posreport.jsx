import React, { useEffect, useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Modal, Button, Table, Form, Row, Col } from "react-bootstrap";
import axiosInstance from "../../../Api/axiosInstance";
import GetCompanyId from "../../../Api/GetCompanyId";
import { CurrencyContext } from "../../../hooks/CurrencyContext";

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
    <div className="container my-4">
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold">POS Report</h4>
        <p className="text-muted">Daily invoice transactions summary</p>
      </div>

      {/* Summary Boxes */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Invoices", value: summary.totalInvoices, border: "info" },
          { label: "Total Amount", value: `${symbol} ${convertPrice(summary.totalAmount.toFixed(2))}`, border: "success" },
          { label: "Total GST", value: `${symbol} ${convertPrice(summary.totalGST.toFixed(2))}`, border: "warning" },
        ].map((item, idx) => (
          <div className="col-12 col-md-4" key={idx}>
            <div
              className={`shadow-sm rounded p-3 bg-white border border-${item.border} d-flex align-items-center justify-content-between`}
            >
              <div>
                <small className="text-muted">{item.label}</small>
                <h5 className="fw-bold">{item.value}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
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
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search product..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </Form.Group>
            </Col>

            {/* Date fields are kept for UI but ignored in filtering (API has no date) */}
            <Col md={3}>
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  disabled
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3">
            <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Table */}
      <div className="bg-white rounded p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Transaction Details</h5>
        </div>

        <div className="table-responsive">
          <Table bordered hover className="align-middle">
            <thead className="">
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
              {filteredData.length > 0 ? (
                filteredData.map((item, i) => (
                  <tr key={i}>
                    <td>{item.invoiceNo}</td>
                    <td>{item.product}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(item.paymentType)}`}>
                        {item.paymentType}
                      </span>
                    </td>
                    <td>{symbol} {convertPrice(item.amount.toFixed(2))}</td>
                    <td>{symbol} {convertPrice(item.gst.toFixed(2))}</td>
                    <td>{symbol} {convertPrice(item.total.toFixed(2))}</td>
                    <td>{item.time}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => {
                          setSelectedInvoice(item);
                          setShowModal(true);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-3">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-between mt-3 px-2">
          <span className="small text-muted">
            Showing {filteredData.length} of {posData.length} invoices
          </span>
        </div>

        {/* Info Card */}
        <Card className="mb-4 p-3 shadow rounded-4 mt-2">
          <Card.Body>
            <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
            <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
              <li>Displays POS invoices from the backend API.</li>
              <li>Shows product, payment type, amount, GST, and total.</li>
              <li>Supports filtering by payment type and product name.</li>
              <li>Displays summary: total invoices, total amount, and total GST.</li>
              <li>Time field is shown as provided by the system (no full date available).</li>
            </ul>
          </Card.Body>
        </Card>
      </div>

      {/* View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Invoice Details - {selectedInvoice?.invoiceNo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice ? (
            <Table bordered>
              <tbody>
                <tr><td><strong>Invoice No</strong></td><td>{selectedInvoice.invoiceNo}</td></tr>
                <tr><td><strong>Product</strong></td><td>{selectedInvoice.product}</td></tr>
                <tr><td><strong>Payment Type</strong></td><td>
                  <span className={`badge ${getStatusBadge(selectedInvoice.paymentType)}`}>
                    {selectedInvoice.paymentType}
                  </span>
                </td></tr>
                <tr><td><strong>Amount (Excl. GST)</strong></td><td>{symbol} {convertPrice(selectedInvoice.amount.toFixed(2))}</td></tr>
                <tr><td><strong>GST</strong></td><td>{symbol} {convertPrice(selectedInvoice.gst.toFixed(2))}</td></tr>
                <tr><td><strong>Total</strong></td><td>{symbol} {convertPrice(selectedInvoice.total.toFixed(2))}</td></tr>
                <tr><td><strong>Time</strong></td><td>{selectedInvoice.time}</td></tr>
              </tbody>
            </Table>
          ) : (
            <p>No invoice selected.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PosReport;