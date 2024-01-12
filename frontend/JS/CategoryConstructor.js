const categories = {
    1: 'fa-briefcase',
    2: 'fa-home',
    3: 'fa-tools',
    4: 'fa-car',
    5: 'fa-laptop',
    6: 'fa-couch',
    7: 'fa-tshirt',
    8: 'fa-gift',
    9: 'fa-paw',
    10: 'fa-meh'
};

const categoryDescriptions = {
    1: 'Praca',
    2: 'Nieruchomości',
    3: 'Usługi',
    4: 'Motoryzacja',
    5: 'Elektronika',
    6: 'Meble',
    7: 'Ubrania i Akcesoria',
    8: 'Za darmo',
    9: 'Zwierzęta',
    10:'Prace dorywcze',
    11:'Inne',
};

function generateCategoryTable(categoriesList) {
    const categoriesContainer = document.getElementById('categories');

    Object.keys(categoriesList).forEach((categoryId) => {
        const cell = document.createElement('div');
        cell.classList.add('category-cell');

        const iconCircle = document.createElement('div');
        iconCircle.classList.add('icon-circle');

        const icon = document.createElement('i');
        icon.classList.add('fas', categoriesList[categoryId], 'icon-color'); // Add Font Awesome class and color-changing class
        const urlWithParams = `../category_page.html?categoryId=${categoryId}`;

        iconCircle.appendChild(icon);

        const categoryName = document.createElement('div');
        categoryName.textContent = categoryDescriptions[categoryId]; // Display category description instead of name

        cell.addEventListener('click', function () {
            window.location.href = urlWithParams;
        });

        cell.appendChild(iconCircle);
        cell.appendChild(categoryName);
        categoriesContainer.appendChild(cell);
    });
}

generateCategoryTable(categories);
