import React, { useState } from 'react';
import { Row, Col, Table, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit, FaPrint, FaEye, FaMoneyBill, FaPaperPlane,
  FaGlobe, FaExchangeAlt, FaTimes, FaCaretUp, FaLanguage,FaArrowLeft
} from 'react-icons/fa';

const ViewInvoicee = () => {
  const [languageMode, setLanguageMode] = useState('en');
  const navigate = useNavigate();
  const content = {
    title: ["Invoice", "فاتورة"],
    invoiceNo: ["Invoice# INV-1045", "فاتورة رقم INV-1045"],
    reference: ["Reference: #5478998", "المرجع:"],
    grossAmount: ["Gross Amount:", "المبلغ الإجمالي:"],
    billTo: ["Bill To", "فاتورة إلى"],
    invoiceDate: ["Invoice Date:", "تاريخ الفاتورة:"],
    dueDate: ["Due Date:", "تاريخ الاستحقاق:"],
    terms: ["Terms:", "الشروط:"],
    paymentStatus: ["Payment Status:", "حالة الدفع:"],
    paymentMethod: ["Payment Method:", "طريقة الدفع:"],
    note: ["Note:", "ملاحظة:"],
    subTotal: ["Sub Total", "المجموع الفرعي"],
    tax: ["TAX", "الضريبة"],
    shipping: ["Shipping", "الشحن"],
    total: ["Total", "المجموع"],
    paymentReceived: ["Payment Received", "المبلغ المستلم"],
    balanceDue: ["Balance Due", "الرصيد المستحق"],
    creditTransactions: ["Credit Transactions:", "معاملات الائتمان:"],
    termsConditions: ["Terms & Conditions", "الشروط والأحكام"],
    paymentTerms: ["Payment Due On Receipt", "الدفع عند الاستلام"],
    pricesPayment: ["1. Prices And Payment:", "1. الأسعار والدفع:"],
    paymentDetails: [
      "Payments are to be made in U.S. funds. Unless otherwise specified, all invoices are due net 30 days from shipment date.",
      "يجب أن تتم المدفوعات بالدولار الأمريكي. ما لم يُذكر خلاف ذلك، تكون جميع الفواتير مستحقة الدفع خلال 30 يومًا من تاريخ الشحن."
    ],
    publicAccess: ["Public Access URL:", "رابط الوصول العام:"],
    attachments: ["Attachments", "المرفقات"],
    selectFiles: ["Select files...", "اختر ملفات..."],
    allowedFiles: ["Allowed: gif, jpeg, png, docx, docs, txt, pdf, xls", "مسموح: gif, jpeg, png, docx, docs, txt, pdf, xls"],
    businessOwner: ["Business Owner", "صاحب العمل"],
    noTransactions: ["No transactions", "لا توجد معاملات"],
    tableHeaders: [
      ["#", "Product", "Price", "Qty", "Tax", "Discount", "Amount"],
      ["#", "الوصف", "السعر", "الكمية", "الضريبة", "الخصم", "المبلغ"]
    ],
    transactionHeaders: [
      ["Date", "Method", "Amount", "Note"],
      ["التاريخ", "الطريقة", "المبلغ", "ملاحظة"]
    ],
  };

  const getText = (key) => {
    const value = content[key];
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      if (languageMode === 'en') return value[0];
      if (languageMode === 'ar') return value[1];
      if (languageMode === 'both') return `${value[0]} | ${value[1]}`;
    }
    return '';
  };

  const currentHeaders = languageMode === 'ar' ? content.tableHeaders[1] : languageMode === 'both' ? content.tableHeaders[0].map((_, i) => `${content.tableHeaders[0][i]} | ${content.tableHeaders[1][i]}`) : content.tableHeaders[0];
  const currentTxnHeaders = languageMode === 'ar' ? content.transactionHeaders[1] : languageMode === 'both' ? content.transactionHeaders[0].map((_, i) => `${content.transactionHeaders[0][i]} | ${content.transactionHeaders[1][i]}`) : content.transactionHeaders[0];

  return (
    <div className={`mt-4 p-4 ${languageMode === 'ar' ? 'text-end' : 'text-start'}`} dir={languageMode === 'ar' ? 'rtl' : 'ltr'}>

      {/* Back Button */}
<div className="mb-3">
  <Button 
    variant="outline-secondary" 
    onClick={() => navigate('/company/Invoice')} 
    className="d-flex align-items-center gap-2"
    style={{ fontSize: '0.95rem', padding: '6px 12px' }}
  >
    <FaArrowLeft /> {languageMode === 'ar' ? 'العودة' : 'Back'}
  </Button>
</div>
      <Row className="mb-4">
        <Col md={12} className="d-flex flex-wrap gap-2">
          <Button variant={languageMode === 'en' ? 'primary' : 'outline-primary'} onClick={() => setLanguageMode('en')}><FaLanguage /> English</Button>
          <Button variant={languageMode === 'ar' ? 'primary' : 'outline-primary'} onClick={() => setLanguageMode('ar')}><FaLanguage /> العربية</Button>
          <Button variant={languageMode === 'both' ? 'primary' : 'outline-primary'} onClick={() => setLanguageMode('both')}><FaLanguage /> EN | AR</Button>

          <Button variant="warning"><FaEdit /> {getText('title')}</Button>
          <Button variant="success"><FaMoneyBill /> {getText('paymentReceived')}</Button>
          <Button variant="primary"><FaPaperPlane /> Send</Button>
          <Button variant="success"><FaPrint /> Print</Button>
          <Button variant="info"><FaGlobe /> Preview</Button>
          <Button variant="secondary"><FaExchangeAlt /> Status</Button>
          <Button variant="success"><FaEdit /> Delivery</Button>
          <Button variant="info"><FaEye /> Proforma</Button>
          <Button variant="secondary"><FaCaretUp /> Copy</Button>
          <Button variant="danger"><FaTimes /> Cancel</Button>
        </Col>
      </Row>

      <h5 className="fw-bold mb-1">{getText('title')}</h5>
      <div>{getText('invoiceNo')}</div>
      <div>{getText('reference')}</div>
      <div className="fw-bold mt-2">{getText('grossAmount')} <span className="text-success">$ 10.90</span></div>

      <Row className="mb-4 mt-3">
        <Col md={6} className={languageMode === 'ar' ? 'text-end' : 'text-start'}>
          <strong className="d-block mb-2">{getText('billTo')}</strong>
          <div><strong className="text-primary">Haroun Spiers</strong></div>
          <div>4 Kings Park</div>
          <div>Zouparia do Monte, Portugal</div>
          <div>{languageMode === 'ar' ? 'هاتف: 489-737-5435' : 'Phone: 489-737-5435'}</div>
          <div>{languageMode === 'ar' ? 'بريد إلكتروني: hspiers2g@redcross.org' : 'Email: hspiers2g@redcross.org'}</div>
        </Col>
        <Col md={6} className={languageMode === 'ar' ? 'text-end' : 'text-end'}>
          <div><strong>{getText('invoiceDate')}</strong> 15-07-2025</div>
          <div><strong>{getText('dueDate')}</strong> 15-07-2025</div>
          <div><strong>{getText('terms')}</strong> {getText('paymentTerms')}</div>
        </Col>
      </Row>

      <div className="table-responsive mb-4">
        <Table bordered className="align-middle">
          <thead className="table-light">
            <tr>{currentHeaders.map((header, index) => <th key={index}>{header}</th>)}</tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>{languageMode === 'ar' ? 'منتج عينة' : 'Sample Product'}</td>
              <td>$ 10.00</td>
              <td>1</td>
              <td>$ 1.90 (19.00%)</td>
              <td>$ 1.00 (1.00 flat)</td>
              <td>$ 10.90</td>
            </tr>
          </tbody>
        </Table>
      </div>

      <Row className="mb-4">
        <Col md={6} className={languageMode === 'ar' ? 'text-end' : 'text-start'}>
          <p><strong>{getText('paymentStatus')}</strong> <Badge bg="success">{languageMode === 'ar' ? 'مدفوع' : 'Paid'}</Badge></p>
          <p><strong>{getText('paymentMethod')}</strong> <u>{languageMode === 'ar' ? 'نقدي' : 'Cash'}</u></p>
          <p><strong>{getText('note')}</strong></p>
        </Col>
        <Col md={6}>
          <div className="table-responsive">
            <Table borderless className={languageMode === 'ar' ? 'text-end' : 'text-end'}>
              <tbody>
                <tr><td>{getText('subTotal')}</td><td>$ 10.00</td></tr>
                <tr><td>{getText('tax')}</td><td>$ 1.90</td></tr>
                <tr><td>{getText('shipping')}</td><td>$ 0.00</td></tr>
                <tr className="fw-bold border-top"><td>{getText('total')}</td><td>$ 10.90</td></tr>
                <tr className="text-danger"><td>{getText('paymentReceived')}</td><td>(-) $ 10.90</td></tr>
                <tr className="fw-bold border-top"><td>{getText('balanceDue')}</td><td>$ 0.00</td></tr>
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>

      <div className={languageMode === 'ar' ? 'text-end' : 'text-end'} style={{ marginTop: '3rem', marginBottom: '3rem' }}>
        <div>(John Doe)</div>
        <small>{getText('businessOwner')}</small>
      </div>

      <h6 className="mb-3">{getText('creditTransactions')}</h6>
      <div className="table-responsive mb-5">
        <Table bordered>
          <thead className="table-light">
            <tr>{currentTxnHeaders.map((header, index) => <th key={index}>{header}</th>)}</tr>
          </thead>
          <tbody>
            <tr><td colSpan={4} className="text-center">{getText('noTransactions')}</td></tr>
          </tbody>
        </Table>
      </div>

      <h6>{getText('termsConditions')}</h6>
      <p className="mb-1 fw-bold">{getText('paymentTerms')}</p>
      <p className="mb-3">{getText('pricesPayment')}<br />{getText('paymentDetails')}</p>

      <p className="text-muted small mb-4">{getText('publicAccess')}<br />https://billing.ultimatekode.com/neo/billing/invoice?id=1045&token=XXXXXXX</p>

      <div style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
        <label className="fw-bold d-block mb-2">{getText('attachments')}</label>
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
          <Button style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa" }} size="sm">{getText('selectFiles')}</Button>
          <input type="file" />
        </div>
        <small className="text-muted">{getText('allowedFiles')}</small>
      </div>
    </div>
  );
};

export default ViewInvoicee;
