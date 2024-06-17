"use strict";
const addButton = document.getElementById('addButton');
const container = document.getElementById('container');
function addTask() {
    const newText = document.createElement('p');
    newText.textContent = 'New Task';
    container.appendChild(newText);
}
addButton.addEventListener('click', addTask);
