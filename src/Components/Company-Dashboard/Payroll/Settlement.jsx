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
  FaReceipt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePdf,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Mock employees
const mockEmployees = [
  { id: 1, name: "John Doe", employeeId: "EMP-001" },
  { id: 2, name: "Jane Smith", employeeId: "EMP-002" },
  { id: 3, name: "Robert Johnson", employeeId: "EMP-003" },
];

const emptySettlement = {
  id: null,
  employeeId: "",
  resignDate: "",
  lastWorkingDay: "",
  pendingLeaves: 0,
  gratuityAmount: 0,
  deductions: 0,
  finalPayableAmount: 0,
  notes: "",
  status: "Pending", // Pending / Processed
};

const Settlement = () => {
  const [settlements, setSettlements] = useState([]);
  const [employees] = useState(mockEmployees);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [form, setForm] = useState(emptySettlement);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [settlementToDelete, setSettlementToDelete] = useState(null);

  // Load mock data
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        employeeId: "1",
        resignDate: "2025-09-15",
        lastWorkingDay: "2025-10-15",
        pendingLeaves: 5,
        gratuityAmount: 45000,
        deductions: 2000,
        finalPayableAmount: 43000,
        notes: "Completed handover",
        status: "Processed",
      },
    ];
    setTimeout(() => {
      setSettlements(mockData);
      setLoading(false);
    }, 300);
  }, []);

  const getEmployeeName = (empId) => {
    const emp = employees.find((e) => e.id === parseInt(empId));
    return emp ? emp.name : "–";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numFields = ["pendingLeaves", "gratuityAmount", "deductions", "finalPayableAmount"];
    const updatedValue = numFields.includes(name) ? (value === "" ? 0 : Number(value)) : value;
    setForm({ ...form, [name]: updatedValue });
  };

  const handleAdd = () => {
    setForm(emptySettlement);
    setModalType("add");
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setForm({ ...record });
    setModalType("edit");
    setShowModal(true);
  };

  const handleSave = () => {
    const { employeeId, resignDate, lastWorkingDay } = form;
    if (!employeeId || !resignDate || !lastWorkingDay) {
      alert("Please fill required fields.");
      return;
    }

    const newRecord = {
      ...form,
      id: form.id || Date.now(),
    };

    if (modalType === "add") {
      setSettlements((prev) => [newRecord, ...prev]);
    } else {
      setSettlements((prev) =>
        prev.map((s) => (s.id === form.id ? newRecord : s))
      );
    }

    setShowModal(false);
    setForm(emptySettlement);
  };

  const confirmDelete = (record) => {
    setSettlementToDelete(record);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    setSettlements((prev) => prev.filter((s) => s.id !== settlementToDelete.id));
    setShowDeleteModal(false);
    setSettlementToDelete(null);
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.text("End of Service Settlement", 14, 16);
    doc.autoTable({
      startY: 22,
      head: [
        ["Employee", "Resign Date", "Last Day", "Gratuity", "Leave Bal.", "Final Amount", "Status"],
      ],
      body: settlements.map((s) => [
        getEmployeeName(s.employeeId),
        s.resignDate,
        s.lastWorkingDay,
        `₹${Number(s.gratuityAmount).toLocaleString()}`,
        `${s.pendingLeaves} days`,
        `₹${Number(s.finalPayableAmount).toLocaleString()}`,
        s.status,
      ]),
    });
    doc.save("settlement.pdf");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border" style={{ color: "#2a8e9c" }} role="status">
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
                className="d-flex align-items-center justify-content-center"
              >
                <FaFilePdf className="me-1" /> Export PDF
              </Button>
              <Button 
                variant="primary" 
                onClick={handleAdd} 
                size="sm"
                style={{ backgroundColor: "#023347", borderColor: "#023347" }}
                className="d-flex align-items-center justify-content-center"
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
                      <td>₹{Number(s.gratuityAmount).toLocaleString()}</td>
                      <td>{s.pendingLeaves} days</td>
                      <td>₹{Number(s.finalPayableAmount).toLocaleString()}</td>
                      <td>{statusBadge(s.status)}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-1"
                          onClick={() => handleEdit(s)}
                          style={{ borderColor: "#023347", color: "#023347" }}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
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
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton style={{ backgroundColor: "#023347", color: "white" }}>
          <Modal.Title>
            {modalType === "edit" ? "Edit Settlement" : "Add Settlement Record"}
          </Modal.Title>
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
                  value={form.pendingLeaves || ""}
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
                  name="gratuityAmount"
                  value={form.gratuityAmount || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Deductions</Form.Label>
                <Form.Control
                  type="number"
                  name="deductions"
                  value={form.deductions || ""}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Final Payable Amount *</Form.Label>
                <Form.Control
                  type="number"
                  name="finalPayableAmount"
                  value={form.finalPayableAmount || ""}
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
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            style={{ backgroundColor: "#6c757d", borderColor: "#6c757d" }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            style={{ backgroundColor: "#023347", borderColor: "#023347" }}
          >
            {modalType === "edit" ? "Update" : "Save"} Settlement
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#dc3545", color: "white" }}>
          <Modal.Title>Delete Settlement Record</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#f0f7f8" }}>
          Are you sure you want to delete settlement for{" "}
          <strong>{getEmployeeName(settlementToDelete?.employeeId)}</strong>?
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#f0f7f8" }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            style={{ backgroundColor: "#6c757d", borderColor: "#6c757d" }}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Settlement;