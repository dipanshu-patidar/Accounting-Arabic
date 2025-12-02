import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Modal,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaPaperclip,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Mock employees (same as in Attendance)
const mockEmployees = [
  { id: 1, name: "John Doe", employeeId: "EMP-001" },
  { id: 2, name: "Jane Smith", employeeId: "EMP-002" },
  { id: 3, name: "Robert Johnson", employeeId: "EMP-003" },
];

const LEAVE_TYPES = ["Sick Leave", "Casual Leave", "Earned Leave", "Maternity/Paternity", "Other"];
const STATUSES = ["Pending", "Approved", "Rejected"];

const emptyLeave = {
  id: null,
  leaveId: "",
  employeeId: "",
  leaveType: "",
  fromDate: "",
  toDate: "",
  totalDays: 0,
  reason: "",
  attachment: null,
  status: "Pending",
  approver: "",
};

// Helper: Calculate total days between two dates (inclusive)
const calculateTotalDays = (from, to) => {
  if (!from || !to) return 0;
  const startDate = new Date(from);
  const endDate = new Date(to);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 for inclusive
  return diffDays;
};

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees] = useState(mockEmployees);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [form, setForm] = useState(emptyLeave);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);

  // Load mock data
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        leaveId: "LR-001",
        employeeId: "1",
        leaveType: "Sick Leave",
        fromDate: "2025-11-05",
        toDate: "2025-11-07",
        totalDays: 3,
        reason: "Fever and flu",
        status: "Approved",
        approver: "HR Manager",
      },
      {
        id: 2,
        leaveId: "LR-002",
        employeeId: "2",
        leaveType: "Casual Leave",
        fromDate: "2025-11-10",
        toDate: "2025-11-10",
        totalDays: 1,
        reason: "Family function",
        status: "Pending",
        approver: "",
      },
    ];
    setTimeout(() => {
      setLeaves(mockData);
      setLoading(false);
    }, 300);
  }, []);

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.id === parseInt(empId));
    return emp ? emp.name : "–";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    // Auto-calculate total days when dates change
    if (name === "fromDate" || name === "toDate") {
      const days = calculateTotalDays(
        name === "fromDate" ? value : form.fromDate,
        name === "toDate" ? value : form.toDate
      );
      updatedForm.totalDays = days;
    }

    setForm(updatedForm);
  };

  const handleAdd = () => {
    setForm(emptyLeave);
    setModalType("add");
    setShowModal(true);
  };

  const handleEdit = (leave) => {
    setForm({ ...leave });
    setModalType("edit");
    setShowModal(true);
  };

  const handleSave = () => {
    const {
      employeeId,
      leaveType,
      fromDate,
      toDate,
      reason,
      status,
    } = form;

    if (!employeeId || !leaveType || !fromDate || !toDate || !reason) {
      alert("Please fill all required fields.");
      return;
    }

    const newLeave = {
      ...form,
      id: form.id || Date.now(),
      leaveId: form.leaveId || `LR-${String(leaves.length + 1).padStart(3, "0")}`,
      totalDays: calculateTotalDays(fromDate, toDate),
      approver: status === "Approved" || status === "Rejected" ? "Admin" : "",
    };

    if (modalType === "add") {
      setLeaves((prev) => [newLeave, ...prev]);
    } else {
      setLeaves((prev) =>
        prev.map((l) => (l.id === form.id ? newLeave : l))
      );
    }

    setShowModal(false);
    setForm(emptyLeave);
  };

  const confirmDelete = (leave) => {
    setLeaveToDelete(leave);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    setLeaves((prev) => prev.filter((l) => l.id !== leaveToDelete.id));
    setShowDeleteModal(false);
    setLeaveToDelete(null);
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.text("Leave Requests Report", 14, 16);
    doc.autoTable({
      startY: 22,
      head: [
        ["Leave ID", "Employee", "Type", "From", "To", "Days", "Status", "Approver"],
      ],
      body: leaves.map((l) => [
        l.leaveId,
        getEmployeeName(l.employeeId),
        l.leaveType,
        l.fromDate,
        l.toDate,
        l.totalDays,
        l.status,
        l.approver || "–",
      ]),
    });
    doc.save("leave-requests.pdf");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Status badge style
  const statusBadge = (status) => {
    let bg = "#6c757d"; // default gray
    if (status === "Approved") bg = "#28a745";
    else if (status === "Rejected") bg = "#dc3545";
    else if (status === "Pending") bg = "#ffc107";

    return (
      <span
        className="badge"
        style={{
          backgroundColor: bg,
          color: status === "Pending" ? "#212529" : "#fff",
          fontWeight: 500,
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <Container fluid className="py-3" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1">
                <FaCalendarAlt className="me-2 text-primary" />
                Leave Requests
              </h4>
              <p className="text-muted">Manage employee leave applications</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={handlePDF} size="sm">
                <FaFilePdf className="me-1" /> Export PDF
              </Button>
              <Button variant="primary" onClick={handleAdd} size="sm"           className="btn text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: "#023347" }}>
                <FaPlus className="me-1" /> New Request
              </Button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Leave ID</th>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Approver</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? (
                  leaves.map((l) => (
                    <tr key={l.id}>
                      <td>{l.leaveId}</td>
                      <td>{getEmployeeName(l.employeeId)}</td>
                      <td>{l.leaveType}</td>
                      <td>{l.fromDate}</td>
                      <td>{l.toDate}</td>
                      <td>{l.totalDays}</td>
                      <td>{statusBadge(l.status)}</td>
                      <td>{l.approver || "–"}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-1"
                          onClick={() => handleEdit(l)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => confirmDelete(l)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "edit" ? "Edit Leave Request" : "Apply for Leave"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Employee *</Form.Label>
                <Form.Select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Leave Type *</Form.Label>
                <Form.Select
                  name="leaveType"
                  value={form.leaveType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  {LEAVE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>From Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="fromDate"
                  value={form.fromDate}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>To Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="toDate"
                  value={form.toDate}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Total Days</Form.Label>
                <Form.Control
                  type="number"
                  name="totalDays"
                  value={form.totalDays}
                  readOnly
                  placeholder="Auto-calculated"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Reason *</Form.Label>
                <Form.Control
                  as="textarea"
                  name="reason"
                  value={form.reason}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaPaperclip className="me-1" /> Attachment (Optional)
                </Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setForm({ ...form, attachment: e.target.files[0] })}
                />
                <Form.Text muted>Supporting documents (e.g., medical certificate)</Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}     style={{ backgroundColor: "#023347" }}>
            {modalType === "edit" ? "Update" : "Submit"} Request
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Leave Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the leave request for{" "}
          <strong>{getEmployeeName(leaveToDelete?.employeeId)}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}  style={{ backgroundColor: "#023347" }}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LeaveRequests;