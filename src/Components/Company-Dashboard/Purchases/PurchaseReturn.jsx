// import React, { useState, useEffect } from 'react';
// import {
//   Modal,
//   Button,
//   Form,
//   Table,
//   Badge,
//   Row,
//   Col,
//   Card,
//   Spinner,
//   InputGroup
// } from 'react-bootstrap';
// import {
//   FaEye, FaEdit, FaTrash, FaSearch
// } from "react-icons/fa";
// import { BiPlus } from 'react-icons/bi';
// import axiosInstance from "../../../Api/axiosInstance";
// import GetCompanyId from "../../../Api/GetCompanyId";

// const STATUS_OPTIONS = ['pending', 'approved', 'rejected'];

// const formatStatus = (status) => status?.charAt(0).toUpperCase() + status?.slice(1) || '—';
// const getStatusVariant = (status) => {
//   switch (status?.toLowerCase()) {
//     case 'approved': return 'success';
//     case 'pending': return 'warning';
//     case 'rejected': return 'danger';
//     default: return 'secondary';
//   }
// };

// const PurchaseReturn = () => {
//   const companyId = GetCompanyId();
//   const [returns, setReturns] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [deleteId, setDeleteId] = useState(null);
//   const [selectedReturn, setSelectedReturn] = useState(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [statusFilter, setStatusFilter] = useState('All');
//   const [warehouseFilter, setWarehouseFilter] = useState('All');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [vendors, setVendors] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
//   const [products, setProducts] = useState([]);

//   // Dropdown visibility (only one open at a time)
//   const [showVendorDropdown, setShowVendorDropdown] = useState(false);
//   const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);
//   const [showProductDropdown, setShowProductDropdown] = useState(false);
//   const [vendorSearch, setVendorSearch] = useState('');
//   const [warehouseSearch, setWarehouseSearch] = useState('');
//   const [productSearch, setProductSearch] = useState('');

//   const closeAllDropdowns = () => {
//     setShowVendorDropdown(false);
//     setShowWarehouseDropdown(false);
//     setShowProductDropdown(false);
//   };

//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [itemQty, setItemQty] = useState(1);
//   const [itemRate, setItemRate] = useState(0);
//   const [itemTaxPercent, setItemTaxPercent] = useState(18);
//   const [itemDiscount, setItemDiscount] = useState(0);

//   const initialFormData = {
//     vendor_id: '',
//     vendor_name: '',
//     return_no: '',
//     invoice_no: '',
//     return_date: '',
//     warehouse_id: '',
//     warehouse_name: '',
//     return_type: 'Purchase Return',
//     reason_for_return: '',
//     manual_voucher_no: '',
//     status: 'pending',
//     notes: '',
//     bank_name: '',
//     account_no: '',
//     account_holder: '',
//     ifsc_code: '',
//     items: [],
//     sub_total: 0,
//     tax_total: 0,
//     discount_total: 0,
//     grand_total: 0,
//     id: null
//   };

//   const [formData, setFormData] = useState(initialFormData);

//   const fetchReturns = async () => {
//     if (!companyId) return [];
//     try {
//       const res = await axiosInstance.get(`/get-returns`);
//       const data = res.data?.data;
//       if (Array.isArray(data)) {
//         return data;
//       } else if (data && typeof data === 'object') {
//         return [data];
//       } else {
//         return [];
//       }
//     } catch (err) {
//       console.error('Failed to load returns', err);
//       setError("Failed to load purchase returns.");
//       return [];
//     }
//   };

//   const fetchVendors = async () => {
//     if (!companyId) return [];
//     try {
//       const res = await axiosInstance.get(`/vendorCustomer/company/${companyId}`, { params: { type: 'vender' } });
//       return Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
//     } catch (err) {
//       console.error('Failed to load vendors', err);
//       return [];
//     }
//   };

//   const fetchWarehouses = async () => {
//     if (!companyId) return [];
//     try {
//       const res = await axiosInstance.get(`/warehouses/company/${companyId}`);
//       return Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
//     } catch (err) {
//       console.error('Failed to load warehouses', err);
//       return [];
//     }
//   };

//   const fetchProducts = async () => {
//     if (!companyId) return [];
//     try {
//       const res = await axiosInstance.get(`/products/company/${companyId}`);
//       return Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
//     } catch (err) {
//       console.error('Failed to load products', err);
//       return [];
//     }
//   };

//   const fetchData = async () => {
//     if (!companyId) {
//       setError('Company ID is missing');
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const [returnsData, vendorsData, warehousesData, productsData] = await Promise.all([
//         fetchReturns(),
//         fetchVendors(),
//         fetchWarehouses(),
//         fetchProducts()
//       ]);
//       setReturns(returnsData);
//       setVendors(vendorsData);
//       setWarehouses(warehousesData);
//       setProducts(productsData);
//     } catch (err) {
//       console.error("Unexpected error during fetch", err);
//       setError("An unexpected error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [companyId]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleAddItem = () => {
//     if (!selectedProduct || itemQty <= 0 || itemRate <= 0) {
//       alert("Please select a valid product, quantity, and rate.");
//       return;
//     }
//     const taxAmount = (itemRate * itemQty * itemTaxPercent) / 100;
//     const itemTotal = itemRate * itemQty + taxAmount - itemDiscount;
//     const newItem = {
//       product_id: selectedProduct.id,
//       item_name: selectedProduct.item_name,
//       quantity: itemQty,
//       qty: itemQty,
//       rate: itemRate,
//       price: itemRate,
//       tax_percent: itemTaxPercent,
//       tax: itemTaxPercent,
//       discount: itemDiscount,
//       amount: parseFloat(itemTotal.toFixed(2)),
//     };
//     const newItems = [...formData.items, newItem];
//     const sub_total = newItems.reduce((sum, i) => sum + i.rate * i.quantity, 0);
//     const tax_total = newItems.reduce((sum, i) => sum + (i.rate * i.quantity * i.tax_percent) / 100, 0);
//     const discount_total = newItems.reduce((sum, i) => sum + i.discount, 0);
//     const grand_total = sub_total + tax_total - discount_total;
//     setFormData((prev) => ({
//       ...prev,
//       items: newItems,
//       sub_total: parseFloat(sub_total.toFixed(2)),
//       tax_total: parseFloat(tax_total.toFixed(2)),
//       discount_total: parseFloat(discount_total.toFixed(2)),
//       grand_total: parseFloat(grand_total.toFixed(2)),
//     }));
//     setSelectedProduct(null);
//     setItemQty(1);
//     setItemRate(0);
//     setItemTaxPercent(18);
//     setItemDiscount(0);
//     closeAllDropdowns();
//   };

//   const handleRemoveItem = (index) => {
//     const newItems = formData.items.filter((_, i) => i !== index);
//     const sub_total = newItems.reduce((sum, i) => sum + i.rate * i.quantity, 0);
//     const tax_total = newItems.reduce((sum, i) => sum + (i.rate * i.quantity * i.tax_percent) / 100, 0);
//     const discount_total = newItems.reduce((sum, i) => sum + i.discount, 0);
//     const grand_total = sub_total + tax_total - discount_total;
//     setFormData((prev) => ({
//       ...prev,
//       items: newItems,
//       sub_total: parseFloat(sub_total.toFixed(2)),
//       tax_total: parseFloat(tax_total.toFixed(2)),
//       discount_total: parseFloat(discount_total.toFixed(2)),
//       grand_total: parseFloat(grand_total.toFixed(2)),
//     }));
//   };

//   const handleSubmit = async () => {
//     const required = formData.vendor_id && formData.invoice_no && formData.return_date && formData.warehouse_id;
//     if (!required) {
//       alert("Please fill all required fields.");
//       return;
//     }
//     const safeRefId = `REF-PR-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
//     const purchaseReturnItems = formData.items.map(item => ({
//       product_id: item.product_id,
//       item_name: item.item_name,
//       quantity: item.quantity,
//       rate: item.rate,
//       tax_percent: item.tax_percent,
//       discount: item.discount,
//       amount: item.amount,
//     }));
//     const payload = {
//       company_id: companyId,
//       vendor_id: parseInt(formData.vendor_id, 10),
//       vendor_name: formData.vendor_name,
//       return_no: formData.return_no,
//       invoice_no: formData.invoice_no,
//       return_date: formData.return_date,
//       warehouse_id: parseInt(formData.warehouse_id, 10),
//       return_type: formData.return_type,
//       reason_for_return: formData.reason_for_return,
//       manual_voucher_no: formData.manual_voucher_no,
//       reference_id: safeRefId,
//       status: formData.status,
//       notes: formData.notes,
//       bank_name: formData.bank_name,
//       account_no: formData.account_no,
//       account_holder: formData.account_holder,
//       ifsc_code: formData.ifsc_code,
//       sub_total: formData.sub_total,
//       tax_total: formData.tax_total,
//       discount_total: formData.discount_total,
//       grand_total: formData.grand_total,
//       purchase_return_items: purchaseReturnItems,
//     };
//     try {
//       if (isEditMode) {
//         await axiosInstance.put(`/update-purchase/${formData.id}`, payload);
//         alert("Purchase return updated successfully.");
//       } else {
//         await axiosInstance.post('/create-purchase-return', payload);
//         alert("Purchase return created successfully.");
//       }
//       fetchData();
//       setShowModal(false);
//       setFormData(initialFormData);
//       setIsEditMode(false);
//       closeAllDropdowns();
//     } catch (err) {
//       console.error("Submit error", err);
//       const message = err.response?.data?.message || "An error occurred. Please try again.";
//       alert(message);
//     }
//   };

//   const filteredReturns = (Array.isArray(returns) ? returns : []).filter((item) => {
//     const matchesSearch =
//       searchTerm === '' ||
//       (item.vendor_name && item.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (item.return_no && item.return_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (item.invoice_no && item.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()));
//     const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
//     const matchesWarehouse = warehouseFilter === 'All' || String(item.warehouse_id) === String(warehouseFilter);
//     return matchesSearch && matchesStatus && matchesWarehouse;
//   });

//   const getVendorName = (id) => {
//     const v = vendors.find(v => String(v.id) === String(id));
//     return v ? v.name_english : '—';
//   };

//   const getWarehouseName = (id) => {
//     const w = warehouses.find(w => String(w.id) === String(id));
//     return w ? w.warehouse_name : '—';
//   };

//   const handleViewClick = (item) => {
//     setSelectedReturn(item);
//     setShowViewModal(true);
//   };

//   const handleEditClick = (item) => {
//     const normalizedItems = (item.purchase_return_items || []).map(i => ({
//       id: i.id,
//       purchase_return_id: i.purchase_return_id,
//       product_id: i.product_id,
//       item_name: i.item_name,
//       quantity: parseInt(i.quantity, 10) || 0,
//       qty: parseInt(i.quantity, 10) || 0,
//       rate: parseFloat(i.rate) || 0,
//       price: parseFloat(i.rate) || 0,
//       tax_percent: parseFloat(i.tax_percent) || 0,
//       tax: parseFloat(i.tax_percent) || 0,
//       discount: parseFloat(i.discount) || 0,
//       amount: parseFloat(i.amount) || 0,
//     }));
//     setFormData({
//       id: item.id,
//       vendor_id: String(item.vendor_id) || '',
//       vendor_name: item.vendor_name || '',
//       return_no: item.return_no || '',
//       invoice_no: item.invoice_no || '',
//       return_date: item.return_date ? item.return_date.split('T')[0] : '',
//       warehouse_id: String(item.warehouse_id) || '',
//       warehouse_name: getWarehouseName(item.warehouse_id),
//       return_type: item.return_type || 'Purchase Return',
//       reason_for_return: item.reason_for_return || '',
//       manual_voucher_no: item.manual_voucher_no || '',
//       status: item.status || 'pending',
//       notes: item.notes || '',
//       bank_name: item.bank_name || '',
//       account_no: item.account_no || '',
//       account_holder: item.account_holder || '',
//       ifsc_code: item.ifsc_code || '',
//       items: normalizedItems,
//       sub_total: parseFloat(item.sub_total) || 0,
//       tax_total: parseFloat(item.tax_total) || 0,
//       discount_total: parseFloat(item.discount_total) || 0,
//       grand_total: parseFloat(item.grand_total) || 0,
//     });
//     setIsEditMode(true);
//     setShowModal(true);
//   };

//   const handleDeleteClick = (id) => {
//     setDeleteId(id);
//     setShowDeleteModal(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (!deleteId) return;
//     try {
//       await axiosInstance.delete(`/delete-purchase/${deleteId}`);
//       alert("Purchase return deleted successfully.");
//       fetchData();
//       setShowDeleteModal(false);
//     } catch (err) {
//       console.error("Delete error", err);
//       alert(err.response?.data?.message || "Failed to delete. Please try again.");
//     }
//   };

//   // 🔍 Filtered lists used only inside dropdowns
//   const filteredVendors = vendors.filter(vendor =>
//     vendor.name_english.toLowerCase().includes(vendorSearch.toLowerCase())
//   );

//   const filteredWarehouses = warehouses.filter(warehouse => {
//     if (!warehouse) return false;
//     const name = warehouse.warehouse_name || '';
//     return name.toLowerCase().includes(warehouseSearch.toLowerCase());
//   });

//   const filteredProducts = products.filter(product => {
//     if (!product) return false;
//     const name = product.item_name || '';
//     return name.toLowerCase().includes(productSearch.toLowerCase());
//   });

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center vh-50">
//         <Spinner animation="border" variant="primary" />
//         <span className="ms-2">Loading purchase returns...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="p-3">
//       <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
//         <h2 className="mb-0 fw-bold text-dark">Purchase Returns</h2>
//         <div className="d-flex gap-2 flex-wrap">
//           <Button variant="success" size="sm" className="rounded-pill px-2 py-0 text-nowrap" disabled>
//             <i className="fas fa-file-import me-1" /> Import
//           </Button>
//           <Button variant="warning" size="sm" className="rounded-pill px-2 py-0 text-nowrap" disabled>
//             <i className="fas fa-file-export me-1" /> Export
//           </Button>
//           <Button variant="info" size="sm" className="rounded-pill px-2 py-0 text-nowrap" disabled>
//             <i className="fas fa-download me-1" /> Download
//           </Button>
//           <Button
//             variant="primary"
//             size="sm"
//             className="rounded-pill py-0 text-nowrap"
//             onClick={() => {
//               const now = new Date();
//               const year = now.getFullYear();
//               const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
//               const returnNo = `PR-${year}-${String(returns.length + 1).padStart(4, '0')}${uniqueSuffix}`;
//               setFormData({ ...initialFormData, return_no: returnNo });
//               setIsEditMode(false);
//               setShowModal(true);
//             }}
//           >
//             <BiPlus size={14} className="me-1" /> New Return
//           </Button>
//         </div>
//       </div>
//       <Row className="mb-4 g-3">
//         <Col lg={4} md={6}>
//           <div className="input-group">
//             <span className="input-group-text bg-light"><FaSearch /></span>
//             <Form.Control
//               type="text"
//               placeholder="Search returns..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </Col>
//         <Col lg={2} md={6}>
//           <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//             <option value="All">Status: All</option>
//             {STATUS_OPTIONS.map((s) => (
//               <option key={s} value={s}>
//                 {formatStatus(s)}
//               </option>
//             ))}
//           </Form.Select>
//         </Col>
//         <Col lg={2} md={6}>
//           <Form.Select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
//             <option value="All">Warehouse: All</option>
//             {warehouses.map((wh) => (
//               <option key={wh.id} value={wh.id}>
//                 {wh.warehouse_name}
//               </option>
//             ))}
//           </Form.Select>
//         </Col>
//         <Col lg={2} md={6}>
//           <Form.Select disabled>
//             <option value="All">Date: All</option>
//             <option value="Today">Today</option>
//             <option value="This Week">This Week</option>
//             <option value="This Month">This Month</option>
//           </Form.Select>
//         </Col>
//       </Row>
//       <Card className="border-0 rounded-3 overflow-hidden">
//         <div className="table-responsive">
//           <Table hover className="mb-0 text-center align-middle">
//             <thead className="bg-light text-dark">
//               <tr>
//                 <th>REF ID</th>
//                 <th>RETURN #</th>
//                 <th>INVOICE #</th>
//                 <th>VENDOR</th>
//                 <th>WAREHOUSE</th>
//                 <th>DATE</th>
//                 <th>AMOUNT</th>
//                 <th>STATUS</th>
//                 <th>ACTION</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredReturns.length === 0 ? (
//                 <tr>
//                   <td colSpan="9" className="text-muted py-4">No purchase returns found.</td>
//                 </tr>
//               ) : (
//                 filteredReturns.map((item) => (
//                   <tr key={item.id}>
//                     <td className="text-primary fw-medium">{item.reference_id}</td>
//                     <td className="text-primary fw-medium">{item.return_no}</td>
//                     <td className="text-muted">{item.invoice_no}</td>
//                     <td>{getVendorName(item.vendor_id)}</td>
//                     <td>{getWarehouseName(item.warehouse_id)}</td>
//                     <td className="text-muted">
//                       {item.return_date ? item.return_date.split('T')[0] : ''}
//                     </td>
//                     <td className="fw-bold">₹{Number(item.grand_total).toLocaleString()}</td>
//                     <td>
//                       <Badge bg={getStatusVariant(item.status)}>{formatStatus(item.status)}</Badge>
//                     </td>
//                     <td>
//                       <div className="d-flex gap-2 justify-content-center">
//                         <Button size="sm" variant="outline-info" onClick={() => handleViewClick(item)}>
//                           <FaEye />
//                         </Button>
//                         <Button size="sm" variant="outline-warning" onClick={() => handleEditClick(item)}>
//                           <FaEdit />
//                         </Button>
//                         <Button size="sm" variant="outline-danger" onClick={() => handleDeleteClick(item.id)}>
//                           <FaTrash />
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </Table>
//         </div>
//         <div className="d-flex justify-content-between align-items-center p-3 bg-white">
//           <small className="text-muted">Showing {filteredReturns.length} of {returns.length} entries</small>
//           <div className="btn-group btn-group-sm">
//             <button className="btn btn-outline-secondary disabled">&laquo;</button>
//             <button className="btn btn-primary">1</button>
//             <button className="btn btn-outline-secondary">&raquo;</button>
//           </div>
//         </div>
//       </Card>

//       {/* Add/Edit Modal */}
//       <Modal show={showModal} onHide={() => { setShowModal(false); closeAllDropdowns(); }} size="lg" centered>
//         <Modal.Header closeButton>
//           <Modal.Title>{isEditMode ? 'Edit Purchase Return' : 'Add New Purchase Return'}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Return No</Form.Label>
//                   <Form.Control type="text" value={formData.return_no} readOnly className="bg-light" />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Vendor *</Form.Label>
//                   <div style={{ position: "relative" }}>
//                     <input
//                       type="text"
//                       value={vendorSearch}
//                       placeholder="Select or type vendor..."
//                       onChange={(e) => {
//                         setVendorSearch(e.target.value);
//                         setFormData(prev => ({ ...prev, vendor_name: e.target.value, vendor_id: '' }));
//                       }}
//                       onFocus={() => {
//                         setVendorSearch(formData.vendor_name || '');
//                         setShowVendorDropdown(true);
//                       }}
//                       onBlur={() => setTimeout(() => setShowVendorDropdown(false), 150)}
//                       className="form-control"
//                     />
//                     {showVendorDropdown && (
//                       <div
//                         style={{
//                           position: "absolute",
//                           top: "100%",
//                           left: 0,
//                           right: 0,
//                           zIndex: 1000,
//                           backgroundColor: "white",
//                           border: "1px solid #ccc",
//                           borderRadius: "5px",
//                           maxHeight: "150px",
//                           overflowY: "auto",
//                           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//                         }}
//                       >
//                         {filteredVendors.length === 0 ? (
//                           <div style={{ padding: "8px 10px", color: "#666" }}>No vendors found</div>
//                         ) : (
//                           filteredVendors.map((vendor) => (
//                             <div
//                               key={vendor.id}
//                               onMouseDown={() => {
//                                 setFormData(prev => ({
//                                   ...prev,
//                                   vendor_id: vendor.id,
//                                   vendor_name: vendor.name_english,
//                                 }));
//                                 setVendorSearch(vendor.name_english);
//                                 setShowVendorDropdown(false);
//                               }}
//                               style={{
//                                 padding: "8px 10px",
//                                 cursor: "pointer",
//                                 borderBottom: "1px solid #f1f1f1",
//                               }}
//                               onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
//                               onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
//                             >
//                               {vendor.name_english}
//                             </div>
//                           ))
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Invoice *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="invoice_no"
//                     value={formData.invoice_no}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={4}>
//                 <Form.Group>
//                   <Form.Label>Date *</Form.Label>
//                   <Form.Control
//                     type="date"
//                     name="return_date"
//                     value={formData.return_date}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
// <Col md={4}>
//   <Form.Group>
//     <Form.Label>Warehouse *</Form.Label>
//     <div style={{ position: "relative" }}>
//       <input
//         type="text"
//         value={warehouseSearch}
//         placeholder="Select or type warehouse..."
//         onChange={(e) => {
//           setWarehouseSearch(e.target.value);
//           setFormData(prev => ({ ...prev, warehouse_name: e.target.value, warehouse_id: '' }));
//         }}
//         onFocus={() => {
//           setWarehouseSearch(formData.warehouse_name || '');
//           setShowWarehouseDropdown(true);
//         }}
//         onBlur={() => setTimeout(() => setShowWarehouseDropdown(false), 150)}
//         className="form-control"
//       />
//       {showWarehouseDropdown && (
//         <div
//           style={{
//             position: "absolute",
//             top: "100%",
//             left: 0,
//             right: 0,
//             zIndex: 1000,
//             backgroundColor: "white",
//             border: "1px solid #ccc",
//             borderRadius: "5px",
//             maxHeight: "150px",
//             overflowY: "auto",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//           }}
//         >
//           {filteredWarehouses.length === 0 ? (
//             <div style={{ padding: "8px 10px", color: "#666" }}>No warehouses found</div>
//           ) : (
//             filteredWarehouses.map((warehouse) => (
//               <div
//                 key={warehouse.id}
//                 onMouseDown={() => {
//                   setFormData(prev => ({
//                     ...prev,
//                     warehouse_id: warehouse.id,
//                     warehouse_name: warehouse.warehouse_name,
//                   }));
//                   setWarehouseSearch(warehouse.warehouse_name);
//                   setShowWarehouseDropdown(false);
//                 }}
//                 style={{
//                   padding: "8px 10px",
//                   cursor: "pointer",
//                   borderBottom: "1px solid #f1f1f1",
//                 }}
//                 onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
//                 onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
//               >
//                 {warehouse.warehouse_name}
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   </Form.Group>
// </Col>
//               <Col md={4}>
//                 <Form.Group>
//                   <Form.Label>Status</Form.Label>
//                   <Form.Select
//                     name="status"
//                     value={formData.status}
//                     onChange={handleInputChange}
//                   >
//                     {STATUS_OPTIONS.map((s) => (
//                       <option key={s} value={s}>
//                         {formatStatus(s)}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Reason for Return</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="reason_for_return"
//                     value={formData.reason_for_return}
//                     onChange={handleInputChange}
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Manual Voucher No</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="manual_voucher_no"
//                     value={formData.manual_voucher_no}
//                     onChange={handleInputChange}
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Form.Group className="mb-3">
//               <Form.Label>Notes</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 name="notes"
//                 value={formData.notes}
//                 onChange={handleInputChange}
//               />
//             </Form.Group>
//             <div className="border-top pt-3 mb-3">
//               <h6 className="fw-bold">Bank Details (Optional)</h6>
//               <Row className="g-2">
//                 <Col md={6}>
//                   <Form.Control
//                     placeholder="Bank Name"
//                     value={formData.bank_name}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, bank_name: e.target.value }))}
//                   />
//                 </Col>
//                 <Col md={6}>
//                   <Form.Control
//                     placeholder="Account Number"
//                     value={formData.account_no}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, account_no: e.target.value }))}
//                   />
//                 </Col>
//                 <Col md={6}>
//                   <Form.Control
//                     placeholder="Account Holder"
//                     value={formData.account_holder}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, account_holder: e.target.value }))}
//                   />
//                 </Col>
//                 <Col md={6}>
//                   <Form.Control
//                     placeholder="IFSC Code"
//                     value={formData.ifsc_code}
//                     onChange={(e) => setFormData((prev) => ({ ...prev, ifsc_code: e.target.value }))}
//                   />
//                 </Col>
//               </Row>
//             </div>
//             <div className="border-top pt-3">
//               <h6 className="fw-bold">Add Returned Items</h6>
//               <Row className="g-2 mb-3">
//                 <Col md={3}>
//                   <Form.Group>
//                     <div style={{ position: "relative" }}>
//                       <input
//                         type="text"
//                         value={productSearch}
//                         placeholder="Select or type product..."
//                         onChange={(e) => {
//                           setProductSearch(e.target.value);
//                           setSelectedProduct(null);
//                           setItemRate(0);
//                         }}
//                         onFocus={() => {
//                           setProductSearch(selectedProduct?.item_name || '');
//                           setShowProductDropdown(true);
//                         }}
//                         onBlur={() => setTimeout(() => setShowProductDropdown(false), 150)}
//                         className="form-control"
//                       />
//                       {showProductDropdown && (
//                         <div
//                           style={{
//                             position: "absolute",
//                             top: "100%",
//                             left: 0,
//                             right: 0,
//                             zIndex: 1000,
//                             backgroundColor: "white",
//                             border: "1px solid #ccc",
//                             borderRadius: "5px",
//                             maxHeight: "150px",
//                             overflowY: "auto",
//                             boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//                           }}
//                         >
//                           {filteredProducts.length === 0 ? (
//                             <div style={{ padding: "8px 10px", color: "#666" }}>No products found</div>
//                           ) : (
//                             filteredProducts.map((prod) => (
//                               <div
//                                 key={prod.id}
//                                 onMouseDown={() => {
//                                   const selected = products.find(p => String(p.id) === String(prod.id));
//                                   setSelectedProduct(selected);
//                                   setProductSearch(selected.item_name);
//                                   if (selected && (selected.purchase_price || selected.sale_price)) {
//                                     setItemRate(parseFloat(selected.purchase_price || selected.sale_price) || 0);
//                                   } else {
//                                     setItemRate(0);
//                                   }
//                                   setShowProductDropdown(false);
//                                 }}
//                                 style={{
//                                   padding: "8px 10px",
//                                   cursor: "pointer",
//                                   borderBottom: "1px solid #f1f1f1",
//                                 }}
//                                 onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
//                                 onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
//                               >
//                                 {prod.item_name}
//                               </div>
//                             ))
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </Form.Group>
//                 </Col>
//                 <Col md={2}>
//                   <Form.Control
//                     type="number"
//                     placeholder="Qty"
//                     value={itemQty}
//                     onChange={(e) => setItemQty(parseInt(e.target.value) || 0)}
//                     min="1"
//                   />
//                 </Col>
//                 <Col md={2}>
//                   <Form.Control
//                     type="number"
//                     placeholder="Rate"
//                     value={itemRate}
//                     onChange={(e) => setItemRate(parseFloat(e.target.value) || 0)}
//                     step="0.01"
//                   />
//                 </Col>
//                 <Col md={2}>
//                   <Form.Control
//                     type="number"
//                     placeholder="Tax %"
//                     value={itemTaxPercent}
//                     onChange={(e) => setItemTaxPercent(parseFloat(e.target.value) || 0)}
//                     step="0.1"
//                   />
//                 </Col>
//                 <Col md={2}>
//                   <Form.Control
//                     type="number"
//                     placeholder="Discount"
//                     value={itemDiscount}
//                     onChange={(e) => setItemDiscount(parseFloat(e.target.value) || 0)}
//                     step="0.01"
//                   />
//                 </Col>
//                 <Col md={1}>
//                   <Button variant="primary" onClick={handleAddItem} className="w-100">+</Button>
//                 </Col>
//               </Row>
//               {formData.items.length > 0 && (
//                 <Table size="sm" bordered>
//                   <thead className="table-light">
//                     <tr>
//                       <th>Product</th>
//                       <th>Qty</th>
//                       <th>Rate</th>
//                       <th>Tax %</th>
//                       <th>Disc</th>
//                       <th>Total</th>
//                       <th>Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {formData.items.map((item, idx) => (
//                       <tr key={idx}>
//                         <td>{item.item_name}</td>
//                         <td>{item.quantity}</td>
//                         <td>₹{item.rate.toFixed(2)}</td>
//                         <td>{item.tax_percent}%</td>
//                         <td>₹{item.discount.toFixed(2)}</td>
//                         <td>₹{item.amount.toLocaleString()}</td>
//                         <td className="text-center">
//                           <Button size="sm" variant="danger" onClick={() => handleRemoveItem(idx)}>
//                             <FaTrash size={12} />
//                           </Button>
//                         </td>
//                       </tr>
//                     ))}
//                     <tr className="fw-bold">
//                       <td colSpan={5} className="text-end">Grand Total</td>
//                       <td>₹{formData.grand_total.toLocaleString()}</td>
//                       <td></td>
//                     </tr>
//                   </tbody>
//                 </Table>
//               )}
//             </div>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => { setShowModal(false); closeAllDropdowns(); }}>
//             Cancel
//           </Button>
//           <Button
//             variant="primary"
//             style={{ backgroundColor: '#3daaaa', borderColor: '#3daaaa' }}
//             onClick={handleSubmit}
//           >
//             {isEditMode ? 'Update Return' : 'Create Return'}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* View Modal */}
//       <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Purchase Return Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedReturn && (
//             <div>
//               <Row className="mb-3">
//                 <Col md={6}><strong>Reference ID:</strong> {selectedReturn.reference_id}</Col>
//                 <Col md={6}><strong>Return No:</strong> {selectedReturn.return_no}</Col>
//               </Row>
//               <Row className="mb-3">
//                 <Col md={6}><strong>Invoice:</strong> {selectedReturn.invoice_no}</Col>
//                 <Col md={6}><strong>Vendor:</strong> {getVendorName(selectedReturn.vendor_id)}</Col>
//               </Row>
//               <Row className="mb-3">
//                 <Col md={6}><strong>Warehouse:</strong> {getWarehouseName(selectedReturn.warehouse_id)}</Col>
//                 <Col md={6}><strong>Date:</strong> {selectedReturn.return_date?.split('T')[0]}</Col>
//               </Row>
//               <Row className="mb-3">
//                 <Col md={6}><strong>Amount:</strong> ₹{Number(selectedReturn.grand_total).toLocaleString()}</Col>
//                 <Col md={6}>
//                   <strong>Status:</strong>
//                   <Badge bg={getStatusVariant(selectedReturn.status)} className="ms-2">
//                     {formatStatus(selectedReturn.status)}
//                   </Badge>
//                 </Col>
//               </Row>
//               <Row className="mb-3">
//                 <Col md={6}><strong>Reason:</strong> {selectedReturn.reason_for_return || 'N/A'}</Col>
//                 <Col md={6}><strong>Manual Voucher:</strong> {selectedReturn.manual_voucher_no || '—'}</Col>
//               </Row>
//               <Row className="mb-3">
//                 <Col md={12}>
//                   <strong>Notes:</strong>
//                   <p className="bg-light p-3 rounded mt-1">{selectedReturn.notes || 'No notes'}</p>
//                 </Col>
//               </Row>
//               {selectedReturn.bank_name && (
//                 <Row>
//                   <Col>
//                     <strong>Bank Details:</strong>
//                     <p className="bg-light p-3 rounded mt-1 mb-0">
//                       {selectedReturn.bank_name}, {selectedReturn.account_no} ({selectedReturn.ifsc_code})
//                       <br />
//                       Account Holder: {selectedReturn.account_holder}
//                     </p>
//                   </Col>
//                 </Row>
//               )}
//               {selectedReturn.purchase_return_items?.length > 0 && (
//                 <>
//                   <h6 className="mt-4 fw-bold">Returned Items</h6>
//                   <Table size="sm" bordered>
//                     <thead className="table-light">
//                       <tr>
//                         <th>Product</th>
//                         <th>Qty</th>
//                         <th>Rate</th>
//                         <th>Tax %</th>
//                         <th>Disc</th>
//                         <th>Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedReturn.purchase_return_items.map((item, idx) => (
//                         <tr key={idx}>
//                           <td>{item.item_name}</td>
//                           <td>{item.quantity}</td>
//                           <td>₹{parseFloat(item.rate).toLocaleString()}</td>
//                           <td>{item.tax_percent}%</td>
//                           <td>₹{parseFloat(item.discount).toLocaleString()}</td>
//                           <td>₹{parseFloat(item.amount).toLocaleString()}</td>
//                         </tr>
//                       ))}
//                       <tr className="fw-bold">
//                         <td colSpan={5} className="text-end">Grand Total</td>
//                         <td>₹{Number(selectedReturn.grand_total).toLocaleString()}</td>
//                       </tr>
//                     </tbody>
//                   </Table>
//                 </>
//               )}
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="primary" onClick={() => setShowViewModal(false)}>Close</Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Delete Modal */}
//       <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Delete</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>Are you sure you want to delete this purchase return? This action cannot be undone.</p>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
//           <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Info Card */}
//       <Card className="mt-4 rounded-4 border">
//         <Card.Body>
//           <h5 className="fw-semibold text-primary border-bottom pb-2 mb-3">Page Info</h5>
//           <ul className="text-muted" style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
//             <li>Manage goods returned to vendors due to damage, overstock, or wrong items.</li>
//             <li>Track return ID, invoice, vendor, warehouse, amount, and status.</li>
//             <li>Auto-generated <strong>Reference ID</strong> and <strong>Voucher Numbers</strong> for accounting.</li>
//             <li>Supports item-level details with quantity, rate, tax, discount, and total.</li>
//           </ul>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// };

// export default PurchaseReturn;


import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Button,
  Form,
  Table,
  Badge,
  Row,
  Col,
  Card,
  Spinner
} from 'react-bootstrap';
import {
  FaEye, FaEdit, FaTrash, FaSearch
} from "react-icons/fa";
import { BiPlus } from 'react-icons/bi';
import axiosInstance from "../../../Api/axiosInstance";
import GetCompanyId from "../../../Api/GetCompanyId";

const STATUS_OPTIONS = ['pending', 'approved', 'rejected'];

const formatStatus = (status) => status?.charAt(0).toUpperCase() + status?.slice(1) || '—';
const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'danger';
    default: return 'secondary';
  }
};

const PurchaseReturn = () => {
  const companyId = GetCompanyId();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const isCleaningUpRef = useRef(false); // Prevent multiple cleanup calls
  const modalKeyRef = useRef({ main: 0, view: 0, delete: 0 }); // Force modal remount
  const [statusFilter, setStatusFilter] = useState('All');
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [vendors, setVendors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Permission states
  const [userPermissions, setUserPermissions] = useState([]);
  const [purchaseReturnPermissions, setPurchaseReturnPermissions] = useState({
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
      setPurchaseReturnPermissions({
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

        // Check if user has permissions for Purchase_Return module
        const purchaseReturnPermission = permissions.find(p => p.module_name === "Purchase_Return");
        if (purchaseReturnPermission) {
          setPurchaseReturnPermissions({
            can_create: purchaseReturnPermission.can_create,
            can_view: purchaseReturnPermission.can_view,
            can_update: purchaseReturnPermission.can_update,
            can_delete: purchaseReturnPermission.can_delete
          });
        }
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setPurchaseReturnPermissions({
          can_create: false,
          can_view: false,
          can_update: false,
          can_delete: false
        });
      }
    } else {
      setPurchaseReturnPermissions({
        can_create: false,
        can_view: false,
        can_update: false,
        can_delete: false
      });
    }
  }, []);

  // Dropdown visibility (only one open at a time)
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const closeAllDropdowns = () => {
    setShowVendorDropdown(false);
    setShowWarehouseDropdown(false);
    setShowProductDropdown(false);
  };

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQty, setItemQty] = useState(1);
  const [itemRate, setItemRate] = useState(0);
  const [itemTaxPercent, setItemTaxPercent] = useState(18);
  const [itemDiscount, setItemDiscount] = useState(0);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredReturns = (Array.isArray(returns) ? returns : []).filter((item) => {
    // Search term filter
    const matchesSearch =
      searchTerm === '' ||
      (item.vendor_name && item.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.return_no && item.return_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.invoice_no && item.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    // Warehouse filter
    const matchesWarehouse = warehouseFilter === 'All' || String(item.warehouse_id) === String(warehouseFilter);

    // Date range filter
    let matchesDate = true;
    if (item.return_date) {
      const itemDate = new Date(item.return_date.split('T')[0]); // ISO date part only
      if (fromDate) {
        const from = new Date(fromDate);
        if (itemDate < from) matchesDate = false;
      }
      if (toDate) {
        const to = new Date(toDate);
        if (itemDate > to) matchesDate = false;
      }
    } else {
      matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesWarehouse && matchesDate;
  });

  const initialFormData = {
    vendor_id: '',
    vendor_name: '',
    return_no: '',
    invoice_no: '',
    return_date: '',
    warehouse_id: '',
    warehouse_name: '',
    return_type: 'Purchase Return',
    reason_for_return: '',
    manual_voucher_no: '',
    status: 'pending',
    notes: '',
    bank_name: '',
    account_no: '',
    account_holder: '',
    ifsc_code: '',
    items: [],
    sub_total: 0,
    tax_total: 0,
    discount_total: 0,
    grand_total: 0,
    id: null
  };

  const [formData, setFormData] = useState(initialFormData);

  // Fetch functions
  const fetchReturns = async () => {
    if (!companyId || !purchaseReturnPermissions.can_view) return [];
    try {
      const res = await axiosInstance.get(`/get-returns`);
      const data = res.data?.data;
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object') {
        return [data];
      } else {
        return [];
      }
    } catch (err) {
      console.error('Failed to load returns', err);
      setError("Failed to load purchase returns.");
      return [];
    }
  };

  const fetchVendors = async () => {
    if (!companyId) return [];
    try {
      const res = await axiosInstance.get(`/vendorCustomer/company/${companyId}`, { params: { type: 'vender' } });
      return Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error('Failed to load vendors', err);
      return [];
    }
  };

  const fetchWarehouses = async () => {
    if (!companyId) return [];
    try {
      const res = await axiosInstance.get(`/warehouses/company/${companyId}`);
      return Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error('Failed to load warehouses', err);
      return [];
    }
  };

  const fetchProducts = async () => {
    if (!companyId) return [];
    try {
      const res = await axiosInstance.get(`/products/company/${companyId}`);
      return Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error('Failed to load products', err);
      return [];
    }
  };

  const fetchData = async () => {
    if (!companyId) {
      setError('Company ID is missing');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [returnsData, vendorsData, warehousesData, productsData] = await Promise.all([
        fetchReturns(),
        fetchVendors(),
        fetchWarehouses(),
        fetchProducts()
      ]);
      setReturns(returnsData);
      setVendors(vendorsData);
      setWarehouses(warehousesData);
      setProducts(productsData);
    } catch (err) {
      console.error("Unexpected error during fetch", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId, purchaseReturnPermissions.can_view]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectVendor = (vendor) => {
    setFormData(prev => ({
      ...prev,
      vendor_id: String(vendor.id),
      vendor_name: vendor.name_english || '',
    }));
    setVendorSearch(vendor.name_english || '');
    setShowVendorDropdown(false);
  };

  const handleSelectWarehouse = (warehouse) => {
    setFormData(prev => ({
      ...prev,
      warehouse_id: String(warehouse.id),
      warehouse_name: warehouse.warehouse_name || '',
    }));
    setWarehouseSearch(warehouse.warehouse_name || '');
    setShowWarehouseDropdown(false);
  };

  const handleSelectProduct = (product) => {
    const fullProduct = products.find(p => String(p.id) === String(product.id));
    if (fullProduct) {
      setSelectedProduct(fullProduct);
      setProductSearch(fullProduct.item_name || '');
      setItemRate(parseFloat(fullProduct.purchase_price || fullProduct.sale_price || 0));
    }
    setShowProductDropdown(false);
  };

  const handleAddItem = () => {
    if (!selectedProduct || !selectedProduct.id) {
      alert("Please select a valid product.");
      return;
    }
    if (itemQty <= 0 || itemRate <= 0) {
      alert("Quantity and rate must be greater than zero.");
      return;
    }

    const taxAmount = (itemRate * itemQty * itemTaxPercent) / 100;
    const itemTotal = itemRate * itemQty + taxAmount - itemDiscount;

    const newItem = {
      product_id: String(selectedProduct.id),
      item_name: selectedProduct.item_name,
      quantity: itemQty,
      qty: itemQty,
      rate: itemRate,
      price: itemRate,
      tax_percent: itemTaxPercent,
      tax: itemTaxPercent,
      discount: itemDiscount,
      amount: parseFloat(itemTotal.toFixed(2)),
    };

    const newItems = [...formData.items, newItem];
    const sub_total = newItems.reduce((sum, i) => sum + i.rate * i.quantity, 0);
    const tax_total = newItems.reduce((sum, i) => sum + (i.rate * i.quantity * i.tax_percent) / 100, 0);
    const discount_total = newItems.reduce((sum, i) => sum + i.discount, 0);
    const grand_total = sub_total + tax_total - discount_total;

    setFormData(prev => ({
      ...prev,
      items: newItems,
      sub_total: parseFloat(sub_total.toFixed(2)),
      tax_total: parseFloat(tax_total.toFixed(2)),
      discount_total: parseFloat(discount_total.toFixed(2)),
      grand_total: parseFloat(grand_total.toFixed(2)),
    }));

    setSelectedProduct(null);
    setItemQty(1);
    setItemRate(0);
    setItemTaxPercent(18);
    setItemDiscount(0);
    setProductSearch('');
    closeAllDropdowns();
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const sub_total = newItems.reduce((sum, i) => sum + i.rate * i.quantity, 0);
    const tax_total = newItems.reduce((sum, i) => sum + (i.rate * i.quantity * i.tax_percent) / 100, 0);
    const discount_total = newItems.reduce((sum, i) => sum + i.discount, 0);
    const grand_total = sub_total + tax_total - discount_total;
    setFormData(prev => ({
      ...prev,
      items: newItems,
      sub_total: parseFloat(sub_total.toFixed(2)),
      tax_total: parseFloat(tax_total.toFixed(2)),
      discount_total: parseFloat(discount_total.toFixed(2)),
      grand_total: parseFloat(grand_total.toFixed(2)),
    }));
  };

  const handleSubmit = async () => {
    if (!purchaseReturnPermissions.can_create && !isEditMode) {
      alert("You don't have permission to create purchase returns.");
      return;
    }
    
    if (!purchaseReturnPermissions.can_update && isEditMode) {
      alert("You don't have permission to update purchase returns.");
      return;
    }
    
    if (!formData.vendor_id || formData.vendor_id === '') {
      alert("Please select a vendor.");
      return;
    }
    if (!formData.invoice_no.trim()) {
      alert("Please enter an invoice number.");
      return;
    }
    if (!formData.return_date) {
      alert("Please select a return date.");
      return;
    }
    if (!formData.warehouse_id || formData.warehouse_id === '') {
      alert("Please select a warehouse.");
      return;
    }
    if (formData.items.length === 0) {
      alert("Please add at least one returned item.");
      return;
    }

    const invalidItem = formData.items.find(item => !item.product_id);
    if (invalidItem) {
      alert("One or more items are missing product ID.");
      return;
    }

    const safeRefId = `REF-PR-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`.toUpperCase();

    const purchaseReturnItems = formData.items.map(item => ({
      product_id: parseInt(String(item.product_id), 10),
      item_name: item.item_name,
      quantity: item.quantity,
      rate: item.rate,
      tax_percent: item.tax_percent,
      discount: item.discount,
      amount: item.amount,
    }));

    const payload = {
      company_id: companyId,
      vendor_id: parseInt(String(formData.vendor_id), 10),
      vendor_name: formData.vendor_name,
      return_no: formData.return_no,
      invoice_no: formData.invoice_no,
      return_date: formData.return_date,
      warehouse_id: parseInt(String(formData.warehouse_id), 10),
      return_type: formData.return_type,
      reason_for_return: formData.reason_for_return || null,
      manual_voucher_no: formData.manual_voucher_no || null,
      reference_id: safeRefId,
      status: formData.status,
      notes: formData.notes || null,
      bank_name: formData.bank_name || null,
      account_no: formData.account_no || null,
      account_holder: formData.account_holder || null,
      ifsc_code: formData.ifsc_code || null,
      sub_total: formData.sub_total,
      tax_total: formData.tax_total,
      discount_total: formData.discount_total,
      grand_total: formData.grand_total,
      purchase_return_items: purchaseReturnItems,
    };

    try {
      if (isEditMode) {
        await axiosInstance.put(`/update-purchase/${formData.id}`, payload);
        alert("Purchase return updated successfully.");
      } else {
        await axiosInstance.post('/create-purchase-return', payload);
        alert("Purchase return created successfully.");
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error("Submit error", err);
      const message = err.response?.data?.message || "An error occurred. Please try again.";
      alert(message);
    }
  };

  const getVendorName = (id) => {
    const v = vendors.find(v => String(v.id) === String(id));
    return v ? v.name_english : '—';
  };

  const getWarehouseName = (id) => {
    const w = warehouses.find(w => String(w.id) === String(id));
    return w ? w.warehouse_name : '—';
  };

  // Modal close handlers
  const handleCloseModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowModal(false);
    modalKeyRef.current.main += 1;
  };

  const handleCloseViewModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowViewModal(false);
    modalKeyRef.current.view += 1;
  };

  const handleCloseDeleteModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowDeleteModal(false);
    modalKeyRef.current.delete += 1;
  };

  // Modal exited handlers
  const handleModalExited = () => {
    setFormData(initialFormData);
    setIsEditMode(false);
    closeAllDropdowns();
    setVendorSearch('');
    setWarehouseSearch('');
    setProductSearch('');
    setSelectedProduct(null);
    setItemQty(1);
    setItemRate(0);
    setItemTaxPercent(18);
    setItemDiscount(0);
    isCleaningUpRef.current = false;
  };

  const handleViewModalExited = () => {
    setSelectedReturn(null);
    isCleaningUpRef.current = false;
  };

  const handleDeleteModalExited = () => {
    setDeleteId(null);
    isCleaningUpRef.current = false;
  };

  const handleViewClick = (item) => {
    if (!purchaseReturnPermissions.can_view) {
      alert("You don't have permission to view purchase returns.");
      return;
    }
    
    isCleaningUpRef.current = false;
    modalKeyRef.current.view += 1;
    setSelectedReturn(item);
    setShowViewModal(true);
  };

  const handleEditClick = (item) => {
    if (!purchaseReturnPermissions.can_update) {
      alert("You don't have permission to edit purchase returns.");
      return;
    }
    
    const normalizedItems = (item.purchase_return_items || []).map(i => ({
      id: i.id,
      purchase_return_id: i.purchase_return_id,
      product_id: i.product_id,
      item_name: i.item_name,
      quantity: parseInt(i.quantity, 10) || 0,
      qty: parseInt(i.quantity, 10) || 0,
      rate: parseFloat(i.rate) || 0,
      price: parseFloat(i.rate) || 0,
      tax_percent: parseFloat(i.tax_percent) || 0,
      tax: parseFloat(i.tax_percent) || 0,
      discount: parseFloat(i.discount) || 0,
      amount: parseFloat(i.amount) || 0,
    }));
    setFormData({
      id: item.id,
      vendor_id: String(item.vendor_id) || '',
      vendor_name: item.vendor_name || '',
      return_no: item.return_no || '',
      invoice_no: item.invoice_no || '',
      return_date: item.return_date ? item.return_date.split('T')[0] : '',
      warehouse_id: String(item.warehouse_id) || '',
      warehouse_name: getWarehouseName(item.warehouse_id),
      return_type: item.return_type || 'Purchase Return',
      reason_for_return: item.reason_for_return || '',
      manual_voucher_no: item.manual_voucher_no || '',
      status: item.status || 'pending',
      notes: item.notes || '',
      bank_name: item.bank_name || '',
      account_no: item.account_no || '',
      account_holder: item.account_holder || '',
      ifsc_code: item.ifsc_code || '',
      items: normalizedItems,
      sub_total: parseFloat(item.sub_total) || 0,
      tax_total: parseFloat(item.tax_total) || 0,
      discount_total: parseFloat(item.discount_total) || 0,
      grand_total: parseFloat(item.grand_total) || 0,
    });
    isCleaningUpRef.current = false;
    modalKeyRef.current.main += 1;
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    if (!purchaseReturnPermissions.can_delete) {
      alert("You don't have permission to delete purchase returns.");
      return;
    }
    
    isCleaningUpRef.current = false;
    modalKeyRef.current.delete += 1;
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axiosInstance.delete(`/delete-purchase/${deleteId}`);
      alert("Purchase return deleted successfully.");
      fetchData();
      handleCloseDeleteModal();
    } catch (err) {
      console.error("Delete error", err);
      alert(err.response?.data?.message || "Failed to delete. Please try again.");
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name_english.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const filteredWarehouses = warehouses.filter(warehouse => {
    if (!warehouse) return false;
    const name = warehouse.warehouse_name || '';
    return name.toLowerCase().includes(warehouseSearch.toLowerCase());
  });

  const filteredProducts = products.filter(product => {
    if (!product) return false;
    const name = product.item_name || '';
    return name.toLowerCase().includes(productSearch.toLowerCase());
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading purchase returns...</span>
      </div>
    );
  }

  if (!purchaseReturnPermissions.can_view) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="text-center">
          <h3 className="text-danger">Access Denied</h3>
          <p>You don't have permission to view the Purchase Return module.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="mb-0 fw-bold">Purchase Returns</h2>
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="success" size="sm" className="rounded-pill p-2 text-nowrap" disabled>
            <i className="fas fa-file-import me-1" /> Import
          </Button>
          <Button variant="warning" size="sm" className="rounded-pill px-2 py-0 text-nowrap" disabled>
            <i className="fas fa-file-export me-1" /> Export
          </Button>
          <Button variant="info" size="sm" className="rounded-pill px-2 py-0 text-nowrap" disabled>
            <i className="fas fa-download me-1" /> Download
          </Button>
          {purchaseReturnPermissions.can_create && (
            <Button
              variant="primary"
              size="sm"
              className="rounded-pill py-0 text-nowrap"
              onClick={() => {
                isCleaningUpRef.current = false;
                modalKeyRef.current.main += 1;
                const now = new Date();
                const year = now.getFullYear();
                const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
                const returnNo = `PR-${year}-${String(returns.length + 1).padStart(4, '0')}${uniqueSuffix}`;
                setFormData({ ...initialFormData, return_no: returnNo });
                setIsEditMode(false);
                setShowModal(true);
              }}
            >
              <i className="fas fa-plus me-1" /> New Return
            </Button>
          )}
        </div>
      </div>
      <Row className="mb-4 g-3">
        {/* Search */}
        <Col lg={3} md={6}>
          <div className="input-group">
            <span className="input-group-text bg-light"><FaSearch /></span>
            <Form.Control
              type="text"
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>

        {/* Status Filter */}
        <Col lg={2} md={6}>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">Status: All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {formatStatus(s)}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Warehouse Filter */}
        <Col lg={2} md={6}>
          <Form.Select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
            <option value="All">Warehouse: All</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.warehouse_name}
              </option>
            ))}
          </Form.Select>
        </Col>

        {/* Date From */}
        <Col lg={2} md={6}>
          <Form.Control
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From Date"
          />
        </Col>

        {/* Date To */}
        <Col lg={2} md={6}>
          <Form.Control
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To Date"
          />
        </Col>
      </Row>
      <Card className="border rounded-3 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="mb-0 text-center align-middle">
            <thead className="">
              <tr>
                <th>REF ID</th>
                <th>RETURN #</th>
                <th>INVOICE #</th>
                <th>VENDOR</th>
                <th>WAREHOUSE</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-muted py-4">No purchase returns found.</td>
                </tr>
              ) : (
                filteredReturns.map((item) => (
                  <tr key={item.id}>
                    <td className="text-primary fw-medium">{item.reference_id}</td>
                    <td className="text-primary fw-medium">{item.return_no}</td>
                    <td className="text-muted">{item.invoice_no}</td>
                    <td>{getVendorName(item.vendor_id)}</td>
                    <td>{getWarehouseName(item.warehouse_id)}</td>
                    <td className="text-muted">
                      {item.return_date ? item.return_date.split('T')[0] : ''}
                    </td>
                    <td className="fw-bold">₹{Number(item.grand_total).toLocaleString()}</td>
                    <td>
                      <Badge bg={getStatusVariant(item.status)}>{formatStatus(item.status)}</Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        {purchaseReturnPermissions.can_view && (
                          <Button size="sm" variant="outline-info" onClick={() => handleViewClick(item)}>
                            <FaEye />
                          </Button>
                        )}
                        {purchaseReturnPermissions.can_update && (
                          <Button size="sm" variant="outline-warning" onClick={() => handleEditClick(item)}>
                            <FaEdit />
                          </Button>
                        )}
                        {purchaseReturnPermissions.can_delete && (
                          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteClick(item.id)}>
                            <FaTrash />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
        <div className="d-flex justify-content-between align-items-center p-3">
          <small className="">Showing {filteredReturns.length} of {returns.length} entries</small>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-secondary disabled">&laquo;</button>
            <button className="btn btn-primary">1</button>
            <button className="btn btn-outline-secondary">&raquo;</button>
          </div>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal 
        key={modalKeyRef.current.main}
        show={showModal} 
        onHide={handleCloseModal}
        onExited={handleModalExited}
        size="lg" 
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Edit Purchase Return' : 'Add New Purchase Return'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Return No</Form.Label>
                  <Form.Control type="text" value={formData.return_no} readOnly className="bg-light" />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Vendor *</Form.Label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={vendorSearch}
                      placeholder="Select or type vendor..."
                      onChange={(e) => {
                        setVendorSearch(e.target.value);
                        setFormData(prev => ({ ...prev, vendor_name: e.target.value, vendor_id: '' }));
                      }}
                      onFocus={() => {
                        setVendorSearch(formData.vendor_name || '');
                        setShowVendorDropdown(true);
                      }}
                      onBlur={() => setTimeout(() => setShowVendorDropdown(false), 150)}
                      className="form-control"
                    />
                    {showVendorDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 1000,
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "5px",
                          maxHeight: "150px",
                          overflowY: "auto",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {filteredVendors.length === 0 ? (
                          <div style={{ padding: "8px 10px", color: "#666" }}>No vendors found</div>
                        ) : (
                          filteredVendors.map((vendor) => (
                            <div
                              key={vendor.id}
                              onMouseDown={() => handleSelectVendor(vendor)}
                              style={{
                                padding: "8px 10px",
                                cursor: "pointer",
                                borderBottom: "1px solid #f1f1f1",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                            >
                              {vendor.name_english}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Invoice *</Form.Label>
                  <Form.Control
                    type="text"
                    name="invoice_no"
                    value={formData.invoice_no}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="return_date"
                    value={formData.return_date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Warehouse *</Form.Label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={warehouseSearch}
                      placeholder="Select or type warehouse..."
                      onChange={(e) => {
                        setWarehouseSearch(e.target.value);
                        setFormData(prev => ({ ...prev, warehouse_name: e.target.value, warehouse_id: '' }));
                      }}
                      onFocus={() => {
                        setWarehouseSearch(formData.warehouse_name || '');
                        setShowWarehouseDropdown(true);
                      }}
                      onBlur={() => setTimeout(() => setShowWarehouseDropdown(false), 150)}
                      className="form-control"
                    />
                    {showWarehouseDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 1000,
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "5px",
                          maxHeight: "150px",
                          overflowY: "auto",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {filteredWarehouses.length === 0 ? (
                          <div style={{ padding: "8px 10px", color: "#666" }}>No warehouses found</div>
                        ) : (
                          filteredWarehouses.map((warehouse) => (
                            <div
                              key={warehouse.id}
                              onMouseDown={() => handleSelectWarehouse(warehouse)}
                              style={{
                                padding: "8px 10px",
                                cursor: "pointer",
                                borderBottom: "1px solid #f1f1f1",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                            >
                              {warehouse.warehouse_name}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {formatStatus(s)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Reason for Return</Form.Label>
                  <Form.Control
                    type="text"
                    name="reason_for_return"
                    value={formData.reason_for_return}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Manual Voucher No</Form.Label>
                  <Form.Control
                    type="text"
                    name="manual_voucher_no"
                    value={formData.manual_voucher_no}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Form.Group>
            <div className="border-top pt-3 mb-3">
              <h6 className="fw-bold">Bank Details (Optional)</h6>
              <Row className="g-2">
                <Col md={6}>
                  <Form.Control
                    placeholder="Bank Name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bank_name: e.target.value }))}
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    placeholder="Account Number"
                    value={formData.account_no}
                    onChange={(e) => setFormData((prev) => ({ ...prev, account_no: e.target.value }))}
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    placeholder="Account Holder"
                    value={formData.account_holder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, account_holder: e.target.value }))}
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    placeholder="IFSC Code"
                    value={formData.ifsc_code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ifsc_code: e.target.value }))}
                  />
                </Col>
              </Row>
            </div>
            <div className="border-top pt-3">
              <h6 className="fw-bold">Add Returned Items</h6>
              <Row className="g-2 mb-3">
                <Col md={3}>
                  <Form.Group>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        value={productSearch}
                        placeholder="Select or type product..."
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setSelectedProduct(null);
                          setItemRate(0);
                        }}
                        onFocus={() => {
                          setProductSearch(selectedProduct?.item_name || '');
                          setShowProductDropdown(true);
                        }}
                        onBlur={() => setTimeout(() => setShowProductDropdown(false), 150)}
                        className="form-control"
                      />
                      {showProductDropdown && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            maxHeight: "150px",
                            overflowY: "auto",
                            // boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          {filteredProducts.length === 0 ? (
                            <div style={{ padding: "8px 10px", color: "#666" }}>No products found</div>
                          ) : (
                            filteredProducts.map((prod) => (
                              <div
                                key={prod.id}
                                onMouseDown={() => handleSelectProduct(prod)}
                                style={{
                                  padding: "8px 10px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #f1f1f1",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                              >
                                {prod.item_name}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Qty"
                    value={itemQty}
                    onChange={(e) => setItemQty(parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Rate"
                    value={itemRate}
                    onChange={(e) => setItemRate(parseFloat(e.target.value) || 0)}
                    step="0.01"
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Tax %"
                    value={itemTaxPercent}
                    onChange={(e) => setItemTaxPercent(parseFloat(e.target.value) || 0)}
                    step="0.1"
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Discount"
                    value={itemDiscount}
                    onChange={(e) => setItemDiscount(parseFloat(e.target.value) || 0)}
                    step="0.01"
                  />
                </Col>
                <Col md={1}>
                  <Button variant="primary" onClick={handleAddItem} className="w-100">+</Button>
                </Col>
              </Row>
              {formData.items.length > 0 && (
                <Table size="sm" bordered>
                  <thead className="">
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Tax %</th>
                      <th>Disc</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.item_name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.rate.toFixed(2)}</td>
                        <td>{item.tax_percent}%</td>
                        <td>₹{item.discount.toFixed(2)}</td>
                        <td>₹{item.amount.toLocaleString()}</td>
                        <td className="text-center">
                          <Button size="sm" variant="danger" onClick={() => handleRemoveItem(idx)}>
                            <FaTrash size={12} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="fw-bold">
                      <td colSpan={5} className="text-end">Grand Total</td>
                      <td>₹{formData.grand_total.toLocaleString()}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              )}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          {(purchaseReturnPermissions.can_create && !isEditMode) || (purchaseReturnPermissions.can_update && isEditMode) ? (
            <Button
              variant="primary"
              style={{ backgroundColor: '#3daaaa', borderColor: '#3daaaa' }}
              onClick={handleSubmit}
            >
              {isEditMode ? 'Update Return' : 'Create Return'}
            </Button>
          ) : null}
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal 
        key={modalKeyRef.current.view}
        show={showViewModal} 
        onHide={handleCloseViewModal}
        onExited={handleViewModalExited}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Purchase Return Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReturn && (
            <div>
              <Row className="mb-3">
                <Col md={6}><strong>Reference ID:</strong> {selectedReturn.reference_id}</Col>
                <Col md={6}><strong>Return No:</strong> {selectedReturn.return_no}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}><strong>Invoice:</strong> {selectedReturn.invoice_no}</Col>
                <Col md={6}><strong>Vendor:</strong> {getVendorName(selectedReturn.vendor_id)}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}><strong>Warehouse:</strong> {getWarehouseName(selectedReturn.warehouse_id)}</Col>
                <Col md={6}><strong>Date:</strong> {selectedReturn.return_date?.split('T')[0]}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}><strong>Amount:</strong> ₹{Number(selectedReturn.grand_total).toLocaleString()}</Col>
                <Col md={6}>
                  <strong>Status:</strong>
                  <Badge bg={getStatusVariant(selectedReturn.status)} className="ms-2">
                    {formatStatus(selectedReturn.status)}
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}><strong>Reason:</strong> {selectedReturn.reason_for_return || 'N/A'}</Col>
                <Col md={6}><strong>Manual Voucher:</strong> {selectedReturn.manual_voucher_no || '—'}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>Notes:</strong>
                  <p className="bg-light p-3 rounded mt-1">{selectedReturn.notes || 'No notes'}</p>
                </Col>
              </Row>
              {selectedReturn.bank_name && (
                <Row>
                  <Col>
                    <strong>Bank Details:</strong>
                    <p className="bg-light p-3 rounded mt-1 mb-0">
                      {selectedReturn.bank_name}, {selectedReturn.account_no} ({selectedReturn.ifsc_code})
                      <br />
                      Account Holder: {selectedReturn.account_holder}
                    </p>
                  </Col>
                </Row>
              )}
              {selectedReturn.purchase_return_items?.length > 0 && (
                <>
                  <h6 className="mt-4 fw-bold">Returned Items</h6>
                  <Table size="sm" bordered>
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Tax %</th>
                        <th>Disc</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReturn.purchase_return_items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.item_name}</td>
                          <td>{item.quantity}</td>
                          <td>₹{parseFloat(item.rate).toLocaleString()}</td>
                          <td>{item.tax_percent}%</td>
                          <td>₹{parseFloat(item.discount).toLocaleString()}</td>
                          <td>₹{parseFloat(item.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="fw-bold">
                        <td colSpan={5} className="text-end">Grand Total</td>
                        <td>₹{Number(selectedReturn.grand_total).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </Table>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseViewModal}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal 
        key={modalKeyRef.current.delete}
        show={showDeleteModal} 
        onHide={handleCloseDeleteModal}
        onExited={handleDeleteModalExited}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this purchase return? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Info Card */}
      <Card className="mt-4 rounded-4 border">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3">Page Info</h5>
          <ul className="d" style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
            <li>Manage goods returned to vendors due to damage, overstock, or wrong items.</li>
            <li>Track return ID, invoice, vendor, warehouse, amount, and status.</li>
            <li>Auto-generated <strong>Reference ID</strong> and <strong>Voucher Numbers</strong> for accounting.</li>
            <li>Supports item-level details with quantity, rate, tax, discount, and total.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PurchaseReturn;