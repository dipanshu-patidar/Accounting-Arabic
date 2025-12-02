import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

// Utility to format currency
const formatUSD = (num) =>
  "$" + (typeof num === 'number' ? num : 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CashFlow = () => {
  const companyId = GetCompanyId();
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [cashFlowData, setCashFlowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchCashFlow = async () => {
      if (!companyId) {
        setError("Company ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`cashflow-reports/cashflow/${companyId}`);

        if (response.data.success && Array.isArray(response.data.data)) {
          const mappedData = response.data.data.map((item) => ({
            date: formatDate(item.date),
            bank: item.bankAccount || "-",
            desc: item.description || "",
            credit: item.credit || 0,
            debit: item.debit || 0,
            accBal: item.accountBalance || 0,
            totalBal: item.totalBalance || 0,
            method: item.paymentMethod || "N/A",
            raw: item.raw, // optional: keep raw for debugging
          }));
          setCashFlowData(mappedData);
        } else {
          setError("Invalid data format from API");
        }
      } catch (err) {
        console.error("Failed to fetch cash flow:", err);
        setError("Failed to load cash flow data");
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlow();
  }, [companyId]);

  // Payment methods for filter
  const paymentMethods = [
    "All",
    ...Array.from(new Set(cashFlowData.map((d) => d.method))),
  ];

  // Filter logic
  const filtered = cashFlowData.filter(
    (row) =>
      (method === "All" || row.method === method) &&
      (row.date.toLowerCase().includes(search.toLowerCase()) ||
        row.bank.toLowerCase().includes(search.toLowerCase()) ||
        row.desc.toLowerCase().includes(search.toLowerCase()) ||
        row.method.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // PDF Export
  const handlePDF = () => {
    const doc = new jsPDF();
    doc.text("Cash Flow Report", 14, 16);
    doc.autoTable({
      startY: 22,
      head: [
        [
          "Date",
          "Bank & Account Number",
          "Description",
          "Credit",
          "Debit",
          "Account balance",
          "Total Balance",
          "Payment Method",
        ],
      ],
      body: filtered.map((row) => [
        row.date,
        row.bank,
        row.desc,
        formatUSD(row.credit),
        formatUSD(row.debit),
        formatUSD(row.accBal),
        formatUSD(row.totalBal),
        row.method,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [245, 246, 250], textColor: 60 },
    });
    doc.save("cashflow.pdf");
  };

  // Loading & error UI
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div>Loading cash flow data...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <div className="text-danger">Error: {error}</div>
      </Container>
    );
  }

  return (
    <div>
      <Container fluid className="py-2">
        <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 0 }}>
          Cash Flow
        </div>
        <div style={{ color: "#888", fontSize: 17, marginBottom: 24 }}>
          View Your Cashflows
        </div>
        <Card className="mb-3">
          <Card.Body style={{ padding: 0 }}>
            <Row className="g-2 align-items-center p-3 pb-0">
              <Col xs={12} md={6} className="mb-2 mb-md-0">
                <InputGroup>
                  <Form.Control
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col xs={8} md={3}>
                <Form.Select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>
                      {m === "All" ? "Payment Method" : m}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={4} md={3} className="text-end">
                <Button
                  variant="light"
                  style={{
                    border: "none",
                    background: "#fff",
                    boxShadow: "0 1px 4px #0001",
                  }}
                  onClick={handlePDF}
                  title="Download PDF"
                  disabled={filtered.length === 0}
                >
                  <FaFilePdf size={26} color="#ff6f61" />
                </Button>
              </Col>
            </Row>
            <div style={{ overflowX: "auto" }}>
              <Table
                responsive
                className="align-middle mb-0"
                style={{
                  minWidth: 900,
                  fontSize: 16,
                
                }}
              >
                <thead className="">
                  <tr>
                    <th className="px-3 py-3">Date</th>
                    <th>Bank & Account Number</th>
                    <th>Description</th>
                    <th>Credit</th>
                    <th>Debit</th>
                    <th>Account balance</th>
                    <th>Total Balance</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-3">{row.date}</td>
                      <td>{row.bank}</td>
                      <td>{row.desc}</td>
                      <td>{formatUSD(row.credit)}</td>
                      <td>{formatUSD(row.debit)}</td>
                      <td>{formatUSD(row.accBal)}</td>
                      <td>{formatUSD(row.totalBal)}</td>
                      <td>{row.method}</td>
                    </tr>
                  ))}
                  {currentData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center text-muted">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3 px-3 pb-3">
              <span className="small text-muted">
                Showing {filtered.length === 0 ? 0 : indexOfFirst + 1} to{" "}
                {Math.min(indexOfLast, filtered.length)} of {filtered.length}{" "}
                results
              </span>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""
                      }`}
                  >
                    <button
                      className="page-link rounded-start"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      &laquo;
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i + 1}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""
                        }`}
                    >
                      <button
                        className="page-link"
                        style={
                          currentPage === i + 1
                            ? {
                              backgroundColor: "#3daaaa",
                              borderColor: "#3daaaa",
                            }
                            : {}
                        }
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${currentPage === totalPages ? "disabled" : ""
                      }`}
                  >
                    <button
                      className="page-link rounded-end"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, totalPages)
                        )
                      }
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </Card.Body>
        </Card>
      </Container>
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
              Shows how much cash is flowing in and out of your business over a
              specific time period.
            </li>
            <li>Tracks actual cash movement — not just profits on paper.</li>
            <li>
              Helps you manage liquidity, plan payments, and avoid cash
              shortages.
            </li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CashFlow;