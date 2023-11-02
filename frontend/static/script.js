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
