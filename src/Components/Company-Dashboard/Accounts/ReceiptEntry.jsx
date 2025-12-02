import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table,Card ,Col,Row} from "react-bootstrap";
import { FaEye } from 'react-icons/fa'; 
import html2pdf from "html2pdf.js";
import { useRef } from "react";

const ReceiptEntry = () => {
  const [show, setShow] = useState(false);
  const [receiptData, setReceiptData] = useState([]);
  const [form, setForm] = useState({
    date: "",
    receiptNo: "",
    receivedFrom: "",
    amount: "",
    mode: "Cash",
    invoiceNo: "", 
    reference: "",
    notes: "",
  });

  const [viewModal, setViewModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    setReceiptData([
      {
        date: "2025-07-25",
        receiptNo: "RCPT001",
        receivedFrom: "ABC Traders",
        amount: "5000",
        mode: "UPI",
        reference: "TXN12345",
        notes: "Advance Payment",
        invoiceNo: "INV-001", // ✅ Added
      },
      {
        date: "2025-07-27",
        receiptNo: "RCPT002",
        receivedFrom: "XYZ Pvt Ltd",
        amount: "12000",
        mode: "Bank",
        reference: "TXN54321",
        notes: "Full Payment",
        invoiceNo: "INV-002", // ✅ Added
      },
    ]);
  }, []);
  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    setReceiptData([...receiptData, form]);
    setForm({
      date: "",
      receiptNo: "",
      receivedFrom: "",
      amount: "",
      mode: "Cash",
      reference: "",
      notes: "",
    });
    setShow(false);
  };

  const handleView = (receipt) => {
    setSelectedReceipt(receipt);
    setViewModal(true);
  };
  const pdfRef = useRef();

  const handleDownloadPDF = () => {
    if (pdfRef.current) {
      html2pdf()
        .from(pdfRef.current)
        .set({
          margin: 0.5,
          filename: `${selectedReceipt?.receiptNo || "receipt"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        })
        .save();
    }
  };
  const handleDirectPDF = (receipt) => {
    const tempDiv = document.createElement("div");
    tempDiv.style.padding = "20px";
    tempDiv.innerHTML = `
      <h3 style="text-align:center;">Receipt</h3>
      <p><strong>Date:</strong> ${receipt.date}</p>
      <p><strong>Receipt No:</strong> ${receipt.receiptNo}</p>
      <p><strong>Customer Name:</strong> ${receipt.receivedFrom}</p>
      <p><strong>Invoice No:</strong> ${receipt.invoiceNo || "-"}</p>
      <p><strong>Amount:</strong> ₹${receipt.amount}</p>
      <p><strong>Mode:</strong> ${receipt.mode}</p>
      <p><strong>Reference:</strong> ${receipt.reference}</p>
      <p><strong>Notes:</strong> ${receipt.notes}</p>
    `;
  
    html2pdf().from(tempDiv).set({
      margin: 0.5,
      filename: `${receipt.receiptNo || "receipt"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    }).save();
  };
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    mode: "",
    minAmount: "",
    maxAmount: "",
  });
  const filteredReceipts = receiptData.filter((item) => {
    // Date filtering
    if (filters.dateFrom && item.date < filters.dateFrom) return false;
    if (filters.dateTo && item.date > filters.dateTo) return false;
  
    // Mode filtering
    if (filters.mode && item.mode !== filters.mode) return false;
  
    // Amount filtering
    const amount = parseFloat(item.amount);
    if (filters.minAmount && amount < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && amount > parseFloat(filters.maxAmount)) return false;
  
    return true;
  });
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Receipt Entry</h4>
        <Button variant="success" onClick={() => setShow(true)}    style={{
            backgroundColor: "#53b2a5",
            border: "none",
            display: "flex",
            alignItems: "center",
          }}>
          + Add Receipt
        </Button>
      </div>

  
{/* Filter Controls */}
<div className="mb-3 p-3 bg-light rounded">
  <Row className="g-2 align-items-end">
    <Col xs={12} md={3}>
      <Form.Label>Date From</Form.Label>
      <Form.Control
        type="date"
        value={filters.dateFrom}
        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
      />
    </Col>
    <Col xs={12} md={3}>
      <Form.Label>Date To</Form.Label>
      <Form.Control
        type="date"
        value={filters.dateTo}
        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
      />
    </Col>
    <Col xs={12} md={2}>
      <Form.Label>Mode</Form.Label>
      <Form.Select
        value={filters.mode}
        onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
      >
        <option value="">All Modes</option>
        <option value="Cash">Cash</option>
        <option value="Bank">Bank</option>
        <option value="UPI">UPI</option>
        <option value="Cheque">Cheque</option>
      </Form.Select>
    </Col>
    <Col xs={12} md={2}>
      <Form.Label>Min Amount</Form.Label>
      <Form.Control
        type="number"
        placeholder="Min"
        value={filters.minAmount}
        onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
      />
    </Col>
    <Col xs={12} md={2}>
      <Form.Label>Max Amount</Form.Label>
      <Form.Control
        type="number"
        placeholder="Max"
        value={filters.maxAmount}
        onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
      />
    </Col>
  </Row>
</div>







      <div className="card bg-white rounded-3 p-3">
  <div className="table-responsive">
  <Table className="table table-hover table-bordered align-middle mb-0">
    <thead className="table-light border">
    {filteredReceipts.map((item, idx) => (
  <tr key={idx}>
    <td>{item.date}</td>
    <td>{item.receiptNo}</td>
    <td>{item.receivedFrom}</td>
    <td>₹{item.amount}</td>
    <td>{item.mode}</td>
    <td>{item.reference}</td>
    <td>{item.notes}</td>
    <td className="d-flex gap-2">
      <Button
        variant="link"
        size="sm"
        onClick={() => handleView(item)}
        className="text-info p-0"
        title="View"
      >
        <FaEye size={16} />
      </Button>
      <Button
        variant="link"
        size="sm"
        onClick={() => handleDirectPDF(item)}
        className="text-danger p-0"
        title="Download PDF"
      >
        📄
      </Button>
    </td>
  </tr>
))}
    </thead>
    <tbody>
      {receiptData.map((item, idx) => (
        <tr key={idx}>
          <td>{item.date}</td>
          <td>{item.receiptNo}</td>
          <td>{item.receivedFrom}</td>
          <td>₹{item.amount}</td>
          <td>{item.mode}</td>
          <td>{item.reference}</td>
          <td>{item.notes}</td>
          <td className="d-flex gap-2">
            <Button
              variant="link"
              size="sm"
              onClick={() => handleView(item)}
              className="text-info p-0"
              title="View"
            >
              <FaEye size={16} />
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={() => handleDirectPDF(item)}
              className="text-danger p-0"
              title="Download PDF"
            >
              📄
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>

  {/* Pagination UI */}
  <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
  <small className="text-muted ms-2">
  Showing 1 to {filteredReceipts.length} of {filteredReceipts.length} results
</small>
    <nav>
      <ul className="pagination mb-0">
        <li className="page-item disabled">
          <button className="page-link">&laquo;</button>
        </li>
        <li className="page-item active">
          <button className="page-link">1</button>
        </li>
        <li className="page-item">
          <button className="page-link">2</button>
        </li>
        <li className="page-item">
          <button className="page-link">&raquo;</button>
        </li>
      </ul>
    </nav>
  </div>
</div>

</div>















      {/* Add Receipt Modal */}
{/* Add Receipt Modal */}
<Modal show={show} onHide={() => setShow(false)} 
  size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Add Receipt</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group className="mb-2">
        <Form.Label>Receipt Date</Form.Label>
        <Form.Control
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Receipt Number</Form.Label>
        <Form.Control
          type="text"
          name="receiptNo"
          value={form.receiptNo}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Customer Name</Form.Label>
        <Form.Select
          name="receivedFrom"
          value={form.receivedFrom}
          onChange={handleChange}
        >
          <option value="">Select Customer</option>
          <option value="Customer A">Customer A</option>
          <option value="Customer B">Customer B</option>
          {/* Map customer list dynamically */}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Invoice No (optional)</Form.Label>
        <Form.Select
          name="invoiceNo"
          value={form.invoiceNo}
          onChange={handleChange}
        >
          <option value="">Select Invoice</option>
          <option value="INV-001">INV-001</option>
          <option value="INV-002">INV-002</option>
          {/* Map invoice list dynamically */}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Amount Received</Form.Label>
        <Form.Control
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Payment Mode</Form.Label>
        <Form.Select
          name="mode"
          value={form.mode}
          onChange={handleChange}
        >
          <option value="Cash">Cash</option>
          <option value="Bank">Bank</option>
          <option value="UPI">UPI</option>
          <option value="Cheque">Cheque</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Reference No.</Form.Label>
        <Form.Control
          type="text"
          name="reference"
          value={form.reference}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Narration / Note</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShow(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSubmit}    style={{
            backgroundColor: "#53b2a5",
            border: "none",
            display: "flex",
            alignItems: "center",
          }}>
      Save
    </Button>
  </Modal.Footer>
</Modal>


      {/* View Modal */}
      <Modal show={viewModal} onHide={() => setViewModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Receipt Details</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedReceipt && (
      <div ref={pdfRef}>
        <h5 className="text-center mb-3">Receipt</h5>
        <p><strong>Date:</strong> {selectedReceipt.date}</p>
        <p><strong>Receipt No:</strong> {selectedReceipt.receiptNo}</p>
        <p><strong>Customer Name:</strong> {selectedReceipt.receivedFrom}</p>
        <p><strong>Invoice No:</strong> {selectedReceipt.invoiceNo || "-"}</p>
        <p><strong>Amount:</strong> ₹{selectedReceipt.amount}</p>
        <p><strong>Mode:</strong> {selectedReceipt.mode}</p>
        <p><strong>Reference:</strong> {selectedReceipt.reference}</p>
        <p><strong>Notes:</strong> {selectedReceipt.notes}</p>
      </div>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button
      variant="secondary"
      onClick={() => setViewModal(false)}
      style={{
        backgroundColor: "#53b2a5",
        border: "none",
        display: "flex",
        alignItems: "center",
      }}
    >
      Close
    </Button>
    <Button
      variant="outline-primary"
      onClick={handleDownloadPDF}
      style={{ display: "flex", alignItems: "center" }}
    >
      Download PDF
    </Button>
  </Modal.Footer>
</Modal>


{/* Page Description */}
<Card className="mb-4 p-3 shadow rounded-4 mt-2">
  <Card.Body>
    <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
    <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
      <li>Manage vendor details such as name, contact, and billing/shipping information.</li>
      <li>Track payable balances and set credit periods for each vendor.</li>
      <li>Perform full CRUD operations: add, view, edit, and delete vendors.</li>
      <li>Import and export vendor data using Excel for bulk management.</li>
      <li>Assign account types and access the ledger to monitor transaction history.</li>
    </ul>
  </Card.Body>
</Card>
    </div>
  );
};

export default ReceiptEntry;
