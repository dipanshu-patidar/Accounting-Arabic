import React, { useState } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";

const DeleteAccountRequest = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([
    { username: "Steven", requisitionDate: "25 Sep 2023", deleteRequestDate: "01 Oct 2023", status: null },
    { username: "Susan Lopez", requisitionDate: "30 Sep 2023", deleteRequestDate: "05 Oct 2023", status: null },
    { username: "Robert Grossman", requisitionDate: "10 Sep 2023", deleteRequestDate: "25 Sep 2023", status: null },
    { username: "Janet Hembre", requisitionDate: "15 Sep 2023", deleteRequestDate: "20 Sep 2023", status: null },
    { username: "Russell Belle", requisitionDate: "15 Aug 2023", deleteRequestDate: "01 Sep 2023", status: null },
    { username: "Henry Bryant", requisitionDate: "12 Aug 2023", deleteRequestDate: "01 Sep 2023", status: null },
    { username: "Michael Dawson", requisitionDate: "15 Sep 2023", deleteRequestDate: "01 Oct 2023", status: null },
  ]);

  const handleApprove = (index) => {
    const updatedUsers = [...users];
    updatedUsers[index].status = "approved";
    setUsers(updatedUsers);
  };

  const handleDisapprove = (index) => {
    setSelectedUser({ ...users[index], index });
    setShowModal(true);
  };

  const confirmDisapprove = () => {
    const updatedUsers = [...users];
    updatedUsers[selectedUser.index].status = "rejected";
    setUsers(updatedUsers);
    setShowModal(false);
    setSelectedUser(null);
  };

  const getInitials = (name) => {
    const parts = name.split(" ");
    return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-3 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">User Request</h5>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" title="Export PDF">
            <FaFilePdf />
          </Button>
          <Button variant="outline-success" title="Export Excel">
            <FaFileExcel />
          </Button>
        </div>
      </div>

      <Form.Group controlId="search" className="mb-3">
        <Form.Control type="text" placeholder="Search by user..." />
      </Form.Group>

      <div className="table-responsive">
        <Table bordered hover className="align-middle text-center">
          <thead className="table-light">
            <tr>
              <th><Form.Check type="checkbox" /></th>
              <th>User Info</th>
              <th>Requisition Date</th>
              <th>Delete Request Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td><Form.Check type="checkbox" /></td>

                <td className="text-start">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: "#0d6efd22",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#0d6efd"
                      }}
                    >
                      {getInitials(user.username)}
                    </div>
                    <div>{user.username}</div>
                  </div>
                </td>

                <td>{user.requisitionDate}</td>

                <td>{user.deleteRequestDate}</td>

                <td>
                  {user.status === "approved" && (
                    <span className="badge bg-success px-3 py-2">Approved</span>
                  )}
                  {user.status === "rejected" && (
                    <span className="badge bg-danger px-3 py-2">Rejected</span>
                  )}
                  {user.status === null && (
                    <span className="badge bg-secondary px-3 py-2">Pending</span>
                  )}
                </td>

                <td>
                  <div className="d-flex justify-content-center gap-2">
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleApprove(index)}
                      disabled={user.status === "approved"}
                      style={{
                        borderRadius: '20px',
                        padding: '4px 12px',
                        opacity: user.status === "approved" ? 0.5 : 1,
                        cursor: user.status === "approved" ? "not-allowed" : "pointer"
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDisapprove(index)}
                      disabled={user.status === "rejected"}
                      style={{
                        borderRadius: '20px',
                        padding: '4px 12px',
                        opacity: user.status === "rejected" ? 0.5 : 1,
                        cursor: user.status === "rejected" ? "not-allowed" : "pointer"
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Disapprove Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Disapproval</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to <strong className="text-danger">reject</strong> the delete
          request for <strong>{selectedUser?.username}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDisapprove}>Yes, Reject</Button>
        </Modal.Footer>
      </Modal>
      <p className="text-muted text-center mt-3">
  Is page par users ke account delete request ko approve ya reject kiya ja sakta hai. Admin yahan se unka status manage karta hai.
</p>

    </div>
  );
};

export default DeleteAccountRequest;
