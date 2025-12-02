import React, { useState, useEffect } from "react";
import { Row, Col, Table, Button, Badge, Card } from "react-bootstrap";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axiosInstance from "../../../Api/axiosInstance";
import GetCompanyId from "../../../Api/GetCompanyId";

const InventoryDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: productId } = useParams(); // Get product ID from URL params
  const [item, setItem] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get company ID from utility
  const companyId = GetCompanyId();

  // Fetch inventory details from API
  useEffect(() => {
    const fetchInventoryDetails = async () => {
      try {
        setLoading(true);

        if (!companyId || !productId) {
          setError("Company ID or Product ID is missing.");
          return;
        }

        const response = await axiosInstance.get(
          `products/inventory/details/${companyId}/${productId}`
        );

        if (response.data?.success) {
          const data = response.data;

          // ✅ CORRECTLY TRANSFORM API KEYS (which are in uppercase with spaces)
          const transformedAllTransactions = data.all_transactions.map(
            (transaction) => {
              // Safely parse date
              const parsedDate = new Date(transaction["DATE"]);
              const formattedDate = isNaN(parsedDate.getTime())
                ? transaction["DATE"]
                : parsedDate.toLocaleDateString();

              return {
                DATE: formattedDate,
                "VCH TYPE": transaction["VCH TYPE"] || "",
                PARTICULARS: transaction["PARTICULARS"] || "",
                "VCH NO": transaction["VCH NO"] || "",
                "VOUCHER NO (AUTO)": transaction["VOUCHER NO (AUTO)"] || "",
                WAREHOUSE: transaction["WAREHOUSE"] || "Unassigned Warehouse",
                "RATE/UNIT": transaction["RATE/UNIT"] || "0.00",
                "INWARDS (QTY)": transaction["INWARDS (QTY)"] || 0,
                "INWARDS (VALUE)": transaction["INWARDS (VALUE)"] || "0.00",
                "OUTWARDS (QTY)": transaction["OUTWARDS (QTY)"] || 0,
                "OUTWARDS (VALUE)": transaction["OUTWARDS (VALUE)"] || "0.00",
                "CLOSING QUANTITY": transaction["CLOSING QUANTITY"] || 0,
                DESCRIPTION: transaction["DESCRIPTION"] || "",
                NARRATION: transaction["NARRATION"] || "",
              };
            }
          );

          // Transform the product info for UI - Now including all missing fields
          const transformedItem = {
            id: data.product_info.id,
            itemName: data.product_info.item_name,
            hsn: data.product_info.hsn || "N/A",
            barcode: data.product_info.barcode || "N/A",
            sku: data.product_info.sku || "N/A",
            itemCategory:
              data.product_info.item_category?.item_category_name || "Unknown",
            unit: data.product_info.unit_detail?.uom_name || "Units",
            quantity: data.product_info.total_stock,
            initialQty: data.product_info.initial_qty || 0,
            minOrderQty: data.product_info.min_order_qty || "N/A",
            asOfDate: data.product_info.as_of_date || "N/A",
            initialCost: parseFloat(data.product_info.initial_cost || 0),
            salePrice: parseFloat(data.product_info.sale_price || 0),
            purchasePrice: parseFloat(data.product_info.purchase_price || 0),
            discount: parseFloat(data.product_info.discount || 0),
            taxAccount: data.product_info.tax_account || "N/A",
            remarks: data.product_info.remarks || "N/A",
            image: data.product_info.image || "https://via.placeholder.com/150",
            value:
              data.product_info.total_stock *
              parseFloat(data.product_info.sale_price || 0),
            cost: parseFloat(data.product_info.sale_price || 0),
            status:
              data.product_info.total_stock > 0 ? "In Stock" : "Out of Stock",
            warehouse:
              data.product_info.product_warehouses?.length > 0
                ? data.product_info.product_warehouses[0].warehouse
                    .warehouse_name
                : "Unknown",
            description:
              data.product_info.description || "No description available",
            warehouses:
              data.product_info.product_warehouses?.map((w) => ({
                id: w.warehouse.id,
                name: w.warehouse.warehouse_name,
                location: w.warehouse.location,
                stockQty: w.stock_qty,
                address: `${w.warehouse.address_line1 || ""}, ${w.warehouse.city || ""}, ${w.warehouse.state || ""}, ${w.warehouse.pincode || ""}`,
              })) || [],
          };

          // Create a new data object with transformed transactions
          const transformedData = {
            ...data,
            all_transactions: transformedAllTransactions,
            // Note: purchase_history, sales_history, return_history are empty in your response
            // So tables for them will remain empty (as expected)
          };

          setItem(transformedItem);
          setInventoryData(transformedData);
        } else {
          setError(
            response.data?.message || "Failed to fetch inventory details"
          );
        }
      } catch (err) {
        setError("Error fetching inventory details: " + err.message);
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryDetails();
  }, [companyId, productId]);

  // Voucher types for filter dropdown
  const voucherTypes = [
    "Expense",
    "Income",
    "Contra",
    "Journal",
    "Credit Note",
    "Debit Note",
    "Opening Balance",
    "Current Balance",
    "Closing Balance",
    "Sales",
    "Purchase",
    "Delivery Challan", // ✅ Match your API data ("Delivery Challan", not "Delivery Challans")
    "Transfer",
    "Adjustment",
  ];

  // Filters state
  const [filters, setFilters] = useState({
    date: "",
    vchNo: "",
    vchNoAuto: "",
    vchType: "",
    warehouse: "",
    particulars: "",
    fromDate: "",
    toDate: "",
  });

  const handleSendEmail = () => {
    if (!item) return;
    const subject = "Inventory Details";
    const body = `Item: ${item.itemName}\nCurrent Stock: ${item.quantity} ${
      item.unit
    }\nValue: ₹${item.value.toFixed(2)}\n\nCheck full details in the app.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // --- SAFE FILTERING FUNCTION ---
  const getFilteredData = (data) => {
    if (!data || !Array.isArray(data)) return [];

    return data.filter((row) => {
      const safeIncludes = (value, filter) => {
        if (filter === "") return true;
        if (typeof value !== "string") return false;
        return value.toLowerCase().includes(filter.toLowerCase());
      };

      // Date range filtering
      const rowDate = new Date(row.DATE);
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;

      const isWithinDateRange =
        (!fromDate || rowDate >= fromDate) &&
        (!toDate || rowDate <= toDate);

      return (
        isWithinDateRange &&
        safeIncludes(row.DATE, filters.date) &&
        safeIncludes(row["VCH NO"], filters.vchNo) &&
        safeIncludes(row["VOUCHER NO (AUTO)"], filters.vchNoAuto) &&
        safeIncludes(row["VCH TYPE"], filters.vchType) &&
        safeIncludes(row.WAREHOUSE, filters.warehouse) &&
        safeIncludes(row.PARTICULARS, filters.particulars)
      );
    });
  };
  // --- END SAFE FILTERING FUNCTION ---

  // Get filtered data from API response
  const allTransactions = getFilteredData(inventoryData?.all_transactions);
  const purchaseHistory = getFilteredData(
    inventoryData?.purchase_history?.transactions || []
  );
  const salesHistory = getFilteredData(
    inventoryData?.sales_history?.transactions || []
  );
  const returnHistory = getFilteredData(
    inventoryData?.return_history?.transactions || []
  );

  // Calculate totals from API response
  const totalPurchases = parseFloat(
    inventoryData?.purchase_history?.total_purchase || 0
  );
  const totalSales = parseFloat(inventoryData?.sales_history?.total_sales || 0);
  const totalReturns = parseFloat(
    inventoryData?.return_history?.total_return || 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center mt-[50px] w-screen">
        <div className="bg-white w-11/12 h-auto p-6 rounded-lg shadow-lg text-center">
          <p>Loading inventory details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex items-center justify-center mt-[50px] w-screen">
        <div className="bg-white w-11/12 h-auto p-6 rounded-lg shadow-lg text-center">
          <p className="text-red-500">{error || "No item details found"}</p>
          <Button onClick={() => navigate("/company/inventorys")}>
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="h-auto p-6 rounded-lg shadow-lg">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">Inventory Item Details</h3>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString()} {/* Dynamic date range */}
            </p>
            <Button onClick={handleSendEmail} className="btn-sm">
              Send Email
            </Button>
          </div>
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/company/inventorys")}
            className="flex items-center gap-2"
          >
            <span>&larr;</span> Back to Inventory
          </Button>
        </div>

        {/* Item Details Card with Image */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
          <div className="flex flex-col md:flex-row">
            {/* Product Image */}
            <div className="md:w-1/4 d-flex justify-content-center align-items-center">
              <img
                src={item.image}
                alt={item.itemName}
                className="w-50 h-50 rounded-circle border-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/150";
                }}
              />
            </div>
            
            {/* Product Details */}
            <div className="md:w-3/4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-blue-800">
                    {item.itemName}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    <p>
                      <span className="font-medium">HSN:</span> {item.hsn}
                    </p>
                    <p>
                      <span className="font-medium">Barcode:</span> {item.barcode}
                    </p>
                    <p>
                      <span className="font-medium">SKU:</span> {item.sku}
                    </p>
                    <p>
                      <span className="font-medium">Category:</span>{" "}
                      {item.itemCategory}
                    </p>
                    <p>
                      <span className="font-medium">Unit:</span> {item.unit}
                    </p>
                    <p>
                      <span className="font-medium">Warehouse:</span>{" "}
                      {item.warehouse}
                    </p>
                    <p>
                      <span className="font-medium">Current Stock:</span>{" "}
                      {item.quantity} {item.unit}
                    </p>
                    <p>
                      <span className="font-medium">Initial Qty:</span>{" "}
                      {item.initialQty || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Min Order Qty:</span>{" "}
                      {item.minOrderQty}
                    </p>
                    <p>
                      <span className="font-medium">As of Date:</span>{" "}
                      {item.asOfDate}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>
                      <Badge
                        bg={item.status === "In Stock" ? "success" : "danger"}
                        className="ms-2"
                      >
                        {item.status}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">Item Value</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ₹{item.value.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Sale Price: ₹{item.salePrice}/unit</p>
                  <p className="text-sm text-gray-600">Purchase Price: ₹{item.purchasePrice}/unit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Product Details Card */}
        <Card className="mb-6">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Additional Product Details</h5>
          </Card.Header>
          <Card.Body>
            <div className="row">
              <div className="col-md-6 mb-3">
                <h6>Pricing Information</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td width="40%">Initial Cost:</td>
                      <td>₹{item.initialCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Sale Price:</td>
                      <td>₹{item.salePrice.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Purchase Price:</td>
                      <td>₹{item.purchasePrice.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Discount:</td>
                      <td>{item.discount}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6 mb-3">
                <h6>Other Information</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td width="40%">Tax Account:</td>
                      <td>{item.taxAccount}</td>
                    </tr>
                    <tr>
                      <td>Remarks:</td>
                      <td>{item.remarks}</td>
                    </tr>
                    <tr>
                      <td>Description:</td>
                      <td>{item.description}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Warehouse Details Card */}
        <Card className="mb-6">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Warehouse Details</h5>
          </Card.Header>
          <Card.Body>
            {item.warehouses && item.warehouses.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Warehouse Name</th>
                      <th>Location</th>
                      <th>Stock Quantity</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.warehouses.map((warehouse, index) => (
                      <tr key={index}>
                        <td>{warehouse.name}</td>
                        <td>{warehouse.location}</td>
                        <td>{warehouse.stockQty} {item.unit}</td>
                        <td>{warehouse.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">No warehouse information available.</p>
            )}
          </Card.Body>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, fromDate: e.target.value }))
              }
              className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, toDate: e.target.value }))
              }
              className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">VCH No</label>
            <input
              type="text"
              name="vchNo"
              placeholder="e.g. DC-2025-1669"
              value={filters.vchNo}
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Voucher No (Auto)
            </label>
            <input
              type="text"
              name="vchNoAuto"
              placeholder="e.g. 12345"
              value={filters.vchNoAuto}
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">VCH Type</label>
            <select
              name="vchType"
              value={filters.vchType || ""}
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">All Types</option>
              {voucherTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Warehouse</label>
            <input
              type="text"
              name="warehouse"
              placeholder="e.g. demo warehouse"
              value={filters.warehouse}
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Opening Inventory */}
        <div className="p-3 rounded bg-gray-50 text-sm mb-4 border">
          <strong>{item.itemName}</strong> <br />
          <strong>Opening Inventory:</strong>{" "}
          <span className="font-medium">
            {inventoryData?.opening_inventory || 0} {item.unit} × ₹{item.cost} ={" "}
            ₹{((inventoryData?.opening_inventory || 0) * item.cost).toFixed(2)}
          </span>
        </div>

        {/* All Transactions */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-3">All Transactions</h4>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">DATE</th>
                  <th className="border p-2">VCH TYPE</th>
                  <th className="border p-2">PARTICULARS</th>
                  <th className="border p-2">VCH NO</th>
                  <th className="border p-2">VOUCHER NO (AUTO)</th>
                  <th className="border p-2">WAREHOUSE</th>
                  <th className="border p-2">RATE/UNIT</th>
                  <th className="border p-2">INWARDS (QTY)</th>
                  <th className="border p-2">INWARDS (VALUE)</th>
                  <th className="border p-2">OUTWARDS (QTY)</th>
                  <th className="border p-2">OUTWARDS (VALUE)</th>
                  <th className="border p-2">CLOSING QUANTITY</th>
                  <th className="border p-2">DESCRIPTION</th>
                  <th className="border p-2">NARRATION</th>
                </tr>
              </thead>
              <tbody>
                {allTransactions.length > 0 ? (
                  allTransactions.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="border p-2">{row.DATE}</td>
                      <td className="border p-2 text-nowrap">{row["VCH TYPE"]}</td>
                      <td className="border p-2">{row.PARTICULARS}</td>
                      <td className="border p-2 text-nowrap">{row["VCH NO"]}</td>
                      <td className="border p-2 text-nowrap">
                        <span className="font-medium text-blue-700">
                          {row["VOUCHER NO (AUTO)"]}
                        </span>
                      </td>
                      <td className="border p-2">{row.WAREHOUSE}</td>
                      <td className="border p-2">{row["RATE/UNIT"]}</td>
                      <td className="border p-2">{row["INWARDS (QTY)"]}</td>
                      <td className="border p-2">{row["INWARDS (VALUE)"]}</td>
                      <td className="border p-2">{row["OUTWARDS (QTY)"]}</td>
                      <td className="border p-2">{row["OUTWARDS (VALUE)"]}</td>
                      <td className="border p-2">{row["CLOSING QUANTITY"]}</td>
                      <td className="border p-2">{row.DESCRIPTION}</td>
                      <td className="border p-2 text-nowrap">{row.NARRATION}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="text-center p-4 text-gray-500">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase History */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium text-green-700">
              Purchase History
            </h4>
            <Badge bg="success" className="me-2">
              Total Purchases: ₹{totalPurchases.toFixed(2)}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-green-100">
                <tr>
                  <th className="border p-2">DATE</th>
                  <th className="border p-2">VCH TYPE</th>
                  <th className="border p-2">PARTICULARS</th>
                  <th className="border p-2">VCH NO</th>
                  <th className="border p-2">VOUCHER NO (AUTO)</th>
                  <th className="border p-2">WAREHOUSE</th>
                  <th className="border p-2">RATE/UNIT</th>
                  <th className="border p-2">QTY</th>
                  <th className="border p-2">VALUE</th>
                  <th className="border p-2">DESCRIPTION</th>
                  <th className="border p-2">NARRATION</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.length > 0 ? (
                  purchaseHistory.map((row, index) => (
                    <tr key={index} className="hover:bg-green-50">
                      <td className="border p-2">{row.DATE}</td>
                      <td className="border p-2 text-nowrap">{row["VCH TYPE"]}</td>
                      <td className="border p-2">{row.PARTICULARS}</td>
                      <td className="border p-2 text-nowrap">{row["VCH NO"]}</td>
                      <td className="border p-2 text-nowrap">
                        <span className="font-medium text-blue-700">
                          {row["VOUCHER NO (AUTO)"]}
                        </span>
                      </td>
                      <td className="border p-2">{row.WAREHOUSE}</td>
                      <td className="border p-2">{row["RATE/UNIT"]}</td>
                      <td className="border p-2">{row.QTY}</td>
                      <td className="border p-2">{row.VALUE}</td>
                      <td className="border p-2">{row.DESCRIPTION}</td>
                      <td className="border p-2 text-nowrap">{row.NARRATION}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center p-4 text-gray-500">
                      No purchase records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales History */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium text-red-700">Sales History</h4>
            <Badge bg="danger" className="me-2">
              Total Sales: ₹{totalSales.toFixed(2)}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-red-100">
                <tr>
                  <th className="border p-2">DATE</th>
                  <th className="border p-2">VCH TYPE</th>
                  <th className="border p-2">PARTICULARS</th>
                  <th className="border p-2">VCH NO</th>
                  <th className="border p-2">VOUCHER NO (AUTO)</th>
                  <th className="border p-2">WAREHOUSE</th>
                  <th className="border p-2">RATE/UNIT</th>
                  <th className="border p-2">QTY</th>
                  <th className="border p-2">VALUE</th>
                  <th className="border p-2">DESCRIPTION</th>
                  <th className="border p-2">NARRATION</th>
                </tr>
              </thead>
              <tbody>
                {salesHistory.length > 0 ? (
                  salesHistory.map((row, index) => (
                    <tr key={index} className="hover:bg-red-50">
                      <td className="border p-2">{row.DATE}</td>
                      <td className="border p-2 text-nowrap">{row["VCH TYPE"]}</td>
                      <td className="border p-2">{row.PARTICULARS}</td>
                      <td className="border p-2 text-nowrap">{row["VCH NO"]}</td>
                      <td className="border p-2 text-nowrap">
                        <span className="font-medium text-blue-700">
                          {row["VOUCHER NO (AUTO)"]}
                        </span>
                      </td>
                      <td className="border p-2">{row.WAREHOUSE}</td>
                      <td className="border p-2">{row["RATE/UNIT"]}</td>
                      <td className="border p-2">{row.QTY}</td>
                      <td className="border p-2">{row.VALUE}</td>
                      <td className="border p-2">{row.DESCRIPTION}</td>
                      <td className="border p-2 text-nowrap">{row.NARRATION}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center p-4 text-gray-500">
                      No sales records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Return History */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium text-purple-700">
              Return History
            </h4>
            <Badge bg="warning" text="dark" className="me-2">
              Total Returns: ₹{totalReturns.toFixed(2)}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-purple-100">
                <tr>
                  <th className="border p-2">DATE</th>
                  <th className="border p-2">VCH TYPE</th>
                  <th className="border p-2">PARTICULARS</th>
                  <th className="border p-2">VCH NO</th>
                  <th className="border p-2">VOUCHER NO (AUTO)</th>
                  <th className="border p-2">WAREHOUSE</th>
                  <th className="border p-2">RATE/UNIT</th>
                  <th className="border p-2">QTY</th>
                  <th className="border p-2">VALUE</th>
                  <th className="border p-2">DESCRIPTION</th>
                  <th className="border p-2">NARRATION</th>
                </tr>
              </thead>
              <tbody>
                {returnHistory.length > 0 ? (
                  returnHistory.map((row, index) => (
                    <tr key={index} className="hover:bg-purple-50">
                      <td className="border p-2">{row.DATE}</td>
                      <td className="border p-2 text-nowrap">{row["VCH TYPE"]}</td>
                      <td className="border p-2">{row.PARTICULARS}</td>
                      <td className="border p-2 text-nowrap">{row["VCH NO"]}</td>
                      <td className="border p-2 text-nowrap">
                        <span className="font-medium text-blue-700">
                          {row["VOUCHER NO (AUTO)"]}
                        </span>
                      </td>
                      <td className="border p-2">{row.WAREHOUSE}</td>
                      <td className="border p-2">{row["RATE/UNIT"]}</td>
                      <td className="border p-2">{row.QTY}</td>
                      <td className="border p-2">{row.VALUE}</td>
                      <td className="border p-2">{row.DESCRIPTION}</td>
                      <td className="border p-2 text-nowrap">{row.NARRATION}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center p-4 text-gray-500">
                      No return records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Closing Inventory */}
        <div className="mt-4 border p-3 rounded bg-gray-100 text-sm">
          <strong>Closing Inventory:</strong>{" "}
          <span className="font-medium">
            {inventoryData?.closing_inventory || 0} {item.unit} × ₹{item.cost} ={" "}
            ₹{((inventoryData?.closing_inventory || 0) * item.cost).toFixed(2)}
          </span>
        </div>

        {/* Stock Transfer History */}
        <div className="my-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium text-purple-700">
              Stock Transfer History
            </h4>
            <Badge bg="info" text="dark" className="me-2">
              Total Transfers:{" "}
              {
                allTransactions.filter((t) =>
                  t["VCH TYPE"]?.includes("Transfer")
                ).length
              }
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Voucher No</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Source</th>
                  <th className="border p-2">Destination</th>
                  <th className="border p-2">Items</th>
                  <th className="border p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {allTransactions
                  .filter((t) => t["VCH TYPE"]?.includes("Transfer"))
                  .map((row, index) => (
                    <tr key={index}>
                      <td className="border p-2 text-nowrap">{row["VCH NO"]}</td>
                      <td className="border p-2">{row.DATE}</td>
                      <td className="border p-2">{row.WAREHOUSE}</td>
                      <td className="border p-2">{row.PARTICULARS}</td>
                      <td className="border p-2 text-nowrap">{row.DESCRIPTION}</td>
                      <td className="border p-2">
                        ₹{row["OUTWARDS (VALUE)"] || row["INWARDS (VALUE)"]}
                      </td>
                    </tr>
                  ))}
                {allTransactions.filter((t) =>
                  t["VCH TYPE"]?.includes("Transfer")
                ).length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500">
                      No stock transfer records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Adjustments History */}
        <div className="my-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium text-green-700">
              Inventory Adjustments History
            </h4>
            <Badge bg="secondary" text="white" className="me-2">
              Total Adjustments:{" "}
              {
                allTransactions.filter((t) =>
                  t["VCH TYPE"]?.includes("Adjustment")
                ).length
              }
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-green-100">
                <tr>
                  <th className="border p-2 text-nowrap">Auto Voucher No</th>
                  <th className="border p-2">Manual Voucher No</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Source Warehouse</th>
                  <th className="border p-2">Items</th>
                  <th className="border p-2">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {allTransactions
                  .filter((t) => t["VCH TYPE"]?.includes("Adjustment"))
                  .map((row, index) => (
                    <tr key={index}>
                      <td className="border p-2">{row["VOUCHER NO (AUTO)"]}</td>
                      <td className="border p-2">{row["VCH NO"]}</td>
                      <td className="border p-2">{row.DATE}</td>
                      <td className="border p-2">{row["VCH TYPE"]}</td>
                      <td className="border p-2">{row.WAREHOUSE}</td>
                      <td className="border p-2 text-nowrap">{row.DESCRIPTION}</td>
                      <td className="border p-2">
                        ₹{row["INWARDS (VALUE)"] || row["OUTWARDS (VALUE)"]}
                      </td>
                    </tr>
                  ))}
                {allTransactions.filter((t) =>
                  t["VCH TYPE"]?.includes("Adjustment")
                ).length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center p-4 text-gray-500">
                      No inventory adjustment records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetails;