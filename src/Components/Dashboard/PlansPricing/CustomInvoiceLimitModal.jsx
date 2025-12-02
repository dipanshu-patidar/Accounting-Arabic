// CustomInvoiceLimitModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";

const CustomInvoiceLimitModal = ({ show, handleClose, handleSave, currentInvoiceLimit }) => {
  const [customLimit, setCustomLimit] = useState("");
  const [isUnlimited, setIsUnlimited] = useState(false);

  useEffect(() => {
    if (show) {
      if (currentInvoiceLimit === "unlimited") {
        setIsUnlimited(true);
        setCustomLimit("");
      } else {
        setIsUnlimited(false);
        setCustomLimit(currentInvoiceLimit.toString());
      }
    }
  }, [show, currentInvoiceLimit]);

  const onSave = () => {
    if (isUnlimited) {
      handleSave("unlimited");
    } else {
      const value = parseInt(customLimit);
      if (!isNaN(value) && value > 0) {
        handleSave(value);
      } else {
        Swal.fire({
          icon: "error",
          title: "Invalid Input",
          text: "Please enter a valid number greater than 0",
        });
        return;
      }
    }
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header style={{ backgroundColor: "#53b2a5", color: "#fff" }}>
        <Modal.Title>Set Custom Invoice Limit</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Check 
              type="radio" 
              id="unlimited-invoice-option" 
              label="Unlimited Invoices" 
              checked={isUnlimited}
              onChange={() => setIsUnlimited(true)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check 
              type="radio" 
              id="custom-invoice-option" 
              label="Custom Number of Invoices" 
              checked={!isUnlimited}
              onChange={() => setIsUnlimited(false)}
            />
            {!isUnlimited && (
              <Form.Control 
                type="number" 
                min="1" 
                value={customLimit} 
                onChange={(e) => setCustomLimit(e.target.value)} 
                className="mt-2"
                placeholder="Enter number of invoices"
              />
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onClick={handleClose}>Cancel</Button>
        <Button style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }} onClick={onSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomInvoiceLimitModal;