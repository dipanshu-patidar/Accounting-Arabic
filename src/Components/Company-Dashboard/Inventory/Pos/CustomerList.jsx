import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../Api/axiosInstance"; // Adjust the import path as needed
import GetCompanyId from "../../../../Api/GetCompanyId";

const CustomerList = ({ onSelectCustomer }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const companyId = GetCompanyId();
  // Fetch customers from API using axiosInstance
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/vendorCustomer/company/${companyId}?type=customer`);
        
        if (response.data.success) {
          setCustomers(response.data.data);
        } else {
          setError("Failed to fetch customers");
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleSelectCustomer = (customer) => {
    onSelectCustomer(customer);
    setIsDropdownOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => setIsDropdownOpen(false), 150);
  };

  const filteredCustomers = customers.filter((c) =>
    c.name_english.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customer-search-container position-relative mx-3 my-3">
      <div className="input-group mt-4">
        <span className="input-group-text">Customer</span>
        <input 
          type="text"  
          className="form-control" 
          placeholder="Search customer" 
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}  
          onBlur={handleBlur} 
        />
        <span  
          className="input-group-text btn text-white"
          style={{ backgroundColor: "#1d1b31", cursor: "pointer" }}   
          onClick={() => navigate("/company/customersdebtors")} 
        >
          <i className="fa fa-plus"></i>
        </span>
      </div>

      {isDropdownOpen && (
        <ul className="list-group position-absolute bg-white border shadow-sm"
          style={{
            maxHeight: "200px", 
            overflowY: "auto", 
            width: "100%", 
            zIndex: 1000,
          }}
        >
          {loading ? (
            <li className="list-group-item text-muted">Loading customers...</li>
          ) : error ? (
            <li className="list-group-item text-danger">{error}</li>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <li
                key={customer.id}
                className="list-group-item"
                onClick={() => handleSelectCustomer(customer)}
                style={{ cursor: "pointer" }}
              >
                {customer.name_english}
              </li>
            ))
          ) : (
            <li className="list-group-item text-muted">No customers found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomerList;