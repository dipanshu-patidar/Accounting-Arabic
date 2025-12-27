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
  FaReceipt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePdf,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import './Settlement.css';

const emptySettlement = {
  id: null,
  employeeId: "",
  resignDate: "",
  lastWorkingDay: "",
  pendingLeaves: "",
  gratuityAmount: "",
  deductions: "",
  finalPayableAmount: "",
  notes: "",
  status: "Pending",
};

const Settlement = () => {
  const [settlements, setSettlements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const companyId = GetCompanyId();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [form, setForm] = useState(emptySettlement);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [settlementToDelete, setSettlementToDelete] = useState(null);

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0, delete: 0 });

  // Fetch employees list for dropdown
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
        console.error("Failed to load employees", err);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, [companyId]);

  // Fetch settlements by company ID
  const fetchSettlements = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`settlements?companyId=${companyId}`);
      if (res?.data?.success) {
        const mapped = res.data.data.map((s) => ({
          id: s.id,
          employeeId: s.employee_id,
          resignDate: s.resign_date ? s.resign_date.split("T")[0] : "",
          lastWorkingDay: s.last_working_day ? s.last_working_day.split("T")[0] : "",
          pendingLeaves: s.pending_leaves,
          gratuityAmount: s.gratuity_amount,
          deductions: s.deductions,
          finalPayableAmount: s.final_payable_amount,
          notes: s.notes || "",
          status: s.status,
          employee: s.employee,
        }));
        setSettlements(mapped);
      }
    } catch (err) {
      console.error("Failed to load settlements", err);
      alert("Failed to load settlement records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchSettlements();
    }
  }, [companyId]);

  const getEmployeeName = (empId) => {
    const emp = employees.find((e) => e.id === empId);
    return emp ? emp.name : "–";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
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
    setForm(emptySettlement);
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
    // Reset delete settlement after modal fully closed
    setSettlementToDelete(null);
    isCleaningUpRef.current = false;
  };

  const handleAdd = () => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    setForm(emptySettlement);
    setModalType("add");
    setShowModal(true);
  };

  const handleEdit = async (record) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    try {
      const res = await axiosInstance.get(`settlements/${record.id}`);
      if (res?.data?.success) {
        const s = res.data.data;
        setForm({
          id: s.id,
          employeeId: s.employee_id,
          resignDate: s.resign_date ? s.resign_date.split("T")[0] : "",
          lastWorkingDay: s.last_working_day ? s.last_working_day.split("T")[0] : "",
          pendingLeaves: s.pending_leaves,
          gratuityAmount: s.gratuity_amount,
          deductions: s.deductions,
          finalPayableAmount: s.final_payable_amount,
          notes: s.notes || "",
          status: s.status,
        });
        setModalType("edit");
        setShowModal(true);
      }
    } catch (err) {
      console.error("Failed to load settlement for edit", err);
      alert("Failed to load settlement record.");
    }
  };

  const handleSave = async () => {
    const { employeeId, resignDate, lastWorkingDay, finalPayableAmount } = form;
    if (!employeeId || !resignDate || !lastWorkingDay || !finalPayableAmount) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      companyId: companyId,
      employee_id: parseInt(employeeId, 10),
      resign_date: resignDate,
      last_working_day: lastWorkingDay,
      pending_leaves: form.pendingLeaves ? parseInt(form.pendingLeaves, 10) : 0,
      gratuity_amount: parseFloat(form.gratuityAmount || 0),
      deductions: parseFloat(form.deductions || 0),
      final_payable_amount: parseFloat(finalPayableAmount),
      notes: form.notes || "",
      status: form.status,
    };

    try {
      if (modalType === "add") {
        await axiosInstance.post("settlements", payload);
        alert("Settlement record created successfully!");
      } else {
        await axiosInstance.put(`settlements/${form.id}`, payload);
        alert("Settlement record updated successfully!");
      }
      await fetchSettlements();
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleCloseModal();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save settlement record.");
    }
  };

  const confirmDelete = (record) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.delete += 1;
    
    setSettlementToDelete(record);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`settlements/${settlementToDelete.id}`);
      alert("Settlement record deleted successfully!");
      await fetchSettlements();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete settlement record.");
    } finally {
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleDeleteModalClose();
      // Settlement will be reset in handleDeleteModalExited
    }
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.text("End of Service Settlement Report", 14, 16);
    doc.autoTable({
      startY: 22,
      head: [
        ["Employee", "Resign Date", "Last Day", "Gratuity", "Leave Bal.", "Final Amount", "Status"],
      ],
      body: settlements.map((s) => [
        getEmployeeName(s.employeeId),
        s.resignDate,
        s.lastWorkingDay,
        `₹${parseFloat(s.gratuityAmount).toLocaleString()}`,
        `${s.pendingLeaves} days`,
        `₹${parseFloat(s.finalPayableAmount).toLocaleString()}`,
        s.status,
      ]),
    });
    doc.save("settlement_report.pdf");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center loading-container" style={{ height: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading settlement records...</p>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    return status === "Processed" ? "badge-status badge-processed" : "badge-status badge-pending";
  };

  return (
    <Container fluid className="p-4 settlement-container">
      {/* Header Section */}
      <div className="mb-4">
        <Row className="align-items-center">
          <Col xs={12} md={8}>
            <h3 className="settlement-title">
              <i className="fas fa-receipt me-2"></i>
              End of Service Settlement
            </h3>
            <p className="settlement-subtitle">Manage employee final settlements and gratuity payments</p>
          </Col>
          <Col xs={12} md={4} className="d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
            <Button className="btn-export-pdf d-flex align-items-center" onClick={handlePDF}>
              <FaFilePdf className="me-2" /> Export PDF
            </Button>
            <Button className="btn-add-settlement d-flex align-items-center" onClick={handleAdd}>
              <FaPlus className="me-2" /> Add Settlement
            </Button>
          </Col>
        </Row>
      </div>

      {/* Table Card */}
      <Card className="settlement-table-card border-0 shadow-lg">
        <Card.Body className="p-0">

          <div style={{ overflowX: "auto" }}>
            <Table hover responsive className="settlement-table">
              <thead className="table-header">
                <tr>
                  <th>Employee</th>
                  <th>Resign Date</th>
                  <th>Last Working Day</th>
                  <th>Gratuity</th>
                  <th>Leave Balance</th>
                  <th>Final Amount</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {settlements.length > 0 ? (
                  settlements.map((s) => (
                    <tr key={s.id}>
                      <td className="fw-semibold">{getEmployeeName(s.employeeId)}</td>
                      <td>{s.resignDate}</td>
                      <td>{s.lastWorkingDay}</td>
                      <td className="fw-semibold text-success">₹{parseFloat(s.gratuityAmount || 0).toLocaleString()}</td>
                      <td>
                        <span className="badge bg-info text-dark">{s.pendingLeaves || 0} days</span>
                      </td>
                      <td className="fw-bold text-primary">₹{parseFloat(s.finalPayableAmount).toLocaleString()}</td>
                      <td>
                        <Badge className={getStatusBadgeClass(s.status)}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            className="btn-action btn-edit"
                            onClick={() => handleEdit(s)}
                            title="Edit"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            className="btn-action btn-delete"
                            onClick={() => confirmDelete(s)}
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
                    <td colSpan="8" className="text-center text-muted py-4">
                      No settlement records found.
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
        className="settlement-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>{modalType === "edit" ? "Edit Settlement" : "Add Settlement Record"}</Modal.Title>
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
                  <option value="">Select Employee</option>
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
                <Form.Label className="form-label-custom">Resign Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="resignDate"
                  value={form.resignDate}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Last Working Day *</Form.Label>
                <Form.Control
                  type="date"
                  name="lastWorkingDay"
                  value={form.lastWorkingDay}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Pending Leaves (Days)</Form.Label>
                <Form.Control
                  type="number"
                  name="pendingLeaves"
                  value={form.pendingLeaves}
                  onChange={handleInputChange}
                  min="0"
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Gratuity Amount</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="gratuityAmount"
                  value={form.gratuityAmount}
                  onChange={handleInputChange}
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Deductions</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="deductions"
                  value={form.deductions}
                  onChange={handleInputChange}
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Final Payable Amount *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="finalPayableAmount"
                  value={form.finalPayableAmount}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                />
                <Form.Text className="text-muted">
                  (Gratuity + Leave encashment - Deductions)
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Status</Form.Label>
                <Form.Select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="form-select-custom"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processed">Processed</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button className="btn-modal-save" onClick={handleSave}>
            {modalType === "edit" ? "Update" : "Save"} Settlement
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
        className="settlement-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Delete Settlement Record</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom text-center py-4">
          <div className="mx-auto mb-3" style={{ width: 70, height: 70, background: "#FFF5F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaTrash style={{ fontSize: "32px", color: "#F04438" }} />
          </div>
          <h4 className="fw-bold mb-2">Delete Settlement Record</h4>
          <p className="text-muted mb-3">
            Are you sure you want to delete settlement for{" "}
            <strong>{getEmployeeName(settlementToDelete?.employeeId)}</strong>? This action cannot be undone.
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

export default Settlement;