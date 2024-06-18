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

function loadTasks() {
    const todayTasks = JSON.parse(localStorage.getItem('todayTasks') || '[]');
    const futureTasks = JSON.parse(localStorage.getItem('futureTasks') || '[]');
    todayTasks.forEach((taskName: string) => addTask(taskName, todayTasksContainer, true));
    futureTasks.forEach((taskName: string) => addTask(taskName, futureTasksContainer, true));
}

function saveTasks() {
    const todayTasks = [...todayTasksContainer.querySelectorAll('.task span')].map(task => task.textContent);
    const futureTasks = [...futureTasksContainer.querySelectorAll('.task span')].map(task => task.textContent);
    localStorage.setItem('todayTasks', JSON.stringify(todayTasks));
    localStorage.setItem('futureTasks', JSON.stringify(futureTasks));
}

function addTask(taskName: string, container: HTMLDivElement, isLoading = false) {
    const task = document.createElement('div');
    task.className = 'task p-2 mb-2 bg-white border rounded shadow w-2/5 flex justify-between items-center cursor-grab';
    task.setAttribute('draggable', 'true');
    task.id = `task-${taskIdCounter++}`; 

    const taskText = document.createElement('span');
    taskText.textContent = taskName;
    task.appendChild(taskText);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.className = 'remove-task-button text-red-500 hover:text-red-700';
    removeButton.addEventListener('click', () => {
        taskToRemove = task;
        confirmationModal.classList.remove('hidden');
    });
    task.appendChild(removeButton);

    task.addEventListener('click', () => {
        task.classList.toggle('bg-red-100');
    });


    container.appendChild(task);

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

function handleAddTask() {
    const taskName = taskInput.value.trim();
    if (taskName) {
        addTask(taskName, todayTasksContainer);
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
