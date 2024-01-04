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
