// server.js
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";

// create __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// storage initialization for product's jpg
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // only image files
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); 
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

const dataDir = path.join(__dirname, "public", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const productsPath = path.join(dataDir, "products.json");
const locationsPath = path.join(dataDir, "location.json");

if (!fs.existsSync(locationsPath))
  fs.writeFileSync(locationsPath, JSON.stringify([], null, 2));
if (!fs.existsSync(productsPath))
  fs.writeFileSync(productsPath, JSON.stringify([], null, 2)); 

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
  res.json(locations);
} catch(err) {
  res.status(500).json({error: "Failed to read the locations."  })
}
})

app.post("/api/products", (req, res) => {
  try {
    const products = readJSON(productsPath);
    const newProd = { 
      id: Date.now().toString(), 
      ...req.body
    };
    products.push(newProd);
    writeJSON(productsPath, products);
    res.json(newProd);
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

app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  try {
    const products = readJSON(productsPath);
    const filteredProducts = products.filter(product => product.id !== req.params.id);
    
    if (filteredProducts.length === products.length) {
      return res.status(404).json({ error: "Product not found." });
    }
    
    writeJSON(productsPath, filteredProducts);
    res.json({ message: "Product deleted successfully." });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product." });
  }
});

app.delete("/api/locations/:id", (req, res) => {
  try {
    const locations = readJSON(locationsPath);
    const filteredLocations = locations.filter(locations => locations.id !== req.params.id);
    
    if (filteredLocations.length === locations.length) {
      return res.status(404).json({ error: "Location not found." });
    }
    
    writeJSON(locationsPath, filteredLocations);
    res.json({ message: "Location deleted successfully." });
  } catch (err) {
    console.error("Error deleting Location:", err);
    res.status(500).json({ error: "Failed to delete Location." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

