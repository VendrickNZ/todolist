import './styles.css';

const addButton = document.getElementById('addButton') as HTMLButtonElement;
const taskInput = document.getElementById('new-task') as HTMLInputElement;
const dateElement = document.getElementById('date-string') as HTMLHeadingElement;
const todayTasksContainer = document.querySelector('#today-task-list .tasks-container') as HTMLDivElement;
const futureTasksContainer = document.querySelector('#future-task-list .tasks-container') as HTMLDivElement;
const confirmationModal = document.getElementById('confirmationModal') as HTMLDivElement;
const confirmButton = document.getElementById('confirmButton') as HTMLButtonElement;
const cancelButton = document.getElementById('cancelButton') as HTMLButtonElement;

let taskIdCounter = 0;
let taskToRemove: HTMLDivElement | null = null;
let taskToEdit: HTMLDivElement | null = null;

interface Task {
    title: string;
    description: string;
}

function clearTasks() {
    todayTasksContainer.innerHTML = '';
    futureTasksContainer.innerHTML = '';
}

function loadTasks() {
    clearTasks();
    const todayTasks = JSON.parse(localStorage.getItem('todayTasks') || '[]');
    const futureTasks = JSON.parse(localStorage.getItem('futureTasks') || '[]');
    todayTasks.forEach((task: Task) => addTask(task, todayTasksContainer, true));
    futureTasks.forEach((task: Task) => addTask(task, futureTasksContainer, true));
}

function saveTasks() {
    const todayTasks = [...todayTasksContainer.querySelectorAll('.task')].map(task => ({
        title: (task.querySelector('.task-title') as HTMLElement).textContent,
        description: (task.querySelector('.task-description') as HTMLElement).textContent
    }));
    const futureTasks = [...futureTasksContainer.querySelectorAll('.task')].map(task => ({
        title: (task.querySelector('.task-title') as HTMLElement).textContent,
        description: (task.querySelector('.task-description') as HTMLElement).textContent
    }));
    localStorage.setItem('todayTasks', JSON.stringify(todayTasks));
    localStorage.setItem('futureTasks', JSON.stringify(futureTasks));
}

function addTask(task: Task, container: HTMLDivElement, isLoading = false) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task p-2 mb-2 bg-white border rounded shadow w-2/5 flex justify-between items-center cursor-grab relative';
    taskElement.setAttribute('draggable', 'true');
    taskElement.id = `task-${taskIdCounter++}`;

    const taskTitle = document.createElement('span');
    taskTitle.className = 'task-title';
    taskTitle.textContent = task.title;
    taskElement.appendChild(taskTitle);

    const taskDescription = document.createElement('div');
    taskDescription.className = 'task-description hidden';
    taskDescription.textContent = task.description;
    taskElement.appendChild(taskDescription);

    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'relative inline-block text-left';

    const settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className = 'inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50';
    settingsButton.id = `menu-button-${taskIdCounter}`;
    settingsButton.setAttribute('aria-expanded', 'true');
    settingsButton.setAttribute('aria-haspopup', 'true');
    settingsButton.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleSettings(taskElement);
    });

    const buttonContent = document.createElement('span');
    buttonContent.className = 'inline-flex items-center gap-2'

    const buttonText = document.createTextNode('Options');
    settingsButton.appendChild(buttonText);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '20');


    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute('d', 'M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z');
    path.setAttribute('clip-rule', 'evenodd');

    svg.appendChild(path);

    settingsButton.appendChild(svg);

    dropdownContainer.appendChild(settingsButton);

    const settingsMenu = document.createElement('div');
    settingsMenu.className = 'settings-menu absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden transition ease-out duration-100 transform opacity-0 scale-95';
    settingsMenu.setAttribute('role', 'menu');
    settingsMenu.setAttribute('aria-orientation', 'vertical');
    settingsMenu.setAttribute('aria-labelledby', settingsButton.id);

    const editButton = document.createElement('a');
    editButton.textContent = 'Edit';
    editButton.className = 'block px-4 py-2 text-sm text-gray-700';
    editButton.setAttribute('role', 'menuitem');
    editButton.addEventListener('click', (event) => {
        event.stopPropagation();
        showEditModal(taskElement);
        toggleSettings(taskElement);
    });
    settingsMenu.appendChild(editButton);

    const deleteButton = document.createElement('a');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'block px-4 py-2 text-sm text-gray-700';
    deleteButton.setAttribute('role', 'menuitem');
    deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();
        taskToRemove = taskElement;
        confirmationModal.classList.remove('hidden');
        toggleSettings(taskElement);
    });
    settingsMenu.appendChild(deleteButton);

    dropdownContainer.appendChild(settingsMenu);
    taskElement.appendChild(dropdownContainer);

    taskElement.addEventListener('click', () => {
        taskElement.classList.toggle('bg-red-100');
        taskDescription.classList.toggle('hidden');
    });

    container.appendChild(taskElement);

    if (!isLoading) {
        saveTasks();
    }
}


function removeTask() {
    if (taskToRemove) {
        taskToRemove.parentElement?.removeChild(taskToRemove);
        taskToRemove = null;
        saveTasks();
        confirmationModal.classList.add('hidden');
    }
}

function showEditModal(taskElement: HTMLDivElement) {
    taskToEdit = taskElement;
    const title = (taskElement.querySelector('.task-title') as HTMLElement).textContent;
    const description = (taskElement.querySelector('.task-description') as HTMLElement).textContent;
}

function toggleSettings(taskElement: HTMLDivElement) {
    const settingsMenu = taskElement.querySelector('.settings-menu') as HTMLDivElement;
    settingsMenu.classList.toggle('hidden');
    settingsMenu.classList.toggle('opacity-0');
    settingsMenu.classList.toggle('scale-95');
}

function handleAddTask() {
    const taskName = taskInput.value.trim();
    if (taskName) {
        const newTask = { title: taskName, description: '' };
        addTask(newTask, todayTasksContainer);
        taskInput.value = '';
        taskInput.focus();
    }
}

function showDate() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };

    const dateTimeString = new Intl.DateTimeFormat('en-US', options).format(now);
    dateElement.textContent = dateTimeString;
}

addButton.addEventListener('click', handleAddTask);

taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleAddTask();
    }
});

confirmButton.addEventListener('click', removeTask);

cancelButton.addEventListener('click', () => {
    taskToRemove = null;
    confirmationModal.classList.add('hidden');
});

showDate();

setInterval(showDate, 1000);

document.addEventListener('mousedown', (event) => {
    if (event.target instanceof HTMLElement && event.target.classList.contains('task')) {
        event.target.classList.add('cursor-grabbing');
        event.target.classList.remove('cursor-grab');
    }
});

document.addEventListener('mouseup', (event) => {
    if (event.target instanceof HTMLElement && event.target.classList.contains('task')) {
        event.target.classList.remove('cursor-grabbing');
        event.target.classList.add('cursor-grab');
    }
});

document.addEventListener('dragstart', (event) => {
    if (event.target instanceof HTMLElement && event.target.classList.contains('task')) {
        event.dataTransfer?.setData('text/plain', event.target.id);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.dropEffect = "move";
        }
        event.target.classList.add('dragging');
        event.target.classList.add('cursor-grabbing');
        event.target.classList.remove('cursor-grab');
    }
});

document.addEventListener('dragend', (event) => {
    if (event.target instanceof HTMLElement && event.target.classList.contains('task')) {
        event.target.classList.remove('dragging', 'cursor-grabbing');
        event.target.classList.add('cursor-grab');
    }
    saveTasks();
});

document.addEventListener('dragover', (event) => {
    event.preventDefault();
    let container = event.target instanceof HTMLElement ? event.target.closest('#today-task-list, #future-task-list') as HTMLDivElement : null;
    if (container) {
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        const afterElement = getDragAfterElement(container, event.clientY);
        const draggingElement = document.querySelector('.dragging') as HTMLElement;

        if (container.id === 'today-task-list') {
            container = todayTasksContainer;
        } else if (container.id === 'future-task-list') {
            container = futureTasksContainer;
        }

        if (afterElement == null) {
            container.appendChild(draggingElement);
        } else {
            container.insertBefore(draggingElement, afterElement);
        }
    }
});

document.addEventListener('dragleave', (event) => {
    if (event.target instanceof HTMLElement) {
        const container = event.target.closest('#today-task-list, #future-task-list') as HTMLDivElement;
        if (container) {
            container.style.backgroundColor = '';
        }
    }
});

document.addEventListener('drop', (event) => {
    event.preventDefault();
    if (event.target instanceof HTMLElement) {
        let container = event.target.closest('#today-task-list, #future-task-list') as HTMLDivElement;
        if (container) {
            container.style.backgroundColor = '';
            const taskId = event.dataTransfer?.getData('text') ?? '';
            const task = document.getElementById(taskId);

            if (container.id === 'today-task-list') {
                container = todayTasksContainer;
            } else if (container.id === 'future-task-list') {
                container = futureTasksContainer;
            }

            if (task) {
                const afterElement = getDragAfterElement(container, event.clientY);
                if (afterElement == null) {
                    container.appendChild(task);
                } else {
                    container.insertBefore(task, afterElement);
                }
                saveTasks();
            }
        }
    }
});

function getDragAfterElement(container: HTMLElement, y: number) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

    let closest = { offset: Number.NEGATIVE_INFINITY, element: null as HTMLElement | null };
    draggableElements.forEach(child => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            closest = { offset: offset, element: child as HTMLElement };
        }
    });
    return closest.element;
}

loadTasks();
