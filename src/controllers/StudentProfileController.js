import authService from "../services/AuthService.js";
import examService from "../services/ExamService.js";
import themeService from "../services/ThemeService.js";
import { StudentProfileView } from "../views/StudentProfileView.js";

class StudentProfileController {
    constructor() {
        // Check authentication and redirect if not authorized
        this.currentUser = authService.checkAuth('student');
        if (!this.currentUser) return;

        // Initialize view and services
        this.view = new StudentProfileView();
        this.authService = authService;
        this.examService = examService;
        this.themeService = themeService;

        // Bind event handlers
        this.view.bindThemeChange(this.handleThemeChange.bind(this));
        this.view.bindToggleDarkMode(this.handleToggleDarkMode.bind(this));
        this.view.bindLogout(this.handleLogout.bind(this));

        // Load profile data and set active theme
        this.loadProfile();
        const savedTheme = this.themeService.loadSavedTheme();
        this.view.setActiveTheme(savedTheme);
    }

    async loadProfile() {
        const profile = this.authService.getUserProfile(this.currentUser.id);
        if (profile) {
            this.currentUser = profile;

            // Get exam details with additional information
            const requiredExams = this.getRequiredExamsWithDetails(profile);
            const completedExams = this.getCompletedExamsWithDetails(profile);

            // Render profile and exam lists
            this.view.renderProfile(profile);
            this.view.renderRequiredExams(requiredExams, this.handleStartExam.bind(this));
            this.view.renderCompletedExams(completedExams, this.handleViewExamResult.bind(this));
        }
    }

    getRequiredExamsWithDetails(profile) {
        const requiredExams = [];

        if (profile.requiredExams && Array.isArray(profile.requiredExams)) {
            profile.requiredExams.forEach(examRef => {
                if (typeof examRef === 'object' && examRef !== null && examRef.id) {
                    // Exam reference is an object with details
                    requiredExams.push({
                        id: examRef.id,
                        name: examRef.name || `Exam ${examRef.id}`,
                        duration: examRef.duration || 30,
                        questionCount: examRef.questionCount || examRef.questions?.length || 10
                    });
                } else if (typeof examRef === 'number' || typeof examRef === 'string') {
                    // Exam reference is an ID, fetch full exam data
                    const exam = this.examService.getExamById(examRef);
                    if (exam) {
                        requiredExams.push({
                            id: exam.id,
                            name: exam.name || `Exam ${exam.id}`,
                            duration: exam.duration || 30,
                            questionCount: exam.questionCount || exam.questions?.length || 10
                        });
                    }
                }
            });
        }

        return requiredExams;
    }

    
    getCompletedExamsWithDetails(profile) {
        const completedExams = [];

        if (profile.completedExams && Array.isArray(profile.completedExams)) {
            profile.completedExams.forEach(examRef => {
                if (typeof examRef === 'object' && examRef !== null && examRef.id) {
                    // Exam reference is an object with results
                    completedExams.push({
                        id: examRef.id,
                        name: examRef.name || `Exam ${examRef.id}`,
                        score: examRef.score || 0,
                        completedDate: examRef.completedDate || new Date().toISOString(),
                        earnedPoints: examRef.earnedPoints,
                        totalPoints: examRef.totalPoints
                    });
                } else if (typeof examRef === 'number' || typeof examRef === 'string') {
                    // Exam reference is an ID, fetch result and exam data
                    const result = this.examService.getExamResult(examRef, profile.id);
                    const exam = this.examService.getExamById(examRef);

                    if (result && exam) {
                        // Both result and exam found
                        completedExams.push({
                            id: exam.id,
                            name: exam.name || `Exam ${exam.id}`,
                            score: result.score || 0,
                            completedDate: result.completedDate || new Date().toISOString(),
                            earnedPoints: result.earnedPoints,
                            totalPoints: result.totalPoints
                        });
                    } else if (exam) {
                        // Only exam found, no result data
                        completedExams.push({
                            id: exam.id,
                            name: exam.name || `Exam ${exam.id}`,
                            score: 0,
                            completedDate: new Date().toISOString(),
                            earnedPoints: 0,
                            totalPoints: 0
                        });
                    }
                }
            });
        }

        return completedExams;
    }

    
    handleThemeChange(theme) {
        this.themeService.applyTheme(theme);
        this.authService.updateUserProfile(this.currentUser.id, { theme });
    }

    handleToggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        this.view.setDarkMode(isDark);
    }


    handleLogout() {
        this.authService.logout();
    }

    
    handleStartExam(examId) {
        window.location.href = `exam-taking.html?examId=${examId}`;
    }

    handleViewExamResult(examId) {
        window.location.href = `exam-result.html?examId=${examId}`;
    }
}

// Initialize the student profile controller
new StudentProfileController();
