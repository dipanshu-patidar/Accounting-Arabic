import React, { useState, useEffect, useRef } from "react";
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
  Badge,
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
import './LeaveRequests.css';

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

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0, delete: 0 });

  // 🔹 Fetch Leaves — ✅ FIXED MAPPING
  const fetchLeaves = async () => {
    if (!companyId) return;
    try {
      const res = await axiosInstance.get(`leaveRequest/company?company_id=${companyId}`);
      if (res.data?.success) {
        const mappedLeaves = res.data.data.map((l) => ({
          id: l.id,
          leaveId: l.leave_request_id || `LR-${String(l.id).padStart(3, "0")}`, // ✅ Use real ID
          employeeId: l.employee_id,
          leaveTypeId: l.leave_type_id,
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
    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  // 🔹 Fetch Employees
  const fetchEmployees = async () => {
    if (!companyId) {
      setEmployees([]);
      return;
    }

    try {
      const res = await axiosInstance.get(`employee?company_id=${companyId}`);
      let empList = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        empList = res.data.data;
      } else if (res.data?.success && res.data.data?.employees) {
        empList = res.data.data.employees;
      } else if (Array.isArray(res.data)) {
        empList = res.data;
      }

      setEmployees(
        empList.map((emp) => ({
          id: emp.id,
          name: emp.full_name || emp.employee_code || emp.name || `Employee ${emp.id}`,
        }))
      );
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
    }
  };

  // 🔹 Fetch Leave Types — ✅ Use correct endpoint
  const fetchLeaveTypes = async () => {
    try {
      const res = await axiosInstance.get("leaveRequest/types"); // ✅ Confirmed endpoint
      let typeList = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        typeList = res.data.data;
      } else if (Array.isArray(res.data)) {
        typeList = res.data;
      }

      setLeaveTypes(
        typeList.map((t) => ({
          id: t.id,
          name: t.name,
        }))
      );
    } catch (err) {
      console.error("Error fetching leave types:", err);
      setLeaveTypes([]);
    }
  };

  // 🔹 Unified loader
  useEffect(() => {
    let leavesLoaded = false;
    let employeesLoaded = false;
    let typesLoaded = false;

    const checkAllLoaded = () => {
      if (leavesLoaded && employeesLoaded && typesLoaded) {
        setLoading(false);
      }
    };

    fetchLeaves().then(() => {
      leavesLoaded = true;
      checkAllLoaded();
    });

    fetchEmployees().then(() => {
      employeesLoaded = true;
      checkAllLoaded();
    });

    fetchLeaveTypes().then(() => {
      typesLoaded = true;
      checkAllLoaded();
    });
  }, [companyId]);

  // ✅ Safe employee name lookup
  const getEmployeeName = (empId) => {
    if (empId == null || empId === "") return "–";
    const emp = employees.find((e) => e.id == empId);
    return emp ? emp.name : "–";
  };

  // ✅ Safe leave type name lookup
  const getLeaveTypeName = (typeId) => {
    if (typeId == null) return "–";
    const type = leaveTypes.find((t) => t.id == typeId);
    return type ? type.name : "–";
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
    setForm(emptyLeave);
    setModalType("add");
    isCleaningUpRef.current = false;
  };
  
  const handleDeleteModalClose = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setShowDeleteModal(false);
    
    // Force modal remount on next open
    modalKeyRef.current.delete += 1;
  };
  
  // Handle delete modal exit - cleanup after animation
  const handleDeleteModalExited = () => {
    // Reset delete leave after modal fully closed
    setLeaveToDelete(null);
    isCleaningUpRef.current = false;
  };

  const handleAdd = () => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    setForm(emptyLeave);
    setModalType("add");
    setShowModal(true);
  };

  const handleEdit = (leave) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
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
        fetchLeaves();
        // Reset cleanup flag before closing
        isCleaningUpRef.current = false;
        handleCloseModal();
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
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.delete += 1;
    
    setLeaveToDelete(leave);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.delete(`leaveRequest/request/${leaveToDelete.id}`);
      if (res.data.success) {
        alert("Leave request deleted successfully!");
        fetchLeaves();
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete leave request.");
    } finally {
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleDeleteModalClose();
      // Leave will be reset in handleDeleteModalExited
    }
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
      <div className="d-flex justify-content-center align-items-center loading-container" style={{ height: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    if (status === "Approved") return "badge-status badge-approved";
    if (status === "Rejected") return "badge-status badge-rejected";
    return "badge-status badge-pending";
  };

  return (
    <Container fluid className="p-4 leave-requests-container">
      {/* Header Section */}
      <div className="mb-4">
        <Row className="align-items-center">
          <Col xs={12} md={8}>
            <h3 className="leave-requests-title">
              <i className="fas fa-calendar-alt me-2"></i>
              Leave Requests Management
            </h3>
            <p className="leave-requests-subtitle">Manage employee leave applications and approvals</p>
          </Col>
          <Col xs={12} md={4} className="d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
            <Button className="btn-export-pdf d-flex align-items-center" onClick={handlePDF}>
              <FaFilePdf className="me-2" /> Export PDF
            </Button>
            <Button className="btn-add-request d-flex align-items-center" onClick={handleAdd}>
              <FaPlus className="me-2" /> New Request
            </Button>
          </Col>
        </Row>
      </div>

      {/* Table Card */}
      <Card className="leave-requests-table-card border-0 shadow-lg">
        <Card.Body className="p-0">

          <div style={{ overflowX: "auto" }}>
            <Table hover responsive className="leave-requests-table">
              <thead className="table-header">
                <tr>
                  <th>Leave ID</th>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Approver</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? (
                  leaves.map((l) => (
                    <tr key={l.id}>
                      <td className="fw-bold">{l.leaveId}</td>
                      <td>{getEmployeeName(l.employeeId)}</td>
                      <td>{getLeaveTypeName(l.leaveTypeId)}</td>
                      <td>{l.fromDate}</td>
                      <td>{l.toDate}</td>
                      <td className="fw-semibold">{l.totalDays}</td>
                      <td>
                        <Badge className={getStatusBadgeClass(l.status)}>
                          {l.status}
                        </Badge>
                      </td>
                      <td>{l.approver || "–"}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            className="btn-action btn-edit"
                            onClick={() => handleEdit(l)}
                            title="Edit"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            className="btn-action btn-delete"
                            onClick={() => confirmDelete(l)}
                            title="Delete"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">
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
      <Modal 
        key={modalKeyRef.current.main}
        show={showModal} 
        onHide={handleCloseModal}
        onExited={handleModalExited}
        size="lg"
        centered
        className="leave-requests-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            {modalType === "edit" ? "Edit Leave Request" : "Apply for Leave"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Employee *</Form.Label>
                <Form.Select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleInputChange}
                  required
                  className="form-select-custom"
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
                <Form.Label className="form-label-custom">Leave Type *</Form.Label>
                <Form.Select
                  name="leaveTypeId"
                  value={form.leaveTypeId}
                  onChange={handleInputChange}
                  required
                  className="form-select-custom"
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
                <Form.Label className="form-label-custom">From Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="fromDate"
                  value={form.fromDate}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">To Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="toDate"
                  value={form.toDate}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Total Days</Form.Label>
                <Form.Control
                  type="number"
                  name="totalDays"
                  value={form.totalDays}
                  readOnly
                  placeholder="Auto-calculated"
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Status</Form.Label>
                <Form.Select name="status" value={form.status} onChange={handleInputChange} className="form-select-custom">
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
                <Form.Label className="form-label-custom">Reason *</Form.Label>
                <Form.Control
                  as="textarea"
                  name="reason"
                  value={form.reason}
                  onChange={handleInputChange}
                  rows={3}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">
                  <FaPaperclip className="me-1" /> Attachment (Optional)
                </Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) =>
                    setForm({ ...form, attachment: e.target.files[0] || null })
                  }
                  className="form-control-custom"
                />
                <Form.Text className="text-muted">Supporting documents (e.g., medical certificate)</Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            className="btn-modal-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              modalType === "edit" ? "Update" : "Submit"
            )} Request
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
      <Modal 
        key={modalKeyRef.current.delete}
        show={showDeleteModal} 
        onHide={handleDeleteModalClose}
        onExited={handleDeleteModalExited}
        centered
        className="leave-requests-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Delete Leave Request</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom text-center py-4">
          <div className="mx-auto mb-3" style={{ width: 70, height: 70, background: "#FFF5F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaTrash style={{ fontSize: "32px", color: "#F04438" }} />
          </div>
          <h4 className="fw-bold mb-2">Delete Leave Request</h4>
          <p className="text-muted mb-3">
            Are you sure you want to delete the leave request for{" "}
            <strong>{getEmployeeName(leaveToDelete?.employeeId)}</strong>? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={handleDeleteModalClose}>
            Cancel
          </Button>
          <Button className="btn-modal-delete" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LeaveRequests;