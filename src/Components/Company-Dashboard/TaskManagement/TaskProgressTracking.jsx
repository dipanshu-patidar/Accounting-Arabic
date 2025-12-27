import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Card,
  Container,
  Badge,
  ProgressBar,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { FaEdit, FaEye } from "react-icons/fa";
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';
import './TaskProgressTracking.css';

const TaskProgressTracking = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const companyId = GetCompanyId();

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ update: 0, details: 0 });

  // Fetch task progress by company ID
  const fetchTasks = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`taskRequest/progress/tasks/?company_id=${companyId}`);
      if (Array.isArray(res.data)) {
        const mapped = res.data.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          assignedTo: task.assigned_employee?.full_name || 'Unassigned',
          status: task.status,
          progress: task.progress || 0,
          progressRemarks: task.progress_remarks || '',
          updatedOn: task.progress_updated || task.updated_at || task.created_at,
          dueDate: task.due_date ? task.due_date.split('T')[0] : null,
          priority: task.priority,
          creator: task.creator?.name || '—',
        }));
        setTasks(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch tasks', err);
      alert('Failed to load task progress data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchTasks();
    }
  }, [companyId]);


  const formatDateTime = (datetime) => {
    if (!datetime) return "—";
    return new Date(datetime).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOpenUpdateModal = (task) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.update += 1;
    
    setSelectedTask({ ...task });
    setShowUpdateModal(true);
  };

  const handleOpenDetailsModal = (task) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.details += 1;
    
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  const handleCloseUpdateModal = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setShowUpdateModal(false);
    
    // Force modal remount on next open
    modalKeyRef.current.update += 1;
  };

  const handleCloseDetailsModal = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setShowDetailsModal(false);
    
    // Force modal remount on next open
    modalKeyRef.current.details += 1;
  };
  
  // Handle modal exit - cleanup after animation
  const handleUpdateModalExited = () => {
    // Reset task data after modal fully closed
    setSelectedTask(null);
    isCleaningUpRef.current = false;
  };

  const handleDetailsModalExited = () => {
    // Reset task data after modal fully closed
    setSelectedTask(null);
    isCleaningUpRef.current = false;
  };

  const handleSaveChanges = async () => {
    if (!selectedTask) return;

    const payload = {
      title: selectedTask.title,
      progress: selectedTask.progress,
      remarks: selectedTask.progressRemarks,
      status: selectedTask.status,
    };

    try {
      await axiosInstance.put(`taskRequest/progress/tasks/${selectedTask.id}`, payload);
      alert('Task progress updated successfully!');
      await fetchTasks();
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleCloseUpdateModal();
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update task progress.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed": return "badge-status badge-completed";
      case "In Progress": return "badge-status badge-in-progress";
      case "Pending": return "badge-status badge-pending";
      default: return "badge-status";
    }
  };

  const getProgressVariant = (progress) => {
    if (progress === 100) return "success";
    if (progress >= 70) return "info";
    return "warning";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center loading-container" style={{ height: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading task progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="p-4 task-progress-container">
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="task-progress-title">
          <i className="fas fa-tasks me-2"></i>
          Task Progress Tracking
        </h3>
        <p className="task-progress-subtitle">Monitor real-time progress of assigned tasks efficiently and effectively</p>
      </div>

      {/* Table Card */}
      <Card className="task-progress-table-card border-0 shadow-lg">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover responsive className="task-progress-table">
              <thead className="table-header">
                <tr>
                  <th>Task ID</th>
                  <th>Task Title</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Updated On</th>
                  <th>Remarks</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      No tasks available for tracking.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="text-muted">{task.id}</td>
                      <td className="fw-semibold">{task.title}</td>
                      <td>{task.assignedTo}</td>
                      <td>
                        <Badge className={getStatusBadgeClass(task.status)}>
                          {task.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="progress-wrapper">
                          <ProgressBar
                            now={task.progress}
                            variant={getProgressVariant(task.progress)}
                            className="progress-bar-custom"
                            style={{ 
                              width: "100px", 
                              height: "10px",
                              flex: "0 0 100px"
                            }}
                          />
                          <span className="progress-label">{task.progress}%</span>
                        </div>
                      </td>
                      <td className="small">{formatDateTime(task.updatedOn)}</td>
                      <td className="small text-muted">{task.progressRemarks || "—"}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            className="btn-action btn-edit"
                            onClick={() => handleOpenUpdateModal(task)}
                            title="Update Progress"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            className="btn-action btn-view"
                            onClick={() => handleOpenDetailsModal(task)}
                            title="View Details"
                          >
                            <FaEye />
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

      {/* Update Modal */}
      <Modal 
        key={modalKeyRef.current.update}
        show={showUpdateModal} 
        onHide={handleCloseUpdateModal}
        onExited={handleUpdateModalExited}
        centered
        className="task-progress-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Update Task Progress</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedTask && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Task Title</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                  className="form-control-custom"
                />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">Status</Form.Label>
                    <Form.Select
                      value={selectedTask.status}
                      onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value })}
                      className="form-select-custom"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">Progress (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      value={selectedTask.progress}
                      onChange={(e) => setSelectedTask({ ...selectedTask, progress: parseInt(e.target.value) || 0 })}
                      className="form-control-custom"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Remarks</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={selectedTask.progressRemarks}
                  onChange={(e) => setSelectedTask({ ...selectedTask, progressRemarks: e.target.value })}
                  className="form-control-custom"
                  placeholder="Enter progress remarks..."
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={handleCloseUpdateModal}>
            Cancel
          </Button>
          <Button className="btn-modal-save" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal 
        key={modalKeyRef.current.details}
        show={showDetailsModal} 
        onHide={handleCloseDetailsModal}
        onExited={handleDetailsModalExited}
        centered
        className="task-progress-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedTask && (
            <ul className="details-list">
              <li>
                <strong>Task ID:</strong> {selectedTask.id}
              </li>
              <li>
                <strong>Title:</strong> {selectedTask.title}
              </li>
              <li>
                <strong>Assigned To:</strong> {selectedTask.assignedTo}
              </li>
              <li>
                <strong>Status:</strong> 
                <Badge className={`${getStatusBadgeClass(selectedTask.status)} ms-2`}>
                  {selectedTask.status}
                </Badge>
              </li>
              <li>
                <strong>Progress:</strong> 
                <div className="progress-wrapper mt-2">
                  <ProgressBar
                    now={selectedTask.progress}
                    variant={getProgressVariant(selectedTask.progress)}
                    className="progress-bar-custom"
                    style={{ width: "150px", height: "12px" }}
                  />
                  <span className="progress-label">{selectedTask.progress}%</span>
                </div>
              </li>
              <li>
                <strong>Priority:</strong> {selectedTask.priority}
              </li>
              <li>
                <strong>Due Date:</strong> {selectedTask.dueDate || "Not set"}
              </li>
              <li>
                <strong>Updated On:</strong> {formatDateTime(selectedTask.updatedOn)}
              </li>
              <li>
                <strong>Created By:</strong> {selectedTask.creator}
              </li>
              <li>
                <strong>Remarks:</strong> 
                <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#f8f9fa', color: '#495057' }}>
                  {selectedTask.progressRemarks || "—"}
                </div>
              </li>
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={handleCloseDetailsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TaskProgressTracking;