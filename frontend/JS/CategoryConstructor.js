const categories = {
    'Praca': 'fa-briefcase',
    'Nieruchomości': 'fa-home',
    'Usługi': 'fa-tools',
    'Motoryzacja': 'fa-car',
    'Elektronika': 'fa-laptop',
    'Meble': 'fa-couch',
    'Ubrania i Akcesoria': 'fa-tshirt',
    'Za darmo': 'fa-gift',
    'Zwierzęta': 'fa-paw',
    'Inne': 'fa-meh'
  };

  function generateCategoryTable(categoriesList) {
    const categoriesContainer = document.getElementById('categories');

    Object.keys(categoriesList).forEach((category) => {
      const cell = document.createElement('div');
      cell.classList.add('category-cell');

      const iconCircle = document.createElement('div');
      iconCircle.classList.add('icon-circle');

      const icon = document.createElement('i');
      icon.classList.add('fas', categoriesList[category], 'icon-color'); // Dodaj klasę ikony Font Awesome i klasy zmieniającej kolor

      iconCircle.appendChild(icon);

      const categoryName = document.createElement('div');
      categoryName.textContent = category; // Dodaj nazwę kategorii

      cell.appendChild(iconCircle);
      cell.appendChild(categoryName); // Dodaj nazwę kategorii pod ikoną
      categoriesContainer.appendChild(cell);
    });
  }

  generateCategoryTable(categories);