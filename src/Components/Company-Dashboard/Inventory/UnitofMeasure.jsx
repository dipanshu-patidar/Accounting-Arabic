import React, { useEffect, useState, useRef } from "react";
import { Table, Modal, Button, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import GetCompanyId from '../../../Api/GetCompanyId';
import BaseUrl from '../../../Api/BaseUrl';
import axiosInstance from '../../../Api/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

const companyId = GetCompanyId();

const UnitOfMeasure = () => {
  // States
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

  // Initialize uoms as an empty array
  const [uoms, setUoms] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Loading & Error States for API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unitsLoading, setUnitsLoading] = useState(false);
  
  // Add refs to track component state and abort controllers
  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;
    
    // Create a new AbortController for this component instance
    abortControllerRef.current = new AbortController();
    
    fetchUnits();
    
    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted.current = false;
      
      // Abort any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Close all modals to prevent DOM issues
      setShowModal(false);
      setShowUOMModal(false);
      setShowDeleteModal(false);
    };
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

  // Fetch Units from API by company ID - using the specific endpoint
  const fetchUnits = async () => {
    if (!isMounted.current) return;
    
    setUnitsLoading(true);
    try {
      // ✅ NEW ENDPOINT: /api/unit-details/getUnitDetailsByCompanyId/{company_id}
      const response = await axiosInstance.get(`${BaseUrl}unit-details/getUnitDetailsByCompanyId/${companyId}`, {
        signal: abortControllerRef.current?.signal
      });

      console.log("API Response:", response.data); // Debug log

      if (isMounted.current) {
        if (response.data.success) { // ✅ Changed from 'status' to 'success'
          // The API already filters by company_id, so we can use the data directly
          setUnits(response.data.data);

          // Extract unique UOM names from the response data
          const uniqueUoms = [...new Set(response.data.data.map(item => item.uom_name))];
          setUoms(uniqueUoms);
        } else {
          setError("Failed to fetch units");
        }
      }
    } catch (err) {
      // Don't show error if request was aborted
      if (err.name !== 'CanceledError' && isMounted.current) {
        console.error("Fetch Units API Error:", err);
        setError("Failed to fetch units. Please try again.");
      }
    } finally {
      if (isMounted.current) {
        setUnitsLoading(false);
      }
    }
  };

  // Handle Create/Edit Unit Modal
  const handleModalClose = () => {
    if (!isMounted.current) return;
    
    setShowModal(false);
    setUnitName("");
    setAbbreviation("");
    setEditId(null);
    setWeightPerUnit("");
    setSelectedCategory("");
    setDynamicLabel("Weight per Unit");
  };

  const handleModalShow = (data = null) => {
    if (!isMounted.current) return;
    
    console.log("handleModalShow called with data:", data); // Debug log

    if (data) {
      console.log("Editing unit with ID:", data.id); // Debug log
      setEditId(data.id);
      setUnitName(data.uom_name || ""); // ✅ Changed from 'unit_name' to 'uom_name'
      setWeightPerUnit(data.weight_per_unit || "");
      // Set category based on the category field in the data
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
    if (!isMounted.current) return;
    
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
        const response = await axiosInstance.put(`${BaseUrl}unit-details/${editId}`, unitData, {
          signal: abortControllerRef.current?.signal
        });
        if (response.data.success) { // ✅ Changed from 'status' to 'success'
          if (isMounted.current) {
            setUnits(units.map(u => u.id === editId ? { ...u, ...unitData } : u));
            toast.success("Unit updated successfully!", {
              toastId: 'unit-update-success',
              autoClose: 3000
            });
          }
        }
      } else {
        // Create new unit
        const response = await axiosInstance.post(`${BaseUrl}unit-details`, unitData, {
          signal: abortControllerRef.current?.signal
        });
        if (response.data.success) { // ✅ Changed from 'status' to 'success'
          if (isMounted.current) {
            setUnits([...units, { ...response.data.data, uom_name: unitName }]);
            toast.success("Unit created successfully!", {
              toastId: 'unit-create-success',
              autoClose: 3000
            });
          }
        }
      }
      handleModalClose();
      fetchUnits(); // Refresh data
    } catch (err) {
      // Don't show error if request was aborted
      if (err.name !== 'CanceledError' && isMounted.current) {
        console.error("Save Unit API Error:", err);
        setError("Failed to save unit. Please try again.");
        toast.error("Failed to save unit. Please try again.", {
          toastId: 'unit-save-error',
          autoClose: 3000
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Delete Unit - Show confirmation modal
  const handleDeleteClick = (id) => {
    if (!isMounted.current) return;
    
    console.log("Delete clicked for ID:", id); // Debug log
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!isMounted.current) return;
    
    console.log("Confirming delete for ID:", deleteId); // Debug log
    setShowDeleteModal(false);
    setLoading(true);

    try {
      // Fixed: Changed from data to params for delete request
      const response = await axiosInstance.delete(`${BaseUrl}unit-details/${deleteId}`, {
        params: { company_id: companyId },
        signal: abortControllerRef.current?.signal
      });

      console.log("Delete response:", response.data); // Debug log

      if (response.data.success) { // ✅ Changed from 'status' to 'success'
        if (isMounted.current) {
          setUnits(units.filter(u => u.id !== deleteId));
          toast.success("Unit deleted successfully.", {
            toastId: 'unit-delete-success',
            autoClose: 3000
          });
        }
        fetchUnits(); // Refresh data
      }
    } catch (err) {
      // Don't show error if request was aborted
      if (err.name !== 'CanceledError' && isMounted.current) {
        console.error("Delete Unit API Error:", err);
        toast.error("Failed to delete unit. Please try again.", {
          toastId: 'unit-delete-error',
          autoClose: 3000
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setDeleteId(null);
      }
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
    if (!isMounted.current) return;
    
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      if (!isMounted.current) return;
      
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
          return axiosInstance.post(`${BaseUrl}unit-details`, newUnit, {
            signal: abortControllerRef.current?.signal
          });
        });

        await Promise.all(promises);
        if (isMounted.current) {
          fetchUnits(); // Refresh the list after import
          toast.success("Units imported successfully!", {
            toastId: 'units-import-success',
            autoClose: 3000
          });
        }
      } catch (error) {
        // Don't show error if request was aborted
        if (error.name !== 'CanceledError' && isMounted.current) {
          console.error("Import Error:", error);
          setError("Failed to import units. Please try again.");
          toast.error("Failed to import units. Please try again.", {
            toastId: 'units-import-error',
            autoClose: 3000
          });
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  // Export to Excel
  const handleExport = () => {
    if (!isMounted.current) return;
    
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
    if (!isMounted.current) return;
    
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
    if (!isMounted.current) return;
    setCurrentPage(pageNumber);
  };

  // ✅ POST: Submit Unit Details - NEW ENDPOINT: /api/unit-details
  const handleSubmitUnitDetails = async () => {
    if (!isMounted.current) return;
    
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
      }, {
        signal: abortControllerRef.current?.signal
      });

      if (response.data.success) {
        if (isMounted.current) {
          toast.success("Unit details saved successfully!", {
            toastId: 'unit-details-save-success',
            autoClose: 3000
          });
          setShowUOMModal(false);
          setSelectedUnit("");
          setWeightPerUnit("");
          setSelectedCategory("");
          setDynamicLabel("Weight per Unit");
          // Refresh the units list
          fetchUnits(); // Refresh data
        }
      } else {
        throw new Error("Failed to save unit details");
      }
    } catch (err) {
      // Don't show error if request was aborted
      if (err.name !== 'CanceledError' && isMounted.current) {
        console.error("Save Unit Details API Error:", err);
        setError("Failed to save unit details. Please try again.");
        toast.error("Failed to save unit details. Please try again.", {
          toastId: 'unit-details-save-error',
          autoClose: 3000
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // If component is not mounted, render nothing
  if (!isMounted.current) {
    return null;
  }

  return (
    <>
      <div className="">
        <div className="shadow p-4">
          <div className="d-flex justify-content-between flex-wrap gap-2">
            <h4 className="fw-semibold">Manage Unit of Measure</h4>
            <div className="d-flex gap-2 flex-wrap">
              <Button
                className="rounded-pill text-white"
                style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                onClick={() => document.getElementById("excelImport").click()}
                disabled={loading}
              >
                <i className="fas fa-file-import me-2" /> Import
              </Button>

              <input
                type="file"
                id="excelImport"
                accept=".xlsx, .xls"
                style={{ display: "none" }}
                onChange={handleImport}
              />

              <Button
                className="rounded-pill text-white"
                style={{ backgroundColor: "#fd7e14", borderColor: "#fd7e14" }}
                onClick={handleExport}
                disabled={loading}
              >
                <i className="fas fa-file-export me-2" /> Export
              </Button>

              <Button
                className="rounded-pill text-white"
                style={{ backgroundColor: "#ffc107", borderColor: "#ffc107" }}
                onClick={handleDownloadTemplate}
                disabled={loading}
              >
                <i className="fas fa-download me-2" /> Download Template
              </Button>

              <Button
                className="set_btn text-white fw-semibold"
                style={{ backgroundColor: '#3daaaa', borderColor: '#3daaaa' }}
                onClick={() => setShowUOMModal(true)}
                disabled={loading} // Disable during API call
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="fa fa-plus me-2" />
                )}
                Create Unit
              </Button>
            </div>
          </div>

          {error && <div className="alert alert-danger mt-3">{error}</div>}

          <div className="table-responsive mt-3">
            <Table bordered striped hover>
              <thead className="">
                <tr>
                  <th>S.No</th>
                  <th>Unit Name</th>
                  <th>Category</th>
                  <th>Weight per Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {unitsLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                      Loading units...
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((u, index) => (
                    <tr key={u.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{u.uom_name || ""}</td> {/* ✅ Changed from 'unit_name' to 'uom_name' */}
                      <td>{u.category || ""}</td>
                      <td>{u.weight_per_unit || ""} {u.uom_name || ""}</td>
                      <td>
                        <Button
                          variant="link"
                          className="text-warning p-0 me-2"
                          onClick={() => handleModalShow(u)}
                          disabled={loading}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="link"
                          className="text-danger p-0 me-2"
                          onClick={() => handleDeleteClick(u.id)}
                          disabled={loading}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No units found</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2 px-2">
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
                          ? { backgroundColor: '#3daaaa', borderColor: '#3daaaa', color: 'white' }
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
        </div>

        {/* ✅ Edit Unit Modal */}
        <Modal 
          show={showModal} 
          onHide={handleModalClose} 
          centered 
          backdrop="static"
          keyboard={false}
          enforceFocus={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>{editId ? "Edit Unit" : "Add Unit"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleFormSubmit}>
              <Form.Group className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="mb-0">Measurement Category</Form.Label>
                </div>
                <Form.Select
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
                  className="mt-2"
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
                <Form.Label className="mb-0">Unit of Measurement (UOM)</Form.Label>
                <Form.Select
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="mt-2"
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
                <Form.Label>{dynamicLabel}</Form.Label>
                <Form.Control
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
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleModalClose}
              style={{
                border: 'none',
                color: '#fff',
                padding: '6px 16px',
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleFormSubmit}
              style={{
                backgroundColor: '#27b2b6',
                border: 'none',
                color: '#fff',
                padding: '6px 16px',
              }}
              disabled={loading}
            >
              {loading ? "Saving..." : (editId ? "Update" : "Save")}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ✅ Unit Details Modal */}
        <Modal 
          show={showUOMModal} 
          onHide={() => setShowUOMModal(false)} 
          centered 
          backdrop="static"
          keyboard={false}
          enforceFocus={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Unit Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="mb-0">Measurement Category</Form.Label>
                </div>
                <Form.Select
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
                  className="mt-2"
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
                <Form.Label className="mb-0">Unit of Measurement (UOM)</Form.Label>
                <Form.Select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="mt-2"
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
                <Form.Label>{dynamicLabel}</Form.Label>
                <Form.Control
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
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowUOMModal(false)}
              style={{
                border: 'none',
                color: '#fff',
                padding: '6px 16px',
              }}
              disabled={loading}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitUnitDetails}
              style={{
                backgroundColor: '#27b2b6',
                border: 'none',
                color: '#fff',
                padding: '6px 16px',
              }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ✅ Delete Confirmation Modal */}
        <Modal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)} 
          centered 
          backdrop="static"
          keyboard={false}
          enforceFocus={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this unit?</p>
            <p className="text-muted small">This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </Modal.Footer>
        </Modal>
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
        containerId="unit-measure-container"
      />
    </>
  );
};

export default UnitOfMeasure;