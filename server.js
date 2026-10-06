// ---------- IMPORTS ----------
const express = require("express");
const fs = require("fs");
const path = require("path");

// ---------- SETUP ----------
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

// Middleware: parse JSON bodies sent by the browser (POST/PUT)
app.use(express.json());

// Middleware: serve static files (index.html) from the "public" folder
app.use(express.static("public"));

// ---------- HELPERS ----------

/**
 * Reads the saved items from the JSON data file.
 * @returns {Array<{id: number, name: string}>} The list of all items.
 */
function readData() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

/**
 * Writes the full item list back to the JSON data file.
 * @param {Array<{id: number, name: string}>} items - The items to save.
 */
function writeData(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

// ---------- ROUTES (CRUD) ----------

/**
 * Reads every item in storage.
 * @route GET /api/items
 * @returns {Array<{id: number, name: string}>} The item list.
 */
app.get("/api/items", (req, res) => {
  try {
    const items = readData();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Could not read data file" });
  }
});

/**
 * Reads one item by its id.
 * @route GET /api/items/:id
 * @param {number} req.params.id - The unique item id.
 * @returns {Object} The item matching the requested id.
 */
app.get("/api/items/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const items = readData();
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ error: `Item ${id} not found` });
  }
  res.json(item);
});

/**
 * Creates a new item in storage.
 * @route POST /api/items
 * @param {Object} req.body - The request body.
 * @param {string} req.body.name - The new item name.
 * @returns {Object} The newly created item.
 */
app.post("/api/items", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const items = readData();

  // Generate a new ID (max existing id + 1, or 1 if empty)
  const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;

  const newItem = { id: newId, name };
  items.push(newItem);
  writeData(items);

  res.status(201).json(newItem);
});

/**
 * Updates the name for an existing item.
 * @route PUT /api/items/:id
 * @param {number} req.params.id - The item id to update.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.name - The updated item name.
 * @returns {Object} The updated item.
 */
app.put("/api/items/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name } = req.body;

  const items = readData();
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ error: `Item ${id} not found` });
  }
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  item.name = name;
  writeData(items);

  res.json(item);
});

/**
 * Deletes one item from storage.
 * @route DELETE /api/items/:id
 * @param {number} req.params.id - The item id to remove.
 * @returns {Object} The deleted item details.
 */
app.delete("/api/items/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const items = readData();

  const index = items.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Item ${id} not found` });
  }

  const removed = items.splice(index, 1)[0];
  writeData(items);

  res.json({ message: "Item deleted", item: removed });
});

/**
 * Restores the default sample data set.
 * @route POST /api/reset
 * @returns {Array<{id: number, name: string}>} The reset item list.
 */
app.post("/api/reset", (req, res) => {
  const originalItems = [
    { id: 1, name: "Item A" },
    { id: 2, name: "Item B" },
  ];

  writeData(originalItems);
  res.json(originalItems);
});

// ---------- START SERVER ----------
/**
 * Starts the Express server and listens for requests.
 */
app.listen(PORT, () => {
  console.log(`CRUD app listening at http://localhost:${PORT}`);
});
