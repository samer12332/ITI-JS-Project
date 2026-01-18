import authService from './AuthService.js';
import { Exam } from '../models/Exam.js';
import { Result } from '../models/Result.js';

class ExamService {
    constructor() {
        if (ExamService.instance) {
            return ExamService.instance;
        }
        ExamService.instance = this;
    }
    // Private Methods
    _safeSetItem(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (err) {
            // QuotaExceededError or other write error
            console.warn(`LocalStorage write failed for ${key}:`, err);

            // Fallback strategy
            try {
                // Example fallback: clean up old/inactive exams if writing exams
                if (key === 'quizverse_exams') {
                    const raw = localStorage.getItem('quizverse_exams');
                    if (raw) {
                        const arr = JSON.parse(raw);
                        const filtered = arr.filter(e => e.isActive !== false);
                        localStorage.setItem('quizverse_exams', JSON.stringify(filtered));
                        // failback write
                        localStorage.setItem(key, value);
                        return true;
                    }
                }
            } catch (innerErr) {
                console.warn('Fallback write also failed:', innerErr);
            }
            return false;
        }
    }

    _saveExams(exams) {
        return this._safeSetItem("quizverse_exams", JSON.stringify(exams));
    }

    _saveResults(results) {
        return this._safeSetItem("quizverse_results", JSON.stringify(results));
    }

    // store questions after image sanitization
    _sanitizeQuestions(questions = []) {
        return questions.map(q => {
            const sanitized = { ...q };

            // store image path instead of full data URI
            if (sanitized.imagePath && typeof sanitized.imagePath === 'string') {
                sanitized.image = sanitized.imagePath;
            }

            // If image contains data URI (base64), drop it and keep only path if present
            if (sanitized.image && typeof sanitized.image === 'string') {
                const isDataUri = sanitized.image.startsWith('data:') || sanitized.image.includes('base64,');
                if (isDataUri) {
                    // Remove heavy base64 content to avoid quota issues
                    delete sanitized.image;
                }
            }

            // Default values
            if (!sanitized.points) sanitized.points = sanitized.points === 0 ? 0 : (sanitized.points || 10);
            if (!sanitized.answers) sanitized.answers = sanitized.answers || [];
            if (!sanitized.correctAnswer && sanitized.correctAnswer !== 0) sanitized.correctAnswer = sanitized.correctAnswer || 0;

            return sanitized;
        });
    }

    // Public Methods
    getAllExams() {
        const exams = localStorage.getItem("quizverse_exams");
        return exams
            ? JSON.parse(exams).map(e => new Exam(
                e.id,
                e.name,
                e.duration,
                e.questionCount,
                e.questions,
                e.createdBy,
                e.createdDate,
                e.assignedStudents || [],
                e.version || 1,
                e.parentId || e.id,
                typeof e.isActive === 'boolean' ? e.isActive : true
            ))
            : [];
    }

    getExamById(examId) {
        const exams = this.getAllExams();
        return exams.find((exam) => exam.id === Number.parseInt(examId));
    }

    createExam(examData) {
        const exams = this.getAllExams();
        const newId = exams.length > 0 ? Math.max(...exams.map(e => e.id)) + 1 : 1;

        //  keep image paths only
        const sanitizedQuestions = this._sanitizeQuestions(examData.questions || []);

        const newExam = new Exam(
            newId,
            examData.name,
            examData.duration,
            sanitizedQuestions.length,
            sanitizedQuestions,
            examData.createdBy,
            new Date().toISOString(),
            [],
            1,      // version
            newId,  // parentId
            true    // isActive
        );

        exams.push(newExam);
        this._saveExams(exams);
        return newExam;
    }

    updateExam(examId, updates) {
        const exams = this.getAllExams();
        const examIndex = exams.findIndex((exam) => exam.id === Number.parseInt(examId));

        if (examIndex !== -1) {
            const merged = { ...exams[examIndex], ...updates };


            if (updates.questions) {
                merged.questions = this._sanitizeQuestions(updates.questions);
                merged.questionCount = merged.questions.length;
            }

            exams[examIndex] = merged;
            this._saveExams(exams);
            return true;
        }
        return false;
    }

    createNewVersion(oldExam, updatedData) {
        const exams = this.getAllExams();

        // Mark old exam as archived
        const oldExamIndex = exams.findIndex(e => e.id === oldExam.id);
        if (oldExamIndex !== -1) {
            exams[oldExamIndex].isActive = false;
        }

        const newId = exams.length > 0 ? Math.max(...exams.map(e => e.id)) + 1 : 1;

        const sanitizedQuestions = this._sanitizeQuestions(updatedData.questions || []);

        const newExam = new Exam(
            newId,
            updatedData.name,
            updatedData.duration,
            sanitizedQuestions.length,
            sanitizedQuestions,
            oldExam.createdBy,
            new Date().toISOString(),
            oldExam.assignedStudents || [],
            (oldExam.version || 1) + 1,
            oldExam.parentId || oldExam.id,
            true
        );

        exams.push(newExam);
        this._saveExams(exams);

        return newExam;
    }

    deleteExam(examId) {
        const examIdNum = Number.parseInt(examId);

        // 1. Check if any student has answered this exam version
        const results = this.getAllResults();
        const hasResults = results.some(r => r.examId === examIdNum);
        if (hasResults) {
            return { success: false, reason: "HAS_RESULTS" };
        }

        // 2. Remove exam from exams list
        const exams = this.getAllExams();
        const filteredExams = exams.filter(exam => exam.id !== examIdNum);
        this._saveExams(filteredExams);

        // 3. Clean requiredExams and inProgressExams in service
        this.requiredExams = (this.requiredExams || []).filter(exam => exam.id !== examIdNum);
        this.inProgressExams = (this.inProgressExams || []).filter(exam => exam.id !== examIdNum);
        console.log(this.requiredExams);
        console.log(this.inProgressExams);

        // 4. Clean student and teacher profiles in localStorage
        const users = JSON.parse(localStorage.getItem("quizverse_users")) || [];
        users.forEach(u => {
            if (u.role === "student") {
                u.requiredExams = (u.requiredExams || []).filter(id => id !== examIdNum);
                u.completedExams = (u.completedExams || []).filter(id => id !== examIdNum);
            } else if (u.role === "teacher") {
                u.examsCreated = (u.examsCreated || []).filter(id => id !== examIdNum);
            }
        });
        localStorage.setItem("quizverse_users", JSON.stringify(users));

        return { success: true };
    }

    // Assining Exams to Students
    assignExamToStudents(examId, studentIds) {
        const exam = this.getExamById(examId);
        if (!exam) return false;

        const users = authService._getAll();
        const blockedStudents = [];

        studentIds.forEach(id => {
            const student = users.find(u => u.id === id && u.role === "student");
            if (!student) return;

            if (!student.requiredExams) student.requiredExams = [];
            if (!student.completedExams) student.completedExams = [];
            if (!student.inProgressExams) student.inProgressExams = [];

            const alreadyAssigned = student.requiredExams.some(e => e.id === exam.id);
            const alreadyCompleted = student.completedExams.some(e => e.id === exam.id);
            const inProgress = student.inProgressExams.some(e => e.id === exam.id);

            if (alreadyAssigned || alreadyCompleted || inProgress) {
                blockedStudents.push(student.username);
            }
        });

        if (blockedStudents.length > 0) {
            alert(`Cannot assign exam.\nThese students already solved or are still working on it:\n- ${blockedStudents.join("\n- ")}`);
            return false;
        }

        this.updateExam(examId, {
            assignedStudents: [...new Set([...(exam.assignedStudents || []), ...studentIds])]
        });

        users.forEach(user => {
            if (user.role === "student" && studentIds.includes(user.id)) {
                if (!user.requiredExams) user.requiredExams = [];
                user.requiredExams.push({
                    id: exam.id,
                    name: exam.name,
                    duration: exam.duration,
                    questionCount: exam.questionCount || exam.questions?.length || 0,
                });
            }
        });

        authService._saveAll(users);
        return true;
    }

    // Exam Results
    submitExamResult(examId, studentId, answers) {
        const exam = this.getExamById(examId);
        const results = this.getAllResults();

        let totalPoints = 0;
        let earnedPoints = 0;

        (exam.questions || []).forEach((question, idx) => {
            const questionPoints = parseInt(question.points) || 10;
            totalPoints += questionPoints;

            if (answers[idx] !== undefined && answers[idx] !== null) {
                const studentAnswer = parseInt(answers[idx]);
                const correctAnswer = parseInt(question.correctAnswer);
                if (studentAnswer === correctAnswer) {
                    earnedPoints += questionPoints;
                }
            }
        });

        const actualScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

        const result = new Result(
            results.length > 0 ? Math.max(...results.map(r => r.id)) + 1 : 1,
            Number.parseInt(examId),
            Number.parseInt(studentId),
            (answers || []).map((answer, idx) => {
                const question = (exam.questions || [])[idx] || {};
                const studentAnswer = parseInt(answer);
                const correctAnswer = parseInt(question.correctAnswer);
                const isCorrect = studentAnswer === correctAnswer;

                return {
                    selectedOriginalIndex: answer,
                    selectedText: answer !== undefined && answer !== null
                        ? (question.answers && question.answers[answer]) || "Unknown"
                        : "Not answered",
                    isCorrect,
                    points: parseInt(question.points) || 10
                };
            }),
            actualScore,
            totalPoints,
            earnedPoints,
            new Date().toISOString()
        );

        results.push(result);
        this._saveResults(results);

        const users = authService._getAll();
        const userIndex = users.findIndex(u => u.id === Number.parseInt(studentId));
        if (userIndex !== -1) {
            if (!users[userIndex].completedExams) users[userIndex].completedExams = [];
            users[userIndex].completedExams.push({
                id: Number.parseInt(examId),
                name: exam.name,
                score: actualScore,
                earnedPoints,
                totalPoints,
                completedDate: result.completedDate,
            });
            users[userIndex].requiredExams = (users[userIndex].requiredExams || []).filter(e => e.id !== Number.parseInt(examId));
            authService._saveAll(users);
        }
        return result;
    }
    getAllResults() {
        const results = localStorage.getItem("quizverse_results");
        return results
            ? JSON.parse(results).map(r => new Result(
                r.id,
                r.examId,
                r.studentId,
                r.answers,
                r.score,
                r.totalPoints,
                r.earnedPoints,
                r.completedDate
            ))
            : [];
    }

    getExamResult(examId, studentId) {
        const results = this.getAllResults();
        return results.find((r) => r.examId === Number.parseInt(examId) && r.studentId === Number.parseInt(studentId));
    }

    getStudentResults(studentId) {
        const results = this.getAllResults();
        return results.filter((r) => r.studentId === Number.parseInt(studentId));
    }

    getExamResults(examId) {
        const results = this.getAllResults();
        return results.filter((r) => r.examId === Number.parseInt(examId));
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    validateExamScore(questions) {
        const totalScore = (questions || []).reduce((sum, q) => sum + Number.parseInt(q.points || 0), 0);
        return totalScore === 100;
    }

    getAllStudents() {
        return authService.getAllStudents();
    }
}
const examService = new ExamService();
export default examService;