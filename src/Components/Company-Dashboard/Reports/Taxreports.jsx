import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";

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
    <Card className="p-3 rounded-4 mb-3 border">
      <Row className="g-3 align-items-center">
        <Col md={3}>
          <Form.Group className="d-flex flex-column">
            <Form.Label className="fw-semibold mb-1">Choose Date</Form.Label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable={true}
              className="form-control"
              dateFormat="dd/MM/yyyy"
              disabled // Backend doesn't support filtering yet
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group className="d-flex flex-column">
            <Form.Label className="fw-semibold mb-1">
              {type === "purchase" ? "Vendor" : "Customer"}
            </Form.Label>
            <Form.Select disabled>
              <option>All</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group className="d-flex flex-column">
            <Form.Label className="fw-semibold mb-1">Payment Method</Form.Label>
            <Form.Select disabled>
              <option>All</option>
              <option>Cash</option>
              <option>Stripe</option>
              <option>Paypal</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3} className="d-flex align-items-end">
          <Button className="w-100" style={{ backgroundColor: "#53b2a5", border: "none" }} disabled>
            Generate Report
          </Button>
        </Col>
      </Row>
    </Card>
  );

  const currentData = activeTab === "purchase" ? purchaseData : salesData;

  return (
    <div className="p-4 mt-4">
      {/* Tab Buttons */}
      <div className="d-flex gap-2 mb-3">
        <Button
          style={{
            backgroundColor: activeTab === "purchase" ? "#53b2a5" : "transparent",
            border: activeTab === "purchase" ? "none" : "1px solid #ccc",
            color: activeTab === "purchase" ? "#fff" : "#333",
          }}
          onClick={() => setActiveTab("purchase")}
        >
          Purchase Tax
        </Button>

        <Button
          style={{
            backgroundColor: activeTab === "sales" ? "#53b2a5" : "transparent",
            border: activeTab === "sales" ? "none" : "1px solid #ccc",
            color: activeTab === "sales" ? "#fff" : "#333",
          }}
          onClick={() => setActiveTab("sales")}
        >
          Sales Tax
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">Loading tax report...</div>
      ) : error ? (
        <div className="text-center py-5 text-danger">{error}</div>
      ) : (
        <Card className="rounded-4 p-4 border">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              {activeTab === "purchase" ? "Purchase Tax Report" : "Sales Tax Report"}
            </h5>
            <div className="d-flex gap-2">
              <Button variant="outline-danger" size="sm">
                <FaFilePdf />
              </Button>
              <Button variant="outline-success" size="sm">
                <FaFileExcel />
              </Button>
            </div>
          </div>

          {renderFilterSection(activeTab)}

          <Table hover responsive className="mb-0 border">
            <thead className="text-dark fw-semibold">
              <tr>
                <th>Reference</th>
                <th>{activeTab === "purchase" ? "Vendor" : "Customer"}</th>
                <th>{activeTab === "purchase" ? "Vendor (Arabic)" : "Customer (Arabic)"}</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Discount</th>
                <th>Tax Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.reference}</td>
                    <td>{activeTab === "purchase" ? row.vendor : row.customer}</td>
                    <td
                      className="text-end"
                      style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
                    >
                      {activeTab === "purchase" ? row.vendorArabic : row.customerArabic}
                    </td>
                    <td>{row.date}</td>
                    <td>{row.amount}</td>
                    <td>{row.payment}</td>
                    <td>{row.discount}</td>
                    <td>{row.tax}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-3">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination (static) */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
            <span className="small text-muted">
              Showing 1 to {currentData.length} of {currentData.length} results
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0 flex-wrap">
                <li className="page-item disabled">
                  <button className="page-link rounded-start">&laquo;</button>
                </li>
                <li className="page-item active">
                  <button
                    className="page-link"
                    style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa", color: "#fff" }}
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
        </Card>
      )}
    </div>
  );
};

export default TaxReport;