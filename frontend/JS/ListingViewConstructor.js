const ApiGateway = 'http://127.0.0.1:8000'; // Replace with your actual API base URL
const ApiKey = 'SECRET'

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

                    if(amountOfImages !== 0) {let imageUrls = []; // Array to store image URLs
                    let fetchPromises = []; // Array to store fetch promises
                    
                    for (let i = 0; i < amountOfImages; i++) {
                        const fetchPromise = fetch(ApiGateway + '/listings/' + listingId + '/' + i + '/image')
                            .then(response => response.blob())
                            .then(blob => {
                                if (blob.size > 0) {
                                    const imgUrl = URL.createObjectURL(blob);
                                    console.log('Image URL:', imgUrl);
                    
                                    // Storing the image URL in the array
                                    imageUrls.push(imgUrl);
                                } else {
                                    console.error('No images found for listing:', listingId);
                                }
                            })
                            .catch(error => {
                                console.error('Error fetching images:', error);
                            });
                    
                        fetchPromises.push(fetchPromise);
                    }
                    
                    // Wait for all fetch requests to complete
                    Promise.all(fetchPromises)
                        .then(() => {
                            createGallery(imageUrls); // Call createGallery function with imageUrls after all fetch requests are done
                        });
                    }
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

function createGallery(images) {
    const carouselContainer = document.querySelector('.carousel-container');
    const image = document.querySelector('.carousel-image');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const carouselIndicators = document.querySelector('.carousel-indicators-prime');
  
    const fullscreenContainer = document.querySelector('.fullscreen-container');
    const fullscreenImage = document.querySelector('.fullscreen-image');
    const fullscreenPrevBtn = document.getElementById('fullscreenPrevBtn');
    const fullscreenNextBtn = document.getElementById('fullscreenNextBtn');
    const fullscreenIndicators = document.querySelector('.fullscreen-indicators');
    const fullscreenClose = document.querySelector('.fullscreen-close');
  
    let currentSlide = 0;
    let fullscreenCurrentSlide = 0;
  
    function createIndicators() {
      for (let i = 0; i < images.length; i++) {
        const indicator = document.createElement('span');
        indicator.classList.add('indicator');
        carouselIndicators.appendChild(indicator);
  
        indicator.addEventListener('click', () => {
          currentSlide = i;
          changeSlide();
        });
      }
    }
  
    function createFullscreenIndicators() {
      for (let i = 0; i < images.length; i++) {
        const indicator = document.createElement('span');
        indicator.classList.add('indicator');
        fullscreenIndicators.appendChild(indicator);
  
        indicator.addEventListener('click', () => {
          fullscreenCurrentSlide = i;
          changeFullscreenSlide();
        });
      }
    }
  
    function changeSlide() {
      image.src = images[currentSlide];
      const indicators = document.querySelectorAll('.indicator');
      indicators.forEach((indicator, index) => {
        if (index === currentSlide) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
    }
  
    function changeFullscreenSlide() {
      fullscreenImage.src = images[fullscreenCurrentSlide];
      const fullscreenIndicators = document.querySelectorAll('.fullscreen-indicators .indicator');
      fullscreenIndicators.forEach((indicator, index) => {
        if (index === fullscreenCurrentSlide) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
    }
  
    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + images.length) % images.length;
      changeSlide();
    });
  
    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % images.length;
      changeSlide();
    });
  
    fullscreenPrevBtn.addEventListener('click', () => {
      fullscreenCurrentSlide = (fullscreenCurrentSlide - 1 + images.length) % images.length;
      changeFullscreenSlide();
    });
  
    fullscreenNextBtn.addEventListener('click', () => {
      fullscreenCurrentSlide = (fullscreenCurrentSlide + 1) % images.length;
      changeFullscreenSlide();
    });
  
    fullscreenClose.addEventListener('click', () => {
      fullscreenContainer.style.display = 'none';
    });
  
    image.addEventListener('click', () => {
      fullscreenCurrentSlide = currentSlide;
      fullscreenImage.src = images[currentSlide];
      fullscreenContainer.style.display = 'flex';
      fullscreenIndicators.innerHTML = '';
      createFullscreenIndicators();
      changeFullscreenSlide();
    });
  
    createIndicators();
    changeSlide();
  }
  