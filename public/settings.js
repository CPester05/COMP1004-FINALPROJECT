document.getElementById("change-user-id-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const currentUserId = sessionStorage.getItem("userId");
    const newUserId = document.getElementById("new-user-id").value;

    fetch("/change-user-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentUserId, newUserId })
    })
        .then((response) => response.json())
        .then((data) => {
            alert(data.message);
            sessionStorage.setItem("userId", newUserId);
            window.location.reload(); // Reload the page to reflect the change
        });
});

document.getElementById("change-password-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const userId = sessionStorage.getItem("userId");
    const newPassword = document.getElementById("new-password").value;

    fetch("/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword })
    })
        .then((response) => response.json())
        .then((data) => alert(data.message));
});

document.getElementById("add-user-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const adminId = sessionStorage.getItem("userId");
    const adminPassword = prompt("Enter admin password");
    const newUserId = document.getElementById("new-user-id-admin").value;
    const newUserPassword = document.getElementById("new-user-password").value;
    const isAdmin = document.getElementById("is-admin").checked;

    fetch("/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, adminPassword, newUserId, newUserPassword, isAdmin })
    })
        .then((response) => response.json())
        .then((data) => alert(data.message));
});

document.getElementById("reset-password-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const adminId = sessionStorage.getItem("userId");
    const adminPassword = prompt("Enter admin password");
    const userId = document.getElementById("reset-user-id").value;
    const newPassword = document.getElementById("reset-new-password").value;

    fetch("/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, adminPassword, userId, newPassword })
    })
        .then((response) => response.json())
        .then((data) => alert(data.message));
});

function logout() {
    sessionStorage.removeItem("userId");
    window.location.href = "/"; // Redirect to login page
}
