const apiBaseUrl = 'http://127.0.0.1:8000'; // Replace with your actual API base URL

async function getRandomRecommendation() {
    const count = document.getElementById('randomCount').value;
    try {
        const response = await fetch(`${apiBaseUrl}/recommendationRandom/${count}`);
        const data = await response.json();
        document.getElementById('randomResponse').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching random recommendations:', error);
    }
}

async function getCategoryRecommendation() {
    const categoryId = document.getElementById('categoryId').value;
    const productCount = document.getElementById('productCount').value;
    try {
        const response = await fetch(`${apiBaseUrl}/recommendationByCategory/${categoryId}/${productCount}`);
        const data = await response.json();
        document.getElementById('categoryResponse').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error fetching category recommendations:', error);
    }
}
