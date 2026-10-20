# Code Review Report

Scope: `app.js` (main), `index.html` and `style.css` (class/id names and their link to `app.js` only). Reviewed commit: `6920cb1`.

Russian version: [review-report-RU.md](review-report-RU.md)

## 1. Dead code

No findings. Every variable and function in `app.js` is used, the leftover `ajaxRequest` and debug `console.log` calls are gone, and every class/id used by `app.js` exists in the markup.

## 2. Duplicate handlers

No findings. The add button has exactly one listener (`app.js:73`), and task handlers are assigned through `onclick`/`onchange` properties once per item: in `addTask` for new items and in the startup loop for initial ones (`app.js:85-87`). Moving an item between lists no longer rebinds anything.

## 3. Duplicate logic

### 3.1 Task markup is defined twice: in HTML and in `createTaskElement`

- **Location:** `index.html:27-44`, `app.js:6-31`
- **Problem:** The structure of a task item (checkbox, `label.task`, `input.task`, `button.edit`, `button.delete > img`) exists in two independent copies. `bindTaskEvents` (`app.js:76-82`) and `toggleTaskEditing` (`app.js:46-48`) rely on that structure, but nothing ties the two copies together.
- **Condition:** Someone changes the structure in one place only, e.g. renames `edit` to `edit-button` in `createTaskElement` and in `bindTaskEvents` but not in `index.html`. Then on page load `listItem.querySelector('button.edit')` returns `null` for the first initial task, `editButton.onclick = ...` throws `TypeError`, the startup loop stops, and none of the initial tasks get handlers. The reverse case (HTML updated, JS not) breaks every newly added task. If you decide to render initial tasks from JS instead, note that "Go Shopping" starts in edit mode with a "Save" button and a prefilled input, which `createTaskElement` cannot produce today: this affects the checklist item "Appearance has not changed".
- **Check:** Open `index.html`, confirm the console has no errors, then run the whole checklist from `README.md` on both an initial task and a newly added one. Additionally compare `todoList.children[0].outerHTML` with the `outerHTML` of a freshly added task: they should differ only in text and whitespace.

### 3.2 The same task parts are looked up with different selectors

- **Location:** `app.js:46-48`, `app.js:76-78`
- **Problem:** The edit button is found as `.edit` in `toggleTaskEditing` and as `button.edit` in `bindTaskEvents`. The edit field and the checkbox are found by input type (`input[type=text]`, `input[type=checkbox]`), not by a name. So the knowledge "how to find a part of a task" is spread over two functions in two different styles, and the type-based selectors only work while each type occurs once per item.
- **Condition:** A second text input or checkbox is added to a task (e.g. a due date field), or a class is renamed in one function only. `querySelector('input[type=text]')` silently returns the first match, and editing writes into the wrong field without any error.
- **Check:** After a change, run the checklist items "Task in Todo can be edited" and "Task in Completed can be edited", including the initial "Go Shopping" task that starts in edit mode. Make sure the label shows the edited text after "Save".

## 4. Names that cannot be read without comments

### 4.1 The add button has no name and is found through its wrapper

- **Location:** `app.js:2`, `index.html:22`
- **Problem:** `document.querySelector('.task-row-wrapper button')` finds the add button by layout: "the first button inside the input row". The markup gives the button no class or id, so neither file states that this button is "add task". The original code used `getElementsByTagName('button')[0]`; the current selector is better but still positional.
- **Condition:** Another button is added to `.task-row-wrapper` before "Add" (e.g. "Clear"), or the wrapper class is renamed during a style cleanup. `addButton` then points to the wrong element or to `null` (and `addEventListener` throws on load).
- **Fix note:** Adding `id="add-task-button"` and using `getElementById` does not change appearance, because `style.css` styles buttons by tag, not by id.
- **Check:** Checklist items "New task is added to Todo", "Empty task is not added" and "Appearance has not changed".

### 4.2 `editMode` breaks the kebab-case naming used by other classes

- **Location:** `app.js:49`, `app.js:58`, `index.html:32`, `style.css:144`, `style.css:149`
- **Problem:** Commit `8fe46dc` moved classes to kebab-case (`banner`, `more-info-link`, `todo-tasks`), but `editMode` stayed camelCase. In `app.js` it is a raw string literal repeated twice, so a reader cannot tell whether it is a CSS class, a JS flag or a typo of another convention, and a search for `edit-mode` finds nothing.
- **Condition:** Someone finishes the renaming and changes the class in some of the five places but not all. If `style.css` is missed, edit mode stops hiding the label and showing the input; if `index.html` is missed, "Go Shopping" loads in normal mode while its button says "Save".
- **Check:** Search all three files for the old and new name (zero hits for the old one), then run checklist items "Task in Todo can be edited", "Task in Completed can be edited" and "Appearance has not changed" (the initial "Go Shopping" task must still open in edit mode).

### 4.3 Class `task` marks a stretching text field, not a task

- **Location:** `app.js:11`, `app.js:16`, `index.html:22`, `style.css:30-34`
- **Problem:** `task` is put on the task label, on the edit field and on the "new task" input. The `li` itself has no class. The name suggests "a task", but in fact the class only gives `width: 56%` and `flex-grow: 1`. In `app.js` it looks like a semantic marker, while it is purely a style hook.
- **Condition:** A developer writes `document.querySelectorAll('.task')` expecting task items and gets labels, inputs and the new-task field. Or someone removes `className = 'task'` from `createTaskElement` as "unused in JS": new tasks then get a different width than initial ones (`.task` overrides `li > label { width: 226px }` by specificity).
- **Fix note:** Renaming is a visual change risk: every place listed above must be updated together.
- **Check:** Compare an initial and a newly added task side by side before and after the change; checklist item "Appearance has not changed".

## 5. Comments that restate the code, are outdated or contradict it

No findings. The only comment left (`app.js:12`) explains why `innerText` is used instead of `innerHTML`, and it matches the code.

## 6. Functions that cannot be read as a whole

### 6.1 Handlers take their input from an implicit `this`

- **Location:** `app.js:44`, `app.js:62`, `app.js:68-69`
- **Problem:** `toggleTaskEditing`, `deleteTask` and `toggleTaskCompletion` look like plain functions with no parameters, but they work only when called as DOM handlers with `this` bound to the button or checkbox. The signature does not show the input, and `this.parentNode` additionally assumes the control is a direct child of `li`.
- **Condition:** A routine "modernization" turns `const deleteTask = function () {...}` into an arrow function (the file already uses `const` everywhere, so this is a likely step). In a classic script `this` then becomes `window`, `this.parentNode` is `undefined`, and edit, delete and the checkbox throw `TypeError` on every click. The same happens if a control gets wrapped in another element.
- **Fix note:** Taking `event` as a parameter and using `event.currentTarget.closest('li')` keeps the behavior (for the delete button `currentTarget` is the button even when the click lands on the `img`).
- **Check:** Checklist items for edit, delete and checkbox in both lists, clicking the delete icon image itself, not only the button area.

### 6.2 Startup code is split around function definitions

- **Location:** `app.js:73`, `app.js:75-83`, `app.js:85-87`
- **Problem:** The program entry point is in two places: the add button is wired at line 73, between `toggleTaskCompletion` and `bindTaskEvents`, and the initial tasks are wired at the end of the file. `addTask` (`app.js:38`) calls `bindTaskEvents`, which is a `const` declared later. This works only because `addTask` runs after the whole script has executed.
- **Condition:** Someone calls `addTask` or `bindTaskEvents` during startup above line 75 (for example, while implementing 3.1 by rendering initial tasks from JS). The script fails with `ReferenceError: Cannot access 'bindTaskEvents' before initialization`, and no handlers are attached.
- **Fix note:** Moving line 73 next to the loop at the end of the file does not change behavior.
- **Check:** Reload the page, confirm the console is clean, then run the full checklist.

## Top 3

1. **3.1 Duplicate task markup.** The only finding where a one-sided change silently breaks the app at load time for all initial tasks, and it is the most likely change in this codebase (task structure is what people edit).
2. **6.1 Implicit `this` in handlers.** A very likely next "clean code" step (arrow functions) breaks three out of five checklist actions at once, and nothing in the function signature warns about it.
3. **4.1 Add button found by position.** The core action of the app depends on markup layout instead of a name; a small markup change disables adding tasks or crashes the script on load.
