import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import abtimg from '../../../assets/abt-img.jpeg';
import {
  faCheckCircle,
  faLightbulb,
  faShieldAlt,
  faComments,
  faArrowRight,
  faEnvelope,
  faMapMarkerAlt,
  faPhoneAlt,
  faUserShield,
  faUsers,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faTwitter, faGithub, faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';

// Import Bootstrap components
import { Container, Row, Col, Button } from 'react-bootstrap';

const Aboutus = () => {
  useEffect(() => {
    AOS.init({ duration: 1200, once: true, easing: "ease-in-out" });
  }, []);

  return (
    <div className="min-vh-100 bg-white d-flex flex-column">
      {/* About Us Hero Section */}
      <section
        className="py-4 py-md-5 overflow-hidden"
        style={{ backgroundColor: '#f0f7f8', fontFamily: 'Segoe UI, sans-serif', color: '#333' }}
      >
        <Container>
          <Row className="align-items-center">
            {/* Left Column - Text Content */}
            <Col lg={6} data-aos="fade-right" className="mb-4 mb-lg-0">
              <h2
                className="fw-bold mb-4 text-center text-md-start"
                style={{ color: '#023347', fontSize: '2.8rem' }}
              >
                About Us
              </h2>
              <div
                className="w-25 mb-4 mx-auto mx-md-0"
                style={{ height: '2px', backgroundColor: '#2a8e9c' }}
              ></div>

              <p className="mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                At Accounting, we're committed to making business management simple, smart, and seamless for companies of all sizes. Since 2018, we've empowered businesses with a powerful, intuitive platform that brings together accounting, inventory, sales, and customer management in one unified system.
              </p>
              <Row className="g-3">
                <Col sm={6}>
                  <div className="d-flex">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: '48px', height: '48px', backgroundColor: 'rgba(2, 51, 71, 0.1)' }}>
                      <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#2a8e9c', fontSize: '1.25rem' }} />
                    </div>
                    <div>
                      <h3 className="h5 fw-semibold mb-1" style={{ color: '#023347' }}>Accuracy</h3>
                      <p className="small mb-0" style={{ color: '#333' }}>Precise financial tracking and error-free reporting for reliable decision-making.</p>
                    </div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="d-flex">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: '48px', height: '48px', backgroundColor: 'rgba(2, 51, 71, 0.1)' }}>
                      <FontAwesomeIcon icon={faLightbulb} style={{ color: '#2a8e9c', fontSize: '1.25rem' }} />
                    </div>
                    <div>
                      <h3 className="h5 fw-semibold mb-1" style={{ color: '#023347' }}>Simplicity</h3>
                      <p className="small mb-0" style={{ color: '#333' }}>A clean, user-friendly interface with intelligent workflows designed for speed and ease.</p>
                    </div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="d-flex">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: '48px', height: '48px', backgroundColor: 'rgba(2, 51, 71, 0.1)' }}>
                      <FontAwesomeIcon icon={faShieldAlt} style={{ color: '#2a8e9c', fontSize: '1.25rem' }} />
                    </div>
                    <div>
                      <h3 className="h5 fw-semibold mb-1" style={{ color: '#023347' }}>Compliance Ready</h3>
                      <p className="small mb-0" style={{ color: '#333' }}>Built-in tools to stay aligned with evolving business standards and regulatory requirements.</p>
                    </div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="d-flex">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: '48px', height: '48px', backgroundColor: 'rgba(2, 51, 71, 0.1)' }}>
                      <FontAwesomeIcon icon={faComments} style={{ color: '#2a8e9c', fontSize: '1.25rem' }} />
                    </div>
                    <div>
                      <h3 className="h5 fw-semibold mb-1" style={{ color: '#023347' }}>Bilingual Support</h3>
                      <p className="small mb-0" style={{ color: '#333' }}>Full support in multiple languages — because your business deserves to grow without language barriers.</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>

            {/* Right Column - Image */}
            <Col lg={6} data-aos="fade-left">
              <div className="position-relative">
                <img
                  src={abtimg}
                  alt="GST Accounting Dashboard"
                  className="img-fluid rounded shadow-lg w-100"
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    borderRadius: '20px',
                    boxShadow: '0 4px 12px rgba(2, 51, 71, 0.2)',
                    transition: "transform 0.4s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Our Team Section */}
      <section className="py-4 py-md-5" style={{ backgroundColor: "#e6f3f5" }}>
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3" style={{ color: '#023347', fontSize: '2.5rem' }}>Our Leadership Team</h2>
            <div className="w-25 mx-auto mb-4" style={{ height: '2px', backgroundColor: '#2a8e9c' }}></div>
            <p className="lead mx-auto" style={{ color: '#333', maxWidth: '800px' }}>
              Meet the experienced professionals behind our innovative GST accounting solutions
            </p>
          </div>
          <Row className="g-4 justify-content-center">
            {/* Team Member 1 */}
            <Col md={6} lg={4} data-aos="fade-up" data-aos-delay="100">
              <div className="card h-100 border-0 shadow-sm" style={{ 
                backgroundColor: '#fff',
                borderRadius: '15px',
                overflow: 'hidden',
                transition: "transform 0.4s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0px)"}>
                <div className="mx-auto mt-3 overflow-hidden" style={{ width: '200px', height: '200px', borderRadius: '50%' }}>
                  <img
                    src="https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20a%20confident%20female%20CEO%20in%20her%2040s%20with%20short%20dark%20hair%2C%20wearing%20a%20brown%20business%20suit%20against%20a%20neutral%20background.%20She%20has%20a%20warm%20smile%20and%20professional%20demeanor.%20High%20quality%2C%20corporate%20photography%20style%20with%20soft%20lighting%20and%20shallow%20depth%20of%20field&width=400&height=400&seq=123457&orientation=squarish"
                    alt="Sarah Johnson, CEO"
                    className="img-fluid w-100 h-100 object-fit-cover"
                  />
                </div>
                <div className="card-body text-center py-3">
                  <h3 className="h4 fw-semibold mb-1" style={{ color: '#023347' }}>Sarah Johnson</h3>
                  <p className="fw-medium mb-2" style={{ color: '#333' }}>Chief Executive Officer</p>
                  <p className="card-text mb-3" style={{ color: '#555' }}>
                    With over 15 years in financial technology, Sarah leads our vision for simplified tax compliance.
                  </p>
                  <div className="d-flex justify-content-center">
                    <a href="#" className="mx-2 text-decoration-none" style={{ color: '#2a8e9c' }}>
                      <FontAwesomeIcon icon={faLinkedin} size="lg" />
                    </a>
                    <a href="#" className="mx-2 text-decoration-none" style={{ color: '#2a8e9c' }}>
                      <FontAwesomeIcon icon={faTwitter} size="lg" />
                    </a>
                  </div>
                </div>
              </div>
            </Col>
            {/* Team Member 2 */}
            <Col md={6} lg={4} data-aos="fade-up" data-aos-delay="200">
              <div className="card h-100 border-0 shadow-sm" style={{ 
                backgroundColor: '#fff',
                borderRadius: '15px',
                overflow: 'hidden',
                transition: "transform 0.4s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0px)"}>
                <div className="mx-auto mt-3 overflow-hidden" style={{ width: '200px', height: '200px', borderRadius: '50%' }}>
                  <img
                    src="https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20a%20male%20CTO%20in%20his%2030s%20with%20glasses%20and%20short%20beard%2C%20wearing%20a%20brown%20button-up%20shirt%20against%20a%20neutral%20background.%20He%20has%20a%20thoughtful%20expression%20and%20technical%20demeanor.%20High%20quality%2C%20corporate%20photography%20style%20with%20soft%20lighting%20and%20shallow%20depth%20of%20field&width=400&height=400&seq=123458&orientation=squarish"
                    alt="Michael Chen, CTO"
                    className="img-fluid w-100 h-100 object-fit-cover"
                  />
                </div>
                <div className="card-body text-center py-3">
                  <h3 className="h4 fw-semibold mb-1" style={{ color: '#023347' }}>Michael Chen</h3>
                  <p className="fw-medium mb-2" style={{ color: '#333' }}>Chief Technology Officer</p>
                  <p className="card-text mb-3" style={{ color: '#555' }}>
                    Michael's expertise in AI and machine learning drives our innovative approach to tax automation.
                  </p>
                  <div className="d-flex justify-content-center">
                    <a href="#" className="mx-2 text-decoration-none" style={{ color: '#2a8e9c' }}>
                      <FontAwesomeIcon icon={faLinkedin} size="lg" />
                    </a>
                    <a href="#" className="mx-2 text-decoration-none" style={{ color: '#2a8e9c' }}>
                      <FontAwesomeIcon icon={faGithub} size="lg" />
                    </a>
                  </div>
                </div>
              </div>
            </Col>
            {/* Team Member 3 */}
            <Col md={6} lg={4} data-aos="fade-up" data-aos-delay="300">
              <div className="card h-100 border-0 shadow-sm" style={{ 
                backgroundColor: '#fff',
                borderRadius: '15px',
                overflow: 'hidden',
                transition: "transform 0.4s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0px)"}>
                <div className="mx-auto mt-3 overflow-hidden" style={{ width: '200px', height: '200px', borderRadius: '50%' }}>
                  <img
                    src="https://readdy.ai/api/search-image?query=Professional%20portrait%20of%20a%20female%20CFO%20in%20her%2050s%20with%20shoulder-length%20blonde%20hair%2C%20wearing%20a%20brown%20blazer%20against%20a%20neutral%20background.%20She%20has%20a%20confident%20expression%20and%20professional%20demeanor.%20High%20quality%2C%20corporate%20photography%20style%20with%20soft%20lighting%20and%20shallow%20depth%20of%20field&width=400&height=400&seq=123459&orientation=squarish"
                    alt="Amanda Patel, CFO"
                    className="img-fluid w-100 h-100 object-fit-cover"
                  />
                </div>
                <div className="card-body text-center py-3">
                  <h3 className="h4 fw-semibold mb-1" style={{ color: '#023347' }}>Amanda Patel</h3>
                  <p className="fw-medium mb-2" style={{ color: '#333' }}>Chief Financial Officer</p>
                  <p className="card-text mb-3" style={{ color: '#555' }}>
                    Amanda brings 20+ years of accounting expertise, ensuring our solutions meet real-world financial needs.
                  </p>
                  <div className="d-flex justify-content-center">
                    <a href="#" className="mx-2 text-decoration-none" style={{ color: '#2a8e9c' }}>
                      <FontAwesomeIcon icon={faLinkedin} size="lg" />
                    </a>
                    <a href="#" className="mx-2 text-decoration-none" style={{ color: '#2a8e9c' }}>
                      <FontAwesomeIcon icon={faEnvelope} size="lg" />
                    </a>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Our Story Section */}
      <section className="py-4 py-md-5" style={{ backgroundColor: "#fff" }}>
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={6} className="order-2 order-lg-1" data-aos="fade-right">
              <img
                src="https://readdy.ai/api/search-image?query=A%20modern%20office%20space%20with%20warm%20brown%20tones%20showing%20a%20diverse%20team%20collaborating%20on%20GST%20accounting%20software.%20The%20scene%20shows%20professionals%20working%20together%20at%20a%20conference%20table%20with%20laptops%20and%20financial%20documents.%20The%20office%20has%20wooden%20elements%20and%20warm%20lighting%20with%20colors%20854836%2C%205C3D2E%2C%20and%202D1810.%20Photorealistic%2C%20professional%20corporate%20photography&width=600&height=400&seq=123460&orientation=landscape"
                alt="Our Company Story"
                className="img-fluid rounded shadow-lg w-100"
                style={{ 
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(2, 51, 71, 0.2)',
                  transition: "transform 0.4s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              />
            </Col>
            <Col lg={6} className="order-1 order-lg-2" data-aos="fade-left">
              <div className="text-center text-md-start mx-2">
                <h2
                  className="fw-bold mb-3"
                  style={{ color: '#023347', fontSize: '2.5rem' }}
                >
                  Our Story
                </h2>

                <div
                  className="w-25 mb-4 mx-auto mx-md-0"
                  style={{ height: '2px', backgroundColor: '#2a8e9c' }}
                ></div>
              </div>

              <p className="mb-3" style={{ color: '#333', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Founded in 2018, Accounting was created with one goal: to simplify how businesses manage their finances and inventory — so owners can focus on growth, not paperwork.
              </p>
              <p className="mb-3" style={{ color: '#333', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Our team of software engineers and business automation experts built a platform that brings accounting, inventory, and customer management together — intelligently, accurately, and effortlessly.
              </p>
              <p className="mb-4" style={{ color: '#333', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Today, over 10,000 businesses — from local shops to growing enterprises — rely on Accounting to streamline operations, reduce manual work, and make smarter decisions with real-time data.
              </p>
              <Row className="g-3">
                <Col sm={4}>
                  <div className="p-3 rounded flex-grow-1 text-center text-md-start" style={{ backgroundColor: 'rgba(2, 51, 71, 0.1)' }}>
                    <div className="h4 fw-bold mb-1" style={{ color: '#023347', fontSize: '1.5rem' }}>7+</div>
                    <div className="small text-muted" style={{ color: '#2a8e9c', fontWeight: '500' }}>Years of Innovation</div>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="p-3 rounded flex-grow-1 text-center text-md-start" style={{ backgroundColor: 'rgba(2, 51, 71, 0.1)' }}>
                    <div className="h4 fw-bold mb-1" style={{ color: '#023347', fontSize: '1.5rem' }}>10,000+</div>
                    <div className="small text-muted" style={{ color: '#2a8e9c', fontWeight: '500' }}>Businesses Empowered</div>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="p-3 rounded flex-grow-1 text-center text-md-start" style={{ backgroundColor: 'rgba(2, 51, 71, 0.1)' }}>
                    <div className="h4 fw-bold mb-1" style={{ color: '#023347', fontSize: '1.5rem' }}>98%</div>
                    <div className="small text-muted" style={{ color: '#2a8e9c', fontWeight: '500' }}>User Satisfaction</div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Values Section */}
      <section className="py-4 py-md-5 mb-4" style={{ backgroundColor: '#e6f3f5' }}>
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: '#023347', fontSize: '2.5rem' }}>Our Core Values</h2>
            <p className="lead" style={{ color: '#333' }}>The principles that guide everything we do</p>
          </div>
          <Row className="g-4">
            {[
              {
                icon: faUserShield,
                title: "Integrity",
                points: [
                  "Highest standards of honesty",
                  "Transparent operations",
                  "Strong ethical practices"
                ]
              },
              {
                icon: faLightbulb,
                title: "Innovation",
                points: [
                  "Continuous product improvement",
                  "Modern tax tools",
                  "Automation-first mindset"
                ]
              },
              {
                icon: faUsers,
                title: "Customer Focus",
                points: [
                  "Client success is our priority",
                  "Tailored software solutions",
                  "24/7 support"
                ]
              },
              {
                icon: faChartLine,
                title: "Excellence",
                points: [
                  "Best-in-class performance",
                  "Reliable infrastructure",
                  "Dedicated team"
                ]
              }
            ].map((card, index) => (
              <Col md={6} lg={3} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <div
                  className="p-4 rounded-4 h-100 shadow-sm"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid rgba(2, 51, 71, 0.15)',
                    transition: "transform 0.4s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
                  onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0px)"}
                >
                  <div
                    className="d-flex align-items-center justify-content-center mx-auto rounded-circle mb-3"
                    style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: 'rgba(2, 51, 71, 0.1)',
                      border: '2px solid rgba(2, 51, 71, 0.2)'
                    }}
                  >
                    <FontAwesomeIcon icon={card.icon} style={{ color: '#2a8e9c', fontSize: '1.5rem' }} />
                  </div>
                  <h5 className="fw-bold text-center mb-3" style={{ color: '#023347' }}>{card.title}</h5>
                  <ul className="list-unstyled ps-2 mb-0" style={{color: '#555'}}>
                    {card.points.map((pt, i) => (
                      <li key={i} className="mb-2 d-flex align-items-start">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-2 mt-1 flex-shrink-0" style={{ color: '#2a8e9c', width: '16px' }} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Aboutus;