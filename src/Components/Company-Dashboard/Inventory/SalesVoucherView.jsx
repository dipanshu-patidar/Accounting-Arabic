import React from "react";
import { Row, Col, Table, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SalesVoucherView = () => {
  const navigate = useNavigate();

  // Demo pre-filled data
  const voucher = {
    invoiceNo: "INV-1001",
    voucherDate: "2025-07-24",
    dueDate: "2025-07-31",
    customer: "Acme Corp.",
    salesAccount: "Sales - Electronics",
    placeOfSupply: "Indore, MP",
    purchaseOrderNo: "PO-7890",
  };

  const items = [
    {
      name: "Laptop",
      qty: 2,
      unit: "pcs",
      rate: 50000,
      discount: 5,
      tax: "18% GST",
      value: 95000,
      description: "Dell i5 laptops",
    },
    {
      name: "Mouse",
      qty: 5,
      unit: "pcs",
      rate: 500,
      discount: 0,
      tax: "18% GST",
      value: 2500,
      description: "Wireless mouse",
    },
  ];

  const totalAmount = items.reduce((acc, cur) => acc + parseFloat(cur.value), 0).toFixed(2);

  return (
    <Card className="p-4 mt-3 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Sales Voucher</h4>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>

      <Row className="mb-3">
        <Col md={3}><strong>Invoice No:</strong> {voucher.invoiceNo || "--"}</Col>
        <Col md={3}><strong>Voucher Date:</strong> {voucher.voucherDate || "--"}</Col>
        <Col md={3}><strong>Due Date:</strong> {voucher.dueDate || "--"}</Col>
        <Col md={3}><strong>Customer:</strong> {voucher.customer || "--"}</Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}><strong>Sales Account:</strong> {voucher.salesAccount || "--"}</Col>
        <Col md={3}><strong>Place of Supply:</strong> {voucher.placeOfSupply || "--"}</Col>
        <Col md={3}><strong>Purchase Order No:</strong> {voucher.purchaseOrderNo || "--"}</Col>
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
            <th>Value</th>
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
                <td>{itm.value || "0.00"}</td>
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

export default SalesVoucherView;