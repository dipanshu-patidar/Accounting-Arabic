// CustomerTransactionDetails.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Card, Table } from "react-bootstrap";

const CustomerTransactionDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get filtered data passed from Ledgercustomer
  const filteredData = location.state?.filteredData || [];

  // Count voucher types
  const voucherTypeCounts = {};
  filteredData.forEach(entry => {
    const type = entry.voucherType;
    voucherTypeCounts[type] = (voucherTypeCounts[type] || 0) + 1;
  });

  // Define all possible transaction types (as per your screenshot)
  const allTypes = [
    "Invoice",
    "Purchase",
    "Receipt",
    "Payment",
    "Sales Return",
    "Purchase Return",
    "Manufacturing",
    "Stock Journal",
    "Stock Adjustment",
    "Banking",
    "Journal"
  ];

  // Generate rows with count
  const transactionRows = allTypes.map(type => ({
    type,
    count: voucherTypeCounts[type] || 0
  }));

  const totalTransactions = transactionRows.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Transaction Type Summary</h4>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {/* Table Card */}
      <Card>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Transaction Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {transactionRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.type}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-light fw-bold">
                <td>Total Transactions</td>
                <td>{totalTransactions}</td>
              </tr>
            </tfoot>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomerTransactionDetails;