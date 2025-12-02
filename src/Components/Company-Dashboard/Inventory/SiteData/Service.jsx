import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import GetCompanyId from "../../../../Api/GetCompanyId";
import axiosInstance from "../../../../Api/axiosInstance";
import BaseUrl from "../../../../Api/BaseUrl";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const companyId = GetCompanyId();

const initialServices = [];
const initialUnitOptions = [];

function Service() {
  const [services, setServices] = useState(initialServices);
  const [unitOptions, setUnitOptions] = useState(initialUnitOptions); 
  
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ 
    id: null, 
    name: "", 
    sku: "", 
    serviceDescription: "", 
    unit: "piece",
    price: "", 
    tax: "", 
    remarks: "", 
    isInvoiceable: true 
  });
  const [editMode, setEditMode] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchUnitOptions();
  }, []);

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      // ✅ Updated endpoint to include company_id
      const response = await axiosInstance.get(`${BaseUrl}services/company/${companyId}`);
      
      console.log("Services API Response:", response.data); // Debug log
      
      if (response.data.success && response.data.data) {
        const transformedServices = response.data.data.map(service => ({
          id: service.id,
          name: service.service_name,
          sku: service.sku,
          serviceDescription: service.description,
          unit: service.uom_name, // ✅ Changed from 'uom' to 'uom_name' to match API response
          price: service.price,
          tax: service.tax_percent,
          remarks: service.remarks,
          isInvoiceable: service.allow_in_invoice === "1"
        }));
        setServices(transformedServices);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error.response?.data || error.message);
      toast.error("Failed to fetch services. Please try again.", {
        toastId: 'fetch-services-error',
        autoClose: 3000
      });
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  // ✅ UPDATED: Fetch unit options using the new API endpoint
  const fetchUnitOptions = async () => {
    try {
      setUnitsLoading(true);
      // ✅ Updated endpoint to fetch unit details by company ID
      const response = await axiosInstance.get(`${BaseUrl}unit-details/getUnitDetailsByCompanyId/${companyId}`);
      
      console.log("Unit Details API Response:", response.data); // Debug log
      
      if (response.data.success && response.data.data) {
        // Extract uom_name from each unit object
        const unitNames = response.data.data.map(unit => unit.uom_name);
        setUnitOptions(unitNames);
      }
    } catch (error) {
      console.error("Error fetching unit options:", error.response?.data || error.message);
      // Fallback to default options
      setUnitOptions(["piece", "kg", "meter", "liter", "box", "day", "yard", "sq.ft", "cubic meter", "Project"]);
    } finally {
      setUnitsLoading(false);
    }
  };

  const handleShow = () => {
    const defaultUnit = unitOptions.length > 0 ? unitOptions[0] : "piece";
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

  const handleClose = () => setShow(false);
  const handleViewClose = () => setShowView(false);
  const handleDeleteConfirmClose = () => setShowDeleteConfirm(false);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Service Name Required", {
        toastId: 'service-name-required',
        autoClose: 3000
      });
      return;
    }
    
    try {
      setLoading(true);
      const payload = {
        company_id: parseInt(companyId), // ✅ Convert to integer
        service_name: form.name,
        sku: form.sku,
        description: form.serviceDescription,
        uom: form.unit, // Send string
        price: parseFloat(form.price) || 0,
        tax_percent: parseFloat(form.tax) || 0,
        allow_in_invoice: form.isInvoiceable ? 1 : 0,
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

  // ✅ FIXED: Edit handler — ensure unit is in unitOptions
  const handleEdit = (service) => {
    // Ensure the unit from service exists in unitOptions (case-insensitive fallback)
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
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(`${BaseUrl}services/${deleteId}`);
      toast.success("Service deleted successfully!", {
        toastId: 'service-delete-success',
        autoClose: 3000
      });
      await fetchServices();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting service:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Failed to delete service. Please try again.";
      toast.error(errorMessage, {
        toastId: 'service-delete-error',
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (data) => {
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

  return (
    <>
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Service Management</h2>
          <Button style={customButtonStyle} onClick={handleShow} disabled={loading}>
            {loading ? 'Loading...' : 'Add Service'}
          </Button>
        </div>
        
        <div className="table-responsive">
          <Table striped bordered hover className="shadow-sm">
            <thead className="">
              <tr>
                <th>Service Name</th>
                <th>Service Description</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {servicesLoading ? (
                <tr>
                  <td colSpan="3" className="text-center py-3">
                    <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                    Loading services...
                  </td>
                </tr>
              ) : services.length > 0 ? (
                services.map((s) => (
                  <tr key={s.id}>
                    <td className="align-middle">{s.name}</td>
                    <td className="align-middle">{s.serviceDescription}</td>
                    <td className="text-center align-middle">
                      <Button 
                        size="sm" 
                        style={viewButtonStyle} 
                        onClick={() => handleView(s)} 
                        title="View"
                        className="me-1"
                      >
                        <FaEye />
                      </Button>
                      <Button 
                        size="sm" 
                        style={editButtonStyle} 
                        onClick={() => handleEdit(s)} 
                        title="Edit"
                        className="me-1"
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        size="sm" 
                        style={deleteButtonStyle} 
                        onClick={() => handleDeleteClick(s.id)} 
                        title="Delete"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-3">
                    No Services Added
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
                
        {/* Add/Edit Modal */}
        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton className="">
            <Modal.Title>{editMode ? "Edit Service" : "Add Service"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Service Name</Form.Label>
                <Form.Control 
                  name="name" 
                  value={form.name} 
                  onChange={handleInput} 
                  required 
                  className="shadow-sm"
                  placeholder="Enter service name"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>SKU</Form.Label>
                <Form.Control 
                  name="sku" 
                  value={form.sku} 
                  onChange={handleInput} 
                  className="shadow-sm"
                  placeholder="Enter SKU (optional)"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Service Description</Form.Label>
                <Form.Control 
                  as="textarea" 
                  name="serviceDescription" 
                  value={form.serviceDescription} 
                  onChange={handleInput} 
                  rows={3}
                  className="shadow-sm"
                  placeholder="Describe the service"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Unit of Measure</Form.Label>
                <Form.Select 
                  name="unit" 
                  value={form.unit} 
                  onChange={handleInput}
                  className="shadow-sm"
                  disabled={unitsLoading}
                >
                  {unitsLoading ? (
                    <option value="">Loading units...</option>
                  ) : (
                    unitOptions.map((unitName, index) => (
                      <option key={index} value={unitName}>
                        {unitName}
                      </option>
                    ))
                  )}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control 
                  type="number"
                  step="0.01"
                  name="price" 
                  value={form.price} 
                  onChange={handleInput} 
                  placeholder="Enter service price"
                  className="shadow-sm"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Default Tax%</Form.Label>
                <Form.Control 
                  name="tax" 
                  value={form.tax} 
                  onChange={handleInput} 
                  className="shadow-sm"
                  placeholder="e.g. 18"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="isInvoiceable"
                  checked={form.isInvoiceable || false}
                  onChange={handleInput}
                  label=" Allow this service to be added in invoices"
                />
                <Form.Text className="text-muted">
                  If unchecked, this service won't appear when creating invoices.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Remarks</Form.Label>
                <Form.Control 
                  name="remarks" 
                  value={form.remarks} 
                  onChange={handleInput} 
                  className="shadow-sm"
                  as="textarea"
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
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button style={customButtonStyle} onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : (editMode ? "Update" : "Save") + " Service"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* View Modal */}
        <Modal show={showView} onHide={handleViewClose} centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>Service Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {viewData && (
              <div className="p-3">
                <div className="mb-4">
                  <h5 className="text-primary">{viewData.name}</h5>
                  <p className="text-muted mb-0">SKU: <strong>{viewData.sku || 'N/A'}</strong></p>
                </div>

                <div className="mb-4">
                  <h6>Service Description</h6>
                  <p>{viewData.serviceDescription || 'N/A'}</p>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Unit of Measure</h6>
                    <p className="text-dark">{viewData.unit}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Default Tax</h6>
                    <p className="text-dark">{viewData.tax || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Price</h6>
                    <p className="text-success">
                      <strong>₹{parseFloat(viewData.price || 0).toFixed(2)}</strong>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Available in Invoices</h6>
                    <p>
                      {viewData.isInvoiceable ? (
                        <span className="badge bg-success">Yes</span>
                      ) : (
                        <span className="badge bg-secondary">No</span>
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <h6>Remarks</h6>
                  <p>{viewData.remarks || 'N/A'}</p>
                  <p className="text-muted small fst-italic">
                    Remarks are for internal use only; they do not display anywhere.
                  </p>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleViewClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteConfirm} onHide={handleDeleteConfirmClose} centered>
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this service? This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleDeleteConfirmClose}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
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
      />
    </>
  );
}

export default Service;