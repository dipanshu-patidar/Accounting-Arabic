// CompanyPasswordRequests.js
import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Badge, Modal, Form, Container, Card, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import GetCompanyId from "../../../../Api/GetCompanyId";
import axiosInstance from "../../../../Api/axiosInstance";
import './PasswordRequests.css';

const PasswordRequests = () => {
  const [showModal, setShowModal] = useState(false);
  const companyId = GetCompanyId();
  const [requests, setRequests] = useState([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0 });

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
        // Reset cleanup flag before closing
        isCleaningUpRef.current = false;
        handleCloseModal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setShowModal(false);
    
    // Force modal remount on next open
    modalKeyRef.current.main += 1;
  };
  
  // Handle modal exit - cleanup after animation
  const handleModalExited = () => {
    // Reset form state after modal fully closed
    setReason("");
    isCleaningUpRef.current = false;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending": return "badge-status badge-pending";
      case "Approved": return "badge-status badge-approved";
      case "Rejected": return "badge-status badge-rejected";
      default: return "badge-status";
    }
  };

  const getStatusText = (status) => {
    if (status === "Approved") return "Changed";
    return status;
  };

  const renderStatus = (status) => {
    return <Badge className={getStatusBadgeClass(status)}>{getStatusText(status)}</Badge>;
  };

  const renderEmailStatus = (emailSent) => {
    if (emailSent) return <Badge className="badge-status badge-email-sent">Email Sent</Badge>;
    return null;
  };

  return (
    <Container fluid className="p-4 password-requests-container">
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="password-requests-title">
          <i className="fas fa-key me-2"></i>
          Password Change Requests
        </h3>
        <p className="password-requests-subtitle">
          Request password changes and track your requests
        </p>
      </div>

      {/* Action Bar */}
      <div className="d-flex justify-content-end mb-3">
        <Button 
          className="btn-request"
          onClick={() => {
            // Reset cleanup flag
            isCleaningUpRef.current = false;
            
            // Force modal remount
            modalKeyRef.current.main += 1;
            
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus"></i> Request Password Change
        </Button>
      </div>

      {/* Table Card */}
      <Card className="password-requests-table-card border-0 shadow-lg">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover responsive className="password-requests-table">
              <thead className="table-header">
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
                    <td colSpan="5" className="text-center text-muted py-4">
                      <div className="empty-state">
                        <i className="fas fa-key"></i>
                        <p>No password change requests found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id}>
                      <td>{req.id}</td>
                      <td className="date-cell">{req.date}</td>
                      <td className="reason-cell" title={req.reason}>{req.reason}</td>
                      <td>{renderStatus(req.status)}</td>
                      <td>{renderEmailStatus(req.emailSent)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal 
        key={modalKeyRef.current.main}
        show={showModal} 
        onHide={handleCloseModal}
        onExited={handleModalExited}
        centered
        className="password-requests-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Request Password Change</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Form>
            <Form.Group>
              <Form.Label className="form-label-custom">Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for password change..."
                className="form-control-custom"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button className="btn-modal-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PasswordRequests;