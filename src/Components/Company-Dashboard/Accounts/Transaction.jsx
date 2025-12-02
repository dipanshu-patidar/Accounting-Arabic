import React, { useState, useEffect , useContext } from 'react';
import {
  Button,
  Form,
  Modal,
  Row,
  Col,
  Table,
  Card,
  Alert,
  Spinner,
  InputGroup
} from 'react-bootstrap';
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaFileImport, FaFileExport, FaDownload, FaBook, FaSearch
} from 'react-icons/fa';
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { CurrencyContext } from '../../../hooks/CurrencyContext';

const Transaction = () => {
  const navigate = useNavigate();
  const CompanyId = GetCompanyId();

  console.log("Current Company ID (from GetCompanyId):", CompanyId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterVoucherType, setFilterVoucherType] = useState('');
  const [filterVoucherNo, setFilterVoucherNo] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterFromTo, setFilterFromTo] = useState('');

  const [transactions, setTransactions] = useState([]);

  // ✅ State for real customer & vendor data
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerError, setCustomerError] = useState(null);
   const { convertPrice, symbol, currency } = useContext(CurrencyContext);

  // ✅ New state for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // ✅ MOVED UP HERE - Initialize fromToType before any useEffect hooks
  const [fromToType, setFromToType] = useState('customer');

  const accountTypes = [
    "Cash-in-hand",
    "Bank A/Cs",
    "Sundry Debtors",
    "Sundry Creditors",
    "Purchases A/C",
    "Purchases Return",
    "Sales A/C",
    "Sales Return",
    "Capital A/C",
    "Direct Expenses",
    "Indirect Expenses",
    "Current Assets",
    "Current Liabilities",
    "Misc. Expenses",
    "Misc. Income",
    "Loans (Liability)",
    "Loans & Advances",
    "Fixed Assets",
    "Investments",
    "Bank OD A/C",
    "Deposits (Assets)",
    "Provisions"
  ];

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const voucherTypes = [
    "Receipt",
    "Payment",
    "Expense",
    "Contra",
    "Journal",
    "Credit Note",
    "Debit Note",
    "Opening Balance"
  ];

  const emptyForm = {
    transactionId: '',
    date: '',
    balanceType: 'Receive',
    voucherType: '',
    amount: '',
    fromTo: '',
    accountType: '',
    voucherNo: '',
    note: ''
  };

  const [form, setForm] = useState({ ...emptyForm });
  const [modalError, setModalError] = useState(null);
  const [saving, setSaving] = useState(false);

  const customBtn = {
    backgroundColor: '#27b2b6',
    border: 'none',
    borderRadius: '50px',
    padding: '6px 16px',
    color: '#fff'
  };

  const fileInputRef = React.useRef();

  // ✅ Fetch customers & vendors from API
  const fetchCustomersAndVendors = async () => {
    if (!CompanyId) {
      setCustomerError('Company ID not found.');
      setLoadingCustomers(false);
      return;
    }

    try {
      setLoadingCustomers(true);

      // ✅ Fetch customers
      const customerResponse = await axiosInstance.get(`/vendorCustomer/company/${CompanyId}?type=customer`);
      // ✅ Fetch vendors — with CORRECT spelling: "vendor", NOT "vender"
      const vendorResponse = await axiosInstance.get(`/vendorCustomer/company/${CompanyId}?type=vender`);

      console.log("Customers API Response:", customerResponse.data);
      console.log("Vendors API Response:", vendorResponse.data);

      const custs = customerResponse.data.success && Array.isArray(customerResponse.data.data)
        ? customerResponse.data.data
        : [];

      const vends = vendorResponse.data.success && Array.isArray(vendorResponse.data.data)
        ? vendorResponse.data.data
        : [];

      setCustomers(custs);
      setVendors(vends);
      setCustomerError(null);
    } catch (err) {
      console.error('Customer/Vendor Fetch Error:', err);
      setCustomerError(err.response?.data?.message || 'Failed to load customer/vendor data');
      setCustomers([]);
      setVendors([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // ✅ Fetch transactions
  const refetchTransactions = async () => {
    if (!CompanyId) {
      setError('Company ID not found. Please login again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/transactions/company/${CompanyId}`);

      if (response.data.success) {
        let rawData = response.data.data;
        let dataArray = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);

        const serverFilteredData = dataArray.filter(txn =>
          String(txn.company_id) === String(CompanyId)
        );

        const mappedTransactions = serverFilteredData.map(txn => {
          let fromToName = '';
          if (txn.from_entity && txn.from_entity.name_english) {
            fromToName = txn.from_entity.name_english;
          } else {
            fromToName = txn.from_type === 'Customer'
              ? `Customer ID: ${txn.from_id || 'N/A'}`
              : `Vendor ID: ${txn.from_id || 'N/A'}`;
          }

          return {
            transactionId: txn.transaction_id,
            date: txn.date,
            balanceType: txn.balance_type,
            voucherType: txn.voucher_type,
            amount: txn.amount ? parseFloat(txn.amount) : 0,
            fromTo: fromToName,
            accountType: txn.account_type || '',
            voucherNo: txn.voucher_no,
            note: txn.note,
            id: txn.id,
            fromType: txn.from_type,
            fromId: txn.from_id,
            companyId: txn.company_id,
            fromEntity: txn.from_entity
          };
        });

        setTransactions(mappedTransactions);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to load transactions');
      }
    } catch (err) {
      console.error('Refetch Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to refresh transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (CompanyId) {
      refetchTransactions();
      fetchCustomersAndVendors();
    }
  }, [CompanyId]);

  // Handle search for customers/vendors
  useEffect(() => {
    if (searchTerm.trim() === '') {
      // If search term is empty, show all customers or vendors
      const selectedList = fromToType === 'customer' ? customers : vendors;
      setSearchResults(selectedList);
      return;
    }

    const selectedList = fromToType === 'customer' ? customers : vendors;
    console.log("Selected list for search:", selectedList);
    console.log("Search term:", searchTerm);
    
    // ✅ Fixed search logic to handle different possible name fields and phone numbers
    const results = selectedList.filter(item => {
      // Check various possible name fields
      const nameFields = [
        item.name_english,
        item.name,
        item.company_name,
        item.customer_name,
        item.vendor_name,
        item.display_name
      ];
      
      // Find the first non-empty name field
      const itemName = nameFields.find(name => name && name.trim() !== '') || '';
      
      // Check phone number fields
      const phoneFields = [
        item.phone,
        item.phone_number,
        item.mobile,
        item.contact_number,
        item.telephone
      ];
      
      // Find the first non-empty phone field
      const itemPhone = phoneFields.find(phone => phone && phone.trim() !== '') || '';
      
      // Return true if search term matches either name or phone
      return itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
             itemPhone.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    console.log("Search results:", results);
    setSearchResults(results);
  }, [searchTerm, fromToType, customers, vendors]);

  // ✅ Fixed helper to display name - check multiple possible fields
  const getDisplayName = (item) => {
    // Check various possible name fields in order of preference
    const nameFields = [
      item.name_english,
      item.name,
      item.company_name,
      item.customer_name,
      item.vendor_name,
      item.display_name
    ];
    
    // Return the first non-empty name field
    const name = nameFields.find(name => name && name.trim() !== '');
    
    return name || `ID: ${item.id}`;
  };

  // ✅ New helper to display phone number - check multiple possible fields
  const getDisplayPhone = (item) => {
    // Check various possible phone fields in order of preference
    const phoneFields = [
      item.phone,
      item.phone_number,
      item.mobile,
      item.contact_number,
      item.telephone
    ];
    
    // Return the first non-empty phone field
    const phone = phoneFields.find(phone => phone && phone.trim() !== '');
    
    return phone || '';
  };

  // Handle selecting a customer/vendor from search results
  const handleSelectFromSearch = (item) => {
    const displayName = getDisplayName(item);
    setForm({ ...form, fromTo: displayName });
    setSearchTerm(displayName);
    setShowSearchResults(false);
  };

  // ... (handleImport, handleExport, handleDownloadBlank remain unchanged)

  const handleSave = async () => {
    setSaving(true);
    setModalError(null);

    try {
      const selectedList = fromToType === 'customer' ? customers : vendors;
      // ✅ Fixed: Use getDisplayName to find the selected item
      const selectedItem = selectedList.find(item => getDisplayName(item) === form.fromTo);

      if (!selectedItem) {
        throw new Error(`Please select a valid ${fromToType === 'customer' ? 'Customer' : 'Vendor'}`);
      }

      const payload = {
        date: form.date,
        company_id: CompanyId,
        balance_type: form.balanceType,
        voucher_type: form.voucherType,
        voucher_no: form.voucherNo,
        amount: parseFloat(form.amount),
        from_type: fromToType === 'customer' ? 'Customer' : 'Vendor', // API expects capitalized
        from_id: selectedItem.id,
        account_type: form.accountType,
        note: form.note
      };

      const response = await axiosInstance.post('/transactions', payload);

      if (response.data.success) {
        await refetchTransactions();
        toast.success("Transaction saved successfully!");
        setShowModal(false);
        setForm({ ...emptyForm });
        setFromToType('customer');
        setSearchTerm('');
      } else {
        throw new Error(response.data.message || 'Failed to save transaction');
      }
    } catch (err) {
      console.error('Save Error:', err);
      setModalError(err.response?.data?.message || err.message || 'Failed to save transaction. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (idx) => {
    const txn = transactions[idx];
    setSelectedTransaction(idx);
    setForm({
      transactionId: txn.transactionId,
      date: txn.date,
      balanceType: txn.balanceType,
      voucherType: txn.voucherType,
      amount: txn.amount.toString(),
      fromTo: txn.fromTo,
      accountType: txn.accountType,
      voucherNo: txn.voucherNo,
      note: txn.note
    });

    // Map 'Customer' → 'customer', 'Vendor' → 'vendor'
    const typeLower = txn.fromType?.toLowerCase() === 'vendor' ? 'vendor' : 'customer';
    setFromToType(typeLower);
    setSearchTerm(txn.fromTo);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    setSaving(true);
    setModalError(null);

    try {
      const selectedList = fromToType === 'customer' ? customers : vendors;
      // ✅ Fixed: Use getDisplayName to find the selected item
      const selectedItem = selectedList.find(item => getDisplayName(item) === form.fromTo);

      if (!selectedItem) {
        throw new Error(`Please select a valid ${fromToType === 'customer' ? 'Customer' : 'Vendor'}`);
      }

      const txnId = transactions[selectedTransaction]?.id;
      if (!txnId) throw new Error('Transaction ID not found');

      const payload = {
        date: form.date,
        company_id: CompanyId,
        balance_type: form.balanceType,
        voucher_type: form.voucherType,
        voucher_no: form.voucherNo,
        amount: parseFloat(form.amount),
        from_type: fromToType === 'customer' ? 'Customer' : 'Vendor',
        from_id: selectedItem.id,
        account_type: form.accountType,
        note: form.note
      };

      const response = await axiosInstance.put(`/transactions/${txnId}`, payload);

      if (response.data.success) {
        toast.success("Transaction updated successfully!");
        await refetchTransactions();
        setShowModal(false);
        setForm({ ...emptyForm });
        setFromToType('customer');
        setSearchTerm('');
        setSelectedTransaction(null);
      } else {
        throw new Error(response.data.message || 'Failed to update transaction');
      }
    } catch (err) {
      console.error('Update Error:', err);
      setModalError(err.response?.data?.message || err.message || 'Failed to update transaction. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleView = (idx) => {
    setSelectedTransaction(idx);
    setShowViewModal(true);
  };

  const handleDelete = async (idx) => {
    const txnId = transactions[idx]?.id;
    if (!txnId) {
      toast.error("Transaction ID not found.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const response = await axiosInstance.delete(`/transactions/${txnId}`);
      if (response.data.success) {
        toast.success("Transaction deleted successfully!");
        await refetchTransactions();
      } else {
        throw new Error(response.data.message || 'Failed to delete transaction');
      }
    } catch (err) {
      console.error('Delete Error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete transaction. Please try again.');
    }
  };

  const filteredTransactions = transactions.filter((txn) =>
    (filterVoucherType === '' || txn.voucherType === filterVoucherType) &&
    (filterVoucherNo === '' || txn.voucherNo.toLowerCase().includes(filterVoucherNo.toLowerCase())) &&
    (filterDate === '' || txn.date === filterDate) &&
    (filterFromTo === '' || txn.fromTo.toLowerCase().includes(filterFromTo.toLowerCase()))
  );

  // ======================
  // Remaining UI Code (Unchanged except minor fixes)
  // ======================

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const imported = data.map((row) => ({
        date: row["Date"] || "",
        balanceType: row["Balance Type"] || "",
        voucherType: row["Voucher Type"] || "",
        amount: row["Amount"] || "",
        fromTo: row["From/To"] || "",
        accountType: row["Account Type"] || "",
        voucherNo: row["Voucher No"] || "",
        note: row["Note"] || ""
      }));
      setTransactions((prev) => [...prev, ...imported]);
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const data = transactions
      .filter((txn) =>
        (filterVoucherType === '' || txn.voucherType === filterVoucherType) &&
        (filterVoucherNo === '' || txn.voucherNo.toLowerCase().includes(filterVoucherNo.toLowerCase())) &&
        (filterDate === '' || txn.date === filterDate) &&
        (filterFromTo === '' || txn.fromTo.toLowerCase().includes(filterFromTo.toLowerCase()))
      )
      .map((txn) => ({
        Date: txn.date,
        "Balance Type": txn.balanceType,
        "Voucher Type": txn.voucherType,
        Amount: txn.amount,
        "From/To": txn.fromTo,
        "Account Type": txn.accountType,
        "Voucher No": txn.voucherNo,
        Note: txn.note
      }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "transactions.xlsx");
  };

  const handleDownloadBlank = () => {
    const dataToExport = transactions
      .filter((txn) =>
        (filterVoucherType === '' || txn.voucherType === filterVoucherType) &&
        (filterVoucherNo === '' || txn.voucherNo.toLowerCase().includes(filterVoucherNo.toLowerCase())) &&
        (filterDate === '' || txn.date === filterDate) &&
        (filterFromTo === '' || txn.fromTo.toLowerCase().includes(filterFromTo.toLowerCase()))
      );

    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(18);
    doc.text("Transaction Report", 14, 15);
    const today = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${today}`, 14, 22);

    const columns = [
      "Date",
      "Transaction ID",
      "Balance Type",
      "Voucher Type",
      "Voucher No",
      "Amount",
      "From/To",
      "Account Type",
      "Note"
    ];

    const rows = dataToExport.map(txn => [
      txn.date || "-",
      txn.transactionId || "-",
      txn.balanceType || "-",
      txn.voucherType || "-",
      txn.voucherNo || "-",
      typeof txn.amount === 'number' ? txn.amount.toFixed(2) : txn.amount || "0.00",
      txn.fromTo || "-",
      txn.accountType || "-",
      txn.note || "-"
    ]);

    if (rows.length === 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("No transactions available.", 14, 40);
    } else {
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 30,
        theme: 'grid',
        margin: { top: 30, left: 10, right: 10 },
        headStyles: {
          fillColor: [39, 178, 182],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: 'left',
          valign: 'middle'
        },
        didDrawPage: (data) => {
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(
            `Page ${doc.getCurrentPageInfo().pageNumber} of ${Math.ceil(rows.length / 20)}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        }
      });
    }
    doc.save("transactions_report.pdf");
  };

  return (
    <div className="p-3">
      <ToastContainer position="top-right" autoClose={3000} />

      <Row className="mb-3 align-items-center">
        <Col xs={12} md="auto">
          <h4>Transactions</h4>
        </Col>
        <Col xs={12} md="auto" className="ms-auto">
          <div className="d-flex flex-wrap justify-content-end align-items-center gap-2" style={{ minWidth: "150px" }}>
            <Button variant="success" size="sm" className="d-flex align-items-center gap-1" onClick={() => fileInputRef.current.click()} title="Import Excel">
              <FaFileImport /> Import
            </Button>
            <Button variant="primary" size="sm" className="d-flex align-items-center gap-1" onClick={handleExport} title="Export Excel">
              <FaFileExport /> Export
            </Button>
            <Button variant="warning" size="sm" className="d-flex align-items-center gap-1" onClick={handleDownloadBlank} title="Download PDF Report">
              <FaDownload /> Download PDF
            </Button>
            <Button size="sm" style={customBtn} onClick={() => {
              setSelectedTransaction(null);
              setForm({ ...emptyForm });
              setFromToType("customer");
              setSearchTerm('');
              setShowModal(true);
            }}>
              Add Transaction
            </Button>
            <Button variant="info" size="sm" style={customBtn} onClick={() => navigate("/company/ledger")} title="Go to Ledger">
              Go to Ledger
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Filter by Voucher Type</Form.Label>
            <Form.Select value={filterVoucherType} onChange={(e) => setFilterVoucherType(e.target.value)}>
              <option value="">All</option>
              {voucherTypes.map((type, i) => (
                <option key={i} value={type}>{type}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Filter by Voucher No</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Voucher No"
              value={filterVoucherNo}
              onChange={(e) => setFilterVoucherNo(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Filter by Date</Form.Label>
            <Form.Control
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Filter by From/To</Form.Label>
            <Form.Control
              type="text"
              placeholder="Customer or Vendor"
              value={filterFromTo}
              onChange={(e) => setFilterFromTo(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading transactions...</p>
        </div>
      )}

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      {!loading && !error && (
        <Table bordered hover responsive>
          <thead>
            <tr className='fw-bold text-nowrap text-dark'>
              <th>Date</th>
              <th>Transaction ID</th>
              <th>Balance Type</th>
              <th>Voucher Type</th>
              <th>Voucher No</th>
              <th>Amount</th>
              <th>From/To</th>
              <th>Account Type</th>
              <th>Note</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((txn, idx) => (
                <tr key={txn.id || idx}>
                  <td>{txn.date}</td>
                  <td>{txn.transactionId}</td>
                  <td>{txn.balanceType}</td>
                  <td>{txn.voucherType}</td>
                  <td>{txn.voucherNo}</td>
                  <td>{symbol}{convertPrice(txn.amount)}</td>
                  <td>{txn.fromTo}</td>
                  <td>{txn.accountType}</td>
                  <td>{txn.note}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="btn btn-link text-primary p-0" onClick={() => handleView(idx)}><FaEye /></button>
                      <button className="btn btn-link text-success p-0" onClick={() => handleEdit(idx)}><FaEdit /></button>
                      <button className="btn btn-link text-danger p-0" onClick={() => handleDelete(idx)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="10" className="text-center">No transactions found.</td></tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedTransaction !== null ? 'Edit' : 'Add'} Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger" onClose={() => setModalError(null)} dismissible>{modalError}</Alert>}
          {loadingCustomers && <div className="text-center mb-3"><Spinner animation="border" size="sm" /> Loading data...</div>}
          {customerError && <Alert variant="warning" onClose={() => setCustomerError(null)} dismissible>{customerError}</Alert>}

          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Transaction ID</Form.Label>
              <Form.Control type="text" value={form.transactionId || 'Auto-generated'} readOnly />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Balance Type</Form.Label>
              <Form.Select value={form.balanceType} onChange={(e) => setForm({ ...form, balanceType: e.target.value })} required>
                <option value="Receive">Receive</option>
                <option value="Make Payment">Make Payment</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Voucher Type</Form.Label>
              <Form.Select value={form.voucherType} onChange={(e) => setForm({ ...form, voucherType: e.target.value })} required>
                <option value="">Select Voucher Type</option>
                {voucherTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Voucher No</Form.Label>
              <Form.Control type="text" value={form.voucherNo} onChange={(e) => setForm({ ...form, voucherNo: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>From / To</Form.Label>
              <Row>
                <Col md={4}>
                  <Form.Select
                    value={fromToType}
                    onChange={(e) => {
                      setFromToType(e.target.value);
                      setForm({ ...form, fromTo: '' });
                      setSearchTerm('');
                    }}
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                  </Form.Select>
                </Col>
                <Col>
                  <div className="position-relative">
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder={`Search ${fromToType === 'customer' ? 'Customer' : 'Vendor'} by name or phone`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => {
                          setShowSearchResults(true);
                          // If search term is empty, show all customers/vendors
                          if (searchTerm.trim() === '') {
                            const selectedList = fromToType === 'customer' ? customers : vendors;
                            setSearchResults(selectedList);
                          }
                        }}
                        required
                      />
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                    </InputGroup>
                    
                    {showSearchResults && (
                      <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 z-index-1000" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {searchResults.length > 0 ? (
                          searchResults.map(item => (
                            <div 
                              key={item.id} 
                              className="p-2 hover:bg-light cursor-pointer"
                              onClick={() => handleSelectFromSearch(item)}
                            >
                              <div className="fw-bold">{getDisplayName(item)}</div>
                              {getDisplayPhone(item) && (
                                <div className="text-muted small">{getDisplayPhone(item)}</div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-muted">No {fromToType === 'customer' ? 'customers' : 'vendors'} found</div>
                        )}
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Account Type</Form.Label>
              <Form.Select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })} required>
                <option value="">Select Account Type</option>
                {accountTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Note</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
          <Button style={customBtn} onClick={selectedTransaction !== null ? handleUpdate : handleSave} disabled={saving || loadingCustomers}>
            {saving ? 'Saving...' : selectedTransaction !== null ? 'Update' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction !== null && (
            <>
              <p><strong>Date:</strong> {transactions[selectedTransaction].date}</p>
              <p><strong>Balance Type:</strong> {transactions[selectedTransaction].balanceType}</p>
              <p><strong>Voucher Type:</strong> {transactions[selectedTransaction].voucherType}</p>
              <p><strong>Voucher No:</strong> {transactions[selectedTransaction].voucherNo}</p>
              <p><strong>Amount:</strong> {transactions[selectedTransaction].amount}</p>
              <p><strong>From/To:</strong> {transactions[selectedTransaction].fromTo}</p>
              <p><strong>Account Type:</strong> {transactions[selectedTransaction].accountType}</p>
              <p><strong>Note:</strong> {transactions[selectedTransaction].note}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3">Page Info</h5>
          <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            <li>Manage all financial transactions with details like voucher type, account, and amount.</li>
            <li>Add new transactions using customizable voucher numbering.</li>
            <li>View transaction details including account type, name, and notes.</li>
            <li>Import transaction data from Excel for bulk entries.</li>
            <li>Export existing transaction records to Excel for reporting or backup.</li>
            <li>Filter transactions by voucher type, voucher number, date, and customer/vendor name.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Transaction;