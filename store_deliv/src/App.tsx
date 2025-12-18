import { useState } from "react";
import "./App.css";

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

  return (
    <>
      <div className="agenda-header">
        <h1>Company Deliverables System</h1>
      </div>

      <div className="agenda-content">
        <div className="meetings-panel">
          {showOldProduct && !showNewProduct && (
            <div>
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
            <div>
              <h2>Add New Deliverable</h2>
              <div className="row g-2">
                <div className="col-md">
                  <div className="form-floating">
                    <input
                      type="text"
                      placeholder="Photo"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, photo: e.target.value })
                      }
                      className="form-control"
                    />
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
        </div>

        <div className="meetings-panel">
          {showOldLocation && !showNewLocation && (
            <div>
              <h2> There are no deliverable saved.</h2>
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
            <div>
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
        </div>
      </div>
    </>
  );
}

export default App;
