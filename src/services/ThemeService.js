const themes = {
    // Default cosmic purple-blue theme
    default: {
        '--color-primary-start': '#8b5cf6',
        '--color-primary-end': '#3b82f6',
        '--color-accent-start': '#ff7a59',
        '--color-accent-end': '#ff5a2a',
        '--color-bubble-purple': 'rgba(139, 92, 246, 0.4)',
        '--color-bubble-blue': 'rgba(59, 130, 246, 0.4)',
        '--color-bubble-pink': 'rgba(236, 72, 153, 0.4)',
        '--color-bubble-orange': 'rgba(255, 122, 89, 0.4)'
    },

    // Cosmic pink-purple theme
    cosmic: {
        '--color-primary-start': '#ec4899',
        '--color-primary-end': '#8b5cf6',
        '--color-accent-start': '#ff7a59',
        '--color-accent-end': '#ff5a2a',
        '--color-bubble-purple': 'rgba(139, 92, 246, 0.4)',
        '--color-bubble-blue': 'rgba(59, 130, 246, 0.4)',
        '--color-bubble-pink': 'rgba(236, 72, 153, 0.4)',
        '--color-bubble-orange': 'rgba(255, 122, 89, 0.4)'
    },

    // Ocean blue theme
    ocean: {
        '--color-primary-start': '#06b6d4',
        '--color-primary-end': '#3b82f6',
        '--color-accent-start': '#06b6d4',
        '--color-accent-end': '#3b82f6',
        '--color-bubble-purple': 'rgba(6, 182, 212, 0.4)',
        '--color-bubble-blue': 'rgba(59, 130, 246, 0.4)',
        '--color-bubble-pink': 'rgba(6, 182, 212, 0.4)',
        '--color-bubble-orange': 'rgba(59, 130, 246, 0.4)'
    },

    // Sunset orange-red theme
    sunset: {
        '--color-primary-start': '#f59e0b',
        '--color-primary-end': '#ef4444',
        '--color-accent-start': '#f59e0b',
        '--color-accent-end': '#ef4444',
        '--color-bubble-purple': 'rgba(245, 158, 11, 0.4)',
        '--color-bubble-blue': 'rgba(239, 68, 68, 0.4)',
        '--color-bubble-pink': 'rgba(245, 158, 11, 0.4)',
        '--color-bubble-orange': 'rgba(239, 68, 68, 0.4)'
    }
};

class ThemeService {
    constructor() {
        // Singleton pattern implementation
        if (ThemeService.instance) {
            return ThemeService.instance;
        }
        ThemeService.instance = this;
    }


    applyTheme(themeName) {
        const themeVariables = themes[themeName];
        if (themeVariables) {
            // Apply each CSS custom property
            Object.keys(themeVariables).forEach(varName => {
                document.documentElement.style.setProperty(varName, themeVariables[varName]);
            });
            // Save theme preference to localStorage
            localStorage.setItem('selectedTheme', themeName);
        }
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('selectedTheme') || 'default';
        this.applyTheme(savedTheme);
        return savedTheme;
    }
}

// Create and export singleton instance
const themeService = new ThemeService();
export default themeService;
