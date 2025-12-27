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
  Spinner,
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
import './Documents.css';

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
    // Use == to handle number vs string ID comparison
    const emp = employees.find((e) => e.id == empId);
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

  const getStatusBadgeClass = (status) => {
    if (status === "Active") return "badge-status badge-active";
    if (status === "Expired") return "badge-status badge-expired";
    if (status === "Pending") return "badge-status badge-pending";
    return "badge-status badge-unknown";
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
    setForm(emptyDocument);
    setModalType("add");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    // Reset delete document after modal fully closed
    setDocToDelete(null);
    isCleaningUpRef.current = false;
  };

  const handleAdd = () => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    setForm(emptyDocument);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalType("add");
    setShowModal(true);
  };

  const handleEdit = async (doc) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    try {
      const res = await axiosInstance.get(`documentsRequest/${doc.id}`);
      if (res?.data?.success) {
        const d = res.data.data;
        setForm({
          id: d.id,
          employeeId: d.employee_id?.toString(), // ensure string for select
          documentType: d.document_type,
          fileName: d.file_name || "",
          fileUrl: d.file_url || "",
          issueDate: d.issue_date ? d.issue_date.split("T")[0] : "",
          expiryDate: d.expiry_date ? d.expiry_date.split("T")[0] : "",
          notes: d.notes || "",
          file: null, // reset file on edit (user can re-upload)
        });
        setModalType("edit");
        setShowModal(true);
      }
    } catch (err) {
      console.error("Failed to load document for edit", err);
      alert("Failed to load document.");
    }
  };

  // ✅ NEW: Build FormData for file upload
  const buildFormData = (formValues) => {
    const formData = new FormData();
    formData.append("employee_id", formValues.employeeId);
    formData.append("document_type", formValues.documentType);
    formData.append("issue_date", formValues.issueDate);
    if (formValues.expiryDate) {
      formData.append("expiry_date", formValues.expiryDate);
    }
    if (formValues.notes) {
      formData.append("notes", formValues.notes);
    }
    if (formValues.file) {
      formData.append("file", formValues.file);
    }
    return formData;
  };

  const handleSave = async () => {
    const { employeeId, documentType, issueDate } = form;
    if (!employeeId || !documentType || !issueDate) {
      alert("Please fill Employee, Document Type, and Issue Date.");
      return;
    }

    const formData = buildFormData(form);

    try {
      if (modalType === "add") {
        // POST with FormData
        const res = await axiosInstance.post(`documentsRequest/${companyId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (res?.data?.success) {
          alert("Document created successfully!");
        } else {
          throw new Error(res?.data?.message || "Unknown error");
        }
      } else {
        // PUT with FormData
        const res = await axiosInstance.put(`documentsRequest/${form.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (res?.data?.success) {
          alert("Document updated successfully!");
        } else {
          throw new Error(res?.data?.message || "Unknown error");
        }
      }
      await fetchDocuments();
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleCloseModal();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save document. " + (err.message || ""));
    }
  };

  const confirmDelete = (doc) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.delete += 1;
    
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
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleDeleteModalClose();
      // Document will be reset in handleDeleteModalExited
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
      <div className="d-flex justify-content-center align-items-center loading-container" style={{ height: "100vh" }}>
        <div className="text-center">
          <Spinner animation="border" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="p-4 documents-container">
      {/* Header Section */}
      <div className="mb-4">
        <Row className="align-items-center">
          <Col xs={12} md={8}>
            <h3 className="documents-title">
              <i className="fas fa-file-contract me-2"></i>
              Documents & Contracts Management
            </h3>
            <p className="documents-subtitle">Manage employee documents, contracts, and agreements</p>
          </Col>
          <Col xs={12} md={4} className="d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
            <Button className="btn-export-pdf d-flex align-items-center" onClick={handlePDF}>
              <FaFilePdf className="me-2" /> Export List
            </Button>
            <Button className="btn-add-document d-flex align-items-center" onClick={handleAdd}>
              <FaPlus className="me-2" /> Add Document
            </Button>
          </Col>
        </Row>
      </div>

      {/* Table Card */}
      <Card className="documents-table-card border-0 shadow-lg">
        <Card.Body className="p-0">

          <div style={{ overflowX: "auto" }}>
            <Table hover responsive className="documents-table">
              <thead className="table-header">
                <tr>
                  <th>Employee</th>
                  <th>Document Type</th>
                  <th>File</th>
                  <th>Issue Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length > 0 ? (
                  documents.map((d) => {
                    const status = getDocumentStatus(d.issueDate, d.expiryDate);
                    return (
                      <tr key={d.id}>
                        <td className="fw-semibold">{getEmployeeName(d.employeeId)}</td>
                        <td>{d.documentType}</td>
                        <td>
                          {d.fileUrl ? (
                            <button
                              className="btn-file-view"
                              onClick={() => handleViewFile(d.fileUrl)}
                              title="View File"
                            >
                              <FaEye className="me-1" /> {d.fileName || "View"}
                            </button>
                          ) : d.fileName ? (
                            <span className="text-muted">{d.fileName}</span>
                          ) : (
                            <span className="text-muted">–</span>
                          )}
                        </td>
                        <td>{d.issueDate || "–"}</td>
                        <td>{d.expiryDate || "–"}</td>
                        <td>
                          <Badge className={getStatusBadgeClass(status)}>
                            {status}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            {d.fileUrl && (
                              <Button
                                className="btn-action btn-view"
                                onClick={() => handleViewFile(d.fileUrl)}
                                title="View File"
                              >
                                <FaEye />
                              </Button>
                            )}
                            <Button
                              className="btn-action btn-edit"
                              onClick={() => handleEdit(d)}
                              title="Edit"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              className="btn-action btn-delete"
                              onClick={() => confirmDelete(d)}
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
      <Modal 
        key={modalKeyRef.current.main}
        show={showModal} 
        onHide={handleCloseModal}
        onExited={handleModalExited}
        size="lg"
        centered
        className="documents-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>{modalType === "edit" ? "Edit Document" : "Add New Document"}</Modal.Title>
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
                <Form.Label className="form-label-custom">Document Type *</Form.Label>
                <Form.Select
                  name="documentType"
                  value={form.documentType}
                  onChange={handleInputChange}
                  required
                  className="form-select-custom"
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
                <Form.Label className="form-label-custom">Issue Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="issueDate"
                  value={form.issueDate}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleInputChange}
                  min={form.issueDate || ""}
                  className="form-control-custom"
                />
                <Form.Text className="text-muted">Leave blank if no expiry</Form.Text>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Upload File (Optional)</Form.Label>
                <Form.Control
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="form-control-custom"
                />
                {form.fileName && (
                  <div className="mt-2">
                    <span className="file-name-badge">
                      {form.fileName}
                    </span>
                  </div>
                )}
                <Form.Text className="text-muted">
                  Supported: PDF, DOC, DOCX, JPG, PNG (Max size depends on server)
                </Form.Text>
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
                  rows={2}
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
            {modalType === "edit" ? "Update" : "Save"} Document
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
        className="documents-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Delete Document</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom text-center py-4">
          <div className="mx-auto mb-3" style={{ width: 70, height: 70, background: "#FFF5F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaTrash style={{ fontSize: "32px", color: "#F04438" }} />
          </div>
          <h4 className="fw-bold mb-2">Delete Document</h4>
          <p className="text-muted mb-3">
            Are you sure you want to delete the <strong>{docToDelete?.documentType}</strong> for{" "}
            <strong>{getEmployeeName(docToDelete?.employeeId)}</strong>? This action cannot be undone.
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

export default Documents;