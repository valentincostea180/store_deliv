import { useState, useEffect } from "react";
import "./App.css";
import Dropzone from "./components/Dropzone";

interface Product {
  id: string;
  name: string;
  photo: string | null;
  quantity: string;
}
interface Location {
  id: string;
  name: string;
  address: string;
}

function App() {
  useEffect(() => {
    fetch(`http://localhost:5000/api/products`)
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error loading products:", error));
  }, []);

  useEffect(() => {
    fetch(`http://localhost:5000/api/locations`)
      .then((response) => response.json())
      .then((data) => setLocations(data))
      .catch((error) => console.error("Error loading locations:", error));
  }, []);

  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showNewLocation, setShowNewLocation] = useState(false);

  const [newProduct, setNewProduct] = useState<Product>({
    id: "",
    photo: null,
    name: "",
    quantity: "",
  });

  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.quantity) {
      // Generate ID once here
      const productId = Date.now().toString();

      const productToSave: Product = {
        id: productId,
        name: newProduct.name,
        photo: newProduct.photo, // This should now have the uploaded URL
        quantity: newProduct.quantity,
      };

      fetch(`http://localhost:5000/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToSave),
      })
        .then((res) => res.json())
        .then((savedProduct) => {
          setProducts((prev) => [savedProduct, ...prev].slice(0, 5));
          // Reset form
          setNewProduct({
            id: "",
            photo: null,
            name: "",
            quantity: "",
          });
          setShowNewProduct(false);
        })
        .catch((error) => {
          console.error("Error saving product:", error);
        });
    }
  };

  const handleAddLocation = () => {
    if (newLocation.name && newLocation.address) {
      const location: Location = {
        id: Date.now().toString(),
        name: newLocation.name,
        address: newLocation.address,
      };

      setNewLocation({ name: "", address: "" });
      setShowNewLocation(false);

      fetch(`http://localhost:5000/api/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location),
      }).then((res) => res.json());
    }
  };

  const handleRemoveProduct = (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this prducts?",
    );
    if (!confirmDelete) return;

    try {
      fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
      });

      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      console.error(err);
      alert("Eroare la eliminarea produsului de pe server.");
    }
  };

  const handleRemoveLocation = (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this prducts?",
    );
    if (!confirmDelete) return;

    try {
      fetch(`http://localhost:5000/api/locations/${id}`, {
        method: "DELETE",
      });

      setLocations(locations.filter((location) => location.id !== id));
    } catch (err) {
      console.error(err);
      alert("Eroare la eliminarea locatiei de pe server.");
    }
  };

  const renderProductTable = () => {
    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr
                key={product.id}
                className="clickable-row"
                onClick={() => handleRemoveProduct(product.id)}
                title="Click to remove this product"
              >
                <td>
                  {product.photo ? (
                    <img
                      src={getFullPhotoUrl(product.photo)}
                      alt={product.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="no-data">
                No products saved.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  const renderLocationTable = () => {
    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {locations.length > 0 ? (
            locations.map((location) => (
              <tr
                key={location.id}
                className="clickable-row"
                onClick={() => handleRemoveLocation(location.id)}
                title="Click to remove this location"
              >
                <td>{location.name}</td>
                <td>{location.address}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="no-data">
                No locations saved.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  const getFullPhotoUrl = (photoPath: string | null): string | undefined => {
    if (!photoPath) return undefined;
    if (photoPath.startsWith("http")) return photoPath;
    if (photoPath.startsWith("/uploads"))
      return `http://localhost:5000${photoPath}`;
    return `http://localhost:5000/uploads/${photoPath}`;
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Company Deliverables System</h1>
      </div>

      <div className="app-content">
        {/* Products Panel */}
        <div className="content-panel">
          {!showNewProduct && products.length === 0 ? (
            <div className="empty-state">
              <h2>There are no deliverables saved.</h2>
              <button
                className="secondary-btn"
                onClick={() => {
                  if (showNewProduct) {
                    setNewProduct({
                      id: "",
                      name: "",
                      photo: "",
                      quantity: "",
                    });
                    setShowNewProduct(false);
                  } else {
                    setShowNewProduct(true);
                  }
                }}
              >
                {showNewProduct ? "Cancel" : "Add Product"}
              </button>
            </div>
          ) : showNewProduct ? (
            <div className="form-container">
              <h2>Add New Deliverable</h2>
              <div className="form-row">
                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Product name"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Quantity"
                      value={newProduct.quantity}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          quantity: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-group">
                    {!newProduct.photo && (
                      <Dropzone
                        heading="Photo"
                        uploadType="photo"
                        onUpload={(url: string) => {
                          setNewProduct((prev) => ({
                            ...prev,
                            photo: url,
                          }));
                        }}
                      />
                    )}
                    {newProduct.photo && (
                      <div className="photo-preview">
                        <img
                          src={`http://localhost:5000${newProduct.photo}`}
                          alt="Preview"
                          style={{
                            borderRadius: "15px",
                            alignContent: "center",
                            maxWidth: "300px",
                            maxHeight: "300px",
                            marginTop: "10px",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="table-container">{renderProductTable()}</div>
              <button
                className="secondary-btn"
                onClick={() => {
                  if (showNewProduct) {
                    setNewProduct({
                      id: "",
                      name: "",
                      photo: "",
                      quantity: "",
                    });
                    setShowNewProduct(false);
                  } else {
                    setShowNewProduct(true);
                  }
                }}
              >
                Add Product
              </button>
            </>
          )}

          <div className="action-buttons">
            {showNewProduct && (
              <>
                <button
                  className="primary-btn"
                  onClick={handleAddProduct}
                  disabled={!newProduct.name || !newProduct.quantity}
                >
                  Save Product
                </button>
                <button
                  className="primary-btn"
                  style={{
                    backgroundColor:
                      newProduct.name && newProduct.quantity
                        ? "#f44336"
                        : "#45a049",
                  }}
                  onClick={() => {
                    setNewProduct({
                      id: "",
                      name: "",
                      photo: "",
                      quantity: "",
                    });
                    setShowNewProduct(false);
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Locations Panel */}
        <div className="content-panel">
          {!showNewLocation && locations.length === 0 ? (
            <div className="empty-state">
              <h2>There are no locations saved.</h2>
              <button
                className="secondary-btn"
                onClick={() => {
                  if (showNewLocation) {
                    setNewLocation({ name: "", address: "" });
                    setShowNewLocation(false);
                  } else {
                    setShowNewLocation(true);
                  }
                }}
              >
                Add Location
              </button>
            </div>
          ) : showNewLocation ? (
            <div className="form-container">
              <h2>Add New Location</h2>
              <div className="form-row">
                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Address"
                      value={newLocation.address}
                      onChange={(e) =>
                        setNewLocation({
                          ...newLocation,
                          address: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Location name"
                      value={newLocation.name}
                      onChange={(e) =>
                        setNewLocation({ ...newLocation, name: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="table-container">{renderLocationTable()}</div>
              <button
                className="secondary-btn"
                onClick={() => {
                  if (showNewLocation) {
                    setNewLocation({ name: "", address: "" });
                    setShowNewLocation(false);
                  } else {
                    setShowNewLocation(true);
                  }
                }}
              >
                {showNewLocation
                  ? "Cancel"
                  : locations.length === 0
                    ? "Add Location"
                    : "Add Another Location"}
              </button>
            </>
          )}

          <div className="action-buttons">
            {showNewLocation && (
              <>
                <button
                  className="primary-btn"
                  onClick={handleAddLocation}
                  disabled={!newLocation.name || !newLocation.address}
                >
                  Save Location
                </button>
                <button
                  className="primary-btn"
                  onClick={() => {
                    setNewLocation({ address: "", name: "" });
                    setShowNewLocation(false);
                  }}
                  style={{
                    backgroundColor:
                      newLocation.name && newLocation.address
                        ? "#f44336"
                        : "#45a049",
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
