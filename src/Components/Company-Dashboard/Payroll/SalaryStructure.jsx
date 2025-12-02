import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Form, InputGroup, FormControl,
    DropdownButton, Dropdown, Badge, Row, Col, Card, Container
} from 'react-bootstrap';
import {
    FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
    FaMoneyBillWave, FaPercentage, FaUserAlt, FaChevronDown, FaChevronUp
} from 'react-icons/fa';

const SalaryStructure = () => {
    const [structures, setStructures] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingComponent, setEditingComponent] = useState(null);
    const [selectedStructure, setSelectedStructure] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [expandedStructureId, setExpandedStructureId] = useState(null);

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
        <Card className="mb-3" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <Card.Title className="h6 mb-1" style={{ color: '#023347' }}>
                            <Badge bg={component.type === 'Earning' ? 'success' : 'danger'} className="me-2">
                                {component.type}
                            </Badge>
                            {component.name}
                        </Card.Title>
                        <Card.Text className="mb-1">
                            <strong>Value:</strong> {component.value}
                        </Card.Text>
                        <Card.Text className="mb-0">
                            <strong>Taxable:</strong> {component.taxable ? 'Yes' : 'No'}
                        </Card.Text>
                    </div>
                    <div className="d-flex">
                        <Button
                            variant="light"
                            size="sm"
                            onClick={() => showModalHandler(component, structureId)}
                            className="me-2"
                            style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                        >
                            <FaEdit />
                        </Button>
                        <Button
                            variant="light"
                            size="sm"
                            onClick={() => deleteComponent(structureId, component.id)}
                            style={{ color: '#dc3545', backgroundColor: '#e6f3f5' }}
                        >
                            <FaTrash />
                        </Button>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <Container fluid className="salary-structure-container p-3 p-md-4" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh' }}>
            <h2 className="mb-3 mb-md-4" style={{ color: '#023347' }}>Salary Structure Management</h2>
            
            <Card className="mb-4" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
                <Card.Body>
                    <Row className="mb-4">
                        <Col xs={12} md={8} lg={6} className="ms-auto">
                            <div className="d-flex flex-column flex-md-row">
                                <DropdownButton
                                    variant="outline-primary"
                                    title={selectedStructure ?
                                        structures.find(s => s.id === selectedStructure)?.name || 'Select Structure'
                                        : 'Select Structure'}
                                    id="structure-dropdown"
                                    onSelect={(e) => setSelectedStructure(e)}
                                    className="mb-2 mb-md-0 me-md-2 w-100 w-md-auto"
                                    style={{ borderColor: '#023347', color: '#023347' }}
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
                                    className="mb-2 mb-md-0 me-md-2 w-100 w-md-auto"
                                    style={{ borderColor: '#2a8e9c', color: '#2a8e9c' }}
                                >
                                    {employees.map(employee => (
                                        <Dropdown.Item key={employee.id} eventKey={employee.id}>
                                            {employee.name}
                                        </Dropdown.Item>
                                    ))}
                                </DropdownButton>

                                <Button
                                    style={{ backgroundColor: '#023347', border: 'none' }}
                                    onClick={assignStructureToEmployee}
                                    className="d-flex align-items-center justify-content-center w-100 w-md-auto"
                                >
                                    <FaUserAlt className="me-2" /> Assign
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    {/* Desktop Table View */}
                    <div className="d-none d-md-block">
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Structure ID</th>
                                    <th>Structure Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {structures.map(structure => (
                                    <React.Fragment key={structure.id}>
                                        <tr>
                                            <td>{structure.id}</td>
                                            <td>{structure.name}</td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => showModalHandler(null, structure.id)}
                                                    style={{ borderColor: '#023347', color: '#023347' }}
                                                >
                                                    Add Component
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="ms-2"
                                                    onClick={() => toggleExpandStructure(structure.id)}
                                                    style={{ borderColor: '#2a8e9c', color: '#2a8e9c' }}
                                                >
                                                    {expandedStructureId === structure.id ? 'Hide' : 'View'} Components
                                                </Button>
                                            </td>
                                        </tr>

                                        {expandedStructureId === structure.id && (
                                            <tr>
                                                <td colSpan={3} className="p-0">
                                                    <div className="p-3" style={{ backgroundColor: '#e6f3f5' }}>
                                                        <h5 className="mb-3" style={{ color: '#023347' }}>Components for {structure.name}</h5>
                                                        <Table striped bordered hover size="sm">
                                                            <thead style={{ backgroundColor: '#2a8e9c', color: '#ffffff' }}>
                                                                <tr>
                                                                    <th>Type</th>
                                                                    <th>Component Name</th>
                                                                    <th>Amount / %</th>
                                                                    <th>Taxable</th>
                                                                    <th>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {structure.components.map(component => (
                                                                    <tr key={component.id}>
                                                                        <td>
                                                                            <Badge bg={component.type === 'Earning' ? 'success' : 'danger'}>
                                                                                {component.type}
                                                                            </Badge>
                                                                        </td>
                                                                        <td>{component.name}</td>
                                                                        <td>{component.value}</td>
                                                                        <td>{component.taxable ? 'Yes' : 'No'}</td>
                                                                        <td>
                                                                            <Button
                                                                                variant="light"
                                                                                size="sm"
                                                                                onClick={() => showModalHandler(component, structure.id)}
                                                                                style={{ color: '#023347', backgroundColor: '#e6f3f5' }}
                                                                            >
                                                                                <FaEdit />
                                                                            </Button>
                                                                            <Button
                                                                                variant="light"
                                                                                size="sm"
                                                                                className="ms-2"
                                                                                onClick={() => deleteComponent(structure.id, component.id)}
                                                                                style={{ color: '#dc3545', backgroundColor: '#e6f3f5' }}
                                                                            >
                                                                                <FaTrash />
                                                                            </Button>
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
                    <div className="d-md-none">
                        {structures.map(structure => (
                            <Card key={structure.id} className="mb-3" style={{ backgroundColor: '#e6f3f5', border: 'none' }}>
                                <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: '#023347', color: '#ffffff' }}>
                                    <div>
                                        <h5 className="mb-0">{structure.name}</h5>
                                        <small>{structure.id}</small>
                                    </div>
                                    <div>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            onClick={() => showModalHandler(null, structure.id)}
                                            className="me-2"
                                            style={{ color: '#023347' }}
                                        >
                                            Add
                                        </Button>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            onClick={() => toggleExpandStructure(structure.id)}
                                            style={{ color: '#023347' }}
                                        >
                                            {expandedStructureId === structure.id ? <FaChevronUp /> : <FaChevronDown />}
                                        </Button>
                                    </div>
                                </Card.Header>
                                
                                {expandedStructureId === structure.id && (
                                    <Card.Body className="pt-0" style={{ backgroundColor: '#e6f3f5' }}>
                                        <h6 className="mt-3 mb-3" style={{ color: '#023347' }}>Components</h6>
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

            <Modal show={showModal} onHide={handleCloseModal} size="lg" fullscreen="sm-down">
                <Modal.Header closeButton style={{ backgroundColor: '#023347', color: '#ffffff' }}>
                    <Modal.Title>
                        {editingComponent ? "Edit Component" : "Add Component"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: '#f0f7f8' }}>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Component Name</Form.Label>
                            <FormControl
                                name="componentName"
                                value={formData.componentName}
                                onChange={handleInputChange}
                                placeholder="e.g., Basic, HRA, Bonus"
                                style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Component Type</Form.Label>
                                    <Form.Select
                                        name="type"
                                        value={formData.type}
                                        onChange={(e) => handleSelectChange('type', e.target.value)}
                                        style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                                    >
                                        <option value="Earning">Earning</option>
                                        <option value="Deduction">Deduction</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Calculation Type</Form.Label>
                                    <Form.Select
                                        name="calculationType"
                                        value={formData.calculationType}
                                        onChange={(e) => handleSelectChange('calculationType', e.target.value)}
                                        style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                                    >
                                        <option value="Fixed">Fixed</option>
                                        <option value="Percentage">Percentage</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                {formData.calculationType === 'Percentage' ? 'Percentage Value' : 'Amount'}
                            </Form.Label>
                            <InputGroup>
                                <FormControl
                                    name="value"
                                    type="number"
                                    value={formData.value}
                                    onChange={handleInputChange}
                                    placeholder={formData.calculationType === 'Percentage' ? 'Enter percentage' : 'Enter amount'}
                                    style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                                />
                                <InputGroup.Text style={{ backgroundColor: '#e6f3f5', border: '1px solid #ced4da' }}>
                                    {formData.calculationType === 'Percentage' ? <FaPercentage style={{ color: '#2a8e9c' }} /> : <FaMoneyBillWave style={{ color: '#2a8e9c' }} />}
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="taxable"
                                label="Taxable"
                                checked={formData.taxable}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Notes (optional)</Form.Label>
                            <FormControl
                                as="textarea"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                style={{ border: '1px solid #ced4da', borderRadius: '4px' }}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: '#f0f7f8', border: 'none' }}>
                    <Button 
                        variant="secondary" 
                        onClick={handleCloseModal} 
                        style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        style={{ backgroundColor: '#023347', border: 'none' }}
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