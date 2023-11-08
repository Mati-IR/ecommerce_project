document.addEventListener('DOMContentLoaded', function() {

    // Handle the registration form submission
    document.getElementById('registrationForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        // Get the form data
        const registrationData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };
        console.log(JSON.stringify(registrationData));
        // Send the registrationData to the API gateway for registration
        fetch('http://127.0.0.1:8000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();

            })
            .then(data => {
                // Handle successful registration
                // For demonstration purposes, we'll just show an alert
                alert('Registration successful!');
            })
        //event.target.reset();
    });
});