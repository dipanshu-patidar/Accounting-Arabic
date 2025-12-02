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
  FaMoneyBillWave,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePdf,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Mock employees (same as before)
const mockEmployees = [
  { id: 1, name: "John Doe", employeeId: "EMP-001" },
  { id: 2, name: "Jane Smith", employeeId: "EMP-002" },
  { id: 3, name: "Robert Johnson", employeeId: "EMP-003" },
];

const emptyPayroll = {
  id: null,
  employeeId: "",
  month: "", // e.g., "2025-11"
  basicSalary: 0,
  allowances: 0,
  overtime: 0,
  bonus: 0,
  deductions: 0,
  netSalary: 0,
  paymentDate: "",
  paymentStatus: "Pending",
};

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees] = useState(mockEmployees);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [form, setForm] = useState(emptyPayroll);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState(null);

  // Load mock data
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        employeeId: "1",
        month: "2025-10",
        basicSalary: 30000,
        allowances: 5000,
        overtime: 2000,
        bonus: 3000,
        deductions: 2500,
        netSalary: 37500,
        paymentDate: "2025-10-30",
        paymentStatus: "Paid",
      },
      {
        id: 2,
        employeeId: "2",
        month: "2025-11",
        basicSalary: 35000,
        allowances: 6000,
        overtime: 0,
        bonus: 0,
        deductions: 3000,
        netSalary: 38000,
        paymentDate: "",
        paymentStatus: "Pending",
      },
    ];
    setTimeout(() => {
      setPayrolls(mockData);
      setLoading(false);
    }, 300);
  }, []);

  const getEmployeeName = (empId) => {
    const emp = employees.find((e) => e.id === parseInt(empId));
    return emp ? emp.name : "–";
  };

  const getMonthLabel = (yearMonth) => {
    if (!yearMonth) return "–";
    const [year, month] = yearMonth.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  // Auto-calculate net & gross
  const calculateSalaries = (data) => {
    const gross = Number(data.basicSalary || 0) +
                   Number(data.allowances || 0) +
                   Number(data.overtime || 0) +
                   Number(data.bonus || 0);
    const net = gross - Number(data.deductions || 0);
    return { gross, net };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numFields = ["basicSalary", "allowances", "overtime", "bonus", "deductions"];
    let updatedValue = numFields.includes(name) ? (value === "" ? 0 : Number(value)) : value;

    const updatedForm = { ...form, [name]: updatedValue };

    // Auto-calculate net salary
    const { net } = calculateSalaries(updatedForm);
    updatedForm.netSalary = net;

    setForm(updatedForm);
  };

  const handleAdd = () => {
    setForm(emptyPayroll);
    setModalType("add");
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setForm({ ...record });
    setModalType("edit");
    setShowModal(true);
  };

  const handleSave = () => {
    const { employeeId, month, basicSalary, paymentStatus } = form;

    if (!employeeId || !month || basicSalary === 0) {
      alert("Please fill required fields.");
      return;
    }

    const { gross, net } = calculateSalaries(form);
    const newRecord = {
      ...form,
      id: form.id || Date.now(),
      netSalary: net,
    };

    if (modalType === "add") {
      setPayrolls((prev) => [newRecord, ...prev]);
    } else {
      setPayrolls((prev) =>
        prev.map((p) => (p.id === form.id ? newRecord : p))
      );
    }

    setShowModal(false);
    setForm(emptyPayroll);
  };

  const confirmDelete = (record) => {
    setPayrollToDelete(record);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    setPayrolls((prev) => prev.filter((p) => p.id !== payrollToDelete.id));
    setShowDeleteModal(false);
    setPayrollToDelete(null);
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.text("Payroll Report", 14, 16);
    doc.autoTable({
      startY: 22,
      head: [
        ["Employee", "Month", "Gross Salary", "Deductions", "Net Salary", "Status"],
      ],
      body: payrolls.map((p) => {
        const { gross } = calculateSalaries(p);
        return [
          getEmployeeName(p.employeeId),
          getMonthLabel(p.month),
          `₹${gross.toLocaleString()}`,
          `₹${Number(p.deductions).toLocaleString()}`,
          `₹${Number(p.netSalary).toLocaleString()}`,
          p.paymentStatus,
        ];
      }),
    });
    doc.save("payroll.pdf");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: '#f0f7f8' }}>
        <div className="spinner-border" style={{ color: '#023347' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const paymentStatusBadge = (status) => {
    return (
      <span
        className="badge"
        style={{
          backgroundColor: status === "Paid" ? "#28a745" : "#ffc107",
          color: status === "Paid" ? "#fff" : "#212529",
          fontWeight: 500,
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <Container fluid className="py-3" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh' }}>
      <Card className="border-0 shadow-sm" style={{ backgroundColor: '#e6f3f5' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1" style={{ color: '#023347' }}>
                <FaMoneyBillWave className="me-2" style={{ color: '#2a8e9c' }} />
                Payroll
              </h4>
              <p className="text-muted">Manage employee salary records</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={handlePDF} size="sm" style={{ borderColor: '#2a8e9c', color: '#2a8e9c' }} className="d-flex align-items-center justify-content-center">
                <FaFilePdf className="me-1" /> Export PDF
              </Button>
              <Button style={{ backgroundColor: '#023347', border: 'none' }} onClick={handleAdd} size="sm" className="d-flex align-items-center justify-content-center">
                <FaPlus className="me-1" /> Add Payroll
              </Button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Gross Salary</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length > 0 ? (
                  payrolls.map((p) => {
                    const { gross } = calculateSalaries(p);
                    return (
                      <tr key={p.id}>
                        <td>{getEmployeeName(p.employeeId)}</td>
                        <td>{getMonthLabel(p.month)}</td>
                        <td>₹{gross.toLocaleString()}</td>
                        <td>₹{Number(p.deductions).toLocaleString()}</td>
                        <td>₹{Number(p.netSalary).toLocaleString()}</td>
                        <td>{paymentStatusBadge(p.paymentStatus)}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="light"
                            className="me-1"
                            onClick={() => handleEdit(p)}
                            style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => confirmDelete(p)}
                            style={{ color: '#dc3545', backgroundColor: '#e6f3f5' }}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No payroll records found.
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
        <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#ffffff' }}>
          <Modal.Title>
            {modalType === "edit" ? "Edit Payroll" : "Add Payroll Record"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#f0f7f8' }}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Employee *</Form.Label>
                <Form.Select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleInputChange}
                  required
                  style={{ border: '1px solid #ced4da' }}
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
                <Form.Label>Month *</Form.Label>
                <Form.Control
                  type="month"
                  name="month"
                  value={form.month}
                  onChange={handleInputChange}
                  required
                  style={{ border: '1px solid #ced4da' }}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Basic Salary *</Form.Label>
                <Form.Control
                  type="number"
                  name="basicSalary"
                  value={form.basicSalary || ""}
                  onChange={handleInputChange}
                  required
                  style={{ border: '1px solid #ced4da' }}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Allowances</Form.Label>
                <Form.Control
                  type="number"
                  name="allowances"
                  value={form.allowances || ""}
                  onChange={handleInputChange}
                  style={{ border: '1px solid #ced4da' }}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Overtime</Form.Label>
                <Form.Control
                  type="number"
                  name="overtime"
                  value={form.overtime || ""}
                  onChange={handleInputChange}
                  style={{ border: '1px solid #ced4da' }}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Bonus</Form.Label>
                <Form.Control
                  type="number"
                  name="bonus"
                  value={form.bonus || ""}
                  onChange={handleInputChange}
                  style={{ border: '1px solid #ced4da' }}
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
                  style={{ border: '1px solid #ced4da' }}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Net Salary (Auto)</Form.Label>
                <Form.Control
                  type="text"
                  value={`₹${Number(form.netSalary).toLocaleString()}`}
                  readOnly
                  style={{ backgroundColor: '#e6f3f5', border: '1px solid #ced4da' }}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  name="paymentStatus"
                  value={form.paymentStatus}
                  onChange={handleInputChange}
                  style={{ border: '1px solid #ced4da' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Date</Form.Label>
                <Form.Control
                  type="date"
                  name="paymentDate"
                  value={form.paymentDate}
                  onChange={handleInputChange}
                  style={{ border: '1px solid #ced4da' }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#f0f7f8', border: 'none' }}>
          <Button variant="secondary" onClick={() => setShowModal(false)} style={{ border: '1px solid #ced4da' }}>
            Cancel
          </Button>
          <Button style={{ backgroundColor: '#023347', border: 'none' }} onClick={handleSave}>
            {modalType === "edit" ? "Update" : "Save"} Payroll
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#ffffff' }}>
          <Modal.Title>Delete Payroll Record</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#f0f7f8' }}>
          Are you sure you want to delete payroll for{" "}
          <strong>{getEmployeeName(payrollToDelete?.employeeId)}</strong> for{" "}
          <strong>{getMonthLabel(payrollToDelete?.month)}</strong>?
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#f0f7f8', border: 'none' }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} style={{ border: '1px solid #ced4da' }}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Payroll;