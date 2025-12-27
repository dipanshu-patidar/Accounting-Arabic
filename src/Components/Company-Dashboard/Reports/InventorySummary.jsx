import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  Badge,
  Container,
  Row,
  Col,
  InputGroup,
  Button,
  Modal,
  Card,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import { FaWarehouse, FaFile, FaSearch, FaDownload, FaFileExcel, FaFileImport } from "react-icons/fa";
import * as XLSX from "xlsx";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import BaseUrl from "../../../Api/BaseUrl";
import './InventorySummary.css';

const InventorySummary = () => {
  const companyId = GetCompanyId();
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // New state for date filters
  const [purchaseDateFilter, setPurchaseDateFilter] = useState({ start: "", end: "" });
  const [salesDateFilter, setSalesDateFilter] = useState({ start: "", end: "" });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch inventory data from API
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${BaseUrl}inventory/summary?companyId=${companyId}&page=${currentPage}`);
        
        if (response.data.success) {
          // Transform the API data to match our component's expected format
          const transformedData = response.data.data.map(item => ({
            id: item.id, // Include the id from the API response
            productId: item.productId, 
            productName: item.productName,
            sku: item.sku,
            warehouse: item.warehouse,
            opening: item.opening,
            inward: item.inward,
            outward: item.outward,
            closing: item.closing,
            price: item.price,
            totalValue: item.totalValue,
            status: item.status,
            // Add additional fields that might be needed for detailed view
            description: "",
            category: "",
            brand: "",
            unit: "Pieces",
            hsnCode: "",
            valuationMethod: "Average Cost",
            minStockLevel: 5,
            maxStockLevel: 100,
            supplier: "",
            lastPurchaseDate: "",
            lastSaleDate: "",
            purchaseHistory: [],
            salesHistory: []
          }));
          
          setInventoryData(transformedData);
          setTotalPages(response.data.pagination.totalPages);
          setTotalCount(response.data.pagination.totalCount);
        } else {
          setError("Failed to fetch inventory data");
        }
      } catch (err) {
        setError("Error fetching inventory data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [currentPage, companyId]);

  // Filter using product name
  const filteredData = inventoryData.filter(
    (item) =>
      item.productName.toLowerCase().includes(search.toLowerCase()) &&
      (priceFilter === "" || item.price >= parseFloat(priceFilter))
  );

  const handleImport = () => {
    console.log("Import clicked");
  };

  const handleExport = () => {
    const exportData = filteredData.map((item) => ({
      Product: item.productName,
      SKU: item.sku,
      Warehouse: item.warehouse,
      Opening: item.opening,
      Inward: item.inward,
      Outward: item.outward,
      Closing: item.closing,
      Price: item.price,
      TotalValue: item.totalValue,
      Status: item.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Summary");
    XLSX.writeFile(workbook, "Inventory_Summary.xlsx");
  };

  const handleDownloadTemplate = () => {
    const templateHeaders = [
      {
        Product: "",
        SKU: "",
        Warehouse: "",
        Opening: "",
        Inward: "",
        Outward: "",
        Closing: "",
        Price: "",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateHeaders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Inventory_Template.xlsx");
  };

  // Fetch detailed product information when View Details is clicked
  const handleViewDetails = async (item) => {
    try {
      setDetailsLoading(true);
      // Fetch detailed product information using the new API endpoint
      const response = await axiosInstance.get(`${BaseUrl}inventory/product/${companyId}/${item.productId}`);
      
      if (response.data.success) {
        // Create a product object in the format expected by the modal
        const product = {
          id: response.data.productMaster.id,
          name: response.data.productMaster.item_name,
          sku: response.data.productMaster.sku,
          description: response.data.productMaster.description,
          category: response.data.productMaster.item_category.item_category_name,
          brand: "",
          unit: "Pieces",
          hsnCode: response.data.productMaster.hsn,
          valuationMethod: "Average Cost",
          minStockLevel: response.data.productMaster.min_order_qty,
          maxStockLevel: 100,
          supplier: "",
          warehouses: response.data.stockSummary.map(stockItem => ({
            name: stockItem.warehouse,
            opening: stockItem.opening,
            inward: stockItem.inward,
            outward: stockItem.outward,
            closing: stockItem.closing,
            price: response.data.productMaster.sale_price,
            lastPurchaseDate: stockItem.lastPurchaseDate,
            lastSaleDate: stockItem.lastSaleDate,
            purchaseHistory: response.data.purchaseHistory,
            salesHistory: response.data.salesHistory,
          }))
        };
        
        setSelectedProduct(product);
        setSelectedWarehouse(item.warehouse);
        setPurchaseDateFilter({ start: "", end: "" });
        setSalesDateFilter({ start: "", end: "" });
        setShowModal(true);
      } else {
        setError("Failed to fetch product details");
      }
    } catch (err) {
      setError("Error fetching product details: " + err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getWarehouseStats = (warehouseName) => {
    const warehouseProducts = inventoryData.filter(item => item.warehouse === warehouseName);
    const totalProducts = warehouseProducts.length;
    const totalOpening = warehouseProducts.reduce((sum, item) => sum + item.opening, 0);
    const totalInward = warehouseProducts.reduce((sum, item) => sum + item.inward, 0);
    const totalOutward = warehouseProducts.reduce((sum, item) => sum + item.outward, 0);
    const totalClosing = warehouseProducts.reduce((sum, item) => sum + item.closing, 0);
    const totalValue = warehouseProducts.reduce((sum, item) => sum + item.totalValue, 0);
    const totalSalesValue = warehouseProducts.reduce((sum, item) => sum + (item.outward * item.price), 0);

    return {
      totalProducts,
      totalOpening,
      totalInward,
      totalOutward,
      totalClosing,
      totalValue,
      totalSalesValue,
    };
  };

  // Function to filter history by date range
  const filterHistoryByDate = (history, dateFilter) => {
    if (!dateFilter.start && !dateFilter.end) return history;

    return history.filter(item => {
      const itemDate = new Date(item.date);
      const startDate = dateFilter.start ? new Date(dateFilter.start) : null;
      const endDate = dateFilter.end ? new Date(dateFilter.end) : null;

      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      } else if (startDate) {
        return itemDate >= startDate;
      } else if (endDate) {
        return itemDate <= endDate;
      }
      return true;
    });
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Container fluid className="inventory-summary-container py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h4 className="inventory-summary-title">
            <FaWarehouse className="me-2" />
            Inventory Summary
          </h4>
          <p className="inventory-summary-subtitle mb-0">Manage and track your inventory data</p>
        </div>
        <div className="d-flex gap-2 flex-wrap mt-2">
          <Button className="btn-import" onClick={handleImport}>
            <FaFileImport className="me-2" />
            Import
          </Button>
          <Button className="btn-export" onClick={handleExport}>
            <FaDownload className="me-2" />
            Export
          </Button>
          <Button className="btn-template" onClick={handleDownloadTemplate}>
            <FaFileExcel className="me-2" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="search-filter-card">
        <Row className="g-3">
          <Col md={6}>
            <Form.Label className="filter-label">Search Product</Form.Label>
            <InputGroup>
              <InputGroup.Text style={{ background: '#f8f9fa', borderRight: 'none' }}>
                <FaSearch style={{ color: '#6c757d' }} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                className="filter-input"
                placeholder="Search by product name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderLeft: 'none' }}
              />
            </InputGroup>
          </Col>
          <Col md={6}>
            <Form.Label className="filter-label">Minimum Price Filter</Form.Label>
            <Form.Control
              type="number"
              className="filter-input"
              placeholder="Filter by min price..."
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            />
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" className="spinner-custom" />
          <p className="mt-3">Loading inventory data...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger alert-custom" role="alert">
          {error}
        </div>
      ) : (
        <Card className="inventory-summary-table-card">
          <Card.Body>
            <div className="table-responsive">
              {filteredData.length > 0 ? (
                <>
                  <Table className="inventory-summary-table" hover responsive="sm">
                    <thead className="table-header">
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Warehouse</th>
                        <th>Opening</th>
                        <th>Inward</th>
                        <th>Outward</th>
                        <th>Closing</th>
                        <th>Price (₹)</th>
                        <th>Total Value (₹)</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => {
                        const statusBadge = item.status === "Low Stock" ? (
                          <Badge bg="danger" className="status-badge">Low Stock</Badge>
                        ) : item.status === "Out of Stock" ? (
                          <Badge bg="warning" className="status-badge">Out of Stock</Badge>
                        ) : (
                          <Badge bg="success" className="status-badge">In Stock</Badge>
                        );
                        return (
                          <tr key={item.id}>
                            <td><strong>{(currentPage - 1) * 10 + index + 1}</strong></td>
                            <td><strong>{item.productName}</strong></td>
                            <td>{item.sku}</td>
                            <td>{item.warehouse}</td>
                            <td>{item.opening}</td>
                            <td>{item.inward}</td>
                            <td>{item.outward}</td>
                            <td><strong>{item.closing}</strong></td>
                            <td>₹{item.price}</td>
                            <td className="amount-cell">₹{item.totalValue}</td>
                            <td>{statusBadge}</td>
                            <td>
                              <Button
                                className="btn-view-details"
                                size="sm"
                                onClick={() => handleViewDetails(item)}
                                disabled={detailsLoading}
                              >
                                {detailsLoading ? (
                                  <>
                                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                                    Loading...
                                  </>
                                ) : (
                                  'View Details'
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </>
              ) : (
                <div className="text-center py-5 empty-state">
                  <FaFile style={{ fontSize: "3rem", color: "#adb5bd", marginBottom: "1rem" }} />
                  <p className="text-muted mb-0">No inventory data available</p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      )}

      {!loading && !error && filteredData.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
          <small className="text-muted ms-2">
            Showing {filteredData.length} of {totalCount} results
          </small>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  &laquo;
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li 
                  key={index} 
                  className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                >
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Comprehensive Product Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" scrollable className="inventory-summary-modal">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>📋 Comprehensive Product Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedProduct && selectedWarehouse && (
            <>
              {/* Product Master Information */}
              <Card className="modal-card">
                <Card.Header as="h5">Product Master Information</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Product Name:</strong> {selectedProduct.name}</p>
                      <p><strong>SKU:</strong> {selectedProduct.sku}</p>
                      <p><strong>Description:</strong> {selectedProduct.description}</p>
                      <p><strong>Category:</strong> {selectedProduct.category}</p>
                      <p><strong>Brand:</strong> {selectedProduct.brand}</p>
                      <p><strong>Unit:</strong> {selectedProduct.unit}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>HSN Code:</strong> {selectedProduct.hsnCode}</p>
                      <p><strong>Valuation Method:</strong> {selectedProduct.valuationMethod}</p>
                      <p><strong>Min Stock Level:</strong> {selectedProduct.minStockLevel}</p>
                      <p><strong>Max Stock Level:</strong> {selectedProduct.maxStockLevel}</p>
                      <p><strong>Supplier:</strong> {selectedProduct.supplier}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Warehouse Selection */}
              <Card className="modal-card">
                <Card.Header as="h5">Warehouse Locations</Card.Header>
                <Card.Body>
                  <ListGroup horizontal>
                    {selectedProduct.warehouses.map((warehouse, index) => (
                      <ListGroup.Item
                        key={index}
                        active={warehouse.name === selectedWarehouse}
                        action
                        onClick={() => setSelectedWarehouse(warehouse.name)}
                      >
                        {warehouse.name}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>

              {/* Selected Warehouse Details */}
              {(() => {
                const warehouseData = selectedProduct.warehouses.find(
                  (w) => w.name === selectedWarehouse
                );
                if (!warehouseData) return null;

                const filteredPurchaseHistory = filterHistoryByDate(
                  warehouseData.purchaseHistory,
                  purchaseDateFilter
                );
                const filteredSalesHistory = filterHistoryByDate(
                  warehouseData.salesHistory,
                  salesDateFilter
                );

                return (
                  <>
                    {/* Stock Summary */}
                    <Card className="modal-card">
                      <Card.Header as="h5">Stock Summary - {selectedWarehouse}</Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <p><strong>Opening Stock:</strong> {warehouseData.opening} units</p>
                            <p><strong>Purchases (Inward):</strong> {warehouseData.inward} units</p>
                            <p><strong>Purchase Value:</strong> ₹{warehouseData.inward * warehouseData.price}</p>
                            <p><strong>Sales (Outward):</strong> {warehouseData.outward} units</p>
                            <p><strong>Sales Value:</strong> ₹{warehouseData.outward * warehouseData.price}</p>
                          </Col>
                          <Col md={6}>
                            <p><strong>Closing Stock:</strong> {warehouseData.closing} units</p>
                            <p><strong>Stock Value:</strong> ₹{warehouseData.closing * warehouseData.price}</p>
                            <p><strong>Last Purchase Date:</strong> {warehouseData.lastPurchaseDate || "N/A"}</p>
                            <p><strong>Last Sale Date:</strong> {warehouseData.lastSaleDate || "N/A"}</p>
                            <p><strong>Status:</strong> {warehouseData.closing <= selectedProduct.minStockLevel ? (
                              <Badge bg="danger">Low Stock</Badge>
                            ) : (
                              <Badge bg="success">In Stock</Badge>
                            )}</p>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    {/* Purchase History */}
                    <Card className="modal-card">
                      <Card.Header as="h5">Purchase History - {selectedWarehouse}</Card.Header>
                      <Card.Body>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Start Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={purchaseDateFilter.start}
                                onChange={(e) =>
                                  setPurchaseDateFilter({ ...purchaseDateFilter, start: e.target.value })
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>End Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={purchaseDateFilter.end}
                                onChange={(e) =>
                                  setPurchaseDateFilter({ ...purchaseDateFilter, end: e.target.value })
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Table className="modal-table" striped bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Quantity</th>
                              <th>Rate (₹)</th>
                              <th>Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPurchaseHistory.length > 0 ? (
                              filteredPurchaseHistory.map((purchase, index) => (
                                <tr key={index}>
                                  <td>{purchase.date}</td>
                                  <td>{purchase.quantity}</td>
                                  <td>{purchase.rate}</td>
                                  <td>{purchase.amount}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="text-center">
                                  No purchase records found for the selected date range.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>

                    {/* Sales History */}
                    <Card className="modal-card">
                      <Card.Header as="h5">Sales History - {selectedWarehouse}</Card.Header>
                      <Card.Body>
                        <Row className="mb-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Start Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={salesDateFilter.start}
                                onChange={(e) =>
                                  setSalesDateFilter({ ...salesDateFilter, start: e.target.value })
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>End Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={salesDateFilter.end}
                                onChange={(e) =>
                                  setSalesDateFilter({ ...salesDateFilter, end: e.target.value })
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Table className="modal-table" striped bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Quantity</th>
                              <th>Rate (₹)</th>
                              <th>Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSalesHistory.length > 0 ? (
                              filteredSalesHistory.map((sale, index) => (
                                <tr key={index}>
                                  <td>{sale.date}</td>
                                  <td>{sale.quantity}</td>
                                  <td>{sale.rate}</td>
                                  <td>{sale.amount}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="text-center">
                                  No sales records found for the selected date range.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </>
                );
              })()}

              {/* Warehouse Overview */}
              <Card className="modal-card">
                <Card.Header as="h5">Warehouse Overview - {selectedWarehouse}</Card.Header>
                <Card.Body>
                  {(() => {
                    const stats = getWarehouseStats(selectedWarehouse);
                    return (
                      <Row>
                        <Col md={6}>
                          <p><strong>Total Products:</strong> {stats.totalProducts}</p>
                          <p><strong>Total Opening Stock:</strong> {stats.totalOpening} units</p>
                          <p><strong>Total Purchases:</strong> {stats.totalInward} units</p>
                          <p><strong>Total Purchase Value:</strong> ₹{stats.totalInward * (selectedProduct.warehouses.find(w => w.name === selectedWarehouse)?.price || 0)}</p>
                        </Col>
                        <Col md={6}>
                          <p><strong>Total Sales:</strong> {stats.totalOutward} units</p>
                          <p><strong>Total Sales Value:</strong> ₹{stats.totalSalesValue}</p>
                          <p><strong>Total Closing Stock:</strong> {stats.totalClosing} units</p>
                          <p><strong>Total Stock Value:</strong> ₹{stats.totalValue}</p>
                        </Col>
                      </Row>
                    );
                  })()}
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-close" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InventorySummary;