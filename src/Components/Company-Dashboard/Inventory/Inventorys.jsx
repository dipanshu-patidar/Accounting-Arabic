import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Row, Col, Card, Table, Spinner, Alert } from "react-bootstrap";
import { FaEye, FaEdit, FaTrash, FaPlus, FaInfoCircle, FaSearch, FaFile, FaDownload, FaUpload } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import AddProductModal from "./AddProductModal";
import { BiTransfer } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../Api/axiosInstance";
import GetCompanyId from "../../../Api/GetCompanyId";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import './Inventorys.css';

const InventoryItems = () => {
  // Permission states
  const [userPermissions, setUserPermissions] = useState([]);
  const [canViewInventory, setCanViewInventory] = useState(false);
  const [canCreateInventory, setCanCreateInventory] = useState(false);
  const [canUpdateInventory, setCanUpdateInventory] = useState(false);
  const [canDeleteInventory, setCanDeleteInventory] = useState(false);

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
  const isCleaningUpRef = useRef(false); // Prevent multiple cleanup calls
  const modalKeyRef = useRef({ view: 0 }); // Force modal remount

  const companyId = GetCompanyId();

  // Check permissions
  useEffect(() => {
    // Get user role and permissions
    const role = localStorage.getItem("role");
    
    // Superadmin and Company roles have access to all modules
    if (role === "SUPERADMIN" || role === "COMPANY") {
      setCanViewInventory(true);
      setCanCreateInventory(true);
      setCanUpdateInventory(true);
      setCanDeleteInventory(true);
    } else if (role === "USER") {
      // For USER role, check specific permissions
      try {
        const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
        setUserPermissions(permissions);
        
        // Check if user has permissions for Product_Inventory
        const inventoryPermission = permissions.find(p => p.module_name === "Product_Inventory");
        
        if (inventoryPermission) {
          setCanViewInventory(inventoryPermission.can_view || false);
          setCanCreateInventory(inventoryPermission.can_create || false);
          setCanUpdateInventory(inventoryPermission.can_update || false);
          setCanDeleteInventory(inventoryPermission.can_delete || false);
        } else {
          setCanViewInventory(false);
          setCanCreateInventory(false);
          setCanUpdateInventory(false);
          setCanDeleteInventory(false);
        }
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setCanViewInventory(false);
        setCanCreateInventory(false);
        setCanUpdateInventory(false);
        setCanDeleteInventory(false);
      }
    } else {
      setCanViewInventory(false);
      setCanCreateInventory(false);
      setCanUpdateInventory(false);
      setCanDeleteInventory(false);
    }
  }, []);

  const safeTrim = (value) => {
    return value && typeof value === "string" ? value.trim() : "";
  };

  const fetchProductsByCompanyId = async (companyId) => {
    if (!canViewInventory) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(`products/company/${companyId}`);

      if (response.data?.success && Array.isArray(response.data.data)) {
        const transformedItems = response.data.data.map((product) => {
          // Get primary warehouse (first one in array)
          const primaryWarehouse =
            product.warehouses && product.warehouses.length > 0
              ? product.warehouses[0]
              : null;

          return {
            id: product.id || 0,
            itemName: safeTrim(product.item_name) || "Unnamed Product", // FIXED: Using item_name instead of sku
            hsn: "N/A", // Not available in response
            barcode: "", // Not available in response
            sku: product.sku || "",
            unit: product.unit_detail?.uom_id?.toString() || "Numbers",
            description:
              safeTrim(product.description) || "No description available", // FIXED: Using actual description
            quantity: product.total_stock || 0,
            date:
              new Date(product.created_at).toISOString().split("T")[0] ||
              "2020-01-01",
            cost: 0, // Not available in response
            value: 0, // Not available in response
            minQty: 0, // Not available in response
            taxAccount: "N/A", // Not available in response
            cess: 0,
            purchasePriceExclusive: 0, // Not available in response
            purchasePriceInclusive: 0, // Not available in response
            salePriceExclusive: 0, // Not available in response
            salePriceInclusive: 0, // Not available in response
            discount: 0, // Not available in response
            category: "default",
            itemCategory:
              product.item_category?.item_category_name || "Unknown",
            itemType: "Good",
            subcategory: "default",
            remarks: "", // Not available in response
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
  }, [companyId, canViewInventory]);

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

  // Modal close handlers
  const handleCloseViewModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowView(false);
    modalKeyRef.current.view += 1;
  };

  // Modal exited handlers
  const handleViewModalExited = () => {
    setSelectedItem(null);
    isCleaningUpRef.current = false;
  };

  const handleDeleteItem = async () => {
    if (!canDeleteInventory) {
      toast.error("You don't have permission to delete inventory items");
      return;
    }
    
    if (!selectedItem?.id) {
      toast.error("No item selected for deletion", {
        toastId: "no-item-selected-error",
        autoClose: 3000
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
          autoClose: 3000
        });
      } else {
        const errorMessage =
          response.data?.message ||
          "The server reported a failure to delete product.";
        console.error("Server reported deletion failure:", errorMessage);
        toast.error(`Failed to delete product. ${errorMessage}`, {
          toastId: "product-delete-server-error",
          autoClose: 3000
        });
      }
    } catch (err) {
      console.error("Delete API Error:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete product";
      toast.error(errorMessage, {
        toastId: "product-delete-api-error",
        autoClose: 3000
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadTemplate = () => {
    if (!canCreateInventory) {
      toast.error("You don't have permission to download inventory templates");
      return;
    }
    
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
    if (!canViewInventory) {
      toast.error("You don't have permission to export inventory items");
      return;
    }
    
    const exportData = items.map(({ itemName, quantity, sku, itemCategory, status }) => ({
      "Item Name": itemName,
      "SKU": sku,
      "Category": itemCategory,
      "Quantity": quantity,
      "Status": status
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
      autoClose: 3000
    });
  };

  const handleImportClick = () => {
    if (!canCreateInventory) {
      toast.error("You don't have permission to import inventory items");
      return;
    }
    
    fileInputRef.current?.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        setLoading(true);
        const promises = data.map(async (item) => {
          const newProduct = {
            company_id: companyId,
            item_name: item.itemName,
            sku: item.sku || "",
            description: item.description || "",
            unit_id: item.unit || "Numbers",
            total_stock: item.quantity || 0,
            item_category_id: item.category || 1,
          };
          return axiosInstance.post("products", newProduct);
        });

        await Promise.all(promises);
        refreshProducts(); // Refresh the list after import
        toast.success("Inventory imported successfully!", {
          toastId: "inventory-import-success",
          autoClose: 3000
        });
      } catch (error) {
        console.error("Import Error:", error);
        setError("Failed to import inventory. Please try again.");
        toast.error("Failed to import inventory. Please try again.", {
          toastId: "inventory-import-error",
          autoClose: 3000
        });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleProductClick = (item, e) => {
    if (e && (e.target.closest("button") || e.target.closest(".btn"))) {
      return;
    }
    // Navigate with product ID in URL, not passing item in state
    navigate(`/company/inventorydetails/${item.id}`);
  };

  const handleSendAll = () => {
    toast.success("All items sent successfully!", {
      toastId: "send-all-success",
      autoClose: 3000
    });
  };

  const handleSendItem = (item) => {
    toast.success(`Item "${item.itemName}" sent successfully!`, {
      toastId: "send-item-success",
      autoClose: 3000
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // If user doesn't have view permission, show access denied message
  if (!canViewInventory) {
    return (
      <div className="p-4 inventory-container">
        <Card className="text-center p-5 border-0 shadow-lg">
          <h3 className="text-danger">Access Denied</h3>
          <p>You don't have permission to view Inventory Items.</p>
          <p>Please contact your administrator for access.</p>
        </Card>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="p-4 inventory-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="text-center">
            <Spinner animation="border" style={{ color: "#505ece" }} />
            <p className="mt-3 text-muted">Loading inventory items...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="p-4 inventory-container">
        <Alert variant="warning" className="text-center">
          Company ID not found. Please make sure you are logged in to a company.
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 inventory-container">
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
          theme="colored"
        />

        {/* Header Section */}
        <div className="mb-4">
          <h3 className="inventory-title">
            <i className="fas fa-boxes me-2"></i>
            Inventory Management
          </h3>
          <p className="inventory-subtitle">Manage and track all inventory products and their stock levels</p>
        </div>

        <Row className="g-3 mb-4 align-items-center">
          <Col xs={12} md={6}>
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <Form.Control
                className="search-input"
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </Col>
          <Col xs={12} md={6} className="d-flex justify-content-md-end justify-content-start gap-2 flex-wrap">
            {canCreateInventory && (
              <Button
                className="d-flex align-items-center btn-import"
                onClick={handleImportClick}
              >
                <FaUpload className="me-2" /> Import
              </Button>
            )}

            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              onChange={handleImport}
              style={{ display: "none" }}
            />

            {canViewInventory && (
              <Button
                className="d-flex align-items-center btn-export"
                onClick={handleExport}
              >
                <FaFile className="me-2" /> Export
              </Button>
            )}

            {canCreateInventory && (
              <Button
                className="d-flex align-items-center btn-download"
                onClick={handleDownloadTemplate}
              >
                <FaDownload className="me-2" /> Download
              </Button>
            )}

            {canCreateInventory && (
              <Button
                className="d-flex align-items-center btn-add-product"
                onClick={() => setShowAdd(true)}
              >
                <FaPlus className="me-2" /> Add Product
              </Button>
            )}

            <Button
              className="d-flex align-items-center btn-send-all"
              onClick={handleSendAll}
            >
              Send All
            </Button>

            {selectedItems.length > 0 && (
              <>
                <Button
                  className="d-flex align-items-center btn-send-selected"
                  onClick={() => {
                    const selectedData = items.filter((item) =>
                      selectedItems.includes(item.id)
                    );
                    toast.success(
                      `${selectedData.length} item(s) sent successfully!`,
                      {
                        toastId: "send-selected-success",
                        autoClose: 3000
                      }
                    );
                  }}
                >
                  Send Selected ({selectedItems.length})
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setSelectedItems([])}
                >
                  Clear
                </Button>
              </>
            )}
          </Col>
        </Row>

        {/* Filter Section */}
        <Card className="filter-card">
          <Row className="g-3">
            <Col xs={12} sm={6} md={3}>
              <Form.Label className="fw-semibold mb-2">Category</Form.Label>
              <Form.Select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {uniqueCategories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Label className="fw-semibold mb-2">Warehouse</Form.Label>
              <Form.Select
                className="filter-select"
                value={selectedWarehouse}
                onChange={(e) => {
                  setSelectedWarehouse(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {uniqueWarehouses.map((wh, idx) => (
                  <option key={idx} value={wh}>
                    {wh}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Form.Label className="fw-semibold mb-2">Quantity Range</Form.Label>
              <Form.Select
                className="filter-select"
                value={quantityRange}
                onChange={(e) => {
                  setQuantityRange(e.target.value);
                  setCurrentPage(1);
                }}
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
            <Col xs={12} sm={6} md={3} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setSelectedWarehouse("All");
                  setQuantityRange("All");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table Card */}
        <Card className="inventory-table-card border-0 shadow-lg">
          <Card.Body style={{ padding: 0 }}>
            {error && <Alert variant="danger" className="m-3">{error}</Alert>}
            
            <div style={{ overflowX: "auto" }}>
              <Table responsive className="inventory-table align-middle" style={{ fontSize: 16 }}>
                <thead className="table-header">
                  <tr>
                    <th className="py-3" style={{ width: "50px" }}>
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
                    <th className="py-3">Product</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">SKU</th>
                    <th className="py-3">Quantity</th>
                    <th className="py-3">Warehouse</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.length > 0 ? (
                    paginatedItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                        />
                      </td>
                      <td
                        className="product-name"
                        onClick={(e) => handleProductClick(item, e)}
                        style={{ cursor: "pointer" }}
                      >
                        {item.itemName}
                      </td>
                      <td>
                        <span className="badge bg-info text-dark">{item.itemCategory}</span>
                      </td>
                      <td className="fw-bold">{item.sku || "-"}</td>
                      <td className="fw-bold">{item.quantity || 0}</td>
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
                          className={`badge px-3 py-1 rounded-pill fw-semibold ${
                            item.status === "In Stock"
                              ? "badge-success"
                              : "badge-danger"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="btn-action btn-view"
                            onClick={(e) => {
                              e.stopPropagation();
                              isCleaningUpRef.current = false;
                              modalKeyRef.current.view += 1;
                              setSelectedItem(item);
                              setShowView(true);
                            }}
                            title="Quick View"
                          >
                            <FaEye size={14} />
                          </Button>
                          {canUpdateInventory && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              className="btn-action btn-edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                                setShowEdit(true);
                              }}
                              title="Edit"
                            >
                              <FaEdit size={14} />
                            </Button>
                          )}
                          {canDeleteInventory && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="btn-action btn-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                                setShowDelete(true);
                              }}
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </Button>
                          )}
                          <Button
                            variant="link"
                            className="btn-link-custom"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/company/inventorydetails/${item.id}`);
                            }}
                            title="View Details"
                          >
                            View Details
                          </Button>
                          <Button
                            variant="link"
                            className="btn-link-success"
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
                      <td colSpan="8" className="text-center py-4 text-muted">
                        No items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2 px-3 py-3">
              <span className="small text-muted">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredItems.length)} of{" "}
                {filteredItems.length} entries
              </span>
              <nav>
                <ul className="pagination pagination-sm mb-0 flex-wrap">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-start"
                      onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                    >
                      &laquo;
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li
                      key={index + 1}
                      className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        style={
                          currentPage === index + 1
                            ? { backgroundColor: "#505ece", borderColor: "#505ece", color: "white" }
                            : {}
                        }
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-end"
                      onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </Card.Body>
        </Card>

        {/* View Modal */}
        <Modal
          key={modalKeyRef.current.view}
          show={showView}
          onHide={handleCloseViewModal}
          onExited={handleViewModalExited}
          centered
          size="lg"
          className="inventory-modal"
        >
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>Item Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom">
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
                    <h6 className="fw-bold mb-3">Warehouse Information:</h6>
                    {selectedItem.warehouses &&
                      selectedItem.warehouses.length > 0 ? (
                      <div className="table-responsive">
                        <Table className="table-sm table-hover">
                          <thead style={{ background: "#f8f9fa" }}>
                            <tr>
                              <th className="fw-semibold">Warehouse Name</th>
                              <th className="fw-semibold">Location</th>
                              <th className="fw-semibold">Stock Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedItem.warehouses.map((warehouse, index) => (
                              <tr key={index}>
                                <td className="fw-semibold">{warehouse.name}</td>
                                <td>{warehouse.location || "-"}</td>
                                <td className="fw-bold text-primary">{warehouse.stockQty || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <Alert variant="info" className="mt-2">
                        No warehouse information available
                      </Alert>
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
          <Modal.Footer className="modal-footer-custom">
            <Button variant="secondary" className="btn-modal-cancel" onClick={handleCloseViewModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDelete}
          onHide={() => !isDeleting && setShowDelete(false)}
          centered
          className="inventory-modal"
        >
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom text-center py-4">
            <div className="mx-auto mb-3" style={{ width: 70, height: 70, background: "#FFF5F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaTrash size={32} color="#F04438" />
            </div>
            <h4 className="fw-bold mb-2">Delete Item</h4>
            <p className="text-muted mb-3">Are you sure you want to delete this item? This action cannot be undone.</p>
            {selectedItem && (
              <div className="mt-3">
                <strong className="text-primary">{selectedItem.itemName}</strong>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button
              variant="secondary"
              className="btn-modal-cancel"
              onClick={() => setShowDelete(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              className="btn-modal-delete"
              onClick={handleDeleteItem}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      {/* AddProductModal */}
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

    </>
  );
};

export default InventoryItems;