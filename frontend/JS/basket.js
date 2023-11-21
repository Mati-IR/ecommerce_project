const apiBaseUrl = 'http://127.0.0.1:8000'; // Replace with your actual API base URL

async function getBasket() {
    const userId = document.getElementById('getUserId').value;
    try {
        const response = await fetch(`${apiBaseUrl}/basket/${userId}`);
        const data = await response.json();
        document.getElementById('getBasketResponse').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching basket:', error);
    }
}

async function addProduct() {
    const userId = document.getElementById('addUserId').value;
    const listingId = document.getElementById('listingId').value;
    try {
        const response = await fetch(`${apiBaseUrl}/basket/add_product/${listingId}/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        document.getElementById('addProductResponse').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error adding product:', error);
    }
}
