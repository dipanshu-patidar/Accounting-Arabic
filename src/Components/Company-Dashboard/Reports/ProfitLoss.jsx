import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Row, Col, Form, Button, Modal, Table, Alert, Spinner } from 'react-bootstrap';
import axiosInstance from '../../../Api/axiosInstance';
import GetCompanyId from '../../../Api/GetCompanyId';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProfitLoss.css';

const ProfitLoss = () => {
  const companyId = GetCompanyId();
  const [detailedView, setDetailedView] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('01');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [profitLossData, setProfitLossData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: '2025-01-01',
    to: '2025-11-29'
  });
  const [noDataFound, setNoDataFound] = useState(false);
  
  // Get month name from number
  const getMonthName = (monthNum) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNum) - 1];
  };
  
  // Fetch profit loss data from API
  useEffect(() => {
    const fetchProfitLossData = async () => {
      try {
        setLoading(true);
        setNoDataFound(false);
        setError(null);
        
        const response = await axiosInstance.get(`Statement/${companyId}/profit-loss`, {
          params: {
            from_date: dateRange.from,
            to_date: dateRange.to
          }
        });
        
        if (response.data && response.data.success) {
          // Transform API data to component format
          const transformedData = transformApiDataToComponentFormat(response.data);
          setProfitLossData(transformedData);
          
          // Check if there's any actual data
          const hasAccounts = response.data.groups.some(group => group.accounts.length > 0);
          if (!hasAccounts) {
            setNoDataFound(true);
            toast.info("No data found for the selected period");
          }
        } else {
          setNoDataFound(true);
          toast.info("No data found for the selected period");
        }
      } catch (err) {
        // Handle 404 and other errors without showing the error message
        if (err.response && err.response.status === 404) {
          setNoDataFound(true);
          toast.info("No data found for the selected period");
        } else {
          setError(err.message || 'Failed to fetch profit loss data');
          toast.error("An error occurred while fetching data");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfitLossData();
  }, [companyId, dateRange]);
  
  // Transform API data to the format expected by the component
  const transformApiDataToComponentFormat = (apiData) => {
    const result = [];
    let idCounter = 1;
    
    // Add Sales
    if (apiData.groups.find(g => g.key === 'sales') && apiData.groups.find(g => g.key === 'sales').accounts.length > 0) {
      const salesGroup = apiData.groups.find(g => g.key === 'sales');
      salesGroup.accounts.forEach(account => {
        result.push({
          id: idCounter++,
          particulars: account.account_label,
          debit: account.total_debit,
          credit: account.total_credit,
          type: 'income',
          details: [], // Will be fetched when clicking on the account
          account_id: account.account_id,
          link: account.link
        });
      });
      
      // Add Gross Profit
      result.push({
        id: idCounter++,
        particulars: 'Gross Profit',
        debit: 0,
        credit: apiData.totals.grossProfit,
        type: 'summary'
      });
    }
    
    // Add Cost of Goods Sold Header
    result.push({
      id: idCounter++,
      particulars: 'Cost of Goods Sold',
      debit: 0,
      credit: 0,
      type: 'header'
    });
    
    // Add COGS Accounts
    if (apiData.groups.find(g => g.key === 'cogs') && apiData.groups.find(g => g.key === 'cogs').accounts.length > 0) {
      const cogsGroup = apiData.groups.find(g => g.key === 'cogs');
      cogsGroup.accounts.forEach(account => {
        result.push({
          id: idCounter++,
          particulars: account.account_label,
          debit: account.total_debit,
          credit: account.total_credit,
          type: 'expense',
          details: [], // Will be fetched when clicking on the account
          account_id: account.account_id,
          link: account.link
        });
      });
    }
    
    // Add Operating Expenses Header
    result.push({
      id: idCounter++,
      particulars: 'Operating Expenses',
      debit: 0,
      credit: 0,
      type: 'header'
    });
    
    // Add Operating Expenses Accounts
    if (apiData.groups.find(g => g.key === 'opex') && apiData.groups.find(g => g.key === 'opex').accounts.length > 0) {
      const opexGroup = apiData.groups.find(g => g.key === 'opex');
      opexGroup.accounts.forEach(account => {
        result.push({
          id: idCounter++,
          particulars: account.account_label,
          debit: account.total_debit,
          credit: account.total_credit,
          type: 'expense',
          details: [], // Will be fetched when clicking on the account
          account_id: account.account_id,
          link: account.link
        });
      });
    }
    
    // Add Total Operating Expenses
    result.push({
      id: idCounter++,
      particulars: 'Total Operating Expenses',
      debit: apiData.totals.totalOperatingExpenses,
      credit: 0,
      type: 'summary'
    });
    
    // Add Operating Income
    result.push({
      id: idCounter++,
      particulars: 'Operating Income',
      debit: 0,
      credit: apiData.totals.operatingIncome,
      type: 'summary'
    });
    
    // Add Other Income Header
    result.push({
      id: idCounter++,
      particulars: 'Other Income',
      debit: 0,
      credit: 0,
      type: 'header'
    });
    
    // Add Other Income Accounts
    if (apiData.groups.find(g => g.key === 'other_income') && apiData.groups.find(g => g.key === 'other_income').accounts.length > 0) {
      const otherIncomeGroup = apiData.groups.find(g => g.key === 'other_income');
      otherIncomeGroup.accounts.forEach(account => {
        result.push({
          id: idCounter++,
          particulars: account.account_label,
          debit: account.total_debit,
          credit: account.total_credit,
          type: 'income',
          details: [], // Will be fetched when clicking on the account
          account_id: account.account_id,
          link: account.link
        });
      });
    }
    
    // Add Other Expenses Header
    result.push({
      id: idCounter++,
      particulars: 'Other Expenses',
      debit: 0,
      credit: 0,
      type: 'header'
    });
    
    // Add Other Expense Accounts
    if (apiData.groups.find(g => g.key === 'other_expense') && apiData.groups.find(g => g.key === 'other_expense').accounts.length > 0) {
      const otherExpenseGroup = apiData.groups.find(g => g.key === 'other_expense');
      otherExpenseGroup.accounts.forEach(account => {
        result.push({
          id: idCounter++,
          particulars: account.account_label,
          debit: account.total_debit,
          credit: account.total_credit,
          type: 'expense',
          details: [], // Will be fetched when clicking on the account
          account_id: account.account_id,
          link: account.link
        });
      });
    }
    
    // Add Net Profit Before Tax
    result.push({
      id: idCounter++,
      particulars: 'Net Profit Before Tax',
      debit: 0,
      credit: apiData.totals.netProfitBeforeTax,
      type: 'summary'
    });
    
    // Add Tax Header
    result.push({
      id: idCounter++,
      particulars: 'Tax',
      debit: 0,
      credit: 0,
      type: 'header'
    });
    
    // Add Tax Accounts
    if (apiData.groups.find(g => g.key === 'tax') && apiData.groups.find(g => g.key === 'tax').accounts.length > 0) {
      const taxGroup = apiData.groups.find(g => g.key === 'tax');
      taxGroup.accounts.forEach(account => {
        result.push({
          id: idCounter++,
          particulars: account.account_label,
          debit: account.total_debit,
          credit: account.total_credit,
          type: 'expense',
          details: [], // Will be fetched when clicking on the account
          account_id: account.account_id,
          link: account.link
        });
      });
    }
    
    // Add Net Profit
    result.push({
      id: idCounter++,
      particulars: 'Net Profit',
      debit: 0,
      credit: apiData.totals.netProfit,
      type: 'summary'
    });
    
    return result;
  };
  
  // Fetch account details when an account is clicked
  const fetchAccountDetails = async (account) => {
    try {
      if (!account.link) {
        setSelectedAccount(account);
        return;
      }
      
      // Fetch transaction details for the selected account
      const response = await axiosInstance.get(account.link);
      
      if (response.data && response.data.success) {
        // Update the account with transaction details
        const updatedAccount = {
          ...account,
          details: response.data.transactions || []
        };
        setSelectedAccount(updatedAccount);
      } else {
        setSelectedAccount(account);
        toast.info("No transaction details available for this account");
      }
    } catch (err) {
      console.error('Error fetching account details:', err);
      setSelectedAccount(account);
      // Don't show error for 404, just show a generic message
      if (err.response && err.response.status === 404) {
        toast.info("No transaction details available for this account");
      } else {
        toast.error("Failed to fetch account details");
      }
    }
  };
  
  const toggleDetailedView = () => {
    setDetailedView(!detailedView);
  };
  
  const handleAccountClick = (account) => {
    if (account.type !== 'header' && account.type !== 'summary') {
      fetchAccountDetails(account);
      // Reset date filters when opening a new account
      setFilterFromDate('');
      setFilterToDate('');
    }
  };
  
  const closeModal = () => {
    setSelectedAccount(null);
  };
  
  // Filter details by selected date range
  const filterDetailsByDateRange = (details) => {
    if (!details) return [];
    
    return details.filter(detail => {
      const detailDate = new Date(detail.date);
      const from = filterFromDate ? new Date(filterFromDate) : null;
      const to = filterToDate ? new Date(filterToDate) : null;
      
      if (from && to) {
        return detailDate >= from && detailDate <= to;
      } else if (from) {
        return detailDate >= from;
      } else if (to) {
        return detailDate <= to;
      }
      return true; // No filter applied
    });
  };
  
  // Calculate total amount for filtered details
  const calculateTotal = (details) => {
    return details.reduce((sum, detail) => sum + detail.amount, 0);
  };
  
  // Handle date range changes
  const handleDateRangeChange = () => {
    // Update the date range based on selected year and month
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    
    // Calculate first day of the month
    const fromDate = new Date(year, month - 1, 1);
    const fromDateString = fromDate.toISOString().split('T')[0];
    
    // Calculate last day of the month
    const toDate = new Date(year, month, 0);
    const toDateString = toDate.toISOString().split('T')[0];
    
    setDateRange({
      from: fromDateString,
      to: toDateString
    });
  };
  
  // Update date range when year or month changes
  useEffect(() => {
    handleDateRangeChange();
  }, [selectedYear, selectedMonth]);
  
  if (loading) {
    return (
      <div className="p-4 profit-loss-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <Spinner animation="border" style={{ color: "#505ece" }} />
        </div>
      </div>
    );
  }
  
  // Create empty data structure for no data scenario
  const getEmptyDataStructure = () => {
    const result = [];
    let idCounter = 1;
    
    // Add headers with no accounts
    result.push({
      id: idCounter++,
      particulars: 'Sales',
      debit: 0,
      credit: 0,
      type: 'header'
    });
    
    result.push({
      id: idCounter++,
      particulars: 'Gross Profit',
      debit: 0,
      credit: 0,
      type: 'summary'
    });
    
    result.push({
      id: idCounter++,
      particulars: 'Cost of Goods Sold',
      debit: 0,
      credit: 0,
      type: 'header'
    });
    
    result.push({
      id: idCounter++,
      particulars: 'Operating Expenses',
      debit: 0,
      credit: 0,
      type: 'header'
    });
    
    result.push({
      id: idCounter++,
      particulars: 'Total Operating Expenses',
      debit: 0,
      credit: 0,
      type: 'summary'
    });
    
    result.push({
      id: idCounter++,
      particulars: 'Operating Income',
      debit: 0,
      credit: 0,
      type: 'summary'
    });
    
    result.push({
      id: idCounter++,
      particulars: 'Other Income',
      debit: 0,
      credit: 0,
      type: 'header'
    });
    
    result.push({
      id: idCounter++,
      particulars: 'Other Expenses',
      debit: 0,
      credit: 0,
      type: 'header'
    });
    
    result.push({
      id: idCounter++,
      particulars: 'Net Profit Before Tax',
      debit: 0,
      credit: 0,
      type: 'summary'
    });
    
    result.push({
      id: idCounter++,
      particulars: 'Tax',
      debit: 0,
      credit: 0,
      type: 'header'
    });
    
    result.push({
      id: idCounter++,
      particulars: 'Net Profit',
      debit: 0,
      credit: 0,
      type: 'summary'
    });
    
    return result;
  };
  
  return (
    <div className="p-4 profit-loss-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Header Section */}
      <div className="mb-4">
        <h3 className="profit-loss-title">
          <i className="fas fa-chart-line me-2"></i>
          Profit & Loss Statement
        </h3>
        <p className="profit-loss-date">
          Period: {dateRange.from} - {dateRange.to}
        </p>
      </div>

      {/* Filter Card */}
      <Card className="filter-card border-0 shadow-lg mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col xs={12} md={3}>
              <Form.Label className="filter-label">Year</Form.Label>
              <Form.Select
                className="filter-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={3}>
              <Form.Label className="filter-label">Month</Form.Label>
              <Form.Select
                className="filter-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={3} className="d-flex align-items-end">
              <Button
                className="btn-toggle-details w-100"
                onClick={toggleDetailedView}
              >
                {detailedView ? 'Hide Details' : 'Show Details'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table Card */}
      {noDataFound && (
        <Alert variant="info" className="mb-3">
          No data found for the selected period. Please try a different date range.
        </Alert>
      )}

      <Card className="profit-loss-table-card border-0 shadow-lg">
        <Card.Body style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <Table responsive className="profit-loss-table align-middle" style={{ fontSize: 16 }}>
              <thead className="table-header">
                <tr>
                  <th className="py-3">ACCOUNT</th>
                  <th className="py-3 text-end">DEBIT</th>
                  <th className="py-3 text-end">CREDIT</th>
                </tr>
              </thead>
              <tbody>
                {(noDataFound ? getEmptyDataStructure() : profitLossData).map((item) => (
                  <tr
                    key={item.id}
                    className={`${item.type === 'header' ? 'row-header' : ''} ${item.type === 'summary' ? 'row-summary' : ''} ${item.type !== 'header' && item.type !== 'summary' ? 'clickable-row' : ''}`}
                    onClick={() => handleAccountClick(item)}
                  >
                    <td>
                      {item.type === 'header' ? (
                        <strong>{item.particulars}</strong>
                      ) : item.type === 'summary' ? (
                        <strong>{item.particulars}</strong>
                      ) : (
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleAccountClick(item);
                          }}
                        >
                          {item.particulars}
                        </a>
                      )}
                    </td>
                    <td className="text-end fw-bold">
                      {item.debit > 0 ? item.debit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                    </td>
                    <td className="text-end fw-bold">
                      {item.credit > 0 ? item.credit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <div className="profit-loss-footer-info">
        <p className="mb-0">Click on any account to view detailed transactions</p>
      </div>
      
      {detailedView && (
        <Card className="detailed-view-card border-0 shadow-lg mt-4">
          <Card.Header className="detailed-view-header">
            <h5 className="mb-0">Detailed Transactions for {getMonthName(selectedMonth)} {selectedYear}</h5>
          </Card.Header>
          <Card.Body>
            {noDataFound ? (
              <Alert variant="info">
                No transactions available for the selected period.
              </Alert>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table responsive className="profit-loss-table align-middle">
                  <thead className="table-header">
                    <tr>
                      <th className="py-3">Date</th>
                      <th className="py-3">Description</th>
                      <th className="py-3 text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitLossData.flatMap(item => 
                      item.details ? item.details.map((detail, index) => (
                        <tr key={`${item.id}-${index}`}>
                          <td>{detail.date}</td>
                          <td>{detail.description}</td>
                          <td className="text-end fw-bold">{detail.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      )) : []
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
      
      {/* Account Details Modal */}
      <Modal
        show={!!selectedAccount}
        onHide={closeModal}
        size="lg"
        centered
        className="profit-loss-modal"
      >
        {selectedAccount && (
          <>
            <Modal.Header closeButton className="modal-header-custom" style={{ background: "linear-gradient(135deg, #505ece 0%, #3d47b8 100%)", color: "white" }}>
              <Modal.Title style={{ color: "white" }}>
                {selectedAccount.particulars} - Detailed Transactions
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-custom">
              {/* Account Summary Card */}
              <Card className="modal-summary-card mb-4 border-0">
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <h6 className="fw-bold">Account Type</h6>
                      <p className="mb-0">{selectedAccount.type}</p>
                    </Col>
                    <Col md={4}>
                      <h6 className="fw-bold">Total Amount</h6>
                      <p className="mb-0 fs-5">
                        {selectedAccount.type === 'income' ? '+' : '-'}
                        {(selectedAccount.credit || selectedAccount.debit).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </Col>
                    <Col md={4}>
                      <h6 className="fw-bold">Transaction Count</h6>
                      <p className="mb-0">{selectedAccount.details ? selectedAccount.details.length : 0}</p>
                    </Col>
                  </Row>
                  
                  {/* Additional Account Information */}
                  <Row className="mt-3">
                    <Col md={4}>
                      <h6 className="fw-bold">Debit Amount</h6>
                      <p className="mb-0">{selectedAccount.debit > 0 ? selectedAccount.debit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</p>
                    </Col>
                    <Col md={4}>
                      <h6 className="fw-bold">Credit Amount</h6>
                      <p className="mb-0">{selectedAccount.credit > 0 ? selectedAccount.credit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</p>
                    </Col>
                    <Col md={4}>
                      <h6 className="fw-bold">Account Balance</h6>
                      <p className="mb-0">
                        {selectedAccount.credit - selectedAccount.debit > 0 ? '+' : ''}
                        {(selectedAccount.credit - selectedAccount.debit).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              
              {/* Date Filter */}
              <Row className="mb-3">
                <Col md={5}>
                  <Form.Label className="filter-label">From Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="modal-form-control"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                  />
                </Col>
                <Col md={5}>
                  <Form.Label className="filter-label">To Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="modal-form-control"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                  />
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button
                    className="btn-clear-filter w-100"
                    onClick={() => {
                      setFilterFromDate('');
                      setFilterToDate('');
                    }}
                  >
                    Clear
                  </Button>
                </Col>
              </Row>
              
              {/* Transaction Details Table */}
              <div style={{ overflowX: "auto" }}>
                <Table responsive className="profit-loss-table align-middle">
                  <thead className="table-header">
                    <tr>
                      <th className="py-3">Date</th>
                      <th className="py-3">Description</th>
                      <th className="py-3 text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAccount.details && selectedAccount.details.length > 0 ? (
                      filterDetailsByDateRange(selectedAccount.details).map((detail, index) => (
                        <tr key={index}>
                          <td>{detail.date}</td>
                          <td>{detail.description}</td>
                          <td className="text-end fw-bold">{detail.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-muted">No transactions available</td>
                      </tr>
                    )}
                  </tbody>
                  {selectedAccount.details && selectedAccount.details.length > 0 && (
                    <tfoot className="row-summary">
                      <tr>
                        <td colSpan="2" className="text-end"><strong>Total:</strong></td>
                        <td className="text-end">
                          <strong>{calculateTotal(filterDetailsByDateRange(selectedAccount.details)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </Table>
              </div>
            </Modal.Body>
            <Modal.Footer className="modal-footer-custom">
              <Button
                variant="secondary"
                onClick={closeModal}
                className="btn-modal-close"
                style={{
                  backgroundColor: "#6c757d",
                  borderColor: "#6c757d",
                  color: "white",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#5a6268";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(108, 117, 125, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#6c757d";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProfitLoss;