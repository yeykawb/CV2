// Theme Toggle
const themeToggleButton = document.getElementById('theme-toggle-button');
const body = document.body;

function setTheme(theme) {
    if (theme === 'light') {
        body.classList.add('light-mode');
        themeToggleButton.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggleButton.setAttribute('title', 'Switch to dark mode');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.remove('light-mode');
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggleButton.setAttribute('title', 'Switch to light mode');
        localStorage.setItem('theme', 'dark');
    }
}

themeToggleButton.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// Initialize theme on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
});
