document.getElementById("changeuseridform").addEventListener("submit", function (e) {
    e.preventDefault();

    const currentUserId = document.getElementById("oldUserId").value;
    const newUserId = document.getElementById("newUserId").value;
    const userPassword = document.getElementById("userPassword").value;  
    fetch("http://localhost:3000/change-user-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentUserId, newUserId, userPassword }) 
    })
        .then(async (response) => {
            if (response != 200) {
                throw new Error(await response.text()); 
            }
            return response.json();
        })
});


document.getElementById("change-password-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const userId = document.getElementById("userId").value;
    const oldPassword = document.getElementById("oldPassword").value;    
    const newPassword = document.getElementById("newPassword").value;

    fetch("http://localhost:3000/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, oldPassword, newPassword })
    })
        .then(async (response) => {
            if (response != 200) {
                throw new Error(await response.text());
            }
            return response.json();
            if (response.ok) { 
                alert("Updated successfully");
            }
        })
});

document.getElementById("newuser").addEventListener("submit", async function (e) {
    e.preventDefault();

    const adminId = document.getElementById("adminUserId").value;
    const adminPassword = document.getElementById("adminPassword").value;
    console.log("Admin Password:", adminPassword);  // Log to see if the password is empty
    const newUserId = document.getElementById("newUserIdForAdmin").value;
    const newUserPassword = document.getElementById("newUserPassword").value;
    const isAdmin = document.getElementById("is-admin").checked;

    try {
        const response = await fetch("http://localhost:3000/add-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ adminId, adminPassword, newUserId, newUserPassword, isAdmin }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Unknown error");
        }

        const data = await response.text(); // Backend returns plain text
        alert(data); 

    } catch (error) {
        console.error("Error:", error);
        alert("Error: " + error.message);
    }
});
document.getElementById("resetUserPasswordForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const adminId = document.getElementById("adminId").value;
    const adminPassword = document.getElementById("adminPassword").value;  
    console.log("Admin Password:", adminPassword);  // Log to see if the password is empty
    const userId = document.getElementById("resetUser").value;
    const newPassword = document.getElementById("newpassword").value;

    fetch("http://localhost:3000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, adminPassword, userId, newPassword })  // Use adminPassword here
    })
        .then((response) => {
            if (!response.ok) {
                return response.text().then((text) => { throw new Error(text); });
            }
            return response.json();
        })
        .then((data) => alert(data.message))
        .catch((error) => alert("Error: " + error.message));
});


function logout() {
    sessionStorage.removeItem("userId");
    window.location.href = "/"; // Redirect to login page
}

if (sessionStorage.getItem("isAdmin") === "true") {
    document.getElementById("adminPanel").style.display = "block";
}

