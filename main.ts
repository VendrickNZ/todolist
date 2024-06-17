const addButton = document.getElementById('addButton') as HTMLButtonElement;
const container = document.getElementById('container') as HTMLDivElement;

function addTask() {
    const newText = document.createElement('p');
    newText.textContent = 'New Task';

    container.appendChild(newText);
}

addButton.addEventListener('click', addTask);