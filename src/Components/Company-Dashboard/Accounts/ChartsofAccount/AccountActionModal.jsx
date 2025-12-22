import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import BaseUrl from "../../../../Api/BaseUrl";
import axiosInstance from "../../../../Api/axiosInstance";

const AccountActionModal = ({
  show,
  onHide,
  onExited,
  mode, // 'view', 'edit', 'delete'
  accountData,
  selectedAccount,
  setSelectedAccount,
  onSave,
  onDelete,
  accountTypes
}) => {
  const [localAccountData, setLocalAccountData] = useState(selectedAccount);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Update local data when selectedAccount changes
  React.useEffect(() => {
    setLocalAccountData(selectedAccount);
    setModalError(null);
  }, [selectedAccount]);

  // Helper function to reset form and close modal
  const resetFormAndCloseModal = () => {
    setModalError(null);
    setIsSaving(false);
    setIsDeleting(false);
    onHide();
  };

  const handleSave = async () => {
    if (!selectedAccount) return;

    setIsSaving(true);
    setModalError(null);

    try {
      // Find the account ID from the accountData
      const accountGroup = accountData.find(acc => acc.type === selectedAccount.type);
      const accountRow = accountGroup?.rows.find(row => row.name === selectedAccount.name);

      if (accountRow && accountRow.id) {
        // Prepare the payload according to the API response format
        const payload = {
          subgroup_id: localAccountData.subgroup_id || "",
          sub_of_subgroup_id: localAccountData.sub_of_subgroup_id || "",
          account_number: localAccountData.account_number || "",
          ifsc_code: localAccountData.ifsc_code || "",
          bank_name_branch: localAccountData.bank_name_branch || "",
          accountBalance: parseFloat(localAccountData.balance || 0)
        };

        console.log("PUT Payload:", payload);

        // Make the API call to update the account
        const response = await axiosInstance.put(`${BaseUrl}account/${accountRow.id}`, payload);

        console.log("PUT Response:", response.data);

        // Check if response is successful
        if (response.data) {
          // Update the local state with the new data
          setSelectedAccount(localAccountData);

          // Call the onSave callback to update the UI
          onSave(localAccountData);

          // Close the modal
          resetFormAndCloseModal();
        } else {
          throw new Error(response.data?.message || "Failed to update account");
        }
      } else {
        throw new Error("Account ID not found");
      }
    } catch (error) {
      console.error("Error updating account:", error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Failed to update account. Please try again later.";
      setModalError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedAccount) return;

    setIsDeleting(true);
    try {
      // Find the account ID from the accountData
      const accountGroup = accountData.find(acc => acc.type === selectedAccount.type);
      const accountRow = accountGroup?.rows.find(row => row.name === selectedAccount.name);

      if (accountRow && accountRow.id) {
        // Make the API call to delete the account
        const response = await axiosInstance.delete(`${BaseUrl}account/${accountRow.id}`);

        if (response.data) {
          // Call the onDelete callback to update the UI
          onDelete();
          // Close the modal
          resetFormAndCloseModal();
        } else {
          throw new Error(response.data?.message || "Failed to delete account");
        }
      } else {
        throw new Error("Account ID not found");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Failed to delete account. Please try again later.";
      setModalError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderModalContent = () => {
    switch (mode) {
      case 'view':
        return (
          <div>
            <p>
              <strong>Account Type:</strong> {selectedAccount?.type}
            </p>
            <p>
              <strong>Account Name:</strong> {selectedAccount?.name}
            </p>
            <p>
              <strong>Balance:</strong>{" "}
              {parseFloat(selectedAccount?.balance || 0).toFixed(2)}
            </p>
          </div>
        );

      case 'edit':
        return (
          <>
            {modalError && (
              <Alert variant="danger" onClose={() => setModalError(null)} dismissible>
                {modalError}
              </Alert>
            )}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Account Type</Form.Label>
                <Form.Select
                  value={localAccountData?.type || ""}
                  onChange={(e) =>
                    setLocalAccountData((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                >
                  <option value="" disabled>
                    Select account type
                  </option>
                  {accountTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Account Name</Form.Label>
                <Form.Control
                  type="text"
                  value={localAccountData?.name || ""}
                  onChange={(e) =>
                    setLocalAccountData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Account Balance</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={localAccountData?.balance || 0}
                  onChange={(e) =>
                    setLocalAccountData((prev) => ({
                      ...prev,
                      balance: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </Form.Group>

              {/* Additional fields for the API payload */}
              <Form.Group className="mb-3">
                <Form.Label>Account Number</Form.Label>
                <Form.Control
                  type="text"
                  value={localAccountData?.account_number || ""}
                  onChange={(e) =>
                    setLocalAccountData((prev) => ({
                      ...prev,
                      account_number: e.target.value,
                    }))
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>IFSC Code</Form.Label>
                <Form.Control
                  type="text"
                  value={localAccountData?.ifsc_code || ""}
                  onChange={(e) =>
                    setLocalAccountData((prev) => ({
                      ...prev,
                      ifsc_code: e.target.value,
                    }))
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Bank Name & Branch</Form.Label>
                <Form.Control
                  type="text"
                  value={localAccountData?.bank_name_branch || ""}
                  onChange={(e) =>
                    setLocalAccountData((prev) => ({
                      ...prev,
                      bank_name_branch: e.target.value,
                    }))
                  }
                />
              </Form.Group>
            </Form>
          </>
        );

      case 'delete':
        return (
          <>
            {modalError && (
              <Alert variant="danger" onClose={() => setModalError(null)} dismissible>
                {modalError}
              </Alert>
            )}
            <p>
              Are you sure you want to delete the account "
              {selectedAccount?.name}" ({selectedAccount?.type})? This action
              cannot be undone.
            </p>
          </>
        );

      default:
        return null;
    }
  };

  const renderModalTitle = () => {
    switch (mode) {
      case 'view':
        return "Account Details";
      case 'edit':
        return "Edit Account";
      case 'delete':
        return "Confirm Deletion";
      default:
        return "";
    }
  };

  const renderModalFooter = () => {
    switch (mode) {
      case 'view':
        return (
          <Button variant="secondary" onClick={resetFormAndCloseModal}>
            Close
          </Button>
        );

      case 'edit':
        return (
          <>
            <Button variant="secondary" onClick={resetFormAndCloseModal} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#53b2a5", border: "none" }}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </>
        );

      case 'delete':
        return (
          <>
            <Button variant="secondary" onClick={resetFormAndCloseModal} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirmed}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={resetFormAndCloseModal} onExited={onExited} centered size={mode === 'edit' ? "lg" : undefined}>
      <Modal.Header closeButton>
        <Modal.Title>{renderModalTitle()}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {renderModalContent()}
      </Modal.Body>
      <Modal.Footer>
        {renderModalFooter()}
      </Modal.Footer>
    </Modal>
  );
};

export default AccountActionModal;