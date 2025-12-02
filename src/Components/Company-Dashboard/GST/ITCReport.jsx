import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Form,
} from "react-bootstrap";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { FaTruck } from "react-icons/fa6";

const formatINR = (num) =>
  "₹" +
  num.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

const initialItcData = [
  {
    invoice: "INV-001",
    vendor: "XYZ Industries",
    gstin: "27AADCX0000B1Z5",
    amount: 50000,
    cgst: 4500,
    sgst: 4500,
    igst: 0,
    total: 9000,
    status: "Claimed",
  },
  {
    invoice: "INV-002",
    vendor: "Prime Suppliers",
    gstin: "27AADCP0000D1Z5",
    amount: 75000,
    cgst: 0,
    sgst: 0,
    igst: 13500,
    total: 13500,
    status: "Pending",
  },
  {
    invoice: "INV-003",
    vendor: "Mega Distributors",
    gstin: "27AADCM0000F1Z5",
    amount: 30000,
    cgst: 2700,
    sgst: 2700,
    igst: 0,
    total: 5400,
    status: "Claimed",
  },
];

const statusColor = (status) =>
  status === "Claimed"
    ? "success"
    : status === "Pending"
    ? "info"
    : "secondary";

const ITCReport = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchVendor, setSearchVendor] = useState("");
  const [filteredData, setFilteredData] = useState(initialItcData);

  useEffect(() => {
    let data = [...initialItcData];

    if (statusFilter !== "All") {
      data = data.filter((d) => d.status === statusFilter);
    }

    if (searchVendor.trim() !== "") {
      data = data.filter((d) =>
        d.vendor.toLowerCase().includes(searchVendor.toLowerCase())
      );
    }

    setFilteredData(data);
  }, [statusFilter, searchVendor]);

  return (
    <div style={{ background: "#f7f7f7", minHeight: "100vh", paddingBottom: 40 }}>
      <Container fluid className="py-4">
        <h3 style={{ color: "#161412ff", fontWeight: 700, marginBottom: 24 }}>
          ITC Report
        </h3>

        {/* Summary Cards */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} md={3}>
            <Card className="text-center">
              <Card.Body>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    margin: "0 auto 10px",
                    borderRadius: "50%",
                    background: "#f1f1f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    color: "#bbb",
                  }}
                >
                  ₹
                </div>
                <div style={{ color: "#888", fontSize: 15 }}>Total Tax Liability</div>
                <div style={{ fontWeight: 700, fontSize: 26 }}>{formatINR(45000)}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="text-center">
              <Card.Body>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    margin: "0 auto 10px",
                    borderRadius: "50%",
                    background: "#f1f1f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    color: "#1976d2",
                  }}
                >
                  <FaArrowDown />
                </div>
                <div style={{ color: "#888", fontSize: 15 }}>Input Tax Credit</div>
                <div style={{ fontWeight: 700, fontSize: 26 }}>{formatINR(32500)}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="text-center">
              <Card.Body>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    margin: "0 auto 10px",
                    borderRadius: "50%",
                    background: "#f1f1f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    color: "#1976d2",
                  }}
                >
                  <FaArrowUp />
                </div>
                <div style={{ color: "#888", fontSize: 15 }}>Output Tax</div>
                <div style={{ fontWeight: 700, fontSize: 26 }}>{formatINR(12500)}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="text-center">
              <Card.Body>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    margin: "0 auto 10px",
                    borderRadius: "50%",
                    background: "#f1f1f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    color: "#ff5722",
                  }}
                >
                  <FaTruck />
                </div>
                <div style={{ color: "#888", fontSize: 15 }}>e-Way Bills</div>
                <div style={{ fontWeight: 700, fontSize: 26 }}>24</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Table Card */}
        <Card className="mt-4">
          <Card.Body>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
              <div style={{ fontWeight: 600, fontSize: 20 }}>
                Input Tax Credit Report
              </div>
              <div className="d-flex justify-content-end mb-2">
                <Button
                  size="sm"
                  className="d-flex align-items-center"
                  style={{
                    backgroundColor: "#3daaaa",
                    borderColor: "#3daaaa",
                    fontWeight: 500,
                  }}
                >
                  <FaArrowDown className="me-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Filter Section */}
            <Row className="mb-3 g-2">
                  <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder="Search by vendor"
                  value={searchVendor}
                  onChange={(e) => setSearchVendor(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Claimed">Claimed</option>
                  <option value="Pending">Pending</option>
                </Form.Select>
              </Col>
                      <Col md={3}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Vendor</option>
                  <option value="Claimed">XYZ Industries</option>
                  <option value="Pending">Prime Suppliers</option>
                  <option value="Pending">Mega Distributors</option>

                </Form.Select>
              </Col>
          
            </Row>

            {/* Table */}
            <Table responsive hover className="align-middle mb-0">
              <thead style={{ background: "#f5f6fa" }}>
                <tr>
                  <th>Invoice No.</th>
                  <th>Vendor</th>
                  <th>GSTIN</th>
                  <th>Invoice Amount (₹)</th>
                  <th>CGST (₹)</th>
                  <th>SGST (₹)</th>
                  <th>IGST (₹)</th>
                  <th>Total ITC (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{row.invoice}</td>
                      <td>{row.vendor}</td>
                      <td style={{ letterSpacing: 1 }}>{row.gstin}</td>
                      <td>{formatINR(row.amount)}</td>
                      <td>{formatINR(row.cgst)}</td>
                      <td>{formatINR(row.sgst)}</td>
                      <td>{formatINR(row.igst)}</td>
                      <td>{formatINR(row.total)}</td>
                      <td>
                        <Badge
                          bg={statusColor(row.status)}
                          style={{
                            fontSize: 15,
                            padding: "6px 16px",
                            borderRadius: 8,
                            fontWeight: 500,
                            background:
                              row.status === "Pending"
                                ? "#00b4d8"
                                : row.status === "Claimed"
                                ? "#b7f7c7"
                                : undefined,
                            color:
                              row.status === "Pending"
                                ? "#fff"
                                : row.status === "Claimed"
                                ? "#1b5e20"
                                : undefined,
                          }}
                        >
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center text-muted py-4">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Pagination */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
              <span className="small text-muted">
                Showing 1 to {filteredData.length} of {filteredData.length} results
              </span>
              <nav>
                <ul className="pagination pagination-sm mb-0 flex-wrap">
                  <li className="page-item disabled">
                    <button className="page-link rounded-start">&laquo;</button>
                  </li>
                  <li className="page-item active">
                    <button
                      className="page-link"
                      style={{ backgroundColor: '#3daaaa', borderColor: '#3daaaa' }}
                    >
                      1
                    </button>
                  </li>
                  <li className="page-item">
                    <button className="page-link">2</button>
                  </li>
                  <li className="page-item">
                    <button className="page-link rounded-end">&raquo;</button>
                  </li>
                </ul>
              </nav>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <div className="mt-3">
        <small className="d-block text-dark w-100 p-3 border-top bg-light rounded-bottom">
          <strong>ITC (Input Tax Credit):</strong>
          The tax credit a business can claim for the GST paid on purchases of goods or services used for business purposes.
        </small>
      </div>
    </div>
  );
};

export default ITCReport;
