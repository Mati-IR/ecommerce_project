function testAPIConnection() {
    fetch('http://127.0.0.1:8000/test')
        .then(response => response.json())
        .then(data => {
            document.getElementById("apiResponse").innerText = data.message;
        })
        .catch(error => {
            document.getElementById("apiResponse").innerText = "Error connecting to the API.";
        });
}
