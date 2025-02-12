// Handle user login
document.getElementById('loginForm').addEventListener('submit', function(event) {
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
            loadPasswords(userId); // Load the user's passwords
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

// Load passwords for the logged-in user
function loadPasswords(userId) {
    fetch(`/passwords/${userId}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#passwordTable tbody');
            tableBody.innerHTML = ''; // Clear previous entries

            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.website}</td>
                    <td>${item.username}</td>
                    <td>
                        <span class="password">${item.password}</span>
                        <button class="viewPassword">View</button>
                    </td>
                `;
                tableBody.appendChild(row);

                // Toggle password visibility
                row.querySelector('.viewPassword').addEventListener('click', function() {
                    const passwordSpan = row.querySelector('.password');
                    if (passwordSpan.textContent === item.password) {
                        passwordSpan.textContent = '*****'; // Hide password
                    } else {
                        passwordSpan.textContent = item.password; // Show password
                    }
                });
            });
        })
        .catch(error => {
            console.error("Error loading passwords:", error);
            alert("Error loading passwords.");
        });
}

// Handle adding a new password
document.getElementById('addPasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const userId = localStorage.getItem('userId');
    const website = document.getElementById('website').value;
    const username = document.getElementById('username').value;
    const newPassword = document.getElementById('newPassword').value;

    fetch(`/passwords/${userId}`, {
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
    localStorage.removeItem('userId');
    document.getElementById('loginFormContainer').style.display = 'block';
    document.getElementById('passwordManager').style.display = 'none';
});
