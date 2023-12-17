// Pobranie danych z pliku JSON (możesz zasymulować to przy użyciu stałej)
// @app.get("/listingsByCategory/{category_id}/{product_count}")
const ApiGateway = 'http://127.0.0.1:8000/';

  // Funkcja do generowania struktury HTML na podstawie danych z pliku JSON
  function generateHTMLFromJSON(data) {
    const parentContainer = document.getElementById('parentContainer');
    
    data.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('parent');
      const dateOnlyString = item.creation_date.substring(0, 10);
      div.innerHTML = `
        <div class="photo"> <img src="${item.photoSrc}" alt="Zdjęcie ogłoszenia"></div>
        <div class="title">${item.title}</div>
        <div class="price">${item.price} zł</div>
        <div class="loc">${item.location}</div>
        <div class="date">${dateOnlyString}</div>
        <div class="fav"> <i class="bi bi-heart fs-3 icon-decoration-preview"></i> </div>
      `;
  
      parentContainer.appendChild(div);
    });
  }

let dataFromJSON = [];
// save data from Api Gateway to dataFromJSON
fetch(ApiGateway + 'listingsByCategory/1/2')
    .then(response => response.json())
    .then(data => {
        dataFromJSON = data;
        console.log(dataFromJSON);
        generateHTMLFromJSON(dataFromJSON);  // Call the function here
    })
    .catch(error => console.error(error));