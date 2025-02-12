const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Serve static files (index.html, script.js, styles.css, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Helper function to read users from the JSON file
const readUsers = () => {
    try {
        const data = fs.readFileSync("users.json", "utf8"); // Read users file
        return JSON.parse(data); // Parse JSON data
    } catch (err) {
        console.error("Error reading users file:", err);
        return {}; // If there's an error, return an empty object
    }
};

// Helper function to write users to JSON
const writeUsers = (users) => {
    try {
        fs.writeFileSync("users.json", JSON.stringify(users, null, 2)); // Write to users.json
    } catch (err) {
        console.error("Error writing to users file:", err);
    }
};

// Helper function to read passwords from JSON
const readPasswords = () => {
    try {
        const data = fs.readFileSync("passwords.json", "utf8"); // Read passwords file
        return JSON.parse(data); // Parse JSON data
    } catch (err) {
        console.error("Error reading passwords file:", err);
        return {}; // If there's an error, return an empty object
    }
};

// Root route (for testing server)
app.get("/", (req, res) => {
    res.send("Password Manager Server is Running");
});

// Login route
app.post("/login", (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).send("User ID and password are required.");
    }

    const users = readUsers(); // Read users from the users.json file
    const user = users[userId];

    if (!user) {
        return res.status(401).send("Incorrect user ID.");
    }

    // Check if the password matches
    if (user.password === password) {
        return res.status(200).send({ message: "Login successful", userId: userId });
    } else {
        return res.status(401).send("Incorrect password.");
    }
});

// Get passwords for a specific user by userId
app.get("/passwords/:userId", (req, res) => {
    const userId = req.params.userId;
    const passwords = readPasswords(); // Read passwords from the JSON file

    if (passwords[userId]) {
        return res.json(passwords[userId]); // Send user's passwords if they exist
    } else {
        return res.status(404).send("No passwords found for this user.");
    }
});

// Add a new password for a specific user
app.post("/passwords/:userId", (req, res) => {
    const userId = req.params.userId;
    const { website, username, password } = req.body;

    if (!website || !username || !password) {
        return res.status(400).send("Missing required fields: website, username, password");
    }

    const passwords = readPasswords(); // Read existing passwords

    if (!passwords[userId]) {
        passwords[userId] = []; // If no passwords for the user, initialize them
    }

    // Add the new password to the user's list
    passwords[userId].push({ website, username, password });

    try {
        fs.writeFileSync("passwords.json", JSON.stringify(passwords, null, 2)); // Write updated passwords to file
    } catch (err) {
        console.error("Error writing to passwords file:", err);
    }

    res.status(201).send("Password added successfully!");
});

// Change user ID route (for the logged-in user)
app.post("/change-user-id", (req, res) => {
    const { currentUserId, newUserId } = req.body;
    const users = readUsers();

    if (!currentUserId || !newUserId) {
        return res.status(400).send("Current user ID and new user ID are required.");
    }

    if (users[currentUserId]) {
        users[newUserId] = users[currentUserId];
        delete users[currentUserId];
        writeUsers(users);
        return res.status(200).send("User ID updated successfully.");
    }

    return res.status(404).send("Current user not found.");
});

// Change password route (for the logged-in user)
app.post("/change-password", (req, res) => {
    const { userId, newPassword } = req.body;
    const users = readUsers();

    if (!userId || !newPassword) {
        return res.status(400).send("User ID and new password are required.");
    }

    if (users[userId]) {
        users[userId].password = newPassword;
        writeUsers(users);
        return res.status(200).send("Password updated successfully.");
    }

    return res.status(404).send("User not found.");
});

// Add a new user (admin only)
app.post("/add-user", (req, res) => {
    const { adminId, adminPassword, newUserId, newUserPassword, isAdmin } = req.body;
    const users = readUsers();

    const admin = users[adminId];

    if (!admin || admin.password !== adminPassword || !admin.isAdmin) {
        return res.status(403).send("Admin credentials are incorrect.");
    }

    if (!newUserId || !newUserPassword) {
        return res.status(400).send("New user ID and password are required.");
    }

    users[newUserId] = {
        password: newUserPassword,
        isAdmin: isAdmin || false
    };

    writeUsers(users);
    return res.status(201).send("New user added successfully.");
});

// Reset another user's password (admin only)
app.post("/reset-password", (req, res) => {
    const { adminId, adminPassword, userId, newPassword } = req.body;
    const users = readUsers();

    const admin = users[adminId];

    if (!admin || admin.password !== adminPassword || !admin.isAdmin) {
        return res.status(403).send("Admin credentials are incorrect.");
    }

    if (!userId || !newPassword) {
        return res.status(400).send("User ID and new password are required.");
    }

    if (users[userId]) {
        users[userId].password = newPassword;
        writeUsers(users);
        return res.status(200).send("Password reset successfully.");
    }

    return res.status(404).send("User not found.");
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
