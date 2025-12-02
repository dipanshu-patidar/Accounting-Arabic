import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Row, Col, Card, Container, Badge
} from 'react-bootstrap';
import {
  FaCog, FaSyncAlt, FaEye, FaSave, FaPlug
} from 'react-icons/fa';

const SaudiComplianceIntegration = () => {
  const [integrations, setIntegrations] = useState([]);
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

  useEffect(() => {
    setIntegrations([
      {
        id: 'GOSI',
        name: 'GOSI',
        description: 'General Organization for Social Insurance – Employee social insurance reporting',
        status: 'Connected',
        lastSyncDate: '2025-10-28',
        apiKey: 'gosi_live_abc123def456',
        configStatus: 'Completed'
      },
      {
        id: 'MUDAD',
        name: 'Mudad',
        description: 'Ministry of Human Resources platform for labor compliance',
        status: 'Not Connected',
        lastSyncDate: null,
        apiKey: null,
        configStatus: 'Missing Fields'
      },
      {
        id: 'QUWWA',
        name: 'Quwwa',
        description: 'Wage Protection System (WPS) – Salary disbursement verification',
        status: 'Pending',
        lastSyncDate: '2025-11-01',
        apiKey: 'quwwa_test_xyz789',
        configStatus: 'Completed'
      },
      {
        id: 'MUQEEM',
        name: 'Muqeem',
        description: 'Expatriate residency and employment data reporting',
        status: 'Connected',
        lastSyncDate: '2025-10-30',
        apiKey: 'muqeem_key_987zyx',
        configStatus: 'Completed'
      }
    ]);
  }, []);

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
        name: integration.id,
        apiKey: integration.apiKey || '',
        endpointUrl: integration.endpointUrl || '',
        username: integration.username || '',
        password: '',
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
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveConfig = () => {
    alert('Configuration saved successfully!');
    closeModal();
  };

  const testConnection = (integrationName) => {
    const success = Math.random() > 0.5;
    alert(success ? '✅ Connection successful!' : '❌ Connection failed.');
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Connected': return 'success';
      case 'Pending': return 'warning';
      case 'Not Connected': return 'danger';
      default: return 'secondary';
    }
  };

  const getConfigStatusVariant = (status) =>
    status === 'Completed' ? 'success' : 'danger';

  return (
    <Container
      fluid
      className="p-4"
      style={{
        backgroundColor: '#f0f7f8',
        fontFamily: 'Segoe UI, sans-serif',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          marginBottom: '25px',
          textAlign: 'center',
        }}
      >
        <h2
          className="fw-bold"
          style={{
            color: '#023347',
            fontSize: '1.8rem',
            marginBottom: '8px',
          }}
        >
          Saudi Compliance Integration Readiness
        </h2>
        <p
          style={{
            color: '#2a8e9c',
            fontSize: '0.95rem',
            marginBottom: '0',
          }}
        >
          Manage and monitor integration readiness with Saudi regulatory systems.
        </p>
      </div>

      {/* Card Container */}
      <Card
        className="shadow-lg border-0 mx-auto"
        style={{
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          maxWidth: '100%',
          overflowX: 'auto',
        }}
      >
        <Card.Body style={{ padding: '15px' }}>
          <div className="table-responsive">
            <Table hover className="align-middle text-nowrap" style={{ fontSize: '0.9rem' }}>
              <thead style={{ backgroundColor: '#e6f3f5', color: '#023347' }}>
                <tr>
                  <th>Integration</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Last Sync</th>
                  <th>API Key</th>
                  <th>Configuration</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {integrations.map((int) => (
                  <tr key={int.id}>
                    <td style={{ color: '#023347', fontWeight: '600' }}>{int.name}</td>
                    <td style={{ color: '#6c757d', fontSize: '0.85rem' }}>{int.description}</td>
                    <td>
                      <Badge bg={getStatusVariant(int.status)}>{int.status}</Badge>
                    </td>
                    <td>{int.lastSyncDate || '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{maskApiKey(int.apiKey)}</td>
                    <td>
                      <Badge bg={getConfigStatusVariant(int.configStatus)}>
                        {int.configStatus}
                      </Badge>
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
                        style={{
                          backgroundColor: '#023347',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = '#2a8e9c')
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = '#023347')
                        }
                        onClick={() => openModal(int)}
                      >
                        <FaCog size={12} className="me-1" />
                      </Button>
                      <Button
                        size="sm"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: '#2a8e9c',
                          color: '#023347',
                          backgroundColor: '#ffff'
                        }}
                        onClick={() => testConnection(int.name)}
                      >
                        <FaPlug size={12} className="me-1" />
                      </Button>
                      <Button
                        size="sm"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: '#2a8e9c',
                          color: '#023347',
                          backgroundColor: '#ffff'
                        }}
                        onClick={() => alert('View logs')}
                      >
                        <FaEye size={12} className="me-1" />
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
        show={showModal}
        onHide={closeModal}
        centered
        style={{ fontFamily: 'Segoe UI, sans-serif' }}
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: '#e6f3f5',
            color: '#023347',
            borderBottom: '1px solid #d1e6e9',
          }}
        >
          <Modal.Title>Configure Integration</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Integration Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                disabled
                onChange={handleInputChange}
              />
            </Form.Group>

            <Row>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>API Key</Form.Label>
                  <Form.Control
                    type="text"
                    name="apiKey"
                    value={formData.apiKey}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Endpoint URL</Form.Label>
                  <Form.Control
                    type="text"
                    name="endpointUrl"
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
                value={formData.username}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer style={{ borderTop: '1px solid #d1e6e9' }}>
          <Button
            style={{
              backgroundColor: '#023347',
              border: 'none',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = '#2a8e9c')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = '#023347')
            }
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
