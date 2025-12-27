import React, { useState, useRef, useEffect } from 'react';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Dropdown,
  Spinner,
  Alert,
  Table,
  Modal,
  Card,
} from 'react-bootstrap';
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaExchangeAlt,
  FaFile,
} from "react-icons/fa";
import axiosInstance from '../../../Api/axiosInstance';
import GetCompanyId from '../../../Api/GetCompanyId';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ContraVoucher.css';

const ContraVoucher = () => {
  // Permission states
  const [hasPermission, setHasPermission] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [contraVoucherPermissions, setContraVoucherPermissions] = useState({
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
      setHasPermission(true);
      setContraVoucherPermissions({
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

        // Check if user has permissions for Contra_Voucher module
        const contraVoucherPermission = permissions.find(p => p.module_name === "Contra_Voucher");
        
        if (contraVoucherPermission) {
          setHasPermission(true);
          setContraVoucherPermissions({
            can_create: contraVoucherPermission.can_create || false,
            can_view: contraVoucherPermission.can_view || false,
            can_update: contraVoucherPermission.can_update || false,
            can_delete: contraVoucherPermission.can_delete || false
          });
        } else {
          setHasPermission(false);
        }
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setHasPermission(false);
      }
    } else {
      setHasPermission(false);
    }
  }, []);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVoucherId, setCurrentVoucherId] = useState(null);
  // Filter state
  const [filters, setFilters] = useState({
    voucherNo: '',
    fromDate: '',
    toDate: '',
  });
  // Form state
  const [autoVoucherNo, setAutoVoucherNo] = useState('');
  const [manualVoucherNo, setManualVoucherNo] = useState('');
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountFromId, setAccountFromId] = useState('');
  const [accountToId, setAccountToId] = useState('');
  const [accountFromDisplay, setAccountFromDisplay] = useState('');
  const [accountToDisplay, setAccountToDisplay] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [currentDocumentUrl, setCurrentDocumentUrl] = useState(''); // For edit preview

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [fetchError, setFetchError] = useState('');

  // Table data
  const [contraVouchers, setContraVouchers] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  const companyId = GetCompanyId();
  const accountFromRef = useRef(null);
  const accountToRef = useRef(null);

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0 });

  // Helpers
  const generateAutoVoucherNo = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `CON-${timestamp}-${randomNum}`;
  };

  // Apply filters
  const filteredVouchers = contraVouchers.filter((voucher) => {
    const matchesVoucherNo =
      !filters.voucherNo ||
      (voucher.voucher_number || '').toLowerCase().includes(filters.voucherNo.toLowerCase()) ||
      (voucher.voucher_no_auto || '').toLowerCase().includes(filters.voucherNo.toLowerCase());

    const voucherDateObj = new Date(voucher.voucher_date);
    const fromDateObj = filters.fromDate ? new Date(filters.fromDate) : null;
    const toDateObj = filters.toDate ? new Date(filters.toDate) : null;

    const matchesDate =
      (!fromDateObj || voucherDateObj >= fromDateObj) &&
      (!toDateObj || voucherDateObj <= toDateObj);

    return matchesVoucherNo && matchesDate;
  });

  const formatAccountName = (acc) => {
    const parent = acc.parent_account?.subgroup_name || 'Unknown';
    const sub = acc.sub_of_subgroup?.name;
    return sub ? `${parent} (${sub})` : parent;
  };

  const getAccountDisplayName = (accountId) => {
    if (!accountId || !accounts.length) return '—';
    const acc = accounts.find(a => a.id == accountId);
    return acc ? formatAccountName(acc) : 'Unknown Account';
  };

  // Get full document URL
  const getDocumentUrl = (path) => {
    if (!path) return '';
    // If already full URL (e.g., starts with http), return as-is
    if (path.startsWith('http')) return path;
    // Otherwise, prepend base URL
    const baseUrl = axiosInstance.defaults.baseURL || '';
    return baseUrl + (path.startsWith('/') ? path : `/${path}`);
  };

  // Fetch accounts
  useEffect(() => {
    if (!companyId || !hasPermission || !contraVoucherPermissions.can_view) {
      if (!hasPermission || !contraVoucherPermissions.can_view) {
        setTableLoading(false);
      }
      return;
    }

    const fetchAccounts = async () => {
      try {
        const response = await axiosInstance.get(`account/company/${companyId}`);
        let accountsArray = [];

        if (Array.isArray(response.data)) {
          accountsArray = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          accountsArray = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          const firstArray = Object.values(response.data).find(val => Array.isArray(val));
          if (firstArray) accountsArray = firstArray;
        }

        setAccounts(accountsArray);

        if (accountsArray.length > 0) {
          const first = accountsArray[0];
          const second = accountsArray.length > 1 ? accountsArray[1] : first;
          setAccountFromId(first.id);
          setAccountFromDisplay(formatAccountName(first));
          setAccountToId(second.id);
          setAccountToDisplay(formatAccountName(second));
        }
      } catch (err) {
        console.error('Accounts API Error:', err);
        setFetchError(err.response?.data?.message || 'Failed to load accounts.');
      }
    };

    fetchAccounts();
  }, [companyId, hasPermission, contraVoucherPermissions.can_view]);

  // Fetch vouchers
  useEffect(() => {
    if (!companyId || !hasPermission || !contraVoucherPermissions.can_view) {
      if (!hasPermission || !contraVoucherPermissions.can_view) {
        setTableLoading(false);
      }
      return;
    }

    const fetchContraVouchers = async () => {
      setTableLoading(true);
      try {
        const response = await axiosInstance.get(`contravouchers/company/${companyId}`);
        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data && Array.isArray(response.data.contra_vouchers)) {
          data = response.data.contra_vouchers;
        }
        setContraVouchers(data);
      } catch (err) {
        console.error('Failed to fetch contra vouchers:', err);
      } finally {
        setTableLoading(false);
      }
    };

    fetchContraVouchers();
  }, [companyId, hasPermission, contraVoucherPermissions.can_view]);

  // Close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountFromRef.current && !accountFromRef.current.contains(event.target)) {
        document.getElementById('accountFromDropdown')?.classList.remove('show');
      }
      if (accountToRef.current && !accountToRef.current.contains(event.target)) {
        document.getElementById('accountToDropdown')?.classList.remove('show');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdownId) => {
    const dropdown = document.getElementById(dropdownId);
    dropdown?.classList.toggle('show');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedFile(file);
  };

  const handleCloseModal = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setShowModal(false);
    
    // Force modal remount on next open
    modalKeyRef.current.main += 1;
  };
  
  // Handle modal exit - cleanup after animation
  const handleModalExited = () => {
    // Reset form state after modal fully closed
    setIsEditing(false);
    setCurrentVoucherId(null);
    setCurrentDocumentUrl('');
    resetForm();
    setError('');
    isCleaningUpRef.current = false;
  };

  const handleAddClick = () => {
    if (!contraVoucherPermissions.can_create) {
      toast.error("You don't have permission to create contra vouchers.");
      return;
    }
    
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    setIsEditing(false);
    setCurrentVoucherId(null);
    setCurrentDocumentUrl('');
    resetForm();
    setAutoVoucherNo(generateAutoVoucherNo());
    setShowModal(true);
  };

  const resetForm = () => {
    setManualVoucherNo('');
    setVoucherDate(new Date().toISOString().split('T')[0]);
    setAmount('');
    setNarration('');
    setUploadedFile(null);
    if (accounts.length > 0) {
      const first = accounts[0];
      const second = accounts.length > 1 ? accounts[1] : first;
      setAccountFromId(first.id);
      setAccountFromDisplay(formatAccountName(first));
      setAccountToId(second.id);
      setAccountToDisplay(formatAccountName(second));
    }
  };

  const handleEdit = (voucher) => {
    if (!contraVoucherPermissions.can_update) {
      toast.error("You don't have permission to edit contra vouchers.");
      return;
    }
    
    setIsEditing(true);
    setCurrentVoucherId(voucher.id);
    setManualVoucherNo(voucher.voucher_number || '');
    const dateStr = voucher.voucher_date
      ? voucher.voucher_date.split('T')[0]
      : new Date().toISOString().split('T')[0];
    setVoucherDate(dateStr);
    setAmount(voucher.amount || '');
    setNarration(voucher.narration || '');
    setUploadedFile(null);
    setCurrentDocumentUrl(voucher.document ? getDocumentUrl(voucher.document) : '');

    const fromAcc = accounts.find(acc => acc.id == voucher.account_from_id);
    const toAcc = accounts.find(acc => acc.id == voucher.account_to_id);

    if (fromAcc) {
      setAccountFromId(fromAcc.id);
      setAccountFromDisplay(formatAccountName(fromAcc));
    } else {
      setAccountFromId(voucher.account_from_id || '');
      setAccountFromDisplay('Unknown Account');
    }

    if (toAcc) {
      setAccountToId(toAcc.id);
      setAccountToDisplay(formatAccountName(toAcc));
    } else {
      setAccountToId(voucher.account_to_id || '');
      setAccountToDisplay('Unknown Account');
    }

    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      setLoading(false);
      return;
    }

    if (accountFromId === accountToId) {
      setError('Account From and Account To cannot be the same.');
      setLoading(false);
      return;
    }

    if (!accountFromId || !accountToId) {
      setError('Please select both accounts.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    if (manualVoucherNo.trim()) {
      formData.append('voucher_number', manualVoucherNo.trim());
    }
    formData.append('voucher_date', voucherDate);
    formData.append('account_from_id', accountFromId);
    formData.append('account_to_id', accountToId);
    formData.append('amount', amount);
    formData.append('narration', narration || '');
    formData.append('company_id', companyId);

    if (uploadedFile) {
      formData.append('document', uploadedFile);
    }

    try {
      let response;
      if (isEditing && currentVoucherId) {
        response = await axiosInstance.put(`contravouchers/${currentVoucherId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setContraVouchers((prev) =>
          prev.map((v) =>
            v.id === currentVoucherId
              ? {
                ...v,
                voucher_number: manualVoucherNo.trim() || v.voucher_number,
                voucher_date: voucherDate,
                account_from_id: accountFromId,
                account_to_id: accountToId,
                amount,
                narration: narration || '',
                document: response.data?.document || v.document, // Preserve if not updated
              }
              : v
          )
        );
        toast.success('Voucher updated successfully!');
      } else {
        response = await axiosInstance.post('contravouchers', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const newVoucher = {
          id: response.data?.id || Date.now(),
          voucher_no: manualVoucherNo.trim() || response.data?.voucher_no || autoVoucherNo,
          voucher_number: manualVoucherNo.trim() || null,
          voucher_date: voucherDate,
          account_from_id: accountFromId,
          account_to_id: accountToId,
          amount,
          narration: narration || '',
          document: response.data?.document,
        };
        setContraVouchers((prev) => [newVoucher, ...prev]);
        toast.success('Contra Voucher created successfully!');
      }

      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleCloseModal();
    } catch (err) {
      console.error('API Error:', err);
      setError(
        err.response?.data?.message ||
        (isEditing ? 'Failed to update voucher.' : 'Failed to create voucher.')
      );
      toast.error(
        err.response?.data?.message ||
        (isEditing ? 'Failed to update voucher.' : 'Failed to create voucher.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!contraVoucherPermissions.can_delete) {
      toast.error("You don't have permission to delete contra vouchers.");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete this voucher?`)) return;

    try {
      await axiosInstance.delete(`contravouchers/${id}`);
      setContraVouchers((prev) => prev.filter((v) => v.id !== id));
      toast.success('Voucher deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete voucher.');
    }
  };

  // If user doesn't have permission to view contra vouchers, show access denied message
  if (!hasPermission || !contraVoucherPermissions.can_view) {
    return (
      <Container fluid className="contra-voucher-container py-4">
        <Card className="contra-voucher-table-card">
          <Card.Body className="text-center py-5">
            <h3 className="text-danger">Access Denied</h3>
            <p className="text-muted">You don't have permission to view the Contra Voucher module.</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="contra-voucher-container py-4">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="contra-voucher-title">
            <FaExchangeAlt className="me-2" />
            Contra Voucher
          </h4>
          <p className="contra-voucher-subtitle mb-0">Manage fund transfers between accounts</p>
        </div>
        {contraVoucherPermissions.can_create && (
          <Button className="btn-add-voucher" onClick={handleAddClick}>
            <FaExchangeAlt className="me-2" />
            Add Contra Voucher
          </Button>
        )}
      </div>

      {fetchError && <Alert variant="warning">{fetchError}</Alert>}
      
      {/* Filter Section */}
      <Card className="filter-card mb-4">
        <Card.Body className="p-4">
          <h5 className="filter-title mb-3">Filters</h5>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="filter-label">Voucher No</Form.Label>
                <Form.Control
                  type="text"
                  className="filter-input"
                  placeholder="Search voucher number..."
                  value={filters.voucherNo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, voucherNo: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="filter-label">From Date</Form.Label>
                <Form.Control
                  type="date"
                  className="filter-input"
                  value={filters.fromDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="filter-label">To Date</Form.Label>
                <Form.Control
                  type="date"
                  className="filter-input"
                  value={filters.toDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Vouchers Table */}
      <Card className="contra-voucher-table-card">
        <Card.Body style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            {tableLoading ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="primary" className="spinner-custom" />
                <p className="mt-3">Loading vouchers...</p>
              </div>
            ) : filteredVouchers.length === 0 ? (
              <div className="text-center py-5 empty-state">
                <FaFile style={{ fontSize: "3rem", color: "#adb5bd", marginBottom: "1rem" }} />
                <p className="text-muted mb-0">No contra vouchers found matching the filters.</p>
              </div>
            ) : (
              <Table className="contra-voucher-table" hover responsive="sm">
                <thead className="table-header">
                  <tr>
                    <th>Voucher No</th>
                    <th>Date</th>
                    <th>From Account</th>
                    <th>To Account</th>
                    <th>Amount</th>
                    <th>Narration</th>
                    <th>Document</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVouchers.map((voucher) => (
                    <tr key={voucher.id}>
                      <td><strong>{voucher.voucher_no_auto || voucher.voucher_number || '—'}</strong></td>
                      <td>{voucher.voucher_date ? voucher.voucher_date.split('T')[0] : '—'}</td>
                      <td>{getAccountDisplayName(voucher.account_from_id)}</td>
                      <td>{getAccountDisplayName(voucher.account_to_id)}</td>
                      <td className="amount-cell">₹{parseFloat(voucher.amount || 0).toFixed(2)}</td>
                      <td>{voucher.narration || '—'}</td>
                      <td>
                        {voucher.document ? (
                          <Button
                            size="sm"
                            className="btn-action btn-view"
                            onClick={() => window.open(getDocumentUrl(voucher.document), '_blank')}
                            title="View Document"
                          >
                            <FaEye />
                          </Button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          {contraVoucherPermissions.can_update && (
                            <Button
                              size="sm"
                              className="btn-action btn-edit"
                              onClick={() => handleEdit(voucher)}
                              title="Edit"
                            >
                              <FaEdit />
                            </Button>
                          )}
                          {contraVoucherPermissions.can_delete && (
                            <Button
                              size="sm"
                              className="btn-action btn-delete"
                              onClick={() => handleDelete(voucher.id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Modal */}
      {contraVoucherPermissions.can_create && (
        <Modal 
          key={modalKeyRef.current.main}
          show={showModal} 
          onHide={handleCloseModal}
          onExited={handleModalExited}
          size="lg" 
          centered
          className="contra-voucher-modal"
        >
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>{isEditing ? 'Edit Contra Voucher' : 'Add Contra Voucher'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom">
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label-custom">Voucher No (Manual)</Form.Label>
                    <Form.Control
                      type="text"
                      className="form-control-custom"
                      value={manualVoucherNo}
                      onChange={(e) => setManualVoucherNo(e.target.value)}
                      placeholder="Optional"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label-custom">Voucher Date</Form.Label>
                    <Form.Control
                      type="date"
                      className="form-control-custom"
                      value={voucherDate}
                      onChange={(e) => setVoucherDate(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group ref={accountFromRef}>
                    <Form.Label className="form-label-custom">Account From</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        className="form-control-custom"
                        value={accountFromDisplay}
                        readOnly
                        onClick={() => toggleDropdown('accountFromDropdown')}
                        placeholder="Select account..."
                        required
                      />
                      <div
                        id="accountFromDropdown"
                        className="dropdown-menu position-absolute w-100"
                        style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                      >
                        {accounts.length > 0 ? (
                          accounts.map((acc) => (
                            <Dropdown.Item
                              key={acc.id}
                              onClick={() => {
                                setAccountFromId(acc.id);
                                setAccountFromDisplay(formatAccountName(acc));
                                document.getElementById('accountFromDropdown')?.classList.remove('show');
                              }}
                            >
                              {formatAccountName(acc)}
                            </Dropdown.Item>
                          ))
                        ) : (
                          <Dropdown.Item disabled>No accounts found</Dropdown.Item>
                        )}
                      </div>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group ref={accountToRef}>
                    <Form.Label className="form-label-custom">Account To</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        className="form-control-custom"
                        value={accountToDisplay}
                        readOnly
                        onClick={() => toggleDropdown('accountToDropdown')}
                        placeholder="Select account..."
                        required
                      />
                      <div
                        id="accountToDropdown"
                        className="dropdown-menu position-absolute w-100"
                        style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                      >
                        {accounts.length > 0 ? (
                          accounts.map((acc) => (
                            <Dropdown.Item
                              key={acc.id}
                              onClick={() => {
                                setAccountToId(acc.id);
                                setAccountToDisplay(formatAccountName(acc));
                                document.getElementById('accountToDropdown')?.classList.remove('show');
                              }}
                            >
                              {formatAccountName(acc)}
                            </Dropdown.Item>
                          ))
                        ) : (
                          <Dropdown.Item disabled>No accounts found</Dropdown.Item>
                        )}
                      </div>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label-custom">Amount</Form.Label>
                    <Form.Control
                      type="number"
                      className="form-control-custom"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      required
                      min="0.01"
                      step="0.01"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label-custom">Upload Document (Optional)</Form.Label>
                    <Form.Control type="file" className="form-control-custom" onChange={handleFileUpload} />
                    {/* Show current document in edit mode */}
                    {isEditing && currentDocumentUrl && !uploadedFile && (
                      <div className="mt-2">
                        <small className="text-muted">Current file: </small>
                        <a
                          href={currentDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ms-1"
                        >
                          View Document
                        </a>
                      </div>
                    )}
                    {uploadedFile && <small className="text-muted d-block mt-1">New file: {uploadedFile.name}</small>}
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="form-label-custom">Narration (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      className="form-control-custom"
                      value={narration}
                      onChange={(e) => setNarration(e.target.value)}
                      placeholder="Enter details..."
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2">
                <Button className="btn-modal-cancel" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button className="btn-modal-save" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      {isEditing ? 'Updating...' : 'Saving...'}
                    </>
                  ) : isEditing ? (
                    'Update'
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );
};

export default ContraVoucher;