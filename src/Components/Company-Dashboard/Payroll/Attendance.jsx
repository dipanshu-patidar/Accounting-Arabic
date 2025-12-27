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
  Badge,
} from "react-bootstrap";
import {
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePdf,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import './Attendance.css';

const STATUS_OPTIONS = ["Present", "Absent", "Leave", "Late"];

const emptyRecord = {
  id: null,
  employeeId: "",
  date: "",
  checkIn: "",
  checkOut: "",
  status: "Present",
  notes: "",
};

const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return "–";
  const [h1, m1] = checkIn.split(":").map(Number);
  const [h2, m2] = checkOut.split(":").map(Number);
  let totalMinutes = h2 * 60 + m2 - (h1 * 60 + m1);

  const sign = totalMinutes < 0 ? "-" : "";
  totalMinutes = Math.abs(totalMinutes);

  if (totalMinutes === 0) return "0h 0m";

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${sign}${hours}h ${mins}m`;
};

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const companyId = GetCompanyId();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [form, setForm] = useState(emptyRecord);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0, delete: 0 });

  // Fetch employees by company_id
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
        } else {
          setEmployees([]);
        }
      } catch (err) {
        console.error("Failed to load employees", err);
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, [companyId]);

  // Fetch attendance records
  useEffect(() => {
    const fetchAttendances = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axiosInstance.get(`attendance/company/${companyId}`);

        // 🔍 DEBUG: Log raw response
        console.log("Attendance API Response:", res.data);

        // Ensure structure: { success: true, data: [...] }
        if (res?.data?.success && Array.isArray(res.data.data)) {
          const mapped = res.data.data.map((item) => {
            // Parse date (YYYY-MM-DD)
            const dateStr = item.date ? item.date.split('T')[0] : '';

            // Parse time safely
            const parseTime = (isoStr) => {
              if (!isoStr) return '';
              try {
                const d = new Date(isoStr);
                if (isNaN(d.getTime())) return '';
                return d.toTimeString().slice(0, 5); // "HH:mm"
              } catch (e) {
                return '';
              }
            };

            return {
              id: item.id,
              employeeId: item.employee_id, // keep as number
              date: dateStr,
              checkIn: parseTime(item.check_in_time),
              checkOut: parseTime(item.check_out_time),
              status: item.status || 'Present',
              notes: item.notes || '',
              employee: item.employee, // optional: for direct access
            };
          });

          setRecords(mapped);
        } else {
          console.warn("Unexpected attendance response format", res.data);
          setRecords([]);
        }
      } catch (err) {
        console.error("Fetch attendances error", err);
        alert("Failed to load attendance data");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendances();
  }, [companyId]);

  const getEmployeeName = (empId) => {
    if (empId == null) return "–";
    const emp = employees.find((e) => e.id == empId); // == not ===
    return emp ? emp.name : "–";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAdd = () => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    setForm(emptyRecord);
    setModalType("add");
    setShowModal(true);
  };

  const handleEdit = (record) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    setForm({ ...record });
    setModalType("edit");
    setShowModal(true);
  };

  const refreshAttendance = async () => {
    try {
      const res = await axiosInstance.get(`attendance/company/${companyId}`);
      if (res?.data?.success) {
        const data = res.data.data || [];
        const mapped = data.map((item) => {
          const parseTime = (iso) => {
            if (!iso) return "";
            const d = new Date(iso);
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          };
          return {
            id: item.id,
            employeeId: item.employee_id,
            date: item.date ? item.date.split("T")[0] : "",
            checkIn: parseTime(item.check_in_time),
            checkOut: parseTime(item.check_out_time),
            status: item.status,
            notes: item.notes || "",
            employee: item.employee,
          };
        });
        setRecords(mapped);
      }
    } catch (err) {
      console.error("Refresh error", err);
    }
  };

  const handleSave = async () => {
    if (!form.employeeId || !form.date || !form.status) {
      alert("Please fill required fields.");
      return;
    }

    if (form.status === "Present" && (!form.checkIn || !form.checkOut)) {
      alert("Check-In and Check-Out are required for 'Present' status.");
      return;
    }

    const timeToISO = (dateStr, timeStr) => {
      if (!timeStr) return null;
      const [year, month, day] = dateStr.split("-");
      const [hour, minute] = timeStr.split(":");
      const dt = new Date(Date.UTC(year, month - 1, day, hour, minute));
      return dt.toISOString();
    };

    const payload = {
      employee_id: parseInt(form.employeeId, 10),
      date: form.date,
      check_in_time: timeToISO(form.date, form.checkIn) || null,
      check_out_time: timeToISO(form.date, form.checkOut) || null,
      status: form.status,
      notes: form.notes || "",
    };

    try {
      setSaving(true);
      if (modalType === "add") {
        await axiosInstance.post("attendance", payload);
      } else {
        await axiosInstance.put(`attendance/${form.id}`, payload);
      }
      await refreshAttendance();
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleCloseModal();
    } catch (err) {
      console.error("Save error", err);
      alert("Error saving attendance record");
    } finally {
      setSaving(false);
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
    setForm(emptyRecord);
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
    // Reset delete record after modal fully closed
    setRecordToDelete(null);
    isCleaningUpRef.current = false;
  };

  const confirmDelete = (record) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.delete += 1;
    
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      if (!recordToDelete?.id) return;
      await axiosInstance.delete(`attendance/${recordToDelete.id}`);
      await refreshAttendance();
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete attendance record");
    } finally {
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleDeleteModalClose();
      // Record will be reset in handleDeleteModalExited
    }
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Report", 14, 16);
    doc.autoTable({
      startY: 22,
      head: [["Date", "Employee", "Check-In", "Check-Out", "Total Hours", "Status"]],
      body: records.map((r) => [
        r.date,
        getEmployeeName(r.employeeId),
        r.checkIn || "–",
        r.checkOut || "–",
        calculateHours(r.checkIn, r.checkOut),
        r.status,
      ]),
    });
    doc.save("attendance.pdf");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center loading-container" style={{ height: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    if (status === "Present") return "badge-status badge-present";
    if (status === "Absent") return "badge-status badge-absent";
    if (status === "Leave") return "badge-status badge-leave";
    return "badge-status badge-late";
  };

  return (
    <Container fluid className="p-4 attendance-container">
      {/* Header Section */}
      <div className="mb-4">
        <Row className="align-items-center">
          <Col xs={12} md={8}>
            <h3 className="attendance-title">
              <i className="fas fa-clock me-2"></i>
              Attendance Management
            </h3>
            <p className="attendance-subtitle">Track daily employee attendance and time records</p>
          </Col>
          <Col xs={12} md={4} className="d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
            <Button className="btn-export-pdf d-flex align-items-center" onClick={handlePDF}>
              <FaFilePdf className="me-2" /> Export PDF
            </Button>
            <Button className="btn-add-record d-flex align-items-center" onClick={handleAdd}>
              <FaPlus className="me-2" /> Add Record
            </Button>
          </Col>
        </Row>
      </div>

      {/* Table Card */}
      <Card className="attendance-table-card border-0 shadow-lg">
        <Card.Body className="p-0">

          <div style={{ overflowX: "auto" }}>
            <Table hover responsive className="attendance-table">
              <thead className="table-header">
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? (
                  records.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-semibold">{r.date}</td>
                      <td>{getEmployeeName(r.employeeId)}</td>
                      <td>{r.checkIn || "–"}</td>
                      <td>{r.checkOut || "–"}</td>
                      <td className="fw-semibold">{calculateHours(r.checkIn, r.checkOut)}</td>
                      <td>
                        <Badge className={getStatusBadgeClass(r.status)}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            className="btn-action btn-edit"
                            onClick={() => handleEdit(r)}
                            title="Edit"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            className="btn-action btn-delete"
                            onClick={() => confirmDelete(r)}
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
                    <td colSpan="7" className="text-center text-muted py-4">
                      No attendance records found.
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
        size="md"
        centered
        className="attendance-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>{modalType === "edit" ? "Edit Attendance" : "Add Attendance Record"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Employee *</Form.Label>
              <Form.Select
                name="employeeId"
                value={form.employeeId}
                onChange={handleInputChange}
                required
                className="form-select-custom"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Date *</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={form.date}
                onChange={handleInputChange}
                required
                className="form-control-custom"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Check-In Time</Form.Label>
              <Form.Control
                type="time"
                name="checkIn"
                value={form.checkIn}
                onChange={handleInputChange}
                disabled={form.status !== "Present"}
                className="form-control-custom"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Check-Out Time</Form.Label>
              <Form.Control
                type="time"
                name="checkOut"
                value={form.checkOut}
                onChange={handleInputChange}
                disabled={form.status !== "Present"}
                className="form-control-custom"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Status *</Form.Label>
              <Form.Select
                name="status"
                value={form.status}
                onChange={handleInputChange}
                required
                className="form-select-custom"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Notes</Form.Label>
              <Form.Control
                as="textarea"
                name="notes"
                value={form.notes}
                onChange={handleInputChange}
                rows={2}
                className="form-control-custom"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button
            className="btn-modal-cancel"
            onClick={handleCloseModal}
          >
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
              modalType === "edit" ? "Update" : "Add"
            )} Record
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        key={modalKeyRef.current.delete}
        show={showDeleteModal} 
        onHide={handleDeleteModalClose}
        onExited={handleDeleteModalExited}
        centered
        className="attendance-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Delete Record</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom text-center py-4">
          <div className="mx-auto mb-3" style={{ width: 70, height: 70, background: "#FFF5F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaTrash style={{ fontSize: "32px", color: "#F04438" }} />
          </div>
          <h4 className="fw-bold mb-2">Delete Attendance Record</h4>
          <p className="text-muted mb-3">
            Are you sure you want to delete this attendance record for{" "}
            <strong>{getEmployeeName(recordToDelete?.employeeId)}</strong> on{" "}
            <strong>{recordToDelete?.date}</strong>? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button
            className="btn-modal-cancel"
            onClick={handleDeleteModalClose}
          >
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

export default Attendance;