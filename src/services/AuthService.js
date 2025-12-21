import { Student } from "../models/Student.js";
import { Teacher } from "../models/Teacher.js";

class AuthService {
    constructor() {
        if (AuthService.instance) {
            return AuthService.instance;
        }
        AuthService.instance = this;
    }
    // Private Methods
    _getAll() {
        const data = JSON.parse(localStorage.getItem("quizverse_users")) || [];
        return data.map(u => {
            if (u.role === 'student') {
                return new Student(
                    u.username,
                    u.password,
                    u.grade,
                    u.mobile,
                    u.profilePicture,
                    u.id,
                    u.completedExams,
                    u.requiredExams,
                    u.theme
                );
            } else {
                return new Teacher(
                    u.username,
                    u.password,
                    u.mobile,
                    u.profilePicture,
                    u.examsCreated || [],
                    u.id,
                    u.theme || "default"
                );
            }
        });
    }

    _saveAll(users) {
        localStorage.setItem("quizverse_users", JSON.stringify(users));
    }

    _findByUsername(username) {
        return this._getAll().find(u => u.username === username);
    }

    _findById(id) {
        return this._getAll().find(u => u.id === id);
    }
    // Public Methods
    initDB() {
        if (!localStorage.getItem("quizverse_users")) {
            const defaultUsers = [
                new Student("student1", "password123", "2", "+201017306593", null, 1), // default student
                new Teacher("teacher1", "password123", null, null, [], 2)  // default teacher
            ];
            this._saveAll(defaultUsers);
        }

        if (!localStorage.getItem("quizverse_exams")) {
            localStorage.setItem("quizverse_exams", JSON.stringify([]));
        }

        if (!localStorage.getItem("quizverse_results")) {
            localStorage.setItem("quizverse_results", JSON.stringify([]));
        }
    }

    login(username, password) {
        const user = this._findByUsername(username);
        if (user && user.checkPassword(password)) {
            localStorage.setItem("quizverse_current_user", JSON.stringify({ id: user.id, role: user.role }));
            return user;
        }
        return null;
    }

    logout() {
        localStorage.removeItem("quizverse_current_user");
        window.location.href = "login.html";
    }

    getCurrentUser() {
        const userData = localStorage.getItem("quizverse_current_user");
        return userData ? this._findById(JSON.parse(userData).id) : null;
    }

    checkAuth(requiredRole = null) {
        const user = this.getCurrentUser();
        if (!user || (requiredRole && user.role !== requiredRole)) {
            window.location.href = "login.html";
            return false;
        }
        return user;
    }

    updateUserProfile(userId, updates) {
        const users = this._getAll();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
            Object.assign(users[userIndex], updates);
            this._saveAll(users);
            return true;
        }
        return false;
    }

    getUserProfile(userId) {
        return this._findById(userId);
    }

    register(formData) {
        if (this._findByUsername(formData.username)) {
            return { success: false, message: "Username already exists" };
        }

        if (formData.password.length < 6) {
            return { success: false, message: "password can't be less than 6 characters" };
        }

        let newUser;
        if (formData.role === 'teacher') {
            newUser = new Teacher(
                formData.username,
                formData.password,
                formData.mobile || null,
                formData.profilePicture ? `../images/${formData.profilePicture.name}` : null,
                [],
            );
        } else {
            newUser = new Student(
                formData.username,
                formData.password,
                formData.grade || null,
                formData.mobile || null,
                formData.profilePicture ? `../images/${formData.profilePicture.name}` : null,
            );
        }

        const users = this._getAll();
        newUser.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        users.push(newUser);
        this._saveAll(users);

        return { success: true };
    }

    getAllStudents() {
        return this._getAll().filter(u => u.role === 'student');
    }
}

const authService = new AuthService();
export default authService;