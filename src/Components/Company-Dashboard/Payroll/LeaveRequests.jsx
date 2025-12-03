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
  Spinner,
  Alert,
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
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";

const STATUSES = ["Pending", "Approved", "Rejected"];

const emptyLeave = {
  id: null,
  leaveId: "",
  employeeId: "",
  leaveTypeId: "",
  fromDate: "",
  toDate: "",
  totalDays: 0,
  reason: "",
  attachment: null,
  status: "Pending",
  approver: "",
};

const calculateTotalDays = (from, to) => {
  if (!from || !to) return 0;
  const startDate = new Date(from);
  const endDate = new Date(to);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const LeaveRequests = () => {
  const companyId = GetCompanyId();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [form, setForm] = useState(emptyLeave);
  const [saving, setSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    if (!companyId) {
      setError("Company ID not found.");
      setLoading(false);
      return;
    }

    try {
      const [leavesRes, employeesRes, typesRes] = await Promise.all([
        axiosInstance.get(`leaveRequest/company/${companyId}`),
        axiosInstance.get(`employee?company_id=${companyId}`),
        axiosInstance.get("leaveType"), // Adjust if endpoint differs
      ]);

      if (leavesRes.data.success) {
        const mappedLeaves = leavesRes.data.data.map((l) => ({
          id: l.id,
          leaveId: `LR-${String(l.id).padStart(3, "0")}`,
          employeeId: l.employee_id,
          leaveTypeId: l.leave_type_id,
          leaveType: l.leave_type?.name || "Unknown",
          fromDate: l.from_date ? new Date(l.from_date).toISOString().split("T")[0] : "",
          toDate: l.to_date ? new Date(l.to_date).toISOString().split("T")[0] : "",
          totalDays: l.total_days,
          reason: l.reason,
          status: l.status,
          approver: l.approved_by || "",
          attachment: l.attachment,
        }));
        setLeaves(mappedLeaves);
      }

      if (employeesRes.data.success) {
        setEmployees(
          employeesRes.data.data.map((emp) => ({
            id: emp.id,
            name: emp.full_name || emp.name,
          }))
        );
      }

      if (typesRes.data.success) {
        setLeaveTypes(
          typesRes.data.data.map((t) => ({
            id: t.id,
            name: t.name,
          }))
        );
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const getEmployeeName = (empId) => {
    const emp = employees.find((e) => e.id === Number(empId));
    return emp ? emp.name : `Employee ${empId}`;
  };

  const getLeaveTypeName = (typeId) => {
    const type = leaveTypes.find((t) => t.id === Number(typeId));
    return type ? type.name : "Unknown";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

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
    setForm({
      ...leave,
      leaveTypeId: leave.leaveTypeId,
      fromDate: leave.fromDate,
      toDate: leave.toDate,
    });
    setModalType("edit");
    setShowModal(true);
  };

  const handleSave = async () => {
    const { employeeId, leaveTypeId, fromDate, toDate, reason, status } = form;

    if (!employeeId || !leaveTypeId || !fromDate || !toDate || !reason) {
      alert("Please fill all required fields.");
      return;
    }

    setSaving(true);
    const formData = new FormData();

    // Append all fields
    formData.append("employee_id", employeeId);
    formData.append("leave_type_id", leaveTypeId);
    formData.append("from_date", fromDate);
    formData.append("to_date", toDate);
    formData.append("total_days", calculateTotalDays(fromDate, toDate));
    formData.append("reason", reason);
    formData.append("status", status);

    if (form.attachment && typeof form.attachment !== "string") {
      formData.append("attachment", form.attachment);
    }

    try {
      let response;
      if (modalType === "add") {
        response = await axiosInstance.post("leaveRequest/request", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axiosInstance.patch(
          `leaveRequest/request/${form.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      if (response.data.success) {
        alert(modalType === "add" ? "Leave request created!" : "Leave request updated!");
        fetchData();
        setShowModal(false);
        setForm(emptyLeave);
      } else {
        throw new Error(response.data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save leave request. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (leave) => {
    setLeaveToDelete(leave);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`leaveRequest/request/${leaveToDelete.id}`);
      if (res.data.success) {
        alert("Leave request deleted successfully!");
        fetchData();
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete leave request.");
    }
    setShowDeleteModal(false);
    setLeaveToDelete(null);
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.text("Leave Requests Report", 14, 16);
    doc.autoTable({
      startY: 22,
      head: [["Leave ID", "Employee", "Type", "From", "To", "Days", "Status", "Approver"]],
      body: leaves.map((l) => [
        l.leaveId,
        getEmployeeName(l.employeeId),
        getLeaveTypeName(l.leaveTypeId),
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
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const statusBadge = (status) => {
    let bg = "#6c757d";
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
              <Button
                variant="primary"
                onClick={handleAdd}
                size="sm"
                className="d-flex align-items-center gap-2"
                style={{ backgroundColor: "#023347", borderColor: "#023347" }}
              >
                <FaPlus /> New Request
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
                      <td>{getLeaveTypeName(l.leaveTypeId)}</td>
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
                  name="leaveTypeId"
                  value={form.leaveTypeId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
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
                <Form.Select name="status" value={form.status} onChange={handleInputChange}>
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
                  onChange={(e) =>
                    setForm({ ...form, attachment: e.target.files[0] || null })
                  }
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
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            style={{ backgroundColor: "#023347", borderColor: "#023347" }}
          >
            {saving ? "Saving..." : modalType === "edit" ? "Update" : "Submit"} Request
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
          <Button
            variant="danger"
            onClick={handleDelete}
            style={{ backgroundColor: "#023347", borderColor: "#023347" }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LeaveRequests;