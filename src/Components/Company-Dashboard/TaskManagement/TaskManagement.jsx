import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Row, Col, Card, Container, Badge, Alert
} from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye, FaSave, FaPlus, FaPaperclip } from 'react-icons/fa';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
    attachment: null,
    attachmentName: ''
  });

  useEffect(() => {
    setEmployees([
      { id: 'EMP001', name: 'Ahmed Khan' },
      { id: 'EMP002', name: 'Priya Sharma' },
      { id: 'EMP003', name: 'Rahul Mehta' },
      { id: 'DEPT_HR', name: 'HR Department' },
      { id: 'DEPT_IT', name: 'IT Department' }
    ]);

    setTasks([
      {
        id: 'TASK001',
        title: 'Onboard New Employees',
        assignedTo: 'DEPT_HR',
        assignedToName: 'HR Department',
        priority: 'High',
        dueDate: '2025-11-10',
        status: 'In Progress',
        description: 'Complete documentation and orientation for 5 new hires.',
        createdBy: 'Ritika Pirag',
        attachment: null
      },
      {
        id: 'TASK002',
        title: 'Fix Login Bug',
        assignedTo: 'EMP003',
        assignedToName: 'Rahul Mehta',
        priority: 'High',
        dueDate: '2025-11-05',
        status: 'Pending',
        description: 'Users unable to login after password reset.',
        createdBy: 'Himanshu Mahur',
        attachment: 'bug_report.pdf'
      }
    ]);
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'Medium',
      dueDate: '',
      attachment: null,
      attachmentName: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment') {
      const file = files[0];
      setFormData({
        ...formData,
        attachment: file,
        attachmentName: file ? file.name : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        priority: task.priority,
        dueDate: task.dueDate,
        attachment: null,
        attachmentName: task.attachment || ''
      });
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

  const handleSave = () => {
    const { title, assignedTo, dueDate } = formData;
    if (!title || !assignedTo || !dueDate) {
      alert('Please fill all required fields.');
      return;
    }

    const assigned = employees.find(e => e.id === assignedTo);
    const newTask = {
      id: editingTask?.id || `TASK${Date.now().toString().slice(-4)}`,
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo,
      assignedToName: assigned?.name || 'Unknown',
      priority: formData.priority,
      dueDate: formData.dueDate,
      status: editingTask?.status || 'Pending',
      createdBy: editingTask?.createdBy || 'Current User',
      attachment: formData.attachmentName || (editingTask?.attachment || null)
    };

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? newTask : t));
      alert('Task updated successfully!');
    } else {
      setTasks([...tasks, newTask]);
      alert('Task created successfully!');
    }
    closeModal();
  };

  const deleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
      alert('Task deleted.');
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
    if (!dateStr) return '-';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-IN', options);
  };

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4 text-center text-md-start">
        <h2 className="fw-bold mb-2" style={{ color: '#023347' }}>
          Task & Assignment Management
        </h2>
        <p style={{ color: '#2a8e9c', fontSize: '1rem' }} className='text-center'>
          Assign, track, and manage tasks seamlessly across teams.
        </p>
      </div>

      {/* Main Card */}
      <Card
        className="shadow border-0"
        style={{
          borderRadius: '15px',
          backgroundColor: '#e6f3f5'
        }}
      >
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
                transition: '0.3s'
              }}
              className='d-flex align-items-center justify-content-center'
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2a8e9c'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#023347'}
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
                  tasks.map(task => (
                    <tr key={task.id}>
                      <td className="fw-bold" style={{ color: '#023347' }}>{task.title}</td>
                      <td>{task.assignedToName}</td>
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
                          className="me-1"
                          onClick={() => openModal(task)}
                          style={{color: '#023347', borderColor: '#2a8e9c', backgroundColor: '#ffff'}}
                        >
                          <FaEye size={12} />
                        </Button>
                        <Button
                          size="sm"
                          className="me-1"
                          onClick={() => openModal(task)}
                          style={{color: '#023347', borderColor: '#2a8e9c', backgroundColor: '#ffff'}}
                        >
                          <FaEdit size={12} />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          style={{color: '#023347', borderColor: '#2a8e9c', backgroundColor: '#ffff'}}
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
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#fff' }}>
          <Modal.Title>{editingTask ? 'Edit Task' : 'Add New Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#e6f3f5' }}>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Task Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter task title"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Assign To</Form.Label>
                  <Form.Select name="assignedTo" value={formData.assignedTo} onChange={handleInputChange}>
                    <option value="">Select</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
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
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Attachment</Form.Label>
                  <Form.Control type="file" name="attachment" onChange={handleInputChange} />
                  {formData.attachmentName && (
                    <small className="text-muted">
                      <FaPaperclip className="me-1" />
                      {formData.attachmentName}
                    </small>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#f0f7f8' }}>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button
            onClick={handleSave}
            style={{
              backgroundColor: '#023347',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 20px',
              fontWeight: '600'
            }}
            className='d-flex align-items-center justify-content-center'
          >
            <FaSave className="me-2" /> Save Task
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TaskManagement;
