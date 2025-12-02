import React, { useState } from "react";
import { Card, Button, Table, Modal, Form } from "react-bootstrap";
import { FaLifeRing, FaEnvelope, FaPlus, FaPaperPlane } from "react-icons/fa";

const SupportTickets = () => {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      subject: "Unable to generate invoice",
      status: "Open",
      date: "2025-11-04",
      message: "System shows an error when trying to generate an invoice.",
    },
    {
      id: 2,
      subject: "Request for feature enhancement",
      status: "Resolved",
      date: "2025-10-28",
      message: "Please add an option to export reports in CSV format.",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", message: "" });

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTicket({ ...newTicket, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;
    const newEntry = {
      id: tickets.length + 1,
      subject: newTicket.subject,
      message: newTicket.message,
      status: "Open",
      date: new Date().toISOString().slice(0, 10),
    };
    setTickets([newEntry, ...tickets]);
    setNewTicket({ subject: "", message: "" });
    handleClose();
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "#f0f7f8" }}
    >
      <Card
        className="shadow-lg rounded-2xl p-4"
        style={{
          borderColor: "#2a8e9c",
          backgroundColor: "#e6f3f5",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-bold flex items-center gap-2"
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
            className="d-flex align-items-center justify-content-center"
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
            </tr>
          </thead>
          <tbody>
            {tickets.length > 0 ? (
              tickets.map((t) => (
                <tr key={t.id} className="text-center">
                  <td>{t.id}</td>
                  <td className="font-semibold">{t.subject}</td>
                  <td className="text-gray-700">{t.message}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        t.status === "Open"
                          ? "bg-blue-600"
                          : "bg-green-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>{t.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-500">
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
          <Modal.Title className="d-flex align-items-center justify-content-center">
            <FaEnvelope className="me-2" /> Submit New Ticket
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body style={{ backgroundColor: "#e6f3f5" }}>
            <Form.Group className="mb-3">
              <Form.Label className="font-semibold">Subject</Form.Label>
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
              <Form.Label className="font-semibold">Message</Form.Label>
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
          <Modal.Footer
            style={{ backgroundColor: "#f0f7f8", borderTop: "1px solid #2a8e9c" }}
          >
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              style={{
                backgroundColor: "#2a8e9c",
                border: "none",
                fontWeight: "600",
              }}
              className="d-flex align-items-center justify-content-center"
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
