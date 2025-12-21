import authService from './services/AuthService.js';

class MainController {
    constructor() {
        authService.initDB();
    }
}

new MainController();
