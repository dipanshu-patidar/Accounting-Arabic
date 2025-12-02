import React, { useState } from "react";
import { Row, Col, Form, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PurchaseVoucher = () => {
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState({
    invoiceNo: "",
    voucherDate: "",
    dueDate: "",
    supplier: "", // Now used as Vendor
    purchaseAccount: "",
    placeOfSupply: "",
    referenceNo: "",
  });

  const [item, setItem] = useState({
    name: "",
    qty: "",
    unit: "",
    amount: "",
    discount: "",
    tax: "",
    description: "",
  });

  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const availableItems = ["Maggi", "Aata Noodles", "Rice", "Oil", "Tea"];

  const vendorList = ["Global Traders", "Sunrise Suppliers", "Shree Enterprises", "TechZone", "Om Bhandar"];

  const handleVoucherChange = (e) => {
    setVoucher({ ...voucher, [e.target.name]: e.target.value });
  };

  const handleItemChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const addItem = () => {
    const qty = parseFloat(item.qty || 0);
    const rate = parseFloat(item.rate || 0);
    const discount = parseFloat(item.discount || 0);

    const itemTotal = qty * rate * (1 - discount / 100);

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
      rate: "",
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

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All data will be lost.")) {
      setVoucher({
        invoiceNo: "",
        voucherDate: "",
        dueDate: "",
        supplier: "",
        purchaseAccount: "",
        placeOfSupply: "",
        referenceNo: "",
      });
      setItem({
        name: "",
        qty: "",
        unit: "",
        rate: "",
        discount: "",
        tax: "",
        description: "",
      });
      setItems([]);
      setTotalAmount(0);
    }
  };

  const handleSave = () => {
    const payload = {
      voucher,
      items,
      totalAmount,
    };
    console.log("Saving Purchase Voucher:", payload);
    alert("Voucher saved (check console for data).");
  };

  return (
    <div className="p-4 card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="light" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>

      <h4>Purchase Voucher</h4>

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
              <Form.Label>Vendor</Form.Label>
              <Form.Select
                name="supplier"
                value={voucher.supplier}
                onChange={handleVoucherChange}
              >
                <option value="">-- Select Vendor --</option>
                {vendorList.map((v, idx) => (
                  <option key={idx} value={v}>
                    {v}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>            
          </Col>
        </Row>

        <Row className="mt-2">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Purchase Account</Form.Label>
              <Form.Control
                name="purchaseAccount"
                value={voucher.purchaseAccount}
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
              <Form.Label>Reference No</Form.Label>
              <Form.Control
                name="referenceNo"
                value={voucher.referenceNo}
                onChange={handleVoucherChange}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      <Table bordered size="sm">
        <thead>
          <tr>
            <th> Product Name</th>
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
              <td>{itm.amount}</td>
              <td>{itm.discount}</td>
              <td>{itm.tax}</td>
              <td>{itm.value}</td>
              <td>{itm.description}</td>
              <td>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteItem(idx)}
                >
                  X
                </Button>
              </td>
            </tr>
          ))}

          <tr>
            <td>
              <Form.Select
                name="name"
                value={item.name}
                onChange={handleItemChange}
              >
                <option value="">-- Select Item --</option>
                {availableItems.map((itm, idx) => (
                  <option key={idx} value={itm}>
                    {itm}
                  </option>
                ))}
              </Form.Select>
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
              <Form.Control
                name="unit"
                value={item.unit}
                onChange={handleItemChange}
              />
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
              <Form.Control
                name="tax"
                value={item.tax}
                onChange={handleItemChange}
              />
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

      <div className="text-end mt-3 mb-4">
        <strong>Total Items:</strong> {items.length} &nbsp;&nbsp;
        <strong>Total Amount:</strong> ₹ {totalAmount.toFixed(2)}
      </div>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default PurchaseVoucher;
