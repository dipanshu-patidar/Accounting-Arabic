// CustomStorageCapacityModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";

const CustomStorageCapacityModal = ({ show, handleClose, handleSave, currentStorageCapacity }) => {
  const [customCapacity, setCustomCapacity] = useState("");
  const [isUnlimited, setIsUnlimited] = useState(false);

  useEffect(() => {
    if (show) {
      if (currentStorageCapacity === "unlimited") {
        setIsUnlimited(true);
        setCustomCapacity("");
      } else {
        setIsUnlimited(false);
        setCustomCapacity(currentStorageCapacity.toString());
      }
    }
  }, [show, currentStorageCapacity]);

  const onSave = () => {
    if (isUnlimited) {
      handleSave("unlimited");
    } else {
      const value = parseInt(customCapacity);
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
        <Modal.Title>Set Custom Storage Capacity</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Check 
              type="radio" 
              id="unlimited-storage-option" 
              label="Unlimited Storage" 
              checked={isUnlimited}
              onChange={() => setIsUnlimited(true)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check 
              type="radio" 
              id="custom-storage-option" 
              label="Custom Storage (in GB)" 
              checked={!isUnlimited}
              onChange={() => setIsUnlimited(false)}
            />
            {!isUnlimited && (
              <Form.Control 
                type="number" 
                min="1" 
                value={customCapacity} 
                onChange={(e) => setCustomCapacity(e.target.value)} 
                className="mt-2"
                placeholder="Enter storage capacity in GB"
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

export default CustomStorageCapacityModal;