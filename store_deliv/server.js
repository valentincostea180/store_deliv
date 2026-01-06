// server.js
import express from "express";

// create __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from public directory

// Ensure public/data directory exists
const dataDir = path.join(__dirname, "public", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const productsPath = path.join(dataDir, "products.json");
const locationsPath = path.join(dataDir, "location.json");

if (!fs.existsSync(locationsPath))
  fs.writeFileSync(locationsPath, JSON.stringify([], null, 2));
if (!fs.existsSync(productsPath))
  fs.writeFileSync(productsPath, JSON.stringify({}, null, 2)); 

const readJSON = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
};

const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
    throw err;
  }
};

app.get("/api/products", (req, res) => {
  try {
    const products = readJSON(productsPath);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to read the products." });
  }
});

app.get("/api/locations", (reg,res) => {
try {
  const locations = readJSON(locationsPath);
  res.json(locaitons);
} catch(err) {
  res.status(500).json({error: "Failed to read the locations."  })
}
})

app.post("/api/products", (req, res) => {
  try {
    console.log("Received POST request:", req.body);
    const products = readJSON(productsPath);
    const { id, name, photo, quantity } = req.body;

    const productIndex = productsPath.findIndex((product) => product.id === id);
    if (productIndex === -1)
      return res.status(404).json({ error: "Product not found" });

    // Generate a unique ID for the new meeting
    const newProductId = `m-${Date.now()}`;
    const newProduct = {
      id: newProductId,
      name,
      photo,
      quantity,
    };

    // Initialize meetings array if it doesn't exist
    if (!products[productIndex].products) {
      products[productIndex].products = [];
    }

    // Add the new meeting to the room's meetings array
    products[productIndex].products.push(newProduct);

    writeJSON(productsPath, products);
    res.json(products[productIndex]);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.post("/api/locations", (req, res) => {
  try {
    const locations = readJSON(locationsPath);
    const newLocation = { id: Date.now().toString(), ...req.body };
    locations.push(newLocation);
    writeJSON(locationsPath, locations);
    res.json(newLocation);
  } catch (err) {
    console.error("Error adding location:", err);
    res.status(500).json({ error: "Failed to add location" });
  }
});