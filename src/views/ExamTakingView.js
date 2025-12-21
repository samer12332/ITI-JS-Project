export class ExamTakingView {
    constructor() {
        this.examTitle = document.getElementById('examTitle');
        this.totalQuestions = document.getElementById('totalQuestions');
        this.examDuration = document.getElementById('examDuration');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerBarFill = document.getElementById('timerBarFill');
        this.questionNumber = document.getElementById('questionNumber');
        this.difficultyBadge = document.getElementById('difficultyBadge');
        this.pointsBadge = document.getElementById('pointsBadge');
        this.questionText = document.getElementById('questionText');
        this.questionImageContainer = document.getElementById('questionImageContainer');
        this.answersContainer = document.getElementById('answersContainer');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressDots = document.getElementById('progressDots');
        this.correctSound = document.getElementById('correctSound');
        this.incorrectSound = document.getElementById('incorrectSound');
    }
    // Render Methods
    renderExamDetails(exam) {
        this.examTitle.textContent = exam.name;
        this.totalQuestions.textContent = `${exam.questionCount} Questions`;
        this.examDuration.textContent = `${exam.duration} Minutes`;
    }

    renderQuestion(question, currentIndex, totalQuestions, userAnswer, selectAnswerHandler) {
        this.questionNumber.textContent = `Question ${currentIndex + 1} of ${totalQuestions}`;
        this.questionText.textContent = question.questionText;
        this.difficultyBadge.textContent = question.difficulty || 'medium';
        this.difficultyBadge.className = `question-badge difficulty-${question.difficulty || 'medium'}`;
        this.pointsBadge.textContent = `${question.points || 10} pts`;

        if (question.image) {
            this.questionImageContainer.innerHTML = `<img src="${question.image}" alt="Question image" class="question-image">`;
        } else {
            this.questionImageContainer.innerHTML = '';
        }

        this.answersContainer.innerHTML = question.answers.map((answer, idx) => {
            let buttonClass = '';
            if (userAnswer !== undefined) {
                // Check if this answer was selected by the user
                const isSelected = userAnswer === answer.originalIndex;
                
                // Determine if the answer is correct or incorrect
                if (answer.isCorrect) {
                    buttonClass = 'correct';
                } else if (isSelected) {
                    buttonClass = 'incorrect';
                }
            }
            // Return the answer button HTML
            return `
                <button class="answer-button ${buttonClass}" 
                        data-answer-index="${idx}" 
                        ${userAnswer !== undefined ? 'disabled' : ''}>
                    <div class="answer-letter">${['A', 'B', 'C', 'D'][idx]}</div>
                    <div>${answer.text}</div>
                </button>
            `;
        }).join('');
        // Attach event listeners to answer buttons
        document.querySelectorAll('.answer-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                selectAnswerHandler(parseInt(e.currentTarget.dataset.answerIndex));
            });
        });

    }
    // navigation button
    updateNavigation(currentIndex, totalQuestions, isAnswered, nextHandler, submitHandler) {
        if (currentIndex === totalQuestions - 1) {
            this.nextBtn.textContent = 'Submit Exam';
            this.nextBtn.onclick = submitHandler;
        } else {
            this.nextBtn.textContent = 'Next Question →';
            this.nextBtn.onclick = nextHandler;
        }
        this.nextBtn.disabled = !isAnswered;
    }
    // progress dots
    renderProgressDots(totalQuestions, currentIndex, userAnswers, jumpToQuestionHandler) {
        this.progressDots.innerHTML = Array.from({ length: totalQuestions }).map((_, idx) =>
            `<div class="progress-dot ${idx === currentIndex ? 'current' : ''} ${userAnswers[idx] !== undefined ? 'answered' : ''}" 
                data-question-index="${idx}"></div>`
        ).join('');
        document.querySelectorAll('.progress-dot').forEach(dot => dot.addEventListener('click', (e) => jumpToQuestionHandler(parseInt(e.currentTarget.dataset.questionIndex))));
    }
    // exam timer    
    updateTimer(timeRemaining, totalTime) {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        this.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        const percentage = (timeRemaining / totalTime) * 100;
        this.timerBarFill.style.width = percentage + '%';
        if (timeRemaining < 60) {
            this.timerDisplay.style.background = 'linear-gradient(135deg, #ef4444, #ef4444)';
            this.timerDisplay.style.webkitBackgroundClip = 'text';
            this.timerDisplay.style.webkitTextFillColor = 'transparent';
        }
    }
    // sound effects
    playSound(type) {
        const sound = type === 'correct' ? this.correctSound : this.incorrectSound;
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(err => console.log("Audio failed:", err));
        }
    }
}
