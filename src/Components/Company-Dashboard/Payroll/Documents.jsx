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
  FaEye,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";

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
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const companyId = GetCompanyId();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [form, setForm] = useState(emptyDocument);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const fileInputRef = useRef(null);

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

  // Fetch documents by company ID
  const fetchDocuments = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`documentsRequest/company/${companyId}`);
      if (res?.data?.success) {
        const mapped = res.data.data.map((doc) => ({
          id: doc.id,
          employeeId: doc.employee_id,
          documentType: doc.document_type,
          fileName: doc.file_name || "",
          fileUrl: doc.file_url || "",
          issueDate: doc.issue_date ? doc.issue_date.split("T")[0] : "",
          expiryDate: doc.expiry_date ? doc.expiry_date.split("T")[0] : "",
          notes: doc.notes || "",
          employee: doc.employee,
        }));
        setDocuments(mapped);
      }
    } catch (err) {
      console.error("Failed to load documents", err);
      alert("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchDocuments();
    }
  }, [companyId]);

  const getEmployeeName = (empId) => {
    const emp = employees.find((e) => e.id === empId);
    return emp ? emp.name : "–";
  };

  const getDocumentStatus = (issue, expiry) => {
    if (!issue) return "Unknown";
    const today = new Date();
    const issueDate = new Date(issue);
    const expiryDate = expiry ? new Date(expiry) : null;

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

  const handleEdit = async (doc) => {
    try {
      const res = await axiosInstance.get(`documentsRequest/${doc.id}`);
      if (res?.data?.success) {
        const d = res.data.data;
        setForm({
          id: d.id,
          employeeId: d.employee_id,
          documentType: d.document_type,
          fileName: d.file_name || "",
          fileUrl: d.file_url || "",
          issueDate: d.issue_date ? d.issue_date.split("T")[0] : "",
          expiryDate: d.expiry_date ? d.expiry_date.split("T")[0] : "",
          notes: d.notes || "",
          file: null,
        });
        setModalType("edit");
        setShowModal(true);
      }
    } catch (err) {
      console.error("Failed to load document for edit", err);
      alert("Failed to load document.");
    }
  };

  const handleSave = async () => {
    const { employeeId, documentType, issueDate } = form;
    if (!employeeId || !documentType || !issueDate) {
      alert("Please fill Employee, Document Type, and Issue Date.");
      return;
    }

    // ⚠️ File upload not implemented – you can add FormData upload here later
    const payload = {
      employee_id: parseInt(employeeId, 10),
      document_type: documentType,
      issue_date: issueDate,
      expiry_date: form.expiryDate || null,
      notes: form.notes || "",
      // file will be handled separately if needed
    };

    try {
      if (modalType === "add") {
        await axiosInstance.post(`documentsRequest/${companyId}`, payload);
        alert("Document created successfully!");
      } else {
        await axiosInstance.put(`documentsRequest/${form.id}`, payload);
        alert("Document updated successfully!");
      }
      await fetchDocuments();
      setShowModal(false);
      setForm(emptyDocument);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save document.");
    }
  };

  const confirmDelete = (doc) => {
    setDocToDelete(doc);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`documentsRequest/${docToDelete.id}`);
      alert("Document deleted successfully!");
      await fetchDocuments();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete document.");
    } finally {
      setShowDeleteModal(false);
      setDocToDelete(null);
    }
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.text("Employee Documents Report", 14, 16);
    doc.autoTable({
      startY: 22,
      head: [["Employee", "Type", "File", "Issue Date", "Expiry Date", "Status"]],
      body: documents.map((d) => [
        getEmployeeName(d.employeeId),
        d.documentType,
        d.fileName || "–",
        d.issueDate || "–",
        d.expiryDate || "–",
        getDocumentStatus(d.issueDate, d.expiryDate),
      ]),
    });
    doc.save("employee_documents.pdf");
  };

  const handleViewFile = (url) => {
    if (url) {
      window.open(url, "_blank");
    } else {
      alert("No file available to preview.");
    }
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
              >
                <FaFilePdf className="me-1" /> Export List
              </Button>
              <Button
                style={{ backgroundColor: "#023347", border: "none" }}
                onClick={handleAdd}
                size="sm"
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
                        {d.fileUrl ? (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleViewFile(d.fileUrl)}
                            className="p-0"
                            style={{ color: "#2a8e9c" }}
                          >
                            <FaEye className="me-1" /> {d.fileName || "View"}
                          </Button>
                        ) : (
                          d.fileName || "–"
                        )}
                      </td>
                      <td>{d.issueDate || "–"}</td>
                      <td>{d.expiryDate || "–"}</td>
                      <td>{statusBadge(getDocumentStatus(d.issueDate, d.expiryDate))}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="light"
                          className="me-1"
                          style={{ color: "#023347", backgroundColor: "#e6f3f5" }}
                          onClick={() => handleEdit(d)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          style={{ color: "#dc3545", backgroundColor: "#e6f3f5" }}
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
          <Modal.Title>{modalType === "edit" ? "Edit Document" : "Add New Document"}</Modal.Title>
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
                <Form.Label>Upload File (Optional)</Form.Label>
                <Form.Control
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {form.fileName && (
                  <div className="mt-1">
                    <Badge bg="light" text="dark">
                      {form.fileName}
                    </Badge>
                  </div>
                )}
                <Form.Text muted>
                  File upload will be linked to document on save (not implemented in this version).
                </Form.Text>
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button style={{ backgroundColor: "#023347", border: "none" }} onClick={handleSave}>
            {modalType === "edit" ? "Update" : "Save"} Document
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#dc3545", color: "white" }}>
          <Modal.Title>Delete Document</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#f0f7f8" }}>
          Are you sure you want to delete the <strong>{docToDelete?.documentType}</strong> for{" "}
          <strong>{getEmployeeName(docToDelete?.employeeId)}</strong>?
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#f0f7f8" }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
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

export default Documents;