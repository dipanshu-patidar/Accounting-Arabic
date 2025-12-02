import React, { useState, useEffect } from "react";
import { Tabs, Tab, Button, Form, Card } from "react-bootstrap";
import {
  FaFilePdf,
  FaFileExcel,
  FaPlusCircle,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import axiosInstance from "../../../Api/axiosInstance";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import GetCompanyId from "../../../Api/GetCompanyId";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Income = () => {
  const companyId = GetCompanyId();

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [editVoucher, setEditVoucher] = useState(null);
  const [deleteVoucher, setDeleteVoucher] = useState(null);
  const [activeTab, setActiveTab] = useState("direct");
  const [filters, setFilters] = useState({
    accountName: "",
    receiptNo: "",
    depositedTo: "",
  });

  const [tableRows, setTableRows] = useState([
    { id: 1, account: "", amount: "0.00", narration: "" },
  ]);
  const [receivedFromId, setReceivedFromId] = useState("");
  const [receivedFromSearchTerm, setReceivedFromSearchTerm] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [narration, setNarration] = useState("");
  const [showNarration, setShowNarration] = useState(true);
  const [autoReceiptNo, setAutoReceiptNo] = useState("");
  const [manualReceiptNo, setManualReceiptNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [incomeVouchers, setIncomeVouchers] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ NEW: State for accounts
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Generate auto receipt number
  const generateAutoReceiptNo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `REC-${year}${month}${day}-${random}`;
  };

  // Fetch customers by company ID from API
  const fetchCustomersByCompany = async () => {
    if (!companyId) return;
    
    try {
      setCustomersLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        `vendorCustomer/company/${companyId}?type=customer`
      );

      console.log("Customers API response:", response.data);

      if (response?.data?.success) {
        // Transform API response to match our component structure
        const transformedCustomers = response.data.data.map((apiCustomer) => {
          // Map API fields to component fields
          return {
            id: apiCustomer.id,
            name_english: apiCustomer.name_english,
            name_arabic: apiCustomer.name_arabic,
            company_name: apiCustomer.company_name,
            phone: apiCustomer.phone,
            email: apiCustomer.email,
            gstIn: apiCustomer.gstIn || "",
            account_balance: apiCustomer.account_balance?.toString() || "0.00",
            enable_gst: apiCustomer.enable_gst === true,
            account_type: apiCustomer.account_type || "Sundry Debtors",
            account_name: apiCustomer.account_name || "Accounts Receivable",
            balance_type: apiCustomer.balance_type || "Debit",
            creation_date: apiCustomer.creation_date,
            bank_account_number: apiCustomer.bank_account_number,
            bank_ifsc: apiCustomer.bank_ifsc,
            bank_name_branch: apiCustomer.bank_name_branch,
            country: apiCustomer.country,
            state: apiCustomer.state,
            pincode: apiCustomer.pincode,
            address: apiCustomer.address,
            state_code: apiCustomer.state_code,
            shipping_address: apiCustomer.shipping_address,
            credit_period_days: apiCustomer.credit_period_days,
            type: apiCustomer.type,
            google_location: apiCustomer.google_location,
            id_card_image: apiCustomer.id_card_image,
            any_file: apiCustomer.any_file,
          };
        });

        setCustomers(transformedCustomers);
        setFilteredCustomers(transformedCustomers); // Initialize filtered customers
        console.log("Transformed customers:", transformedCustomers);
      } else {
        console.warn("API response not successful:", response.data);
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err.message || "Failed to fetch customers");
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  // ✅ NEW: Fetch accounts by company ID from API
  const fetchAccountsByCompany = async () => {
    if (!companyId) return;
    
    try {
      setAccountsLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        `account/company/${companyId}`
      );

      console.log("Accounts API response:", response.data);

      if (response?.data?.success) {
        // Transform API response to match our component structure
        const transformedAccounts = response.data.data.map((apiAccount) => {
          // Map API fields to component fields
          return {
            id: apiAccount.id,
            account_number: apiAccount.account_number,
            ifsc_code: apiAccount.ifsc_code,
            bank_name_branch: apiAccount.bank_name_branch,
            accountBalance: apiAccount.accountBalance?.toString() || "0.00",
            parent_account: apiAccount.parent_account,
            sub_of_subgroup: apiAccount.sub_of_subgroup,
            // Create a display name that combines the subgroup name and bank name
            display_name: `${apiAccount.parent_account?.subgroup_name || ""} - ${apiAccount.bank_name_branch || ""}`
          };
        });

        setAccounts(transformedAccounts);
        console.log("Transformed accounts:", transformedAccounts);
      } else {
        console.warn("API response not successful:", response.data);
        setAccounts([]);
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError(err.message || "Failed to fetch accounts");
      setAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  };

  // Fetch income vouchers
  const fetchIncomeVouchers = async () => {
    if (!companyId) return;
    
    setFetching(true);
    try {
      console.log("Fetching income vouchers...");
      const response = await axiosInstance.get(
        `income-vouchers/company/${companyId}`
      );
      console.log("Income vouchers response:", response.data);
      if (response.data.success) {
        const transformedVouchers = response.data.data.map((voucher) => {
          const items = (voucher.entries || []).map((entry) => ({
            account: entry.income_account || "",
            amount: parseFloat(entry.amount).toFixed(2),
            narration: entry.row_narration || "",
          }));

          const dateObj = new Date(voucher.date);
          const formattedDate = dateObj
            .toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
            .replace(/ /g, " ");

          return {
            id: voucher.id,
            date: formattedDate,
            autoReceiptNo: voucher.auto_receipt_no,
            manualReceiptNo: voucher.manual_receipt_no,
            depositedTo: voucher.deposited_to, // this is an ID
            receivedFromId: voucher.received_from, // this is an ID
            items,
            narration: voucher.narration,
            totalAmount: voucher.total_amount,
            status:
              voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1),
          };
        });
        setIncomeVouchers(transformedVouchers);
      } else {
        setIncomeVouchers([]);
      }
    } catch (error) {
      console.error("Error fetching income vouchers:", error);
      setIncomeVouchers([]);
    } finally {
      setFetching(false);
    }
  };

  // ✅ NEW: Handle customer search
  const handleCustomerSearch = (searchTerm) => {
    setReceivedFromSearchTerm(searchTerm);
    
    if (!searchTerm.trim()) {
      // If search term is empty, show all customers
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer => {
      // Check name fields
      const nameFields = [
        customer.name_english,
        customer.name_arabic,
        customer.company_name,
        customer.account_name
      ];
      
      // Find the first non-empty name field
      const customerName = nameFields.find(name => name && name.trim() !== '') || '';
      
      // Check phone number fields
      const phoneFields = [
        customer.phone,
        customer.bank_account_number
      ];
      
      // Find the first non-empty phone field
      const customerPhone = phoneFields.find(phone => phone && phone.trim() !== '') || '';
      
      // Return true if search term matches either name or phone
      return customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
             customerPhone.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    setFilteredCustomers(filtered);
  };

  // ✅ NEW: Handle customer selection
  const handleCustomerSelect = (customer) => {
    const customerId = customer.id;
    setReceivedFromId(customerId);
    
    // Get display name
    const nameFields = [
      customer.name_english,
      customer.name_arabic,
      customer.company_name,
      customer.account_name
    ];
    
    const displayName = nameFields.find(name => name && name.trim() !== '') || `ID: ${customer.id}`;
    
    setReceivedFromSearchTerm(displayName);
    setShowCustomerDropdown(false);
    
    // Add a new row with the customer name as the account
    setTableRows([
      ...tableRows,
      {
        id: Date.now(),
        account: displayName,
        amount: "0.00",
        narration: "",
      },
    ]);
  };

  // ✅ NEW: Helper function to get display name
  const getCustomerDisplayName = (customer) => {
    const nameFields = [
      customer.name_english,
      customer.name_arabic,
      customer.company_name,
      customer.account_name
    ];
    
    return nameFields.find(name => name && name.trim() !== '') || `ID: ${customer.id}`;
  };

  // ✅ NEW: Helper function to get display phone
  const getCustomerDisplayPhone = (customer) => {
    const phoneFields = [
      customer.phone,
      customer.bank_account_number
    ];
    
    return phoneFields.find(phone => phone && phone.trim() !== '') || '';
  };

  // MAIN EFFECT: Initialize all data ONCE
  useEffect(() => {
    if (!companyId) return;

    console.log("Component mounted with companyId:", companyId);
    setAutoReceiptNo(generateAutoReceiptNo());
    fetchCustomersByCompany();
    fetchAccountsByCompany(); // ✅ NEW: Fetch accounts
    fetchIncomeVouchers();
  }, [companyId]);

  // Fetch customers when create modal is opened if not already loaded
  useEffect(() => {
    if (showCreateModal && companyId && customers.length === 0) {
      fetchCustomersByCompany();
    }
  }, [showCreateModal, companyId, customers.length]);

  // ✅ NEW: Fetch accounts when create modal is opened if not already loaded
  useEffect(() => {
    if (showCreateModal && companyId && accounts.length === 0) {
      fetchAccountsByCompany();
    }
  }, [showCreateModal, companyId, accounts.length]);

  // Reset form when Create modal closes
  useEffect(() => {
    if (!showCreateModal) {
      setAutoReceiptNo(generateAutoReceiptNo());
      setManualReceiptNo("");
      setTableRows([{ id: 1, account: "", amount: "0.00", narration: "" }]);
      setNarration("");
      setReceivedFromId("");
      setReceivedFromSearchTerm("");
      setLoading(false);
    }
  }, [showCreateModal]);

  useEffect(() => {
    if (!showViewModal) setSelectedVoucher(null);
  }, [showViewModal]);

  useEffect(() => {
    if (!showEditModal) setEditVoucher(null);
  }, [showEditModal]);

  useEffect(() => {
    if (!showDeleteModal) setDeleteVoucher(null);
  }, [showDeleteModal]);

  // ✅ NEW: Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCustomerDropdown && !event.target.closest('.customer-search-container')) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCustomerDropdown]);

  const getStatusBadge = (status) => {
    if (!status) return "badge bg-secondary";
    const statusLower = status.toLowerCase();
    if (statusLower === "received" || statusLower === "approved")
      return "badge bg-success";
    if (statusLower === "pending") return "badge bg-warning text-dark";
    if (statusLower === "rejected") return "badge bg-danger";
    return "badge bg-secondary";
  };

  const calculateTotal = () => {
    return tableRows
      .reduce((total, row) => total + parseFloat(row.amount || 0), 0)
      .toFixed(2);
  };

  const handleAddRow = () => {
    setTableRows([
      ...tableRows,
      { id: Date.now(), account: "", amount: "0.00", narration: "" },
    ]);
  };

  const handleDeleteRow = (id) => {
    if (tableRows.length > 1) {
      setTableRows(tableRows.filter((row) => row.id !== id));
    }
  };

  const handleRowChange = (id, field, value) => {
    setTableRows(
      tableRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const entries = tableRows
      .map((row) => ({
        income_account: row.account,
        amount: parseFloat(row.amount) || 0,
        row_narration: row.narration || "",
      }))
      .filter((entry) => entry.income_account && entry.amount > 0);

    if (entries.length === 0) {
      toast.warning("Please add at least one valid income entry.");
      setLoading(false);
      return;
    }

    const payload = {
      company_id: companyId,
      auto_receipt_no: autoReceiptNo,
      manual_receipt_no: manualReceiptNo,
      voucher_date: e.target.voucherDate.value,
      deposited_to: e.target.depositedTo.value, // ID
      received_from: receivedFromId || null, // ID
      narration: narration,
      status: "pending",
      entries: entries,
    };

    try {
      await axiosInstance.post("/income-vouchers", payload);
      await fetchIncomeVouchers();
      toast.success("Income voucher created successfully!");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating voucher:", error);
      toast.error(error.response?.data?.message || "Failed to create income voucher.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editVoucher) return;
    setLoading(true);

    const payload = {
      company_id: companyId,
      auto_receipt_no: e.target.autoReceiptNo.value,
      manual_receipt_no: e.target.manualReceiptNo.value,
      voucher_date: e.target.voucherDate.value,
      deposited_to: e.target.depositedTo.value,
      received_from: editVoucher.receivedFromId || null,
      narration: e.target.narration.value,
      status: e.target.status.value,
      entries: editVoucher.items
        .map((item) => ({
          income_account: item.account,
          amount: parseFloat(item.amount) || 0,
          row_narration: item.narration || "",
        }))
        .filter((entry) => entry.income_account),
    };

    try {
      await axiosInstance.patch(`/income-vouchers/${editVoucher.id}`, payload);
      await fetchIncomeVouchers();
      toast.success("Income voucher updated successfully!");
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating voucher:", error);
      toast.error(error.response?.data?.message || "Failed to update voucher.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteVoucher) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/income-vouchers/${deleteVoucher.id}`);
      await fetchIncomeVouchers();
      toast.success("Income voucher deleted successfully!");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting voucher:", error);
      toast.error(error.response?.data?.message || "Failed to delete voucher.");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (voucher) => {
    setSelectedVoucher(voucher);
    setShowViewModal(true);
  };

  const handleEdit = (voucher) => {
    setEditVoucher(voucher);
    setShowEditModal(true);
  };

  const handleDelete = (voucher) => {
    setDeleteVoucher(voucher);
    setShowDeleteModal(true);
  };

  // Helper: Get customer display name
  const getCustomerName = (customerId) => {
    if (!customerId) return "N/A";
    const cust = customers.find((c) => c.id == customerId);
    return cust ? cust.name_english || cust.account_name : `ID: ${customerId}`;
  };

  // ✅ NEW: Helper: Get account display name
  const getAccountName = (accountId) => {
    if (!accountId) return "N/A";
    const account = accounts.find((a) => a.id == accountId);
    return account 
      ? account.display_name || account.bank_name_branch || `ID: ${accountId}`
      : `ID: ${accountId}`;
  };

  // Helper: Get account display name (now also uses customers)
  const getIncomeAccountName = (accountId) => {
    if (!accountId) return "N/A";
    const account = customers.find((a) => a.id == accountId);
    return account
      ? account.name_english || account.account_name || account.bank_name_branch
      : `ID: ${accountId}`;
  };

  const filteredVouchers = incomeVouchers.filter((voucher) => {
    const receivedFromName = getCustomerName(voucher.receivedFromId);
    return (
      (!filters.accountName ||
        receivedFromName
          .toLowerCase()
          .includes(filters.accountName.toLowerCase())) &&
      (!filters.receiptNo ||
        (voucher.autoReceiptNo &&
          voucher.autoReceiptNo
            .toLowerCase()
            .includes(filters.receiptNo.toLowerCase())) ||
        (voucher.manualReceiptNo &&
          voucher.manualReceiptNo
            .toLowerCase()
            .includes(filters.receiptNo.toLowerCase()))) &&
      (!filters.depositedTo || voucher.depositedTo == filters.depositedTo) // compare ID to ID
    );
  });

  // Function to manually refresh customers
  const refreshCustomers = () => {
    console.log("Manually refreshing customers...");
    fetchCustomersByCompany();
  };

  // ✅ NEW: Function to manually refresh accounts
  const refreshAccounts = () => {
    console.log("Manually refreshing accounts...");
    fetchAccountsByCompany();
  };

  return (
    <div className="p-4 mt-1 product-header">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      
      {/* Header */}
      <div className="d-flex justify-content-between gap-4 mb-4">
        <div>
          <h5 className="fw-bold mb-1">Income Voucher</h5>
          <p className="text-muted mb-0">Manage your income receipts</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button className="btn btn-light border text-danger">
            <FaFilePdf />
          </button>
          <button className="btn btn-light border text-success">
            <FaFileExcel />
          </button>
          <button
            className="btn text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: "#3daaaa" }}
            onClick={() => setShowCreateModal(true)}
            disabled={fetching}
          >
            <FaPlusCircle /> Create Income Voucher
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded shadow-sm mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Receipt No</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Receipt No..."
              value={filters.receiptNo}
              onChange={(e) =>
                setFilters({ ...filters, receiptNo: e.target.value })
              }
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Account</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Account..."
              value={filters.accountName}
              onChange={(e) =>
                setFilters({ ...filters, accountName: e.target.value })
              }
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Deposited To</label>
            {accountsLoading ? ( // ✅ Changed from customersLoading to accountsLoading
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>Loading accounts...</span>
              </div>
            ) : (
              <select
                className="form-select"
                value={filters.depositedTo}
                onChange={(e) =>
                  setFilters({ ...filters, depositedTo: e.target.value })
                }
              >
                <option value="">All</option>
                {accounts.map((acc) => ( // ✅ Changed from customers to accounts
                  <option key={acc.id} value={acc.id}>
                    {acc.display_name || acc.bank_name_branch}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {fetching ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading income vouchers...</p>
        </div>
      ) : (
        <>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="direct" title="All Income Vouchers">
              <div className="table-responsive">
                {filteredVouchers.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No income vouchers found.</p>
                  </div>
                ) : (
                  <table className="table table-bordered text-center align-middle mb-0">
                    <thead className="">
                      <tr>
                        <th>DATE</th>
                        <th>AUTO RECEIPT NO</th>
                        <th>MANUAL RECEIPT NO</th>
                        <th>DEPOSITED TO</th>
                        <th>RECEIVED FROM</th>
                        <th>TOTAL AMOUNT</th>
                        <th>NARRATION</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVouchers.map((voucher) => (
                        <tr key={voucher.id}>
                          <td>{voucher.date}</td>
                          <td>{voucher.autoReceiptNo}</td>
                          <td>{voucher.manualReceiptNo}</td>
                          <td>{getAccountName(voucher.depositedTo)}</td> {/* ✅ Changed to getAccountName */}
                          <td>{getCustomerName(voucher.receivedFromId)}</td>
                          <td>{voucher.totalAmount}</td>
                          <td>{voucher.narration}</td>
                          <td>
                            <span className={getStatusBadge(voucher.status)}>
                              {voucher.status}
                            </span>
                          </td>
                          <td className="d-flex gap-2 justify-content-center">
                            <button
                              className="btn btn-sm text-info"
                              onClick={() => handleView(voucher)}
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-sm text-warning"
                              onClick={() => handleEdit(voucher)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm text-danger"
                              onClick={() => handleDelete(voucher)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Tab>
          </Tabs>

          <div className="d-flex justify-content-between align-items-center mt-3 px-3">
            <span className="small text-muted">
              Showing 1 to {filteredVouchers.length} of {incomeVouchers.length}{" "}
              results
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <button className="page-link">&laquo;</button>
                </li>
                <li className="page-item active">
                  <button
                    className="page-link"
                    style={{ backgroundColor: "#3daaaa" }}
                  >
                    1
                  </button>
                </li>
                <li className="page-item">
                  <button className="page-link">2</button>
                </li>
                <li className="page-item">
                  <button className="page-link">&raquo;</button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}

      {/* CREATE MODAL */}
      <div
        className={`modal fade ${showCreateModal ? "show" : ""}`}
        style={{
          display: showCreateModal ? "block" : "none",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">Create Income Voucher</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowCreateModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Auto Receipt No
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={autoReceiptNo}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Manual Receipt No
                    </label>
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
                    <label className="form-label fw-semibold">
                      Voucher Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="voucherDate"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Deposited To
                    </label>
                    {accountsLoading ? ( // ✅ Changed from customersLoading to accountsLoading
                      <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <span>Loading accounts...</span>
                      </div>
                    ) : (
                      <div className="input-group">
                        <select className="form-select" name="depositedTo" required>
                          <option value="">Select Account</option>
                          {accounts.map((acc) => ( // ✅ Changed from customers to accounts
                            <option key={acc.id} value={acc.id}>
                              {acc.display_name || acc.bank_name_branch}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={refreshAccounts} // ✅ Changed from refreshCustomers to refreshAccounts
                          disabled={accountsLoading} // ✅ Changed from customersLoading to accountsLoading
                        >
                          {accountsLoading ? ( // ✅ Changed from customersLoading to accountsLoading
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            "Refresh"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">
                      Received From
                    </label>
                    <div className="customer-search-container position-relative">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search customer by name or phone..."
                          value={receivedFromSearchTerm}
                          onChange={(e) => {
                            handleCustomerSearch(e.target.value);
                            setShowCustomerDropdown(true);
                          }}
                          onFocus={() => {
                            setShowCustomerDropdown(true);
                            if (!receivedFromSearchTerm.trim()) {
                              setFilteredCustomers(customers);
                            }
                          }}
                        />
                        <span className="input-group-text">
                          <FaSearch />
                        </span>
                      </div>
                      {showCustomerDropdown && (
                        <div
                          className="position-absolute w-100 mt-1 shadow-sm bg-white border rounded-1"
                          style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}
                        >
                          {customersLoading ? (
                            <div className="p-3 text-center">
                              <div className="spinner-border spinner-border-sm me-2" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              <span>Loading customers...</span>
                            </div>
                          ) : filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                              <div
                                key={customer.id}
                                className="p-3 border-bottom"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleCustomerSelect(customer)}
                              >
                                <div className="fw-bold">{getCustomerDisplayName(customer)}</div>
                                {getCustomerDisplayPhone(customer) && (
                                  <div className="small text-muted">{getCustomerDisplayPhone(customer)}</div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-muted">
                              No customers found
                            </div>
                          )}
                        </div>
                      )}
                      <div className="input-group mt-2">
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={refreshCustomers}
                          disabled={customersLoading}
                        >
                          {customersLoading ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            "Refresh"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Income Account</th>
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
                              onChange={(e) =>
                                handleRowChange(
                                  row.id,
                                  "account",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Sales Revenue"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={row.amount}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*\.?\d*$/.test(val) || val === "") {
                                  handleRowChange(row.id, "amount", val);
                                }
                              }}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Row narration"
                              value={row.narration}
                              onChange={(e) =>
                                handleRowChange(
                                  row.id,
                                  "narration",
                                  e.target.value
                                )
                              }
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
                        <td colSpan={3} className="text-end fw-bold">
                          Total: {calculateTotal()}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleAddRow}
                  >
                    + Add Row
                  </button>
                  <div className="form-check d-flex align-items-center gap-2 mb-0">
                    <input
                      className="form-check-input mb-0"
                      type="checkbox"
                      id="showNarrationCheck"
                      checked={showNarration}
                      onChange={(e) => setShowNarration(e.target.checked)}
                    />
                    <label
                      className="form-check-label fw-semibold mb-0"
                      htmlFor="showNarrationCheck"
                    >
                      Add Voucher Narration
                    </label>
                  </div>
                </div>

                {showNarration && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Narration</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={narration}
                      onChange={(e) => setNarration(e.target.value)}
                      placeholder="Enter narration for this income voucher..."
                    ></textarea>
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="submit"
                    className="btn"
                    style={{ backgroundColor: "#3daaaa", color: "white" }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      <div
        className={`modal fade ${showViewModal ? "show" : ""}`}
        style={{
          display: showViewModal ? "block" : "none",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Income Voucher Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowViewModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {selectedVoucher && (
                <div>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <td>
                          <strong>Date</strong>
                        </td>
                        <td>{selectedVoucher.date}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Auto Receipt No</strong>
                        </td>
                        <td>{selectedVoucher.autoReceiptNo}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Manual Receipt No</strong>
                        </td>
                        <td>{selectedVoucher.manualReceiptNo}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Deposited To</strong>
                        </td>
                        <td>{getAccountName(selectedVoucher.depositedTo)}</td> {/* ✅ Changed to getAccountName */}
                      </tr>
                      <tr>
                        <td>
                          <strong>Received From</strong>
                        </td>
                        <td>
                          {getCustomerName(selectedVoucher.receivedFromId)}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Status</strong>
                        </td>
                        <td>
                          <span
                            className={getStatusBadge(selectedVoucher.status)}
                          >
                            {selectedVoucher.status}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Total Amount</strong>
                        </td>
                        <td>{selectedVoucher.totalAmount}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Narration</strong>
                        </td>
                        <td>{selectedVoucher.narration}</td>
                      </tr>
                    </tbody>
                  </table>
                  <h6 className="mt-4 mb-3">Income Account Details</h6>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Income Account</th>
                        <th>Amount</th>
                        <th>Narration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVoucher.items.map((item, index) => (
                        <tr key={index}>
                          <td>{getIncomeAccountName(item.account)}</td>
                          <td>{item.amount}</td>
                          <td>{item.narration || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <div
        className={`modal fade ${showEditModal ? "show" : ""}`}
        style={{
          display: showEditModal ? "block" : "none",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Edit Income Voucher</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowEditModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {editVoucher && (
                <form onSubmit={handleEditSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        name="autoReceiptNo"
                        defaultValue={editVoucher.autoReceiptNo}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        name="manualReceiptNo"
                        defaultValue={editVoucher.manualReceiptNo || ""}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <input
                        type="date"
                        className="form-control"
                        name="voucherDate"
                        defaultValue={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <select
                        className="form-select"
                        name="depositedTo"
                        defaultValue={editVoucher.depositedTo}
                      >
                        {accounts.map((acc) => ( // ✅ Changed from customers to accounts
                          <option key={acc.id} value={acc.id}>
                            {acc.display_name || acc.bank_name_branch}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={getCustomerName(
                          editVoucher.receivedFromId
                        )}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={editVoucher.items
                          .map((i) => i.account)
                          .join(", ")}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={editVoucher.totalAmount}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <textarea
                        className="form-control"
                        rows="3"
                        defaultValue={editVoucher.narration}
                        name="narration"
                      ></textarea>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <select
                        className="form-select"
                        name="status"
                        defaultValue={editVoucher.status.toLowerCase()}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-3 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn"
                      style={{ backgroundColor: "#3daaaa", color: "white" }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      <div
        className={`modal fade ${showDeleteModal ? "show" : ""}`}
        style={{
          display: showDeleteModal ? "block" : "none",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 16 }}>
            <div className="modal-body text-center py-4">
              <div
                className="mx-auto mb-3"
                style={{
                  width: 70,
                  height: 70,
                  background: "#FFF5F2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaTrash size={32} color="#F04438" />
              </div>
              <h4 className="fw-bold mb-2">Delete Income Voucher</h4>
              <p className="mb-4" style={{ color: "#555" }}>
                Are you sure you want to delete this income voucher?
              </p>
              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn btn-dark"
                  onClick={() => setShowDeleteModal(false)}
                >
                  No, Cancel
                </button>
                <button
                  className="btn"
                  style={{
                    background: "#3daaaa",
                    color: "#fff",
                    fontWeight: 600,
                  }}
                  onClick={confirmDelete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Deleting...
                    </>
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Info */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">
            Page Info
          </h5>
          <ul
            className="text-muted fs-6 mb-0"
            style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}
          >
            <li>
              Create and manage income vouchers for various revenue sources.
            </li>
            <li>
              Each voucher has both auto-generated and manual receipt numbers
              for tracking.
            </li>
            <li>
              Helps maintain accurate financial records and income tracking.
            </li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Income;