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
  "postalCode": "Kod pocztowy",
  "street": "Ulica",
  "streetNumber": "Numer domu",
  "website": "Strona internetowa"
};

function renderData() {
  const profileDataDiv = document.getElementById('profileData');
  profileDataDiv.innerHTML = '';

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const row = document.createElement('div');
      row.classList.add('row', 'profil-decoration');
      row.innerHTML = `
        <div class="col">${displayNames[key]}</div>
        <div class="col row-decoration">${data[key]}</div>
      `;
      profileDataDiv.appendChild(row);
    }
  }

  document.getElementById('inputName').value = data.name;
  document.getElementById('inputEmail').value = data.email;
  document.getElementById('inputPhone').value = data.phone;
  document.getElementById('inputCity').value = data.city;
  document.getElementById('inputPostalCode').value = data.postalCode;
  document.getElementById('inputStreet').value = data.street;
  document.getElementById('inputStreetNumber').value = data.streetNumber;
  document.getElementById('inputWebsite').value = data.website;
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
    "name": document.getElementById('inputName').value,
    "email": document.getElementById('inputEmail').value,
    "phone": document.getElementById('inputPhone').value,
    "city": document.getElementById('inputCity').value,
    "postalCode": document.getElementById('inputPostalCode').value,
    "street": document.getElementById('inputStreet').value,
    "streetNumber": document.getElementById('inputStreetNumber').value,
    "website": document.getElementById('inputWebsite').value
  };

  renderData();
}

document.getElementById('showFormBtn').addEventListener('click', showForm);
document.getElementById('hideFormBtn').addEventListener('click', hideForm);
document.getElementById('changeDataForm').addEventListener('submit', changeData);

renderData();