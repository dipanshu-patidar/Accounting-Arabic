import React, { useState } from "react";
import { Row, Col, Table, Card, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PurchaseVoucherView = () => {
  const navigate = useNavigate();

  // 🧾 Vendor List (demo)
  const vendorList = [
    "Tech Traders",
    "Om Electronics",
    "Global Suppliers",
    "Dev Hardware Store",
    "Mahadev Equipments",
  ];

  // Demo pre-filled data for purchase voucher
  const [voucher, setVoucher] = useState({
    invoiceNo: "PUR-2001",
    voucherDate: "2025-07-24",
    dueDate: "2025-07-30",
    supplier: "Tech Traders", // now treated as vendor
    purchaseAccount: "Purchases - IT Hardware",
    placeOfSupply: "Indore, MP",
    referenceNo: "REF-5678",
  });

  const items = [
    {
      name: "Desktop",
      qty: 3,
      unit: "pcs",
      rate: 40000,
      discount: 10,
      tax: "18% GST",
      value: 108000,
      description: "Intel i7 desktops",
    },
    {
      name: "Keyboard",
      qty: 10,
      unit: "pcs",
      rate: 600,
      discount: 0,
      tax: "18% GST",
      value: 6000,
      description: "Mechanical keyboards",
    },
  ];

  const totalAmount = items.reduce((acc, cur) => acc + parseFloat(cur.value), 0).toFixed(2);

  return (
    <Card className="p-4 mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Purchase Voucher</h4>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>

      <Row className="mb-3">
        <Col md={3}><strong>Invoice No:</strong> {voucher.invoiceNo || "--"}</Col>
        <Col md={3}><strong>Voucher Date:</strong> {voucher.voucherDate || "--"}</Col>
        <Col md={3}><strong>Due Date:</strong> {voucher.dueDate || "--"}</Col>
        <Col md={3}>
          <strong>Vendor:</strong>{" "}
          <Form.Select
            size="sm"
            value={voucher.supplier}
            disabled
          >
            {vendorList.map((v, idx) => (
              <option key={idx} value={v}>
                {v}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}><strong>Purchase Account:</strong> {voucher.purchaseAccount || "--"}</Col>
        <Col md={3}><strong>Place of Supply:</strong> {voucher.placeOfSupply || "--"}</Col>
        <Col md={3}><strong>Reference No:</strong> {voucher.referenceNo || "--"}</Col>
      </Row>

      <Table bordered size="sm">
        <thead className="table-light">
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>Discount %</th>
            <th>Tax</th>
 
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((itm, idx) => (
              <tr key={idx}>
                <td>{itm.name || "--"}</td>
                <td>{itm.qty || "0"}</td>
                <td>{itm.unit || "--"}</td>
                <td>{itm.rate || "0.00"}</td>
                <td>{itm.discount || "0"}</td>
                <td>{itm.tax || "--"}</td>
     
                <td>{itm.description || "--"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center text-muted">No items added.</td>
            </tr>
          )}
        </tbody>
        {items.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan="6" className="text-end"><strong>Total</strong></td>
              <td><strong>₹ {totalAmount}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </Table>

      <div className="text-end mt-3">
        <strong>Total Items:</strong> {items.length} &nbsp;&nbsp;
        <strong>Total Amount:</strong> ₹ {totalAmount}
      </div>
    </Card>
  );
};

export default PurchaseVoucherView;
