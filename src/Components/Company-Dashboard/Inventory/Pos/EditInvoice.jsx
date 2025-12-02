import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Form, Row, Col } from "react-bootstrap";

const EditInvoice = () => {
  const invoiceRef = useRef();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    invoiceNumber: "INV-1001",
    productDetails: [
      { name: "Laptop", quantity: 1, price: 500 },
      { name: "Mouse", quantity: 2, price: 30 },
    ],
    repairParts: [
      { name: "Battery", quantity: 1, price: 100 },
      { name: "Screen", quantity: 1, price: 150 },
    ],
    cash: 0,
    eftpos: 0,
    afterpay: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        [name]: isNaN(value) ? value : Number(value),
      };

      const totalPaid =
        (updatedFormData.cash || 0) +
        (updatedFormData.eftpos || 0) +
        (updatedFormData.afterpay || 0);

      if (totalPaid > updatedFormData.total) {
        alert("Total paid (cash + eftpos + afterpay) cannot exceed total amount.");
        return prev;
      }

      return updatedFormData;
    });
  };

  const updateProductDetails = (index, key, value) => {
    const updated = [...formData.productDetails];
    updated[index][key] = key === "price" || key === "quantity" ? Number(value) : value;
    setFormData({ ...formData, productDetails: updated });
  };

  const updateRepairParts = (index, key, value) => {
    const updated = [...formData.repairParts];
    updated[index][key] = key === "price" || key === "quantity" ? Number(value) : value;
    setFormData({ ...formData, repairParts: updated });
  };

  useEffect(() => {
    const calculateSummary = () => {
      let productTotal = 0;
      let partsTotal = 0;

      if (formData.productDetails?.length) {
        productTotal = formData.productDetails.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
      }

      if (formData.repairParts?.length) {
        partsTotal = formData.repairParts.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
      }

      const totalBeforeTax = productTotal + partsTotal;
      const tax = (totalBeforeTax / 1.1) * 0.1;
      const subtotal = totalBeforeTax - tax;
      const total = subtotal + tax;

      const cash = Number(formData.cash || 0);
      const eftpos = Number(formData.eftpos || 0);
      const afterpay = Number(formData.afterpay || 0);

      const total_paid = cash + eftpos + afterpay;
      const due_amount = total - total_paid;

      setFormData((prev) => ({
        ...prev,
        tax: tax.toFixed(2),
        subtotal: subtotal.toFixed(2),
        total: total.toFixed(2),
        total_paid: total_paid.toFixed(2),
        due_amount: due_amount.toFixed(2),
      }));
    };

    calculateSummary();
  }, [
    formData.productDetails,
    formData.repairParts,
    formData.cash,
    formData.eftpos,
    formData.afterpay,
  ]);

  const handleSubmit = () => {
    alert("Invoice updated (UI only, no API called).");
    navigate("/company/manageinvoice");
  };

  return (
    <div className="container mt-5">
      <Card className="shadow p-4" ref={invoiceRef}>
        {/* 🔙 Back Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold">Edit Invoice</h3>
            <small className="fs-5" style={{ fontWeight: "400" }}>
              {formData.invoiceNumber}
            </small>
          </div>
          <Button variant="outline-secondary" onClick={() => navigate("/company/manageinvoice")}>
            ⬅ Back
          </Button>
        </div>

        {/* Product Details */}
        {formData.productDetails?.length > 0 && (
          <Card className="p-3 mb-4">
            <h5 className="fw-semibold mb-3">Product Details</h5>
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {formData.productDetails.map((product, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <Form.Control
                        value={product.name}
                        onChange={(e) => updateProductDetails(index, "name", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={product.quantity}
                        onChange={(e) =>
                          updateProductDetails(index, "quantity", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={product.price}
                        onChange={(e) =>
                          updateProductDetails(index, "price", e.target.value)
                        }
                      />
                    </td>
                    <td>A$ {(product.price * product.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Repair Parts */}
        {formData.repairParts?.length > 0 && (
          <Card className="p-3 mb-4">
            <h5 className="fw-semibold mb-3">Repair Parts</h5>
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Part Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {formData.repairParts.map((part, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <Form.Control
                        value={part.name}
                        onChange={(e) => updateRepairParts(index, "name", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={part.quantity}
                        onChange={(e) =>
                          updateRepairParts(index, "quantity", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={part.price}
                        onChange={(e) => updateRepairParts(index, "price", e.target.value)}
                      />
                    </td>
                    <td>A$ {(part.price * part.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Payment Methods */}
        <Card className="p-3 mb-4">
          <h5 className="fw-semibold">Payment Methods</h5>
          <Row>
            {["cash", "eftpos", "afterpay"].map((field) => (
              <Col md={4} key={field} className="mb-3">
                <Form.Label className="fw-semibold text-capitalize">{field}</Form.Label>
                <Form.Control
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleInputChange}
                  type="number"
                />
              </Col>
            ))}
          </Row>
        </Card>

        {/* Summary */}
        <Card className="p-3 mb-4">
          <h5 className="fw-semibold">Invoice Summary</h5>
          <Row>
            {["subtotal", "tax", "total", "total_paid", "due_amount", "invoiceNumber"].map(
              (field) => (
                <Col md={4} key={field} className="mb-3">
                  <Form.Label className="fw-semibold text-capitalize">
                    {field.replace("_", " ")}
                  </Form.Label>
                  <Form.Control
                    name={field}
                    value={formData[field] || ""}
                    onChange={handleInputChange}
                    readOnly
                  />
                </Col>
              )
            )}
          </Row>
        </Card>

        <Button variant="primary" onClick={handleSubmit}>
          Update Invoice
        </Button>
      </Card>
    </div>
  );
};

export default EditInvoice;
