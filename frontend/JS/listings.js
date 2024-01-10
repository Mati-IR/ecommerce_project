const translatedCategories = [
    "Prace",
    "Mieszkania",
    "Usługi",
    "Pojazdy",
    "Elektronika",
    "Meble",
    "Odzież i Akcesoria",
    "Darmowe rzeczy",
    "Zwierzęta",
    "Zlecenia",
    "Inne"
];
let categories = [];
fetch("http://127.0.0.1:8000/categories")
    .then(response => response.json())
    .then(data => {
        const originalCategories = data; // Assuming data is the array of original categories
        // Translate categories based on translatedCategories array
        const translatedCategoryOptions = originalCategories.map((category, index) => {
            return translatedCategories[index] || category; // Use translated category name if available, else use the original name
        });
        categories = translatedCategoryOptions; 
        generateCategoryOptions(translatedCategoryOptions);
    });

    function getCategoryID(categoryName, categories) {
        for (let i = 0; i < categories.length; i++) {
          if (categories[i] === categoryName) {
            return i+1;
          }
        }
        return -1; // Zwraca -1, gdy nie znaleziono nazwy w tablicy
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

async function submitForm() {
    event.preventDefault();
    const storedUserData = JSON.parse(localStorage.getItem('user'));
    const userId = storedUserData.id;
    const selectedCategoryName = document.getElementById('category').value;
    const selectedCategoryID = getCategoryID(selectedCategoryName, categories);
    console.log(selectedCategoryID);
    const newListingData = {
        creator_id: userId,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        location: document.getElementById('address').value,
        category_id: selectedCategoryID
    };

    if (!validateFormData(newListingData)) {
        return;
    }

    try {
        const createListingResponse = await fetch("http://127.0.0.1:8000/create_listing", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newListingData)
        });

        const listingData = await createListingResponse.json();
        console.log('Success:', listingData);
        const listingId = listingData.listing;
        console.log("listingId = " + listingId);

        let listOfImages = [];
        const imagesInput = document.getElementById('images');
        for (let i = 0; i < imagesInput.files.length; i++) {
            listOfImages.push(imagesInput.files[i]);
        }
        if(listOfImages.length>0){
            await uploadImages(listOfImages, listingId);
        }
        
        clearForm();
        displaySuccessMessage(); // Show success message
    } catch (error) {
        console.error('Error:', error);
        alert("Error creating listing!\n " + error);
    }
}

function displayErrorMessage(message) {
    const errorMessage = document.createElement('p');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = message;

    const errorMessagesContainer = document.getElementById('error-messages-container');
    errorMessagesContainer.appendChild(errorMessage);
}

function clearErrorMessages() {
    const errorMessagesContainer = document.getElementById('error-messages-container');
    errorMessagesContainer.innerHTML = ''; // Clear existing error messages
}

function validateFormData(newListingData) {
    clearErrorMessages();

    for (const [key, value] of Object.entries(newListingData)) {
        if (typeof value === 'string' && !value.trim()) {
            displayErrorMessage(`Aby dodać ogłoszenie, uzupełnij wszystkie pola.`);
            return false;
        } else if (value === null || value === undefined) {
            displayErrorMessage(`Aby dodać ogłoszenie, uzupełnij wszystkie pola.`);
            return false;
        } else if (key === 'price' && isNaN(value)) {
            displayErrorMessage(`Podana cena nie jest liczbą.`);
            return false;
        }
    }

    return true;
}

function displaySuccessMessage() {
    const successMessage = document.getElementById('success-message');
    successMessage.style.display = 'block';

    const closeSuccessMessageBtn = document.getElementById('close-success-message');
    closeSuccessMessageBtn.addEventListener('click', function() {
        successMessage.style.display = 'none';
    });
}

function generateCategoryOptions(categories) {
    const categorySelect = document.getElementById("category");

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('price').value = '';
    document.getElementById('address').value = '';
    document.getElementById('category').selectedIndex = 0; // Powrót do pierwszej opcji w polu wyboru kategorii
    document.getElementById('images').value = '';
}
