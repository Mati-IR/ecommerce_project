async function createNavi() {

  const userLoggedIn = localStorage.getItem('user');
  if (userLoggedIn) {
    await checkDataFill(); // Wykonujemy checkDataFill tylko jeśli istnieje klucz 'user'
  }
  const feedback = localStorage.getItem('feedback');
  
  const div = document.createElement('div');
  div.classList.add('nav-color-main');

  const nav = document.createElement('nav');
  nav.classList.add('navbar', 'navbar-expand-lg', 'navbar-light');

  const containerFluid = document.createElement('div');
  containerFluid.classList.add('container-fluid');

  const brandLink1 = document.createElement('a');
  brandLink1.classList.add('navbar-brand');
  brandLink1.href = '#';

  const brandLink2 = document.createElement('a');
  brandLink2.classList.add('navbar-brand', 'me-2');
  brandLink2.href = 'index.html';

  const img = document.createElement('img');
  img.src = 'Resources/Logo.png';
  img.height = '50';
  img.alt = 'Logo';
  img.loading = 'lazy';
  img.style.marginTop = '-1px';

  const togglerButton = document.createElement('button');
  togglerButton.type = 'button';
  togglerButton.classList.add('navbar-toggler');
  togglerButton.setAttribute('data-bs-toggle', 'collapse');
  togglerButton.setAttribute('data-bs-target', '#navbarCollapse');

  const togglerIcon = document.createElement('span');
  togglerIcon.classList.add('navbar-toggler-icon');

  const collapseDiv = document.createElement('div');
  collapseDiv.classList.add('collapse', 'navbar-collapse');
  collapseDiv.id = 'navbarCollapse';

  const navLinks = document.createElement('div');
  navLinks.classList.add('navbar-nav', 'ms-auto');

  const links = [];

  if (userLoggedIn) {
    links.push(
      { href: 'todo.html', text: 'TO DO', iconClass: 'bi-list-task' },
      { href: 'basket_page.html', text: 'ulubione', iconClass: 'bi-heart' },
    );

    if (feedback !== 'false' && feedback !== null) {
      links.push({ href: 'new_offer.html', text: 'Dodaj ogłoszenie', iconClass: 'bi-plus-square' });
    }

    links.push(
      { href: 'profil.html', text: 'Profil', iconClass: 'bi-person-square' },
      { href: '#', text: 'Wyloguj', iconClass: 'bi-box-arrow-in-left', id: 'logoutBtn' }
    );
  } else {
    links.push({ href: 'login.html', text: 'Zaloguj', iconClass: 'bi-box-arrow-in-left' });
  }

  links.forEach(linkData => {
    const link = document.createElement('a');
    link.href = linkData.href;
    link.classList.add('nav-item', 'nav-link');

    if (linkData.id === 'logoutBtn') {
      link.addEventListener('click', function() {
          localStorage.clear();
          window.location.href = 'index.html'; // Przejście do index.html po wylogowaniu
      });
    }

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('bi', linkData.iconClass, 'icon-decoration');

    link.appendChild(iconSpan);
    link.appendChild(document.createTextNode(` ${linkData.text}`));
    navLinks.appendChild(link);
  });

  togglerButton.appendChild(togglerIcon);
  brandLink2.appendChild(img);
  containerFluid.append(brandLink1, brandLink2, togglerButton, collapseDiv);
  collapseDiv.appendChild(navLinks);
  nav.appendChild(containerFluid);
  div.appendChild(nav);

  if (userLoggedIn !== null) {
    if((feedback === 'false' || feedback === null)){
      const feedbackMsg = document.createElement('p');
      feedbackMsg.textContent = 'Aby mieć możliwość dodawania ogłoszeń, uzupełnij dane profilu.';
      feedbackMsg.style.marginTop = '10px'; // Dodajemy odstęp od góry komunikatu
      feedbackMsg.style.color = 'black'; // Ustawienie koloru tekstu na czarny
      feedbackMsg.style.textAlign = 'center'; // Wycentrowanie tekstu
      feedbackMsg.style.fontWeight = 'bold'; // Ustawienie pogrubionej czcionki
      feedbackMsg.style.fontSize = '1.2em'; // Zwiększenie rozmiaru czcionki
    
      div.appendChild(feedbackMsg)
    }
  }
  

  return div;
}

  
document.addEventListener('DOMContentLoaded', async function() {
  const navElement = await createNavi(); // Oczekiwanie na zakończenie createNavi

  const navColorMainDiv = document.querySelector('.nav-color-main');

  if (navColorMainDiv) {
    navColorMainDiv.appendChild(navElement);
  } else {
    console.error('Nie znaleziono elementu o klasie nav-color-main');
  }
});

  function areAllFieldsPopulated(obj) {
    for (let key in obj[0]) {
      if (obj[0][key] === null) {
        return false;
      }
    }
    return true;
  }

  async function get_User_Data(user_id) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/get_user/${user_id}`);
      return response;
    } catch (error) {
      throw new Error('Wystąpił problem podczas pobierania danych użytkownika.');
    }
  }

  async function checkDataFill() {
    const userDataFromStorage = JSON.parse(localStorage.getItem('user'));
    const userID = userDataFromStorage.id;
    try {
      const response = await get_User_Data(userID);
      if (response && response.ok) {
        const userData = await response.json();
        const feedback = areAllFieldsPopulated(userData);
        // Convert feedback to string before saving in localStorage
        localStorage.setItem('feedback', JSON.stringify(feedback));
      } else {
        throw new Error('Wystąpił problem podczas pobierania danych użytkownika.');
      }
    } catch (error) {
      console.error('Błąd:', error.message);
      // Handle error, e.g., display a message to the user
    }
  }