const newTaskInput = document.getElementById('new-task');
const addButton = document.getElementById('add-task-button');
const todoList = document.getElementById('todo-tasks');
const completedList = document.getElementById('completed-tasks');

const createTaskElement = function (taskText) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  const label = document.createElement('label');
  label.className = 'task';
  label.innerText = taskText; // innerText, not innerHTML: user input must not be parsed as HTML

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'task';

  const editButton = document.createElement('button');
  editButton.innerText = 'Edit';
  editButton.className = 'edit';

  const deleteButtonImg = document.createElement('img');
  deleteButtonImg.src = './remove.svg';
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete';
  deleteButton.append(deleteButtonImg);

  const listItem = document.createElement('li');
  listItem.append(checkbox, label, editInput, editButton, deleteButton);
  return listItem;
};

const addTask = function () {
  if (!newTaskInput.value) return;
  const listItem = createTaskElement(newTaskInput.value);

  todoList.appendChild(listItem);
  bindTaskEvents(listItem);

  newTaskInput.value = '';
};

const toggleTaskEditing = function () {
  const listItem = this.parentNode;

  const editInput = listItem.querySelector('input[type=text]');
  const label = listItem.querySelector('label');
  const editButton = listItem.querySelector('.edit');
  const isEditMode = listItem.classList.contains('editMode');
  if (isEditMode) {
    label.innerText = editInput.value;
    editButton.innerText = 'Edit';
  } else {
    editInput.value = label.innerText;
    editButton.innerText = 'Save';
  }

  listItem.classList.toggle('editMode');
};

const deleteTask = function () {
  const listItem = this.parentNode;
  const taskList = listItem.parentNode;
  taskList.removeChild(listItem);
};

const toggleTaskCompletion = function () {
  const listItem = this.parentNode;
  const targetList = this.checked ? completedList : todoList;
  targetList.appendChild(listItem);
};

addButton.addEventListener('click', addTask);

const bindTaskEvents = function (listItem) {
  const checkbox = listItem.querySelector('input[type=checkbox]');
  const editButton = listItem.querySelector('button.edit');
  const deleteButton = listItem.querySelector('button.delete');

  editButton.onclick = toggleTaskEditing;
  deleteButton.onclick = deleteTask;
  checkbox.onchange = toggleTaskCompletion;
};

for (const listItem of [...todoList.children, ...completedList.children]) {
  bindTaskEvents(listItem);
}
