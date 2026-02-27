// Theme Toggle
const themeToggleButton = document.getElementById('theme-toggle-button');
const darkModeStylesheet = document.getElementById('dark-mode-stylesheet');
const htmlElement = document.documentElement;

function setTheme(theme) {
    if (theme === 'dark') {
        darkModeStylesheet.disabled = false;
        htmlElement.setAttribute('data-theme', 'dark');
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        darkModeStylesheet.disabled = true;
        htmlElement.setAttribute('data-theme', 'light');
        themeToggleButton.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
}

themeToggleButton.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// Initialize theme on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
});
