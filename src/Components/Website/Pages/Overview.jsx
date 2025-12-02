import React, { useState } from "react";
import homeimg from "../../../assets/accounting_img.png";
import {
  Container,
  Row,
  Col,
  Button,
  Accordion,
  Card as BootstrapCard,
} from "react-bootstrap";
import { Card } from "react-bootstrap";
import { FiCloud, FiClipboard } from "react-icons/fi";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import step1 from "../../../assets/1.png";
import step2 from "../../../assets/2.png";
import step3 from "../../../assets/3.png";
import f1 from "../../../assets/f1.png";
import f2 from "../../../assets/f2.png";
import f3 from "../../../assets/f3.png";
import f4 from "../../../assets/f4.png";
import f5 from "../../../assets/f5.png";
import f6 from "../../../assets/f6.png";

const Overview = () => {
  const [activeKey, setActiveKey] = useState(null);
  const [hover, setHover] = useState(false);

  const handleToggle = (key) => {
    setActiveKey(activeKey === key ? null : key);
  };

  const features = [
    {
      img: f3,
      title: "Smart Accounting Engine",
      desc: "Automate bookkeeping with real-time balance tracking, customizable chart of accounts, and intelligent journal entries — no manual errors, no delays.",
    },
    {
      img: f5,
      title: "Multi-Warehouse Inventory",
      desc: "Track stock across locations, manage batches & expiry, use barcodes, and get automated valuations (FIFO/LIFO) — all from one dashboard.",
    },
    {
      img: f4,
      title: "Client & Vendor Hub",
      desc: "Centralize contacts, track balances, set credit periods, and manage all transactions in one place — build stronger business relationships effortlessly.",
    },
    {
      img: f6,
      title: "Smart Voucher System",
      desc: "Create, customize, and manage vouchers for every transaction type — sales, purchases, adjustments, payments — with auto-numbering and full audit trail.",
    },
    {
      img: f1,
      title: "Business Insight Reports",
      desc: "Generate real-time reports on sales, inventory, cash flow, and profit & loss — make smarter decisions with visual, exportable dashboards.",
    },
    {
      img: f2,
      title: "Role-Based Access Control",
      desc: "Assign custom roles and permissions to your team — ensure data security while enabling collaboration across departments like finance, inventory, and sales.",
    },
  ];

  return (
    <>
      {/* === FIRST SECTION === */}
      <div style={{ backgroundColor: "#f0f7f8", padding: "40px 0" }}>
        <Container>
          <Row className="align-items-center g-4">
            {/* Text Section */}
            <Col xs={12} md={6} className="text-center text-md-start">
              <h1 className="fw-bold display-5 mb-3">
                Simplify Your Accounting <br /><span style={{color: "#023347"}}>with Powerful Accounting Software</span> 
              </h1>
              <p className="lead">
                Manage Invoicing, Inventory, Expenses & Reports — All in One Place
              </p>
              <div className="mt-4 d-grid gap-2 d-md-flex justify-content-md-start">
                <Button
                  style={{ backgroundColor: "#023347", border: "none" }}
                  size="lg"
                  as={Link}
                  to="/pricing"
                  className="px-4"
                >
                  Buy Now
                </Button>
                <Button
                  variant="outline-primary"
                  size="lg"
                  as={Link}
                  to="/contact"
                  className="px-4"
                  style={{
                    transition: 'all 0.3s ease',
                    backgroundColor: hover ? '#e6f3f5' : 'transparent',
                    color: hover ? '#023347' : '#023347',
                    borderColor: '#023347'
                  }}
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                >
                  Consult with Experts
                </Button>
              </div>
            </Col>

            {/* Image Section */}
            <Col xs={12} md={6} className="text-center">
              <div
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  aspectRatio: "1 / 1",
                  margin: "0 auto",
                  borderRadius: "50%",
                  overflow: "hidden",
                  boxShadow: "0 0 30px rgba(2, 51, 71, 0.2)",
                }}
              >
                <img
                  src="https://media.istockphoto.com/id/538904812/photo/woman-paying-bills-online-at-home.jpg?s=612x612&w=0&k=20&c=YUzP3MeTJSxcnI1rZX3-xRBVVUy0yaHFG0YtpIg2ORM="
                  alt="Accounting Dashboard"
                  className="img-fluid"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* === SECOND SECTION === */}
      <div className="py-4">
        <Container>
          <div className="text-center mb-5">
            <h1 className="fw-bold">A best-in-class business management solution</h1>
            <p className="text-muted lead">
              Powerful features to help manage your business efficiently
            </p>
          </div>

          <Row className="g-4 align-items-center">
            {/* Image */}
            <Col xs={12} md={6}>
              <div className="text-center">
                <img
                  src={homeimg}
                  alt="Business Overview"
                  className="img-fluid rounded shadow-sm"
                  style={{ maxHeight: "350px", objectFit: "cover", width: "100%" }}
                />
              </div>
            </Col>

            {/* Content */}
            <Col xs={12} md={6}>
              <div className="bg-light p-4 rounded shadow-sm h-100 d-flex flex-column" style={{ backgroundColor: '#e6f3f5' }}>
                <h2 className="fw-bold mx-3 text-center text-md-center" style={{ color: "#023347" }}>
                  Smart Accounting & Inventory
                </h2>
                <p className="text-center small text-muted mb-4">Faster | Smarter | Anywhere | Anytime</p>
                <ul className="text-muted flex-grow-1">
                  <li className="mb-3">
                    Streamline your financial operations with integrated accounting and inventory management.
                    Track transactions, manage stock levels, and generate reports all in one unified platform.
                  </li>
                  <li className="mb-3">
                    Efficiently manage inventory across multiple locations with centralized control.
                    Automate stock transfers and maintain accurate inventory levels at all your facilities.
                  </li>
                  <li>
                    Implement granular access controls with our customizable permission system.
                    Safeguard sensitive data while empowering your team with role-based access to specific modules and functions.
                  </li>
                </ul>
                <div className="mt-4">
                  <Button
                    style={{ backgroundColor: "#023347", border: "none" }}
                    size="lg"
                    as={Link}
                    to="/pricing"
                    className="w-100 w-md-auto px-4"
                  >
                    Buy now
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* === THIRD SECTION === */}
      <div className="py-4" style={{ backgroundColor: "#e6f3f5" }}>
        <Container>
          <Row className="g-4">
            {/* Card 1 - Inventory & Warehouse */}
            <Col xs={12} md={6}>
              <div
                className="p-4 h-100 shadow-sm bg-white rounded border"
                style={{ borderColor: '#e0e0e0', transition: "transform 0.3s ease" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div className="text-center mb-4">
                  <FiCloud
                    size={50}
                    color="#2a8e9c"
                    style={{ transition: "transform 0.3s ease" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  />
                </div>
                <h5 className="fw-bold text-center">Inventory & Warehouse Management</h5>
                <p className="text-muted text-center">
                  Optimize your supply chain with our comprehensive inventory management system. Track stock levels across multiple locations in real-time,
                  manage batch numbers and expiration dates efficiently, and streamline operations with integrated barcode scanning capabilities.
                </p>
              </div>
            </Col>

            {/* Card 2 - Smart Accounting */}
            <Col xs={12} md={6}>
              <div
                className="p-4 h-100 shadow-sm bg-white rounded border"
                style={{ borderColor: '#e0e0e0', transition: "transform 0.3s ease" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div className="text-center mb-4">
                  <FiClipboard
                    size={50}
                    color="#2a8e9c"
                    style={{ transition: "transform 0.3s ease" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  />
                </div>
                <h5 className="fw-bold text-center">Smart Accounting Solutions</h5>
                <p className="text-muted text-center">
                  Revolutionize your financial management with our intelligent accounting platform. Simplify complex bookkeeping tasks, generate detailed profit and loss statements automatically,
                  and ensure error-free financial records with our advanced journal entry automation.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* === FOURTH SECTION: Business Features Cards === */}
      <div style={{ backgroundColor: "#f0f7f8", padding: "30px 0" }}>
        <Container>
          <div className="text-center mb-5">
            <h1 className="fw-bold">Essential tools for modern business operations</h1>
            <p className="text-muted lead">
              Streamline accounting, manage inventory, and optimize retail performance with tailored Accounting Enterprise features.
            </p>
          </div>
          <Row className="g-4">
            {/* Accounting Card */}
            <Col xs={12} md={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Img
                  variant="top"
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSag-ysXOW2u6-pObgayttxbBe3mv8uv5ESw&s"
                  className="img-fluid p-3"
                  style={{ objectFit: "contain", height: "180px" }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fw-bold text-center text-md-start" style={{ color: "#023347" }}>
                    Smart Accounting
                  </Card.Title>
                  <Card.Text className="text-muted flex-grow-1">
                    Track income and expenses efficiently, generate detailed profit & loss reports, and automate journal entries for accurate financial management with our intelligent accounting system.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            {/* Customer & Vendor Management */}
            <Col xs={12} md={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Img
                  variant="top"
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3omFC65wwVpVvtwjMkwofRPCFubjNGKlfxA&s"
                  className="img-fluid p-3"
                  style={{ objectFit: "contain", height: "180px" }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fw-bold text-center text-md-start" style={{ color: "#023347" }}>
                    Customer & Vendor Management
                  </Card.Title>
                  <Card.Text className="text-muted flex-grow-1">
                    Centralize your customer and vendor information, track outstanding balances, manage credit periods,
                    and streamline all transactions to enhance relationship management and improve cash flow.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            {/* Inventory Card */}
            <Col xs={12} md={4}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Img
                  variant="top"
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXc2LXr8ZhJhuFdFz7ukR7x-TuyQ93cZrM_A&s"
                  className="img-fluid p-3"
                  style={{ objectFit: "contain", height: "180px" }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fw-bold text-center text-md-start" style={{ color: "#023347" }}>
                    Inventory & Warehouse
                  </Card.Title>
                  <Card.Text className="text-muted flex-grow-1">
                    Monitor stock levels in real-time, manage batches and expiration dates, utilize barcode scanning, and automate inventory valuation using FIFO/LIFO methods for efficient warehouse management.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* === HOW IT WORKS SECTION === */}
      <div className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold" style={{ color: '#023347' }}>
              How It Works
            </h2>
            <p className="lead mx-auto" style={{ color: '#2a8e9c', maxWidth: '800px' }}>
              Our streamlined 3-step process makes managing your business finances simple and efficient
            </p>
          </div>

          <Row className="gy-4 justify-content-center">
            {[{
              step: "1",
              title: "Sign Up",
              desc: "Create your account in minutes. Our simple registration process gets you started quickly with just basic information about your business.",
              img: step1
            },
            {
              step: "2",
              title: "Add Clients & Items",
              desc: "Easily add your clients and inventory items to the system. Organize your business contacts and products in one centralized location.",
              img: step2
            },
            {
              step: "3",
              title: "Start Billing & Financial Reporting",
              desc: "Generate professional invoices and manage your financial reports with ease. Our automated system handles calculations and compliance for you.",
              img: step3
            }].map((stepData, idx) => (
              <Col xs={12} md={6} lg={4} key={idx}>
                <motion.div
                  className="d-flex flex-column align-items-center text-center h-100"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <div className="position-relative mb-4">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '192px',
                        height: '192px',
                        backgroundColor: '#e6f3f5',
                      }}
                    >
                      <div
                        className="rounded-circle overflow-hidden"
                        style={{ width: '160px', height: '160px' }}
                      >
                        <img
                          src={stepData.img}
                          alt={stepData.title}
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                    </div>
                    <div
                      className="position-absolute top-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#2a8e9c',
                        transform: 'translate(25%, -25%)',
                      }}
                    >
                      <span
                        className="text-white fw-bold"
                        style={{ fontSize: '1.5rem' }}
                      >
                        {stepData.step}
                      </span>
                    </div>
                  </div>
                  <h3 className="h5 fw-bold mb-3" style={{ color: '#023347' }}>
                    {stepData.title}
                  </h3>
                  <p className="text-muted px-2" style={{ maxWidth: '350px' }}>
                    {stepData.desc}
                  </p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Key Features Section */}
      <section className="py-4" style={{ backgroundColor: '#e6f3f5' }}>
        <Container>
          <h1 className="text-center fw-bold mb-5" style={{ color: '#023347' }}>
            Key Features
          </h1>
          <Row className="g-4">
            {features.map((feature, idx) => (
              <Col xs={12} md={6} lg={4} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="text-center h-100 d-flex flex-column align-items-center"
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mb-4"
                    style={{
                      backgroundColor: '#e6f3f5',
                      width: '192px',
                      height: '192px',
                    }}
                  >
                    <div
                      className="rounded-circle overflow-hidden"
                      style={{ width: '160px', height: '160px' }}
                    >
                      <img
                        src={feature.img}
                        alt={feature.title}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                  </div>
                  <h5 className="fw-bold mb-3" style={{ color: '#023347' }}>
                    {feature.title}
                  </h5>
                  <p className="text-muted flex-grow-1" style={{ fontSize: '14px', maxWidth: '350px' }}>
                    {feature.desc}
                  </p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* === FAQ SECTION === */}
      <div className="py-4" id="faq-section" style={{ backgroundColor: '#f0f7f8' }}>
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: '#023347' }}>Frequently Asked Questions</h2>
            <p className="text-muted">
              Everything you need to know about our business management software
            </p>
          </div>
          <Row className="justify-content-center">
            <Col xs={12} lg={10} xl={8} style={{ width: '90%', maxWidth: '90%' }} className="mx-auto">
              {[
                {
                  question: "Can I manage customers and vendors from one dashboard?",
                  answer: "Yes! Accounting's Client & Vendor Hub lets you track balances, set credit periods, and manage all transactions in one place — making relationship management effortless and organized."
                },
                {
                  question: "Does the software support multiple warehouse locations?",
                  answer: "Absolutely. You can manage stock across different warehouses — track batches, set expiry dates, use barcodes, and even apply automated valuation methods like FIFO for accurate inventory control."
                },
                {
                  question: "Can I assign different access levels to my team members?",
                  answer: "Yes. With Role-Based Access Control, you can define custom permissions for each user — whether they handle finance, inventory, or sales — ensuring data security while enabling smooth collaboration."
                },
                {
                  question: "Are vouchers automated or do I have to create them manually?",
                  answer: "You can do both. Create vouchers manually or let the system auto-generate them with unique numbering. Every entry includes a full audit trail for transparency and easy tracking."
                },
                {
                  question: "Can I generate real-time business reports?",
                  answer: "Definitely. Get instant insights with reports on sales, inventory, cash flow, and profit & loss. All reports are visual, exportable, and updated in real time to help you make smarter decisions."
                },
                {
                  question: "Can I organize products by category, brand, and SKU?",
                  answer: "Yes. Each product can be fully customized — add descriptions, set min/max stock levels, assign valuation methods, and categorize by brand or SKU for easy search and management."
                }
              ].map((item, index) => (
                <Card key={index} className="mb-3">
                  <Card.Header
                    style={{ backgroundColor: '#e6f3f5', cursor: 'pointer' }}
                    onClick={() => handleToggle(index.toString())}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0" style={{ color: '#023347' }}>{item.question}</h5>
                      <span style={{ color: '#2a8e9c' }}>{activeKey === index.toString() ? '−' : '+'}</span>
                    </div>
                  </Card.Header>
                  {activeKey === index.toString() && (
                    <Card.Body style={{ backgroundColor: '#e6f3f5', borderRadius: '0 0 8px 8px' }}>
                      {item.answer}
                    </Card.Body>
                  )}
                </Card>
              ))}
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Overview;