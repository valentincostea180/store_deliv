import { useState } from "react";
import "./App.css";
import Dropzone from "./components/Dropzone";

// interfate
interface Product {
  id: string;
  name: string;
  photo: string;
  quantity: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
}

function App() {
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showOldProduct, setShowOldProduct] = useState(true);
  const [showNewLocation, setShowNewLocation] = useState(false);
  const [showOldLocation, setShowOldLocation] = useState(true);

  const [newProduct, setNewProduct] = useState({
    photo: "",
    name: "",
    quantity: "",
  });

  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const handleRemoveLocation = (id: string) => {
    setLocations(locations.filter((location) => location.id !== id));
  };

  const renderItemTable = () => {
    return (
      <table
        className="table tb table-striped table-bordered"
        style={{ width: "100%" }}
      >
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((newProduct) => (
              <tr
                key={newProduct.id}
                style={{ cursor: "pointer" }}
                onClick={() => handleRemoveProduct(newProduct.id)}
                title="Click to remove this product"
              >
                <td>{newProduct.photo}</td>
                <td>{newProduct.name}</td>
                <td>{newProduct.quantity}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: "center" }}>
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
      <table
        className="table tb table-striped table-bordered"
        style={{ width: "100%" }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {locations.length > 0 ? (
            locations.map((newLocation) => (
              <tr
                key={newLocation.id}
                style={{ cursor: "pointer" }}
                onClick={() => handleRemoveLocation(newLocation.id)}
                title="Click to remove this product"
              >
                <td>{newLocation.name}</td>
                <td>{newLocation.address}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} style={{ textAlign: "center" }}>
                No locations saved.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  return (
    <>
      <div className="agenda-header">
        <h1>Company Deliverables System</h1>
      </div>

      <div className="agenda-content">
        <div className="meetings-panel">
          {showOldProduct && !showNewProduct && (
            <div className="initial-text">
              <h2> There are no deliverable saved.</h2>
              <button
                className="btn-tsx"
                onClick={() => {
                  setShowNewProduct(true);
                }}
              >
                ADD
              </button>
            </div>
          )}

          {showNewProduct && (
            <div className="initial-text">
              <h2>Add New Deliverable</h2>
              <div className="row g-2">
                <div className="col-md">
                  <div className="form-floating">
                    <Dropzone heading="Photo" uploadType="photo" />
                  </div>
                </div>

                <div className="col-md">
                  <div className="form-floating">
                    <input
                      type="text"
                      placeholder="Product name"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-md">
                  <div className="form-floating">
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
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* lista produselor */}
          {!showNewProduct && (
            <div style={{ marginTop: "2rem" }} className="visitors-list">
              {renderItemTable()}
            </div>
          )}

          <button
            className="modal-btn-cancel"
            onClick={() => {
              if (showNewProduct) {
                setNewProduct({ name: "", photo: "", quantity: "" });
              }
              setShowNewProduct((prev) => !prev);
            }}
          >
            {showNewProduct ? "Save" : "Cancel"}
          </button>
        </div>

        <div className="meetings-panel">
          {showOldLocation && !showNewLocation && (
            <div className="initial-text">
              <h2> There are no locations saved.</h2>
              <button
                className="btn-tsx"
                onClick={() => {
                  setShowNewLocation(true);
                }}
              >
                ADD
              </button>
            </div>
          )}

          {showNewLocation && (
            <div className="initial-text">
              <h2>Add New Location</h2>
              <div className="row g-2">
                <div className="col-md">
                  <div className="form-floating">
                    <input
                      type="text"
                      placeholder="Address"
                      value={newLocation.name}
                      onChange={(e) =>
                        setNewLocation({
                          ...newLocation,
                          address: e.target.value,
                        })
                      }
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-md">
                  <div className="form-floating">
                    <input
                      type="text"
                      placeholder="Location name"
                      value={newLocation.name}
                      onChange={(e) =>
                        setNewLocation({ ...newLocation, name: e.target.value })
                      }
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* lista locatiilor */}
          {!showNewLocation && (
            <div style={{ marginTop: "2rem" }} className="visitors-list">
              {renderLocationTable()}
            </div>
          )}

          <button
            className="modal-btn-cancel"
            onClick={() => {
              if (showNewLocation) {
                setNewLocation({ name: "", address: "" });
              }
              setShowNewLocation((prev) => !prev);
            }}
          >
            {showNewLocation ? "Save" : "Cancel"}
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
