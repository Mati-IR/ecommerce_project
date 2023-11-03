function testAPIConnection() {
    fetch('http://127.0.0.1:8000/test')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("apiResponse").innerText = data.message;
        })
        .catch(error => {
            document.getElementById("apiResponse").innerText = `Error: ${error.message}`;
        });
}
// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

    // Handle the registration form submission
    document.getElementById('registrationForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        // Get the form data
        const registrationData = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value
        };

        // TODO: Send the registrationData to your server for processing
        // For demonstration purposes, we'll just log it
        console.log('User Registration Data:', registrationData);

        // Clear the form fields after submission
        event.target.reset();

        // Optionally, show a success message or redirect the user
        alert('Registration successful!'); // This is just for demonstration. Consider using a more user-friendly way to notify the user.
    });

    // Handle the login form submission
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        // Get the form data
        const loginData = {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value
        };

        // Send the loginData to the API gateway for authentication
        fetch('http://127.0.0.1:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                // Handle successful login
                // For demonstration purposes, we'll just show an alert
                alert('Login successful!');

                // TODO: Handle any additional tasks after successful login, e.g., redirecting the user or showing a welcome message
            })
            .catch(error => {
                // Handle login errors
                // For demonstration purposes, we'll just show an alert
                alert('Login failed: ' + error.message);

                // TODO: Handle any additional tasks after failed login, e.g., showing a specific error message to the user
            });

        // Clear the form fields after submission
        event.target.reset();
    });

});
