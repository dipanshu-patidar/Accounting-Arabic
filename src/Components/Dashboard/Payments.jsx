// Payments.js
import React, { useState, useMemo, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Badge,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  Form,
  InputGroup,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import {
  FaFileExport,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaTrash,
  FaFilePdf,
  FaFileExcel,
  FaCreditCard,
  FaSearch,
} from "react-icons/fa";
import { BsEye } from "react-icons/bs";
import { toast } from "react-toastify";
import axiosInstance from "../../Api/axiosInstance";
import "./Payments.css";

const tabs = [
  "All Payments",
  "Failed Transactions",
  "Payment Settings",
];

const Payments = () => {
  const [activeTab, setActiveTab] = useState("All Payments");
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    successRate: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    pendingTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // ✅ Use absolute path (adjust if your axiosInstance already includes /api/v1)
      const res = await axiosInstance.get("payment/transactions");

      // ✅ Handle new API structure: { data: { transactions: [...], statistics: {...} } }
      if (res.data?.data?.transactions && Array.isArray(res.data.data.transactions)) {
        const formatted = res.data.data.transactions.map(t => ({
          ...t,
          id: t.id,
          date: new Date(t.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit"
          }),
          amount: `₹${parseFloat(t.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          status: t.status || "pending",
          method: { name: t.paymentMethod || "—" },
          customer: t.customer || "Unknown"
        }));

        setTransactions(formatted);
        setStats(res.data.data.statistics || {
          totalRevenue: 0,
          successRate: 0,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          pendingTransactions: 0
        });
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      toast.error("Failed to load payment transactions.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (txn) => {
    try {
      const res = await axiosInstance.get(`payment/transactions/${txn.id}`);
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setSelectedTransaction({
          ...data,
          date: new Date(data.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit"
          }),
          amount: `₹${parseFloat(data.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
          method: { name: data.paymentMethod || "—" },
          customer: data.customer || "Unknown"
        });
        setShowModal(true);
      }
    } catch (err) {
      toast.error("Failed to load transaction details.");
      console.error(err);
    }
  };

  const handleDeleteClick = (txn) => {
    setTransactionToDelete(txn);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      await axiosInstance.delete(`payment/transactions/${transactionToDelete.id}`);
      toast.success("Transaction deleted successfully.");
      fetchTransactions(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete transaction.");
      console.error(err);
    } finally {
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    }
  };

  // Filter by tab and search
  const filteredTransactions = transactions.filter(txn => {
    const matchesTab = activeTab === "All Payments" ||
      (activeTab === "Failed Transactions" && txn.status === "failed");
    const matchesSearch = !searchTerm ||
      txn.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.customer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
      case "success":
        return <Badge className="status-badge badge-success">Success</Badge>;
      case "failed":
        return <Badge className="status-badge badge-danger">Failed</Badge>;
      case "pending":
        return <Badge className="status-badge badge-warning">Pending</Badge>;
      default:
        return <Badge className="status-badge badge-secondary">{status}</Badge>;
    }
  };

  return (
    <Container fluid className="payments-container py-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Section */}
      <div className="payments-header mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h4 className="fw-bold d-flex align-items-center gap-2 payments-title">
            <FaCreditCard style={{ color: '#505ece' }} /> Payments
          </h4>
          <p className="text-muted mb-0">Manage all your payment transactions</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button className="btn-export-excel d-flex align-items-center gap-2">
            <FaFileExcel /> Export Excel
          </Button>
          <Button variant="danger" className="btn-export-pdf d-flex align-items-center gap-2">
            <FaFilePdf /> Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <Card className="payments-stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="payments-icon bg-orange">
                  <FaChartLine />
                </div>
                <h6 className="text-muted mb-0">Total Revenue</h6>
              </div>
              <h4 className="fw-bold mb-2">
                ₹{parseFloat(stats.totalRevenue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h4>
              <p className="text-success small mb-0">
                From {stats.successfulTransactions} successful payments
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="payments-stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="payments-icon bg-success">
                  <FaCheckCircle />
                </div>
                <h6 className="text-muted mb-0">Success Rate</h6>
              </div>
              <h4 className="fw-bold mb-2">{(stats.successRate || 0).toFixed(1)}%</h4>
              <p className="text-success small mb-0">
                {stats.successfulTransactions} of {stats.totalTransactions} succeeded
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="payments-stats-card h-100">
            <Card.Body>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="payments-icon bg-danger">
                  <FaExclamationTriangle />
                </div>
                <h6 className="text-muted mb-0">Failed Transactions</h6>
              </div>
              <h4 className="fw-bold text-danger mb-2">{stats.failedTransactions || 0}</h4>
              <p className="text-danger small mb-0">
                ↓ {(stats.totalTransactions > 0 ? (stats.failedTransactions / stats.totalTransactions) * 100 : 0).toFixed(1)}% of total
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Nav variant="tabs" className="mb-3 payments-tabs">
        {tabs.map((tab) => (
          <NavItem key={tab}>
            <NavLink
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "active" : ""}
            >
              {tab}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      {/* Search Bar */}
      <Card className="mb-3 filter-card">
        <Card.Body className="p-3">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by transaction ID or customer name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="payments-searchbar"
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Transactions Table */}
      {(activeTab === "All Payments" || activeTab === "Failed Transactions") && (
        <Card className="payments-table-card">
          <Card.Header className="payments-table-header">
            <div>
              <h5 className="mb-1 fw-bold">{activeTab}</h5>
              <p className="mb-0 small">
                {activeTab === "All Payments"
                  ? "A list of all payment transactions."
                  : "Transactions that failed to process."}
              </p>
            </div>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" className="spinner-custom" />
                <p className="mt-3 text-muted">Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-5 empty-state">
                <FaCreditCard style={{ fontSize: "3rem", color: "#adb5bd", marginBottom: "1rem" }} />
                <p className="text-muted mb-0">No transactions found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table className="payments-table" hover responsive>
                  <thead className="payments-table-thead">
                    <tr>
                      <th><Form.Check type="checkbox" /></th>
                      <th>Transaction ID</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Payment Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((txn) => (
                      <tr key={txn.id}>
                        <td><Form.Check type="checkbox" /></td>
                        <td>{txn.id}</td>
                        <td>{txn.date}</td>
                        <td><strong>{txn.customer}</strong></td>
                        <td>{txn.method.name}</td>
                        <td><strong style={{ color: '#505ece' }}>{txn.amount}</strong></td>
                        <td>{getStatusBadge(txn.status)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              className="btn-action btn-view"
                              onClick={() => handleViewDetails(txn)}
                              title="View"
                            >
                              <BsEye />
                            </Button>
                            <Button
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteClick(txn)}
                              title="Delete"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {!loading && filteredTransactions.length > 0 && (
              <div className="d-flex justify-content-between align-items-center pt-3 mt-3 border-top flex-wrap gap-3">
                <div className="text-muted small">
                  Showing 1 to {filteredTransactions.length} of {filteredTransactions.length} results
                </div>
                {filteredTransactions.length > 10 && (
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className="page-item disabled">
                        <Button variant="outline-primary" size="sm" className="page-link">«</Button>
                      </li>
                      <li className="page-item active">
                        <Button variant="primary" size="sm" className="page-link">1</Button>
                      </li>
                      <li className="page-item">
                        <Button variant="outline-primary" size="sm" className="page-link">»</Button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Payment Settings Tab */}
      {activeTab === "Payment Settings" && (
        <Card className="payments-settings-card">
          <Card.Header className="payments-table-header">
            <h5 className="mb-0 fw-bold">Payment Gateway Settings</h5>
          </Card.Header>
          <Card.Body>
            <p className="text-muted mb-4">Configure your payment gateway settings.</p>
            {/* Razorpay */}
            <Card className="mb-4 gateway-card">
              <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                <h6 className="fw-bold mb-0">Razorpay</h6>
                <div className="d-flex align-items-center gap-2">
                  <span>Status:</span>
                  <Badge className="badge-success">Active</Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <Form.Label>API Key</Form.Label>
                    <Form.Control type="password" value="***************" readOnly />
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Label>Secret Key</Form.Label>
                    <Form.Control type="password" value="***************" readOnly />
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Label>Webhook URL</Form.Label>
                    <InputGroup>
                      <Form.Control type="text" value="https://yourdomain.com/webhooks/razorpay" readOnly />
                      <Button variant="outline-secondary">📋</Button>
                    </InputGroup>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Label>Environment</Form.Label>
                    <Form.Control type="text" value="Test Mode" readOnly />
                  </Col>
                </Row>
                <div className="d-flex flex-column flex-md-row justify-content-end gap-2 mt-3">
                  <Button variant="outline-dark">Reset</Button>
                  <Button className="btn-save-changes">Save Changes</Button>
                </div>
              </Card.Body>
            </Card>

            {/* Stripe */}
            <Card className="gateway-card">
              <Card.Header className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                <h6 className="fw-bold mb-0">Stripe</h6>
                <div className="d-flex align-items-center gap-2">
                  <span>Status:</span>
                  <Badge className="badge-secondary">Inactive</Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <Form.Label>Publishable Key</Form.Label>
                    <Form.Control type="text" value="pk_test_xxxxxxxxxxxxxxxxxx" readOnly />
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Label>Secret Key</Form.Label>
                    <Form.Control type="password" value="***************" readOnly />
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Label>Webhook URL</Form.Label>
                    <InputGroup>
                      <Form.Control type="text" value="https://yourdomain.com/webhooks/stripe" readOnly />
                      <Button variant="outline-secondary">📋</Button>
                    </InputGroup>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Label>Environment</Form.Label>
                    <Form.Control type="text" value="Test Mode" readOnly />
                  </Col>
                </Row>
                <div className="d-flex flex-column flex-md-row justify-content-end gap-2 mt-3">
                  <Button variant="outline-dark">Reset</Button>
                  <Button className="btn-save-changes">Save Changes</Button>
                </div>
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      )}

      {/* View Transaction Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header className="modal-header-gradient">
          <Modal.Title className="text-white">Payment Details</Modal.Title>
          <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} aria-label="Close"></button>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedTransaction && (
            <div>
              <h6 className="fw-bold mb-3">Payment Details</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><strong>Transaction ID:</strong> {selectedTransaction.id}</li>
                <li className="mb-2"><strong>Customer:</strong> {selectedTransaction.customer}</li>
                <li className="mb-2"><strong>Amount:</strong> <span style={{ color: '#505ece', fontWeight: 'bold' }}>{selectedTransaction.amount}</span></li>
                <li className="mb-2"><strong>Status:</strong> {getStatusBadge(selectedTransaction.status)}</li>
                <li className="mb-2"><strong>Date:</strong> {selectedTransaction.date}</li>
                <li className="mb-2"><strong>Method:</strong> {selectedTransaction.method.name}</li>
                {selectedTransaction.note && (
                  <li className="mb-2"><strong>Note:</strong> {selectedTransaction.note}</li>
                )}
                {selectedTransaction.manualRef && (
                  <li className="mb-2"><strong>Manual Ref:</strong> {selectedTransaction.manualRef}</li>
                )}
              </ul>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header className="modal-header-gradient">
          <Modal.Title className="text-white">Confirm Deletion</Modal.Title>
          <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)} aria-label="Close"></button>
        </Modal.Header>
        <Modal.Body>
          {transactionToDelete && (
            <>
              <p>Are you sure you want to delete this transaction?</p>
              <Alert variant="danger">
                <strong>Transaction ID:</strong> {transactionToDelete.id}<br />
                <strong>Amount:</strong> {transactionToDelete.amount}<br />
                <strong>Customer:</strong> {transactionToDelete.customer}
              </Alert>
              <p className="text-muted small mb-0">This action cannot be undone.</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Payments;