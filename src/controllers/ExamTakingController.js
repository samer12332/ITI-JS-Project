import authService from "../services/AuthService.js";
import examService from "../services/ExamService.js";
import { ExamTakingView } from "../views/ExamTakingView.js";


class ExamTakingController {

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

        // Retrieve exam data
        this.exam = examService.getExamById(this.examId);
        if (!this.exam) {
            alert('Exam not found');
            window.location.href = 'student-profile.html';
            return;
        }

        // Initialize view
        this.view = new ExamTakingView();

        // Store original questions and their indices
        this.originalQuestions = this.exam.questions;

        // Prepare shuffled questions for display
        const preparedData = this.prepareQuestions(this.exam.questions);
        this.shuffledQuestions = preparedData.shuffledQuestions;
        this.questionMapping = preparedData.questionMapping; // Maps shuffled index -> original index

        // Initialize answer tracking and exam state
        this.userAnswers = new Array(this.originalQuestions.length).fill(undefined);
        this.currentQuestionIndex = 0;
        this.timeRemaining = this.exam.duration * 60;
        this.totalTime = this.exam.duration * 60;
        this.timerInterval = null;

        // Start the exam
        this.initExam();
        window.addEventListener("pagehide", () => {
            if (!this.hasSubmittedOnExit) {
                this.hasSubmittedOnExit = true;
                examService.submitExamResult(this.examId, this.currentUser.id, this.userAnswers, 0);
            }
        });
    }


    prepareQuestions(questions) {
        // Create array with original indices
        const questionsWithIndices = questions.map((q, originalIndex) => ({
            ...q,
            originalIndex
        }));

        // Shuffle questions
        const shuffledQuestions = examService.shuffleArray([...questionsWithIndices]);

        // Create mapping from shuffled index to original index
        const questionMapping = shuffledQuestions.map(q => q.originalIndex);

        // Prepare shuffled questions with shuffled answers
        const preparedQuestions = shuffledQuestions.map(q => {
            // Shuffle answers for this question
            const answersWithIndices = q.answers.map((ans, originalAnsIndex) => ({
                text: ans,
                originalIndex: originalAnsIndex,
                isCorrect: originalAnsIndex === q.correctAnswer
            }));

            const shuffledAnswers = examService.shuffleArray(answersWithIndices);
            const newCorrectIndex = shuffledAnswers.findIndex(a => a.isCorrect);

            return {
                ...q,
                answers: shuffledAnswers,
                correctAnswer: newCorrectIndex, // This is the shuffled correct index
                originalCorrectAnswer: q.correctAnswer // Keep the original correct index
            };
        });

        return {
            shuffledQuestions: preparedQuestions,
            questionMapping: questionMapping
        };
    }


    initExam() {
        console.log('Original questions:', this.originalQuestions);
        console.log('Shuffled questions:', this.shuffledQuestions);
        console.log('First question object:', this.shuffledQuestions[0]);

        // Render exam details and first question
        this.view.renderExamDetails(this.exam);
        this.renderCurrentQuestion();
        // Start the countdown timer
        this.startTimer();
    }


    renderCurrentQuestion() {
        const currentQuestion = this.shuffledQuestions[this.currentQuestionIndex];
        console.log('Rendering question:', currentQuestion);
        console.log('Question text property:', currentQuestion.question);

        // Render the question content
        this.view.renderQuestion(
            currentQuestion,
            this.currentQuestionIndex,
            this.shuffledQuestions.length,
            this.userAnswers[this.questionMapping[this.currentQuestionIndex]], // Get answer for original question
            this.handleSelectAnswer.bind(this)
        );

        // Update navigation state
        const originalQuestionIndex = this.questionMapping[this.currentQuestionIndex];
        const isAnswered = this.userAnswers[originalQuestionIndex] !== undefined;

        this.view.updateNavigation(
            this.currentQuestionIndex,
            this.shuffledQuestions.length,
            isAnswered,
            this.nextQuestion.bind(this),
            this.submitExam.bind(this)
        );

        // Render progress dots
        this.view.renderProgressDots(
            this.shuffledQuestions.length,
            this.currentQuestionIndex,
            this.shuffledQuestions.map((_, idx) =>
                this.userAnswers[this.questionMapping[idx]]
            ),
            this.jumpToQuestion.bind(this)
        );
    }


    handleSelectAnswer(shuffledAnswerIndex) {
        const currentQuestion = this.shuffledQuestions[this.currentQuestionIndex];
        const originalQuestionIndex = this.questionMapping[this.currentQuestionIndex];

        // Prevent changing already answered questions
        if (this.userAnswers[originalQuestionIndex] !== undefined) return;

        const selectedAnswer = currentQuestion.answers[shuffledAnswerIndex];

        // Store the ORIGINAL answer index (not shuffled)
        this.userAnswers[originalQuestionIndex] = selectedAnswer.originalIndex;

        // Play feedback sound
        this.view.playSound(selectedAnswer.isCorrect ? 'correct' : 'incorrect');
        // Re-render current question to show selection
        this.renderCurrentQuestion();
    }


    nextQuestion() {
        if (this.currentQuestionIndex < this.shuffledQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.renderCurrentQuestion();
        }
    }

    jumpToQuestion(index) {
        this.currentQuestionIndex = index;
        this.renderCurrentQuestion();
    }


    startTimer() {
        this.view.updateTimer(this.timeRemaining, this.totalTime);
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.view.updateTimer(this.timeRemaining, this.totalTime);
            if (this.timeRemaining <= 0) {
                this.autoSubmitExam();
            }
        }, 1000);
    }


    submitExam() {
        // Check for unanswered questions
        const unanswered = this.userAnswers.filter(ans => ans === undefined).length;
        if (unanswered > 0) {
            if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
                return;
            }
        }

        // Clear timer and submit results
        clearInterval(this.timerInterval);

        // Submit with userAnswers array (in ORIGINAL question order)
        console.log('Submitting exam with answers:', this.userAnswers);
        console.log('Original questions:', this.originalQuestions);

        examService.submitExamResult(this.examId, this.currentUser.id, this.userAnswers);
        window.location.href = `exam-result.html?examId=${this.examId}`;
    }

    autoSubmitExam() {
        alert('Time is up! Your exam will be submitted automatically.');
        clearInterval(this.timerInterval);
        examService.submitExamResult(this.examId, this.currentUser.id, this.userAnswers);
        window.location.href = `exam-result.html?examId=${this.examId}`;
    }
}

// Initialize the exam taking controller
new ExamTakingController();
