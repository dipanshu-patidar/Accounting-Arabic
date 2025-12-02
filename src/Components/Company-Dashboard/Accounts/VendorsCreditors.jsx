import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Row, Col, Card, Alert, Image } from 'react-bootstrap';
import { FaEye, FaEdit, FaTrash, FaPlus, FaBook, FaFile } from 'react-icons/fa';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CurrencyContext } from '../../../hooks/CurrencyContext';

const VendorsCustomers = () => {
  const navigate = useNavigate();
  const CompanyId = GetCompanyId();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showView, setShowView] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [vendorType, setVendorType] = useState("vender");
  const { symbol, convertPrice: convertrice } = useContext(CurrencyContext);

  const getAccountType = (type) => type === "vender" ? "Sundry Creditors" : "Sundry Debtors";

  const [vendorFormData, setVendorFormData] = useState({
    name: "",
    accountType: getAccountType("vender"),
    accountName: "",
    balanceType: "Credit",
    payable: "",
    currentBalance: "",
    creationDate: "",
    bankAccountNumber: "",
    bankIFSC: "",
    bankName: "",
    country: "",
    state: "",
    pincode: "",
    address: "",
    stateCode: "",
    shippingAddress: "",
    phone: "",
    email: "",
    creditPeriod: "",
    gstin: "",
    gstType: "Registered",
    gstEnabled: true,
    nameArabic: "",
    companyName: "",
    companyLocation: "",
    idCardImage: null,
    extraFile: null,
    accountBalance: "",
  });

  // Function to determine balance type based on account type
  const getBalanceType = (accountType) => {
    const debitTypes = [
      "Sundry Debtors", "Current Assets", "Loans & Advances",
      "Fixed Assets", "Investments", "Deposits (Assets)",
      "Cash-in-hand", "Direct Expenses", "Indirect Expenses"
    ];

    return debitTypes.includes(accountType) ? "Debit" : "Credit";
  };

  // Handle account type change
  const handleAccountTypeChange = (e) => {
    const selectedType = e.target.value;
    const balanceType = getBalanceType(selectedType);

    setVendorFormData({
      ...vendorFormData,
      accountType: selectedType,
      balanceType: balanceType
    });
  };

  // Centralized fetch function with loading/error handling
  const fetchVendors = async () => {
    if (!CompanyId) {
      setError("Company ID not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/vendorCustomer/company/${CompanyId}?type=${vendorType}`);

      if (response.status === 200 && response.data && Array.isArray(response.data.data)) {
        const mappedVendors = response.data.data.map(vendor => ({
          id: vendor.id,
          name: vendor.name_english?.trim() || "N/A",
          nameArabic: vendor.name_arabic?.trim() || "",
          email: vendor.email?.trim() || "",
          phone: vendor.phone?.trim() || "",
          payable: parseFloat(vendor.account_balance) || 0,
          address: vendor.address?.trim() || "",
          accountType: vendor.account_type?.trim() || getAccountType(vendorType),
          accountName: vendor.account_name?.trim() || vendor.name_english?.trim() || "Accounts Payable",
          creationDate: vendor.creation_date?.trim() || "",
          bankAccountNumber: vendor.bank_account_number?.trim() || "",
          bankIFSC: vendor.bank_ifsc?.trim() || "",
          bankName: vendor.bank_name_branch?.trim() || "",
          country: vendor.country?.trim() || "",
          state: vendor.state?.trim() || "",
          pincode: vendor.pincode?.trim() || "",
          stateCode: vendor.state_code?.trim() || "",
          shippingAddress: vendor.shipping_address?.trim() || "",
          creditPeriod: vendor.credit_period_days || "",
          gstin: vendor.gstin?.trim() || "",
          gstEnabled: vendor.enable_gst === "1",
          companyLocation: vendor.google_location?.trim() || "",
          companyName: vendor.company_name?.trim() || "",
          idCardImage: vendor.id_card_image || null,
          extraFile: vendor.any_file || null,
          raw: vendor
        }));
        setVendors(mappedVendors);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.response?.data?.message || err.message || "Failed to load vendors. Please try again.");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const refetchData = () => {
    fetchVendors();
  };

  const handleAddClick = () => {
    const accountType = getAccountType(vendorType);
    const balanceType = getBalanceType(accountType);

    setVendorFormData({
      name: "",
      accountType: accountType,
      accountName: "",
      balanceType: balanceType,
      payable: "",
      currentBalance: "",
      creationDate: "",
      bankAccountNumber: "",
      bankIFSC: "",
      bankName: "",
      country: "",
      state: "",
      pincode: "",
      address: "",
      stateCode: "",
      shippingAddress: "",
      phone: "",
      email: "",
      creditPeriod: "",
      gstin: "",
      gstType: "Registered",
      gstEnabled: true,
      nameArabic: "",
      companyName: "",
      companyLocation: "",
      idCardImage: null,
      extraFile: null,
      accountBalance: "",
    });
    setSelectedVendor(null);
    setShowAddEditModal(true);
  };

  const handleEditClick = (vendor) => {
    const accountType = vendor.accountType || getAccountType(vendorType);
    const balanceType = getBalanceType(accountType);

    setVendorFormData({
      name: vendor.name || "",
      nameArabic: vendor.nameArabic || "",
      companyName: vendor.companyName || "",
      companyLocation: vendor.companyLocation || "",
      accountType: accountType,
      accountName: vendor.accountName || "",
      balanceType: balanceType,
      payable: vendor.payable || "",
      accountBalance: vendor.payable?.toString() || "",
      creationDate: vendor.creationDate || "",
      bankAccountNumber: vendor.bankAccountNumber || "",
      bankIFSC: vendor.bankIFSC || "",
      bankName: vendor.bankName || "",
      country: vendor.country || "",
      state: vendor.state || "",
      pincode: vendor.pincode || "",
      address: vendor.address || "",
      stateCode: vendor.stateCode || "",
      shippingAddress: vendor.shippingAddress || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      creditPeriod: vendor.creditPeriod || "",
      gstin: vendor.gstin || "",
      gstType: vendor.gstType || "Registered",
      gstEnabled: vendor.gstEnabled !== undefined ? vendor.gstEnabled : true,
      idCardImage: null,
      extraFile: null,
    });
    setSelectedVendor(vendor);
    setShowAddEditModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const companyIdNum = parseInt(CompanyId, 10);
      if (isNaN(companyIdNum) || companyIdNum <= 0) {
        toast.error("Invalid company ID. Please log in again.");
        setSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("company_id", companyIdNum);
      formData.append("name_english", vendorFormData.name.trim());
      formData.append("name_arabic", vendorFormData.nameArabic?.trim() || "");
      formData.append("company_name", vendorFormData.companyName?.trim() || "");
      formData.append("google_location", vendorFormData.companyLocation?.trim() || "");
      formData.append("account_type", vendorFormData.accountType);
      formData.append("balance_type", vendorFormData.balanceType);
      formData.append("account_name", vendorFormData.accountName?.trim() || vendorFormData.name.trim());
      formData.append("account_balance", parseFloat(vendorFormData.accountBalance) || 0);

      formData.append("creation_date", vendorFormData.creationDate
        ? new Date(vendorFormData.creationDate).toISOString()
        : new Date().toISOString());

      formData.append("bank_account_number", vendorFormData.bankAccountNumber?.trim() || "");
      formData.append("bank_ifsc", vendorFormData.bankIFSC?.trim() || "");
      formData.append("bank_name_branch", vendorFormData.bankName?.trim() || "");
      formData.append("country", vendorFormData.country?.trim() || "");
      formData.append("state", vendorFormData.state?.trim() || "");
      formData.append("pincode", vendorFormData.pincode?.trim() || "");
      formData.append("address", vendorFormData.address?.trim() || "");
      formData.append("state_code", vendorFormData.stateCode?.trim() || "");
      formData.append("shipping_address", vendorFormData.shippingAddress?.trim() || "");
      formData.append("phone", vendorFormData.phone?.trim() || "");
      formData.append("email", vendorFormData.email?.trim() || "");
      formData.append("credit_period_days", parseInt(vendorFormData.creditPeriod) || 0);
      formData.append("enable_gst", vendorFormData.gstEnabled ? "1" : "0");
      if (vendorFormData.gstEnabled) {
        formData.append("gstin", vendorFormData.gstin?.trim() || "");
      }
      formData.append("type", vendorType);

      if (vendorFormData.idCardImage) {
        formData.append("id_card_image", vendorFormData.idCardImage);
      }
      if (vendorFormData.extraFile) {
        formData.append("any_file", vendorFormData.extraFile);
      }

      let response;
      if (selectedVendor) {
        response = await axiosInstance.put(`/vendorCustomer/${selectedVendor.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        response = await axiosInstance.post('/vendorCustomer', formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      if (response.status >= 200 && response.status < 300) {
        toast.success(selectedVendor
          ? `${vendorType === 'vender' ? 'Vendor' : 'Customer'} updated successfully!`
          : `${vendorType === 'vender' ? 'Vendor' : 'Customer'} added successfully!`
        );
        setShowAddEditModal(false);
        setSelectedVendor(null);
        resetForm();
        refetchData();
      } else {
        throw new Error(response.data?.message || 'Operation failed');
      }
    } catch (err) {
      console.error("Save Error:", err);
      toast.error(err.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    const accountType = getAccountType(vendorType);
    const balanceType = getBalanceType(accountType);

    setVendorFormData({
      name: "",
      accountType: accountType,
      accountName: "",
      balanceType: balanceType,
      payable: "",
      currentBalance: "",
      creationDate: "",
      bankAccountNumber: "",
      bankIFSC: "",
      bankName: "",
      country: "",
      state: "",
      pincode: "",
      address: "",
      stateCode: "",
      shippingAddress: "",
      phone: "",
      email: "",
      creditPeriod: "",
      gstin: "",
      gstType: "Registered",
      gstEnabled: true,
      nameArabic: "",
      companyName: "",
      companyLocation: "",
      idCardImage: null,
      extraFile: null,
      accountBalance: "",
    });
  };

  const handleDeleteVendor = async () => {
    if (!selectedVendor?.id) {
      toast.error("Vendor ID not found.");
      setShowDelete(false);
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const response = await axiosInstance.delete(`/vendorCustomer/${selectedVendor.id}`);

      if (response.status >= 200 && response.status < 300) {
        toast.success(`${vendorType === 'vender' ? 'Vendor' : 'Customer'} deleted successfully!`);
        setShowDelete(false);
        setSelectedVendor(null);
        refetchData();
      } else {
        throw new Error(response.data?.message || 'Failed to delete vendor');
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error(err.response?.data?.message || "Failed to delete vendor. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // 🔥 ENHANCED SEARCH LOGIC
  const filteredVendors = vendors.filter((v) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      v.name.toLowerCase().includes(searchLower) ||
      (v.nameArabic && v.nameArabic.toLowerCase().includes(searchLower)) ||
      (v.phone && v.phone.includes(searchTerm))
    );
  });

  const handleDownloadTemplate = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    let yPos = 20;
    doc.setFontSize(20);
    doc.text(`${vendorType === 'vender' ? 'Vendor' : 'Customer'} Detailed Report`, 14, yPos);
    yPos += 10;
    const today = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${today}`, 14, yPos);
    yPos += 10;
    if (filteredVendors.length === 0) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("No vendors to display.", 14, yPos);
    } else {
      filteredVendors.forEach((vendor, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(`${vendorType === 'vender' ? 'Vendor' : 'Customer'} #${index + 1}: ${vendor.name}`, 14, yPos);
        yPos += 8;
        doc.setDrawColor(39, 178, 182);
        doc.line(14, yPos, 200, yPos);
        yPos += 8;
        doc.setFont("helvetica", "normal");
        const basicInfo = [
          `Name: ${vendor.name || "-"}`,
          `Phone: ${vendor.phone || "-"}`,
          `Email: ${vendor.email || "-"}`,
          `Account Type: ${vendor.accountType || getAccountType(vendorType)}`,
          `Account Name: ${vendor.accountName || "-"}`,
          `Opening Balance: $${vendor.payable ? vendor.payable.toFixed(2) : "0.00"}`,
          `Credit Period: ${vendor.creditPeriod || "N/A"} days`,
          `Creation Date: ${vendor.creationDate || "N/A"}`
        ];
        basicInfo.forEach(line => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, 16, yPos);
          yPos += 6;
        });
        yPos += 4;
        if (vendor.address || vendor.country || vendor.state || vendor.pincode || vendor.stateCode) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Billing Information:", 14, yPos);
          yPos += 6;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const billingInfo = [
            `Address: ${vendor.address || "-"}`,
            `Country: ${vendor.country || "India"}`,
            `State: ${vendor.state || "-"}`,
            `Pincode: ${vendor.pincode || "-"}`,
            `State Code: ${vendor.stateCode || "-"}`
          ];
          billingInfo.forEach(line => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, 16, yPos);
            yPos += 6;
          });
          yPos += 4;
        }
        if (vendor.shippingAddress) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Shipping Information:", 14, yPos);
          yPos += 6;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`Address: ${vendor.shippingAddress || "-"}`, 16, yPos);
          yPos += 8;
        }
        if (vendor.bankAccountNumber || vendor.bankIFSC || vendor.bankName) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Bank Details:", 14, yPos);
          yPos += 6;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const bankInfo = [];
          if (vendor.bankAccountNumber) bankInfo.push(`Account Number: ${vendor.bankAccountNumber}`);
          if (vendor.bankIFSC) bankInfo.push(`IFSC: ${vendor.bankIFSC}`);
          if (vendor.bankName) bankInfo.push(`Bank & Branch: ${vendor.bankName}`);
          bankInfo.forEach(line => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, 16, yPos);
            yPos += 6;
          });
          yPos += 4;
        }
        if (vendor.companyName || vendor.companyLocation) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Company Information:", 14, yPos);
          yPos += 6;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          if (vendor.companyName) {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(`Company Name: ${vendor.companyName}`, 16, yPos);
            yPos += 6;
          }
          if (vendor.companyLocation) {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(`Google Location: ${vendor.companyLocation}`, 16, yPos);
            yPos += 6;
          }
          yPos += 4;
        }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Tax Information:", 14, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`GST Enabled: ${vendor.gstEnabled ? "Yes" : "No"}`, 16, yPos);
        yPos += 6;
        if (vendor.gstin) {
          doc.text(`GSTIN: ${vendor.gstin}`, 16, yPos);
          yPos += 6;
        }
        yPos += 8;
        if (index < filteredVendors.length - 1) {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          } else {
            yPos += 10;
          }
        }
      });
    }
    doc.save(`${vendorType}_detailed_report.pdf`);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(vendors);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${vendorType === 'vender' ? 'Vendor' : 'Customer'}`);
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${vendorType}_Export.xlsx`);
  };

  const handleImportClick = () => {
    if (window.importFileRef) window.importFileRef.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet);
      const dataWithIds = data.map(item => ({
        ...item,
        id: Date.now() + Math.random()
      }));
      setVendors((prev) => [...prev, ...dataWithIds]);
    };
    reader.readAsBinaryString(file);
  };

  const handleViewLedger = (vendor) => {
    navigate(`/company/ledgervendor`, { state: { vendor } });
  };

  useEffect(() => {
    fetchVendors();
  }, [CompanyId, vendorType]);

  return (
    <div className="p-2">
      <ToastContainer position="top-right" autoClose={3000} />
      <Row className="align-items-center mb-3">
        <Col xs={12} md={4}>
          <h4 className="fw-bold mb-0">{vendorType === 'vender' ? 'Vendor' : 'Customer'} Management</h4>
        </Col>
        <Col xs={12} md={8}>
          <div className="d-flex flex-wrap gap-2 justify-content-md-end">
            <Button variant="success" className="rounded-pill d-flex align-items-center" onClick={handleImportClick}>Import</Button>
            <input type="file" accept=".xlsx, .xls" ref={(ref) => (window.importFileRef = ref)} onChange={handleImport} style={{ display: "none" }} />
            <Button variant="primary" className="rounded-pill d-flex align-items-center" onClick={handleExport}>Export</Button>
            <Button
              variant="warning"
              className="rounded-pill d-flex align-items-center"
              onClick={handleDownloadTemplate}
              title={`Download ${vendorType === 'vender' ? 'Vendor' : 'Customer'} PDF Report`}
            >
              Download PDF
            </Button>
            <Button variant="success" className="rounded-pill d-flex align-items-center" style={{ backgroundColor: "#53b2a5", border: "none" }} onClick={handleAddClick}>
              <FaPlus /> Add {vendorType === 'vender' ? 'Vendor' : 'Customer'}
            </Button>
          </div>
        </Col>
      </Row>
      <Row className="mb-3 justify-content-start">
        <Col xs={12} md={6} lg={4}>
          <Form.Control type="text" placeholder={`Search ${vendorType === 'vender' ? 'Vendor' : 'Customer'}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="rounded-pill" />
        </Col>
        <Col xs={12} md={6} lg={4} className="ms-auto">
          <Form.Select value={vendorType} onChange={(e) => setVendorType(e.target.value)}>
            <option value="vender">Vendor</option>
            <option value="customer">Customer</option>
          </Form.Select>
        </Col>
      </Row>
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading {vendorType === 'vender' ? 'Vendors' : 'Customers'} for Company</p>
        </div>
      )}
      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}
      {!loading && !error && (
        <div className="card bg-white rounded-3 p-4">
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle mb-0">
              <thead className=" border">
                <tr>
                  <th>NO.</th>
                  <th>Name (English)</th>
                  <th>Name (Arabic)</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Account Type</th>
                  <th>Account Name</th>
                  <th>Opening Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor, idx) => (
                    <tr key={vendor.id}>
                      <td>{idx + 1}</td>
                      <td>{vendor.name}</td>
                      <td>
                        <span
                          style={{
                            direction: 'rtl',
                            fontFamily: 'Arial, sans-serif',
                            display: 'block',
                            textAlign: 'end',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            minWidth: '100px',
                            maxWidth: '200px',
                          }}
                        >
                          {vendor.nameArabic || "-"}
                        </span>
                      </td>
                      <td>{vendor.email}</td>
                      <td>{vendor.phone}</td>
                      <td>
                        <span className="badge bg-info text-white">
                          {vendor.accountType}
                        </span>
                      </td>
                      <td>{vendor.accountName}</td>
                      <td>{symbol}{convertrice(vendor.payable)}</td>
                      <td>
                        <div
                          className="d-flex align-items-center gap-2"
                          style={{ minWidth: "220px", whiteSpace: "nowrap" }}
                        >
                          <Button
                            variant="link"
                            className="text-info p-1"
                            size="sm"
                            onClick={() => { setSelectedVendor(vendor); setShowView(true); }}
                            title="View Details"
                          >
                            <FaEye size={16} />
                          </Button>
                          <Button
                            variant="link"
                            className="text-warning p-1"
                            size="sm"
                            onClick={() => handleEditClick(vendor)}
                            title="Edit Vendor"
                          >
                            <FaEdit size={16} />
                          </Button>
                          <Button
                            variant="link"
                            className="text-danger p-1"
                            size="sm"
                            onClick={() => { setSelectedVendor(vendor); setShowDelete(true); }}
                            title="Delete Vendor"
                          >
                            <FaTrash size={16} />
                          </Button>
                          <Button
                            variant="none"
                            className="p-0 text-primary text-decoration-none"
                            onClick={() => handleViewLedger(vendor)}
                            title="View Ledger"
                            style={{
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              padding: "6px 10px",
                              borderRadius: "4px",
                              fontSize: "0.875rem",
                              fontWeight: 500,
                            }}
                          >
                            View Ledger
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">
                      No {vendorType === 'vender' ? 'Vendors' : 'Customers'} found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
            <small className="text-muted ms-2">
              Showing 1 to {filteredVendors.length} of {filteredVendors.length} results
            </small>
            <nav>
              <ul className="pagination mb-0">
                <li className="page-item disabled"><button className="page-link">&laquo;</button></li>
                <li className="page-item active"><button className="page-link">1</button></li>
                <li className="page-item"><button className="page-link">2</button></li>
                <li className="page-item"><button className="page-link">&raquo;</button></li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* View Modal */}
      <Modal show={showView} onHide={() => setShowView(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{vendorType === 'vender' ? 'Vendor' : 'Customer'} Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVendor && (
            <>
              <div className="text-center mb-4">
                {selectedVendor.idCardImage ? (
                  <Image
                    src={selectedVendor.idCardImage}
                    roundedCircle
                    style={{ width: '100px', height: '100px', objectFit: 'cover', border: '2px solid #dee2e6' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center text-muted"
                    style={{ width: '100px', height: '100px', fontSize: '36px', fontWeight: 'bold' }}
                  >
                    {selectedVendor.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <h4 className="mt-3 text-start" style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
                  {selectedVendor.name || 'N/A'}
                </h4>
              </div>

              <div className="border rounded p-3 mb-4">
                <h6 className="fw-semibold mb-3">Basic Information</h6>
                <Row>
                  <Col md={6}><p><strong>Phone:</strong> {selectedVendor.phone}</p></Col>
                  <Col md={6}><p><strong>Email:</strong> {selectedVendor.email}</p></Col>
                  <Col md={6}><p><strong>Account Type:</strong> {selectedVendor.accountType}</p></Col>
                  <Col md={6}><p><strong>Account Name:</strong> {selectedVendor.accountName}</p></Col>
                  <Col md={6}><p><strong>Balance:</strong> ${selectedVendor.payable?.toFixed(2) || '0.00'}</p></Col>
                  <Col md={6}><p><strong>Credit Period:</strong> {selectedVendor.creditPeriod || "N/A"} days</p></Col>
                  <Col md={6}><p><strong>Creation Date:</strong> {selectedVendor.creationDate || "N/A"}</p></Col>
                </Row>
              </div>

              <div className="border rounded p-3 mb-4">
                <h6 className="fw-semibold mb-3">Billing Information</h6>
                <Row>
                  <Col md={6}><p><strong>Address:</strong> {selectedVendor.address}</p></Col>
                  <Col md={6}><p><strong>Country:</strong> {selectedVendor.country || "India"}</p></Col>
                  <Col md={6}><p><strong>State:</strong> {selectedVendor.state || "N/A"}</p></Col>
                  <Col md={6}><p><strong>Pincode:</strong> {selectedVendor.pincode || "N/A"}</p></Col>
                  <Col md={6}><p><strong>State Code:</strong> {selectedVendor.stateCode || "N/A"}</p></Col>
                </Row>
              </div>

              {selectedVendor.shippingAddress && (
                <div className="border rounded p-3 mb-4">
                  <h6 className="fw-semibold mb-3">Shipping Information</h6>
                  <Row>
                    <Col md={12}><p><strong>Shipping Address:</strong> {selectedVendor.shippingAddress}</p></Col>
                  </Row>
                </div>
              )}

              {selectedVendor.bankAccountNumber && (
                <div className="border rounded p-3 mb-4">
                  <h6 className="fw-semibold mb-3">Bank Details</h6>
                  <Row>
                    <Col md={6}><p><strong>Account Number:</strong> {selectedVendor.bankAccountNumber}</p></Col>
                    <Col md={6}><p><strong>IFSC:</strong> {selectedVendor.bankIFSC}</p></Col>
                    <Col md={6}><p><strong>Bank Name & Branch:</strong> {selectedVendor.bankName}</p></Col>
                  </Row>
                </div>
              )}

              {(selectedVendor.companyName || selectedVendor.companyLocation) && (
                <div className="border rounded p-3 mb-4">
                  <h6 className="fw-semibold mb-3">Company Information</h6>
                  <Row>
                    {selectedVendor.companyName && (
                      <Col md={6}>
                        <p>
                          <strong>Company Name:</strong> {selectedVendor.companyName}
                        </p>
                      </Col>
                    )}

                    {selectedVendor.companyLocation && (
                      <Col md={6}>
                        <p>
                          <strong>Google Location:</strong>{" "}
                          <a
                            href={selectedVendor.companyLocation}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Click Location
                          </a>
                        </p>
                      </Col>
                    )}
                  </Row>
                </div>

              )}

              <div className="border rounded p-3 mb-4">
                <h6 className="fw-semibold mb-3">Tax Information</h6>
                <Row>
                  <Col md={6}><p><strong>GST Enabled:</strong> {selectedVendor.gstEnabled ? "Yes" : "No"}</p></Col>
                  {selectedVendor.gstin && (
                    <Col md={6}><p><strong>GSTIN:</strong> {selectedVendor.gstin}</p></Col>
                  )}
                </Row>
              </div>

              {(selectedVendor.idCardImage || selectedVendor.extraFile) && (
                <div className="border rounded p-3 mb-4">
                  <h6 className="fw-semibold mb-3">Documents</h6>
                  <Row>
                    {selectedVendor.extraFile && (
                      <Col md={6} className="mb-3">
                        <p><strong>Additional File:</strong></p>
                        <div className="text-center">
                          <a
                            href={selectedVendor.extraFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            <FaFile className="me-1" /> View File
                          </a>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowView(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        show={showAddEditModal}
        onHide={() => setShowAddEditModal(false)}
        size="xl"
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>{selectedVendor ? `Edit ${vendorType === 'vender' ? 'Vendor' : 'Customer'}` : `Add ${vendorType === 'vender' ? 'Vendor' : 'Customer'}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Name (English)</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setVendorFormData({
                        ...vendorFormData,
                        name: value,
                        accountName:
                          vendorFormData.name === vendorFormData.accountName || !vendorFormData.accountName
                            ? value
                            : vendorFormData.accountName,
                      });
                    }}
                    placeholder="Enter vendor name"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Name (Arabic)</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.nameArabic}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, nameArabic: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.companyName}
                    onChange={(e) =>
                      setVendorFormData({
                        ...vendorFormData,
                        companyName: e.target.value,
                      })
                    }
                    placeholder="Enter company name"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Company Google Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.companyLocation}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, companyLocation: e.target.value })
                    }
                    placeholder="Enter Google Maps Link"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Profile Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, idCardImage: e.target.files[0] })
                    }
                  />
                  {selectedVendor?.idCardImage && (
                    <Form.Text className="text-muted">
                      Current file: {selectedVendor.idCardImage.split('/').pop()}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Any File</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, extraFile: e.target.files[0] })
                    }
                  />
                  {selectedVendor?.extraFile && (
                    <Form.Text className="text-muted">
                      Current file: {selectedVendor.extraFile.split('/').pop()}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Account Type</Form.Label>
                  <Form.Select
                    value={vendorFormData.accountType}
                    onChange={handleAccountTypeChange}
                    style={{ backgroundColor: "#fff" }}
                  >
                    <option value="Cash-in-hand">Cash-in-hand</option>
                    <option value="Bank A/Cs">Bank A/Cs</option>
                    <option value="Sundry Debtors">Sundry Debtors</option>
                    <option value="Sundry Creditors">Sundry Creditors</option>
                    <option value="Purchases A/C">Purchases A/C</option>
                    <option value="Purchases Return">Purchases Return</option>
                    <option value="Sales A/C">Sales A/C</option>
                    <option value="Sales Return">Sales Return</option>
                    <option value="Capital A/C">Capital A/C</option>
                    <option value="Direct Expenses">Direct Expenses</option>
                    <option value="Indirect Expenses">Indirect Expenses</option>
                    <option value="Direct Income">Direct Income</option>
                    <option value="Indirect Income">Indirect Income</option>
                    <option value="Current Assets">Current Assets</option>
                    <option value="Current Liabilities">Current Liabilities</option>
                    <option value="Misc. Expenses">Misc. Expenses</option>
                    <option value="Misc. Income">Misc. Income</option>
                    <option value="Loans (Liability)">Loans (Liability)</option>
                    <option value="Loans & Advances">Loans & Advances</option>
                    <option value="Fixed Assets">Fixed Assets</option>
                    <option value="Investments">Investments</option>
                    <option value="Bank OD A/C">Bank OD A/C</option>
                    <option value="Deposits (Assets)">Deposits (Assets)</option>
                    <option value="Provisions">Provisions</option>
                    <option value="Reserves & Surplus">Reserves & Surplus</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Balance Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.balanceType}
                    readOnly
                    disabled
                    style={{ backgroundColor: "#fff" }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Account Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.accountName}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, accountName: e.target.value })
                    }
                    placeholder="e.g., Vendor A"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Account Balance</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={vendorFormData.accountBalance}
                    onChange={(e) => {
                      const value = e.target.value;
                      setVendorFormData({
                        ...vendorFormData,
                        accountBalance: value || "0.00",
                        payable: parseFloat(value) || 0,
                      });
                    }}
                    placeholder="Enter account balance"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Creation Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={vendorFormData.creationDate}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, creationDate: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Bank Account Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.bankAccountNumber}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, bankAccountNumber: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Bank IFSC</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.bankIFSC}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, bankIFSC: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Bank Name & Branch</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.bankName}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, bankName: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.country}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, country: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.state}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, state: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Pincode</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.pincode}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, pincode: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.address}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, address: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>State Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.stateCode}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, stateCode: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Shipping Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.shippingAddress}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, shippingAddress: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendorFormData.phone}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, phone: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={vendorFormData.email}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, email: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Credit Period (days)</Form.Label>
                  <Form.Control
                    type="number"
                    value={vendorFormData.creditPeriod}
                    onChange={(e) =>
                      setVendorFormData({ ...vendorFormData, creditPeriod: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="d-flex align-items-center">
                  {vendorFormData.gstEnabled && (
                    <div className="flex-grow-1 me-3">
                      <Form.Label>GSTIN</Form.Label>
                      <Form.Control
                        type="text"
                        value={vendorFormData.gstin}
                        onChange={(e) =>
                          setVendorFormData({ ...vendorFormData, gstin: e.target.value })
                        }
                      />
                    </div>
                  )}
                  <div>
                    <Form.Label className="me-2">Enable GST</Form.Label>
                    <Form.Check
                      type="switch"
                      id="gstin-toggle"
                      checked={vendorFormData.gstEnabled}
                      onChange={(e) =>
                        setVendorFormData({
                          ...vendorFormData,
                          gstEnabled: e.target.checked,
                          gstin: e.target.checked ? vendorFormData.gstin : "",
                        })
                      }
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddEditModal(false)}>
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: "#53b2a5", border: "none" }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : selectedVendor ? `Update ${vendorType === 'vender' ? 'Vendor' : 'Customer'}` : `Save ${vendorType === 'vender' ? 'Vendor' : 'Customer'}`}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {vendorType === 'vender' ? 'Vendor' : 'Customer'} <strong>"{selectedVendor?.name}"</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteVendor}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
          <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            <li>Manage {vendorType === 'vender' ? 'Vendor' : 'Customer'} details including contact and billing information.</li>
            <li>Track payable balances and credit periods.</li>
            <li>Perform CRUD operations: add, view, edit, and delete {vendorType === 'vender' ? 'Vendors' : 'Customers'}.</li>
            <li>Import and export {vendorType === 'vender' ? 'Vendor' : 'Customer'} data using Excel templates.</li>
            <li>Assign account types and view transaction ledger for each {vendorType === 'vender' ? 'Vendor' : 'Customer'}.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default VendorsCustomers;