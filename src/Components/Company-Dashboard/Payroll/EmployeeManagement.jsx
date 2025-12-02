import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Table,
    Modal,
    Form,
    Badge
} from 'react-bootstrap';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaFileUpload,
    FaUser,
    FaUsers,
    FaUserSlash,
    FaMoneyBillWave,
    FaEnvelope,
    FaIdCard,
    FaCalendarAlt,
    FaBuilding,
    FaBriefcase,
    FaDollarSign,
    FaUniversity,
    FaInfoCircle
} from 'react-icons/fa';
import { format } from 'date-fns';

// Sample data for initial display
const initialEmployees = [
    {
        id: 'EMP001',
        fullName: 'John Doe',
        department: 'IT',
        designation: 'Software Engineer',
        joiningDate: '2022-01-15',
        salaryType: 'Monthly',
        baseSalary: 5000,
        status: 'Active',
        bankAccount: '1234567890',
        ifscBranch: 'SBI0001234',
        taxId: 'ABCDE1234F'
    },
    {
        id: 'EMP002',
        fullName: 'Jane Smith',
        department: 'HR',
        designation: 'HR Manager',
        joiningDate: '2021-05-20',
        salaryType: 'Monthly',
        baseSalary: 6000,
        status: 'Active',
        bankAccount: '0987654321',
        ifscBranch: 'HDFC0005678',
        taxId: 'FGHIJ5678K'
    },
    {
        id: 'EMP003',
        fullName: 'Robert Johnson',
        department: 'Finance',
        designation: 'Accountant',
        joiningDate: '2020-11-10',
        salaryType: 'Monthly',
        baseSalary: 4500,
        status: 'Inactive',
        bankAccount: '1122334455',
        ifscBranch: 'ICICI0009012',
        taxId: 'LMNOP9012Q'
    }
];

const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'];
const designations = ['Manager', 'Assistant', 'Executive', 'Engineer', 'Analyst', 'Specialist'];

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState(initialEmployees);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [viewEmployee, setViewEmployee] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        department: '',
        designation: '',
        joiningDate: new Date(),
        salaryType: 'Monthly',
        baseSalary: '',
        bankAccount: '',
        ifscBranch: '',
        taxId: '',
        status: 'Active'
    });

    // Stats for dashboard cards
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        totalPayroll: 0
    });

    useEffect(() => {
        // Calculate stats
        const total = employees.length;
        const active = employees.filter(emp => emp.status === 'Active').length;
        const inactive = total - active;
        const payroll = employees
            .filter(emp => emp.status === 'Active')
            .reduce((sum, emp) => sum + parseFloat(emp.baseSalary || 0), 0);

        setStats({
            totalEmployees: total,
            activeEmployees: active,
            inactiveEmployees: inactive,
            totalPayroll: payroll
        });
    }, [employees]);

    const handleOpenModal = (employee = null) => {
        if (employee) {
            setCurrentEmployee(employee);
            setFormData({
                fullName: employee.fullName,
                department: employee.department,
                designation: employee.designation,
                joiningDate: new Date(employee.joiningDate),
                salaryType: employee.salaryType,
                baseSalary: employee.baseSalary,
                bankAccount: employee.bankAccount,
                ifscBranch: employee.ifscBranch,
                taxId: employee.taxId,
                status: employee.status
            });
        } else {
            setCurrentEmployee(null);
            setFormData({
                fullName: '',
                department: '',
                designation: '',
                joiningDate: new Date(),
                salaryType: 'Monthly',
                baseSalary: '',
                bankAccount: '',
                ifscBranch: '',
                taxId: '',
                status: 'Active'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleViewEmployee = (employee) => {
        setViewEmployee(employee);
        setShowViewModal(true);
    };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleDateChange = (e) => {
        setFormData({
            ...formData,
            joiningDate: new Date(e.target.value)
        });
    };

    const handleSubmit = () => {
        if (currentEmployee) {
            // Update existing employee
            setEmployees(employees.map(emp =>
                emp.id === currentEmployee.id
                    ? { ...emp, ...formData }
                    : emp
            ));
        } else {
            // Add new employee
            const newEmployee = {
                id: `EMP${String(employees.length + 1).padStart(3, '0')}`,
                ...formData
            };
            setEmployees([...employees, newEmployee]);
        }
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            setEmployees(employees.filter(emp => emp.id !== id));
        }
    };

    const handleImportCSV = () => {
        // In a real app, this would handle file upload and parsing
        alert('CSV Import functionality would be implemented here');
    };

    // Mobile card component for employee display
    const EmployeeCard = ({ employee }) => (
        <Card className="mb-3 border-0 shadow-sm" style={{ backgroundColor: '#e6f3f5' }}>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <Card.Title className="mb-1" style={{ color: '#023347' }}>{employee.fullName}</Card.Title>
                        <Card.Subtitle className="text-muted">{employee.id}</Card.Subtitle>
                    </div>
                    <Badge 
                        bg={employee.status === 'Active' ? 'success' : 'danger'} 
                        pill
                    >
                        {employee.status}
                    </Badge>
                </div>
                
                <div className="mb-2">
                    <span className="text-muted small">Department: </span>
                    <span>{employee.department}</span>
                </div>
                
                <div className="mb-2">
                    <span className="text-muted small">Designation: </span>
                    <span>{employee.designation}</span>
                </div>
                
                <div className="mb-2">
                    <span className="text-muted small">Joining Date: </span>
                    <span>{format(new Date(employee.joiningDate), 'MM/dd/yyyy')}</span>
                </div>
                
                <div className="mb-3">
                    <span className="text-muted small">Salary: </span>
                    <span>${parseFloat(employee.baseSalary).toLocaleString()}</span>
                </div>
                
                <div className="d-flex justify-content-end">
                    <Button
                        variant="light"
                        size="sm"
                        className="me-2"
                        style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                        onClick={() => handleViewEmployee(employee)}
                        title="View"
                    >
                        <FaEye />
                    </Button>
                    <Button
                        variant="light"
                        size="sm"
                        className="me-2"
                        style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                        onClick={() => handleOpenModal(employee)}
                        title="Edit"
                    >
                        <FaEdit />
                    </Button>
                    <Button
                        variant="light"
                        size="sm"
                        style={{ color: '#dc3545', backgroundColor: '#e6f3f5' }}
                        onClick={() => handleDelete(employee.id)}
                        title="Delete"
                    >
                        <FaTrash />
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <Container fluid className="py-4 px-3 px-md-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh' }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                <h2 className="mb-3 mb-md-0" style={{ color: '#023347', fontWeight: '600' }}>
                    Employee Management
                </h2>
                <div className="d-flex flex-column flex-sm-row gap-2">
                    <Button
                        style={{ backgroundColor: '#023347', border: 'none' }}
                        onClick={() => handleOpenModal()}
                        className="d-flex align-items-center justify-content-center"
                    >
                        <FaPlus className="me-2" />
                        <span>Add Employee</span>
                    </Button>
                    <Button
                        style={{ backgroundColor: '#2a8e9c', border: 'none' }}
                        onClick={handleImportCSV}
                        className="d-flex align-items-center justify-content-center"
                    >
                        <FaFileUpload className="me-2" />
                        <span>Import CSV</span>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col xs={6} md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#e6f3f5' }}>
                        <Card.Body className="d-flex align-items-center">
                            <div className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: '#023347', color: '#ffffff', width: '40px', height: '40px' }}>
                                <FaUsers />
                            </div>
                            <div>
                                <Card.Title as="h4" className="mb-0" style={{ color: '#023347' }}>{stats.totalEmployees}</Card.Title>
                                <Card.Text className="text-muted mb-0 small">Total Employees</Card.Text>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={6} md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#e6f3f5' }}>
                        <Card.Body className="d-flex align-items-center">
                            <div className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: '#2a8e9c', color: '#ffffff', width: '40px', height: '40px' }}>
                                <FaUser />
                            </div>
                            <div>
                                <Card.Title as="h4" className="mb-0" style={{ color: '#023347' }}>{stats.activeEmployees}</Card.Title>
                                <Card.Text className="text-muted mb-0 small">Active Employees</Card.Text>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={6} md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#e6f3f5' }}>
                        <Card.Body className="d-flex align-items-center">
                            <div className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: '#dc3545', color: '#ffffff', width: '40px', height: '40px' }}>
                                <FaUserSlash />
                            </div>
                            <div>
                                <Card.Title as="h4" className="mb-0" style={{ color: '#023347' }}>{stats.inactiveEmployees}</Card.Title>
                                <Card.Text className="text-muted mb-0 small">Inactive Employees</Card.Text>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={6} md={3} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#e6f3f5' }}>
                        <Card.Body className="d-flex align-items-center">
                            <div className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: '#fd7e14', color: '#ffffff', width: '40px', height: '40px' }}>
                                <FaMoneyBillWave />
                            </div>
                            <div>
                                <Card.Title as="h4" className="mb-0" style={{ color: '#023347' }}>${stats.totalPayroll.toLocaleString()}</Card.Title>
                                <Card.Text className="text-muted mb-0 small">Total Payroll</Card.Text>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Employee Table for Desktop */}
            <div className="d-none d-md-block">
                <Card className="border-0 shadow-sm" style={{ backgroundColor: '#e6f3f5' }}>
                    <Card.Body className="p-0">
                        <Table responsive hover className="mb-0">
                            <thead>
                                <tr>
                                    <th style={{ border: 'none', padding: '12px 15px' }}>Employee ID</th>
                                    <th style={{ border: 'none', padding: '12px 15px' }}>Full Name</th>
                                    <th style={{ border: 'none', padding: '12px 15px' }}>Department</th>
                                    <th style={{ border: 'none', padding: '12px 15px' }}>Designation</th>
                                    <th style={{ border: 'none', padding: '12px 15px' }}>Joining Date</th>
                                    <th style={{ border: 'none', padding: '12px 15px' }}>Salary Type</th>
                                    <th style={{ border: 'none', padding: '12px 15px' }}>Base Salary</th>
                                    <th style={{ border: 'none', padding: '12px 15px' }}>Status</th>
                                    <th style={{ border: 'none', padding: '12px 15px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee) => (
                                    <tr key={employee.id} style={{ borderBottom: '1px solid #ced4da' }}>
                                        <td style={{ padding: '12px 15px' }}>{employee.id}</td>
                                        <td style={{ padding: '12px 15px' }}>{employee.fullName}</td>
                                        <td style={{ padding: '12px 15px' }}>{employee.department}</td>
                                        <td style={{ padding: '12px 15px' }}>{employee.designation}</td>
                                        <td style={{ padding: '12px 15px' }}>{format(new Date(employee.joiningDate), 'MM/dd/yyyy')}</td>
                                        <td style={{ padding: '12px 15px' }}>{employee.salaryType}</td>
                                        <td style={{ padding: '12px 15px' }}>${parseFloat(employee.baseSalary).toLocaleString()}</td>
                                        <td style={{ padding: '12px 15px' }}>
                                            <Badge
                                                bg={employee.status === 'Active' ? 'success' : 'danger'}
                                                pill
                                            >
                                                {employee.status}
                                            </Badge>
                                        </td>
                                        <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="me-1"
                                                style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                                                onClick={() => handleViewEmployee(employee)}
                                                title="View"
                                            >
                                                <FaEye />
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="me-1"
                                                style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                                                onClick={() => handleOpenModal(employee)}
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                style={{ color: '#dc3545', backgroundColor: '#e6f3f5' }}
                                                onClick={() => handleDelete(employee.id)}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </div>

            {/* Employee Cards for Mobile */}
            <div className="d-md-none">
                {employees.map((employee) => (
                    <EmployeeCard key={employee.id} employee={employee} />
                ))}
            </div>

            {/* Add/Edit Employee Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered fullscreen="sm-down">
                <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#ffffff' }}>
                    <Modal.Title>
                        {currentEmployee ? 'Edit Employee' : 'Add New Employee'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4" style={{ backgroundColor: '#f0f7f8' }}>
                    <Form>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="formFullName">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                                />
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md={6} controlId="formDepartment">
                                <Form.Label>Department</Form.Label>
                                <Form.Select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    required
                                    style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group as={Col} md={6} controlId="formDesignation">
                                <Form.Label>Designation</Form.Label>
                                <Form.Select
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleInputChange}
                                    required
                                    style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                                >
                                    <option value="">Select Designation</option>
                                    {designations.map((desig) => (
                                        <option key={desig} value={desig}>{desig}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md={6} controlId="formJoiningDate">
                                <Form.Label>Joining Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="joiningDate"
                                    value={format(formData.joiningDate, 'yyyy-MM-dd')}
                                    onChange={handleDateChange}
                                    required
                                    style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                                />
                            </Form.Group>

                            <Form.Group as={Col} md={6} controlId="formSalaryType">
                                <Form.Label>Salary Type</Form.Label>
                                <Form.Select
                                    name="salaryType"
                                    value={formData.salaryType}
                                    onChange={handleInputChange}
                                    required
                                    style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Hourly">Hourly</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md={6} controlId="formBaseSalary">
                                <Form.Label>Basic Salary</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="baseSalary"
                                    value={formData.baseSalary}
                                    onChange={handleInputChange}
                                    required
                                    style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                                />
                            </Form.Group>

                            <Form.Group as={Col} md={6} controlId="formBankAccount">
                                <Form.Label>Bank Account Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="bankAccount"
                                    value={formData.bankAccount}
                                    onChange={handleInputChange}
                                    style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                                />
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md={6} controlId="formIfscBranch">
                                <Form.Label>IFSC / Branch Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="ifscBranch"
                                    value={formData.ifscBranch}
                                    onChange={handleInputChange}
                                    style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                                />
                            </Form.Group>

                            <Form.Group as={Col} md={6} controlId="formTaxId">
                                <Form.Label>Tax ID (PAN / VAT)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="taxId"
                                    value={formData.taxId}
                                    onChange={handleInputChange}
                                    style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                                />
                            </Form.Group>
                        </Row>

                        <Form.Group className="mb-3" controlId="formStatus">
                            <Form.Check
                                type="switch"
                                label="Active Status"
                                checked={formData.status === 'Active'}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    status: e.target.checked ? 'Active' : 'Inactive'
                                })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none', backgroundColor: '#f0f7f8' }}>
                    <Button variant="secondary" onClick={handleCloseModal} style={{ border: '1px solid #ced4da' }}>
                        Cancel
                    </Button>
                    <Button
                        style={{ backgroundColor: '#023347', border: 'none' }}
                        onClick={handleSubmit}
                    >
                        {currentEmployee ? 'Update' : 'Add'} Employee
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Employee Details Modal */}
            <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" centered fullscreen="sm-down">
                <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#ffffff' }}>
                    <Modal.Title>Employee Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4" style={{ backgroundColor: '#f0f7f8' }}>
                    {viewEmployee && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6} className="d-flex align-items-center mb-3">
                                    <div className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '80px', height: '80px', backgroundColor: '#e6f3f5' }}>
                                        <FaUser size={30} style={{ color: '#023347' }} />
                                    </div>
                                    <div>
                                        <h4 className="mb-0" style={{ color: '#023347' }}>{viewEmployee.fullName}</h4>
                                        <Badge 
                                            bg={viewEmployee.status === 'Active' ? 'success' : 'danger'} 
                                            pill
                                        >
                                            {viewEmployee.status}
                                        </Badge>
                                    </div>
                                </Col>
                                <Col md={6} className="d-flex align-items-center justify-content-md-end">
                                    <div className="text-center p-3 me-2 rounded" style={{ minWidth: '100px', backgroundColor: '#e6f3f5' }}>
                                        <div className="text-muted small">Employee ID</div>
                                        <div className="fw-bold" style={{ color: '#023347' }}>{viewEmployee.id}</div>
                                    </div>
                                    <div className="text-center p-3 rounded" style={{ minWidth: '100px', backgroundColor: '#e6f3f5' }}>
                                        <div className="text-muted small">Salary</div>
                                        <div className="fw-bold" style={{ color: '#023347' }}>${parseFloat(viewEmployee.baseSalary).toLocaleString()}</div>
                                    </div>
                                </Col>
                            </Row>

                            <hr />

                            <Row className="mb-4">
                                <Col md={6}>
                                    <h5 className="mb-3" style={{ color: '#023347' }}>Employment Information</h5>
                                    
                                    <div className="mb-3 d-flex">
                                        <div className="me-3" style={{ color: '#2a8e9c' }}>
                                            <FaBuilding size={20} />
                                        </div>
                                        <div>
                                            <div className="text-muted small">Department</div>
                                            <div className="fw-bold" style={{ color: '#023347' }}>{viewEmployee.department}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3 d-flex">
                                        <div className="me-3" style={{ color: '#2a8e9c' }}>
                                            <FaBriefcase size={20} />
                                        </div>
                                        <div>
                                            <div className="text-muted small">Designation</div>
                                            <div className="fw-bold" style={{ color: '#023347' }}>{viewEmployee.designation}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3 d-flex">
                                        <div className="me-3" style={{ color: '#2a8e9c' }}>
                                            <FaCalendarAlt size={20} />
                                        </div>
                                        <div>
                                            <div className="text-muted small">Joining Date</div>
                                            <div className="fw-bold" style={{ color: '#023347' }}>{format(new Date(viewEmployee.joiningDate), 'MMMM dd, yyyy')}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3 d-flex">
                                        <div className="me-3" style={{ color: '#2a8e9c' }}>
                                            <FaDollarSign size={20} />
                                        </div>
                                        <div>
                                            <div className="text-muted small">Salary Type</div>
                                            <div className="fw-bold" style={{ color: '#023347' }}>{viewEmployee.salaryType}</div>
                                        </div>
                                    </div>
                                </Col>
                                
                                <Col md={6}>
                                    <h5 className="mb-3" style={{ color: '#023347' }}>Financial Information</h5>
                                    
                                    <div className="mb-3 d-flex">
                                        <div className="me-3" style={{ color: '#2a8e9c' }}>
                                            <FaDollarSign size={20} />
                                        </div>
                                        <div>
                                            <div className="text-muted small">Base Salary</div>
                                            <div className="fw-bold" style={{ color: '#023347' }}>${parseFloat(viewEmployee.baseSalary).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3 d-flex">
                                        <div className="me-3" style={{ color: '#2a8e9c' }}>
                                            <FaUniversity size={20} />
                                        </div>
                                        <div>
                                            <div className="text-muted small">Bank Account</div>
                                            <div className="fw-bold" style={{ color: '#023347' }}>{viewEmployee.bankAccount}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3 d-flex">
                                        <div className="me-3" style={{ color: '#2a8e9c' }}>
                                            <FaInfoCircle size={20} />
                                        </div>
                                        <div>
                                            <div className="text-muted small">IFSC / Branch</div>
                                            <div className="fw-bold" style={{ color: '#023347' }}>{viewEmployee.ifscBranch}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3 d-flex">
                                        <div className="me-3" style={{ color: '#2a8e9c' }}>
                                            <FaIdCard size={20} />
                                        </div>
                                        <div>
                                            <div className="text-muted small">Tax ID</div>
                                            <div className="fw-bold" style={{ color: '#023347' }}>{viewEmployee.taxId}</div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ border: 'none', backgroundColor: '#f0f7f8' }}>
                    <Button variant="secondary" onClick={handleCloseViewModal}>
                        Close
                    </Button>
                    <Button 
                        style={{ backgroundColor: '#023347', border: 'none' }}
                        onClick={() => {
                            handleCloseViewModal();
                            handleOpenModal(viewEmployee);
                        }}
                    >
                        Edit Employee
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default EmployeeManagement;