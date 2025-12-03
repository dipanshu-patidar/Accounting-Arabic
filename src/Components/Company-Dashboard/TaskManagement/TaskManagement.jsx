import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Card,
  Container,
  Badge,
} from 'react-bootstrap';
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaSave,
  FaPlus,
  FaPaperclip,
} from 'react-icons/fa';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';

const TaskManagement = () => {
  const companyId = GetCompanyId();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
    attachment: null,
    attachmentName: '',
  });
  const fileInputRef = useRef(null);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!companyId) return;
      try {
        const res = await axiosInstance.get(`employee?company_id=${companyId}`);
        if (res?.data?.success) {
          setEmployees(
            res.data.data.employees.map((emp) => ({
              id: emp.id,
              name: emp.full_name || emp.employee_code || `Employee ${emp.id}`,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch employees', err);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, [companyId]);

  // Fetch tasks
  const fetchTasks = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`taskRequest/tasks?company_id=${companyId}`);

      // Handle case where response is array of tasks (as per your sample)
      if (Array.isArray(res.data)) {
        const mapped = res.data.map((task) => ({
          id: task.id,
          title: task.title?.trim() || 'Untitled',
          description: task.description || '',
          priority: task.priority || 'Medium',
          status: task.status || 'Pending',
          dueDate: task.due_date ? task.due_date.split('T')[0] : '',
          createdBy: task.creator?.name || '—',
          assignedTo: task.assigned_to, // 👈 direct field
          assignedToName: task.assigned_employee?.full_name || 'Unassigned', // 👈 direct object
          attachment: task.attachment_url || null,
          attachmentName: task.attachment_name || '',
        }));
        setTasks(mapped);
      } else {
        console.warn('Unexpected response format:', res.data);
        setTasks([]);
      }
    } catch (err) {
      console.error('Failed to fetch tasks', err);
      alert('Failed to load tasks.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchTasks();
    }
  }, [companyId]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'Medium',
      dueDate: '',
      attachment: null,
      attachmentName: '',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment') {
      const file = files?.[0];
      if (file) {
        setFormData({
          ...formData,
          attachment: file,
          attachmentName: file.name,
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openModal = async (task = null) => {
    if (task) {
      try {
        const res = await axiosInstance.get(`taskRequest/tasks/${task.id}`);
        const t = res.data;

        setEditingTask(t);
        setFormData({
          title: t.title || '',
          description: t.description || '',
          assignedTo: (t.assigned_to || '').toString(), // 👈 direct field
          priority: t.priority || 'Medium',
          dueDate: t.due_date ? t.due_date.split('T')[0] : '',
          attachment: null,
          attachmentName: t.attachment_name || '',
        });
      } catch (err) {
        console.error('Failed to load task for edit', err);
        alert('Could not load task details.');
        return;
      }
    } else {
      setEditingTask(null);
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    const { title, assignedTo, dueDate } = formData;
    if (!title || !assignedTo || !dueDate) {
      alert('Please fill Title, Assigned To, and Due Date.');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description || '',
      priority: formData.priority,
      due_date: formData.dueDate,
      assignee: assignedTo, // Employee ID as string or number
      company_id: companyId,
      // Note: File upload not implemented — handle separately if needed
    };

    try {
      if (editingTask) {
        await axiosInstance.put(`taskRequest/tasks/${editingTask.id}`, payload);
        alert('Task updated successfully!');
      } else {
        await axiosInstance.post('taskRequest/tasks', payload);
        alert('Task created successfully!');
      }
      await fetchTasks();
      closeModal();
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save task.');
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axiosInstance.delete(`taskRequest/tasks/${id}`);
      alert('Task deleted successfully!');
      await fetchTasks();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete task.');
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Pending': return 'secondary';
      default: return 'light';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#f0f7f8' }}>
        <div className="spinner-border" style={{ color: '#023347' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh' }}>
      <div className="mb-4 text-center text-md-start">
        <h2 className="fw-bold mb-2" style={{ color: '#023347' }}>
          Task & Assignment Management
        </h2>
        <p style={{ color: '#2a8e9c', fontSize: '1rem' }} className="text-center">
          Assign, track, and manage tasks seamlessly across teams.
        </p>
      </div>

      <Card className="shadow border-0" style={{ borderRadius: '15px', backgroundColor: '#e6f3f5' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold" style={{ color: '#023347' }}>Task List</h5>
            <Button
              size="sm"
              onClick={() => openModal()}
              style={{
                backgroundColor: '#023347',
                border: 'none',
                borderRadius: '30px',
                padding: '6px 14px',
                fontWeight: '600',
                boxShadow: '0 4px 10px rgba(2, 51, 71, 0.3)',
              }}
            >
              <FaPlus className="me-1" /> Add Task
            </Button>
          </div>

          <div className="table-responsive">
            <Table hover bordered className="align-middle text-center">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-muted py-4">
                      No tasks found. Click “Add Task” to create one.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="fw-bold" style={{ color: '#023347' }}>{task.title}</td>
                     <td>{task.assignedToName || 'Unassigned'}</td>
                      <td>
                        <Badge bg={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                      </td>
                      <td>{formatDate(task.dueDate)}</td>
                      <td>
                        <Badge bg={getStatusVariant(task.status)}>{task.status}</Badge>
                      </td>
                      <td>{task.createdBy}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="light"
                          className="me-1"
                          style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                          onClick={() => openModal(task)}
                        >
                          <FaEye size={12} />
                        </Button>
                        <Button
                          size="0sm"
                          variant="light"
                          className="me-1"
                          style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                          onClick={() => openModal(task)}
                        >
                          <FaEdit size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          style={{ color: '#dc3545', backgroundColor: '#e6f3f5' }}
                          onClick={() => deleteTask(task.id)}
                        >
                          <FaTrash size={12} />
                        </Button>
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
      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#fff' }}>
          <Modal.Title>{editingTask ? 'Edit Task' : 'Add New Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#e6f3f5' }}>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Task Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter task title"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Assign To *</Form.Label>
                  <Form.Select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter task details"
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select name="priority" value={formData.priority} onChange={handleInputChange}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Attachment (Optional)</Form.Label>
                  <Form.Control
                    type="file"
                    name="attachment"
                    ref={fileInputRef}
                    onChange={handleInputChange}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                  {formData.attachmentName && (
                    <small className="text-muted d-block mt-1">
                      <FaPaperclip className="me-1" />
                      {formData.attachmentName}
                    </small>
                  )}
                  <Form.Text muted>
                    File upload will be linked on save (not implemented in API yet).
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#f0f7f8' }}>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            style={{
              backgroundColor: '#023347',
              border: 'none',
              fontWeight: '600',
            }}
          >
            <FaSave className="me-2" /> {editingTask ? 'Update' : 'Create'} Task
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TaskManagement;