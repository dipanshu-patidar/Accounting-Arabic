import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table, Spinner } from "react-bootstrap";
import { FaFileInvoiceDollar, FaCalendarAlt, FaFilter, FaFilePdf, FaFileExcel, FaDownload, FaFile } from "react-icons/fa";
import GetCompanyId from "../../../Api/GetCompanyId";
import './IncomeStatementReport.css';

// Utility function for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const IncomeStatementReport = () => {
  const companyId = GetCompanyId();
  const [dateRange, setDateRange] = useState('current_month');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockIncomeStatement = {
    period: 'January 2024',
    revenue: {
      total: 125000,
      items: [
        { category: 'Steel Rods', amount: 75000, percentage: 60 },
        { category: 'Copper Wire', amount: 35000, percentage: 28 },
        { category: 'Aluminum Sheets', amount: 15000, percentage: 12 }
      ]
    },
    costOfGoodsSold: {
      total: 65000,
      items: [
        { category: 'Raw Materials', amount: 40000, percentage: 61.5 },
        { category: 'Direct Labor', amount: 15000, percentage: 23.1 },
        { category: 'Manufacturing Overhead', amount: 10000, percentage: 15.4 }
      ]
    },
    grossProfit: 60000,
    operatingExpenses: {
      total: 35000,
      items: [
        { category: 'Salaries', amount: 20000, percentage: 57.1 },
        { category: 'Rent', amount: 8000, percentage: 22.9 },
        { category: 'Utilities', amount: 3000, percentage: 8.6 },
        { category: 'Marketing', amount: 4000, percentage: 11.4 }
      ]
    },
    operatingIncome: 25000,
    otherIncome: 2000,
    otherExpenses: 1500,
    netIncome: 25500
  };

  useEffect(() => {
    // Simulate API call
    const fetchReportData = async () => {
      setLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        setReportData(mockIncomeStatement);
        setLoading(false);
      }, 800);
    };

    fetchReportData();
  }, [dateRange]);

  const handleExport = (format) => {
    // In a real app, this would trigger an export
    alert(`Exporting income statement as ${format.toUpperCase()}`);
  };

  return (
    <Container fluid className="income-statement-container py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h4 className="income-statement-title">
            <FaFileInvoiceDollar className="me-2" />
            Income Statement Report
          </h4>
          <p className="income-statement-subtitle mb-0">
            Financial performance {reportData ? `for ${reportData.period}` : ''}
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap mt-2">
          <div className="position-relative">
            <FaCalendarAlt className="position-absolute start-0 top-50 translate-middle-y ms-3" style={{ color: '#6c757d', zIndex: 10 }} />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="filter-select ps-5"
            >
              <option value="current_week">Current Week</option>
              <option value="current_month">Current Month</option>
              <option value="current_quarter">Current Quarter</option>
              <option value="current_year">Current Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <Button className="btn-filter" size="sm">
            <FaFilter /> Filter
          </Button>
          <Button 
            className="btn-export-pdf" 
            size="sm"
            onClick={() => handleExport('pdf')}
          >
            <FaFilePdf /> PDF
          </Button>
          <Button 
            className="btn-export-excel" 
            size="sm"
            onClick={() => handleExport('excel')}
          >
            <FaFileExcel /> Excel
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" className="spinner-custom" />
          <p className="mt-3">Loading income statement data...</p>
        </div>
      ) : !reportData ? (
        <div className="text-center py-5 empty-state">
          <FaFile style={{ fontSize: "3rem", color: "#adb5bd", marginBottom: "1rem" }} />
          <p className="text-muted mb-0">No income statement data available</p>
        </div>
      ) : (
        <>

          {/* Summary Cards */}
          <Row className="g-3 mb-4">
            <Col xs={12} md={4}>
              <Card className="summary-card summary-card-revenue">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="summary-card-label mb-0">Total Revenue</h5>
                    <span className="summary-card-badge">Revenue</span>
                  </div>
                  <div className="summary-card-value">{formatCurrency(reportData.revenue.total)}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="summary-card summary-card-profit">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="summary-card-label mb-0">Gross Profit</h5>
                    <span className="summary-card-badge">Profit</span>
                  </div>
                  <div className="summary-card-value">{formatCurrency(reportData.grossProfit)}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="summary-card summary-card-income">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="summary-card-label mb-0">Net Income</h5>
                    <span className="summary-card-badge">Income</span>
                  </div>
                  <div className="summary-card-value">{formatCurrency(reportData.netIncome)}</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Revenue and COGS Tables */}
          <Row className="g-3 mb-4">
            <Col xs={12} lg={6}>
              <Card className="table-card">
                <Card.Header className="table-card-header">
                  <h5>Revenue Breakdown</h5>
                </Card.Header>
                <Card.Body className="table-card-body">
                  <div className="table-responsive">
                    <Table className="income-statement-table" hover>
                      <thead className="table-header">
                        <tr>
                          <th>Category</th>
                          <th className="text-end">Amount</th>
                          <th className="text-end">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.revenue.items.map((item, index) => (
                          <tr key={index}>
                            <td><strong>{item.category}</strong></td>
                            <td className="amount-cell">{formatCurrency(item.amount)}</td>
                            <td className="percentage-cell">{item.percentage}%</td>
                          </tr>
                        ))}
                        <tr className="total-row">
                          <td><strong>Total Revenue</strong></td>
                          <td className="amount-cell"><strong>{formatCurrency(reportData.revenue.total)}</strong></td>
                          <td className="percentage-cell"><strong>100%</strong></td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} lg={6}>
              <Card className="table-card">
                <Card.Header className="table-card-header">
                  <h5>Cost of Goods Sold</h5>
                </Card.Header>
                <Card.Body className="table-card-body">
                  <div className="table-responsive">
                    <Table className="income-statement-table" hover>
                      <thead className="table-header">
                        <tr>
                          <th>Category</th>
                          <th className="text-end">Amount</th>
                          <th className="text-end">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.costOfGoodsSold.items.map((item, index) => (
                          <tr key={index}>
                            <td><strong>{item.category}</strong></td>
                            <td className="amount-cell">{formatCurrency(item.amount)}</td>
                            <td className="percentage-cell">{item.percentage}%</td>
                          </tr>
                        ))}
                        <tr className="total-row">
                          <td><strong>Total COGS</strong></td>
                          <td className="amount-cell"><strong>{formatCurrency(reportData.costOfGoodsSold.total)}</strong></td>
                          <td className="percentage-cell"><strong>100%</strong></td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Operating Expenses Table */}
          <Card className="table-card mb-4">
            <Card.Header className="table-card-header">
              <h5>Operating Expenses</h5>
            </Card.Header>
            <Card.Body className="table-card-body">
              <div className="table-responsive">
                <Table className="income-statement-table" hover>
                  <thead className="table-header">
                    <tr>
                      <th>Category</th>
                      <th className="text-end">Amount</th>
                      <th className="text-end">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.operatingExpenses.items.map((item, index) => (
                      <tr key={index}>
                        <td><strong>{item.category}</strong></td>
                        <td className="amount-cell">{formatCurrency(item.amount)}</td>
                        <td className="percentage-cell">{item.percentage}%</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td><strong>Total Operating Expenses</strong></td>
                      <td className="amount-cell"><strong>{formatCurrency(reportData.operatingExpenses.total)}</strong></td>
                      <td className="percentage-cell"><strong>100%</strong></td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* Income Summary Card */}
          <Card className="income-summary-card">
            <Card.Header className="income-summary-header">
              <h5>Income Summary</h5>
            </Card.Header>
            <Card.Body className="income-summary-body">
              <div className="summary-row">
                <span className="summary-label">Total Revenue</span>
                <span className="summary-value">{formatCurrency(reportData.revenue.total)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Less: Cost of Goods Sold</span>
                <span className="summary-value summary-value-negative">({formatCurrency(reportData.costOfGoodsSold.total)})</span>
              </div>
              <div className="summary-row summary-row-total">
                <span className="summary-label">Gross Profit</span>
                <span className="summary-value summary-value-positive">{formatCurrency(reportData.grossProfit)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Less: Operating Expenses</span>
                <span className="summary-value summary-value-negative">({formatCurrency(reportData.operatingExpenses.total)})</span>
              </div>
              <div className="summary-row summary-row-total">
                <span className="summary-label">Operating Income</span>
                <span className="summary-value summary-value-positive">{formatCurrency(reportData.operatingIncome)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Add: Other Income</span>
                <span className="summary-value summary-value-positive">{formatCurrency(reportData.otherIncome)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Less: Other Expenses</span>
                <span className="summary-value summary-value-negative">({formatCurrency(reportData.otherExpenses)})</span>
              </div>
              <div className="summary-row summary-row-total">
                <span className="summary-label">Net Income</span>
                <span className="summary-value summary-value-positive">{formatCurrency(reportData.netIncome)}</span>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default IncomeStatementReport;