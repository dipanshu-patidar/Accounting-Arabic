// Payments.js
import React, { useState, useMemo, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaFileExport,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaTrash,
  FaFilePdf,
  FaFileExcel,
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
        return <span className="badge bg-success">Success</span>;
      case "failed":
        return <span className="badge bg-danger">Failed</span>;
      case "pending":
        return <span className="badge bg-warning text-dark">Pending</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="payments-page-wrapper p-4">
      <div className="payments-dashboard">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
          <div>
            <h4 className="fw-bold d-flex align-items-center gap-2">
              <span role="img" aria-label="coins"></span> Payments
            </h4>
            <p className="text-muted mb-0">Manage all your payment transactions</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn text-white d-flex align-items-center gap-2 px-3 py-2"
              style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }}
            >
              <FaFileExcel className="text-success" /> Export Excel
            </button>
            <FaFilePdf size={18} className="text-danger" style={{ cursor: "pointer" }} />
          </div>
        </div>

        {/* ✅ DYNAMIC STATS CARDS USING API STATISTICS */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card shadow-sm h-100 payments-card">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="payments-icon bg-orange text-white">
                    <FaChartLine />
                  </div>
                  <h6 className="text-muted mb-0">Total Revenue</h6>
                </div>
                <h5 className="fw-bold">
                  ₹{parseFloat(stats.totalRevenue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h5>
                <p className="text-success small mb-0">
                  From {stats.successfulTransactions} successful payments
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card shadow-sm h-100 payments-card">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="payments-icon bg-success text-white">
                    <FaCheckCircle />
                  </div>
                  <h6 className="text-muted mb-0">Success Rate</h6>
                </div>
                <h5 className="fw-bold">{(stats.successRate || 0).toFixed(1)}%</h5>
                <p className="text-success small mb-0">
                  {stats.successfulTransactions} of {stats.totalTransactions} succeeded
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card shadow-sm h-100 payments-card">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="payments-icon bg-danger text-white">
                    <FaExclamationTriangle />
                  </div>
                  <h6 className="text-muted mb-0">Failed Transactions</h6>
                </div>
                <h5 className="fw-bold text-danger">{stats.failedTransactions || 0}</h5>
                <p className="text-danger small mb-0">
                  ↓ {(stats.totalTransactions > 0 ? (stats.failedTransactions / stats.totalTransactions) * 100 : 0).toFixed(1)}% of total
                </p>
              </div>
            </div>
          </div>
        </div>

        <ul className="nav nav-tabs mb-3 custom-tab-hover">
          {tabs.map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>

        <div className="mb-3">
          <input
            type="text"
            className="form-control payments-searchbar"
            placeholder="Search by transaction ID or customer name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {(activeTab === "All Payments" || activeTab === "Failed Transactions") && (
          <div className="bg-white rounded shadow-sm p-3">
            <h5 className="fw-bold mb-1">{activeTab}</h5>
            <p className="text-muted small mb-3">
              {activeTab === "All Payments"
                ? "A list of all payment transactions."
                : "Transactions that failed to process."}
            </p>

            {loading ? (
              <div className="text-center py-4">Loading transactions...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-4 text-muted">No transactions found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th><input type="checkbox" /></th>
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
                        <td><input type="checkbox" /></td>
                        <td>{txn.id}</td>
                        <td>{txn.date}</td>
                        <td><strong>{txn.customer}</strong></td>
                        <td>{txn.method.name}</td>
                        <td>{txn.amount}</td>
                        <td>{getStatusBadge(txn.status)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm text-info p-0"
                              onClick={() => handleViewDetails(txn)}
                            >
                              <BsEye size={18} />
                            </button>
                            <button
                              className="btn btn-link text-danger p-0"
                              onClick={() => handleDeleteClick(txn)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center px-2 py-2">
              <div className="text-muted small">
                Showing 1 to {filteredTransactions.length} of {filteredTransactions.length} results
              </div>
              {filteredTransactions.length > 10 && (
                <nav className="custom-pagination-success">
                  <ul className="pagination pagination-sm mb-0">
                    <li className="page-item disabled">
                      <button className="page-link">«</button>
                    </li>
                    <li className="page-item active">
                      <button className="page-link">1</button>
                    </li>
                    <li className="page-item">
                      <button className="page-link">»</button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        )}

        {/* Payment Settings Tab — unchanged */}
        {activeTab === "Payment Settings" && (
          <div className="bg-white rounded shadow-sm p-2 p-md-4">
            <h5 className="fw-bold mb-3">Payment Gateway Settings</h5>
            <p className="text-muted mb-4">Configure your payment gateway settings.</p>
            {/* Razorpay */}
            <div className="mb-4 border rounded p-2 p-md-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
                <h6 className="fw-bold mb-0">Razorpay</h6>
                <div className="d-flex align-items-center gap-2">
                  <span>Status:</span>
                  <span className="badge bg-success">Active</span>
                </div>
              </div>
              <div className="row g-2 g-md-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">API Key</label>
                  <input type="password" className="form-control" value="***************" readOnly />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Secret Key</label>
                  <input type="password" className="form-control" value="***************" readOnly />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Webhook URL</label>
                  <div className="input-group">
                    <input type="text" className="form-control" value="https://yourdomain.com/webhooks/razorpay" readOnly />
                    <button className="btn btn-outline-secondary" type="button">📋</button>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Environment</label>
                  <input type="text" className="form-control" value="Test Mode" readOnly />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row justify-content-end gap-2 mt-3">
                <button className="btn btn-outline-dark">Reset</button>
                <button className="btn text-white" style={{ backgroundColor: '#53b2a5' }}>
                  Save Changes
                </button>
              </div>
            </div>

            {/* Stripe */}
            <div className="border rounded p-2 p-md-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
                <h6 className="fw-bold mb-0">Stripe</h6>
                <div className="d-flex align-items-center gap-2">
                  <span>Status:</span>
                  <span className="badge bg-secondary">Inactive</span>
                </div>
              </div>
              <div className="row g-2 g-md-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Publishable Key</label>
                  <input type="text" className="form-control" value="pk_test_xxxxxxxxxxxxxxxxxx" readOnly />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Secret Key</label>
                  <input type="password" className="form-control" value="***************" readOnly />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Webhook URL</label>
                  <div className="input-group">
                    <input type="text" className="form-control" value="https://yourdomain.com/webhooks/stripe" readOnly />
                    <button className="btn btn-outline-secondary" type="button">📋</button>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Environment</label>
                  <input type="text" className="form-control" value="Test Mode" readOnly />
                </div>
              </div>
              <div className="d-flex flex-column flex-md-row justify-content-end gap-2 mt-3">
                <button className="btn btn-outline-dark">Reset</button>
                <button className="btn text-white" style={{ backgroundColor: '#53b2a5' }}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals — unchanged */}
        {showModal && selectedTransaction && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Payment Details</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-4">
                    <h5>Payment Details</h5>
                    <ul className="list-unstyled">
                      <li className="mb-2"><strong>Transaction ID:</strong> {selectedTransaction.id}</li>
                      <li className="mb-2"><strong>Customer:</strong> {selectedTransaction.customer}</li>
                      <li className="mb-2"><strong>Amount:</strong> {selectedTransaction.amount}</li>
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
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && transactionToDelete && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this transaction?</p>
                  <div className="alert alert-danger">
                    <strong>Transaction ID:</strong> {transactionToDelete.id}<br />
                    <strong>Amount:</strong> {transactionToDelete.amount}<br />
                    <strong>Customer:</strong> {transactionToDelete.customer}
                  </div>
                  <p className="text-muted small">This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .payments-searchbar {
          border-radius: 10px;
          font-size: 1rem;
          padding: 0.7rem 1rem;
          border: 1px solid #e5e7eb;
          background: #fafbfc;
          box-shadow: none;
          transition: border-color 0.2s;
        }
        .payments-searchbar:focus {
          border-color: #2684ff;
          background: #fff;
          box-shadow: 0 0 0 2px #e0eaff;
        }
      `}</style>
    </div>
  );
};

export default Payments;