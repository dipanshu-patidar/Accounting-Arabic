
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
import {
  FaArrowDown,
  FaArrowUp,
  FaEye,
  FaEdit,
  FaTrash,
  FaCog,
  FaPlus,
} from "react-icons/fa";

const initialData = [
  {
    type: "TDS",
    party: "Acme Corporation",
    pan: "AAAAA0000A",
    amount: 50000,
    rate: 10,
    taxAmount: 5000,
    date: "2025-06-26",
  },
  {
    type: "TCS",
    party: "Tech Solutions",
    pan: "BBBBB0000B",
    amount: 75000,
    rate: 1,
    taxAmount: 750,
    date: "2025-06-25",
  },
  {
    type: "TDS",
    party: "Global Traders",
    pan: "CCCCC0000C",
    amount: 30000,
    rate: 10,
    taxAmount: 3000,
    date: "2025-06-24",
  },
];

const formatINR = (num) =>
  "₹" +
  num.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

const emptyForm = {
  type: "TDS",
  party: "",
  pan: "",
  amount: "",
  rate: "",
  taxAmount: "",
  date: "",
};

const TdsTcs = () => {
  const [tdsData, setTdsData] = useState(initialData);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addForm, setAddForm] = useState(emptyForm);

  // Filter States
  const [filterType, setFilterType] = useState("");
  const [filterText, setFilterText] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const filteredData = tdsData.filter((item) => {
    const matchesType = filterType ? item.type === filterType : true;
    const matchesText = filterText
      ? item.party.toLowerCase().includes(filterText.toLowerCase()) ||
        item.pan.toLowerCase().includes(filterText.toLowerCase())
      : true;
    const matchesFrom = filterFrom ? new Date(item.date) >= new Date(filterFrom) : true;
    const matchesTo = filterTo ? new Date(item.date) <= new Date(filterTo) : true;
    return matchesType && matchesText && matchesFrom && matchesTo;
  });


  // Handlers
  const handleView = (row) => {
    setSelectedRow(row);
    setShowView(true);
  };
  const handleEdit = (row, idx) => {
    setSelectedRow({ ...row, idx });
    setEditForm(row);
    setShowEdit(true);
  };
  const handleDelete = (row, idx) => {
    setSelectedRow({ ...row, idx });
    setShowDelete(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]:
        name === "amount" ||
        name === "rate" ||
        name === "taxAmount"
          ? Number(value)
          : value,
    }));
  };

  const handleEditSave = () => {
    const updated = [...tdsData];
    updated[selectedRow.idx] = editForm;
    setTdsData(updated);
    setShowEdit(false);
  };

  const handleDeleteConfirm = () => {
    const updated = [...tdsData];
    updated.splice(selectedRow.idx, 1);
    setTdsData(updated);
    setShowDelete(false);
  };

  // Add Entry handlers
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [name]:
        name === "amount" ||
        name === "rate" ||
        name === "taxAmount"
          ? Number(value)
          : value,
    }));
  };

  const handleAddSave = () => {
    setTdsData((prev) => [
      ...prev,
      {
        ...addForm,
        amount: Number(addForm.amount),
        rate: Number(addForm.rate),
        taxAmount: Number(addForm.taxAmount),
      },
    ]);
    setAddForm(emptyForm);
    setShowAdd(false);
  };

  return (
    <div  className ="p-4"style={{ background: "#f7f7f7", minHeight: "100vh", paddingBottom: 40 }}>
      <Container fluid className="py-4">
        <h3 style={{ fontWeight: 600, marginBottom: 24 }} >
          TDS/TCS
        </h3>
        
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} md={4}>
            <Card className="shadow-sm text-center" style={{padding: 0, height: "auto"}}>
              <Card.Body style={{padding: 12}}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    margin: "0 auto 8px",
                    borderRadius: "50%",
                    background: "#f1f1f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: "#bbb",
                  }}
                >
                  ₹
                </div>
                <div style={{ color: "#888", fontSize: 13 }}>Total Tax Liability</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {formatINR(45000)}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Card className="shadow-sm text-center" style={{padding: 0, height: "auto"}}>
              <Card.Body style={{padding: 12}}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    margin: "0 auto 8px",
                    borderRadius: "50%",
                    background: "#f1f1f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: "#1976d2",
                  }}
                >
                  <FaArrowDown />
                </div>
                <div style={{ color: "#888", fontSize: 13 }}>Input Tax Credit</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {formatINR(32500)}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={4}>
            <Card className="shadow-sm text-center" style={{padding: 0, height: "auto"}}>
              <Card.Body style={{padding: 12}}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    margin: "0 auto 8px",
                    borderRadius: "50%",
                    background: "#f1f1f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: "#1976d2",
                  }}
                >
                  <FaArrowUp />
                </div>
                <div style={{ color: "#888", fontSize: 13 }}>Output Tax</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {formatINR(12500)}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>


        <Card className=" mt-4">
          <Card.Body>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
  
  {/* Left: Heading */}
  <div style={{ fontWeight: 600, fontSize: 18 }}>
    TDS/TCS Details
  </div>
  

  {/* Right: Buttons */}
  <div className="d-flex gap-2 flex-wrap justify-content-md-end w-100 w-md-auto">
    <Button
   
      size="sm"
      style={{
        backgroundColor:"#3daaaa",
        borderColor:"#3daaaa",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <FaArrowDown />
      <span>Download</span>
    </Button>

    <Button
  
      size="sm"
      onClick={() => setShowAdd(true)}
      style={{
        backgroundColor:"#3daaaa",
        borderColor:"#3daaaa",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <FaPlus />
      <span>Add Entry</span>
    </Button>
  </div>
</div>
  {/* Filter Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Body className="row g-3">
              <Col md={3}>
              <Form.Control
                placeholder="Search by Party or PAN"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">All Types</option>
                <option value="TDS">TDS</option>
                <option value="TCS">TCS</option>
              </Form.Select>
            </Col>
          
            <Col md={3}>
              <Form.Control
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Control
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
              />
            </Col>
          </Card.Body>
        </Card>

  {/* Table Styled like Coupons */}
<div className="table-responsive">
  <table className="table table-bordered text-center align-middle product-table mb-0">
    <thead className="table-light text-white">
      <tr>
        <th className="py-3">Type</th>
        <th className="py-3">Party</th>
        <th className="py-3">PAN</th>
        <th className="py-3">Amount (₹)</th>
        <th className="py-3">Rate (%)</th>
        <th className="py-3">Tax Amount (₹)</th>
        <th className="py-3">Date</th>
        <th className="py-3">Action</th>
      </tr>
    </thead>
    <tbody>
      {tdsData.map((row, idx) => (
        <tr key={idx}>
          <td>
            <span
              className={`badge ${row.type === "TDS" ? "bg-primary" : "bg-dark"}`}
              style={{
                fontSize: 13,
                padding: "5px 12px",
                borderRadius: 8,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              {row.type}
            </span>
          </td>
          <td>{row.party}</td>
          <td style={{ letterSpacing: 1 }}>{row.pan}</td>
          <td>{formatINR(row.amount)}</td>
          <td>{row.rate}%</td>
          <td>{formatINR(row.taxAmount)}</td>
          <td>{row.date}</td>
          <td className="d-flex justify-content-center gap-1">
            <button
              className="btn outline-info btn-sm py-1 px-1 text-info"
              onClick={() => handleView(row)}
            >
              <FaEye size={16}/>
            </button>
            <button
              className="btn outline-warning btn-sm text-warning py-1 px-1"
              onClick={() => handleEdit(row, idx)}
            >
              <FaEdit size={16} />
            </button>
            <button
              className="btn outline-primary btn-sm text-danger py-2 px-1"
              onClick={() => handleDelete(row, idx)}
            >
              <FaTrash size={16} />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>


</div>

  {/* Pagination */}
<div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
  <span className="small text-muted">
    Showing 1 to {tdsData.length} of {tdsData.length} results
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

      {/* View Modal */}
      <Modal show={showView} onHide={() => setShowView(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Entry Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRow && (
            <div>
              <p><b>Type:</b> {selectedRow.type}</p>
              <p><b>Party:</b> {selectedRow.party}</p>
              <p><b>PAN:</b> {selectedRow.pan}</p>
              <p><b>Amount:</b> {formatINR(selectedRow.amount)}</p>
              <p><b>Rate:</b> {selectedRow.rate}%</p>
              <p><b>Tax Amount:</b> {formatINR(selectedRow.taxAmount)}</p>
              <p><b>Date:</b> {selectedRow.date}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRow && (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={editForm.type}
                  onChange={handleEditChange}
                >
                  <option value="TDS">TDS</option>
                  <option value="TCS">TCS</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Party</Form.Label>
                <Form.Control
                  name="party"
                  value={editForm.party}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>PAN</Form.Label>
                <Form.Control
                  name="pan"
                  value={editForm.pan}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  name="amount"
                  type="number"
                  value={editForm.amount}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Rate (%)</Form.Label>
                <Form.Control
                  name="rate"
                  type="number"
                  value={editForm.rate}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Tax Amount</Form.Label>
                <Form.Control
                  name="taxAmount"
                  type="number"
                  value={editForm.taxAmount}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  name="date"
                  type="date"
                  value={editForm.date}
                  onChange={handleEditChange}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancel
          </Button>
          <Button style={{backgroundColor:"#3daaaa", borderColor:"#3daaaa"}} onClick={handleEditSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this entry?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={addForm.type}
                onChange={handleAddChange}
              >
                <option value="TDS">TDS</option>
                <option value="TCS">TCS</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Party</Form.Label>
              <Form.Control
                name="party"
                value={addForm.party}
                onChange={handleAddChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>PAN</Form.Label>
              <Form.Control
                name="pan"
                value={addForm.pan}
                onChange={handleAddChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                name="amount"
                type="number"
                value={addForm.amount}
                onChange={handleAddChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Rate (%)</Form.Label>
              <Form.Control
                name="rate"
                type="number"
                value={addForm.rate}
                onChange={handleAddChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Tax Amount</Form.Label>
              <Form.Control
                name="taxAmount"
                type="number"
                value={addForm.taxAmount}
                onChange={handleAddChange}
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>
            Cancel
          </Button>
          <Button
            style={{backgroundColor:"#3daaaa"}}
            onClick={handleAddSave}
            disabled={
              !addForm.party ||
              !addForm.pan ||
              !addForm.amount ||
              !addForm.rate ||
              !addForm.taxAmount ||
              !addForm.date
            }
          >
            Add Entry
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="mt-3">
  <small className="d-block text-dark w-100 p-3 border-top bg-light rounded-bottom">
    <strong>TDS (Tax Deducted at Source):</strong>  
    Tax deducted by the payer at the time of making certain payments like salary, rent, or contractor fees.<br /><br />
    <strong>TCS (Tax Collected at Source):</strong>  
    Tax collected by the seller at the time of selling certain goods or services.
  </small>
</div>


      
    </div>
    

  );
};

export default TdsTcs;