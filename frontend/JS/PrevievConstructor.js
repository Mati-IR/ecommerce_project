// Pobranie danych z pliku JSON (możesz zasymulować to przy użyciu stałej)
// @app.get("/listingsByCategory/{category_id}/{product_count}")
const ApiGateway = 'http://127.0.0.1:8000/';
const userIdIndex = 0;

  // Funkcja do generowania struktury HTML na podstawie danych z pliku JSON
  function generateHTMLFromJSON(listings, likedListings = []) {
    const parentContainer = document.getElementById('parentContainer');
    
    listings.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('parent');
      const dateOnlyString = item.creation_date.substring(0, 10);
      const isLiked = likedListings.find(likedItem => likedItem.listing_id === item.id);
      console.log("likedListings in generateHTMLFromJSON: " + likedListings);
        
      div.innerHTML = `
        <div class="photo"> <img src="${item.photoSrc}" alt="Zdjęcie ogłoszenia"></div>
        <div class="title">${item.title}</div>
        <div class="price-pre">${item.price} zł</div>
        <div class="loc">${item.location}</div>
        <div class="date">${dateOnlyString}</div>
      `;
      if (isLiked) {
        div.innerHTML += `
          <div class="fav"><i class="bi bi-heart-fill fs-3 icon-decoration-preview"></i></div>
        `;
      } else { /* Not liked */
        div.innerHTML += `
        <div class="fav"> <i class="bi bi-heart fs-3 icon-decoration-preview"></i> </div>
        `;
      }
      parentContainer.appendChild(div);
    });
  }

  function getLikedListingIds(listings) {
    let userId = null;
    try {
      /* {id: 1, name: "a", email: "a@gmail.com"} */
      const user = JSON.parse(localStorage.getItem('user'));
      userId = user.id;
    } catch (error) {
      console.warn("User is not logged in");
    }
    let likedListings = [];
    if (null != userId) {
      fetch(ApiGateway + 'basket/' + userId)
        .then(response => response.json())
        .then(data => {
          likedListings = data;
          console.log("Liked listings: " + likedListings);
          generateHTMLFromJSON(listings, likedListings);
        })
        .catch(error => console.error(error));
    }
    else {
      console.warn("User is not logged in");
      generateHTMLFromJSON(listings);
    }
  }


let dataFromJSON = [];
// save data from Api Gateway to dataFromJSON
fetch(ApiGateway + 'listingsByCategory/1/2')
    .then(response => response.json())
    .then(data => {
        dataFromJSON = data;
        console.log(dataFromJSON);
        getLikedListingIds(dataFromJSON);  // Call the function here
    })
    .catch(error => console.error(error));