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
<<<<<<< HEAD
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaFileUpload,
    FaUser,
    FaUsers,
    FaUserSlash,
    FaMoneyBillWave,
    FaBuilding,
    FaBriefcase,
    FaCalendarAlt,
    FaDollarSign,
    FaUniversity,
    FaInfoCircle,
    FaIdCard
=======
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaFileUpload,
  FaUser,
  FaUsers,
  FaUserSlash,
  FaMoneyBillWave,
  FaBuilding,
  FaBriefcase,
  FaCalendarAlt,
  FaDollarSign,
  FaUniversity,
  FaInfoCircle,
  FaIdCard
>>>>>>> 83015b75a7b7818a0d7346c667569f4b5b71995f
} from 'react-icons/fa';
import { format } from 'date-fns';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';

<<<<<<< HEAD
// Hardcoded for now — in production, fetch from /departments and /designations
const DEPARTMENTS = [
    { id: 1, name: 'IT' },
    { id: 2, name: 'HR' },
    { id: 3, name: 'Finance' },
    { id: 4, name: 'Marketing' },
    { id: 5, name: 'Operations' },
    { id: 6, name: 'Sales' }
];

const DESIGNATIONS = [
    { id: 1, name: 'Manager' },
    { id: 2, name: 'Assistant' },
    { id: 3, name: 'Executive' },
    { id: 4, name: 'Engineer' },
    { id: 5, name: 'Analyst' },
    { id: 6, name: 'Specialist' }
];

const EmployeeManagement = () => {
    const companyId = GetCompanyId();
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [viewEmployee, setViewEmployee] = useState(null);
    const [formData, setFormData] = useState({
=======
// Hardcoded since API doesn't expose /departments or /designations
const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'];
const DESIGNATIONS = ['Manager', 'Assistant', 'Executive', 'Engineer', 'Analyst', 'Specialist'];

const EmployeeManagement = () => {
  const companyId = GetCompanyId();
  const [employees, setEmployees] = useState([]);
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
    status: 'Active',
    employeeCode: '' // 👈 Added employeeCode to formData
  });

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    totalPayroll: 0
  });

  // Fetch employees and stats by company_id
  const fetchEmployees = async () => {
    if (!companyId) return;
    try {
      const res = await axiosInstance.get(`employee?company_id=${companyId}`);
      if (res?.data?.success) {
        const data = res.data.data;
        const list = data.employees.map(emp => ({
          id: emp.id,
          employeeCode: emp.employee_code,
          fullName: emp.full_name,
          department: emp.department?.name || '—',
          designation: emp.designation?.name || '—',
          joiningDate: emp.joining_date,
          salaryType: emp.salary_type,
          baseSalary: emp.basic_salary,
          bankAccount: emp.bank_account_number,
          ifscBranch: emp.ifsc_code,
          taxId: emp.tax_id,
          status: emp.status
        }));
        setEmployees(list);

        setStats({
          totalEmployees: data.statistics.totalEmployees,
          activeEmployees: data.statistics.activeEmployees,
          inactiveEmployees: data.statistics.inactiveEmployees,
          totalPayroll: data.statistics.totalPayroll
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Failed to load employee data.');
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchEmployees();
    }
  }, [companyId]);

  // Generate next employee code: EMP001, EMP002, ...
const generateEmployeeCode = () => {
  // Get current timestamp to ensure uniqueness
  const timestamp = Date.now();
  
  const codes = employees
    .map(emp => emp.employeeCode)
    .filter(code => code && typeof code === 'string' && code.startsWith('EMP-'))
    .map(code => parseInt(code.replace(/[^0-9]/g, ''), 10))
    .filter(num => !isNaN(num));

  const nextNum = codes.length ? Math.max(...codes) + 1 : 1;
  
  // Combine sequential number with timestamp to ensure uniqueness
  return `EMP-${String(nextNum).padStart(3, '0')}-${timestamp}`;
};

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
        status: employee.status,
        employeeCode: employee.employeeCode // 👈 preserve existing code
      });
    } else {
      const newCode = generateEmployeeCode();
      setCurrentEmployee(null);
      setFormData({
>>>>>>> 83015b75a7b7818a0d7346c667569f4b5b71995f
        fullName: '',
        departmentId: '',
        designationId: '',
        joiningDate: new Date(),
        salaryType: 'Monthly',
        baseSalary: '',
        bankAccount: '',
        ifscBranch: '',
        taxId: '',
        status: 'Active',
        employeeCode: newCode // 👈 auto-generate for new
      });
    }
    setShowModal(true);
  };

<<<<<<< HEAD
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        totalPayroll: 0
    });

    const fetchEmployees = async () => {
        try {
            const res = await axiosInstance.get(`employee?company_id=${companyId}`);
            if (res?.data?.success) {
                const data = res.data.data;
                const list = data.employees.map(emp => ({
                    id: emp.id,
                    employeeCode: emp.employee_code,
                    fullName: emp.full_name,
                    department: emp.department?.name || '—',
                    departmentId: emp.department_id,
                    designation: emp.designation?.name || '—',
                    designationId: emp.designation_id,
                    joiningDate: emp.joining_date,
                    salaryType: emp.salary_type,
                    baseSalary: emp.basic_salary,
                    bankAccount: emp.bank_account_number,
                    ifscBranch: emp.ifsc_code,
                    taxId: emp.tax_id,
                    status: emp.status
                }));
                setEmployees(list);
                setStats({
                    totalEmployees: data.statistics.totalEmployees,
                    activeEmployees: data.statistics.activeEmployees,
                    inactiveEmployees: data.statistics.inactiveEmployees,
                    totalPayroll: data.statistics.totalPayroll
                });
            }
        } catch (err) {
            console.error('Fetch employees error:', err);
            alert('Failed to load employee data.');
        }
    };

    useEffect(() => {
        if (companyId) {
            fetchEmployees();
        }
    }, [companyId]);

    const handleOpenModal = (employee = null) => {
        if (employee) {
            setCurrentEmployee(employee);
            setFormData({
                fullName: employee.fullName,
                departmentId: employee.departmentId,
                designationId: employee.designationId,
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
                departmentId: '',
                designationId: '',
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

    const handleCloseModal = () => setShowModal(false);
    const handleCloseViewModal = () => setShowViewModal(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e) => {
        setFormData(prev => ({ ...prev, joiningDate: new Date(e.target.value) }));
    };

    const handleSubmit = async () => {
        const {
            fullName,
            departmentId,
            designationId,
            joiningDate,
            salaryType,
            baseSalary,
            bankAccount,
            ifscBranch,
            taxId,
            status
        } = formData;

        if (!fullName || !departmentId || !designationId || !joiningDate) {
            alert('Please fill all required fields.');
            return;
        }

        const payload = {
            full_name: fullName,
            department_id: parseInt(departmentId, 10),
            designation_id: parseInt(designationId, 10),
            joining_date: format(joiningDate, 'yyyy-MM-dd'),
            salary_type: salaryType,
            basic_salary: parseFloat(baseSalary),
            bank_account_number: bankAccount || '',
            ifsc_code: ifscBranch || '',
            tax_id: taxId || '',
            status: status
        };

        try {
            if (currentEmployee) {
                await axiosInstance.put(`employee/${currentEmployee.id}?company_id=${companyId}`, payload);
                alert('Employee updated successfully!');
            } else {
                await axiosInstance.post(`employee?company_id=${companyId}`, payload);
                alert('Employee created successfully!');
            }
            await fetchEmployees();
            handleCloseModal();
        } catch (err) {
            console.error('Save error:', err);
            alert('Operation failed. Please try again.');
        }
    };

    const handleViewEmployee = async (employee) => {
        try {
            const res = await axiosInstance.get(`employee/${employee.id}?company_id=${companyId}`);
            if (res?.data?.success) {
                const emp = res.data.data;
                setViewEmployee({
                    id: emp.id,
                    employeeCode: emp.employee_code,
                    fullName: emp.full_name,
                    department: emp.department?.name || '—',
                    designation: emp.designation?.name || '—',
                    joiningDate: emp.joining_date,
                    salaryType: emp.salary_type,
                    baseSalary: emp.basic_salary,
                    bankAccount: emp.bank_account_number,
                    ifscBranch: emp.ifsc_code,
                    taxId: emp.tax_id,
                    status: emp.status
                });
                setShowViewModal(true);
            }
        } catch (err) {
            console.error('View employee error:', err);
            alert('Failed to load employee details.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        try {
            await axiosInstance.delete(`employee/${id}?company_id=${companyId}`);
            alert('Employee deleted successfully!');
            await fetchEmployees();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete employee.');
        }
    };

    const handleImportCSV = () => {
        alert('CSV Import will be implemented soon.');
    };

    const EmployeeCard = ({ employee }) => (
        <Card className="mb-3 border-0 shadow-sm" style={{ backgroundColor: '#e6f3f5' }}>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <Card.Title className="mb-1" style={{ color: '#023347' }}>{employee.fullName}</Card.Title>
                        <Card.Subtitle className="text-muted">{employee.employeeCode}</Card.Subtitle>
                    </div>
                    <Badge bg={employee.status === 'Active' ? 'success' : 'danger'} pill>
                        {employee.status}
                    </Badge>
                </div>
                <div className="mb-2"><span className="text-muted small">Department:</span> {employee.department}</div>
                <div className="mb-2"><span className="text-muted small">Designation:</span> {employee.designation}</div>
                <div className="mb-2"><span className="text-muted small">Joining Date:</span> {format(new Date(employee.joiningDate), 'MM/dd/yyyy')}</div>
                <div className="mb-3"><span className="text-muted small">Salary:</span> ${parseFloat(employee.baseSalary).toLocaleString()}</div>
                <div className="d-flex justify-content-end">
                    <Button variant="light" size="sm" className="me-2" style={{ color: '#023347', backgroundColor: '#e6f3f5' }} onClick={() => handleViewEmployee(employee)}><FaEye /></Button>
                    <Button variant="light" size="sm" className="me-2" style={{ color: '#023347', backgroundColor: '#e6f3f5' }} onClick={() => handleOpenModal(employee)}><FaEdit /></Button>
                    <Button variant="light" size="sm" style={{ color: '#dc3545', backgroundColor: '#e6f3f5' }} onClick={() => handleDelete(employee.id)}><FaTrash /></Button>
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <Container fluid className="py-4 px-3 px-md-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh' }}>
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                <h2 className="mb-3 mb-md-0" style={{ color: '#023347', fontWeight: '600' }}>Employee Management</h2>
                <div className="d-flex flex-column flex-sm-row gap-2">
                    <Button style={{ backgroundColor: '#023347', border: 'none' }} onClick={() => handleOpenModal()} className="d-flex align-items-center">
                        <FaPlus className="me-2" /> Add Employee
                    </Button>
                    <Button style={{ backgroundColor: '#2a8e9c', border: 'none' }} onClick={handleImportCSV} className="d-flex align-items-center">
                        <FaFileUpload className="me-2" /> Import CSV
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <Row className="mb-4">
                {[
                    { icon: <FaUsers />, title: 'Total Employees', value: stats.totalEmployees, bg: '#023347' },
                    { icon: <FaUser />, title: 'Active Employees', value: stats.activeEmployees, bg: '#2a8e9c' },
                    { icon: <FaUserSlash />, title: 'Inactive Employees', value: stats.inactiveEmployees, bg: '#dc3545' },
                    { icon: <FaMoneyBillWave />, title: 'Total Payroll', value: `$${stats.totalPayroll.toLocaleString()}`, bg: '#fd7e14' }
                ].map((item, i) => (
                    <Col xs={6} md={3} className="mb-3" key={i}>
                        <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#e6f3f5' }}>
                            <Card.Body className="d-flex align-items-center">
                                <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: item.bg, color: '#fff', width: '40px', height: '40px' }}>{item.icon}</div>
                                <div>
                                    <Card.Title as="h4" className="mb-0" style={{ color: '#023347' }}>{item.value}</Card.Title>
                                    <Card.Text className="text-muted mb-0 small">{item.title}</Card.Text>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Desktop Table */}
            <div className="d-none d-md-block">
                <Card className="border-0 shadow-sm" style={{ backgroundColor: '#e6f3f5' }}>
                    <Card.Body className="p-0">
                        <Table responsive hover className="mb-0">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Full Name</th>
                                    <th>Department</th>
                                    <th>Designation</th>
                                    <th>Joining Date</th>
                                    <th>Salary Type</th>
                                    <th>Base Salary</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => (
                                    <tr key={emp.id}>
                                        <td>{emp.employeeCode}</td>
                                        <td>{emp.fullName}</td>
                                        <td>{emp.department}</td>
                                        <td>{emp.designation}</td>
                                        <td>{format(new Date(emp.joiningDate), 'MM/dd/yyyy')}</td>
                                        <td>{emp.salaryType}</td>
                                        <td>${parseFloat(emp.baseSalary).toLocaleString()}</td>
                                        <td>
                                            <Badge bg={emp.status === 'Active' ? 'success' : 'danger'} pill>{emp.status}</Badge>
                                        </td>
                                        <td className="text-center">
                                            <Button variant="light" size="sm" className="me-1" style={{ color: '#023347', backgroundColor: '#e6f3f5' }} onClick={() => handleViewEmployee(emp)}><FaEye /></Button>
                                            <Button variant="light" size="sm" className="me-1" style={{ color: '#023347', backgroundColor: '#e6f3f5' }} onClick={() => handleOpenModal(emp)}><FaEdit /></Button>
                                            <Button variant="light" size="sm" style={{ color: '#dc3545', backgroundColor: '#e6f3f5' }} onClick={() => handleDelete(emp.id)}><FaTrash /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </div>

            {/* Mobile Cards */}
            <div className="d-md-none">
                {employees.map(emp => <EmployeeCard key={emp.id} employee={emp} />)}
            </div>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#fff' }}>
                    <Modal.Title>{currentEmployee ? 'Edit Employee' : 'Add New Employee'}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: '#f0f7f8' }}>
                    <Form>
                        <Row className="mb-3">
                            <Form.Group as={Col} controlId="fullName">
                                <Form.Label>Full Name *</Form.Label>
                                <Form.Control type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md={6} controlId="departmentId">
                                <Form.Label>Department *</Form.Label>
                                <Form.Select name="departmentId" value={formData.departmentId} onChange={handleInputChange} required>
                                    <option value="">Select</option>
                                    {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} controlId="designationId">
                                <Form.Label>Designation *</Form.Label>
                                <Form.Select name="designationId" value={formData.designationId} onChange={handleInputChange} required>
                                    <option value="">Select</option>
                                    {DESIGNATIONS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md={6} controlId="joiningDate">
                                <Form.Label>Joining Date *</Form.Label>
                                <Form.Control type="date" name="joiningDate" value={format(formData.joiningDate, 'yyyy-MM-dd')} onChange={handleDateChange} required />
                            </Form.Group>
                            <Form.Group as={Col} md={6} controlId="salaryType">
                                <Form.Label>Salary Type</Form.Label>
                                <Form.Select name="salaryType" value={formData.salaryType} onChange={handleInputChange}>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Hourly">Hourly</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md={6} controlId="baseSalary">
                                <Form.Label>Basic Salary *</Form.Label>
                                <Form.Control type="number" step="1" name="baseSalary" value={formData.baseSalary} onChange={handleInputChange} required />
                            </Form.Group>
                            <Form.Group as={Col} md={6} controlId="bankAccount">
                                <Form.Label>Bank Account Number</Form.Label>
                                <Form.Control type="text" name="bankAccount" value={formData.bankAccount} onChange={handleInputChange} />
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md={6} controlId="ifscBranch">
                                <Form.Label>IFSC / Branch</Form.Label>
                                <Form.Control type="text" name="ifscBranch" value={formData.ifscBranch} onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group as={Col} md={6} controlId="taxId">
                                <Form.Label>Tax ID (PAN/VAT)</Form.Label>
                                <Form.Control type="text" name="taxId" value={formData.taxId} onChange={handleInputChange} />
                            </Form.Group>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="switch"
                                label="Active Status"
                                checked={formData.status === 'Active'}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Inactive' }))}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: '#f0f7f8', border: 'none' }}>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button style={{ backgroundColor: '#023347', border: 'none' }} onClick={handleSubmit}>
                        {currentEmployee ? 'Update' : 'Add'} Employee
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Modal */}
            <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" centered>
                <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#fff' }}>
                    <Modal.Title>Employee Details</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: '#f0f7f8' }}>
                    {viewEmployee && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6} className="d-flex align-items-center mb-3">
                                    <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', backgroundColor: '#e6f3f5' }}>
                                        <FaUser size={30} style={{ color: '#023347' }} />
                                    </div>
                                    <div>
                                        <h4 className="mb-0" style={{ color: '#023347' }}>{viewEmployee.fullName}</h4>
                                        <Badge bg={viewEmployee.status === 'Active' ? 'success' : 'danger'} pill>{viewEmployee.status}</Badge>
                                    </div>
                                </Col>
                                <Col md={6} className="d-flex justify-content-md-end align-items-center">
                                    <div className="text-center p-3 me-2 rounded" style={{ minWidth: '100px', backgroundColor: '#e6f3f5' }}>
                                        <div className="text-muted small">Employee ID</div>
                                        <div className="fw-bold" style={{ color: '#023347' }}>{viewEmployee.employeeCode}</div>
                                    </div>
                                    <div className="text-center p-3 rounded" style={{ minWidth: '100px', backgroundColor: '#e6f3f5' }}>
                                        <div className="text-muted small">Salary</div>
                                        <div className="fw-bold" style={{ color: '#023347' }}>${parseFloat(viewEmployee.baseSalary).toLocaleString()}</div>
                                    </div>
                                </Col>
                            </Row>
                            <hr />
                            <Row>
                                <Col md={6}>
                                    <h5 className="mb-3" style={{ color: '#023347' }}>Employment</h5>
                                    <div className="mb-3 d-flex"><div className="me-3" style={{ color: '#2a8e9c' }}><FaBuilding /></div><div><div className="text-muted small">Department</div><div className="fw-bold">{viewEmployee.department}</div></div></div>
                                    <div className="mb-3 d-flex"><div className="me-3" style={{ color: '#2a8e9c' }}><FaBriefcase /></div><div><div className="text-muted small">Designation</div><div className="fw-bold">{viewEmployee.designation}</div></div></div>
                                    <div className="mb-3 d-flex"><div className="me-3" style={{ color: '#2a8e9c' }}><FaCalendarAlt /></div><div><div className="text-muted small">Joining Date</div><div className="fw-bold">{format(new Date(viewEmployee.joiningDate), 'MMMM dd, yyyy')}</div></div></div>
                                    <div className="mb-3 d-flex"><div className="me-3" style={{ color: '#2a8e9c' }}><FaDollarSign /></div><div><div className="text-muted small">Salary Type</div><div className="fw-bold">{viewEmployee.salaryType}</div></div></div>
                                </Col>
                                <Col md={6}>
                                    <h5 className="mb-3" style={{ color: '#023347' }}>Financial</h5>
                                    <div className="mb-3 d-flex"><div className="me-3" style={{ color: '#2a8e9c' }}><FaDollarSign /></div><div><div className="text-muted small">Base Salary</div><div className="fw-bold">${parseFloat(viewEmployee.baseSalary).toLocaleString()}</div></div></div>
                                    <div className="mb-3 d-flex"><div className="me-3" style={{ color: '#2a8e9c' }}><FaUniversity /></div><div><div className="text-muted small">Bank Account</div><div className="fw-bold">{viewEmployee.bankAccount}</div></div></div>
                                    <div className="mb-3 d-flex"><div className="me-3" style={{ color: '#2a8e9c' }}><FaInfoCircle /></div><div><div className="text-muted small">IFSC / Branch</div><div className="fw-bold">{viewEmployee.ifscBranch}</div></div></div>
                                    <div className="mb-3 d-flex"><div className="me-3" style={{ color: '#2a8e9c' }}><FaIdCard /></div><div><div className="text-muted small">Tax ID</div><div className="fw-bold">{viewEmployee.taxId}</div></div></div>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: '#f0f7f8', border: 'none' }}>
                    <Button variant="secondary" onClick={handleCloseViewModal}>Close</Button>
                    <Button style={{ backgroundColor: '#023347', border: 'none' }} onClick={() => {
                        handleCloseViewModal();
                        handleOpenModal(viewEmployee);
                    }}>Edit</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
=======
  const handleCloseModal = () => setShowModal(false);
  const handleCloseViewModal = () => setShowViewModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({ ...prev, joiningDate: new Date(e.target.value) }));
  };

  const handleSubmit = async () => {
    const {
      fullName,
      department,
      designation,
      joiningDate,
      salaryType,
      baseSalary,
      bankAccount,
      ifscBranch,
      taxId,
      status,
      employeeCode
    } = formData;

    if (!fullName || !department || !designation || !joiningDate || !employeeCode) {
      alert('Please fill all required fields.');
      return;
    }

    // Map names to IDs
    const department_id = DEPARTMENTS.indexOf(department) + 1;
    const designation_id = DESIGNATIONS.indexOf(designation) + 1;

    // Build payload — ALWAYS include employee_code
    const payload = {
      full_name: fullName,
      department_id,
      designation_id,
      joining_date: format(joiningDate, 'yyyy-MM-dd'),
      salary_type: salaryType,
      basic_salary: parseFloat(baseSalary),
      bank_account_number: bankAccount || '',
      ifsc_code: ifscBranch || '',
      tax_id: taxId || '',
      status: status,
      employee_code: employeeCode // 👈 required for both POST and PUT
    };

    try {
      if (currentEmployee) {
        await axiosInstance.put(`employee/${currentEmployee.id}?company_id=${companyId}`, payload);
        alert('Employee updated successfully!');
      } else {
        await axiosInstance.post(`employee?company_id=${companyId}`, payload);
        alert('Employee created successfully!');
      }
      await fetchEmployees();
      handleCloseModal();
    } catch (err) {
      console.error('API error:', err);
      alert('Operation failed. Please try again.');
    }
  };

  const handleViewEmployee = async (employee) => {
    try {
      const res = await axiosInstance.get(`employee/${employee.id}?company_id=${companyId}`);
      if (res?.data?.success) {
        const emp = res.data.data;
        setViewEmployee({
          id: emp.id,
          employeeCode: emp.employee_code,
          fullName: emp.full_name,
          department: emp.department?.name,
          designation: emp.designation?.name,
          joiningDate: emp.joining_date,
          salaryType: emp.salary_type,
          baseSalary: emp.basic_salary,
          bankAccount: emp.bank_account_number,
          ifscBranch: emp.ifsc_code,
          taxId: emp.tax_id,
          status: emp.status
        });
        setShowViewModal(true);
      }
    } catch (err) {
      console.error('View error:', err);
      alert('Failed to load employee.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axiosInstance.delete(`employee/${id}?company_id=${companyId}`);
      alert('Employee deleted successfully!');
      await fetchEmployees();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete employee.');
    }
  };

  const handleImportCSV = () => {
    alert('CSV Import will be implemented soon.');
  };

  const EmployeeCard = ({ employee }) => (
    <Card className="mb-3 border-0 shadow-sm" style={{ backgroundColor: '#e6f3f5' }}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Card.Title className="mb-1" style={{ color: '#023347' }}>{employee.fullName}</Card.Title>
            <Card.Subtitle className="text-muted">{employee.employeeCode}</Card.Subtitle>
          </div>
          <Badge bg={employee.status === 'Active' ? 'success' : 'danger'} pill>
            {employee.status}
          </Badge>
        </div>
        <div className="mb-2"><span className="text-muted small">Department:</span> {employee.department}</div>
        <div className="mb-2"><span className="text-muted small">Designation:</span> {employee.designation}</div>
        <div className="mb-2"><span className="text-muted small">Joining Date:</span> {format(new Date(employee.joiningDate), 'MM/dd/yyyy')}</div>
        <div className="mb-3"><span className="text-muted small">Salary:</span> ${parseFloat(employee.baseSalary).toLocaleString()}</div>
        <div className="d-flex justify-content-end">
          <Button variant="light" size="sm" className="me-2" style={{ color: '#023347', backgroundColor: '#e6f3f5' }} onClick={() => handleViewEmployee(employee)}><FaEye /></Button>
          <Button variant="light" size="sm" className="me-2" style={{ color: '#023347', backgroundColor: '#e6f3f5' }} onClick={() => handleOpenModal(employee)}><FaEdit /></Button>
          <Button variant="light" size="sm" style={{ color: '#dc3545', backgroundColor: '#e6f3f5' }} onClick={() => handleDelete(employee.id)}><FaTrash /></Button>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="py-4 px-3 px-md-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh' }}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h2 className="mb-3 mb-md-0" style={{ color: '#023347', fontWeight: '600' }}>Employee Management</h2>
        <div className="d-flex flex-column flex-sm-row gap-2">
          <Button style={{ backgroundColor: '#023347', border: 'none' }} onClick={() => handleOpenModal()} className="d-flex align-items-center">
            <FaPlus className="me-2" /> Add Employee
          </Button>
          <Button style={{ backgroundColor: '#2a8e9c', border: 'none' }} onClick={handleImportCSV} className="d-flex align-items-center">
            <FaFileUpload className="me-2" /> Import CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Row className="mb-4">
        {[
          { icon: <FaUsers />, title: 'Total Employees', value: stats.totalEmployees, bg: '#023347' },
          { icon: <FaUser />, title: 'Active Employees', value: stats.activeEmployees, bg: '#2a8e9c' },
          { icon: <FaUserSlash />, title: 'Inactive Employees', value: stats.inactiveEmployees, bg: '#dc3545' },
          { icon: <FaMoneyBillWave />, title: 'Total Payroll', value: `$${stats.totalPayroll.toLocaleString()}`, bg: '#fd7e14' }
        ].map((item, i) => (
          <Col xs={6} md={3} className="mb-3" key={i}>
            <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#e6f3f5' }}>
              <Card.Body className="d-flex align-items-center">
                <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: item.bg, color: '#fff', width: '40px', height: '40px' }}>{item.icon}</div>
                <div>
                  <Card.Title as="h4" className="mb-0" style={{ color: '#023347' }}>{item.value}</Card.Title>
                  <Card.Text className="text-muted mb-0 small">{item.title}</Card.Text>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Desktop Table */}
      <div className="d-none d-md-block">
        <Card className="border-0 shadow-sm" style={{ backgroundColor: '#e6f3f5' }}>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Joining Date</th>
                  <th>Salary Type</th>
                  <th>Base Salary</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.employeeCode}</td>
                    <td>{emp.fullName}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>{format(new Date(emp.joiningDate), 'MM/dd/yyyy')}</td>
                    <td>{emp.salaryType}</td>
                    <td>${parseFloat(emp.baseSalary).toLocaleString()}</td>
                    <td>
                      <Badge bg={emp.status === 'Active' ? 'success' : 'danger'} pill>{emp.status}</Badge>
                    </td>
                    <td className="text-center">
                      <Button variant="light" size="sm" className="me-1" style={{ color: '#023347', backgroundColor: '#e6f3f5' }} onClick={() => handleViewEmployee(emp)}><FaEye /></Button>
                      <Button variant="light" size="sm" className="me-1" style={{ color: '#023347', backgroundColor: '#e6f3f5' }} onClick={() => handleOpenModal(emp)}><FaEdit /></Button>
                      <Button variant="light" size="sm" style={{ color: '#dc3545', backgroundColor: '#e6f3f5' }} onClick={() => handleDelete(emp.id)}><FaTrash /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="d-md-none">
        {employees.map(emp => <EmployeeCard key={emp.id} employee={emp} />)}
      </div>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#fff' }}>
          <Modal.Title>{currentEmployee ? 'Edit Employee' : 'Add New Employee'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#f0f7f8' }}>
          <Form>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="employeeCode">
                <Form.Label>Employee Code *</Form.Label>
                <Form.Control
                  type="text"
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleInputChange}
                  required
                  disabled={!currentEmployee} // Auto on create → disable; editable on edit
                />
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="fullName">
                <Form.Label>Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="department">
                <Form.Label>Department *</Form.Label>
                <Form.Select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  {DEPARTMENTS.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="designation">
                <Form.Label>Designation *</Form.Label>
                <Form.Select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  {DESIGNATIONS.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="joiningDate">
                <Form.Label>Joining Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="joiningDate"
                  value={format(formData.joiningDate, 'yyyy-MM-dd')}
                  onChange={handleDateChange}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="salaryType">
                <Form.Label>Salary Type</Form.Label>
                <Form.Select
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleInputChange}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Hourly">Hourly</option>
                </Form.Select>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="baseSalary">
                <Form.Label>Basic Salary *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="baseSalary"
                  value={formData.baseSalary}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="bankAccount">
                <Form.Label>Bank Account Number</Form.Label>
                <Form.Control
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="ifscBranch">
                <Form.Label>IFSC / Branch</Form.Label>
                <Form.Control
                  type="text"
                  name="ifscBranch"
                  value={formData.ifscBranch}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="taxId">
                <Form.Label>Tax ID (PAN/VAT)</Form.Label>
                <Form.Control
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Row>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Active Status"
                checked={formData.status === 'Active'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.checked ? 'Active' : 'Inactive'
                  }))
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#f0f7f8', border: 'none' }}>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button style={{ backgroundColor: '#023347', border: 'none' }} onClick={handleSubmit}>
            {currentEmployee ? 'Update' : 'Add'} Employee
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#fff' }}>
          <Modal.Title>Employee Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#f0f7f8' }}>
          {viewEmployee && (
            <div>
              <Row className="mb-3">
                <Col md={6} className="d-flex align-items-center mb-3">
                  <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', backgroundColor: '#e6f3f5' }}>
                    <FaUser size={30} style={{ color: '#023347' }} />
                  </div>
                  <div>
                    <h4 className="mb-0" style={{ color: '#023347' }}>{viewEmployee.fullName}</h4>
                    <Badge bg={viewEmployee.status === 'Active' ? 'success' : 'danger'} pill>
                      {viewEmployee.status}
                    </Badge>
                  </div>
                </Col>
                <Col md={6} className="d-flex justify-content-md-end align-items-center">
                  <div className="text-center p-3 me-2 rounded" style={{ minWidth: '100px', backgroundColor: '#e6f3f5' }}>
                    <div className="text-muted small">Employee ID</div>
                    <div className="fw-bold" style={{ color: '#023347' }}>{viewEmployee.employeeCode}</div>
                  </div>
                  <div className="text-center p-3 rounded" style={{ minWidth: '100px', backgroundColor: '#e6f3f5' }}>
                    <div className="text-muted small">Salary</div>
                    <div className="fw-bold" style={{ color: '#023347' }}>${parseFloat(viewEmployee.baseSalary).toLocaleString()}</div>
                  </div>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col md={6}>
                  <h5 className="mb-3" style={{ color: '#023347' }}>Employment</h5>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#2a8e9c' }}><FaBuilding /></div>
                    <div>
                      <div className="text-muted small">Department</div>
                      <div className="fw-bold">{viewEmployee.department}</div>
                    </div>
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#2a8e9c' }}><FaBriefcase /></div>
                    <div>
                      <div className="text-muted small">Designation</div>
                      <div className="fw-bold">{viewEmployee.designation}</div>
                    </div>
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#2a8e9c' }}><FaCalendarAlt /></div>
                    <div>
                      <div className="text-muted small">Joining Date</div>
                      <div className="fw-bold">{format(new Date(viewEmployee.joiningDate), 'MMMM dd, yyyy')}</div>
                    </div>
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#2a8e9c' }}><FaDollarSign /></div>
                    <div>
                      <div className="text-muted small">Salary Type</div>
                      <div className="fw-bold">{viewEmployee.salaryType}</div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <h5 className="mb-3" style={{ color: '#023347' }}>Financial</h5>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#2a8e9c' }}><FaDollarSign /></div>
                    <div>
                      <div className="text-muted small">Base Salary</div>
                      <div className="fw-bold">${parseFloat(viewEmployee.baseSalary).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#2a8e9c' }}><FaUniversity /></div>
                    <div>
                      <div className="text-muted small">Bank Account</div>
                      <div className="fw-bold">{viewEmployee.bankAccount}</div>
                    </div>
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#2a8e9c' }}><FaInfoCircle /></div>
                    <div>
                      <div className="text-muted small">IFSC / Branch</div>
                      <div className="fw-bold">{viewEmployee.ifscBranch}</div>
                    </div>
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#2a8e9c' }}><FaIdCard /></div>
                    <div>
                      <div className="text-muted small">Tax ID</div>
                      <div className="fw-bold">{viewEmployee.taxId}</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#f0f7f8', border: 'none' }}>
          <Button variant="secondary" onClick={handleCloseViewModal}>Close</Button>
          <Button
            style={{ backgroundColor: '#023347', border: 'none' }}
            onClick={() => {
              handleCloseViewModal();
              handleOpenModal(viewEmployee);
            }}
          >
            Edit
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
>>>>>>> 83015b75a7b7818a0d7346c667569f4b5b71995f
};

export default EmployeeManagement;