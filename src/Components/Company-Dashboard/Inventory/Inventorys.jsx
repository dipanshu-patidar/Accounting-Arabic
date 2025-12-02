import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Card } from "react-bootstrap";
import { FaEye, FaEdit, FaTrash, FaPlus, FaInfoCircle } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import AddProductModal from "./AddProductModal";
import { BiTransfer } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../Api/axiosInstance";
import GetCompanyId from "../../../Api/GetCompanyId";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InventoryItems = () => {
  const navigate = useNavigate();
  const [quantityRange, setQuantityRange] = useState("All");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [showDelete, setShowDelete] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const fileInputRef = React.useRef(null);

  const companyId = GetCompanyId();

  const safeTrim = (value) => {
    return value && typeof value === "string" ? value.trim() : "";
  };

  const fetchProductsByCompanyId = async (companyId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`products/company/${companyId}`);

      if (response.data?.success && Array.isArray(response.data.data)) {
        const transformedItems = response.data.data.map((product) => {
          // Get the primary warehouse (first one in the array)
          const primaryWarehouse =
            product.warehouses && product.warehouses.length > 0
              ? product.warehouses[0]
              : null;

          return {
            id: product.id || 0,
            itemName: safeTrim(product.item_name) || "Unnamed Product", // FIXED: Using item_name instead of sku
            hsn: "N/A", // Not available in the response
            barcode: "", // Not available in the response
            sku: product.sku || "",
            unit: product.unit_detail?.uom_id?.toString() || "Numbers",
            description:
              safeTrim(product.description) || "No description available", // FIXED: Using actual description
            quantity: product.total_stock || 0,
            date:
              new Date(product.created_at).toISOString().split("T")[0] ||
              "2020-01-01",
            cost: 0, // Not available in the response
            value: 0, // Not available in the response
            minQty: 0, // Not available in the response
            taxAccount: "N/A", // Not available in the response
            cess: 0,
            purchasePriceExclusive: 0, // Not available in the response
            purchasePriceInclusive: 0, // Not available in the response
            salePriceExclusive: 0, // Not available in the response
            salePriceInclusive: 0, // Not available in the response
            discount: 0, // Not available in the response
            category: "default",
            itemCategory:
              product.item_category?.item_category_name || "Unknown",
            itemType: "Good",
            subcategory: "default",
            remarks: "", // Not available in the response
            image: product.image || null, // FIXED: Using actual image
            status:
              (product.total_stock || 0) > 0 ? "In Stock" : "Out of Stock",
            warehouse: primaryWarehouse?.warehouse_name || "Unknown",
            warehouseId: primaryWarehouse?.warehouse_id?.toString() || "",
            itemCategoryId: product.item_category?.id?.toString() || "",
            // Store all warehouses for detailed view
            warehouses:
              product.warehouses?.map((w) => ({
                id: w.warehouse_id,
                name: w.warehouse_name,
                location: w.location,
                stockQty: w.stock_qty,
              })) || [],
          };
        });

        setItems(transformedItems);
      } else {
        setError(response.data?.message || "Failed to fetch products");
      }
    } catch (err) {
      setError("Error fetching products: " + err.message);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Unified refresh function
  const refreshProducts = () => {
    if (companyId) {
      fetchProductsByCompanyId(companyId);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchProductsByCompanyId(companyId);
    }
  }, [companyId]);

  // Extract unique warehouses from all items
  const getAllWarehouses = () => {
    const warehouseSet = new Set();
    items.forEach((item) => {
      if (item.warehouses) {
        item.warehouses.forEach((w) => {
          warehouseSet.add(w.name);
        });
      }
    });
    return ["All", ...Array.from(warehouseSet)];
  };

  const uniqueCategories = [
    "All",
    ...new Set(items.map((item) => item.itemCategory)),
  ];
  const uniqueWarehouses = getAllWarehouses();

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.itemName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.itemCategory === selectedCategory;
    const matchesWarehouse =
      selectedWarehouse === "All" ||
      item.warehouses?.some((w) => w.name === selectedWarehouse);

    let matchesQuantity = true;
    const qty = item.quantity;
    switch (quantityRange) {
      case "Negative":
        matchesQuantity = qty < 0;
        break;
      case "0-10":
        matchesQuantity = qty >= 0 && qty <= 10;
        break;
      case "10-50":
        matchesQuantity = qty > 10 && qty <= 50;
        break;
      case "50-100":
        matchesQuantity = qty > 50 && qty <= 100;
        break;
      case "100+":
        matchesQuantity = qty > 100;
        break;
      case "Low Quantity":
        matchesQuantity = qty <= item.minQty;
        break;
      default:
        matchesQuantity = true;
    }

    return (
      matchesSearch && matchesCategory && matchesWarehouse && matchesQuantity
    );
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredItems.map((item) => item.id);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };


  const handleDeleteItem = async () => {
    if (!selectedItem?.id) {
      toast.error("No item selected for deletion", {
        toastId: "no-item-selected-error",
        autoClose: 3000,
      });
      setShowDelete(false);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(
        `products/${selectedItem.id}`
      );

      console.log("Delete API Response:", response.data);

      if (response.data?.success) {
        setItems((prevItems) =>
          prevItems.filter((item) => item.id !== selectedItem.id)
        );
        refreshProducts();
        setShowDelete(false);
        toast.success("Product deleted successfully!", {
          toastId: "product-delete-success",
          autoClose: 3000,
        });
      } else {
        const errorMessage =
          response.data?.message ||
          "The server reported a failure to delete the product.";
        console.error("Server reported deletion failure:", errorMessage);
        toast.error(`Failed to delete product. ${errorMessage}`, {
          toastId: "product-delete-server-error",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Delete API Error:", error);

      let errorMessage = "An unknown error occurred.";
      if (error.response) {
        console.error("Error Data:", error.response.data);
        console.error("Error Status:", error.response.status);
        errorMessage =
          error.response.data?.message ||
          `Server error with status ${error.response.status}.`;
      } else if (error.request) {
        console.error("Error Request:", error.request);
        errorMessage =
          "No response received from server. Check your network connection.";
      } else {
        errorMessage = error.message;
      }

      toast.error(`Error deleting product: ${errorMessage}`, {
        toastId: "product-delete-api-error",
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      [
        "itemName",
        "hsn",
        "barcode",
        "unit",
        "description",
        "quantity",
        "date",
        "cost",
        "value",
        "minQty",
        "taxAccount",
        "cess",
        "purchasePriceExclusive",
        "purchasePriceInclusive",
        "salePriceExclusive",
        "salePriceInclusive",
        "discount",
        "category",
        "subcategory",
        "remarks",
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "InventoryTemplate");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "Inventory_Template.xlsx"
    );
  };

  const handleExport = () => {
    const exportData = items.map((item) => ({
      itemName: item.itemName,
      hsn: item.hsn,
      barcode: item.barcode,
      description: item.description,
      quantity: item.quantity,
      cost: item.cost,
      value: item.value,
      minQty: item.minQty,
      taxAccount: item.taxAccount,
      discount: item.discount,
      remarks: item.remarks,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "InventoryExport");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "Inventory_Export.xlsx"
    );
    toast.success("Inventory exported successfully!", {
      toastId: "inventory-export-success",
      autoClose: 3000,
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet);
      const newId =
        items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
      const itemsWithIds = data.map((item, index) => ({
        ...item,
        id: newId + index,
      }));
      setItems((prev) => [...prev, ...itemsWithIds]);
      toast.success("Inventory imported successfully!", {
        toastId: "inventory-import-success",
        autoClose: 3000,
      });
    };
    reader.readAsBinaryString(file);
  };

  const handleProductClick = (item, e) => {
    if (e && (e.target.closest("button") || e.target.closest(".btn"))) {
      return;
    }
    // Navigate with the product ID in the URL, not passing the item in state
    navigate(`/company/inventorydetails/${item.id}`);
  };

  const handleSendAll = () => {
    toast.success("All items sent successfully!", {
      toastId: "send-all-success",
      autoClose: 3000,
    });
  };

  const handleSendItem = (item) => {
    toast.success(`Item "${item.itemName}" sent successfully!`, {
      toastId: "send-item-success",
      autoClose: 3000,
    });
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="alert alert-warning" role="alert">
        Company ID not found. Please make sure you are logged in to a company.
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 p-2">
        <Row className="align-items-center mb-3">
          <Col md={4}>
            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <BiTransfer size={40} color="green" />
              <span>Inventory Product</span>
            </h4>
          </Col>
          <Col
            md={8}
            className="text-md-end d-flex flex-wrap gap-2 justify-content-md-end"
          >
            <Button
              style={{
                backgroundColor: "#00c78c",
                border: "none",
                color: "#fff",
                padding: "6px 16px",
              }}
              onClick={handleImportClick}
            >
              Import
            </Button>
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleImport}
              style={{ display: "none" }}
            />
            <Button
              style={{
                backgroundColor: "#ff7e00",
                border: "none",
                color: "#fff",
                padding: "6px 16px",
              }}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              style={{
                backgroundColor: "#f6c100",
                border: "none",
                color: "#000",
                padding: "6px 16px",
              }}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
            <Button
              onClick={() => setShowAdd(true)}
              style={{
                backgroundColor: "#27b2b6",
                border: "none",
                color: "#fff",
                padding: "6px 16px",
              }}
            >
              Add Product
            </Button>
            <Button
              style={{
                backgroundColor: "#17a2b8",
                border: "none",
                color: "#fff",
                padding: "6px 16px",
                marginLeft: "8px",
              }}
              onClick={handleSendAll}
            >
              Send All
            </Button>
            {selectedItems.length > 0 && (
              <Button
                style={{
                  backgroundColor: "#28a745",
                  border: "none",
                  color: "#fff",
                }}
                onClick={() => {
                  const selectedData = items.filter((item) =>
                    selectedItems.includes(item.id)
                  );
                  toast.success(
                    `${selectedData.length} item(s) sent successfully!`,
                    {
                      toastId: "send-selected-success",
                      autoClose: 3000,
                    }
                  );
                }}
              >
                Send Selected ({selectedItems.length})
              </Button>
            )}
            {selectedItems.length > 0 && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setSelectedItems([])}
                className="ms-2"
              >
                Clear
              </Button>
            )}

            <AddProductModal
              showAdd={showAdd}
              showEdit={showEdit}
              setShowAdd={setShowAdd} 
              setShowEdit={setShowEdit}
              selectedItem={selectedItem}
              companyId={companyId}
              showAddCategoryModal={showAddCategoryModal}
              setShowAddCategoryModal={setShowAddCategoryModal}
              newCategory={newCategory}
              setNewCategory={setNewCategory}
              onSuccess={refreshProducts}
            />
          </Col>
        </Row>

        <Row className="mb-3 px-3 py-2 align-items-center g-2">
          <Col xs={12} sm={3}>
            <Form.Control
              type="text"
              placeholder="Search item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-pill"
            />
          </Col>
        </Row>

        <Row className="mb-3 px-3 py-2 align-items-center g-2">
          <Col xs={12} sm={3}>
            <Form.Select
              className="rounded-pill"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {uniqueCategories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={12} sm={3}>
            <Form.Select
              className="rounded-pill"
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            >
              {uniqueWarehouses.map((wh, idx) => (
                <option key={idx} value={wh}>
                  {wh}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={12} sm={3}>
            <Form.Select
              className="rounded-pill"
              value={quantityRange}
              onChange={(e) => setQuantityRange(e.target.value)}
            >
              <option value="All">All Quantities</option>
              <option value="Negative">Negative Quantity</option>
              <option value="Low Quantity">Low Quantity</option>
              <option value="0-10">0 - 10</option>
              <option value="10-50">10 - 50</option>
              <option value="50-100">50 - 100</option>
              <option value="100+">100+</option>
            </Form.Select>
          </Col>
        </Row>

        <div className="card bg-white rounded-3 p-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="">
                <tr>
                  <th>
                    <Form.Check
                      type="checkbox"
                      checked={
                        selectedItems.length === filteredItems.length &&
                        filteredItems.length > 0
                      }
                      onChange={handleSelectAll}
                      disabled={filteredItems.length === 0}
                    />
                  </th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Warehouse</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                        />
                      </td>
                      <td
                        style={{
                          color: "#007bff",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                        className="product-cell"
                        onClick={(e) => handleProductClick(item, e)}
                      >
                        <span className="product-name">{item.itemName}</span>
                      </td>
                      <td>{item.itemCategory}</td>
                      <td>{item.sku}</td>
                      <td>{item.quantity}</td>
                      <td>
                        {item.warehouses && item.warehouses.length > 0 ? (
                          <div>
                            {item.warehouses[0].name}
                            {item.warehouses.length > 1 && (
                              <span className="text-muted ms-1">
                                (+{item.warehouses.length - 1} more)
                              </span>
                            )}
                          </div>
                        ) : (
                          "Unknown"
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge px-3 py-1 rounded-pill fw-semibold ${item.status === "In Stock"
                              ? "bg-success text-white"
                              : "bg-danger text-white"
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="link"
                            className="text-info p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                              setShowView(true);
                            }}
                            title="Quick View"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="link"
                            className="text-warning p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                              setShowEdit(true);
                            }}
                            title="Edit"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="link"
                            className="text-danger p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                              setShowDelete(true);
                            }}
                            title="Delete"
                          >
                            <FaTrash />
                          </Button>
                          <Button
                            variant="link"
                            className="text-primary p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navigate with the product ID in the URL, not passing the item in state
                              navigate(`/company/inventorydetails/${item.id}`);
                            }}
                            title="View Details"
                          >
                            view details
                          </Button>
                          <Button
                            variant="link"
                            className="text-success p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendItem(item);
                            }}
                            title="Send Item"
                          >
                            Send
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
            <small className="text-muted ms-2">
              Showing 1 to {filteredItems.length} of {filteredItems.length}{" "}
              results
            </small>
            <nav>
              <ul className="pagination mb-0">
                <li className="page-item disabled">
                  <button className="page-link">&laquo;</button>
                </li>
                <li className="page-item active">
                  <button className="page-link">1</button>
                </li>
                <li className="page-item">
                  <button className="page-link">2</button>
                </li>
                <li className="page-item">
                  <button className="page-link">&raquo;</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* View Modal */}
        <Modal
          show={showView}
          onHide={() => setShowView(false)}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Item Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedItem && (
              <>
                <Row className="mb-3">
                  <Col md={6}>
                    <strong>Item Name:</strong> {selectedItem.itemName}
                  </Col>
                  <Col md={6}>
                    <strong>SKU:</strong> {selectedItem.sku}
                  </Col>
                  <Col md={6}>
                    <strong>Category:</strong> {selectedItem.itemCategory}
                  </Col>
                  <Col md={6}>
                    <strong>Unit:</strong> {selectedItem.unit}
                  </Col>
                  <Col md={6}>
                    <strong>Total Stock:</strong> {selectedItem.quantity}
                  </Col>
                  <Col md={6}>
                    <strong>Description:</strong> {selectedItem.description}
                  </Col>
                </Row>

                {/* Warehouse Information */}
                <Row className="mb-3">
                  <Col md={12}>
                    <strong>Warehouse Information:</strong>
                    {selectedItem.warehouses &&
                      selectedItem.warehouses.length > 0 ? (
                      <table className="table table-sm mt-2">
                        <thead>
                          <tr>
                            <th>Warehouse Name</th>
                            <th>Location</th>
                            <th>Stock Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedItem.warehouses.map((warehouse, index) => (
                            <tr key={index}>
                              <td>{warehouse.name}</td>
                              <td>{warehouse.location}</td>
                              <td>{warehouse.stockQty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-muted mt-2">
                        No warehouse information available
                      </p>
                    )}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <strong>Status:</strong> {selectedItem.status}
                  </Col>
                  <Col md={6}>
                    <strong>Created At:</strong> {selectedItem.date}
                  </Col>
                </Row>

                {/* Image Display */}
                {selectedItem.image && (
                  <Row className="mb-3">
                    <Col md={12}>
                      <strong>Image:</strong>
                      <div className="mt-2">
                        <img
                          src={selectedItem.image}
                          alt={selectedItem.itemName}
                          style={{
                            maxWidth: "200px",
                            maxHeight: "200px",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </Col>
                  </Row>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowView(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDelete}
          onHide={() => !isDeleting && setShowDelete(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this item? This action cannot be
            undone.
            {selectedItem && (
              <div className="mt-2">
                <strong>{selectedItem.itemName}</strong>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDelete(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteItem}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Page Description */}
        <Card className="mb-4 p-3 shadow rounded-4 mt-2">
          <Card.Body>
            <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">
              Page Info
            </h5>
            <ul
              className="text-muted fs-6 mb-0"
              style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}
            >
              <li>
                An Inventory Product Management Interface displaying product
                details, status, and actions.
              </li>
              <li>Options to import/export data.</li>
              <li>Ability to manage and maintain records.</li>
            </ul>
          </Card.Body>
        </Card>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
      />
    </>
  );
};

export default InventoryItems;
