import authService from '../services/AuthService.js';
import { LoginView } from '../views/LoginView.js';


class LoginController {
  
  constructor() {
    // Initialize view and services
    this.view = new LoginView();
    this.authService = authService;
    this.authService.initDB();

    // Bind event handlers
    this.view.bindLogin(this.handleLogin.bind(this));
    this.view.bindRoleSelection();
  }

  
  handleLogin(username, password, role) {
    // Validate required fields
    if (!username || !password) {
      this.view.showError('Please fill in all fields');
      return;
    }

    // Attempt authentication
    const user = this.authService.login(username, password);

    // Check authentication success and role match
    if (user && user.role === role) {
      this.view.hideError();
      this.view.redirect(user.role);
    } else {
      this.view.showError('Invalid username or password for the selected role');
    }
  }
}

new LoginController();
