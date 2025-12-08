import React, { useState, useEffect } from 'react';
import {
    Tabs,
    Tab,
    Table,
    Button,
    Form,
    Row,
    Col,
    Card,
    Modal
} from 'react-bootstrap';
import {
    FaFilePdf,
    FaFileExcel,
    FaFileCsv,
    FaPrint,
    FaEye,
    FaSearch
} from 'react-icons/fa';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';

// Mapping short to full month
const SHORT_TO_FULL = {
    Jan: 'January',
    Feb: 'February',
    Mar: 'March',
    Apr: 'April',
    May: 'May',
    Jun: 'June',
    Jul: 'July',
    Aug: 'August',
    Sep: 'September',
    Oct: 'October',
    Nov: 'November',
    Dec: 'December'
};

const FULL_TO_SHORT = Object.fromEntries(
    Object.entries(SHORT_TO_FULL).map(([short, full]) => [full, short])
);

// Format as INR
const formatINR = (value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
};

const apiMonthToUIMonth = (apiMonth) => {
    // Input: "December, 2025"
    const [full, yearStr] = apiMonth.split(', ');
    const year = yearStr?.trim();
    const short = FULL_TO_SHORT[full] || 'Jan';
    return `${short} ${year}`; // Output: "Dec 2025"
};

const uiMonthToApiParams = (uiMonth) => {
    if (!uiMonth || typeof uiMonth !== 'string') {
        return { month: 'January', year: null };
    }

    const parts = uiMonth.trim().split(/\s+/); // Split by one or more spaces
    const short = parts[0] || 'Jan';
    const yearStr = parts[1] || '2025';

    const year = parseInt(yearStr, 10);
    const month = SHORT_TO_FULL[short] || 'January';

    return {
        month,
        year: isNaN(year) ? null : year
    };
};
const PayrollReports = () => {
    const companyIdRaw = GetCompanyId();
    const companyId = Number(companyIdRaw);

    // Early validation
    if (isNaN(companyId) || companyId <= 0) {
        return <div className="text-center py-5">Invalid Company ID</div>;
    }

    const [key, setKey] = useState('monthly');
    const [selectedMonth, setSelectedMonth] = useState('Dec 2025'); // Default to latest
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [searchEmployee, setSearchEmployee] = useState('');

    const [showMonthlyModal, setShowMonthlyModal] = useState(false);
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);
    const [selectedMonthlyData, setSelectedMonthlyData] = useState(null);
    const [selectedDepartmentData, setSelectedDepartmentData] = useState(null);

    const [monthlyData, setMonthlyData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [employeeHistoryData, setEmployeeHistoryData] = useState([]);
    const [taxDeductionData, setTaxDeductionData] = useState([]);

    const [months, setMonths] = useState([]);
    const [departments, setDepartments] = useState(['All']);
    const [loading, setLoading] = useState(true);

    // Fetch main report
    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axiosInstance.get(`payrollReport/payroll?companyId=${companyId}`);
                const data = res.data;

                // Convert all API months to UI format
                const monthly = (data.monthlySummaryReport || []).map(item => ({
                    month: apiMonthToUIMonth(item.Month),
                    totalEmployees: item.Total_Employees,
                    grossPay: formatINR(item.Gross_Pay),
                    deductions: formatINR(item.Deductions),
                    netPay: formatINR(item.Net_Pay)
                }));

                const departmentsFromApi = (data.departmentReport || []).map(item => ({
                    department: item.Department,
                    employees: item.Employees,
                    totalSalary: formatINR(item.Total_Salary),
                    avgSalary: formatINR(item.Avg_Salary)
                }));

                const employees = (data.employeeReport || []).map(item => ({
                    employee: item.Employee,
                    month: apiMonthToUIMonth(item.Month),
                    grossPay: formatINR(item.Gross_Pay),
                    deductions: formatINR(item.Deductions),
                    netPay: formatINR(item.Net_Pay),
                    status: item.Status || 'Pending'
                }));

                const taxDeductions = (data.taxAndDeductionReport || []).map(item => ({
                    month: apiMonthToUIMonth(item.Month),
                    tax: formatINR(item.Tax),
                    pf: formatINR(item.PF),
                    insurance: formatINR(item.Insurance),
                    other: formatINR(item.Other),
                    totalDeductions: formatINR(item.Total_Deductions)
                }));

                const uniqueMonths = [...new Set(monthly.map(m => m.month))].sort().reverse();
                const uniqueDepts = ['All', ...new Set(departmentsFromApi.map(d => d.department))];

                setMonthlyData(monthly);
                setDepartmentData(departmentsFromApi);
                setEmployeeHistoryData(employees);
                setTaxDeductionData(taxDeductions);
                setMonths(uniqueMonths);
                setDepartments(uniqueDepts);

                if (uniqueMonths.length > 0) {
                    setSelectedMonth(uniqueMonths[0]);
                }
            } catch (err) {
                console.error('Failed to load payroll report:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [companyId]);

    // Handle Monthly View (API call)
    const handleMonthlyView = async (data) => {
        const { month, year } = uiMonthToApiParams(data.month); // e.g., month="December", year=2025

        console.log('Invalid year in:', data.month);

        try {
            const res = await axiosInstance.get(
                `payrollReport/monthly-details?companyId=${companyId}&month=${month}&year=${year}`
            );
            const apiData = res.data;

            const mappedData = {
                month: apiData.employeeInformation.Month, // "December, 2025"
                totalEmployees: apiData.employeeInformation.Total_Employees,
                grossPay: formatINR(apiData.financialSummary.Gross_Pay),
                deductions: formatINR(apiData.financialSummary.Deductions),
                netPay: formatINR(apiData.financialSummary.Net_Pay),
                employeeBreakdown: (apiData.employeeBreakdown || []).map(emp => ({
                    employee: emp.EMPLOYEE_NAME,
                    department: emp.DEPARTMENT || 'N/A',
                    grossPay: formatINR(emp.GROSS_PAY),
                    deductions: formatINR(emp.DEDUCTIONS),
                    netPay: formatINR(emp.NET_PAY),
                    status: emp.STATUS || 'Pending',
                    month: emp.MONTH // "December, 2025"
                }))
            };

            setSelectedMonthlyData(mappedData);
            setShowMonthlyModal(true);
        } catch (err) {
            console.error('Failed to fetch monthly details:', err);
        }
    };

    // Handle Department View
    const handleDepartmentView = async (data) => {
        const deptName = data.department;
        try {
            const res = await axiosInstance.get(
                `payrollReport/department-details?companyId=${companyId}&departmentName=${encodeURIComponent(deptName)}`
            );
            const apiData = res.data;

            const mappedData = {
                department: apiData.department,
                employees: apiData.employees,
                totalSalary: formatINR(apiData.total_salary),
                avgSalary: formatINR(apiData.avg_salary),
                employeeBreakdown: (apiData.employeeBreakdown || []).map(emp => ({
                    employee: emp.EMPLOYEE_NAME,
                    month: emp.MONTH,
                    grossPay: formatINR(emp.GROSS_PAY),
                    deductions: formatINR(emp.DEDUCTIONS),
                    netPay: formatINR(emp.NET_PAY),
                    status: emp.STATUS || 'Pending'
                }))
            };

            setSelectedDepartmentData(mappedData);
            setShowDepartmentModal(true);
        } catch (err) {
            console.error('Failed to fetch department details:', err);
        }
    };

    // Filter employee history
    const filteredEmployeeHistory = employeeHistoryData.filter(emp => {
        const matchesSearch = emp.employee.toLowerCase().includes(searchEmployee.toLowerCase());
        const matchesMonth = !selectedMonth || emp.month === selectedMonth;
        return matchesSearch && matchesMonth;
    });

    if (loading) {
        return <div className="text-center py-5">Loading payroll reports...</div>;
    }

    return (
        <div className="container-fluid px-3 px-md-4 py-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh' }}>
            <h2 className="mb-4 text-center text-md-start" style={{ color: '#023347' }}>Payroll Reports</h2>
            <Card className="mb-4" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
                <Card.Body>
                    <Row className="align-items-center mb-3">
                        <Col xs={12} md={7} className="mb-3 mb-md-0">
                            <h4 className="mb-0" style={{ color: '#023347' }}>Reports Overview</h4>
                        </Col>
                        <Col xs={12} md={5} className="text-center text-md-end">
                            <div className="d-flex flex-wrap justify-content-center justify-content-md-end gap-2">
                                <Button variant="outline-primary" size="sm" className="d-flex align-items-center" style={{ borderColor: '#023347', color: '#023347' }}>
                                    <FaFilePdf className="me-1" /> PDF
                                </Button>
                                <Button variant="outline-success" size="sm" className="d-flex align-items-center" style={{ borderColor: '#2a8e9c', color: '#2a8e9c' }}>
                                    <FaFileExcel className="me-1" /> Excel
                                </Button>
                                <Button variant="outline-info" size="sm" className="d-flex align-items-center" style={{ borderColor: '#2a8e9c', color: '#2a8e9c' }}>
                                    <FaFileCsv className="me-1" /> CSV
                                </Button>
                                <Button variant="outline-secondary" size="sm" className="d-flex align-items-center" style={{ borderColor: '#ced4da', color: '#023347' }}>
                                    <FaPrint className="me-1" /> Print
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col xs={12} sm={6} md={4} className="mb-3 mb-md-0">
                            <Form.Group>
                                <Form.Label>Filter by Month</Form.Label>
                                <Form.Select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    style={{ border: '1px solid #ced4da' }}
                                >
                                    {months.map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col xs={12} sm={6} md={4} className="mb-3 mb-md-0">
                            <Form.Group>
                                <Form.Label>Filter by Department</Form.Label>
                                <Form.Select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    style={{ border: '1px solid #ced4da' }}
                                >
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <Form.Group>
                                <Form.Label>Search Employee</Form.Label>
                                <div className="input-group">
                                    <Form.Control
                                        type="text"
                                        placeholder="Employee name..."
                                        value={searchEmployee}
                                        onChange={(e) => setSearchEmployee(e.target.value)}
                                        style={{ border: '1px solid #ced4da' }}
                                    />
                                    <Button variant="outline-secondary" style={{ borderColor: '#ced4da', color: '#023347' }}>
                                        <FaSearch />
                                    </Button>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Tabs
                        id="payroll-reports-tabs"
                        activeKey={key}
                        onSelect={(k) => setKey(k)}
                        className="mb-3"
                        fill
                    >
                        {/* Monthly Tab */}
                        <Tab eventKey="monthly" title="Monthly Summary">
                            <div className="d-none d-md-block">
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Month</th>
                                            <th>Total Employees</th>
                                            <th>Gross Pay</th>
                                            <th>Deductions</th>
                                            <th>Net Pay</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthlyData.map((data, index) => (
                                            <tr key={index}>
                                                <td>{data.month}</td>
                                                <td>{data.totalEmployees}</td>
                                                <td>{data.grossPay}</td>
                                                <td>{data.deductions}</td>
                                                <td>{data.netPay}</td>
                                                <td>
                                                    <Button
                                                        variant="light"
                                                        size="sm"
                                                        onClick={() => handleMonthlyView(data)}
                                                        style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                                                    >
                                                        <FaEye className="me-1" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <div className="d-md-none">
                                {monthlyData.map((data, index) => (
                                    <Card key={index} className="mb-3" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
                                        <Card.Body>
                                            <Card.Title className="d-flex justify-content-between align-items-center" style={{ color: '#023347' }}>
                                                <span>{data.month}</span>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    onClick={() => handleMonthlyView(data)}
                                                    style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                                                >
                                                    <FaEye />
                                                </Button>
                                            </Card.Title>
                                            <Card.Text>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span>Employees:</span>
                                                    <span>{data.totalEmployees}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span>Gross Pay:</span>
                                                    <span>{data.grossPay}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span>Deductions:</span>
                                                    <span>{data.deductions}</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span>Net Pay:</span>
                                                    <span>{data.netPay}</span>
                                                </div>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </Tab>

                        {/* Department Tab */}
                        <Tab eventKey="department" title="Department Report">
                            <div className="d-none d-md-block">
                                <Table striped bordered hover responsive>
                                    <thead style={{ backgroundColor: '#023347', color: '#ffffff' }}>
                                        <tr>
                                            <th>Department</th>
                                            <th>Employees</th>
                                            <th>Total Salary</th>
                                            <th>Avg Salary</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departmentData.map((data, index) => (
                                            <tr key={index}>
                                                <td>{data.department}</td>
                                                <td>{data.employees}</td>
                                                <td>{data.totalSalary}</td>
                                                <td>{data.avgSalary}</td>
                                                <td>
                                                    <Button
                                                        variant="light"
                                                        size="sm"
                                                        onClick={() => handleDepartmentView(data)}
                                                        style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                                                    >
                                                        <FaEye className="me-1" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <div className="d-md-none">
                                {departmentData.map((data, index) => (
                                    <Card key={index} className="mb-3" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
                                        <Card.Body>
                                            <Card.Title className="d-flex justify-content-between align-items-center" style={{ color: '#023347' }}>
                                                <span>{data.department}</span>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    onClick={() => handleDepartmentView(data)}
                                                    style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                                                >
                                                    <FaEye />
                                                </Button>
                                            </Card.Title>
                                            <Card.Text>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span>Employees:</span>
                                                    <span>{data.employees}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span>Total Salary:</span>
                                                    <span>{data.totalSalary}</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span>Avg Salary:</span>
                                                    <span>{data.avgSalary}</span>
                                                </div>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </Tab>

                        {/* Employee History */}
                        <Tab eventKey="employee" title="Employee History">
                            <div className="d-none d-md-block">
                                <Table striped bordered hover responsive>
                                    <thead style={{ backgroundColor: '#023347', color: '#ffffff' }}>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Month</th>
                                            <th>Gross Pay</th>
                                            <th>Deductions</th>
                                            <th>Net Pay</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmployeeHistory.map((data, index) => (
                                            <tr key={index}>
                                                <td>{data.employee}</td>
                                                <td>{data.month}</td>
                                                <td>{data.grossPay}</td>
                                                <td>{data.deductions}</td>
                                                <td>{data.netPay}</td>
                                                <td>
                                                    <span className={`badge ${data.status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                                                        {data.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <div className="d-md-none">
                                {filteredEmployeeHistory.map((data, index) => (
                                    <Card key={index} className="mb-3" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
                                        <Card.Body>
                                            <Card.Title className="d-flex justify-content-between align-items-center" style={{ color: '#023347' }}>
                                                <span>{data.employee}</span>
                                                <span className={`badge ${data.status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                                                    {data.status}
                                                </span>
                                            </Card.Title>
                                            <Card.Text>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span>Month:</span>
                                                    <span>{data.month}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span>Gross Pay:</span>
                                                    <span>{data.grossPay}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span>Deductions:</span>
                                                    <span>{data.deductions}</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span>Net Pay:</span>
                                                    <span>{data.netPay}</span>
                                                </div>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </Tab>

                        {/* Tax & Deduction */}
                        <Tab eventKey="tax" title="Tax & Deduction Report">
                            <div className="d-none d-md-block">
                                <Table striped bordered hover responsive>
                                    <thead style={{ backgroundColor: '#023347', color: '#ffffff' }}>
                                        <tr>
                                            <th>Month</th>
                                            <th>Tax</th>
                                            <th>PF</th>
                                            <th>Insurance</th>
                                            <th>Other</th>
                                            <th>Total Deductions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {taxDeductionData.map((data, index) => (
                                            <tr key={index}>
                                                <td>{data.month}</td>
                                                <td>{data.tax}</td>
                                                <td>{data.pf}</td>
                                                <td>{data.insurance}</td>
                                                <td>{data.other}</td>
                                                <td>{data.totalDeductions}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <div className="d-md-none">
                                {taxDeductionData.map((data, index) => (
                                    <Card key={index} className="mb-3" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
                                        <Card.Body>
                                            <Card.Title style={{ color: '#023347' }}>{data.month}</Card.Title>
                                            <Card.Text>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span>Tax:</span>
                                                    <span>{data.tax}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span>PF:</span>
                                                    <span>{data.pf}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span>Insurance:</span>
                                                    <span>{data.insurance}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span>Other:</span>
                                                    <span>{data.other}</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span>Total Deductions:</span>
                                                    <span>{data.totalDeductions}</span>
                                                </div>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>

            {/* Monthly Modal */}
            <Modal
                show={showMonthlyModal}
                onHide={() => setShowMonthlyModal(false)}
                size="lg"
            >
                <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#ffffff' }}>
                    <Modal.Title>Monthly Details - {selectedMonthlyData?.month}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: '#f0f7f8' }}>
                    {selectedMonthlyData && (
                        <div>
                            <Row className="mb-3">
                                <Col xs={12} md={6} className="mb-3 mb-md-0">
                                    <Card style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
                                        <Card.Body>
                                            <Card.Title style={{ color: '#023347' }}>Employee Information</Card.Title>
                                            <p><strong>Total Employees:</strong> {selectedMonthlyData.totalEmployees}</p>
                                            <p><strong>Month:</strong> {selectedMonthlyData.month}</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Card style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
                                        <Card.Body>
                                            <Card.Title style={{ color: '#023347' }}>Financial Summary</Card.Title>
                                            <p><strong>Gross Pay:</strong> {selectedMonthlyData.grossPay}</p>
                                            <p><strong>Deductions:</strong> {selectedMonthlyData.deductions}</p>
                                            <p><strong>Net Pay:</strong> {selectedMonthlyData.netPay}</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Card style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
                                <Card.Body>
                                    <Card.Title style={{ color: '#023347' }}>Employee Breakdown</Card.Title>
                                    <div className="table-responsive">
                                        <Table striped bordered hover>
                                            <thead style={{ backgroundColor: '#2a8e9c', color: '#ffffff' }}>
                                                <tr>
                                                    <th>Employee Name</th>
                                                    <th>Department</th>
                                                    <th>Gross Pay</th>
                                                    <th>Deductions</th>
                                                    <th>Net Pay</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedMonthlyData.employeeBreakdown.map((emp, index) => (
                                                    <tr key={index}>
                                                        <td>{emp.employee}</td>
                                                        <td>{emp.department}</td>
                                                        <td>{emp.grossPay}</td>
                                                        <td>{emp.deductions}</td>
                                                        <td>{emp.netPay}</td>
                                                        <td>
                                                            <span className={`badge ${emp.status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                                                                {emp.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="flex-column flex-md-row" style={{ backgroundColor: '#f0f7f8' }}>
                    <Button variant="secondary" onClick={() => setShowMonthlyModal(false)} className="w-100 w-md-auto mb-2 mb-md-0">
                        Close
                    </Button>
                    <Button style={{ backgroundColor: '#023347', border: 'none' }} className="w-100 w-md-auto">
                        Export Details
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Department Modal */}
            <Modal
                show={showDepartmentModal}
                onHide={() => setShowDepartmentModal(false)}
                size="lg"
            >
                <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#ffffff' }}>
                    <Modal.Title>Department Details - {selectedDepartmentData?.department}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: '#f0f7f8' }}>
                    {selectedDepartmentData && (
                        <div>
                            <Row className="mb-3">
                                <Col xs={12} md={6} className="mb-3 mb-md-0">
                                    <Card style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
                                        <Card.Body>
                                            <Card.Title style={{ color: '#023347' }}>Department Information</Card.Title>
                                            <p><strong>Department:</strong> {selectedDepartmentData.department}</p>
                                            <p><strong>Employees:</strong> {selectedDepartmentData.employees}</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Card style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
                                        <Card.Body>
                                            <Card.Title style={{ color: '#023347' }}>Salary Information</Card.Title>
                                            <p><strong>Total Salary:</strong> {selectedDepartmentData.totalSalary}</p>
                                            <p><strong>Average Salary:</strong> {selectedDepartmentData.avgSalary}</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Card style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
                                <Card.Body>
                                    <Card.Title style={{ color: '#023347' }}>Employees in {selectedDepartmentData.department}</Card.Title>
                                    <div className="table-responsive">
                                        <Table striped bordered hover>
                                            <thead style={{ backgroundColor: '#2a8e9c', color: '#ffffff' }}>
                                                <tr>
                                                    <th>Employee Name</th>
                                                    <th>Month</th>
                                                    <th>Gross Pay</th>
                                                    <th>Deductions</th>
                                                    <th>Net Pay</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedDepartmentData.employeeBreakdown.map((emp, index) => {
                                                    const uiMonth = apiMonthToUIMonth(emp.month);
                                                    return (
                                                        <tr key={index}>
                                                            <td>{emp.employee}</td>
                                                            <td>{uiMonth}</td>
                                                            <td>{emp.grossPay}</td>
                                                            <td>{emp.deductions}</td>
                                                            <td>{emp.netPay}</td>
                                                            <td>
                                                                <span className={`badge ${emp.status === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                                                                    {emp.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="flex-column flex-md-row" style={{ backgroundColor: '#f0f7f8' }}>
                    <Button variant="secondary" onClick={() => setShowDepartmentModal(false)} className="w-100 w-md-auto mb-2 mb-md-0">
                        Close
                    </Button>
                    <Button style={{ backgroundColor: '#023347', border: 'none' }} className="w-100 w-md-auto">
                        Export Details
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PayrollReports;