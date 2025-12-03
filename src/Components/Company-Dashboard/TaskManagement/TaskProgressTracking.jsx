import React, { useState, useEffect } from "react";
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
} from "react-bootstrap";
import { FaEdit, FaEye } from "react-icons/fa";
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';

const TaskProgressTracking = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const companyId = GetCompanyId();

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

  const getStatusVariant = (status) => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "info";
      case "Pending": return "warning";
      default: return "secondary";
    }
  };

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
    setSelectedTask({ ...task });
    setShowUpdateModal(true);
  };

  const handleOpenDetailsModal = (task) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowUpdateModal(false);
    setShowDetailsModal(false);
    setSelectedTask(null);
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
      handleCloseModal();
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update task progress.');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "#f0f7f8" }}>
        <div className="spinner-border" style={{ color: "#023347" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="p-3 p-md-5" style={{ backgroundColor: "#f0f7f8", minHeight: "100vh" }}>
      <div className="text-center mb-5">
        <h2 className="fw-bold" style={{ color: "#023347", fontSize: "2.5rem", letterSpacing: "0.5px" }}>
          Task Progress Tracking
        </h2>
        <p style={{ fontSize: "1.1rem", color: '#2a8e9c' }}>
          Monitor real-time progress of assigned tasks efficiently and effectively.
        </p>
      </div>

      <Card
        className="shadow-lg border-0 mb-4"
        style={{
          borderRadius: "16px",
          backgroundColor: "#e6f3f5",
          boxShadow: "0 10px 25px rgba(2, 51, 71, 0.15)",
        }}
      >
        <Card.Body>
          <div className="table-responsive">
            <Table hover bordered={false} className="align-middle">
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Task Title</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Updated On</th>
                  <th>Remarks</th>
                  <th className="text-end">Actions</th>
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
                      <td className="fw-bold" style={{ color: "#023347" }}>{task.title}</td>
                      <td>{task.assignedTo}</td>
                      <td>
                        <Badge bg={getStatusVariant(task.status)} style={{ fontSize: "0.85rem" }}>
                          {task.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <ProgressBar
                            now={task.progress}
                            variant={
                              task.progress === 100 ? "success" :
                              task.progress >= 70 ? "info" : "warning"
                            }
                            style={{ width: "80px", height: "8px", marginRight: "8px" }}
                          />
                          <span className="small fw-bold">{task.progress}%</span>
                        </div>
                      </td>
                      <td className="small">{formatDateTime(task.updatedOn)}</td>
                      <td className="small text-muted">{task.progressRemarks || "—"}</td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          style={{
                            backgroundColor: "#023347",
                            border: "none",
                            color: "white",
                            marginRight: "6px",
                            borderRadius: "20px",
                            padding: "5px 12px",
                            boxShadow: "0 3px 6px rgba(2, 51, 71, 0.3)",
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2a8e9c")}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#023347")}
                          onClick={() => handleOpenUpdateModal(task)}
                        >
                          <FaEdit size={12} />
                        </Button>
                        <Button
                          size="sm"
                          style={{
                            backgroundColor: "#2a8e9c",
                            border: "none",
                            color: "white",
                            borderRadius: "20px",
                            padding: "5px 12px",
                            boxShadow: "0 3px 6px rgba(2, 51, 71, 0.3)",
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#046b80")}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2a8e9c")}
                          onClick={() => handleOpenDetailsModal(task)}
                        >
                          <FaEye size={12} />
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

      {/* Update Modal */}
      <Modal show={showUpdateModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#023347", color: "white", borderBottom: "none" }}>
          <Modal.Title>Update Task Progress</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#e6f3f5" }}>
          {selectedTask && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Task Title</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={selectedTask.status}
                      onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Progress (%)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      value={selectedTask.progress}
                      onChange={(e) => setSelectedTask({ ...selectedTask, progress: parseInt(e.target.value) || 0 })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Remarks</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={selectedTask.progressRemarks}
                  onChange={(e) => setSelectedTask({ ...selectedTask, progressRemarks: e.target.value })}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#e6f3f5", borderTop: "none" }}>
          <Button variant="secondary" onClick={handleCloseModal} style={{ borderRadius: "20px" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveChanges}
            style={{ backgroundColor: "#2a8e9c", border: "none", borderRadius: "20px" }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#023347", color: "white", borderBottom: "none" }}>
          <Modal.Title>Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#e6f3f5" }}>
          {selectedTask && (
            <div>
              <p><strong>Task ID:</strong> {selectedTask.id}</p>
              <p><strong>Title:</strong> {selectedTask.title}</p>
              <p><strong>Assigned To:</strong> {selectedTask.assignedTo}</p>
              <p><strong>Status:</strong> {selectedTask.status}</p>
              <p><strong>Progress:</strong> {selectedTask.progress}%</p>
              <p><strong>Updated On:</strong> {formatDateTime(selectedTask.updatedOn)}</p>
              <p><strong>Remarks:</strong> {selectedTask.progressRemarks || "—"}</p>
              <p><strong>Priority:</strong> {selectedTask.priority}</p>
              <p><strong>Due Date:</strong> {selectedTask.dueDate || "Not set"}</p>
              <p><strong>Created By:</strong> {selectedTask.creator}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#e6f3f5", borderTop: "none" }}>
          <Button variant="secondary" onClick={handleCloseModal} style={{ borderRadius: "20px" }}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TaskProgressTracking;