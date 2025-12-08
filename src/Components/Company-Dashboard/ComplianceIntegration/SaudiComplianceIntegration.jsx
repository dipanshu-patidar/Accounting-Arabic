import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Row, Col, Card, Container, Badge, Alert
} from 'react-bootstrap';
import {
  FaCog, FaSyncAlt, FaEye, FaSave, FaPlug, FaTrash
} from 'react-icons/fa';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';

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

  const openModal = (integration = null) => {
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

  const closeModal = () => {
    setShowModal(false);
    setError('');
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
        closeModal();
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

  const getStatusVariant = (integration) => {
    // Infer status from config completeness
    const hasKey = integration.api_key && integration.api_key.trim();
    const hasUrl = integration.endpoint_url && integration.endpoint_url.trim();
    if (hasKey && hasUrl) return 'success';
    if (hasKey || hasUrl) return 'warning';
    return 'danger';
  };

  const getConfigStatus = (integration) => {
    return (integration.api_key && integration.api_url) ? 'Completed' : 'Missing Fields';
  };

  if (loading) {
    return (
      <Container fluid className="p-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh' }}>
        <div className="text-center py-5">Loading compliance integrations...</div>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="p-4"
      style={{
        backgroundColor: '#f0f7f8',
        fontFamily: 'Segoe UI, sans-serif',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '25px', textAlign: 'center' }}>
        <h2 className="fw-bold" style={{ color: '#023347', fontSize: '1.8rem', marginBottom: '8px' }}>
          Saudi Compliance Integration Readiness
        </h2>
        <p style={{ color: '#2a8e9c', fontSize: '0.95rem', marginBottom: '0' }}>
          Manage and monitor integration readiness with Saudi regulatory systems.
        </p>
      </div>

      {/* Error Alert */}
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {/* Add New Button */}
      <div className="d-flex justify-content-end mb-3">
        <Button
          style={{ backgroundColor: '#023347', border: 'none' }}
          onClick={() => openModal()}
        >
          <FaCog className="me-1" /> Add New Integration
        </Button>
      </div>

      {/* Table */}
      <Card className="shadow-lg border-0">
        <Card.Body style={{ padding: '15px' }}>
          <div className="table-responsive">
            <Table hover className="align-middle text-nowrap" style={{ fontSize: '0.9rem' }}>
              <thead style={{ backgroundColor: '#e6f3f5', color: '#023347' }}>
                <tr>
                  <th>Integration</th>
                  <th>API Key</th>
                  <th>Configuration</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {integrations.length > 0 ? (
                  integrations.map((int) => (
                    <tr key={int.id}>
                      <td>
                        <div style={{ fontWeight: '600', color: '#023347' }}>{int.integration_name}</div>
                        <div className="text-muted small">{int.notes || 'No description'}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{maskApiKey(int.api_key)}</td>
                      <td>
                        <Badge bg={getStatusVariant(int) === 'success' ? 'success' : 'danger'}>
                          {getConfigStatus(int)}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => openModal(int)}
                          >
                            <FaCog />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => testConnection(int.integration_name)}
                          >
                            <FaPlug />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(int)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-3">
                      No compliance integrations configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header
          closeButton
          style={{
            backgroundColor: '#e6f3f5',
            color: '#023347',
            borderBottom: '1px solid #d1e6e9',
          }}
        >
          <Modal.Title>
            {editingIntegration ? 'Edit Integration' : 'Add New Integration'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px' }}>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Integration Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="e.g., Zakat, Tax and Customs Authority"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Row>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>API Key *</Form.Label>
                  <Form.Control
                    type="text"
                    name="apiKey"
                    placeholder="Enter API key"
                    value={formData.apiKey}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Endpoint URL</Form.Label>
                  <Form.Control
                    type="text"
                    name="endpointUrl"
                    placeholder="https://api.example.com"
                    value={formData.endpointUrl}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="API username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder={editingIntegration ? "••••••••" : "Enter new password"}
                value={formData.password}
                onChange={handleInputChange}
              />
              {editingIntegration && (
                <Form.Text className="text-muted">
                  Leave blank to keep existing password.
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                placeholder="Additional notes or instructions..."
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer style={{ borderTop: '1px solid #d1e6e9' }}>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: '#023347', border: 'none' }}
            onClick={handleSaveConfig}
          >
            <FaSave className="me-2" /> Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SaudiComplianceIntegration;