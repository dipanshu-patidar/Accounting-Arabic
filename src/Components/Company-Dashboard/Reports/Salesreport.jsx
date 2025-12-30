import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { BsGear } from 'react-icons/bs';
import { BiSolidReport, BiSolidDollarCircle } from 'react-icons/bi';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';
import {
  Table,
  Card,
  Row,
  Col,
  ToastContainer,
  Toast,
} from "react-bootstrap";

const Salesreport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const companyId = GetCompanyId();

  const [summary, setSummary] = useState({
    totalAmount: '$0.00',
    totalPaid: '$0.00',
    totalUnpaid: '$0.00',
    overdue: '$0.00',
  });

  const [detailedData, setDetailedData] = useState([]);
  const [pagination, setPagination] = useState({
    showingFrom: 0,
    showingTo: 0,
    totalRecords: 0,
  });

  const [loading, setLoading] = useState(false);
  const [errorToast, setErrorToast] = useState({ show: false, message: '' });

  const fetchReports = async () => {
    if (!companyId) {
      setErrorToast({ show: true, message: 'Company ID is missing. Please log in again.' });
      return;
    }

    setLoading(true);
    setErrorToast({ show: false, message: '' });

    try {
      const params = { company_id: companyId };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (category) params.category = category;

      const res = await axiosInstance.get('/sales-reports/salesummary', { params });

      if (res.data?.success) {
        const { totals, table } = res.data;

        // Format summary totals
        setSummary({
          totalAmount: `$${Number(totals.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          totalPaid: `$${Number(totals.totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          totalUnpaid: `$${Number(totals.totalUnpaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          overdue: `$${Number(totals.overdue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        });

        // Format table rows
        const formattedData = (table || []).map((item) => ({
          sku: item.sku || 'N/A',
          customerName: item.customerName || 'N/A',
          customerNameArabic: item.customerArabicName || 'N/A',
          productName: item.productName || 'N/A',
          category: item.category || 'N/A',
          soldQty: item.soldQty || 0,
          soldAmount: `$${Number(item.soldAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          instockQty: item.instockQty || 0,
          status: item.status
            ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
            : 'Pending',
        }));

        setDetailedData(formattedData);
        setPagination({
          showingFrom: formattedData.length > 0 ? 1 : 0,
          showingTo: formattedData.length,
          totalRecords: formattedData.length,
        });
      } else {
        setSummary({ totalAmount: '$0.00', totalPaid: '$0.00', totalUnpaid: '$0.00', overdue: '$0.00' });
        setDetailedData([]);
        setPagination({ showingFrom: 0, showingTo: 0, totalRecords: 0 });
      }
    } catch (err) {
      console.error('API Error:', err);
      setErrorToast({
        show: true,
        message: err?.response?.data?.message || 'Failed to load sales data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [companyId]);

  // Client-side filtering
  const filteredData = detailedData.filter((row) =>
    row.customerName.toLowerCase().includes(customerSearch.toLowerCase()) &&
    row.productName.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Demo: cycle status
  const cycleStatus = (index) => {
    const statuses = ["Paid", "Pending", "Overdue"];
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
    fetchReports();
  };

  return (
    <div className="container my-4">
      <div className="mb-4">
        <h4 className="fw-bold">Sales Report</h4>
        <p className="text-muted">Manage your Sales report</p>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="shadow-sm rounded p-3 bg-white border border-success d-flex align-items-center justify-content-between w-100">
            <div>
              <small className="text-muted">Total Amount</small>
              <h5 className="fw-bold">{summary.totalAmount}</h5>
            </div>
            <BiSolidDollarCircle size={28} color="#4CAF50" />
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="shadow-sm rounded p-3 bg-white border border-primary d-flex align-items-center justify-content-between w-100">
            <div>
              <small className="text-muted">Total Paid</small>
              <h5 className="fw-bold">{summary.totalPaid}</h5>
            </div>
            <BiSolidDollarCircle size={28} color="#1A73E8" />
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="shadow-sm rounded p-3 bg-white border border-warning d-flex align-items-center justify-content-between w-100">
            <div>
              <small className="text-muted">Total Unpaid</small>
              <h5 className="fw-bold">{summary.totalUnpaid}</h5>
            </div>
            <BiSolidDollarCircle size={28} color="#EF6C00" />
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="shadow-sm rounded p-3 bg-white border border-danger d-flex align-items-center justify-content-between w-100">
            <div>
              <small className="text-muted">Overdue</small>
              <h5 className="fw-bold">{summary.overdue}</h5>
            </div>
            <BiSolidReport size={28} color="#D32F2F" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleGenerate}>
        <div className="bg-white p-3 rounded mb-3 shadow-sm row g-3">
          <div className="col-12 col-md-3">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All</option>
              <option value="Computers">Computers</option>
              <option value="Electronics">Electronics</option>
              <option value="Shoe">Shoe</option>
              <option value="demo1">demo1</option>
              <option value="Iphone">Iphone</option>
            </select>
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Search Customer Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search Customer..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Search Product Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search Product..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-3 d-flex align-items-end">
            <button
              type="submit"
              className="btn w-100"
              style={{ backgroundColor: '#505ece', color: '#fff' }}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <h5 className="fw-bold mb-0">Sales Report</h5>
          <div className="d-flex gap-2">
            <button className="btn btn-light">
              <FaFilePdf className="text-danger" />
            </button>
            <button className="btn btn-light">
              <FaFileExcel className="text-success" />
            </button>
            {/* <button className="btn btn-light">
              <BsGear />
            </button> */}
          </div>
        </div>

        <div className="table-responsive">
          <Table className="table table-bordered">
            <thead className="">
              <tr>
                <th>SKU</th>
                <th>Customer Name</th>
                <th>Customer Name (Arabic)</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Sold Qty</th>
                <th>Sold Amount</th>
                <th>Instock Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted">
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((row, i) => (
                  <tr key={i}>
                    <td>{row.sku}</td>
                    <td>{row.customerName}</td>
                    <td className="text-end" style={{ fontFamily: 'Arial, sans-serif' }}>
                      {row.customerNameArabic}
                    </td>
                    <td>{row.productName}</td>
                    <td>{row.category}</td>
                    <td>{row.soldQty}</td>
                    <td>{row.soldAmount}</td>
                    <td>{row.instockQty}</td>
                    <td>
                      <span
                        role="button"
                        onClick={() => cycleStatus(i)}
                        className={`badge ${
                          row.status === "Paid"
                            ? "bg-success"
                            : row.status === "Pending"
                            ? "bg-warning text-dark"
                            : "bg-danger"
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-muted">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination Footer */}
          <div className="d-flex justify-content-between align-items-center mt-3 px-3">
            <span className="small text-muted">
              Showing {pagination.showingFrom} to {pagination.showingTo} of{' '}
              {pagination.totalRecords} results
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <button className="page-link rounded-start">&laquo;</button>
                </li>
                <li className="page-item active">
                  <button
                    className="page-link"
                    style={{ backgroundColor: '#3daaaaff', borderColor: '#3daaaaff' }}
                  >
                    1
                  </button>
                </li>
                <li className="page-item disabled">
                  <button className="page-link rounded-end">&raquo;</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Page Description */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
          <ul className="text-muted fs-6 mb-0" style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
            <li>Generate and manage detailed sales reports across stores and products.</li>
            <li>Filter reports by date, store, and product for precise insights.</li>
            <li>View key sales metrics: total amount, paid, unpaid, and overdue.</li>
            <li>Export reports in PDF or Excel format for offline use or sharing.</li>
            <li>Analyze product-wise performance including sold quantity and revenue.</li>
          </ul>
        </Card.Body>
      </Card>

      {/* Toast for errors */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg="danger"
          onClose={() => setErrorToast({ show: false, message: '' })}
          show={errorToast.show}
          delay={5000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{errorToast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Salesreport;