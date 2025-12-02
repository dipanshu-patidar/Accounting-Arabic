import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, TextField, Modal, Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEye, FaPen, FaTrash } from "react-icons/fa";

const Productt = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const dummyProducts = [
    {
      _id: "1",
      sku: "SKU001",
      name: "Washing Machine",
      category: "Appliances",
      quantity: 5,
      IMEI: "N/A",
      description: "Fully automatic washing machine",
      createdAt: new Date().toISOString(),

    },
    {
      _id: "2",
      sku: "SKU002",
      name: "Smartphone X",
      category: "Electronics",
      quantity: 12,
      IMEI: "356789123456789",
      description: "Latest 5G smartphone",
      createdAt: new Date().toISOString(),

    },
    {
      _id: "3",
      sku: "SKU003",
      name: "Microwave Oven",
      category: "Kitchen",
      quantity: 3,
      IMEI: "N/A",
      description: "20L grill microwave oven",
      createdAt: new Date().toISOString(),

    },
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setProducts(dummyProducts);
      setLoading(false);
    }, 500);
  }, []);

  const handleSearchChange = (e) => setSearch(e.target.value);

  const handleDeleteProduct = (productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This product will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        Swal.fire("Deleted!", "Product has been removed.", "success");
      }
    });
  };

  const handleViewClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setShowModal("edit"); // string value se modal type differentiate kare
  };
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      field: "images",
      headerName: "Image",
      width: 150,
      renderCell: (params) => {
        const images = params.row.images || [];
        const image1 =
          images.length > 0 ? images[0] : "";
        return (
          <img
            src={image1}
            alt={params.row.name}
            style={{
              width: 60,
              height: 30,
              objectFit: "cover",
              cursor: "pointer",
            }}
          />
        );
      },
    },
    { field: "sku", headerName: "SKU Id", width: 150 },
    { field: "name", headerName: "Service Name", width: 150 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "quantity", headerName: "Quantity", width: 130 },
    { field: "IMEI", headerName: "IMEI No", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: "6px" }}>
          <Button
            variant="outlined"
            color="success"
            size="small"
            onClick={() => handleViewClick(params.row)}
            title="View Product"
          >
            <FaEye size={12} />
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleEditClick(params.row)}
            title="Edit Product"
          >
            <FaPen size={12} />
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDeleteProduct(params.row._id)}
            title="Delete Product"
          >
            <FaTrash size={12} />
          </Button>
        </div>
      ),
    },
    
  ];

  return (
    <div className="mx-3 mx-md-5 my-5 card p-3">
      <div className="align-items-center mb-2">
        <div className="row d-flex justify-content-between mt-2 mb-2">
          <div className="col-md-9 mb-2">
            <h3>Product List</h3>
          </div>
          <div className="col-md-3 mb-2 text-md-end">
            <Link to="/company/createproduct" title="Add New Product">
              <button className="set_btn text-black rounded px-4 py-2 fw-semibold w-100">
                + Create New Product
              </button>
            </Link>
          </div>
        </div>

        <TextField
          label="Search Service"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          style={{ marginBottom: "20px", width: "100%" }}
        />

        <div style={{ padding: "5px", width: "100%" }}>
          <DataGrid
            rows={filteredProducts.map((product) => ({
              ...product,
              id: product._id,
            }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
          />
        </div>
      </div>

      {/* View Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="view-product-title"
        aria-describedby="view-product-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          {selectedProduct && (
            <>
              <Typography id="view-product-title" variant="h6" component="h2">
                {selectedProduct.name}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                <strong>SKU:</strong> {selectedProduct.sku}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Category:</strong> {selectedProduct.category}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Quantity:</strong> {selectedProduct.quantity}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>IMEI:</strong> {selectedProduct.IMEI}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Description:</strong>{" "}
                {selectedProduct.description || "N/A"}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Created:</strong>{" "}
                {new Date(selectedProduct.createdAt).toLocaleString()}
              </Typography>
            </>
          )}
        </Box>
      </Modal>
      
{/* Edit Modal */}
<Modal
  open={showModal === "edit"}
  onClose={() => setShowModal(false)}
  aria-labelledby="edit-product-title"
>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 500,
      bgcolor: "background.paper",
      borderRadius: 2,
      boxShadow: 24,
      p: 4,
    }}
  >
    {selectedProduct && (
      <>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Edit Product: {selectedProduct.name}
        </Typography>

        <TextField
          label="Name"
          fullWidth
          margin="dense"
          value={selectedProduct.name}
          onChange={(e) =>
            setSelectedProduct({ ...selectedProduct, name: e.target.value })
          }
        />
        <TextField
          label="Category"
          fullWidth
          margin="dense"
          value={selectedProduct.category}
          onChange={(e) =>
            setSelectedProduct({ ...selectedProduct, category: e.target.value })
          }
        />
        <TextField
          label="Quantity"
          fullWidth
          margin="dense"
          type="number"
          value={selectedProduct.quantity}
          onChange={(e) =>
            setSelectedProduct({
              ...selectedProduct,
              quantity: Number(e.target.value),
            })
          }
        />
        <TextField
          label="IMEI"
          fullWidth
          margin="dense"
          value={selectedProduct.IMEI}
          onChange={(e) =>
            setSelectedProduct({ ...selectedProduct, IMEI: e.target.value })
          }
        />
        <TextField
          label="Description"
          fullWidth
          margin="dense"
          multiline
          value={selectedProduct.description}
          onChange={(e) =>
            setSelectedProduct({
              ...selectedProduct,
              description: e.target.value,
            })
          }
        />
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => {
            // Dummy update logic
            setProducts((prev) =>
              prev.map((p) =>
                p._id === selectedProduct._id ? selectedProduct : p
              )
            );
            setShowModal(false);
            Swal.fire("Updated!", "Product has been updated.", "success");
          }}
        >
          Save Changes
        </Button>
      </>
    )}
  </Box>
</Modal>

    </div>
  );
};

export default Productt;
