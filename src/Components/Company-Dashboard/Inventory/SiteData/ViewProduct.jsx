import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Loader from "../../../LayOut/Loader";
import axios from "axios"; // Assuming you fetch from API

const ViewProduct = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/products"); // replace with actual API URL
        setProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const product = products?.find((item) => item._id === id);

  if (loading) return <Loader />;
  if (!products || products.length === 0)
    return <p className="text-danger text-center">No products available</p>;
  if (!product)
    return <p className="text-warning text-center">Product not found</p>;

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Product Detail</h4>
        <Link to="/products">
          <button className="btn btn-primary">⬅ Back</button>
        </Link>
      </div>

      <div className="card shadow-lg">
        <div className="card-body">
          {/* Product Title */}
          <h2 className="card-title text-center">{product.name || "N/A"}</h2>

          {/* Product Image & Details */}
          <div className="row mt-4">
            <div className="col-md-4 text-center">
              {product.images?.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: "200px" }}
                />
              ) : (
                <p className="text-muted">No Image Available</p>
              )}
            </div>
            <div className="col-md-8">
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th>Brand</th>
                    <td>{product.brand || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Category</th>
                    <td>{product.category || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>SKU</th>
                    <td>{product.sku || "N/A"}</td>
                  </tr>
                  <tr>
                    <th>Warranty</th>
                    <td>
                      {product.warranty
                        ? `${product.warranty} (${product.warrantyPeriod || 0} months)`
                        : "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <th>Description</th>
                    <td>{product.description || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
