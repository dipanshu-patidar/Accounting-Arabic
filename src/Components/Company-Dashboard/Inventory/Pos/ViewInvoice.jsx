import React, { useState, useRef } from "react";
import { Card, Button } from "react-bootstrap";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";

const ViewInvoice = () => {
  const invoiceRef = useRef();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const invoice = {
    invoiceNumber: "INV-1001",
    created_at: new Date().toISOString(),
    subtotal: 400,
    tax: 40,
    total: 440,
    total_paid: 440,
    due_amount: 0,
    cash: 200,
    eftpos: 240,
    afterpay: 0,
    customer_id: {
      first_name: "Amit",
      last_name: "Sharma",
      email: "amit@example.com",
      phone: "9876543210",
      address: "123 Main St",
      city: "Sydney",
      state: "NSW",
      country: "Australia",
      post_code: "2000",
    },
    productDetails: [
      { name: "Smartphone", quantity: 2, price: 150 },
      { name: "Screen Protector", quantity: 2, price: 50 },
    ],
    repairParts: [
      {
        name: "Battery",
        quantity: 1,
        price: 50,
        category_name: "Power",
        brand_name: "Samsung",
        device_name: "S10",
      },
    ],
  };

  const handleDownloadPDF = async () => {
    const input = invoiceRef.current;
    if (!input) return;

    setDownloading(true);
    document.body.classList.add("hide-print-elements");

    await new Promise((res) => setTimeout(res, 300));

    html2canvas(input, {
      scale: 3,
      useCORS: true,
      scrollY: -window.scrollY,
      windowWidth: input.scrollWidth,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdfWidth = 120;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pdf = new jsPDF("p", "mm", [pdfWidth, pdfHeight]);
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice_${invoice.invoiceNumber}.pdf`);
      })
      .finally(() => {
        document.body.classList.remove("hide-print-elements");
        setDownloading(false);
      });
  };

  const customer = invoice.customer_id;

  return (
    <div className="container mt-5">
               <Button variant="" onClick={() => navigate("/company/manageinvoice")}>
              ⬅ Back
            </Button>
      <Card className="shadow p-4" ref={invoiceRef}>
        {/* 🔙 Back Button */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <div className="d-flex align-items-center gap-2">
     
            <div>
              <h3 className="fw-bold mb-0">Invoice Details</h3>
              <small className="fs-5" style={{ fontWeight: "400" }}>
                Invoice Number: {invoice.invoiceNumber}
              </small>
            </div>
          </div>
          {!downloading && (
            <Button variant="primary" onClick={handleDownloadPDF}>
              Download PDF
            </Button>
          )}
        </div>

        {/* Customer Details */}
        <Card className="p-3 mb-4">
          <h5 className="fw-semibold">Customer Details</h5>
          <p>
            <strong>Name:</strong> {customer.first_name} {customer.last_name}
          </p>
          <p>
            <strong>Email:</strong> {customer.email}
          </p>
          <p>
            <strong>Phone:</strong> {customer.phone}
          </p>
          <p>
            <strong>Address:</strong> {customer.address}, {customer.city}, {customer.state},{" "}
            {customer.country} - {customer.post_code}
          </p>
        </Card>

        {/* Product Details */}
        {invoice.productDetails?.length > 0 && (
          <Card className="p-3 mb-4">
            <h5 className="fw-semibold mb-3">Product Details</h5>
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price (A$)</th>
                  <th>Total (A$)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.productDetails.map((product, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>{product.price}</td>
                    <td>{(product.quantity * product.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Repair Parts */}
        {invoice.repairParts?.length > 0 && (
          <Card className="p-3 mb-4">
            <h5 className="fw-semibold mb-3">Repair Parts</h5>
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Repair Part</th>
                  <th>Quantity</th>
                  <th>Price (A$)</th>
                  <th>Total (A$)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.repairParts.map((part, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      {part.name}
                      <br />
                      <small style={{ color: "#555" }}>
                        ({part.category_name} / {part.brand_name} / {part.device_name})
                      </small>
                    </td>
                    <td>{part.quantity}</td>
                    <td>{part.price}</td>
                    <td>{(part.price * part.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Invoice Summary */}
        <Card className="p-3 mb-4">
          <h5 className="fw-semibold">Invoice Summary</h5>
          <p>
            <strong>Sub Total:</strong> A${invoice.subtotal}
          </p>
          <p>
            <strong>Tax:</strong> A${invoice.tax}
          </p>
          <p>
            <strong>Total Amount:</strong> A${invoice.total}
          </p>
          <p>
            <strong>Total Paid:</strong> A${invoice.total_paid}
          </p>
          <p>
            <strong>Due Amount:</strong> A${invoice.due_amount}
          </p>
          <p>
            <strong>Invoice Date:</strong>{" "}
            {new Date(invoice.created_at).toLocaleString("en-AU", {
              timeZone: "Australia/Sydney",
            })}
          </p>
        </Card>

        {/* Payment Methods */}
        <Card className="p-3 mb-4">
          <h5 className="fw-semibold">Payment Methods</h5>
          <p>
            <strong>Cash:</strong> A${invoice.cash}
          </p>
          <p>
            <strong>EFTPOS:</strong> A${invoice.eftpos}
          </p>
          <p>
            <strong>Afterpay:</strong> A${invoice.afterpay}
          </p>
        </Card>
      </Card>
    </div>
  );
};

export default ViewInvoice;
