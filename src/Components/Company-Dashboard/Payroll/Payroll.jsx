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
  FaMoneyBillWave,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePdf,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import './Payroll.css';

const emptyPayroll = {
  id: null,
  employeeId: "",
  month: "", // e.g., "2025-11"
  basicSalary: "",
  allowances: "",
  overtime: "",
  bonus: "",
  deductions: "",
  netSalary: "",
  paymentDate: "",
  paymentStatus: "Pending",
};

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const companyId = GetCompanyId();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [form, setForm] = useState(emptyPayroll);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState(null);

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0, delete: 0 });

  // Fetch employees
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

  // Fetch payroll records
  const fetchPayrolls = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`payrollRequest?companyId=${companyId}`);
      if (Array.isArray(res.data)) {
        const mapped = res.data.map((p) => ({
          id: p.id,
          employeeId: p.employee_id,
          month: p.payroll_month, // "December, 2025"
          basicSalary: p.basic_salary,
          allowances: p.allowances,
          overtime: p.overtime_pay,
          bonus: p.bonus,
          deductions: p.deductions,
          netSalary: p.net_salary,
          paymentStatus: p.payment_status,
          paymentDate: p.payment_date ? p.payment_date.split("T")[0] : "",
          employee: p.employee,
        }));
        setPayrolls(mapped);
      }
    } catch (err) {
      console.error("Failed to load payroll", err);
      alert("Failed to load payroll records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchPayrolls();
    }
  }, [companyId]);

  const getEmployeeName = (empId) => {
    const emp = employees.find((e) => e.id === empId);
    return emp ? emp.name : "–";
  };

  const getMonthLabel = (monthStr) => {
    return monthStr || "–";
  };

  const calculateSalaries = (data) => {
    const gross =
      parseFloat(data.basicSalary || 0) +
      parseFloat(data.allowances || 0) +
      parseFloat(data.overtime || 0) +
      parseFloat(data.bonus || 0);
    const net = gross - parseFloat(data.deductions || 0);
    return { gross, net };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numFields = ["basicSalary", "allowances", "overtime", "bonus", "deductions"];
    const updatedValue = numFields.includes(name) ? (value === "" ? "" : value) : value;

    const updatedForm = { ...form, [name]: updatedValue };
    const { net } = calculateSalaries(updatedForm);
    updatedForm.netSalary = net.toFixed(2);
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
    setForm(emptyPayroll);
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
    // Reset delete payroll after modal fully closed
    setPayrollToDelete(null);
    isCleaningUpRef.current = false;
  };

  const handleAdd = () => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    setForm(emptyPayroll);
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

  const handleSave = async () => {
    const { employeeId, month, basicSalary } = form;

    if (!employeeId || !month || !basicSalary) {
      alert("Please fill Employee, Month, and Basic Salary.");
      return;
    }

    // Prevent duplicate (employee + month)
    if (modalType === "add") {
      const exists = payrolls.some(
        (p) => p.employeeId === Number(employeeId) && p.month === month
      );
      if (exists) {
        alert("A payroll record for this employee and month already exists.");
        return;
      }
    }

    const { gross, net } = calculateSalaries(form);
    const payload = {
      employee_id: parseInt(employeeId, 10),
      payroll_month: month,
      basic_salary: parseFloat(basicSalary),
      allowances: parseFloat(form.allowances || 0),
      overtime_pay: parseFloat(form.overtime || 0),
      bonus: parseFloat(form.bonus || 0),
      deductions: parseFloat(form.deductions || 0),
      net_salary: net,
      payment_status: form.paymentStatus,
      payment_date: form.paymentDate || null,
    };

    try {
      if (modalType === "add") {
        await axiosInstance.post("payrollRequest", payload);
        alert("Payroll record created successfully!");
      } else {
        await axiosInstance.put(`payrollRequest/${form.id}`, payload);
        alert("Payroll record updated successfully!");
      }
      await fetchPayrolls();
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleCloseModal();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save payroll record.");
    }
  };

  const confirmDelete = (record) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.delete += 1;
    
    setPayrollToDelete(record);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`payrollRequest/${payrollToDelete.id}`);
      alert("Payroll record deleted successfully!");
      await fetchPayrolls();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete payroll record.");
    } finally {
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleDeleteModalClose();
      // Payroll will be reset in handleDeleteModalExited
    }
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.text("Payroll Report", 14, 16);
    doc.autoTable({
      startY: 22,
      head: [["Employee", "Month", "Gross Salary", "Deductions", "Net Salary", "Status"]],
      body: payrolls.map((p) => {
        const { gross } = calculateSalaries(p);
        return [
          getEmployeeName(p.employeeId),
          getMonthLabel(p.month),
          `₹${gross.toLocaleString()}`,
          `₹${parseFloat(p.deductions).toLocaleString()}`,
          `₹${parseFloat(p.netSalary).toLocaleString()}`,
          p.paymentStatus,
        ];
      }),
    });
    doc.save("payroll.pdf");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center loading-container" style={{ height: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading payroll records...</p>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    return status === "Paid" ? "badge-status badge-paid" : "badge-status badge-pending";
  };

  return (
    <Container fluid className="p-4 payroll-container">
      {/* Header Section */}
      <div className="mb-4">
        <Row className="align-items-center">
          <Col xs={12} md={8}>
            <h3 className="payroll-title">
              <i className="fas fa-money-bill-wave me-2"></i>
              Payroll Management
            </h3>
            <p className="payroll-subtitle">Manage employee salary records and payments</p>
          </Col>
          <Col xs={12} md={4} className="d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
            <Button className="btn-export-pdf d-flex align-items-center" onClick={handlePDF}>
              <FaFilePdf className="me-2" /> Export PDF
            </Button>
            <Button className="btn-add-payroll d-flex align-items-center" onClick={handleAdd}>
              <FaPlus className="me-2" /> Add Payroll
            </Button>
          </Col>
        </Row>
      </div>

      {/* Table Card */}
      <Card className="payroll-table-card border-0 shadow-lg">
        <Card.Body className="p-0">

          <div style={{ overflowX: "auto" }}>
            <Table hover responsive className="payroll-table">
              <thead className="table-header">
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Gross Salary</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Payment Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length > 0 ? (
                  payrolls.map((p) => {
                    const { gross } = calculateSalaries(p);
                    return (
                      <tr key={p.id}>
                        <td className="fw-semibold">{getEmployeeName(p.employeeId)}</td>
                        <td>{getMonthLabel(p.month)}</td>
                        <td className="fw-semibold text-success">₹{gross.toLocaleString()}</td>
                        <td className="fw-semibold text-danger">₹{parseFloat(p.deductions || 0).toLocaleString()}</td>
                        <td className="fw-bold text-primary">₹{parseFloat(p.netSalary).toLocaleString()}</td>
                        <td>
                          <Badge className={getStatusBadgeClass(p.paymentStatus)}>
                            {p.paymentStatus}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              className="btn-action btn-edit"
                              onClick={() => handleEdit(p)}
                              title="Edit"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              className="btn-action btn-delete"
                              onClick={() => confirmDelete(p)}
                              title="Delete"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
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
      <Modal 
        key={modalKeyRef.current.main}
        show={showModal} 
        onHide={handleCloseModal}
        onExited={handleModalExited}
        size="lg"
        centered
        className="payroll-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>{modalType === "edit" ? "Edit Payroll" : "Add Payroll Record"}</Modal.Title>
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
                <Form.Label className="form-label-custom">Month *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., December, 2025"
                  name="month"
                  value={form.month}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Basic Salary *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="basicSalary"
                  value={form.basicSalary}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Allowances</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="allowances"
                  value={form.allowances}
                  onChange={handleInputChange}
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Overtime</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="overtime"
                  value={form.overtime}
                  onChange={handleInputChange}
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Bonus</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="bonus"
                  value={form.bonus}
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
                <Form.Label className="form-label-custom">Net Salary (Auto)</Form.Label>
                <Form.Control
                  type="text"
                  value={form.netSalary ? `₹${parseFloat(form.netSalary).toLocaleString()}` : "—"}
                  readOnly
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Payment Status</Form.Label>
                <Form.Select
                  name="paymentStatus"
                  value={form.paymentStatus}
                  onChange={handleInputChange}
                  className="form-select-custom"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Payment Date</Form.Label>
                <Form.Control
                  type="date"
                  name="paymentDate"
                  value={form.paymentDate}
                  onChange={handleInputChange}
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
            {modalType === "edit" ? "Update" : "Save"} Payroll
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
        className="payroll-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Delete Payroll Record</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom text-center py-4">
          <div className="mx-auto mb-3" style={{ width: 70, height: 70, background: "#FFF5F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaTrash style={{ fontSize: "32px", color: "#F04438" }} />
          </div>
          <h4 className="fw-bold mb-2">Delete Payroll Record</h4>
          <p className="text-muted mb-3">
            Are you sure you want to delete payroll for{" "}
            <strong>{getEmployeeName(payrollToDelete?.employeeId)}</strong> for{" "}
            <strong>{getMonthLabel(payrollToDelete?.month)}</strong>? This action cannot be undone.
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

export default Payroll;