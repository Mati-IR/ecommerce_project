const ApiGateway = 'http://127.0.0.1:8000'; // Replace with your actual API base URL
import {generatePreview} from "./PrevievConstructor.js";
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
      const userData = await response.json();
      console.log('Dane użytkownika:', userData);
      displayUserData(userData[0]);
    } else {
      throw new Error('Wystąpił problem podczas pobierania danych użytkownika.');
    }
  } catch (error) {
    console.error('Błąd:', error.message);
    // Tutaj możesz obsłużyć błąd, np. wyświetlić komunikat użytkownikowi
  }
}
function displayUserData(userData) {
  const profileDataDiv = document.getElementById('profileData');
  profileDataDiv.innerHTML = '';

  for (const key in userData) {
    if (userData.hasOwnProperty(key)) {
      if (key === 'website') {
        const row = document.createElement('div');
        row.classList.add('row', 'profil-decoration');
        row.innerHTML = `
          <div class="col">${displayNames[key]} (Niewymagane)</div>
          <div class="col row-decoration">${userData[key]}</div>
        `;
        profileDataDiv.appendChild(row);
      }

      else if (key !== 'id') {
        const row = document.createElement('div');
        row.classList.add('row', 'profil-decoration');
        row.innerHTML = `
          <div class="col">${displayNames[key]}</div>
          <div class="col row-decoration">${userData[key]}</div>
        `;
        profileDataDiv.appendChild(row);
      }
    }
  }
  document.getElementById('inputName').value = userData.name;
  document.getElementById('inputEmail').value = userData.email;
  document.getElementById('inputPhone').value = userData.phone;
  document.getElementById('inputCity').value = userData.city;
  document.getElementById('inputPostalCode').value = userData.postal_code;
  document.getElementById('inputStreet').value = userData.street;
  document.getElementById('inputStreetNumber').value = userData.street_number;
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
  // Dodanie walidacji formularza przed wysłaniem żądania PUT
  const isValid = validateForm();
  if (!isValid) {
    return;
  }
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
      renderData();
      displaySuccessMessage();
      // Tutaj możesz wykonać dodatkowe operacje po udanej aktualizacji
    })
    .catch(error => {
      // Obsługa błędów
      console.error('Błąd:', error.message);
      // Tutaj możesz wyświetlić komunikat błędu użytkownikowi
    });
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

function validateEmail(email) {
  // Prosta walidacja adresu email
  const re = /\S+@\S+\.\S+/;
  return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
  // Prosta walidacja numeru telefonu
  const re = /^\d{3}-\d{3}-\d{3}$/;
  return re.test(String(phone));
}

function validatePostalCode(postalCode) {
  // Prosta walidacja kodu pocztowego
  const re = /^\d{5}$/;
  return re.test(String(postalCode));
}

function validateStreetNumber(streetNumber) {
  // Prosta walidacja numeru domu - przykładowy wzorzec (tylko cyfry)
  const re = /^\d+$/;
  return re.test(String(streetNumber));
}

function validateForm() {
  const name = document.getElementById('inputName').value;
  const email = document.getElementById('inputEmail').value;
  const phone = document.getElementById('inputPhone').value;
  const city = document.getElementById('inputCity').value;
  const postalCode = document.getElementById('inputPostalCode').value;
  const street = document.getElementById('inputStreet').value;
  const streetNumber = document.getElementById('inputStreetNumber').value;
  const website = document.getElementById('inputWebsite').value;
  
  // Prosta walidacja danych
  if (!name || !email || !phone || !city || !postalCode || !street || !streetNumber) {
    alert('Wszystkie pola są wymagane');
    return false;
  }

  if (!validateEmail(email)) {
    alert('Nieprawidłowy adres email');
    return false;
  }

  if (!validatePhone(phone)) {
    alert('Nieprawidłowy numer telefonu (oczekiwany format: 123-456-789)');
    return false;
  }

  if (!validatePostalCode(postalCode)) {
    alert('Nieprawidłowy kod pocztowy (oczekiwany format: 12345)');
    return false;
  }
  
  if (!validateStreetNumber(streetNumber)) {
    alert('Nieprawidłowy numer domu');
    return false;
  }

  return true;
}

function displaySuccessMessage() {
  const successMessage = document.getElementById('successMessage');
  successMessage.classList.remove('d-none');
}

function closeMessage() {
  const successMessage = document.getElementById('successMessage');
  successMessage.classList.add('d-none');
}

const sampleObjects = [
  {
    "id": 28,
    "creator_id": 2,
    "creation_date": "2024-01-10T14:35:00",
    "title": "tes",
    "description": "sd",
    "price": 5,
    "location": "Laczna 45",
    "category_id": 1
  },
  {
    "id": 23,
    "creator_id": 3,
    "creation_date": "2024-01-11T09:20:00",
    "title": "sample",
    "description": "example",
    "price": 10,
    "location": "Example Street 123",
    "category_id": 2
  },
  {
    "id": 25,
    "creator_id": 4,
    "creation_date": "2024-01-12T18:45:00",
    "title": "another",
    "description": "object",
    "price": 15,
    "location": "Test Avenue 789",
    "category_id": 3
  }
];

const emptydata = [];

async function getUserListing(userId) {
  console.log("userId", userId);

  try {
      //const response = await fetch(`${API}/basket/${userId}`);
      //const data = await response.json();
      console.log('user listing data', sampleObjects);

      // Return or use the listingIds array as needed
      return sampleObjects;
  } catch (error) {
      console.error('Error fetching basket:', error);
      // Handle the error as needed
  }
}

const userDataFromLS = JSON.parse(localStorage.getItem('user'));
const userIDFromLS = userDataFromLS.id;
const UserListingFromDB = await getUserListing(userIDFromLS)
console.log("UserListingFromDB", UserListingFromDB);
if (UserListingFromDB.length === 0) {
  // If there are no liked listings, display the message
  document.getElementById('noUserListing').style.display = 'block';
} else {
  // If there are liked listings, generate and display the preview
  await generatePreview(UserListingFromDB);
}