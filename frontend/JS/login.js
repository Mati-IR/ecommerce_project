(function () {
	'use strict'

	// Fetch all the forms we want to apply custom Bootstrap validation styles to
	var forms = document.querySelectorAll('.needs-validation')

	// Loop over them and prevent submission
	Array.prototype.slice.call(forms)
		.forEach(function (form) {
			form.addEventListener('submit', function (event) {
				if (!form.checkValidity()) {
					event.preventDefault()
					event.stopPropagation()
				}

				form.classList.add('was-validated')
			}, false)
		})
})()

function saveAuthDataToLocalStorage(data) {
	if (data && data.status === 'success') {
		localStorage.setItem('accessToken', data.access_token);
		localStorage.setItem('refreshToken', data.refresh_token);
		// You can also store other user details as needed
		localStorage.setItem('user', JSON.stringify(data.user));
	} else {
		console.error('Invalid authentication data received');
	}
}

document.addEventListener('DOMContentLoaded', function() {

	// Handle the login form submission
	document.getElementById('loginForm').addEventListener('submit', function(event) {
		event.preventDefault(); // Prevent the form from submitting the traditional way

		// Get the form data
		const loginData = {
			email: document.getElementById('email').value,
			password: document.getElementById('password').value
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
				// Assuming 'data' contains a token or user identifier
				saveAuthDataToLocalStorage(data);

				window.location.href = 'index.html'; // Redirect to index.html
				// TODO: Handle any additional tasks after successful login, e.g., redirecting the user or showing a welcome message
			})
			.catch(error => {
				// Handle login errors
				// For demonstration purposes, we'll just show an alert
				alert('Login failed: ' + error.message);

				// TODO: Handle any additional tasks after failed login, e.g., showing a specific error message to the user
			});

		// Clear the form fields after submission
		//event.target.reset();
	});

});