const ApiGateway = 'http://127.0.0.1:8000'; // Replace with your actual API base URL

let data = {
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-789",
  "city": "Sample City",
  "postalCode": "12345",
  "street": "Sample Street",
  "streetNumber": "10",
  "website": "https://example.com"
};

// Display names corresponding to keys in the 'data' object
const displayNames = {
  "name": "Nazwa",
  "email": "Adres email",
  "phone": "Numer telefonu",
  "city": "Miasto",
  "postal_code": "Kod pocztowy",
  "street": "Ulica",
  "street_number": "Numer domu",
  "website": "Strona internetowa"
};

async function renderData() {
  const userDataFromStorage = JSON.parse(localStorage.getItem('user'));
  const userID = userDataFromStorage.id;

  try {
    const response = await getUserData(userID);
    if (response && response.ok) {
      userData = await response.json();
      console.log('Dane testowe:', data);
      console.log('Dane użytkownika:', userData);
      displayUserData(userData[0]);
    } else {
      throw new Error('Wystąpił problem podczas pobierania danych użytkownika.');
    }
  } catch (error) {
    console.error('Błąd:', error.message);
    // Tutaj możesz obsłużyć błąd, np. wyświetlić komunikat użytkownikowi
  }

function displayUserData(userData) {
  const profileDataDiv = document.getElementById('profileData');
  profileDataDiv.innerHTML = '';

  for (const key in userData) {
    if (userData.hasOwnProperty(key)) {
      if (key !== 'id') { // Dodany warunek pominięcia pola "website"
        const row = document.createElement('div');
        row.classList.add('row', 'profil-decoration');
        row.innerHTML = `
          <div class="col">${displayNames[key]}</div>
          <div class="col row-decoration">${userData[key]}</div>
        `;
        profileDataDiv.appendChild(row);
        console.log('Utworzono element:', row);
      }
    }
  }
  document.getElementById('inputName').value = userData.name;
  document.getElementById('inputEmail').value = userData.email;
  document.getElementById('inputPhone').value = userData.phone;
  document.getElementById('inputCity').value = userData.city;
  document.getElementById('inputPostalCode').value = userData.postalCode;
  document.getElementById('inputStreet').value = userData.street;
  document.getElementById('inputStreetNumber').value = userData.streetNumber;
  document.getElementById('inputWebsite').value = userData.website;
}

function showForm() {
  document.getElementById('showFormBtn').classList.add('d-none');
  document.getElementById('changeDataForm').classList.remove('d-none');
}

function hideForm() {
  document.getElementById('showFormBtn').classList.remove('d-none');
  document.getElementById('changeDataForm').classList.add('d-none');
}

function changeData(event) {
  event.preventDefault();
/*
class UserUpdateRequestModel(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    city: str
    postal_code: str
    street: str
    street_number: str
    website: str
*/
  data = {
    "id": JSON.parse(localStorage.getItem('user')).id,
    "name": document.getElementById('inputName').value,
    "email": document.getElementById('inputEmail').value,
    "phone": document.getElementById('inputPhone').value,
    "city": document.getElementById('inputCity').value,
    "postal_code": document.getElementById('inputPostalCode').value,
    "street": document.getElementById('inputStreet').value,
    "street_number": document.getElementById('inputStreetNumber').value,
    "website": document.getElementById('inputWebsite').value
  };
  // log entire data object contents
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      console.log(key + " -> " + data[key]);
    }
  }
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  // Wyślij żądanie do serwera
  fetch('http://127.0.0.1:8000/update_user', requestOptions)
    .then(response => {
      // Obsługa odpowiedzi serwera
      if (response.ok) {
        return response.json();
      }
      throw new Error('Wystąpił błąd podczas aktualizacji danych użytkownika.');
    })
    .then(data => {
      // Obsługa odpowiedzi serwera po aktualizacji danych użytkownika
      console.log('Zaktualizowane dane użytkownika:', data);
      // Tutaj możesz wykonać dodatkowe operacje po udanej aktualizacji
    })
    .catch(error => {
      // Obsługa błędów
      console.error('Błąd:', error.message);
      // Tutaj możesz wyświetlić komunikat błędu użytkownikowi
    });
  renderData();
}

document.getElementById('showFormBtn').addEventListener('click', showForm);
document.getElementById('hideFormBtn').addEventListener('click', hideForm);
document.getElementById('changeDataForm').addEventListener('submit', changeData);

renderData();

async function getUserData(user_id) {
  try {
    const response = await fetch(`${ApiGateway}/get_user/${user_id}`);
    return response;
  } catch (error) {
    throw new Error('Wystąpił problem podczas pobierania danych użytkownika.');
  }
}