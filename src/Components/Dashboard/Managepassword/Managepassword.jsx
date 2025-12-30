// SuperAdminPasswordRequests.js
import React, { useState, useEffect } from "react";
import { Container, Card, Table, Button, Badge, Modal, Form, Alert, Spinner } from "react-bootstrap";
import { FaKey, FaUser, FaEnvelope, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaFileAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../../Api/axiosInstance";
import "./Managepassword.css";

const SuperAdminPasswordRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showEmailSentAlert, setShowEmailSentAlert] = useState(false);

  // Fetch all requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("password/requests");
      if (res.data.success && Array.isArray(res.data.data)) {
        const formatted = res.data.data.map((req) => ({
          id: req.id,
          company: req.users?.name || "Unknown Company", // ✅ Fixed: 'users', not 'user'
          email: req.users?.email || "N/A",               // ✅ Fixed
          date: new Date(req.created_at).toISOString().split("T")[0],
          status: req.status === "Changed" ? "Approved" : req.status,
          reason: req.reason,
          emailSent: req.email_sent,
        }));
        setRequests(formatted);
      }
    } catch (err) {
      toast.error("Failed to load password change requests.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (!selectedRequest) return;

    try {
      setLoading(true);
      let res;

      if (action === "approve") {
        if (!newPassword.trim()) {
          toast.warn("Please enter a new password.");
          return;
        }
        res = await axiosInstance.put(`password/requests/${selectedRequest.id}/approve`, {
          new_password: newPassword.trim(),
        });
        toast.success(`Password updated and email sent to ${selectedRequest.email}`);
        setShowEmailSentAlert(true);
        setTimeout(() => setShowEmailSentAlert(false), 3000);
      } else if (action === "reject") {
        res = await axiosInstance.put(`password/requests/${selectedRequest.id}/reject`);
        toast.info("Request rejected.");
      }

      if (res?.data?.success) {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === selectedRequest.id
              ? { ...req, status: action === "approve" ? "Approved" : "Rejected", emailSent: action === "approve" }
              : req
          )
        );
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed.";
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
      setShowModal(false);
      setNewPassword("");
    }
  };

  const renderStatus = (status) => {
    if (status === "Pending") return <Badge className="status-badge badge-warning">Pending</Badge>;
    if (status === "Approved") return <Badge className="status-badge badge-success">Changed</Badge>;
    if (status === "Rejected") return <Badge className="status-badge badge-danger">Rejected</Badge>;
    return <Badge className="status-badge badge-secondary">{status}</Badge>;
  };

  const renderEmailStatus = (emailSent) => {
    return emailSent ? <Badge className="status-badge badge-info">Email Sent</Badge> : null;
  };

  return (
    <Container fluid className="manage-password-container py-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Section */}
      <div className="manage-password-header mb-4">
        <h4 className="fw-bold d-flex align-items-center gap-2 manage-password-title">
          <FaKey style={{ color: '#505ece' }} /> Manage Password Requests
        </h4>
        <p className="text-muted mb-0">Review and manage password change requests from companies</p>
      </div>

      {showEmailSentAlert && (
        <Alert
          variant="success"
          onClose={() => setShowEmailSentAlert(false)}
          dismissible
          className="mb-4"
        >
          New password has been sent to {selectedRequest?.email}
        </Alert>
      )}

      {/* Table Card */}
      <Card className="manage-password-table-card">
        <Card.Header className="manage-password-table-header">
          <h6 className="mb-0 fw-bold">Password Change Requests</h6>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="spinner-custom" />
              <p className="mt-3 text-muted">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-5 empty-state">
              <FaFileAlt style={{ fontSize: "3rem", color: "#adb5bd", marginBottom: "1rem" }} />
              <p className="text-muted mb-0">No password change requests found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="manage-password-table" hover responsive>
                <thead className="manage-password-table-thead">
                  <tr>
                    <th>#</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Email Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td>{req.id}</td>
                      <td><strong>{req.company}</strong></td>
                      <td>{req.email}</td>
                      <td>{req.date}</td>
                      <td>{renderStatus(req.status)}</td>
                      <td>{req.reason || <span className="text-muted">—</span>}</td>
                      <td>{renderEmailStatus(req.emailSent)}</td>
                      <td>
                        {req.status === "Pending" && (
                          <Button
                            className="btn-review"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(req);
                              setShowModal(true);
                            }}
                            disabled={loading}
                          >
                            Review
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Approve/Reject Modal */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setNewPassword("");
        }}
        centered
        size="lg"
      >
        <Modal.Header className="modal-header-gradient">
          <Modal.Title className="text-white">Review Password Change Request</Modal.Title>
          <button type="button" className="btn-close btn-close-white" onClick={() => {
            setShowModal(false);
            setNewPassword("");
          }} aria-label="Close"></button>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedRequest && (
            <div>
              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaUser style={{ color: '#505ece' }} />
                  <strong>Company:</strong>
                </div>
                <p className="ms-4 mb-3">{selectedRequest.company}</p>
              </div>
              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaEnvelope style={{ color: '#505ece' }} />
                  <strong>Email:</strong>
                </div>
                <p className="ms-4 mb-3">{selectedRequest.email}</p>
              </div>
              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaFileAlt style={{ color: '#505ece' }} />
                  <strong>Reason:</strong>
                </div>
                <p className="ms-4 mb-3">{selectedRequest.reason || <span className="text-muted">No reason provided</span>}</p>
              </div>
              <Form.Group className="mt-4">
                <Form.Label className="fw-bold">New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="form-control-custom"
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowModal(false);
              setNewPassword("");
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleAction("reject")}
            disabled={loading}
            className="btn-reject"
          >
            {loading ? "Processing..." : "Reject"}
          </Button>
          <Button
            className="btn-approve"
            onClick={() => handleAction("approve")}
            disabled={!newPassword.trim() || loading}
          >
            {loading ? "Processing..." : "Approve & Send Email"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SuperAdminPasswordRequests;