// ./DeleteCustomer.jsx
import React, { useState } from "react";
import { Button, Modal, Spinner, Alert } from "react-bootstrap";
import axiosInstance from "../../../../Api/axiosInstance";
import { toast } from "react-toastify";

const DeleteCustomer = ({ show, onHide, onSuccess, customerId }) => {
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
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>⚠️ Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
          disabled={isDeleting}
          className="px-4"
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4"
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