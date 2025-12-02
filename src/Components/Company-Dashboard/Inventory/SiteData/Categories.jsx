import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const Categories = ({ show, handleClose, onSave, initialData }) => {
  const [categoryName, setCategoryName] = useState("");
  const [image, setImage] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState(null);

  useEffect(() => {
    if (show && initialData) {
      setCategoryName(initialData.category_name || "");
      setImage(initialData.p_image || null);
      setEditCategoryId(initialData.id || null);
    } else if (!show) {
      // Reset on close
      setCategoryName("");
      setImage(null);
      setEditCategoryId(null);
    }
  }, [show, initialData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const categoryData = {
      id: editCategoryId || Date.now().toString(),
      category_name: categoryName,
      p_image: image,
    };
    onSave(categoryData); // Call parent handler
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editCategoryId ? "Edit Category" : "Add Category"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="categoryName">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="image" className="mt-3">
            <Form.Label>Upload Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
          </Form.Group>

          {image && (
            <div className="mt-3 text-center">
              <img
                src={image}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "150px", objectFit: "cover" }}
              />
            </div>
          )}

          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={handleClose}>Close</Button>
            <Button variant="primary" type="submit" className="ms-2"                style={{
            backgroundColor: "#53b2a5",
            border: "none",
            display: "flex",
            alignItems: "center",
          }}>
              {editCategoryId ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default Categories;
