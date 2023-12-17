// Pobranie danych z pliku JSON (możesz zasymulować to przy użyciu stałej)
const dataFromJSON = [
    {
      "photoSrc": "Resources/OPEL.jpg",
      "title": "OPEL KADETT",
      "price": "20 000",
      "loc": "Olsztyn",
      "data": "12.12.2023"
    },
    {
      "photoSrc": "Resources/FORD.jpg",
      "title": "FORD FOCUS",
      "price": "25 000",
      "loc": "Warszawa",
      "data": "15.12.2023"
    },
    // Kolejne rekordy...
  ];
  
  // Funkcja do generowania struktury HTML na podstawie danych z pliku JSON
  function generateHTMLFromJSON(data) {
    const parentContainer = document.getElementById('parentContainer');
  
    data.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('parent');
  
      div.innerHTML = `
        <div class="photo"> <img src="${item.photoSrc}" alt="Zdjęcie ogłoszenia"></div>
        <div class="title">${item.title}</div>
        <div class="price-pre">${item.price}</div>
        <div class="loc">${item.loc}</div>
        <div class="data">${item.data}</div>
        <div class="fav"> <i class="bi bi-heart fs-3 icon-decoration-preview"></i> </div>
      `;
  
      parentContainer.appendChild(div);
    });
  }
  
  // Wywołanie funkcji generującej HTML na podstawie danych z pliku JSON
  generateHTMLFromJSON(dataFromJSON);