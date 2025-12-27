import React, { useState, useEffect, useRef } from 'react';
import {
  Table, Button, Modal, Form, Row, Col, Card, Container, Badge, Alert, Spinner
} from 'react-bootstrap';
import {
  FaCog, FaSyncAlt, FaEye, FaSave, FaPlug, FaTrash
} from 'react-icons/fa';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';
import './SaudiComplianceIntegration.css';

const SaudiComplianceIntegration = () => {
  const companyIdRaw = GetCompanyId();
  const companyId = Number(companyIdRaw);

  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    apiKey: '',
    endpointUrl: '',
    username: '',
    password: '',
    notes: ''
  });

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0 });

  // Fetch integrations on mount
  useEffect(() => {
    if (isNaN(companyId) || companyId <= 0) {
      setLoading(false);
      setError('Invalid Company ID');
      return;
    }

    const fetchIntegrations = async () => {
      try {
        const res = await axiosInstance.get(`compilanceRequest?company_id=${companyId}`);
        const data = res.data?.data || [];
        // Map to UI format
        const mapped = Array.isArray(data) ? data : [data].filter(Boolean);
        setIntegrations(mapped);
      } catch (err) {
        console.error('Failed to fetch compliance integrations:', err);
        setError('No compliance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, [companyId]);

  const maskApiKey = (key) => {
    if (!key) return '—';
    return key.length > 8
      ? `${key.substring(0, 4)}***${key.substring(key.length - 4)}`
      : '******';
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
    setEditingIntegration(null);
    setFormData({
      name: '',
      apiKey: '',
      endpointUrl: '',
      username: '',
      password: '',
      notes: ''
    });
    setError('');
    isCleaningUpRef.current = false;
  };

  const openModal = (integration = null) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    if (integration) {
      setEditingIntegration(integration);
      setFormData({
        name: integration.integration_name || '',
        apiKey: integration.api_key || '',
        endpointUrl: integration.endpoint_url || '',
        username: integration.username || '',
        password: '', // Never show password
        notes: integration.notes || ''
      });
    } else {
      setEditingIntegration(null);
      setFormData({
        name: '',
        apiKey: '',
        endpointUrl: '',
        username: '',
        password: '',
        notes: ''
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveConfig = async () => {
    const { name, apiKey, endpointUrl, username, password, notes } = formData;
    if (!name.trim() || !apiKey.trim()) {
      setError('Integration Name and API Key are required.');
      return;
    }

    try {
      let response;
      const payload = {
        integration_name: name.trim(),
        api_key: apiKey.trim(),
        endpoint_url: endpointUrl.trim(),
        username: username.trim(),
        notes: notes.trim()
      };

      // Include password only if provided (never sent empty)
      if (password) {
        payload.password = password;
      }

      if (editingIntegration) {
        // PUT: update
        response = await axiosInstance.put(`compilanceRequest/${editingIntegration.id}`, payload);
      } else {
        // POST: create
        response = await axiosInstance.post(`compilanceRequest?company_id=${companyId}`, payload);
      }

      if (response.data.success) {
        // Refresh list
        const res = await axiosInstance.get(`compilanceRequest?company_id=${companyId}`);
        const data = res.data?.data || [];
        const mapped = Array.isArray(data) ? data : [data].filter(Boolean);
        setIntegrations(mapped);
        // Reset cleanup flag before closing
        isCleaningUpRef.current = false;
        handleCloseModal();
      } else {
        setError(response.data.message || 'Operation failed.');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save configuration. Please try again.');
    }
  };

  const handleDelete = async (integration) => {
    if (!window.confirm(`Are you sure you want to delete integration "${integration.integration_name}"?`)) return;

    try {
      await axiosInstance.delete(`compilanceRequest/${integration.id}`);
      setIntegrations(integrations.filter(i => i.id !== integration.id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete integration.');
    }
  };

  const testConnection = (integrationName) => {
    // In real app, this would call a /test endpoint
    const success = Math.random() > 0.5;
    alert(success ? '✅ Connection successful!' : '❌ Connection failed.');
  };

  const getStatusBadgeClass = (integration) => {
    // Infer status from config completeness
    const hasKey = integration.api_key && integration.api_key.trim();
    const hasUrl = integration.endpoint_url && integration.endpoint_url.trim();
    if (hasKey && hasUrl) return 'badge-status badge-completed';
    if (hasKey || hasUrl) return 'badge-status badge-warning';
    return 'badge-status badge-missing';
  };

  const getConfigStatus = (integration) => {
    const hasKey = integration.api_key && integration.api_key.trim();
    const hasUrl = integration.endpoint_url && integration.endpoint_url.trim();
    if (hasKey && hasUrl) return 'Completed';
    if (hasKey || hasUrl) return 'Incomplete';
    return 'Missing Fields';
  };

  if (loading) {
    return (
      <Container fluid className="p-4 loading-container" style={{ minHeight: '100vh' }}>
        <div className="text-center py-5">
          <Spinner animation="border" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading compliance integrations...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 saudi-compliance-container">
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="saudi-compliance-title">
          <i className="fas fa-plug me-2"></i>
          Saudi Compliance Integration Readiness
        </h3>
        <p className="saudi-compliance-subtitle">
          Manage and monitor integration readiness with Saudi regulatory systems
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-3 error-alert">
          {error}
        </Alert>
      )}

      {/* Add New Button */}
      <div className="d-flex justify-content-end mb-3">
        <Button
          className="btn-add-integration"
          onClick={() => openModal()}
        >
          <FaCog /> Add New Integration
        </Button>
      </div>

      {/* Table Card */}
      <Card className="saudi-compliance-table-card border-0 shadow-lg">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover responsive className="saudi-compliance-table">
              <thead className="table-header">
                <tr>
                  <th>Integration</th>
                  <th>API Key</th>
                  <th>Configuration</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {integrations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">
                      <div className="empty-state">
                        <i className="fas fa-plug"></i>
                        <p>No compliance integrations configured</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  integrations.map((int) => (
                    <tr key={int.id}>
                      <td>
                        <div className="integration-name">{int.integration_name}</div>
                        <div className="integration-description">{int.notes || 'No description'}</div>
                      </td>
                      <td>
                        <span className="api-key-masked">{maskApiKey(int.api_key)}</span>
                      </td>
                      <td>
                        <Badge className={getStatusBadgeClass(int)}>
                          {getConfigStatus(int)}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            className="btn-action btn-edit"
                            onClick={() => openModal(int)}
                            title="Edit Integration"
                          >
                            <FaCog />
                          </Button>
                          <Button
                            className="btn-action btn-test"
                            onClick={() => testConnection(int.integration_name)}
                            title="Test Connection"
                          >
                            <FaPlug />
                          </Button>
                          <Button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(int)}
                            title="Delete Integration"
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

      {/* Modal */}
      <Modal 
        key={modalKeyRef.current.main}
        show={showModal} 
        onHide={handleCloseModal}
        onExited={handleModalExited}
        centered
        className="saudi-compliance-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            {editingIntegration ? 'Edit Integration' : 'Add New Integration'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {error && <Alert variant="danger" className="error-alert">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Integration Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="e.g., Zakat, Tax and Customs Authority"
                value={formData.name}
                onChange={handleInputChange}
                className="form-control-custom"
                required
              />
            </Form.Group>

            <Row>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">API Key *</Form.Label>
                  <Form.Control
                    type="text"
                    name="apiKey"
                    placeholder="Enter API key"
                    value={formData.apiKey}
                    onChange={handleInputChange}
                    className="form-control-custom"
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Endpoint URL</Form.Label>
                  <Form.Control
                    type="text"
                    name="endpointUrl"
                    placeholder="https://api.example.com"
                    value={formData.endpointUrl}
                    onChange={handleInputChange}
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="API username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-control-custom"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder={editingIntegration ? "••••••••" : "Enter new password"}
                value={formData.password}
                onChange={handleInputChange}
                className="form-control-custom"
              />
              {editingIntegration && (
                <Form.Text className="text-muted">
                  Leave blank to keep existing password.
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                placeholder="Additional notes or instructions..."
                value={formData.notes}
                onChange={handleInputChange}
                className="form-control-custom"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button className="btn-modal-save" onClick={handleSaveConfig}>
            <FaSave /> Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SaudiComplianceIntegration;