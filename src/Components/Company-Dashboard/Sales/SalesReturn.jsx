import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Table, Button, Badge, Form, Row, Col, InputGroup, Modal, Spinner, Alert, Card } from 'react-bootstrap';
import { FaEye, FaDownload, FaTrash, FaUpload, FaFile, FaCalendarAlt, FaSearch, FaEdit, FaPlus, FaFilter, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../Api/axiosInstance';
import GetCompanyId from '../../../Api/GetCompanyId';
import "./SalesReturn.css";

const SalesReturn = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const companyId = GetCompanyId();
  const [addItemError, setAddItemError] = useState('');

  // Permission states
  const [userPermissions, setUserPermissions] = useState([]);
  const [salesReturnPermissions, setSalesReturnPermissions] = useState({
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
      setSalesReturnPermissions({
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

        // Check if user has permissions for Sales_Return module
        const salesReturnPermission = permissions.find(p => p.module_name === "Sales_Return");
        if (salesReturnPermission) {
          setSalesReturnPermissions({
            can_create: salesReturnPermission.can_create,
            can_view: salesReturnPermission.can_view,
            can_update: salesReturnPermission.can_update,
            can_delete: salesReturnPermission.can_delete
          });
        }
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setSalesReturnPermissions({
          can_create: false,
          can_view: false,
          can_update: false,
          can_delete: false
        });
      }
    } else {
      setSalesReturnPermissions({
        can_create: false,
        can_view: false,
        can_update: false,
        can_delete: false
      });
    }
  }, []);

  // Dropdown data
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Unified dropdown state
  const [openDropdown, setOpenDropdown] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [returnTypeFilter, setReturnTypeFilter] = useState('All');
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [voucherNo, setVoucherNo] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const navigate = useNavigate();
  const fileInputRef = useRef();
  const isCleaningUpRef = useRef(false); // Prevent multiple cleanup calls
  const modalKeyRef = useRef({ view: 0, edit: 0, add: 0 }); // Force modal remount

  // Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editReturn, setEditReturn] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReturn, setNewReturn] = useState({
    returnNo: '',
    invoiceNo: '',
    customerId: null,
    customerName: '',
    date: '',
    items: 0,
    status: 'pending',
    amount: 0,
    returnType: 'Sales Return',
    reason: '',
    warehouseId: null,
    warehouseName: '',
    referenceId: '',
    voucherNo: '',
    narration: '',
    itemsList: []
  });

  // ========= FETCH DATA =========
  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get(`/vendorCustomer/company/${companyId}`, { params: { type: 'customer' } });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await axiosInstance.get(`/warehouses/company/${companyId}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setWarehouses(data);
    } catch (err) {
      console.error('Failed to load warehouses', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get(`/products/company/${companyId}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const fetchReturns = async () => {
    if (!salesReturnPermissions.can_view) return;
    
    try {
      const response = await axiosInstance.get(`/sales-return/get-returns`, {
        params: { company_id: companyId }
      });
      const data = response.data;

      // Updated mapping based on new API response structure
      const mapped = (data.data || []).map(r => ({
        id: r.sr_no, // Using sr_no as id since it's unique in response
        returnNo: r.return_no,
        invoiceNo: r.invoice_no,
        customer_id: r.customer_id,
        warehouse_id: r.warehouse_id,
        date: r.return_date ? r.return_date.split('T')[0] : '',
        items: r.items || 0,
        status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : 'Pending',
        amount: parseFloat(r.amount) || 0,
        returnType: r.return_type || 'Sales Return',
        reason: r.reason || '',
        referenceId: r.reference_id || '',
        voucherNo: r.manual_voucher_no || '',
        autoVoucherNo: r.auto_voucher_no || '',
        narration: '', // Not present in API response
        itemsList: [] // Not present in API response, would need separate API call
      }));
      setReturns(mapped);
    } catch (err) {
      console.error('Error fetching returns:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load sales returns');
    }
  };

  // Fetch return details for view/edit
  const fetchReturnDetails = async (returnId) => {
    try {
      // This would be your endpoint to get detailed return information including items
      const response = await axiosInstance.get(`/sales-return/get-particular/${returnId}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching return details:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!salesReturnPermissions.can_view) {
        setLoading(false);
        setDataLoaded(true);
        return;
      }
      
      try {
        await Promise.all([
          fetchCustomers(),
          fetchWarehouses(),
          fetchProducts()
        ]);
        await fetchReturns();
      } catch (err) {
        setError('Failed to initialize page data');
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    };
    loadData();
  }, [salesReturnPermissions.can_view, companyId]);

  // ========= Helper Functions =========
  const getCustomerName = (customerId) => {
    const cust = customers.find(c => c.id === customerId);
    return cust ? (cust.name_english || cust.name || `Customer ${customerId}`) : 'Unknown Customer';
  };

  const getWarehouseName = (warehouseId) => {
    const wh = warehouses.find(w => w.id === warehouseId);
    return wh ? (wh.warehouse_name || wh.name || `Warehouse ${warehouseId}`) : 'Unknown Warehouse';
  };

  const getAvailableStock = (productId, warehouseId) => {
    const product = products.find(p => p.id === productId);
    if (!product || !warehouseId) return 0;
    const whEntry = product.warehouses?.find(w => w.warehouse_id === warehouseId);
    return whEntry ? parseInt(whEntry.stock_qty) || 0 : 0;
  };

  const validateItemsAgainstWarehouseStock = (itemsList, warehouseId) => {
    if (!warehouseId) return 'Please select a warehouse.';
    for (const item of itemsList) {
      if (!item.productId) continue;
      const availableQty = getAvailableStock(item.productId, warehouseId);
      if (item.qty > availableQty) {
        return `Cannot return ${item.qty} units of "${item.productName}". Only ${availableQty} available in selected warehouse.`;
      }
    }
    return null;
  };

  const getFilteredProducts = (warehouseId) => {
    if (!warehouseId) return products;
    return products.filter(p =>
      p.warehouses?.some(w => w.warehouse_id === warehouseId)
    );
  };

  // ========= Filter Logic =========
  const uniqueCustomers = useMemo(() => {
    return customers.map(c => c.name_english || c.name || `Customer ${c.id}`).filter(Boolean);
  }, [customers]);

  const uniqueReturnTypes = [...new Set(returns.map(r => r.returnType))];

  const filteredReturns = useMemo(() => {
    return returns.filter(item => {
      const custName = getCustomerName(item.customer_id);
      const whName = getWarehouseName(item.warehouse_id);
      const matchesSearch = [
        item.returnNo,
        item.invoiceNo,
        custName,
        item.reason,
        whName,
        item.narration,
        item.referenceId,
        item.voucherNo
      ].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesType = returnTypeFilter === 'All' || item.returnType === returnTypeFilter;
      const matchesWarehouse = warehouseFilter === 'All' || whName === warehouseFilter;
      const matchesCustomer = !customerFilter || custName === customerFilter;
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const returnDate = new Date(item.date);
        if (dateFrom) matchesDate = returnDate >= new Date(dateFrom);
        if (dateTo && matchesDate) matchesDate = returnDate <= new Date(dateTo);
      }
      let matchesAmount = true;
      if (amountMin) matchesAmount = item.amount >= parseFloat(amountMin);
      if (amountMax && matchesAmount) matchesAmount = item.amount <= parseFloat(amountMax);
      const matchesVoucher = !voucherNo || item.voucherNo?.toLowerCase().includes(voucherNo.toLowerCase());

      return matchesSearch && matchesStatus && matchesType && matchesWarehouse && matchesCustomer && matchesDate && matchesAmount && matchesVoucher;
    });
  }, [returns, searchTerm, statusFilter, returnTypeFilter, warehouseFilter, customerFilter, dateFrom, dateTo, amountMin, amountMax, voucherNo, customers, warehouses]);

  // ========= Handlers =========
  const handleDelete = async (id) => {
    if (!salesReturnPermissions.can_delete) {
      alert("You don't have permission to delete sales returns.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this sales return?")) return;
    try {
      await axiosInstance.delete(`/sales-return/delete-sale/${id}`);
      setReturns(prev => prev.filter(r => r.id !== id));
      alert("Sales return deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete sales return.");
    }
  };

  const handleExportAll = () => {
    if (!salesReturnPermissions.can_view) {
      alert("You don't have permission to export sales returns.");
      return;
    }
    
    let csvContent = "text/csv;charset=utf-8,\uFEFF";
    csvContent += "Reference ID,Return No,Invoice No,Customer,Date,Items,Amount,Status,Return Type,Reason,Warehouse,Narration,Auto Voucher No,Manual Voucher No\n";
    returns.forEach(r => {
      csvContent += `"${r.referenceId}","${r.returnNo}","${r.invoiceNo}","${getCustomerName(r.customer_id)}","${r.date}",${r.items},${r.amount},"${r.status}","${r.returnType}","${r.reason}","${getWarehouseName(r.warehouse_id)}","${r.narration}","${r.autoVoucherNo}","${r.voucherNo}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "All-Sales-Returns.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setReturnTypeFilter('All');
    setWarehouseFilter('All');
    setCustomerFilter('');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
    setVoucherNo('');
  };

  // Modal close handlers
  const handleCloseViewModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowViewModal(false);
    modalKeyRef.current.view += 1;
  };

  const handleCloseEditModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowEditModal(false);
    modalKeyRef.current.edit += 1;
  };

  const handleCloseAddModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowAddModal(false);
    modalKeyRef.current.add += 1;
  };

  // Modal exited handlers
  const handleViewModalExited = () => {
    setSelectedReturn(null);
    isCleaningUpRef.current = false;
  };

  const handleEditModalExited = () => {
    setEditReturn(null);
    setAddItemError('');
    setOpenDropdown(null);
    isCleaningUpRef.current = false;
  };

  const handleAddModalExited = () => {
    setNewReturn({
      returnNo: '',
      invoiceNo: '',
      customerId: null,
      customerName: '',
      date: new Date().toISOString().split('T')[0],
      items: 0,
      status: 'pending',
      amount: 0,
      returnType: 'Sales Return',
      reason: '',
      warehouseId: null,
      warehouseName: '',
      referenceId: '',
      voucherNo: '',
      narration: '',
      itemsList: []
    });
    setVoucherNo('');
    setAddItemError('');
    setOpenDropdown(null);
    isCleaningUpRef.current = false;
  };

  const handleAddClick = () => {
    if (!salesReturnPermissions.can_create) {
      alert("You don't have permission to create sales returns.");
      return;
    }
    
    isCleaningUpRef.current = false;
    modalKeyRef.current.add += 1;
    setAddItemError('');
    setNewReturn({
      returnNo: '',
      invoiceNo: '',
      customerId: null,
      customerName: '',
      date: new Date().toISOString().split('T')[0],
      items: 0,
      status: 'pending',
      amount: 0,
      returnType: 'Sales Return',
      reason: '',
      warehouseId: null,
      warehouseName: '',
      referenceId: '',
      voucherNo: '',
      narration: '',
      itemsList: []
    });
    setOpenDropdown(null);
    setShowAddModal(true);
  };

  const handleAddItem = () => {
    setAddItemError('');
    setNewReturn(prev => ({
      ...prev,
      itemsList: [...prev.itemsList, { productId: null, productName: '', qty: 1, price: 0, total: 0, narration: '' }]
    }));
  };

  const handleItemChange = (index, field, value, form = 'new') => {
    setAddItemError('');
    const setter = form === 'new' ? setNewReturn : setEditReturn;
    setter(prev => {
      const updated = [...prev.itemsList];
      const item = updated[index];
      if (field === 'qty') {
        const qty = parseInt(value) || 0;
        item.qty = qty;
        item.total = qty * item.price;
      } else if (field === 'price') {
        const price = parseFloat(value) || 0;
        item.price = price;
        item.total = item.qty * price;
      } else if (field === 'productName') {
        item.productId = value.id;
        item.productName = value.item_name || value.name;
        // Auto-set price if product has a price
        if (value.sale_price) {
          item.price = parseFloat(value.sale_price);
          item.total = item.qty * item.price;
        }
      } else if (field === 'narration') {
        item.narration = value;
      }
      updated[index] = item;
      const totalItems = updated.reduce((sum, i) => sum + i.qty, 0);
      const totalAmount = updated.reduce((sum, i) => sum + i.total, 0);
      return { ...prev, itemsList: updated, items: totalItems, amount: totalAmount };
    });
  };

  const handleRemoveItem = (index, form = 'new') => {
    setAddItemError('');
    const setter = form === 'new' ? setNewReturn : setEditReturn;
    setter(prev => {
      const updated = prev.itemsList.filter((_, i) => i !== index);
      const totalItems = updated.reduce((sum, i) => sum + i.qty, 0);
      const totalAmount = updated.reduce((sum, i) => sum + i.total, 0);
      return { ...prev, itemsList: updated, items: totalItems, amount: totalAmount };
    });
  };

  const handleAddReturn = async () => {
    if (!salesReturnPermissions.can_create) {
      setAddItemError("You don't have permission to create sales returns.");
      return;
    }
    
    const { returnNo, invoiceNo, customerId, date, itemsList, warehouseId } = newReturn;
    if (!returnNo || !invoiceNo || !customerId || !date || itemsList.length === 0 || !warehouseId) {
      setAddItemError("Please fill all required fields (*) and add at least one item.");
      return;
    }

    // Validate that all items have products selected
    const invalidItems = itemsList.filter(item => !item.productId);
    if (invalidItems.length > 0) {
      setAddItemError("Please select a product for all items.");
      return;
    }

    const validationError = validateItemsAgainstWarehouseStock(itemsList, warehouseId);
    if (validationError) {
      setAddItemError(validationError);
      return;
    }

    const payload = {
      company_id: companyId,
      reference_id: newReturn.referenceId || null,
      manual_voucher_no: newReturn.voucherNo || null,
      customer_id: customerId,
      return_no: returnNo,
      invoice_no: invoiceNo,
      return_date: date,
      return_type: newReturn.returnType,
      warehouse_id: warehouseId,
      reason_for_return: newReturn.reason || '',
      notes: newReturn.narration,
      status: newReturn.status,
      sales_return_items: itemsList.map(item => ({
        product_id: item.productId,
        item_name: item.productName,
        quantity: item.qty.toString(),
        rate: item.price.toString(),
        tax_percent: "18",
        discount: "0",
        amount: item.total.toString(),
        narration: item.narration
      }))
    };

    try {
      const response = await axiosInstance.post('/sales-return/create-sales-return', payload);
      if (response.data.success) {
        alert("Sales return created successfully!");
        handleCloseAddModal();
        await Promise.all([fetchProducts(), fetchReturns()]);
      } else {
        setAddItemError(response.data.message || "Failed to create sales return.");
      }
    } catch (err) {
      console.error(err);
      setAddItemError(err.response?.data?.message || "Network error. Please try again.");
    }
  };

  const handleEditClick = async (returnItem) => {
    if (!salesReturnPermissions.can_update) {
      alert("You don't have permission to edit sales returns.");
      return;
    }
    
    try {
      isCleaningUpRef.current = false;
      modalKeyRef.current.edit += 1;
      setAddItemError('');
      setOpenDropdown(null);

      // Fetch detailed return data including items
      const detailedReturn = await fetchReturnDetails(returnItem.id);

      if (detailedReturn) {
        setEditReturn({
          ...returnItem,
          itemsList: detailedReturn.itemsList || [],
          customerName: getCustomerName(returnItem.customer_id),
          warehouseName: getWarehouseName(returnItem.warehouse_id)
        });
      } else {
        // Fallback to basic data if detailed fetch fails
        setEditReturn({
          ...returnItem,
          itemsList: [],
          customerName: getCustomerName(returnItem.customer_id),
          warehouseName: getWarehouseName(returnItem.warehouse_id)
        });
      }
      setShowEditModal(true);
    } catch (err) {
      console.error('Error preparing edit:', err);
      setAddItemError('Failed to load return details for editing.');
    }
  };

  const handleEditSave = async () => {
    if (!salesReturnPermissions.can_update) {
      setAddItemError("You don't have permission to update sales returns.");
      return;
    }
    
    if (!editReturn) return;

    const { returnNo, invoiceNo, customerId, date, itemsList, warehouseId } = editReturn;
    if (!returnNo || !invoiceNo || !customerId || !date || itemsList.length === 0 || !warehouseId) {
      setAddItemError("Please fill all required fields (*) and ensure at least one item is added.");
      return;
    }

    // Validate that all items have products selected
    const invalidItems = itemsList.filter(item => !item.productId);
    if (invalidItems.length > 0) {
      setAddItemError("Please select a product for all items.");
      return;
    }

    const validationError = validateItemsAgainstWarehouseStock(itemsList, warehouseId);
    if (validationError) {
      setAddItemError(validationError);
      return;
    }

    const payload = {
      company_id: companyId,
      reference_id: editReturn.referenceId,
      manual_voucher_no: editReturn.voucherNo || null,
      customer_id: editReturn.customerId,
      return_no: editReturn.returnNo,
      invoice_no: editReturn.invoiceNo,
      return_date: editReturn.date,
      return_type: editReturn.returnType,
      warehouse_id: editReturn.warehouseId,
      reason_for_return: editReturn.reason || '',
      notes: editReturn.narration,
      status: editReturn.status.toLowerCase(),
      sales_return_items: editReturn.itemsList.map(item => ({
        product_id: item.productId,
        item_name: item.productName,
        quantity: item.qty.toString(),
        rate: item.price.toString(),
        tax_percent: "18",
        discount: "0",
        amount: item.total.toString(),
        narration: item.narration
      }))
    };

    try {
      const response = await axiosInstance.put(`/sales-return/update-sale/${editReturn.id}`, payload);
      if (response.data.success) {
        alert("Sales return updated successfully!");
        handleCloseEditModal();
        await Promise.all([fetchProducts(), fetchReturns()]);
      } else {
        setAddItemError(response.data.message || "Failed to update sales return.");
      }
    } catch (err) {
      console.error(err);
      setAddItemError(err.response?.data?.message || "Network error. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const normalized = status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || '';
    let badgeClass = 'status-badge';
    
    if (normalized === 'Processed') {
      badgeClass = 'status-badge-processed';
    } else if (normalized === 'Pending') {
      badgeClass = 'status-badge-pending';
    } else if (normalized === 'Approved') {
      badgeClass = 'status-badge-approved';
    } else if (normalized === 'Rejected') {
      badgeClass = 'status-badge-rejected';
    }
    
    return (
      <Badge className={badgeClass}>
        {normalized}
      </Badge>
    );
  };

  const getReturnTypeBadge = (returnType) => {
    if (returnType === 'Sales Return') return <Badge bg="primary">Sales Return</Badge>;
    if (returnType === 'Credit Note') return <Badge bg="secondary">Credit Note</Badge>;
    return <Badge className=''>{returnType}</Badge>;
  };

  // ====== DROPDOWN RENDERER ======
  const renderDropdown = ({ items, onSelect, searchValue, onSearchChange, displayField = "name_english", idField = "id", openKey }) => {
    if (openDropdown !== openKey) return null;
    const filteredItems = items.filter(item =>
      (item[displayField] || '').toLowerCase().includes((searchValue || '').toLowerCase())
    );
    return (
      <div
        className="position-absolute w-100 bg-white border rounded shadow"
        style={{
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000,
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '2px'
        }}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item[idField]}
              className="p-2 hover:bg-light"
              style={{ cursor: 'pointer' }}
              onMouseDown={() => {
                onSelect(item);
                setOpenDropdown(null);
              }}
            >
              {item[displayField]}
            </div>
          ))
        ) : (
          <div className="p-2 text-muted">No results</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading sales returns...</span>
      </div>
    );
  }
  
  if (!salesReturnPermissions.can_view) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <Alert variant="danger" className="m-4">
          <h3>Access Denied</h3>
          <p>You don't have permission to view the Sales Return module.</p>
        </Alert>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        {error}
      </Alert>
    );
  }
  if (!dataLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading customer and warehouse data...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sales-return-container">
      {/* Header */}
      <div className="mb-4">
        <h3 className="sales-return-title">
          <i className="fas fa-undo me-2"></i>
          Sales Return Management
        </h3>
        <p className="sales-return-subtitle">Manage your sales returns and customer returns</p>
      </div>

      {/* Search and Actions */}
      <Row className="g-3 mb-4 align-items-center">
        <Col xs={12} md={6}>
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <Form.Control
              className="search-input"
              placeholder="Search by return number, invoice number, customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
        <Col xs={12} md={6} className="d-flex justify-content-md-end justify-content-start gap-2">
          {salesReturnPermissions.can_view && (
            <Button
              className="d-flex align-items-center"
              variant="outline-primary"
              onClick={handleExportAll}
            >
              <FaFile className="me-2" /> Export
            </Button>
          )}
          {salesReturnPermissions.can_create && (
            <>
              <Button
                className="d-flex align-items-center"
                variant="outline-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaUpload className="me-2" /> Import
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                style={{ display: 'none' }}
              />
              <Button
                className="d-flex align-items-center btn-add-return"
                onClick={handleAddClick}
              >
                <FaPlus className="me-2" />
                Add Return
              </Button>
            </>
          )}
        </Col>
      </Row>

      {/* Filter Toggle */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button
          variant="outline-secondary"
          size="sm"
          className="btn-toggle-filters"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter className="me-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="mb-4 filter-card border-0 shadow-lg">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 fw-bold filter-title">
                <FaFilter className="me-2" />
                Filter Sales Returns
              </h5>
              <Button variant="outline-secondary" size="sm" className="btn-clear-filters" onClick={clearFilters}>
                <FaTimes className="me-1" /> Clear All
              </Button>
            </div>
            <Row className="g-3">
              <Col md={3}>
                <Form.Label className="filter-label">Customer</Form.Label>
                <Form.Select 
                  className="filter-select"
                  value={customerFilter} 
                  onChange={(e) => setCustomerFilter(e.target.value)}
                >
                  <option value="">All Customers</option>
                  {uniqueCustomers.map((customer, idx) => (
                    <option key={idx} value={customer}>{customer}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="filter-label">Status</Form.Label>
                <Form.Select 
                  className="filter-select"
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Processed">Processed</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="filter-label">Return Type</Form.Label>
                <Form.Select 
                  className="filter-select"
                  value={returnTypeFilter} 
                  onChange={(e) => setReturnTypeFilter(e.target.value)}
                >
                  <option value="All">All Types</option>
                  {uniqueReturnTypes.map((type, idx) => (
                    <option key={idx} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="filter-label">Warehouse</Form.Label>
                <Form.Select 
                  className="filter-select"
                  value={warehouseFilter} 
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                >
                  <option value="All">All Warehouses</option>
                  {warehouses.map((w, idx) => (
                    <option key={w.id || idx} value={w.warehouse_name || w.name}>
                      {w.warehouse_name || w.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="filter-label">Date From</Form.Label>
                <Form.Control
                  className="filter-date"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Label className="filter-label">Date To</Form.Label>
                <Form.Control
                  className="filter-date"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Label className="filter-label">Min Amount</Form.Label>
                <Form.Control
                  className="filter-input"
                  type="number"
                  placeholder="Min Amount"
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Label className="filter-label">Max Amount</Form.Label>
                <Form.Control
                  className="filter-input"
                  type="number"
                  placeholder="Max Amount"
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Label className="filter-label">Voucher No</Form.Label>
                <Form.Control
                  className="filter-input"
                  type="text"
                  placeholder="Voucher No"
                  value={voucherNo}
                  onChange={(e) => setVoucherNo(e.target.value)}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-primary">
            <div className="card-body">
              <h6 className="card-title">Total Returns</h6>
              <h4 className="text-primary">{returns.length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-success">
            <div className="card-body">
              <h6 className="card-title">Processed</h6>
              <h4 className="text-success">{returns.filter(r => r.status === 'Processed').length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-warning">
            <div className="card-body">
              <h6 className="card-title">Pending</h6>
              <h4 className="text-warning">{returns.filter(r => r.status === 'Pending').length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-danger">
            <div className="card-body">
              <h6 className="card-title">Total Value</h6>
              <h4 className="text-danger">₹ {returns.reduce((sum, r) => sum + r.amount, 0).toLocaleString('en-IN')}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="sales-return-table-card border-0 shadow-lg">
        <Card.Body style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <Table responsive className="sales-return-table align-middle" style={{ fontSize: 16 }}>
              <thead className="table-header">
            <tr>
              <th className="text-center">#</th>
              <th>Return No</th>
              <th>Reference ID</th>
              <th>Manual Voucher No</th>
              <th>Auto Voucher No</th>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Warehouse</th>
              <th>Date</th>
              <th className="text-center">Items</th>
              <th>Amount (₹)</th>
              <th>Return Type</th>
              <th>Reason</th>
              <th>Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.length > 0 ? (
              filteredReturns.map((item, idx) => (
                <tr key={item.id}>
                  <td className="text-center">{idx + 1}</td>
                  <td><strong>{item.returnNo}</strong></td>
                  <td>{item.referenceId}</td>
                  <td>{item.voucherNo || "-"}</td>
                  <td>{item.autoVoucherNo || "-"}</td>
                  <td>{item.invoiceNo}</td>
                  <td>{getCustomerName(item.customer_id)}</td>
                  <td>{getWarehouseName(item.warehouse_id)}</td>
                  <td>{item.date}</td>
                  <td className="text-center">{item.items}</td>
                  <td className="fw-bold text-danger">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </td>
                  <td>{getReturnTypeBadge(item.returnType)}</td>
                  <td className="small">{item.reason}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      {salesReturnPermissions.can_view && (
                        <Button 
                          variant="outline-info" 
                          size="sm" 
                          className="btn-action btn-view"
                          onClick={() => {
                            isCleaningUpRef.current = false;
                            modalKeyRef.current.view += 1;
                            setSelectedReturn(item);
                            setShowViewModal(true);
                          }}
                        >
                          <FaEye size={14} />
                        </Button>
                      )}
                      {salesReturnPermissions.can_update && (
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="btn-action btn-edit"
                          onClick={() => handleEditClick(item)}
                        >
                          <FaEdit size={14} />
                        </Button>
                      )}
                      {salesReturnPermissions.can_delete && (
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(item.id)}
                        >
                          <FaTrash size={14} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15" className="text-center py-4">
                  No sales returns found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
          </div>
        </Card.Body>
      </Card>

      {/* View Modal */}
      <Modal 
        key={modalKeyRef.current.view}
        show={showViewModal} 
        onHide={handleCloseViewModal} 
        onExited={handleViewModalExited}
        size="lg"
        className="sales-return-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Sales Return Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReturn && (
            <div>
              <table className="table table-bordered">
                <tbody>
                  <tr><td className="fw-bold">Reference ID</td><td>{selectedReturn.referenceId}</td></tr>
                  <tr><td className="fw-bold">Manual Voucher No</td><td>{selectedReturn.voucherNo || '-'}</td></tr>
                  <tr><td className="fw-bold">Auto Voucher No</td><td>{selectedReturn.autoVoucherNo || '-'}</td></tr>
                  <tr><td className="fw-bold">Return No</td><td>{selectedReturn.returnNo}</td></tr>
                  <tr><td className="fw-bold">Invoice No</td><td>{selectedReturn.invoiceNo}</td></tr>
                  <tr><td className="fw-bold">Customer</td><td>{getCustomerName(selectedReturn.customer_id)}</td></tr>
                  <tr><td className="fw-bold">Warehouse</td><td>{getWarehouseName(selectedReturn.warehouse_id)}</td></tr>
                  <tr><td className="fw-bold">Date</td><td>{selectedReturn.date}</td></tr>
                  <tr><td className="fw-bold">Items</td><td>{selectedReturn.items}</td></tr>
                  <tr><td className="fw-bold">Amount</td><td>₹{selectedReturn.amount.toLocaleString('en-IN')}</td></tr>
                  <tr><td className="fw-bold">Return Type</td><td>{selectedReturn.returnType}</td></tr>
                  <tr><td className="fw-bold">Reason</td><td>{selectedReturn.reason}</td></tr>
                  <tr><td className="fw-bold">Status</td><td>{getStatusBadge(selectedReturn.status)}</td></tr>
                </tbody>
              </table>
              {selectedReturn.itemsList && selectedReturn.itemsList.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-bold">Returned Items</h6>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Narration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReturn.itemsList.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.productName}</td>
                          <td>{item.qty}</td>
                          <td>₹{item.price.toLocaleString()}</td>
                          <td>₹{item.total.toLocaleString()}</td>
                          <td>{item.narration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button variant="secondary" onClick={handleCloseViewModal} className="btn-modal-cancel">Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        key={modalKeyRef.current.edit}
        show={showEditModal} 
        onHide={handleCloseEditModal}
        onExited={handleEditModalExited}
        size="lg"
        className="sales-return-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Edit Sales Return</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editReturn && (
            <Form>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Reference ID</Form.Label>
                    <Form.Control type="text" value={editReturn.referenceId} readOnly />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Manual Voucher No</Form.Label>
                    <Form.Control
                      type="text"
                      value={editReturn.voucherNo}
                      onChange={(e) => setEditReturn(prev => ({ ...prev, voucherNo: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Return No *</Form.Label>
                    <Form.Control
                      type="text"
                      value={editReturn.returnNo}
                      onChange={(e) => setEditReturn(prev => ({ ...prev, returnNo: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Invoice No *</Form.Label>
                    <Form.Control
                      type="text"
                      value={editReturn.invoiceNo}
                      onChange={(e) => setEditReturn(prev => ({ ...prev, invoiceNo: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
              </Row>
              {/* Customer Dropdown */}
              <Form.Group className="mb-3">
                <Form.Label>Customer *</Form.Label>
                <div style={{ position: 'relative' }}>
                  <Form.Control
                    type="text"
                    value={editReturn.customerName}
                    placeholder="Search customer..."
                    onChange={(e) => setEditReturn(prev => ({ ...prev, customerName: e.target.value }))}
                    onFocus={() => setOpenDropdown('customer-edit')}
                  />
                  {renderDropdown({
                    items: customers,
                    onSelect: (cust) => setEditReturn(prev => ({
                      ...prev,
                      customerId: cust.id,
                      customerName: cust.name_english
                    })),
                    searchValue: editReturn.customerName,
                    onSearchChange: (val) => setEditReturn(prev => ({ ...prev, customerName: val })),
                    displayField: 'name_english',
                    openKey: 'customer-edit'
                  })}
                </div>
              </Form.Group>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date *</Form.Label>
                    <Form.Control
                      type="date"
                      value={editReturn.date}
                      onChange={(e) => setEditReturn(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Return Type</Form.Label>
                    <Form.Select
                      value={editReturn.returnType}
                      onChange={(e) => setEditReturn(prev => ({ ...prev, returnType: e.target.value }))}
                    >
                      <option value="Sales Return">Sales Return</option>
                      <option value="Credit Note">Credit Note</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              {/* Warehouse Dropdown */}
              <Form.Group className="mb-3">
                <Form.Label>Warehouse *</Form.Label>
                <div style={{ position: 'relative' }}>
                  <Form.Control
                    type="text"
                    value={editReturn.warehouseName}
                    placeholder="Search warehouse..."
                    onChange={(e) => setEditReturn(prev => ({ ...prev, warehouseName: e.target.value }))}
                    onFocus={() => setOpenDropdown('warehouse-edit')}
                  />
                  {renderDropdown({
                    items: warehouses,
                    onSelect: (wh) => setEditReturn(prev => ({
                      ...prev,
                      warehouseId: wh.id,
                      warehouseName: wh.warehouse_name
                    })),
                    searchValue: editReturn.warehouseName,
                    onSearchChange: (val) => setEditReturn(prev => ({ ...prev, warehouseName: val })),
                    displayField: 'warehouse_name',
                    openKey: 'warehouse-edit'
                  })}
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Reason</Form.Label>
                <Form.Control
                  type="text"
                  value={editReturn.reason}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, reason: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Narration</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={editReturn.narration}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, narration: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={editReturn.status}
                  onChange={(e) => setEditReturn(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Processed">Processed</option>
                  <option value="Rejected">Rejected</option>
                </Form.Select>
              </Form.Group>
              <div className="mt-3">
                <h6>Returned Items ({editReturn.itemsList.length})</h6>
                {editReturn.itemsList.map((item, index) => {
                  const filteredProds = getFilteredProducts(editReturn.warehouseId);
                  const key = `edit-product-${index}`;
                  return (
                    <Row key={index} className="mb-2 align-items-end">
                      <Col md={4}>
                        <div style={{ position: 'relative' }}>
                          <Form.Control
                            type="text"
                            value={item.productName}
                            placeholder="Search product..."
                            onChange={(e) => {
                              const updated = [...editReturn.itemsList];
                              updated[index] = { ...updated[index], productName: e.target.value, productId: null };
                              setEditReturn(prev => ({ ...prev, itemsList: updated }));
                            }}
                            onFocus={() => setOpenDropdown(key)}
                          />
                          {renderDropdown({
                            items: filteredProds,
                            onSelect: (prod) => {
                              const updated = [...editReturn.itemsList];
                              updated[index] = {
                                ...updated[index],
                                productId: prod.id,
                                productName: prod.item_name || prod.name
                              };
                              setEditReturn(prev => ({ ...prev, itemsList: updated }));
                            },
                            searchValue: item.productName,
                            onSearchChange: (val) => {
                              const updated = [...editReturn.itemsList];
                              updated[index] = { ...updated[index], productName: val };
                              setEditReturn(prev => ({ ...prev, itemsList: updated }));
                            },
                            displayField: 'item_name',
                            openKey: key
                          })}
                        </div>
                      </Col>
                      <Col md={2}>
                        <Form.Control
                          type="number"
                          placeholder="Qty"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, 'qty', e.target.value, 'edit')}
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Control
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value, 'edit')}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control
                          placeholder="Narration"
                          value={item.narration}
                          onChange={(e) => handleItemChange(index, 'narration', e.target.value, 'edit')}
                        />
                      </Col>
                      <Col md={1}>
                        <Button variant="danger" size="sm" onClick={() => handleRemoveItem(index, 'edit')}>
                          <FaTrash />
                        </Button>
                      </Col>
                    </Row>
                  );
                })}
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setEditReturn(prev => ({
                      ...prev,
                      itemsList: [...prev.itemsList, { productId: null, productName: '', qty: 1, price: 0, total: 0, narration: '' }]
                    }));
                  }}
                >
                  + Add Item
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
        {addItemError && (
          <Alert variant="danger" className="mt-3 mb-0 mx-3">
            {addItemError}
          </Alert>
        )}
        <Modal.Footer className="modal-footer-custom">
          <Button variant="secondary" onClick={handleCloseEditModal} className="btn-modal-cancel">Cancel</Button>
          {salesReturnPermissions.can_update && (
            <Button variant="primary" onClick={handleEditSave} className="btn-modal-save">Save Changes</Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Add Modal */}
      <Modal 
        key={modalKeyRef.current.add}
        show={showAddModal} 
        onHide={handleCloseAddModal}
        onExited={handleAddModalExited}
        size="lg"
        className="sales-return-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Add New Sales Return</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Reference ID (Auto)</Form.Label>
              <Form.Control type="text" value={newReturn.referenceId} readOnly placeholder="Assigned after save" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Manual Voucher No</Form.Label>
              <Form.Control
                type="text"
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                placeholder="Optional"
              />
            </Form.Group>
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Customer *</Form.Label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type="text"
                      value={newReturn.customerName}
                      placeholder="Search customer..."
                      onChange={(e) => setNewReturn(prev => ({ ...prev, customerName: e.target.value }))}
                      onFocus={() => setOpenDropdown('customer')}
                    />
                    {renderDropdown({
                      items: customers,
                      onSelect: (cust) => setNewReturn(prev => ({ ...prev, customerId: cust.id, customerName: cust.name_english })),
                      searchValue: newReturn.customerName,
                      onSearchChange: (val) => setNewReturn(prev => ({ ...prev, customerName: val })),
                      displayField: 'name_english',
                      openKey: 'customer'
                    })}
                  </div>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Return No *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newReturn.returnNo}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, returnNo: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Invoice No *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newReturn.invoiceNo}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, invoiceNo: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={newReturn.date}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Return Type</Form.Label>
                  <Form.Select
                    value={newReturn.returnType}
                    onChange={(e) => setNewReturn(prev => ({ ...prev, returnType: e.target.value }))}
                  >
                    <option value="Sales Return">Sales Return</option>
                    <option value="Credit Note">Credit Note</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Warehouse *</Form.Label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type="text"
                      value={newReturn.warehouseName}
                      placeholder="Search warehouse..."
                      onChange={(e) => setNewReturn(prev => ({ ...prev, warehouseName: e.target.value }))}
                      onFocus={() => setOpenDropdown('warehouse')}
                    />
                    {renderDropdown({
                      items: warehouses,
                      onSelect: (wh) => setNewReturn(prev => ({ ...prev, warehouseId: wh.id, warehouseName: wh.warehouse_name })),
                      searchValue: newReturn.warehouseName,
                      onSearchChange: (val) => setNewReturn(prev => ({ ...prev, warehouseName: val })),
                      displayField: 'warehouse_name',
                      openKey: 'warehouse'
                    })}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <div className="mb-4">
              <h6 className="fw-bold">Returned Items</h6>
              {newReturn.itemsList.map((item, index) => {
                const filteredProds = getFilteredProducts(newReturn.warehouseId);
                const key = `product-${index}`;
                return (
                  <Row key={index} className="mb-2 align-items-end">
                    <Col md={4}>
                      <div style={{ position: 'relative' }}>
                        <Form.Control
                          type="text"
                          value={item.productName}
                          placeholder="Search product..."
                          onChange={(e) => {
                            const updated = [...newReturn.itemsList];
                            updated[index] = { ...updated[index], productName: e.target.value, productId: null };
                            setNewReturn(prev => ({ ...prev, itemsList: updated }));
                          }}
                          onFocus={() => setOpenDropdown(key)}
                        />
                        {renderDropdown({
                          items: filteredProds,
                          onSelect: (prod) => {
                            const updated = [...newReturn.itemsList];
                            updated[index] = {
                              ...updated[index],
                              productId: prod.id,
                              productName: prod.item_name
                            };
                            setNewReturn(prev => ({ ...prev, itemsList: updated }));
                          },
                          searchValue: item.productName,
                          onSearchChange: (val) => {
                            const updated = [...newReturn.itemsList];
                            updated[index] = { ...updated[index], productName: val };
                            setNewReturn(prev => ({ ...prev, itemsList: updated }));
                          },
                          displayField: 'item_name',
                          openKey: key
                        })}
                      </div>
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="number"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="number"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Control
                        placeholder="Narration"
                        value={item.narration}
                        onChange={(e) => handleItemChange(index, 'narration', e.target.value)}
                      />
                    </Col>
                    <Col md={1}>
                      <Button variant="danger" size="sm" onClick={() => handleRemoveItem(index)}>
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                );
              })}
              <Button
                variant="outline-primary"
                size="sm"
                className="mt-2"
                onClick={handleAddItem}
              >
                + Add Item
              </Button>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Reason for Return</Form.Label>
              <Form.Control
                type="text"
                value={newReturn.reason}
                onChange={(e) => setNewReturn(prev => ({ ...prev, reason: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Narration</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newReturn.narration}
                onChange={(e) => setNewReturn(prev => ({ ...prev, narration: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        {addItemError && (
          <Alert variant="danger" className="mt-3 mb-0">
            {addItemError}
          </Alert>
        )}
        <Modal.Footer className="modal-footer-custom">
          <Button variant="secondary" onClick={handleCloseAddModal} className="btn-modal-cancel">Cancel</Button>
          {salesReturnPermissions.can_create && (
            <Button variant="primary" onClick={handleAddReturn} className="btn-modal-save">
              Add Return
            </Button>
          )}
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default SalesReturn;