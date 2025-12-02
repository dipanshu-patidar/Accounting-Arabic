// ViewPlanModal.jsx
import React from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';

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
  try {
    if (!currencyCode) return "$";
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : "$";
  } catch (error) {
    console.error("Error getting currency symbol:", error);
    return "$";
  }
};

const getCurrencyName = (currencyCode) => {
  try {
    if (!currencyCode) return "US Dollar";
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.name : "US Dollar";
  } catch (error) {
    console.error("Error getting currency name:", error);
    return "US Dollar";
  }
};

const calculateTotalPrice = (basePrice, selectedModules, currencyCode) => {
  try {
    let total = parseFloat(basePrice) || 0;
    if (selectedModules && Array.isArray(selectedModules)) {
      selectedModules.forEach(module => {
        total += parseFloat(module.price || module.module_price || 0) || 0;
      });
    }
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${total.toFixed(2)}`;
  } catch (error) {
    console.error("Error calculating total price:", error);
    return "$0.00";
  }
};

const formatInvoiceLimit = (limit) => {
  try {
    if (limit === "unlimited" || limit === -1) return "Unlimited";
    return `${limit} invoices`;
  } catch (error) {
    console.error("Error formatting invoice limit:", error);
    return "Unknown";
  }
};

const formatUserLimit = (limit) => {
  try {
    if (limit === "unlimited" || limit === -1) return "Unlimited";
    return `${limit} users`;
  } catch (error) {
    console.error("Error formatting user limit:", error);
    return "Unknown";
  }
};

const formatStorageCapacity = (capacity) => {
  try {
    if (capacity === "unlimited" || capacity === -1) return "Unlimited";
    return `${capacity} GB`;
  } catch (error) {
    console.error("Error formatting storage capacity:", error);
    return "Unknown";
  }
};

const ViewPlanModal = ({ show, handleClose, plan }) => {
  try {
    if (!plan) return null;
    
    // Safely extract values with fallbacks
    const planName = plan.name || "Unnamed Plan";
    const basePrice = plan.basePrice || plan.base_price || 0;
    const billing = plan.billing || plan.billing_cycle || "Monthly";
    const status = plan.status || "Active";
    const subscribers = plan.subscribers || 0;
    const invoiceLimit = plan.invoiceLimit || plan.invoice_limit || 10;
    const additionalInvoicePrice = plan.additionalInvoicePrice || plan.additional_invoice_price || 0;
    const userLimit = plan.userLimit || plan.user_limit || 1;
    const storageCapacity = plan.storageCapacity || plan.storage_capacity_gb || 5;
    const currency = plan.currency || "USD";
    const descriptions = plan.descriptions || [];
    const selectedModules = plan.selectedModules || plan.modules || [];
    
    const totalPrice = calculateTotalPrice(basePrice, selectedModules, currency);
    const currencySymbol = getCurrencySymbol(currency);
    const currencyName = getCurrencyName(currency);
    
    return (
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header style={{ backgroundColor: "#53b2a5", color: "#fff" }}>
          <Modal.Title>View Plan - {planName} ({currency})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <p><strong>Plan Name:</strong> {planName}</p>
              <p><strong>Base Price:</strong> {currencySymbol}{basePrice}</p>
              <p><strong>Total Price:</strong> {totalPrice}</p>
              <p><strong>Currency:</strong> {currency} ({currencySymbol}) - {currencyName}</p>
              <p><strong>Billing:</strong> {billing}</p>
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Subscribers:</strong> {subscribers}</p>
              <p><strong>Invoice Limit:</strong> {formatInvoiceLimit(invoiceLimit)}</p>
              <p><strong>Additional Invoice Price:</strong> 
                {invoiceLimit === "unlimited" || invoiceLimit === -1
                  ? " Not applicable" 
                  : `${currencySymbol}${additionalInvoicePrice}/invoice`}
              </p>
              <p><strong>User Limit:</strong> {formatUserLimit(userLimit)}</p>
              <p><strong>Storage Capacity:</strong> {formatStorageCapacity(storageCapacity)}</p>
            </Col>
            <Col md={6}>
              <p><strong>Selected Modules:</strong></p>
              <ul>
                {selectedModules && selectedModules.length > 0 ? (
                  selectedModules.map((module, index) => {
                    const moduleName = module.name || module.label || "Module";
                    const modulePrice = module.price || module.module_price || 0;
                    return (
                      <li key={module.id || index}>
                        {moduleName} (+{currencySymbol}{parseFloat(modulePrice).toFixed(2)})
                      </li>
                    );
                  })
                ) : (
                  <li>No modules selected</li>
                )}
              </ul>
            </Col>
          </Row>
          
          {descriptions && descriptions.length > 0 && (
            <div>
              <strong>Descriptions:</strong>
              <ul>
                {descriptions.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  } catch (error) {
    console.error("Error in ViewPlanModal:", error);
    
    // Return a fallback UI in case of error
    return (
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header style={{ backgroundColor: "#dc3545", color: "#fff" }}>
          <Modal.Title>Error Displaying Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">
            <h5>Something went wrong</h5>
            <p>We encountered an error while trying to display the plan details. This could be due to invalid or incomplete data.</p>
            <p className="mb-0">Error details: {error.message || "Unknown error"}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
};

export default ViewPlanModal;