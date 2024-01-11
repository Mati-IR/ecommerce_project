// utils.js - plik zawierający funkcję, którą chcemy wyeksportować

export function displayMessage(message) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = `<p>${message}</p>`;
  }