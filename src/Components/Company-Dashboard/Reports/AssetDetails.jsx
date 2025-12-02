// components/AssetDetails.js
import React, { useState, useEffect } from "react";
import { Container, Card, Button, Table, Badge, Form, Row, Col, Spinner } from "react-bootstrap";
import BaseUrl from "../../../Api/BaseUrl";
import GetCompanyId from "../../../Api/GetCompanyId";

const AssetDetails = () => {
  // 📥 State for API data
  const companyId = GetCompanyId();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState({
    cashInflows: [],
    bankTransactions: [],
    inventory: [],
    receivables: [],
    inventoryTotal: 0,
    receivableTotal: 0,
  });

  // 🔍 Filter states (unchanged)
  const [cashFilter, setCashFilter] = useState({ customer: "", date: "" });
  const [bankFilter, setBankFilter] = useState({ customer: "", bank: "", date: "" });
  const [stockFilter, setStockFilter] = useState({ product: "", category: "" });
  const [receivableFilter, setReceivableFilter] = useState({ customer: "", status: "", due: "" });

  // 🔄 Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BaseUrl}balance-sheet/AssetsDetails/${companyId}`);
        if (!response.ok) throw new Error("Failed to fetch asset data");
        const result = await response.json();
        if (result.success) {
          setApiData({
            cashInflows: result.cashInflows || [],
            bankTransactions: result.bankTransactions || [],
            inventory: result.inventory || [],
            receivables: result.receivables || [],
            inventoryTotal: result.inventoryTotal || 0,
            receivableTotal: result.receivableTotal || 0,
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

  // 💡 Helper: Format numbers as USD
  const formatUSD = (num) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // 💡 Helper: Parse amount strings (e.g., "$15,000" → 15000)
  const parseAmount = (str) => {
    // Convert to string if it's not already
    const amountStr = String(str ?? "").trim();
    // Remove $ and commas, then parse
    return parseFloat(amountStr.replace(/[$,]/g, "")) || 0;
  };

  // 🔎 Filtered Data
  const filteredCash = apiData.cashInflows.filter((item) => {
    const customer = String(item.customer ?? "").toLowerCase();
    const filterCustomer = cashFilter.customer.toLowerCase();
    return (
      customer.includes(filterCustomer) &&
      (!cashFilter.date || item.date === cashFilter.date)
    );
  });

  const filteredBank = apiData.bankTransactions.filter((item) => {
    const customer = String(item.customer ?? "").toLowerCase();
    const bank = String(item.bank ?? "").toLowerCase();
    return (
      customer.includes(bankFilter.customer.toLowerCase()) &&
      bank.includes(bankFilter.bank.toLowerCase()) &&
      (!bankFilter.date || item.date === bankFilter.date)
    );
  });

  const filteredStock = apiData.inventory.filter((item) => {
    const product = String(item.product ?? "").toLowerCase();
    const category = String(item.category ?? "").toLowerCase();
    return (
      product.includes(stockFilter.product.toLowerCase()) &&
      category.includes(stockFilter.category.toLowerCase())
    );
  });

  const filteredReceivable = apiData.receivables.filter((item) => {
    return (
      item.customer?.toLowerCase().includes(receivableFilter.customer.toLowerCase()) &&
      (!receivableFilter.status || item.status === receivableFilter.status) &&
      (!receivableFilter.due || item.due === receivableFilter.due)
    );
  });

  // 🧮 Totals
  const totalCash = filteredCash.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const totalBank = filteredBank.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const totalStock = filteredStock.reduce((sum, item) => sum + parseAmount(item.value), 0);
  const totalReceivable = filteredReceivable.reduce((sum, item) => sum + parseAmount(item.amount), 0);

  const grandTotal = totalCash + totalBank + totalStock + totalReceivable;

  // ❗ Handle loading & error
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading asset details...</p>
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
            📊 All Asset Details
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

      {/* Cash */}
      <Card className="mb-4">
        <Card.Header bg="success" text="white">
          <strong>Cash Inflows</strong>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col xs={12} md={5}>
              <Form.Control
                type="text"
                placeholder="Search Customer"
                value={cashFilter.customer}
                onChange={(e) => setCashFilter({ ...cashFilter, customer: e.target.value })}
              />
            </Col>
            <Col xs={12} md={5}>
              <Form.Control
                type="date"
                value={cashFilter.date}
                onChange={(e) => setCashFilter({ ...cashFilter, date: e.target.value })}
              />
            </Col>
            <Col xs={12} md={2}>
              <Button variant="outline-secondary" size="sm" onClick={() => setCashFilter({ customer: "", date: "" })}>
                Clear
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {filteredCash.length > 0 ? (
                  filteredCash.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.customer}</td>
                      <td>{row.amount}</td>
                      <td>{row.date}</td>
                      <td>{row.mode}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No cash inflows</td>
                  </tr>
                )}
                <tr className="table-light font-weight-bold">
                  <td colSpan="1"><strong>Total</strong></td>
                  <td colSpan="3" className="text-end"><strong>{formatUSD(totalCash)}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Bank */}
      <Card className="mb-4">
        <Card.Header bg="primary" text="white">
          <strong>Bank Transactions</strong>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col xs={12} md={4}>
              <Form.Control
                type="text"
                placeholder="Customer"
                value={bankFilter.customer}
                onChange={(e) => setBankFilter({ ...bankFilter, customer: e.target.value })}
              />
            </Col>
            <Col xs={12} md={4}>
              <Form.Control
                type="text"
                placeholder="Bank"
                value={bankFilter.bank}
                onChange={(e) => setBankFilter({ ...bankFilter, bank: e.target.value })}
              />
            </Col>
            <Col xs={12} md={3}>
              <Form.Control
                type="date"
                value={bankFilter.date}
                onChange={(e) => setBankFilter({ ...bankFilter, date: e.target.value })}
              />
            </Col>
            <Col xs={12} md={1}>
              <Button variant="outline-secondary" size="sm" onClick={() => setBankFilter({ customer: "", bank: "", date: "" })}>
                🗑️
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Ref</th>
                  <th>Bank</th>
                </tr>
              </thead>
              <tbody>
                {filteredBank.length > 0 ? (
                  filteredBank.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.customer}</td>
                      <td>{row.amount}</td>
                      <td>{row.date}</td>
                      <td>{row.ref}</td>
                      <td>{row.bank}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No bank transactions</td>
                  </tr>
                )}
                <tr className="table-light font-weight-bold">
                  <td colSpan="2"><strong>Total</strong></td>
                  <td colSpan="3" className="text-end"><strong>{formatUSD(totalBank)}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Stock */}
      <Card className="mb-4">
        <Card.Header bg="info" text="white">
          <strong>Inventory Details</strong>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col xs={12} md={6}>
              <Form.Control
                type="text"
                placeholder="Search Product"
                value={stockFilter.product}
                onChange={(e) => setStockFilter({ ...stockFilter, product: e.target.value })}
              />
            </Col>
            <Col xs={12} md={5}>
              <Form.Select
                value={stockFilter.category}
                onChange={(e) => setStockFilter({ ...stockFilter, category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Accessories">Accessories</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={1}>
              <Button variant="outline-secondary" size="sm" onClick={() => setStockFilter({ product: "", category: "" })}>
                🗑️
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Value</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.length > 0 ? (
                  filteredStock.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.product}</td>
                      <td>{row.qty}</td>
                      <td>{row.value}</td>
                      <td>{row.category}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No inventory items</td>
                  </tr>
                )}
                <tr className="table-light font-weight-bold">
                  <td colSpan="2"><strong>Total</strong></td>
                  <td colSpan="2" className="text-end"><strong>{formatUSD(totalStock)}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Receivables */}
      <Card className="mb-4">
        <Card.Header bg="warning" text="dark">
          <strong>Outstanding Receivables</strong>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 g-2">
            <Col xs={12} md={4}>
              <Form.Control
                type="text"
                placeholder="Customer"
                value={receivableFilter.customer}
                onChange={(e) => setReceivableFilter({ ...receivableFilter, customer: e.target.value })}
              />
            </Col>
            <Col xs={12} md={4}>
              <Form.Select
                value={receivableFilter.status}
                onChange={(e) => setReceivableFilter({ ...receivableFilter, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="Overdue">Overdue</option>
                <option value="Pending">Pending</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={3}>
              <Form.Control
                type="date"
                value={receivableFilter.due}
                onChange={(e) => setReceivableFilter({ ...receivableFilter, due: e.target.value })}
              />
            </Col>
            <Col xs={12} md={1}>
              <Button variant="outline-secondary" size="sm" onClick={() => setReceivableFilter({ customer: "", status: "", due: "" })}>
                🗑️
              </Button>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table striped hover bordered>
              <thead className="table-light text-black">
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceivable.length > 0 ? (
                  filteredReceivable.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.customer}</td>
                      <td>{row.amount}</td>
                      <td>{row.due}</td>
                      <td>
                        <Badge bg={row.status === "Overdue" ? "danger" : "warning"}>
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No receivables</td>
                  </tr>
                )}
                <tr className="table-light font-weight-bold">
                  <td colSpan="2"><strong>Total</strong></td>
                  <td colSpan="2" className="text-end"><strong>{formatUSD(totalReceivable)}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* 🏁 Grand Total */}
      <Card bg="dark" text="white" className="text-center p-3 mb-4">
        <h5>
          Grand Total of All Assets: <strong>{formatUSD(grandTotal)}</strong>
        </h5>
      </Card>
    </Container>
  );
};

export default AssetDetails;