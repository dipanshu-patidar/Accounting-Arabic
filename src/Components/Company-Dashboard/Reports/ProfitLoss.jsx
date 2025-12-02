import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from '../../../Api/axiosInstance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfitLoss = ({ companyId = 3 }) => {
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
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading Profit & Loss Statement...</p>
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
    <div className="container mt-4 profit-loss-container">
      <div className="card">
        <div className="card-header text-dark">
          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <div className="mb-2 mb-md-0">
              <h4 className="mb-0">Profit & Loss Statement</h4>
              <p className="mb-0">{dateRange.from} - {dateRange.to}</p>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <div className="mr-3">
                <label className="mr-2 mb-0">Year:</label>
                <select 
                  className="form-control form-control-sm d-inline-block" 
                  style={{width: 'auto'}}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
              <div className="mr-3">
                <label className="mr-2 mb-0">Month:</label>
                <select 
                  className="form-control form-control-sm d-inline-block" 
                  style={{width: 'auto'}}
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
                </select>
              </div>
              <div className="mt-2 mt-md-0">
                <button className="btn btn-light w-100 w-md-auto" onClick={toggleDetailedView}>
                  {detailedView ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          {noDataFound && (
            <div className="alert alert-info m-3" role="alert">
              No data found for the selected period. Please try a different date range.
            </div>
          )}
          
          <div className="table-responsive">
            <table className="table table-bordered mb-0">
              <thead className="thead-light">
                <tr>
                  <th className="particulars-col">ACCOUNT</th>
                  <th className="amount-col">DEBIT</th>
                  <th className="amount-col">CREDIT</th>
                </tr>
              </thead>
              <tbody>
                {(noDataFound ? getEmptyDataStructure() : profitLossData).map((item) => (
                  <tr 
                    key={item.id} 
                    className={`${item.type === 'header' ? 'table-header' : ''} ${item.type === 'summary' ? 'summary-row fw-bold bg-light' : ''} ${item.type !== 'header' && item.type !== 'summary' ? 'clickable-row' : ''}`}
                    onClick={() => handleAccountClick(item)}
                  >
                    <td className={item.type === 'header' ? 'fw-bold' : ''}>
                      {item.type !== 'header' && item.type !== 'summary' ? (
                        <a href="#" className="text-primary text-decoration-none" onClick={(e) => {
                          e.preventDefault();
                          handleAccountClick(item);
                        }}>
                          {item.particulars}
                        </a>
                      ) : item.particulars}
                    </td>
                    <td className="text-right">{item.debit > 0 ? item.debit.toFixed(2) : ''}</td>
                    <td className="text-right">{item.credit > 0 ? item.credit.toFixed(2) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card-footer text-center">
          <div className="mt-3 text-info">
            <p className="mb-0">Click on any account to view detailed transactions</p>
          </div>
        </div>
      </div>
      
      {detailedView && (
        <div className="card mt-4">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">Detailed Transactions for {getMonthName(selectedMonth)} {selectedYear}</h5>
          </div>
          <div className="card-body">
            {noDataFound ? (
              <div className="alert alert-info" role="alert">
                No transactions available for the selected period.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="thead-light">
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitLossData.flatMap(item => 
                      item.details ? item.details.map((detail, index) => (
                        <tr key={`${item.id}-${index}`}>
                          <td>{detail.date}</td>
                          <td>{detail.description}</td>
                          <td className="text-right">{detail.amount.toFixed(2)}</td>
                        </tr>
                      )) : []
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Account Details Modal */}
      {selectedAccount && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header text-dark">
                <h5 className="modal-title">
                  <a href="#" className="text-dark text-decoration-none">
                    {selectedAccount.particulars}
                  </a> - Detailed Transactions
                </h5>
                <button type="button" className="close" onClick={closeModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {/* Account Summary Card */}
                <div className="card mb-4 bg-light">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <h6 className="fw-bold">Account Type</h6>
                        <p className="mb-0">{selectedAccount.type}</p>
                      </div>
                      <div className="col-md-4">
                        <h6 className="fw-bold">Total Amount</h6>
                        <p className="mb-0 fs-5">
                          {selectedAccount.type === 'income' ? '+' : '-'}
                          {(selectedAccount.credit || selectedAccount.debit).toFixed(2)}
                        </p>
                      </div>
                      <div className="col-md-4">
                        <h6 className="fw-bold">Transaction Count</h6>
                        <p className="mb-0">{selectedAccount.details ? selectedAccount.details.length : 0}</p>
                      </div>
                    </div>
                    
                    {/* Additional Account Information */}
                    <div className="row mt-3">
                      <div className="col-md-4">
                        <h6 className="fw-bold">Debit Amount</h6>
                        <p className="mb-0">{selectedAccount.debit > 0 ? selectedAccount.debit.toFixed(2) : '0.00'}</p>
                      </div>
                      <div className="col-md-4">
                        <h6 className="fw-bold">Credit Amount</h6>
                        <p className="mb-0">{selectedAccount.credit > 0 ? selectedAccount.credit.toFixed(2) : '0.00'}</p>
                      </div>
                      <div className="col-md-4">
                        <h6 className="fw-bold">Account Balance</h6>
                        <p className="mb-0">
                          {selectedAccount.credit - selectedAccount.debit > 0 ? '+' : ''}
                          {(selectedAccount.credit - selectedAccount.debit).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Date Filter */}
                <div className="row mb-3">
                  <div className="col-md-5">
                    <label className="form-label">From Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={filterFromDate}
                      onChange={(e) => setFilterFromDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">To Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={filterToDate}
                      onChange={(e) => setFilterToDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button 
                      className="btn btn-sm btn-secondary w-100" 
                      onClick={() => {
                        setFilterFromDate('');
                        setFilterToDate('');
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                {/* Transaction Details Table */}
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="thead-light">
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAccount.details && selectedAccount.details.length > 0 ? (
                        filterDetailsByDateRange(selectedAccount.details).map((detail, index) => (
                          <tr key={index}>
                            <td>{detail.date}</td>
                            <td>{detail.description}</td>
                            <td className="text-right">{detail.amount.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center">No transactions available</td>
                        </tr>
                      )}
                    </tbody>
                    {selectedAccount.details && selectedAccount.details.length > 0 && (
                      <tfoot className="table-light fw-bold">
                        <tr>
                          <td colSpan="2" className="text-end">Total:</td>
                          <td className="text-right">
                            {calculateTotal(filterDetailsByDateRange(selectedAccount.details)).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitLoss;