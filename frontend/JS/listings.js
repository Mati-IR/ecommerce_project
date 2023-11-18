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


document.addEventListener('DOMContentLoaded', function() {

    // handle new listing creation
    document.getElementById("newOfferForm").addEventListener("submit", function(event) {
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

        // send the newListingData to the API gateway
        fetch("http://127.0.0.1:8000/create_listing", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newListingData)
        })
            .then(response => {
                console.log(JSON.stringify(newListingData))
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                // handle successful listing creation
                // assuming 'data' contains a token or user identifier
                // window.location.href = "index.html"; // redirect to index.html
                alert("Listing created successfully!")
            })
            .catch(error => {
                // handle errors
                console.error("Error:", error);
                alert("Error creating listing!\n " + error);
            });
    }   
    );
});

