import authService from "../services/AuthService.js";
import examService from "../services/ExamService.js";
import { AnalyticsView } from "../views/AnalyticsView.js";


class AnalyticsController {
    constructor() {
        // Check authentication and redirect if not authorized
        this.currentUser = authService.checkAuth('student');
        if (!this.currentUser) return;

        // Initialize view and load user data
        this.view = new AnalyticsView();
        this.profile = authService.getUserProfile(this.currentUser.id);
        this.results = examService.getStudentResults(this.currentUser.id);
        this.completedExams = this.profile.completedExams || [];

        // Display analytics and bind event handlers
        this.displayAnalytics();
        this.view.bindBackToProfile(this.handleBackToProfile.bind(this));
    }

    displayAnalytics() {
        // Render main analytics content
        this.view.renderAnalytics(this.profile, this.completedExams, this.results);
        // Render performance line chart
        this.view.renderLineChart(this.completedExams);
        // Render difficulty distribution pie chart
        this.renderPieChart();
    }

    renderPieChart() {
        const difficulties = { easy: 0, medium: 0, hard: 0 };
        let totalQuestions = 0;

        // Count questions by difficulty across all exam results
        this.results.forEach(result => {
            const exam = examService.getExamById(result.examId);
            if (exam && exam.questions) {
                exam.questions.forEach(q => {
                    const diff = q.difficulty || 'medium';
                    difficulties[diff]++;
                    totalQuestions++;
                });
            }
        });

        // Render the pie chart with difficulty data
        this.view.renderPieChart(difficulties, totalQuestions);
    }

    handleBackToProfile() {
        window.location.href = 'student-profile.html';
    }
}

new AnalyticsController();
