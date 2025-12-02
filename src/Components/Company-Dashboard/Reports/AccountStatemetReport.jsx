import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const AccountStatementReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [accountData, setAccountData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  // Initialize with current month dates
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(format(firstDay, 'yyyy-MM-dd'));
    setEndDate(format(lastDay, 'yyyy-MM-dd'));
    
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
    
    setAccountData(mockData);
    setFilteredData(mockData);
  }, []);
  
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
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-white p-4 md:p-6" style={{color: "#032d45"}}>
          <h1 className="text-xl md:text-2xl font-bold">Account Statement Report</h1>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-100">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Balance</h3>
            <p className="text-xl md:text-2xl font-bold">{formatCurrency(totalBalance)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Debit</h3>
            <p className="text-xl md:text-2xl font-bold">{formatCurrency(totalDebit)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Credit</h3>
            <p className="text-xl md:text-2xl font-bold">{formatCurrency(totalCredit)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Pending Amount</h3>
            <p className="text-xl md:text-2xl font-bold text-red-600">{formatCurrency(pendingAmount)}</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="p-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by description or customer"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                className="w-full bg-[#032d45] text-white py-2 px-4 rounded-md transition duration-300"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.customer}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.debit > 0 ? formatCurrency(item.debit) : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.credit > 0 ? formatCurrency(item.credit) : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{formatCurrency(item.balance)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Page Info */}
        <div className="bg-gray-50 p-4 border-t">
          <h3 className="text-lg font-medium text-gray-900 mb-2 text-[#032d45]">Page Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-[#032d45] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Generate account statements for specific date ranges</span>
            </div>
            <div className="flex items-start">
              <svg className="h-5 w-5 text-[#032d45] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filter statements by status or search terms</span>
            </div>
            <div className="flex items-start">
              <svg className="h-5 w-5 text-[#032d45] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export account statements for record keeping</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountStatementReport;