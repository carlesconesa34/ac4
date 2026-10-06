const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

// Parse JSON bodies sent by the browser (POST/PUT)
app.use(express.json());

// Serve static files (index.html) from the "public" folder
app.use(express.static("public"));

/**
 * Reads the saved items from the JSON data file.
 */
function readData() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

/**
 * Writes the full item list back to the JSON data file.
 * @param items - The items to save.
 */
function writeData(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

/**
 * Reads every item in storage.
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
 */
app.post("/api/reset", (req, res) => {
  const originalItems = [
    { id: 1, name: "Item A" },
    { id: 2, name: "Item B" },
  ];

  writeData(originalItems);
  res.json(originalItems);
});

/**
 * Starts the Express server and listens for requests.
 */
app.listen(PORT, () => {
  console.log(`CRUD app listening at http://localhost:${PORT}`);
});
