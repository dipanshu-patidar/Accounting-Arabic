import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaUserCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdOutlineCancel } from 'react-icons/md';

const ProfileModal = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    firstName: 'Jeffry',
    lastName: 'Jordan',
    email: 'jeffry@example.com',
    phone: '+17468314286',
    username: 'Jeffry Jordan',
    password: '********'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState("https://randomuser.me/api/portraits/men/75.jpg");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024 && ['image/jpeg', 'image/png'].includes(file.type)) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    } else {
      alert("Please upload a valid JPG/PNG image below 2MB.");
    }
  };

  const removeImage = () => setProfileImage(null);

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-3">
          <h5 className="mb-3">
            <span className="badge bg-info text-white" style={{ fontSize: '1rem' }}>Profile</span>
          </h5>

          <h6 className="text-primary mb-3 d-flex align-items-center">
            <FaUserCircle className="me-2" /> Basic Information
          </h6>

          {/* Avatar Section */}
          <div className="d-flex align-items-center mb-4">
            <div className="position-relative me-3">
              <img
                src={profileImage || "https://via.placeholder.com/80x80?text=No+Image"}
                alt="Profile"
                className="img-thumbnail rounded"
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
              {profileImage && (
                <button
                  className="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle"
                  style={{ borderRadius: '50%' }}
                  onClick={removeImage}
                >
                  <MdOutlineCancel />
                </button>
              )}
            </div>
            <div>
              <label className="btn text-white mb-1" style={{ backgroundColor: "#27b2b6" }}>
                Change Image
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
              <p className="text-muted small mb-0">
                Upload JPG/PNG under 2MB.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="row g-3">
            {[
              { label: 'First Name *', name: 'firstName', type: 'text' },
              { label: 'Last Name *', name: 'lastName', type: 'text' },
              { label: 'Email *', name: 'email', type: 'email' },
              { label: 'Phone Number *', name: 'phone', type: 'text' },
              { label: 'Username *', name: 'username', type: 'text' },
            ].map((field, idx) => (
              <div className="col-12" key={idx}>
                <label className="form-label">{field.label}</label>
                <input
                  type={field.type}
                  className="form-control"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                />
              </div>
            ))}

            {/* Password Field */}
            <div className="col-12">
              <label className="form-label">Password *</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="warning" className="text-white">Save Changes</Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ProfileModal;
