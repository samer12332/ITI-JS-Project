class DashboardView {
    constructor() {
        this.tabs = document.querySelectorAll('.dashboard-tabs .tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.createExamForm = document.getElementById('createExamForm');
        this.questionsContainer = document.getElementById('questionsContainer');
        this.scoreValidation = document.getElementById('scoreValidation');
        this.currentScore = document.getElementById('currentScore');
        this.examsList = document.getElementById('examsList');
        this.examSelect = document.getElementById('examSelect');
        this.studentsList = document.getElementById('studentsList');
        this.resultsExamSelect = document.getElementById('resultsExamSelect');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.themeIcon = document.getElementById('themeIcon');
        this.editModal = document.getElementById('editModal');
        this.editModalContent = document.getElementById('editModalContent');
        this.addQuestionButton = document.getElementById('addQuestionBtn');

        // buttons
        this.closeModalButton = document.querySelector('#editModal .icon-btn');
        this.logoutButton = document.getElementById('logoutBtn') ||
            document.querySelector('.nav-actions button.btn-secondary:last-child');
        this.darkModeButton = document.getElementById('darkModeToggle');

        if (!this.darkModeButton) {
            const allButtons = document.querySelectorAll('button');
            allButtons.forEach(btn => {
                if (btn.innerHTML.includes('🌙') || btn.innerHTML.includes('☀️')) {
                    this.darkModeButton = btn;
                }
            });
        }

        this.generateQuestionsButton = document.getElementById('generateQuestionsBtn') ||
            document.querySelector('#createTab button[type="button"]');
        this.assignExamButton = document.getElementById('assignExamBtn') ||
            document.querySelector('#assignTab button.btn-primary');

        this.viewExamHandler = null;
        this.editExamHandler = null;
        this.deleteExamHandler = null;

        // Event delegation for dynamic question controls
        this._bindQuestionContainerDelegation();
    }
    // tab switching
    bindSwitchTab(handler) {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (event) => {
                const tabName = event.currentTarget.dataset.tab;
                handler(tabName);
            });
        });
    }

    setActiveTab(tabName) {
        this.tabs.forEach(btn => btn.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));

        const activeTabButton = document.querySelector(`[data-tab="${tabName}"]`);
        const activeTabContent = document.getElementById(tabName + 'Tab');

        if (activeTabButton) activeTabButton.classList.add('active');
        if (activeTabContent) activeTabContent.classList.add('active');
    }

    // create exam question bindings
    bindGenerateQuestions(handler) {
        if (this.generateQuestionsButton) {
            this.generateQuestionsButton.addEventListener('click', () => {
                const countInput = document.getElementById('questionCount');
                if (!countInput) return;

                const count = parseInt(countInput.value);
                if (count && count >= 3) {
                    handler(count);
                } else {
                    alert('Please enter at least 3 questions');
                }
            });
        }
    }
    // add question binding
    bindAddQuestion(handler) {
        if (this.addQuestionButton) {
            this.addQuestionButton.addEventListener('click', handler);
        } else {
            this.questionsContainer?.addEventListener('click', (e) => {
                if (e.target && e.target.matches('.add-question-inline')) handler();
            });
        }
    }
    
    renderQuestions(questions, updateQuestionHandler, updateAnswerHandler, updateImageHandler, deleteHandler) {
        if (!this.questionsContainer) return;

        // Render each question block
        this.questionsContainer.innerHTML = '<div class="form-section"><div class="form-section-title">Questions ❓</div>' +
            questions.map((q, index) => {
                const imagePreviewHtml = q.imagePreview
                    ? `<div class="question-image-preview"><img src="${q.imagePreview}" alt="Preview" /></div>`
                    : (q.image ? `<div class="question-image-path"><small>Image: ${q.image}</small></div>` : '');

                return `
          <div class="question-builder" data-index="${index}">
            <div class="question-header">
              <div class="question-number">Question ${index + 1}</div>
              <button type="button" class="icon-btn delete-question" data-index="${index}" title="Delete">
                🗑️
              </button>
            </div>
            <div class="form-group">
              <label>Question Text</label>
              <input type="text" class="input-field question-text" data-index="${index}" placeholder="Enter your question" 
                value="${this._escapeHtml(q.questionText || '')}">
            </div>
            <div class="form-group">
              <label>Question Image (optional)</label>
              <input type="file" class="input-field question-image" data-index="${index}" accept="image/*">
              ${imagePreviewHtml}
            </div>
            <div class="form-group">
              <label>Answer Options</label>
              <div class="answer-options">
                ${(q.answers || ['', '', '', '']).map((ans, i) => `
                  <div class="answer-option">
                    <input type="radio" name="correct_${index}" value="${i}" 
                      ${q.correctAnswer === i ? 'checked' : ''} class="correct-answer" data-index="${index}">
                    <input type="text" class="input-field answer-text" placeholder="Option ${String.fromCharCode(65 + i)}" 
                      value="${this._escapeHtml(ans || '')}" data-index="${index}" data-ans-index="${i}">
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label>Difficulty</label>
                <select class="input-field difficulty" data-index="${index}">
                  <option value="easy" ${(q.difficulty || 'medium') === 'easy' ? 'selected' : ''}>Easy</option>
                  <option value="medium" ${(q.difficulty || 'medium') === 'medium' ? 'selected' : ''}>Medium</option>
                  <option value="hard" ${(q.difficulty || 'medium') === 'hard' ? 'selected' : ''}>Hard</option>
                </select>
              </div>
              <div class="form-group">
                <label>Points</label>
                <input type="number" class="input-field points" data-index="${index}" value="${q.points || 0}" min="1" max="100">
              </div>
            </div>
          </div>
        `;
            }).join('') + '</div>'
            ;

        // Attach handlers after rendering
        this._attachQuestionHandlers(updateQuestionHandler, updateAnswerHandler, updateImageHandler, deleteHandler);
    }

    // score validation update
    updateScoreValidation(totalScore) {
        if (!this.scoreValidation || !this.currentScore) return;

        this.currentScore.textContent = totalScore;
        this.scoreValidation.style.display = 'block';
        if (totalScore === 100) {
            this.scoreValidation.className = 'score-validation score-valid';
        } else {
            this.scoreValidation.className = 'score-validation score-invalid';
        }
    }

    // create exam form binding
    bindCreateExam(handler) {
        if (this.createExamForm) {
            this.createExamForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const examName = document.getElementById('examName')?.value;
                const duration = parseInt(document.getElementById('examDuration')?.value);

                if (!examName || !duration) {
                    alert('Please fill in all required fields');
                    return;
                }

                handler(examName, duration);
            });
        }
    }

    // render exams list
    renderExamsList(exams, viewHandler, editHandler, deleteHandler) {
        if (!this.examsList) return;

        if (exams.length === 0) {
            this.examsList.innerHTML = `<div class="exam-item"><p>No exams created yet.</p></div>`;
            return;
        }

        this.examsList.innerHTML = exams.map(exam => `
            <div class="exam-item">
                <div class="exam-item-info">
                    <div class="exam-item-title">${this._escapeHtml(exam.name)}</div>
                    <div class="exam-item-meta">
                        <span>⏱️ ${exam.duration} min</span>
                        <span>❓ ${exam.questionCount || 0} questions</span>
                        <span>📅 ${new Date(exam.createdDate).toLocaleDateString()}</span>
                        <span>👥 ${exam.assignedStudents?.length || 0} students</span>
                    </div>
                </div>
                <div class="exam-item-actions">
                    <button class="icon-btn view-exam" data-id="${exam.id}" title="View">👁️</button>
                    <button class="icon-btn edit-exam" data-id="${exam.id}" title="Edit">✏️</button>
                    <button class="icon-btn delete-exam" data-id="${exam.id}" title="Delete"${exam.hasResults ? "disabled" : ""}>🗑️</button>
                </div>
            </div>
        `).join('');

        setTimeout(() => {
            this.examsList.querySelectorAll('.view-exam').forEach(b => {
                b.addEventListener('click', (e) => viewHandler(e.currentTarget.dataset.id));
            });

            this.examsList.querySelectorAll('.edit-exam').forEach(b => {
                b.addEventListener('click', (e) => editHandler(e.currentTarget.dataset.id));
            });

            this.examsList.querySelectorAll('.delete-exam').forEach(b => {
                b.addEventListener('click', (e) => deleteHandler(e.currentTarget.dataset.id));
            });
        }, 0);
    }
    
    renderVersionedExams(groupedExams) {
        if (!this.examsList) return;

        const parentIds = Object.keys(groupedExams);

        if (parentIds.length === 0) {
            this.examsList.innerHTML = `<div class="exam-item"><p>No exams created yet.</p></div>`;
            return;
        }

        this.examsList.innerHTML = parentIds.map(parentId => {
            const versions = groupedExams[parentId];
            const latest = versions[0]; // sorted by version desc

            return `
                <div class="exam-group" data-group="${parentId}">
                    <div class="exam-group-header">
                        <span class="exam-group-toggle-icon">▶</span>
                        <span>${this._escapeHtml(latest.name)}</span>
                        <span class="exam-group-latest">Latest v${latest.version}</span>
                    </div>

                    <div class="exam-group-body" style="display: none;">
                        <ul class="exam-version-list">
                            ${versions.map(exam => `
                                <li class="exam-version-item">
                                    <div class="exam-version-main">
                                        <strong>${this._escapeHtml(exam.name)} — v${exam.version}</strong>
                                        <span class="exam-version-status ${exam.isActive ? 'active' : 'archived'}">
                                            ${exam.isActive ? 'Active' : 'Archived'}
                                        </span>
                                        <small>
                                            ${exam.questionCount} questions • 
                                            ${exam.duration} min • 
                                            ${new Date(exam.createdDate).toLocaleDateString()}
                                        </small>
                                    </div>

                                    <div class="exam-item-actions">
                                        <button class="icon-btn view-exam" data-id="${exam.id}" title="View">👁️</button>
                                        <button class="icon-btn edit-exam" data-id="${exam.id}" title="Edit" ${exam.isActive ? '' : 'disabled'}>✏️</button>
                                        <button class="icon-btn delete-exam" data-id="${exam.id}" title="Delete"${exam.hasResults ? "disabled" : ""}>🗑️</button>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }).join('');

        setTimeout(() => {
            this.examsList.querySelectorAll('.exam-group-header').forEach(header => {
                header.addEventListener('click', () => {
                    const body = header.nextElementSibling;
                    const icon = header.querySelector('.exam-group-toggle-icon');

                    const isOpen = body.style.display === 'block';
                    body.style.display = isOpen ? 'none' : 'block';
                    icon.textContent = isOpen ? '▶' : '▼';
                });
            });

            this.examsList.querySelectorAll('.view-exam').forEach(b => {
                b.addEventListener('click', (e) => this.viewExamHandler?.(e.currentTarget.dataset.id));
            });

            this.examsList.querySelectorAll('.edit-exam').forEach(b => {
                b.addEventListener('click', (e) => this.editExamHandler?.(e.currentTarget.dataset.id));
            });

            this.examsList.querySelectorAll('.delete-exam').forEach(b => {
                b.addEventListener('click', (e) => this.deleteExamHandler?.(e.currentTarget.dataset.id));
            });
        }, 0);
    }

    // assign exam tab
    renderAssignTab(exams, students) {
        if (this.examSelect) {
            this.examSelect.innerHTML =
                '<option value="">Choose an exam...</option>' +
                exams.map(exam =>
                    `<option value="${exam.id}">${this._escapeHtml(exam.name)}</option>`
                ).join('');
        }

        if (this.studentsList) {
            this.studentsList.innerHTML = students.map(student => `
            <label class="student-checkbox ${student.alreadyAssigned ? 'disabled' : ''}">
                <input type="checkbox" value="${student.id}" ${student.alreadyAssigned ? 'disabled' : ''}>
                <span>
                    ${this._escapeHtml(student.username)} (Grade ${this._escapeHtml(String(student.grade))})
                    ${student.alreadyAssigned ? '<strong style="color:#f87171;">— already assigned</strong>' : ''}
                </span>
            </label>
        `).join('');
        }
    }
    // assign exam binding
    bindAssignExam(handler) {
        if (this.assignExamButton) {
            this.assignExamButton.addEventListener('click', () => {
                const examId = this.examSelect?.value;
                const studentIds = Array.from(document.querySelectorAll('#studentsList input:checked')).map(cb => parseInt(cb.value));
                handler(examId, studentIds);
            });
        }
    }

    
    renderResultsTab(exams) {
        if (this.resultsExamSelect) {
            this.resultsExamSelect.innerHTML =
                '<option value="" selected disabled>Select exam to show results...</option>' +
                exams.map(exam => `<option value="${exam.id}">${this._escapeHtml(exam.name)}</option>`).join('');
        }

        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = `
            <p style="text-align:center; opacity:0.7; margin-top:20px;">
                Select an exam to show the results.
            </p>
        `;
        }
    }
    // exam results binding
    bindLoadExamResults(handler) {
        if (this.resultsExamSelect) {
            this.resultsExamSelect.addEventListener('change', (e) => {
                const examId = e.target.value;

                if (!examId) {
                    this.resultsContainer.innerHTML = `
                    <p style="text-align:center; opacity:0.7; margin-top:20px;">
                        Select an exam to show the results.
                    </p>
                `;
                    return;
                }

                handler(examId);
            });
        }
    }

    renderExamResults(results, users, percent, earnedPoints, totalPoints, onReview) {

        // CASE 1: No exam selected
        if (!results) {
            this.resultsContainer.innerHTML = `
                <p style="text-align:center; opacity:0.7; margin-top:20px;">
                    Select an exam to show the results.
                </p>
            `;
            return;
        }

        // CASE 2: No results at all
        if (results.length === 0) {
            this.resultsContainer.innerHTML = `
                <p style="text-align:center; opacity:0.7; margin-top:20px;">
                    There are no answers for this exam from the students yet.
                </p>
            `;
            return;
        }

        // CASE 3: Results exist but no answers
        const hasAnswers = results.some(r => r.totalPoints > 0);

        if (!hasAnswers) {
            this.resultsContainer.innerHTML = `
                <p style="text-align:center; opacity:0.7; margin-top:20px;">
                    There are no answers for this exam from the students yet.
                </p>
            `;
            return;
        }

        // CASE 4: Render results table
        this.resultsContainer.innerHTML = `
            <div class="exam-result">
                <div class="progress-ring">
                    <svg width="120" height="120">
                        <circle class="bg" cx="60" cy="60" r="50"></circle>
                        <circle class="fg" cx="60" cy="60" r="50"></circle>
                    </svg>
                    <div class="percentage-text">${percent}%</div>
                </div>
                <div class="result-text">
                    You have ${earnedPoints} out of ${totalPoints} correct answers.
                </div>
            </div>

            <div class="results-table">
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Score</th>
                            <th>Completed</th>
                            <th>Review</th>
                        </tr>
                    </thead>
                    <tbody id="resultsTableBody">
                        ${results.map(r => {
            const student = users.find(u => u.id === r.studentId);
            return `
                                <tr>
                                    <td>${this._escapeHtml(student?.username || "Unknown")}</td>
                                    <td>${r.earnedPoints}/${r.totalPoints}</td>
                                    <td>${new Date(r.completedDate).toLocaleString()}</td>
                                    <td>
                                        <button class="btn-secondary review-btn" data-id="${r.id}">
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Update progress ring
        const circle = this.resultsContainer.querySelector(".progress-ring .fg");
        if (circle) {
            const offset = 314 - (314 * percent) / 100;
            circle.style.strokeDashoffset = offset;
        }

        // Attach review button handlers
        this.resultsContainer.querySelectorAll(".review-btn").forEach(btn => {
            btn.addEventListener("click", () => onReview(btn.dataset.id));
        });
    }

    // exam list action bindings
    bindViewExam(handler) {
        this.viewExamHandler = handler;
    }

    bindEditExam(handler) {
        this.editExamHandler = handler;
    }

    bindDeleteExam(handler) {
        this.deleteExamHandler = handler;
    }

    bindToggleDarkMode(handler) {
        if (this.darkModeButton) {
            this.darkModeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handler();
            });
        }
    }

    setTheme(isDark) {
        document.body.classList.toggle('dark-mode', isDark);

        if (this.themeIcon) {
            this.themeIcon.textContent = isDark ? '☀️' : '🌙';
        } else {
            this.themeIcon = document.getElementById('themeIcon');
            if (this.themeIcon) {
                this.themeIcon.textContent = isDark ? '☀️' : '🌙';
            }
        }

        localStorage.setItem('darkMode', isDark);
    }

    bindLogout(handler) {
        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', handler);
        }
    }

    bindCloseEditModal(handler) {
        if (this.closeModalButton) {
            this.closeModalButton.addEventListener('click', handler);
        }

        if (this.editModal) {
            this.editModal.addEventListener('click', (e) => {
                if (e.target === this.editModal) {
                    handler();
                }
            });
        }
    }

    openEditModal() {
        if (this.editModal) {
            this.editModal.style.display = 'flex';
        }
    }

    closeEditModal() {
        if (this.editModal) {
            this.editModal.style.display = 'none';
        }
    }

    

    // question container event delegation
    _bindQuestionContainerDelegation() {
        if (!this.questionsContainer) return;

       
        this.questionsContainer.addEventListener('input', (e) => {
            const target = e.target;
            const index = target.dataset?.index;
            if (index === undefined) return;

            
            if (target.classList.contains('question-text')) {
                const handler = this._lastUpdateQuestionHandler;
                handler?.(Number(index), 'questionText', target.value);
            } else if (target.classList.contains('answer-text')) {
                const ansIndex = target.dataset?.ansIndex;
                const handler = this._lastUpdateAnswerHandler;
                handler?.(Number(index), Number(ansIndex), target.value);
            } else if (target.classList.contains('points')) {
                const handler = this._lastUpdateQuestionHandler;
                handler?.(Number(index), 'points', parseInt(target.value) || 0);
            }
        });

        this.questionsContainer.addEventListener('change', (e) => {
            const target = e.target;
            const index = target.dataset?.index;
            if (index === undefined) return;

            if (target.classList.contains('correct-answer')) {
                const handler = this._lastUpdateQuestionHandler;
                handler?.(Number(index), 'correctAnswer', parseInt(target.value));
            } else if (target.classList.contains('difficulty')) {
                const handler = this._lastUpdateQuestionHandler;
                handler?.(Number(index), 'difficulty', target.value);
            } else if (target.classList.contains('question-image')) {
                const handler = this._lastUpdateImageHandler;
                handler?.(Number(index), target);
            }
        });

        this.questionsContainer.addEventListener('click', (e) => {
            const target = e.target;
            if (target.closest('.delete-question')) {
                const btn = target.closest('.delete-question');
                const idx = btn.dataset?.index;
                const handler = this._lastDeleteHandler;
                handler?.(Number(idx));
            }
        });
    }

    _attachQuestionHandlers(updateQuestionHandler, updateAnswerHandler, updateImageHandler, deleteHandler) {
        this._lastUpdateQuestionHandler = updateQuestionHandler;
        this._lastUpdateAnswerHandler = updateAnswerHandler;
        this._lastUpdateImageHandler = updateImageHandler;
        this._lastDeleteHandler = deleteHandler;
    }

    // escape HTML
    _escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

export { DashboardView };