import React, { useState, useEffect, useRef } from "react";
import {
  Tabs,
  Tab,
  Button,
  Form,
  Badge,
  Card,
  Modal,
  Row,
  Col,
  Table,
  Spinner,
  Container,
} from "react-bootstrap";
import {
  FaFilePdf,
  FaFileExcel,
  FaPlusCircle,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaTimes,
  FaFile,
  FaPlus,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import BaseUrl from "../../../Api/BaseUrl";
import GetCompanyId from "../../../Api/GetCompanyId";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Expense.css';

const Expense = () => {
  const companyId = GetCompanyId();
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteExpense, setDeleteExpense] = useState(null);
  const [activeTab, setActiveTab] = useState("direct");
  const [filters, setFilters] = useState({
    accountName: "",
    paymentNo: "",
    manualReceiptNo: "",
    paidFrom: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // State for table rows
  const [tableRows, setTableRows] = useState([
    { id: 1, account: "", amount: "0.00", narration: "" },
  ]);

  const [paidTo, setPaidTo] = useState("");
  const [narration, setNarration] = useState("");
  const [showNarration, setShowNarration] = useState(true);

  // Receipt numbers
  const [autoReceiptNo, setAutoReceiptNo] = useState("");
  const [manualReceiptNo, setManualReceiptNo] = useState("");
  const [nextSequence, setNextSequence] = useState(1);

  // API data
  const [accounts, setAccounts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [expenseVouchers, setExpenseVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const [vendorsLoaded, setVendorsLoaded] = useState(false);
  const [vouchersLoaded, setVouchersLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPaidFrom, setSelectedPaidFrom] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Modal cleanup refs
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ create: 0, view: 0, edit: 0, delete: 0 });

  // Permission states
  const [hasPermission, setHasPermission] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [expensePermissions, setExpensePermissions] = useState({
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
      setExpensePermissions({
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

        // Check if user has permissions for Expenses module
        const expensePermission = permissions.find(p => p.module_name === "Expenses");
        
        if (expensePermission) {
          setHasPermission(true);
          setExpensePermissions({
            can_create: expensePermission.can_create || false,
            can_view: expensePermission.can_view || false,
            can_update: expensePermission.can_update || false,
            can_delete: expensePermission.can_delete || false
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

  // ✅ FIXED: Use result.status instead of result.success
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BaseUrl}account/company/${companyId}`);
      const result = await response.json();

      // ✅ Change this line:
      if (result.success) { // <-- was result.status
        setAccounts(Array.isArray(result.data) ? result.data : [result.data]);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
      setAccountsLoaded(true);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BaseUrl}vendorCustomer/company/${companyId}?type=vender`);
      const result = await response.json();
      console.log("Fetched vendorsfffffffffff:", result);

      if (result.success) { // Changed from result.success to result.status
        setVendors(Array.isArray(result.data) ? result.data : [result.data]);
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    } finally {
      setLoading(false);
      setVendorsLoaded(true);
    }
  };

  const fetchExpenseVouchers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BaseUrl}expensevoucher/company/${companyId}`);
      const result = await response.json();

      if (result.status) { // Changed from result.success to result.status
        // ✅ Map expensevoucher_items to items for consistency in frontend
        const vouchers = (Array.isArray(result.data) ? result.data : [result.data]).map(voucher => ({
          ...voucher,
          items: voucher.expensevoucher_items || []
        }));
        setExpenseVouchers(vouchers);
      } else {
        setExpenseVouchers([]);
      }
    } catch (error) {
      console.error("Error fetching expense vouchers:", error);
      setExpenseVouchers([]);
    } finally {
      setLoading(false);
      setVouchersLoaded(true);
    }
  };

  useEffect(() => {
    if (hasPermission && expensePermissions.can_view) {
      fetchAccounts();
      fetchVendors();
      fetchExpenseVouchers();
    }
  }, [hasPermission, expensePermissions.can_view]);

  // Auto receipt number logic
  useEffect(() => {
    if (expenseVouchers.length > 0) {
      const paymentNumbers = expenseVouchers.map(voucher => voucher.auto_receipt_no);
      const numbers = paymentNumbers
        .map(p => {
          const match = p?.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        })
        .filter(n => !isNaN(n));
      const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
      setNextSequence(maxNumber + 1);
      setAutoReceiptNo(`AUTO-${String(maxNumber + 1).padStart(3, '0')}`);
    } else {
      setNextSequence(1);
      setAutoReceiptNo("AUTO-001");
    }
  }, [expenseVouchers]);

  useEffect(() => {
    if (showCreateModal) {
      if (expenseVouchers.length > 0) {
        const paymentNumbers = expenseVouchers.map(voucher => voucher.auto_receipt_no);
        const numbers = paymentNumbers
          .map(p => {
            const match = p?.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          })
          .filter(n => !isNaN(n));
        const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
        setAutoReceiptNo(`AUTO-${String(maxNumber + 1).padStart(3, '0')}`);
      } else {
        setAutoReceiptNo("AUTO-001");
      }
      setSelectedPaidFrom(accounts.length > 0 ? accounts[0].id : "");
    }
  }, [showCreateModal, expenseVouchers, accounts]);

  const getStatusBadge = (status) => {
    return (
      <span className="status-badge status-badge-paid">Paid</span>
    );
  };

  const clearFilters = () => {
    setFilters({
      accountName: "",
      paymentNo: "",
      manualReceiptNo: "",
      paidFrom: "",
    });
  };

  // Calculate total amount safely
  const calculateTotal = () => {
    const total = tableRows.reduce(
      (sum, row) => sum + (parseFloat(row.amount) || 0),
      0
    );
    return total.toFixed(2);
  };

  // Add new row dynamically
  const handleAddRow = () => {
    const newRow = {
      id: Date.now(), // Unique ID (better than length+1)
      account: "",
      amount: 0.0,
      narration: "",
    };
    setTableRows((prevRows) => [...prevRows, newRow]);
  };

  const handleDeleteRow = (id) => {
    if (tableRows.length > 1) {
      setTableRows(tableRows.filter(row => row.id !== id));
    }
  };

  const handleRowChange = (id, field, value) => {
    setTableRows(tableRows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handlePaidToChange = (e) => {
    const selectedAccount = e.target.value;
    setPaidTo(selectedAccount);

    if (selectedAccount) {
      const newRow = {
        id: tableRows.length + 1,
        account: selectedAccount,
        amount: "0.00",
        narration: "",
      };
      setTableRows([...tableRows, newRow]);
      setPaidTo("");
    }
  };

  const handlePaidFromChange = (e) => {
    setSelectedPaidFrom(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.target;

    const items = tableRows.map(row => {
      const vendor = vendors.find(v => v.name_english === row.account);
      return {
        account_name: row.account,
        vendor_id: vendor ? vendor.id : null,
        amount: parseFloat(row.amount || 0),
        narration: row.narration || "",
      };
    });

    const payload = {
      company_id: companyId,
      auto_receipt_no: autoReceiptNo,
      manual_receipt_no: manualReceiptNo,
      voucher_date: form.voucherDate.value,
      paid_from_account_id: parseInt(selectedPaidFrom),
      narration: narration,
      items: items,
    };

    try {
      const response = await fetch(`${BaseUrl}expensevoucher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status) { // Changed from result.success to result.status
        toast.success("Voucher Created Successfully!");
        form.reset();
        setTableRows([{ id: 1, account: "", amount: "0.00", narration: "" }]);
        setNarration("");
        setManualReceiptNo("");
        setSelectedPaidFrom(accounts.length > 0 ? accounts[0].id : "");
        isCleaningUpRef.current = false; // Reset flag before closing
        setShowCreateModal(false);
        modalKeyRef.current.create += 1;
        fetchExpenseVouchers();
      } else {
        toast.error("Error creating voucher: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating voucher:", error);
      toast.error("Error creating voucher. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Close handlers for modals
  const handleCloseCreateModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowCreateModal(false);
    modalKeyRef.current.create += 1;
  };
  
  const handleCreateModalExited = () => {
    setTableRows([{ id: 1, account: "", amount: "0.00", narration: "" }]);
    setNarration("");
    setManualReceiptNo("");
    setPaidTo("");
    isCleaningUpRef.current = false;
  };
  
  const handleCloseViewModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowViewModal(false);
    modalKeyRef.current.view += 1;
  };
  
  const handleViewModalExited = () => {
    setSelectedExpense(null);
    isCleaningUpRef.current = false;
  };
  
  const handleCloseEditModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowEditModal(false);
    modalKeyRef.current.edit += 1;
  };
  
  const handleEditModalExited = () => {
    setEditExpense(null);
    isCleaningUpRef.current = false;
  };
  
  const handleCloseDeleteModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowDeleteModal(false);
    modalKeyRef.current.delete += 1;
  };
  
  const handleDeleteModalExited = () => {
    setDeleteExpense(null);
    isCleaningUpRef.current = false;
  };

  const handleEdit = (expense) => {
    isCleaningUpRef.current = false;
    modalKeyRef.current.edit += 1;
    setEditExpense(expense);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.target;

    const payload = {
      company_id: companyId,
      auto_receipt_no: form.paymentNo.value,
      manual_receipt_no: form.manualReceiptNo.value,
      voucher_date: form.voucherDate.value,
      paid_from_account_id: parseInt(form.paidFrom.value),
      narration: form.narration.value,
    };

    try {
      const response = await fetch(`${BaseUrl}expensevoucher/${editExpense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status) { // Changed from result.success to result.status
        toast.success("Voucher Updated Successfully!");
        isCleaningUpRef.current = false; // Reset flag before closing
        setShowEditModal(false);
        modalKeyRef.current.edit += 1;
        fetchExpenseVouchers();
      } else {
        toast.error("Error updating voucher: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating voucher:", error);
      toast.error("Error updating voucher. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (expense) => {
    isCleaningUpRef.current = false;
    modalKeyRef.current.delete += 1;
    setDeleteExpense(expense);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteExpense) {
      setSubmitting(true);

      try {
        const response = await fetch(`${BaseUrl}expensevoucher/${deleteExpense.id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.status) { // Changed from result.success to result.status
          toast.success("Voucher Deleted Successfully!");
          isCleaningUpRef.current = false; // Reset flag before closing
          setShowDeleteModal(false);
          modalKeyRef.current.delete += 1;
          fetchExpenseVouchers();
        } else {
          toast.error("Error deleting voucher: " + (result.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error deleting voucher:", error);
        toast.error("Error deleting voucher. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredExpenses = expenseVouchers.filter((exp) => {
    const matchesAccount = !filters.accountName ||
      (exp.items && exp.items.some(item =>
        item.account_name?.toLowerCase().includes(filters.accountName.toLowerCase())
      ));
    const matchesPaymentNo = !filters.paymentNo ||
      (exp.auto_receipt_no?.toLowerCase().includes(filters.paymentNo.toLowerCase()));
    const matchesManualReceipt = !filters.manualReceiptNo ||
      (exp.manual_receipt_no?.toLowerCase().includes(filters.manualReceiptNo.toLowerCase()));
    const matchesPaidFrom = !filters.paidFrom ||
      exp.paid_from_account_id == filters.paidFrom;

    return matchesAccount && matchesPaymentNo && matchesManualReceipt && matchesPaidFrom;
  });

  const getPaidFromAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account
      ? `${account?.parent_account?.subgroup_name || ""} (${account?.sub_of_subgroup?.name || ""})`
      : "Unknown";
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name_english : "Unknown";
  };

  // If user doesn't have permission to view expenses, show access denied message
  if (!hasPermission || !expensePermissions.can_view) {
    return (
      <Container fluid className="expense-container py-4">
        <Card className="expense-table-card">
          <Card.Body className="text-center py-5">
            <h3 className="text-danger">Access Denied</h3>
            <p className="text-muted">You don't have permission to view the Expense module.</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="expense-container py-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Header Section */}
      <div className="mb-4">
        <h3 className="expense-title">
          <i className="fas fa-money-bill-wave me-2"></i>
          Expense Voucher Management
        </h3>
        <p className="expense-subtitle">Manage and track all expense vouchers</p>
      </div>

      <Row className="g-3 mb-4 align-items-center">
        <Col xs={12} md={6}>
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <Form.Control
              className="search-input"
              placeholder="Search by payment no, account name..."
              value={filters.paymentNo}
              onChange={(e) => setFilters({ ...filters, paymentNo: e.target.value })}
            />
          </div>
        </Col>
        <Col xs={12} md={6} className="d-flex justify-content-md-end justify-content-start gap-2">
          <Button
            className="d-flex align-items-center btn-export"
            onClick={() => {
              let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
              csvContent += "Payment No,Account,Paid From,Total Amount,Date\n";
              filteredExpenses.forEach(exp => {
                csvContent += `"${exp.auto_receipt_no}","${exp.items?.[0]?.account_name || ''}","${getPaidFromAccountName(exp.paid_from_account_id)}","${exp.total_amount}","${formatDate(exp.voucher_date)}"\n`;
              });
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "Expense-Vouchers.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <FaFile className="me-2" /> Export
          </Button>
          {expensePermissions.can_create && (
            <Button
              className="d-flex align-items-center btn-add-voucher"
              onClick={() => {
                isCleaningUpRef.current = false;
                modalKeyRef.current.create += 1;
                setShowCreateModal(true);
              }}
            >
              <FaPlus className="me-2" />
              Create Voucher
            </Button>
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
                Filter Expense Vouchers
              </h5>
              <Button variant="outline-secondary" size="sm" className="btn-clear-filters" onClick={clearFilters}>
                <FaTimes className="me-1" /> Clear All
              </Button>
            </div>
            <Row className="g-3">
              <Col md={3}>
                <Form.Label className="filter-label">Payment No</Form.Label>
                <Form.Control
                  className="filter-input"
                  type="text"
                  placeholder="Search by Payment No..."
                  value={filters.paymentNo}
                  onChange={(e) => setFilters({ ...filters, paymentNo: e.target.value })}
                />
              </Col>
              <Col md={3}>
                <Form.Label className="filter-label">Account</Form.Label>
                <Form.Control
                  className="filter-input"
                  type="text"
                  placeholder="Search by Account..."
                  value={filters.accountName}
                  onChange={(e) => setFilters({ ...filters, accountName: e.target.value })}
                />
              </Col>
              <Col md={3}>
                <Form.Label className="filter-label">Paid From</Form.Label>
                <Form.Select
                  className="filter-select"
                  value={filters.paidFrom}
                  onChange={(e) => setFilters({ ...filters, paidFrom: e.target.value })}
                >
                  <option value="">All Accounts</option>
                  {accounts.map(account => (
                    <option key={`filter-${account.id}`} value={account.id}>
                      {account?.parent_account?.subgroup_name || 'N/A'} ({account?.sub_of_subgroup?.name || 'N/A'})
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="filter-label">Manual Receipt No</Form.Label>
                <Form.Control
                  className="filter-input"
                  type="text"
                  placeholder="Search by Manual Receipt No..."
                  value={filters.manualReceiptNo}
                  onChange={(e) => setFilters({ ...filters, manualReceiptNo: e.target.value })}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Table */}
      <Card className="expense-table-card border-0 shadow-lg">
        <Card.Body style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <Table responsive className="expense-table align-middle" style={{ fontSize: 16 }}>
              <thead className="table-header">
                <tr>
                  <th className="py-3">DATE</th>
                  <th className="py-3">AUTO RECEIPT NO</th>
                  <th className="py-3">MANUAL RECEIPT NO</th>
                  <th className="py-3">PAID FROM</th>
                  <th className="py-3">ACCOUNTS</th>
                  <th className="py-3">TOTAL AMOUNT</th>
                  <th className="py-3">STATUS</th>
                  <th className="py-3">NARRATION</th>
                  <th className="py-3 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading && !vouchersLoaded ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      <Spinner animation="border" style={{ color: "#505ece" }} />
                    </td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div>
                        <FaFile style={{ fontSize: "3rem", color: "#adb5bd", marginBottom: "1rem" }} />
                        <p className="text-muted mb-0">No expense vouchers found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp, idx) => (
                    <tr key={exp.id || idx}>
                      <td>{formatDate(exp.voucher_date)}</td>
                      <td><strong>{exp.auto_receipt_no}</strong></td>
                      <td>{exp.manual_receipt_no || "-"}</td>
                      <td>{getPaidFromAccountName(exp.paid_from_account_id)}</td>
                      <td>
                        {exp.items?.map((item, index) => (
                          <div key={index}>
                            {item.account_name || getVendorName(item.vendor_id)}: {item.amount}
                          </div>
                        ))}
                      </td>
                      <td className="fw-bold text-danger">₹{Number(exp.total_amount || 0).toLocaleString("en-IN")}</td>
                      <td>{getStatusBadge("paid")}</td>
                      <td>{exp.narration || "-"}</td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          {expensePermissions.can_view && (
                            <Button size="sm" className="btn-action btn-view" onClick={() => {
                              isCleaningUpRef.current = false;
                              modalKeyRef.current.view += 1;
                              setSelectedExpense(exp);
                              setShowViewModal(true);
                            }} title="View">
                              <FaEye size={14} />
                            </Button>
                          )}
                          {expensePermissions.can_update && (
                            <Button size="sm" className="btn-action btn-edit" onClick={() => handleEdit(exp)} title="Edit">
                              <FaEdit size={14} />
                            </Button>
                          )}
                          {expensePermissions.can_delete && (
                            <Button size="sm" className="btn-action btn-delete" onClick={() => handleDelete(exp)} title="Delete">
                              <FaTrash size={14} />
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
        </Card.Body>
      </Card>


      {/* Create Voucher Modal */}
      {expensePermissions.can_create && (
        <Modal 
          key={modalKeyRef.current.create}
          show={showCreateModal} 
          onHide={handleCloseCreateModal}
          onExited={handleCreateModalExited}
          centered 
          size="lg"
          className="expense-modal"
        >
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>Create Voucher</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Auto Receipt No</label>
                  <input type="text" className="form-control" value={autoReceiptNo} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Manual Receipt No</label>
                  <input
                    type="text"
                    className="form-control"
                    value={manualReceiptNo}
                    onChange={(e) => setManualReceiptNo(e.target.value)}
                    placeholder="Enter manual receipt number"
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Voucher Date</label>
                  <input type="date" className="form-control" name="voucherDate" defaultValue={new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Paid From</label>
                  <select className="form-select" value={selectedPaidFrom} onChange={handlePaidFromChange} required>
                    <option value="">Select Account</option>
                    {accounts.map((account) => (
                      <option key={`paid-from-${account.id}`} value={account.id}>
                        {account?.sub_of_subgroup?.name || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-12">
                  <label className="form-label fw-semibold">Paid To</label>
                  <select className="form-select" value={paidTo} onChange={handlePaidToChange} disabled={loading}>
                    <option value="">{loading ? "Loading..." : "Select Account or Vendor"}</option>
                    <optgroup label="Accounts">
                      {accounts.length > 0 ? (
                        accounts.map((account) => (
                          <option key={`acc-${account.id}`} value={account.parent_account.subgroup_name}>
                            {account?.sub_of_subgroup?.name || 'N/A'}
                          </option>
                        ))
                      ) : accountsLoaded ? (
                        <option disabled>No accounts found</option>
                      ) : null}
                    </optgroup>
                    <optgroup label="Vendors">
                      {vendors.length > 0 ? (
                        vendors.map((vendor) => (
                          <option key={`vend-${vendor.id}`} value={vendor.name_english}>
                            {vendor.name_english} ({vendor.company_name})
                          </option>
                        ))
                      ) : vendorsLoaded ? (
                        <option disabled>No vendors found</option>
                      ) : null}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="mb-3">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Amount</th>
                      <th>Narration</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={row.account}
                            onChange={(e) => handleRowChange(row.id, 'account', e.target.value)}
                            list="account-options"
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={row.amount}
                            onChange={(e) => handleRowChange(row.id, 'amount', e.target.value)}
                            min="0"
                            step="0.01"
                            required
                          />
                        </td>

                        <td>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Narration for this item"
                            value={row.narration}
                            onChange={(e) => handleRowChange(row.id, 'narration', e.target.value)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteRow(row.id)}
                            disabled={tableRows.length <= 1}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2" className="text-end fw-bold">Total: {calculateTotal()}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>

                <datalist id="account-options">
                  {accounts.map((account, idx) => (
                    <option key={`acc-datalist-${idx}`} value={account.account_name} />
                  ))}
                  {vendors.map((vendor, idx) => (
                    <option key={`vend-datalist-${idx}`} value={vendor.name_english} />
                  ))}
                </datalist>
              </div>

              <div className="mb-3">
                <button type="button" className="btn btn-add-row btn-sm" onClick={handleAddRow}>+ Add Row</button>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Voucher Narration</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="Enter narration for this voucher..."
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Button type="button" variant="secondary" className="btn-modal-cancel" onClick={handleCloseCreateModal}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-modal-save" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      )}

      {/* View Modal */}
      {expensePermissions.can_view && (
        <Modal 
          key={modalKeyRef.current.view}
          show={showViewModal} 
          onHide={handleCloseViewModal}
          onExited={handleViewModalExited}
          size="lg"
          className="expense-modal"
        >
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>Voucher Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom">
            {selectedExpense && (
              <div>
                <table className="table table-bordered">
                  <tbody>
                    <tr><td><strong>Date</strong></td><td>{formatDate(selectedExpense.voucher_date)}</td></tr>
                    <tr><td><strong>Auto Receipt No</strong></td><td>{selectedExpense.auto_receipt_no}</td></tr>
                    <tr><td><strong>Manual Receipt No</strong></td><td>{selectedExpense.manual_receipt_no || "-"}</td></tr>
                    <tr><td><strong>Paid From</strong></td><td>{getPaidFromAccountName(selectedExpense.paid_from_account_id)}</td></tr>
                    <tr><td><strong>Total Amount</strong></td><td>{selectedExpense.total_amount}</td></tr>
                    <tr><td><strong>Narration</strong></td><td>{selectedExpense.narration}</td></tr>
                  </tbody>
                </table>

                <h6 className="mt-4 mb-3">Account Details</h6>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Vendor</th>
                      <th>Amount</th>
                      <th>Narration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedExpense.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.account_name || "-"}</td>
                        <td>{item.vendor_id ? getVendorName(item.vendor_id) : "-"}</td>
                        <td>{item.amount}</td>
                        <td>{item.narration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button variant="secondary" className="btn-modal-cancel" onClick={handleCloseViewModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Edit Modal */}
      {expensePermissions.can_update && (
        <Modal 
          key={modalKeyRef.current.edit}
          show={showEditModal} 
          onHide={handleCloseEditModal}
          onExited={handleEditModalExited}
          centered
          className="expense-modal"
        >
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>Edit Voucher</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom">
            {editExpense && (
              <form onSubmit={handleEditSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Auto Receipt No</label>
                  <input type="text" className="form-control" name="paymentNo" defaultValue={editExpense.auto_receipt_no} readOnly />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Manual Receipt No</label>
                  <input type="text" className="form-control" name="manualReceiptNo" defaultValue={editExpense.manual_receipt_no || ''} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Voucher Date</label>
                  <input type="date" className="form-control" name="voucherDate" defaultValue={editExpense.voucher_date.split('T')[0]} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Paid From</label>
                  <select className="form-select" name="paidFrom" defaultValue={editExpense.paid_from_account_id}>
                    {accounts.map(account => (
                      <option key={`edit-${account.id}`} value={account.id}>
                        {account?.parent_account?.subgroup_name || 'N/A'} ({account?.sub_of_subgroup?.name || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Narration</label>
                  <textarea className="form-control" rows="3" defaultValue={editExpense.narration} name="narration"></textarea>
                </div>
                <div className="d-flex justify-content-end gap-3 mt-4">
                  <Button type="button" variant="secondary" className="btn-modal-cancel" onClick={handleCloseEditModal}>
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-modal-save" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}
          </Modal.Body>
        </Modal>
      )}

      {/* Delete Modal */}
      {expensePermissions.can_delete && (
        <Modal 
          key={modalKeyRef.current.delete}
          show={showDeleteModal} 
          onHide={handleCloseDeleteModal}
          onExited={handleDeleteModalExited}
          centered
          className="expense-modal"
        >
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>Delete Voucher</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body-custom text-center py-4">
            <div className="mx-auto mb-3" style={{ width: 70, height: 70, background: "#FFF5F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaTrash size={32} color="#F04438" />
            </div>
            <h4 className="fw-bold mb-2">Delete Voucher</h4>
            <p className="mb-4" style={{ color: "#555" }}>Are you sure you want to delete this voucher? This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button variant="secondary" className="btn-modal-cancel" onClick={handleCloseDeleteModal}>
              Cancel
            </Button>
            <Button className="btn-modal-delete" onClick={confirmDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default Expense;