import {generatePreview} from "./PrevievConstructor.js";
const API = 'http://127.0.0.1:8000'; // Replace with your actual API base URL

const userId = JSON.parse(localStorage.getItem('user')).id;
console.log('ID USERA',userId);

async function getBasket(userId) {
    console.log("userId", userId);

    try {
        const response = await fetch(`${API}/basket/${userId}`);
        const data = await response.json();
        console.log('basket data', data);

        // Extract listing IDs and store them in a new array
        const listingIds = data.map(item => item.listing_id);
        console.log('Listing IDs:', listingIds);

        // Return or use the listingIds array as needed
        return listingIds;
    } catch (error) {
        console.error('Error fetching basket:', error);
        // Handle the error as needed
    }
}

const TEST = await getBasket(userId);
console.log('TEST',TEST);
async function getListing(listingIdsObject) {
    console.log('DZIALAM');
    try {
        const resultArray = [];
        console.log('listingIdsObject', listingIdsObject);
        // Iterate through each listing ID in the object
        for (const key in listingIdsObject) {
            if (Object.hasOwnProperty.call(listingIdsObject, key)) {
                const listing_id = listingIdsObject[key];

                // Fetch data for the current listing ID
                const response = await fetch(`${API}/listings/${listing_id}`);
                const data = await response.json();

                // Push the data to the result array
                resultArray.push(data);

                console.log(`Data for listing ${listing_id}:`, data);
            }
        }

        // Flatten the result array by moving all entries up one level
        const flattenedArray = [].concat(...resultArray);

        // Return or use the flattened array as needed
        console.log('flattenedArray', flattenedArray);
        return flattenedArray;
    } catch (error) {
        console.error('Error fetching listing:', error);
        // Handle the error as needed
    }
}
const basket_listing= await getListing(TEST);

if (basket_listing.length === 0) {
    // If there are no liked listings, display the message
    document.getElementById('noLikedListingsMessage').style.display = 'block';
} else {
    // If there are liked listings, generate and display the preview
    generatePreview(basket_listing);
}


