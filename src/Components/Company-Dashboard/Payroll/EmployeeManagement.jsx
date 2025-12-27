import React, { useState, useEffect, useRef } from 'react';
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
  FaBuilding,
  FaBriefcase,
  FaCalendarAlt,
  FaDollarSign,
  FaUniversity,
  FaInfoCircle,
  FaIdCard
} from 'react-icons/fa';
import { format } from 'date-fns';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';
import './EmployeeManagement.css';

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

  // Modal cleanup refs (same pattern as Users.jsx)
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ main: 0, view: 0 });

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
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.main += 1;
    
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
        employeeCode: newCode // 👈 auto-generate for new
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setShowModal(false);
    
    // Force modal remount on next open
    modalKeyRef.current.main += 1;
  };
  
  // Handle modal exit - cleanup after animation
  const handleModalExited = () => {
    // Reset form state after modal fully closed
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
      status: 'Active',
      employeeCode: ''
    });
    isCleaningUpRef.current = false;
  };
  
  const handleCloseViewModal = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Close modal immediately
    setShowViewModal(false);
    
    // Force modal remount on next open
    modalKeyRef.current.view += 1;
  };
  
  // Handle view modal exit - cleanup after animation
  const handleViewModalExited = () => {
    // Reset view employee after modal fully closed
    setViewEmployee(null);
    isCleaningUpRef.current = false;
  };

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
      // Reset cleanup flag before closing
      isCleaningUpRef.current = false;
      handleCloseModal();
    } catch (err) {
      console.error('API error:', err);
      alert('Operation failed. Please try again.');
    }
  };

  const handleViewEmployee = async (employee) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Force modal remount
    modalKeyRef.current.view += 1;
    
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
    <Card className="mobile-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Card.Title className="mb-1" style={{ color: '#505ece' }}>{employee.fullName}</Card.Title>
            <Card.Subtitle className="text-muted">{employee.employeeCode}</Card.Subtitle>
          </div>
          <Badge className={employee.status === 'Active' ? 'badge-status badge-active' : 'badge-status badge-inactive'}>
            {employee.status}
          </Badge>
        </div>
        <div className="mb-2"><span className="text-muted small">Department:</span> {employee.department}</div>
        <div className="mb-2"><span className="text-muted small">Designation:</span> {employee.designation}</div>
        <div className="mb-2"><span className="text-muted small">Joining Date:</span> {format(new Date(employee.joiningDate), 'MM/dd/yyyy')}</div>
        <div className="mb-3"><span className="text-muted small">Salary:</span> ${parseFloat(employee.baseSalary).toLocaleString()}</div>
        <div className="d-flex justify-content-end gap-2">
          <Button className="btn-action btn-view" onClick={() => handleViewEmployee(employee)} title="View"><FaEye /></Button>
          <Button className="btn-action btn-edit" onClick={() => handleOpenModal(employee)} title="Edit"><FaEdit /></Button>
          <Button className="btn-action btn-delete" onClick={() => handleDelete(employee.id)} title="Delete"><FaTrash /></Button>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="p-4 employee-management-container">
      {/* Header Section */}
      <div className="mb-4">
        <Row className="align-items-center">
          <Col xs={12} md={8}>
            <h3 className="employee-management-title">
              <i className="fas fa-users me-2"></i>
              Employee Management
            </h3>
            <p className="employee-management-subtitle">Manage employee information, departments, and payroll details</p>
          </Col>
          <Col xs={12} md={4} className="d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
            <Button className="btn-add-employee d-flex align-items-center" onClick={() => handleOpenModal()}>
              <FaPlus className="me-2" /> Add Employee
            </Button>
            <Button className="btn-import-csv d-flex align-items-center" onClick={handleImportCSV}>
              <FaFileUpload className="me-2" /> Import CSV
            </Button>
          </Col>
        </Row>
      </div>

      {/* Stats */}
      <Row className="mb-4">
        {[
          { icon: <FaUsers />, title: 'Total Employees', value: stats.totalEmployees, bg: '#505ece' },
          { icon: <FaUser />, title: 'Active Employees', value: stats.activeEmployees, bg: '#28a745' },
          { icon: <FaUserSlash />, title: 'Inactive Employees', value: stats.inactiveEmployees, bg: '#dc3545' },
          { icon: <FaMoneyBillWave />, title: 'Total Payroll', value: `$${stats.totalPayroll.toLocaleString()}`, bg: '#fd7e14' }
        ].map((item, i) => (
          <Col xs={6} md={3} className="mb-3" key={i}>
            <Card className="stats-card">
              <Card.Body className="d-flex align-items-center">
                <div className="stats-icon me-3" style={{ backgroundColor: item.bg }}>{item.icon}</div>
                <div>
                  <div className="stats-value">{item.value}</div>
                  <div className="stats-label">{item.title}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Desktop Table */}
      <div className="d-none d-md-block">
        <Card className="employee-table-card">
          <Card.Body className="p-0">
            <Table responsive hover className="employee-table mb-0">
              <thead className="table-header">
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
                    <td className="fw-bold">{emp.employeeCode}</td>
                    <td>{emp.fullName}</td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>{format(new Date(emp.joiningDate), 'MM/dd/yyyy')}</td>
                    <td>{emp.salaryType}</td>
                    <td className="fw-semibold">${parseFloat(emp.baseSalary).toLocaleString()}</td>
                    <td>
                      <Badge className={emp.status === 'Active' ? 'badge-status badge-active' : 'badge-status badge-inactive'}>
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button className="btn-action btn-view" onClick={() => handleViewEmployee(emp)} title="View"><FaEye /></Button>
                        <Button className="btn-action btn-edit" onClick={() => handleOpenModal(emp)} title="Edit"><FaEdit /></Button>
                        <Button className="btn-action btn-delete" onClick={() => handleDelete(emp.id)} title="Delete"><FaTrash /></Button>
                      </div>
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
      <Modal 
        key={modalKeyRef.current.main}
        show={showModal} 
        onHide={handleCloseModal}
        onExited={handleModalExited}
        size="lg" 
        centered
        className="employee-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>{currentEmployee ? 'Edit Employee' : 'Add New Employee'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Form>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="employeeCode">
                <Form.Label className="form-label-custom">Employee Code *</Form.Label>
                <Form.Control
                  type="text"
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                  disabled={!currentEmployee}
                />
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="fullName">
                <Form.Label className="form-label-custom">Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="department">
                <Form.Label className="form-label-custom">Department *</Form.Label>
                <Form.Select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="form-select-custom"
                >
                  <option value="">Select</option>
                  {DEPARTMENTS.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="designation">
                <Form.Label className="form-label-custom">Designation *</Form.Label>
                <Form.Select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                  className="form-select-custom"
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
                <Form.Label className="form-label-custom">Joining Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="joiningDate"
                  value={format(formData.joiningDate, 'yyyy-MM-dd')}
                  onChange={handleDateChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="salaryType">
                <Form.Label className="form-label-custom">Salary Type</Form.Label>
                <Form.Select
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleInputChange}
                  className="form-select-custom"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Hourly">Hourly</option>
                </Form.Select>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="baseSalary">
                <Form.Label className="form-label-custom">Basic Salary *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="baseSalary"
                  value={formData.baseSalary}
                  onChange={handleInputChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="bankAccount">
                <Form.Label className="form-label-custom">Bank Account Number</Form.Label>
                <Form.Control
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  className="form-control-custom"
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} controlId="ifscBranch">
                <Form.Label className="form-label-custom">IFSC / Branch</Form.Label>
                <Form.Control
                  type="text"
                  name="ifscBranch"
                  value={formData.ifscBranch}
                  onChange={handleInputChange}
                  className="form-control-custom"
                />
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="taxId">
                <Form.Label className="form-label-custom">Tax ID (PAN/VAT)</Form.Label>
                <Form.Control
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  className="form-control-custom"
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
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={handleCloseModal}>Cancel</Button>
          <Button className="btn-modal-save" onClick={handleSubmit}>
            {currentEmployee ? 'Update' : 'Add'} Employee
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal 
        key={modalKeyRef.current.view}
        show={showViewModal} 
        onHide={handleCloseViewModal}
        onExited={handleViewModalExited}
        size="lg" 
        centered
        className="employee-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Employee Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {viewEmployee && (
            <div>
              <Row className="mb-3">
                <Col md={6} className="d-flex align-items-center mb-3">
                  <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', backgroundColor: 'rgba(80, 94, 206, 0.1)' }}>
                    <FaUser size={30} style={{ color: '#505ece' }} />
                  </div>
                  <div>
                    <h4 className="mb-0" style={{ color: '#505ece' }}>{viewEmployee.fullName}</h4>
                    <Badge className={viewEmployee.status === 'Active' ? 'badge-status badge-active' : 'badge-status badge-inactive'}>
                      {viewEmployee.status}
                    </Badge>
                  </div>
                </Col>
                <Col md={6} className="d-flex justify-content-md-end align-items-center">
                  <div className="text-center p-3 me-2 rounded" style={{ minWidth: '100px', backgroundColor: '#f8f9fa', border: '2px solid #e9ecef' }}>
                    <div className="text-muted small">Employee ID</div>
                    <div className="fw-bold" style={{ color: '#505ece' }}>{viewEmployee.employeeCode}</div>
                  </div>
                  <div className="text-center p-3 rounded" style={{ minWidth: '100px', backgroundColor: '#f8f9fa', border: '2px solid #e9ecef' }}>
                    <div className="text-muted small">Salary</div>
                    <div className="fw-bold" style={{ color: '#505ece' }}>${parseFloat(viewEmployee.baseSalary).toLocaleString()}</div>
                  </div>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col md={6}>
                  <h5 className="mb-3" style={{ color: '#505ece' }}>Employment</h5>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#505ece' }}><FaBuilding /></div>
                    <div>
                      <div className="text-muted small">Department</div>
                      <div className="fw-bold">{viewEmployee.department}</div>
                    </div>
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#505ece' }}><FaBriefcase /></div>
                    <div>
                      <div className="text-muted small">Designation</div>
                      <div className="fw-bold">{viewEmployee.designation}</div>
                    </div>
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#505ece' }}><FaCalendarAlt /></div>
                    <div>
                      <div className="text-muted small">Joining Date</div>
                      <div className="fw-bold">{format(new Date(viewEmployee.joiningDate), 'MMMM dd, yyyy')}</div>
                    </div>
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#505ece' }}><FaDollarSign /></div>
                    <div>
                      <div className="text-muted small">Salary Type</div>
                      <div className="fw-bold">{viewEmployee.salaryType}</div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <h5 className="mb-3" style={{ color: '#505ece' }}>Financial</h5>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#505ece' }}><FaDollarSign /></div>
                    <div>
                      <div className="text-muted small">Base Salary</div>
                      <div className="fw-bold">${parseFloat(viewEmployee.baseSalary).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#505ece' }}><FaUniversity /></div>
                    <div>
                      <div className="text-muted small">Bank Account</div>
                      <div className="fw-bold">{viewEmployee.bankAccount}</div>
                    </div>
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#505ece' }}><FaInfoCircle /></div>
                    <div>
                      <div className="text-muted small">IFSC / Branch</div>
                      <div className="fw-bold">{viewEmployee.ifscBranch}</div>
                    </div>
                  </div>
                  <div className="mb-3 d-flex">
                    <div className="me-3" style={{ color: '#505ece' }}><FaIdCard /></div>
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
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-cancel" onClick={handleCloseViewModal}>Close</Button>
          <Button
            className="btn-modal-save"
            onClick={() => {
              handleCloseViewModal();
              setTimeout(() => {
                if (viewEmployee) {
                  const employeeForEdit = {
                    id: viewEmployee.id,
                    fullName: viewEmployee.fullName,
                    department: viewEmployee.department,
                    designation: viewEmployee.designation,
                    joiningDate: viewEmployee.joiningDate,
                    salaryType: viewEmployee.salaryType,
                    baseSalary: viewEmployee.baseSalary,
                    bankAccount: viewEmployee.bankAccount,
                    ifscBranch: viewEmployee.ifscBranch,
                    taxId: viewEmployee.taxId,
                    status: viewEmployee.status,
                    employeeCode: viewEmployee.employeeCode
                  };
                  handleOpenModal(employeeForEdit);
                }
              }, 100);
            }}
          >
            Edit
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeeManagement;