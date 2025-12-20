// SuperAdminPasswordRequests.js
import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Modal, Form, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import axiosInstance from "../../../Api/axiosInstance";

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
    if (status === "Pending") return <Badge bg="warning">Pending</Badge>;
    if (status === "Approved") return <Badge bg="success">Changed</Badge>;
    if (status === "Rejected") return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="secondary">{status}</Badge>;
  };

  const renderEmailStatus = (emailSent) => {
    return emailSent ? <Badge bg="info">Email Sent</Badge> : null;
  };

  return (
    <div className="p-2">
      <h4 className="mb-3">Manage Password Requests</h4>

      {showEmailSentAlert && (
        <Alert
          variant="success"
          onClose={() => setShowEmailSentAlert(false)}
          dismissible
        >
          New password has been sent to {selectedRequest?.email}
        </Alert>
      )}

      <Table bordered hover className="shadow-sm">
        <thead>
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
          {loading ? (
            <tr>
              <td colSpan="8" className="text-center">Loading...</td>
            </tr>
          ) : requests.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center text-muted">
                No password change requests found.
              </td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.company}</td>
                <td>{req.email}</td>
                <td>{req.date}</td>
                <td>{renderStatus(req.status)}</td>
                <td>{req.reason}</td>
                <td>{renderEmailStatus(req.emailSent)}</td>
                <td>
                  {req.status === "Pending" && (
                    <Button
                      size="sm"
                      variant="primary"
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
            ))
          )}
        </tbody>
      </Table>

      {/* Approve/Reject Modal */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setNewPassword("");
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Review Password Change Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <b>Company:</b> {selectedRequest?.company}
          </p>
          <p>
            <b>Email:</b> {selectedRequest?.email}
          </p>
          <p>
            <b>Reason:</b> {selectedRequest?.reason}
          </p>
          <Form.Group className="mt-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => handleAction("reject")}
            disabled={loading}
          >
            Reject
          </Button>
          <Button
            variant="success"
            onClick={() => handleAction("approve")}
            disabled={!newPassword.trim() || loading}
          >
            {loading ? "Processing..." : "Approve & Send Email"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SuperAdminPasswordRequests;