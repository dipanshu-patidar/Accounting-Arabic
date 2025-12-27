import React, { useState, useEffect, useRef, useContext } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import axiosInstance from '../../../Api/axiosInstance';
import GetCompanyId from '../../../Api/GetCompanyId';
import { CurrencyContext } from '../../../hooks/CurrencyContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './InventoryAdjustment.css';

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
      <div className="p-4 inventory-adjustment-container">
        <Card className="text-center p-5 border-0 shadow-lg">
          <h3 className="text-danger">Access Denied</h3>
          <p>You don't have permission to view the Inventory Adjustment module.</p>
          <button className="btn btn-primary mt-3" onClick={() => window.history.back()}>
            Go Back
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 inventory-adjustment-container">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="inventory-adjustment-title">
          <i className="fas fa-adjust me-2"></i>
          Inventory Adjustment Management
        </h3>
        <p className="inventory-adjustment-subtitle">Manage and track all inventory adjustments across warehouses</p>
      </div>

      <Row className="g-3 mb-4 align-items-center">
        <Col xs={12} md={6}>
          {/* Search can be added here if needed */}
        </Col>
        <Col xs={12} md={6} className="d-flex justify-content-md-end justify-content-start">
          {hasCreatePermission && (
            <button
              className="btn btn-add-adjustment d-flex align-items-center"
              onClick={() => {
                setEditingAdjustment(null);
                setShowModal(true);
              }}
            >
              <i className="fas fa-plus me-2"></i> Add Inventory Adjustment
            </button>
          )}
        </Col>
      </Row>

      {/* Filters */}
      <Card className="filter-card">
        <Card.Body>
          <h5 className="mb-3 fw-bold">Filter Adjustments</h5>
          <Row className="g-3">
            <Col xs={12} sm={6} md={3}>
              <label className="form-label fw-semibold mb-2">From Date</label>
              <input type="date" className="form-control filter-input" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <label className="form-label fw-semibold mb-2">To Date</label>
              <input type="date" className="form-control filter-input" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <label className="form-label fw-semibold mb-2">Adjustment Type</label>
              <select className="form-control filter-select" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                <option value="">All Types</option>
                <option value="Add Stock">Add Stock</option>
                <option value="Remove Stock">Remove Stock</option>
                <option value="Adjust Value">Adjust Value</option>
              </select>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <label className="form-label fw-semibold mb-2">Source Warehouse</label>
              <input
                type="text"
                className="form-control filter-input"
                placeholder="Type warehouse name..."
                value={filters.sourceWarehouse}
                onChange={(e) => setFilters({ ...filters, sourceWarehouse: e.target.value })}
              />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <label className="form-label fw-semibold mb-2">Auto Voucher No</label>
              <input type="text" className="form-control filter-input" placeholder="Search by auto voucher..." value={filters.autoVoucherNo} onChange={(e) => setFilters({ ...filters, autoVoucherNo: e.target.value })} />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <label className="form-label fw-semibold mb-2">Manual Voucher No</label>
              <input type="text" className="form-control filter-input" placeholder="Search by manual voucher..." value={filters.manualVoucherNo} onChange={(e) => setFilters({ ...filters, manualVoucherNo: e.target.value })} />
            </Col>
            <Col xs={12} sm={6} md={3}>
              <label className="form-label fw-semibold mb-2">Search Item</label>
              <input type="text" className="form-control filter-input" placeholder="Search by item name..." value={filters.searchItem} onChange={(e) => setFilters({ ...filters, searchItem: e.target.value })} />
            </Col>
            <Col xs={12} sm={6} md={3} className="d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({ fromDate: "", toDate: "", type: "", sourceWarehouse: "", searchItem: "", autoVoucherNo: "", manualVoucherNo: "" })}
              >
                Clear Filters
              </button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Adjustments Table */}
      <Card className="inventory-adjustment-table-card border-0 shadow-lg">
        <Card.Body style={{ padding: 0 }}>
          {adjustments.length === 0 ? (
            <Alert variant="info" className="m-3">No inventory adjustments yet.</Alert>
          ) : (
            <div className="table-responsive">
              <table className="table inventory-adjustment-table align-middle" style={{ fontSize: 16 }}>
                <thead className="table-header">
                  <tr>
                    <th className="py-3">Auto Voucher No</th>
                    <th className="py-3">Manual Voucher No</th>
                    <th className="py-3">Date</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">Source Warehouse</th>
                    <th className="py-3">Items</th>
                    <th className="py-3">Total Amount</th>
                    <th className="py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdjustments.map(adjustment => {
                    const warehouseText = [...new Set(adjustment.items.map(i => i.warehouseName))].join(", ") || "Not specified";
                    const getTypeBadgeClass = (type) => {
                      if (type === 'Add Stock') return 'badge-type badge-add';
                      if (type === 'Remove Stock') return 'badge-type badge-remove';
                      return 'badge-type badge-adjust';
                    };
                    return (
                      <tr key={adjustment.id}>
                        <td className="fw-bold">{adjustment.voucherNo}</td>
                        <td>{adjustment.manualVoucherNo || '-'}</td>
                        <td>{adjustment.voucherDate}</td>
                        <td>
                          <span className={getTypeBadgeClass(adjustment.adjustmentType)}>
                            {adjustment.adjustmentType}
                          </span>
                        </td>
                        <td>{warehouseText}</td>
                        <td>
                          <span className="badge bg-info text-dark">{adjustment.items.length} item(s)</span>
                        </td>
                        <td className="fw-bold text-primary">{symbol}{convertPrice(adjustment.totalAmount)}</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-action btn-view"
                              onClick={() => setViewAdjustment(adjustment)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {hasUpdatePermission && (
                              <button
                                className="btn btn-sm btn-action btn-edit"
                                onClick={() => handleEditAdjustment(adjustment)}
                                title="Edit Adjustment"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                            )}
                            {hasDeletePermission && (
                              <button
                                className="btn btn-sm btn-action btn-delete"
                                onClick={() => handleDeleteClick(adjustment)}
                                title="Delete Adjustment"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
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
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block inventory-adjustment-modal" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header modal-header-custom">
                <h5 className="modal-title">{editingAdjustment ? 'Edit Inventory Adjustment' : 'New Inventory Adjustment'}</h5>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-modal-print" onClick={handlePrintModal}>
                    <i className="fas fa-print me-1"></i> Print
                  </button>
                  <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditingAdjustment(null); resetForm(); }}></button>
                </div>
              </div>
              <div className="modal-body modal-body-custom">
                <form onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <Col md={4}>
                      <label className="form-label-custom">System Voucher No</label>
                      <input type="text" className="form-control form-control-custom" value={voucherNo} readOnly />
                    </Col>
                    <Col md={4}>
                      <label className="form-label-custom">Manual Voucher No</label>
                      <input type="text" className="form-control form-control-custom" value={manualVoucherNo} onChange={(e) => setManualVoucherNo(e.target.value)} />
                    </Col>
                    <Col md={4}>
                      <label className="form-label-custom">Voucher Date</label>
                      <input type="date" className="form-control form-control-custom" value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)} />
                    </Col>
                  </Row>

                  <div className="mb-4">
                    <label className="form-label-custom mb-3">Adjustment Type</label>
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
                    <label className="form-label-custom">Select Item</label>
                    <div className="position-relative" ref={itemDropdownRef}>
                      <input
                        type="text"
                        className="form-control form-control-custom"
                        placeholder="Search for an item..."
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        onFocus={() => setShowItemDropdown(true)}
                        onClick={() => setShowItemDropdown(true)}
                      />
                      {showItemDropdown && (
                        <ul className="dropdown-menu show w-100" style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 9999 }}>
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
                    <table className="table table-bordered table-sm">
                      <thead style={{ background: "#f8f9fa" }}>
                        <tr>
                          <th className="fw-semibold">Item</th>
                          <th className="fw-semibold">Source Warehouse</th>
                          <th className="fw-semibold">Quantity</th>
                          <th className="fw-semibold">Rate</th>
                          <th className="fw-semibold">Amount</th>
                          <th className="fw-semibold">Actions</th>
                          <th className="fw-semibold">Narration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(row => (
                          <tr key={row.id}>
                            <td><input type="text" className="form-control form-control-custom" value={row.itemName} readOnly /></td>
                            <td>
                              <select className="form-select form-select-custom" value={row.warehouse} onChange={(e) => handleFieldChange(row.id, 'warehouse', e.target.value)}>
                                <option value="">Select Warehouse</option>
                                {allWarehouses.map(wh => (
                                  <option key={wh.id} value={wh.id}>{wh.warehouse_name} ({wh.location})</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-control form-control-custom" 
                                value={row.quantity} 
                                onChange={(e) => handleFieldChange(row.id, 'quantity', e.target.value)} 
                                min="0" 
                                step="any"
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-control form-control-custom" 
                                value={row.rate} 
                                onChange={(e) => handleFieldChange(row.id, 'rate', e.target.value)} 
                                min="0" 
                                step="0.01"
                              />
                            </td>
                            <td><input type="text" className="form-control form-control-custom" value={row.amount.toFixed(2)} readOnly /></td>
                            <td className="text-center">
                              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveRow(row.id)} title="Remove Item" style={{ borderRadius: "8px" }}>
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                            <td>
                              <textarea className="form-control form-control-custom" rows="1" value={row.narration} onChange={(e) => handleRowNarrationChange(row.id, e.target.value)} placeholder="Enter narration..." />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Row className="mb-4">
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label-custom">Additional Note</label>
                        <textarea className="form-control form-control-custom" rows="3" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="Enter a general note..." />
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex flex-column h-100 justify-content-end">
                        <div className="mb-3">
                          <label className="form-label-custom">Total Value</label>
                          <div className="input-group">
                            <span className="input-group-text" style={{ background: "#f8f9fa", border: "2px solid #e9ecef", borderRight: "none" }}>{symbol}</span>
                            <input type="text" className="form-control form-control-custom" value={convertPrice(totalAmount)} readOnly style={{ borderLeft: "none" }} />
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <strong className="fs-5">Total: {symbol}{convertPrice(totalAmount)}</strong>
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-modal-cancel" onClick={() => { setShowModal(false); setEditingAdjustment(null); resetForm(); }}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-modal-save" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Saving...
                          </>
                        ) : (
                          editingAdjustment ? 'Update Adjustment' : 'Save Adjustment'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewAdjustment && (
        <div className="modal show d-block inventory-adjustment-modal" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header modal-header-custom">
                <h5 className="modal-title">Inventory Adjustment Details</h5>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-modal-print" onClick={handlePrintAdjustment}>
                    <i className="fas fa-print me-1"></i> Print
                  </button>
                  <button type="button" className="btn-close" onClick={() => setViewAdjustment(null)}></button>
                </div>
              </div>
              <div className="modal-body modal-body-custom" id="adjustment-print-content">
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
                    <thead style={{ background: "#f8f9fa" }}>
                      <tr>
                        <th className="fw-semibold">Item</th>
                        <th className="fw-semibold">Source Warehouse</th>
                        <th className="fw-semibold">Quantity</th>
                        <th className="fw-semibold">Rate</th>
                        <th className="fw-semibold">Amount</th>
                        <th className="fw-semibold">Narration</th>
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
                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                  <h5 className="mb-0"><strong>Total Amount: {symbol}{convertPrice(viewAdjustment.totalAmount)}</strong></h5>
                  <button className="btn btn-modal-cancel" onClick={() => setViewAdjustment(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteWarning && (
        <div className="modal show d-block inventory-adjustment-modal" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header modal-header-custom">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={cancelDelete}></button>
              </div>
              <div className="modal-body modal-body-custom text-center py-4">
                <div className="mx-auto mb-3" style={{ width: 70, height: 70, background: "#FFF5F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fas fa-trash" style={{ fontSize: "32px", color: "#F04438" }}></i>
                </div>
                <h4 className="fw-bold mb-2">Delete Adjustment</h4>
                <p className="text-muted mb-3">Are you sure you want to delete this inventory adjustment? This action cannot be undone.</p>
                <div className="text-start bg-light p-3 rounded">
                  <p className="mb-1"><strong>Voucher No:</strong> {adjustmentToDelete?.voucherNo}</p>
                  <p className="mb-1"><strong>Date:</strong> {adjustmentToDelete?.voucherDate}</p>
                  <p className="mb-1"><strong>Type:</strong> {adjustmentToDelete?.adjustmentType}</p>
                  <p className="mb-0"><strong>Total Amount:</strong> {symbol}{convertPrice(adjustmentToDelete?.totalAmount)}</p>
                </div>
              </div>
              <div className="modal-footer modal-footer-custom">
                <button type="button" className="btn btn-modal-cancel" onClick={cancelDelete}>Cancel</button>
                <button type="button" className="btn btn-modal-delete" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryAdjustment;