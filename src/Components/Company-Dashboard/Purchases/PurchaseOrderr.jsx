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
    if (!companyId) {
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
            orderNo: poStep?.data?.PO_no || poStep?.data?.Manual_PO_ref || "-",
            vendor: quotationStep?.data?.quotation_from_vendor_name || "-",
            date: poStep?.data?.order_date
              ? poStep.data.order_date.split("T")[0]
              : po.company_info.created_at.split("T")[0],
            amount: formatAmount(po.total),
            purchaseQuotation: quotationStep?.data || {},
            purchaseOrder: poStep?.data || {},
            goodsReceipt: grStep?.data || {},
            bill: billStep?.data || {},
            payment: paymentStep?.data || {},
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
  }, [companyId]);
// ✅ HANDLE "CREATE" or "CONTINUE"
const handleCreateNewPurchase = async (order = null) => {
  if (order) {
  
    setSelectedOrder({
      id: order.id,
      initialStep: "purchaseQuotation" // Default step
    });
    setStepModal(true);
  } else {
    // New order
    setSelectedOrder(null);
    setStepModal(true);
  }
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

  // 🔥 Delete order
  const handleDelete = async () => {
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

  // Handle view order
  const handleViewOrder = async (order) => {
    try {
      // If we already have the full data, use it
      if (order.fullOrderData) {
        setViewOrder(order.fullOrderData);
      } else {
        // Otherwise fetch it
        const res = await axiosInstance.get(`purchase-orders/${order.id}`);
        if (res.data.success && res.data.data) {
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
        order.orderNo?.toString().includes(searchOrderNo.trim()) ||
        (order.bill?.Bill_no || "").includes(searchOrderNo.trim());

      const orderDate = new Date(order.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      const afterFrom = !from || orderDate >= from;
      const beforeTo = !to || orderDate <= to;

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
      const matchesPaymentStatus =
        !paymentStatusFilter || order.paymentStatus === paymentStatusFilter;

      return (
        matchesOrderNo &&
        afterFrom &&
        beforeTo &&
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

  if (loading) return <div className="p-4">Loading purchase orders...</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center gap-2 mb-4">
          <FaArrowRight size={20} color="red" />
          <h5 className="mb-0">Purchase Workflow</h5>
        </div>
        <Button
          variant="primary"
          className="mb-3"
          onClick={() => handleCreateNewPurchase()}
          style={{ backgroundColor: "#53b2a5", border: "none", padding: "8px 16px" }}
        >
          + Create New Purchase
        </Button>
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
              onChange={(e) => setGoodsReceiptStatusFilter(e.target.value)}>
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

        <Col md={3} className="d-flex align-items-end">
          <Button
            variant="secondary"
            onClick={() => {
              setSearchOrderNo("");
              setFromDate("");
              setToDate("");
              setPurchaseQuotationStatusFilter("");
              setPurchaseOrderStatusFilter("");
              setGoodsReceiptStatusFilter("");
              setBillStatusFilter("");
              setPaymentStatusFilter("");
            }}
          >
            Clear
          </Button>
        </Col>
      </Row>

      {/* Table */}
      <Table bordered hover responsive className="text-center align-middle">
        <thead className="">
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
                <td>{order.vendor}</td>
                <td>{order.date}</td>
                <td>{order.amount}</td>
                <td>{statusBadge(order.purchaseQuotationStatus)}</td>
                <td>{statusBadge(order.purchaseOrderStatus)}</td>
                <td>{statusBadge(order.goodsReceiptStatus)}</td>
                <td>{statusBadge(order.billStatus)}</td>
                <td>{statusBadge(order.paymentStatus)}</td> 
                <td>
                  <div className="d-flex gap-1 justify-content-center">
                    <Button
                      size="sm"
                      variant="outline-info"
                      onClick={() => handleViewOrder(order)}
                      title="View Details"
                    >
                      <FaEye />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleCreateNewPurchase(order)}
                    >
                      Continue
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() =>
                        setDeleteConfirm({ id: order.id, name: order.orderNo })
                      }
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Delete Modal */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            Are you sure you want to delete purchase order{" "}
            <strong>{deleteConfirm?.name}</strong>? This cannot be undone.
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

      {/* View Order Modal */}
      <Modal 
        show={viewModal} 
        onHide={() => setViewModal(false)} 
        size="xl" 
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Purchase Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewOrder && (
            <>
              {/* Company Info */}
              <Card className="mb-4">
                <Card.Header as="h5">Company Information</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Company Name:</strong> {viewOrder.company_info.company_name}</p>
                      <p><strong>Address:</strong> {viewOrder.company_info.company_address}</p>
                      <p><strong>Email:</strong> {viewOrder.company_info.company_email}</p>
                      <p><strong>Phone:</strong> {viewOrder.company_info.company_phone}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Bank Name:</strong> {viewOrder.company_info.bank_name}</p>
                      <p><strong>Account No:</strong> {viewOrder.company_info.account_no}</p>
                      <p><strong>Account Holder:</strong> {viewOrder.company_info.account_holder}</p>
                      <p><strong>IFSC Code:</strong> {viewOrder.company_info.ifsc_code}</p>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={12}>
                      <p><strong>Terms:</strong></p>
                      <p>{viewOrder.company_info.terms.replace(/["\\r\\n]/g, '')}</p>
                      <p><strong>Notes:</strong></p>
                      <p>{viewOrder.company_info.notes.replace(/["\\r\\n]/g, '')}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Shipping Details */}
              <Card className="mb-4">
                <Card.Header as="h5">Shipping Details</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h6>Bill To</h6>
                      <p><strong>Attention:</strong> {viewOrder.shipping_details.bill_to_attention_name}</p>
                      <p><strong>Company:</strong> {viewOrder.shipping_details.bill_to_company_name}</p>
                      <p><strong>Address:</strong> {viewOrder.shipping_details.bill_to_company_address}</p>
                      <p><strong>Email:</strong> {viewOrder.shipping_details.bill_to_company_email}</p>
                      <p><strong>Phone:</strong> {viewOrder.shipping_details.bill_to_company_phone}</p>
                    </Col>
                    <Col md={6}>
                      <h6>Ship To</h6>
                      <p><strong>Attention:</strong> {viewOrder.shipping_details.ship_to_attention_name}</p>
                      <p><strong>Company:</strong> {viewOrder.shipping_details.ship_to_company_name}</p>
                      <p><strong>Address:</strong> {viewOrder.shipping_details.ship_to_company_address}</p>
                      <p><strong>Email:</strong> {viewOrder.shipping_details.ship_to_company_email}</p>
                      <p><strong>Phone:</strong> {viewOrder.shipping_details.ship_to_company_phone}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Items */}
              <Card className="mb-4">
                <Card.Header as="h5">Items</Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
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
                        <tr key={idx}>
                          <td>{item.item_name}</td>
                          <td>{item.qty}</td>
                          <td>{formatAmount(item.rate)}</td>
                          <td>{item.tax_percent}%</td>
                          <td>{item.discount}</td>
                          <td>{formatAmount(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                   
                  </Table>
                </Card.Body>
              </Card>

              {/* Steps */}
              <Card className="mb-4">
                <Card.Header as="h5">Workflow Steps</Card.Header>
                <Card.Body>
                  {viewOrder.steps.map((step, idx) => (
                    <div key={idx} className="mb-3">
                      <h6 className="text-capitalize">{step.step.replace('_', ' ')} 
                        <Badge className="ms-2" bg={
                          step.status === 'completed' ? 'success' : 
                          step.status === 'Pending' ? 'secondary' : 'danger'
                        }>
                          {step.status}
                        </Badge>
                      </h6>
                      <Row>
                        {Object.entries(step.data).map(([key, value]) => (
                          <Col md={4} key={key} className="mb-2">
                            <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {value}
                          </Col>
                        ))}
                      </Row>
                      {idx < viewOrder.steps.length - 1 && <hr />}
                    </div>
                  ))}
                </Card.Body>
              </Card>

              {/* Additional Info */}
              <Card className="mb-4">
                <Card.Header as="h5">Additional Information</Card.Header>
                <Card.Body>
                  <Row>
                    {viewOrder?.additional_info.files && viewOrder.additional_info.files.length > 0 && (
                      <Col md={12}>
                        <p><strong>Attached Files:</strong></p>
                        <ul>
                          {viewOrder?.additional_info.files.map((file, idx) => (
                            <li key={idx}>
                              <a href={file.url} target="_blank" rel="noopener noreferrer">
                                {file.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </Col>
                    )}
                    {viewOrder.additional_info.signature_url && (
                      <Col md={4}>
                        <p><strong>Signature:</strong></p>
                        <img src={viewOrder?.additional_info.signature_url} alt="Signature" style={{maxWidth: '100%'}} />
                      </Col>
                    )}
                    {viewOrder.additional_info.photo_url && (
                      <Col md={4}>
                        <p><strong>Photo:</strong></p>
                        <img src={viewOrder?.additional_info.photo_url} alt="Photo" style={{maxWidth: '100%'}} />
                      </Col>
                    )}
                    {viewOrder.additional_info.attachment_url && (
                      <Col md={4}>
                        <p><strong>Attachment:</strong></p>
                        <a href={viewOrder?.additional_info.attachment_url} target="_blank" rel="noopener noreferrer">
                          View Attachment
                        </a>
                      </Col>
                    )}
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
        </Modal.Footer>
      </Modal>

      {/* Form Modal */}
      <Modal show={stepModal} onHide={handleFormClose} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedOrder?.id ? "Continue Purchase" : "Create Purchase"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MultiStepPurchaseForm
            initialData={{
              purchaseQuotation: selectedOrder?.purchaseQuotation || {},
              purchaseOrder: selectedOrder?.purchaseOrder || {},
              goodsReceipt: selectedOrder?.goodsReceipt || {},
              bill: selectedOrder?.bill || {},
              payment: selectedOrder?.payment || {},
              
            }}
            initialStep={selectedOrder?.initialStep || "purchaseQuotation"}
            onClose={handleFormClose}
            onRefresh={fetchPurchaseOrders}
            onSubmit={handleFormSubmit}
             selectedOrder={selectedOrder} // ✅ ADD THIS LINE
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PurchaseOrderr;