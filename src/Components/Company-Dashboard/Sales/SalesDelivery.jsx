
import React, { useState, useRef, useMemo } from 'react';
import { Table, Button, Badge, Form, Row, Col, InputGroup, Modal } from 'react-bootstrap'; // Added Modal
import { FaEye, FaDownload, FaTrash, FaUpload, FaFile, FaCalendarAlt, FaSearch } from 'react-icons/fa';
// Removed useNavigate

const initialDeliveries = [
  { 
    id: 1, 
    challanNo: 'DC-1001', 
    orderNo: 'SO-2045', 
    customer: 'Client A', 
    date: '20-07-2025', 
    items: 3, 
    status: 'Delivered', 
    amount: 15000,
    deliveryAddress: '123 Main St, City A',
    contactPerson: 'John Doe',
    contactPhone: '9876543210'
  },
  { 
    id: 2, 
    challanNo: 'DC-1002', 
    orderNo: 'SO-2046', 
    customer: 'Client B', 
    date: '21-07-2025', 
    items: 2, 
    status: 'Pending', 
    amount: 25000,
    deliveryAddress: '456 Park Ave, City B',
    contactPerson: 'Jane Smith',
    contactPhone: '8765432109'
  },
  // Added a few more entries for better testing
  { 
    id: 3, 
    challanNo: 'DC-1003', 
    orderNo: 'SO-2047', 
    customer: 'Client C', 
    date: '22-07-2025', 
    items: 5, 
    status: 'Delivered', 
    amount: 35000,
    deliveryAddress: '789 Broadway, City C',
    contactPerson: 'Bob Johnson',
    contactPhone: '7654321098'
  },
  { 
    id: 4, 
    challanNo: 'DC-1004', 
    orderNo: 'SO-2048', 
    customer: 'Client A', 
    date: '23-07-2025', 
    items: 1, 
    status: 'Pending', 
    amount: 10000,
    deliveryAddress: '123 Main St, City A',
    contactPerson: 'John Doe',
    contactPhone: '9876543210'
  },
  { 
    id: 5, 
    challanNo: 'DC-1005', 
    orderNo: 'SO-2049', 
    customer: 'Client D', 
    date: '24-07-2025', 
    items: 4, 
    status: 'Delivered', 
    amount: 45000,
    deliveryAddress: '321 Oak St, City D',
    contactPerson: 'Alice Williams',
    contactPhone: '6543210987'
  }
];

const getStatusBadge = (status) => {
  if (status === 'Delivered') return <Badge bg="success">Delivered</Badge>;
  if (status === 'Pending') return <Badge bg="warning" text="dark">Pending</Badge>;
  return <Badge bg="secondary">{status}</Badge>;
};

const SalesDelivery = () => {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  
  // State for view modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const fileInputRef = useRef();

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this delivery note?")) {
      setDeliveries(deliveries.filter(delivery => delivery.id !== id));
    }
  };

  const handleExportAll = () => {
    let csv = `Order No,Customer,Date,Items,Amount,Status\n`;
    deliveries.forEach(d => {
      csv += `${d.challanNo},${d.orderNo},${d.customer},${d.date},${d.items},${d.amount},${d.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "All-Delivery-Challans.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = (delivery) => {
    const csv = `Order No,Customer,Date,Items,Amount,Status\n${delivery.challanNo},${delivery.orderNo},${delivery.customer},${delivery.date},${delivery.items},${delivery.amount},${delivery.status}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${delivery.challanNo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle View action - open modal with selected delivery
  const handleView = (delivery) => {
    setSelectedDelivery(delivery);
    setShowViewModal(true);
  };

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(delivery => {
      const matchesSearch = 
        delivery.challanNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || delivery.status === statusFilter;
      const matchesCustomer = customerFilter === '' || delivery.customer === customerFilter;
      let matchesDate = true;
      if (dateFrom && dateTo) {
        const deliveryDate = new Date(delivery.date.split('-').reverse().join('-'));
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        matchesDate = deliveryDate >= fromDate && deliveryDate <= toDate;
      } else if (dateFrom) {
        const deliveryDate = new Date(delivery.date.split('-').reverse().join('-'));
        const fromDate = new Date(dateFrom);
        matchesDate = deliveryDate >= fromDate;
      } else if (dateTo) {
        const deliveryDate = new Date(delivery.date.split('-').reverse().join('-'));
        const toDate = new Date(dateTo);
        matchesDate = deliveryDate <= toDate;
      }
      let matchesAmount = true;
      if (amountMin && amountMax) {
        matchesAmount = delivery.amount >= parseFloat(amountMin) && delivery.amount <= parseFloat(amountMax);
      } else if (amountMin) {
        matchesAmount = delivery.amount >= parseFloat(amountMin);
      } else if (amountMax) {
        matchesAmount = delivery.amount <= parseFloat(amountMax);
      }
      return matchesSearch && matchesStatus && matchesCustomer && matchesDate && matchesAmount;
    });
  }, [deliveries, searchTerm, statusFilter, customerFilter, dateFrom, dateTo, amountMin, amountMax]);

  // Get unique customers for filter dropdown
  const uniqueCustomers = [...new Set(initialDeliveries.map(d => d.customer))];

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCustomerFilter('');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
  };

  return (
    <div className="p-4 my-4 px-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <h5 className="mb-0">Sales Deliveries</h5>
        <div className="d-flex gap-2">
          {/* Import button removed as fileInputRef was not being used in the original */}
          <Button className="rounded-pill px-4 d-flex align-items-center"
            style={{ backgroundColor: "#fd7e14", borderColor: "#fd7e14" }}
            onClick={handleExportAll}
          >
            <FaFile className="me-2" /> Export
          </Button>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="bg-light p-3 rounded mb-4">
        <Row className="g-3">
          {/* Search */}
          <Col md={3}>
            <InputGroup>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control 
                type="text" 
                placeholder="Search Challan/Order/Customer" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          {/* Customer Filter */}
          <Col md={2}>
            <Form.Select 
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            >
              <option value="">All Customers</option>
              {uniqueCustomers.map((customer, idx) => (
                <option key={idx} value={customer}>{customer}</option>
              ))}
            </Form.Select>
          </Col>
          {/* Status Filter */}
          <Col md={2}>
            <Form.Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Delivered">Delivered</option>
              <option value="Pending">Pending</option>
            </Form.Select>
          </Col>
          {/* Date From */}
          <Col md={2}>
            <InputGroup>
              <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
              <Form.Control 
                type="date" 
                placeholder="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </InputGroup>
          </Col>
          {/* Date To */}
          <Col md={2}>
            <InputGroup>
              <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
              <Form.Control 
                type="date" 
                placeholder="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </InputGroup>
          </Col>
          {/* Clear Filters */}
          <Col md={1}>
            <Button 
              variant="outline-secondary" 
              onClick={clearFilters}
              size="sm"
            >
              Clear
            </Button>
          </Col>
        </Row>
        {/* Amount Filters */}
        <Row className="g-3 mt-2">
          <Col md={2}>
            <Form.Control 
              type="number" 
              placeholder="Min Amount"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
            />
          </Col>
          <Col md={2}>
            <Form.Control 
              type="number" 
              placeholder="Max Amount"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
            />
          </Col>
        </Row>
      </div>
      
      <div className="table-responsive">
        <Table bordered hover className="align-middle text-center">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th> challan No</th>
              <th>Order No</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((delivery, idx) => (
                <tr key={delivery.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{delivery.challanNo}</strong></td>
                  <td>{delivery.orderNo}</td>
                  <td className="text-start">{delivery.customer}</td>
                  <td>{delivery.date}</td>
                  <td>{delivery.items}</td>
                  <td className="fw-bold">₹{delivery.amount.toLocaleString('en-IN')}</td>
                  <td>{getStatusBadge(delivery.status)}</td>
                  <td className="d-flex gap-2 justify-content-center">
                    {/* Changed onClick to handleView */}
                    <button 
                       className="btn outlin-info btn-sm  text-info"
                      onClick={() => handleView(delivery)} // Open modal instead of navigating
                      title="View Details"
                    >
                      <FaEye size={16} />
                    </button>
                    <button 
                      className="p-0 text-warning" 
                      onClick={() => handleDownload(delivery)}
                      title="Download"
                    >
                      <FaDownload size={16} />
                    </button>
                    <button 
                     className="btn outline-danger btn-sm text-danger" 
                      onClick={() => handleDelete(delivery.id)}
                      title="Delete"
                    >
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4">
                  No delivery challans found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      
      <div className="d-flex justify-content-between align-items-center mt-3">
        <span className="small text-muted">
          Showing 1 to {filteredDeliveries.length} of {filteredDeliveries.length} results
        </span>
        <ul className="pagination pagination-sm mb-0">
          <li className="page-item disabled"><button className="page-link">&laquo;</button></li>
          <li className="page-item active"><button className="page-link" style={{ backgroundColor: '#3daaaa', borderColor: '#3daaaa' }}>1</button></li>
          <li className="page-item"><button className="page-link">2</button></li>
          <li className="page-item"><button className="page-link">&raquo;</button></li>
        </ul>
      </div>

      {/* View Delivery Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Delivery Challan Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDelivery && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Challan No:</strong> {selectedDelivery.challanNo}</p>
                  <p><strong>Order No:</strong> {selectedDelivery.orderNo}</p>
                  <p><strong>Customer:</strong> {selectedDelivery.customer}</p>
                  <p><strong>Date:</strong> {selectedDelivery.date}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Items:</strong> {selectedDelivery.items}</p>
                  <p><strong>Amount:</strong> ₹{selectedDelivery.amount.toLocaleString('en-IN')}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedDelivery.status)}</p>
                </Col>
              </Row>
              
              <h6 className="mt-4 mb-3">Delivery Information</h6>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Delivery Address:</strong> {selectedDelivery.deliveryAddress}</p>
                  <p><strong>Contact Person:</strong> {selectedDelivery.contactPerson}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Contact Phone:</strong> {selectedDelivery.contactPhone}</p>
                </Col>
              </Row>
              
              <h6 className="mt-4 mb-3">Items in this Delivery</h6>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Unit Price (₹)</th>
                    <th>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Placeholder items - replace with actual item data if available */}
                  {[...Array(selectedDelivery.items)].map((_, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>Product {String.fromCharCode(65 + index)}</td>
                      <td>{index + 1}</td>
                      <td>₹{((selectedDelivery.amount / selectedDelivery.items) / (index + 1)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td>₹{(selectedDelivery.amount / selectedDelivery.items).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <div className="d-flex justify-content-end mt-3">
                <strong>Total Amount: ₹{selectedDelivery.amount.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleDownload(selectedDelivery)}>
            <FaDownload className="me-2" /> Download CSV
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SalesDelivery;
