import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { BsGear } from "react-icons/bs";
import { BiSolidReport, BiSolidDollarCircle } from "react-icons/bi";
import { Card, Table, Row, Col, ToastContainer, Toast } from "react-bootstrap";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";

const Purchasereport = () => {
  const [vendorSearch, setVendorSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const companyId = GetCompanyId();

  const [summary, setSummary] = useState({
    totalPurchase: "$0.00",
    paidAmount: "$0.00",
    pendingPayment: "$0.00",
    overdue: "$0.00",
  });

  const [detailedData, setDetailedData] = useState([]);
  const [pagination, setPagination] = useState({
    showingFrom: 0,
    showingTo: 0,
    totalRecords: 0,
  });

  const [loading, setLoading] = useState(false);
  const [errorToast, setErrorToast] = useState({ show: false, message: "" });

  const fetchPurchaseReports = async () => {
    if (!companyId) {
      setErrorToast({ show: true, message: "Company ID missing. Please log in again." });
      return;
    }

    setLoading(true);
    setErrorToast({ show: false, message: "" });

    try {
      const params = { company_id: companyId }; // 🔸 Note: API uses `company_id`, not `companyId`
      if (dateFilter) params.date = dateFilter;

      // 🔄 Single endpoint returns both summary + table (based on your response)
      const response = await axiosInstance.get("/purchase-reports/summary", { params });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Invalid response from server");
      }

      const { summary: apiSummary, table: apiTable } = response.data;

      // ✅ Format Summary
      const formatCurrency = (val) =>
        `$${Number(val || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

      setSummary({
        totalPurchase: formatCurrency(apiSummary.totalPurchase),
        paidAmount: formatCurrency(apiSummary.paidAmount),
        pendingPayment: formatCurrency(apiSummary.pendingPayment),
        overdue: formatCurrency(apiSummary.overdue),
      });

      // ✅ Format Table Data
      const formatted = (apiTable || []).map((item) => ({
        po: item.poNumber || "N/A",
        vendor: item.vendorName || "N/A",
        vendorArabic: item.vendorArabicName || "N/A",
        product: item.productName || "N/A",
        category: item.category || "N/A",
        qty: item.qtyOrdered || 0,
        unitPrice: formatCurrency(item.unitPrice),
        total: formatCurrency(item.totalAmount),
        status: item.status || "Pending",
      }));

      setDetailedData(formatted);
      const total = formatted.length;
      setPagination({
        showingFrom: total > 0 ? 1 : 0,
        showingTo: total,
        totalRecords: total,
      });
    } catch (err) {
      console.error("Purchase Report Error:", err);
      setErrorToast({
        show: true,
        message: err?.response?.data?.message || "Failed to load purchase data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseReports();
  }, [companyId]);

  // 🔍 Client-side filtering
  const filteredData = detailedData.filter((row) =>
    row.vendor.toLowerCase().includes(vendorSearch.toLowerCase()) &&
    row.category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // 🔁 Demo-only status cycling (optional)
  const cycleStatus = (index) => {
    const statuses = ["Paid", "Pending", "Overdue", "Partial"];
    setDetailedData((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              status: statuses[(statuses.indexOf(row.status) + 1) % statuses.length],
            }
          : row
      )
    );
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    fetchPurchaseReports();
  };

  return (
    <div className="container my-4">
      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Purchase", value: summary.totalPurchase, color: "#4CAF50", icon: <BiSolidDollarCircle size={28} color="#4CAF50" /> },
          { label: "Paid Amount", value: summary.paidAmount, color: "#1A73E8", icon: <BiSolidDollarCircle size={28} color="#1A73E8" /> },
          { label: "Pending Payment", value: summary.pendingPayment, color: "#EF6C00", icon: <BiSolidDollarCircle size={28} color="#EF6C00" /> },
          { label: "Overdue", value: summary.overdue, color: "#D32F2F", icon: <BiSolidReport size={28} color="#D32F2F" /> },
        ].map((card, idx) => (
          <div className="col-12 col-md-3" key={idx}>
            <div className="shadow-sm rounded p-3 bg-white border d-flex align-items-center justify-content-between w-100"
              style={{ borderColor: card.color }}>
              <div>
                <small className="text-muted">{card.label}</small>
                <h5 className="fw-bold">{card.value}</h5>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form onSubmit={handleGenerate}>
        <div className="bg-white p-3 rounded mb-3 shadow-sm row g-3">
          <div className="col-12 col-md-3">
            <label className="form-label">Choose Date</label>
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Search Vendor</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search Vendor..."
              value={vendorSearch}
              onChange={(e) => setVendorSearch(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Search Category</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search Category..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3 d-flex align-items-end">
            <button
              type="submit"
              className="btn w-100"
              style={{ backgroundColor: "#505ece", color: "#fff" }}
              disabled={loading}
            >
              {loading ? "Loading..." : "Generate Report"}
            </button>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="fw-bold mb-0">Purchase Report</h5>
          <div className="d-flex gap-2">
            <button className="btn btn-light"><FaFilePdf className="text-danger" /></button>
            <button className="btn btn-light"><FaFileExcel className="text-success" /></button>
            {/* <button className="btn btn-light"><BsGear /></button> */}
          </div>
        </div>

        <div className="table-responsive">
          <Table className="table table-bordered">
            <thead className="">
              <tr>
                <th>PO #</th>
                <th>Vendor</th>
                <th>Vendor (Arabic)</th>
                <th>Product</th>
                <th>Category</th>
                <th>Qty Ordered</th>
                <th>Unit Price</th>
                <th>Total Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="text-center text-muted">Loading...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((row, i) => (
                  <tr key={i}>
                    <td>{row.po}</td>
                    <td>{row.vendor}</td>
                    <td style={{ fontFamily: "Segoe UI, Arial, sans-serif", textAlign: "end" }}>
                      {row.vendorArabic}
                    </td>
                    <td>{row.product}</td>
                    <td>{row.category}</td>
                    <td>{row.qty}</td>
                    <td>{row.unitPrice}</td>
                    <td>{row.total}</td>
                    <td>
                      <span
                        role="button"
                        onClick={() => cycleStatus(i)}
                        className={`badge ${
                          row.status === "Paid" ? "bg-success" :
                          row.status === "Pending" ? "bg-warning text-dark" :
                          row.status === "Partial" ? "bg-info" :
                          "bg-danger"
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" className="text-center text-muted">No matching records found</td></tr>
              )}
            </tbody>
          </Table>

          {/* Pagination Footer */}
          <div className="d-flex justify-content-between align-items-center mt-3 px-3">
            <span className="small text-muted">
              Showing {pagination.showingFrom} to {pagination.showingTo} of {pagination.totalRecords} results
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled"><button className="page-link">&laquo;</button></li>
                <li className="page-item active">
                  <button className="page-link" style={{ backgroundColor: "#3daaaaff", borderColor: "#3daaaaff" }}>1</button>
                </li>
                <li className="page-item disabled"><button className="page-link">&raquo;</button></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg="danger"
          onClose={() => setErrorToast({ show: false, message: "" })}
          show={errorToast.show}
          delay={5000}
          autohide
        >
          <Toast.Header><strong className="me-auto">Error</strong></Toast.Header>
          <Toast.Body className="text-white">{errorToast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Purchasereport;