const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
app.use(express.json());

const filePath = path.join(__dirname, "contact.json");

// Helper functions
async function getContacts() {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function saveContacts(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Routes
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await getContacts();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to read contacts" });
  }
});

app.post("/api/contacts", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and Email are required" });
    }

    const contacts = await getContacts();
    const newContact = { name, email };
    contacts.push(newContact);

    await saveContacts(contacts);
    res.status(201).json({ message: "Contact added", contact: newContact });
  } catch (error) {
    res.status(500).json({ error: "Failed to add contact" });
  }
});

app.put("/api/contacts/:index", async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const contacts = await getContacts();

    if (isNaN(index) || index < 0 || index >= contacts.length) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const { name, email } = req.body;
    contacts[index] = {
      ...contacts[index],
      ...(name && { name }),
      ...(email && { email })
    };

    await saveContacts(contacts);
    res.json({ message: "Contact updated", contact: contacts[index] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update contact" });
  }
});

app.delete("/api/contacts/:index", async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const contacts = await getContacts();

    if (isNaN(index) || index < 0 || index >= contacts.length) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const deleted = contacts.splice(index, 1)[0];
    await saveContacts(contacts);
    res.json({ message: "Contact deleted", deleted });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
