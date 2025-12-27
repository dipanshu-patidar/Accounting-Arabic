import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Form, InputGroup, FormControl,
    DropdownButton, Dropdown, Badge, Row, Col, Card, Container
} from 'react-bootstrap';
import {
    FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
    FaMoneyBillWave, FaPercentage, FaUserAlt, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';
import './SalaryStructure.css';

const SalaryStructure = () => {
    const [structures, setStructures] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingComponent, setEditingComponent] = useState(null);
    const [selectedStructure, setSelectedStructure] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [expandedStructureId, setExpandedStructureId] = useState(null);
    const companyId = GetCompanyId();
    // Form state
    const [formData, setFormData] = useState({
        componentName: '',
        type: 'Earning',
        calculationType: 'Fixed',
        value: '',
        taxable: true,
        notes: ''
    });

    // Mock data for demonstration
    useEffect(() => {
        // Mock salary structures
        setStructures([
            {
                id: 'STR001',
                name: 'Standard Staff',
                components: [
                    { id: 'C001', type: 'Earning', name: 'Basic', calculationType: 'Percentage', value: '40%', taxable: true },
                    { id: 'C002', type: 'Earning', name: 'HRA', calculationType: 'Percentage', value: '20%', taxable: true },
                    { id: 'C003', type: 'Deduction', name: 'PF', calculationType: 'Percentage', value: '12%', taxable: false },
                ]
            },
            {
                id: 'STR002',
                name: 'Management',
                components: [
                    { id: 'C004', type: 'Earning', name: 'Basic', calculationType: 'Percentage', value: '50%', taxable: true },
                    { id: 'C005', type: 'Earning', name: 'HRA', calculationType: 'Percentage', value: '25%', taxable: true },
                    { id: 'C006', type: 'Earning', name: 'Bonus', calculationType: 'Fixed', value: '10000', taxable: true },
                ]
            }
        ]);

        // Mock employees
        setEmployees([
            { id: 'EMP001', name: 'John Doe' },
            { id: 'EMP002', name: 'Jane Smith' },
            { id: 'EMP003', name: 'Robert Johnson' },
        ]);
    }, []);

    const resetForm = () => {
        setFormData({
            componentName: '',
            type: 'Earning',
            calculationType: 'Fixed',
            value: '',
            taxable: true,
            notes: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSelectChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const showModalHandler = (component = null, structureId = null) => {
        setEditingComponent(component);
        setSelectedStructure(structureId);

        if (component) {
            setFormData({
                ...component,
                value: component.value.replace('%', '')
            });
        } else {
            resetForm();
        }

        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleSaveComponent = () => {
        const componentData = {
            ...formData,
            value: formData.calculationType === 'Percentage' ? `${formData.value}%` : formData.value
        };

        if (editingComponent) {
            // Update existing component
            const updatedStructures = structures.map(structure => {
                if (structure.id === selectedStructure) {
                    return {
                        ...structure,
                        components: structure.components.map(comp =>
                            comp.id === editingComponent.id ? { ...comp, ...componentData } : comp
                        )
                    };
                }
                return structure;
            });
            setStructures(updatedStructures);
            alert('Component updated successfully');
        } else {
            // Add new component
            const newComponent = {
                ...componentData,
                id: `C${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
            };

            const updatedStructures = structures.map(structure => {
                if (structure.id === selectedStructure) {
                    return {
                        ...structure,
                        components: [...structure.components, newComponent]
                    };
                }
                return structure;
            });
            setStructures(updatedStructures);
            alert('Component added successfully');
        }

        setShowModal(false);
        resetForm();
    };

    const deleteComponent = (structureId, componentId) => {
        if (window.confirm('Are you sure you want to delete this component?')) {
            const updatedStructures = structures.map(structure => {
                if (structure.id === structureId) {
                    return {
                        ...structure,
                        components: structure.components.filter(comp => comp.id !== componentId)
                    };
                }
                return structure;
            });
            setStructures(updatedStructures);
            alert('Component deleted successfully');
        }
    };

    const assignStructureToEmployee = () => {
        if (selectedStructure && selectedEmployee) {
            // In a real app, this would make an API call
            const employee = employees.find(e => e.id === selectedEmployee);
            alert(`Structure assigned to ${employee.name}`);
            setSelectedEmployee(null);
        } else {
            alert('Please select both a structure and an employee');
        }
    };

    const toggleExpandStructure = (structureId) => {
        setExpandedStructureId(expandedStructureId === structureId ? null : structureId);
    };

    // Mobile-friendly component card
    const ComponentCard = ({ component, structureId }) => (
        <div className="component-card">
            <div className="d-flex justify-content-between align-items-start">
                <div>
                    <div className="mb-2">
                        <span className={component.type === 'Earning' ? 'badge-earning' : 'badge-deduction'}>
                            {component.type}
                        </span>
                        <strong className="ms-2" style={{ color: '#495057' }}>{component.name}</strong>
                    </div>
                    <div className="mb-1">
                        <strong>Value:</strong> <span className="text-primary">{component.value}</span>
                    </div>
                    <div>
                        <strong>Taxable:</strong> {component.taxable ? <span className="text-success">Yes</span> : <span className="text-danger">No</span>}
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <Button
                        className="btn-action btn-edit"
                        onClick={() => showModalHandler(component, structureId)}
                        title="Edit"
                    >
                        <FaEdit />
                    </Button>
                    <Button
                        className="btn-action btn-delete"
                        onClick={() => deleteComponent(structureId, component.id)}
                        title="Delete"
                    >
                        <FaTrash />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <Container fluid className="p-4 salary-structure-container">
            {/* Header Section */}
            <div className="mb-4">
                <h3 className="salary-structure-title">
                    <i className="fas fa-money-bill-wave me-2"></i>
                    Salary Structure Management
                </h3>
                <p className="salary-structure-subtitle">Create and manage employee salary structures and components</p>
            </div>

            {/* Assign Structure Section */}
            <Card className="assign-section border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row>
                        <Col xs={12} md={10} lg={8} className="ms-auto">
                            <div className="d-flex flex-column flex-md-row gap-2">
                                <DropdownButton
                                    variant="outline-primary"
                                    title={selectedStructure ?
                                        structures.find(s => s.id === selectedStructure)?.name || 'Select Structure'
                                        : 'Select Structure'}
                                    id="structure-dropdown"
                                    onSelect={(e) => setSelectedStructure(e)}
                                    className="flex-fill"
                                >
                                    {structures.map(structure => (
                                        <Dropdown.Item key={structure.id} eventKey={structure.id}>
                                            {structure.name}
                                        </Dropdown.Item>
                                    ))}
                                </DropdownButton>

                                <DropdownButton
                                    variant="outline-secondary"
                                    title={selectedEmployee ?
                                        employees.find(e => e.id === selectedEmployee)?.name || 'Select Employee'
                                        : 'Select Employee'}
                                    id="employee-dropdown"
                                    onSelect={(e) => setSelectedEmployee(e)}
                                    className="flex-fill"
                                >
                                    {employees.map(employee => (
                                        <Dropdown.Item key={employee.id} eventKey={employee.id}>
                                            {employee.name}
                                        </Dropdown.Item>
                                    ))}
                                </DropdownButton>

                                <Button
                                    className="btn-assign d-flex align-items-center justify-content-center"
                                    onClick={assignStructureToEmployee}
                                >
                                    <FaUserAlt className="me-2" /> Assign
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Structures Table Card */}
            <Card className="structure-table-card border-0 shadow-lg">
                <Card.Body className="p-0">

                    {/* Desktop Table View */}
                    <div className="d-none d-md-block">
                        <Table hover responsive className="structure-table">
                            <thead className="table-header">
                                <tr>
                                    <th>Structure ID</th>
                                    <th>Structure Name</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {structures.map(structure => (
                                    <React.Fragment key={structure.id}>
                                        <tr>
                                            <td className="fw-semibold">{structure.id}</td>
                                            <td className="fw-semibold">{structure.name}</td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Button
                                                        className="btn-add-component"
                                                        size="sm"
                                                        onClick={() => showModalHandler(null, structure.id)}
                                                    >
                                                        <FaPlus className="me-1" /> Add Component
                                                    </Button>
                                                    <Button
                                                        className="btn-view-components"
                                                        size="sm"
                                                        onClick={() => toggleExpandStructure(structure.id)}
                                                    >
                                                        {expandedStructureId === structure.id ? <FaChevronUp className="me-1" /> : <FaChevronDown className="me-1" />}
                                                        {expandedStructureId === structure.id ? 'Hide' : 'View'} Components
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>

                                        {expandedStructureId === structure.id && (
                                            <tr>
                                                <td colSpan={3} className="p-0">
                                                    <div className="expanded-section">
                                                        <h5 className="mb-3 fw-bold" style={{ color: '#505ece' }}>Components for {structure.name}</h5>
                                                        <Table hover responsive size="sm" className="component-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Type</th>
                                                                    <th>Component Name</th>
                                                                    <th>Amount / %</th>
                                                                    <th>Taxable</th>
                                                                    <th className="text-center">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {structure.components.map(component => (
                                                                    <tr key={component.id}>
                                                                        <td>
                                                                            <span className={component.type === 'Earning' ? 'badge-earning' : 'badge-deduction'}>
                                                                                {component.type}
                                                                            </span>
                                                                        </td>
                                                                        <td className="fw-semibold">{component.name}</td>
                                                                        <td className="text-primary fw-semibold">{component.value}</td>
                                                                        <td>
                                                                            {component.taxable ? 
                                                                                <span className="text-success fw-semibold">Yes</span> : 
                                                                                <span className="text-danger fw-semibold">No</span>
                                                                            }
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <div className="d-flex justify-content-center gap-2">
                                                                                <Button
                                                                                    className="btn-action btn-edit"
                                                                                    onClick={() => showModalHandler(component, structure.id)}
                                                                                    title="Edit"
                                                                                >
                                                                                    <FaEdit />
                                                                                </Button>
                                                                                <Button
                                                                                    className="btn-action btn-delete"
                                                                                    onClick={() => deleteComponent(structure.id, component.id)}
                                                                                    title="Delete"
                                                                                >
                                                                                    <FaTrash />
                                                                                </Button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="d-md-none p-3">
                        {structures.map(structure => (
                            <Card key={structure.id} className="mobile-card">
                                <Card.Header className="mobile-card-header d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-0 fw-bold">{structure.name}</h5>
                                        <small className="opacity-75">{structure.id}</small>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Button
                                            className="btn-add-component"
                                            size="sm"
                                            onClick={() => showModalHandler(null, structure.id)}
                                        >
                                            <FaPlus className="me-1" /> Add
                                        </Button>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            onClick={() => toggleExpandStructure(structure.id)}
                                            style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}
                                        >
                                            {expandedStructureId === structure.id ? <FaChevronUp /> : <FaChevronDown />}
                                        </Button>
                                    </div>
                                </Card.Header>

                                {expandedStructureId === structure.id && (
                                    <Card.Body className="mobile-card-body">
                                        <h6 className="mt-2 mb-3 fw-bold" style={{ color: '#505ece' }}>Components</h6>
                                        {structure.components.map(component => (
                                            <ComponentCard
                                                key={component.id}
                                                component={component}
                                                structureId={structure.id}
                                            />
                                        ))}
                                    </Card.Body>
                                )}
                            </Card>
                        ))}
                    </div>
                </Card.Body>
            </Card>

            <Modal 
                show={showModal} 
                onHide={handleCloseModal} 
                size="lg" 
                fullscreen="sm-down"
                centered
                className="salary-structure-modal"
            >
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>
                        {editingComponent ? "Edit Component" : "Add Component"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">Component Name</Form.Label>
                            <FormControl
                                name="componentName"
                                value={formData.componentName}
                                onChange={handleInputChange}
                                placeholder="e.g., Basic, HRA, Bonus"
                                className="form-control-custom"
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label-custom">Component Type</Form.Label>
                                    <Form.Select
                                        name="type"
                                        value={formData.type}
                                        onChange={(e) => handleSelectChange('type', e.target.value)}
                                        className="form-select-custom"
                                    >
                                        <option value="Earning">Earning</option>
                                        <option value="Deduction">Deduction</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label-custom">Calculation Type</Form.Label>
                                    <Form.Select
                                        name="calculationType"
                                        value={formData.calculationType}
                                        onChange={(e) => handleSelectChange('calculationType', e.target.value)}
                                        className="form-select-custom"
                                    >
                                        <option value="Fixed">Fixed</option>
                                        <option value="Percentage">Percentage</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                                {formData.calculationType === 'Percentage' ? 'Percentage Value' : 'Amount'}
                            </Form.Label>
                            <InputGroup className="input-group-custom">
                                <FormControl
                                    name="value"
                                    type="number"
                                    value={formData.value}
                                    onChange={handleInputChange}
                                    placeholder={formData.calculationType === 'Percentage' ? 'Enter percentage' : 'Enter amount'}
                                    className="form-control-custom"
                                    style={{ borderRight: 'none' }}
                                />
                                <InputGroup.Text>
                                    {formData.calculationType === 'Percentage' ? 
                                        <FaPercentage style={{ color: '#505ece' }} /> : 
                                        <FaMoneyBillWave style={{ color: '#505ece' }} />
                                    }
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="taxable"
                                label={<span className="fw-semibold">Taxable</span>}
                                checked={formData.taxable}
                                onChange={handleInputChange}
                                style={{ fontSize: '0.95rem' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">Notes (optional)</Form.Label>
                            <FormControl
                                as="textarea"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                className="form-control-custom"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <Button
                        className="btn-modal-cancel"
                        onClick={handleCloseModal}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="btn-modal-save"
                        onClick={handleSaveComponent}
                    >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default SalaryStructure;