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

const BillTab = ({ 
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
      bill: { ...prev.bill, [field]: value },
    }));
  };

  // Handle item field changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.bill.items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      bill: { ...prev.bill, items: updatedItems },
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
      bill: {
        ...prev.bill,
        items: [
          ...prev.bill.items,
          { 
            description: "", 
            qty: "", 
            rate: "", 
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
    const updatedItems = [...formData.bill.items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      bill: { ...prev.bill, items: updatedItems },
    }));
  };

  // Handle row search changes
  const handleRowSearchChange = (index, value) => {
    setRowSearchTerms((prev) => ({
      ...prev,
      [`bill-${index}`]: value,
    }));
  };

  // Toggle row search visibility
  const toggleRowSearch = (index) => {
    const rowKey = `bill-${index}`;
    setShowRowSearch((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  // Handle selecting a searched item
  const handleSelectSearchedItem = (index, item) => {
    const updatedItems = [...formData.bill.items];
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
      bill: { ...prev.bill, items: updatedItems },
    }));

    // Hide search for this row
    setShowRowSearch((prev) => ({
      ...prev,
      [`bill-${index}`]: false,
    }));

    // Clear search term
    setRowSearchTerms((prev) => ({
      ...prev,
      [`bill-${index}`]: "",
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
      bill: {
        ...prev.bill,
        items: [...prev.bill.items, itemToAdd],
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
          handleChange("files", [...formData.bill.files, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    const updatedFiles = [...formData.bill.files];
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
    const items = formData.bill?.items || [];

    // Filter items based on search term for each row
    const getFilteredItems = (index) => {
      const searchTerm = rowSearchTerms[`bill-${index}`] || "";
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
                backgroundColor: "#53b2a5",
                border: "none",
                padding: "6px 12px",
                fontWeight: "500",
                marginRight: "5px",
              }}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Row
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                padding: "6px 12px",
                fontWeight: "500",
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
              const rowKey = `bill-${idx}`;
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
              {formData.bill.signature && (
                <div className="mt-2">
                  <img
                    src={formData.bill.signature}
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
              {formData.bill.photo && (
                <div className="mt-2">
                  <img
                    src={formData.bill.photo}
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
              {formData.bill.files && formData.bill.files.length > 0 && (
                <div className="mt-2">
                  <ul className="list-unstyled">
                    {formData.bill.files.map((file, index) => (
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
      {/* Header: Logo + Company Info + Title */}
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
              document.getElementById("logo-upload-invoice")?.click()
            }
          >
            <FontAwesomeIcon
              icon={faUpload}
              size="2x"
              className="text-muted"
            />
            <small>Upload Logo</small>
            <input
              id="logo-upload-invoice"
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
          <h2 className="text-success mb-0">PURCHASE BILL</h2>
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
              value={formData.bill.companyName}
              onChange={(e) =>
                handleChange("companyName", e.target.value)
              }
              placeholder="Your Company Name"
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
              value={formData.bill.companyAddress}
              onChange={(e) =>
                handleChange("companyAddress", e.target.value)
              }
              placeholder="Company Address, City, State, Pincode"
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
              value={formData.bill.companyEmail}
              onChange={(e) =>
                handleChange("companyEmail", e.target.value)
              }
              placeholder="Company Email"
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
              value={formData.bill.companyPhone}
              onChange={(e) =>
                handleChange("companyPhone", e.target.value)
              }
              placeholder="Phone No."
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
            {/* Bill Date */}
            <Form.Group>
              <Form.Control
                type="date"
                value={formData.bill.billDate}
                onChange={(e) =>
                  handleChange("billDate", e.target.value)
                }
                placeholder="Bill Date"
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
                    textAlign: "left",
                    flexShrink: 0,
                    marginRight: "8px",
                  }}
                >
                  Ref No.
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.bill.referenceId}
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
                    flexGrow: 1,
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
                  value={formData.bill.manualRefNo}
                  onChange={(e) =>
                    handleChange("manualRefNo", e.target.value)
                  }
                  placeholder="e.g. BILL-CUST-REF"
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
                    textAlign: "left",
                    flexShrink: 0,
                    marginRight: "8px",
                  }}
                >
                  Bill No.
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.bill.billNo || ""}
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
                    flexGrow: 1,
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
                  value={formData.bill.manualBillNo || ""}
                  onChange={(e) =>
                    handleChange("manualBillNo", e.target.value)
                  }
                  placeholder="e.g. INV-CUST-001"
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

            {/* Goods Receipt No (Auto) */}
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label
                  className="mb-0"
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    whiteSpace: "nowrap",
                    textAlign: "left",
                    flexShrink: 0,
                    marginRight: "8px",
                  }}
                >
                  Goods Receipt No
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.bill.goodsReceiptNo || ""}
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
                    flexGrow: 1,
                  }}
                />
              </div>
            </Form.Group>

            {/* Manual Goods Receipt No (Optional) */}
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
                  Manual GR No. (Optional)
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.bill.manualGoodsReceiptNo || ""}
                  onChange={(e) =>
                    handleChange("manualGoodsReceiptNo", e.target.value)
                  }
                  placeholder="e.g. GR-CUST-REF"
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

            {/* Due Date */}
            <Form.Group>
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
                Due Date
              </Form.Label>
              <Form.Control
                type="date"
                value={formData.bill.dueDate}
                onChange={(e) =>
                  handleChange("dueDate", e.target.value)
                }
                placeholder="Due Date"
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

      {/* Vendor Info */}
      <Row className="mb-4 d-flex justify-content-between">
        <Col md={6} className="d-flex flex-column align-items-start">
          <h5>VENDOR</h5>
          <Form.Group className="mb-2 w-100">
            <div style={{ display: "flex", alignItems: "center" }}>
              <Form.Control
                type="text"
                value={formData.bill.vendorName}
                onChange={(e) =>
                  handleChange("vendorName", e.target.value)
                }
                placeholder="Vendor Name"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                  marginRight: "5px",
                }}
              />
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate("/Company/vendorscreditors")}
                title="Add Vendor"
              >
                Add Vendor
              </Button>
            </div>
          </Form.Group>
          <Form.Group className="mb-2 w-100">
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.bill.vendorAddress}
              onChange={(e) =>
                handleChange("vendorAddress", e.target.value)
              }
              placeholder="Vendor Address"
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
              value={formData.bill.vendorEmail}
              onChange={(e) =>
                handleChange("vendorEmail", e.target.value)
              }
              placeholder="Email"
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
              value={formData.bill.vendorPhone}
              onChange={(e) =>
                handleChange("vendorPhone", e.target.value)
              }
              placeholder="Phone"
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
          <h5>SHIP TO</h5>
          <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                value={formData.bill.shipToName || ""}
                onChange={(e) =>
                  handleChange("shipToName", e.target.value)
                }
                placeholder="Name"
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
              <Form.Control
                type="text"
                value={formData.bill.shipToAddress || ""}
                onChange={(e) =>
                  handleChange("shipToAddress", e.target.value)
                }
                placeholder="Address"
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
              <Form.Control
                type="email"
                value={formData.bill.shipToEmail || ""}
                onChange={(e) =>
                  handleChange("shipToEmail", e.target.value)
                }
                placeholder="Email"
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
              <Form.Control
                type="text"
                value={formData.bill.shipToPhone || ""}
                onChange={(e) =>
                  handleChange("shipToPhone", e.target.value)
                }
                placeholder="Phone"
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

      {/* Items Table */}
      <div className="mt-4">{renderItemsTable()}</div>

      {/* Totals - Moved to left side */}
      <Row className="mb-4 mt-2">
        <Col md={4}>
          <Table bordered size="sm" className="dark-bordered-table">
            <tbody>
              <tr>
                <td className="fw-bold">Sub Total:</td>
                <td>
                  $                   {calculateTotalAmount(formData.bill.items).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="fw-bold">Total Due:</td>
                <td className="fw-bold">
                  $                   {calculateTotalAmount(formData.bill.items).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Terms & Conditions */}
      <Form.Group className="mt-4">
        <Form.Label>Terms & Conditions</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={formData.bill.terms}
          onChange={(e) =>
            handleChange("terms", e.target.value)
          }
          placeholder="e.g. Payment within 15 days. Late fees may apply."
          style={{ border: "1px solid #343a40" }}
        />
      </Form.Group>

      {/* Attachment Fields */}
      {renderAttachmentFields()}

      {/* Footer Note */}
      <Row className="text-center mt-5 mb-4 pt-3">
        <Col>
          <Form.Control
            type="text"
            value={formData.bill.footerNote}
            onChange={(e) =>
              handleChange("footerNote", e.target.value)
            }
            className="text-center mb-2 fw-bold"
            placeholder=" Thank you for your business!"
          />
        </Col>
      </Row>
    </Form>
  );
};

export default BillTab;