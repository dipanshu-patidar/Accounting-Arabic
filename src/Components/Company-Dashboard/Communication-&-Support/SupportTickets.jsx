import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Table, Modal, Form, Badge, Container, Spinner, Alert } from "react-bootstrap";
import {
  FaLifeRing,
  FaEnvelope,
  FaPlus,
  FaPaperPlane,
  FaTrash,
  FaSync
} from "react-icons/fa";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import './SupportTickets.css';

const SupportTickets = () => {
  const companyIdRaw = GetCompanyId();
  const companyId = Number(companyIdRaw);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", message: "" });
  const [error, setError] = useState("");

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0 });

  // Fetch all tickets on mount
  useEffect(() => {
    if (isNaN(companyId) || companyId <= 0) {
      setLoading(false);
      setError("Invalid Company ID");
      return;
    }

    const fetchTickets = async () => {
      try {
        const response = await axiosInstance.get(`supportTicket?company_id=${companyId}`);
        const ticketsWithDate = (response.data || []).map(ticket => ({
          ...ticket,
          date: ticket.created_at ? ticket.created_at.split('T')[0] : ''
        }));
        setTickets(ticketsWithDate);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        setError("Failed to load support tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [companyId]);

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
    setNewTicket({ subject: "", message: "" });
    setError("");
    isCleaningUpRef.current = false;
  };

  const handleShow = () => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    setNewTicket({ subject: "", message: "" });
    setError("");
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTicket({ ...newTicket, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      setError("Both subject and message are required.");
      return;
    }

    try {
      const payload = {
        subject: newTicket.subject.trim(),
        message: newTicket.message.trim()
      };

      const response = await axiosInstance.post(`supportTicket?company_id=${companyId}`, payload);

      const newTicketWithDate = {
        ...response.data,
        date: response.data.created_at ? response.data.created_at.split('T')[0] : ''
      };

      setTickets([newTicketWithDate, ...tickets]);
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleCloseModal();
    } catch (err) {
      console.error("Failed to create ticket:", err);
      setError("Failed to submit ticket. Please try again.");
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Open" ? "In Progress" : "Resolved";
    try {
      await axiosInstance.put(`supportTicket/${id}?company_id=${companyId}`, { status: newStatus });
      setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error("Failed to update ticket:", err);
      alert("Failed to update ticket status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await axiosInstance.delete(`supportTicket/${id}`);
      setTickets(tickets.filter(t => t.id !== id));
    } catch (err) {
      console.error("Failed to delete ticket:", err);
      alert("Failed to delete ticket.");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Open": return "badge-status badge-open";
      case "In Progress": return "badge-status badge-in-progress";
      case "Resolved": return "badge-status badge-resolved";
      default: return "badge-status";
    }
  };

  if (loading) {
    return (
      <Container fluid className="p-4 loading-container" style={{ minHeight: '100vh' }}>
        <div className="text-center py-5">
          <Spinner animation="border" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading support tickets...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 support-tickets-container">
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="support-tickets-title">
          <i className="fas fa-life-ring me-2"></i>
          Support Tickets
        </h3>
        <p className="support-tickets-subtitle">
          Create and manage support tickets for assistance
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="error-alert mb-3">
          {error}
        </Alert>
      )}

      {/* Action Bar */}
      <div className="d-flex justify-content-end mb-3">
        <Button
          onClick={handleShow}
          className="btn-add-ticket"
        >
          <FaPlus /> New Ticket
        </Button>
      </div>

      {/* Table Card */}
      <Card className="support-tickets-table-card border-0 shadow-lg">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover responsive className="support-tickets-table">
              <thead className="table-header">
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      <div className="empty-state">
                        <i className="fas fa-ticket-alt"></i>
                        <p>No tickets available</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td className="subject-cell">{t.subject}</td>
                      <td className="message-cell" title={t.message}>{t.message}</td>
                      <td>
                        <Badge className={getStatusBadgeClass(t.status)}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="date-cell">{t.date}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          {t.status !== "Resolved" && (
                            <Button
                              className="btn-action btn-update"
                              onClick={() => handleUpdateStatus(t.id, t.status)}
                              title="Update Status"
                            >
                              <FaSync />
                            </Button>
                          )}
                          <Button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(t.id)}
                            title="Delete Ticket"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Create Ticket Modal */}
      <Modal 
        key={modalKeyRef.current.main}
        show={showModal} 
        onHide={handleCloseModal}
        onExited={handleModalExited}
        centered
        className="support-tickets-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="d-flex align-items-center">
            <FaEnvelope className="me-2" /> Submit New Ticket
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="modal-body-custom">
            {error && (
              <Alert variant="danger" className="error-alert mb-3">
                {error}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Subject</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                placeholder="Enter subject"
                value={newTicket.subject}
                onChange={handleChange}
                className="form-control-custom"
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="form-label-custom">Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="message"
                placeholder="Describe your issue..."
                value={newTicket.message}
                onChange={handleChange}
                className="form-control-custom"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button className="btn-modal-cancel" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" className="btn-modal-submit">
              <FaPaperPlane /> Submit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default SupportTickets;