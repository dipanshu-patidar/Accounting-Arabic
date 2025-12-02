import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationCircle,
  faSpinner,
  faPaperPlane,
  faMapMarkerAlt,
  faPhoneAlt,
  faEnvelope,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

// Import Bootstrap components
import { Container, Row, Col, Button, Form, Alert } from 'react-bootstrap';

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Initialize AOS
    AOS.init({ duration: 1200, once: true, easing: "ease-in-out" });
    setIsVisible(true);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState('idle');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormStatus('submitting');

    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', message: '' });

      setTimeout(() => {
        setFormStatus('idle');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ fontFamily: 'Segoe UI, sans-serif', color: '#333' }}>

      {/* Header */}
      <header className="py-5 text-white position-relative" style={{
        background: 'linear-gradient(to right, #023347, #2a8e9c)',
        overflow: 'hidden'
      }}>
        <Container>
          <Row className="align-items-center g-4">
            {/* Text Section (Left) */}
            <Col lg={6} className="mb-4 mb-lg-0 text-center text-lg-start" data-aos="fade-right">
              <h1 className="display-4 fw-bold mb-3">
                Award Winning Customer Support
              </h1>
              <p className="lead" style={{ maxWidth: "600px", lineHeight: '1.7' }}>
                All our customers get unbiased unconditional love forever with no
                limitations. Help is free and you'll directly be connected to a real,
                live human. We promise to reply to your query within 24 working hours.
              </p>
            </Col>

            {/* Image Section (Right) */}
            <Col lg={6} className="text-center" data-aos="fade-left">
              <img
                src="https://i.ibb.co/PHRBLCp/image-removebg-preview-8.png"
                alt="Customer Support"
                className="img-fluid"
                style={{ maxHeight: "350px", objectFit: 'contain' }}
              />
            </Col>
          </Row>
        </Container>
      </header>

      {/* Main Content */}
      <div className="p-3 p-md-5 flex-grow-1" style={{ backgroundColor: '#e6f3f5' }}>
        <Container>
          <Row className="justify-content-center g-4">
            {/* Contact Form */}
            <Col lg={8}>
              <div className="bg-white rounded-4 shadow-lg p-4 p-md-5 h-100"
                style={{ borderTop: '5px solid #023347', transition: 'transform 0.3s ease' }}
                data-aos="zoom-in"
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h2 className="h2 fw-bold mb-4 text-center text-md-start" style={{ color: '#023347' }}>
                  Have a Query? Let Us Know
                </h2>

                {formStatus === 'success' && (
                  <Alert variant="success" className="d-flex align-items-center mb-4" data-aos="fade-down">
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    <span>Thank you! Your message has been sent successfully.</span>
                  </Alert>
                )}

                {formStatus === 'error' && (
                  <Alert variant="danger" className="d-flex align-items-center mb-4" data-aos="fade-down">
                    <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                    <span>Something went wrong. Please try again later.</span>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4" data-aos="fade-up" data-aos-delay="100">
                    <Form.Label className="fw-medium">
                      Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      isInvalid={!!errors.name}
                      placeholder="Your name"
                      style={{ borderRadius: '12px' }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4" data-aos="fade-up" data-aos-delay="200">
                    <Form.Label className="fw-medium">
                      Email <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      placeholder="your.email@example.com"
                      style={{ borderRadius: '12px' }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4" data-aos="fade-up" data-aos-delay="300">
                    <Form.Label className="fw-medium">
                      Message <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      isInvalid={!!errors.message}
                      placeholder="How can we help you?"
                      style={{ borderRadius: '12px' }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="w-100 py-3 fw-bold rounded-pill"
                    style={{ backgroundColor: '#023347', color: 'white', fontSize: '1.1rem', border: 'none' }}
                    data-aos="fade-up" data-aos-delay="400"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a8e9c'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#023347'}
                  >
                    {formStatus === 'submitting' ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>

          {/* Contact Information Section */}
          <Row className="mt-5 g-4">
            <Col md={4} data-aos="fade-up" data-aos-delay="100">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100 text-center"
                style={{ transition: "transform 0.4s ease" }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0px)"}
              >
                <div className="mb-3">
                  <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" style={{ color: '#2a8e9c' }} />
                </div>
                <h5 className="fw-bold mb-2" style={{ color: '#023347' }}>Our Location</h5>
                <p className="text-muted">123 Business Avenue, Suite 100<br />New York, NY 10001</p>
              </div>
            </Col>

            <Col md={4} data-aos="fade-up" data-aos-delay="200">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100 text-center"
                style={{ transition: "transform 0.4s ease" }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0px)"}
              >
                <div className="mb-3">
                  <FontAwesomeIcon icon={faPhoneAlt} size="2x" style={{ color: '#2a8e9c' }} />
                </div>
                <h5 className="fw-bold mb-2" style={{ color: '#023347' }}>Call Us</h5>
                <p className="text-muted">+1 (555) 123-4567<br />Mon-Fri 9am-6pm</p>
              </div>
            </Col>

            <Col md={4} data-aos="fade-up" data-aos-delay="300">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100 text-center"
                style={{ transition: "transform 0.4s ease" }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0px)"}
              >
                <div className="mb-3">
                  <FontAwesomeIcon icon={faEnvelope} size="2x" style={{ color: '#2a8e9c' }} />
                </div>
                <h5 className="fw-bold mb-2" style={{ color: '#023347' }}>Email Us</h5>
                <p className="text-muted">support@example.com<br />response within 24 hours</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

     
      {/* Floating WhatsApp Button */}
      <div className="position-fixed" style={{ bottom: '1.5rem', right: '1.5rem', zIndex: 50 }} data-aos="fade-left">
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-circle shadow d-flex align-items-center justify-content-center"
          style={{
            width: '5rem',
            height: '5rem',
            backgroundColor: '#25D366',
            color: 'white',
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 211, 102, 0.4)';
          }}
        >
          <FontAwesomeIcon icon={faWhatsapp} size="2x" />
        </a>
      </div>
    </div>
  );
};

export default Contact;