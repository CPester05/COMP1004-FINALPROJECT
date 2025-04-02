const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require('cors'); // Import the cors package

const app = express();
const port = 3000;

// Middleware to parse JSON & use cors
app.use(bodyParser.json());
app.use(cors());
const CryptoJS = require("crypto-js");

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Helper function to read and parse JSON files
const readJsonFile = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return {};
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err);
        return {};
    }
};

// Helper function to write JSON data
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error writing to ${filePath}:`, err);
    }
};

// File paths
const usersFile = "users.json";
const passwordsFile = "passwords.json";

// Read users from file
const readUsers = () => readJsonFile(usersFile);

// Write users to file
const writeUsers = (users) => writeJsonFile(usersFile, users);

// Read passwords from file
const readPasswords = () => readJsonFile(passwordsFile);

// Write passwords to file
const writePasswords = (passwords) => writeJsonFile(passwordsFile, passwords);

// Encrypt password with user-specific key
const encryptPassword = (password, masterKey) => {
    return CryptoJS.AES.encrypt(password, masterKey).toString();
};

// Decrypt password with user-specific key
const decryptPassword = (encryptedPassword, masterKey) => {
    console.log("Decrypting with Master Key:", masterKey);
    console.log("Encrypted Value:", encryptedPassword);

    try {
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, masterKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) {
            console.log("Decryption failed, returning null.");
            return null;
        }

        console.log("Successfully decrypted:", decrypted);
        return decrypted;
    } catch (error) {
        console.error("Error in decryption:", error);
        return null;
    }
};

// User login
app.post("/login", (req, res) => {
    const { userId, password } = req.body;
    console.log("Received body:", req.body);
    if (!userId || !password) return res.status(400).send("User ID and password are required.");

    const users = readUsers();
    const user = users[userId];

    if (!user) return res.status(401).send("Incorrect user ID.");
    if (user.password !== password) return res.status(401).send("Incorrect password.");

    res.status(200).send({ message: "Login successful", userId });
    console.log('Login successful for %s', userId );
});

// Get passwords for a specific user
app.get("/passwords/:userId", (req, res) => {
    console.log("Route hit: /passwords/" + req.params.userId);

    const { userId } = req.params;
    const { masterKey } = req.query;

    if (!masterKey) {
        console.log("No master key provided");
        return res.status(400).send("Master key required.");
    }

    console.log("Received Master Key:", masterKey);

    const passwords = readPasswords();
    if (!passwords[userId]) {
        console.log("No passwords found for user:", userId);
        return res.status(404).send("No passwords found for this user.");
    }

    console.log("Stored Passwords:", passwords[userId]);

    console.log("Attempting to decrypt passwords...");
    const decryptedPasswords = passwords[userId].map(entry => {
        console.log("Processing entry:", entry);
        const decryptedPass = decryptPassword(entry.password, masterKey);
        console.log("Decrypted Password:", decryptedPass);
        return {
            website: entry.website,
            username: entry.username,
            password: decryptedPass,
        };
    });

    console.log("Decryption completed:", decryptedPasswords);
    res.json(decryptedPasswords);
});

// Add a new password for a specific user
app.post("/passwords/:userId", (req, res) => {
    const { userId } = req.params;
    const { website, username, password } = req.body;

    if (!website || !username || !password)
        return res.status(400).send("Missing required fields.");

    const users = readUsers(); // Load users.json
    if (!users[userId]) return res.status(404).send("User not found.");

    const masterKey = users[userId].password; // Use account password as master key

    // Encrypt the stored password
    const encryptedPassword = CryptoJS.AES.encrypt(password, masterKey).toString();

    const passwords = readPasswords();
    if (!passwords[userId]) passwords[userId] = [];

    passwords[userId].push({ website, username, password: encryptedPassword });
    writePasswords(passwords);

    res.status(201).send("Password stored securely!");
});


// Change User ID
app.post("/change-user-id", (req, res) => {
    const { currentUserId, newUserId } = req.body;
    console.log("Received body:", req.body);
    const users = readUsers();
    const passwords = readPasswords();

    if (!currentUserId || !newUserId) return res.status(400).send("Current and new User ID required.");
    if (!users[currentUserId]) return res.status(404).send("Current user not found.");
    if (users[newUserId]) return res.status(409).send("New User ID already exists.");

    users[newUserId] = users[currentUserId];
    delete users[currentUserId];

    writeUsers(users);
    res.status(200).send("User ID updated successfully.");

    if (passwords[currentUserId]) {
        passwords[newUserId] = passwords[currentUserId];
        delete passwords[currentUserId];
        writePasswords(passwords);
    }

});

// Change Password
app.post("/change-password", (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    console.log("Received body:", req.body);
    const users = readUsers();

    if (!userId || !oldPassword || !newPassword)
        return res.status(400).send("User ID, old password, and new password required.");

    if (!users[userId]) return res.status(404).send("User not found.");
    if (users[userId].password !== oldPassword) return res.status(401).send("Old password is incorrect.");

    users[userId].password = newPassword;
    writeUsers(users);

    res.status(200).send("Password updated successfully.");
    console.log('Password updated successfully for %s', userId );
});

// Admin: Add a new user
app.post("/add-user", (req, res) => {
    const { adminId, adminPassword, newUserId, newUserPassword, isAdmin } = req.body;
    console.log("Received body:", req.body);
    const users = readUsers();

    if (!users[adminId] || users[adminId].password !== adminPassword || !users[adminId].isAdmin)
        return res.status(403).send("Admin credentials are incorrect.");
        console.log('Admin credentials are incorrect for %s', adminId );

    if (!newUserId || !newUserPassword) return res.status(400).send("New User ID and password required.");
    if (users[newUserId]) return res.status(409).send("User ID already exists.");

    users[newUserId] = { password: newUserPassword, isAdmin: isAdmin || false };
    writeUsers(users);

    res.status(201).send("New user added successfully.");
    console.log('New user added successfully: %s', newUserId );
});

// Admin: Reset user password
app.post("/reset-password", (req, res) => {
    const { adminId, adminPassword, userId, newPassword } = req.body;
    console.log("Received body:", req.body);
    const users = readUsers();

    if (!users[adminId] || users[adminId].password !== adminPassword)
        return res.status(403).send("Admin credentials are incorrect.");
        console.log('Admin credentials are incorrect for %s', adminId );

    if (!users[adminId].isAdmin) return res.status(403).send("Admin privileges required.")

    if (!userId || !newPassword) return res.status(400).send("User ID and new password required.");
    if (!users[userId]) return res.status(404).send("User not found.");

    users[userId].password = newPassword;
    writeUsers(users);

    res.status(200).json({ message: "Password reset successfully." }); 
    console.log('Password reset successfully for %s', userId );
});

// Start the server
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
