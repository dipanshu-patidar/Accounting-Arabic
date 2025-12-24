import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import GetCompanyId from "../../../../Api/GetCompanyId";
import axiosInstance from "../../../../Api/axiosInstance";
import BaseUrl from "../../../../Api/BaseUrl";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialServices = [];
const initialUnitOptions = [];

function Service() {
  // Permission states
  const [userPermissions, setUserPermissions] = useState([]);
  const [canViewServices, setCanViewServices] = useState(false);
  const [canCreateServices, setCanCreateServices] = useState(false);
  const [canUpdateServices, setCanUpdateServices] = useState(false);
  const [canDeleteServices, setCanDeleteServices] = useState(false);
  
  const companyId = GetCompanyId();
  const [services, setServices] = useState(initialServices);
  const [unitOptions, setUnitOptions] = useState(initialUnitOptions); 
  
  // Modal states with explicit initialization
  const [show, setShow] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [form, setForm] = useState({ 
    id: null, 
    name: "", 
    sku: "", 
    serviceDescription: "", 
    unit: "",
    price: "", 
    tax: "", 
    remarks: "", 
    isInvoiceable: true 
  });
  const [editMode, setEditMode] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  
  // Refs to track component mount status and prevent memory leaks
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const timeoutRefs = useRef([]);
  
  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0, view: 0, delete: 0 });

  // Add a timeout to a tracking array for cleanup
  const addTimeout = (callback, delay) => {
    const timeoutId = setTimeout(() => {
      // Remove from tracking array
      timeoutRefs.current = timeoutRefs.current.filter(id => id !== timeoutId);
      // Execute callback if component is still mounted
      if (isMountedRef.current) {
        callback();
      }
    }, delay);
    
    // Add to tracking array
    timeoutRefs.current.push(timeoutId);
    return timeoutId;
  };

  // Clear all tracked timeouts
  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefs.current = [];
  };

  // Safe state update function that checks if component is mounted
  const safeSetState = (setter, value) => {
    if (isMountedRef.current) {
      setter(value);
    }
  };

  // Check if RTL mode is active
  useEffect(() => {
    const checkRTL = () => {
      if (!isMountedRef.current) return;
      
      const htmlElement = document.documentElement;
      const isRTLMode = htmlElement.getAttribute('dir') === 'rtl' || 
                       htmlElement.style.direction === 'rtl' ||
                       getComputedStyle(htmlElement).direction === 'rtl';
      setIsRTL(isRTLMode);
    };
    
    // Check RTL mode on mount
    checkRTL();
    
    // Set up a mutation observer to detect changes in document's direction
    const observer = new MutationObserver(checkRTL);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir', 'style']
    });
    
    // Also check periodically as a fallback
    const intervalId = setInterval(checkRTL, 1000);
    
    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, []);

  // Check permissions
  useEffect(() => {
    // Get user role and permissions
    const role = localStorage.getItem("role");
    
    // Superadmin and Company roles have access to all modules
    if (role === "SUPERADMIN" || role === "COMPANY") {
      safeSetState(setCanViewServices, true);
      safeSetState(setCanCreateServices, true);
      safeSetState(setCanUpdateServices, true);
      safeSetState(setCanDeleteServices, true);
    } else if (role === "USER") {
      // For USER role, check specific permissions
      try {
        const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
        safeSetState(setUserPermissions, permissions);
        
        // Check if user has permissions for Service
        const servicePermission = permissions.find(p => p.module_name === "Service");
        
        if (servicePermission) {
          safeSetState(setCanViewServices, servicePermission.can_view || false);
          safeSetState(setCanCreateServices, servicePermission.can_create || false);
          safeSetState(setCanUpdateServices, servicePermission.can_update || false);
          safeSetState(setCanDeleteServices, servicePermission.can_delete || false);
        } else {
          safeSetState(setCanViewServices, false);
          safeSetState(setCanCreateServices, false);
          safeSetState(setCanUpdateServices, false);
          safeSetState(setCanDeleteServices, false);
        }
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        safeSetState(setCanViewServices, false);
        safeSetState(setCanCreateServices, false);
        safeSetState(setCanUpdateServices, false);
        safeSetState(setCanDeleteServices, false);
      }
    } else {
      safeSetState(setCanViewServices, false);
      safeSetState(setCanCreateServices, false);
      safeSetState(setCanUpdateServices, false);
      safeSetState(setCanDeleteServices, false);
    }
  }, []);

  useEffect(() => {
    if (canViewServices) {
      fetchServices();
      fetchUnitOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewServices]);

  // Cleanup function for component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearAllTimeouts();
      
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      
      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const response = await axiosInstance.get(`${BaseUrl}services/company/${companyId}`, {
        signal: abortControllerRef.current.signal
      });
      
      console.log("Services API Response:", response.data); // Debug log
      
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        const transformedServices = response.data.data.map(service => ({
          id: service.id,
          name: service.service_name,
          sku: service.sku || "",
          serviceDescription: service.description || "",
          unit: service.uom || service.uom_name || "",
          price: service.price || 0,
          tax: service.tax_percent || 0,
          remarks: service.remarks || "",
          isInvoiceable: service.allow_in_invoice === "1"
        }));
        console.log("Transformed Services:", transformedServices); // Debug log
        setServices(transformedServices);
      } else {
        console.log("No valid data in response or data is not an array");
        setServices([]);
      }
    } catch (error) {
      if (error.name !== 'AbortError' && isMountedRef.current) {
        console.error("Error fetching services:", error.response?.data || error.message);
        toast.error("Failed to fetch services. Please try again.", {
          toastId: 'fetch-services-error',
          autoClose: 3000
        });
        setServices([]);
      }
    } finally {
      setServicesLoading(false);
    }
  };

  // Fetch unit options using new API endpoint
  const fetchUnitOptions = async () => {
    try {
      setUnitsLoading(true);
      
      const response = await axiosInstance.get(`${BaseUrl}unit-details/getUnitDetailsByCompanyId/${companyId}`);
      
      console.log("Unit Details API Response:", response.data); // Debug log
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // Extract uom_name from each unit object
        const unitNames = response.data.data.map(unit => unit.uom_name);
        console.log("Extracted unit names:", unitNames); // Debug log
        
        // Update unit options state
        setUnitOptions(unitNames);
        
        // Set default unit to first unit from API
        if (unitNames.length > 0) {
          setForm(prev => ({
            ...prev,
            unit: unitNames[0]
          }));
        }
      } else {
        // Set empty array if no data from API
        setUnitOptions([]);
      }
    } catch (error) {
      console.error("Error fetching unit options:", error.response?.data || error.message);
      // Set empty array on error
      setUnitOptions([]);
      toast.error("Failed to fetch unit options. Please try again.", {
        toastId: 'fetch-units-error',
        autoClose: 3000
      });
    } finally {
      setUnitsLoading(false);
    }
  };

  const handleShow = () => {
    if (!canCreateServices) {
      toast.error("You don't have permission to create services");
      return;
    }
    
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    // Use the first unit option from API or empty string
    const defaultUnit = unitOptions.length > 0 ? unitOptions[0] : "";
    
    setForm({ 
      id: null, 
      name: "", 
      sku: "", 
      serviceDescription: "", 
      unit: defaultUnit,
      price: "", 
      tax: "", 
      remarks: "", 
      isInvoiceable: true 
    });
    setEditMode(false);
    setShow(true);
  };

  const handleClose = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setShow(false);
    
    // Force modal remount on next open
    modalKeyRef.current.main += 1;
  };
  
  // Handle modal exit - cleanup after animation
  const handleMainModalExited = () => {
    if (!isMountedRef.current) return;
    // Reset form state after modal fully closed
    safeSetState(setForm, { 
      id: null, 
      name: "", 
      sku: "", 
      serviceDescription: "", 
      unit: "",
      price: "", 
      tax: "", 
      remarks: "", 
      isInvoiceable: true 
    });
    safeSetState(setEditMode, false);
    isCleaningUpRef.current = false;
  };
  
  const handleViewClose = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setShowView(false);
    
    // Force modal remount on next open
    modalKeyRef.current.view += 1;
  };
  
  // Handle view modal exit - cleanup after animation
  const handleViewModalExited = () => {
    if (!isMountedRef.current) return;
    // Reset view data after modal fully closed
    safeSetState(setViewData, null);
    isCleaningUpRef.current = false;
  };
  
  const handleDeleteConfirmClose = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setShowDeleteConfirm(false);
    
    // Force modal remount on next open
    modalKeyRef.current.delete += 1;
  };
  
  // Handle delete modal exit - cleanup after animation
  const handleDeleteModalExited = () => {
    if (!isMountedRef.current) return;
    // Reset delete id after modal fully closed
    safeSetState(setDeleteId, null);
    isCleaningUpRef.current = false;
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!form.name.trim()) {
      toast.error("Service Name Required", {
        toastId: 'service-name-required',
        autoClose: 3000
      });
      return;
    }
    
    if (!canCreateServices && !editMode) {
      toast.error("You don't have permission to create services");
      return;
    }
    
    if (!canUpdateServices && editMode) {
      toast.error("You don't have permission to update services");
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        company_id: parseInt(companyId),
        service_name: form.name,
        sku: form.sku,
        description: form.serviceDescription,
        uom: form.unit,
        price: parseFloat(form.price) || 0,
        tax_percent: parseFloat(form.tax) || 0,
        allow_in_invoice: form.isInvoiceable ? "1" : "0",
        remarks: form.remarks
      };

      if (editMode && form.id) {
        await axiosInstance.put(`${BaseUrl}services/${form.id}`, payload);
        toast.success("Service updated successfully!", {
          toastId: 'service-update-success',
          autoClose: 3000
        });
      } else {
        await axiosInstance.post(`${BaseUrl}services`, payload);
        toast.success("Service added successfully!", {
          toastId: 'service-add-success',
          autoClose: 3000
        });
      }

      await fetchServices();
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleClose();
    } catch (error) {
      console.error("Error saving service:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 
        `Failed to ${editMode ? 'update' : 'add'} service. Please try again.`;
      toast.error(errorMessage, {
        toastId: editMode ? 'service-update-error' : 'service-add-error',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit handler — ensure unit is in unitOptions
  const handleEdit = (service) => {
    if (!canUpdateServices) {
      toast.error("You don't have permission to edit services");
      return;
    }
    
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    // Ensure unit from service exists in unitOptions (case-insensitive fallback)
    let unitToUse = service.unit;
    const normalizedUnit = service.unit?.toLowerCase();
    const foundUnit = unitOptions.find(u => u.toLowerCase() === normalizedUnit);
    
    if (foundUnit) {
      unitToUse = foundUnit; // Use exact case from unitOptions
    } else if (unitOptions.length > 0) {
      unitToUse = unitOptions[0]; // Fallback
    }

    setForm({
      ...service,
      unit: unitToUse
    });
    setEditMode(true);
    setShow(true);
  };

  const handleDeleteClick = (id) => {
    if (!canDeleteServices) {
      toast.error("You don't have permission to delete services");
      return;
    }
    
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.delete += 1;
    
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!isMountedRef.current) return;
    
    safeSetState(setLoading, true);
    try {
      await axiosInstance.delete(`${BaseUrl}services/${deleteId}`);
      if (isMountedRef.current) {
        toast.success("Service deleted successfully!", {
          toastId: 'service-delete-success',
          autoClose: 3000
        });
        await fetchServices();
        // Reset cleanup flag before closing
        isCleaningUpRef.current = false;
        handleDeleteConfirmClose();
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("Error deleting service:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Failed to delete service. Please try again.";
      toast.error(errorMessage, {
        toastId: 'service-delete-error',
        autoClose: 3000
      });
    } finally {
      if (isMountedRef.current) {
        safeSetState(setLoading, false);
      }
      // Delete ID will be reset in handleDeleteModalExited
    }
  };

  const handleView = (data) => {
    if (!canViewServices) {
      toast.error("You don't have permission to view services");
      return;
    }
    
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.view += 1;
    
    setViewData(data);
    setShowView(true);
  };

  const customButtonStyle = {
    backgroundColor: '#53b2a5',
    borderColor: '#53b2a5',
    color: 'white'
  };

  const viewButtonStyle = {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
    color: 'white'
  };

  const editButtonStyle = {
    backgroundColor: '#ffc107',
    borderColor: '#ffc107',
    color: 'black'
  };

  const deleteButtonStyle = {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
    color: 'white'
  };

  // If user doesn't have view permission, show access denied message
  if (!canViewServices) {
    return (
      <>
        <div className="p-4 mt-2">
          <div className="text-center p-5">
            <h3>Access Denied</h3>
            <p>You don't have permission to view Services.</p>
            <p>Please contact your administrator for access.</p>
          </div>
        </div>
        {/* Toast container outside the main component to prevent unmounting issues */}
        <ToastContainer
          key={`toast-access-${isRTL ? 'rtl' : 'ltr'}`}
          position={isRTL ? "top-left" : "top-right"}
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={isRTL}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          limit={3}
          enableMultiContainer
          containerId={"service-management"}
        />
      </>
    );
  }

  // Debug: Log services state
  console.log("Current services state:", services);
  console.log("Services loading:", servicesLoading);
  
  return (
    <>
      <div className="container mt-5" dir={isRTL ? "rtl" : "ltr"} style={{ position: "relative" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Service Management</h2>
          {canCreateServices && (
            <Button 
              style={customButtonStyle} 
              onClick={handleShow} 
              disabled={loading}
              type="button"
            >
              {loading ? 'Loading...' : 'Add Service'}
            </Button>
          )}
        </div>
          
        <div className="table-responsive">
          <Table striped bordered hover className="shadow-sm">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Service Description</th>
                <th>Unit of Measure</th>
                <th>Price</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {servicesLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-3">
                    <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                    Loading services...
                  </td>
                </tr>
              ) : services && services.length > 0 ? (
                services.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.serviceDescription}</td>
                    <td>{s.unit}</td>
                    <td>₹{parseFloat(s.price || 0).toFixed(2)}</td>
                    <td className="text-center">
                      {canViewServices && (
                        <Button 
                          type="button"
                          size="sm" 
                          style={viewButtonStyle} 
                          onClick={() => handleView(s)} 
                          title="View"
                          className={isRTL ? "ms-1" : "me-1"}
                        >
                          <FaEye />
                        </Button>
                      )}
                      {canUpdateServices && (
                        <Button 
                          type="button"
                          size="sm" 
                          style={editButtonStyle} 
                          onClick={() => handleEdit(s)} 
                          title="Edit"
                          className={isRTL ? "ms-1" : "me-1"}
                        >
                          <FaEdit />
                        </Button>
                      )}
                      {canDeleteServices && (
                        <Button 
                          type="button"
                          size="sm" 
                          style={deleteButtonStyle} 
                          onClick={() => handleDeleteClick(s.id)} 
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-3">
                    No services added
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
                
        {/* Add/Edit Modal */}
        <Modal 
          key={`main-modal-${modalKeyRef.current.main}`}
          show={show} 
          onHide={handleClose}
          onExited={handleMainModalExited}
          centered 
          enforceFocus={false}
          dir={isRTL ? "rtl" : "ltr"}
        >
            <Modal.Header closeButton>
              <Modal.Title>{editMode ? "Edit Service" : "Add Service"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={(e) => { e.preventDefault(); handleSave(e); }}>
                <Form.Group className="mb-3">
                  <Form.Label>Service Name</Form.Label>
                  <Form.Control 
                    type="text"
                    name="name" 
                    value={form.name || ''} 
                    onChange={handleInput} 
                    placeholder="Enter service name"
                    required 
                    autoFocus
                  />
                </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>SKU</Form.Label>
                <Form.Control 
                  type="text"
                  name="sku" 
                  value={form.sku || ''} 
                  onChange={handleInput} 
                  placeholder="Enter SKU (optional)"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Service Description</Form.Label>
                <Form.Control 
                  as="textarea" 
                  name="serviceDescription" 
                  value={form.serviceDescription || ''} 
                  onChange={handleInput} 
                  rows={3}
                  placeholder="Describe service"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Unit of Measure</Form.Label>
                <Form.Select 
                  name="unit" 
                  value={form.unit || ''} 
                  onChange={handleInput}
                  disabled={unitsLoading}
                >
                  {unitOptions.length > 0 ? (
                    unitOptions.map((unitName, index) => (
                      <option key={index} value={unitName}>
                        {unitName}
                      </option>
                    ))
                  ) : (
                    <option value="">No units available</option>
                  )}
                </Form.Select>
                {unitsLoading && (
                  <Form.Text className="text-muted">
                    Loading unit options...
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.01"
                  name="price" 
                  value={form.price || ''} 
                  onChange={handleInput} 
                  placeholder="Enter price"
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Default Tax %</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.01"
                  name="tax" 
                  value={form.tax || ''} 
                  onChange={handleInput} 
                  placeholder="e.g. 18"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="isInvoiceable"
                  checked={form.isInvoiceable || false}
                  onChange={handleInput}
                  label="Allow this service to be added in invoices"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Remarks</Form.Label>
                <Form.Control 
                  as="textarea" 
                  name="remarks" 
                  value={form.remarks || ''} 
                  onChange={handleInput} 
                  rows={2}
                  placeholder="Internal notes (not visible to customers)"
                />
                <Form.Text className="text-muted">
                  Remarks are for internal use only; they do not display anywhere.
                </Form.Text>
              </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose} type="button">
                Cancel
              </Button>
              <Button style={customButtonStyle} onClick={handleSave} disabled={loading} type="button">
                {loading ? 'Saving...' : (editMode ? "Update" : "Save") + " Service"}
              </Button>
            </Modal.Footer>
        </Modal>

        {/* View Modal */}
        <Modal 
          key={`view-modal-${modalKeyRef.current.view}`}
          show={showView} 
          onHide={handleViewClose}
          onExited={handleViewModalExited}
          centered 
          enforceFocus={false}
          dir={isRTL ? "rtl" : "ltr"}
        >
            <Modal.Header closeButton>
              <Modal.Title>Service Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {viewData && (
                <div className="p-3">
                  <h5 className="text-primary mb-3">{viewData.name}</h5>
                <p className="mb-2"><strong>SKU:</strong> {viewData.sku || 'N/A'}</p>
                <p className="mb-2"><strong>Service Description:</strong> {viewData.serviceDescription || 'N/A'}</p>
                <p className="mb-2"><strong>Unit of Measure:</strong> {viewData.unit || 'N/A'}</p>
                <p className="mb-2"><strong>Price:</strong> ₹{parseFloat(viewData.price || 0).toFixed(2)}</p>
                <p className="mb-2"><strong>Default Tax %:</strong> {viewData.tax || 'N/A'}</p>
                <p className="mb-2">
                  <strong>Available in Invoices:</strong> {viewData.isInvoiceable ? (
                    <span className="badge bg-success">Yes</span>
                  ) : (
                    <span className="badge bg-secondary">No</span>
                  )}
                </p>
                  <p className="mb-2"><strong>Remarks:</strong> {viewData.remarks || 'N/A'}</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleViewClose} type="button">
                Close
              </Button>
            </Modal.Footer>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <Modal 
          key={`delete-modal-${modalKeyRef.current.delete}`}
          show={showDeleteConfirm} 
          onHide={handleDeleteConfirmClose}
          onExited={handleDeleteModalExited}
          centered 
          enforceFocus={false}
          dir={isRTL ? "rtl" : "ltr"}
        >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to delete this service? This action cannot be undone.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleDeleteConfirmClose} type="button">
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm} disabled={loading} type="button">
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </Modal.Footer>
        </Modal>
      </div>
      
      {/* Toast Container - Always render but with stable key */}
      <ToastContainer
        key={`toast-${isRTL ? 'rtl' : 'ltr'}`}
        position={isRTL ? "top-left" : "top-right"}
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={isRTL}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
        enableMultiContainer
        containerId={"service-management"}
      />
    </>
  );
}

export default Service;