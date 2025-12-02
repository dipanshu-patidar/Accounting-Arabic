import React, { useState } from "react";
import {
  FaEdit,
  FaMoneyBill,
  FaPaperPlane,
  FaPrint,
  FaGlobe,
  FaExchangeAlt,
  FaTimes,
  FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { Button, Row, Col, Table, Badge } from "react-bootstrap";

const PurchaseOrderView = () => {
  const [language, setLanguage] = useState("en");

  const navigate = useNavigate();
  const labels = {
    en: {
      edit: "Edit Order",
      payment: "Make Payment",
      send: "Send",
      print: "Print Order",
      preview: "Print Preview",
      status: "Change Status",
      cancel: "Cancel",
      purchaseOrder: "Purchase Order",
      reference: "Reference",
      grossAmount: "Gross Amount",
      billFrom: "Bill From",
      orderDate: "Order Date",
      dueDate: "Due Date",
      terms: "Terms",
      paymentDue: "Payment Due On Receipt",
      description: "Description",
      rate: "Rate",
      qty: "Qty",
      tax: "Tax",
      discount: "Discount",
      amount: "Amount",
      paymentStatus: "Payment Status",
      paid: "Paid",
      paymentMethod: "Payment Method",
      note: "Note",
      subTotal: "Sub Total",
      shipping: "Shipping",
      total: "Total",
      paymentMade: "Payment Made",
      balanceDue: "Balance Due",
      signature: "(John Doe)",
      owner: "Business Owner",
      debit: "Debit Transactions:",
      noTransactions: "No transactions",
      termsHeading: "Terms & Condition",
      prices: "Prices And Payment:",
      termsBody:
        "Payments are to be made in U.S. funds. Unless otherwise specified, all invoices are due net 30 days from shipment date.",
      publicAccess: "Public Access URL:",
      files: "Files",
      selectFiles: "Select files...",
      allowed: "Allowed: gif, jpeg, png, docx, docs, txt, pdf, xls",
    },
    ar: {
      edit: "تعديل الطلب",
      payment: "إجراء الدفع",
      send: "إرسال",
      print: "طباعة الطلب",
      preview: "معاينة عامة",
      status: "تغيير الحالة",
      cancel: "إلغاء",
      purchaseOrder: "أمر شراء",
      reference: "المرجع",
      grossAmount: "المبلغ الإجمالي",
      billFrom: "الفاتورة من",
      orderDate: "تاريخ الطلب",
      dueDate: "تاريخ الاستحقاق",
      terms: "الشروط",
      paymentDue: "الدفع عند الاستلام",
      description: "الوصف",
      rate: "السعر",
      qty: "الكمية",
      tax: "الضريبة",
      discount: "الخصم",
      amount: "المبلغ",
      paymentStatus: "حالة الدفع",
      paid: "مدفوع",
      paymentMethod: "طريقة الدفع",
      note: "ملاحظة",
      subTotal: "الإجمالي الفرعي",
      shipping: "الشحن",
      total: "الإجمالي",
      paymentMade: "تم الدفع",
      balanceDue: "الرصيد المستحق",
      signature: "(جون دو)",
      owner: "مالك النشاط التجاري",
      debit: "المعاملات المدينة:",
      noTransactions: "لا توجد معاملات",
      termsHeading: "الشروط والأحكام",
      prices: "الأسعار والدفع:",
      termsBody:
        "يجب أن تتم المدفوعات بالدولار الأمريكي. ما لم ينص على خلاف ذلك، فإن جميع الفواتير مستحقة خلال 30 يومًا من تاريخ الشحن.",
      publicAccess: "رابط الوصول العام:",
      files: "الملفات",
      selectFiles: "اختر الملفات...",
      allowed: "المسموح به: gif، jpeg، png، docx، docs، txt، pdf، xls",
    },
  };

  const getLabel = (key) => {
    if (language === "both") {
      return (
        <>
          <div style={{ fontWeight: "bold" }}>{labels.ar[key]}</div>
          <div style={{ fontSize: "small", color: "#555" }}>{labels.en[key]}</div>
        </>
      );
    }
    return labels[language][key];
  };

  const isArabic = language === "ar" || language === "both";

  return (
    <div
      className={`mt-2 p-4 ${isArabic ? "text-end" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
              <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/company/purchasorderr')}
          className="mb-3 d-flex align-items-center gap-1"
        >
          <FaArrowLeft /> {("Back", "رجوع")}
        </Button>
      {/* Language Switch Buttons */}
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <Button variant="outline-primary" onClick={() => setLanguage("en")}>
          English
        </Button>
        <Button variant="outline-primary" onClick={() => setLanguage("ar")}>
          العربية
        </Button>
        <Button variant="outline-primary" onClick={() => setLanguage("both")}>
          English + العربية
        </Button>
      </div>

      {/* Purchase Header */}
      <Row className="mb-4 align-items-start">
        <Col md={8}>
          <div className="d-flex flex-wrap gap-2">
            <Button variant="warning">
              <FaEdit /> {getLabel("edit")}
            </Button>
            <Button variant="success">
              <FaMoneyBill /> {getLabel("payment")}
            </Button>
            <Button variant="primary">
              <FaPaperPlane /> {getLabel("send")}
            </Button>
            <Button variant="success">
              <FaPrint /> {getLabel("print")}
            </Button>
            <Button variant="info">
              <FaGlobe /> {getLabel("preview")}
            </Button>
            <Button variant="secondary">
              <FaExchangeAlt /> {getLabel("status")}
            </Button>
            <Button variant="danger">
              <FaTimes /> {getLabel("cancel")}
            </Button>
          </div>
        </Col>
        <Col md={4} className={`mt-3 mt-md-0 ${isArabic ? "text-start" : "text-md-end"}`}>
          <h5 className="fw-bold mb-1">{getLabel("purchaseOrder")}</h5>
          <div>PO#1045</div>
          <div>{getLabel("reference")}:</div>
          <div className="fw-bold mt-2">
            {getLabel("grossAmount")}: <span className="text-success">$ 10.90</span>
          </div>
        </Col>
      </Row>

      {/* Supplier and Order Info */}
      <Row className="mb-4">
        <Col md={6}>
          <strong className="d-block mb-2">{getLabel("billFrom")}</strong>
          <div><strong className="text-primary">Haroun Spiers</strong></div>
          <div>4 Kings Park</div>
          <div>Zouparia do Monte, Portugal</div>
          <div>{isArabic ? "هاتف: 489-737-5435" : "Phone: 489-737-5435"}</div>
          <div>{isArabic ? "بريد إلكتروني: hspiers2g@redcross.org" : "Email: hspiers2g@redcross.org"}</div>
        </Col>
        <Col md={6} className={isArabic ? "text-start mt-4 mt-md-0" : "text-md-end mt-4 mt-md-0"}>
          <div><strong>{getLabel("orderDate")}:</strong> 15-07-2025</div>
          <div><strong>{getLabel("dueDate")}:</strong> 15-07-2025</div>
          <div><strong>{getLabel("terms")}:</strong> {getLabel("paymentDue")}</div>
        </Col>
      </Row>

      {/* Order Table */}
      <div className="table-responsive mb-4">
        <Table bordered className="align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>{getLabel("description")}</th>
              <th>{getLabel("rate")}</th>
              <th>{getLabel("qty")}</th>
              <th>{getLabel("tax")}</th>
              <th>{getLabel("discount")}</th>
              <th>{getLabel("amount")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>{isArabic ? "منتج عينة" : "Sample Product"}</td>
              <td>$ 10.00</td>
              <td>1</td>
              <td>$ 1.90 (19.00%)</td>
              <td>$ 1.00 (1.00 flat)</td>
              <td>$ 10.90</td>
            </tr>
          </tbody>
        </Table>
      </div>

      {/* Payment Summary */}
      <Row className="mb-4">
        <Col md={6}>
          <p><strong>{getLabel("paymentStatus")}:</strong> <Badge bg="success">{getLabel("paid")}</Badge></p>
          <p><strong>{getLabel("paymentMethod")}:</strong> <u>{isArabic ? "نقدي" : "Cash"}</u></p>
          <p><strong>{getLabel("note")}:</strong></p>
        </Col>
        <Col md={6}>
          <div className="table-responsive">
            <Table borderless className={isArabic ? "text-start" : "text-end"}>
              <tbody>
                <tr><td>{getLabel("subTotal")}</td><td>$ 10.00</td></tr>
                <tr><td>{getLabel("tax")}</td><td>$ 1.90</td></tr>
                <tr><td>{getLabel("shipping")}</td><td>$ 0.00</td></tr>
                <tr className="fw-bold border-top"><td>{getLabel("total")}</td><td>$ 10.90</td></tr>
                <tr className="text-danger"><td>{getLabel("paymentMade")}</td><td>(-) $ 10.90</td></tr>
                <tr className="fw-bold border-top"><td>{getLabel("balanceDue")}</td><td>$ 0.00</td></tr>
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>

      {/* Signature */}
      <div className={isArabic ? "text-start" : "text-end"} style={{ marginTop: "3rem", marginBottom: "3rem" }}>
        {/* <img src="/path-to-signature.png" alt="signature" height="40" /> */}
        <div>{getLabel("signature")}</div>
        <small>{getLabel("owner")}</small>
      </div>



      {/* Terms and Conditions */}
      <h6>{getLabel("termsHeading")}</h6>
      <p className="mb-1 fw-bold">{getLabel("paymentDue")}</p>
      <p className="mb-3">
        1. <strong>{getLabel("prices")}</strong><br />
        {getLabel("termsBody")}
      </p>

      {/* Public Access URL */}
      <p className="text-muted small mb-4">
        {getLabel("publicAccess")}<br />
        https://billing.ultimatekode.com/neo/billing/purchase?id=1045&token=XXXXXXX
      </p>

      {/* File Upload */}
      <div style={{ marginTop: "1.5rem", marginBottom: "3rem" }}>
        <label className="fw-bold d-block mb-2">{getLabel("files")}</label>
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
          <Button style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa" }} size="sm">
            {getLabel("selectFiles")}
          </Button>
          <input type="file" />
        </div>
        <small className="text-muted">{getLabel("allowed")}</small>
      </div>
    </div>
  );
};

export default PurchaseOrderView;
