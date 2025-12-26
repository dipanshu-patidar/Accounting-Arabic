import React from 'react';
import { Badge, Card, Col, Modal, Row, Button, Image } from 'react-bootstrap';

const ViewCustomerModal = ({ show, onHide, onExited, customer }) => {
  const getImageSrc = (image) => {
    if (!image) return null;
    if (typeof image === 'string') return image;
    if (image instanceof File) return URL.createObjectURL(image);
    return null;
  };

  const imageSrc = getImageSrc(customer?.idCardImage);

  return (
    <Modal show={show} onHide={onHide} onExited={onExited} size="lg" centered className="customer-modal">
      <Modal.Header closeButton className="modal-header-custom" style={{ background: "linear-gradient(135deg, #505ece 0%, #3d47b8 100%)", color: "white" }}>
        <Modal.Title style={{ color: "white" }}>Customer Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-start">
        {/* Circular Profile Image + Large Name — Left Aligned */}
        <div className="mb-4">
          {imageSrc && (
            <div className="mb-3 d-inline-block">
              <Image
                src={imageSrc}
                alt="ID Card"
                roundedCircle
                style={{ width: '100px', height: '100px', objectFit: 'cover', border: '2px solid #dee2e6' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <h2 className="text-primary" style={{ textAlign: 'left' }}>{customer?.name || "N/A"}</h2>
          {customer?.nameArabic && (
            <h5
              dir="rtl"
              style={{
                textAlign: 'left',
                fontFamily: 'Arial, sans-serif',
                color: '#555',
                marginTop: '0.25rem',
              }}
            >
              {customer.nameArabic}
            </h5>
          )}
        </div>

        {/* Basic Information */}
        <Card className="mb-3">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Basic Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p>
                  <strong>Name:</strong> {customer?.name || "N/A"}
                </p>
                <p>
                  <strong>Name (Arabic):</strong> {customer?.nameArabic || "N/A"}
                </p>
                <p>
                  <strong>Company Name:</strong> {customer?.companyName || "N/A"}
                </p>
                <p>
                  <strong>Contact:</strong> {customer?.contact || customer?.phone || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {customer?.email || "N/A"}
                </p>
                <p>
                  <strong>Account Type:</strong> {customer?.accountType || "Sundry Debtors"}
                </p>
              </Col>
              <Col md={6}>
                <p>
                  <strong>Account Name:</strong> {customer?.accountName || "Accounts Receivable"}
                </p>
                <p>
                  <strong>Balance:</strong> $
                  {parseFloat(customer?.balance || customer?.accountBalance || 0).toFixed(2)}
                </p>
                <p>
                  <strong>Tax Number:</strong> {customer?.taxNumber || customer?.gstin || "N/A"}
                </p>
                <p>
                  <strong>Tax Enabled:</strong>{" "}
                  <Badge
                    bg={customer?.taxEnabled || customer?.gstEnabled ? "success" : "secondary"}
                    className="ms-2"
                  >
                    {customer?.taxEnabled || customer?.gstEnabled ? "ON" : "OFF"}
                  </Badge>
                </p>
                <p>
                  <strong>Credit Period:</strong> {customer?.creditPeriod || "N/A"} days
                </p>
                <p>
                  <strong>Creation Date:</strong> {customer?.creationDate ? new Date(customer.creationDate).toLocaleDateString() : "N/A"}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Bank Information */}
        <Card className="mb-3">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Bank Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p className="mb-2">
                  <strong>Bank Account Number:</strong> {customer?.bankAccountNumber || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Bank IFSC:</strong> {customer?.bankIFSC || "N/A"}
                </p>
              </Col>
              <Col md={6}>
                <p className="mb-2">
                  <strong>Bank Name & Branch:</strong> {customer?.bankName || "N/A"}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Address Information */}
        <Card className="mb-3">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Address Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6 className="text-info">Billing Address</h6>
                <p className="mb-2">
                  <strong>Address:</strong> {customer?.billing?.address || customer?.address || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>City:</strong> {customer?.billing?.city || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>State:</strong> {customer?.billing?.state || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Country:</strong> {customer?.billing?.country || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Pincode:</strong> {customer?.billing?.zip || customer?.pincode || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>State Code:</strong> {customer?.stateCode || "N/A"}
                </p>
              </Col>
              <Col md={6}>
                <h6 className="text-info">Shipping Address</h6>
                <p className="mb-2">
                  <strong>Address:</strong> {customer?.shipping?.address || customer?.shippingAddress || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>City:</strong> {customer?.shipping?.city || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>State:</strong> {customer?.shipping?.state || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Country:</strong> {customer?.shipping?.country || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Pincode:</strong> {customer?.shipping?.zip || "N/A"}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Location */}
        {customer?.companyLocation && (
          <Card className="mb-3">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Location Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={12}>
                  <p className="mb-2">
                    <strong>Google Location:</strong>{" "}
                    <a
                      href={customer.companyLocation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary"
                    >
                      Click Location
                    </a>
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Documents (View Links Only If String/URL) */}
        {(typeof customer?.idCardImage === 'string' || typeof customer?.extraFile === 'string') && (
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Documents</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {/* {typeof customer.idCardImage === 'string' && (
                  <Col md={6}>
                    <p className="mb-2">
                      <strong>ID Card:</strong>{" "}
                      <a
                        href={customer.idCardImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                      >
                        View
                      </a>
                    </p>
                  </Col>
                )} */}
                {typeof customer.extraFile === 'string' && (
                  <Col md={6}>
                    <p className="mb-2">
                      <strong>Additional File:</strong>{" "}
                      <a
                        href={customer.extraFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                      >
                        View
                      </a>
                    </p>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer className="modal-footer-custom">
        <Button 
          variant="secondary" 
          onClick={onHide}
          className="btn-modal-cancel"
          style={{
            backgroundColor: "#6c757d",
            borderColor: "#6c757d",
            color: "white",
            padding: "8px 18px",
            borderRadius: "8px",
            fontWeight: "600",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#5a6268";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(108, 117, 125, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#6c757d";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewCustomerModal;