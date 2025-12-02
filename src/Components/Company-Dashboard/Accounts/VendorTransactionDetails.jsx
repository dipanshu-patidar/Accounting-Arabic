// VendorTransactionDetails.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Container, Card, Table, Badge } from "react-bootstrap";

const VendorTransactionDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get filtered data passed from LedgerVendor
  const filteredData = location.state?.transactions || [];

  // Count voucher types
  const voucherTypeCounts = {};
  const typeMap = {
    Invoice: "Purchase",
    Payment: "Payment",
    Return: "Purchase Return",
    Opening: "Opening Balance",
  };

  filteredData.forEach((entry) => {
    const displayType = typeMap[entry.voucherType] || entry.voucherType;
    voucherTypeCounts[displayType] = (voucherTypeCounts[displayType] || 0) + 1;
  });

  // All possible transaction types (with proper display names)
  const allTypes = [
    "Opening Balance",
    "Purchase",
    "Payment",
    "Purchase Return",
    "Receipt",
    "Sales Return",
    "Manufacturing",
    "Stock Journal",
    "Stock Adjustment",
    "Banking",
    "Journal",
  ];

  // Generate rows
  const transactionRows = allTypes.map((type) => ({
    type,
    count: voucherTypeCounts[type] || 0,
  }));

  const totalTransactions = transactionRows.reduce((sum, row) => sum + row.count, 0);

  // Badge color logic
  const getBadgeBg = (type) => {
    switch (type) {
      case "Purchase":
        return "primary";
      case "Payment":
        return "success";
      case "Purchase Return":
        return "warning";
      case "Opening Balance":
        return "info";
      case "Stock Journal":
      case "Stock Adjustment":
        return "info";
      case "Manufacturing":
        return "dark";
      case "Banking":
      case "Journal":
      case "Receipt":
      case "Sales Return":
        return "secondary";
      default:
        return "light";
    }
  };

  return (
    <div className="container mt-4">
      {/* Back Button Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Vendor Transaction Summary</h4>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Back to Ledger
        </Button>
      </div>

      {/* Transaction Count Card */}
      <Card className="shadow-sm">
        <Card.Body>
          <div className="table-responsive">
            <Table striped hover bordered className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Transaction Type</th>
                  <th className="text-center">Count</th>
                </tr>
              </thead>
              <tbody>
                {transactionRows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <Badge bg={getBadgeBg(row.type)} className="px-2 py-1">
                        {row.type}
                      </Badge>
                    </td>
                    <td className="text-center fw-bold">{row.count}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-light fw-bold">
                  <td>Total Transactions</td>
                  <td className="text-center">{totalTransactions}</td>
                </tr>
              </tfoot>
            </Table>
          </div>

          {/* Optional: No data */}
          {filteredData.length === 0 && (
            <p className="text-muted text-center py-3 mb-0">
              No transactions found in the current filter.
            </p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default VendorTransactionDetails;