import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const DevicePage = ({
  show,
  handleClose,
  onSubmit,
  categories = [],
  brands = [],
  initialData = null,
}) => {
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.categoryId || "");
      setBrandId(initialData.brandId || "");
      setDeviceName(initialData.device_name || "");
      setEditMode(true);
      setDeviceId(initialData._id || null);
    } else {
      resetForm();
    }
  }, [initialData, show]);

  const resetForm = () => {
    setCategoryId("");
    setBrandId("");
    setDeviceName("");
    setEditMode(false);
    setDeviceId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!categoryId || !brandId || !deviceName) {
      alert("All fields are required!");
      return;
    }

    const deviceData = {
      categoryId,
      brandId,
      device_name: deviceName,
      ...(editMode && { _id: deviceId }),
    };

    onSubmit(deviceData);
    handleClose();
    resetForm();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? "Edit Device" : "Create Device"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mt-2">
            <Form.Label>Select Category</Form.Label>
            <Form.Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.category_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Select Brand</Form.Label>
            <Form.Select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              required
              disabled={!categoryId}
            >
              <option value="">Select Brand</option>
              {brands
                .filter((b) => b.category?._id === categoryId)
                .map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.brand_name}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Device Name</Form.Label>
            <Form.Control
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Enter device name"
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="ms-2"                 style={{
            backgroundColor: "#53b2a5",
            border: "none",
            display: "flex",
            alignItems: "center",
          }}>
              {editMode ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default DevicePage;
