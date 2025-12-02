import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram
} from "react-icons/fa";
import { motion } from "framer-motion";
import logoziratech from "../../../assets/logo.png";
import "./Footer.css";

/* ===== Motion Variants ===== */
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: 0.3, duration: 0.5 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const iconHover = { y: -3, color: "#2e7a66", transition: { duration: 0.2 } };
const linkHover = { x: 5, color: "#2e7a66", transition: { duration: 0.2 } };

export default function Footer() {
  return (
    <motion.footer
      className="site-footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true,}}
    >
      <motion.div variants={containerVariants}>
        <div className="p-5">
          {/* Top Columns */}
          <Row className="mb-4">
            {/* Brand */}
            <Col md={3} className="mb-4 mb-md-0">
              <motion.div variants={itemVariants}>
                {/* <h5 className="d-flex align-items-center mb-0">
                  <img
                    src={logoziratech}
                    alt="BookKeeper Logo"
                    width={120}
                    height={40}
                    style={{ marginRight: "8px" }}
                  />
                </h5> */}
                <motion.p
                  className="footer-brand-copy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Simplifying GST accounting for businesses since 2020.
                </motion.p>
                <div className="d-flex gap-3 footer-social">
                  <motion.span whileHover={iconHover}>
                    <FaFacebookF className="social-icon" />
                  </motion.span>
                  <motion.span whileHover={iconHover}>
                    <FaTwitter className="social-icon" />
                  </motion.span>
                  <motion.span whileHover={iconHover}>
                    <FaLinkedinIn className="social-icon" />
                  </motion.span>
                  <motion.span whileHover={iconHover}>
                    <FaInstagram className="social-icon" />
                  </motion.span>
                </div>
              </motion.div>
            </Col>

            {/* Product */}
            <Col md={3} className="mb-4 mb-md-0">
              <motion.h6
                variants={itemVariants}
                className="footer-heading"
              >
                Product
              </motion.h6>
              <ul className="footer-list">
                <motion.li variants={itemVariants}>
                  <motion.div whileHover={linkHover}>
                    <Link to="/features" className="footer-link">
                      Features
                    </Link>
                  </motion.div>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <motion.div whileHover={linkHover}>
                    <Link to="/pricing" className="footer-link">
                      Pricing
                    </Link>
                  </motion.div>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <motion.div whileHover={linkHover}>
                    <a href="#" className="footer-link">
                      Integrations
                    </a>
                  </motion.div>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <motion.div whileHover={linkHover}>
                    <a href="#" className="footer-link">
                      Updates
                    </a>
                  </motion.div>
                </motion.li>
              </ul>
            </Col>

            {/* Resources */}
            <Col md={3} className="mb-4 mb-md-0">
              <motion.h6
                variants={itemVariants}
                className="footer-heading"
              >
                Resources
              </motion.h6>
              <ul className="footer-list">
                <motion.li variants={itemVariants}>
                  <motion.div whileHover={linkHover}>
                    <a href="#" className="footer-link">
                      Documentation
                    </a>
                  </motion.div>
                </motion.li>
                
                <motion.li variants={itemVariants}>
                  <motion.div whileHover={linkHover}>
                    <a href="#" className="footer-link">
                      Support
                    </a>
                  </motion.div>
                </motion.li>
              </ul>
            </Col>

            {/* Company */}
            <Col md={3} className="mb-4 mb-md-0">
              <motion.h6
                variants={itemVariants}
                className="footer-heading"
              >
                Company
              </motion.h6>
              <ul className="footer-list">
                <motion.li variants={itemVariants}>
                  <motion.div whileHover={linkHover}>
                    <Link to="/aboutus" className="footer-link">
                      About Us
                    </Link>
                  </motion.div>
                </motion.li>
               
                <motion.li variants={itemVariants}>
                  <motion.div whileHover={linkHover}>
                    <Link to="/contact" className="footer-link">
                      Contact
                    </Link>
                  </motion.div>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <motion.div whileHover={linkHover}>
                    <a href="#" className="footer-link">
                      Privacy Policy
                    </a>
                  </motion.div>
                </motion.li>
              </ul>
            </Col>
          </Row>

          {/* Divider */}
          <motion.hr
            className="footer-hr"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />

          {/* Newsletter + Payments */}
          <Row className="mb-3 align-items-start">
            <Col md={6} className="mb-4 mb-md-0">
              <motion.div variants={itemVariants}>
                <h6 className="footer-newsletter-label">
                  Subscribe to our newsletter
                </h6>
                <div className="d-flex mt-2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    style={{ flexGrow: 1 }}
                  >
                    <Form.Control
                      type="email"
                      placeholder="Your email address"
                      className="footer-newsletter-input"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="ms-1 footer-newsletter-button">
                      Subscribe
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </Col>

            <Col
              md={6}
              className="text-md-end mt-3 mt-md-0 footer-payment-logos d-flex justify-content-md-end justify-content-start"
            >
              <motion.div variants={itemVariants} className="d-flex">
                <motion.div whileHover={{ y: -3 }}>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                    alt="Visa"
                    width="40"
                    className="me-2"
                  />
                </motion.div>
                <motion.div whileHover={{ y: -3 }}>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                    alt="Mastercard"
                    width="40"
                    className="me-2"
                  />
                </motion.div>
                <motion.div whileHover={{ y: -3 }}>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                    alt="PayPal"
                    width="40"
                  />
                </motion.div>
              </motion.div>
            </Col>
          </Row>

          {/* Divider */}
          <motion.hr
            className="footer-hr"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
          />

          {/* Bottom Legal */}
          <Row className="pt-2 align-items-center">
            <Col md={6} className="mb-2 mb-md-0" style={{ fontSize: "12px" }}>
              <motion.div variants={itemVariants}>
                © 2025 ZirakBooks. All rights reserved.
              </motion.div>
            </Col>
            <Col
              md={6}
              className="text-md-end footer-legal-links d-flex justify-content-md-end justify-content-start gap-3"
              style={{ fontSize: "12px" }}
            >
              <motion.span variants={itemVariants} whileHover={{ color: "#2e7a66" }}>
                Terms of Service
              </motion.span>
              <span className="separator">|</span>
              <motion.span variants={itemVariants} whileHover={{ color: "#2e7a66" }}>
                Privacy Policy  ...
              </motion.span> 
              <span className="separator">|</span>
              <motion.span variants={itemVariants} whileHover={{ color: "#2e7a66" }}>
                Cookies
              </motion.span>
            </Col>
          </Row>
        </div>
      </motion.div>
    </motion.footer>
  );
}
