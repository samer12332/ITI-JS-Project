export class StudentProfileView {
    constructor() {
        this.profileAvatar = document.getElementById('profileAvatar');
        this.profileName = document.getElementById('profileName');
        this.gradeInfo = document.getElementById('gradeInfo');
        this.mobileInfo = document.getElementById('mobileInfo');
        this.completedCount = document.getElementById('completedCount');
        this.totalExamsCount = document.getElementById('totalExamsCount');
        this.averageScore = document.getElementById('averageScore');
        this.requiredCount = document.getElementById('requiredCount');
        this.completionRate = document.getElementById('completionRate');
        this.requiredExamsContainer = document.getElementById('requiredExamsContainer');
        this.completedExamsContainer = document.getElementById('completedExamsContainer');
        this.themeOptions = document.querySelectorAll('.theme-option');
        this.themeIcon = document.getElementById('themeIcon');
        this.logoutButton = document.getElementById('logoutbtn');
        this.darkModeButton = this.logoutButton.previousElementSibling;
    }
    // render profile info
    renderProfile(profile) {
        if(profile.profilePicture) {
            this.profileAvatar.innerHTML = `<img src="${profile.profilePicture}" alt="Profile Picture">`;
        }
        this.profileName.textContent = profile.username;
        this.gradeInfo.textContent = `Grade ${profile.grade}`;
        this.mobileInfo.textContent = profile.mobile;
        const completedExams = profile.completedExams || [];
        this.completedCount.textContent = `${completedExams.length} Exams Completed`;
        
        const totalExams = completedExams.length;
        const averageScore = totalExams > 0 
            ? Math.round(completedExams.reduce((sum, exam) => sum + exam.score, 0) / totalExams)
            : 0;
        const requiredExams = profile.requiredExams || [];
        const completionRate = (totalExams + requiredExams.length) > 0
            ? Math.round((totalExams / (totalExams + requiredExams.length)) * 100)
            : 0;

        this.totalExamsCount.textContent = totalExams;
        this.averageScore.textContent = averageScore + '%';
        this.requiredCount.textContent = requiredExams.length;
        this.completionRate.textContent = completionRate + '%';
    }
    // render required exams assigned by teacher
    renderRequiredExams(requiredExams, startExamHandler) {
        if (requiredExams.length === 0) {
            this.requiredExamsContainer.innerHTML = `
                <div class="empty-state glass-card" style="grid-column: 1 / -1; padding: 60px 20px;">
                    <div class="empty-icon">📚</div>
                    <h3 style="margin-bottom: 8px; color: var(--text-primary);">No Required Exams</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 16px;">
                        No exams have been assigned to you yet.
                    </p>
                    <p style="color: var(--text-tertiary); font-size: 14px;">
                        Your teacher will assign exams soon!
                    </p>
                </div>
            `;
            return;
        }
        this.requiredExamsContainer.innerHTML = requiredExams.map(exam => `
            <div class="exam-card" data-exam-id="${exam.id}">
                <div class="exam-title">${exam.name}</div>
                <div class="exam-meta">
                    <span>⏱️ ${exam.duration} min</span>
                    <span class="status-required">Required</span>
                </div>
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px;">
                    ${exam.questionCount} Questions
                </div>
                <button class="btn btn-primary start-exam" data-exam-id="${exam.id}">
                    Start Exam
                </button>
            </div>
        `).join('');
        this.requiredExamsContainer.querySelectorAll('.exam-card').forEach(card => {
            card.addEventListener('click', (e) => startExamHandler(e.currentTarget.dataset.examId));
        });
        this.requiredExamsContainer.querySelectorAll('.start-exam').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                startExamHandler(e.currentTarget.dataset.examId);
            });
        });
    }
    // render completed exams with scores
    renderCompletedExams(completedExams, viewResultHandler) {
        if (completedExams.length === 0) {
            this.completedExamsContainer.innerHTML = `
                <div class="empty-state glass-card" style="grid-column: 1 / -1; padding: 60px 20px;">
                    <div class="empty-icon">✨</div>
                    <h3 style="margin-bottom: 8px; color: var(--text-primary);">No Completed Exams</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 16px;">
                        You haven't completed any exams yet.
                    </p>
                    <p style="color: var(--text-tertiary); font-size: 14px;">
                        Start by taking your required exams!
                    </p>
                </div>
            `;
            return;
        }
        this.completedExamsContainer.innerHTML = completedExams.map(exam => {
            const scoreColor = exam.score >= 70 ? '#22c55e' : exam.score >= 50 ? '#f59e0b' : '#ef4444';
            return `
                <div class="exam-card" data-exam-id="${exam.id}">
                    <div class="exam-title">${exam.name}</div>
                    <div class="exam-meta">
                        <span>📅 ${new Date(exam.completedDate).toLocaleDateString()}</span>
                        <span class="status-completed">Completed</span>
                    </div>
                    <div class="exam-score" style="-webkit-text-fill-color: ${scoreColor};">
                        ${exam.score}%
                    </div>
                    <button class="btn btn-secondary view-result" data-exam-id="${exam.id}">
                        View Results
                    </button>
                </div>
            `;
        }).join('');
        this.completedExamsContainer.querySelectorAll('.exam-card').forEach(card => {
            card.addEventListener('click', (e) => viewResultHandler(e.currentTarget.dataset.examId));
        });
        this.completedExamsContainer.querySelectorAll('.view-result').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                viewResultHandler(e.currentTarget.dataset.examId);
            });
        });
    }
    // theme selection
    bindThemeChange(handler) {
        this.themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.themeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                const theme = option.dataset.theme;
                handler(theme);
            });
        });
    }
    
    setActiveTheme(theme) {
        this.themeOptions.forEach(opt => {
            opt.classList.remove('active');
            if (opt.dataset.theme === theme) {
                opt.classList.add('active');
            }
        });
    }
    // dark mode toggle
    bindToggleDarkMode(handler) {
        this.darkModeButton.addEventListener('click', handler);
    }

    setDarkMode(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
        this.themeIcon.textContent = isDark ? '☀️' : '🌙';
    }
    // logout button
    bindLogout(handler) {
        this.logoutButton.addEventListener('click', handler);
    }
}