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
  Spinner,
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
import './TaskManagement.css';

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

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0 });

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
    resetForm();
    setEditingTask(null);
    isCleaningUpRef.current = false;
  };

  const openModal = async (task = null) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
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
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleCloseModal();
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
      <div className="d-flex justify-content-center align-items-center loading-container" style={{ height: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading tasks...</p>
        </div>
      </div>
    );
  }

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High': return 'badge-status badge-priority-high';
      case 'Medium': return 'badge-status badge-priority-medium';
      case 'Low': return 'badge-status badge-priority-low';
      default: return 'badge-status';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'badge-status badge-status-completed';
      case 'In Progress': return 'badge-status badge-status-in-progress';
      case 'Pending': return 'badge-status badge-status-pending';
      default: return 'badge-status';
    }
  };

  return (
    <Container fluid className="p-4 task-management-container">
      {/* Header Section */}
      <div className="mb-4">
        <Row className="align-items-center">
          <Col xs={12} md={8}>
            <h3 className="task-management-title">
              <i className="fas fa-tasks me-2"></i>
              Task & Assignment Management
            </h3>
            <p className="task-management-subtitle">Assign, track, and manage tasks seamlessly across teams</p>
          </Col>
          <Col xs={12} md={4} className="d-flex justify-content-md-end mt-3 mt-md-0">
            <Button className="btn-add-task d-flex align-items-center" onClick={() => openModal()}>
              <FaPlus className="me-2" /> Add Task
            </Button>
          </Col>
        </Row>
      </div>

      {/* Table Card */}
      <Card className="task-table-card border-0 shadow-lg">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover responsive className="task-management-table">
              <thead className="table-header">
                <tr>
                  <th>Title</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No tasks found. Click "Add Task" to create one.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="fw-semibold">{task.title}</td>
                      <td>{task.assignedToName || 'Unassigned'}</td>
                      <td>
                        <Badge className={getPriorityBadgeClass(task.priority)}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td>{formatDate(task.dueDate)}</td>
                      <td>
                        <Badge className={getStatusBadgeClass(task.status)}>
                          {task.status}
                        </Badge>
                      </td>
                      <td>{task.createdBy}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            className="btn-action btn-view"
                            onClick={() => openModal(task)}
                            title="View"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            className="btn-action btn-edit"
                            onClick={() => openModal(task)}
                            title="Edit"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            className="btn-action btn-delete"
                            onClick={() => deleteTask(task.id)}
                            title="Delete"
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
        size="lg"
        className="task-management-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>{editingTask ? 'Edit Task' : 'Add New Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Task Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter task title"
                    className="form-control-custom"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Assign To *</Form.Label>
                  <Form.Select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    className="form-select-custom"
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
              <Form.Label className="form-label-custom">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter task details"
                className="form-control-custom"
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Priority</Form.Label>
                  <Form.Select 
                    name="priority" 
                    value={formData.priority} 
                    onChange={handleInputChange}
                    className="form-select-custom"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Due Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="form-control-custom"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">Attachment (Optional)</Form.Label>
                  <Form.Control
                    type="file"
                    name="attachment"
                    ref={fileInputRef}
                    onChange={handleInputChange}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    className="form-control-custom"
                  />
                  {formData.attachmentName && (
                    <small className="text-muted d-block mt-1">
                      <FaPaperclip className="me-1" />
                      {formData.attachmentName}
                    </small>
                  )}
                  <Form.Text className="text-muted">
                    File upload will be linked on save (not implemented in API yet).
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button className="btn-modal-save d-flex align-items-center" onClick={handleSave}>
            <FaSave className="me-2" /> {editingTask ? 'Update' : 'Create'} Task
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TaskManagement;