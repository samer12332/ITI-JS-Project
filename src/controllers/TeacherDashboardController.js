import authService from "../services/AuthService.js";
import examService from "../services/ExamService.js";
import { DashboardView as TeacherDashboardView } from "../views/TeacherDashboardView.js";
import { StudentProfileView } from "../views/StudentProfileView.js";

class TeacherDashboardController {

    constructor() {
        // Check authentication and redirect if not authorized
        this.currentUser = authService.getCurrentUser();
        if (!this.currentUser || this.currentUser.role !== 'teacher') {
            window.location.href = 'login.html';
            return;
        }

        // Initialize view and services
        this.view = new TeacherDashboardView();
        this.examService = examService;
        this.currentQuestions = [];
        this.editingExam = null; // holds exam object when editing

        // Start initialization
        this.init();
    }


    init() {
        // Bind all event handlers
        this.view.bindSwitchTab(this.handleSwitchTab.bind(this));
        this.view.bindGenerateQuestions(this.handleGenerateQuestions.bind(this));
        this.view.bindCreateExam(this.handleCreateExam.bind(this));
        this.view.bindAssignExam(this.handleAssignExam.bind(this));
        this.view.bindLoadExamResults(this.handleLoadExamResults.bind(this));
        this.view.bindToggleDarkMode(this.handleToggleDarkMode.bind(this));
        this.view.bindLogout(this.handleLogout.bind(this));
        this.view.bindCloseEditModal(this.handleCloseEditModal.bind(this));
        this.view.bindAddQuestion(this.handleAddQuestion.bind(this));
        this.view.bindViewExam(this.handleViewExam.bind(this));
        this.view.bindEditExam(this.handleEditExam.bind(this));
        this.view.bindDeleteExam(this.handleDeleteExam.bind(this));

        // Load saved theme preference
        const isDark = localStorage.getItem('darkMode') === 'true';
        this.view.setTheme(isDark);

        // Set teacher name in UI
        const teacherNameElement = document.getElementById('teacherName');
        if (teacherNameElement) {
            teacherNameElement.textContent = this.currentUser.username;
        }

        // Load manage tab by default
        this.handleSwitchTab('manage');
    }


    handleCloseEditModal() {
        this.view.closeEditModal();
    }


    handleSwitchTab(tab) {
        this.view.setActiveTab(tab);
        if (tab === 'manage') {
            this.loadExamsList();
        } else if (tab === 'assign') {
            this.loadAssignTab();
        } else if (tab === 'results') {
            this.loadResultsTab();
        }
    }


    handleGenerateQuestions(count) {
        if (!count || count < 3) {
            alert('Please enter at least 3 questions');
            return;
        }

        // Generate question templates
        this.currentQuestions = [];
        for (let i = 0; i < count; i++) {
            this.currentQuestions.push({
                questionText: '',
                image: null,        // will hold image path like "/images/xxx.png"
                imagePreview: null, // used only for preview (dataURL) — not persisted
                answers: ['', '', '', ''],
                correctAnswer: 0,
                difficulty: 'medium',
                points: Math.round(100 / count)
            });
        }

        // Render questions and update validation
        this.renderQuestions();
        this.updateScoreValidation();
    }


    renderQuestions() {
        this.view.renderQuestions(
            this.currentQuestions,
            this.handleUpdateQuestion.bind(this),
            this.handleUpdateQuestionAnswer.bind(this),
            this.handleUpdateQuestionImage.bind(this),
            this.handleDeleteQuestion.bind(this)
        );
    }


    handleAddQuestion() {
        const defaultQuestion = {
            questionText: '',
            image: null,        // persisted path
            imagePreview: null, // preview only
            answers: ['', '', '', ''],
            correctAnswer: 0,
            difficulty: 'medium',
            points: 0           // caller may want to recalc points or set default
        };

        this.currentQuestions.push(defaultQuestion);
        this.renderQuestions();
        this.updateScoreValidation();
    }


    handleUpdateQuestion(index, field, value) {
        // keep image path separate from preview
        if (field === 'image') {
            this.currentQuestions[index].image = value;
        } else {
            this.currentQuestions[index][field] = value;
        }
        if (field === 'points') {
            this.updateScoreValidation();
        }
    }


    handleUpdateQuestionAnswer(index, ansIndex, value) {
        this.currentQuestions[index].answers[ansIndex] = value;
    }


    handleUpdateQuestionImage(index, input) {
        const file = input.files && input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentQuestions[index].imagePreview = e.target.result;
            this.renderQuestions();
        };
        reader.readAsDataURL(file);
        const safeFileName = file.name.replace(/\s+/g, '_');
        const assumedPath = `/images/${safeFileName}`;
        this.currentQuestions[index].image = assumedPath;
    }


    handleDeleteQuestion(index) {
        if (confirm('Delete this question?')) {
            this.currentQuestions.splice(index, 1);
            this.renderQuestions();
            this.updateScoreValidation();
        }
    }


    updateScoreValidation() {
        const totalScore = this.currentQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
        this.view.updateScoreValidation(totalScore);
    }


    handleCreateExam(examName, duration) {
        // Validation checks
        if (this.currentQuestions.length < 3) {
            alert('Exam must have at least 3 questions');
            return;
        }
        const totalScore = this.currentQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
        if (totalScore !== 100) {
            alert('Total score must equal 100 points');
            return;
        }
        for (let q of this.currentQuestions) {
            if (!q.questionText || q.answers.some(a => !a)) {
                alert('Please fill in all questions and answers');
                return;
            }
        }

        if (!this.examService.validateExamScore(this.currentQuestions)) {
            alert('Total points must equal 100');
            return;
        }

        const parsedDuration = parseInt(duration);

        // Before saving, strip preview-only fields and ensure image is a path (or null)
        const sanitizedQuestions = this.currentQuestions.map(q => {
            return {
                ...q,
                image: q.image || null, // path only
                // remove preview field and any heavy data
                imagePreview: undefined
            };
        });

        // Create new exam or new version
        if (this.editingExam) {
            this.examService.createNewVersion(this.editingExam, {
                name: examName,
                duration: parsedDuration,
                questions: sanitizedQuestions
            });

            alert("New version created successfully!");
            this.editingExam = null;
        } else {
            this.examService.createExam({
                name: examName,
                duration: parsedDuration,
                questions: sanitizedQuestions,
                createdBy: this.currentUser.id
            });

            alert('Exam created successfully!');
        }

        // Reset form and UI
        const createForm = document.getElementById('createExamForm');
        if (createForm) createForm.reset();

        this.currentQuestions = [];
        if (this.view.questionsContainer) this.view.questionsContainer.innerHTML = '';
        if (this.view.scoreValidation) this.view.scoreValidation.style.display = 'none';

        const createBtn = document.getElementById("createExamBtn");
        if (createBtn) createBtn.textContent = "Create Exam";

        // Switch to manage tab
        this.handleSwitchTab('manage');
    }

    loadExamsList() {
        const exams = this.examService.getAllExams()
            .filter(e => e.createdBy === this.currentUser.id);

        const results = this.examService.getAllResults();

        const grouped = {};

        exams.forEach(exam => {
            const parentId = exam.parentId || exam.id;

            // Check if this version has results
            const hasResults = results.some(r => r.examId === exam.id);
            exam.hasResults = hasResults;

            if (!grouped[parentId]) grouped[parentId] = [];
            grouped[parentId].push(exam);
        });

        Object.values(grouped).forEach(group => {
            group.sort((a, b) => b.version - a.version);
        });

        this.view.renderVersionedExams(grouped);
    }


    handleViewExam(examId) {
        const exam = this.examService.getExamById(examId);
        if (!exam) return;

        const html = `
      <div class="modal-header">
        <h2>View Exam: ${exam.name}</h2>
        <button class="icon-btn" id="closeViewModal">✖</button>
      </div>

      <div class="exam-meta">
        <p><strong>Duration:</strong> ${exam.duration} minutes</p>
        <p><strong>Questions:</strong> ${exam.questionCount}</p>
        <p><strong>Created:</strong> ${new Date(exam.createdDate).toLocaleString()}</p>
        <p><strong>Version:</strong> v${exam.version} (${exam.isActive ? 'Active' : 'Archived'})</p>
      </div>

      ${exam.questions.map((q, i) => `
        <div class="view-question-item">
          <div class="view-question-header">
            <strong>Question ${i + 1}</strong>
            <span>${q.points} pts</span>
          </div>

          <div class="view-question-text">${q.questionText}</div>

          ${q.image ? `
            <div class="view-question-image">
              <img src="${q.image}" alt="Question Image">
            </div>
          ` : ''}

          <div class="view-answers">
            ${q.answers.map((ans, idx) => `
              <div class="view-answer ${idx == q.correctAnswer ? 'correct-answer' : ''}">
                <span>${ans}</span>
                ${idx == q.correctAnswer ? `<span class="correct-pill">Correct</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;

        this.view.openEditModal();
        this.view.editModalContent.innerHTML = html;

        const closeBtn = document.getElementById("closeViewModal");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                this.view.closeEditModal();
            });
        }
    }


    handleEditExam(examId) {
        const exam = this.examService.getExamById(examId);
        if (!exam) return;

        this.editingExam = exam;

        this.view.setActiveTab("create");

        const nameInput = document.getElementById("examName");
        const durationInput = document.getElementById("examDuration");

        if (nameInput) nameInput.value = exam.name;
        if (durationInput) durationInput.value = exam.duration;

        // copy questions and keep image paths; do not create previews from stored paths
        this.currentQuestions = exam.questions.map(q => ({
            ...q,
            imagePreview: null // no preview loaded from storage
        }));

        this.renderQuestions();
        this.updateScoreValidation();
        const createBtn = document.getElementById("createExamBtn");
        if (createBtn) createBtn.textContent = "Save Changes";

        alert(`Editing version v${exam.version} of this exam. Saving will create a new version.`);
    }


    handleDeleteExam(examId) {
        const result = this.examService.deleteExam(examId);

        if (!result.success && result.reason === "HAS_RESULTS") {
            alert("You cannot delete this exam version because students have already submitted answers for it.");
            return;
        }

        if (result.success) {
            alert("Exam version deleted successfully.");
            this.loadExamsList();

            // Re-fetch updated student profile
            const updatedUser = this.authService.getCurrentUser();
            const requiredExamsWithDetails = this.studentProfileController.getRequiredExamsWithDetails(updatedUser);

            // Render with fresh data
            StudentProfileView.renderStudentProfile(updatedUser, requiredExamsWithDetails);
        } else {
            alert("Failed to delete exam.");
        }
    }


    loadAssignTab() {
        const exams = this.examService.getAllExams()
            .filter(e => e.createdBy === this.currentUser.id && e.isActive)
            .map(exam => ({
                id: exam.id,
                name: `${exam.name} (v${exam.version})`
            }));

        const assignedExams = JSON.parse(localStorage.getItem("assignedExams")) || [];

        const students = this.examService.getAllStudents()
            .map(student => ({
                id: student.id,
                username: student.username,
                grade: student.grade || 'N/A',

                // Check if this exam is already assigned
                // guard against undefined requiredExams
                alreadyAssigned: Array.isArray(student.requiredExams) && this.examSelect
                    ? student.requiredExams.includes(Number.parseInt(this.examSelect.value || 0))
                    : false
            }));

        this.view.renderAssignTab(exams, students);
    }


    handleAssignExam(examId, studentIds) {
        if (!examId || studentIds.length === 0) {
            alert('Please select an exam and at least one student');
            return;
        }

        const students = this.examService.getAllStudents();

        // Check if any selected student already has this exam assigned, completed, or in progress
        const blockedStudents = studentIds.filter(id => {
            const student = students.find(s => s.id === id);
            if (!student) return false;

            const alreadyAssigned = Array.isArray(student.requiredExams) && student.requiredExams.some(e => e.id === examId);
            const alreadyCompleted = Array.isArray(student.completedExams) && student.completedExams.some(e => e.id === examId);
            const inProgress = Array.isArray(student.inProgressExams) && student.inProgressExams.some(e => e.id === examId);

            return alreadyAssigned || alreadyCompleted || inProgress;
        });

        if (blockedStudents.length > 0) {
            alert("Some selected students already solved or are still working on this exam.");
            return;
        }

        // Assign normally
        const success = this.examService.assignExamToStudents(examId, studentIds);

        if (success) {
            alert(`Exam assigned to ${studentIds.length} student(s) successfully!`);
            this.loadAssignTab();
        } else {
            alert('Failed to assign exam');
        }
    }


    loadResultsTab() {
        const exams = this.examService.getAllExams()
            .filter(e => e.createdBy === this.currentUser.id) // keep all versions
            .map(exam => ({
                id: exam.id,
                name: `${exam.name} (v${exam.version})`
            }));

        this.view.renderResultsTab(exams);
    }


    handleLoadExamResults(examId) {
        if (!examId) {
            if (this.view.resultsContainer) this.view.resultsContainer.innerHTML = '';
            return;
        }

        const results = this.examService.getExamResults(examId);
        const users = authService._getAll();

        // Calculate overall percent, totalPoints, earnedPoints
        const totalPoints = results.reduce((sum, r) => sum + r.totalPoints, 0);
        const earnedPoints = results.reduce((sum, r) => sum + r.earnedPoints, 0);

        const percent = totalPoints > 0
            ? Math.round((earnedPoints / totalPoints) * 100)
            : 0;

        this.view.renderExamResults(
            results.map(result => ({
                id: result.id,
                examId: result.examId,
                studentId: result.studentId,
                score: result.score,
                completedDate: result.completedDate,
                totalPoints: result.totalPoints,
                earnedPoints: result.earnedPoints
            })),
            users,
            percent,          //  send percent to view
            earnedPoints,     //  send earned points
            totalPoints,      //  send total points
            this.handleReviewAnswers.bind(this)
        );
    }


    handleReviewAnswers(resultId) {
        const results = this.examService.getAllResults();
        const result = results.find(r => r.id === Number.parseInt(resultId));
        if (!result) return;

        const exam = this.examService.getExamById(result.examId);
        if (!exam) return;

        const student = authService._getAll().find(u => u.id === result.studentId);

        const html = `
      <div class="modal-header">
        <h2>Review Answers — ${student?.username || "Unknown Student"}</h2>
        <button class="icon-btn" id="closeReviewModal">✖</button>
      </div>

      <div class="exam-meta">
        <p><strong>Exam:</strong> ${exam.name} (v${exam.version})</p>
        <p><strong>Score:</strong> ${result.score}%</p>
        <p><strong>Points:</strong> ${result.earnedPoints}/${result.totalPoints}</p>
        <p><strong>Completed:</strong> ${new Date(result.completedDate).toLocaleString()}</p>
      </div>

      ${exam.questions.map((q, i) => {
            const studentAnswer = result.answers[i];
            const isCorrect = studentAnswer?.isCorrect;

            return `
          <div class="review-question-item ${isCorrect ? 'correct' : 'incorrect'}">
            <div class="review-question-header">
              <strong>Question ${i + 1}</strong>
              <span>${q.points} pts</span>
            </div>

            <div class="review-question-text">${q.questionText}</div>

            ${q.image ? `
              <div class="review-question-image">
                <img src="${q.image}" alt="Question Image">
              </div>
            ` : ''}

            <div class="review-answers">
              ${q.answers.map((ans, idx) => {
                const isCorrectAnswer = idx === q.correctAnswer;
                const isStudentChoice = idx === parseInt(studentAnswer?.selectedOriginalIndex);

                return `
                  <div class="review-answer
                    ${isCorrectAnswer ? 'correct-answer' : ''}
                    ${isStudentChoice ? 'student-answer' : ''}">

                    <span>${ans}</span>

                    <span>
                      ${isCorrectAnswer ? `<span class="tag-correct">Correct</span>` : ''}
                      ${isStudentChoice && !isCorrectAnswer ? `<span class="tag-wrong">Chosen</span>` : ''}
                      ${isStudentChoice && isCorrectAnswer ? `<span class="tag-correct">Chosen</span>` : ''}
                    </span>
                  </div>
                `;
            }).join('')}
            </div>
          </div>
        `;
        }).join('')}
    `;

        this.view.openEditModal();
        this.view.editModalContent.innerHTML = html;

        const closeBtn = document.getElementById("closeReviewModal");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                this.view.closeEditModal();
            });
        }
    }


    handleToggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark);
        this.view.setTheme(isDark);
    }


    handleLogout() {
        if (authService.logout) {
            authService.logout();
        }
        window.location.href = 'login.html';
    }
}

// Initialize the teacher dashboard controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        new TeacherDashboardController();
    } catch (error) {
        console.error("Error initializing TeacherDashboardController:", error);
        alert('Error loading dashboard. Please check console for details.');
    }
});