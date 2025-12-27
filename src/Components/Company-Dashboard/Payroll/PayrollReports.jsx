import React, { useState, useEffect, useRef } from 'react';
import {
    Tabs,
    Tab,
    Table,
    Button,
    Form,
    Row,
    Col,
    Card,
    Modal,
    Container,
    Badge,
    Spinner,
    InputGroup
} from 'react-bootstrap';
import {
    FaFilePdf,
    FaFileExcel,
    FaFileCsv,
    FaPrint,
    FaEye,
    FaSearch,
    FaFilter,
    FaTimes,
    FaCalendarAlt,
    FaUsers,
    FaUser
} from 'react-icons/fa';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';
import './PayrollReports.css';

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

    // Modal cleanup refs (same pattern as Users.jsx)
    const isCleaningUpRef = useRef(false);
    const modalKeyRef = useRef({ monthly: 0, department: 0 });

    const [monthlyData, setMonthlyData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [employeeHistoryData, setEmployeeHistoryData] = useState([]);
    const [taxDeductionData, setTaxDeductionData] = useState([]);

    const [months, setMonths] = useState([]);
    const [departments, setDepartments] = useState(['All']);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(true);

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

    const handleCloseMonthlyModal = () => {
        // Prevent multiple calls
        if (isCleaningUpRef.current) return;
        isCleaningUpRef.current = true;
        
        // Close modal immediately
        setShowMonthlyModal(false);
        
        // Force modal remount on next open
        modalKeyRef.current.monthly += 1;
    };
    
    // Handle monthly modal exit - cleanup after animation
    const handleMonthlyModalExited = () => {
        // Reset monthly data after modal fully closed
        setSelectedMonthlyData(null);
        isCleaningUpRef.current = false;
    };
    
    const handleCloseDepartmentModal = () => {
        // Prevent multiple calls
        if (isCleaningUpRef.current) return;
        isCleaningUpRef.current = true;
        
        // Close modal immediately
        setShowDepartmentModal(false);
        
        // Force modal remount on next open
        modalKeyRef.current.department += 1;
    };
    
    // Handle department modal exit - cleanup after animation
    const handleDepartmentModalExited = () => {
        // Reset department data after modal fully closed
        setSelectedDepartmentData(null);
        isCleaningUpRef.current = false;
    };

    // Handle Monthly View (API call)
    const handleMonthlyView = async (data) => {
        // Reset cleanup flag
        isCleaningUpRef.current = false;
        
        // Force modal remount
        modalKeyRef.current.monthly += 1;
        
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
        // Reset cleanup flag
        isCleaningUpRef.current = false;
        
        // Force modal remount
        modalKeyRef.current.department += 1;
        
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
        return (
            <div className="d-flex justify-content-center align-items-center loading-container" style={{ height: "100vh" }}>
                <div className="text-center">
                    <Spinner animation="border" className="spinner-custom" />
                    <p className="mt-3 text-muted">Loading payroll reports...</p>
                </div>
            </div>
        );
    }

    const getStatusBadgeClass = (status) => {
        return status === "Paid" ? "badge-status badge-paid" : "badge-status badge-pending";
    };

    return (
        <Container fluid className="p-4 payroll-reports-container">
            {/* Header Section */}
            <div className="mb-4">
                <Row className="align-items-center">
                    <Col xs={12} md={8}>
                        <h3 className="payroll-reports-title">
                            <i className="fas fa-chart-line me-2"></i>
                            Payroll Reports
                        </h3>
                        <p className="payroll-reports-subtitle">View and analyze payroll data by month, department, and employee</p>
                    </Col>
                    <Col xs={12} md={4} className="d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
                        <Button className="btn-export-pdf d-flex align-items-center">
                            <FaFilePdf className="me-2" /> PDF ملف
                        </Button>
                        <Button className="btn-export-excel d-flex align-items-center">
                            <FaFileExcel className="me-2" /> Excel ملف
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* Filter Card */}
            <Card className="filter-card">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white border-0 pb-0">
                    <div className="d-flex align-items-center">
                        <FaFilter className="me-2" style={{ color: '#505ece' }} />
                        <h6 className="mb-0 filter-title">Filters</h6>
                    </div>
                    <Button
                        variant="link"
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-0"
                        style={{ color: '#505ece' }}
                    >
                        {showFilters ? <FaTimes /> : <FaFilter />}
                    </Button>
                </Card.Header>
                {showFilters && (
                    <Card.Body className="pt-3">
                        <Row>
                            <Col xs={12} md={4} className="mb-3 mb-md-0">
                                <Form.Group>
                                    <Form.Label className="form-label-custom d-flex align-items-center">
                                        <FaCalendarAlt className="me-1" /> Month
                                    </Form.Label>
                                    <InputGroup className="input-group-custom">
                                        <InputGroup.Text>
                                            <FaCalendarAlt />
                                        </InputGroup.Text>
                                        <Form.Select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            className="form-select-custom"
                                        >
                                            {months.map(month => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </Form.Select>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={4} className="mb-3 mb-md-0">
                                <Form.Group>
                                    <Form.Label className="form-label-custom d-flex align-items-center">
                                        <FaUsers className="me-1" /> Department
                                    </Form.Label>
                                    <InputGroup className="input-group-custom">
                                        <InputGroup.Text>
                                            <FaUsers />
                                        </InputGroup.Text>
                                        <Form.Select
                                            value={selectedDepartment}
                                            onChange={(e) => setSelectedDepartment(e.target.value)}
                                            className="form-select-custom"
                                        >
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </Form.Select>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={4} className="mb-3 mb-md-0">
                                <Form.Group>
                                    <Form.Label className="form-label-custom d-flex align-items-center">
                                        <FaUser className="me-1" /> Employee
                                    </Form.Label>
                                    <InputGroup className="input-group-custom">
                                        <InputGroup.Text>
                                            <FaSearch />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search Employee..."
                                            value={searchEmployee}
                                            onChange={(e) => setSearchEmployee(e.target.value)}
                                            className="form-control-custom"
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} className="text-end mt-3">
                                <Button
                                    className="btn-modal-cancel"
                                    onClick={() => {
                                        setSelectedMonth(months.length > 0 ? months[0] : '');
                                        setSelectedDepartment('All');
                                        setSearchEmployee('');
                                    }}
                                >
                                    <FaTimes className="me-1" /> Clear Filters
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                )}
            </Card>

                    <Tabs
                        id="payroll-reports-tabs"
                        activeKey={key}
                        onSelect={(k) => setKey(k)}
                        className="mb-3"
                        fill
                    >
                        {/* Monthly Tab */}
                        <Tab eventKey="monthly" title="Monthly Summary">
                            <Card className="reports-table-card border-0 shadow-lg">
                                <Card.Body className="p-0">
                                    {/* Desktop Table */}
                                    <div className="d-none d-md-block">
                                        <div className="table-responsive">
                                            <Table hover responsive className="payroll-reports-table">
                                                <thead className="table-header">
                                                    <tr>
                                                        <th>Month</th>
                                                        <th>Total Employees</th>
                                                        <th>Gross Pay</th>
                                                        <th>Deductions</th>
                                                        <th>Net Pay</th>
                                                        <th className="text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {monthlyData.length > 0 ? (
                                                        monthlyData.map((data, index) => (
                                                            <tr key={index}>
                                                                <td className="fw-semibold">{data.month}</td>
                                                                <td>{data.totalEmployees}</td>
                                                                <td className="fw-semibold text-success">{data.grossPay}</td>
                                                                <td className="fw-semibold text-danger">{data.deductions}</td>
                                                                <td className="fw-bold text-primary">{data.netPay}</td>
                                                                <td className="text-center">
                                                                    <Button
                                                                        className="btn-action btn-view"
                                                                        onClick={() => handleMonthlyView(data)}
                                                                        title="View Details"
                                                                    >
                                                                        <FaEye />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="6" className="text-center text-muted py-4">
                                                                No monthly data available.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                    {/* Mobile Cards */}
                                    <div className="d-md-none p-3">
                                        {monthlyData.length > 0 ? (
                                            monthlyData.map((data, index) => (
                                                <Card key={index} className="mobile-card mb-3">
                                                    <Card.Body className="mobile-card-body">
                                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                                            <Card.Title className="h6 mb-0 fw-bold" style={{ color: '#505ece' }}>
                                                                {data.month}
                                                            </Card.Title>
                                                            <Button
                                                                className="btn-action btn-view"
                                                                onClick={() => handleMonthlyView(data)}
                                                                title="View"
                                                            >
                                                                <FaEye />
                                                            </Button>
                                                        </div>
                                                        <div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <span><strong>Employees:</strong></span>
                                                                <span>{data.totalEmployees}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <span><strong>Gross Pay:</strong></span>
                                                                <span className="text-success">{data.grossPay}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <span><strong>Deductions:</strong></span>
                                                                <span className="text-danger">{data.deductions}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <span><strong>Net Pay:</strong></span>
                                                                <span className="fw-bold text-primary">{data.netPay}</span>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center text-muted py-4">
                                                No monthly data available.
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Tab>

                        {/* Department Tab */}
                        <Tab eventKey="department" title="Department Report">
                            <Card className="reports-table-card border-0 shadow-lg">
                                <Card.Body className="p-0">
                                    {/* Desktop Table */}
                                    <div className="d-none d-md-block">
                                        <div className="table-responsive">
                                            <Table hover responsive className="payroll-reports-table">
                                                <thead className="table-header">
                                                    <tr>
                                                        <th>Department</th>
                                                        <th>Employees</th>
                                                        <th>Total Salary</th>
                                                        <th>Avg Salary</th>
                                                        <th className="text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {departmentData.length > 0 ? (
                                                        departmentData.map((data, index) => (
                                                            <tr key={index}>
                                                                <td className="fw-semibold">{data.department}</td>
                                                                <td>{data.employees}</td>
                                                                <td className="fw-bold text-primary">{data.totalSalary}</td>
                                                                <td className="fw-semibold">{data.avgSalary}</td>
                                                                <td className="text-center">
                                                                    <Button
                                                                        className="btn-action btn-view"
                                                                        onClick={() => handleDepartmentView(data)}
                                                                        title="View Details"
                                                                    >
                                                                        <FaEye />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="text-center text-muted py-4">
                                                                No department data available.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                    {/* Mobile Cards */}
                                    <div className="d-md-none p-3">
                                        {departmentData.length > 0 ? (
                                            departmentData.map((data, index) => (
                                                <Card key={index} className="mobile-card mb-3">
                                                    <Card.Body className="mobile-card-body">
                                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                                            <Card.Title className="h6 mb-0 fw-bold" style={{ color: '#505ece' }}>
                                                                {data.department}
                                                            </Card.Title>
                                                            <Button
                                                                className="btn-action btn-view"
                                                                onClick={() => handleDepartmentView(data)}
                                                                title="View"
                                                            >
                                                                <FaEye />
                                                            </Button>
                                                        </div>
                                                        <div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <span><strong>Employees:</strong></span>
                                                                <span>{data.employees}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <span><strong>Total Salary:</strong></span>
                                                                <span className="fw-bold text-primary">{data.totalSalary}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <span><strong>Avg Salary:</strong></span>
                                                                <span>{data.avgSalary}</span>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center text-muted py-4">
                                                No department data available.
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Tab>

                        {/* Employee History */}
                        <Tab eventKey="employee" title="Employee History">
                            <Card className="reports-table-card border-0 shadow-lg">
                                <Card.Body className="p-0">
                                    {/* Desktop Table */}
                                    <div className="d-none d-md-block">
                                        <div className="table-responsive">
                                            <Table hover responsive className="payroll-reports-table">
                                                <thead className="table-header">
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
                                                    {filteredEmployeeHistory.length > 0 ? (
                                                        filteredEmployeeHistory.map((data, index) => (
                                                            <tr key={index}>
                                                                <td className="fw-semibold">{data.employee}</td>
                                                                <td>{data.month}</td>
                                                                <td className="fw-semibold text-success">{data.grossPay}</td>
                                                                <td className="fw-semibold text-danger">{data.deductions}</td>
                                                                <td className="fw-bold text-primary">{data.netPay}</td>
                                                                <td>
                                                                    <Badge className={getStatusBadgeClass(data.status)}>
                                                                        {data.status}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="6" className="text-center text-muted py-4">
                                                                No employee history found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                    {/* Mobile Cards */}
                                    <div className="d-md-none p-3">
                                        {filteredEmployeeHistory.length > 0 ? (
                                            filteredEmployeeHistory.map((data, index) => (
                                                <Card key={index} className="mobile-card mb-3">
                                                    <Card.Body className="mobile-card-body">
                                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                                            <Card.Title className="h6 mb-0 fw-bold" style={{ color: '#505ece' }}>
                                                                {data.employee}
                                                            </Card.Title>
                                                            <Badge className={getStatusBadgeClass(data.status)}>
                                                                {data.status}
                                                            </Badge>
                                                        </div>
                                                        <div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <span><strong>Month:</strong></span>
                                                                <span>{data.month}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <span><strong>Gross Pay:</strong></span>
                                                                <span className="text-success">{data.grossPay}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <span><strong>Deductions:</strong></span>
                                                                <span className="text-danger">{data.deductions}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <span><strong>Net Pay:</strong></span>
                                                                <span className="fw-bold text-primary">{data.netPay}</span>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center text-muted py-4">
                                                No employee history found.
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Tab>

                        {/* Tax & Deduction */}
                        <Tab eventKey="tax" title="Tax & Deduction Report">
                            <Card className="reports-table-card border-0 shadow-lg">
                                <Card.Body className="p-0">
                                    {/* Desktop Table */}
                                    <div className="d-none d-md-block">
                                        <div className="table-responsive">
                                            <Table hover responsive className="payroll-reports-table">
                                                <thead className="table-header">
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
                                                    {taxDeductionData.length > 0 ? (
                                                        taxDeductionData.map((data, index) => (
                                                            <tr key={index}>
                                                                <td className="fw-semibold">{data.month}</td>
                                                                <td className="text-danger">{data.tax}</td>
                                                                <td className="text-danger">{data.pf}</td>
                                                                <td className="text-danger">{data.insurance}</td>
                                                                <td className="text-danger">{data.other}</td>
                                                                <td className="fw-bold text-danger">{data.totalDeductions}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="6" className="text-center text-muted py-4">
                                                                No tax deduction data available.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                    {/* Mobile Cards */}
                                    <div className="d-md-none p-3">
                                        {taxDeductionData.length > 0 ? (
                                            taxDeductionData.map((data, index) => (
                                                <Card key={index} className="mobile-card mb-3">
                                                    <Card.Body className="mobile-card-body">
                                                        <Card.Title className="h6 mb-3 fw-bold" style={{ color: '#505ece' }}>
                                                            {data.month}
                                                        </Card.Title>
                                                        <div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <span><strong>Tax:</strong></span>
                                                                <span className="text-danger">{data.tax}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <span><strong>PF:</strong></span>
                                                                <span className="text-danger">{data.pf}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <span><strong>Insurance:</strong></span>
                                                                <span className="text-danger">{data.insurance}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <span><strong>Other:</strong></span>
                                                                <span className="text-danger">{data.other}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <span><strong>Total Deductions:</strong></span>
                                                                <span className="fw-bold text-danger">{data.totalDeductions}</span>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center text-muted py-4">
                                                No tax deduction data available.
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Tab>
                    </Tabs>

            {/* Monthly Modal */}
            <Modal
                key={modalKeyRef.current.monthly}
                show={showMonthlyModal}
                onHide={handleCloseMonthlyModal}
                onExited={handleMonthlyModalExited}
                size="lg"
                centered
                className="payroll-reports-modal"
            >
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>Monthly Details - {selectedMonthlyData?.month}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                    {selectedMonthlyData && (
                        <div>
                            <Row className="mb-4">
                                <Col xs={12} md={6} className="mb-3 mb-md-0">
                                    <Card className="info-card">
                                        <Card.Body>
                                            <Card.Title>Employee Information</Card.Title>
                                            <Table borderless>
                                                <tbody>
                                                    <tr><td><strong>Total Employees:</strong></td><td>{selectedMonthlyData.totalEmployees}</td></tr>
                                                    <tr><td><strong>Month:</strong></td><td>{selectedMonthlyData.month}</td></tr>
                                                </tbody>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Card className="info-card">
                                        <Card.Body>
                                            <Card.Title>Financial Summary</Card.Title>
                                            <Table borderless>
                                                <tbody>
                                                    <tr><td><strong>Gross Pay:</strong></td><td className="text-success">{selectedMonthlyData.grossPay}</td></tr>
                                                    <tr><td><strong>Deductions:</strong></td><td className="text-danger">{selectedMonthlyData.deductions}</td></tr>
                                                    <tr><td><strong>Net Pay:</strong></td><td className="fw-bold text-primary">{selectedMonthlyData.netPay}</td></tr>
                                                </tbody>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Card className="border-0 shadow-sm">
                                <Card.Body>
                                    <Card.Title className="fw-bold" style={{ color: '#505ece' }}>Employee Breakdown</Card.Title>
                                    <div className="table-responsive">
                                        <Table hover responsive className="detail-table">
                                            <thead>
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
                                                        <td className="fw-semibold">{emp.employee}</td>
                                                        <td>{emp.department}</td>
                                                        <td className="text-success">{emp.grossPay}</td>
                                                        <td className="text-danger">{emp.deductions}</td>
                                                        <td className="fw-bold text-primary">{emp.netPay}</td>
                                                        <td>
                                                            <Badge className={getStatusBadgeClass(emp.status)}>
                                                                {emp.status}
                                                            </Badge>
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
                <Modal.Footer className="modal-footer-custom">
                    <Button className="btn-modal-cancel" onClick={handleCloseMonthlyModal}>
                        Close
                    </Button>
                    <Button className="btn-modal-export">
                        <FaFilePdf className="me-1" /> Export Details
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Department Modal */}
            <Modal
                key={modalKeyRef.current.department}
                show={showDepartmentModal}
                onHide={handleCloseDepartmentModal}
                onExited={handleDepartmentModalExited}
                size="lg"
                centered
                className="payroll-reports-modal"
            >
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>Department Details - {selectedDepartmentData?.department}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                    {selectedDepartmentData && (
                        <div>
                            <Row className="mb-4">
                                <Col xs={12} md={6} className="mb-3 mb-md-0">
                                    <Card className="info-card">
                                        <Card.Body>
                                            <Card.Title>Department Information</Card.Title>
                                            <Table borderless>
                                                <tbody>
                                                    <tr><td><strong>Department:</strong></td><td>{selectedDepartmentData.department}</td></tr>
                                                    <tr><td><strong>Employees:</strong></td><td>{selectedDepartmentData.employees}</td></tr>
                                                </tbody>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Card className="info-card">
                                        <Card.Body>
                                            <Card.Title>Salary Information</Card.Title>
                                            <Table borderless>
                                                <tbody>
                                                    <tr><td><strong>Total Salary:</strong></td><td className="fw-bold text-primary">{selectedDepartmentData.totalSalary}</td></tr>
                                                    <tr><td><strong>Average Salary:</strong></td><td>{selectedDepartmentData.avgSalary}</td></tr>
                                                </tbody>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Card className="border-0 shadow-sm">
                                <Card.Body>
                                    <Card.Title className="fw-bold" style={{ color: '#505ece' }}>Employees in {selectedDepartmentData.department}</Card.Title>
                                    <div className="table-responsive">
                                        <Table hover responsive className="detail-table">
                                            <thead>
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
                                                            <td className="fw-semibold">{emp.employee}</td>
                                                            <td>{uiMonth}</td>
                                                            <td className="text-success">{emp.grossPay}</td>
                                                            <td className="text-danger">{emp.deductions}</td>
                                                            <td className="fw-bold text-primary">{emp.netPay}</td>
                                                            <td>
                                                                <Badge className={getStatusBadgeClass(emp.status)}>
                                                                    {emp.status}
                                                                </Badge>
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
                <Modal.Footer className="modal-footer-custom">
                    <Button className="btn-modal-cancel" onClick={handleCloseDepartmentModal}>
                        Close
                    </Button>
                    <Button className="btn-modal-export">
                        <FaFilePdf className="me-1" /> Export Details
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default PayrollReports;