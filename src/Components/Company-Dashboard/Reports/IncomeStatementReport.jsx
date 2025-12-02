import React, { useState, useEffect } from "react";
import { Calendar, Download, Filter } from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{color: "#032d45"}}>Income Statement Report</h1>
          <p className="text-gray-500">Financial performance for {reportData.period}</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-[180px] appearance-none bg-[#032d45] text-white"
            >
              <option value="current_week">Current Week</option>
              <option value="current_month">Current Month</option>
              <option value="current_quarter">Current Quarter</option>
              <option value="current_year">Current Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <button className="flex items-center px-3 py-2 border rounded-md text-sm bg-[#032d45] text-white">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </button>
          <button 
            className="flex items-center px-3 py-2 border rounded-md text-sm bg-[#032d45] text-white"
            onClick={() => handleExport('pdf')}
          >
            <Download className="mr-2 h-4 w-4" />
            PDF
          </button>
          <button 
            className="flex items-center px-3 py-2 border rounded-md text-sm bg-[#032d45] text-white"
            onClick={() => handleExport('excel')}
          >
            <Download className="mr-2 h-4 w-4" />
            Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex justify-between items-center pb-2">
            <h3 className="text-sm font-medium">Total Revenue</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Revenue</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(reportData.revenue.total)}</div>
          <p className="text-xs text-gray-500 mt-1">
            +20.1% from last month
          </p>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex justify-between items-center pb-2">
            <h3 className="text-sm font-medium">Gross Profit</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Profit</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(reportData.grossProfit)}</div>
          <p className="text-xs text-gray-500 mt-1">
            +15.2% from last month
          </p>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex justify-between items-center pb-2">
            <h3 className="text-sm font-medium">Net Income</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Income</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(reportData.netIncome)}</div>
          <p className="text-xs text-gray-500 mt-1">
            +18.3% from last month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Revenue Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.revenue.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.category}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(item.amount)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{item.percentage}%</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold">Total Revenue</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right">{formatCurrency(reportData.revenue.total)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">Cost of Goods Sold</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.costOfGoodsSold.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.category}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(item.amount)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{item.percentage}%</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold">Total COGS</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right">{formatCurrency(reportData.costOfGoodsSold.total)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium">Operating Expenses</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.operatingExpenses.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.category}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(item.amount)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{item.percentage}%</td>
                  </tr>
                ))}
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold">Total Operating Expenses</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right">{formatCurrency(reportData.operatingExpenses.total)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium">Income Summary</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Revenue</span>
              <span className="font-medium">{formatCurrency(reportData.revenue.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Less: Cost of Goods Sold</span>
              <span className="font-medium">({formatCurrency(reportData.costOfGoodsSold.total)})</span>
            </div>
            <div className="flex justify-between border-t border-b py-2">
              <span className="font-bold">Gross Profit</span>
              <span className="font-bold">{formatCurrency(reportData.grossProfit)}</span>
            </div>
            <div className="flex justify-between">
              <span>Less: Operating Expenses</span>
              <span className="font-medium">({formatCurrency(reportData.operatingExpenses.total)})</span>
            </div>
            <div className="flex justify-between border-t border-b py-2">
              <span className="font-bold">Operating Income</span>
              <span className="font-bold">{formatCurrency(reportData.operatingIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span>Add: Other Income</span>
              <span className="font-medium">{formatCurrency(reportData.otherIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span>Less: Other Expenses</span>
              <span className="font-medium">({formatCurrency(reportData.otherExpenses)})</span>
            </div>
            <div className="flex justify-between border-t border-b py-2">
              <span className="font-bold">Net Income</span>
              <span className="font-bold">{formatCurrency(reportData.netIncome)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatementReport;