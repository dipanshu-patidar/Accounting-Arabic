import React, { useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import {
  FaArrowUp,
  FaFileContract,
  FaHandshake,
  FaLock,
  FaBalanceScale,
  FaGlobe,
} from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

const TermsConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on page load
    AOS.init({ duration: 1200, once: true, easing: "ease-in-out" });
  }, []);

  return (
    <div className="terms-page" style={{ backgroundColor: '#f0f7f8', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', color: '#333' }}>
      {/* Hero Section */}
      <section
        className="py-5 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #023347 0%, #2a8e9c 100%)',
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100 opacity-10"
          style={{
            backgroundColor: '#ffffff',
            backgroundSize: '60px 60px',
          }}
        ></div>
        <Container fluid className="text-center position-relative px-4 px-md-5">
          <FaFileContract size={70} className="mb-4" style={{ color: '#e6f3f5' }} />
          <h1 className="display-4 fw-bold mb-3" style={{ color: '#ffffff' }}>Terms & Conditions</h1>
          <p className="lead opacity-75 fs-5" style={{ color: '#ffffff' }}>
            Please read these terms carefully before using Accounting services.
          </p>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-5">
        <Container fluid className="px-4 px-md-5">
          <Row className="justify-content-center">
            <Col lg={12}>
              <div
                className="bg-white p-4 p-md-5 rounded-4 shadow-sm border"
                style={{
                  border: '1px solid rgba(2, 51, 71, 0.2)',
                  boxShadow: '0 8px 30px rgba(2, 51, 71, 0.1)',
                }}
              >
                <div className="text-muted small text-end mb-5">
                  Last Updated: <strong>May 28, 2025</strong>
                </div>

                {/* Section 1 */}
                <section className="mb-5" data-aos="fade-right">
                  <h2 className="fw-bold border-bottom pb-3 mb-4 d-flex align-items-center gap-2" style={{ borderColor: '#023347', fontSize: '1.5rem', color: '#023347' }}>
                    <FaHandshake style={{ color: '#023347' }} />
                    Acceptance of Terms
                  </h2>
                  <p className="fs-5">
                    By accessing or using the Accounting software or website ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with any part of the terms, you may not access the Service.
                  </p>
                </section>

                {/* Section 2 */}
                <section className="mb-5" data-aos="fade-left">
                  <h2 className="fw-bold border-bottom pb-3 mb-4 d-flex align-items-center gap-2" style={{ borderColor: '#023347', fontSize: '1.5rem', color: '#023347' }}>
                    <FaLock style={{ color: '#023347' }} />
                    Subscription & Payments
                  </h2>
                  <p className="fs-5">
                    Access to premium features requires a paid subscription. You agree to pay all fees as specified at the time of purchase. All fees are non-refundable except as expressly stated in our Refund Policy.
                  </p>
                  <p className="fs-5">
                    We use third-party payment processors (Razorpay, Stripe, etc.). You agree to their terms as well.
                  </p>
                </section>

                {/* Section 3 */}
                <section className="mb-5" data-aos="fade-right">
                  <h2 className="fw-bold border-bottom pb-3 mb-4 d-flex align-items-center gap-2" style={{ borderColor: '#023347', fontSize: '1.5rem', color: '#023347' }}>
                    <FaBalanceScale style={{ color: '#023347' }} />
                    Intellectual Property
                  </h2>
                  <p className="fs-5">
                    The Service and its original content, features, and functionality are owned by Accounting and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                  <p className="fs-5">
                    You are granted a limited, non-exclusive, non-transferable license to access and use the Service — not to copy, modify, or redistribute it.
                  </p>
                </section>

                {/* Section 4 */}
                <section className="mb-5" data-aos="fade-left">
                  <h2 className="fw-bold border-bottom pb-3 mb-4 d-flex align-items-center gap-2" style={{ borderColor: '#023347', fontSize: '1.5rem', color: '#023347' }}>
                    <FaGlobe style={{ color: '#023347' }} />
                    Limitation of Liability
                  </h2>
                  <p className="fs-5">
                    In no event shall Accounting, its affiliates, or licensors be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service.
                  </p>
                  <p className="fs-5">
                    Our total liability to you for any claim under these Terms shall not exceed the amount you paid us in the 6 months prior to the event giving rise to the claim.
                  </p>
                </section>

                {/* Section 5 */}
                <section className="mb-5" data-aos="fade-right">
                  <h2 className="fw-bold border-bottom pb-3 mb-4 d-flex align-items-center gap-2" style={{ borderColor: '#023347', fontSize: '1.5rem', color: '#023347' }}>
                    <FaFileContract style={{ color: '#023347' }} />
                    Governing Law
                  </h2>
                  <p className="fs-5">
                    These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                  </p>
                  <p className="fs-5">
                    Any dispute shall be subject to the exclusive jurisdiction of courts in Gurugram, Haryana, India.
                  </p>
                </section>

                {/* Section 6 */}
                <section className="mb-5" data-aos="fade-left">
                  <h2 className="fw-bold border-bottom pb-3 mb-4 d-flex align-items-center gap-2" style={{ borderColor: '#023347', fontSize: '1.5rem', color: '#023347' }}>
                    <FaArrowUp style={{ color: '#023347' }} />
                    Changes to Terms
                  </h2>
                  <p className="fs-5">
                    We reserve the right to modify or replace these Terms at any time. We will notify you of material changes via email or in-app notification.
                  </p>
                  <p className="fs-5">
                    By continuing to access or use the Service after changes become effective, you agree to be bound by the revised Terms.
                  </p>
                </section>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Back to Top Button */}
      <Button
        variant="primary"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="position-fixed bottom-0 end-0 m-4 rounded-circle p-3 shadow-lg"
        style={{
          backgroundColor: '#023347',
          borderColor: '#023347',
          zIndex: 1000,
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.backgroundColor = '#2a8e9c';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = '#023347';
        }}
      >
        <FaArrowUp size={20} style={{ color: '#ffffff' }} />
      </Button>
    </div>
  );
};

export default TermsConditions;