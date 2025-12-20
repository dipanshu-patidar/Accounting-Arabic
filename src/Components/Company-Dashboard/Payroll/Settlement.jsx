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
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "#f0f7f8" }}>
        <div className="spinner-border" style={{ color: "#023347" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const statusBadge = (status) => {
    return (
      <span
        className="badge"
        style={{
          backgroundColor: status === "Processed" ? "#28a745" : "#ffc107",
          color: status === "Processed" ? "#fff" : "#212529",
          fontWeight: 500,
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <Container fluid className="py-3" style={{ backgroundColor: "#f0f7f8", minHeight: "100vh" }}>
      <Card className="border-0 shadow-sm" style={{ backgroundColor: "#e6f3f5" }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1" style={{ color: "#023347" }}>
                <FaReceipt className="me-2" style={{ color: "#2a8e9c" }} />
                End of Service
              </h4>
              <p className="text-muted">Manage employee final settlement</p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={handlePDF}
                size="sm"
                style={{ borderColor: "#023347", color: "#023347" }}
              >
                <FaFilePdf className="me-1" /> Export PDF
              </Button>
              <Button
                style={{ backgroundColor: "#023347", border: "none" }}
                onClick={handleAdd}
                size="sm"
              >
                <FaPlus className="me-1" /> Add Settlement
              </Button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Resign Date</th>
                  <th>Last Working Day</th>
                  <th>Gratuity</th>
                  <th>Leave Balance</th>
                  <th>Final Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settlements.length > 0 ? (
                  settlements.map((s) => (
                    <tr key={s.id}>
                      <td>{getEmployeeName(s.employeeId)}</td>
                      <td>{s.resignDate}</td>
                      <td>{s.lastWorkingDay}</td>
                      <td>₹{parseFloat(s.gratuityAmount).toLocaleString()}</td>
                      <td>{s.pendingLeaves} days</td>
                      <td>₹{parseFloat(s.finalPayableAmount).toLocaleString()}</td>
                      <td>{statusBadge(s.status)}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="light"
                          className="me-1"
                          style={{ color: "#023347", backgroundColor: "#e6f3f5" }}
                          onClick={() => handleEdit(s)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          style={{ color: "#dc3545", backgroundColor: "#e6f3f5" }}
                          onClick={() => confirmDelete(s)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
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
      >
        <Modal.Header closeButton style={{ backgroundColor: "#023347", color: "white" }}>
          <Modal.Title>{modalType === "edit" ? "Edit Settlement" : "Add Settlement Record"}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#f0f7f8" }}>
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
                <Form.Label>Resign Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="resignDate"
                  value={form.resignDate}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last Working Day *</Form.Label>
                <Form.Control
                  type="date"
                  name="lastWorkingDay"
                  value={form.lastWorkingDay}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Pending Leaves (Days)</Form.Label>
                <Form.Control
                  type="number"
                  name="pendingLeaves"
                  value={form.pendingLeaves}
                  onChange={handleInputChange}
                  min="0"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Gratuity Amount</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="gratuityAmount"
                  value={form.gratuityAmount}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Deductions</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="deductions"
                  value={form.deductions}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Final Payable Amount *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="finalPayableAmount"
                  value={form.finalPayableAmount}
                  onChange={handleInputChange}
                  required
                />
                <Form.Text muted>
                  (Gratuity + Leave encashment - Deductions)
                </Form.Text>
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
                  <option value="Pending">Pending</option>
                  <option value="Processed">Processed</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#f0f7f8" }}>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button style={{ backgroundColor: "#023347", border: "none" }} onClick={handleSave}>
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
      >
        <Modal.Header closeButton style={{ backgroundColor: "#dc3545", color: "white" }}>
          <Modal.Title>Delete Settlement Record</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#f0f7f8" }}>
          Are you sure you want to delete settlement for{" "}
          <strong>{getEmployeeName(settlementToDelete?.employeeId)}</strong>?
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#f0f7f8" }}>
          <Button variant="secondary" onClick={handleDeleteModalClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} style={{ backgroundColor: "#dc3545" }}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Settlement;