import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from 'react-router-dom';
import M1 from '../../../assets/M1.jpeg';
import M2 from '../../../assets/M2.png';
import M3 from '../../../assets/M3.png';
import M4 from '../../../assets/M4.png';
import img1 from "../../../assets/img1.png";
import img2 from "../../../assets/img2.jpg";
import img3 from "../../../assets/img3.jpg";
import img4 from "../../../assets/img4.jpg";
import slide1 from "../../../assets/slide11.jpg";
import slide2 from "../../../assets/slide12.jpg";
import slide3 from "../../../assets/slide13.jpg";
import slide4 from "../../../assets/slide14.jpg";
import slide5 from "../../../assets/slide15.jpg";

// Import Bootstrap components
import { Container, Row, Col, Button, Carousel } from 'react-bootstrap';

const Features = () => {
  useEffect(() => {
    AOS.init({ duration: 1200, once: true, easing: "ease-in-out" });
  }, []);

  return (
    <div>

      <section style={{ backgroundColor: '#f0f7f8', fontFamily: 'Segoe UI, sans-serif', color: '#333', padding: '30px 0' }}>
        <Container>
          <Row className="align-items-center">
            {/* TEXT SECTION */}
            <Col md={6} data-aos="fade-right" className="text-center text-md-start">
              <h2 style={{ fontWeight: 'bold', fontSize: '2.8rem', marginBottom: '25px' }} className="fs-1">
                Features That Are <br /> <span style={{color: "#023347"}}>Incredibly
                easy to use</span>
              </h2>
              <p style={{ fontSize: '1.25rem', lineHeight: '1.6', marginBottom: '20px' }} className="fs-5">
                Create invoices, get ready GST reports and so much more.
              </p>
              <p style={{ fontSize: '1rem', marginBottom: '30px', color: '#222' }} className="fs-6">
                Faster | Smarter | Anywhere | Anytime
              </p>
            </Col>

            {/* IMAGE SECTION */}
            <Col md={6} className="text-center mt-4 mt-md-0" data-aos="zoom-in">
              <img
                src="https://i.ibb.co/8gMPbZNZ/rounded-removebg-preview.png"
                alt="Business team collaboration"
                className="img-fluid"
                style={{
                  borderRadius: '20px',
                  width: '100%',
                  maxWidth: '400px',
                  height: 'auto',
                  objectFit: 'contain',
                  boxShadow: '0 4px 12px rgba(2, 51, 71, 0.2)',
                  transition: "transform 0.4s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* NEW CAROUSEL SECTION */}
      <section className="py-4 py-md-5" style={{ backgroundColor: "#e6f3f5" }}>
        <Container>
          <h2
            className="text-center fw-bold mb-4"
            data-aos="fade-down"
            style={{ fontSize: '2.5rem', letterSpacing: '0.5px', color: '#023347' }}
          >
            Explore Our Invoice Features
          </h2>

          <Carousel
            data-bs-theme="dark"
            variant="dark"
            data-aos="zoom-in"
            interval={3000}
            controls={true}
            indicators={true}
            className="shadow-lg rounded-4 overflow-hidden custom-carousel"
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
              position: "relative",
              borderRadius: "1.5rem",
              boxShadow: "0 15px 35px rgba(2, 51, 71, 0.15)",
              minHeight: '300px' // Prevents collapse on small screens
            }}
          >
            {/* Slide 1 */}
            <Carousel.Item>
              <div className="position-relative">
                <img
                  className="d-block w-100 img-fluid"
                  src={slide1}
                  alt="Accounting Dashboard"
                  style={{
                    height: "auto",
                    maxHeight: "550px",
                    objectFit: "cover",
                    aspectRatio: "16/9",
                  }}
                />
              </div>
            </Carousel.Item>

            {/* Slide 2 */}
            <Carousel.Item>
              <div className="position-relative">
                <img
                  className="d-block w-100 img-fluid"
                  src={slide2}
                  alt="Invoice Management"
                  style={{
                    height: "auto",
                    maxHeight: "550px",
                    objectFit: "cover",
                    aspectRatio: "16/9",
                  }}
                />
              </div>
            </Carousel.Item>

            {/* Slide 3 */}
            <Carousel.Item>
              <div className="position-relative">
                <img
                  className="d-block w-100 img-fluid"
                  src={slide3}
                  alt="GST Reports"
                  style={{
                    height: "auto",
                    maxHeight: "550px",
                    objectFit: "cover",
                    aspectRatio: "16/9",
                  }}
                />
              </div>
            </Carousel.Item>

            {/* Slide 4 */}
            <Carousel.Item>
              <div className="position-relative">
                <img
                  className="d-block w-100 img-fluid"
                  src={slide4}
                  alt="Inventory Management"
                  style={{
                    height: "auto",
                    maxHeight: "550px",
                    objectFit: "cover",
                    aspectRatio: "16/9",
                  }}
                />
              </div>
            </Carousel.Item>

            {/* Slide 5 */}
            <Carousel.Item>
              <div className="position-relative">
                <img
                  className="d-block w-100 img-fluid"
                  src={slide5}
                  alt="Financial Reports"
                  style={{
                    height: "auto",
                    maxHeight: "550px",
                    objectFit: "cover",
                    aspectRatio: "16/9",
                  }}
                />
              </div>
            </Carousel.Item>
          </Carousel>
        </Container>
      </section>

      {/* Slide 1: Chart of Accounts & Ledger Management */}
      <section className="py-4 py-md-5" style={{ backgroundColor: "#fff" }}>
        <Container>
          <Row className="align-items-center">
            {/* Left Text */}
            <Col lg={6} data-aos="fade-right" className="mb-4 mb-lg-0">
              <h2 className="mt-2 fw-bold mb-3 h4 text-center text-md-start" style={{ color: '#023347' }}>
                Chart of Accounts & Ledger Management
              </h2>

              <ul className="list-unstyled mt-4">
                <li className="mb-2" data-aos="fade-up" data-aos-delay="100">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong>Customizable Chart of Accounts:</strong> Create and manage a hierarchical structure for all financial accounts (Assets, Liabilities, Income, Expenses).
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="100">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong>Parent & Sub-Accounts:</strong> Organize accounts into logical groups (e.g., Sundry Debtors/Creditors under Current Assets/Liabilities).
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="300">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong> View Detailed Ledgers:</strong> Access a complete transaction history for any individual account or customer/vendor.
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="400">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong>Credit/Debit Control:</strong> Define credit periods for customers and track outstanding balances.
                </li>
              </ul>
            </Col>

            {/* Right Invoice Preview */}
            <Col lg={6} data-aos="fade-left">
              <div className="text-center">
                <div
                  className="bg-light p-3 p-md-4 rounded shadow-lg"
                  style={{
                    maxWidth: "100%",
                    margin: "0 auto",
                    transition: "transform 0.4s ease",
                    backgroundColor: '#e6f3f5'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                >
                  <img
                    src={img1}
                    alt="Accounts & Ledger"
                    className="img-fluid rounded"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Slide 2: Customer & Vendor (Debtor/Creditor) Management */}
      <section className="py-4 py-md-5" style={{ backgroundColor: "#e6f3f5" }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6} data-aos="fade-right" className="mb-4 mb-lg-0">

              <h2 className="mt-2 fw-bold mb-3 h4 text-center text-md-start" style={{ color: '#023347' }}>
                Customer & Vendor (Debtor/Creditor) Management
              </h2>

              <ul className="list-unstyled mt-4">
                <li className="mb-2" data-aos="fade-up" data-aos-delay="100">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong> Comprehensive CRM:</strong> Add, view, and manage customer details (contact info, credit limit, GSTIN, shipping address).
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="200">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong> Vendor Directory:</strong> Maintain a database of suppliers with their contact, payment terms, and account information.
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="300">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong> Account Status Tracking:</strong> Monitor customer receivables and vendor payables, including aging reports for overdue amounts.
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="400">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong> Credit/Debit Control:</strong>Define credit periods for customers and track outstanding balances.
                </li>
              </ul>
            </Col>
            <Col lg={6} data-aos="fade-left">
              <div className="text-center">
                <div
                  className="bg-light p-3 p-md-4 rounded shadow-lg"
                  style={{
                    maxWidth: "100%",
                    margin: "0 auto",
                    transition: "transform 0.4s ease",
                    backgroundColor: '#e6f3f5'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                >
                  <img
                    src={img2}
                    alt="Debtor/Creditor"
                    className="img-fluid rounded"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Slide 3: Inventory & Warehouse Management */}
      <section className="py-4 py-md-5" style={{ backgroundColor: "#fff" }}>
        <Container>
          <Row className="align-items-center">
            {/* Left - IMAGE SECTION */}
            <Col lg={6} data-aos="fade-right" className="mb-4 mb-lg-0">
              <div className="text-center">
                <div
                  className="bg-white p-3 p-md-4 rounded shadow-lg"
                  style={{
                    maxWidth: "100%",
                    margin: "0 auto",
                    transition: "transform 0.4s ease",
                    backgroundColor: '#e6f3f5'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                >
                  <img
                    src={img3}
                    alt="Expenses & Profit Dashboard"
                    className="img-fluid rounded"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
              </div>
            </Col>

            {/* Right - Text Section */}
            <Col lg={6} data-aos="fade-left">
              <h2 className="mt-2 fw-bold mb-3 h4 text-center text-md-start" style={{ color: '#023347' }}>
                Inventory & Warehouse Management
              </h2>

              <ul className="list-unstyled mt-4">
                <li className="mb-2" data-aos="fade-up" data-aos-delay="100">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong> Multi-Warehouse Support:</strong> Create and manage multiple warehouse locations (e.g., Central, North Zone, South Depot).
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="200">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong> Product Master: </strong> Add products with details like SKU, HSN code, category, brand, description, and images.
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="300">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong> Stock Level Monitoring: </strong> Track opening, inward, outward, and closing stock levels for each product at every warehouse.
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="300">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong> Stock Alerts:</strong>  Get notifications for low stock or out-of-stock items to prevent sales loss.
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="300">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong> Stock Transfer: </strong>   Easily move stock between different warehouses with a dedicated voucher.
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Slide 4: Sales Workflow & Order Management */}
      <section className="py-4 py-md-5" style={{ backgroundColor: "#e6f3f5" }}>
        <Container>
          <Row className="align-items-center">
            {/* Left - Reports Image */}
            <Col lg={6} data-aos="fade-right" className="mb-4 mb-lg-0">
              <div className="text-center">
                <img
                  src={img4}
                  alt="GST Invoice Example"
                  className="img-fluid rounded shadow-lg"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    border: "1px solid #e9ecef",
                    borderRadius: "8px",
                    transition: "transform 0.4s ease",
                    backgroundColor: '#e6f3f5'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
            </Col>

            {/* Right - Text Content */}
            <Col lg={6} data-aos="fade-left">
              <h2 className="mt-2 fw-bold mb-3 h4 text-center text-md-start" style={{ color: '#023347' }}>
                Sales Workflow & Order Management
              </h2>


              <ul className="list-unstyled mt-4">
                <li className="mb-2" data-aos="fade-up" data-aos-delay="100">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong> End-to-End Sales Process: </strong> Manage the complete sales cycle from Quotation to Payment Receipt.
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="200">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong> Multi-Stage Documents:</strong> Create and convert between Quotations, Sales Orders, Delivery Challans, and Invoices.
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="300">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong>Flexible Invoicing: </strong> Generate professional invoices with customizable templates, tax calculations, and discount options.
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="400">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong>Payment Tracking:</strong>Record and reconcile customer payments against specific invoices.
                </li>
                <li className="mb-2" data-aos="fade-up" data-aos-delay="500">
                  <i className="bi bi-check-circle-fill" style={{ color: '#2a8e9c', marginRight: '8px' }}></i>
                  <strong> Sales Returns: </strong> Manage product returns with reasons, reference to original invoices, and processing status (Pending/Approved).
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Additional Features Grid */}
      <section className="py-4 py-md-5" style={{ backgroundColor: "#d6eef2" }}>
        <Container data-aos="fade-up">
          <div className="text-center mb-5">
            <h2 className="h1 fw-bold mb-3" data-aos="zoom-in" style={{ color: '#023347' }}>
              There's More!
            </h2>
          </div>
          <Row>
            {[
              { icon: "bi-speedometer2", title: "Dashboard", description: "View KPIs, quick stats, and alerts in one place." },
              { icon: "bi-journal-text", title: "Charts of Accounts", description: "Organize all financial accounts for reporting." },
              { icon: "bi-people", title: "Customers / Debtors", description: "Manage customer details, balances, and receivables." },
              { icon: "bi-person-badge", title: "Vendors / Creditors", description: "Maintain supplier records and monitor payables." },
              { icon: "bi-cash-stack", title: "All Transactions", description: "Track invoices, payments, expenses, and receipts." },
              { icon: "bi-box-seam", title: "Warehouse", description: "Monitor stock levels and transfers." },
              { icon: "bi-basket", title: "Product & Inventory", description: "Manage products with batch and stock tracking." },
              { icon: "bi-gear-wide-connected", title: "Service", description: "Record and manage non-inventory services." },
              { icon: "bi-receipt", title: "Create Voucher", description: "Generate vouchers for payments, receipts, adjustments." },
              { icon: "bi-arrow-left-right", title: "Stock Transfer", description: "Transfer stock with proper documentation." },
              { icon: "bi-arrow-repeat", title: "Inventory Adjustment", description: "Adjust stock discrepancies easily." },
              { icon: "bi-bag-check", title: "Sales Order", description: "Track sales orders from confirmation to dispatch." },
              { icon: "bi-box-arrow-in-left", title: "Sales Return", description: "Record returns and manage credit notes." },
              { icon: "bi-cart4", title: "Purchase Orders", description: "Manage supplier purchase orders with tracking." },
              { icon: "bi-arrow-counterclockwise", title: "Purchase Return", description: "Handle returned goods and adjustments." },
              { icon: "bi-wallet2", title: "Expenses", description: "Record business expenses with categories." },
              { icon: "bi-receipt-cutoff", title: "ITC Report", description: "Track input tax credit availability and use." },
              { icon: "bi-graph-up", title: "Reports", description: "Access purchase, sales, tax, and inventory reports." }
            ].map((feature, index) => (
              <Col
                key={index}
                xs={12}
                md={6}
                lg={4}
                className="mb-4"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div
                  className="bg-white p-4 rounded shadow-sm h-100 text-center"
                  style={{ 
                    transition: "transform 0.4s ease",
                    backgroundColor: '#e6f3f5'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                >
                  <div className="mb-3">
                    <i
                      className={`bi ${feature.icon}`}
                      style={{
                        fontSize: "48px",
                        color: '#2a8e9c',
                        // Slightly smaller icon on very small screens
                        ...(window.innerWidth < 360 ? { fontSize: "40px" } : {})
                      }}
                    ></i>
                  </div>
                  <h5 className="fw-bold mb-2" style={{ color: '#023347' }}>{feature.title}</h5>
                  <p className="text-muted small">{feature.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Footer CTA */}
      <section
        className="py-4 py-md-5 mx-3 mx-md-5 mb-4"
        style={{
          background: 'linear-gradient(to bottom, #023347, #2a8e9c)',
          color: "#ffffff",
          position: "relative",
          overflow: "hidden",
          borderRadius: "20px"
        }}
      >
        <Container className="text-center position-relative" style={{ zIndex: 1 }} data-aos="zoom-in">
          <h2
            className="display-6 fw-bold mb-3"
            style={{ letterSpacing: "1px" }}
            data-aos="fade-down"
            data-aos-delay="100"
          >
            Ready for Fast & Smart Accounting?
          </h2>
          <h3
            className="fw-light mb-4"
            style={{ fontSize: "1.5rem", opacity: 0.9 }}
            data-aos="fade-down"
            data-aos-delay="200"
          >
            Let's Get Started Together!
          </h3>
          <Button
            size="lg"
            as={Link}
            to="/contact"
            className="btn btn-lg btn-light"
            style={{
              color: "#fff",
              backgroundColor: '#023347',
              borderColor: '#023347',
              padding: "1rem 3rem",
              fontWeight: "700",
              borderRadius: "50px",
              boxShadow: "0 10px 20px rgba(2, 51, 71, 0.3)",
              transition: "all 0.3s ease-in-out",
              border: "none"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.backgroundColor = '#2a8e9c';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.backgroundColor = '#023347';
            }}
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Contact Now
          </Button>
        </Container>
      </section>

    </div>
  );
};

export default Features;