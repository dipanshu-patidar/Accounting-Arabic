import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Badge, Alert, Spinner, Card, Form, InputGroup, Modal } from 'react-bootstrap';
import {
  FaEdit, FaPrint, FaMoneyBill, FaPaperPlane, FaEye,
  FaGlobe, FaExchangeAlt, FaTimes, FaCaretUp, FaArrowLeft, FaSave, FaTimesCircle, FaTrash
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../../Api/axiosInstance';
import { CurrencyContext } from "../../../../hooks/CurrencyContext";
import { useContext } from "react";

const InvoiceSummary = () => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProducts, setEditableProducts] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { convertPrice } = useContext(CurrencyContext);

  // Get invoice ID from location state
  const invoiceId = location.state?.invoiceId;

  // Fetch invoice data
  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!invoiceId) {
        setError("Invoice ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`/posinvoice/${invoiceId}`);
        
        if (response.data && response.data.success) {
          setInvoiceData(response.data.data);
        } else {
          setError("Failed to fetch invoice data");
        }
      } catch (err) {
        console.error("Error fetching invoice data:", err);
        setError("Failed to fetch invoice data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [invoiceId]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Generate invoice number
  const generateInvoiceNumber = (id) => {
    return `INV${String(id).padStart(3, '0')}`;
  };

  // Calculate tax amount for a product
  const calculateProductTax = (price, quantity) => {
    if (!invoiceData?.tax) return 0;
    const taxRate = parseFloat(invoiceData.tax.tax_value) / 100;
    return parseFloat(price) * quantity * taxRate;
  };

  // Calculate total tax amount
  const calculateTotalTax = () => {
    if (!invoiceData) return 0;
    return parseFloat(invoiceData.total) - parseFloat(invoiceData.subtotal);
  };

  // Calculate subtotal from editable products
  const calculateSubtotal = () => {
    return editableProducts.reduce((total, product) => {
      return total + (parseFloat(product.price) * product.quantity);
    }, 0);
  };

  // Calculate total from editable products
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (!invoiceData?.tax) return subtotal;
    const taxRate = parseFloat(invoiceData.tax.tax_value) / 100;
    return subtotal * (1 + taxRate);
  };

  // Handle edit button click
  const handleEditClick = () => {
    if (invoiceData && invoiceData.products) {
      // Create a deep copy of products for editing
      const productsCopy = invoiceData.products.map(product => ({
        ...product,
        price: parseFloat(product.price),
        quantity: parseInt(product.quantity)
      }));
      setEditableProducts(productsCopy);
      setIsEditing(true);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableProducts([]);
  };

  // Handle input change for editable products
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editableProducts];
    if (field === 'price') {
      updatedProducts[index][field] = parseFloat(value) || 0;
    } else if (field === 'quantity') {
      updatedProducts[index][field] = parseInt(value) || 1;
    }
    setEditableProducts(updatedProducts);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!invoiceData) return;
    
    setEditLoading(true);
    
    try {
      // Prepare data for API
      const updatedData = {
        products: editableProducts.map(product => ({
          product_id: product.product_id,
          quantity: product.quantity,
          price: product.price
        })),
        subtotal: calculateSubtotal(),
        total: calculateTotal()
      };
      
      // Send update request
      const response = await axiosInstance.put(`/posinvoice/${invoiceId}`, updatedData);
      
      if (response.data && response.data.success) {
        // Refresh invoice data
        const updatedResponse = await axiosInstance.get(`/posinvoice/${invoiceId}`);
        if (updatedResponse.data && updatedResponse.data.success) {
          setInvoiceData(updatedResponse.data.data);
        }
        setIsEditing(false);
        setEditableProducts([]);
      } else {
        setError("Failed to update invoice");
      }
    } catch (err) {
      console.error("Error updating invoice:", err);
      setError("Failed to update invoice. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete invoice
  const handleDeleteInvoice = async () => {
    if (!invoiceId) return;
    
    setDeleteLoading(true);
    
    try {
      // Send delete request
      const response = await axiosInstance.delete(`/posinvoice/${invoiceId}`);
      
      if (response.data && response.data.success) {
        // Show success message and navigate back
        setShowDeleteModal(false);
        navigate('/company/ponitofsale', { 
          state: { 
            successMessage: "Invoice deleted successfully" 
          } 
        });
      } else {
        setError("Failed to delete invoice");
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error("Error deleting invoice:", err);
      setError("Failed to delete invoice. Please try again.");
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle print preview
  const handlePrintPreview = () => {
    const printContent = document.getElementById('invoice-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice Preview - ${generateInvoiceNumber(invoiceData?.id)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .card { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .text-end { text-align: right; }
            .fw-bold { font-weight: bold; }
            .mb-2 { margin-bottom: 10px; }
            .mb-3 { margin-bottom: 15px; }
            .mb-4 { margin-bottom: 20px; }
            .d-flex { display: flex; }
            .gap-2 { gap: 8px; }
            .align-items-center { align-items: center; }
            .badge { display: inline-block; padding: 3px 7px; font-size: 12px; font-weight: bold; border-radius: 4px; }
            .bg-success { background-color: #28a745; color: white; }
            .bg-warning { background-color: #ffc107; color: black; }
            .border-top { border-top: 1px solid #ddd; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 mt-2 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading invoice data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 mt-2">
        <Alert variant="danger">{error}</Alert>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/company/ponitofsale')}
          className="mt-3"
        >
          <FaArrowLeft /> Back to POS
        </Button>
      </div>
    );
  }

  // Get currency symbol from response or context
  const currencySymbol = invoiceData?.symbol || '$';

  // Determine which products to display
  const productsToDisplay = isEditing ? editableProducts : invoiceData?.products;

  return (  
    <div className="p-2 mt-2">
      {/* Main Invoice Card */}
      <Card className="shadow-sm" id="invoice-content">
        <Card.Body>

          {/* Action Buttons */}
          
          <div className="d-flex flex-wrap gap-2 mb-3 no-print">
            {isEditing ? (
              <>
                <Button variant="success" className="d-flex align-items-center gap-1" onClick={handleSaveEdit} disabled={editLoading}>
                  {editLoading ? <Spinner as="span" animation="border" size="sm" /> : <FaSave />} <span>Save</span>
                </Button>
                <Button variant="danger" className="d-flex align-items-center gap-1" onClick={handleCancelEdit}>
                  <FaTimesCircle /> <span>Cancel</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="warning" className="d-flex align-items-center gap-1" onClick={handleEditClick}>
                  <FaEdit /> <span>Edit Invoice</span>
                </Button>
                <Button variant="success" className="d-flex align-items-center gap-1">
                  <FaMoneyBill /> <span>Receive Payment</span>
                </Button>
                <Button variant="primary" className="d-flex align-items-center gap-1">
                  <FaPaperPlane /> <span>Send</span>
                </Button>
              
                <Button variant="info" className="d-flex align-items-center gap-1" onClick={handlePrintPreview}>
                  <FaGlobe /> <span>Print Preview</span>
                </Button>
                <Button variant="secondary" className="d-flex align-items-center gap-1">
                  <FaExchangeAlt /> <span>Change Status</span>
                </Button>
                <Button 
                  variant="danger" 
                  className="d-flex align-items-center gap-1" 
                  onClick={() => setShowDeleteModal(true)}
                >
                  <FaTrash /> <span>Delete Invoice</span>
                </Button>
                <Button variant="success" className="d-flex align-items-center gap-1">
                  <FaEdit /> <span>Delivery Note</span>
                </Button>
                <Button variant="info" className="d-flex align-items-center gap-1">
                  <FaEye /> <span>Proforma Invoice</span>
                </Button>
                <Button variant="secondary" className="d-flex align-items-center gap-1">
                  <FaCaretUp /> <span>Copy Invoice</span>
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/company/ponitofsale')}
                  className="d-flex align-items-center gap-1"
                >
                  <FaArrowLeft /> Back
                </Button>
              </>
            )}
          </div>

          {/* Invoice Header */}
          <Row className="align-items-center mb-4">
            <Col md={8}>
              <h4 className="fw-bold mb-1 text-center mt-3">Invoice Summary </h4>
              <div className="mb-2">
                <strong>Invoice #:</strong> {generateInvoiceNumber(invoiceData?.id)}
              </div>
              <div className="mb-2">
                <strong>Date:</strong> {formatDate(invoiceData?.created_at)}
              </div>
              <div className="mb-2">
                <strong>Payment Status:</strong> 
                <Badge bg={invoiceData?.payment_status === 'paid' || invoiceData?.payment_status === 'cash' ? 'success' : 'warning'} className="ms-2">
                  {invoiceData?.payment_status?.toUpperCase() || 'N/A'}
                </Badge>
              </div>
            </Col>
          </Row>

          {/* Customer and Payment Details */}
          <Row className="mb-4">
            <Col md={6}>
              <h5 className="fw-bold mb-3">BILL TO</h5>
              <div className="mb-2"><strong>{invoiceData?.customer?.name_english || 'N/A'}</strong></div>
              <div className="mb-2">{invoiceData?.customer?.address || 'N/A'}</div>
              <div className="mb-2">Phone: {invoiceData?.customer?.phone || 'N/A'}</div>
              <div>Email: {invoiceData?.customer?.email || 'N/A'}</div>
            </Col>
          </Row>

          {/* Item Table */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3">INVOICE ITEMS</h5>
            <div className="table-responsive">
              <Table bordered hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Rate</th>
                    <th>Qty</th>
                    <th>Tax</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {productsToDisplay?.map((product, index) => {
                    const productTax = calculateProductTax(product.price, product.quantity);
                    const productTotal = parseFloat(product.price) * product.quantity;
                    return (
                      <tr key={product.id}>
                        <td>{index + 1}</td>
                        <td>{product.item_name}</td>
                        <td>
                          {isEditing ? (
                            <InputGroup size="sm" className="no-print">
                              <InputGroup.Text>{currencySymbol}</InputGroup.Text>
                              <Form.Control
                                type="number"
                                value={product.price}
                                onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                min="0"
                                step="0.01"
                              />
                            </InputGroup>
                          ) : (
                            `${currencySymbol} ${convertPrice(product.price)}`
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <Form.Control
                              type="number"
                              value={product.quantity}
                              onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                              min="1"
                              size="sm"
                              className="no-print"
                            />
                          ) : (
                            product.quantity
                          )}
                        </td>
                        <td>{currencySymbol} {convertPrice(productTax)} ({invoiceData?.tax?.tax_value || 0}%)</td>
                        <td>{currencySymbol} {convertPrice(productTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </div>

          {/* Payment Summary */}
          <Row className="mb-4">
            <Col md={6}>
              <h5 className="fw-bold mb-3">PAYMENT SUMMARY</h5>
              <p><strong>Payment Status:</strong> 
                <Badge bg={invoiceData?.payment_status === 'paid' || invoiceData?.payment_status === 'cash' ? 'success' : 'warning'} className="ms-2">
                  {invoiceData?.payment_status?.toUpperCase() || 'N/A'}
                </Badge>
              </p>
              <p><strong>Payment Method:</strong> {invoiceData?.payment_status?.toUpperCase() || 'N/A'}</p>
            </Col>
            <Col md={6}>
              <div className="table-responsive">
                <Table borderless className="text-end">
                  <tbody>
                    <tr><td>Sub Total</td><td>{currencySymbol} {convertPrice(isEditing ? calculateSubtotal() : invoiceData?.subtotal || 0)}</td></tr>
                    <tr><td>TAX ({invoiceData?.tax?.tax_class || 'N/A'} {invoiceData?.tax?.tax_value || 0}%)</td><td>{currencySymbol} {convertPrice(isEditing ? calculateTotal() - calculateSubtotal() : calculateTotalTax())}</td></tr>
                    <tr className="fw-bold border-top"><td>Total</td><td>{currencySymbol} {convertPrice(isEditing ? calculateTotal() : invoiceData?.total || 0)}</td></tr>
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this invoice? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteInvoice}
            disabled={deleteLoading}>
            {deleteLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" />
                <span className="ms-2">Deleting...</span>
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InvoiceSummary;