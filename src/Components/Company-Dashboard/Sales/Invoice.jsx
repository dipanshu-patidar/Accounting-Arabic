import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Table, Button, Badge, Modal, Form, Row, Col, Card, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaTrash, FaEye } from "react-icons/fa";
import MultiStepSalesForm from './MultiStepSalesForm';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';

// Helper function to get step status
const getStepStatus = (steps, stepName) => {
  if (!steps || !steps[stepName]) return 'pending';
  return steps[stepName].status || 'pending';
};

// Helper function to get step data
const getStepData = (steps, stepName) => {
  if (!steps || !steps[stepName]) return {};
  return steps[stepName] || {};
};

const statusBadge = (status) => {
  const variant = status === 'completed' ? 'success' : status === 'pending' ? 'secondary' : 'warning';
  return <Badge bg={variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
};

const Invoice = () => {
  const companyId = GetCompanyId();

  // Permission states
  const [userPermissions, setUserPermissions] = useState([]);
  const [invoicePermissions, setInvoicePermissions] = useState({
    can_create: false,
    can_view: false,
    can_update: false,
    can_delete: false
  });

  // Check user permissions
  useEffect(() => {
    // Get user role and permissions
    const role = localStorage.getItem("role");

    // Superadmin and Company roles have access to all modules
    if (role === "SUPERADMIN" || role === "COMPANY") {
      setInvoicePermissions({
        can_create: true,
        can_view: true,
        can_update: true,
        can_delete: true
      });
    } else if (role === "USER") {
      // For USER role, check specific permissions
      try {
        const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
        setUserPermissions(permissions);

        // Check if user has permissions for Invoice module
        const invoicePermission = permissions.find(p => p.module_name === "Invoice");
        if (invoicePermission) {
          setInvoicePermissions({
            can_create: invoicePermission.can_create,
            can_view: invoicePermission.can_view,
            can_update: invoicePermission.can_update,
            can_delete: invoicePermission.can_delete
          });
        }
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setInvoicePermissions({
          can_create: false,
          can_view: false,
          can_update: false,
          can_delete: false
        });
      }
    } else {
      setInvoicePermissions({
        can_create: false,
        can_view: false,
        can_update: false,
        can_delete: false
      });
    }
  }, []);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const [stepModal, setStepModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0, view: 0, delete: 0 });

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [invoiceNoFilter, setInvoiceNoFilter] = useState('');
  const [stepNameFilter, setStepNameFilter] = useState('');
  const [quotationStatusFilter, setQuotationStatusFilter] = useState('');
  const [salesOrderStatusFilter, setSalesOrderStatusFilter] = useState('');
  const [deliveryChallanStatusFilter, setDeliveryChallanStatusFilter] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  // 🔥 Map dropdown value to tab key
  const getTabKeyFromStepName = (stepName) => {
    const mapping = {
      "Quotation": "quotation",
      "Sales Order": "sales_order",
      "Delivery Challan": "delivery_challan",
      "Invoice": "invoice",
      "Payment": "payment"
    };
    return mapping[stepName] || "quotation";
  };

  // 🔥 Fetch data from API function
  const fetchOrders = async () => {
    if (!companyId || !invoicePermissions.can_view) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Reset error state before fetching
      console.log(`Fetching orders for company ID: ${companyId}`);
      const response = await axiosInstance.get(`sales-order/company/${companyId}`);

      // The API returns { success, message, data }, so we use response.data.data
      const apiData = response.data?.data;
      if (Array.isArray(apiData)) {
        setOrders(apiData);
      } else {
        console.warn("API returned non-array data, defaulting to empty array:", response.data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching sales orders:", err);
      setError("Failed to load sales orders. Please try again later.");
      setOrders([]); // Ensure orders is always an array
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Fetch data from API when component mounts or companyId changes
  useEffect(() => {
    fetchOrders();
  }, [companyId, invoicePermissions.can_view]);

  // 🔥 Open modal when stepNameFilter changes
  useEffect(() => {
    if (stepNameFilter) {
      const tabKey = getTabKeyFromStepName(stepNameFilter);
      // Open modal with no order (new workflow) but at selected step
      setSelectedOrder({ draftStep: tabKey });
      setStepModal(true);
    }
  }, [stepNameFilter]);

  const handleCreateNewInvoice = (order = null) => {
    if (!invoicePermissions.can_create) {
      alert("You don't have permission to create invoices.");
      return;
    }
    
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    setSelectedOrder(order);
    setStepModal(true);
  };

  const handleViewOrder = (order) => {
    if (!invoicePermissions.can_view) {
      alert("You don't have permission to view invoices.");
      return;
    }
    
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.view += 1;
    
    setViewOrder(order);
    setViewModal(true);
  };

  const handleCloseModal = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setStepModal(false);
    
    // Force modal remount on next open
    modalKeyRef.current.main += 1;
  };
  
  // Handle modal exit - cleanup after animation
  const handleModalExited = () => {
    // Reset form state after modal fully closed
    setSelectedOrder(null);
    // 🔥 Reset step filter when closing modal
    setStepNameFilter('');
    isCleaningUpRef.current = false;
  };
  
  const handleCloseViewModal = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setViewModal(false);
    
    // Force modal remount on next open
    modalKeyRef.current.view += 1;
  };
  
  // Handle view modal exit - cleanup after animation
  const handleViewModalExited = () => {
    // Reset view order after modal fully closed
    setViewOrder(null);
    isCleaningUpRef.current = false;
  };
  
  const handleCloseDeleteModal = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setDeleteConfirm({ show: false, id: null });
    
    // Force modal remount on next open
    modalKeyRef.current.delete += 1;
  };
  
  // Handle delete modal exit - cleanup after animation
  const handleDeleteModalExited = () => {
    // Reset delete confirm after modal fully closed
    setDeleteConfirm({ show: false, id: null });
    isCleaningUpRef.current = false;
  };

  const handleFormSubmit = async (formData, lastStep = 'quotation') => {
    const isEdit = selectedOrder?.id;

    try {
      if (isEdit && !invoicePermissions.can_update) {
        alert("You don't have permission to update invoices.");
        return;
      }
      
      if (!isEdit && !invoicePermissions.can_create) {
        alert("You don't have permission to create invoices.");
        return;
      }

      if (isEdit) {
        // Update existing order
        console.log(`Updating order with ID: ${selectedOrder.id}`, formData);
        // Note: The PUT endpoint might need adjustment based on how the backend expects the payload
        await axiosInstance.put(`sales-order/create-sales-order/${selectedOrder.id}`, {
          ...formData,
          company_id: companyId
        });
      } else {
        // Create new order
        console.log("Creating new order", formData);
        await axiosInstance.post('sales-order/create-sales-order', {
          ...formData,
          company_id: companyId
        });
      }

      // Refetch data after successful operation
      console.log("Refetching orders after save...");
      await fetchOrders();
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleCloseModal();
    } catch (err) {
      console.error("Error saving sales order:", err);
      setError("Failed to save sales order. Please check the console for details.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!invoicePermissions.can_delete) {
      alert("You don't have permission to delete invoices.");
      return;
    }
    
    try {
      await axiosInstance.delete(`sales-order/${orderId}`);

      // Update the orders list after successful deletion
      setOrders(orders.filter(order => order.id !== orderId));
      setDeleteConfirm({ show: false, id: null });

      // Refetch orders to ensure the list is up to date
      await fetchOrders();
    } catch (err) {
      console.error("Error deleting sales order:", err);
      setError("Failed to delete sales order. Please try again later.");
      setDeleteConfirm({ show: false, id: null });
    }
  };

  // 🔥 Fixed useMemo hook: Extract data based on new API structure
  const filteredOrders = useMemo(() => {
    const ordersArray = Array.isArray(orders) ? orders : [];

    return ordersArray.filter(order => {
      // Extract step data from the nested structure
      const quotationData = getStepData(order.steps, 'quotation');
      const salesOrderData = getStepData(order.steps, 'sales_order');
      const invoiceData = getStepData(order.steps, 'invoice');

      // Use quotation date as the primary date for filtering
      let orderDate = new Date();
      if (quotationData.quotation_date) {
        orderDate = new Date(quotationData.quotation_date);
      } else if (salesOrderData.SO_date) {
        orderDate = new Date(salesOrderData.SO_date);
      }

      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      const dateMatch = (!from || orderDate >= from) && (!to || orderDate <= to);

      const invoiceNoMatch =
        !invoiceNoFilter ||
        (invoiceData.invoice_no &&
          invoiceData.invoice_no.toLowerCase().startsWith(invoiceNoFilter.toLowerCase()));

      const matchesQuotation = !quotationStatusFilter || getStepStatus(order.steps, 'quotation') === quotationStatusFilter.toLowerCase();
      const matchesSalesOrder = !salesOrderStatusFilter || getStepStatus(order.steps, 'sales_order') === salesOrderStatusFilter.toLowerCase();
      const matchesDeliveryChallan = !deliveryChallanStatusFilter || getStepStatus(order.steps, 'delivery_challan') === deliveryChallanStatusFilter.toLowerCase();
      const matchesInvoice = !invoiceStatusFilter || getStepStatus(order.steps, 'invoice') === invoiceStatusFilter.toLowerCase();
      const matchesPayment = !paymentStatusFilter || getStepStatus(order.steps, 'payment') === paymentStatusFilter.toLowerCase();

      let matchesStepName = true;
      if (stepNameFilter) {
        const stepToCheck = getTabKeyFromStepName(stepNameFilter);
        matchesStepName = getStepStatus(order.steps, stepToCheck) === 'completed';
      }

      return (
        dateMatch &&
        invoiceNoMatch &&
        matchesQuotation &&
        matchesSalesOrder &&
        matchesDeliveryChallan &&
        matchesInvoice &&
        matchesPayment &&
        matchesStepName
      );
    });
  }, [
    orders,
    fromDate,
    toDate,
    invoiceNoFilter,
    stepNameFilter,
    quotationStatusFilter,
    salesOrderStatusFilter,
    deliveryChallanStatusFilter,
    invoiceStatusFilter,
    paymentStatusFilter,
  ]);

  // If user doesn't have view permission, show access denied message
  if (!invoicePermissions.can_view) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="text-center">
          <h3 className="text-danger">Access Denied</h3>
          <p>You don't have permission to view the Invoice module.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <FaArrowLeft size={20} color="blue" />
          <h5 className="mb-0">Sales Workflow</h5>
        </div>
        {invoicePermissions.can_create && (
          <Button
            variant="primary"
            onClick={() => handleCreateNewInvoice()}
            style={{ backgroundColor: "#53b2a5", border: "none", padding: "8px 16px" }}
          >
            + Create sales order
          </Button>
        )}
      </div>

      {/* 🔥 Sales Steps Dropdown + Show Filters Button */}
      <div className="d-flex justify-content-between align-items-end mb-3">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* 🔥 Advanced Filters (Collapsible) */}
      {showFilters && (
        <div className="mb-3 p-3 bg-light rounded border d-flex flex-wrap gap-3 align-items-end">
          <div>
            <label className="form-label text-secondary">From Date</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label text-secondary">To Date</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label text-secondary">Invoice No.</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. INV-123"
              value={invoiceNoFilter}
              onChange={(e) => setInvoiceNoFilter(e.target.value)}
              style={{ minWidth: "150px" }}
            />
          </div>

          {/* Quotation Status */}
          <div>
            <label className="form-label text-secondary">Quotation</label>
            <select
              className="form-select"
              value={quotationStatusFilter}
              onChange={(e) => setQuotationStatusFilter(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sales Order Status */}
          <div>
            <label className="form-label text-secondary">Sales Order</label>
            <select
              className="form-select"
              value={salesOrderStatusFilter}
              onChange={(e) => setSalesOrderStatusFilter(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Delivery Challan Status */}
          <div>
            <label className="form-label text-secondary">Delivery Challan</label>
            <select
              className="form-select"
              value={deliveryChallanStatusFilter}
              onChange={(e) => setDeliveryChallanStatusFilter(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Invoice Status */}
          <div>
            <label className="form-label text-secondary">Invoice</label>
            <select
              className="form-select"
              value={invoiceStatusFilter}
              onChange={(e) => setInvoiceStatusFilter(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="form-label text-secondary">Payment</label>
            <select
              className="form-select"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              style={{ minWidth: "130px" }}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFromDate('');
                setToDate('');
                setInvoiceNoFilter('');
                setQuotationStatusFilter('');
                setSalesOrderStatusFilter('');
                setDeliveryChallanStatusFilter('');
                setInvoiceStatusFilter('');
                setPaymentStatusFilter('');
              }}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        /* Table */
        <Table bordered hover responsive className="text-center align-middle">
          <thead className="">
            <tr>
              <th>#</th>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Quotation</th>
              <th>Sales Order</th>
              <th>Delivery Challan</th>
              <th>Invoice</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders?.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center text-muted">
                  No records found.
                </td>
              </tr>
            ) : (
              filteredOrders?.map((order, idx) => {
                // Extract data for display
                const quotationData = getStepData(order.steps, 'quotation');
                const salesOrderData = getStepData(order.steps, 'sales_order');
                const invoiceData = getStepData(order.steps, 'invoice');
                const paymentData = getStepData(order.steps, 'payment');

                // Determine customer name
                const customerName = quotationData.qoutation_to_customer_name ||
                  order.company_info?.company_name || 'Unknown';

                // Determine date
                let displayDate = 'N/A';
                if (quotationData.quotation_date) {
                  displayDate = new Date(quotationData.quotation_date).toLocaleDateString();
                } else if (invoiceData.invoice_date) {
                  displayDate = new Date(invoiceData.invoice_date).toLocaleDateString();
                }

                // Calculate total amount from items if not available directly
                let displayAmount = 'N/A';
                if (order.total && order.total !== "0") {
                  displayAmount = `$${order.total}`;
                } else if (order.items && order.items.length > 0) {
                  const total = order.items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
                  displayAmount = `$${total.toFixed(2)}`;
                }

                return (
                  <tr key={order.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{invoiceData.invoice_no || '-'}</td>
                    <td>{customerName}</td>
                    <td>{displayDate}</td>
                    <td>{displayAmount}</td>
                    <td>{statusBadge(getStepStatus(order.steps, 'quotation'))}</td>
                    <td>{statusBadge(getStepStatus(order.steps, 'sales_order'))}</td>
                    <td>{statusBadge(getStepStatus(order.steps, 'delivery_challan'))}</td>
                    <td>{statusBadge(getStepStatus(order.steps, 'invoice'))}</td>
                    <td>{statusBadge(getStepStatus(order.steps, 'payment'))}</td>
                    <td className='d-flex'>
                      {invoicePermissions.can_view && (
                        <Button
                          size="sm"
                          className="me-1 mb-1"
                          variant="outline-info"
                          onClick={() => handleViewOrder(order)}
                          title="View Details"
                        >
                          <FaEye />
                        </Button>
                      )}
                      {invoicePermissions.can_update && (
                        <Button
                          size="sm"
                          className="me-1 mb-1"
                          variant="outline-primary"
                          onClick={() => handleCreateNewInvoice(order)}
                          title="Continue Workflow"
                        >
                          Continue
                        </Button>
                      )}
                      {invoicePermissions.can_delete && (
                        <Button
                          size="sm"
                          className="mb-1"
                          variant="outline-danger"
                          onClick={() => setDeleteConfirm({ show: true, id: order.company_info.id })}
                          title="Delete Order"
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </Table>
      )}

      {/* Modal for creating/editing sales order */}
      <Modal 
        key={modalKeyRef.current.main}
        show={stepModal} 
        onHide={handleCloseModal}
        onExited={handleModalExited}
        size="xl" 
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedOrder && selectedOrder.id
              ? 'Continue Sales Workflow'
              : stepNameFilter
                ? `Create New - ${stepNameFilter}`
                : 'Create Sales Order'
            }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ position: "relative", overflow: "visible" }}>
          {stepModal && (
            <MultiStepSalesForm
              key={`form-${modalKeyRef.current.main}`}
              initialData={selectedOrder}
              initialStep={selectedOrder?.draftStep || getTabKeyFromStepName(stepNameFilter) || 'quotation'}
              onSubmit={handleFormSubmit}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* View Order Details Modal */}
      <Modal 
        key={modalKeyRef.current.view}
        show={viewModal} 
        onHide={handleCloseViewModal}
        onExited={handleViewModalExited}
        size="xl" 
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Sales Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewOrder && (
            <div>
              {/* Company Info */}
              <Card className="mb-4">
                <Card.Header className="bg-light">Company Information</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Company Name:</strong> {viewOrder.company_info?.company_name || 'N/A'}</p>
                      <p><strong>Company ID:</strong> {viewOrder.company_info?.company_id || 'N/A'}</p>
                      <p><strong>Address:</strong> {viewOrder.company_info?.company_address || 'N/A'}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Email:</strong> {viewOrder.company_info?.company_email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {viewOrder.company_info?.company_phone || 'N/A'}</p>
                      <p><strong>Created At:</strong> {viewOrder.company_info?.created_at ? new Date(viewOrder.company_info.created_at).toLocaleDateString() : 'N/A'}</p>
                    </Col>
                  </Row>
                  {viewOrder.company_info?.terms && (
                    <div className="mt-3">
                      <p><strong>Terms & Conditions:</strong></p>
                      <div className="border p-2 rounded bg-light">
                        {viewOrder.company_info.terms.split('\r\n').map((term, idx) => (
                          <p key={idx} className="mb-1">{term}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Shipping Details */}
              <Card className="mb-4">
                <Card.Header className="bg-light">Shipping Details</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h6>Bill To</h6>
                      <p><strong>Name:</strong> {viewOrder.shipping_details?.bill_to_name || 'N/A'}</p>
                      <p><strong>Address:</strong> {viewOrder.shipping_details?.bill_to_address || 'N/A'}</p>
                      <p><strong>Email:</strong> {viewOrder.shipping_details?.bill_to_email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {viewOrder.shipping_details?.bill_to_phone || 'N/A'}</p>
                      <p><strong>Attention:</strong> {viewOrder.shipping_details?.bill_to_attention_name || 'N/A'}</p>
                    </Col>
                    <Col md={6}>
                      <h6>Ship To</h6>
                      <p><strong>Name:</strong> {viewOrder.shipping_details?.ship_to_name || 'N/A'}</p>
                      <p><strong>Address:</strong> {viewOrder.shipping_details?.ship_to_address || 'N/A'}</p>
                      <p><strong>Email:</strong> {viewOrder.shipping_details?.ship_to_email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {viewOrder.shipping_details?.ship_to_phone || 'N/A'}</p>
                      <p><strong>Attention:</strong> {viewOrder.shipping_details?.ship_to_attention_name || 'N/A'}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Steps Information */}
              <Card className="mb-4">
                <Card.Header className="bg-light">Workflow Steps</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h6>Quotation</h6>
                      <p><strong>Status:</strong> {statusBadge(getStepStatus(viewOrder.steps, 'quotation'))}</p>
                      <p><strong>Quotation No:</strong> {getStepData(viewOrder.steps, 'quotation').quotation_no || 'N/A'}</p>
                      <p><strong>Date:</strong> {getStepData(viewOrder.steps, 'quotation').quotation_date ? new Date(getStepData(viewOrder.steps, 'quotation').quotation_date).toLocaleDateString() : 'N/A'}</p>
                      <p><strong>Valid Till:</strong> {getStepData(viewOrder.steps, 'quotation').valid_till ? new Date(getStepData(viewOrder.steps, 'quotation').valid_till).toLocaleDateString() : 'N/A'}</p>
                      <p><strong>Customer Name:</strong> {getStepData(viewOrder.steps, 'quotation').qoutation_to_customer_name || 'N/A'}</p>
                      <p><strong>Notes:</strong> {getStepData(viewOrder.steps, 'quotation').notes || 'N/A'}</p>
                    </Col>
                    <Col md={6}>
                      <h6>Sales Order</h6>
                      <p><strong>Status:</strong> {statusBadge(getStepStatus(viewOrder.steps, 'sales_order'))}</p>
                      <p><strong>SO No:</strong> {getStepData(viewOrder.steps, 'sales_order').SO_no || 'N/A'}</p>
                      <p><strong>Manual Ref No:</strong> {getStepData(viewOrder.steps, 'sales_order').manual_ref_no || 'N/A'}</p>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={6}>
                      <h6>Delivery Challan</h6>
                      <p><strong>Status:</strong> {statusBadge(getStepStatus(viewOrder.steps, 'delivery_challan'))}</p>
                      <p><strong>Challan No:</strong> {getStepData(viewOrder.steps, 'delivery_challan').challan_no || 'N/A'}</p>
                      <p><strong>Driver Name:</strong> {getStepData(viewOrder.steps, 'delivery_challan').driver_name || 'N/A'}</p>
                      <p><strong>Driver Phone:</strong> {getStepData(viewOrder.steps, 'delivery_challan').driver_phone || 'N/A'}</p>
                    </Col>
                    <Col md={6}>
                      <h6>Invoice</h6>
                      <p><strong>Status:</strong> {statusBadge(getStepStatus(viewOrder.steps, 'invoice'))}</p>
                      <p><strong>Invoice No:</strong> {getStepData(viewOrder.steps, 'invoice').invoice_no || 'N/A'}</p>
                      <p><strong>Invoice Date:</strong> {getStepData(viewOrder.steps, 'invoice').invoice_date ? new Date(getStepData(viewOrder.steps, 'invoice').invoice_date).toLocaleDateString() : 'N/A'}</p>
                      <p><strong>Due Date:</strong> {getStepData(viewOrder.steps, 'invoice').due_date ? new Date(getStepData(viewOrder.steps, 'invoice').due_date).toLocaleDateString() : 'N/A'}</p>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={6}>
                      <h6>Payment</h6>
                      <p><strong>Status:</strong> {statusBadge(getStepStatus(viewOrder.steps, 'payment'))}</p>
                      <p><strong>Payment No:</strong> {getStepData(viewOrder.steps, 'payment').Payment_no || getStepData(viewOrder.steps, 'payment').payment_no || 'N/A'}</p>
                      <p><strong>Payment Date:</strong> {getStepData(viewOrder.steps, 'payment').payment_date ? new Date(getStepData(viewOrder.steps, 'payment').payment_date).toLocaleDateString() : 'N/A'}</p>
                      <p><strong>Total Invoice :</strong> ${getStepData(viewOrder.steps, 'payment').total_invoice || '0'}</p>
                      <p><strong>Due Balance  :</strong> ${getStepData(viewOrder.steps, 'payment').balance || '0'}</p>
                      <p><strong>Amount Received:</strong> ${getStepData(viewOrder.steps, 'payment').amount_received || '0'}</p>
                      <p><strong>Payment Note:</strong> {getStepData(viewOrder.steps, 'payment').payment_note || 'N/A'}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Items Information */}
              <Card className="mb-4">
                <Card.Header className="bg-light">Order Items</Card.Header>
                <Card.Body>
                  {viewOrder.items && viewOrder.items.length > 0 ? (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Item Name</th>
                          <th>Quantity</th>
                          <th>Rate</th>
                          <th>Tax %</th>
                          <th>Discount</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewOrder.items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td>{idx + 1}</td>
                            <td>{item.item_name || 'N/A'}</td>
                            <td>{item.qty || '0'}</td>
                            <td>${item.rate || '0'}</td>
                            <td>{item.tax_percent || '0'}%</td>
                            <td>{item.discount || '0'}</td>
                            <td>${item.amount || '0'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p>No items found for this order.</p>
                  )}
                  <div className="text-end mt-3">
                    <p><strong>Total Invoice :</strong> ${getStepData(viewOrder.steps, 'payment').total_invoice || '0'}</p>
                    <p><strong>Due Balance  :</strong> ${getStepData(viewOrder.steps, 'payment').balance || '0'}</p>
                    <p><strong>Amount Received:</strong> ${getStepData(viewOrder.steps, 'payment').amount_received || '0'}</p>
                  </div>
                </Card.Body>
              </Card>

              {/* Additional Information */}
              <Card>
                <Card.Header className="bg-light">Additional Information</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Signature URL:</strong> {viewOrder.additional_info?.signature_url ? <a href={viewOrder.additional_info.signature_url} target="_blank" rel="noopener noreferrer">View Signature</a> : 'N/A'}</p>
                      <p><strong>Photo URL:</strong> {viewOrder.additional_info?.photo_url ? <a href={viewOrder.additional_info.photo_url} target="_blank" rel="noopener noreferrer">View Photo</a> : 'N/A'}</p>
                      <p><strong>Attachment URL:</strong> {viewOrder.additional_info?.attachment_url ? <a href={viewOrder.additional_info.attachment_url} target="_blank" rel="noopener noreferrer">View Attachment</a> : 'N/A'}</p>
                      <p><strong>Files:</strong> {viewOrder.additional_info?.files && viewOrder.additional_info.files.length > 0 ? `${viewOrder.additional_info.files.length} file(s)` : 'N/A'}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseViewModal}>
            Close
          </Button>
          {invoicePermissions.can_update && (
            <Button
              variant="primary"
              onClick={() => {
                handleCloseViewModal();
                handleCreateNewInvoice(viewOrder);
              }}
            >
              Continue Workflow
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        key={modalKeyRef.current.delete}
        show={deleteConfirm.show} 
        onHide={handleCloseDeleteModal}
        onExited={handleDeleteModalExited}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this sales order? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
              handleDeleteOrder(deleteConfirm.id);
              // Reset cleanup flag before closing
              isCleaningUpRef.current = false;
              handleCloseDeleteModal();
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Invoice;