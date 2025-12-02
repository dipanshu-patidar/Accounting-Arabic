import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Table, Badge, Dropdown } from "react-bootstrap";
import {
  FaArrowLeft,
  FaWarehouse,
  FaBoxes,
  FaFilter,
  FaTable,
  FaTh,
} from "react-icons/fa";
import AddProductModal from "../AddProductModal";
import GetCompanyId from "../../../../Api/GetCompanyId";
import axiosInstance from "../../../../Api/axiosInstance";

const WareHouseDetail = () => {
  const companyId = GetCompanyId();
  const { id } = useParams();
  const navigate = useNavigate();

  const [warehouse, setWarehouse] = useState(null);
  const [summary, setSummary] = useState(null);
  const [categoryWiseSummary, setCategoryWiseSummary] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [filter, setFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [showCategoryTable, setShowCategoryTable] = useState(false);
  const [lowestStockProduct, setLowestStockProduct] = useState(null);
  const [highestStockProduct, setHighestStockProduct] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [totalStocks, setTotalStocks] = useState(0);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  // Fetch warehouse data
  useEffect(() => {
    const fetchWarehouseData = async () => {
      if (!companyId || !id) return;

      try {
        const response = await axiosInstance.get(`/warehouses/${companyId}/${id}/stock`);
        const data = response.data;

        if (data.success) {
          setWarehouse({
            _id: data.warehouse.id.toString(),
            name: data.warehouse.warehouse_name,
            location: data.warehouse.location,
            addressLine1: data.warehouse.address_line1,
            addressLine2: data.warehouse.address_line2,
            city: data.warehouse.city,
            state: data.warehouse.state,
            pincode: data.warehouse.pincode,
            country: data.warehouse.country,
          });

          setSummary(data.summary);
          setTotalStocks(data.totalStocks);
          setLowestStockProduct(data.lowestStockProduct);
          setHighestStockProduct(data.highestStockProduct);
          setCategoryWiseSummary(data.categoryWiseSummary);
          setInventoryList(
            data.inventoryList.map((item) => ({
              ...item,
              name: item.product_name,
              unit: item.measurement,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching warehouse data:", error);
        setWarehouse(null);
      }
    };

    fetchWarehouseData();
  }, [id, companyId]);

  // Apply filters
  const filteredProducts = inventoryList.filter((item) => {
    // Category filter
    if (filter !== "All" && item.category !== filter) return false;

    // Stock level filter
    if (stockFilter === "Low") return item.stock <= 10;
    if (stockFilter === "Medium") return item.stock > 10 && item.stock <= 30;
    if (stockFilter === "High") return item.stock > 30;
    return true; // "All"
  });

  // Get unique categories from inventory
  const uniqueCategories = [...new Set(inventoryList.map((item) => item.category))];

  // Badge color helper
  const getCategoryBadgeColor = (category) => {
    const colorMap = {
      MI: "primary",
      Pavilion: "success",
      Iphone: "warning",
    };
    return colorMap[category] || "info";
  };

  const getStockLevelLabel = (qty) => {
    if (qty <= 10) return "Low";
    if (qty <= 30) return "Medium";
    return "High";
  };

  const handleAddStockModal = () => {
    setSelectedWarehouse(warehouse?.name || "");
    setShowAdd(true);
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* Left Side: Back Button + Heading */}
        <div className="d-flex align-items-center gap-3">
          <Button
            variant="outline-dark"
            onClick={() => navigate(-1)}
            className="d-flex align-items-center rounded-pill px-3 shadow-sm"
          >
            <FaArrowLeft className="me-2" />
            Back
          </Button>

          <h3 className="fw-bold mb-0 text-primary-emphasis d-flex align-items-center">
            <FaBoxes className="me-2 text-warning" />
            <span className="text-gradient">Stock by Warehouse</span>
          </h3>
        </div>

        {/* Right Side: Add Product Button */}
        <Button
          onClick={handleAddStockModal}
          style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa" }}
        >
          Add New Product
        </Button>
      </div>

      {/* Add Product Modal - UPDATED PROPS */}
      <AddProductModal
        showAdd={showAdd}
        showEdit={false}
        setShowAdd={setShowAdd}
        setShowEdit={() => {}}
        companyId={companyId}
        onSuccess={() => {
          // Refetch warehouse data after adding a product
          const fetchWarehouseData = async () => {
            if (!companyId || !id) return;

            try {
              const response = await axiosInstance.get(`/warehouses/${companyId}/${id}/stock`);
              const data = response.data;

              if (data.success) {
                setSummary(data.summary);
                setTotalStocks(data.totalStocks);
                setLowestStockProduct(data.lowestStockProduct);
                setHighestStockProduct(data.highestStockProduct);
                setCategoryWiseSummary(data.categoryWiseSummary);
                setInventoryList(
                  data.inventoryList.map((item) => ({
                    ...item,
                    name: item.product_name,
                    unit: item.measurement,
                  }))
                );
              }
            } catch (error) {
              console.error("Error fetching warehouse data:", error);
            }
          };
          fetchWarehouseData();
        }}
        // NEW: Pass the preselected warehouse ID
        preselectedWarehouseId={id}
      />

      {/* Warehouse Info */}
      {warehouse && summary ? (
        <>
          <Card className="shadow-lg border-0 mb-4">
            <Card.Body className="bg-light">
              <h4 className="fw-bold text-primary mb-1 d-flex align-items-center">
                <FaWarehouse className="me-2" />
                {warehouse.name}
              </h4>
              <p className="mb-1 text-muted">
                <strong>📍 Location:</strong> {warehouse.location || "Not specified"}
              </p>
              <p className="mb-0 text-dark ps-4">
                {warehouse.addressLine1 || "Address not specified"}
                {warehouse.addressLine2 && (
                  <>
                    <br />
                    {warehouse.addressLine2}
                  </>
                )}
                <br />
                {warehouse.city ? `${warehouse.city}, ` : ""}
                {warehouse.state ? `${warehouse.state} - ` : ""}
                {warehouse.pincode || "Pincode not specified"}<br />
                {warehouse.country || "Country not specified"}
              </p>
            </Card.Body>
          </Card>

          {/* Summary Cards */}
          <div className="row row-cols-1 row-cols-md-3 g-4 mb-4">
            <div className="col">
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h6 className="text-muted mb-1">Total Categories</h6>
                  <h4 className="fw-bold text-primary">{summary.totalCategories}</h4>
                </Card.Body>
              </Card>
            </div>
            <div className="col">
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h6 className="text-muted mb-1">Total Products</h6>
                  <h4 className="fw-bold text-success">{summary.totalProducts}</h4>
                </Card.Body>
              </Card>
            </div>
            <div className="col">
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h6 className="text-muted mb-1">Total Stock Units</h6>
                  <h4 className="fw-bold text-dark">{totalStocks}</h4>
                </Card.Body>
              </Card>
            </div>
            <div className="col">
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h6 className="text-muted mb-1">Lowest Stock Product</h6>
                  <h5 className="fw-bold text-danger">
                    {lowestStockProduct
                      ? `${lowestStockProduct.name} (${lowestStockProduct.qty})`
                      : "-"}
                  </h5>
                </Card.Body>
              </Card>
            </div>
            <div className="col">
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h6 className="text-muted mb-1">Highest Stock Product</h6>
                  <h5 className="fw-bold text-info">
                    {highestStockProduct
                      ? `${highestStockProduct.name} (${highestStockProduct.qty})`
                      : "-"}
                  </h5>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* Toggle Category View */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Button
              onClick={() => setShowCategoryTable(!showCategoryTable)}
              className="d-flex align-items-center"
              style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa" }}
            >
              {showCategoryTable ? (
                <>
                  <FaTh className="me-2" /> Show Flat List
                </>
              ) : (
                <>
                  <FaTable className="me-2" /> Show Category-wise Stock
                </>
              )}
            </Button>
          </div>

          {/* Category-wise Summary Table */}
          {showCategoryTable && (
            <Card className="shadow border-0 mb-4">
              <Card.Header className="bg-white border-bottom">
                <strong>Category-wise Stock Summary</strong>
              </Card.Header>
              <Card.Body className="p-0">
                <Table striped hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Category</th>
                      <th>Total Items</th>
                      <th>Total Stock</th>
                      <th>Total Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryWiseSummary.map((cat, index) => (
                      <tr key={index}>
                        <td>
                          <Badge bg={getCategoryBadgeColor(cat.category)}>
                            {cat.category}
                          </Badge>
                        </td>
                        <td>{cat.totalItems}</td>
                        <td>{cat.totalStock}</td>
                        <td>₹{cat.totalValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Filters */}
          <div className="d-flex flex-wrap gap-2 mb-3 mt-4">
            <Dropdown className="flex-grow-1 flex-md-grow-0">
              <Dropdown.Toggle
                variant="outline-primary"
                id="dropdown-category"
                className="d-flex align-items-center w-100"
              >
                <FaFilter className="me-2" />
                {filter === "All" ? "All Categories" : filter}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100">
                <Dropdown.Item onClick={() => setFilter("All")}>All</Dropdown.Item>
                {uniqueCategories.map((category) => (
                  <Dropdown.Item
                    key={category}
                    onClick={() => setFilter(category)}
                  >
                    {category}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown className="flex-grow-1 flex-md-grow-0">
              <Dropdown.Toggle
                variant="outline-primary"
                id="dropdown-stock"
                className="d-flex align-items-center w-100"
              >
                <FaFilter className="me-2" />
                {stockFilter === "All" ? "All Stock Levels" : stockFilter}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setStockFilter("All")}>All</Dropdown.Item>
                <Dropdown.Item onClick={() => setStockFilter("Low")}>
                  Low (0–10)
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setStockFilter("Medium")}>
                  Medium (11–30)
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setStockFilter("High")}>
                  High (31+)
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Inventory List */}
          <Card className="shadow border-0 mb-4">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <strong>Inventory List</strong>
                <div>
                  <strong>Total Stock: </strong>
                  <Badge bg="dark" pill className="px-3 py-2">
                    {filteredProducts.reduce((sum, item) => sum + item.stock, 0)}
                  </Badge>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Table striped hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "8%" }}>#</th>
                    <th>Category</th>
                    <th>Product</th>
                    <th>Measurement</th>
                    <th style={{ width: "12%" }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((item) => (
                      <tr key={item.index}>
                        <td className="text-muted">{item.index}</td>
                        <td>
                          <Badge bg={getCategoryBadgeColor(item.category)}>
                            {item.category}
                          </Badge>
                        </td>
                        <td className="fw-semibold">{item.name}</td>
                        <td className="text-secondary">{item.unit}</td>
                        <td>
                          <Badge
                            bg={
                              item.stock > 30
                                ? "success"
                                : item.stock > 10
                                ? "warning"
                                : "danger"
                            }
                            className="px-3 py-2 rounded-pill"
                          >
                            {item.stock} ({getStockLevelLabel(item.stock)})
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      ) : (
        <Card className="text-center p-5 border-0 shadow-sm bg-light">
          <p className="text-muted">Warehouse not found.</p>
        </Card>
      )}
    </div>
  );
};

export default WareHouseDetail;