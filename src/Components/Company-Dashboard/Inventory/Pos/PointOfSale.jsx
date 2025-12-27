import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Alert, Modal, Button, Form, Row, Col, Card, Image, Table, ListGroup, Badge, Dropdown, Spinner } from "react-bootstrap";
import CustomerList from "./CustomerList";
import AddProductModal from "../AddProductModal";
import axiosInstance from "../../../../Api/axiosInstance";
import GetCompanyId from "../../../../Api/GetCompanyId";
import { CurrencyContext } from "../../../../hooks/CurrencyContext";
import React, { useContext } from "react";
import { FaTrash } from "react-icons/fa";
import './PointOfSale.css';

const PointOfSale = () => {
  const companyId = GetCompanyId();
  const navigate = useNavigate();
  const { convertPrice, symbol, currency } = useContext(CurrencyContext);

  // Permission states
  const [userPermissions, setUserPermissions] = useState([]);
  const [posPermissions, setPosPermissions] = useState({
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
      setPosPermissions({
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

        // Check if user has permissions for POS_Screen module
        const posPermission = permissions.find(p => p.module_name === "POS_Screen");
        if (posPermission) {
          setPosPermissions({
            can_create: posPermission.can_create,
            can_view: posPermission.can_view,
            can_update: posPermission.can_update,
            can_delete: posPermission.can_delete
          });
        }
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setPosPermissions({
          can_create: false,
          can_view: false,
          can_update: false,
          can_delete: false
        });
      }
    } else {
      setPosPermissions({
        can_create: false,
        can_view: false,
        can_update: false,
        can_delete: false
      });
    }
  }, []);

  // State declarations
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantity, setQuantity] = useState({});
  const [selectedWarehouses, setSelectedWarehouses] = useState({}); // New state for selected warehouses
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [quantityError, setQuantityError] = useState("");
  const [taxes, setTaxes] = useState([{ id: 4, tax_class: "GST", tax_value: 10, company_id: companyId }]); // Default tax
  const [selectedTax, setSelectedTax] = useState({ id: 4, tax_class: "GST", tax_value: 10, company_id: companyId });
  const [paymentStatus, setPaymentStatus] = useState("3"); // Cash
  const [amountPaid, setAmountPaid] = useState(0);
  const [amountDue, setAmountDue] = useState(0);
  const [priceMap, setPriceMap] = useState({});
  const [price, setPrice] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modals
  const [showAddTaxModal, setShowAddTaxModal] = useState(false);
  const [newTaxClass, setNewTaxClass] = useState("");
  const [newTaxValue, setNewTaxValue] = useState("");

  // Fetch products and taxes
  useEffect(() => {
    const fetchData = async () => {
      if (!posPermissions.can_view) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);

        // Fetch products
        const productResponse = await axiosInstance.get(`/products/company/${companyId}`);
        console.log("Product API Response:", productResponse.data);

        if (productResponse.data && productResponse.data.success) {
          setProducts(productResponse.data.data || []);
        } else {
          setProducts([]);
        }

        // Fetch taxes 
        const taxResponse = await axiosInstance.get(`/taxclasses/company/${companyId}`);
        console.log("Tax API Response:", taxResponse.data);

        if (taxResponse.data && taxResponse.data.success && taxResponse.data.data && taxResponse.data.data.length > 0) {
          setTaxes(taxResponse.data.data);
          setSelectedTax(taxResponse.data.data[0]);
        }
        // Keep default tax if API fails or returns empty
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setProducts([]);
        // Keep default tax
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId, posPermissions.can_view]);

  // Initialize warehouse stock from products
  const [warehouseStock, setWarehouseStock] = useState({});

  useEffect(() => {
    const stock = {};
    products.forEach(product => {
      // Sum up stock from all warehouses
      const totalStock = product.warehouses?.reduce((sum, wh) => sum + (wh.stock_qty || 0), 0) || 0;
      stock[product.id] = totalStock;
    });
    setWarehouseStock(stock);
  }, [products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (!posPermissions.can_create) {
      alert("You don't have permission to add products.");
      return;
    }
    
    setShowAdd(false);
  };

  const handleUpdateItem = () => {
    if (!posPermissions.can_update) {
      alert("You don't have permission to update products.");
      return;
    }
    
    setShowEdit(false);
  };

  const handleAddCategory = () => {
    if (!posPermissions.can_create) {
      alert("You don't have permission to add categories.");
      return;
    }
    
    setShowAddCategoryModal(false);
  };

  // --- Create Invoice ---
  const handleCreateInvoice = async () => {
    if (!posPermissions.can_create) {
      alert("You don't have permission to create invoices.");
      return;
    }
    
    // Validation checks
    if (!selectedCustomer) {
      setValidationError("Please select a customer before creating an invoice");
      return;
    }

    if (selectedProducts.length === 0) {
      setValidationError("Please add at least one product to the invoice");
      return;
    }

    if (!selectedTax) {
      setValidationError("Please select a tax rate");
      return;
    }

    try {
      // Prepare invoice data
      const invoiceData = {
        company_id: companyId,
        customer_id: selectedCustomer.id,
        products: selectedProducts.map(product => ({
          product_id: product.id,
          quantity: quantity[product.id] || 1,
          price: parseFloat(priceMap[product.id] ?? product.initial_cost),
          warehouse_id: selectedWarehouses[product.id] || (product.warehouses && product.warehouses.length > 0 ? product.warehouses[0].warehouse_id : null)
        })),
        subtotal: calculateSubTotal(),
        total: calculateTotal(),
        tax_id: selectedTax.id,
        payment_status: paymentStatus === "3" ? "cash" :
          paymentStatus === "2" ? "paid" :
            paymentStatus === "1" ? "partial" : "due",
        // Add currency information
        symbol: symbol,
        currency: currency
      };

      // Send data to backend
      const response = await axiosInstance.post('/posinvoice', invoiceData);

      if (response.data.success) {
        // Update warehouse stock
        updateWarehouseStock();

        // Show success message
        setSuccessMessage("Invoice created successfully!");

        // Extract invoice ID from response
        const invoiceId = response.data.data.id;

        // Navigate to invoice summary directly after a short delay
        setTimeout(() => {
          navigate("/company/invoice-summary", {
            state: {
              invoiceId: invoiceId, // Pass invoice ID
              selectedCustomer,
              selectedProducts,
              quantity,
              priceMap,
              selectedWarehouses, // Pass selected warehouses
              amountPaid,
              amountDue,
              total: calculateTotal(),
              subTotal: calculateSubTotal(),
              tax: selectedTax,
              // Pass currency context for display
              symbol,
              currency
            },
          });
        }, 1500); // 1.5 second delay to show success message
      } else {
        alert("Failed to create invoice: " + response.data.message);
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
      alert("Failed to create invoice. Please try again.");
    }
  };

  // --- Clear All Data ---
  const handleClear = () => {
    setSelectedCustomer(null);
    setSelectedProducts([]);
    setQuantity({});
    setSelectedWarehouses({}); // Clear selected warehouses
    setPaymentStatus("3");
    setAmountPaid(0);
    setAmountDue(0);
    setValidationError("");
    setSuccessMessage("");
  };

  // --- Update Warehouse Stock ---
  const updateWarehouseStock = () => {
    const updatedStock = { ...warehouseStock };
    selectedProducts.forEach((product) => {
      const productId = product.id;
      const soldQuantity = quantity[productId] || 1;
      updatedStock[productId] = Math.max(0, (updatedStock[productId] || 0) - soldQuantity);
    });
    setWarehouseStock(updatedStock);
  };

  // --- Tax Handlers ---
  const handleTaxFormSubmit = async (e) => {
    e.preventDefault();
    if (!newTaxClass.trim() || !newTaxValue) return;

    try {
      const response = await axiosInstance.post('/taxclasses', {
        tax_class: newTaxClass,
        tax_value: parseFloat(newTaxValue),
        company_id: companyId
      });

      if (response.data.success) {
        const newTax = {
          id: response.data.data.id,
          tax_class: newTaxClass,
          tax_value: parseFloat(newTaxValue),
          company_id: companyId
        };
        setTaxes([...taxes, newTax]);
        setSelectedTax(newTax);
        setShowAddTaxModal(false);
        setNewTaxClass("");
        setNewTaxValue("");
      }
    } catch (err) {
      console.error("Error adding tax class:", err);
      alert("Failed to add tax class. Please try again.");
    }
  };

  const handleTaxSelect = (tax) => {
    setSelectedTax(tax);
  };

  const handleDeleteTax = async (taxId) => {
    if (!posPermissions.can_delete) {
      alert("You don't have permission to delete tax classes.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this tax class?")) {
      try {
        const response = await axiosInstance.delete(`/taxclasses/${taxId}`);

        if (response.data.success) {
          const updatedTaxes = taxes.filter(tax => tax.id !== taxId);
          setTaxes(updatedTaxes);

          if (selectedTax && selectedTax.id === taxId) {
            setSelectedTax(updatedTaxes.length > 0 ? updatedTaxes[0] : { id: 1, tax_class: "GST", tax_value: 10, company_id: companyId });
          }
        }
      } catch (err) {
        console.error("Error deleting tax class:", err);
        alert("Failed to delete tax class. Please try again.");
      }
    }
  };

  // --- Price & Quantity ---
  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPrice(value);
    const newPrice = parseFloat(value);
    if (!isNaN(newPrice)) {
      setPriceMap((prev) => ({
        ...prev,
        [currentProduct.id]: newPrice,
      }));
    }
  };

  // New handler for warehouse selection
  const handleWarehouseChange = (e) => {
    const warehouseId = e.target.value;
    setSelectedWarehouses(prev => ({
      ...prev,
      [currentProduct.id]: warehouseId
    }));
  };

  const calculateSubTotal = () => {
    const productSubTotal = selectedProducts.reduce((total, item) => {
      const productPrice = parseFloat(priceMap[item.id] ?? item.initial_cost);
      const productQuantity = quantity[item.id] || 1;
      const priceWithoutGST = productPrice / (1 + (selectedTax?.tax_value || 0) / 100);
      return total + priceWithoutGST * productQuantity;
    }, 0);
    return parseFloat(productSubTotal.toFixed(2));
  };

  const calculateTotal = () => {
    const total = selectedProducts.reduce((sum, item) => {
      const productPrice = parseFloat(priceMap[item.id] ?? item.initial_cost);
      const qty = quantity[item.id] || 1;
      return sum + productPrice * qty;
    }, 0);
    return parseFloat(total.toFixed(2));
  };

  // Calculate tax amount dynamically based on selected tax
  const calculateTaxAmount = () => {
    const subtotal = calculateSubTotal();
    const taxRate = selectedTax?.tax_value || 0;
    return parseFloat((subtotal * taxRate / 100).toFixed(2));
  };

  const handleQuantityChange = (productId, quantityValue) => {
    setQuantity((prev) => ({
      ...prev,
      [productId]: quantityValue,
    }));
    setQuantityError("");
  };

  // --- Product Selection ---
  const handleProductSelection = (product) => {
    const index = selectedProducts.findIndex((p) => p.id === product.id);
    const updated = [...selectedProducts];
    if (index > -1) {
      updated[index] = { ...updated[index], quantity: quantity[product.id] || 1 };
    } else {
      updated.push({ ...product, quantity: 1 });
    }
    setSelectedProducts(updated);
  };

  const showModal = (product) => {
    setCurrentProduct(product);
    setPrice(product.initial_cost);
    setQuantity((prev) => ({
      ...prev,
      [product.id]: prev[product.id] || 1,
    }));

    // Set default warehouse if not already selected
    if (!selectedWarehouses[product.id] && product.warehouses && product.warehouses.length > 0) {
      setSelectedWarehouses(prev => ({
        ...prev,
        [product.id]: product.warehouses[0].warehouse_id
      }));
    }

    setIsModalVisible(true);
  };

  const handleOk = () => {
    const selectedWarehouseId = selectedWarehouses[currentProduct.id];
    // Find the warehouse in the current product's warehouses array
    const selectedWarehouse = currentProduct.warehouses?.find(wh => String(wh.warehouse_id) === String(selectedWarehouseId));

    // Debug logging
    console.log("Selected warehouse ID:", selectedWarehouseId);
    console.log("Selected warehouse:", selectedWarehouse);
    console.log("All warehouses:", currentProduct.warehouses);

    // If we can't find warehouse, try to match by string conversion
    const availableStock = selectedWarehouse ? selectedWarehouse.stock_qty : 0;
    const requestedQuantity = quantity[currentProduct.id] || 1;

    if (requestedQuantity > availableStock) {
      setQuantityError(`Only ${availableStock} units available in selected warehouse.`);
      return;
    }

    setQuantityError("");
    const index = selectedProducts.findIndex((p) => p.id === currentProduct.id);
    const updated = [...selectedProducts];
    if (index > -1) {
      updated[index] = {
        ...updated[index],
        quantity: quantity[currentProduct.id] || 1,
        selectedWarehouseId: selectedWarehouseId
      };
    } else {
      updated.push({
        ...currentProduct,
        quantity: quantity[currentProduct.id] || 1,
        selectedWarehouseId: selectedWarehouseId
      });
    }
    setSelectedProducts(updated);
    setIsModalVisible(false);
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleRemoveProduct = (id) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  };

  // --- Payment Status ---
  const handlePaymentStatusChange = (e) => {
    const status = e.target.value;
    setPaymentStatus(status);

    if (status === "2") { // Paid
      setAmountPaid(calculateTotal());
      setAmountDue(0);
    } else if (status === "0") { // Due
      setAmountPaid(0);
      setAmountDue(calculateTotal());
    } else if (status === "1") { // Partial
      setAmountPaid(calculateTotal() / 2);
      setAmountDue(calculateTotal() / 2);
    } else if (status === "3") { // Cash
      setAmountPaid(calculateTotal());
      setAmountDue(0);
    }
  };

  const handleAmountPaidChange = (e) => {
    const paid = parseFloat(e.target.value) || 0;
    setAmountPaid(paid);
    setAmountDue(calculateTotal() - paid);
  };

  // Custom Dropdown component for tax selection with delete buttons
  const CustomTaxDropdown = () => (
    <Dropdown>
      <Dropdown.Toggle variant="success" id="tax-dropdown" className="tax-dropdown-toggle">
        {selectedTax?.tax_class || "GST"} - {selectedTax?.tax_value || 0}%
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {taxes.map((tax) => (
          <Dropdown.Item key={tax.id} as="div">
            <div className="d-flex justify-content-between align-items-center">
              <div
                className="flex-grow-1"
                onClick={() => handleTaxSelect(tax)}
                style={{ cursor: 'pointer' }}
              >
                {tax.tax_class} - {tax.tax_value}%
              </div>
              {posPermissions.can_delete && tax.id !== 4 && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTax(tax.id);
                  }}
                >
                  <FaTrash />
                </Button>
              )}
            </div>
          </Dropdown.Item>
        ))}
        {posPermissions.can_create && (
          <>
            <Dropdown.Divider />
            <Dropdown.Item as="div">
              <Button
                variant="primary"
                className="w-100"
                onClick={() => setShowAddTaxModal(true)}
              >
                Add New Tax
              </Button>
            </Dropdown.Item>
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );

  if (loading) {
    return (
      <Container fluid className="p-4 loading-container" style={{ minHeight: '100vh' }}>
        <div className="text-center py-5">
          <Spinner animation="border" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading POS data...</p>
        </div>
      </Container>
    );
  }

  if (!posPermissions.can_view) {
    return (
      <Container fluid className="p-4 loading-container" style={{ minHeight: '100vh' }}>
        <div className="text-center py-5">
          <h3 className="text-danger">Access Denied</h3>
          <p>You don't have permission to view the Point of Sale module.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 pos-container">
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="pos-title">
          <i className="fas fa-cash-register me-2"></i>
          Point of Sale
        </h3>
        <p className="pos-subtitle">
          Create invoices and process sales transactions
        </p>
      </div>

      <Row>
        {/* Left Side */}
        <Col md={8}>
          <CustomerList onSelectCustomer={setSelectedCustomer} />
          {selectedCustomer && (
            <Alert variant="info" className="mt-2 customer-alert alert-custom alert-info-custom">
              <strong>Selected Customer:</strong> {selectedCustomer?.name_english}
            </Alert>
          )}

          {/* Available Products */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
              <h4 className="section-title mb-0">Available Products</h4>
              {posPermissions.can_create && (
                <Button
                  onClick={() => setShowAdd(true)}
                  className="btn-add-product"
                >
                  <i className="fas fa-plus me-1"></i> Add Product
                </Button>
              )}
            </div>
            {products?.length === 0 ? (
              <Alert variant="warning" className="alert-custom alert-warning-custom">
                <div className="d-flex align-items-center">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <div>
                    <strong>No products found</strong>
                    <p className="mb-0">Please add products to the system to continue.</p>
                  </div>
                </div>
              </Alert>
            ) : (
              <Card className="pos-table-card">
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover responsive className="pos-table">
                      <thead className="table-header">
                        <tr>
                          <th>Image</th>
                          <th>Product Name</th>
                          <th>Price</th>
                          <th>Warehouses</th>
                          <th>Total Stock</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => {
                          const totalStock = product.warehouses?.reduce((sum, wh) => sum + (wh.stock_qty || 0), 0) || 0;
                          const isSelected = selectedProducts.some((p) => p.id === product.id);

                          return (
                            <tr key={product.id}>
                              <td>
                                <div
                                  onClick={() => showModal(product)}
                                  style={{ cursor: "pointer" }}>
                                  <Image
                                    src={product.image || "https://via.placeholder.com/50"}
                                    alt={product.item_name}
                                    rounded
                                    className={`product-image ${isSelected ? 'selected' : ''}`}
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="fw-semibold">{product?.item_name}</td>
                              <td><strong>{symbol} {convertPrice(product.initial_cost)}</strong></td>
                              <td>
                                {product?.warehouses && product?.warehouses.length > 0 ? (
                                  <div className="warehouse-info">
                                    {product.warehouses.map((wh, index) => (
                                      <div key={index} className="mb-1">
                                        <small>
                                          <strong>{wh.warehouse_name}:</strong> {wh.stock_qty} units ({wh.location})
                                        </small>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <small className="text-muted">N/A</small>
                                )}
                              </td>
                              <td><strong>{totalStock} units</strong></td>
                              <td>
                                <Button
                                  className={isSelected ? "btn-selected" : "btn-select"}
                                  onClick={() => showModal(product)} 
                                  size="sm">
                                  {isSelected ? "Selected" : "Select"}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>

          {/* Selected Products */}
          <Card className="selected-products-card">
            <h4 className="section-title">Selected Products</h4>
            <div className="product-list">
              {selectedProducts.length === 0 ? (
                <Alert variant="info" className="alert-custom alert-info-custom">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-info-circle me-2"></i>
                    <div>
                      <strong>No products selected</strong>
                      <p className="mb-0">Select products from the list above to add them to your order.</p>
                    </div>
                  </div>
                </Alert>
              ) : (
                <Row>
                  {selectedProducts?.map((product) => {
                    const qty = quantity[product.id] || 1;
                    const unitPrice = parseFloat(priceMap[product.id] ?? product.initial_cost) || 0;
                    const total = unitPrice * qty;
                    const totalStock = product.warehouses?.reduce((sum, wh) => sum + (wh.stock_qty || 0), 0) || 0;
                    const selectedWarehouseId = selectedWarehouses[product.id];
                    const selectedWarehouse = product.warehouses?.find(wh => String(wh.warehouse_id) === String(selectedWarehouseId));

                    return (
                      <Col key={product.id} md={6} className="mb-3">
                        <Card className="product-card">
                          <Card.Body className="d-flex">
                            <Image
                              src={product.image || "https://via.placeholder.com/80"}
                              alt={product.item_name}
                              rounded
                              style={{ width: "80px", height: "80px", objectFit: "cover" }}
                              className="me-3" />
                            <div className="flex-grow-1">
                              <Card.Title className="fw-semibold">{product.item_name}</Card.Title>
                              <Card.Text>
                                <div style={{ maxHeight: "80px", overflowY: "auto" }}>
                                  <small>
                                    <strong>Selected Warehouse:</strong> {selectedWarehouse ? selectedWarehouse.warehouse_name : 'N/A'}<br />
                                  </small>
                                </div>
                                <br />
                                Total Stock: {totalStock} units<br />
                                <strong>{qty} x {symbol}{convertPrice(unitPrice)} = {symbol}{convertPrice(total)}</strong>
                              </Card.Text>
                              <Button
                                className="btn-remove"
                                onClick={() => handleRemoveProduct(product.id)}
                                size="sm"
                              >
                                <FaTrash className="me-1" /> Remove
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </div>
          </Card>
        </Col>

        {/* Right Side */}
        <Col md={4}>
          <Card className="pos-sidebar-card">
            <Row className="mb-3">
              <Col xs={12} className="mb-3">
                <Form.Label className="form-label-custom">Tax</Form.Label>
                <CustomTaxDropdown />
              </Col>
              <Col xs={12}>
                <Form.Label className="form-label-custom">Payment Status</Form.Label>
                <Form.Select 
                  value={paymentStatus} 
                  onChange={handlePaymentStatusChange}
                  className="form-select-custom"
                >
                  <option value="0">Due Payment</option>
                  <option value="1">Partial Payment</option>
                  <option value="2">Paid</option>
                  <option value="3">Cash</option>
                </Form.Select>
              </Col>
            </Row>

            {paymentStatus === "1" && (
              <Row className="mb-3">
                <Col xs={12}>
                  <Form.Label className="form-label-custom">Amount Paid</Form.Label>
                  <Form.Control
                    type="number"
                    value={amountPaid}
                    onChange={handleAmountPaidChange}
                    min={0}
                    max={calculateTotal()}
                    className="form-control-custom"
                  />
                </Col>
              </Row>
            )}

            <div className="summary-box">
              <div className="summary-row">
                <strong>Subtotal:</strong>
                <span>{symbol}{convertPrice(calculateSubTotal())}</span>
              </div>
              <div className="summary-row">
                <strong>{selectedTax?.tax_class || "GST"} ({selectedTax?.tax_value || 0}%):</strong>
                <span>{symbol}{convertPrice(calculateTaxAmount())}</span>
              </div>
              {(paymentStatus === "1" || paymentStatus === "3") && (
                <>
                  <div className="summary-row">
                    <strong>Amount Paid:</strong>
                    <span>{symbol}{convertPrice(amountPaid)}</span>
                  </div>
                  <div className="summary-row">
                    <strong>Amount Due:</strong>
                    <span>{symbol}{convertPrice(amountDue)}</span>
                  </div>
                </>
              )}
              {paymentStatus === "3" && amountPaid > calculateTotal() && (
                <div className="summary-row">
                  <strong>Change:</strong>
                  <span>{symbol}{convertPrice(amountPaid - calculateTotal())}</span>
                </div>
              )}
              <div className="summary-total">
                <h5>Total:</h5>
                <h5>{symbol}{convertPrice(calculateTotal())}</h5>
              </div>
            </div>
          </Card>
        </Col>

        {/* Success Message */}
        {successMessage && (
          <Alert variant="success" className="mt-3 alert-custom alert-success-custom">
            <i className="fas fa-check-circle me-2"></i>
            {successMessage}
          </Alert>
        )}

        {/* Validation Error */}
        {validationError && (
          <Alert variant="danger" className="mt-3 alert-custom alert-danger-custom">
            <i className="fas fa-exclamation-circle me-2"></i>
            {validationError}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="action-buttons-container">
          {posPermissions.can_create && (
            <Button
              className="btn-generate-invoice"
              onClick={handleCreateInvoice}
              disabled={selectedProducts.length === 0}
            >
              <i className="fas fa-file-invoice me-2"></i>
              Generate Invoice
            </Button>
          )}
          <Button
            className="btn-clear"
            onClick={handleClear}
            disabled={selectedProducts.length === 0}
          >
            <i className="fas fa-times me-2"></i>
            Clear Selection
          </Button>
        </div>
      </Row>

      {/* Product Details Modal */}
      <Modal 
        show={isModalVisible} 
        onHide={handleCancel} 
        centered
        className="pos-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <h5 className="fw-bold mb-3">{currentProduct?.item_name}</h5>

          <p><strong>Total Stock:</strong> {warehouseStock[currentProduct?.id] || 0} units</p>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Select Warehouse</Form.Label>
            <Form.Select
              value={selectedWarehouses[currentProduct?.id] || ''}
              onChange={handleWarehouseChange}
              className="form-select-custom"
            >
              {currentProduct?.warehouses && currentProduct.warehouses.length > 0 ? (
                currentProduct.warehouses.map((warehouse) => (
                  <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                    {warehouse.warehouse_name} - {warehouse.stock_qty} units available
                  </option>
                ))
              ) : (
                <option value="">No warehouses available</option>
              )}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">Quantity</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={quantity[currentProduct?.id] || 1}
              onChange={(e) =>
                handleQuantityChange(currentProduct.id, parseInt(e.target.value))
              }
              className="form-control-custom"
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="form-label-custom">Price per unit ({symbol})</Form.Label>
            <Form.Control 
              type="number" 
              value={price} 
              onChange={handlePriceChange}
              className="form-control-custom"
            />
          </Form.Group>

          <div className="mt-3 p-3 bg-light rounded">
            <strong>Total Price:</strong> {symbol} {isNaN(price * (quantity[currentProduct?.id] || 1))
              ? "0.00"
              : convertPrice(price * (quantity[currentProduct?.id] || 1))}
          </div>

          {quantityError && (
            <Alert variant="danger" className="mt-2 alert-custom alert-danger-custom">
              {quantityError}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={handleCancel}>
            Cancel
          </Button>
          <Button className="btn-modal-ok" onClick={handleOk}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Tax Modal */}
      <Modal 
        show={showAddTaxModal} 
        onHide={() => setShowAddTaxModal(false)} 
        centered
        className="pos-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Add New Tax</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Form onSubmit={handleTaxFormSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Tax Class</Form.Label>
              <Form.Control
                type="text"
                value={newTaxClass}
                onChange={(e) => setNewTaxClass(e.target.value)}
                className="form-control-custom"
                placeholder="e.g., GST, VAT, Sales Tax"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Tax Value (%)</Form.Label>
              <Form.Control
                type="number"
                value={newTaxValue}
                onChange={(e) => setNewTaxValue(e.target.value)}
                className="form-control-custom"
                placeholder="e.g., 10, 18, 20"
                min="0"
                max="100"
                step="0.01"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={() => setShowAddTaxModal(false)}>
            Cancel
          </Button>
          <Button type="submit" className="btn-modal-ok" onClick={handleTaxFormSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Product Modal */}
      <AddProductModal
        showAdd={showAdd}
        showEdit={showEdit}
        newItem={newItem}
        categories={categories}
        newCategory={newCategory}
        showUOMModal={showUOMModal}
        showAddCategoryModal={showAddCategoryModal}
        setShowAdd={setShowAdd}
        setShowEdit={setShowEdit}
        setShowUOMModal={setShowUOMModal}
        setShowAddCategoryModal={setShowAddCategoryModal}
        setNewCategory={setNewCategory}
        handleChange={handleChange}
        handleAddItem={handleAddItem}
        handleUpdateItem={handleUpdateItem}
        handleAddCategory={handleAddCategory}
        companyId={companyId}
      />
    </Container>
  );
};

export default PointOfSale;