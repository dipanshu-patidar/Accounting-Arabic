import React, { useState, useEffect, useRef } from 'react';
import {
  Table, Button, Modal, Form, Row, Col, Card, Container, Badge, Alert
} from 'react-bootstrap';
import { FaFileInvoice, FaSave, FaPlusCircle, FaEdit, FaSyncAlt } from 'react-icons/fa';

const ZATCAEInvoicing = () => {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    customer: '',
    date: '',
    type: 'Standard',
    total: '',
    status: 'Draft',
    zatcaResponse: ''
  });

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0 });

  useEffect(() => {
    setInvoices([
      {
        id: 'INV-001',
        customer: 'Saudi Co. Ltd.',
        date: '2025-10-25',
        type: 'Standard',
        total: '2,500 SAR',
        status: 'Synced',
        zatcaResponse: 'Success'
      },
      {
        id: 'INV-002',
        customer: 'Riyadh Traders',
        date: '2025-10-30',
        type: 'Simplified',
        total: '850 SAR',
        status: 'Submitted',
        zatcaResponse: 'Pending Verification'
      },
      {
        id: 'INV-003',
        customer: 'Al-Nasr Supplies',
        date: '2025-11-01',
        type: 'Standard',
        total: '5,300 SAR',
        status: 'Rejected',
        zatcaResponse: 'Error in XML Schema'
      }
    ]);
  }, []);

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
    setEditingInvoice(null);
    setFormData({
      customer: '',
      date: '',
      type: 'Standard',
      total: '',
      status: 'Draft',
      zatcaResponse: ''
    });
    isCleaningUpRef.current = false;
  };

  const openModal = (invoice = null) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData(invoice);
    } else {
      setEditingInvoice(null);
      setFormData({
        customer: '',
        date: '',
        type: 'Standard',
        total: '',
        status: 'Draft',
        zatcaResponse: ''
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveInvoice = () => {
    if (editingInvoice) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === editingInvoice.id ? { ...editingInvoice, ...formData } : inv
        )
      );
    } else {
      const newInvoice = {
        id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
        ...formData
      };
      setInvoices([...invoices, newInvoice]);
    }
    // Reset cleanup flag before closing
    isCleaningUpRef.current = false;
    handleCloseModal();
  };

  const syncToZATCA = (invoiceId) => {
    const success = Math.random() > 0.4;
    const message = success ? 'Successfully synced to ZATCA.' : 'Sync failed. Try again.';
    alert(message);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Synced': return 'success';
      case 'Rejected': return 'danger';
      case 'Submitted': return 'info';
      case 'Draft': return 'secondary';
      default: return 'light';
    }
  };

  return (
    <Container
      fluid
      className="p-3 p-md-4"
      style={{
        backgroundColor: '#f0f7f8',
        minHeight: '100vh',
        fontFamily: 'Segoe UI, sans-serif',
        color: '#023347',
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '25px',
        }}
      >
        <h2
          style={{
            color: '#023347',
            fontWeight: '700',
            marginBottom: '8px',
          }}
        >
          ZATCA E-Invoicing Dashboard
        </h2>
        <p style={{ color: '#2a8e9c', fontSize: '0.95rem' }}>
          Manage, monitor, and sync your invoices with ZATCA compliance standards.
        </p>
      </div>

      {/* Card */}
      <Card
        className="shadow-lg border-0 mx-auto"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: '100%',
          padding: '15px',
        }}
      >
        <Card.Body>
          {/* Action Bar */}
          <div
            className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3"
            style={{ gap: '10px' }}
          >
            <h5 className="fw-bold" style={{ color: '#023347' }}>
              Invoices List
            </h5>
            <Button
              onClick={() => openModal()}
              style={{
                backgroundColor: '#023347',
                border: 'none',
                borderRadius: '50px',
                fontWeight: 600,
                padding: '0.5rem 1.3rem',
                boxShadow: '0 5px 12px rgba(2,51,71,0.25)',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#2a8e9c';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#023347';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              className='d-flex justify-content-center align-items-center'
            >
              <FaPlusCircle className="me-2" /> New Invoice
            </Button>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <Table
              bordered
              hover
              className="shadow-sm align-middle text-nowrap"
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                fontSize: '0.9rem',
              }}
            >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>ZATCA Response</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.id}</td>
                    <td>{inv.customer}</td>
                    <td>{inv.date}</td>
                    <td>{inv.type}</td>
                    <td>{inv.total}</td>
                    <td>
                      <Badge bg={getStatusVariant(inv.status)}>{inv.status}</Badge>
                    </td>
                    <td>
                      <Alert
                        variant={
                          inv.zatcaResponse === 'Success'
                            ? 'success'
                            : inv.zatcaResponse === 'Pending Verification'
                            ? 'info'
                            : 'danger'
                        }
                        style={{
                          padding: '2px 8px',
                          margin: '0',
                          fontSize: '0.8rem',
                          borderRadius: '8px',
                          display: 'inline-block',
                        }}
                      >
                        {inv.zatcaResponse}
                      </Alert>
                    </td>
                    <td
                      className="text-end"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '6px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Button
                        size="sm"
                        variant="outline-info"
                        style={{
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#023347',
                          backgroundColor: '#ffff',
                          borderColor: '#2a8e9c'
                        }}
                        onClick={() => openModal(inv)}
                      >
                        <FaEdit size={12} className="me-1" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-success"
                        style={{
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#023347',
                          backgroundColor: '#ffff',
                          borderColor: '#2a8e9c'
                        }}
                        onClick={() => syncToZATCA(inv.id)}
                      >
                        <FaSyncAlt size={12} className="me-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
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
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: '#023347',
            color: '#fff',
            borderBottom: 'none',
          }}
        >
          <Modal.Title>
            {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#e6f3f5' }}>
          <Form>
            <Row>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer</Form.Label>
                  <Form.Control
                    type="text"
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option>Standard</option>
                    <option>Simplified</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total (SAR)</Form.Label>
                  <Form.Control
                    type="text"
                    name="total"
                    value={formData.total}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option>Draft</option>
                <option>Submitted</option>
                <option>Synced</option>
                <option>Rejected</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>ZATCA Response</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="zatcaResponse"
                value={formData.zatcaResponse}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#e6f3f5', borderTop: 'none' }}>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            style={{
              backgroundColor: '#023347',
              border: 'none',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
            }}
            className='d-flex justify-content-center align-items-center'
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2a8e9c')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#023347')}
            onClick={handleSaveInvoice}
          >
            <FaSave className="me-2" /> Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ZATCAEInvoicing;
