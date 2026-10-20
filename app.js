//Document is the DOM can be accessed in the console with document.window.
// Tree is from the top, html, body, p etc.

//Problem: User interaction does not provide the correct results.
//Solution: Add interactivity so the user can manage daily tasks.
//Break things down into smaller steps and take each step at a time.

// Event handling, user interaction is what starts the code execution.

const newTaskInput = document.getElementById('new-task'); //Add a new task.
const addButton = document.querySelector('.task-row-wrapper button');
const todoList = document.getElementById('incompleteTasks'); //ul of #incompleteTasks
const completedList = document.getElementById('completed-tasks'); //completed-tasks

//New task list item
const createTaskElement = function (taskText) {
  const listItem = document.createElement('li');

  //input (checkbox)
  const checkbox = document.createElement('input'); //checkbx
  //label
  const label = document.createElement('label'); //label
  //input (text)
  const editInput = document.createElement('input'); //text
  //button.edit
  const editButton = document.createElement('button'); //edit button

  //button.delete
  const deleteButton = document.createElement('button'); //delete button
  const deleteButtonImg = document.createElement('img'); //delete button image

  label.innerText = taskText;
  label.className = 'task';

  //Each elements, needs appending
  checkbox.type = 'checkbox';
  editInput.type = 'text';
  editInput.className = 'task';

  editButton.innerText = 'Edit'; //innerText encodes special characters, HTML does not.
  editButton.className = 'edit';

  deleteButton.className = 'delete';
  deleteButtonImg.src = './remove.svg';
  deleteButton.appendChild(deleteButtonImg);

  //and appending.
  listItem.appendChild(checkbox);
  listItem.appendChild(label);
  listItem.appendChild(editInput);
  listItem.appendChild(editButton);
  listItem.appendChild(deleteButton);
  return listItem;
};

const addTask = function () {
  //Create a new list item with the text from the #new-task:
  if (!newTaskInput.value) return;
  const listItem = createTaskElement(newTaskInput.value);

  //Append listItem to todoList
  todoList.appendChild(listItem);
  bindTaskEvents(listItem);

  newTaskInput.value = '';
};

//Edit an existing task.

const toggleTaskEditing = function () {
  const listItem = this.parentNode;

  const editInput = listItem.querySelector('input[type=text]');
  const label = listItem.querySelector('label');
  const editButton = listItem.querySelector('.edit');
  const isEditMode = listItem.classList.contains('editMode');
  //If class of the parent is .editmode
  if (isEditMode) {
    //switch to .editmode
    //label becomes the inputs value.
    label.innerText = editInput.value;
    editButton.innerText = 'Edit';
  } else {
    editInput.value = label.innerText;
    editButton.innerText = 'Save';
  }

  //toggle .editmode on the parent.
  listItem.classList.toggle('editMode');
};

//Delete task.
const deleteTask = function () {
  const listItem = this.parentNode;
  const taskList = listItem.parentNode;
  //Remove the parent list item from the ul.
  taskList.removeChild(listItem);
};

const toggleTaskCompletion = function () {
  const listItem = this.parentNode;
  const targetList = this.checked ? completedList : todoList;
  targetList.appendChild(listItem);
};

//The glue to hold it all together.

//Set the click handler to the addTask function.
addButton.addEventListener('click', addTask);

const bindTaskEvents = function (listItem) {
  //select ListItems children
  const checkbox = listItem.querySelector('input[type=checkbox]');
  const editButton = listItem.querySelector('button.edit');
  const deleteButton = listItem.querySelector('button.delete');

  //Bind toggleTaskEditing to edit button.
  editButton.onclick = toggleTaskEditing;
  //Bind deleteTask to delete button.
  deleteButton.onclick = deleteTask;
  checkbox.onchange = toggleTaskCompletion;
};

for (const listItem of [...todoList.children, ...completedList.children]) {
  bindTaskEvents(listItem);
}

// Issues with usability don't get seen until they are in front of a human tester.

//prevent creation of empty tasks.

//Change edit to save when you are in edit mode.
