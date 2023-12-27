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
    fetch("http://127.0.0.1:8000/" + listingID)
        .then(response => response.json())
        .then(data => {
            return data;
        });
}

/* document.addEventListener('DOMContentLoaded', function() {

    // handle new listing creation
    document.getElementById("newOfferForm").addEventListener("submit", async function(event) {
        event.preventDefault(); // prevent the form from submitting the traditional way
        const storedUserData = JSON.parse(localStorage.getItem("user"));
        let userId  = storedUserData.id;

        // get the form data
        const newListingData = {
            // Get creator_id from local storage
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
});*/

/*
function submitForm() {
    event.preventDefault();
    // Fetch form data
    const storedUserData = JSON.parse(localStorage.getItem("user"));
    const userId  = storedUserData.id;
    const title = document.getElementById('title').value;
    const selectedCategoryName = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const location = document.getElementById('address').value;
    const imagesInput = document.getElementById('images');

    // Find category by name
    const selectedCategory = categories.find(cat => cat.name === selectedCategoryName);

    // Check if the category was found
    if (!selectedCategory) {
        console.error("Category not found: " + selectedCategoryName);
        console.log("Available categories: " + categories.map(cat => cat.name).join(", "));
        return;
    }

    // Get the category_id
    const category_id = selectedCategory.id;
    //const images = imagesInput.files;

    const formData = new FormData();
    formData.append('creator_id', userId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('location', location);
    formData.append('category_id', category_id);

    // Append each image file to FormData
    /*for (let i = 0; i < imagesInput.files.length; i++) {
        formData.append('images', imagesInput.files[i]);
    }*/
/*
    console.log('creator_id:', userId);
    console.log('title:', title);
    console.log('description:', description);
    console.log('price:', price);
    console.log('location:', location);
    console.log('category_id:', category_id);
    //console.log('images:', images);
    // Make API request to FastAPI application
    fetch('http://127.0.0.1:8000/create_listing', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);

        })
        .catch((error) => {
            console.error('Error:', error);
                alert("Error creating listing!\n " + error);
        });
}
*/

async function uploadImages(images, listing_id) {
    // check if images are files
    if (!images[0] instanceof File) {
        console.error("Images are not files!");
        return;
    }
    console.log("Uploading image: " + images[0].name + " to listing: " + listing_id);
    for (let i = 0; i < images.length; i++) {
        let bodyFormData = new FormData();
        bodyFormData.append('file', images[i]);
        console.log("Uploading image: " + images[i].name + " to listing: " + listing_id);
        try {
            const response = await fetch("http://127.0.0.1:8000/uploadfile/" + listing_id, {
                method: "POST",
                body: bodyFormData
            });


        } catch (error) {
            console.error("Error:", error);
            alert("Error uploading images!\n " + error);
        }
    }
}

async function getListingPhotos(listing_id) {
    try {
        const response = await fetch("http://127.0.0.1:8000/listings/" + listing_id + "/images", {
            method: "GET"
        });
        const data = await response.json();
        console.log(data);
        return data;
    }
    catch (error) {
        console.error("Error:", error);
        alert("Error getting listing photos!\n " + error);
    }
}

function submitForm() {
    event.preventDefault();

    event.preventDefault(); // prevent the form from submitting the traditional way
    const storedUserData = JSON.parse(localStorage.getItem("user"));
    let userId  = storedUserData.id;

    // get the form data
    const newListingData = {
        /* Get creator_id from local storage */
        creator_id: userId,
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: parseFloat(document.getElementById("price").value),
        location: document.getElementById("address").value,
        category_id: getCategoryID(categories.find(cat => cat.name === document.getElementById("category").value).id)
    };
    // if null in any of the fields, alert user and end this event listener
    if (Object.values(newListingData).includes(null)) {
        alert("Please fill in all fields!");
        console.error("Null value in fields: " + Object.keys(newListingData).find(key => newListingData[key] === null));
        return;
    }

    // send the newListingData to the API gateway
    fetch("http://127.0.0.1:8000/create_listing", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newListingData)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            /* return {
                "status": "success",
                "message": "Listing created successfully!",
                "listing": listing_id
            } */
            const listingId = data.listing;
            console.log("listingId = " + listingId);

            let listOfImages = [];
            const imagesInput = document.getElementById('images');
            for (let i = 0; i < imagesInput.files.length; i++) {
                listOfImages.push(imagesInput.files[i]);
            }

            //console.log(response);

            uploadImages(listOfImages, listingId);
        })
        .catch((error) => {
            console.error('Error:', error);
            alert("Error creating listing!\n " + error);
        });


}
