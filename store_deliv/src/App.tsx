import { useState } from "react";
import "./App.css";

function App() {
  const [showNewProduct, setShowNewProduct] = useState(false);

  return (
    <>
      <div className="agenda-header">
        <h2>Company Deliverables System</h2>
      </div>

      <div className="agenda-content">
        {showNewProduct && <div className="agenda-panel"> 1 </div>}

        <div className="meetings-panel"></div>

        <button
          className="btn-tsx"
          onClick={() => {
            setShowNewProduct(true);
          }}
        >
          +
        </button>

        <div className="meetings-panel"></div>
      </div>
    </>
  );
}

export default App;
