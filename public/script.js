// Login the user
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    // Send login request to the server
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }) // Send the user credentials to the server
    })
    .then(response => {
        if (response.ok) {
            localStorage.setItem('userId', userId); // Store user ID in local storage
            loadPasswords(userId, password); // Load the user's passwords
            document.getElementById('loginFormContainer').style.display = 'none';
            document.getElementById('passwordManager').style.display = 'block';
        } else {
            alert("Incorrect password or user not found.");
        }
    })
    .catch(error => {
        alert("Error logging in.");
        console.error("Login error:", error);
    });
});

// Load passwords
function loadPasswords(userId, password) {
    fetch(`/passwords/${userId}?masterKey=${password}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.querySelector('#passwordTable tbody');
            tableBody.innerHTML = ''; // Clear previous entries

            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.website}</td>
                    <td>${item.username}</td>
                    <td>
                        <span class="password" data-password="${item.password}">********</span>
                        <button class="viewPassword">View</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Toggle password visibility
            document.querySelectorAll('.viewPassword').forEach(button => {
                button.addEventListener('click', function () {
                    const passwordSpan = this.previousElementSibling;
                    if (passwordSpan.textContent === '********') {
                        passwordSpan.textContent = passwordSpan.dataset.password; // Reveal password
                        this.textContent = 'Hide';
                    } else {
                        passwordSpan.textContent = '********'; // Hide password
                        this.textContent = 'View';
                    }
                });
            });
        })
        .catch(error => {
            console.error("Error fetching passwords:", error);
            alert("Failed to retrieve passwords. Please check your master key and try again.");
        });
}

// Add New Password
document.getElementById('addPasswordForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const userId = localStorage.getItem('userId');
    const website = document.getElementById('website').value;
    const username = document.getElementById('username').value;
    const newPassword = document.getElementById('newPassword').value;

    fetch(`/passwords/${userId}?masterKey=${key}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ website, username, password: newPassword })
    })
    .then(response => {
        if (response.ok) {
            loadPasswords(userId); // Reload passwords after adding a new one
            alert("Password added successfully!");
        } else {
            alert("Error adding password.");
        }
    })
    .catch(error => {
        console.error("Error adding password:", error);
        alert("Error adding password.");
    });
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    document.getElementById('loginFormContainer').style.display = 'block';
    document.getElementById('passwordManager').style.display = 'none';
});

// Password generator
function generate() {
    const length = document.getElementById('length').value;
    const upper = document.getElementById('uppercase').checked;
    const numbers = document.getElementById('numbers').checked;
    const symbols = document.getElementById('symbols').checked;

    const password = generatePassword(length, { upper, numbers, symbols });
    document.getElementById('password').textContent = password;
}

function generatePassword(length, options) {
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+{}[]<>?,.';

    let allChars = lowerChars;
    if (options.upper) allChars += upperChars;
    if (options.numbers) allChars += numberChars;
    if (options.symbols) allChars += symbolChars;

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }

    return password;
}
