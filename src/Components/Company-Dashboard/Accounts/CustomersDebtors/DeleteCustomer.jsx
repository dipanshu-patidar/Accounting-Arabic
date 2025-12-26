// ./DeleteCustomer.jsx
import React, { useState } from "react";
import { Button, Modal, Spinner, Alert } from "react-bootstrap";
import axiosInstance from "../../../../Api/axiosInstance";
import { toast } from "react-toastify";

const DeleteCustomer = ({ show, onHide, onExited, onSuccess, customerId }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!customerId) {
      toast.error("❌ Customer ID is missing");
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      // ✅ Call API — ADJUST PATH if needed (e.g., `/api/vendorCustomer/...`)
      const response = await axiosInstance.delete(
        `/vendorCustomer/${customerId}`
      );

      // ✅ Check success — adapt based on your backend response
      const isSuccess =
        response.status === 200 ||
        response.status === 204 ||
        response.data?.success === true ||
        response.data?.status === true;

      if (isSuccess) {
        toast.success("Customer deleted successfully!");
        onSuccess?.(); // ✅ Notify parent to update UI
        onHide(); // ✅ Close modal
      } else {
        throw new Error(response.data?.message || "Unknown error occurred");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete customer. Please try again.";
      setError(msg);
      toast.error(`❌ ${msg}`);
      // ❌ Do NOT close modal on error
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} onExited={onExited} centered backdrop="static" className="customer-modal">
      <Modal.Header closeButton className="modal-header-custom" style={{ background: "linear-gradient(135deg, #505ece 0%, #3d47b8 100%)", color: "white" }}>
        <Modal.Title style={{ color: "white" }}>⚠️ Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        <p>
          Are you sure you want to delete this customer?{" "}
          <strong>This action cannot be undone.</strong>
        </p>
        {customerId && (
          <p className="text-muted small mb-0">
            <strong>Customer ID:</strong> {customerId}
          </p>
        )}
      </Modal.Body>
      <Modal.Footer className="modal-footer-custom">
        <Button
          variant="secondary"
          onClick={onHide}
          disabled={isDeleting}
          className="btn-modal-cancel"
          style={{
            backgroundColor: "#6c757d",
            borderColor: "#6c757d",
            color: "white",
            padding: "8px 18px",
            borderRadius: "8px",
            fontWeight: "600",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            if (isDeleting) return;
            e.currentTarget.style.backgroundColor = "#5a6268";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(108, 117, 125, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#6c757d";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
          className="btn-modal-delete"
          style={{
            backgroundColor: "#dc3545",
            borderColor: "#dc3545",
            color: "white",
            padding: "8px 18px",
            borderRadius: "8px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            opacity: isDeleting ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (isDeleting) return;
            e.currentTarget.style.backgroundColor = "#c82333";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(220, 53, 69, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#dc3545";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {isDeleting ? (
            <>
              <Spinner as="span" animation="border" size="sm" />
              <span className="ms-2">Deleting...</span>
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteCustomer;