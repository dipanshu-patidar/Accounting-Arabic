import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"


import Categories from "../SiteData/Categories";
import BrandPage from "../SiteData/BrandPage";
import DevicePage from "../SiteData/DevicePage";

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [devices, setDevices] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    brand: "",
    description: "",
    IMEI: "",
    quantity: "",
    device: "",
    warranty: "no",
    warrantyPeriod: "",
    sku: "",
    images: [],
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  // 🔃 Fetch all required data directly with fetch()
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [catRes, brandRes, devRes, prodRes] = await Promise.all([
          fetch("/api/categories").then((res) => res.json()),
          fetch("/api/brands").then((res) => res.json()),
          fetch("/api/devices").then((res) => res.json()),
          fetch("/api/products").then((res) => res.json()),
        ]);

        setCategories(catRes);
        setBrands(brandRes);
        setDevices(devRes);
        setProducts(prodRes);
      } catch (err) {
        showErrorToast("Failed to load data");
      }
    };
    fetchAllData();
  }, []);

  // 🎯 Populate form if editing
  useEffect(() => {
    if (id && products.length > 0) {
      const product = products.find((p) => p._id === id);
      if (product) {
        setFormData({ ...product });
        setSelectedCategory(product.category);
        setSelectedBrand(product.brand);
      }
    }
  }, [id, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, images: Array.from(e.target.files) }));
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedBrand("");
  };

  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
  };

  const handleDeviceChange = (e) => {
    const selectedDeviceId = e.target.value;
    const selectedDevice = devices.find((d) => d._id === selectedDeviceId);
    setFormData((prev) => ({
      ...prev,
      device: selectedDeviceId,
      device_name: selectedDevice?.device_name || "",
    }));
  };

  // 🚀 Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      category: selectedCategory,
      brand: selectedBrand,
      device: formData.device_name,
    };

    const formPayload = new FormData();
    for (const key in payload) {
      if (key === "images" && Array.isArray(payload[key])) {
        payload[key].forEach((img) => formPayload.append("images", img));
      } else {
        formPayload.append(key, payload[key]);
      }
    }

    try {
      const response = await fetch(
        id ? `/api/products/${id}` : `/api/products`,
        {
          method: id ? "PUT" : "POST",
          body: formPayload,
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      showSuccessToast(result.message || "Product saved successfully");
      navigate("/company/product");
    } catch (error) {
      showErrorToast(error.message || "Failed to save product");
    }
  };

  return (
    <div className="mx-5 mt-3">
      <button
        className="btn mb-3"
        onClick={() => navigate("/company/product")}
      >
        <i className="fas fa-arrow-left me-2"></i> Back
      </button>

      <div className="container-fluid shadow p-4">
        <h3 className="mb-2 fw-semibold">{id ? "Edit Product" : "Add Product"}</h3>
        <form className="row g-3 mt-1 p-4" onSubmit={handleSubmit}>
          <h5>Add Product</h5>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Name</label>
            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          {/* Category Field */}
          <div className="col-md-6">
            <label className="form-label fw-semibold d-flex justify-content-between align-items-center">
              Category
              <button type="button" className="btn btn-sm text-white " onClick={() => setShowCategoryModal(true)}
                style={{
                  backgroundColor: "#53b2a5",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                }}
              >+ Add</button>
            </label>
            <select className="form-control" value={selectedCategory} onChange={handleCategoryChange} required>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.category_name}>{cat.category_name}</option>
              ))}
            </select>
          </div>

          {/* Brand Field */}
          <div className="col-md-6">
            <label className="form-label fw-semibold d-flex justify-content-between align-items-center">
              Brand
              <button type="button" className="btn btn-sm text-white " onClick={() => setShowBrandModal(true)} style={{
                backgroundColor: "#53b2a5",
                border: "none",
                display: "flex",
                alignItems: "center",
              }}>+ Add</button>
            </label>
            <select className="form-control" value={selectedBrand} onChange={handleBrandChange} disabled={!selectedCategory}>
              <option value="">Select Brand</option>
              {brands
                .filter((b) => b?.category?.category_name === selectedCategory)
                .map((b) => (
                  <option key={b._id} value={b.brand_name}>{b.brand_name}</option>
                ))}
            </select>
          </div>

          {/* Device Field */}
          <div className="col-md-6">
            <label className="form-label fw-semibold d-flex justify-content-between align-items-center">
              Device
              <button type="button" className="btn btn-sm text-white" onClick={() => setShowDeviceModal(true)} style={{
                backgroundColor: "#53b2a5",
                border: "none",
                display: "flex",
                alignItems: "center",
              }}>+ Add</button>
            </label>
            <select className="form-control" onChange={handleDeviceChange} disabled={!selectedBrand}>
              <option value="">Select Device</option>
              {devices
                .filter((d) => d?.brand?.brand_name === selectedBrand)
                .map((d) => (
                  <option key={d._id} value={d._id}>{d.device_name}</option>
                ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Quantity</label>
            <input type="text" className="form-control" name="quantity" value={formData.quantity} onChange={handleChange} />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Warranty</label>
            <select className="form-control" name="warranty" value={formData.warranty} onChange={handleChange}>
              <option value="no">No Warranty</option>
              <option value="Warranty">Warranty</option>
            </select>
          </div>

          {formData.warranty === "Warranty" && (
            <div className="col-md-6">
              <label className="form-label fw-semibold">Warranty Period</label>
              <input type="text" className="form-control" name="warrantyPeriod" value={formData.warrantyPeriod} onChange={handleChange} />
            </div>
          )}

          <div className="col-md-6">
            <label className="form-label fw-semibold">Price</label>
            <input type="text" className="form-control" name="price" value={formData.price} onChange={handleChange} required />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">IMEI</label>
            <input type="text" className="form-control" name="IMEI" value={formData.IMEI} onChange={handleChange} />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Images</label>
            <input type="file" className="form-control" multiple onChange={handleImageChange} />
          </div>

          <div className="col-md-12">
            <label className="form-label fw-semibold">Description</label>
            <textarea className="form-control" rows={4} name="description" value={formData.description} onChange={handleChange} />
          </div>

          <div>
            <button type="submit" className="btn btn-primary" style={{
              backgroundColor: "#53b2a5",
              border: "none",
              display: "flex",
              alignItems: "center",
            }} >Submit</button>
          </div>
        </form>
      </div>

      {/* 🔘 MODALS */}
      {showCategoryModal && <Categories show={showCategoryModal} handleClose={() => setShowCategoryModal(false)} />}
      {showBrandModal && <BrandPage show={showBrandModal} handleClose={() => setShowBrandModal(false)} />}
      {showDeviceModal && <DevicePage show={showDeviceModal} handleClose={() => setShowDeviceModal(false)} />}
    </div>
  );
};

export default AddProduct;
