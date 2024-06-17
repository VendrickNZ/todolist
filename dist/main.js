"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var addButton = document.getElementById('addButton');
var taskInput = document.getElementById('new-task');
var dateElement = document.getElementById('date-string');
var todayTasksContainer = document.querySelector('#today-task-list .tasks-container');
var futureTasksContainer = document.querySelector('#future-task-list .tasks-container');
var taskIdCounter = 0;
function addTask(taskName, container) {
    var task = document.createElement('div');
    task.className = 'task p-2 mb-2 bg-white border rounded shadow w-1/3';
    task.textContent = taskName;
    task.setAttribute('draggable', 'true');
    task.id = "task-".concat(taskIdCounter++);
    container.appendChild(task);
}
function handleAddTask() {
    var taskName = taskInput.value.trim();
    if (taskName) {
        addTask(taskName, todayTasksContainer);
        taskInput.value = '';
        taskInput.focus();
    }
}
function showDate() {
    var now = new Date();
    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };
    var dateTimeString = new Intl.DateTimeFormat('en-US', options).format(now);
    dateElement.textContent = dateTimeString;
}
addButton.addEventListener('click', handleAddTask);
taskInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        handleAddTask();
    }
});
showDate();
setInterval(showDate, 1000);
document.addEventListener('dragstart', function (event) {
    var _a;
    if (event.target instanceof HTMLElement && event.target.classList.contains('task')) {
        (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData('text/plain', event.target.id);
        event.target.classList.add('dragging');
    }
});
document.addEventListener('dragend', function (event) {
    if (event.target instanceof HTMLElement && event.target.classList.contains('task')) {
        event.target.classList.remove('dragging');
    }
});
document.addEventListener('dragover', function (event) {
    event.preventDefault();
    var container = event.target instanceof HTMLElement ? event.target.closest('#today-task-list, #future-task-list') : null;
    if (container) {
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        var afterElement = getDragAfterElement(container, event.clientY);
        var draggingElement = document.querySelector('.dragging');
        if (afterElement == null) {
            container.appendChild(draggingElement);
        }
        else {
            container.insertBefore(draggingElement, afterElement);
        }
    }
});
document.addEventListener('dragleave', function (event) {
    if (event.target instanceof HTMLElement) {
        var container = event.target.closest('#today-task-list, #future-task-list');
        if (container) {
            container.style.backgroundColor = '';
        }
    }
});
document.addEventListener('drop', function (event) {
    var _a;
    event.preventDefault();
    if (event.target instanceof HTMLElement) {
        var container = event.target.closest('#today-task-list, #future-task-list');
        if (container) {
            container.style.backgroundColor = '';
            var taskId = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData('text');
            if (taskId) {
                var task = document.getElementById(taskId);
                if (task) {
                    container.appendChild(task);
                }
            }
        }
    }
});
function getDragAfterElement(container, y) {
    var draggableElements = __spreadArray([], __read(container.querySelectorAll('.task:not(.dragging)')), false);
    return draggableElements.reduce(function (closest, child) {
        var box = child.getBoundingClientRect();
        var offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        }
        else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}
