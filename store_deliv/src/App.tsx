import { useState, useEffect } from "react";
import "./App.css";
import Dropzone from "./components/Dropzone";
import { extractCoordinatesFromGoogleMapsUrl } from "./gps.tsx";

interface Product {
  id: string;
  name: string;
  photo: string | null;
}

interface Location {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface JourneyItem {
  productId: string;
  productName: string;
  quantity: string;
}

interface JourneyStop {
  location: Location;
  items: JourneyItem[];
}

interface Journey {
  id: string;
  name: string;
  date: string;
  stops: JourneyStop[];
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

  useEffect(() => {
    fetch(`http://localhost:5000/api/journeys`)
      .then((response) => response.json())
      .then((data) => setJourneys(data))
      .catch((error) => console.error("Error loading journeys:", error));
  }, []);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);

  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showNewLocation, setShowNewLocation] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);

  const [currentJourney, setCurrentJourney] = useState<Partial<Journey>>({
    id: "",
    name: "",
    date: new Date().toISOString().split("T")[0],
    stops: [],
  });

  const [currentStop, setCurrentStop] = useState<Partial<JourneyStop>>({
    location: undefined,
    items: [],
  });

  const [currentItem, setCurrentItem] = useState<Partial<JourneyItem>>({
    productId: "",
    productName: "",
    quantity: "",
  });

  const [extractedCoords, setExtractedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [newProduct, setNewProduct] = useState<Product>({
    id: "",
    photo: null,
    name: "",
  });
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
  });

  {
    /* product functions */
  }

  const handleAddProduct = () => {
    if (newProduct.name) {
      const productId = Date.now().toString();

      const productToSave: Product = {
        id: productId,
        name: newProduct.name,
        photo: newProduct.photo,
      };

      fetch(`http://localhost:5000/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToSave),
      })
        .then((res) => res.json())
        .then((savedProduct) => {
          setProducts((prev) => [savedProduct, ...prev].slice(0, 5));
          setNewProduct({
            id: "",
            photo: null,
            name: "",
          });
          setShowNewProduct(false);
        })
        .catch((error) => {
          console.error("Error saving product:", error);
        });
    }
  };

  const handleRemoveProduct = (id: string, photo: string | null) => {
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

    try {
      fetch(`http://localhost:5000/api${photo}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
      alert("Eroare la eliminarea produsului de pe server.");
    }
  };

  const renderProductTable = (
    selectable = false,
    onSelect?: (product: Product) => void,
  ) => {
    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            {!selectable && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr
                key={product.id}
                className={selectable ? "clickable-row" : ""}
                onClick={() => selectable && onSelect?.(product)}
                title={selectable ? "Click to select this product" : ""}
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
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{product.name}</td>
                {!selectable && (
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveProduct(product.id, product.photo);
                      }}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                )}
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

  const getFullPhotoUrl = (photoPath: string | null): string | undefined => {
    if (!photoPath) return undefined;
    if (photoPath.startsWith("http")) return photoPath;
    if (photoPath.startsWith("/uploads"))
      return `http://localhost:5000${photoPath}`;
    return `http://localhost:5000/uploads/${photoPath}`;
  };

  {
    /* location functions */
  }

  const handleAddLocation = async () => {
    if (newLocation.name && newLocation.address) {
      let coordinates = null;
      try {
        const result = await extractCoordinatesFromGoogleMapsUrl(
          newLocation.address,
        );
        if (result.success) {
          coordinates = { lat: result.lat, lng: result.lng };
        }

        const location: Location = {
          id: Date.now().toString(),
          name: newLocation.name,
          address: newLocation.address,
          ...(coordinates && { coordinates }),
        };

        fetch(`http://localhost:5000/api/locations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(location),
        })
          .then((res) => res.json())
          .then((savedLocation) => {
            setLocations((prev) => [savedLocation, ...prev]);
            setNewLocation({ name: "", address: "" });
            setShowNewLocation(false);
            setExtractedCoords(null);
          })
          .catch((error) => {
            console.error("Error saving location:", error);
            alert("Failed to save location");
          });
      } catch (error) {
        console.error("Error extracting coordinates:", error);
        setExtractedCoords(null);
      }
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

  const renderLocationTable = (
    selectable = false,
    onSelect?: (location: Location) => void,
  ) => {
    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address / Coordinates</th>
            {!selectable && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {locations.length > 0 ? (
            locations.map((location) => (
              <tr
                key={location.id}
                className={selectable ? "clickable-row" : ""}
                onClick={() => selectable && onSelect?.(location)}
                title={selectable ? "Click to select this location" : ""}
              >
                <td>{location.name}</td>
                <td>
                  {location.coordinates
                    ? `${location.coordinates.lat.toFixed(6)}, ${location.coordinates.lng.toFixed(6)}`
                    : location.address}
                </td>
                {!selectable && (
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLocation(location.id);
                      }}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="no-data">
                No locations saved.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  const handleAddressChange = async (address: string) => {
    setNewLocation((prev) => ({ ...prev, address }));
    setExtractedCoords(null);

    if (
      address.includes("google.com/maps") ||
      address.includes("goo.gl") ||
      address.includes("maps.app.goo.gl")
    ) {
      try {
        const result = await extractCoordinatesFromGoogleMapsUrl(address);

        if (result.success) {
          setExtractedCoords({
            lat: result.lat,
            lng: result.lng,
          });

          if (result.note) {
            console.log("Note:", result.note);
          }
        } else {
          setExtractedCoords(null);
          console.log("Could not extract coordinates:", result.error);
        }
      } catch (error) {
        console.error("Error extracting coordinates:", error);
        setExtractedCoords(null);
      }
    }
  };

  {
    /* journey functions */
  }

  const startNewJourney = () => {
    setCurrentJourney({
      id: "",
      name: "",
      date: new Date().toISOString().split("T")[0],
      stops: [],
    });
    setCurrentStop({
      location: undefined,
      items: [],
    });
    setCurrentItem({
      productId: "",
      productName: "",
      quantity: "",
    });
    setShowJourneyModal(true);
  };

  const addLocationToStop = (location: Location) => {
    setCurrentStop({
      location,
      items: currentStop.items || [],
    });
    setShowLocationModal(false);
    setShowJourneyModal(true);
  };

  const addProductToStop = (product: Product) => {
    setCurrentItem({
      productId: product.id,
      productName: product.name,
      quantity: "",
    });
    setShowJourneyModal(true);
  };

  const addItemToCurrentStop = () => {
    if (currentItem.productId && currentItem.quantity && currentStop.location) {
      const newItem: JourneyItem = {
        productId: currentItem.productId,
        productName: currentItem.productName || "",
        quantity: currentItem.quantity,
      };

      setCurrentStop({
        ...currentStop,
        items: [...(currentStop.items || []), newItem],
      });

      setCurrentItem({
        productId: "",
        productName: "",
        quantity: "",
      });

      setShowProductModal(false);
    }
  };

  const saveCurrentStop = () => {
    if (currentStop.location && (currentStop.items?.length || 0) > 0) {
      setCurrentJourney({
        ...currentJourney,
        stops: [...(currentJourney.stops || []), currentStop as JourneyStop],
      });

      setCurrentStop({
        location: undefined,
        items: [],
      });
    }
  };

  const saveJourney = () => {
    if (currentJourney.name && (currentJourney.stops?.length || 0) > 0) {
      const journeyToSave: Journey = {
        id: Date.now().toString(),
        name: currentJourney.name,
        date: currentJourney.date || new Date().toISOString().split("T")[0],
        stops: currentJourney.stops as JourneyStop[],
      };

      fetch(`http://localhost:5000/api/journeys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(journeyToSave),
      })
        .then((res) => res.json())
        .then((savedJourney) => {
          setJourneys((prev) => [savedJourney, ...prev]);
          setCurrentJourney({ id: "", name: "", date: "", stops: [] });
          setShowJourneyModal(false);
        })
        .catch((error) => console.error("Error saving journey:", error));
    }
  };

  const renderJourneyBuilder = () => {
    return (
      <div className="journey-builder">
        <h1>Build Your Journey</h1>

        {/* Journey Details */}
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              placeholder="Journey Name"
              value={currentJourney.name || ""}
              onChange={(e) =>
                setCurrentJourney({ ...currentJourney, name: e.target.value })
              }
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="date"
              value={currentJourney.date || ""}
              onChange={(e) =>
                setCurrentJourney({ ...currentJourney, date: e.target.value })
              }
              className="form-input"
            />
          </div>
        </div>

        {/* Current Stop Builder */}
        <div className="stop-builder">
          <h3>Current Stop</h3>

          {/* Location Selection */}
          <div className="location-selection">
            {currentStop.location ? (
              <div className="selected-item">
                <strong>Location:</strong> {currentStop.location.name}
                <button
                  onClick={() =>
                    setCurrentStop({ ...currentStop, location: undefined })
                  }
                  className="small-btn"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                className="secondary-btn"
                onClick={() => {
                  setShowLocationModal(true);
                  setShowJourneyModal(false);
                }}
              >
                Select Location
              </button>
            )}
          </div>

          {/* Items for current stop */}
          {currentStop.location && (
            <div className="items-section">
              {!currentStop.items && <h4>Products for this location</h4>}
              {/* Current item being added */}
              <div className="form-row">
                {currentItem.productId && (
                  <>
                    <div className="selected-product">
                      {currentItem.productName}
                    </div>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={currentItem.quantity || ""}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          quantity: e.target.value,
                        })
                      }
                      className="form-input quantity-input"
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <button
                        className="primary-btn"
                        onClick={addItemToCurrentStop}
                        disabled={!currentItem.quantity}
                      >
                        Add to Stop
                      </button>
                      <button
                        className="small-btn"
                        onClick={() =>
                          setCurrentItem({
                            productId: "",
                            productName: "",
                            quantity: "",
                          })
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
              {/* Items list for current stop */}
              {currentStop.items && currentStop.items.length > 0 && (
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStop.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>
                          <button
                            onClick={() => {
                              const newItems = [...(currentStop.items || [])];
                              newItems.splice(index, 1);
                              setCurrentStop({
                                ...currentStop,
                                items: newItems,
                              });
                            }}
                            className="delete-btn"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button
                className="secondary-btn"
                onClick={() => {
                  setShowProductModal(true);
                  setShowJourneyModal(false);
                }}
                disabled={!!currentItem.productId}
              >
                Select Product
              </button>

              {/* Save current stop button */}
              {currentStop.items && currentStop.items.length > 0 && (
                <button className="primary-btn" onClick={saveCurrentStop}>
                  Save This Stop
                </button>
              )}
            </div>
          )}
        </div>

        {/* Journey Stops Summary */}
        {currentJourney.stops && currentJourney.stops.length > 0 && (
          <div className="journey-summary">
            <h3>Journey Stops</h3>
            {currentJourney.stops.map((stop, stopIndex) => (
              <div key={stopIndex} className="stop-summary">
                <h4>
                  Stop {stopIndex + 1}: {stop.location.name}
                </h4>
                <ul>
                  {stop.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      {item.productName} - Quantity: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Save Journey Button */}
        <div className="action-buttons">
          <button
            className="primary-btn"
            onClick={saveJourney}
            disabled={
              !currentJourney.name || (currentJourney.stops?.length || 0) === 0
            }
          >
            Save Journey
          </button>
          <button
            className="secondary-btn"
            onClick={() => {
              setShowJourneyModal(false);
              setCurrentJourney({ id: "", name: "", date: "", stops: [] });
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Company Deliverables System</h1>
      </div>

      <div className="app-content">
        {/* Journey Panel */}
        <div className="content-panel">
          {!showJourneyModal &&
          !showLocationModal &&
          !showProductModal &&
          journeys.length === 0 ? (
            <div className="empty-state">
              <h2>There are no journeys saved.</h2>
              <button className="secondary-btn" onClick={startNewJourney}>
                Create New Journey
              </button>
            </div>
          ) : showJourneyModal ? (
            renderJourneyBuilder()
          ) : (
            !showLocationModal &&
            !showProductModal && (
              <div className="journeys-list">
                <h2>Saved Journeys</h2>
                {journeys.map((journey) => (
                  <div key={journey.id} className="journey-card">
                    <h3>{journey.name}</h3>
                    <p>Date: {journey.date}</p>
                    <p>Stops: {journey.stops.length}</p>
                  </div>
                ))}
                <button className="secondary-btn" onClick={startNewJourney}>
                  Create New Journey
                </button>
              </div>
            )
          )}

          {/* Locations Modal */}
          {showLocationModal && (
            <div className="content-panel">
              {!showNewLocation && locations.length === 0 ? (
                <div className="empty-state">
                  <h2>There are no locations saved.</h2>
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setShowNewLocation(true);
                    }}
                  >
                    Add Location
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setShowLocationModal(false);
                      setShowJourneyModal(true);
                    }}
                  >
                    Back
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
                          onChange={(e) => handleAddressChange(e.target.value)}
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
                            setNewLocation({
                              ...newLocation,
                              name: e.target.value,
                            })
                          }
                          className="form-input"
                        />
                        {extractedCoords && (
                          <div className="coordinates-display">
                            <small>
                              Coordinates extracted:{" "}
                              {extractedCoords.lat.toFixed(6)},{" "}
                              {extractedCoords.lng.toFixed(6)}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-container">
                    {renderLocationTable(true, addLocationToStop)}
                  </div>
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setShowNewLocation(true);
                    }}
                  >
                    {showNewLocation
                      ? "Cancel"
                      : locations.length === 0
                        ? "Add Location"
                        : "Add Another Location"}
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setShowLocationModal(false);
                      setShowJourneyModal(true);
                    }}
                  >
                    Back
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
                        setShowJourneyModal(true);
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
          )}

          {/* Products Modal */}
          {showProductModal && (
            <div className="content-panel">
              {!showNewProduct && products.length === 0 ? (
                <div className="empty-state">
                  <h2>There are no deliverables saved.</h2>
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setShowNewProduct(true);
                    }}
                  >
                    {showNewProduct ? "Cancel" : "Add Product"}
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setShowProductModal(false);
                      setShowJourneyModal(true);
                    }}
                  >
                    Back
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
                            setNewProduct({
                              ...newProduct,
                              name: e.target.value,
                            })
                          }
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div
                      className="form-group"
                      style={{ marginBottom: "2rem" }}
                    >
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
                        <img
                          src={`http://localhost:5000${newProduct.photo}`}
                          alt="Preview"
                          style={{
                            borderRadius: "15px",
                            alignContent: "center",
                            maxWidth: "100%",
                            marginTop: "10px",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-container">
                    {renderProductTable(true, (product) => {
                      addProductToStop(product);
                      setShowProductModal(false);
                    })}
                  </div>
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      if (showNewProduct) {
                        setNewProduct({
                          id: "",
                          name: "",
                          photo: "",
                        });
                        setShowNewProduct(false);
                      } else {
                        setShowNewProduct(true);
                      }
                    }}
                  >
                    Add Product
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setShowProductModal(false);
                      setShowJourneyModal(true);
                    }}
                  >
                    Back
                  </button>
                </>
              )}

              <div className="action-buttons">
                {showNewProduct && (
                  <>
                    <button
                      className="primary-btn"
                      onClick={handleAddProduct}
                      disabled={!newProduct.name}
                    >
                      Save Product
                    </button>
                    <button
                      className="primary-btn"
                      style={{
                        backgroundColor: newProduct.name
                          ? "#f44336"
                          : "#45a049",
                      }}
                      onClick={() => {
                        setNewProduct({
                          id: "",
                          name: "",
                          photo: "",
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
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
