import React, { useState, useEffect } from "react";
import { Card, Button, Table, Modal, Form, Badge } from "react-bootstrap";
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

const SupportTickets = () => {
  const companyIdRaw = GetCompanyId();
  const companyId = Number(companyIdRaw);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", message: "" });
  const [error, setError] = useState("");

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

  const handleShow = () => {
    setNewTicket({ subject: "", message: "" });
    setError("");
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

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
      handleClose();
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

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: "#f0f7f8" }}>
        <div className="text-center py-5">Loading support tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: "#f0f7f8" }}>
        <div className="text-center py-5 text-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f0f7f8" }}>
      <Card
        className="shadow-lg rounded-2xl p-4"
        style={{
          borderColor: "#2a8e9c",
          backgroundColor: "#e6f3f5",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2
            className="text-xl font-bold d-flex align-items-center gap-2"
            style={{ color: "#023347" }}
          >
            <FaLifeRing className="text-2xl" style={{ color: "#2a8e9c" }} />
            Support Tickets
          </h2>
          <Button
            onClick={handleShow}
            style={{
              backgroundColor: "#2a8e9c",
              border: "none",
              fontWeight: "600",
            }}
          >
            <FaPlus className="me-2" /> New Ticket
          </Button>
        </div>

        <Table striped bordered hover responsive className="text-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length > 0 ? (
              tickets.map((t) => (
                <tr key={t.id} className="text-center">
                  <td>{t.id}</td>
                  <td className="font-weight-bold">{t.subject}</td>
                  <td className="text-muted">{t.message}</td>
                  <td>
                    {t.status === "Open" ? (
                      <Badge bg="warning" text="dark">Open</Badge>
                    ) : t.status === "In Progress" ? (
                      <Badge bg="info">In Progress</Badge>
                    ) : (
                      <Badge bg="success">Resolved</Badge>
                    )}
                  </td>
                  <td>{t.date}</td>
                  <td>
                    {t.status !== "Resolved" && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-1"
                        onClick={() => handleUpdateStatus(t.id, t.status)}
                      >
                        <FaSync /> Update
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(t.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No tickets available.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* Create Ticket Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#023347", color: "white" }}
        >
          <Modal.Title className="d-flex align-items-center">
            <FaEnvelope className="me-2" /> Submit New Ticket
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ backgroundColor: "#e6f3f5" }}>
            {error && <div className="text-danger mb-2">{error}</div>}
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                placeholder="Enter subject"
                value={newTicket.subject}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="message"
                placeholder="Describe your issue..."
                value={newTicket.message}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: "#f0f7f8" }}>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              style={{
                backgroundColor: "#2a8e9c",
                border: "none",
              }}
            >
              <FaPaperPlane className="me-2" /> Submit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default SupportTickets;