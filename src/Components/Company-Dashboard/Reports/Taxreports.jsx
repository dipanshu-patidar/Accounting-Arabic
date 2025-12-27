import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
  Spinner,
} from "react-bootstrap";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import './Taxreports.css';

const TaxReport = () => {
  const companyId = GetCompanyId();
  const [activeTab, setActiveTab] = useState("purchase");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [purchaseData, setPurchaseData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) {
      setError("Company ID is missing");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Purchase Tax Data
        const purchaseRes = await axiosInstance.get(`tax-report/purchase/${companyId}`);
        if (purchaseRes.data.success && Array.isArray(purchaseRes.data.data)) {
          setPurchaseData(
            purchaseRes.data.data.map((item) => ({
              reference: String(item.reference),
              vendor: item.vendor || "-",
              vendorArabic: item.vendor_arabic || "-",
              date: new Date(item.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              amount: Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              payment: item.payment_method || "-",
              discount: Number(item.discount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              tax: Number(item.tax_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            }))
          );
        }

        // Fetch Sales Tax Data
        const salesRes = await axiosInstance.get(`tax-report/sales/${companyId}`);
        if (salesRes.data.success && Array.isArray(salesRes.data.data)) {
          setSalesData(
            salesRes.data.data.map((item) => ({
              reference: String(item.reference),
              customer: item.customer || "-",
              customerArabic: item.customer_arabic || "-",
              date: new Date(item.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              amount: Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              payment: item.payment_method || "-",
              discount: Number(item.discount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              tax: Number(item.tax_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            }))
          );
        }
      } catch (err) {
        console.error("Tax Report API Error:", err);
        setError("Failed to load tax report data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  const renderFilterSection = (type) => (
    <Card className="filter-card border-0 shadow-lg mb-3">
      <Card.Body>
        <Row className="g-3 align-items-end">
          <Col md={3}>
            <Form.Group className="d-flex flex-column">
              <Form.Label className="filter-label">Choose Date</Form.Label>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                isClearable={true}
                className="form-control filter-date"
                dateFormat="dd/MM/yyyy"
                disabled // Backend doesn't support filtering yet
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group className="d-flex flex-column">
              <Form.Label className="filter-label">
                {type === "purchase" ? "Vendor" : "Customer"}
              </Form.Label>
              <Form.Select className="filter-select" disabled>
                <option>All</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group className="d-flex flex-column">
              <Form.Label className="filter-label">Payment Method</Form.Label>
              <Form.Select className="filter-select" disabled>
                <option>All</option>
                <option>Cash</option>
                <option>Stripe</option>
                <option>Paypal</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3} className="d-flex align-items-end">
            <Button className="w-100 btn-generate-report" disabled>
              Generate Report
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  const currentData = activeTab === "purchase" ? purchaseData : salesData;

  return (
    <div className="p-4 tax-report-container">
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="tax-report-title">
          <i className="fas fa-file-invoice-dollar me-2"></i>
          Tax Report
        </h3>
        <p className="tax-report-subtitle">View and analyze tax reports for purchases and sales</p>
      </div>

      {/* Tab Buttons */}
      <div className="tab-buttons-wrapper">
        <Button
          className={`tab-button ${activeTab === "purchase" ? "tab-button-active" : ""}`}
          onClick={() => setActiveTab("purchase")}
        >
          Purchase Tax
        </Button>

        <Button
          className={`tab-button ${activeTab === "sales" ? "tab-button-active" : ""}`}
          onClick={() => setActiveTab("sales")}
        >
          Sales Tax
        </Button>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" style={{ color: "#505ece" }} />
        </div>
      ) : error ? (
        <div className="error-container">
          <h5 className="text-danger">{error}</h5>
        </div>
      ) : (
        <Card className="tax-report-table-card border-0 shadow-lg">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">
                {activeTab === "purchase" ? "Purchase Tax Report" : "Sales Tax Report"}
              </h5>
              <div className="d-flex gap-2">
                <Button className="btn-export-pdf d-flex align-items-center">
                  <FaFilePdf className="me-2" />
                  <span>PDF ملف</span>
                </Button>
                <Button className="btn-export-excel d-flex align-items-center">
                  <FaFileExcel className="me-2" />
                  <span>Excel ملف</span>
                </Button>
              </div>
            </div>

            {renderFilterSection(activeTab)}

            <div style={{ overflowX: "auto" }}>
              <Table responsive className="tax-report-table align-middle" style={{ fontSize: 16 }}>
                <thead className="table-header">
                  <tr>
                    <th className="py-3">Reference</th>
                    <th className="py-3">{activeTab === "purchase" ? "Vendor" : "Customer"}</th>
                    <th className="py-3">{activeTab === "purchase" ? "Vendor (Arabic)" : "Customer (Arabic)"}</th>
                    <th className="py-3">Date</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Payment Method</th>
                    <th className="py-3">Discount</th>
                    <th className="py-3">Tax Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((row, idx) => (
                      <tr key={idx}>
                        <td><strong>{row.reference}</strong></td>
                        <td>{activeTab === "purchase" ? row.vendor : row.customer}</td>
                        <td
                          className="text-end"
                          style={{ fontFamily: "'Segoe UI', Arial, sans-serif", direction: "rtl" }}
                        >
                          {activeTab === "purchase" ? row.vendorArabic : row.customerArabic}
                        </td>
                        <td>{row.date}</td>
                        <td className="fw-bold">₹{row.amount}</td>
                        <td>{row.payment}</td>
                        <td>₹{row.discount}</td>
                        <td className="fw-bold text-danger">₹{row.tax}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-4">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default TaxReport;