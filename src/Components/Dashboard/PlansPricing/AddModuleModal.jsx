// AddModuleModal.jsx
import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";
import BaseUrl from "../../../Api/BaseUrl";
import axiosInstance from "../../../Api/axiosInstance";

const AddModuleModal = ({ show, handleClose, onModuleAdded }) => {
  const [moduleData, setModuleData] = useState({
    key: "",
    label: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModuleData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!moduleData.key.trim() || !moduleData.label.trim()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Both key and label are required",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await axiosInstance.post("modules", moduleData);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Module added successfully!",
      });
      
      // Reset form
      setModuleData({ key: "", label: "" });
      
      // Notify parent component
      onModuleAdded(response.data);
      
      // Close modal
      handleClose();
    } catch (error) {
      console.error("Error adding module:", error);
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to add module. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header style={{ backgroundColor: "#53b2a5", color: "#fff" }}>
        <Modal.Title>Add New Module</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Module Key</Form.Label>
            <Form.Control
              type="text"
              name="key"
              value={moduleData.key}
              onChange={handleChange}
              placeholder="Enter module key (e.g., ACCOUNT)"
              required
            />
            <Form.Text className="text-muted">
              This should be a unique identifier for the module (usually in uppercase).
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Module Label</Form.Label>
            <Form.Control
              type="text"
              name="label"
              value={moduleData.label}
              onChange={handleChange}
              placeholder="Enter module label (e.g., Account)"
              required
            />
            <Form.Text className="text-muted">
              This is the display name for the module.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }} 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Module"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddModuleModal;