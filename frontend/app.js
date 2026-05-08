const API_BASE = 'http://localhost:5000/api/v1';
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user'));

document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showDashboard();
        loadTasks();
    } else {
        showAuth();
    }

    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', login);
    document.getElementById('registerForm').addEventListener('submit', register);
    document.getElementById('showRegister').addEventListener('click', () => {
        document.getElementById('auth').style.display = 'none';
        document.getElementById('register').style.display = 'block';
    });
    document.getElementById('showLogin').addEventListener('click', () => {
        document.getElementById('register').style.display = 'none';
        document.getElementById('auth').style.display = 'block';
    });

    // Dashboard
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('taskForm').addEventListener('submit', addTask);
});

async function login(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            token = data.token;
            user = data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            showDashboard();
            loadTasks();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

async function register(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            alert('Registration successful! Please login.');
            document.getElementById('register').style.display = 'none';
            document.getElementById('auth').style.display = 'block';
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function logout() {
    token = null;
    user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuth();
}

function showAuth() {
    document.getElementById('auth').style.display = 'block';
    document.getElementById('register').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('register').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('userInfo').textContent = user.username + ' (' + user.role + ')';
}

async function loadTasks() {
    try {
        const res = await fetch(`${API_BASE}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasks = await res.json();
        if (res.ok) {
            displayTasks(tasks);
        } else {
            alert('Failed to load tasks');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        const titleEl = document.createElement('strong');
        titleEl.textContent = task.title;

        const descEl = document.createElement('p');
        descEl.textContent = task.description || '';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editTask(task.id, task.title, task.description || ''));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        li.appendChild(titleEl);
        li.appendChild(descEl);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

async function addTask(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;

    try {
        const res = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description })
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById('taskForm').reset();
            loadTasks();
        } else {
            alert(data.error || 'Failed to add task');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

async function editTask(id, currentTitle, currentDesc) {
    const newTitle = prompt('Edit title:', currentTitle);
    if (newTitle === null) return;
    const newDesc = prompt('Edit description:', currentDesc);

    try {
        const res = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: newTitle, description: newDesc })
        });
        const data = await res.json();
        if (res.ok) {
            loadTasks();
        } else {
            alert(data.error || 'Failed to update task');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const res = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            loadTasks();
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to delete task');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}