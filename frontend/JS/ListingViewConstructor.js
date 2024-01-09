const ApiGateway = 'http://127.0.0.1:8000'; // Replace with your actual API base URL
const ApiKey = 'SECRET'

function convertToAscii(stringWithPolishCharacters) {
    const polishToAsciiMap = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
        'ó': 'o', 'ś': 's', 'ż': 'z', 'ź': 'z', 'Ą': 'A',
        'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O',
        'Ś': 'S', 'Ż': 'Z', 'Ź': 'Z'
    };

    return stringWithPolishCharacters.replace(/[ąćęłńóśżźĄĆĘŁŃÓŚŻŹ]/g, match => polishToAsciiMap[match] || match);
}
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
            document.getElementById('creation_date').innerHTML = '<strong>Data dodania: </strong> ' + konwertujDate(data[0].creation_date);

            //wyszukiwanie nazwy kategori na podstawie id i jej tlumaczenie
            getCategories()
            .then(categories => {
              const categoryName = findCategoryById(categories, data[0].category_id, translations);
              document.getElementById('category').textContent = categoryName;
            })
            .catch(error => {
              // Tutaj możesz obsłużyć błąd, jeśli wystąpi
              console.error('Error:', error);
              document.getElementById('category').textContent = 'Brak';
            });

            document.getElementById('description').textContent = data[0].description;
            document.getElementById('price').textContent = data[0].price + " zł";
            
            document.getElementById('email').textContent = data[0].email;
            document.getElementById('phone').textContent = data[0].phone;
            console.log('Location:', data[0].location);
            document.getElementById('address').textContent = data[0].location;
            const addressPlaceholder = document.getElementById('address');
            const mapIframe = document.getElementById('map');

            if (addressPlaceholder && mapIframe) {
                addressPlaceholder.textContent = data[0].location;

                // Assuming data.mapLocation is a string with the desired location for the map
                const mapLocation = encodeURIComponent(convertToAscii(addressPlaceholder.textContent)).replace(/%20/g, "+");

                // Update the src attribute of the iframe with the new location
                // replace whitespaces with + signs
                console.log ('mapLocation:', mapLocation);
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
                    document.getElementById('seller').innerHTML = '<strong>Wystawiający: </strong> ' + data[0].name;
                    document.getElementById('email').innerHTML = '<strong>Email: </strong> ' + data[0].email;
                    document.getElementById('phone').innerHTML = '<strong>Telefon: </strong> ' + data[0].phone;
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
}

generateFullPreview();

function createGallery(images) {
  const creationDateElement = document.getElementById('creation_date');

  // Create a div for the new content
  const newContent = document.createElement('div');
  newContent.innerHTML = `
    <div class="carousel-container">
      <div class="carousel-slide">
        <img alt="Carousel Slide" class="carousel-image">
          <div class="carousel-navigation">
            <button id="prevBtn">&lt;</button>
            <button id="nextBtn">&gt;</button>
          </div>
      </div>
    </div>
    <div class="carousel-indicators-prime"></div>`;

  // Insert the new content after the element with id 'creation_date'
  creationDateElement.appendChild(newContent);


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
  
async function getCategories() {
    try {
        const response = await fetch(ApiGateway + '/categories');
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error('Error fetching seller data:', error);
        return null; // Możesz zwrócić pustą tablicę lub inny typ wartości w przypadku błędu
    }
}

const translations  = [
  'Praca',
  'Nieruchomości',
  'Usługi',
  'Motoryzacja',
  'Elektronika',
  'Meble',
  'Ubrania i Akcesoria',
  'Za darmo',
  'Zwierzęta',
  'Inne'
];

function findCategoryById(jsonData, categoryId, translationsArray) {
  try {
      const categoryName = jsonData[categoryId - 1].name;
      
      if (translationsArray && translationsArray[categoryId - 1]) {
          const translatedName = translationsArray[categoryId - 1];
          return translatedName !== '' ? translatedName : categoryName;
      }

      return categoryName;
  } catch (error) {
      console.error('Error parsing JSON data:', error);
      return null; // Możesz zwrócić wartość null lub inny typ wartości w przypadku błędu
  }
}

function konwertujDate(data) {
  const date = new Date(data);
    
  const dzien = String(date.getDate()).padStart(2, '0');
  const miesiac = String(date.getMonth() + 1).padStart(2, '0'); // Dodajemy 1, ponieważ miesiące są indeksowane od zera
  const rok = date.getFullYear();
  const godzina = String(date.getHours()).padStart(2, '0');
  const minuta = String(date.getMinutes()).padStart(2, '0');

  const sformatowanaData = `${dzien}-${miesiac}-${rok} ${godzina}:${minuta}`;
  return sformatowanaData;
}