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

async function addProduct(event) {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    const listingId = event.target.parentElement.parentElement.querySelector('.listing-id').textContent;
    try {
        const response = await fetch(`${apiBaseUrl}/basket/add_product/${listingId}/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        // change icon and onclick function
        event.target.classList.remove('bi-heart');
        event.target.classList.add('bi-heart-fill');
        event.target.parentElement.setAttribute('onclick', 'removeProductFromFavourites(event)');

    } catch (error) {
        console.error('Error adding product:', error);
    }
}

function removeProductFromFavourites(event) {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    const listingId = event.target.parentElement.parentElement.querySelector('.listing-id').textContent;
    fetch(`${apiBaseUrl}/basket/remove_product/${listingId}/${userId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            // change icon and onclick function
            event.target.classList.remove('bi-heart-fill');
            event.target.classList.add('bi-heart');
            event.target.parentElement.setAttribute('onclick', 'addProduct(event)');
        })
        .catch(error => {
            console.error('Error removing product:', error);
        });
}