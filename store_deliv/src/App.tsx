import { useState } from "react";
import "./App.css";
import Dropzone from "./components/Dropzone";

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

  const renderItemTable = () => {
    const today = new Date();
    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(today.getDate() + 2);

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
            products.slice(-4).map((newProduct) => (
              <tr
                key={newProduct.id}
                style={{ cursor: "pointer" }}
                onClick={() => handleEliminate(newProduct.id)}
                title="Click to remove this visiproducttor"
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

          {/* lista produselor */}
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
