// CustomUserLimitModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";

const CustomUserLimitModal = ({ show, handleClose, handleSave, currentUserLimit }) => {
  const [customLimit, setCustomLimit] = useState("");
  const [isUnlimited, setIsUnlimited] = useState(false);

  useEffect(() => {
    if (show) {
      if (currentUserLimit === "unlimited") {
        setIsUnlimited(true);
        setCustomLimit("");
      } else {
        setIsUnlimited(false);
        setCustomLimit(currentUserLimit.toString());
      }
    }
  }, [show, currentUserLimit]);

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
        <Modal.Title>Set Custom User Limit</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Check 
              type="radio" 
              id="unlimited-option" 
              label="Unlimited Users" 
              checked={isUnlimited}
              onChange={() => setIsUnlimited(true)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check 
              type="radio" 
              id="custom-number-option" 
              label="Custom Number of Users" 
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
                placeholder="Enter number of users"
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

export default CustomUserLimitModal;