import { useState } from "react";

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    phone: "",
    age: "",
    address: "",
    role: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    setUsers([...users, form]);
    setForm({
      name: "",
      email: "",
      password: "",
      gender: "",
      phone: "",
      age: "",
      address: "",
      role: ""
    });

    const modalEl = document.getElementById("userModal");
    const modal = window.bootstrap.Modal.getInstance(modalEl);
    modal.hide();
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>User List</h4>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#userModal"
        >
          Add User
        </button>
      </div>

      {/* Table */}
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Password</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Age</th>
            <th>Address</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No users added
              </td>
            </tr>
          ) : (
            users.map((u, index) => (
              <tr key={index}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.password}</td>
                <td>{u.gender}</td>
                <td>{u.phone}</td>
                <td>{u.age}</td>
                <td>{u.address}</td>
                <td>{u.role}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal */}
      <div className="modal fade" id="userModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Add User</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" name="name" value={form.name} onChange={handleChange} />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Gender</label>
                  <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Age</label>
                  <input type="number" className="form-control" name="age" value={form.age} onChange={handleChange} />
                </div>

                <div className="col-md-12 mb-3">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" name="address" value={form.address} onChange={handleChange}></textarea>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Role</label>
                  <select className="form-select" name="role" value={form.role} onChange={handleChange}>
                    <option value="">Select</option>
                    <option>Admin</option>
                    <option>Finance</option>
                    <option>Agent</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
