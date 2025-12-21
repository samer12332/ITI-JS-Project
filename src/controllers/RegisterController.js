import authService from '../services/AuthService.js';
import { RegisterView } from '../views/RegisterView.js';

class RegisterController {
    constructor() {
        this.view = new RegisterView();
        this.authService = authService;
        this.authService.initDB();
        this.view.bindRegister(this.handleRegister.bind(this));
        this.view.bindProfilePicturePreview();
    }

    handleRegister(formData) {
        const result = this.authService.register(formData);

        if (result.success) {
            this.view.showSuccess('Account created successfully! Redirecting...');
            this.view.redirect('login.html');
        } else {
            this.view.showError(result.message);
        }
    }
}

new RegisterController();
