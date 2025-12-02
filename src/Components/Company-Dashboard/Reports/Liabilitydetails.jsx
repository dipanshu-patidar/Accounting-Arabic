// components/LiabilityDetails.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Table,
  Badge,
  Form,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import GetCompanyId from "../../../Api/GetCompanyId";
import BaseUrl from "../../../Api/BaseUrl";

const LiabilityDetails = () => {
  // 📥 API data states
  const companyId = GetCompanyId();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState({
    currentLiabilities: { rows: [], total: 0 },
    longTermLiabilities: { rows: [], total: 0 },
    ownersCapital: { rows: [], total: 0 },
  });

  // 🔍 Filter states
  const [currentFilter, setCurrentFilter] = useState({ supplier: "", status: "", due: "" });
  const [longTermFilter, setLongTermFilter] = useState({ loan: "", maturity: "" });
  const [capitalFilter, setCapitalFilter] = useState({ owner: "", type: "" });

  // 🔄 Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BaseUrl}balance-sheet/liability-capital/${companyId}`);
        if (!response.ok) throw new Error("Failed to fetch liability data");
        const result = await response.json();
        if (result.success) {
          setApiData({
            currentLiabilities: result.currentLiabilities || { rows: [], total: 0 },
            longTermLiabilities: result.longTermLiabilities || { rows: [], total: 0 },
            ownersCapital: result.ownersCapital || { rows: [], total: 0 },
          });
        } else {
          throw new Error("API returned success: false");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 💡 Helper: Format as USD
  const formatUSD = (num) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // 💡 Helper: Parse amount (e.g., "$100,000" → 100000)
  const parseAmount = (str) => {
    // Convert to string safely; handle null/undefined/numbers
    const safeStr = String(str ?? "").trim();
    // Remove $ and commas, then parse
    return parseFloat(safeStr.replace(/[$,]/g, "")) || 0;
  };
  // 🔎 Filtered Data
  const filteredCurrent = apiData.currentLiabilities.rows.filter((item) => {
    const supplier = item.supplier || item.expense || "";
    return (
      supplier.toLowerCase().includes(currentFilter.supplier.toLowerCase()) &&
      (!currentFilter.status || item.status === currentFilter.status) &&
      (!currentFilter.due || item.due === currentFilter.due)
    );
  });

  const filteredLongTerm = apiData.longTermLiabilities.rows.filter((item) => {
    return (
      item.loan?.toLowerCase().includes(longTermFilter.loan.toLowerCase()) &&
      (!longTermFilter.maturity || item.maturity === longTermFilter.maturity)
    );
  });

  const filteredCapital = apiData.ownersCapital.rows.filter((item) => {
    return (
      item.owner?.toLowerCase().includes(capitalFilter.owner.toLowerCase()) &&
      item.type?.toLowerCase().includes(capitalFilter.type.toLowerCase())
    );
  });

  // 🧮 Compute totals from filtered data (more accurate than API total when filtered)
  const totalCurrent = filteredCurrent.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const totalLongTerm = filteredLongTerm.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const totalCapital = filteredCapital.reduce((sum, item) => sum + parseAmount(item.capital), 0);
  const grandTotal = totalCurrent + totalLongTerm + totalCapital;

  // ❗ Loading & Error UI
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading liability & capital details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <h4 className="text-danger">⚠️ Error loading data</h4>
        <p>{error}</p>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="align-items-center mb-4">
        <Col xs={6} className="text-start">
          <h3 className="mb-0" style={{ color: "#002d4d" }}>
            📉 All Liability & Capital Details
          </h3>
        </Col>
        <Col xs={6} className="text-end">
          <Button
            variant="secondary"
            onClick={() => window.history.back()}
            style={{
              backgroundColor: "#53b2a5",
              borderColor: "#53b2a5",
              padding: "6px 12px",
              fontSize: "14px",
              fontWeight: 500,
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            ← Back to Balance Sheet
          </Button>
        </Col>
      </Row>

      {/* Current Liabilities */}
      <Card className="mb-4">
        <Card.Header bg="danger" text="white">
          <strong>Current Liabilities</strong>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col xs={12} md={4}>
              <Form.Control
                type="text"
                placeholder="Supplier/Expense"
                value={currentFilter.supplier}
                onChange={(e) => setCurrentFilter({ ...currentFilter, supplier: e.target.value })}
              />
            </Col>
            <Col xs={12} md={4}>
              <Form.Select
                value={currentFilter.status}
                onChange={(e) => setCurrentFilter({ ...currentFilter, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Paid">Paid</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={3}>
              <Form.Control
                type="date"
                value={currentFilter.due}
                onChange={(e) => setCurrentFilter({ ...currentFilter, due: e.target.value })}
              />
            </Col>
            <Col xs={12} md={1}>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => setCurrentFilter({ supplier: "", status: "", due: "" })}
              >
                🗑️
              </Button>
            </Col>
          </Row>
          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Supplier / Expense</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCurrent.length > 0 ? (
                  filteredCurrent.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.supplier || row.expense}</td>
                      <td>{row.amount}</td>
                      <td>{row.dueDate ? row.dueDate.split('T')[0] : "-"}</td>
                      <td>
                        <Badge
                          bg={
                            row.status === "Overdue"
                              ? "danger"
                              : row.status === "Pending"
                                ? "warning"
                                : "success"
                          }
                        >
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No current liabilities</td>
                  </tr>
                )}
                <tr className="table-light font-weight-bold">
                  <td colSpan="2"><strong>Total</strong></td>
                  <td colSpan="2" className="text-end"><strong>{formatUSD(totalCurrent)}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Long-term Liabilities */}
      <Card className="mb-4">
        <Card.Header bg="secondary" text="white">
          <strong>Long-term Liabilities</strong>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col xs={12} md={6}>
              <Form.Control
                type="text"
                placeholder="Loan Type"
                value={longTermFilter.loan}
                onChange={(e) => setLongTermFilter({ ...longTermFilter, loan: e.target.value })}
              />
            </Col>
            <Col xs={12} md={5}>
              <Form.Select
                value={longTermFilter.maturity}
                onChange={(e) => setLongTermFilter({ ...longTermFilter, maturity: e.target.value })}
              >
                <option value="">All Years</option>
                <option value="2030">2030</option>
                <option value="2035">2035</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={1}>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => setLongTermFilter({ loan: "", maturity: "" })}
              >
                🗑️
              </Button>
            </Col>
          </Row>
          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Loan</th>
                  <th>Amount</th>
                  <th>Interest Rate</th>
                  <th>Maturity</th>
                </tr>
              </thead>
              <tbody>
                {filteredLongTerm.length > 0 ? (
                  filteredLongTerm.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.loan}</td>
                      <td>{row.amount}</td>
                      <td>{row.rate}</td>
                      <td>{row.maturity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No long-term liabilities</td>
                  </tr>
                )}
                <tr className="table-light font-weight-bold">
                  <td colSpan="2"><strong>Total</strong></td>
                  <td colSpan="2" className="text-end"><strong>{formatUSD(totalLongTerm)}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Owner's Capital */}
      <Card className="mb-4">
        <Card.Header bg="success" text="white">
          <strong>Owner’s Capital</strong>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col xs={12} md={6}>
              <Form.Control
                type="text"
                placeholder="Owner / Type"
                value={capitalFilter.owner}
                onChange={(e) => setCapitalFilter({ ...capitalFilter, owner: e.target.value })}
              />
            </Col>
            <Col xs={12} md={5}>
              <Form.Select
                value={capitalFilter.type}
                onChange={(e) => setCapitalFilter({ ...capitalFilter, type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="Initial Investment">Initial Investment</option>
                <option value="Accumulated Profits">Accumulated Profits</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={1}>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => setCapitalFilter({ owner: "", type: "" })}
              >
                🗑️
              </Button>
            </Col>
          </Row>
          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Owner / Source</th>
                  <th>Capital</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredCapital.length > 0 ? (
                  filteredCapital.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.owner}</td>
                      <td>{row.capital}</td>
                      <td>{row.type}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">No capital entries</td>
                  </tr>
                )}
                <tr className="table-light font-weight-bold">
                  <td colSpan="1"><strong>Total</strong></td>
                  <td colSpan="2" className="text-end"><strong>{formatUSD(totalCapital)}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* 🏁 Grand Total */}
      <Card bg="dark" text="white" className="text-center p-3 mb-4">
        <h5>
          Grand Total of Liabilities & Capital: <strong>{formatUSD(grandTotal)}</strong>
        </h5>
      </Card>
    </Container>
  );
};

export default LiabilityDetails;