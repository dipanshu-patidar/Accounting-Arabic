import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Spinner } from 'react-bootstrap';
import { FaFileAlt, FaFile, FaFilePdf, FaFileExcel, FaSearch, FaDownload } from 'react-icons/fa';
import GetCompanyId from '../../../Api/GetCompanyId';
import { format } from 'date-fns';
import './AccountStatemetReport.css';

const AccountStatementReport = () => {
  const companyId = GetCompanyId();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [accountData, setAccountData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize with current month dates
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(format(firstDay, 'yyyy-MM-dd'));
    setEndDate(format(lastDay, 'yyyy-MM-dd'));
    
    // Simulate API call
    const fetchData = async () => {
      setLoading(true);
      // Mock data for account statement
      const mockData = [
        { id: 1, date: '2023-05-15', description: 'Invoice #INV-001', debit: 0, credit: 14160.00, balance: 14160.00, status: 'completed', customer: 'ABC Traders' },
        { id: 2, date: '2023-05-18', description: 'Invoice #INV-002', debit: 0, credit: 10300.00, balance: 24460.00, status: 'completed', customer: 'XYZ Corp' },
        { id: 3, date: '2023-05-20', description: 'Payment #PAY-001', debit: 5000.00, credit: 0, balance: 19460.00, status: 'completed', customer: 'ABC Traders' },
        { id: 4, date: '2023-05-22', description: 'Invoice #INV-003', debit: 0, credit: 8750.00, balance: 28210.00, status: 'pending', customer: 'Global Industries' },
        { id: 5, date: '2023-05-25', description: 'Invoice #INV-004', debit: 0, credit: 15600.00, balance: 43810.00, status: 'pending', customer: 'Tech Solutions' },
        { id: 6, date: '2023-05-28', description: 'Payment #PAY-002', debit: 3000.00, credit: 0, balance: 40810.00, status: 'completed', customer: 'XYZ Corp' },
        { id: 7, date: '2023-06-01', description: 'Invoice #INV-005', debit: 0, credit: 9200.00, balance: 50010.00, status: 'pending', customer: 'ABC Traders' },
        { id: 8, date: '2023-06-05', description: 'Invoice #INV-006', debit: 0, credit: 11200.00, balance: 61210.00, status: 'pending', customer: 'Mega Corp' },
      ];
      
      setTimeout(() => {
        setAccountData(mockData);
        setFilteredData(mockData);
        setLoading(false);
      }, 800);
    };
    
    fetchData();
  }, [companyId]);
  
  // Filter data based on criteria
  useEffect(() => {
    let result = accountData;
    
    if (startDate && endDate) {
      result = result.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });
    }
    
    if (category !== 'all') {
      result = result.filter(item => item.status === category);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.description.toLowerCase().includes(term) || 
        item.customer.toLowerCase().includes(term)
      );
    }
    
    setFilteredData(result);
  }, [startDate, endDate, category, searchTerm, accountData]);
  
  // Calculate summary values
  const totalDebit = filteredData.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = filteredData.reduce((sum, item) => sum + item.credit, 0);
  const totalBalance = filteredData.length > 0 ? filteredData[filteredData.length - 1].balance : 0;
  const pendingAmount = filteredData
    .filter(item => item.status === 'pending')
    .reduce((sum, item) => sum + item.credit, 0);
  
  const handleGenerateReport = () => {
    // In a real app, this would generate or refresh the report
    console.log('Generating report with filters:', { startDate, endDate, category, searchTerm });
  };

  const handleExport = (format) => {
    // In a real app, this would trigger an export
    alert(`Exporting account statement as ${format.toUpperCase()}`);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <Container fluid className="account-statement-container py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h4 className="account-statement-title">
            <FaFileAlt className="me-2" />
            Account Statement Report
          </h4>
          <p className="account-statement-subtitle mb-0">View and manage your account statements</p>
        </div>
        <div className="d-flex gap-2 flex-wrap mt-2">
          <Button className="btn-export-pdf" size="sm" onClick={() => handleExport('pdf')}>
            <FaFilePdf /> PDF
          </Button>
          <Button className="btn-export-excel" size="sm" onClick={() => handleExport('excel')}>
            <FaFileExcel /> Excel
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" className="spinner-custom" />
          <p className="mt-3">Loading account statement data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <Row className="g-3 mb-4">
            <Col xs={12} md={3}>
              <Card className="summary-card summary-card-balance">
                <Card.Body>
                  <div className="summary-card-label">Total Balance</div>
                  <div className="summary-card-value">{formatCurrency(totalBalance)}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={3}>
              <Card className="summary-card summary-card-debit">
                <Card.Body>
                  <div className="summary-card-label">Total Debit</div>
                  <div className="summary-card-value">{formatCurrency(totalDebit)}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={3}>
              <Card className="summary-card summary-card-credit">
                <Card.Body>
                  <div className="summary-card-label">Total Credit</div>
                  <div className="summary-card-value">{formatCurrency(totalCredit)}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={3}>
              <Card className="summary-card summary-card-pending">
                <Card.Body>
                  <div className="summary-card-label">Pending Amount</div>
                  <div className="summary-card-value">{formatCurrency(pendingAmount)}</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        
          {/* Filters */}
          <Card className="filter-card mb-4">
            <Card.Body>
              <Row className="g-3 align-items-end">
                <Col xs={12} md={2}>
                  <Form.Label className="filter-label">Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="filter-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <Form.Label className="filter-label">End Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="filter-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Col>
                <Col xs={12} md={2}>
                  <Form.Label className="filter-label">Status</Form.Label>
                  <Form.Select
                    className="filter-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </Form.Select>
                </Col>
                <Col xs={12} md={3}>
                  <Form.Label className="filter-label">Search</Form.Label>
                  <div className="position-relative">
                    <FaSearch className="position-absolute start-0 top-50 translate-middle-y ms-3" style={{ color: '#6c757d', zIndex: 10 }} />
                    <Form.Control
                      type="text"
                      className="filter-input ps-5"
                      placeholder="Search by description or customer"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </Col>
                <Col xs={12} md={3} className="d-flex justify-content-md-end justify-content-start">
                  <Button className="btn-generate w-100 w-md-auto" onClick={handleGenerateReport}>
                    Generate Report
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        
          {/* Table */}
          <Card className="account-statement-table-card">
            <Card.Body>
              <div className="table-responsive">
                {filteredData.length > 0 ? (
                  <Table className="account-statement-table" hover responsive="sm">
                    <thead className="table-header">
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Customer</th>
                        <th className="text-end">Debit</th>
                        <th className="text-end">Credit</th>
                        <th className="text-end">Balance</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item) => (
                        <tr key={item.id}>
                          <td>{item.date}</td>
                          <td><strong>{item.description}</strong></td>
                          <td>{item.customer}</td>
                          <td className={`amount-cell debit-cell text-end`}>
                            {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                          </td>
                          <td className={`amount-cell credit-cell text-end`}>
                            {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                          </td>
                          <td className="balance-cell text-end">{formatCurrency(item.balance)}</td>
                          <td>
                            <span className={`status-badge ${item.status === 'completed' ? 'badge-completed' : 'badge-pending'}`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5 empty-state">
                    <FaFile style={{ fontSize: "3rem", color: "#adb5bd", marginBottom: "1rem" }} />
                    <p className="text-muted mb-0">No account statement records found</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default AccountStatementReport;