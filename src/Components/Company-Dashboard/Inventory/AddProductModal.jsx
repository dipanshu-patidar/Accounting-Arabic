import React, { useState, useEffect, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import axiosInstance from "../../../Api/axiosInstance";
import GetCompanyId from "../../../Api/GetCompanyId";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddProductModal = ({
  showAdd,
  showEdit,
  setShowAdd,
  setShowEdit,
  formMode,
  selectedItem,
  companyId,
  onSuccess,
  selectedWarehouse,
  preselectedWarehouseId, // NEW PROP: To lock warehouse selection
}) => {
  const isEditing = showEdit;
  const isAdding = showAdd;
  const [localNewItem, setLocalNewItem] = useState({
    id: "",
    itemName: "",
    hsn: "",
    barcode: "",
    image: null,
    itemCategory: "",
    itemCategoryId: "",
    description: "",
    sku: "",
    date: new Date().toISOString().split("T")[0],
    taxAccount: "",
    cost: "",
    salePriceExclusive: "",
    salePriceInclusive: "",
    discount: "",
    remarks: "",
    unitDetailId: "",
    productWarehouses: [],
  });
  const companyID = GetCompanyId();
  const [newUOM, setNewUOM] = useState("");
  const [showAddUOMModal, setShowAddUOMModal] = useState(false);
  const [uoms] = useState(["Piece", "Box", "KG", "Meter", "Litre"]);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [unitDetails, setUnitDetails] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingUnitDetails, setIsLoadingUnitDetails] = useState(false);
  
  // NEW STATE: To track if a warehouse is preselected
  const [hasPreselectedWarehouse, setHasPreselectedWarehouse] = useState(false);

  const [internalShowAddCategoryModal, setInternalShowAddCategoryModal] = useState(false);
  const [internalNewCategory, setInternalNewCategory] = useState("");
  const fileInputRef = useRef(null);
  const isInitialMount = useRef(true);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setLocalNewItem((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleWarehouseChange = (index, field, value) => {
    const updatedWarehouses = [...localNewItem.productWarehouses];

    if (field === "warehouse_id") {
      const selectedWarehouse = warehouses.find(
        (wh) => wh.id === parseInt(value)
      );
      if (selectedWarehouse) {
        updatedWarehouses[index] = {
          ...updatedWarehouses[index],
          warehouse_id: selectedWarehouse.id,
          warehouse_name: selectedWarehouse.warehouse_name,
          quantity: updatedWarehouses[index].quantity || 0,
          min_order_qty: updatedWarehouses[index].min_order_qty || 0,
          initial_qty: updatedWarehouses[index].initial_qty || 0,
        };
      }
    } else if (field === "quantity") {
      updatedWarehouses[index] = {
        ...updatedWarehouses[index],
        quantity: parseInt(value) || 0,
      };
    } else if (field === "min_order_qty") {
      updatedWarehouses[index] = {
        ...updatedWarehouses[index],
        min_order_qty: parseInt(value) || 0,
      };
    } else if (field === "initial_qty") {
      updatedWarehouses[index] = {
        ...updatedWarehouses[index],
        initial_qty: parseInt(value) || 0,
      };
    }

    setLocalNewItem((prev) => ({
      ...prev,
      productWarehouses: updatedWarehouses,
    }));
  };

  // UPDATED: Disable adding/removing if warehouse is preselected
  const addWarehouseRow = () => {
    if (hasPreselectedWarehouse || warehouses.length === 0) return;

    const selectedWarehouseIds = localNewItem.productWarehouses.map(
      (w) => w.warehouse_id
    );
    const availableWarehouse = warehouses.find(
      (wh) => !selectedWarehouseIds.includes(wh.id)
    );

    if (availableWarehouse) {
      setLocalNewItem((prev) => ({
        ...prev,
        productWarehouses: [
          ...prev.productWarehouses,
          {
            warehouse_id: availableWarehouse.id,
            warehouse_name: availableWarehouse.warehouse_name,
            quantity: 0,
            min_order_qty: 0,
            initial_qty: 0,
          },
        ],
      }));
    }
  };

  // UPDATED: Disable adding/removing if warehouse is preselected
  const removeWarehouseRow = (index) => {
    if (hasPreselectedWarehouse || localNewItem.productWarehouses.length <= 1) return;

    const updatedWarehouses = [...localNewItem.productWarehouses];
    updatedWarehouses.splice(index, 1);

    setLocalNewItem((prev) => ({
      ...prev,
      productWarehouses: updatedWarehouses,
    }));
  };

  const resetLocalForm = () => {
    setLocalNewItem({
      id: "",
      itemName: "",
      hsn: "",
      barcode: "",
      image: null,
      itemCategory: "",
      itemCategoryId: "",
      description: "",
      sku: "",
      date: new Date().toISOString().split("T")[0],
      taxAccount: "",
      cost: "",
      salePriceExclusive: "",
      salePriceInclusive: "",
      discount: "",
      remarks: "",
      unitDetailId: unitDetails.length > 0 ? unitDetails[0].id : "",
      productWarehouses:
        warehouses.length > 0
          ? [
            {
              warehouse_id: warehouses[0].id,
              warehouse_name: warehouses[0].warehouse_name,
              quantity: 0,
              min_order_qty: 0,
              initial_qty: 0,
            },
          ]
          : [],
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isEditing && selectedItem) {
      const productWarehouses =
        selectedItem.product_warehouses &&
          selectedItem.product_warehouses.length > 0
          ? selectedItem.product_warehouses.map((pw) => ({
            warehouse_id: pw.warehouse.id,
            warehouse_name: pw.warehouse.warehouse_name,
            quantity: pw.stock_qty || pw.quantity || 0,
            min_order_qty: pw.min_order_qty || 0,
            initial_qty: pw.initial_qty || 0,
          }))
          : warehouses.length > 0
            ? [
              {
                warehouse_id: warehouses[0].id,
                warehouse_name: warehouses[0].warehouse_name,
                quantity: 0,
                min_order_qty: 0,
                initial_qty: 0,
              },
            ]
            : [];

      setLocalNewItem({
        id: selectedItem.id || "",
        itemName: selectedItem.item_name || selectedItem.itemName || "",
        hsn: selectedItem.hsn || "",
        barcode: selectedItem.barcode || "",
        image: null,
        itemCategory:
          selectedItem.item_category_name || selectedItem.itemCategory || "",
        itemCategoryId: selectedItem.item_category_id || "",
        description: selectedItem.description || "",
        sku: selectedItem.sku || "",
        date:
          selectedItem.as_of_date ||
          selectedItem.date ||
          new Date().toISOString().split("T")[0],
        taxAccount: selectedItem.tax_account || selectedItem.taxAccount || "",
        cost: (selectedItem.initial_cost || selectedItem.cost || "").toString(),
        salePriceExclusive: (
          selectedItem.sale_price ||
          selectedItem.salePriceExclusive ||
          ""
        ).toString(),
        salePriceInclusive: (
          selectedItem.purchase_price ||
          selectedItem.salePriceInclusive ||
          ""
        ).toString(),
        discount: (selectedItem.discount || "").toString(),
        remarks: selectedItem.remarks || "",
        unitDetailId: selectedItem.unit_detail_id || (unitDetails.length > 0 ? unitDetails[0].id : ""),
        productWarehouses: productWarehouses,
      });
    } else if (isAdding) {
      resetLocalForm();
    }
  }, [isEditing, isAdding, selectedItem, warehouses, unitDetails]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await axiosInstance.get(
          `item-categories/company/${companyID}`
        );
        if (response.data?.success && Array.isArray(response.data.data)) {
          const categoryNames = response.data.data.map(
            (cat) => cat.item_category_name
          );
          setFetchedCategories(categoryNames);
        } else {
          setFetchedCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setFetchedCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [companyID]);

  // UPDATED: Handle preselected warehouse logic
  useEffect(() => {
    if (!companyId) return;

    const fetchWarehouses = async () => {
      setIsLoadingWarehouses(true);
      try {
        const response = await axiosInstance.get(
          `warehouses/company/${companyId}`
        );
        if (response.data?.success && Array.isArray(response.data.data)) {
          const filteredWarehouses = response.data.data;
          setWarehouses(filteredWarehouses);

          const hasPreselected = preselectedWarehouseId && 
            filteredWarehouses.some(wh => wh.id.toString() === preselectedWarehouseId.toString());
          
          setHasPreselectedWarehouse(hasPreselected);

          if (isAdding && localNewItem.productWarehouses.length === 0) {
            if (hasPreselected) {
              const preselectedWarehouse = filteredWarehouses.find(
                wh => wh.id.toString() === preselectedWarehouseId.toString()
              );
              if (preselectedWarehouse) {
                setLocalNewItem((prev) => ({
                  ...prev,
                  productWarehouses: [
                    {
                      warehouse_id: preselectedWarehouse.id,
                      warehouse_name: preselectedWarehouse.warehouse_name,
                      quantity: 0,
                      min_order_qty: 0,
                      initial_qty: 0,
                    },
                  ],
                }));
              }
            } else if (filteredWarehouses.length > 0) {
              setLocalNewItem((prev) => ({
                ...prev,
                productWarehouses: [
                  {
                    warehouse_id: filteredWarehouses[0].id,
                    warehouse_name: filteredWarehouses[0].warehouse_name,
                    quantity: 0,
                    min_order_qty: 0,
                    initial_qty: 0,
                  },
                ],
              }));
            }
          }
        } else {
          setWarehouses([]);
          setHasPreselectedWarehouse(false);
        }
      } catch (error) {
        console.error("Error fetching warehouses:", error);
        setWarehouses([]);
        setHasPreselectedWarehouse(false);
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    fetchWarehouses();
  }, [companyId, preselectedWarehouseId, isAdding]);

  useEffect(() => {
    if (!companyId) return;

    const fetchUnitDetails = async () => {
      setIsLoadingUnitDetails(true);
      try {
        const response = await axiosInstance.get(
          `unit-details/getUnitDetailsByCompanyId/${companyId}`
        );
        if (response.data?.success && Array.isArray(response.data.data)) {
          setUnitDetails(response.data.data);

          if (isAdding && !localNewItem.unitDetailId && response.data.data.length > 0) {
            setLocalNewItem(prev => ({
              ...prev,
              unitDetailId: response.data.data[0].id
            }));
          }
        } else {
          setUnitDetails([]);
        }
      } catch (error) {
        console.error("Error fetching unit details:", error);
        setUnitDetails([]);
      } finally {
        setIsLoadingUnitDetails(false);
      }
    };

    fetchUnitDetails();
  }, [companyId]);

  useEffect(() => {
    const updateCategoryId = async () => {
      if (localNewItem.itemCategory && fetchedCategories.length > 0) {
        try {
          const response = await axiosInstance.get(
            `item-categories/company/${companyID}`
          );
          if (response.data?.success && Array.isArray(response.data.data)) {
            const category = response.data.data.find(
              (cat) => cat.item_category_name === localNewItem.itemCategory
            );
            if (category) {
              setLocalNewItem((prev) => ({
                ...prev,
                itemCategoryId: category.id,
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching category ID:", error);
        }
      }
    };

    updateCategoryId();
  }, [localNewItem.itemCategory, fetchedCategories, companyID]);

  const handleAddCategoryApi = async () => {
    if (!internalNewCategory.trim()) {
      toast.error("Please enter a category name", {
        toastId: 'category-name-error',
        autoClose: 3000
      });
      return;
    }
    setIsAddingCategory(true);
    try {
      await axiosInstance.post("item-categories", {
        company_id: companyId,
        item_category_name: internalNewCategory.trim(),
      });

      const res = await axiosInstance.get(
        `item-categories/company/${companyID}`
      );
      if (res.data?.success && Array.isArray(res.data.data)) {
        const names = res.data.data.map((c) => c.item_category_name);
        setFetchedCategories(names);
        setLocalNewItem((prev) => ({
          ...prev,
          itemCategory: internalNewCategory.trim(),
        }));

        const newCategoryObj = res.data.data.find(
          (c) => c.item_category_name === internalNewCategory.trim()
        );
        if (newCategoryObj) {
          setLocalNewItem((prev) => ({
            ...prev,
            itemCategoryId: newCategoryObj.id,
          }));
        }
      }

      setInternalNewCategory("");
      setInternalShowAddCategoryModal(false);
      toast.success("Category added successfully", {
        toastId: 'category-add-success',
        autoClose: 3000
      });
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category. Please try again.", {
        toastId: 'category-add-error',
        autoClose: 3000
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleAddProductApi = async () => {
    if (!localNewItem.itemName.trim()) {
      toast.error("Please enter an item name", {
        toastId: 'item-name-error',
        autoClose: 3000
      });
      return;
    }

    if (localNewItem.productWarehouses.length === 0) {
      toast.error("Please select at least one warehouse", {
        toastId: 'warehouse-select-error',
        autoClose: 3000
      });
      return;
    }

    const hasValidQuantity = localNewItem.productWarehouses.some(
      (w) => w.quantity > 0
    );
    if (!hasValidQuantity) {
      toast.error("Please enter a quantity greater than 0 for at least one warehouse", {
        toastId: 'quantity-error',
        autoClose: 3000
      });
      return;
    }

    setIsAddingProduct(true);
    try {
      const formData = new FormData();

      formData.append("company_id", companyID);
      formData.append("item_category_id", localNewItem.itemCategoryId || "1");
      formData.append("unit_detail_id", localNewItem.unitDetailId || "");
      formData.append("item_name", localNewItem.itemName || "");
      formData.append("hsn", localNewItem.hsn || "");
      formData.append("barcode", localNewItem.barcode || "");
      formData.append("sku", localNewItem.sku || "");
      formData.append("description", localNewItem.description || "");
      formData.append(
        "as_of_date",
        localNewItem.date || new Date().toISOString().split("T")[0]
      );
      formData.append("initial_cost", localNewItem.cost || "0");
      formData.append("sale_price", localNewItem.salePriceExclusive || "0");
      formData.append("purchase_price", localNewItem.salePriceInclusive || "0");
      formData.append("discount", localNewItem.discount || "0");
      formData.append("tax_account", localNewItem.taxAccount || "");
      formData.append("remarks", localNewItem.remarks || "");

      if (localNewItem.image) {
        formData.append("image", localNewItem.image);
      }

      const warehousesData = localNewItem.productWarehouses.map((w) => ({
        warehouse_id: w.warehouse_id,
        quantity: w.quantity,
        min_order_qty: w.min_order_qty,
        initial_qty: w.initial_qty,
      }));

      formData.append("warehouses", JSON.stringify(warehousesData));

      const response = await axiosInstance.post("products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.success) {
        resetLocalForm();
        setShowAdd(false);
        if (onSuccess) onSuccess();
        toast.success("Product added successfully", {
          toastId: 'product-add-success',
          autoClose: 3000
        });
      } else {
        toast.error("Failed to add product. Please try again.", {
          toastId: 'product-add-error',
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleUpdateProductApi = async () => {
    if (!localNewItem.id) {
      console.error("No product ID for update");
      return;
    }

    if (!localNewItem.itemName.trim()) {
      toast.error("Please enter an item name", {
        toastId: 'item-name-edit-error',
        autoClose: 3000
      });
      return;
    }

    if (localNewItem.productWarehouses.length === 0) {
      toast.error("Please select at least one warehouse", {
        toastId: 'warehouse-select-edit-error',
        autoClose: 3000
      });
      return;
    }

    const hasValidQuantity = localNewItem.productWarehouses.some(
      (w) => w.quantity > 0
    );
    if (!hasValidQuantity) {
      toast.error("Please enter a quantity greater than 0 for at least one warehouse", {
        toastId: 'quantity-edit-error',
        autoClose: 3000
      });
      return;
    }

    setIsUpdatingProduct(true);
    try {
      const formData = new FormData();

      formData.append("company_id", companyID);
      formData.append("item_category_id", localNewItem.itemCategoryId || "1");
      formData.append("unit_detail_id", localNewItem.unitDetailId || "");
      formData.append("item_name", localNewItem.itemName || "");
      formData.append("hsn", localNewItem.hsn || "");
      formData.append("barcode", localNewItem.barcode || "");
      formData.append("sku", localNewItem.sku || "");
      formData.append("description", localNewItem.description || "");
      formData.append(
        "as_of_date",
        localNewItem.date || new Date().toISOString().split("T")[0]
      );
      formData.append("initial_cost", localNewItem.cost || "0");
      formData.append("sale_price", localNewItem.salePriceExclusive || "0");
      formData.append("purchase_price", localNewItem.salePriceInclusive || "0");
      formData.append("discount", localNewItem.discount || "0");
      formData.append("tax_account", localNewItem.taxAccount || "");
      formData.append("remarks", localNewItem.remarks || "");

      if (localNewItem.image) {
        formData.append("images", localNewItem.image);
      }

      const warehousesData = localNewItem.productWarehouses.map((w) => ({
        warehouse_id: w.warehouse_id,
        quantity: w.quantity,
        min_order_qty: w.min_order_qty,
        initial_qty: w.initial_qty,
      }));

      formData.append("warehouses", JSON.stringify(warehousesData));

      const response = await axiosInstance.put(
        `products/${localNewItem.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data?.success) {
        resetLocalForm();
        setShowEdit(false);
        if (onSuccess) onSuccess();
        toast.success("Product updated successfully", {
          toastId: 'product-update-success',
          autoClose: 3000
        });
      } else {
        toast.error("Failed to update product. Please try again.", {
          toastId: 'product-update-error',
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("An error occurred while updating product: " + error.message, {
        toastId: 'product-update-api-error',
        autoClose: 3000
      });
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const handleAddUOM = () => {
    if (newUOM.trim() && !uoms.includes(newUOM.trim())) {
      // You can add logic to save to backend if needed
    }
    setNewUOM("");
    setShowAddUOMModal(false);
  };

  const handleClose = () => {
    resetLocalForm();
    setShowAdd(false);
    setShowEdit(false);
  };

  return (
    <>
      <Modal
        show={isAdding || isEditing}
        onHide={handleClose}
        centered
        size="xl"
        key={isAdding ? "add-modal" : "edit-modal"}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>{isAdding ? "Add Product" : "Edit Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Item Name</Form.Label>
                  <Form.Control
                    name="itemName"
                    value={localNewItem.itemName}
                    onChange={handleChange}
                    placeholder="Enter item name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>HSN</Form.Label>
                  <Form.Control
                    name="hsn"
                    value={localNewItem.hsn}
                    onChange={handleChange}
                    placeholder="Enter HSN code"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Barcode</Form.Label>
                  <Form.Control
                    name="barcode"
                    value={localNewItem.barcode}
                    onChange={handleChange}
                    placeholder="Enter barcode"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Item Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    ref={fileInputRef}
                    onChange={handleChange}
                    accept="image/*"
                  />
                  {isEditing && selectedItem?.image && (
                    <Form.Text className="text-muted d-block mt-1">
                      Current image: Already uploaded
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label className="mb-0">Item Category</Form.Label>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setInternalShowAddCategoryModal(true)}
                      style={{
                        backgroundColor: "#505ece",
                        border: "none",
                        color: "#fff",
                        padding: "6px 16px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#3d47b8";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(80, 94, 206, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#505ece";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      + Add New
                    </Button>
                  </div>
                  <Form.Select
                    name="itemCategory"
                    value={localNewItem.itemCategory}
                    onChange={handleChange}
                    className="mt-2"
                  >
                    <option value="">Select Category</option>
                    {isLoadingCategories ? (
                      <option value="" disabled>
                        Loading categories...
                      </option>
                    ) : (
                      fetchedCategories.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat}
                        </option>
                      ))
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Unit of Measure</Form.Label>
                  {isLoadingUnitDetails ? (
                    <Form.Control
                      type="text"
                      value="Loading units..."
                      readOnly
                      className="bg-light"
                    />
                  ) : (
                    <Form.Select
                      name="unitDetailId"
                      value={localNewItem.unitDetailId}
                      onChange={handleChange}
                    >
                      <option value="">Select Unit</option>
                      {unitDetails.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.uom_name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>SKU</Form.Label>
                  <Form.Control
                    name="sku"
                    value={localNewItem.sku}
                    onChange={handleChange}
                    placeholder="Enter SKU"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* UPDATED: Warehouse Selection Section */}
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="mb-0">
                      Warehouse Information {hasPreselectedWarehouse && <span className="text-muted">(Pre-selected)</span>}
                    </Form.Label>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={addWarehouseRow}
                      disabled={
                        localNewItem.productWarehouses.length >= warehouses.length || hasPreselectedWarehouse
                      }
                      style={{
                        backgroundColor: "#505ece",
                        border: "none",
                        color: "#fff",
                        padding: "6px 16px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = "#3d47b8";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(80, 94, 206, 0.4)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = "#505ece";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }
                      }}
                    >
                      + Add Warehouse
                    </Button>
                  </div>

                  {isLoadingWarehouses ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" size="sm" />
                      <span className="ms-2">Loading warehouses...</span>
                    </div>
                  ) : (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th style={{ width: "30%" }}>Warehouse</th>
                          <th style={{ width: "25%" }}>Quantity</th>
                          <th style={{ width: "25%" }}>Minimum Order Quantity</th>
                          <th style={{ width: "25%" }}>Initial Quantity On Hand</th>
                          <th style={{ width: "20%" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {localNewItem.productWarehouses.map(
                          (warehouse, index) => (
                            <tr key={index}>
                              <td>
                                <Form.Select
                                  value={warehouse.warehouse_id}
                                  onChange={(e) =>
                                    handleWarehouseChange(
                                      index,
                                      "warehouse_id",
                                      e.target.value
                                    )
                                  }
                                  disabled={hasPreselectedWarehouse} // UPDATED: Disable if preselected
                                >
                                  <option value="">Select Warehouse</option>
                                  {warehouses
                                    .filter((wh) => {
                                      // If a warehouse is preselected, only show that one
                                      if (hasPreselectedWarehouse) {
                                        return wh.id.toString() === preselectedWarehouseId.toString();
                                      }
                                      
                                      const selectedWarehouseIds =
                                        localNewItem.productWarehouses
                                          .map((w, i) =>
                                            i !== index ? w.warehouse_id : null
                                          )
                                          .filter((id) => id !== null);
                                      return !selectedWarehouseIds.includes(
                                        wh.id
                                      );
                                    })
                                    .map((wh) => (
                                      <option key={wh.id} value={wh.id}>
                                        {wh.warehouse_name}
                                      </option>
                                    ))}
                                </Form.Select>
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  value={warehouse.quantity || ""}
                                  onChange={(e) =>
                                    handleWarehouseChange(
                                      index,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                  min="0"
                                />
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  value={warehouse.min_order_qty || ""}
                                  onChange={(e) =>
                                    handleWarehouseChange(
                                      index,
                                      "min_order_qty",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                  min="0"
                                />
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  value={warehouse.initial_qty || ""}
                                  onChange={(e) =>
                                    handleWarehouseChange(
                                      index,
                                      "initial_qty",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                  min="0"
                                />
                              </td>
                              <td className="text-center">
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => removeWarehouseRow(index)}
                                  disabled={
                                    localNewItem.productWarehouses.length <= 1 || hasPreselectedWarehouse // UPDATED: Disable if preselected
                                  }
                                  style={{
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    padding: "6px 12px",
                                    transition: "all 0.3s ease"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!e.currentTarget.disabled) {
                                      e.currentTarget.style.transform = "translateY(-2px)";
                                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(220, 53, 69, 0.4)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!e.currentTarget.disabled) {
                                      e.currentTarget.style.transform = "translateY(0)";
                                      e.currentTarget.style.boxShadow = "none";
                                    }
                                  }}
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </Table>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Item Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={localNewItem.description}
                    onChange={handleChange}
                    placeholder="Enter item description"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>As Of Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={localNewItem.date}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Default Tax Account</Form.Label>
                  <Form.Control
                    name="taxAccount"
                    value={localNewItem.taxAccount}
                    onChange={handleChange}
                    placeholder="Enter tax account"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Initial Cost/Unit</Form.Label>
                  <Form.Control
                    name="cost"
                    type="number"
                    value={localNewItem.cost}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Default Sale Price (Exclusive)</Form.Label>
                  <Form.Control
                    name="salePriceExclusive"
                    type="number"
                    value={localNewItem.salePriceExclusive}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Default Purchase Price (Inclusive)</Form.Label>
                  <Form.Control
                    name="salePriceInclusive"
                    type="number"
                    value={localNewItem.salePriceInclusive}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Default Discount %</Form.Label>
                  <Form.Control
                    name="discount"
                    type="number"
                    value={localNewItem.discount}
                    onChange={handleChange}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control
                    name="remarks"
                    value={localNewItem.remarks}
                    onChange={handleChange}
                    placeholder="Enter remarks"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleClose}
            style={{
              backgroundColor: "#6c757d",
              borderColor: "#6c757d",
              borderRadius: "8px",
              fontWeight: "600",
              padding: "8px 18px",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#5a6268";
              e.currentTarget.style.borderColor = "#5a6268";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(108, 117, 125, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#6c757d";
              e.currentTarget.style.borderColor = "#6c757d";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Cancel
          </Button>
          <Button
            style={{ 
              backgroundColor: "#505ece", 
              borderColor: "#505ece",
              borderRadius: "8px",
              fontWeight: "600",
              padding: "8px 18px",
              transition: "all 0.3s ease"
            }}
            onClick={isAdding ? handleAddProductApi : handleUpdateProductApi}
            disabled={
              isAddingProduct ||
              isUpdatingProduct ||
              localNewItem.productWarehouses.length === 0
            }
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "#3d47b8";
                e.currentTarget.style.borderColor = "#3d47b8";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(80, 94, 206, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "#505ece";
                e.currentTarget.style.borderColor = "#505ece";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {isAdding ? (
              isAddingProduct ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Adding...
                </>
              ) : (
                "Add"
              )
            ) : isUpdatingProduct ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={internalShowAddCategoryModal}
        onHide={() => setInternalShowAddCategoryModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter new category name"
              value={internalNewCategory}
              onChange={(e) => setInternalNewCategory(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setInternalShowAddCategoryModal(false)}
            style={{
              backgroundColor: "#6c757d",
              borderColor: "#6c757d",
              borderRadius: "8px",
              fontWeight: "600",
              padding: "8px 18px",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#5a6268";
              e.currentTarget.style.borderColor = "#5a6268";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(108, 117, 125, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#6c757d";
              e.currentTarget.style.borderColor = "#6c757d";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Cancel
          </Button>
          <Button
            style={{
              backgroundColor: "#505ece",
              border: "none",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: "600",
              padding: "8px 18px",
              transition: "all 0.3s ease"
            }}
            onClick={handleAddCategoryApi}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#3d47b8";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(80, 94, 206, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#505ece";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {isAddingCategory ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Adding...
              </>
            ) : (
              "Add"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showAddUOMModal}
        onHide={() => setShowAddUOMModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New UOM</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>UOM Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter new UOM"
              value={newUOM}
              onChange={(e) => setNewUOM(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowAddUOMModal(false)}
            style={{
              backgroundColor: "#6c757d",
              borderColor: "#6c757d",
              borderRadius: "8px",
              fontWeight: "600",
              padding: "8px 18px",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#5a6268";
              e.currentTarget.style.borderColor = "#5a6268";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(108, 117, 125, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#6c757d";
              e.currentTarget.style.borderColor = "#6c757d";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Cancel
          </Button>
          <Button
            style={{
              backgroundColor: "#505ece",
              border: "none",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: "600",
              padding: "8px 18px",
              transition: "all 0.3s ease"
            }}
            onClick={handleAddUOM}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#3d47b8";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(80, 94, 206, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#505ece";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
      />
    </>
  );
};

export default AddProductModal;


// ✅ Full Updated Code – Compatible with your actual API response structure

// import React, { useState, useEffect, useRef } from "react";
// import Modal from "react-bootstrap/Modal";
// import Form from "react-bootstrap/Form";
// import Row from "react-bootstrap/Row";
// import Col from "react-bootstrap/Col";
// import Button from "react-bootstrap/Button";
// import Spinner from "react-bootstrap/Spinner";
// import Table from "react-bootstrap/Table";
// import axiosInstance from "../../../Api/axiosInstance";
// import GetCompanyId from "../../../Api/GetCompanyId";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const AddProductModal = ({
//   showAdd,
//   showEdit,
//   setShowAdd,
//   setShowEdit,
//   selectedItem,
//   companyId,
//   onSuccess,
//   preselectedWarehouseId, // NEW: Prop to receive warehouse ID from URL
// }) => {
//   const isEditing = showEdit;
//   const isAdding = showAdd;
//   const [localNewItem, setLocalNewItem] = useState({
//     id: "",
//     itemName: "",
//     hsn: "",
//     barcode: "",
//     image: null,
//     itemCategory: "",
//     itemCategoryId: "",
//     description: "",
//     sku: "",
//     date: new Date().toISOString().split("T")[0],
//     taxAccount: "",
//     cost: "",
//     salePriceExclusive: "",
//     salePriceInclusive: "",
//     discount: "",
//     remarks: "",
//     unitDetailId: "",
//     productWarehouses: [],
//   });

//   const companyID = GetCompanyId();
//   const [newUOM, setNewUOM] = useState("");
//   const [showAddUOMModal, setShowAddUOMModal] = useState(false);
//   const [uoms] = useState(["Piece", "Box", "KG", "Meter", "Litre"]);
//   const [fetchedCategories, setFetchedCategories] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
//   const [unitDetails, setUnitDetails] = useState([]);
//   const [isAddingProduct, setIsAddingProduct] = useState(false);
//   const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
//   const [isAddingCategory, setIsAddingCategory] = useState(false);
//   const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
//   const [isLoadingCategories, setIsLoadingCategories] = useState(false);
//   const [isLoadingUnitDetails, setIsLoadingUnitDetails] = useState(false);
//   const [internalShowAddCategoryModal, setInternalShowAddCategoryModal] = useState(false);
//   const [internalNewCategory, setInternalNewCategory] = useState("");
//   const fileInputRef = useRef(null);
//   const isInitialMount = useRef(true);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setLocalNewItem((prev) => ({
//       ...prev,
//       [name]: files ? files[0] : value,
//     }));
//   };

//   const handleWarehouseChange = (index, field, value) => {
//     const updatedWarehouses = [...localNewItem.productWarehouses];
//     const numValue = value === "" ? 0 : parseInt(value, 10) || 0;

//     if (field === "warehouse_id") {
//       const selectedWarehouse = warehouses.find(
//         (wh) => wh.id === parseInt(value)
//       );
//       if (selectedWarehouse) {
//         updatedWarehouses[index] = {
//           ...updatedWarehouses[index],
//           warehouse_id: selectedWarehouse.id,
//           warehouse_name: selectedWarehouse.warehouse_name,
//           quantity: updatedWarehouses[index].quantity || 0,
//           min_order_qty: updatedWarehouses[index].min_order_qty || 0,
//           initial_qty: updatedWarehouses[index].initial_qty || 0,
//         };
//       }
//     } else if (field === "quantity") {
//       updatedWarehouses[index] = {
//         ...updatedWarehouses[index],
//         quantity: parseInt(value) || 0,
//       };
//     } else if (field === "min_order_qty") {
//       updatedWarehouses[index] = {
//         ...updatedWarehouses[index],
//         min_order_qty: parseInt(value) || 0,
//       };
//     } else if (field === "initial_qty") {
//       updatedWarehouses[index] = {
//         ...updatedWarehouses[index],
//         initial_qty: parseInt(value) || 0,
//       };
//     }
//     // Note: min_order_qty and initial_qty are now product-level only
//     // So we don't allow editing them per warehouse anymore

//     setLocalNewItem(prev => ({
//       ...prev,
//       productWarehouses: updatedWarehouses,
//     }));
//   };

//   const addWarehouseRow = () => {
//     if (warehouses.length === 0) return;

//     const selectedWarehouseIds = localNewItem.productWarehouses.map(
//       (w) => w.warehouse_id
//     );
//     const availableWarehouse = warehouses.find(
//       (wh) => !selectedWarehouseIds.includes(wh.id)
//     );

//     if (availableWarehouse) {
//       setLocalNewItem((prev) => ({
//         ...prev,
//         productWarehouses: [
//           ...prev.productWarehouses,
//           {
//             warehouse_id: available.id,
//             warehouse_name: available.warehouse_name,
//             quantity: 0,
//             min_order_qty: 0,
//             initial_qty: 0,
//           },
//         ],
//       }));
//     }
//   };

//   const removeWarehouseRow = (index) => {
//     // NEW: Prevent removing if it's the preselected warehouse
//     if (preselectedWarehouseId && 
//         localNewItem.productWarehouses[index]?.warehouse_id === parseInt(preselectedWarehouseId)) {
//       return;
//     }

//     if (localNewItem.productWarehouses.length <= 1) return;
//     const updated = [...localNewItem.productWarehouses];
//     updated.splice(index, 1);
//     setLocalNewItem(prev => ({ ...prev, productWarehouses: updated }));
//   };

//   const resetLocalForm = () => {
//     setLocalNewItem({
//       id: "",
//       itemName: "",
//       hsn: "",
//       barcode: "",
//       image: null,
//       itemCategory: "",
//       itemCategoryId: "",
//       description: "",
//       sku: "",
//       date: new Date().toISOString().split("T")[0],
//       taxAccount: "",
//       cost: "",
//       salePriceExclusive: "",
//       salePriceInclusive: "",
//       discount: "",
//       remarks: "",
//       unitDetailId: unitDetails.length > 0 ? unitDetails[0].id : "",
//       productWarehouses:
//         warehouses.length > 0
//           ? [
//             {
//               warehouse_id: warehouses[0].id,
//               warehouse_name: warehouses[0].warehouse_name,
//               quantity: 0,
//               min_order_qty: 0,
//               initial_qty: 0,
//             },
//           ]
//           : [],
//     });
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   // UPDATED: useEffect to handle preselected warehouse
//   useEffect(() => {
//     if (isInitialMount.current) {
//       isInitialMount.current = false;
//       return;
//     }
//     if (isEditing && selectedItem) {
//       const productWarehouses =
//         selectedItem.product_warehouses && selectedItem.product_warehouses.length > 0
//           ? selectedItem.product_warehouses.map((pw) => ({
//               warehouse_id: pw.warehouse.id,
//               warehouse_name: pw.warehouse.warehouse_name,
//               quantity: pw.stock_qty || pw.quantity || 0,
//               min_order_qty: pw.min_order_qty || 0,
//               initial_qty: pw.initial_qty || 0,
//             }))
//           : warehouses.length > 0
//             ? [
//                 {
//                   warehouse_id: warehouses[0].id,
//                   warehouse_name: warehouses[0].warehouse_name,
//                   quantity: 0,
//                   min_order_qty: 0,
//                   initial_qty: 0,
//                 },
//               ]
//             : [];

//       setLocalNewItem({
//         id: selectedItem.id || "",
//         itemName: selectedItem.item_name || "",
//         hsn: selectedItem.hsn || "",
//         barcode: selectedItem.barcode || "",
//         image: null,
//         itemCategory: selectedItem.item_category?.item_category_name || selectedItem.itemCategory || "",
//         itemCategoryId: selectedItem.item_category?.id || selectedItem.itemCategoryId || "",
//         description: selectedItem.description || "",
//         sku: selectedItem.sku || "",
//         date: selectedItem.as_of_date || selectedItem.date || new Date().toISOString().split("T")[0],
//         taxAccount: selectedItem.tax_account || selectedItem.taxAccount || "",
//         cost: (selectedItem.initial_cost || selectedItem.cost || "").toString(),
//         salePriceExclusive: (selectedItem.sale_price || selectedItem.salePriceExclusive || "").toString(),
//         salePriceInclusive: (selectedItem.purchase_price || selectedItem.salePriceInclusive || "").toString(),
//         discount: (selectedItem.discount || "").toString(),
//         remarks: selectedItem.remarks || "",
//         unitDetailId: selectedItem.unit_detail_id || selectedItem.unitDetailId || (unitDetails.length > 0 ? unitDetails[0].id : ""),
//         productWarehouses: productWarehouses,
//       });
//     } else if (isAdding) {
//       // NEW: If preselectedWarehouseId is provided, set it as the only warehouse
//       if (preselectedWarehouseId && warehouses.length > 0) {
//         const preselectedWarehouse = warehouses.find(wh => wh.id === parseInt(preselectedWarehouseId));
//         if (preselectedWarehouse) {
//           setLocalNewItem(prev => ({
//             ...prev,
//             productWarehouses: [{
//               warehouse_id: preselectedWarehouse.id,
//               warehouse_name: preselectedWarehouse.warehouse_name,
//               quantity: 0,
//               min_order_qty: 0,
//               initial_qty: 0,
//             }]
//           }));
//         }
//       } else {
//         resetLocalForm();
//       }
//     }
//   }, [isEditing, isAdding, selectedItem, warehouses, unitDetails, preselectedWarehouseId]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       setIsLoadingCategories(true);
//       try {
//         const res = await axiosInstance.get(`item-categories/company/${companyID}`);
//         setFetchedCategories(res.data?.success && Array.isArray(res.data.data)
//           ? res.data.data.map(cat => cat.item_category_name)
//           : []);
//       } catch (err) { console.error("Error fetching categories:", err); setFetchedCategories([]); }
//       finally { setIsLoadingCategories(false); }
//     };
//     fetchCategories();
//   }, [companyID]);

//   useEffect(() => {
//     if (!companyId) return;
//     const fetchWarehouses = async () => {
//       setIsLoadingWarehouses(true);
//       try {
//         const response = await axiosInstance.get(
//           `warehouses/company/${companyId}`
//         );
//         if (response.data?.success && Array.isArray(response.data.data)) {
//           const filteredWarehouses = response.data.data;
//           setWarehouses(filteredWarehouses);

//           // NEW: If adding and preselectedWarehouseId is set, update the form
//           if (isAdding && preselectedWarehouseId && filteredWarehouses.length > 0) {
//             const preselectedWarehouse = filteredWarehouses.find(wh => wh.id === parseInt(preselectedWarehouseId));
//             if (preselectedWarehouse) {
//               setLocalNewItem(prev => ({
//                 ...prev,
//                 productWarehouses: [{
//                   warehouse_id: preselectedWarehouse.id,
//                   warehouse_name: preselectedWarehouse.warehouse_name,
//                   quantity: 0,
//                   min_order_qty: 0,
//                   initial_qty: 0,
//                 }]
//               }));
//             }
//           }
//           // Regular case: if adding new product and no warehouses are set
//           else if (isAdding && localNewItem.productWarehouses.length === 0 && filteredWarehouses.length > 0) {
//             setLocalNewItem((prev) => ({
//               ...prev,
//               productWarehouses: [
//                 {
//                   warehouse_id: filteredWarehouses[0].id,
//                   warehouse_name: filteredWarehouses[0].warehouse_name,
//                   quantity: 0,
//                   min_order_qty: 0,
//                   initial_qty: 0,
//                 },
//               ],
//             }));
//           }
//         } else {
//           setWarehouses([]);
//         }
//       } catch (err) { console.error("Error fetching warehouses:", err); setWarehouses([]); }
//       finally { setIsLoadingWarehouses(false); }
//     };
//     fetchWarehouses();
//   }, [companyId, isAdding, preselectedWarehouseId]);

//   useEffect(() => {
//     if (!companyId) return;
//     const fetchUnitDetails = async () => {
//       setIsLoadingUnitDetails(true);
//       try {
//         const response = await axiosInstance.get(
//           `unit-details/getUnitDetailsByCompanyId/${companyId}`
//         );
//         if (response.data?.success && Array.isArray(response.data.data)) {
//           setUnitDetails(response.data.data);

//           if (isAdding && !localNewItem.unitDetailId && response.data.data.length > 0) {
//             setLocalNewItem(prev => ({
//               ...prev,
//               unitDetailId: response.data.data[0].id
//             }));
//           }
//         } else {
//           setUnitDetails([]);
//         }
//       } catch (err) { console.error("Error fetching unit details:", err); setUnitDetails([]); }
//       finally { setIsLoadingUnitDetails(false); }
//     };
//     fetchUnitDetails();
//   }, [companyId]);

//   useEffect(() => {
//     const updateCategoryId = async () => {
//       if (localNewItem.itemCategory && fetchedCategories.length > 0) {
//         try {
//           const res = await axiosInstance.get(`item-categories/company/${companyID}`);
//           const cat = res.data?.success && Array.isArray(res.data.data)
//             ? res.data.data.find(c => c.item_category_name === localNewItem.itemCategory)
//             : null;
//           if (cat) {
//             setLocalNewItem(prev => ({ ...prev, itemCategoryId: cat.id }));
//           }
//         } catch (err) { console.error("Error fetching category ID:", err); }
//       }
//     };
//     updateCategoryId();
//   }, [localNewItem.itemCategory, fetchedCategories, companyID]);

//   const handleAddCategoryApi = async () => {
//     if (!internalNewCategory.trim()) {
//       toast.error("Please enter a category name", { toastId: 'category-name-error' });
//       return;
//     }
//     setIsAddingCategory(true);
//     try {
//       await axiosInstance.post("item-categories", {
//         company_id: companyId,
//         item_category_name: internalNewCategory.trim(),
//       });
//       const res = await axiosInstance.get(`item-categories/company/${companyID}`);
//       if (res.data?.success && Array.isArray(res.data.data)) {
//         const names = res.data.data.map(c => c.item_category_name);
//         setFetchedCategories(names);
//         const newCat = res.data.data.find(c => c.item_category_name === internalNewCategory.trim());
//         setLocalNewItem(prev => ({
//           ...prev,
//           itemCategory: internalNewCategory.trim(),
//           itemCategoryId: newCat?.id || "",
//         }));

//         const newCategoryObj = res.data.data.find(
//           (c) => c.item_category_name === internalNewCategory.trim()
//         );
//         if (newCategoryObj) {
//           setLocalNewItem((prev) => ({
//             ...prev,
//             itemCategoryId: newCategoryObj.id,
//           }));
//         }
//       }
//     } catch (err) {
//       toast.error("Failed to add category. Please try again.", { toastId: 'category-add-error' });
//     } finally {
//       setIsAddingCategory(false);
//     }
//   };

//   const handleAddProductApi = async () => {
//     if (!localNewItem.itemName.trim()) {
//       toast.error("Please enter an item name", { toastId: 'item-name-error' });
//       return;
//     }
//     if (localNewItem.productWarehouses.length === 0) {
//       toast.error("Please select at least one warehouse", { toastId: 'warehouse-select-error' });
//       return;
//     }

//     const hasValidQuantity = localNewItem.productWarehouses.some(
//       (w) => w.quantity > 0
//     );
//     if (!hasValidQuantity) {
//       toast.error("Please enter a quantity greater than 0 for at least one warehouse", {
//         toastId: 'quantity-error',
//         autoClose: 3000
//       });
//       return;
//     }

//     setIsAddingProduct(true);
//     try {
//       const formData = new FormData();

//       formData.append("company_id", companyID);
//       formData.append("item_category_id", localNewItem.itemCategoryId || "1");
//       formData.append("unit_detail_id", localNewItem.unitDetailId || "");
//       formData.append("item_name", localNewItem.itemName || "");
//       formData.append("hsn", localNewItem.hsn || "");
//       formData.append("barcode", localNewItem.barcode || "");
//       formData.append("sku", localNewItem.sku || "");
//       formData.append("description", localNewItem.description || "");
//       formData.append("as_of_date", localNewItem.date);
//       formData.append("initial_cost", localNewItem.cost || "0");
//       formData.append("sale_price", localNewItem.salePriceExclusive || "0");
//       formData.append("purchase_price", localNewItem.salePriceInclusive || "0");
//       formData.append("discount", localNewItem.discount || "0");
//       formData.append("tax_account", localNewItem.taxAccount || "");
//       formData.append("remarks", localNewItem.remarks || "");
//       // formData.append("initial_qty", localNewItem.initial_qty.toString());

//       formData.append(
//   "initial_qty",
//   localNewItem?.initial_qty?.toString() || "0"
// );


//       // formData.append("min_order_qty", localNewItem.min_order_qty.toString());

//       formData.append(
//   "min_order_qty",
//   localNewItem?.min_order_qty?.toString() || "0"
// );


//       if (localNewItem.image) formData.append("image", localNewItem.image);

//       if (localNewItem.image) {
//         formData.append("image", localNewItem.image);
//       }

//       const warehousesData = localNewItem.productWarehouses.map((w) => ({
//         warehouse_id: w.warehouse_id,
//         quantity: w.quantity,
//         min_order_qty: w.min_order_qty,
//         initial_qty: w.initial_qty,
//       }));

//       formData.append("warehouses", JSON.stringify(warehousesData));

//       const response = await axiosInstance.post("products", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response.data?.success) {
//         resetLocalForm();
//         setShowAdd(false);
//         if (onSuccess) onSuccess();
//         toast.success("Product added successfully", { toastId: 'product-add-success' });
//       } else {
//         toast.error("Failed to add product. Please try again.", { toastId: 'product-add-error' });
//       }
//     } catch (error) {
//       console.error("Error adding product:", error);
//     } finally {
//       setIsAddingProduct(false);
//     }
//   };

//   const handleUpdateProductApi = async () => {
//     if (!localNewItem.id) {
//       toast.error("No product ID found for update.");
//       return;
//     }
//     if (!localNewItem.itemName.trim()) {
//       toast.error("Please enter an item name", { toastId: 'item-name-edit-error' });
//       return;
//     }
//     if (localNewItem.productWarehouses.length === 0) {
//       toast.error("Please select at least one warehouse", { toastId: 'warehouse-select-edit-error' });
//       return;
//     }

//     const hasValidQuantity = localNewItem.productWarehouses.some(
//       (w) => w.quantity > 0
//     );
//     if (!hasValidQuantity) {
//       toast.error("Please enter a quantity greater than 0 for at least one warehouse", {
//         toastId: 'quantity-edit-error',
//         autoClose: 3000
//       });
//       return;
//     }

//     setIsUpdatingProduct(true);
//     try {
//       const formData = new FormData();

//       formData.append("company_id", companyID);
//       formData.append("item_category_id", localNewItem.itemCategoryId || "1");
//       formData.append("unit_detail_id", localNewItem.unitDetailId || "");
//       formData.append("item_name", localNewItem.itemName || "");
//       formData.append("hsn", localNewItem.hsn || "");
//       formData.append("barcode", localNewItem.barcode || "");
//       formData.append("sku", localNewItem.sku || "");
//       formData.append("description", localNewItem.description || "");
//       formData.append("as_of_date", localNewItem.date);
//       formData.append("initial_cost", localNewItem.cost || "0");
//       formData.append("sale_price", localNewItem.salePriceExclusive || "0");
//       formData.append("purchase_price", localNewItem.salePriceInclusive || "0");
//       formData.append("discount", localNewItem.discount || "0");
//       formData.append("tax_account", localNewItem.taxAccount || "");
//       formData.append("remarks", localNewItem.remarks || "");
//       formData.append("initial_qty", localNewItem.initial_qty.toString());
//       formData.append("min_order_qty", localNewItem.min_order_qty.toString());
//       if (localNewItem.image) formData.append("images", localNewItem.image);

//       if (localNewItem.image) {
//         formData.append("images", localNewItem.image);
//       }

//       const warehousesData = localNewItem.productWarehouses.map((w) => ({
//         warehouse_id: w.warehouse_id,
//         quantity: w.quantity,
//         min_order_qty: w.min_order_qty,
//         initial_qty: w.initial_qty,
//       }));

//       formData.append("warehouses", JSON.stringify(warehousesData));

//       const response = await axiosInstance.put(
//         `products/${localNewItem.id}`,
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       if (response.data?.success) {
//         resetLocalForm();
//         setShowEdit(false);
//         if (onSuccess) onSuccess();
//         toast.success("Product updated successfully", { toastId: 'product-update-success' });
//       } else {
//         toast.error("Failed to update product. Please try again.", { toastId: 'product-update-error' });
//       }
//     } catch (error) {
//       console.error("Error updating product:", error);
//       toast.error("An error occurred while updating product.", { toastId: 'product-update-api-error' });
//     } finally {
//       setIsUpdatingProduct(false);
//     }
//   };

//   const handleAddUOM = () => {
//     if (newUOM.trim() && !uoms.includes(newUOM.trim())) {
//     }
//     setNewUOM("");
//     setShowAddUOMModal(false);
//   };

//   const handleClose = () => {
//     resetLocalForm();
//     setShowAdd(false);
//     setShowEdit(false);
//   };

//   // NEW: Check if the current warehouse row is the preselected one
//   const isPreselectedWarehouse = (warehouseId) => {
//     return preselectedWarehouseId && parseInt(warehouseId) === parseInt(preselectedWarehouseId);
//   };

//   return (
//     <>
//       <Modal
//         show={isAdding || isEditing}
//         onHide={handleClose}
//         centered
//         size="xl"
//         key={isAdding ? "add-modal" : "edit-modal"}
//         backdrop="static"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>{isAdding ? "Add Product" : "Edit Product"}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Item Name</Form.Label>
//                   <Form.Control name="itemName" value={localNewItem.itemName} onChange={handleChange} placeholder="Enter item name" />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>HSN</Form.Label>
//                   <Form.Control name="hsn" value={localNewItem.hsn} onChange={handleChange} placeholder="Enter HSN code" />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Barcode</Form.Label>
//                   <Form.Control name="barcode" value={localNewItem.barcode} onChange={handleChange} placeholder="Enter barcode" />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Item Image</Form.Label>
//                   <Form.Control type="file" name="image" ref={fileInputRef} onChange={handleChange} accept="image/*" />
//                   {isEditing && selectedItem?.image && (
//                     <Form.Text className="text-muted d-block mt-1">Current image: Already uploaded</Form.Text>
//                   )}
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <div className="d-flex justify-content-between align-items-center">
//                     <Form.Label className="mb-0">Item Category</Form.Label>
//                     <Button variant="outline-primary" size="sm" onClick={() => setInternalShowAddCategoryModal(true)} style={{ backgroundColor: "#27b2b6", border: "none", color: "#fff", padding: "6px 16px" }}>
//                       + Add New
//                     </Button>
//                   </div>
//                   <Form.Select name="itemCategory" value={localNewItem.itemCategory} onChange={handleChange} className="mt-2">
//                     <option value="">Select Category</option>
//                     {isLoadingCategories ? (
//                       <option value="" disabled>Loading categories...</option>
//                     ) : (
//                       fetchedCategories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)
//                     )}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Unit of Measure</Form.Label>
//                   {isLoadingUnitDetails ? (
//                     <Form.Control type="text" value="Loading units..." readOnly className="bg-light" />
//                   ) : (
//                     <Form.Select name="unitDetailId" value={localNewItem.unitDetailId} onChange={handleChange}>
//                       <option value="">Select Unit</option>
//                       {unitDetails.map(unit => <option key={unit.id} value={unit.id}>{unit.uom_name}</option>)}
//                     </Form.Select>
//                   )}
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>SKU</Form.Label>
//                   <Form.Control name="sku" value={localNewItem.sku} onChange={handleChange} placeholder="Enter SKU" />
//                 </Form.Group>
//               </Col>
//             </Row>

//             {/* Product-Level Min/Initial Qty */}
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Initial Quantity On Hand (Product Level)</Form.Label>
//                   <Form.Control
//                     type="number"
//                     value={localNewItem.initial_qty === 0 ? "" : localNewItem.initial_qty}
//                     onChange={(e) => handleProductLevelChange("initial_qty", e.target.value)}
//                     placeholder="0"
//                     min="0"
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Minimum Order Quantity (Product Level)</Form.Label>
//                   <Form.Control
//                     type="number"
//                     value={localNewItem.min_order_qty === 0 ? "" : localNewItem.min_order_qty}
//                     onChange={(e) => handleProductLevelChange("min_order_qty", e.target.value)}
//                     placeholder="0"
//                     min="0"
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row className="mb-3">
//               <Col md={12}>
//                 <Form.Group>
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <Form.Label className="mb-0">
//                       Warehouse Information
//                       {preselectedWarehouseId && (
//                         <span className="text-muted ms-2">
//                           (Warehouse pre-selected from previous page)
//                         </span>
//                       )}
//                     </Form.Label>
//                     {/* NEW: Disable button if preselectedWarehouseId exists */}
//                     <Button
//                       variant="outline-primary"
//                       size="sm"
//                       onClick={addWarehouseRow}
//                       disabled={
//                         localNewItem.productWarehouses.length >= warehouses.length ||
//                         !!preselectedWarehouseId // Disable if preselected
//                       }
//                       style={{
//                         backgroundColor: "#27b2b6",
//                         border: "none",
//                         color: "#fff",
//                         padding: "6px 16px",
//                       }}
//                     >
//                       + Add Warehouse
//                     </Button>
//                   </div>
//                   {isLoadingWarehouses ? (
//                     <div className="text-center py-3">
//                       <Spinner animation="border" size="sm" />
//                       <span className="ms-2">Loading warehouses...</span>
//                     </div>
//                   ) : (
//                     <Table striped bordered hover responsive>
//                       <thead>
//                         <tr>
//                           <th style={{ width: "40%" }}>Warehouse</th>
//                           <th style={{ width: "30%" }}>Stock Quantity</th>
//                           <th style={{ width: "30%" }}>Action</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {localNewItem.productWarehouses.map(
//                           (warehouse, index) => (
//                             <tr key={index}>
//                               <td>
//                                 {/* NEW: Disable dropdown if it's the preselected warehouse */}
//                                 <Form.Select
//                                   value={warehouse.warehouse_id}
//                                   onChange={(e) =>
//                                     handleWarehouseChange(
//                                       index,
//                                       "warehouse_id",
//                                       e.target.value
//                                     )
//                                   }
//                                   disabled={isPreselectedWarehouse(warehouse.warehouse_id)}
//                                 >
//                                   <option value="">Select Warehouse</option>
//                                   {warehouses
//                                     .filter((wh) => {
//                                       const selectedWarehouseIds =
//                                         localNewItem.productWarehouses
//                                           .map((w, i) =>
//                                             i !== index ? w.warehouse_id : null
//                                           )
//                                           .filter((id) => id !== null);
//                                       return !selectedWarehouseIds.includes(
//                                         wh.id
//                                       );
//                                     })
//                                     .map((wh) => (
//                                       <option key={wh.id} value={wh.id}>
//                                         {wh.warehouse_name}
//                                       </option>
//                                     ))}
//                                 </Form.Select>
//                               </td>
//                               <td>
//                                 <Form.Control
//                                   type="number"
//                                   value={warehouse.quantity || ""}
//                                   onChange={(e) =>
//                                     handleWarehouseChange(
//                                       index,
//                                       "quantity",
//                                       e.target.value
//                                     )
//                                   }
//                                   placeholder="0"
//                                   min="0"
//                                 />
//                               </td>
//                               <td>
//                                 <Form.Control
//                                   type="number"
//                                   value={warehouse.min_order_qty || ""}
//                                   onChange={(e) =>
//                                     handleWarehouseChange(
//                                       index,
//                                       "min_order_qty",
//                                       e.target.value
//                                     )
//                                   }
//                                   placeholder="0"
//                                   min="0"
//                                 />
//                               </td>
//                               <td>
//                                 <Form.Control
//                                   type="number"
//                                   value={warehouse.initial_qty || ""}
//                                   onChange={(e) =>
//                                     handleWarehouseChange(
//                                       index,
//                                       "initial_qty",
//                                       e.target.value
//                                     )
//                                   }
//                                   placeholder="0"
//                                   min="0"
//                                 />
//                               </td>
//                               <td className="text-center">
//                                 {/* NEW: Disable remove button if it's the preselected warehouse */}
//                                 <Button
//                                   variant="danger"
//                                   size="sm"
//                                   onClick={() => removeWarehouseRow(index)}
//                                   disabled={
//                                     localNewItem.productWarehouses.length <= 1 ||
//                                     isPreselectedWarehouse(warehouse.warehouse_id)
//                                   }
//                                 >
//                                   Remove
//                                 </Button>
//                               </td>
//                             </tr>
//                           )
//                         )}
//                       </tbody>
//                     </Table>
//                   )}
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row className="mb-3">
//               <Col md={12}>
//                 <Form.Group>
//                   <Form.Label>Item Description</Form.Label>
//                   <Form.Control as="textarea" rows={2} name="description" value={localNewItem.description} onChange={handleChange} placeholder="Enter item description" />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>As Of Date</Form.Label>
//                   <Form.Control type="date" name="date" value={localNewItem.date} onChange={handleChange} />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Default Tax Account</Form.Label>
//                   <Form.Control name="taxAccount" value={localNewItem.taxAccount} onChange={handleChange} placeholder="Enter tax account" />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Initial Cost/Unit</Form.Label>
//                   <Form.Control name="cost" type="number" value={localNewItem.cost} onChange={handleChange} placeholder="0.00" step="0.01" min="0" />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Default Sale Price (Exclusive)</Form.Label>
//                   <Form.Control name="salePriceExclusive" type="number" value={localNewItem.salePriceExclusive} onChange={handleChange} placeholder="0.00" step="0.01" min="0" />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Default Purchase Price (Inclusive)</Form.Label>
//                   <Form.Control name="salePriceInclusive" type="number" value={localNewItem.salePriceInclusive} onChange={handleChange} placeholder="0.00" step="0.01" min="0" />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Default Discount %</Form.Label>
//                   <Form.Control name="discount" type="number" value={localNewItem.discount} onChange={handleChange} placeholder="0" step="0.01" min="0" max="100" />
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row className="mb-3">
//               <Col md={12}>
//                 <Form.Group>
//                   <Form.Label>Remarks</Form.Label>
//                   <Form.Control name="remarks" value={localNewItem.remarks} onChange={handleChange} placeholder="Enter remarks" />
//                 </Form.Group>
//               </Col>
//             </Row>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleClose}>Cancel</Button>
//           <Button
//             style={{ backgroundColor: "#27b2b6", borderColor: "#27b2b6" }}
//             onClick={isAdding ? handleAddProductApi : handleUpdateProductApi}
//             disabled={isAddingProduct || isUpdatingProduct || localNewItem.productWarehouses.length === 0}
//           >
//             {isAdding ? (isAddingProduct ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Adding...</> : "Add")
//               : isUpdatingProduct ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Updating...</> : "Update"}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       <Modal
//         show={internalShowAddCategoryModal}
//         onHide={() => setInternalShowAddCategoryModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Add New Category</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group>
//             <Form.Label>Category Name</Form.Label>
//             <Form.Control
//               type="text"
//               placeholder="Enter new category name"
//               value={internalNewCategory}
//               onChange={(e) => setInternalNewCategory(e.target.value)}
//             />
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setInternalShowAddCategoryModal(false)}>Cancel</Button>
//           <Button style={{ backgroundColor: "#27b2b6", border: "none", color: "#fff" }} onClick={handleAddCategoryApi}>
//             {isAddingCategory ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Adding...</> : "Add"}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       <Modal
//         show={showAddUOMModal}
//         onHide={() => setShowAddUOMModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Add New UOM</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group>
//             <Form.Label>UOM Name</Form.Label>
//             <Form.Control type="text" placeholder="Enter new UOM" value={newUOM} onChange={(e) => setNewUOM(e.target.value)} />
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowAddUOMModal(false)}>Cancel</Button>
//           <Button style={{ backgroundColor: "#27b2b6", border: "none", color: "#fff" }} onClick={handleAddUOM}>Add</Button>
//         </Modal.Footer>
//       </Modal>

//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={true}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         limit={3}
//       />
//     </>
//   );
// };

// export default AddProductModal;