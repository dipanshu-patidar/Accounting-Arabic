// CustomerItemDetailsView.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Table, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// ✅ Static dummy data (no array, no ID, no find logic)
const entry = {
  date: "2025-04-03",
  particulars: "Sales Invoice INV101",
  voucherNo: "INV101",
  voucherType: "Invoice",
  items: [
    {
      item: "SNB CH 58 LOT WHITE",
      quantity: "100.00 yds",
      rate: "0.400",
      discount: "0.000",
      tax: "0.000",
      taxAmt: "0.000",
      value: "40.00",
      description: "4 PCS",
    },
    {
      item: "COTTON BLUE 600GSM",
      quantity: "250.00 mtrs",
      rate: "0.300",
      discount: "0.000",
      tax: "0.000",
      taxAmt: "0.000",
      value: "75.00",
      description: "10 ROLLS",
    },
  ],
};

const CustomerItemDetailsView = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <div className="mb-3">
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          ← Back to Ledger
        </Button>
      </div>

      {/* Header */}
      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="mb-1">{entry.particulars}</h5>
          <p className="text-muted mb-0">
            <strong>Date:</strong> {entry.date} | <strong>Voucher No:</strong> {entry.voucherNo} |{" "}
            <Badge
              bg={
                entry.voucherType === "Invoice"
                  ? "primary"
                  : entry.voucherType === "Payment"
                  ? "success"
                  : entry.voucherType === "Return"
                  ? "warning"
                  : "secondary"
              }
            >
              {entry.voucherType}
            </Badge>
          </p>
        </Card.Body>
      </Card>

      {/* Item Details Table */}
      {entry.items && entry.items.length > 0 ? (
        <Card className="mt-4">
          <Card.Header className="bg-light">
            <h6>Item Details</h6>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table striped hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ITEM/SERVICE</th>
                    <th>QUANTITY</th>
                    <th>RATE</th>
                    <th>DISCOUNT</th>
                    <th>TAX</th>
                    <th>TAX AMT</th>
                    <th>VALUE</th>
                    <th>DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.item}</td>
                      <td>{item.quantity}</td>
                      <td>{item.rate}</td>
                      <td>{item.discount}</td>
                      <td>{item.tax}</td>
                      <td>{item.taxAmt}</td>
                      <td>{item.value}</td>
                      <td>{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card className="mt-4">
          <Card.Body>
            <p className="text-muted">No item details available for this transaction.</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default CustomerItemDetailsView;