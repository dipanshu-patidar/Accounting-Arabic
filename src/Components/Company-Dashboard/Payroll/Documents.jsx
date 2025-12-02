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
  Badge,
} from "react-bootstrap";
import {
  FaFileContract,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaDownload,
  FaEye,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Mock employees
const mockEmployees = [
  { id: 1, name: "John Doe", employeeId: "EMP-001" },
  { id: 2, name: "Jane Smith", employeeId: "EMP-002" },
  { id: 3, name: "Robert Johnson", employeeId: "EMP-003" },
];

const DOCUMENT_TYPES = [
  "Employment Contract",
  "NDA",
  "Offer Letter",
  "ID Proof",
  "Address Proof",
  "Experience Letter",
  "Other",
];

const emptyDocument = {
  id: null,
  employeeId: "",
  documentType: "",
  file: null,
  fileName: "",
  issueDate: "",
  expiryDate: "",
  notes: "",
};

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [employees] = useState(mockEmployees);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [form, setForm] = useState(emptyDocument);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const fileInputRef = useRef(null);

  // Load mock data
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        employeeId: "1",
        documentType: "Employment Contract",
        fileName: "john_contract.pdf",
        fileUrl: "#", // In real app, this would be a URL
        issueDate: "2023-02-01",
        expiryDate: "2026-02-01",
        notes: "Signed on joining",
      },
      {
        id: 2,
        employeeId: "1",
        documentType: "NDA",
        fileName: "john_nda.pdf",
        fileUrl: "#",
        issueDate: "2023-02-01",
        expiryDate: "2028-02-01",
        notes: "Confidentiality agreement",
      },
      {
        id: 3,
        employeeId: "2",
        documentType: "Offer Letter",
        fileName: "jane_offer.pdf",
        fileUrl: "#",
        issueDate: "2024-06-10",
        expiryDate: "", // No expiry
        notes: "Initial offer",
      },
    ];
    setTimeout(() => {
      setDocuments(mockData);
      setLoading(false);
    }, 300);
  }, []);

  const getEmployeeName = (empId) => {
    const emp = employees.find((e) => e.id === parseInt(empId));
    return emp ? emp.name : "–";
  };

  const getDocumentStatus = (issue, expiry) => {
    const today = new Date();
    const issueDate = issue ? new Date(issue) : null;
    const expiryDate = expiry ? new Date(expiry) : null;

    if (!issueDate) return "Unknown";

    if (expiryDate && today > expiryDate) return "Expired";
    if (today >= issueDate) return "Active";
    return "Pending";
  };

  const statusBadge = (status) => {
    let bg = "#6c757d";
    if (status === "Active") bg = "#28a745";
    else if (status === "Expired") bg = "#dc3545";
    else if (status === "Pending") bg = "#ffc107";

    return (
      <Badge
        style={{
          backgroundColor: bg,
          color: status === "Pending" ? "#212529" : "#fff",
          fontWeight: 500,
        }}
      >
        {status}
      </Badge>
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        file: file,
        fileName: file.name,
      });
    }
  };

  const handleAdd = () => {
    setForm(emptyDocument);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalType("add");
    setShowModal(true);
  };

  const handleEdit = (doc) => {
    setForm({
      ...doc,
      file: null, // Don't re-upload unless changed
    });
    setModalType("edit");
    setShowModal(true);
  };

  const handleSave = () => {
    const { employeeId, documentType, issueDate } = form;
    if (!employeeId || !documentType || !issueDate) {
      alert("Please fill required fields.");
      return;
    }

    // In real app: upload file → get URL
    // Here: just store file name
    const newDoc = {
      ...form,
      id: form.id || Date.now(),
      fileUrl: form.file ? URL.createObjectURL(form.file) : form.fileUrl,
    };

    if (modalType === "add") {
      setDocuments((prev) => [newDoc, ...prev]);
    } else {
      setDocuments((prev) =>
        prev.map((d) => (d.id === form.id ? { ...newDoc, file: null } : d))
      );
    }

    setShowModal(false);
    setForm(emptyDocument);
  };

  const confirmDelete = (doc) => {
    setDocToDelete(doc);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
    setShowDeleteModal(false);
    setDocToDelete(null);
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.text("Documents & Contracts", 14, 16);
    doc.autoTable({
      startY: 22,
      head: [
        ["Employee", "Type", "File", "Issue Date", "Expiry Date", "Status"],
      ],
      body: documents.map((d) => [
        getEmployeeName(d.employeeId),
        d.documentType,
        d.fileName || "–",
        d.issueDate || "–",
        d.expiryDate || "–",
        getDocumentStatus(d.issueDate, d.expiryDate),
      ]),
    });
    doc.save("documents.pdf");
  };

  const handleViewFile = (url) => {
    if (url && url !== "#") {
      window.open(url, "_blank");
    } else {
      alert("No file available to preview.");
    }
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

  return (
    <Container fluid className="py-3" style={{ backgroundColor: "#f0f7f8", minHeight: "100vh" }}>
      <Card className="border-0 shadow-sm" style={{ backgroundColor: "#e6f3f5" }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1" style={{ color: "#023347" }}>
                <FaFileContract className="me-2" style={{ color: "#2a8e9c" }} />
                Documents & Contracts
              </h4>
              <p className="text-muted">Manage employee documents and agreements</p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={handlePDF} 
                size="sm"
                style={{ borderColor: "#023347", color: "#023347" }}
                className="d-flex align-items-center justify-content-center"
              >
                <FaFilePdf className="me-1" /> Export List
              </Button>
              <Button 
                variant="primary" 
                onClick={handleAdd} 
                size="sm"
                style={{ backgroundColor: "#023347", borderColor: "#023347" }}
                className="d-flex align-items-center justify-content-center"
              >
                <FaPlus className="me-1" /> Add Document
              </Button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Document Type</th>
                  <th>File</th>
                  <th>Issue Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length > 0 ? (
                  documents.map((d) => (
                    <tr key={d.id}>
                      <td>{getEmployeeName(d.employeeId)}</td>
                      <td>{d.documentType}</td>
                      <td>
                        {d.fileName ? (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleViewFile(d.fileUrl)}
                            className="p-0"
                            style={{ color: "#2a8e9c" }}
                          >
                            <FaEye className="me-1" /> {d.fileName}
                          </Button>
                        ) : (
                          "–"
                        )}
                      </td>
                      <td>{d.issueDate || "–"}</td>
                      <td>{d.expiryDate || "–"}</td>
                      <td>{statusBadge(getDocumentStatus(d.issueDate, d.expiryDate))}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-1"
                          onClick={() => handleEdit(d)}
                          style={{ borderColor: "#023347", color: "#023347" }}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => confirmDelete(d)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No documents found.
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
            {modalType === "edit" ? "Edit Document" : "Add New Document"}
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
                <Form.Label>Document Type *</Form.Label>
                <Form.Select
                  name="documentType"
                  value={form.documentType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Issue Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="issueDate"
                  value={form.issueDate}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleInputChange}
                  min={form.issueDate || ""}
                />
                <Form.Text muted>Leave blank if no expiry</Form.Text>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Upload File</Form.Label>
                <Form.Control
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {form.fileName && (
                  <div className="mt-1">
                    <Badge bg="light" text="dark">
                      <FaFilePdf className="me-1" /> {form.fileName}
                    </Badge>
                  </div>
                )}
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
                  rows={2}
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
            {modalType === "edit" ? "Update" : "Save"} Document
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#dc3545", color: "white" }}>
          <Modal.Title>Delete Document</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#f0f7f8" }}>
          Are you sure you want to delete the <strong>{docToDelete?.documentType}</strong> for{" "}
          <strong>{getEmployeeName(docToDelete?.employeeId)}</strong>?
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

export default Documents;