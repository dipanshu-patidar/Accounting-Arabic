import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Button,
  Table,
  Row,
  Col,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faTrash,
  faSearch,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import AddProductModal from '../../../Company-Dashboard/Inventory/AddProductModal';

const PaymentTab = ({ 
  formData, 
  setFormData, 
  availableItems,
  categories,
  setCategories,
  companyId
}) => {
  const navigate = useNavigate();
  const [rowSearchTerms, setRowSearchTerms] = useState({});
  const [showRowSearch, setShowRowSearch] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    hsn: "",
    tax: 0,
    sellingPrice: 0,
    uom: "PCS",
  });
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showUOMModal, setShowUOMModal] = useState(false);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      payment: { ...prev.payment, [field]: value },
    }));
  };

  // Handle item field changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.payment.items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      payment: { ...prev.payment, items: updatedItems },
    }));
  };

  // Handle product changes
  const handleProductChange = (field, value) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  // Add a new item row
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        items: [
          ...prev.payment.items,
          { 
            description: "", 
            rate: "", 
            qty: "", 
            tax: "", 
            discount: "", 
            amount: "" 
          },
        ],
      },
    }));
  };

  // Remove an item row
  const removeItem = (index) => {
    const updatedItems = [...formData.payment.items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      payment: { ...prev.payment, items: updatedItems },
    }));
  };

  // Handle row search changes
  const handleRowSearchChange = (index, value) => {
    setRowSearchTerms((prev) => ({
      ...prev,
      [`payment-${index}`]: value,
    }));
  };

  // Toggle row search visibility
  const toggleRowSearch = (index) => {
    const rowKey = `payment-${index}`;
    setShowRowSearch((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  // Handle selecting a searched item
  const handleSelectSearchedItem = (index, item) => {
    const updatedItems = [...formData.payment.items];
    updatedItems[index] = {
      ...updatedItems[index],
      description: item.name,
      rate: item.price,
      tax: item.tax,
      hsn: item.hsn,
      uom: item.uom,
    };

    setFormData((prev) => ({
      ...prev,
      payment: { ...prev.payment, items: updatedItems },
    }));

    // Hide search for this row
    setShowRowSearch((prev) => ({
      ...prev,
      [`payment-${index}`]: false,
    }));

    // Clear search term
    setRowSearchTerms((prev) => ({
      ...prev,
      [`payment-${index}`]: "",
    }));
  };

  // Handle adding a new product
  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) {
      alert("Product name and category are required!");
      return;
    }
    const itemToAdd = {
      description: newItem.name,
      qty: 1,
      rate: newItem.sellingPrice,
      tax: newItem.tax,
      discount: 0,
      amount: newItem.sellingPrice,
      hsn: newItem.hsn,
      uom: newItem.uom,
    };

    setFormData((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        items: [...prev.payment.items, itemToAdd],
      },
    }));

    setNewItem({
      name: "",
      category: "",
      hsn: "",
      tax: 0,
      sellingPrice: 0,
      uom: "PCS",
    });
    setShowAdd(false);
  };

  // Handle adding a new category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
      setNewItem((prev) => ({ ...prev, category: newCategory }));
      setNewCategory("");
    }
    setShowAddCategoryModal(false);
  };

  // Handle file uploads
  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("signature", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("photo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          base64: reader.result,
        });

        if (newFiles.length === files.length) {
          handleChange("files", [...formData.payment.files, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    const updatedFiles = [...formData.payment.files];
    updatedFiles.splice(index, 1);
    handleChange("files", updatedFiles);
  };

  // Calculate total amount
  const calculateTotalAmount = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const rate = parseFloat(item.rate) || 0;
      const qty = parseInt(item.qty) || 0;
      return total + rate * qty;
    }, 0);
  };

  // Render items table
  const renderItemsTable = () => {
    const items = formData.payment?.items || [];

    // Filter items based on search term for each row
    const getFilteredItems = (index) => {
      const searchTerm = rowSearchTerms[`payment-${index}`] || "";
      if (!searchTerm) return [];

      return availableItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    };

    return (
      <div>
        <div className="d-flex justify-content-between mb-2">
          <div>
            <Button
              size="sm"
              onClick={addItem}
              style={{
                backgroundColor: "#505ece",
                borderColor: "#505ece",
                border: "none",
                color: "white",
                padding: "8px 16px",
                fontWeight: "600",
                borderRadius: "8px",
                marginRight: "5px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#3d47b8";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(80, 94, 206, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#505ece";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Row
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              style={{
                backgroundColor: "#505ece",
                borderColor: "#505ece",
                border: "none",
                color: "white",
                padding: "8px 16px",
                fontWeight: "600",
                borderRadius: "8px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#3d47b8";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(80, 94, 206, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#505ece";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              + Add Product
            </Button>
          </div>
        </div>

        <AddProductModal
          showAdd={showAdd}
          showEdit={false}
          newItem={newItem}
          categories={categories}
          newCategory={newCategory}
          showUOMModal={showUOMModal}
          showAddCategoryModal={showAddCategoryModal}
          setShowAdd={setShowAdd}
          setShowEdit={() => {}}
          setShowUOMModal={setShowUOMModal}
          setShowAddCategoryModal={setShowAddCategoryModal}
          setNewCategory={setNewCategory}
          handleChange={handleProductChange}
          handleAddItem={handleAddItem}
          handleUpdateItem={() => {}}
          handleAddCategory={handleAddCategory}
          companyId={companyId}
        />

        <Table bordered hover size="sm" className="dark-bordered-table">
          <thead className="bg-light">
            <tr>
              <th>Item Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Tax %</th>
              <th>Discount</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const qty = parseInt(item.qty) || 0;
              const rate = parseFloat(item.rate) || 0;
              const amount = qty * rate;
              const rowKey = `payment-${idx}`;
              const filteredItems = getFilteredItems(idx);
              const isSearchVisible = showRowSearch[rowKey];

              return (
                <tr key={idx}>
                  <td style={{ position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(idx, "description", e.target.value)
                        }
                        placeholder="Item Description"
                        style={{ marginRight: "5px" }}
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => toggleRowSearch(idx)}
                        title="Search Items"
                      >
                        <FontAwesomeIcon icon={faSearch} />
                      </Button>
                    </div>
                    {isSearchVisible && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 10,
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        }}
                      >
                        <InputGroup size="sm">
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                          </InputGroup.Text>
                          <FormControl
                            placeholder="Search items..."
                            value={rowSearchTerms[rowKey] || ""}
                            onChange={(e) =>
                              handleRowSearchChange(idx, e.target.value)
                            }
                            autoFocus
                          />
                        </InputGroup>
                        {filteredItems.length > 0 ? (
                          <div
                            style={{ maxHeight: "200px", overflowY: "auto" }}
                          >
                            {filteredItems.map((filteredItem) => (
                              <div
                                key={filteredItem.id}
                                style={{
                                  padding: "8px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #eee",
                                }}
                                onClick={() =>
                                  handleSelectSearchedItem(idx, filteredItem)
                                }
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f0f0f0")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "white")
                                }
                              >
                                <div>
                                  <strong>{filteredItem.name}</strong>
                                </div>
                                <div
                                  style={{ fontSize: "0.8rem", color: "#666" }}
                                >
                                  {filteredItem.category} - $                                   {filteredItem.price.toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "8px",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
                            No items found
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      size="sm"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(idx, "qty", e.target.value)
                      }
                      placeholder="Qty"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(idx, "rate", e.target.value)
                      }
                      placeholder="Rate"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.tax}
                      onChange={(e) =>
                        handleItemChange(idx, "tax", e.target.value)
                      }
                      placeholder="Tax %"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.discount}
                      onChange={(e) =>
                        handleItemChange(idx, "discount", e.target.value)
                      }
                      placeholder="Discount"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={amount.toFixed(2)}
                      readOnly
                      style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}
                    />
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeItem(idx)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  };

  // Render attachment fields
  const renderAttachmentFields = () => {
    return (
      <div className="mt-4 mb-4">
        <h5>Attachments</h5>
        <Row>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Signature</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleSignatureChange}
              />
              {formData.payment.signature && (
                <div className="mt-2">
                  <img
                    src={formData.payment.signature}
                    alt="Signature"
                    style={{
                      width: "100px",
                      height: "50px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Photo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {formData.payment.photo && (
                <div className="mt-2">
                  <img
                    src={formData.payment.photo}
                    alt="Photo"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Attach Files</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleFileChange}
              />
              {formData.payment.files && formData.payment.files.length > 0 && (
                <div className="mt-2">
                  <ul className="list-unstyled">
                    {formData.payment.files.map((file, index) => (
                      <li
                        key={index}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <span>{file.name}</span>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Form>
      {/* Header: Logo + Title */}
      <Row className="mb-4 d-flex justify-content-between align-items-center">
        <Col
          md={3}
          className="d-flex align-items-center justify-content-center"
        >
          <div
            className="border rounded d-flex flex-column align-items-center justify-content-center"
            style={{
              height: "120px",
              width: "100%",
              borderStyle: "dashed",
              cursor: "pointer",
            }}
            onClick={() =>
              document.getElementById("logo-upload-payment")?.click()
            }
          >
            <FontAwesomeIcon
              icon={faUpload}
              size="2x"
              className="text-muted"
            />
            <small>Upload Logo</small>
            <input
              id="logo-upload-payment"
              type="file"
              accept="image/*"
              hidden
            />
          </div>
        </Col>
        <Col
          md={3}
          className="d-flex flex-column align-items-end justify-content-center"
        >
          <h2 className="text-success mb-0">PAYMENT RECEIPT</h2>
          <hr
            style={{
              width: "80%",
              borderColor: "#28a745",
              marginTop: "5px",
              marginBottom: "10px",
            }}
          />
        </Col>
      </Row>

      <hr
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: "#28a745",
          border: "none",
          marginTop: "5px",
          marginBottom: "10px",
        }}
      />

      <Row className="mb-4 mt-3">
        <Col md={6}>
          <div className="d-flex flex-column gap-1">
            <Form.Control
              type="text"
              value={formData.payment.companyName}
              onChange={(e) =>
                handleChange("companyName", e.target.value)
              }
              placeholder=" Enter Your Company Name. . . . ."
              className="form-control-no-border"
              style={{
                fontSize: "1rem",
                lineHeight: "1.5",
                minHeight: "auto",
                padding: "0",
              }}
            />
            <Form.Control
              type="text"
              value={formData.payment.companyAddress}
              onChange={(e) =>
                handleChange("companyAddress", e.target.value)
              }
              placeholder="Company Address, City, State, Pincode  . . . "
              className="form-control-no-border"
              style={{
                fontSize: "1rem",
                lineHeight: "1.5",
                minHeight: "auto",
                padding: "0",
              }}
            />
            <Form.Control
              type="email"
              value={formData.payment.companyEmail}
              onChange={(e) =>
                handleChange("companyEmail", e.target.value)
              }
              placeholder="Company Email. . . ."
              className="form-control-no-border"
              style={{
                fontSize: "1rem",
                lineHeight: "1.5",
                minHeight: "auto",
                padding: "0",
              }}
            />
            <Form.Control
              type="text"
              value={formData.payment.companyPhone}
              onChange={(e) =>
                handleChange("companyPhone", e.target.value)
              }
              placeholder="Phone No....."
              className="form-control-no-border"
              style={{
                fontSize: "1rem",
                lineHeight: "1.5",
                minHeight: "auto",
                padding: "0",
              }}
            />
          </div>
        </Col>
        <Col md={6} className="d-flex flex-column align-items-end">
          <div
            className="d-flex flex-column gap-2 text-end"
            style={{ maxWidth: "400px", width: "100%" }}
          >
            {/* Payment Date */}
            <Form.Group>
              <Form.Control
                type="date"
                value={formData.payment.paymentDate}
                onChange={(e) =>
                  handleChange("paymentDate", e.target.value)
                }
                placeholder="Payment Date"
                className="form-control-no-border text-end"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                  textAlign: "right",
                }}
              />
            </Form.Group>

            {/* Ref No. (Auto) */}
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label
                  className="mb-0"
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    whiteSpace: "nowrap",
                    display: "block",
                    textAlign: "right",
                  }}
                >
                  Ref No.
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.payment.referenceId}
                  readOnly
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    fontWeight: "500",
                    backgroundColor: "#f8f9fa",
                    color: "#495057",
                    cursor: "not-allowed",
                    textAlign: "right",
                  }}
                />
              </div>
            </Form.Group>

            {/* Manual Ref. No. (Optional) */}
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label
                  className="mb-0 flex-shrink-0 me-2"
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    whiteSpace: "nowrap",
                  }}
                >
                  Manual Ref. No. (Optional)
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.payment.manualRefNo}
                  onChange={(e) =>
                    handleChange("manualRefNo", e.target.value)
                  }
                  placeholder="e.g. PAY-CUST-REF"
                  className="form-control-no-border text-end flex-grow-1"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0.375rem 0.75rem",
                    textAlign: "right",
                  }}
                />
              </div>
            </Form.Group>

            {/* Bill No. (Auto) */}
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label
                  className="mb-0"
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    whiteSpace: "nowrap",
                    display: "block",
                    textAlign: "right",
                  }}
                >
                  Bill No.
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.payment.billNo || ""}
                  readOnly
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    fontWeight: "500",
                    backgroundColor: "#f8f9fa",
                    color: "#495057",
                    cursor: "not-allowed",
                    textAlign: "right",
                  }}
                />
              </div>
            </Form.Group>

            {/* Manual Bill No. (Optional) */}
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label
                  className="mb-0 flex-shrink-0 me-2"
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    whiteSpace: "nowrap",
                  }}
                >
                  Manual Bill No. (Optional)
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.payment.manualBillNo || ""}
                  onChange={(e) =>
                    handleChange("manualBillNo", e.target.value)
                  }
                  placeholder="e.g. INV-CUST-REF"
                  className="form-control-no-border text-end flex-grow-1"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0.375rem 0.75rem",
                    textAlign: "right",
                  }}
                />
              </div>
            </Form.Group>

            {/* Payment No. (Auto) */}
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label
                  className="mb-0"
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    whiteSpace: "nowrap",
                    display: "block",
                    textAlign: "right",
                  }}
                >
                  Payment No.
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.payment.paymentNo || ""}
                  readOnly
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    fontWeight: "500",
                    backgroundColor: "#f8f9fa",
                    color: "#495057",
                    cursor: "not-allowed",
                    textAlign: "right",
                  }}
                />
              </div>
            </Form.Group>

            {/* Manual Payment No. (Optional) */}
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label
                  className="mb-0 flex-shrink-0 me-2"
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    whiteSpace: "nowrap",
                  }}
                >
                  Manual Payment No. (Optional)
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.payment.manualPaymentNo || ""}
                  onChange={(e) =>
                    handleChange("manualPaymentNo", e.target.value)
                  }
                  placeholder="e.g. PAY-CUST-001"
                  className="form-control-no-border text-end flex-grow-1"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0.375rem 0.75rem",
                    textAlign: "right",
                  }}
                />
              </div>
            </Form.Group>

            {/* Payment Method */}
            <Form.Group>
              <Form.Control
                type="text"
                value={formData.payment.paymentMethod}
                onChange={(e) =>
                  handleChange("paymentMethod", e.target.value)
                }
                placeholder="Payment Method"
                className="form-control-no-border text-end"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                  textAlign: "right",
                }}
              />
            </Form.Group>
          </div>
        </Col>
      </Row>

      <hr
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: "#28a745",
          border: "none",
          marginTop: "5px",
          marginBottom: "10px",
        }}
      />

      <Row className="mb-4 d-flex justify-content-between">
        <Col md={6} className="d-flex flex-column align-items-start">
          <h5>PAID TO</h5>
          <Form.Group className="mb-2 w-100">
            <Form.Control
              type="text"
              value={formData.payment.vendorName || ""}
              onChange={(e) =>
                handleChange("vendorName", e.target.value)
              }
              placeholder="Enter Vendor Name. . . . . ."
              className="form-control-no-border"
              style={{
                fontSize: "1rem",
                lineHeight: "1.5",
                minHeight: "auto",
                padding: "0",
              }}
            />
          </Form.Group>
          <Form.Group className="mb-1 w-100">
            <Form.Control
              rows={2}
              value={formData.payment.vendorAddress || ""}
              onChange={(e) =>
                handleChange("vendorAddress", e.target.value)
              }
              placeholder="Vendor Address. . . .  ."
              className="form-control-no-border"
              style={{
                fontSize: "1rem",
                lineHeight: "1.5",
                minHeight: "auto",
                padding: "0",
              }}
            />
          </Form.Group>
          <Form.Group className="mb-2 w-100">
            <Form.Control
              type="email"
              value={formData.payment.vendorEmail || ""}
              onChange={(e) =>
                handleChange("vendorEmail", e.target.value)
              }
              placeholder="Email. . . . . "
              className="form-control-no-border"
              style={{
                fontSize: "1rem",
                lineHeight: "1.5",
                minHeight: "auto",
                padding: "0",
              }}
            />
          </Form.Group>
          <Form.Group className="mb-2 w-100">
            <Form.Control
              type="text"
              value={formData.payment.vendorPhone || ""}
              onChange={(e) =>
                handleChange("vendorPhone", e.target.value)
              }
              placeholder="Phone. . . . . . ."
              className="form-control-no-border"
              style={{
                fontSize: "1rem",
                lineHeight: "1.5",
                minHeight: "auto",
                padding: "0",
              }}
            />
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex flex-column align-items-end">
          <h5>PAYMENT DETAILS</h5>
          <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
            <Form.Group className="mb-2">
              <Form.Label>Amount Paid</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.payment.amount}
                onChange={(e) =>
                  handleChange("amount", e.target.value)
                }
                placeholder="Amount"
                className="form-control-no-border text-end"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                  textAlign: "right",
                }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Total Amount</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={(
                  parseFloat(formData.payment.totalAmount) ||
                  calculateTotalAmount(formData.bill.items)
                ).toFixed(2)}
                readOnly
                className="form-control-no-border text-end"
                style={{ textAlign: "right" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Payment Status</Form.Label>
              <Form.Control
                type="text"
                value={formData.payment.paymentStatus}
                onChange={(e) =>
                  handleChange("paymentStatus", e.target.value)
                }
                placeholder="Payment Status"
                className="form-control-no-border text-end"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                  textAlign: "right",
                }}
              />
            </Form.Group>
          </div>
        </Col>
      </Row>

      <hr
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: "#28a745",
          border: "none",
          marginTop: "5px",
          marginBottom: "10px",
        }}
      />

      <Row className="mb-4 mt-2">
        <Col md={4}>
          <Table bordered size="sm" className="dark-bordered-table">
            <tbody>
              <tr>
                <td className="fw-bold">Total Bill:</td>
                <td>
                  $                   {(
                    parseFloat(formData.payment.totalAmount) ||
                    calculateTotalAmount(formData.bill.items)
                  ).toFixed(2)}
                </td>
              </tr>
              <tr className="fw-bold">
                <td>Amount Paid:</td>
                <td>
                  $                   {(parseFloat(formData.payment.amount) || 0).toFixed(
                    2
                  )}
                </td>
              </tr>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <td className="fw-bold">Balance:</td>
                <td className="fw-bold text-danger">
                  $                   {(
                    (parseFloat(formData.payment.totalAmount) ||
                      calculateTotalAmount(formData.bill.items)) -
                    (parseFloat(formData.payment.amount) || 0)
                  ).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>

      <Form.Group className="mt-4">
        <Form.Label>Note</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={formData.payment.note}
          onChange={(e) =>
            handleChange("note", e.target.value)
          }
          placeholder="e.g. Payment made via UPI / Cash"
          style={{ border: "1px solid #343a40" }}
        />
      </Form.Group>

      {/* Attachment Fields */}
      {renderAttachmentFields()}

      <Row className="text-center mt-5 mb-4 pt-3 border-top">
        <Col>
          <Form.Control
            type="text"
            value={formData.payment.footerNote}
            onChange={(e) =>
              handleChange("footerNote", e.target.value)
            }
            className="text-center mb-2 fw-bold"
            placeholder="Thank you for your payment!"
          />
        </Col>
      </Row>
    </Form>
  );
};

export default PaymentTab;