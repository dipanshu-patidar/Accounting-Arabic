import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Badge, Modal, Form, Row, Col, Alert, Card } from "react-bootstrap";
import MultiStepPurchaseForm from "./MultiStepPurchaseForms";
import { FaArrowRight, FaTrash, FaEye } from "react-icons/fa";
import BaseUrl from "../../../Api/BaseUrl";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";

// ✅ FIXED: Correctly map API status to UI
const mapApiStatusToUiStatus = (apiStatus) => {
  if (!apiStatus) return "Pending";
  const lower = apiStatus.toLowerCase();
  if (["approved", "confirmed", "completed"].includes(lower)) return "Done";
  if (["cancelled", "rejected"].includes(lower)) return "Cancelled";
  return "Pending";
};

const formatAmount = (value) => {
  if (!value || isNaN(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(Number(value));
};

const PurchaseOrderr = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stepModal, setStepModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const companyId = GetCompanyId();

  // Permission states
  const [userPermissions, setUserPermissions] = useState([]);
  const [purchaseOrderPermissions, setPurchaseOrderPermissions] = useState({
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
      setPurchaseOrderPermissions({
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

        // Check if user has permissions for Purchase_Order module
        const purchaseOrderPermission = permissions.find(p => p.module_name === "Purchase_Order");
        if (purchaseOrderPermission) {
          setPurchaseOrderPermissions({
            can_create: purchaseOrderPermission.can_create,
            can_view: purchaseOrderPermission.can_view,
            can_update: purchaseOrderPermission.can_update,
            can_delete: purchaseOrderPermission.can_delete
          });
        }
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setPurchaseOrderPermissions({
          can_create: false,
          can_view: false,
          can_update: false,
          can_delete: false
        });
      }
    } else {
      setPurchaseOrderPermissions({
        can_create: false,
        can_view: false,
        can_update: false,
        can_delete: false
      });
    }
  }, []);

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchOrderNo, setSearchOrderNo] = useState("");
  const [purchaseQuotationStatusFilter, setPurchaseQuotationStatusFilter] = useState("");
  const [purchaseOrderStatusFilter, setPurchaseOrderStatusFilter] = useState("");
  const [goodsReceiptStatusFilter, setGoodsReceiptStatusFilter] = useState("");
  const [billStatusFilter, setBillStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  // ✅ FETCH ALL ORDERS
  const fetchPurchaseOrders = async () => {
    if (!companyId || !purchaseOrderPermissions.can_view) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`purchase-orders/company/${companyId}`);
      if (res.data.success && Array.isArray(res.data.data)) {
        const formatted = res.data.data.map((po) => {
          const quotationStep = po.steps.find((s) => s.step === "quotation");
          const poStep = po.steps.find((s) => s.step === "purchase_order");
          const grStep = po.steps.find((s) => s.step === "goods_receipt");
          const billStep = po.steps.find((s) => s.step === "bill");
          const paymentStep = po.steps.find((s) => s.step === "payment");

          return {
            id: po.company_info.id,
            orderNo: quotationStep?.data?.PO_no || poStep?.data?.Manual_PO_ref || "-",
            vendor: quotationStep?.data?.quotation_from_vendor_name || "-",
            date: quotationStep?.data?.order_date
              ? quotationStep.data.order_date.split("T")[0]
              : po.company_info.created_at.split("T")[0],
            amount: formatAmount(po.total),
            purchaseQuotationStatus: mapApiStatusToUiStatus(quotationStep?.status),
            purchaseOrderStatus: mapApiStatusToUiStatus(poStep?.status),
            goodsReceiptStatus: mapApiStatusToUiStatus(grStep?.status),
            billStatus: mapApiStatusToUiStatus(billStep?.status),
            paymentStatus: mapApiStatusToUiStatus(paymentStep?.status),
            // Store the complete order data for viewing
            fullOrderData: po
          };
        });
        setOrders(formatted);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load purchase orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, [companyId, purchaseOrderPermissions.can_view]);

  // ✅ HANDLE "CREATE" or "CONTINUE"
  const getFirstIncompleteStep = (order) => {
    if (!order) return "purchaseQuotation";
    const sequence = [
      { key: "purchaseQuotationStatus", ui: "purchaseQuotation" },
      { key: "purchaseOrderStatus", ui: "purchaseOrder" },
      { key: "goodsReceiptStatus", ui: "goodsReceipt" },
      { key: "billStatus", ui: "bill" },
      { key: "paymentStatus", ui: "payment" },
    ];

    for (const s of sequence) {
      // Treat any status other than 'Done' as incomplete
      if (!order[s.key] || order[s.key] !== "Done") return s.ui;
    }

    // If all steps are done, default to quotation (or you can choose to open final step)
    return "purchaseQuotation";
  };

  const handleCreateNewPurchase = (order = null) => {
    if (!purchaseOrderPermissions.can_create) {
      alert("You don't have permission to create purchase orders.");
      return;
    }
    
    const initialStep = order ? getFirstIncompleteStep(order) : "purchaseQuotation";
    
    setSelectedOrder({
      id: order?.id,
      initialStep,
      purchaseQuotation: order?.purchaseQuotation || {},
      purchaseOrder: order?.purchaseOrder || {},
      goodsReceipt: order?.goodsReceipt || {},
      bill: order?.bill || {},
      payment: order?.payment || {},
      fullOrderData: order?.fullOrderData || {},
    });

    setStepModal(true);
  };

  // ✅ DEFINE THIS — fixes "handleModalClose is not defined"
  const handleFormClose = () => {
    setStepModal(false);
    setSelectedOrder(null);
  };

  // ✅ Handle form submit (optional — you can remove if not needed)
  const handleFormSubmit = () => {
    fetchPurchaseOrders();
    handleFormClose();
  };

  // ✅ Delete order
  const handleDelete = async () => {
    if (!purchaseOrderPermissions.can_delete) {
      alert("You don't have permission to delete purchase orders.");
      return;
    }
    
    if (!deleteConfirm) return;
    try {
      const res = await axiosInstance.delete(`purchase-orders/${deleteConfirm.id}`);
      if (res.data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        alert("Failed to delete order.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting order.");
    }
  };

  // ✅ Handle view order
  const handleViewOrder = async (order) => {
    if (!purchaseOrderPermissions.can_view) {
      alert("You don't have permission to view purchase orders.");
      return;
    }
    
    try {
      // If we already have the full order data, use it
      if (order.fullOrderData) {
        setViewOrder(order.fullOrderData);
      } else {
        // Otherwise fetch it
        const res = await axiosInstance.get(`purchase-orders/${order.id}`);
        if (res.data.success) {
          setViewOrder(res.data.data);
        } else {
          alert("Failed to load order details.");
          return;
        }
      }
      setViewModal(true);
    } catch (err) {
      console.error("View error:", err);
      alert("Error loading order details.");
    }
  };

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesOrderNo =
        !searchOrderNo ||
        (order.orderNo?.toString().includes(searchOrderNo.trim()));

      const orderDate = new Date(order.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      const dateMatch = (!from || orderDate >= from) && (!to || orderDate <= to);

      const matchesPurchaseQuotationStatus =
        !purchaseQuotationStatusFilter ||
        order.purchaseQuotationStatus === purchaseQuotationStatusFilter;
      const matchesPurchaseOrderStatus =
        !purchaseOrderStatusFilter ||
        order.purchaseOrderStatus === purchaseOrderStatusFilter;
      const matchesGoodsReceiptStatus =
        !goodsReceiptStatusFilter ||
        order.goodsReceiptStatus === goodsReceiptStatusFilter;
      const matchesBillStatus = !billStatusFilter || order.billStatus === billStatusFilter;
      const matchesPaymentStatus = !paymentStatusFilter || order.paymentStatus === paymentStatusFilter;

      return (
        matchesOrderNo &&
        dateMatch &&
        matchesPurchaseQuotationStatus &&
        matchesPurchaseOrderStatus &&
        matchesGoodsReceiptStatus &&
        matchesBillStatus &&
        matchesPaymentStatus
      );
    });
  }, [
    orders,
    searchOrderNo,
    fromDate,
    toDate,
    purchaseQuotationStatusFilter,
    purchaseOrderStatusFilter,
    goodsReceiptStatusFilter,
    billStatusFilter,
    paymentStatusFilter,
  ]);

  const statusBadge = (status) => {
    let variant;
    switch (status) {
      case "Done":
        variant = "success";
        break;
      case "Pending":
        variant = "secondary";
        break;
      case "Cancelled":
        variant = "danger";
        break;
      default:
        variant = "warning";
    }
    return <Badge bg={variant}>{status}</Badge>;
  };

  // If user doesn't have view permission, show access denied message
  if (!purchaseOrderPermissions.can_view) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="text-center">
          <h3 className="text-danger">Access Denied</h3>
          <p>You don't have permission to view Purchase Order module.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Loading purchase orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="text-center">
          <h3 className="text-danger">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center gap-2 mb-4">
          <FaArrowRight size={20} color="red" />
          <h5 className="mb-0">Purchase Workflow</h5>
        </div>
        {purchaseOrderPermissions.can_create && (
          <Button
            variant="primary"
            onClick={() => handleCreateNewPurchase()}
            style={{ backgroundColor: "#53b2a5", border: "none", padding: "8px 16px" }}
          >
            + Create New Purchase
          </Button>
        )}
      </div>

      {/* Filters */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Purchase No</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by No"
              value={searchOrderNo}
              onChange={(e) => setSearchOrderNo(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>From Date</Form.Label>
            <Form.Control
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>To Date</Form.Label>
            <Form.Control
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Purchase Quotation</Form.Label>
            <Form.Select
              value={purchaseQuotationStatusFilter}
              onChange={(e) => setPurchaseQuotationStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Purchase Order</Form.Label>
            <Form.Select
              value={purchaseOrderStatusFilter}
              onChange={(e) => setPurchaseOrderStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Goods Receipt</Form.Label>
            <Form.Select
              value={goodsReceiptStatusFilter}
              onChange={(e) => setGoodsReceiptStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Bill</Form.Label>
            <Form.Select
              value={billStatusFilter}
              onChange={(e) => setBillStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Payment</Form.Label>
            <Form.Select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Table */}
      <Table bordered hover responsive className="text-center align-middle">
        <thead>
          <tr>
            <th>#</th>
            <th>Purchase No</th>
            <th>Vendor</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Quotation</th>
            <th>PO</th>
            <th>GR</th>
            <th>Bill</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="11">No purchase orders found.</td>
            </tr>
          ) : (
            filteredOrders.map((order, idx) => (
              <tr key={order.id}>
                <td>{idx + 1}</td>
                <td>{order.orderNo}</td>
                <td>{order.date}</td>
                <td>{order.amount}</td>
                <td>{statusBadge(order.purchaseQuotationStatus)}</td>
                <td>{statusBadge(order.purchaseOrderStatus)}</td>
                <td>{statusBadge(order.goodsReceiptStatus)}</td>
                <td>{statusBadge(order.billStatus)}</td>
                <td>{statusBadge(order.paymentStatus)}</td>
                <td className="d-flex justify-content-center gap-2">
                  {purchaseOrderPermissions.can_view && (
                    <Button
                      size="sm"
                      variant="outline-info"
                      onClick={() => handleViewOrder(order)}
                      title="View Details"
                    >
                      <FaEye />
                    </Button>
                  )}
                  {purchaseOrderPermissions.can_update && (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleCreateNewPurchase(order)}
                      title="Continue Workflow"
                    >
                      Continue
                    </Button>
                  )}
                  {purchaseOrderPermissions.can_delete && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => setDeleteConfirm({ id: order.id, name: order.orderNo })}
                      title="Delete Order"
                    >
                      <FaTrash />
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Create/Edit Modal */}
      <Modal show={stepModal} onHide={handleFormClose} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedOrder?.id ? "Continue Purchase" : "Create Purchase"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MultiStepPurchaseForm
            initialData={selectedOrder}
            initialStep={selectedOrder?.initialStep || "purchaseQuotation"}
            onClose={handleFormClose}
            onRefresh={fetchPurchaseOrders}
            selectedOrder={selectedOrder}
          />
        </Modal.Body>
      </Modal>

      {/* View Order Modal */}
      <Modal show={viewModal} onHide={() => setViewModal(false)} size="xl" centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Purchase Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewOrder && (
            <>
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
                      <p><strong>Status:</strong> {statusBadge(viewOrder.purchaseQuotationStatus)}</p>
                      <p><strong>PO No:</strong> {viewOrder.purchaseQuotation?.PO_no || 'N/A'}</p>
                      <p><strong>Manual Ref No:</strong> {viewOrder.purchaseQuotation?.Manual_PO_ref || 'N/A'}</p>
                    </Col>
                    <Col md={6}>
                      <h6>Purchase Order</h6>
                      <p><strong>Status:</strong> {statusBadge(viewOrder.purchaseOrderStatus)}</p>
                      <p><strong>SO No:</strong> {viewOrder.purchaseOrder?.SO_no || 'N/A'}</p>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={6}>
                      <h6>Goods Receipt</h6>
                      <p><strong>Status:</strong> {statusBadge(viewOrder.goodsReceiptStatus)}</p>
                    </Col>
                    <Col md={6}>
                      <h6>Bill</h6>
                      <p><strong>Status:</strong> {statusBadge(viewOrder.billStatus)}</p>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={6}>
                      <h6>Payment</h6>
                      <p><strong>Status:</strong> {statusBadge(viewOrder.paymentStatus)}</p>
                      <p><strong>Payment No:</strong> {viewOrder.payment?.Payment_no || 'N/A'}</p>
                      <p><strong>Payment Date:</strong> {viewOrder.payment?.payment_date ? new Date(viewOrder.payment.payment_date).toLocaleDateString() : 'N/A'}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Items Information */}
              <Card className="mb-4">
                <Card.Header className="bg-light">Order Items</Card.Header>
                <Card.Body>
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
                      {viewOrder.items && viewOrder.items.length > 0 ? (
                        viewOrder.items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td>{idx + 1}</td>
                            <td>{item.item_name || 'N/A'}</td>
                            <td>{item.qty || '0'}</td>
                            <td>{formatAmount(item.rate)}</td>
                            <td>{item.tax_percent || '0'}%</td>
                            <td>{formatAmount(item.discount)}</td>
                            <td>{formatAmount(item.amount)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7">No items found for this order.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
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
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewModal(false)}>
            Close
          </Button>
          {purchaseOrderPermissions.can_update && (
            <Button
              variant="primary"
              onClick={() => {
                setViewModal(false);
                handleCreateNewPurchase(viewOrder);
              }}
            >
              Continue Workflow
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            Are you sure you want to delete purchase order{" "}
            <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PurchaseOrderr;