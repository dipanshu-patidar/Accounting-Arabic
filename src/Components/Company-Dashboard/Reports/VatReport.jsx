import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
  Spinner,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import { CurrencyContext } from "../../../hooks/CurrencyContext";

const VatReport = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [filterType, setFilterType] = useState("All");
  const companyId = GetCompanyId();
  const [vatData, setVatData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Get currency context
  const { convertPrice, symbol } = useContext(CurrencyContext);

  const types = ["All", "Outward Supplies", "Inward Supplies", "Adjustments", "Exempt Supplies"];

  const fetchVatReport = async (signal) => { // ✅ Pass signal into the function
    if (!companyId) {
      setError("Company ID is missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = { company_id: companyId };
      const response = await axiosInstance.get("/vat-report", {
        params,
        // ✅ Pass the signal to the axios request
        signal: signal,
      });

      // ✅ No need to check if aborted here. If aborted, it will jump to the catch block.
      if (response.data?.success && Array.isArray(response.data.vatSummary)) {
        setVatData(response.data.vatSummary);
      } else {
        setVatData([]);
        setError("Unexpected response format.");
      }
    } catch (err) {
      // ✅ Check if the error is because the request was aborted
      // If it was, we just stop and don't show an error.
      if (axiosInstance.isCancel(err) || err.name === 'CanceledError') {
        console.log("Request was canceled.");
        return;
      }

      console.error("VAT Report fetch error:", err);
      setError("Failed to load VAT data. Please try again.");
      setVatData([]);
    } finally {
      // ✅ Only set loading to false if the request wasn't aborted
      // The check is not strictly necessary but is good practice.
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ 1. Create a new AbortController
    const controller = new AbortController();
    const { signal } = controller;

    // ✅ 2. Call the fetch function and pass the signal
    fetchVatReport(signal);

    // ✅ 3. This is the cleanup function for useEffect
    // It runs when the component unmounts.
    return () => {
      console.log("VatReport component is unmounting, cancelling request.");
      // Abort the request, which will trigger the 'catch' block in fetchVatReport
      controller.abort();
    };
  }, [companyId]); // Dependency array ensures this runs only when companyId changes

  const filteredRows = vatData.filter(
    (e) => filterType === "All" || e.type === filterType
  );

  return (
    <div className="p-4 mt-4">
      <h4 className="fw-bold">GCC VAT Return Report</h4>
      <p className="text-muted mb-4">Auto-generated VAT summary.</p>

      {/* 🔍 Filter Section */}
      <div className="shadow-sm rounded-4 p-4 mb-4 border">
        <Row className="g-3 align-items-end">
          <Col md={4}>
            <Form.Label className="fw-semibold">Choose Date</Form.Label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable
              className="form-control"
              dateFormat="dd/MM/yyyy"
              placeholderText="Select date range"
              disabled
            />
          </Col>
          <Col md={4}>
            <Form.Label className="fw-semibold">Transaction Type</Form.Label>
            <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              {types.map((t, i) => (
                <option key={i} value={t}>
                  {t}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Button
              variant=""
              style={{
                backgroundColor: "#27b2b6",
                borderColor: "#27b2b6",
                color: "white",
                width: "100%",
              }}
              className="py-2"
              onClick={() => {
                // ✅ For manual clicks, we create a new controller just for this call
                const controller = new AbortController();
                fetchVatReport(controller.signal);
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" /> Loading...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </Col>
        </Row>
      </div>

      {/* 📊 VAT Table */}
      <Card className="rounded-4 p-4 border-0">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <h5 className="fw-bold mb-2 mb-md-0">VAT Summary</h5>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" size="sm"><FaFilePdf /></Button>
            <Button variant="outline-success" size="sm"><FaFileExcel /></Button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <Table hover responsive className="border-2text-nowrap mb-0 align-middle">
          <thead className=" text-dark fw-semibold">
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Taxable Amount</th>
              <th>VAT Rate (%)</th>
              <th>VAT Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-3">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Loading VAT data...
                </td>
              </tr>
            ) : filteredRows.length > 0 ? (
              filteredRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.type}</td>
                  <td>{row.description}</td>
                  <td>
                    {symbol} {convertPrice(row.taxableAmount)}
                  </td>
                  <td>
                    {parseFloat(row.vatRate).toFixed(2)}%
                  </td>
                  <td>
                    {symbol} {convertPrice(row.vatAmount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted py-3">
                  No VAT records found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* Page Info */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
          <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            <li>VAT (Value Added Tax) is an indirect tax applied on the sale of goods and services.</li>
            <li>It is charged at every stage of the supply chain — from manufacturer to retailer.</li>
            <li>The final consumer ultimately bears the VAT cost while businesses collect and remit it.</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default VatReport;