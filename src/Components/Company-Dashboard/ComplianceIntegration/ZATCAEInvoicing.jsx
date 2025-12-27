import React, { useState, useEffect, useRef } from 'react';
import {
  Table, Button, Modal, Form, Row, Col, Card, Container, Badge, Alert, Spinner
} from 'react-bootstrap';
import { FaFileInvoice, FaSave, FaPlusCircle, FaEdit, FaSyncAlt } from 'react-icons/fa';
import './ZATCAEInvoicing.css';

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Synced': return 'badge-status badge-synced';
      case 'Rejected': return 'badge-status badge-rejected';
      case 'Submitted': return 'badge-status badge-submitted';
      case 'Draft': return 'badge-status badge-draft';
      default: return 'badge-status';
    }
  };

  const getResponseAlertClass = (response) => {
    if (response === 'Success') return 'zatca-response-alert zatca-response-success';
    if (response === 'Pending Verification') return 'zatca-response-alert zatca-response-info';
    return 'zatca-response-alert zatca-response-danger';
  };

  return (
    <Container fluid className="p-4 zatca-invoicing-container">
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="zatca-title">
          <i className="fas fa-file-invoice me-2"></i>
          ZATCA E-Invoicing Dashboard
        </h3>
        <p className="zatca-subtitle">
          Manage, monitor, and sync your invoices with ZATCA compliance standards
        </p>
      </div>

      {/* Table Card */}
      <Card className="zatca-table-card border-0 shadow-lg">
        <Card.Body className="p-0">
          {/* Action Bar */}
          <div className="action-bar p-3">
            <h5 className="action-bar-title mb-0">
              Invoices List
            </h5>
            <Button
              onClick={() => openModal()}
              className="btn-add-invoice"
            >
              <FaPlusCircle /> New Invoice
            </Button>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <Table hover responsive className="zatca-table">
              <thead className="table-header">
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>ZATCA Response</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      <div className="empty-state">
                        <i className="fas fa-file-invoice"></i>
                        <p>No invoices available</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="fw-semibold">{inv.id}</td>
                      <td>{inv.customer}</td>
                      <td>{inv.date}</td>
                      <td>{inv.type}</td>
                      <td className="fw-semibold">{inv.total}</td>
                      <td>
                        <Badge className={getStatusBadgeClass(inv.status)}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td>
                        <span className={getResponseAlertClass(inv.zatcaResponse)}>
                          {inv.zatcaResponse}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            className="btn-action btn-edit"
                            onClick={() => openModal(inv)}
                            title="Edit Invoice"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            className="btn-action btn-sync"
                            onClick={() => syncToZATCA(inv.id)}
                            title="Sync to ZATCA"
                          >
                            <FaSyncAlt />
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

      {/* Modal */}
      <Modal 
        key={modalKeyRef.current.main}
        show={showModal} 
        onHide={handleCloseModal}
        onExited={handleModalExited}
        centered
        className="zatca-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Form>
            <Row>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Customer</Form.Label>
                  <Form.Control
                    type="text"
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    className="form-control-custom"
                    placeholder="Enter customer name"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-select-custom"
                  >
                    <option>Standard</option>
                    <option>Simplified</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Total (SAR)</Form.Label>
                  <Form.Control
                    type="text"
                    name="total"
                    value={formData.total}
                    onChange={handleInputChange}
                    className="form-control-custom"
                    placeholder="Enter total amount"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select-custom"
              >
                <option>Draft</option>
                <option>Submitted</option>
                <option>Synced</option>
                <option>Rejected</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">ZATCA Response</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="zatcaResponse"
                value={formData.zatcaResponse}
                onChange={handleInputChange}
                className="form-control-custom"
                placeholder="Enter ZATCA response or remarks"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button className="btn-modal-save" onClick={handleSaveInvoice}>
            <FaSave /> Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ZATCAEInvoicing;
