const habits = document.querySelectorAll('.habit-btn');
const themebtn = document.querySelector('#theme');
const modelContainer = document.querySelector('.model-container');
const createHabitBtn = document.querySelector('.newhabit-add');
const newHabitTitle = document.querySelector('#title');
const habitContainer = document.querySelector('.habit-container');
const icons = document.querySelectorAll('.icon');
const addBtn = document.querySelector('#add');
const cancelBtn = document.querySelector('#cancel');
const deleteBtn = document.querySelector('#delete');
const contextMenu = document.querySelector('.context-menu');
const counterHabit = document.querySelector('.counterhabit');
let habitToBeDeleted;

const clock = document.getElementById('clock');

setInterval(function() {
    let date = new Date();
    clock.innerHTML = date.toLocaleTimeString();
}, 1000);

const habitChart = document.getElementById('habitChart').getContext('2d');
let chart = new Chart(habitChart, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Time Spent on Habits (minutes)',
            data: [],
            backgroundColor: 'rgba(0, 99, 132, 0.6)',
            borderColor: 'rgba(0, 99, 132, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// functions
const storage = {
    saveTheme(theme) {
        localStorage.setItem('theme', theme);
    },
    checkTheme() {
        return localStorage.getItem('theme') || 'light';
    },
    saveHabits(habits) {
        localStorage.setItem('habits', JSON.stringify(habits));
    },
    getHabits() {
        return JSON.parse(localStorage.getItem('habits')) || [];
    },
    habitStatus(id) {
        const currentHabits = storage.getHabits();
        currentHabits.forEach(habit => {
            if (habit.id !== Number(id)) return;
            habit.completed = !habit.completed;
        });
        storage.saveHabits(currentHabits);
    },
    deleteHabit(id) {
        const currentHabits = storage.getHabits();
        const updatedHabits = currentHabits.filter(habit => habit.id !== Number(id));
        storage.saveHabits(updatedHabits);
    }
};

const ui = {
    applyTheme(theme) {
        document.body.classList.toggle('dark-theme', theme === 'dark');
    },
    refreshHabits() {
        const habits = storage.getHabits();
        habitContainer.innerHTML = '';
        habits.forEach(habit => {
            ui.addNewHabit(habit.title, habit.icon, habit.id, habit.completed);
        });
        ui.updateCounter();
        ui.updateChart();
    },
    addNewHabit(title, icon, id, completed) {
        const habitDiv = document.createElement('div');
        habitDiv.classList.add('habit');
        habitDiv.innerHTML = `
            <button class="habit-btn ${completed ? 'completed' : ''}" data-id="${id}" data-title="${title}">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">${icon}</svg>
            </button>`;
        habitContainer.appendChild(habitDiv);
        ui.updateCounter();
        ui.updateChart();
    },
    openModal() {
        modelContainer.classList.add('active');
        modelContainer.setAttribute('aria-hidden', 'false');
        newHabitTitle.focus();
    },
    closeModal() {
        modelContainer.classList.remove('active');
        modelContainer.setAttribute('aria-hidden', 'true');
        newHabitTitle.value = '';
        icons.forEach(icon => icon.classList.remove('selected'));
    },
    deleteHabit(id) {
        const habitToDeleted = document.querySelector(`[data-id="${id}"]`);
        habitToDeleted.remove();
        ui.refreshHabits();
    },
    updateCounter() {
        const habits = storage.getHabits();
        const inProgress = habits.filter(habit => !habit.completed);
        counterHabit.innerHTML = `
            <h2>In Progress (${inProgress.length})</h2>
            <ul>
                ${inProgress.map(habit => `<li>${habit.title}</li>`).join('')}
            </ul>
        `;
    },
    updateChart() {
        const habits = storage.getHabits();
        const now = new Date();
        chart.data.labels = habits.map(habit => habit.title);
        chart.data.datasets[0].data = habits.map(habit => {
            const habitTime = new Date(habit.id);
            const diffMinutes = Math.floor((now - habitTime) / 60000);
            return diffMinutes;
        });
        chart.update();
    }
};

// eventlisteners
window.addEventListener('DOMContentLoaded', () => {
    const theme = storage.checkTheme();
    ui.applyTheme(theme);
    ui.refreshHabits();
});

themebtn.addEventListener('click', theme);

createHabitBtn.addEventListener('click', ui.openModal);

cancelBtn.addEventListener('click', ui.closeModal);

icons.forEach(icon => {
    icon.addEventListener('click', () => {
        icons.forEach(icon => icon.classList.remove('selected'));
        icon.classList.add('selected');
    });
});

addBtn.addEventListener('click', () => {
    const habitTitle = newHabitTitle.value;
    let habitIcon;
    icons.forEach(icon => {
        if (!icon.classList.contains('selected')) return;
        habitIcon = icon.querySelector('svg').innerHTML;
    });
    const habitId = Date.now(); 
    const habit = {
        title: habitTitle,
        icon: habitIcon,
        id: habitId,
        completed: false,
    };
    storage.saveHabits([...storage.getHabits(), habit]);
    ui.addNewHabit(habitTitle, habitIcon, habitId, false);
    ui.closeModal();
});

habitContainer.addEventListener('click', e => {
    if (!e.target.closest('.habit-btn')) return;
    const habitBtn = e.target.closest('.habit-btn');
    habitBtn.classList.toggle('completed');
    storage.habitStatus(habitBtn.dataset.id);
    ui.updateCounter();
    ui.updateChart();
});

habitContainer.addEventListener('contextmenu', e => {
    if (!e.target.closest('.habit-btn')) return;
    e.preventDefault();
    habitToBeDeleted = e.target.closest('.habit-btn').dataset.id;
    const { clientX: mouseX, clientY: mouseY } = e;
    contextMenu.style.top = `${mouseY}px`;
    contextMenu.style.left = `${mouseX}px`;
    const contextTitle = document.querySelector('#habitTitle');
    contextTitle.textContent = e.target.closest('.habit-btn').dataset.title;
    contextMenu.classList.add('active');
});

document.addEventListener('click', e => {
    if (!e.target.closest('.context-menu') && contextMenu.classList.contains('active')) {
        contextMenu.classList.remove('active');
    }
});

deleteBtn.addEventListener('click', () => {
    storage.deleteHabit(habitToBeDeleted);
    ui.deleteHabit(habitToBeDeleted);
    contextMenu.classList.remove('active');
});

// theme function
function theme() {
    // toggle 'dark' class on body
    document.body.classList.toggle('dark-theme');

    // toggle 'dark' and 'active' classes on theme button
    themebtn.classList.toggle('dark');
    themebtn.classList.toggle('active');

    // set background color based on theme
    if (document.body.classList.contains('dark-theme')) {
        document.body.style.backgroundColor = 'black';
        document.body.style.color = 'white';
    } else {
        document.body.style.backgroundColor = 'Beige';
    }

    // save theme preference to local storage
    storage.saveTheme(document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// function to apply theme from local storage
function applyThemeFromStorage() {
    const theme = storage.checkTheme();
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.style.backgroundColor = 'Beige';
        themebtn.classList.add('dark');
        themebtn.classList.add('active');
    }
}
window.addEventListener('DOMContentLoaded', applyThemeFromStorage);
