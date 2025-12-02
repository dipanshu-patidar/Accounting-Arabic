// CompanyPasswordRequests.js
import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import GetCompanyId from "../../../../Api/GetCompanyId";
import axiosInstance from "../../../../Api/axiosInstance";

const PasswordRequests = () => {
  const [showModal, setShowModal] = useState(false);
  const companyId = GetCompanyId();
  const [requests, setRequests] = useState([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch existing password change requests on mount
  useEffect(() => {
    if (companyId) {
      fetchRequests();
    }
  }, [companyId]);

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get(`password/my-requests/${companyId}`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setRequests(
          res.data.data.map(req => ({
            id: req.id,
            date: new Date(req.created_at).toISOString().split("T")[0],
            status: req.status === "Changed" ? "Approved" : req.status, // Normalize: API uses "Changed", UI uses "Approved"
            reason: req.reason,
            emailSent: req.email_sent,
          }))
        );
      }
    } catch (err) {
      toast.error("Failed to load password change requests.");
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.warn("Please enter a reason.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        company_id: companyId,
        reason: reason.trim(),
      };
      const res = await axiosInstance.post("password/request", payload);
      if (res.data.success) {
        toast.success("Password change request submitted successfully.");
        await fetchRequests(); // Refresh list
        setReason("");
        setShowModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setShowModal(false);
  };

  const renderStatus = (status) => {
    if (status === "Pending") return <Badge bg="warning">Pending</Badge>;
    if (status === "Approved") return <Badge bg="success">Changed</Badge>;
    if (status === "Rejected") return <Badge bg="danger">Rejected</Badge>;
    return <Badge bg="secondary">{status}</Badge>;
  };

  const renderEmailStatus = (emailSent) => {
    if (emailSent) return <Badge bg="info">Email Sent</Badge>;
    return null;
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Password Change Requests</h4>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Request Password Change
        </Button>
      </div>

      <Table bordered hover className="mt-3 shadow-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Request Date</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Email Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No password change requests found.
              </td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.date}</td>
                <td>{req.reason}</td>
                <td>{renderStatus(req.status)}</td>
                <td>{renderEmailStatus(req.emailSent)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Request Password Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for password change..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PasswordRequests;