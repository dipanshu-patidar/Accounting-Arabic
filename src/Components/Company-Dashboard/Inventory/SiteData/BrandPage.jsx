import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const BrandPage = ({ show, handleClose }) => {
  const [brandName, setBrandName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editBrandId, setEditBrandId] = useState(null);

  // Dummy categories data (static dropdown)
  const categories = [
    { _id: "1", category_name: "Electronics" },
    { _id: "2", category_name: "Clothing" },
    { _id: "3", category_name: "Home Appliances" },
  ];

  useEffect(() => {
    if (!show) {
      setBrandName("");
      setCategoryId("");
      setEditBrandId(null);
    }
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!brandName || !categoryId) return;

    const brandData = {
      brand_name: brandName,
      categoryId,
    };

    // You can log or use this data as needed
    console.log(editBrandId ? "Updating Brand:" : "Creating Brand:", brandData);

    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editBrandId ? "Edit Brand" : "Create Brand"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="brandName">
            <Form.Label>Brand Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Brand Name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="categorySelect" className="mt-3">
            <Form.Label>Select Category</Form.Label>
            <Form.Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.category_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="ms-2"                 style={{
            backgroundColor: "#53b2a5",
            border: "none",
            display: "flex",
            alignItems: "center",
          }}>
              {editBrandId ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BrandPage;
