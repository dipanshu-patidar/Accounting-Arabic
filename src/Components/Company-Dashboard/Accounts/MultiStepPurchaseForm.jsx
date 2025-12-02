import React, { useState, useRef } from 'react';
import { Tabs, Tab, Form, Button, Table, Row, Col } from 'react-bootstrap';
import html2pdf from 'html2pdf.js';
import 'bootstrap/dist/css/bootstrap.min.css';

const MultiStepPurchaseForm = () => {
  const [key, setKey] = useState('quotation');
  const formRef = useRef();

  const [formData, setFormData] = useState({
    quotation: {
      quotationNo: '',
      vendor: '',
      items: [{ name: '', qty: '', rate: '' }],
    },
    purchaseOrder: {
      quotationNo: '',
      orderNo: '',
      deliveryDate: '',
      items: [{ name: '', qty: '', rate: '' }],
    },
    invoice: {
      orderNo: '',
      invoiceNo: '',
      invoiceDate: '',
      items: [{ name: '', qty: '', rate: '' }],
    },
    payment: {
      invoiceNo: '',
      paymentDate: '',
      amount: '',
    },
  });

  const handleChange = (tab, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value },
    }));
  };

  const handleItemChange = (tab, index, field, value) => {
    const updatedItems = [...formData[tab].items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems },
    }));
  };

  const addItem = (tab) => {
    setFormData((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        items: [...prev[tab].items, { name: '', qty: '', rate: '' }],
      },
    }));
  };

  const removeItem = (tab, index) => {
    const updatedItems = [...formData[tab].items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems },
    }));
  };

  const handleDownloadPDF = () => {
    html2pdf().from(formRef.current).save('purchase-process.pdf');
  };

  const renderItemsTable = (tab) => (
    <Table striped bordered>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {formData[tab].items.map((item, idx) => (
          <tr key={idx}>
            <td>
              <Form.Control
                type="text"
                value={item.name}
                onChange={(e) =>
                  handleItemChange(tab, idx, 'name', e.target.value)
                }
              />
            </td>
            <td>
              <Form.Control
                type="number"
                value={item.qty}
                onChange={(e) =>
                  handleItemChange(tab, idx, 'qty', e.target.value)
                }
              />
            </td>
            <td>
              <Form.Control
                type="number"
                value={item.rate}
                onChange={(e) =>
                  handleItemChange(tab, idx, 'rate', e.target.value)
                }
              />
            </td>
            <td>
              <Button variant="danger" onClick={() => removeItem(tab, idx)} size="sm">
                Delete
              </Button>
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan="4" className="text-end">
            <Button size="sm" onClick={() => addItem(tab)}>
              + Add Product
            </Button>
          </td>
        </tr>
      </tbody>
    </Table>
  );

  // ✅ Render summary data from each tab
  const renderSummaryTable = () => (
    <div className="mt-5">
      <h5 className="mb-3">Summary View</h5>

      {/* QUOTATION */}
      <h6>Quotation</h6>
      <p><strong>Quotation No:</strong> {formData.quotation.quotationNo}</p>
      <p><strong>Vendor:</strong> {formData.quotation.vendor}</p>
      {renderSummaryItems(formData.quotation.items)}

      {/* PURCHASE ORDER */}
      <h6 className="mt-4">Purchase Order</h6>
      <p><strong>Order No:</strong> {formData.purchaseOrder.orderNo}</p>
      <p><strong>Delivery Date:</strong> {formData.purchaseOrder.deliveryDate}</p>
      {renderSummaryItems(formData.purchaseOrder.items)}

      {/* INVOICE */}
      <h6 className="mt-4">Invoice</h6>
      <p><strong>Invoice No:</strong> {formData.invoice.invoiceNo}</p>
      <p><strong>Invoice Date:</strong> {formData.invoice.invoiceDate}</p>
      {renderSummaryItems(formData.invoice.items)}

      {/* PAYMENT */}
      <h6 className="mt-4">Payment</h6>
      <p><strong>Payment Date:</strong> {formData.payment.paymentDate}</p>
      <p><strong>Amount:</strong> ₹{formData.payment.amount}</p>
    </div>
  );

  const renderSummaryItems = (items) => (
    <Table bordered size="sm">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Rate</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => (
          <tr key={idx}>
            <td>{item.name}</td>
            <td>{item.qty}</td>
            <td>{item.rate}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <div className="container mt-4" ref={formRef}>
      <h4 className="text-center mb-4">Purchase Workflow</h4>
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3" fill>

        {/* QUOTATION */}
        <Tab eventKey="quotation" title="Quotation">
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Quotation No</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.quotation.quotationNo}
                    onChange={(e) => handleChange('quotation', 'quotationNo', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Vendor</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.quotation.vendor}
                    onChange={(e) => handleChange('quotation', 'vendor', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            {renderItemsTable('quotation')}
            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  purchaseOrder: {
                    ...prev.purchaseOrder,
                    quotationNo: prev.quotation.quotationNo,
                  },
                }));
                setKey('purchaseOrder');
              }}>
                Save & Next
              </Button>
              <Button variant="danger">Drop</Button>
            </div>
          </Form>
        </Tab>

        {/* PURCHASE ORDER */}
        <Tab eventKey="purchaseOrder" title="Purchase Order">
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Linked Quotation No</Form.Label>
                  <Form.Control type="text" value={formData.purchaseOrder.quotationNo} readOnly />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Order No</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.purchaseOrder.orderNo}
                    onChange={(e) => handleChange('purchaseOrder', 'orderNo', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mt-2">
                <Form.Group>
                  <Form.Label>Delivery Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.purchaseOrder.deliveryDate}
                    onChange={(e) => handleChange('purchaseOrder', 'deliveryDate', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            {renderItemsTable('purchaseOrder')}
            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  invoice: {
                    ...prev.invoice,
                    orderNo: prev.purchaseOrder.orderNo,
                  },
                }));
                setKey('invoice');
              }}>
                Save & Next
              </Button>
              <Button variant="danger">Drop</Button>
            </div>
          </Form>
        </Tab>

        {/* INVOICE */}
        <Tab eventKey="invoice" title="Invoice">
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Linked Order No</Form.Label>
                  <Form.Control type="text" value={formData.invoice.orderNo} readOnly />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Invoice No</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.invoice.invoiceNo}
                    onChange={(e) => handleChange('invoice', 'invoiceNo', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mt-2">
                <Form.Group>
                  <Form.Label>Invoice Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.invoice.invoiceDate}
                    onChange={(e) => handleChange('invoice', 'invoiceDate', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            {renderItemsTable('invoice')}
            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  payment: {
                    ...prev.payment,
                    invoiceNo: prev.invoice.invoiceNo,
                  },
                }));
                setKey('payment');
              }}>
                Save & Next
              </Button>
              <Button variant="danger">Drop</Button>
            </div>
          </Form>
        </Tab>

        {/* PAYMENT */}
        <Tab eventKey="payment" title="Payment">
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Linked Invoice No</Form.Label>
                  <Form.Control type="text" value={formData.payment.invoiceNo} readOnly />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Payment Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.payment.paymentDate}
                    onChange={(e) => handleChange('payment', 'paymentDate', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mt-2">
                <Form.Group>
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.payment.amount}
                    onChange={(e) => handleChange('payment', 'amount', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-between">
              <Button variant="success">Submit</Button>
              <Button variant="primary" onClick={handleDownloadPDF}>
                Download PDF
              </Button>
            </div>
          </Form>
        </Tab>
      </Tabs>

      {/* ✅ Final Summary */}
      {renderSummaryTable()}
    </div>
  );
};

export default MultiStepPurchaseForm;
