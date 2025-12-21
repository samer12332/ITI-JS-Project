import authService from "../services/AuthService.js";
import examService from "../services/ExamService.js";
import { ExamResultView } from "../views/ExamResultView.js";

class ExamResultController {
    constructor() {
        // Check authentication and redirect if not authorized
        this.currentUser = authService.checkAuth('student');
        if (!this.currentUser) return;

        // Get exam ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.examId = urlParams.get('examId');
        if (!this.examId) {
            alert('No exam specified');
            window.location.href = 'student-profile.html';
            return;
        }

        // Retrieve exam and result data
        this.exam = examService.getExamById(this.examId);
        this.result = examService.getExamResult(this.examId, this.currentUser.id);

        // Validate data existence
        if (!this.exam || !this.result) {
            alert('Results not found');
            window.location.href = 'student-profile.html';
            return;
        }

        // Initialize view and display results
        this.view = new ExamResultView();
        this.displayResults();

        // Bind event handlers
        this.view.bindBackToProfile(this.handleBackToProfile.bind(this));
        this.view.bindViewAnalytics(this.handleViewAnalytics.bind(this));
    }

   
    displayResults() {
        // Render main results content
        this.view.renderResults(this.result, this.exam);
        // Calculate and render difficulty breakdown
        const difficulties = this.calculateDifficultyBreakdown();
        this.view.renderDifficultyBreakdown(difficulties);
        // Render performance chart
        this.view.renderPerformanceChart(difficulties);
    }

   
    calculateDifficultyBreakdown() {
        const difficulties = {
            easy: { total: 0, correct: 0 },
            medium: { total: 0, correct: 0 },
            hard: { total: 0, correct: 0 }
        };

        // Count questions and correct answers by difficulty
        this.exam.questions.forEach((question, idx) => {
            const difficulty = question.difficulty || 'medium';
            difficulties[difficulty].total++;
            if (this.result.answers && this.result.answers[idx] && this.result.answers[idx].isCorrect) {
                difficulties[difficulty].correct++;
            }
        });

        return difficulties;
    }

   
    handleBackToProfile() {
        window.location.href = 'student-profile.html';
    }

    
    handleViewAnalytics() {
        window.location.href = `analytics.html?studentId=${this.currentUser.id}`;
    }
}

// Initialize the exam result controller
new ExamResultController();
