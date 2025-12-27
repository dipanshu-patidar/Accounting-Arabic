import React, { useEffect, useState, useRef } from "react";
import { Table, Modal, Button, Form, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { FaEdit, FaTrash, FaSearch, FaFile, FaDownload, FaUpload, FaPlus } from "react-icons/fa";
import GetCompanyId from '../../../Api/GetCompanyId';
import BaseUrl from '../../../Api/BaseUrl';
import axiosInstance from '../../../Api/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import './UnitofMeasure.css';

const UnitOfMeasure = () => {
  // Permission states
  const [userPermissions, setUserPermissions] = useState([]);
  const [canViewUOM, setCanViewUOM] = useState(false);
  const [canCreateUOM, setCanCreateUOM] = useState(false);
  const [canUpdateUOM, setCanUpdateUOM] = useState(false);
  const [canDeleteUOM, setCanDeleteUOM] = useState(false);

  // States
  const companyId = GetCompanyId();
  const [units, setUnits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [editId, setEditId] = useState(null);

  const [newUOM, setNewUOM] = useState("");
  const [showAddUOMModal, setShowAddUOMModal] = useState(false);

  // ✅ For Unit Details Modal
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [weightPerUnit, setWeightPerUnit] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('');

  // ✅ For Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // ✅ FIXED: Changed from direct assignment to useState hook
  const [dynamicLabel, setDynamicLabel] = useState('Weight per Unit');

  // Modal cleanup refs
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0, uom: 0, delete: 0 });

  // Initialize uoms as an empty array
  const [uoms, setUoms] = useState([]);

  // Check permissions
  useEffect(() => {
    // Get user role and permissions
    const role = localStorage.getItem("role");
    
    // Superadmin and Company roles have access to all modules
    if (role === "SUPERADMIN" || role === "COMPANY") {
      setCanViewUOM(true);
      setCanCreateUOM(true);
      setCanUpdateUOM(true);
      setCanDeleteUOM(true);
    } else if (role === "USER") {
      // For USER role, check specific permissions
      try {
        const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
        setUserPermissions(permissions);
        
        // Check if user has permissions for Unit_of_measure
        const uomPermission = permissions.find(p => p.module_name === "Unit_of_measure");
        
        if (uomPermission) {
          setCanViewUOM(uomPermission.can_view || false);
          setCanCreateUOM(uomPermission.can_create || false);
          setCanUpdateUOM(uomPermission.can_update || false);
          setCanDeleteUOM(uomPermission.can_delete || false);
        } else {
          setCanViewUOM(false);
          setCanCreateUOM(false);
          setCanUpdateUOM(false);
          setCanDeleteUOM(false);
        }
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setCanViewUOM(false);
        setCanCreateUOM(false);
        setCanUpdateUOM(false);
        setCanDeleteUOM(false);
      }
    } else {
      setCanViewUOM(false);
      setCanCreateUOM(false);
      setCanUpdateUOM(false);
      setCanDeleteUOM(false);
    }
  }, []);

  // Helper functions
  const getUOMsForCategory = (category) => {
    const uomCategories = {
      weight: ['KG', 'G', 'LB', 'OZ', 'TON', 'MG', 'Tonne', 'Carat'],
      area: ['SQM', 'SQFT', 'ACRE', 'HECTARE', 'SQKM', 'SQMILE', 'SQCM', 'SQMM'],
      volume: ['L', 'ML', 'GAL', 'LTR', 'CUBIC M', 'CUBIC FT', 'CUBIC CM', 'CUBIC MM'],
      length: ['M', 'CM', 'MM', 'FT', 'IN', 'YD', 'KM', 'MILE', 'MM', 'MICRON'],
      count: ['PCS', 'NOS', 'UNIT', 'SET', 'PAIR', 'DOZEN', 'BUNDLE', 'KIT']
    };

    // Return empty array if no category is selected
    if (!category) return [];
    return uomCategories[category] || [];
  };

  const getLabelForCategory = (category) => {
    const labels = {
      weight: 'Weight per Unit',
      area: 'Area per Unit',
      volume: 'Volume per Unit',
      length: 'Length per Unit',
      count: 'Count per Unit'
    };

    return labels[category] || 'Measurement per Unit';
  };

  const getCategoryDefaultUnit = (category) => {
    const defaultUnits = {
      weight: 'KG',
      area: 'SQM',
      volume: 'L',
      length: 'M',
      count: 'PCS'
    };

    return defaultUnits[category] || 'KG';
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Loading & Error States for API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unitsLoading, setUnitsLoading] = useState(false);

  // Fetch Units from API by company ID - using specific endpoint
  const fetchUnits = async () => {
    if (!canViewUOM) {
      setUnitsLoading(false);
      return;
    }

    setUnitsLoading(true);
    try {
      // ✅ NEW ENDPOINT: /api/unit-details/getUnitDetailsByCompanyId/{company_id}
      const response = await axiosInstance.get(`${BaseUrl}unit-details/getUnitDetailsByCompanyId/${companyId}`);

      console.log("API Response:", response.data); // Debug log

      if (response.data.success) { // ✅ Changed from 'status' to 'success'
        // The API already filters by company_id, so we can use the data directly
        setUnits(response.data.data);

        // Extract unique UOM names from response data
        const uniqueUoms = [...new Set(response.data.data.map(item => item.uom_name))];
        setUoms(uniqueUoms);
      } else {
        setError("Failed to fetch units");
      }
    } catch (err) {
      console.error("Fetch Units API Error:", err);
      setError("Failed to fetch units. Please try again.");
    } finally {
      setUnitsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchUnits();
  }, [canViewUOM]);

  // Close handlers for modals
  const handleCloseMainModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowModal(false);
    modalKeyRef.current.main += 1;
  };
  
  const handleMainModalExited = () => {
    setUnitName("");
    setAbbreviation("");
    setEditId(null);
    setWeightPerUnit("");
    setSelectedCategory("");
    setDynamicLabel("Weight per Unit");
    isCleaningUpRef.current = false;
  };
  
  const handleCloseUOMModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowUOMModal(false);
    modalKeyRef.current.uom += 1;
  };
  
  const handleUOMModalExited = () => {
    setSelectedUnit("");
    setWeightPerUnit("");
    setSelectedCategory("");
    setDynamicLabel("Weight per Unit");
    isCleaningUpRef.current = false;
  };
  
  const handleCloseDeleteModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowDeleteModal(false);
    modalKeyRef.current.delete += 1;
  };
  
  const handleDeleteModalExited = () => {
    setDeleteId(null);
    isCleaningUpRef.current = false;
  };

  // Handle Create/Edit Unit Modal
  const handleModalClose = () => {
    handleCloseMainModal();
  };

  const handleModalShow = (data = null) => {
    if (data && !canUpdateUOM) {
      toast.error("You don't have permission to edit units");
      return;
    }
    
    if (!data && !canCreateUOM) {
      toast.error("You don't have permission to create units");
      return;
    }
    
    // Reset cleanup flag before opening
    isCleaningUpRef.current = false;
    modalKeyRef.current.main += 1;
    
    console.log("handleModalShow called with data:", data); // Debug log

    if (data) {
      console.log("Editing unit with ID:", data.id); // Debug log
      setEditId(data.id);
      setUnitName(data.uom_name || ""); // ✅ Changed from 'unit_name' to 'uom_name'
      setWeightPerUnit(data.weight_per_unit || "");
      // Set category based on the category field in data
      if (data.category) {
        const lowerCaseCategory = data.category.toLowerCase();
        setSelectedCategory(lowerCaseCategory);
        setDynamicLabel(getLabelForCategory(lowerCaseCategory));
      }
    } else {
      setEditId(null);
      setUnitName("");
      setWeightPerUnit("");
      setSelectedCategory("");
      setDynamicLabel("Weight per Unit");
    }
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (editId && !canUpdateUOM) {
      toast.error("You don't have permission to update units");
      return;
    }
    
    if (!editId && !canCreateUOM) {
      toast.error("You don't have permission to create units");
      return;
    }
    
    setLoading(true);

    try {
      // Determine the category based on the selected unit name
      let category = 'WEIGHT'; // Default
      if (getUOMsForCategory('weight').includes(unitName.toUpperCase())) {
        category = 'WEIGHT';
      } else if (getUOMsForCategory('area').includes(unitName.toUpperCase())) {
        category = 'AREA';
      } else if (getUOMsForCategory('volume').includes(unitName.toUpperCase())) {
        category = 'VOLUME';
      } else if (getUOMsForCategory('length').includes(unitName.toUpperCase())) {
        category = 'LENGTH';
      } else if (getUOMsForCategory('count').includes(unitName.toUpperCase())) {
        category = 'COUNT';
      }

      const unitData = {
        company_id: companyId,
        uom_name: unitName, // Send the name, not ID
        category: category,
        weight_per_unit: weightPerUnit,
      };

      if (editId) {
        // Update existing unit
        console.log("Updating unit with ID:", editId, "Data:", unitData); // Debug log
        const response = await axiosInstance.put(`${BaseUrl}unit-details/${editId}`, unitData);
        if (response.data.success) { // ✅ Changed from 'status' to 'success'
          setUnits(units.map(u => u.id === editId ? { ...u, ...unitData } : u));
          toast.success("Unit updated successfully!", {
            toastId: 'unit-update-success',
            autoClose: 3000
          });
        }
      } else {
        // Create new unit
        const response = await axiosInstance.post("unit-details", unitData);
        if (response.data.success) { // ✅ Changed from 'status' to 'success'
          setUnits([...units, { ...response.data.data, uom_name: unitName }]);
          toast.success("Unit created successfully!", {
            toastId: 'unit-create-success',
            autoClose: 3000
          });
        }
      }
      isCleaningUpRef.current = false; // Reset flag before closing
      setShowModal(false);
      modalKeyRef.current.main += 1;
      // Form reset will happen in onExited
      fetchUnits(); // Refresh data
    } catch (err) {
      console.error("Save Unit API Error:", err);
      setError("Failed to save unit. Please try again.");
      toast.error("Failed to save unit. Please try again.", {
        toastId: 'unit-save-error',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete Unit - Show confirmation modal
  const handleDeleteClick = (id) => {
    if (!canDeleteUOM) {
      toast.error("You don't have permission to delete units");
      return;
    }
    
    // Reset cleanup flag before opening
    isCleaningUpRef.current = false;
    modalKeyRef.current.delete += 1;
    
    console.log("Delete clicked for ID:", id); // Debug log
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    console.log("Confirming delete for ID:", deleteId); // Debug log
    isCleaningUpRef.current = false; // Reset flag before closing
    setShowDeleteModal(false);
    modalKeyRef.current.delete += 1;
    setLoading(true);

    try {
      // Fixed: Changed from data to params for delete request
      const response = await axiosInstance.delete(`${BaseUrl}unit-details/${deleteId}`, {
        params: { company_id: companyId }
      });

      console.log("Delete response:", response.data); // Debug log

      if (response.data.success) { // ✅ Changed from 'status' to 'success'
        setUnits(units.filter(u => u.id !== deleteId));
        toast.success("Unit deleted successfully.", {
          toastId: 'unit-delete-success',
          autoClose: 3000
        });
        fetchUnits(); // Refresh data
      }
    } catch (err) {
      console.error("Delete Unit API Error:", err);
      setError("Failed to delete unit. Please try again.");
      toast.error("Failed to delete unit. Please try again.", {
        toastId: 'unit-delete-error',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(units.length / itemsPerPage);
  const currentItems = units.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Import Excel
  const handleImport = (e) => {
    if (!canCreateUOM) {
      toast.error("You don't have permission to import units");
      return;
    }
    
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
          // Determine the category based on the unit name
          let category = 'WEIGHT'; // Default
          if (getUOMsForCategory('weight').includes(item["Unit Name"].toUpperCase())) {
            category = 'WEIGHT';
          } else if (getUOMsForCategory('area').includes(item["Unit Name"].toUpperCase())) {
            category = 'AREA';
          } else if (getUOMsForCategory('volume').includes(item["Unit Name"].toUpperCase())) {
            category = 'VOLUME';
          } else if (getUOMsForCategory('length').includes(item["Unit Name"].toUpperCase())) {
            category = 'LENGTH';
          } else if (getUOMsForCategory('count').includes(item["Unit Name"].toUpperCase())) {
            category = 'COUNT';
          }

          const newUnit = {
            company_id: companyId,
            uom_name: item["Unit Name"],
            category: category,
            weight_per_unit: item["Weight per Unit"] || "",
          };
          return axiosInstance.post(`${BaseUrl}unit-details`, newUnit);
        });

        await Promise.all(promises);
        fetchUnits(); // Refresh the list after import
        toast.success("Units imported successfully!", {
          toastId: 'units-import-success',
          autoClose: 3000
        });
      } catch (error) {
        console.error("Import Error:", error);
        setError("Failed to import units. Please try again.");
        toast.error("Failed to import units. Please try again.", {
          toastId: 'units-import-error',
          autoClose: 3000
        });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Export to Excel
  const handleExport = () => {
    if (!canViewUOM) {
      toast.error("You don't have permission to export units");
      return;
    }
    
    const exportData = units.map(({ uom_name, weight_per_unit, category }) => ({ // ✅ Changed from 'unit_name' to 'uom_name'
      "Unit Name": uom_name || "",
      "Weight per Unit": weight_per_unit || "",
      "Category": category || ""
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Units");
    XLSX.writeFile(wb, "unit-of-measure.xlsx");
    toast.success("Units exported successfully!", {
      toastId: 'units-export-success',
      autoClose: 3000
    });
  };

  // Download Template
  const handleDownloadTemplate = () => {
    if (!canCreateUOM) {
      toast.error("You don't have permission to download unit templates");
      return;
    }
    
    const template = [{
      "Unit Name": "",
      "Weight per Unit": "",
      "Category": ""
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "uom-template.xlsx");
  };

  // Page Change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // ✅ POST: Submit Unit Details - NEW ENDPOINT: /api/unit-details
  const handleSubmitUnitDetails = async () => {
    if (!canCreateUOM) {
      toast.error("You don't have permission to create units");
      return;
    }
    
    if (!selectedUnit || !weightPerUnit || !selectedCategory) {
      toast.error("Please fill all fields", {
        toastId: 'unit-details-validation-error',
        autoClose: 3000
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Determine the category based on the selected category
      let category = selectedCategory.toUpperCase();

      const response = await axiosInstance.post(`${BaseUrl}unit-details`, {
        company_id: companyId,
        uom_name: selectedUnit, // Send the name, not ID
        category: category,
        weight_per_unit: parseFloat(weightPerUnit)
      });

      if (response.data.success) {
        toast.success("Unit details saved successfully!", {
          toastId: 'unit-details-save-success',
          autoClose: 3000
        });
        isCleaningUpRef.current = false; // Reset flag before closing
        setShowUOMModal(false);
        modalKeyRef.current.uom += 1;
        // Form reset will happen in onExited
        // Refresh units list
        fetchUnits(); // Refresh data
      } else {
        throw new Error("Failed to save unit details");
      }
    } catch (err) {
      console.error("Save Unit Details API Error:", err);
      setError("Failed to save unit details. Please try again.");
      toast.error("Failed to save unit details. Please try again.", {
        toastId: 'unit-details-save-error',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // If user doesn't have view permission, show access denied message
  if (!canViewUOM) {
    return (
      <div className="p-4 uom-container">
        <Card className="text-center p-5 border-0 shadow-lg">
          <h3 className="text-danger">Access Denied</h3>
          <p>You don't have permission to view Unit of Measure.</p>
          <p>Please contact your administrator for access.</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 uom-container">
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
          <h3 className="uom-title">
            <i className="fas fa-ruler-combined me-2"></i>
            Unit of Measure Management
          </h3>
          <p className="uom-subtitle">Manage measurement units and categories for your inventory</p>
        </div>

        <Row className="g-3 mb-4 align-items-center">
          <Col xs={12} md={6}>
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <Form.Control
                className="search-input"
                type="text"
                placeholder="Search by unit name or category..."
                disabled
              />
            </div>
          </Col>
          <Col xs={12} md={6} className="d-flex justify-content-md-end justify-content-start gap-2 flex-wrap">
            {canCreateUOM && (
              <Button
                className="d-flex align-items-center btn-import"
                onClick={() => document.getElementById("excelImport").click()}
                disabled={loading}
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

            {canViewUOM && (
              <Button
                className="d-flex align-items-center btn-export"
                onClick={handleExport}
                disabled={loading}
              >
                <FaFile className="me-2" /> Export
              </Button>
            )}

            {canCreateUOM && (
              <Button
                className="d-flex align-items-center btn-download"
                onClick={handleDownloadTemplate}
                disabled={loading}
              >
                <FaDownload className="me-2" /> Download
              </Button>
            )}

            {canCreateUOM && (
              <Button
                className="d-flex align-items-center btn-add-unit"
                onClick={() => {
                  isCleaningUpRef.current = false;
                  modalKeyRef.current.uom += 1;
                  setShowUOMModal(true);
                }}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FaPlus className="me-2" />
                )}
                Create Unit
              </Button>
            )}
          </Col>
        </Row>

        {/* Table Card */}
        <Card className="uom-table-card border-0 shadow-lg">
          <Card.Body style={{ padding: 0 }}>
            {error && <Alert variant="danger" className="m-3">{error}</Alert>}
            
            <div style={{ overflowX: "auto" }}>
              <Table responsive className="uom-table align-middle" style={{ fontSize: 16 }}>
                <thead className="table-header">
                  <tr>
                    <th className="py-3">S.No</th>
                    <th className="py-3">Unit Name</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">Weight per Unit</th>
                    <th className="py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unitsLoading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        <Spinner animation="border" style={{ color: "#505ece" }} />
                        <p className="mt-2 text-muted">Loading units...</p>
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((u, index) => (
                      <tr key={u.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="fw-bold">{u.uom_name || ""}</td>
                        <td>
                          <span className="badge bg-info text-dark">{u.category || ""}</span>
                        </td>
                        <td>{u.weight_per_unit || ""} {u.uom_name || ""}</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            {canUpdateUOM && (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="btn-action btn-edit"
                                onClick={() => handleModalShow(u)}
                                disabled={loading}
                              >
                                <FaEdit size={14} />
                              </Button>
                            )}
                            {canDeleteUOM && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="btn-action btn-delete"
                                onClick={() => handleDeleteClick(u.id)}
                                disabled={loading}
                              >
                                <FaTrash size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">No units found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2 px-3 py-3">
              <span className="small text-muted">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, units.length)} of {units.length} entries
              </span>
              <nav>
                <ul className="pagination pagination-sm mb-0 flex-wrap">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-start"
                      onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                      disabled={loading}
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
                        disabled={loading}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link rounded-end"
                      onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                      disabled={loading}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </Card.Body>
        </Card>

        {/* ✅ Edit Unit Modal */}
        <Modal 
          key={modalKeyRef.current.main}
          show={showModal} 
          onHide={handleCloseMainModal}
          onExited={handleMainModalExited}
          centered
          className="uom-modal"
        >
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>{editId ? "Edit Unit" : "Add Unit"}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom">
            <Form onSubmit={handleFormSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Measurement Category</Form.Label>
                <Form.Select
                  className="form-select-custom"
                  value={selectedCategory}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    setSelectedCategory(selectedValue);

                    // Reset UOM selection when category changes
                    setUnitName('');

                    // Update label based on selected category
                    if (selectedValue) {
                      setDynamicLabel(getLabelForCategory(selectedValue));
                    } else {
                      setDynamicLabel('Weight per Unit');
                    }
                  }}
                  disabled={loading}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="weight">Weight</option>
                  <option value="area">Area</option>
                  <option value="volume">Volume</option>
                  <option value="length">Length</option>
                  <option value="count">Count</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Unit of Measurement (UOM)</Form.Label>
                <Form.Select
                  className="form-select-custom"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  required
                  disabled={loading || !selectedCategory}
                >
                  <option value="">Select Unit</option>
                  {selectedCategory && getUOMsForCategory(selectedCategory).map((uom, idx) => (
                    <option key={idx} value={uom}>
                      {uom}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">{dynamicLabel}</Form.Label>
                <Form.Control
                  className="form-control-custom"
                  type="text"
                  placeholder={`e.g. 0.5 ${unitName || getCategoryDefaultUnit(selectedCategory)}`}
                  value={weightPerUnit}
                  onChange={(e) => setWeightPerUnit(e.target.value)}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button
              variant="secondary"
              className="btn-modal-cancel"
              onClick={handleModalClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="btn-modal-save"
              onClick={handleFormSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                editId ? "Update" : "Save"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ✅ Unit Details Modal */}
        <Modal 
          key={modalKeyRef.current.uom}
          show={showUOMModal} 
          onHide={handleCloseUOMModal}
          onExited={handleUOMModalExited}
          centered
          className="uom-modal"
        >
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>Create Unit</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Measurement Category</Form.Label>
                <Form.Select
                  className="form-select-custom"
                  value={selectedCategory}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    setSelectedCategory(selectedValue);

                    // Reset UOM selection when category changes
                    setSelectedUnit('');

                    // Update label based on selected category
                    if (selectedValue) {
                      setDynamicLabel(getLabelForCategory(selectedValue));
                    } else {
                      setDynamicLabel('Weight per Unit');
                    }
                  }}
                  disabled={loading}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="weight">Weight</option>
                  <option value="area">Area</option>
                  <option value="volume">Volume</option>
                  <option value="length">Length</option>
                  <option value="count">Count</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">Unit of Measurement (UOM)</Form.Label>
                <Form.Select
                  className="form-select-custom"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  required
                  disabled={loading || !selectedCategory}
                >
                  <option value="">Select Unit</option>
                  {selectedCategory && getUOMsForCategory(selectedCategory).map((uom, idx) => (
                    <option key={idx} value={uom}>
                      {uom}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">{dynamicLabel}</Form.Label>
                <Form.Control
                  className="form-control-custom"
                  type="text"
                  placeholder={`e.g. 0.5 ${selectedUnit || getCategoryDefaultUnit(selectedCategory)}`}
                  value={weightPerUnit}
                  onChange={(e) => setWeightPerUnit(e.target.value)}
                  required
                  disabled={loading}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button
              variant="secondary"
              className="btn-modal-cancel"
              onClick={handleCloseUOMModal}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="btn-modal-save"
              onClick={handleSubmitUnitDetails}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ✅ Delete Confirmation Modal */}
        <Modal 
          key={modalKeyRef.current.delete}
          show={showDeleteModal} 
          onHide={handleCloseDeleteModal}
          onExited={handleDeleteModalExited}
          centered
          className="uom-modal"
        >
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom text-center py-4">
            <div className="mx-auto mb-3" style={{ width: 70, height: 70, background: "#FFF5F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaTrash size={32} color="#F04438" />
            </div>
            <h4 className="fw-bold mb-2">Delete Unit</h4>
            <p className="text-muted">Are you sure you want to delete this unit? This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button
              variant="secondary"
              className="btn-modal-cancel"
              onClick={handleCloseDeleteModal}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="btn-modal-delete"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              {loading ? (
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
    </>
  );
};

export default UnitOfMeasure;