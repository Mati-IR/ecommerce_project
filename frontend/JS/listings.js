let categories = [];
fetch("http://127.0.0.1:8000/categories")
    .then(response => response.json())
    .then(data => {
        categories = data; // Assuming data is the array of categories
    });

function getCategoryID(categoryID) {
    const category = categories.find(cat => cat.id === categoryID);
    if (!category) {
        console.error("Category not found: " + categoryID);
        console.log("Available categories: " + categories.map(cat => cat.name).join(", "));
    }
    return category ? category.id : null;
}

function getListingByID(listingID) {
    fetch("http://127.0.0.1:listings/" + listingID)
        .then(response => response.json())
        .then(data => {
            return data;
        });
}

document.addEventListener('DOMContentLoaded', function() {

    // handle new listing creation
    document.getElementById("newOfferForm").addEventListener("submit", async function(event) {
        event.preventDefault(); // prevent the form from submitting the traditional way
        const storedUserData = JSON.parse(localStorage.getItem("user"));
        let userId  = storedUserData.id;

        // get the form data
        const newListingData = {
            /* Get creator_id from local storage */
            creator_id: userId,
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            price: document.getElementById("price").value,
            location: document.getElementById("address").value,
            category_id: getCategoryID(categories.find(cat => cat.name === document.getElementById("category").value).id)
        };

        // if null in any of the fields, alert user and end this event listener
        if (Object.values(newListingData).includes(null)) {
            alert("Please fill in all fields!");
            console.error("Null value in fields: " + Object.keys(newListingData).find(key => newListingData[key] === null));
            return;
        }

        // create FormData object
        const formData = new FormData();
        formData.append('listingData', JSON.stringify(newListingData));

        // append each selected file to the FormData
        const imageInput = document.getElementById('images');
        for (let i = 0; i < imageInput.files.length; i++) {
            formData.append('images', imageInput.files[i]);
        }

        try {
            // send the FormData to the API gateway using Fetch API with the "multipart/form-data" content type
            const response = await fetch("http://127.0.0.1:8000/create_listing", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            const data = await response.json();
            // handle successful listing creation
            // assuming 'data' contains a token or user identifier
            // window.location.href = "index.html"; // redirect to index.html
            alert("Listing created successfully!");
        } catch (error) {
            // handle errors
            console.error("Error:", error);
            alert("Error creating listing!\n " + error);
            // print data sent to API gateway
            console.log("Data sent to API gateway: " + JSON.stringify(newListingData));
            console.log("Images sent to API gateway: " + imageInput.files);
            console.log("Amount of images sent to API gateway: " + imageInput.files.length);
            console.log("FormData sent to API gateway: " + formData)
        }
    });
});
