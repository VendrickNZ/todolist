const addButton = document.getElementById('addButton') as HTMLButtonElement;
const taskInput = document.getElementById('new-task') as HTMLInputElement;
const dateElement = document.getElementById('date-string') as HTMLHeadingElement;
const todayTasksContainer = document.querySelector('#today-task-list .tasks-container') as HTMLDivElement;
const futureTasksContainer = document.querySelector('#future-task-list .tasks-container') as HTMLDivElement;

let taskIdCounter = 0;

function addTask(taskName: string, container: HTMLDivElement) {
    const task = document.createElement('div');
    task.className = 'task p-2 mb-2 bg-white border rounded shadow w-1/3';
    task.textContent = taskName;
    task.setAttribute('draggable', 'true');
    task.id = `task-${taskIdCounter++}`; 
    container.appendChild(task);
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

showDate();

setInterval(showDate, 1000);

document.addEventListener('dragstart', (event) => {
    if (event.target instanceof HTMLElement && event.target.classList.contains('task')) {
        event.dataTransfer?.setData('text/plain', event.target.id);
        event.target.classList.add('dragging');
    }
});

document.addEventListener('dragend', (event) => {
    if (event.target instanceof HTMLElement && event.target.classList.contains('task')) {
        event.target.classList.remove('dragging');
    }
});

document.addEventListener('dragover', (event) => {
    event.preventDefault();
    const container = event.target instanceof HTMLElement ? event.target.closest('#today-task-list, #future-task-list') as HTMLDivElement : null;
    if (container) {
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        const afterElement = getDragAfterElement(container, event.clientY);
        const draggingElement = document.querySelector('.dragging') as HTMLElement;
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
        const container = event.target.closest('#today-task-list, #future-task-list') as HTMLDivElement;
        if (container) {
            container.style.backgroundColor = '';
            const taskId = event.dataTransfer?.getData('text');
            if (taskId) {
                const task = document.getElementById(taskId);
                if (task) {
                    container.appendChild(task);
                }
            }
        }
    }
});

function getDragAfterElement(container: HTMLElement, y: number) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

    return draggableElements.reduce<{ offset: number, element: HTMLElement | null }>((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child as HTMLElement };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}