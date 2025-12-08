import React, { useState, useEffect, useRef, useContext } from 'react';
import axiosInstance from '../../../Api/axiosInstance';
import GetCompanyId from '../../../Api/GetCompanyId';
import { CurrencyContext } from '../../../hooks/CurrencyContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function InventoryAdjustment() {
  const companyId = GetCompanyId();

  // Permission states
  const [userPermissions, setUserPermissions] = useState([]);
  const [hasViewPermission, setHasViewPermission] = useState(false);
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [hasUpdatePermission, setHasUpdatePermission] = useState(false);
  const [hasDeletePermission, setHasDeletePermission] = useState(false);

  // States
  const [allItems, setAllItems] = useState([]); 
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [viewAdjustment, setViewAdjustment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [adjustmentToDelete, setAdjustmentToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [adjustmentType, setAdjustmentType] = useState('Add Stock');
  const [rows, setRows] = useState([]);
  const [narration, setNarration] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [voucherDate, setVoucherDate] = useState('');
  const [voucherNo, setVoucherNo] = useState('');
  const [manualVoucherNo, setManualVoucherNo] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const { convertPrice, symbol, currency } = useContext(CurrencyContext);

  // Filters
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    type: '',
    sourceWarehouse: '',
    searchItem: '',
    autoVoucherNo: '',
    manualVoucherNo: ''
  });

  const itemDropdownRef = useRef(null);

  // 🔥 Refs to always have latest items & warehouses
  const allItemsRef = useRef(allItems);
  const allWarehousesRef = useRef(allWarehouses);

  // Check user permissions
  useEffect(() => {
    // Get user role and permissions
    const role = localStorage.getItem("role");

    // Superadmin and Company roles have access to all modules
    if (role === "SUPERADMIN" || role === "COMPANY") {
      setHasViewPermission(true);
      setHasCreatePermission(true);
      setHasUpdatePermission(true);
      setHasDeletePermission(true);
    } else if (role === "USER") {
      // For USER role, check specific permissions
      try {
        const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
        setUserPermissions(permissions);

        // Check if user has permissions for Inventory_Adjustment module
        const inventoryPermission = permissions.find(p => p.module_name === "Inventory_Adjustment");
        
        if (inventoryPermission) {
          setHasViewPermission(inventoryPermission.can_view);
          setHasCreatePermission(inventoryPermission.can_create);
          setHasUpdatePermission(inventoryPermission.can_update);
          setHasDeletePermission(inventoryPermission.can_delete);
        } else {
          // Default to no permissions if module not found
          setHasViewPermission(false);
          setHasCreatePermission(false);
          setHasUpdatePermission(false);
          setHasDeletePermission(false);
        }
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setHasViewPermission(false);
        setHasCreatePermission(false);
        setHasUpdatePermission(false);
        setHasDeletePermission(false);
      }
    } else {
      setHasViewPermission(false);
      setHasCreatePermission(false);
      setHasUpdatePermission(false);
      setHasDeletePermission(false);
    }
  }, []);

  useEffect(() => {
    allItemsRef.current = allItems;
  }, [allItems]);

  useEffect(() => {
    allWarehousesRef.current = allWarehouses;
  }, [allWarehouses]);

  // 🔥 FETCH ITEMS - FIXED to properly handle warehouse data
  const fetchItems = async () => {
    if (!companyId || !hasViewPermission) return;
    try {
      const response = await axiosInstance.get(`products/company/${companyId}`);
      if (Array.isArray(response.data.data)) {
        const mapped = response.data.data.map(item => ({
          id: item.id,
          name: (item.item_name?.trim() || 'Unnamed Item'),
          sku: item.sku || '',
          description: item.description || '',
          total_stock: item.total_stock || 0,
          // FIXED: Include warehouse information
          warehouses: Array.isArray(item.warehouses) ? item.warehouses.map(wh => ({
            id: wh.warehouse_id,
            name: wh.warehouse_name,
            location: wh.location,
            stock_qty: wh.stock_qty
          })) : [],
          unit: item.unit_detail?.uom_id?.toString() || 'Piece',
          item_category: item.item_category?.item_category_name || '',
          image: item.image || null
        }));
        setAllItems(mapped);
        setFilteredItems(mapped);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setAllItems([]);
      setFilteredItems([]);
    }
  };

  // 🔥 FETCH WAREHOUSES - FIXED to properly fetch warehouses for the company
  const fetchWarehouses = async () => {
    if (!companyId || !hasViewPermission) return;
    try {
      const response = await axiosInstance.get(`warehouses/company/${companyId}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        const mapped = response.data.data.map(wh => ({
          id: wh.id,
          warehouse_name: wh.warehouse_name,
          location: wh.location || ''
        }));
        setAllWarehouses(mapped);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setAllWarehouses([]);
    }
  };

  // 🔥 FETCH ADJUSTMENTS — FIXED DATE KEY
  const fetchAdjustments = async () => {
    if (!companyId || !hasViewPermission) return;
    try {
      const response = await axiosInstance.get(`inventoryadjustment/company/${companyId}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        const mapped = response.data.data.map(adj => {
          let typeLabel = 'Adjust Value';
          if (adj.adjustment_type === 'add') typeLabel = 'Add Stock';
          else if (adj.adjustment_type === 'remove') typeLabel = 'Remove Stock';

          const mappedItems = (adj.adjustment_items || []).map((item, idx) => {
            const foundItem = allItemsRef.current.find(i => i.id === item.product_id);
            const foundWh = allWarehousesRef.current.find(w => w.id === item.warehouse_id);

            return {
              id: idx + 1,
              item: item.product_id,
              itemName: foundItem?.name || 'Unknown Item',
              warehouse: item.warehouse_id,
              warehouseName: foundWh?.warehouse_name?.trim() || 'Unknown Warehouse',
              quantity: String(item.quantity || 0),
              rate: String(item.rate || 0),
              unit: foundItem?.unit || 'Piece',
              amount: parseFloat(item.quantity * item.rate) || 0,
              narration: item.narration || ''
            };
          });

          // 🔑 FIXED: Use voucher_date instead of adjustment_date
          const voucherDateStr = adj.voucher_date 
            ? new Date(adj.voucher_date).toISOString().split('T')[0] 
            : '';

          return {
            id: adj.id,
            voucherNo: adj.voucher_no,
            manualVoucherNo: adj.manual_voucher_no || '',
            voucherDate: voucherDateStr,
            adjustmentType: typeLabel,
            items: mappedItems,
            narration: adj.notes || '',
            totalAmount: parseFloat(adj.total_value) || 0, // 🔑 Use total_value from API
          };
        });

        setAdjustments(mapped);
      }
    } catch (error) {
      console.error('Error fetching adjustments:', error);
      setAdjustments([]);
    }
  };

  // Initial data load
  useEffect(() => {
    if (companyId && hasViewPermission) {
      fetchItems();
      fetchWarehouses();
    }
  }, [companyId, hasViewPermission]);

  // Re-fetch adjustments when items/warehouses change
  useEffect(() => {
    if (companyId && allItems.length > 0 && allWarehouses.length > 0 && hasViewPermission) {
      fetchAdjustments();
    }
  }, [companyId, allItems, allWarehouses, hasViewPermission]);

  // Auto-generate voucher
  useEffect(() => {
    if (showModal && !editingAdjustment) {
      const prefix = "ADJ";
      const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
      const randomNum = Math.floor(100 + Math.random() * 900);
      setVoucherNo(`${prefix}-${date}-${randomNum}`);
      setVoucherDate(new Date().toISOString().slice(0, 10));
    } else if (showModal && editingAdjustment) {
      setAdjustmentType(editingAdjustment.adjustmentType);
      setRows(editingAdjustment.items);
      setNarration(editingAdjustment.narration || '');
      setTotalAmount(editingAdjustment.totalAmount);
      setVoucherDate(editingAdjustment.voucherDate);
      setVoucherNo(editingAdjustment.voucherNo);
      setManualVoucherNo(editingAdjustment.manualVoucherNo || '');
    }
  }, [showModal, editingAdjustment]);

  // Filter items
  useEffect(() => {
    if (itemSearch === '') {
      setFilteredItems(allItems);
    } else {
      const filtered = allItems.filter(item =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(itemSearch.toLowerCase()))
      );
      setFilteredItems(filtered);
    }
  }, [itemSearch, allItems]);

  // Close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(event.target)) {
        setShowItemDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recalculate total
  useEffect(() => {
    const total = rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    setTotalAmount(total);
  }, [rows]);

  // Filter adjustments
  const filteredAdjustments = adjustments.filter(adjustment => {
    const adjDate = new Date(adjustment.voucherDate);
    const from = filters.fromDate ? new Date(filters.fromDate) : null;
    const to = filters.toDate ? new Date(filters.toDate) : null;

    if (from && adjDate < from) return false;
    if (to && adjDate > new Date(to.getTime() + 86400000)) return false;
    if (filters.type && adjustment.adjustmentType !== filters.type) return false;
    if (filters.sourceWarehouse) {
      const match = adjustment.items.some(item =>
        item.warehouseName.toLowerCase().includes(filters.sourceWarehouse.toLowerCase())
      );
      if (!match) return false;
    }
    if (filters.searchItem) {
      const search = filters.searchItem.toLowerCase();
      const match = adjustment.items.some(item => item.itemName.toLowerCase().includes(search));
      if (!match) return false;
    }
    if (filters.autoVoucherNo && !adjustment.voucherNo.toLowerCase().includes(filters.autoVoucherNo.toLowerCase())) return false;
    if (filters.manualVoucherNo && adjustment.manualVoucherNo &&
      !adjustment.manualVoucherNo.toLowerCase().includes(filters.manualVoucherNo.toLowerCase())) return false;

    return true;
  });

  // Handlers
  const handleRowNarrationChange = (id, value) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, narration: value } : row));
  };

  const handleItemSelect = (item) => {
    const newRowId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    const newRow = {
      id: newRowId,
      item: item.id,
      itemName: item.name,
      warehouse: '',
      warehouseName: '',
      quantity: '0',
      rate: '0',
      unit: item.unit,
      amount: 0,
      narration: ''
    };
    setRows([...rows, newRow]);
    setItemSearch('');
    setShowItemDropdown(false);
  };

  const handleFieldChange = (id, field, value) => {
    const updatedRows = rows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          const q = parseFloat(updatedRow.quantity) || 0;
          const r = parseFloat(updatedRow.rate) || 0;
          updatedRow.amount = q * r;
        }
        if (field === 'warehouse') {
          const wh = allWarehouses.find(w => w.id == value);
          updatedRow.warehouseName = wh?.warehouse_name?.trim() || '';
        }
        return updatedRow;
      }
      return row;
    });
    setRows(updatedRows);
  };

  const handleRemoveRow = (id) => {
    setRows(rows.filter(row => row.id !== id));
  };

  // 🔥 SUBMIT - FIXED VERSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId || !voucherNo || !voucherDate) {
      toast.error('Company ID, Voucher Number, and Voucher Date are required.');
      return;
    }

    // Check permissions
    if (editingAdjustment && !hasUpdatePermission) {
      toast.error('You do not have permission to update inventory adjustments.');
      return;
    }
    if (!editingAdjustment && !hasCreatePermission) {
      toast.error('You do not have permission to create inventory adjustments.');
      return;
    }

    setIsSubmitting(true);

    const apiAdjustmentType = adjustmentType === 'Add Stock' ? 'add'
      : adjustmentType === 'Remove Stock' ? 'remove'
        : 'adjust';

    const itemsPayload = rows.map(row => {
      const quantity = parseFloat(row.quantity);
      const rate = parseFloat(row.rate);
      
      return {
        product_id: row.item,
        warehouse_id: parseInt(row.warehouse) || null,
        quantity: isNaN(quantity) ? 0 : quantity,
        rate: isNaN(rate) ? 0 : rate,
        narration: row.narration || ''
      };
    }).filter(item => 
      item.product_id && 
      item.warehouse_id && 
      (item.quantity > 0 || item.rate > 0)
    );

    if (itemsPayload.length === 0) {
      toast.error('Please add at least one item with valid warehouse, quantity, and rate.');
      setIsSubmitting(false);
      return;
    }

    // ✅ FULLY CORRECTED PAYLOAD
    const payload = {
      company_id: companyId,
      voucher_no: voucherNo,
      manual_voucher_no: manualVoucherNo || null,
      adjustment_type: apiAdjustmentType,
      voucher_date: voucherDate,
      total_value: parseFloat(totalAmount) || 0,
      notes: narration || null,
      adjustment_items: itemsPayload
    };

    try {
      if (editingAdjustment) {
        await axiosInstance.put(`/inventoryadjustment/${editingAdjustment.id}`, payload);
        toast.success('Inventory adjustment updated successfully!');
      } else {
        await axiosInstance.post('/inventoryadjustment', payload);
        toast.success('Inventory adjustment created successfully!');
      }

      await fetchItems();
      await fetchWarehouses();
      setShowModal(false);
      setEditingAdjustment(null);
      resetForm();
    } catch (error) {
      console.error('Error saving adjustment:', error);
      toast.error('Failed to save inventory adjustment. Please check your data and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAdjustmentType('Add Stock');
    setRows([]);
    setNarration('');
    setTotalAmount(0);
    setVoucherDate('');
    setVoucherNo('');
    setManualVoucherNo('');
    setItemSearch('');
    setFilteredItems(allItems);
    setShowItemDropdown(false);
  };

  const handleEditAdjustment = (adjustment) => {
    if (!hasUpdatePermission) {
      toast.error('You do not have permission to edit inventory adjustments.');
      return;
    }
    setEditingAdjustment(adjustment);
    setShowModal(true);
  };

  const handleDeleteClick = (adjustment) => {
    if (!hasDeletePermission) {
      toast.error('You do not have permission to delete inventory adjustments.');
      return;
    }
    setAdjustmentToDelete(adjustment);
    setShowDeleteWarning(true);
  };

  const confirmDelete = async () => {
    if (!adjustmentToDelete) return;
    try {
      await axiosInstance.delete(`/inventoryadjustment/${adjustmentToDelete.id}`);
      setAdjustments(adjustments.filter(adj => adj.id !== adjustmentToDelete.id));
      toast.success('Inventory adjustment deleted successfully!');
    } catch (error) {
      console.error('Error deleting adjustment:', error);
      toast.error('Failed to delete inventory adjustment.');
    } finally {
      setShowDeleteWarning(false);
      setAdjustmentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteWarning(false);
    setAdjustmentToDelete(null);
  };

  const handlePrintAdjustment = () => window.print();
  const handlePrintModal = () => window.print();

  // If user doesn't have view permission, show access denied message
  if (!hasViewPermission) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger text-center">
          <h4>Access Denied</h4>
          <p>You don't have permission to view the Inventory Adjustment module.</p>
          <button className="btn btn-primary" onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      
      {/* Page Title */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-dark">Inventory Adjustment Records</h3>
        {hasCreatePermission && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingAdjustment(null);
              setShowModal(true);
            }}
            style={{ backgroundColor: "#53b2a5", border: "none", padding: "8px 16px" }}
          >
            + Add Inventory Adjustment
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-2">
        <div className="card-body">
          <h5>Filter Adjustments</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label>From Date</label>
              <input type="date" className="form-control" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label>To Date</label>
              <input type="date" className="form-control" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label>Adjustment Type</label>
              <select className="form-control" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                <option value="">All Types</option>
                <option value="Add Stock">Add Stock</option>
                <option value="Remove Stock">Remove Stock</option>
                <option value="Adjust Value">Adjust Value</option>
              </select>
            </div>
            <div className="col-md-3">
              <label>Source Warehouse</label>
              <input
                type="text"
                className="form-control"
                placeholder="Type warehouse name..."
                value={filters.sourceWarehouse}
                onChange={(e) => setFilters({ ...filters, sourceWarehouse: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label>Auto Voucher No</label>
              <input type="text" className="form-control" placeholder="Search by auto voucher..." value={filters.autoVoucherNo} onChange={(e) => setFilters({ ...filters, autoVoucherNo: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label>Manual Voucher No</label>
              <input type="text" className="form-control" placeholder="Search by manual voucher..." value={filters.manualVoucherNo} onChange={(e) => setFilters({ ...filters, manualVoucherNo: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label>Search Item</label>
              <input type="text" className="form-control" placeholder="Search by item name..." value={filters.searchItem} onChange={(e) => setFilters({ ...filters, searchItem: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="card">
        <div className="card-body">
          {adjustments.length === 0 ? (
            <p className="text-center text-muted">No inventory adjustments yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="thead-light">
                  <tr>
                    <th>Auto Voucher No</th>
                    <th>Manual Voucher No</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Source Warehouse</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdjustments.map(adjustment => {
                    const warehouseText = [...new Set(adjustment.items.map(i => i.warehouseName))].join(", ") || "Not specified";
                    return (
                      <tr key={adjustment.id}>
                        <td>{adjustment.voucherNo}</td>
                        <td>{adjustment.manualVoucherNo || '-'}</td>
                        <td>{adjustment.voucherDate}</td>
                        <td>{adjustment.adjustmentType}</td>
                        <td>{warehouseText}</td>
                        <td>{adjustment.items.length} item(s)</td>
                        <td>{symbol}{convertPrice(adjustment.totalAmount)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm p-2" style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5", color: "white", width: "36px", height: "36px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }} onClick={() => setViewAdjustment(adjustment)} title="View Details"><i className="fas fa-eye"></i></button>
                            {hasUpdatePermission && (
                              <button className="btn btn-sm p-2" style={{ backgroundColor: "#ffc107", borderColor: "#ffc107", color: "white", width: "36px", height: "36px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }} onClick={() => handleEditAdjustment(adjustment)} title="Edit Adjustment"><i className="fas fa-edit"></i></button>
                            )}
                            {hasDeletePermission && (
                              <button className="btn btn-sm p-2" style={{ backgroundColor: "#dc3545", borderColor: "#dc3545", color: "white", width: "36px", height: "36px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }} onClick={() => handleDeleteClick(adjustment)} title="Delete Adjustment"><i className="fas fa-trash"></i></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingAdjustment ? 'Edit Inventory Adjustment' : 'New Inventory Adjustment'}</h5>
                <div>
                  <button type="button" className="btn btn-primary me-2" onClick={handlePrintModal}><i className="fas fa-print me-1"></i> Print</button>
                  <button type="button" className="close" onClick={() => { setShowModal(false); setEditingAdjustment(null); resetForm(); }}>&times;</button>
                </div>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label>System Voucher No</label>
                      <input type="text" className="form-control" value={voucherNo} readOnly />
                    </div>
                    <div className="col-md-4">
                      <label>Manual Voucher No</label>
                      <input type="text" className="form-control" value={manualVoucherNo} onChange={(e) => setManualVoucherNo(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label>Voucher Date</label>
                      <input type="date" className="form-control" value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Adjustment Type</label>
                    <div className="d-flex flex-wrap gap-3">
                      {['Add Stock', 'Remove Stock', 'Adjust Value'].map(type => (
                        <div key={type} className="form-check">
                          <input className="form-check-input" type="radio" name="adjustmentType" id={`type-${type.replace(/\s+/g, '-')}`} checked={adjustmentType === type} onChange={() => setAdjustmentType(type)} />
                          <label className="form-check-label" htmlFor={`type-${type.replace(/\s+/g, '-')}`}>{type}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Item Selection */}
                  <div className="mb-4">
                    <label className="form-label">Select Item</label>
                    <div className="position-relative" ref={itemDropdownRef}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search for an item..."
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        onFocus={() => setShowItemDropdown(true)}
                        onClick={() => setShowItemDropdown(true)}
                      />
                      {showItemDropdown && (
                        <ul className="dropdown-menu show w-100" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {filteredItems.length > 0 ? (
                            filteredItems.map(item => (
                              <li key={item.id}>
                                <button className="dropdown-item" type="button" onClick={() => handleItemSelect(item)}>
                                  {item.name} ({item.unit}) - Total Stock: {item.total_stock}
                                </button>
                              </li>
                            ))
                          ) : (
                            <li><span className="dropdown-item-text">No items found</span></li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="table-responsive mb-4">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th>Source Warehouse</th>
                          <th>Quantity</th>
                          <th>Rate</th>
                          <th>Amount</th>
                          <th>Actions</th>
                          <th>Narration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(row => (
                          <tr key={row.id}>
                            <td><input type="text" className="form-control" value={row.itemName} readOnly /></td>
                            <td>
                              <select className="form-select" value={row.warehouse} onChange={(e) => handleFieldChange(row.id, 'warehouse', e.target.value)}>
                                <option value="">Select Warehouse</option>
                                {allWarehouses.map(wh => (
                                  <option key={wh.id} value={wh.id}>{wh.warehouse_name} ({wh.location})</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-control" 
                                value={row.quantity} 
                                onChange={(e) => handleFieldChange(row.id, 'quantity', e.target.value)} 
                                min="0" 
                                step="any"
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-control" 
                                value={row.rate} 
                                onChange={(e) => handleFieldChange(row.id, 'rate', e.target.value)} 
                                min="0" 
                                step="0.01"
                              />
                            </td>
                            <td><input type="text" className="form-control" value={row.amount.toFixed(2)} readOnly /></td>
                            <td className="text-center">
                              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveRow(row.id)} title="Remove Item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z" />
                                </svg>
                              </button>
                            </td>
                            <td>
                              <textarea className="form-control" rows="1" value={row.narration} onChange={(e) => handleRowNarrationChange(row.id, e.target.value)} placeholder="Enter narration..." />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Additional Note</label>
                        <textarea className="form-control" rows="3" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="Enter a general note..." />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex flex-column h-100 justify-content-end">
                        <div className="mb-3">
                          <label className="form-label">Total Value</label>
                          <div className="input-group">
                            <span className="input-group-text">{symbol}</span>
                            <input type="text" className="form-control" value={convertPrice(totalAmount)} readOnly />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button type="button" className="btn btn-secondary me-2" onClick={() => { setShowModal(false); setEditingAdjustment(null); resetForm(); }}>Cancel</button>
                    <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : (editingAdjustment ? 'Update Adjustment' : 'Save Adjustment')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewAdjustment && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Inventory Adjustment Details</h5>
                <div>
                  <button type="button" className="btn btn-primary me-2" onClick={handlePrintAdjustment}><i className="fas fa-print me-1"></i> Print</button>
                  <button type="button" className="close" onClick={() => setViewAdjustment(null)}>&times;</button>
                </div>
              </div>
              <div className="modal-body" id="adjustment-print-content">
                <div className="row mb-3">
                  <div className="col-md-4"><label><strong>System Voucher No</strong></label><p>{viewAdjustment.voucherNo}</p></div>
                  <div className="col-md-4"><label><strong>Manual Voucher No</strong></label><p>{viewAdjustment.manualVoucherNo || '-'}</p></div>
                  <div className="col-md-4"><label><strong>Date</strong></label><p>{viewAdjustment.voucherDate}</p></div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4"><label><strong>Adjustment Type</strong></label><p>{viewAdjustment.adjustmentType}</p></div>
                </div>
                <div className="table-responsive mb-4">
                  <table className="table table-bordered">
                    <thead className="thead-light">
                      <tr>
                        <th>Item</th>
                        <th>Source Warehouse</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Amount</th>
                        <th>Narration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewAdjustment.items.map(item => (
                        <tr key={item.id}>
                          <td><div>{item.itemName}</div><small className="text-muted">({item.unit})</small></td>
                          <td>{item.warehouseName || '-'}</td>
                          <td>{item.quantity || '-'}</td>
                          <td>{item.rate ? `${symbol}${convertPrice(parseFloat(item.rate))}` : '-'}</td>
                          <td>{item.amount ? `${symbol}${convertPrice(parseFloat(item.amount))}` : '-'}</td>
                          <td>{item.narration || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {viewAdjustment.narration && (
                  <div className="form-group mb-3">
                    <label><strong>Additional Note</strong></label>
                    <p className="border p-2 bg-light rounded">{viewAdjustment.narration}</p>
                  </div>
                )}
                <div className="d-flex justify-content-between align-items-center">
                  <h5><strong>Total Amount: {symbol}{convertPrice(viewAdjustment.totalAmount)}</strong></h5>
                  <button className="btn btn-secondary" onClick={() => setViewAdjustment(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteWarning && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="close" onClick={cancelDelete}>&times;</button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this inventory adjustment?</p>
                <p><strong>Voucher No:</strong> {adjustmentToDelete?.voucherNo}</p>
                <p><strong>Date:</strong> {adjustmentToDelete?.voucherDate}</p>
                <p><strong>Type:</strong> {adjustmentToDelete?.adjustmentType}</p>
                <p><strong>Total Amount:</strong> {symbol}{convertPrice(adjustmentToDelete?.totalAmount)}</p>
                <p className="text-danger">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryAdjustment;