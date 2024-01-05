const ApiGateway = 'http://127.0.0.1:8000'; // Replace with your actual API base URL
const ApiKey = 'AIzaSyB3aHCKN6yxeqkCxY0PjOLH2rpx8LsnQ-8'

function generateFullPreview() {
        // Get the current URL
    const queryString = window.location.search;
    console.log('Query string:', queryString);


    // Create a URLSearchParams object from the URL
    const urlParams = new URLSearchParams(queryString);
    console.log('URLSearchParams:', urlParams);

    // Get the value of the 'listingId' parameter
    const listingId = urlParams.get('listingId');

    // Check if listingId is present
    if (listingId !== null) {
    console.log('Listing ID:', listingId);
    } else {
    console.log('Listing ID not found in the URL');
    }
    let sellerId = 0;

    fetch(ApiGateway + '/listings/' + listingId)
        .then(response => response.json())
        .then(data => {
            console.log('Listing:', data);
            sellerId = data[0].creator_id;
            // Populate the data in the HTML elements
            document.getElementById('title').textContent = data[0].title;
            document.getElementById('creation_date').textContent = data[0].creationDate;
            document.getElementById('category').textContent = data[0].category;
            document.getElementById('description').textContent = data[0].description;
            document.getElementById('price').textContent = data[0].price;
            document.getElementById('email').textContent = data[0].email;
            document.getElementById('phone').textContent = data[0].phone;
            console.log('Location:', data[0].location);
            document.getElementById('address').textContent = data[0].location;
            const addressPlaceholder = document.getElementById('addressPlaceholder');
            const mapIframe = document.getElementById('mapIframe');

            if (addressPlaceholder && mapIframe) {
            addressPlaceholder.textContent = data[0].location;

            // Assuming data.mapLocation is a string with the desired location for the map
            const mapLocation = encodeURIComponent(data.mapLocation);

            // Update the src attribute of the iframe with the new location
            // replace whitespaces with + signs
            mapLocation.replace(/\s/g, '+');
            console.log(`https://www.google.com/maps/embed/v1/place?key=${ApiKey}&q=${mapLocation}`);
            mapIframe.src = `https://www.google.com/maps/embed/v1/place?key=${ApiKey}&q=${mapLocation}`;
            }

            // fetch seller data
            console.log('Seller ID:', sellerId);
            fetch(ApiGateway + '/get_user/' + sellerId)
                .then(response => response.json())
                .then(data => {
                    // Populate the data in the HTML elements
                    console.log('Seller:', data)
                    document.getElementById('seller').textContent = data[0].name;
                })
                .catch(error => {
                    console.error('Error fetching seller data:', error);
                });


            // fetch images
            let amountOfImages = 0;
            fetch(ApiGateway + '/amount_of_images/' + listingId)
                .then(response => response.json())
                .then(data => {
                    // Populate the data in the HTML elements
                    console.log('Amount of images:', data);
                    amountOfImages = data;
                    const carouselInner = document.getElementById('carouselExampleIndicators');
                    carouselInner.innerHTML = '';

                    if(amountOfImages !== 0) {
                        // Initialize the carousel
                        carouselInner.innerHTML = `
    <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>`;
                        // const response = await fetch(ApiGateway + 'listings/' + item.id + '/' + imageIndex + '/image');
                        for (let i = 0; i < amountOfImages; i++) {
                            fetch(ApiGateway + '/listings/' + listingId + '/' + i + '/image')
                                .then(response => response.blob())
                                .then(blob => {
                                    if (blob.size > 0) {
                                        const imgUrl = URL.createObjectURL(blob);
                                        console.log('Image URL:', imgUrl);

                                        // append carousel
                                        carouselInner.innerHTML += `
                                        <div class="carousel-item active">
                                            <img src="${imgUrl}" class="d-block w-100" alt="photo ${i}" data-bs-toggle="modal" data-bs-target="#imageModal">
                                        </div>
                                        `;
                                        if(i !== 0) {
                                            carouselInner.innerHTML += `
                                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${i}" aria-label="Slide ${i}"></button>
                                            `;
                                        }
                                        else {
                                            carouselInner.innerHTML += `
                                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${i}" class="active" aria-current="true" aria-label="Slide ${i}"></button>
                                            `;
                                        }
                                        
                                    } else {
                                        console.error('No images found for listing:', listingId);
                                    }
                                })
                                .catch(error => {
                                    console.error('Error fetching images:', error);
                                });
                        }
                    }

                    console.log('Images URL:', imagesUrl);
                    /* // Populate the carousel with new images
                    /*imageUrls.forEach((imageUrl, index) => {
                        const carouselItem = document.createElement('div');
                        carouselItem.classList.add('carousel-item');

                        if (index === 0) {
                            carouselItem.classList.add('active');
                        }

                        const imgElement = document.createElement('img');
                        imgElement.src = imageUrl;
                        imgElement.classList.add('d-block', 'w-100');
                        imgElement.alt = `Image ${index + 1}`;
                        imgElement.setAttribute('data-bs-toggle', 'modal');
                        imgElement.setAttribute('data-bs-target', '#imageModal');

                        carouselItem.appendChild(imgElement);
                        carouselInner.appendChild(carouselItem);
                    }); */

                    // Based on the above code, we can create a carousel with images
                    imagesUrl.forEach((imageUrl, index) => {
                        const carouselItem = document.createElement('div');
                        carouselItem.classList.add('carousel-item');

                        if (index === 0) {
                            carouselItem.classList.add('active');
                        }

                        const imgElement = document.createElement('img');
                        imgElement.src = imageUrl;
                        imgElement.classList.add('d-block', 'w-100');
                        imgElement.alt = `Image ${index + 1}`;
                        imgElement.setAttribute('data-bs-toggle', 'modal');
                        imgElement.setAttribute('data-bs-target', '#imageModal');

                        carouselItem.appendChild(imgElement);
                        carouselInner.appendChild(carouselItem);
                    });

                })
                .catch(error => {
                    console.error('Error fetching images:', error);
                });
        })
        .catch(error => {
            console.error('Error fetching listing data:', error);
        });



    // fetch images
    /*for(let i = 0; i < amountOfImages; i++) {
        fetch(ApiGateway + '/images/' + listingId + '/' + i)
            .then(response => response.json())
            .then(data => {
                // Populate the data in the HTML elements
                console.log('Image:', data);
                document.getElementById('image' + i).src = data;
            })
            .catch(error => {
                console.error('Error fetching images:', error);
            });
    }*/

}

generateFullPreview();