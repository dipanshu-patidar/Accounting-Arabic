import React, { useState } from "react";
import { Row, Col, Form, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const SalesVoucher = () => {
const navigate = useNavigate();

// Demo Customer List
const customers = [
"Akash Enterprises",
"Laxmi Traders",
"Kamal Agencies",
"Shree Sales",
"Omkar International",
"Global Industries",
"Dev Traders",
];

const [voucher, setVoucher] = useState({
invoiceNo: "",
voucherDate: "",
dueDate: "",
customer: "",
salesAccount: "",
placeOfSupply: "",
purchaseOrderNo: "",
});

const [item, setItem] = useState({
name: "",
qty: "",
unit: "",
rate: "",
discount: "",
tax: "",
description: "",
});

const [items, setItems] = useState([]);
const [totalAmount, setTotalAmount] = useState(0);

const handleVoucherChange = (e) => {
setVoucher({ ...voucher, [e.target.name]: e.target.value });
};

const handleItemChange = (e) => {
setItem({ ...item, [e.target.name]: e.target.value });
};

const addItem = () => {
const qty = parseFloat(item.qty || 0);
constamount = parseFloat(item.rate || 0);
const discount = parseFloat(item.discount || 0);

php
Copy
Edit
const itemTotal = qty *amount * (1 - discount / 100);

const newItem = {
  ...item,
  value: itemTotal.toFixed(2),
};

setItems([...items, newItem]);
setTotalAmount((prev) => prev + itemTotal);

setItem({
  name: "",
  qty: "",
  unit: "",
 amount: "",
  discount: "",
  tax: "",
  description: "",
});
};

const deleteItem = (index) => {
const removedItem = items[index];
setTotalAmount((prev) => prev - parseFloat(removedItem.value));
setItems(items.filter((_, idx) => idx !== index));
};
const products = [
  { label: "Tata Steel Rod", value: "Tata Steel Rod" },
  { label: "Ambuja Cement", value: "Ambuja Cement" },
  { label: "Asian Paints", value: "Asian Paints" },
  { label: "UltraTech Cement", value: "UltraTech Cement" },
  { label: "JSW TMT Bar", value: "JSW TMT Bar" },
];

return (
<div className="p-4 card">
<div className="d-flex justify-content-between align-items-center mb-3">
<Button variant="light" onClick={() => navigate(-1)}>
← Back
</Button>
</div>

  <h4>Sales Voucher</h4>

  <Form className="mb-4">
    <Row>
      <Col md={3}>
        <Form.Group>
          <Form.Label>Voucher No</Form.Label>
          <Form.Control
            name="invoiceNo"
            value={voucher.invoiceNo}
            onChange={handleVoucherChange}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group>
          <Form.Label>Voucher Date</Form.Label>
          <Form.Control
            type="date"
            name="voucherDate"
            value={voucher.voucherDate}
            onChange={handleVoucherChange}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group>
          <Form.Label>Due Date</Form.Label>
          <Form.Control
            type="date"
            name="dueDate"
            value={voucher.dueDate}
            onChange={handleVoucherChange}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group>
          <Form.Label>Customer</Form.Label>
          <Form.Select
            name="customer"
            value={voucher.customer}
            onChange={handleVoucherChange}
          >
            <option value="">-- Select Customer --</option>
            {customers.map((cust, index) => (
              <option key={index} value={cust}>
                {cust}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>

    <Row className="mt-2">
      <Col md={3}>
        <Form.Group>
          <Form.Label>Sales Account</Form.Label>
          <Form.Control
            name="salesAccount"
            value={voucher.salesAccount}
            onChange={handleVoucherChange}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group>
          <Form.Label>Place of Supply</Form.Label>
          <Form.Control
            name="placeOfSupply"
            value={voucher.placeOfSupply}
            onChange={handleVoucherChange}
          />
        </Form.Group>
      </Col>
      <Col md={3}>
        <Form.Group>
          <Form.Label>Purchase Order No</Form.Label>
          <Form.Control
            name="purchaseOrderNo"
            value={voucher.purchaseOrderNo}
            onChange={handleVoucherChange}
          />
        </Form.Group>
      </Col>
    </Row>
  </Form>

  <Table bordered size="sm">
    <thead>
      <tr>
        <th>Product Name</th>
        <th>Qty</th>
        <th>Unit</th>
        <th>Amount</th>
        <th>Discount %</th>
        <th>Tax</th>
        <th>Value</th>
        <th>Description</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {items.map((itm, idx) => (
        <tr key={idx}>
          <td>{itm.name}</td>
          <td>{itm.qty}</td>
          <td>{itm.unit}</td>
          <td>{itm.rate}</td>
          <td>{itm.discount}</td>
          <td>{itm.tax}</td>
          <td>{itm.value}</td>
          <td>{itm.description}</td>
          <td>
            <Button size="sm" variant="danger" onClick={() => deleteItem(idx)}>
              X
            </Button>
          </td>
        </tr>
      ))}

      <tr>
        <td>
          <Form.Control name="name" value={item.name} onChange={handleItemChange} />
        </td>
        <td>
          <Form.Control
            name="qty"
            type="number"
            value={item.qty}
            onChange={handleItemChange}
          />
        </td>
        <td>
          <Form.Control name="unit" value={item.unit} onChange={handleItemChange} />
        </td>
        <td>
          <Form.Control
            name="rate"
            type="number"
            value={item.rate}
            onChange={handleItemChange}
          />
        </td>
        <td>
          <Form.Control
            name="discount"
            type="number"
            value={item.discount}
            onChange={handleItemChange}
          />
        </td>
        <td>
          <Form.Control name="tax" value={item.tax} onChange={handleItemChange} />
        </td>
        <td>--</td>
        <td>
          <Form.Control
            name="description"
            value={item.description}
            onChange={handleItemChange}
          />
        </td>
        <td>
          <Button size="sm" onClick={addItem}>
            Add
          </Button>
        </td>
      </tr>
    </tbody>
  </Table>

  <div className="text-end mt-3">
    <strong>Total Items:</strong> {items.length} &nbsp;&nbsp;
    <strong>Total Amount:</strong> ₹ {totalAmount.toFixed(2)}
  </div>
</div>
);
};

export default SalesVoucher;