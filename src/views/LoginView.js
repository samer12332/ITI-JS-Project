export class LoginView {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.errorMessage = document.getElementById('errorMessage');
        this.roleOptions = document.querySelectorAll('.role-option');
    }
    // login form
    bindLogin(handler) {
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = this.usernameInput.value;
            const password = this.passwordInput.value;
            const selectedRole = this.getSelectedRole();
            handler(username, password, selectedRole);
        });
    }
    // role selection
    bindRoleSelection() {
        this.roleOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.roleOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });
    }
    
    getSelectedRole() {
        const activeOption = document.querySelector('.role-option.active');
        return activeOption ? activeOption.dataset.role : 'student';
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }
    // redirect based on role
    redirect(role) {
        if (role === 'student') {
            window.location.href = './student-profile.html';
        } else {
            window.location.href = './teacher-dashboard.html';
        }
    }
}
