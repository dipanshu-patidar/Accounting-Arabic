import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import logo from "../../../assets/watheeq.jpeg";
import './Footer1.css';
import { FiLogOut } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Footer1 = () => {
  return (
    <footer className=" text-dark py-5 ">
      <Container>
        <Row className="g-4">
          {/* Column 1: Logo + Description + Copyright */}
          <Col xs={12} sm={6} md={3} className="text-start">

            <img
                src={logo}
                alt="Logo"
                width={80}
                height={40}
                className="navbar-logo-img mb-2"
              />
            {/* <h1 className="font-bold" style={{ color: "#023347" }}>Accounting</h1>             */}
            <p className="small text-dark opacity-75 mb-3 desc">
              Complete business management solution for accounts, inventory, and financial control.
            </p>
          </Col>

          {/* Column 2: Quick Links */}
          <Col xs={12} sm={6} md={3} className="text-start">
            <h5 className="fw-bold mb-4 pb-2 border-bottom" style={{ borderColor: '#023347', width: '50%', color: '#023347'}}>
              Quick Links
            </h5>
            <Nav className="flex-column gap-2 align-items-start">
              <Nav.Link href="/aboutus" className="small p-0 footer-link">
                About Us
              </Nav.Link>
              <Nav.Link href="/features" className="small p-0 footer-link">
                Features
              </Nav.Link>
              <Nav.Link href="/pricing" className="small p-0 footer-link">
                Pricing
              </Nav.Link>
              <Nav.Link href="/#faq-section" className="small p-0 footer-link">
                FAQ
              </Nav.Link>
            </Nav>

          </Col>

          {/* Column 3: Follow */}
          <Col xs={12} sm={6} md={3} className="text-start">
            <h5 className="fw-bold mb-4 pb-2 border-bottom" style={{ borderColor: '#023347', width: '50%', color: '#023347' }}>
              Follow
            </h5>
            <div>
              <div className="d-flex gap-3 justify-content-start flex-wrap">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-icon d-inline-flex align-items-center justify-content-center rounded-circle"
                  aria-label="Facebook"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#3b5998',
                    color: '#ffffff',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 89, 152, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <FaFacebookF size={20} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-icon d-inline-flex align-items-center justify-content-center rounded-circle"
                  aria-label="Twitter"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#1da1f2',
                    color: '#ffffff',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(29, 161, 242, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <FaTwitter size={20} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-icon d-inline-flex align-items-center justify-content-center rounded-circle"
                  aria-label="Instagram"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#e1306c',
                    color: '#ffffff',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(225, 48, 108, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <FaInstagram size={20} />
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-icon d-inline-flex align-items-center justify-content-center rounded-circle"
                  aria-label="WhatsApp"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#25d366',
                    color: '#ffffff',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(37, 211, 102, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <FaWhatsapp size={20} />
                </a>
              </div>
            </div>
          </Col>
        </Row>
        {/* Bottom Notice Bar */}
        <Row className="pt-4 mt-4 border-top" style={{ borderColor: '#ffff' }}>
          <Col md={6} className="mb-2 mb-md-0 d-flex flex-column flex-md-row align-items-start justify-content-start gap-3 gap-md-4">
            <small className="opacity-85 copyright">
              &copy; {new Date().getFullYear()} Accounting. All rights reserved.
            </small>
            <div className="d-flex gap-3">
              <Link to="/PrivacyPolicy" className="small text-decoration-none footer-link-inline">
                Privacy Policy
              </Link>
              <span className="text-secondary">|</span>
              <Link to="/TermsConditions" className="small text-decoration-none footer-link-inline">
                Terms & Conditions
              </Link>
            </div>
          </Col>
          <Col md={6} className="d-none d-md-flex justify-content-md-end">
            {/* This column is intentionally left empty on desktop for right alignment of the left content. On mobile, it disappears. */}
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer1;