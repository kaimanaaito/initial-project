function allowDrop(event) {
    event.preventDefault(); // Prevent default behavior
}

function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text");
    const taskElement = document.getElementById(taskId);
    const targetQuadrant = event.target.closest('.quadrant'); // Get the target quadrant

    if (targetQuadrant) {
        // Append task to the target quadrant
        targetQuadrant.querySelector('.tasks').appendChild(taskElement);
        
        // Remove task from the original quadrant
        const originalQuadrant = document.querySelector(`#tasks-${taskElement.dataset.quadrant}`);
        if (originalQuadrant) {
            taskElement.remove();
        }
        
        // Update the quadrant data attribute
        taskElement.dataset.quadrant = targetQuadrant.id.split('-')[1];
    }
}

function addTasks() {
    const taskInput = document.getElementById("taskInput").value;
    const dueDate = document.getElementById("dueDate").value;

    if (taskInput.trim() === "") {
        alert("Please enter a task.");
        return;
    }

    const taskId = `task-${Date.now()}`; // Generate a unique ID
    const taskElement = document.createElement("div");
    taskElement.id = taskId;
    taskElement.className = "task";
    taskElement.draggable = true; // Make it draggable
    taskElement.dataset.quadrant = "urgent-important"; // Set initial quadrant
    taskElement.ondragstart = (event) => event.dataTransfer.setData("text", taskId);

    taskElement.innerHTML = `
        <span>${taskInput} (Due: ${dueDate})</span>
        <input type="checkbox" onchange="markAsCompleted(this)">
        <button onclick="deleteTask('${taskId}')">Delete</button>
    `;

    // Append task to the urgent-important quadrant
    document.querySelector("#urgent-important .tasks").appendChild(taskElement);
    document.getElementById("taskInput").value = ""; // Clear input
    document.getElementById("dueDate").value = ""; // Clear date input
}

function markAsCompleted(checkbox) {
    const task = checkbox.parentElement;
    const taskInputs = task.querySelectorAll('input[type="text"], input[type="datetime-local"]'); // タスク名と期限にだけ傍線を追加
    if (checkbox.checked) {
        taskInputs.forEach(input => input.style.textDecoration = "line-through");
        task.style.color = "gray"; // タスク全体の色を暗くする
    } else {
        taskInputs.forEach(input => input.style.textDecoration = "none");
        task.style.color = "black"; // 元の色に戻す
    }
    updateProgress(); // 更新
}


function deleteCompletedTasks() {
    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        const checkbox = task.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            task.remove(); // Remove completed task
        }
    });
    updateAchievementBar(); // Update achievement bar after deletion
}

function deleteTask(taskId) {
    const taskElement = document.getElementById(taskId);
    if (taskElement && !taskElement.id.startsWith('task-default-')) {
        taskElement.remove(); // Delete task
        updateAchievementBar(); // Update achievement bar after deletion
    } else if (taskElement) {
        alert("このタスクは削除できません。");
    }
}

// Default tasks array
const defaultTasks = [
    { id: "task-default-1", text: "Prepare presentation", dueDate: "2024-10-10", quadrant: "urgent-important" },
    { id: "task-default-2", text: "Read a book", dueDate: "2024-10-15", quadrant: "not-urgent-important" },
    { id: "task-default-3", text: "Respond to emails", dueDate: "2024-10-05", quadrant: "urgent-not-important" },
    { id: "task-default-4", text: "Watch a movie", dueDate: "2024-10-20", quadrant: "not-urgent-not-important" }
];

function loadDefaultTasks() {
    defaultTasks.forEach(task => {
        addTaskToQuadrant(task.id, task.text, task.dueDate, task.quadrant);
    });
    updateProgressBar(); // Update progress bar after loading
}

// Function to add task to a quadrant
function addTaskToQuadrant(id, text, dueDate, quadrantId) {
    const taskElement = document.createElement("div");
    taskElement.id = id;
    taskElement.className = "task";
    taskElement.draggable = true;
    taskElement.dataset.quadrant = quadrantId; // Set quadrant
    taskElement.ondragstart = (event) => event.dataTransfer.setData("text", id);

    taskElement.innerHTML = `
        <input type="text" value="${text}" onchange="updateTask('${id}', this.value)">
        <input type="datetime-local" value="${dueDate}" onchange="updateDueDate('${id}', this.value)">
        <input type="checkbox" onchange="markAsCompleted(this)">
        <button onclick="deleteTask('${id}')">Delete</button>
    `;

    document.getElementById(`tasks-${quadrantId}`).appendChild(taskElement);
}

// Functions to update task text and due date
function updateTask(id, newText) {
    const taskElement = document.getElementById(id);
    const textInput = taskElement.querySelector('input[type="text"]');
    textInput.value = newText;
}

function updateDueDate(id, newDate) {
    const taskElement = document.getElementById(id);
    const dateInput = taskElement.querySelector('input[type="datetime-local"]');
    dateInput.value = newDate;
}

// Function to update progress bar
function updateProgressBar() {
    const tasks = document.querySelectorAll('.task');
    const completedTasks = document.querySelectorAll('.task input[type="checkbox"]:checked');
    
    const totalTasks = tasks.length;
    const completedCount = completedTasks.length;

    // Calculate progress
    const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressBar.value = progress;
    progressText.textContent = Math.round(progress) + '%';
}

// Function to update achievement bar
function updateAchievementBar() {
    const allTasks = document.querySelectorAll('.task');
    const completedTasks = document.querySelectorAll('.task input[type="checkbox"]:checked');
    const currentDate = new Date();

    let totalTasks = 0;
    let completedOnTime = 0;

    allTasks.forEach(task => {
        totalTasks++;
        const dateInput = task.querySelector('input[type="datetime-local"]');
        const dueDate = new Date(dateInput.value);

        if (task.querySelector('input[type="checkbox"]').checked && dueDate >= currentDate) {
            completedOnTime++;
        }
    });

    const achievementRate = totalTasks > 0 ? (completedOnTime / totalTasks) * 100 : 0;

    // Update achievement bar
    const achievementBar = document.getElementById('achievementBar');
    const achievementText = document.getElementById('achievementText');
    
    achievementBar.value = achievementRate;
    achievementText.textContent = Math.round(achievementRate) + '%';

    // Change color of achievement bar if over 50%
    achievementBar.style.backgroundColor = achievementRate > 50 ? 'green' : 'red'; // Green if > 50, red otherwise
}

// Initialize tasks
loadDefaultTasks();

