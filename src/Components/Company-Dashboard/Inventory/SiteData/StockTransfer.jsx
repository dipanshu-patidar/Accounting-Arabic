import React, { useEffect, useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEdit,
  faTrash,
  faPrint,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import BaseUrl from "../../../../Api/BaseUrl";
import GetCompanyId from "../../../../Api/GetCompanyId";
import axiosInstance from "../../../../Api/axiosInstance";
import { CurrencyContext } from "../../../../hooks/CurrencyContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function StockTransfer() {
  // All transfers list
  const [transfers, setTransfers] = useState([]);
  const [viewTransfer, setViewTransfer] = useState(null);
  const [editTransfer, setEditTransfer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // Form state
  const [voucherNo, setVoucherNo] = useState("");
  const [manualVoucherNo, setManualVoucherNo] = useState("");
  const [voucherDate, setVoucherDate] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [destinationWarehouseId, setDestinationWarehouseId] = useState(null);
  const [itemSearch, setItemSearch] = useState("");
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");
  const [showWarehouseList, setShowWarehouseList] = useState(false);
  const [showItemList, setShowItemList] = useState(false);
  const { convertPrice, symbol, currency } = useContext(CurrencyContext);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    destination: "",
    source: "",
    searchItem: "",
  });
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  // Dynamic data
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const companyId = GetCompanyId();

  // ✅ Fetch products by company
  const fetchProductsByCompany = async () => {
    if (!companyId) return;
    setProductsLoading(true);
    try {
      const response = await axiosInstance.get(`${BaseUrl}products/company/${companyId}`);
      const isSuccess = response.data?.success || response.data?.status;
      const productsData = Array.isArray(response.data?.data) ? response.data.data : [];
      if (isSuccess && productsData.length > 0) {
        const transformed = productsData.map(p => {
          const warehouses = Array.isArray(p.warehouses) ? p.warehouses : [];
          return {
            id: p.id || 0,
            name: (p.item_name || "").toString().trim(),
            sku: (p.sku || "").toString().trim(),
            barcode: (p.barcode || "").toString().trim(),
            hsn: (p.hsn || "").toString().trim(),
            sale_price: parseFloat(p.sale_price) || 0,
            purchase_price: parseFloat(p.purchase_price) || 0,
            total_stock: p.total_stock || 0,
            warehouses: warehouses.map(w => ({
              id: w.warehouse_id,
              name: w.warehouse_name,
              location: w.location,
              stock_qty: w.stock_qty
            })),
            description: p.description || "",
            min_order_qty: p.min_order_qty || 0,
            tax_account: p.tax_account || "",
            remarks: p.remarks || "",
            image: p.image || null,
            item_category: p.item_category?.item_category_name || "",
          };
        });
        setProducts(transformed);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // ✅ Fetch warehouses by company
  const fetchWarehousesByCompany = async () => {
    if (!companyId) return;
    setWarehousesLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}warehouses/company/${companyId}`);
      const isSuccess = response.data?.success || response.data?.status;
      const warehousesData = Array.isArray(response.data?.data) ? response.data.data : [];
      if (isSuccess && warehousesData.length > 0) {
        const filtered = warehousesData.filter(
          wh => wh.company_id != null && Number(wh.company_id) === Number(companyId)
        );
        const transformed = filtered.map(wh => ({
          id: wh.id,
          name: (wh.warehouse_name || "").trim(),
          location: wh.location || "",
        }));
        setWarehouses(transformed);
      } else {
        setWarehouses([]);
      }
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      setWarehouses([]);
    } finally {
      setWarehousesLoading(false);
    }
  };

  // ✅ Fetch stock transfers
  const fetchStockTransfers = async () => {
    if (!companyId) return;
    setDataLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}stocktransfers/company/${companyId}`);
      const isSuccess = response.data?.success || response.data?.status;
      const transfersData = Array.isArray(response.data?.data) ? response.data.data : [];
      if (isSuccess && transfersData.length > 0) {
        const transformed = transfersData.map(transfer => {
          const transferItems = Array.isArray(transfer.transfer_items) ? transfer.transfer_items : [];
          const items = transferItems.map(item => {
            // Resolve source warehouse name
            const srcWh = warehouses.find(w => w.id === item.source_warehouse_id);
            return {
              id: item.id,
              productId: item.product_id,
              itemName: item.products?.item_name || `Item ID: ${item.product_id}`,
              sourceWarehouseId: item.source_warehouse_id,
              sourceWarehouse: srcWh ? srcWh.name : `WH ID: ${item.source_warehouse_id}`,
              quantity: String(item.qty || "0"),
              rate: String(item.rate || "0"),
              amount: (parseFloat(item.qty || 0) * parseFloat(item.rate || 0)).toFixed(2),
              narration: item.narration || "",
            };
          });
          const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
          const sourceWarehouses = [...new Set(items.map(item => item.sourceWarehouse))];
          // Resolve destination warehouse name
          const destWh = warehouses.find(w => w.id === transfer.destination_warehouse_id);
          return {
            id: transfer.id,
            voucherNo: transfer.voucher_no || "",
            manualVoucherNo: transfer.manual_voucher_no || "",
            voucherDate: transfer.transfer_date
              ? new Date(transfer.transfer_date).toISOString().slice(0, 10)
              : "",
            destinationWarehouseId: transfer.destination_warehouse_id || null,
            destinationWarehouse: destWh ? destWh.name : `WH ID: ${transfer.destination_warehouse_id}`,
            sourceWarehouses: sourceWarehouses,
            items: items,
            note: transfer.notes || "",
            totalAmount: totalAmount.toFixed(2),
          };
        });
        setTransfers(transformed);
      } else {
        setTransfers([]);
      }
    } catch (err) {
      console.error("Error fetching transfers:", err);
      setError("Failed to load stock transfers");
      setTransfers([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (companyId) {
      fetchProductsByCompany();
      fetchWarehousesByCompany();
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId && warehouses.length > 0) {
      fetchStockTransfers();
    }
  }, [companyId, warehouses.length]);

  // Auto-generate voucher
  useEffect(() => {
    if (showModal && !editTransfer) {
      const prefix = "VCH";
      const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
      const random = Math.floor(100 + Math.random() * 900);
      setVoucherNo(`${prefix}-${date}-${random}`);
      setVoucherDate(new Date().toISOString().slice(0, 10));
    }
  }, [showModal, editTransfer]);

  // Edit mode: pre-fill form
  useEffect(() => {
    if (editTransfer) {
      setVoucherNo(editTransfer.voucherNo);
      setManualVoucherNo(editTransfer.manualVoucherNo);
      setVoucherDate(editTransfer.voucherDate);
      setDestinationWarehouse(editTransfer.destinationWarehouse);
      setDestinationWarehouseId(editTransfer.destinationWarehouseId);
      setItems([...editTransfer.items]);
      setNote(editTransfer.note);
      setShowModal(true);
    }
  }, [editTransfer]);

  const handleItemSelect = (product) => {
    if (!product) return;
    const newItem = {
      id: Date.now(),
      productId: product.id,
      itemName: product.name,
      sourceWarehouse: "",
      quantity: "1.00",
      rate: product.sale_price.toFixed(2),
      amount: (1 * product.sale_price).toFixed(2),
      narration: "",
    };
    setItems([...items, newItem]);
    setItemSearch("");
    setShowItemList(false);
  };

  const updateItemField = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          const qty = parseFloat(updated.quantity) || 0;
          const rate = parseFloat(updated.rate) || 0;
          updated.amount = (qty * rate).toFixed(2);
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0).toFixed(2);
  };

  const handleSubmitTransfer = async () => {
    if (!voucherNo || !voucherDate || !destinationWarehouse || items.length === 0) {
      setError("Please fill all required fields and add at least one item");
      return;
    }
    for (const item of items) {
      if (!item.sourceWarehouse || !item.quantity || !item.rate) {
        setError("Please fill all fields for each item");
        return;
      }
    }
    setLoading(true);
    setError("");
    try {
      let destWarehouseId = destinationWarehouseId;
      if (!destWarehouseId && destinationWarehouse) {
        const destWh = warehouses.find(w => w.name === destinationWarehouse);
        destWarehouseId = destWh?.id;
      }

      // ✅ FIX: Send qty and rate as STRINGS to match API
      const transferData = {
        company_id: companyId,
        voucher_no: voucherNo,
        manual_voucher_no: manualVoucherNo,
        transfer_date: voucherDate,
        destination_warehouse_id: destWarehouseId,
        notes: note,
        items: items.map(item => {
          const srcWh = warehouses.find(w => w.name === item.sourceWarehouse);
          return {
            product_id: item.productId,
            source_warehouse_id: srcWh?.id,
            qty: String(item.quantity),   // ✅ string
            rate: String(item.rate),      // ✅ string
            narration: item.narration,
          };
        }),
      };

      let response;
      if (editTransfer) {
        response = await axiosInstance.put(`stocktransfers/${editTransfer.id}`, transferData);
      } else {
        response = await axiosInstance.post(`stocktransfers`, transferData);
      }

      const isSuccess = response.data?.success || response.data?.status;
      if (isSuccess) {
        await fetchStockTransfers();
        setShowModal(false);
        resetForm();
        setEditTransfer(null);
        toast.success(editTransfer ? "Stock transfer updated successfully!" : "Stock transfer created successfully!");
      } else {
        throw new Error(response.data?.message || "Failed to save transfer");
      }
    } catch (err) {
      setError(err.message || "Failed to save stock transfer");
      toast.error("Failed to save stock transfer");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVoucherNo("");
    setManualVoucherNo("");
    setVoucherDate("");
    setDestinationWarehouse("");
    setDestinationWarehouseId(null);
    setItemSearch("");
    setItems([]);
    setNote("");
    setShowWarehouseList(false);
    setShowItemList(false);
    setError("");
  };

  const handleDeleteTransfer = async (id) => {
    if (window.confirm("Are you sure you want to delete this transfer?")) {
      try {
        await axios.delete(`${BaseUrl}stocktransfer/${id}`);
        await fetchStockTransfers();
        toast.success("Stock transfer deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete stock transfer");
      }
    }
  };

  const handleEditTransfer = (transfer) => {
    setEditTransfer(transfer);
  };

  const printTransfer = () => {
    const content = document.getElementById("print-transfer")?.innerHTML;
    if (!content) return;
    const win = window.open("", "", "width=800,height=600");
    win.document.write(`
      <html><head><title>Stock Transfer</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
      </head><body class="p-4">${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  // Filter transfers
  const filteredTransfers = transfers.filter(t => {
    const date = new Date(t.voucherDate);
    const from = filters.fromDate ? new Date(filters.fromDate) : null;
    const to = filters.toDate ? new Date(filters.toDate) : null;
    if (from && date < from) return false;
    if (to && date > new Date(to.getTime() + 86400000)) return false;
    if (filters.destination && t.destinationWarehouse &&
      !t.destinationWarehouse.toLowerCase().includes(filters.destination.toLowerCase())) return false;
    if (filters.source && t.sourceWarehouses &&
      !t.sourceWarehouses.some(w => w && w.toLowerCase().includes(filters.source.toLowerCase()))) return false;
    if (filters.searchItem && t.items &&
      !t.items.some(i => i.itemName && i.itemName.toLowerCase().includes(filters.searchItem.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Stock Transfer Records</h3>
        <button
          className="btn text-white"
          style={{ backgroundColor: "#53b2a5" }}
          onClick={() => {
            resetForm();
            setEditTransfer(null);
            setShowModal(true);
          }}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Stock Transfer
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <h5>Filter Transfers</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <input type="date" className="form-control" value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })} />
            </div>
            <div className="col-md-3">
              <input type="date" className="form-control" value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })} />
            </div>
            <div className="col-md-3">
              <input type="text" className="form-control" placeholder="Destination" value={filters.destination} onChange={e => setFilters({ ...filters, destination: e.target.value })} />
            </div>
            <div className="col-md-3">
              <input type="text" className="form-control" placeholder="Source" value={filters.source} onChange={e => setFilters({ ...filters, source: e.target.value })} />
            </div>
            <div className="col-md-6">
              <input type="text" className="form-control" placeholder="Search item..." value={filters.searchItem} onChange={e => setFilters({ ...filters, searchItem: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body">
          {dataLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : filteredTransfers.length === 0 ? (
            <p className="text-center text-muted">No transfers found</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="">
                  <tr>
                    <th>Voucher No</th>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransfers.map(t => (
                    <tr key={t.id}>
                      <td>{t.voucherNo}</td>
                      <td>{t.voucherDate}</td>
                      <td>{t.sourceWarehouses.length > 0 ? t.sourceWarehouses.join(", ") : "—"}</td>
                      <td>{t.destinationWarehouse}</td>
                      <td>{t.items.length > 0 ? t.items.length : "—"}</td>
                      <td>{symbol}{convertPrice(t.totalAmount)}</td>
                      <td className="d-flex">
                        <button className="btn btn-sm btn-success me-1" onClick={() => setViewTransfer(t)}>
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="btn btn-sm p-2 me-1"
                          style={{ backgroundColor: "#ffc107", borderColor: "#ffc107", color: "black", width: "36px", height: "36px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}
                          onClick={() => handleEditTransfer(t)}
                          title="Edit Transfer"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editTransfer ? "Edit" : "New"} Stock Transfer</h5>
                <button className="btn-close" onClick={() => {
                  setShowModal(false);
                  resetForm();
                  setEditTransfer(null);
                }}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {/* Voucher Info */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <input className="form-control" value={voucherNo} readOnly />
                    <small>System Voucher No</small>
                  </div>
                  <div className="col-md-4">
                    <input className="form-control" value={manualVoucherNo} onChange={e => setManualVoucherNo(e.target.value)} />
                    <small>Manual Voucher No</small>
                  </div>
                  <div className="col-md-4">
                    <input type="date" className="form-control" value={voucherDate} onChange={e => setVoucherDate(e.target.value)} />
                    <small>Voucher Date</small>
                  </div>
                </div>
                {/* Destination Warehouse */}
                <div className="mb-3">
                  <label>Destination Warehouse</label>
                  <input
                    type="text"
                    className="form-control"
                    value={destinationWarehouse}
                    onChange={e => {
                      setDestinationWarehouse(e.target.value);
                      setShowWarehouseList(true);
                    }}
                    onFocus={() => {
                      setShowWarehouseList(true);
                      if (warehouses.length === 0) fetchWarehousesByCompany();
                    }}
                    placeholder="Select destination warehouse"
                  />
                  {showWarehouseList && (
                    <ul className="list-group mt-1" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {warehousesLoading ? (
                        <li className="list-group-item">Loading warehouses...</li>
                      ) : warehouses.length === 0 ? (
                        <li className="list-group-item">No warehouses available</li>
                      ) : (
                        warehouses
                          .filter(w => w.name && w.name.toLowerCase().includes((destinationWarehouse || "").toLowerCase()))
                          .map(w => (
                            <li
                              key={w.id}
                              className="list-group-item list-group-item-action"
                              onClick={() => {
                                setDestinationWarehouse(w.name);
                                setDestinationWarehouseId(w.id);
                                setShowWarehouseList(false);
                              }}
                            >
                              {w.name} {w.location && `(${w.location})`}
                            </li>
                          ))
                      )}
                    </ul>
                  )}
                </div>
                {/* Select Item */}
                <div className="mb-3">
                  <label>Select Item</label>
                  <input
                    type="text"
                    className="form-control"
                    value={itemSearch}
                    onChange={e => {
                      setItemSearch(e.target.value);
                      setShowItemList(true);
                    }}
                    onFocus={() => {
                      setShowItemList(true);
                      if (products.length === 0) fetchProductsByCompany();
                    }}
                    placeholder="Search by name, SKU, or barcode"
                  />
                  {showItemList && (
                    <ul className="list-group mt-1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {productsLoading ? (
                        <li className="list-group-item">Loading items...</li>
                      ) : products.length === 0 ? (
                        <li className="list-group-item">No items available</li>
                      ) : (
                        products
                          .filter(p => {
                            const searchLower = (itemSearch || "").toLowerCase();
                            return (p.name && p.name.toLowerCase().includes(searchLower)) ||
                              (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
                              (p.barcode && p.barcode.toLowerCase().includes(searchLower));
                          })
                          .map(p => (
                            <li
                              key={p.id}
                              className="list-group-item list-group-item-action"
                              onClick={() => handleItemSelect(p)}
                            >
                              <strong>{p.name}</strong>
                              <div className="small text-muted">
                                {p.sku && `SKU: ${p.sku}`} {p.barcode && `| Barcode: ${p.barcode}`}
                                {p.total_stock !== undefined && `| Total Stock: ${p.total_stock}`}
                              </div>
                              {p.warehouses && p.warehouses.length > 0 && (
                                <div className="small text-muted">
                                  Warehouses: {p.warehouses.map(w => `${w.name}: ${w.stock_qty}`).join(", ")}
                                </div>
                              )}
                            </li>
                          ))
                      )}
                    </ul>
                  )}
                </div>
                {/* Items Table */}
                <div className="table-responsive mb-3">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Source WH</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                        <th>Narration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length > 0 ? (
                        items.map(item => {
                          const product = products.find(p => p.id === item.productId);
                          return (
                            <tr key={item.id}>
                              <td>{item.itemName}</td>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={item.sourceWarehouse}
                                  onChange={e => updateItemField(item.id, 'sourceWarehouse', e.target.value)}
                                >
                                  <option value="">-- Select --</option>
                                  {warehouses.map(w => {
                                    const warehouseStock = product?.warehouses?.find(wh => wh.id === w.id)?.stock_qty || 0;
                                    return (
                                      <option
                                        key={w.id}
                                        value={w.name}
                                        disabled={w.name === destinationWarehouse || warehouseStock <= 0}
                                      >
                                        {w.name} {w.location && `(${w.location})`} - Stock: {warehouseStock}
                                      </option>
                                    );
                                  })}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={item.quantity}
                                  onChange={e => updateItemField(item.id, 'quantity', e.target.value)}
                                  min="0"
                                  step="0.01"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={item.rate}
                                  onChange={e => updateItemField(item.id, 'rate', e.target.value)}
                                  min="0"
                                  step="0.01"
                                />
                              </td>
                              <td>{parseFloat(item.amount).toFixed(2)}</td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={item.narration}
                                  onChange={e => updateItemField(item.id, 'narration', e.target.value)}
                                />
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr><td colSpan="6" className="text-center">No items added</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Narration */}
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Narration"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <strong>Total: {symbol}{convertPrice(calculateTotalAmount())}</strong>
                  <button className="btn btn-success" onClick={handleSubmitTransfer} disabled={loading}>
                    {loading ? "Saving..." : (editTransfer ? "Update Transfer" : "Save Transfer")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewTransfer && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Transfer Details</h5>
                <button className="btn-close" onClick={() => setViewTransfer(null)}></button>
              </div>
              <div className="modal-body">
                <div id="print-transfer">
                  <div className="row">
                    <div className="col-md-4"><strong>Voucher:</strong> {viewTransfer.voucherNo}</div>
                    <div className="col-md-4"><strong>Date:</strong> {viewTransfer.voucherDate}</div>
                    <div className="col-md-4"><strong>Destination:</strong> {viewTransfer.destinationWarehouse}</div>
                  </div>
                  <div className="table-responsive mt-3">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th>Source</th>
                          <th>Qty</th>
                          <th>Rate</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewTransfer.items.length > 0 ? (
                          viewTransfer.items.map(i => (
                            <tr key={i.id}>
                              <td>{i.itemName}</td>
                              <td>{i.sourceWarehouse}</td>
                              <td>{i.quantity}</td>
                              <td>{symbol}{convertPrice(parseFloat(i.rate))}</td>
                              <td>{symbol}{convertPrice(parseFloat(i.amount))}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="5" className="text-center">No items recorded</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {viewTransfer.note && (
                    <div className="mt-3">
                      <strong>Narration:</strong> {viewTransfer.note}
                    </div>
                  )}
                  <div className="mt-3 h5">Total: {symbol}{convertPrice(parseFloat(viewTransfer.totalAmount))}</div>
                </div>
                <div className="mt-3 text-end">
                  <button className="btn btn-primary me-2" onClick={printTransfer}>
                    <FontAwesomeIcon icon={faPrint} /> Print
                  </button>
                  <button className="btn btn-secondary" onClick={() => setViewTransfer(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockTransfer;