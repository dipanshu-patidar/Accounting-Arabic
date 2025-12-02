import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert, Dropdown } from "react-bootstrap";
import BaseUrl from "../../../../Api/BaseUrl";
import axiosInstance from "../../../../Api/axiosInstance";
import GetCompanyId from "../../../../Api/GetCompanyId";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddNewAccountModal = ({
  show,
  onHide,
  onSave,
  newAccountData,
  setNewAccountData,
  showBankDetails,
  setShowBankDetails,
  showAddParentModal,
  setShowAddParentModal,
  parentToChildren,
  accountData,
  handleAddNewParent
}) => {
  // State for the Add Parent Account modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccountSubmitting, setIsAccountSubmitting] = useState(false);
  const [parentAccountForm, setParentAccountForm] = useState({
    mainCategory: '',
    subgroupName: ''
  });
  const [subgroups, setSubgroups] = useState([]);
  const [loadingSubgroups, setLoadingSubgroups] = useState(true);
  const companyId = GetCompanyId();


  const handleAccountTypeChange = (e) => {
    const selectedType = e.target.value;
    setCustomerFormData({
      ...customerFormData,
      accountType: selectedType,
      // Update balance type based on account type
      accountBalanceType: selectedType === "Sundry Debtors" || selectedType === "Current Assets" ||
        selectedType === "Loans & Advances" || selectedType === "Fixed Assets" ||
        selectedType === "Investments" || selectedType === "Deposits (Assets)"
        ? "Debit" : "Credit"
    });
  };


  // Static categories
  const [categories] = useState([
    { id: 'assets', name: 'Assets' },
    { id: 'liabilities', name: 'Liabilities' },
    { id: 'equity', name: 'Equity' },
    { id: 'income', name: 'Income' },
    { id: 'expenses', name: 'Expenses' }
  ]);

  // New state for Add Sub of Subgroup modal
  const [showAddSubOfSubgroupModal, setShowAddSubOfSubgroupModal] = useState(false);
  const [subOfSubgroupForm, setSubOfSubgroupForm] = useState({
    name: ''
  });
  const [isSubOfSubgroupSubmitting, setIsSubOfSubgroupSubmitting] = useState(false);
  const [subOfSubgroupError, setSubOfSubgroupError] = useState('');

  // New state for accounts (sub of subgroups)
  const [subOfSubgroups, setSubOfSubgroups] = useState([]);
  const [loadingSubOfSubgroups, setLoadingSubOfSubgroups] = useState(false);

  // Error states
  const [accountError, setAccountError] = useState('');
  const [parentError, setParentError] = useState('');

  // Fetch subgroups when component mounts
  useEffect(() => {
    fetchSubgroups();
  }, []);

  // Fetch sub of subgroups when subgroup changes
  useEffect(() => {
    if (newAccountData.subgroup) {
      const selectedSubgroup = subgroups.find(sub => sub.subgroup_name === newAccountData.subgroup);
      if (selectedSubgroup) {
        fetchSubOfSubgroups(selectedSubgroup.id);
      }
    } else {
      setSubOfSubgroups([]);
    }
  }, [newAccountData.subgroup, subgroups]);

  // Function to fetch subgroups using new API
  const fetchSubgroups = async () => {
    try {
      setLoadingSubgroups(true);
      setAccountError('');
      const response = await axiosInstance.get(`${BaseUrl}account/subgroup/${companyId}`);
      console.log("Subgroups response:", response.data);
      // Updated to handle the actual response structure
      if (response.data.success) {
        setSubgroups(response.data.data);
      } else {
        setSubgroups([]);
      }
    } catch (error) {
      console.error('Error fetching subgroups:', error);
      setAccountError('Failed to load subgroups. Please try again.');
    } finally {
      setLoadingSubgroups(false);
    }
  };

  // Function to fetch sub of subgroups
  const fetchSubOfSubgroups = async (subgroupId) => {
    try {
      setLoadingSubOfSubgroups(true);
      setAccountError('');
      const response = await axiosInstance.get(`${BaseUrl}account/sub-of-subgroup/${subgroupId}`);
      console.log("Sub of subgroups response:", response.data);
      // Updated to handle the actual response structure
      if (response.data.success) {
        setSubOfSubgroups(response.data.data);
      } else {
        setSubOfSubgroups([]);
      }
    } catch (error) {
      console.error('Error fetching sub of subgroups:', error);
      setAccountError('Failed to load sub of subgroups. Please try again.');
    } finally {
      setLoadingSubOfSubgroups(false);
    }
  };

  // Function to delete a sub of subgroup
  const handleDeleteSubOfSubgroup = async (id) => {
    try {
      setAccountError('');
      const response = await axiosInstance.delete(`${BaseUrl}account/sub-of-subgroup/${id}`);

      if (response.data.success) {
        // Show success toast
        toast.success('Account deleted successfully');

        // Refresh sub of subgroups list
        const selectedSubgroup = subgroups.find(sub => sub.subgroup_name === newAccountData.subgroup);
        if (selectedSubgroup) {
          await fetchSubOfSubgroups(selectedSubgroup.id);
        }

        // Reset form if the deleted sub of subgroup was selected
        if (newAccountData.subOfSubgroupId === id) {
          setNewAccountData({
            ...newAccountData,
            subOfSubgroupId: "",
          });
        }
      } else {
        setAccountError('Failed to delete sub of subgroup. Please try again.');
        toast.error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting sub of subgroup:', error);
      if (error.response?.data?.message) {
        setAccountError(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setAccountError('Failed to delete sub of subgroup. Please try again.');
        toast.error('Failed to delete account');
      }
    }
  };

  // Handle saving the parent account using new API
  const handleSaveParentAccount = async () => {
    setIsSubmitting(true);
    setParentError('');
    try {
      // Prepare payload with new structure
      const payload = {
        main_category: parentAccountForm.mainCategory,
        subgroup_name: parentAccountForm.subgroupName,
        company_id: companyId
      };

      // Make API call using new endpoint
      const response = await axiosInstance.post(`${BaseUrl}account/create-subgroup`, payload);

      // Call handleAddNewParent callback with response data
      handleAddNewParent(response.data);

      // Show success toast
      toast.success('Parent account added successfully');

      // Reset form after successful submission
      setParentAccountForm({
        mainCategory: '',
        subgroupName: ''
      });

      // Refresh subgroups list
      await fetchSubgroups();

      // Close modal
      setShowAddParentModal(false);

    } catch (error) {
      console.error('Error saving parent account:', error);
      if (error.response?.data?.message) {
        setParentError(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setParentError('Failed to add parent account. Please try again.');
        toast.error('Failed to add parent account');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle saving the new account
  const handleSaveAccount = async () => {
    setIsAccountSubmitting(true);
    setAccountError('');
    try {
      // Find the selected subgroup ID
      const selectedSubgroup = subgroups.find(sub => sub.subgroup_name === newAccountData.subgroup);

      // Prepare payload with new structure
      const payload = {
        company_id: companyId,
        subgroup_id: selectedSubgroup ? selectedSubgroup.id : '',
        sub_of_subgroup_id: newAccountData.subOfSubgroupId || '',
        account_number: newAccountData.bankAccountNumber || '',
        ifsc_code: newAccountData.bankIFSC || '',
        bank_name_branch: newAccountData.bankNameBranch || ''
      };

      // Make API call using new endpoint
      const response = await axiosInstance.post(`${BaseUrl}account`, payload);

      // Call onSave callback with response data
      onSave(response.data);

      // Show success toast
      toast.success('Account saved successfully');

      // Close modal
      onHide();

      // Wait for a short delay to ensure the API call is complete
      setTimeout(() => {
        // Reload the page
        window.location.reload();
      }, 500);

    } catch (error) {
      console.error('Error saving account:', error);
      if (error.response?.data?.message) {
        setAccountError(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setAccountError('Failed to save account. Please try again.');
        toast.error('Failed to save account');
      }
    } finally {
      setIsAccountSubmitting(false);
    }
  };

  // Handle saving the new sub of subgroup
  const handleSaveSubOfSubgroup = async () => {
    setIsSubOfSubgroupSubmitting(true);
    setSubOfSubgroupError('');
    try {
      // Find the selected subgroup ID
      const selectedSubgroup = subgroups.find(sub => sub.subgroup_name === newAccountData.subgroup);

      if (!selectedSubgroup) {
        setSubOfSubgroupError('Please select a subgroup first');
        toast.error('Please select a subgroup first');
        return;
      }

      // Prepare payload with the required structure
      const payload = {
        subgroup_id: selectedSubgroup.id,
        name: subOfSubgroupForm.name
      };

      // Make API call using new endpoint
      const response = await axiosInstance.post(`${BaseUrl}account/sub-of-subgroup`, payload);

      // Show success toast
      toast.success('Sub of subgroup added successfully');

      // Reset form after successful submission
      setSubOfSubgroupForm({
        name: ''
      });

      // Close modal
      setShowAddSubOfSubgroupModal(false);

      // Refresh sub of subgroups list
      fetchSubOfSubgroups(selectedSubgroup.id);

    } catch (error) {
      console.error('Error saving sub of subgroup:', error);
      if (error.response?.data?.message) {
        setSubOfSubgroupError(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setSubOfSubgroupError('Failed to add sub of subgroup. Please try again.');
        toast.error('Failed to add sub of subgroup');
      }
    } finally {
      setIsSubOfSubgroupSubmitting(false);
    }
  };

  // Handle input changes for the sub of subgroup form
  const handleSubOfSubgroupInputChange = (e) => {
    const { name, value } = e.target;
    setSubOfSubgroupForm({
      ...subOfSubgroupForm,
      [name]: value
    });
  };

  // Handle input changes for the parent account form
  const handleParentAccountInputChange = (e) => {
    const { name, value } = e.target;
    setParentAccountForm({
      ...parentAccountForm,
      [name]: value
    });
  };

  // Handle subgroup selection
  const handleSubgroupSelect = (subgroupName) => {
    setNewAccountData({
      ...newAccountData,
      subgroup: subgroupName,
      subOfSubgroupId: "",
    });
  };

  // Handle sub of subgroup selection
  const handleSubOfSubgroupSelect = (id, name) => {
    setNewAccountData({
      ...newAccountData,
      subOfSubgroupId: id,
      name: name,
    });
  };

  return (
    <>
      {/* Main Add New Account Modal */}
      <Modal
        show={show}
        onHide={onHide}
        centered
        backdrop="static"
        size="xl"
        dialogClassName="w-100"

        keyboard={false}
      >
        <div>
          <Modal.Header
            closeButton
            className="d-flex justify-content-between align-items-center"
          >
            <Modal.Title className="m-2">Add New Account</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {accountError && (
              <Alert variant="danger" onClose={() => setAccountError('')} dismissible>
                {accountError}
              </Alert>
            )}
            <Form>
              <Form.Group className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <Form.Label>Subgroup</Form.Label>
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowAddParentModal(true);
                      setParentError('');
                    }}
                    style={{
                      backgroundColor: "#53b2a5",
                      border: "none",
                      padding: "8px 16px",
                    }}
                  >
                    + Add Parent
                  </Button>
                </div>
                <Dropdown className="border-1 rounded-1">
                  <Dropdown.Toggle
                    variant=""
                    className="w-100 text-start"
                    id="subgroup-dropdown"
                  >
                    {newAccountData.subgroup || "-- Select Subgroup --"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100">
                    {loadingSubgroups ? (
                      <Dropdown.Item disabled>Loading subgroups...</Dropdown.Item>
                    ) : (
                      subgroups.map((subgroup) => (
                        <Dropdown.Item
                          key={subgroup.id}
                          className="d-flex justify-content-between align-items-center"
                          onClick={() => handleSubgroupSelect(subgroup.subgroup_name)}
                        >
                          <span>
                            {subgroup.subgroup_name} ({subgroup.main_category})
                          </span>
                        </Dropdown.Item>
                      ))
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <Form.Label>Sub of Subgroup (Account Name)</Form.Label>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!newAccountData.subgroup) {
                        setAccountError('Please select a subgroup first');
                        return;
                      }
                      setShowAddSubOfSubgroupModal(true);
                      setSubOfSubgroupError('');
                      setSubOfSubgroupForm({
                        name: ''
                      });
                    }}
                    style={{
                      backgroundColor: "#53b2a5",
                      border: "none",
                      padding: "8px 16px",
                    }}
                    disabled={!newAccountData.subgroup}
                  >
                    + Add Sub of Subgroup
                  </Button>
                </div>
                <Dropdown className="border-1 rounded-1">
                  <Dropdown.Toggle
                    variant=""
                    className="w-100 text-start border-1"
                    id="sub-of-subgroup-dropdown"
                  >
                    {newAccountData.name || "-- Select Account Name --"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100">
                    {loadingSubOfSubgroups ? (
                      <Dropdown.Item disabled>Loading accounts...</Dropdown.Item>
                    ) : (
                      subOfSubgroups.map((subOfSubgroup) => (
                        <Dropdown.Item
                          key={subOfSubgroup.id}
                          className="d-flex justify-content-between align-items-center"
                          onClick={() => handleSubOfSubgroupSelect(subOfSubgroup.id, subOfSubgroup.name)}
                        >
                          <span>
                            {subOfSubgroup.name}
                          </span>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSubOfSubgroup(subOfSubgroup.id);
                            }}
                          >
                            Delete
                          </Button>
                        </Dropdown.Item>
                      ))
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>

              {(newAccountData.subgroup === "Sundry Debtors" ||
                newAccountData.subgroup === "Sundry Creditors") && (
                  <>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Phone</Form.Label>
                          <Form.Control
                            type="text"
                            value={newAccountData.phone || ""}
                            onChange={(e) =>
                              setNewAccountData({ ...newAccountData, phone: e.target.value })
                            }
                            placeholder="Enter phone number"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={newAccountData.email || ""}
                            onChange={(e) =>
                              setNewAccountData({ ...newAccountData, email: e.target.value })
                            }
                            placeholder="Enter email address"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Add Bank Details"
                  checked={showBankDetails}
                  onChange={() => setShowBankDetails(!showBankDetails)}
                />
              </Form.Group>

              {showBankDetails && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Account Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={newAccountData.bankAccountNumber}
                      onChange={(e) =>
                        setNewAccountData({
                          ...newAccountData,
                          bankAccountNumber: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>IFSC Code</Form.Label>
                    <Form.Control
                      type="text"
                      value={newAccountData.bankIFSC}
                      onChange={(e) =>
                        setNewAccountData({
                          ...newAccountData,
                          bankIFSC: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Bank Name & Branch</Form.Label>
                    <Form.Control
                      type="text"
                      value={newAccountData.bankNameBranch}
                      onChange={(e) =>
                        setNewAccountData({
                          ...newAccountData,
                          bankNameBranch: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                padding: "8px 16px",
              }}
              onClick={handleSaveAccount}
              disabled={isAccountSubmitting || !newAccountData.subgroup || !newAccountData.subOfSubgroupId}
            >
              {isAccountSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* Add Parent Account Modal */}
      <Modal
        show={showAddParentModal}
        onHide={() => {
          setShowAddParentModal(false);
          setParentError('');
        }}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Add Parent Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {parentError && (
            <Alert variant="danger" onClose={() => setParentError('')} dismissible>
              {parentError}
            </Alert>
          )}
          <Form>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Main Category</Form.Label>
                  <Form.Control
                    as="select"
                    name="mainCategory"
                    value={parentAccountForm.mainCategory}
                    onChange={handleParentAccountInputChange}
                  >
                    <option value="">Select Main Type</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Subgroup Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="subgroupName"
                    value={parentAccountForm.subgroupName}
                    onChange={handleParentAccountInputChange}
                    placeholder="Enter subgroup name (e.g., Fixed Assets)"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddParentModal(false);
              setParentError('');
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: "#53b2a5", border: "none" }}
            onClick={handleSaveParentAccount}
            disabled={isSubmitting || !parentAccountForm.mainCategory || !parentAccountForm.subgroupName}
          >
            {isSubmitting ? 'Adding...' : 'Add Subgroup'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Sub of Subgroup Modal */}
      <Modal
        show={showAddSubOfSubgroupModal}
        onHide={() => {
          setShowAddSubOfSubgroupModal(false);
          setSubOfSubgroupError('');
        }}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Add Sub of Subgroup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {subOfSubgroupError && (
            <Alert variant="danger" onClose={() => setSubOfSubgroupError('')} dismissible>
              {subOfSubgroupError}
            </Alert>
          )}
          <Form>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Account Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={subOfSubgroupForm.name}
                    onChange={handleSubOfSubgroupInputChange}
                    placeholder="Enter account name"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Subgroup</Form.Label>
                  <Form.Control
                    type="text"
                    value={newAccountData.subgroup}
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddSubOfSubgroupModal(false);
              setSubOfSubgroupError('');
            }}
            disabled={isSubOfSubgroupSubmitting}
          >
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: "#53b2a5", border: "none" }}
            onClick={handleSaveSubOfSubgroup}
            disabled={isSubOfSubgroupSubmitting || !subOfSubgroupForm.name}
          >
            {isSubOfSubgroupSubmitting ? 'Adding...' : 'Add Account'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default AddNewAccountModal;