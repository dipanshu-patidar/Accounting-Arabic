import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Modal,
  Form,
} from "react-bootstrap";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { FaTruck } from "react-icons/fa6";

const formatINR = (num) =>
  "₹" +
  num.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

const initialData = [
  {
    no: "EW8001",
    date: "2025-08-28",
    from: "Mumbai, MH",
    to: "Delhi, DL",
    value: 775000,
    valid: "2025-06-28",
    status: "Active",
  },
  {
    no: "EW8002",
    date: "2025-06-25",
    from: "Bangalore, KA",
    to: "Chennai, TN",
    value: 45000,
    valid: "2025-06-27",
    status: "Active",
  },
  {
    no: "EW8003",
    date: "2025-06-24",
    from: "Delhi, DL",
    to: "Kolkata, WB",
    value: 50000,
    valid: "2025-06-26",
    status: "Expired",
  },
];

const statusStyle = (status) =>
  status === "Active"
    ? { background: "#e6f9f0", color: "#2e7d32", fontWeight: 500 }
    : { background: "#ffeaea", color: "#d32f2f", fontWeight: 500 };

const emptyForm = {
  no: "",
  date: "",
  from: "",
  to: "",
  value: "",
  valid: "",
  status: "Active",
};

const EWayBill = () => {
  const [data, setData] = useState(initialData);
  const [showView, setShowView] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [addForm, setAddForm] = useState(emptyForm);

    // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [fromFilter, setFromFilter] = useState("");

  const handleView = (row) => {
    setSelected(row);
    setShowView(true);
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [name]: name === "value" ? Number(value) : value,
    }));
  };

  const handleAddSave = () => {
    setData((prev) => [
      ...prev,
      {
        ...addForm,
        value: Number(addForm.value),
      },
    ]);
    setAddForm(emptyForm);
    setShowAdd(false);
  };

    const filteredData = data.filter((row) => {
    const matchStatus = statusFilter ? row.status === statusFilter : true;
    const matchFrom = fromFilter
      ? row.from.toLowerCase().includes(fromFilter.toLowerCase())
      : true;
    return matchStatus && matchFrom;
  });

  return (
    <div style={{ background: "#f7f7f7", minHeight: "100vh", paddingBottom: 40 }}>
      <Container fluid className="py-4">
        <h3 style={{ color: "#080807ff", fontWeight: 700, marginBottom: 24 }}>
          e-Way Bill
        </h3>
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} md={3}>
            <Card className="shadow-sm text-center" style={{ padding: 0, height: "auto" }}>
              <Card.Body style={{ padding: 16 }}>
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
                <div style={{ color: "#888", fontSize: 15 }}>Tool Tax Liability</div>
                <div style={{ fontWeight: 700, fontSize: 26 }}>
                  {formatINR(45000)}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="shadow-sm text-center" style={{ padding: 0, height: "auto" }}>
              <Card.Body style={{ padding: 16 }}>
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
                <div style={{ color: "#888", fontSize: 15 }}>Tool Tax Credit</div>
                <div style={{ fontWeight: 700, fontSize: 26 }}>
                  {formatINR(32500)}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="shadow-sm text-center" style={{ padding: 0, height: "auto" }}>
              <Card.Body style={{ padding: 16 }}>
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
                <div style={{ fontWeight: 700, fontSize: 26 }}>
                  {formatINR(12500)}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Card className="shadow-sm text-center" style={{ padding: 0, height: "auto" }}>
              <Card.Body style={{ padding: 16 }}>
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
                <div style={{ fontWeight: 700, fontSize: 26 }}>{data.length}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="shadow-sm mt-4">
          <Card.Body>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
              <div style={{ fontWeight: 600, fontSize: 20 }}>
                e-Way Bills
              </div>
              <div className="d-flex gap-2">
                <Button
             
                  size="sm"
                  style={{backgroundColor:"#3daaaa",borderColor:"#3daaaa", fontWeight: 500 }}
                >
                  ↓ Download
                </Button>
                <Button
                
                  size="sm"
                  style={{backgroundColor:"#3daaaa",borderColor:"#3daaaa", fontWeight: 500, color: "#fff" }}
                  onClick={() => setShowAdd(true)}
                >
                  + Generate Bill
                </Button>
              </div>
            </div>
    {/* Filter Section */}
            <Row className="mb-3">
                     <Col md={4}>
                <Form.Control
                  placeholder="Search"
                  value={fromFilter}
                  onChange={(e) => setFromFilter(e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Status</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                </Form.Select>
              </Col>
       
            </Row>

            
            <div style={{ overflowX: "auto" }}>
              <Table responsive hover className="align-middle mb-0">
                <thead style={{ background: "#f5f6fa" }}>
                  <tr>
                    <th>e-Way Bill No.</th>
                    <th>Date</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Value (₹)</th>
                    <th>Valid Until</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{row.no}</td>
                      <td>{row.date}</td>
                      <td>{row.from}</td>
                      <td>{row.to}</td>
                      <td>{formatINR(row.value)}</td>
                      <td>{row.valid}</td>
                      <td>
                        <span
                          style={{
                            ...statusStyle(row.status),
                            fontSize: 15,
                            padding: "4px 16px",
                            borderRadius: 8,
                            display: "inline-block",
                          }}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          style={{
                            fontWeight: 500,
                            borderRadius: 8,
                            padding: "2px 18px",
                          }}
                          onClick={() => handleView(row)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {/* Pagination */}
<div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
  <span className="small text-muted">
    Showing 1 to {data.length} of {data.length} results
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

            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* View Modal */}
      <Modal show={showView} onHide={() => setShowView(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>e-Way Bill Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <div>
              <p><b>e-Way Bill No.:</b> {selected.no}</p>
              <p><b>Date:</b> {selected.date}</p>
              <p><b>From:</b> {selected.from}</p>
              <p><b>To:</b> {selected.to}</p>
              <p><b>Value:</b> {formatINR(selected.value)}</p>
              <p><b>Valid Until:</b> {selected.valid}</p>
              <p>
                <b>Status:</b>{" "}
                <span style={statusStyle(selected.status)}>{selected.status}</span>
              </p>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Generate Bill Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Generate e-Way Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>e-Way Bill No.</Form.Label>
              <Form.Control
                name="no"
                value={addForm.no}
                onChange={handleAddChange}
                placeholder="e.g. EW8004"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Date</Form.Label>
              <Form.Control
                name="date"
                type="date"
                value={addForm.date}
                onChange={handleAddChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>From</Form.Label>
              <Form.Control
                name="from"
                value={addForm.from}
                onChange={handleAddChange}
                placeholder="e.g. Mumbai, MH"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>To</Form.Label>
              <Form.Control
                name="to"
                value={addForm.to}
                onChange={handleAddChange}
                placeholder="e.g. Delhi, DL"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Value (₹)</Form.Label>
              <Form.Control
                name="value"
                type="number"
                value={addForm.value}
                onChange={handleAddChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Valid Until</Form.Label>
              <Form.Control
                name="valid"
                type="date"
                value={addForm.valid}
                onChange={handleAddChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={addForm.status}
                onChange={handleAddChange}
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={handleAddSave}
            disabled={
              !addForm.no ||
              !addForm.date ||
              !addForm.from ||
              !addForm.to ||
              !addForm.value ||
              !addForm.valid
            }
            style={{ color: "#fff" }}
          >
            Generate Bill
          </Button>
        </Modal.Footer>
      </Modal>



<Card className="mb-4 p-4 shadow rounded-4 mt-3">
  <Card.Body>
  <small className="d-block text-dark w-100 p-3  rounded-bottom">
    <strong>e‑Way Bill:</strong>  
    An electronic document generated on the GST portal for the movement of goods valued over ₹50,000, containing details of the consignment, transporter, and journey.
  </small>
  </Card.Body>
</Card>


    </div>
  );
};

export default EWayBill;