// AddPlanModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Row, Col, Card, Button, InputGroup } from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import CustomUserLimitModal from "./CustomUserLimitModal";
import CustomStorageCapacityModal from "./CustomStorageCapacityModal";
import CustomInvoiceLimitModal from "./CustomInvoiceLimitModal";
import Swal from "sweetalert2";
import axios from "axios";
import BaseUrl from "../../../Api/BaseUrl";

const axiosInstance = axios.create({
  baseURL: BaseUrl,
});

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

const getCurrencySymbol = (currencyCode) => {
  const currency = currencies.find(c => c.code === currencyCode);
  return currency ? currency.symbol : "$";
};

const calculateTotalPrice = (basePrice, selectedModules, currencyCode) => {
  let total = parseFloat(basePrice) || 0;
  selectedModules.forEach(module => {
    total += parseFloat(module.price) || 0;
  });
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${total.toFixed(2)}`;
};

// Convert GB to bytes (1 GB = 1024^3 bytes)
const gbToBytes = (gb) => gb * 1024 * 1024 * 1024;

const AddPlanModal = ({ show, handleClose, handleAdd }) => {
  const staticModules = [
    { id: 1, label: "Account" },
    { id: 2, label: "Inventory" },
    { id: 3, label: "POS" },
    { id: 4, label: "Sales" },
    { id: 5, label: "Purchase" },
    { id: 6, label: "GST Report" },
    { id: 7, label: "User Management" }
  ];

  const [formData, setFormData] = useState({
    name: "",
    basePrice: "",
    billing: "Monthly",
    status: "Active",
    subscribers: "0",
    descriptions: [""],
    selectedModules: [],
    invoiceLimit: 10,
    additionalInvoicePrice: 2.00,
    userLimit: 1,
    storageCapacity: 5, // in GB
    currency: "USD"
  });
  
  const [availableModules] = useState(staticModules);
  const [showCustomUserLimitModal, setShowCustomUserLimitModal] = useState(false);
  const [showCustomStorageCapacityModal, setShowCustomStorageCapacityModal] = useState(false);
  const [showCustomInvoiceLimitModal, setShowCustomInvoiceLimitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Optional: Pre-select first module on open (if needed)
  useEffect(() => {
    if (show && formData.selectedModules.length === 0) {
      const firstModule = staticModules[0];
      setFormData(prev => ({
        ...prev,
        selectedModules: [{ id: firstModule.id, name: firstModule.label, price: 0 }]
      }));
    }
  }, [show]);

  const handleDescriptionChange = (index, value) => {
    const updated = [...formData.descriptions];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, descriptions: updated }));
  };
  
  const addDescriptionField = () => {
    setFormData((prev) => ({ ...prev, descriptions: [...prev.descriptions, ""] }));
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleInvoiceLimitChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ 
      ...prev, 
      invoiceLimit: value === "unlimited" ? "unlimited" : parseInt(value)
    }));
  };
  
  const handleUserLimitChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ 
      ...prev, 
      userLimit: value === "unlimited" ? "unlimited" : parseInt(value)
    }));
  };
  
  const handleStorageCapacityChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ 
      ...prev, 
      storageCapacity: value === "unlimited" ? "unlimited" : parseInt(value)
    }));
  };
  
  const handleCustomUserLimitSave = (newLimit) => {
    setFormData(prev => ({ ...prev, userLimit: newLimit }));
    setShowCustomUserLimitModal(false);
  };
  
  const handleCustomStorageCapacitySave = (newCapacity) => {
    setFormData(prev => ({ ...prev, storageCapacity: newCapacity }));
    setShowCustomStorageCapacityModal(false);
  };
  
  const handleCustomInvoiceLimitSave = (newLimit) => {
    setFormData(prev => ({ ...prev, invoiceLimit: newLimit }));
    setShowCustomInvoiceLimitModal(false);
  };
  
  const handleModuleToggle = (module) => {
    setFormData(prev => {
      const isSelected = prev.selectedModules.some(m => m.id === module.id);
      if (isSelected) {
        return {
          ...prev,
          selectedModules: prev.selectedModules.filter(m => m.id !== module.id)
        };
      } else {
        return {
          ...prev,
          selectedModules: [
            ...prev.selectedModules,
            { id: module.id, name: module.label, price: 0 }
          ]
        };
      }
    });
  };
  
  const handleModulePriceChange = (moduleId, price) => {
    setFormData(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.map(module => 
        module.id === moduleId ? { ...module, price: parseFloat(price) || 0 } : module
      )
    }));
  };
  
  const onAdd = async () => {
    try {
      setIsSubmitting(true);
      
      // Calculate storage capacity in bytes
      let storageCapacityBytes;
      if (formData.storageCapacity === "unlimited") {
        storageCapacityBytes = "-1"; // Send as string for unlimited
      } else {
        // Convert GB to bytes and then to string
        storageCapacityBytes = gbToBytes(parseInt(formData.storageCapacity)).toString();
      }
      
      const payload = {
        plan_name: formData.name.trim(),
        base_price: parseFloat(formData.basePrice) || 0,
        currency: formData.currency,
        invoice_limit: formData.invoiceLimit === "unlimited" ? -1 : parseInt(formData.invoiceLimit),
        additional_invoice_price: formData.invoiceLimit === "unlimited" ? 0 : parseFloat(formData.additionalInvoicePrice) || 0,
        user_limit: formData.userLimit === "unlimited" ? -1 : parseInt(formData.userLimit),
        // Convert storage_capacity to string
        storage_capacity: storageCapacityBytes,
        billing_cycle: formData.billing,
        status: formData.status,
        description: formData.descriptions.filter(desc => desc.trim() !== "").join("\n"),
        plan_modules: formData.selectedModules.map(module => ({
          module_name: module.name,
          module_price: parseFloat(module.price) || 0
        }))
      };
      
      const response = await axiosInstance.post("plans", payload);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Plan added successfully!",
      });
      
      handleAdd(response.data);
      
      // Reset form
      setFormData({ 
        name: "", 
        basePrice: "", 
        billing: "Monthly", 
        status: "Active", 
        subscribers: "0",
        descriptions: [""],
        selectedModules: [],
        invoiceLimit: 10,
        additionalInvoicePrice: 2.00,
        userLimit: 1,
        storageCapacity: 5,
        currency: "USD"
      });
      
      handleClose();
    } catch (error) {
      console.error("Error adding plan:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to add plan. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const totalPrice = calculateTotalPrice(
    parseFloat(formData.basePrice) || 0, 
    formData.selectedModules,
    formData.currency
  );
  
  const currencySymbol = getCurrencySymbol(formData.currency);
  
  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header style={{ backgroundColor: "#53b2a5", color: "#fff" }}>
          <Modal.Title>Add New Plan ({formData.currency})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Plan Name</Form.Label>
                  <Form.Control name="name" value={formData.name} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Base Price ({currencySymbol})</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="basePrice" 
                    value={formData.basePrice} 
                    onChange={handleChange} 
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Currency</Form.Label>
                  <Form.Select name="currency" value={formData.currency} onChange={handleChange}>
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol}) - {currency.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Invoice Limit</Form.Label>
                  <InputGroup>
                    <Form.Select 
                      name="invoiceLimit" 
                      value={formData.invoiceLimit || ""} 
                      onChange={handleInvoiceLimitChange}
                    >
                      <option value="10">10 invoices</option>
                      <option value="50">50 invoices</option>
                      <option value="100">100 invoices</option>
                      <option value="500">500 invoices</option>
                      <option value="1000">1000 invoices</option>
                      <option value="unlimited">Unlimited</option>
                    </Form.Select>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setShowCustomInvoiceLimitModal(true)}
                    >
                      Custom
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Number of invoices included in the base price
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Additional Invoice Price ({currencySymbol})</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="additionalInvoicePrice" 
                    value={formData.additionalInvoicePrice || ""} 
                    onChange={handleChange} 
                    step="0.01"
                    disabled={formData.invoiceLimit === "unlimited"}
                  />
                  <Form.Text className="text-muted">
                    {formData.invoiceLimit === "unlimited" 
                      ? "Not applicable for unlimited plans" 
                      : "Price per invoice beyond the limit"}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>User Limit</Form.Label>
                  <InputGroup>
                    <Form.Select 
                      name="userLimit" 
                      value={formData.userLimit || ""} 
                      onChange={handleUserLimitChange}
                    >
                      <option value="1">1 user</option>
                      <option value="3">3 users</option>
                      <option value="5">5 users</option>
                      <option value="10">10 users</option>
                      <option value="20">20 users</option>
                      <option value="50">50 users</option>
                      <option value="unlimited">Unlimited</option>
                    </Form.Select>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setShowCustomUserLimitModal(true)}
                    >
                      Custom
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Maximum number of users allowed
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Storage Capacity</Form.Label>
                  <InputGroup>
                    <Form.Select 
                      name="storageCapacity" 
                      value={formData.storageCapacity || ""} 
                      onChange={handleStorageCapacityChange}
                    >
                      <option value="5">5 GB</option>
                      <option value="10">10 GB</option>
                      <option value="20">20 GB</option>
                      <option value="50">50 GB</option>
                      <option value="100">100 GB</option>
                      <option value="200">200 GB</option>
                      <option value="500">500 GB</option>
                      <option value="unlimited">Unlimited</option>
                    </Form.Select>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setShowCustomStorageCapacityModal(true)}
                    >
                      Custom
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Storage capacity included in the plan
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Billing Cycle</Form.Label>
                  <Form.Select name="billing" value={formData.billing} onChange={handleChange}>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">InActive</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">Modules</Form.Label>
                {/* Disabled Add Module button */}
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  disabled
                >
                  Add New Module
                </Button>
              </div>
              <Card className="mb-3">
                <Card.Body>
                  {availableModules.map(module => {
                    const isSelected = formData.selectedModules.some(m => m.id === module.id);
                    const selectedModule = formData.selectedModules.find(m => m.id === module.id);
                    
                    return (
                      <Row key={module.id} className="mb-3 align-items-center">
                        <Col md={5}>
                          <Form.Check 
                            type="checkbox"
                            id={`module-${module.id}`}
                            label={module.label}
                            checked={isSelected}
                            onChange={() => handleModuleToggle(module)}
                          />
                        </Col>
                        <Col md={5}>
                          {isSelected && (
                            <InputGroup>
                              <InputGroup.Text>{currencySymbol}</InputGroup.Text>
                              <Form.Control
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Enter price"
                                value={selectedModule?.price ?? ""}
                                onChange={(e) => handleModulePriceChange(module.id, e.target.value)}
                              />
                            </InputGroup>
                          )}
                        </Col>
                        <Col md={2} className="text-end">
                          {/* Delete button removed */}
                        </Col>
                      </Row>
                    );
                  })}
                </Card.Body>
              </Card>
              <div className="alert alert-info">
                <strong>Total Price: {totalPrice}</strong> (Base Price + Selected Modules)
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Descriptions</Form.Label>
              {formData.descriptions.map((desc, idx) => (
                <div key={idx} className="d-flex mb-2 gap-2 align-items-center">
                  <Form.Control
                    value={desc}
                    onChange={(e) => handleDescriptionChange(idx, e.target.value)}
                    placeholder={`Description ${idx + 1}`}
                  />
                  {idx === formData.descriptions.length - 1 && (
                    <Button variant="outline-success" size="sm" onClick={addDescriptionField}>
                      +
                    </Button>
                  )}
                </div>
              ))}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={handleClose}>Close</Button>
          <Button 
            style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }} 
            onClick={onAdd}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Plan"}
          </Button>
        </Modal.Footer>
      </Modal>
      
      <CustomUserLimitModal 
        show={showCustomUserLimitModal}
        handleClose={() => setShowCustomUserLimitModal(false)}
        handleSave={handleCustomUserLimitSave}
        currentUserLimit={formData.userLimit}
      />
      
      <CustomStorageCapacityModal 
        show={showCustomStorageCapacityModal}
        handleClose={() => setShowCustomStorageCapacityModal(false)}
        handleSave={handleCustomStorageCapacitySave}
        currentStorageCapacity={formData.storageCapacity}
      />
      
      <CustomInvoiceLimitModal 
        show={showCustomInvoiceLimitModal}
        handleClose={() => setShowCustomInvoiceLimitModal(false)}
        handleSave={handleCustomInvoiceLimitSave}
        currentInvoiceLimit={formData.invoiceLimit}
      />
    </>
  );
};

export default AddPlanModal;