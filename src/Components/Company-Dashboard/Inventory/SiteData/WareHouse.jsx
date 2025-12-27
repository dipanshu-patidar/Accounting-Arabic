import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Modal,
  Button,
  Form,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaArrowRight, FaBoxes, FaEdit, FaTrash, FaSearch, FaFile, FaDownload, FaUpload } from "react-icons/fa";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { BiTransfer } from "react-icons/bi";
import GetCompanyId from "../../../../Api/GetCompanyId";
import AddProductModal from "../AddProductModal";
import axiosInstance from "../../../../Api/axiosInstance";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './WareHouse.css';

const WareHouse = () => {
  // Permission states
  const [userPermissions, setUserPermissions] = useState([]);
  const [canViewWarehouses, setCanViewWarehouses] = useState(false);
  const [canCreateWarehouses, setCanCreateWarehouses] = useState(false);
  const [canUpdateWarehouses, setCanUpdateWarehouses] = useState(false);
  const [canDeleteWarehouses, setCanDeleteWarehouses] = useState(false);

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [warehouseName, setWarehouseName] = useState("");
  const [location, setLocation] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("");
  // FIX: Use a consistent 'id' state for editing
  const [editId, setEditId] = useState(null); 
  const [filterLocation, setFilterLocation] = useState("");
  const navigate = useNavigate();
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const companyId = GetCompanyId();
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Modal cleanup refs
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef(0);

  // Check permissions
  useEffect(() => {
    // Get user role and permissions
    const role = localStorage.getItem("role");
    
    // Superadmin and Company roles have access to all modules
    if (role === "SUPERADMIN" || role === "COMPANY") {
      setCanViewWarehouses(true);
      setCanCreateWarehouses(true);
      setCanUpdateWarehouses(true);
      setCanDeleteWarehouses(true);
    } else if (role === "USER") {
      // For USER role, check specific permissions
      try {
        const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
        setUserPermissions(permissions);
        
        // Check if user has permissions for Warehouse
        const warehousePermission = permissions.find(p => p.module_name === "Warehouse");
        
        if (warehousePermission) {
          setCanViewWarehouses(warehousePermission.can_view || false);
          setCanCreateWarehouses(warehousePermission.can_create || false);
          setCanUpdateWarehouses(warehousePermission.can_update || false);
          setCanDeleteWarehouses(warehousePermission.can_delete || false);
        } else {
          setCanViewWarehouses(false);
          setCanCreateWarehouses(false);
          setCanUpdateWarehouses(false);
          setCanDeleteWarehouses(false);
        }
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setCanViewWarehouses(false);
        setCanCreateWarehouses(false);
        setCanUpdateWarehouses(false);
        setCanDeleteWarehouses(false);
      }
    } else {
      setCanViewWarehouses(false);
      setCanCreateWarehouses(false);
      setCanUpdateWarehouses(false);
      setCanDeleteWarehouses(false);
    }
  }, []);

  // --- Reusable fetch function ---
  const fetchWarehouses = async () => {
    if (!companyId) {
      setLoading(false);
      setError("Company ID not found.");
      return;
    }

    if (!canViewWarehouses) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(
        `/warehouses/company/${companyId}`
      );

      let warehouseData = [];
      if (Array.isArray(response.data)) {
        warehouseData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        warehouseData = response.data.data;
      } else {
        throw new Error("Invalid API response format");
      }

      // FIX: Use correct 'id' from API response and be consistent
      const filteredAndMapped = warehouseData
        .filter((w) => w.company_id == companyId)
        .map((w) => ({
          // Use 'id' from API response as primary key
          id: w.id, 
          name: w.warehouse_name || w.name,
          location: w.location,
          address_line1: w.address_line1,
          address_line2: w.address_line2,
          city: w.city,
          state: w.state,
          pincode: w.pincode,
          country: w.country,
          totalStocks: w.totalStocks || 0,
        }));

      setWarehouses(filteredAndMapped);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      setError("Failed to load warehouses. Please try again.");
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [companyId, canViewWarehouses]);

  // Helper function to reset form
  const resetForm = () => {
    setWarehouseName("");
    setLocation("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("");
    setPincode("");
    setCountry("");
    setEditId(null);
    setModalError(null);
  };

  // Close handler for modal
  const handleCloseModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowModal(false);
    modalKeyRef.current += 1;
  };

  // Handle modal exit - cleanup after animation
  const handleModalExited = () => {
    resetForm();
    isCleaningUpRef.current = false;
  };

  const handleModalClose = () => {
    handleCloseModal();
  };

  // FIX: Ensure correct 'id' is used when opening edit modal
  const handleModalShow = (data = null) => {
    if (data && !canUpdateWarehouses) {
      toast.error("You don't have permission to edit warehouses");
      return;
    }
    
    if (!data && !canCreateWarehouses) {
      toast.error("You don't have permission to create warehouses");
      return;
    }
    
    // Reset cleanup flag before opening
    isCleaningUpRef.current = false;
    modalKeyRef.current += 1;
    
    if (data) {
      // Use correct 'id' from data object
      setEditId(data.id); 
      setWarehouseName(data.name);
      setLocation(data.location);
      setAddressLine1(data.address_line1 || "");
      setAddressLine2(data.address_line2 || "");
      setCity(data.city || "");
      setState(data.state || "");
      setPincode(data.pincode || "");
      setCountry(data.country || "");
    } else {
      setEditId(null);
      setWarehouseName("");
      setLocation("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPincode("");
      setCountry("");
    }
    setShowModal(true);
  };

  // Updated handleFormSubmit with full address fields
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (editId && !canUpdateWarehouses) {
      toast.error("You don't have permission to update warehouses");
      return;
    }
    
    if (!editId && !canCreateWarehouses) {
      toast.error("You don't have permission to create warehouses");
      return;
    }
    
    setSaving(true);
    setModalError(null);

    try {
      const payload = {
        company_id: companyId,
        warehouse_name: warehouseName,
        location: location,
        address_line1: addressLine1 || null,
        address_line2: addressLine2 || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        country: country || null,
      };

      console.log("Submitting payload:", payload);

      let response;
      if (editId) {
        // FIX: The API call now correctly uses numeric 'id'
        response = await axiosInstance.patch(`/warehouses/${editId}`, payload);
      } else {
        response = await axiosInstance.post("/warehouses", payload);
      }

      console.log("API Response:", response.data);

      if (response.data) {
        await fetchWarehouses();
        isCleaningUpRef.current = false; // Reset flag before closing
        setShowModal(false);
        modalKeyRef.current += 1;
        resetForm();
        
        // Show success toast
        if (editId) {
          toast.success('Warehouse updated successfully', {
            toastId: 'warehouse-update-success',
            autoClose: 3000
          });
        } else {
          toast.success('Warehouse created successfully', {
            toastId: 'warehouse-create-success',
            autoClose: 3000
          });
        }
      } else {
        throw new Error(response.data?.message || "Failed to save warehouse");
      }
    } catch (err) {
      console.error("API Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        (editId
          ? "Failed to update warehouse."
          : "Failed to create warehouse.");
      setModalError(errorMessage);
      
      // Show error toast
      toast.error(errorMessage, {
        toastId: editId ? 'warehouse-update-error' : 'warehouse-create-error',
        autoClose: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  // FIX: Use correct 'id' for deleting
  const handleDelete = async (id) => {
    if (!canDeleteWarehouses) {
      toast.error("You don't have permission to delete warehouses");
      return;
    }
    
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this warehouse?"
    );
    if (!confirmDelete) return;

    try {
      // The API call now correctly uses numeric 'id'
      await axiosInstance.delete(`/warehouses/${id}`);
      await fetchWarehouses();
      
      // Show success toast
      toast.success('Warehouse deleted successfully', {
        toastId: 'warehouse-delete-success',
        autoClose: 3000
      });
    } catch (err) {
      console.error("Delete Error:", err);
      setError("Failed to delete warehouse. Please try again.");
      
      // Show error toast
      const errorMessage = err.response?.data?.message || "Failed to delete warehouse";
      toast.error(errorMessage, {
        toastId: 'warehouse-delete-error',
        autoClose: 3000
      });
    }
  };

  // --- Pagination & Import/Export ---

  const handleImport = (e) => {
    if (!canCreateWarehouses) {
      toast.error("You don't have permission to import warehouses");
      return;
    }
    
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const formatted = data.map((item, index) => ({
        id: Date.now().toString() + index, // Use a temporary id for import
        name: item["Warehouse Name"] || "",
        location: item["Location"] || "",
        totalStocks: 0,
      }));
      setWarehouses(formatted);
      
      // Show success toast
      toast.success('Warehouses imported successfully', {
        toastId: 'warehouse-import-success',
        autoClose: 3000
      });
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    if (!canViewWarehouses) {
      toast.error("You don't have permission to export warehouses");
      return;
    }
    
    const exportData = warehouses.map(({ name, location }) => ({
      "Warehouse Name": name,
      Location: location,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Warehouses");
    XLSX.writeFile(wb, "warehouse-data.xlsx");
    
    // Show success toast
    toast.success('Warehouses exported successfully', {
      toastId: 'warehouse-export-success',
      autoClose: 3000
    });
  };

  const handleDownloadTemplate = () => {
    if (!canCreateWarehouses) {
      toast.error("You don't have permission to download warehouse templates");
      return;
    }
    
    const template = [{ "Warehouse Name": "", Location: "" }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "warehouse-template.xlsx");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // --- Add/Edit Item States (unchanged) ---
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: "",
    hsn: "",
    barcode: "",
    unit: "Numbers",
    description: "",
    quantity: 0,
    date: "2020-04-01",
    cost: 0,
    value: 0,
    minQty: 50,
    taxAccount: "",
    cess: 0,
    purchasePriceExclusive: 0,
    purchasePriceInclusive: 0,
    salePriceExclusive: 0,
    salePriceInclusive: 0,
    discount: 0,
    category: "default",
    subcategory: "default",
    remarks: "",
    image: null,
    status: "In Stock",
    itemType: "Good",
    itemCategory: "",
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setNewItem({ ...newItem, image: files[0] });
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
  };

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([
    "Electronics",
    "Furniture",
    "Apparel",
    "Food",
    "Books",
    "Automotive",
    "Medical",
    "Software",
    "Stationery",
    "Other",
  ]);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      setNewItem((prev) => ({ ...prev, itemCategory: trimmed }));
    }
    setNewCategory("");
    setShowAddCategoryModal(false);
  };

  const [items, setItems] = useState([
    {
      itemName: "Sample Item",
      hsn: "1234",
      barcode: "ABC123",
      unit: "Numbers",
      description: "Sample inventory item description.",
      quantity: 10,
      date: "2020-04-01",
      cost: 100,
      value: 1000,
      minQty: 5,
      taxAccount: "5% GST",
      cess: 0,
      purchasePriceExclusive: 90,
      purchasePriceInclusive: 95,
      salePriceExclusive: 110,
      salePriceInclusive: 115,
      discount: 5,
      category: "default",
      itemCategory: "Furniture",
      itemType: "Good",
      subcategory: "default",
      remarks: "Internal only",
      image: null,
      status: "In Stock",
      warehouse: "Main Warehouse",
    },
    {
      itemName: "Out of Stock Item",
      hsn: "5678",
      barcode: "XYZ567",
      unit: "Kg",
      description: "This item is currently out of stock.",
      quantity: 0,
      date: "2024-12-01",
      cost: 200,
      value: 0,
      minQty: 10,
      taxAccount: "12% GST",
      cess: 0,
      purchasePriceExclusive: 180,
      purchasePriceInclusive: 200,
      salePriceExclusive: 220,
      salePriceInclusive: 250,
      discount: 0,
      category: "Electronics",
      subcategory: "Accessories",
      remarks: "Awaiting new shipment",
      image: null,
      status: "Out of Stock",
      warehouse: "Backup Warehouse",
      itemCategory: "Electronics",
      itemType: "Service",
    },
  ]);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleAddItem = () => {
    setItems([...items, newItem]);
    setShowAdd(false);
  };

  const handleUpdateItem = () => {
    const updated = items.map((i) => (i === selectedItem ? { ...newItem } : i));
    setItems(updated);
    setShowEdit(false);
  };

  const handleAddStockModal = (warehouse) => {
    if (!canCreateWarehouses) {
      toast.error("You don't have permission to add stock to warehouses");
      return;
    }
    
    setSelectedWarehouse(warehouse);
    setShowAdd(true);
  };

  // If user doesn't have view permission, show access denied message
  if (!canViewWarehouses) {
    return (
      <div className="p-4 warehouse-container">
        <Card className="text-center p-5 border-0 shadow-lg">
          <h3 className="text-danger">Access Denied</h3>
          <p>You don't have permission to view Warehouses.</p>
          <p>Please contact your administrator for access.</p>
        </Card>
      </div>
    );
  }

  // Filter warehouses based on location filter
  const filteredWarehouses = warehouses.filter(warehouse => 
    !filterLocation || 
    warehouse.location?.toLowerCase().includes(filterLocation.toLowerCase()) ||
    warehouse.name?.toLowerCase().includes(filterLocation.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWarehouses.length / itemsPerPage);
  const currentItems = filteredWarehouses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="p-4 warehouse-container">
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
          <h3 className="warehouse-title">
            <i className="fas fa-warehouse me-2"></i>
            Warehouse Management
          </h3>
          <p className="warehouse-subtitle">Manage and track all warehouses and their inventory</p>
        </div>

        <Row className="g-3 mb-4 align-items-center">
          <Col xs={12} md={6}>
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <Form.Control
                className="search-input"
                type="text"
                placeholder="Search by warehouse name or location..."
                value={filterLocation}
                onChange={(e) => {
                  setFilterLocation(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </Col>
          <Col xs={12} md={6} className="d-flex justify-content-md-end justify-content-start gap-2 flex-wrap">
            {canCreateWarehouses && (
              <Button
                className="d-flex align-items-center btn-import"
                onClick={() => document.getElementById("excelImport").click()}
              >
                <FaUpload className="me-2" /> Import
              </Button>
            )}

            <input
              type="file"
              id="excelImport"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              onChange={handleImport}
            />

            {canViewWarehouses && (
              <Button
                className="d-flex align-items-center btn-export"
                onClick={handleExport}
              >
                <FaFile className="me-2" /> Export
              </Button>
            )}

            {canCreateWarehouses && (
              <Button
                className="d-flex align-items-center btn-download"
                onClick={handleDownloadTemplate}
              >
                <FaDownload className="me-2" /> Download
              </Button>
            )}

            {canCreateWarehouses && (
              <Button
                className="d-flex align-items-center btn-add-warehouse"
                onClick={() => handleModalShow()}
                disabled={loading}
              >
                <i className="fa fa-plus me-2"></i> Create Warehouse
              </Button>
            )}
          </Col>
        </Row>

        {/* Table Card */}
        <Card className="warehouse-table-card border-0 shadow-lg">
          <Card.Body style={{ padding: 0 }}>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: "#505ece" }} />
                <p className="mt-2 text-muted">Loading warehouses...</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="m-3">{error}</Alert>
            ) : filteredWarehouses.length === 0 ? (
              <Alert variant="info" className="m-3">
                {warehouses.length === 0 
                  ? "No warehouses found for this company." 
                  : "No warehouses match the current filter."}
              </Alert>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <Table responsive className="warehouse-table align-middle" style={{ fontSize: 16 }}>
                    <thead className="table-header">
                      <tr>
                        <th className="py-3">#</th>
                        <th className="py-3">Warehouse Name</th>
                        <th className="py-3">Total Stocks</th>
                        <th className="py-3">Location</th>
                        <th className="py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((w, index) => (
                        <tr key={w.id}>
                          <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                          <td
                            className="text-primary fw-bold"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              localStorage.setItem("warehouseName", w.name);
                              localStorage.setItem("warehouseid", w.id);
                              navigate(`/company/warehouse/${w.id}`);
                            }}
                          >
                            <u>{w.name}</u>
                          </td>
                          <td className="fw-bold">{w.totalStocks || 0}</td>
                          <td>{w.location || "-"}</td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              {canUpdateWarehouses && (
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  className="btn-action btn-edit"
                                  onClick={() => handleModalShow(w)}
                                  title="Edit"
                                  disabled={loading}
                                >
                                  <FaEdit size={14} />
                                </Button>
                              )}
                              {canDeleteWarehouses && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="btn-action btn-delete"
                                  onClick={() => handleDelete(w.id)}
                                  title="Delete"
                                  disabled={loading}
                                >
                                  <FaTrash size={14} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2 px-3 py-3">
                  <span className="small text-muted">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredWarehouses.length)} of{" "}
                    {filteredWarehouses.length} entries
                  </span>
                  <nav>
                    <ul className="pagination pagination-sm mb-0 flex-wrap">
                      <li
                        className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link rounded-start"
                          onClick={() =>
                            currentPage > 1 && setCurrentPage(currentPage - 1)
                          }
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
                                ? {
                                    backgroundColor: "#505ece",
                                    borderColor: "#505ece",
                                    color: "white"
                                  }
                                : {}
                            }
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li
                        className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link rounded-end"
                          onClick={() =>
                            currentPage < totalPages &&
                            setCurrentPage(currentPage + 1)
                          }
                        >
                          &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </>
            )}
          </Card.Body>
        </Card>

        {/* Add/Edit Warehouse Modal with Full Address Fields */}
        <Modal 
          key={modalKeyRef.current}
          show={showModal} 
          onHide={handleCloseModal}
          onExited={handleModalExited}
          size="lg"
          centered
          className="warehouse-modal"
        >
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>
              {editId ? "Edit Warehouse" : "Create Warehouse"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom">
            {modalError && (
              <Alert
                variant="danger"
                onClose={() => setModalError(null)}
                dismissible
              >
                {modalError}
              </Alert>
            )}
            <Form onSubmit={handleFormSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">Warehouse Name *</Form.Label>
                    <Form.Control
                      type="text"
                      className="form-control-custom"
                      value={warehouseName}
                      onChange={(e) => setWarehouseName(e.target.value)}
                      required
                      placeholder="Enter warehouse name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">Location *</Form.Label>
                    <Form.Control
                      type="text"
                      className="form-control-custom"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      placeholder="Enter location"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Address Line 1</Form.Label>
                <Form.Control
                  type="text"
                  className="form-control-custom"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Street address, P.O. box, company name, etc."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Address Line 2</Form.Label>
                <Form.Control
                  type="text"
                  className="form-control-custom"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">City</Form.Label>
                    <Form.Control
                      type="text"
                      className="form-control-custom"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">State / Province</Form.Label>
                    <Form.Control
                      type="text"
                      className="form-control-custom"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      className="form-control-custom"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Pincode"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Country</Form.Label>
                <Form.Control
                  type="text"
                  className="form-control-custom"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                />
              </Form.Group>

              <Modal.Footer className="modal-footer-custom">
                <Button variant="secondary" className="btn-modal-cancel" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-modal-save"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      {editId ? "Updating..." : "Creating..."}
                    </>
                  ) : editId ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Body>
        </Modal>

        {/* AddProductModal */}
        <AddProductModal
          showAdd={showAdd}
          showEdit={showEdit}
          newItem={newItem}
          categories={categories}
          newCategory={newCategory}
          showUOMModal={showUOMModal}
          showAddCategoryModal={showAddCategoryModal}
          setShowAdd={setShowAdd}
          setShowEdit={setShowEdit}
          setShowUOMModal={setShowUOMModal}
          setShowAddCategoryModal={setShowAddCategoryModal}
          setNewCategory={setNewCategory}
          handleChange={handleChange}
          handleAddItem={handleAddItem}
          handleUpdateItem={handleUpdateItem}
          handleAddCategory={handleAddCategory}
          formMode="addStock"
          selectedWarehouse={selectedWarehouse}
          companyId={companyId}
          onSuccess={() => {
            fetchWarehouses();
          }}
        />
      </div>
    </>
  );
};

export default WareHouse;