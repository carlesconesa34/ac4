const messageBox = document.getElementById("message");
const itemList = document.getElementById("item-list");

/**
 * Displays a status message in the message area.
 * @param {string} text - The message to show to the user.
 */
function showMessage(text) {
  messageBox.textContent = text;
}

/**
 * Clears every item from the list shown in the page.
 */
function clearItemList() {
  itemList.innerHTML = "";
}

/**
 * Adds a single item to the items list on the page.
 * @param {{ id: number, name: string }} item - The item to display.
 */
function addItemToList(item) {
  const listItem = document.createElement("li");
  listItem.textContent = `ID: ${item.id}, Name: ${item.name}`;
  itemList.appendChild(listItem);
}

/**
 * Reads all items from the API and renders them on the page.
 * @returns {Promise<void>} Resolves after the list is refreshed.
 */
async function readItems() {
  try {
    const response = await fetch("/api/items");
    const items = await response.json();

    clearItemList();

    if (items.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.textContent = "No items yet.";
      itemList.appendChild(emptyMessage);
      return;
    }

    items.forEach((item) => {
      addItemToList(item);
    });
  } catch (error) {
    showMessage("Could not read the items.");
  }
}

/**
 * Fetches one item by its id and shows the result in the detail area.
 * @param {number|string} id - The id of the item to fetch.
 * @returns {Promise<void>} Resolves after the item detail is displayed.
 */
async function readOneItem(id) {
  const singleItem = document.getElementById("single-item");

  try {
    const response = await fetch(`/api/items/${id}`);
    const result = await response.json();

    if (response.ok) {
      singleItem.textContent = `ID: ${result.id}, Name: ${result.name}`;
    } else {
      singleItem.textContent = result.error;
    }
  } catch (error) {
    singleItem.textContent = "Could not find that item.";
  }
}

/**
 * Sends a new item to the API for creation.
 * @param {string} name - The name of the item to create.
 * @returns {Promise<void>} Resolves after the API responds.
 */
async function createItem(name) {
  try {
    const response = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const result = await response.json();

    if (response.ok) {
      showMessage(`Created item ${result.id}.`);
    } else {
      showMessage(result.error);
    }
  } catch (error) {
    showMessage("Could not create the item.");
  }
}

/**
 * Updates an existing item in the API.
 * @param {number|string} id - The id of the item to update.
 * @param {string} name - The new name to save.
 * @returns {Promise<void>} Resolves after the update request finishes.
 */
async function updateItem(id, name) {
  try {
    const response = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const result = await response.json();

    if (response.ok) {
      showMessage(`Updated item ${result.id}.`);
    } else {
      showMessage(result.error);
    }
  } catch (error) {
    showMessage("Could not update the item.");
  }
}

/**
 * Deletes an item with the matching id from the API.
 * @param {number|string} id - The id of the item to remove.
 * @returns {Promise<void>} Resolves after the delete request completes.
 */
async function deleteItem(id) {
  try {
    const response = await fetch(`/api/items/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (response.ok) {
      showMessage(`Deleted item ${result.item.id}.`);
    } else {
      showMessage(result.error);
    }
  } catch (error) {
    showMessage("Could not delete the item.");
  }
}

/**
 * Resets the local data to the starting sample list.
 * @returns {Promise<void>} Resolves after the reset request completes.
 */
async function resetData() {
  try {
    const response = await fetch("/api/reset", { method: "POST" });

    if (response.ok) {
      showMessage("Data reset.");
    } else {
      showMessage("Could not reset data.");
    }
  } catch (error) {
    showMessage("Could not reset data.");
  }
}

document.getElementById("read-button").addEventListener("click", readItems);

document
  .getElementById("read-one-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.getElementById("read-one-id").value;
    await readOneItem(id);
    event.target.reset();
  });

document
  .getElementById("create-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("create-name").value;
    await createItem(name);
    event.target.reset();
    readItems();
  });

document
  .getElementById("update-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.getElementById("update-id").value;
    const name = document.getElementById("update-name").value;
    await updateItem(id, name);
    event.target.reset();
    readItems();
  });

document
  .getElementById("delete-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.getElementById("delete-id").value;
    await deleteItem(id);
    event.target.reset();
    readItems();
  });

document.getElementById("reset-button").addEventListener("click", async () => {
  await resetData();
  readItems();
});

readItems();
