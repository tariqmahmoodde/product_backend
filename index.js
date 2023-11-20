const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const { MONGODB_URI, PORT } = process.env;

if (!MONGODB_URI || !PORT) {
  console.error("Please provide MONGODB_URI and PORT environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    initializeProducts();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
  });

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
});

const Product = mongoose.model("Product", productSchema);

const initializeProducts = async () => {
  try {
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      const dummyData = [
        { name: "Product 1", price: 20, description: "Description 1" },
        { name: "Product 2", price: 30, description: "Description 2" },
        { name: "Product 3", price: 25, description: "Description 3" },
      ];
      await Product.insertMany(dummyData);
      console.log("Dummy products added successfully");
    }
  } catch (error) {
    console.error("Error initializing products:", error);
  }
};
app.use(cors());
app.use(express.json());

// GET all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - create a new product
app.post("/products", async (req, res) => {
  const { name, price, description } = req.body;

  const newProduct = new Product({
    name,
    price,
    description,
  });

  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - update a product by ID
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - delete a product by ID
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
